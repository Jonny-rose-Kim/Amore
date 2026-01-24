"""
Gemini API를 사용한 LangChain + LangGraph Multi-Agent 워크플로우
실제 DB 데이터를 활용하여 트렌드 분석 수행

Pipeline:
  Agent 1: 키워드 추출 (제품 설명 → 성분/제형/효과/Mood)
  Agent 2: 효과 매핑 (키워드 + 리뷰 → 효과 연결)
  Agent 3: 조합 분석 (성분+제형+효과 조합 점수)
  Agent 4: 트렌드 집계 (실제 DB 신호 기반 점수)
  Agent 5: SNS 플랫폼 분석 (플랫폼별 키워드 인기도)
"""

from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from typing import TypedDict, List, Dict, Any
from pymongo import MongoClient
from datetime import datetime, timedelta
import json
import os
import re
import sys
from dotenv import load_dotenv

load_dotenv()

# MongoDB 연결
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
mongodb_db = os.getenv("MONGODB_DATABASE", "amore")
client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
db = client[mongodb_db]

# Gemini API 키
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# LLM 초기화
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.1,
    google_api_key=GEMINI_API_KEY
)

llm_advanced = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.2,
    google_api_key=GEMINI_API_KEY
)


# State 정의
class WorkflowState(TypedDict):
    country: str
    category: str
    weeks: int
    date_range: Dict[str, Any]  # {start, end, week_boundaries}
    product_descriptions: List[Dict[str, Any]]
    extracted_keywords: Dict[str, Dict[str, List[str]]]
    mapped_effects: Dict[str, Dict[str, List[str]]]
    combinations: List[Dict[str, Any]]
    trends: List[Dict[str, Any]]
    sns_stats: Dict[str, List[Dict[str, Any]]]


def get_date_range(country: str, category: str, weeks: int) -> Dict[str, Any]:
    """DB에서 실제 데이터의 날짜 범위를 가져와서 가상 8주로 매핑"""
    pipeline = [
        {"$match": {"country": country, "category": category}},
        {"$group": {
            "_id": None,
            "min_date": {"$min": "$date"},
            "max_date": {"$max": "$date"}
        }}
    ]
    result = list(db.raw_retail_sales.aggregate(pipeline))

    if result:
        min_date = result[0]["min_date"]
        max_date = result[0]["max_date"]
    else:
        # 데이터가 없으면 현재 기준 8주
        max_date = datetime.now()
        min_date = max_date - timedelta(weeks=weeks)

    # 전체 기간을 weeks 등분
    total_days = (max_date - min_date).days or 1
    week_length = total_days / weeks

    week_boundaries = []
    for i in range(weeks + 1):
        boundary = min_date + timedelta(days=i * week_length)
        week_boundaries.append(boundary)

    return {
        "start": min_date,
        "end": max_date,
        "week_boundaries": week_boundaries,
        "week_length_days": week_length
    }


# === Rule-based keyword extraction (LLM 폴백) ===
KNOWN_INGREDIENTS = [
    "hyaluronic acid", "niacinamide", "retinol", "vitamin c", "salicylic acid",
    "ceramides", "ceramide", "peptides", "peptide", "snail mucin", "snail secretion",
    "centella asiatica", "centella", "madecassoside", "propolis", "squalane",
    "glycolic acid", "lactic acid", "aha", "bha", "green tea", "vitamin b5",
    "panthenol", "zinc", "algae", "ferment", "probiotics", "amino acids",
    "licorice", "watermelon", "moringa", "peony", "frankincense",
    "glycerin", "collagen", "vitamin e", "tea tree", "aloe vera",
    "argan oil", "jojoba", "shea butter", "rosehip", "bakuchiol",
    "azelaic acid", "benzoyl peroxide", "alpha arbutin", "tranexamic acid",
    "saccharomyces", "bifida", "heartleaf", "houttuynia", "mugwort",
    "rice", "purple rice", "okinawa algae", "meadowfoam seed",
    "glycoprotein", "chickpea", "pumpkin ferment", "tasmanian pepperberry",
    "citric acid", "tartaric acid", "lemongrass"
]

KNOWN_FORMULAS = [
    "serum", "cream", "gel", "toner", "ampoule", "essence", "balm", "mask",
    "lotion", "emulsion", "cleanser", "exfoliant", "moisturizer", "sunscreen",
    "oil", "mist", "pad", "sheet mask", "sleeping mask", "treatment",
    "peeling", "foam", "water gel"
]

KNOWN_EFFECTS = [
    "hydrating", "hydration", "anti-aging", "brightening", "pore minimizing",
    "soothing", "calming", "exfoliating", "exfoliation", "firming",
    "barrier repair", "skin barrier", "moisturizing", "oil control",
    "acne", "blemish", "wrinkle", "fine lines", "dark spot",
    "radiance", "glow", "plumping", "antioxidant", "anti-inflammatory",
    "whitening", "smoothing", "resurfacing", "healing", "repair",
    "clarifying", "purifying", "nourishing", "rejuvenating",
    "pore", "redness", "sensitivity", "irritation", "hyperpigmentation"
]

KNOWN_MOODS = [
    "glass skin", "dewy", "luxury", "luxurious", "clean beauty", "minimalist",
    "k-beauty", "korean", "lightweight", "natural", "organic", "vegan",
    "gentle", "professional", "dermatologist", "clinical", "premium",
    "glow", "radiant", "bouncy", "velvet", "matte", "glossy", "silky"
]


def extract_keywords_rule_based(description: str, product_name: str = "") -> dict:
    """규칙 기반 키워드 추출 (LLM 폴백용)"""
    text = f"{product_name} {description}".lower()

    ingredients = [kw for kw in KNOWN_INGREDIENTS if kw in text]
    formulas = [kw for kw in KNOWN_FORMULAS if kw in text]
    effects = [kw for kw in KNOWN_EFFECTS if kw in text]
    moods = [kw for kw in KNOWN_MOODS if kw in text]

    # Deduplicate similar keywords
    ingredients = list(dict.fromkeys(ingredients))[:8]
    formulas = list(dict.fromkeys(formulas))[:4]
    effects = list(dict.fromkeys(effects))[:6]
    moods = list(dict.fromkeys(moods))[:4]

    return {
        "ingredients": ingredients,
        "formulas": formulas,
        "effects": effects,
        "mood": moods
    }


def parse_llm_json(content: str) -> dict:
    """LLM 응답에서 JSON을 안전하게 파싱"""
    # Remove markdown code blocks
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()

    # Try direct parse
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Try to find JSON object in text
    match = re.search(r'\{[\s\S]*\}', content)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return {}


# ============================================================
# Agent 1: 키워드 추출
# ============================================================
def extract_keywords_node(state: WorkflowState) -> WorkflowState:
    """제품 설명에서 성분, 제형, 효과, Mood 키워드 추출"""
    print("🔍 Agent 1: 키워드 추출 시작...")

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert cosmetics analyst. Extract keywords from the product description.
Classify into exactly 4 categories:
- ingredients: active cosmetic ingredients (e.g., retinol, hyaluronic acid, niacinamide, ceramides, snail mucin, centella asiatica, vitamin C, salicylic acid, peptides, squalane)
- formulas: product form/texture type (e.g., serum, cream, gel, toner, ampoule, essence, balm, mask, lotion, cleanser)
- effects: skin benefits (e.g., hydrating, anti-aging, brightening, pore minimizing, soothing, exfoliating, firming, barrier repair)
- mood: visual/sensory/lifestyle elements (e.g., glass skin, dewy, luxury, clean beauty, minimalist, K-beauty, lightweight)

Return ONLY valid JSON:
{{"ingredients": [...], "formulas": [...], "effects": [...], "mood": [...]}}"""),
        ("user", "Product: {product_name}\nBrand: {brand}\nDescription: {description}")
    ])

    extracted_keywords = {}
    products = state["product_descriptions"]
    use_llm = True  # Will be set to False if LLM fails

    # Test LLM availability with first product
    if products and products[0].get("description"):
        try:
            chain = prompt | llm
            response = chain.invoke({
                "product_name": products[0].get("productName", ""),
                "brand": products[0].get("brand", ""),
                "description": products[0]["description"][:200]
            })
            parse_llm_json(response.content)
            print("  ✅ LLM 사용 가능 - Gemini API 모드")
        except Exception as e:
            use_llm = False
            print(f"  ⚠️ LLM 불가 ({str(e)[:60]}...) - 규칙 기반 모드로 전환")

    for product in products:
        product_id = product["productId"]
        description = product.get("description", "")

        if not description:
            extracted_keywords[product_id] = {
                "ingredients": [], "formulas": [], "effects": [], "mood": []
            }
            continue

        if use_llm:
            try:
                chain = prompt | llm
                response = chain.invoke({
                    "product_name": product.get("productName", ""),
                    "brand": product.get("brand", ""),
                    "description": description
                })

                keywords = parse_llm_json(response.content)
                extracted_keywords[product_id] = {
                    "ingredients": keywords.get("ingredients", []),
                    "formulas": keywords.get("formulas", []),
                    "effects": keywords.get("effects", []),
                    "mood": keywords.get("mood", [])
                }

                total = sum(len(v) for v in extracted_keywords[product_id].values())
                print(f"  ✓ {product_id} ({product.get('productName', '')[:25]}): {total} keywords [LLM]")

            except Exception as e:
                use_llm = False
                print(f"  ⚠️ LLM 전환 → 규칙 기반 모드")
                keywords = extract_keywords_rule_based(description, product.get("productName", ""))
                extracted_keywords[product_id] = keywords
                total = sum(len(v) for v in keywords.values())
                print(f"  ⚡ {product_id} ({product.get('productName', '')[:25]}): {total} keywords [Rule-based]")
        else:
            keywords = extract_keywords_rule_based(description, product.get("productName", ""))
            extracted_keywords[product_id] = keywords
            total = sum(len(v) for v in keywords.values())
            print(f"  ⚡ {product_id} ({product.get('productName', '')[:25]}): {total} keywords [Rule-based]")

    state["extracted_keywords"] = extracted_keywords
    total_keywords = sum(sum(len(v) for v in kw.values()) for kw in extracted_keywords.values())
    print(f"✅ Agent 1 완료: {len(extracted_keywords)}개 제품, {total_keywords}개 키워드 추출")
    return state


# ============================================================
# Agent 2: 효과 매핑
# ============================================================
def map_effects_node(state: WorkflowState) -> WorkflowState:
    """키워드별 효과를 리뷰 데이터 기반으로 매핑"""
    print("🔍 Agent 2: 효과 매핑 시작...")

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a cosmetics effects analyst. Based on the product keywords and customer reviews, map each keyword to its observed effects/benefits.

Return ONLY valid JSON mapping keywords to effects arrays:
{{"keyword1": ["effect1", "effect2"], "keyword2": ["effect3"]}}

Only include keywords that have clear effect evidence in the reviews."""),
        ("user", "Keywords: {keywords}\n\nCustomer Reviews:\n{reviews}")
    ])

    mapped_effects = {}
    use_llm = True

    # Quick LLM availability check
    first_product = next((pid for pid, kw in state["extracted_keywords"].items()
                         if any(kw.values())), None)
    if first_product:
        try:
            test_kws = []
            for v in state["extracted_keywords"][first_product].values():
                test_kws.extend(v)
            chain = prompt | llm
            chain.invoke({"keywords": ", ".join(test_kws[:3]), "reviews": "Test review"})
        except Exception:
            use_llm = False
            print("  ⚠️ LLM 불가 - 규칙 기반 효과 매핑 모드")

    for product_id, keywords_dict in state["extracted_keywords"].items():
        all_keywords = []
        for cat_keywords in keywords_dict.values():
            all_keywords.extend(cat_keywords)

        if not all_keywords:
            mapped_effects[product_id] = {}
            continue

        try:
            # 해당 제품의 리뷰 조회
            reviews = list(db.raw_reviews.find(
                {"productId": product_id}
            ).limit(10))

            review_texts = "\n".join([
                f"[Rating: {r.get('rating', '?')}] {r.get('content', '')}"
                for r in reviews
            ])[:2000]

            if use_llm:
                try:
                    chain = prompt | llm
                    response = chain.invoke({
                        "keywords": ", ".join(all_keywords[:15]),
                        "reviews": review_texts
                    })
                    effects_map = parse_llm_json(response.content)
                    mapped_effects[product_id] = effects_map
                    print(f"  ✓ {product_id}: {len(effects_map)} keywords mapped [LLM]")
                except Exception:
                    use_llm = False
                    # Fall through to rule-based
                    effects_map = {}
                    combined_text = (review_texts or "").lower()
                    for kw in all_keywords[:10]:
                        matched_effects = [eff for eff in KNOWN_EFFECTS if eff in combined_text]
                        if matched_effects:
                            effects_map[kw] = matched_effects[:3]
                    mapped_effects[product_id] = effects_map
                    print(f"  ⚡ {product_id}: {len(effects_map)} keywords mapped [Rule-based]")
            else:
                # 규칙 기반 효과 매핑
                effects_map = {}
                combined_text = (review_texts or "").lower()
                for kw in all_keywords[:10]:
                    matched_effects = [eff for eff in KNOWN_EFFECTS if eff in combined_text]
                    if matched_effects:
                        effects_map[kw] = matched_effects[:3]
                mapped_effects[product_id] = effects_map

        except Exception as e:
            print(f"  ✗ {product_id} 오류: {e}")
            mapped_effects[product_id] = {}

    if not use_llm:
        print(f"  (규칙 기반 모드로 {len(mapped_effects)}개 제품 처리 완료)")

    state["mapped_effects"] = mapped_effects
    print(f"✅ Agent 2 완료: {len(mapped_effects)}개 제품 효과 매핑")
    return state


# ============================================================
# Agent 3: 조합 분석
# ============================================================
def analyze_combinations_node(state: WorkflowState) -> WorkflowState:
    """성분+제형+효과 조합의 시너지 분석"""
    print("🔍 Agent 3: 조합 분석 시작...")

    combination_map = {}

    for product in state["product_descriptions"]:
        product_id = product["productId"]
        keywords = state["extracted_keywords"].get(product_id, {})

        ingredients = keywords.get("ingredients", [])
        formulas = keywords.get("formulas", [])
        effects = keywords.get("effects", [])

        if not (ingredients and formulas and effects):
            continue

        # Top keyword per category for combination key
        top_ingredient = ingredients[0]
        top_formula = formulas[0]
        top_effect = effects[0]
        combination_key = f"{top_ingredient} + {top_formula} + {top_effect}"

        if combination_key not in combination_map:
            combination_map[combination_key] = {
                "combination": combination_key,
                "ingredients": [],
                "formulas": [],
                "effects": [],
                "products": [],
                "ranks": [],
                "sales": []
            }

        combo = combination_map[combination_key]
        combo["ingredients"].extend(ingredients)
        combo["formulas"].extend(formulas)
        combo["effects"].extend(effects)
        combo["products"].append(product)
        if product.get("salesRank"):
            combo["ranks"].append(product["salesRank"])
        if product.get("salesVolume"):
            combo["sales"].append(product["salesVolume"])

    # 조합별 통계 계산
    combinations = []
    for combo_key, combo_data in combination_map.items():
        ranks = combo_data["ranks"]
        sales = combo_data["sales"]
        avg_rank = sum(ranks) / len(ranks) if ranks else 500
        total_sales = sum(sales)
        product_count = len(combo_data["products"])

        # Synergy score based on real data
        rank_score = max(0, 1 - (avg_rank - 1) / 100)  # Closer to rank 1 = better
        volume_score = min(1, total_sales / 50000)  # 50K sales = perfect
        diversity_score = min(1, product_count / 5)  # 5+ products = perfect

        synergy_score = rank_score * 0.5 + volume_score * 0.3 + diversity_score * 0.2

        combinations.append({
            "combination": combo_key,
            "ingredients": list(set(combo_data["ingredients"]))[:5],
            "formulas": list(set(combo_data["formulas"]))[:3],
            "effects": list(set(combo_data["effects"]))[:5],
            "avgRank": round(avg_rank, 1),
            "productCount": product_count,
            "totalSales": total_sales,
            "synergyScore": round(synergy_score, 3)
        })

    combinations.sort(key=lambda x: x["synergyScore"], reverse=True)
    state["combinations"] = combinations
    print(f"✅ Agent 3 완료: {len(combinations)}개 조합 분석")
    return state


# ============================================================
# Agent 4: 트렌드 집계 (실제 DB 신호 기반)
# ============================================================
def aggregate_trends_node(state: WorkflowState) -> WorkflowState:
    """실제 DB 데이터로 트렌드 신호 계산 및 분류"""
    print("🔍 Agent 4: 트렌드 집계 시작...")

    date_range = state["date_range"]
    week_boundaries = date_range["week_boundaries"]
    weeks = state["weeks"]
    country = state["country"]

    trends = []

    for combo in state["combinations"]:
        # === 실제 DB 신호 계산 ===
        keywords_to_search = combo["ingredients"] + combo["effects"]

        # 1. SNS Signal: 키워드가 SNS에서 얼마나 언급되는지
        sns_total = 0
        sns_recent = 0
        sns_old = 0
        mid_point = week_boundaries[weeks // 2] if len(week_boundaries) > weeks // 2 else date_range["start"]

        for keyword in keywords_to_search[:3]:  # Top 3 keywords
            try:
                # 전체 기간 SNS 언급
                total_count = db.raw_sns_posts.count_documents({
                    "country": country,
                    "postedAt": {"$gte": date_range["start"], "$lte": date_range["end"]},
                    "$or": [
                        {"content": {"$regex": keyword, "$options": "i"}},
                        {"hashtags": {"$regex": keyword, "$options": "i"}}
                    ]
                })
                sns_total += total_count

                # 후반부 (최근 4주)
                recent_count = db.raw_sns_posts.count_documents({
                    "country": country,
                    "postedAt": {"$gte": mid_point, "$lte": date_range["end"]},
                    "$or": [
                        {"content": {"$regex": keyword, "$options": "i"}},
                        {"hashtags": {"$regex": keyword, "$options": "i"}}
                    ]
                })
                sns_recent += recent_count
                sns_old += (total_count - recent_count)
            except Exception:
                pass

        # SNS 성장률 기반 점수
        sns_growth = ((sns_recent - sns_old) / max(sns_old, 1)) * 100 if sns_old > 0 else (50 if sns_recent > 0 else 0)
        sns_signal = min(100, max(0, 50 + sns_growth))

        # 2. Retail Signal: 판매 랭킹 변화
        product_ids = [p["productId"] for p in combo.get("products", []) if isinstance(p, dict)]
        if not product_ids:
            product_ids = [p["productId"] for p in state["product_descriptions"]
                          if any(ing in state["extracted_keywords"].get(p["productId"], {}).get("ingredients", [])
                                for ing in combo["ingredients"][:1])]

        retail_signal = 70  # Default
        if product_ids:
            try:
                # 최근 vs 이전 랭킹 비교
                old_ranks = list(db.raw_retail_sales.find({
                    "productId": {"$in": product_ids[:5]},
                    "date": {"$gte": date_range["start"], "$lt": mid_point}
                }, {"salesRank": 1}))

                recent_ranks = list(db.raw_retail_sales.find({
                    "productId": {"$in": product_ids[:5]},
                    "date": {"$gte": mid_point, "$lte": date_range["end"]}
                }, {"salesRank": 1}))

                avg_old_rank = sum(r.get("salesRank", 50) for r in old_ranks) / max(len(old_ranks), 1)
                avg_recent_rank = sum(r.get("salesRank", 50) for r in recent_ranks) / max(len(recent_ranks), 1)

                # 랭킹이 낮아지면(숫자 감소) 좋은 신호
                rank_improvement = (avg_old_rank - avg_recent_rank) / max(avg_old_rank, 1) * 100
                retail_signal = min(100, max(0, 50 + rank_improvement * 2))
            except Exception:
                pass

        # 3. Review Signal: 리뷰 감성 및 양
        review_signal = 65  # Default
        if product_ids:
            try:
                reviews = list(db.raw_reviews.find({
                    "productId": {"$in": product_ids[:5]},
                    "postedAt": {"$gte": date_range["start"], "$lte": date_range["end"]}
                }, {"rating": 1, "sentiment": 1}))

                if reviews:
                    avg_rating = sum(r.get("rating", 3) for r in reviews) / len(reviews)
                    positive_ratio = sum(1 for r in reviews if r.get("sentiment") == "positive") / len(reviews)
                    review_count_score = min(1, len(reviews) / 20)  # 20+ reviews = max

                    review_signal = min(100, (avg_rating / 5 * 40) + (positive_ratio * 40) + (review_count_score * 20))
            except Exception:
                pass

        signals = {
            "SNS": round(sns_signal, 1),
            "Retail": round(retail_signal, 1),
            "Review": round(review_signal, 1)
        }

        # === 종합 트렌드 점수 ===
        rank_score = max(0, 100 - (combo["avgRank"] - 1) * 1.5)
        signal_avg = (signals["SNS"] + signals["Retail"] + signals["Review"]) / 3
        synergy = combo.get("synergyScore", 0.5) * 100

        score = rank_score * 0.3 + signal_avg * 0.4 + synergy * 0.3

        # === 트렌드 카테고리 분류 ===
        if score >= 75 and signals["SNS"] >= 60 and signals["Retail"] >= 60:
            category = "Actionable"
        elif score >= 55 and (signals["SNS"] >= 50 or signals["Retail"] >= 50):
            category = "Growing"
        else:
            category = "Early"

        trends.append({
            "combination": combo["combination"],
            "ingredients": combo["ingredients"],
            "formulas": combo["formulas"],
            "effects": combo["effects"],
            "avgRank": combo["avgRank"],
            "productCount": combo["productCount"],
            "totalSales": combo.get("totalSales", 0),
            "score": round(score, 2),
            "category": category,
            "signals": signals,
            "synergyScore": combo.get("synergyScore", 0.5),
            "country": state["country"]
        })

    trends.sort(key=lambda x: x["score"], reverse=True)
    state["trends"] = trends

    # 카테고리별 개수
    cat_counts = {}
    for t in trends:
        cat_counts[t["category"]] = cat_counts.get(t["category"], 0) + 1
    print(f"✅ Agent 4 완료: {len(trends)}개 트렌드 (Actionable: {cat_counts.get('Actionable', 0)}, Growing: {cat_counts.get('Growing', 0)}, Early: {cat_counts.get('Early', 0)})")
    return state


# ============================================================
# Agent 5: SNS 플랫폼 분석
# ============================================================
def analyze_sns_platforms_node(state: WorkflowState) -> WorkflowState:
    """SNS 플랫폼별 키워드 인기도 분석 (실제 DB 기반)"""
    print("🔍 Agent 5: SNS 플랫폼 분석 시작...")

    date_range = state["date_range"]
    country = state["country"]
    mid_point = date_range["week_boundaries"][state["weeks"] // 2]

    platforms = ["Instagram", "TikTok", "YouTube", "Amazon", "Shopee", "Cosme"]
    sns_stats = {}

    # 모든 추출된 키워드 수집
    all_keywords = {}
    for product_id, keywords_dict in state["extracted_keywords"].items():
        for category, keywords in keywords_dict.items():
            for keyword in keywords:
                if keyword not in all_keywords:
                    all_keywords[keyword] = {"type": category, "total": 0}

    for platform in platforms:
        platform_keywords = []

        for keyword, kw_data in all_keywords.items():
            try:
                # 전체 기간 언급 수
                total_count = db.raw_sns_posts.count_documents({
                    "platform": platform,
                    "country": country,
                    "postedAt": {"$gte": date_range["start"], "$lte": date_range["end"]},
                    "$or": [
                        {"content": {"$regex": keyword, "$options": "i"}},
                        {"hashtags": {"$regex": keyword, "$options": "i"}}
                    ]
                })

                if total_count > 0:
                    # 최근 절반 기간 언급 수 (성장률 계산용)
                    recent_count = db.raw_sns_posts.count_documents({
                        "platform": platform,
                        "country": country,
                        "postedAt": {"$gte": mid_point, "$lte": date_range["end"]},
                        "$or": [
                            {"content": {"$regex": keyword, "$options": "i"}},
                            {"hashtags": {"$regex": keyword, "$options": "i"}}
                        ]
                    })
                    old_count = total_count - recent_count

                    # 성장률
                    change = round(((recent_count - old_count) / max(old_count, 1)) * 100, 1)

                    # 값 = 언급 수 기반 (정규화)
                    value = min(100, round(total_count * 10, 1))  # 10개 = 100점

                    platform_keywords.append({
                        "keyword": keyword,
                        "value": value,
                        "change": change,
                        "type": kw_data["type"],
                        "mentionCount": total_count
                    })
            except Exception as e:
                continue

        # 값 순으로 정렬, 상위 10개
        platform_keywords.sort(key=lambda x: x["value"], reverse=True)
        sns_stats[platform] = platform_keywords[:10]
        if platform_keywords:
            print(f"  ✓ {platform}: {len(platform_keywords)}개 키워드 발견 (Top: {platform_keywords[0]['keyword']})")
        else:
            print(f"  - {platform}: 키워드 없음")

    state["sns_stats"] = sns_stats
    print(f"✅ Agent 5 완료: {len(platforms)}개 플랫폼 분석")
    return state


# ============================================================
# 워크플로우 구성
# ============================================================
def create_workflow():
    workflow = StateGraph(WorkflowState)

    workflow.add_node("extract_keywords", extract_keywords_node)
    workflow.add_node("map_effects", map_effects_node)
    workflow.add_node("analyze_combinations", analyze_combinations_node)
    workflow.add_node("aggregate_trends", aggregate_trends_node)
    workflow.add_node("analyze_sns_platforms", analyze_sns_platforms_node)

    workflow.set_entry_point("extract_keywords")
    workflow.add_edge("extract_keywords", "map_effects")
    workflow.add_edge("map_effects", "analyze_combinations")
    workflow.add_edge("analyze_combinations", "aggregate_trends")
    workflow.add_edge("aggregate_trends", "analyze_sns_platforms")
    workflow.add_edge("analyze_sns_platforms", END)

    return workflow.compile()


# ============================================================
# DB 저장
# ============================================================
def save_to_db(state: WorkflowState):
    """워크플로우 결과를 DB에 저장"""
    print("💾 DB 저장 시작...")
    country = state["country"]

    try:
        # 기존 processed data 삭제 (재실행 시 중복 방지)
        db.processed_keywords.delete_many({})
        db.trends.delete_many({"country": country})
        db.sns_platform_stats.delete_many({"country": country})

        # 1. processed_keywords 저장
        keyword_docs = []
        for product_id, keywords_dict in state["extracted_keywords"].items():
            for category, keywords in keywords_dict.items():
                for keyword in keywords:
                    effects = state["mapped_effects"].get(product_id, {}).get(keyword, [])
                    keyword_docs.append({
                        "keyword": keyword,
                        "keywordType": category if category != "ingredients" else "ingredient",
                        "sourceType": "product_description",
                        "sourceId": product_id,
                        "effects": effects,
                        "country": country,
                        "extractedAt": datetime.now(),
                        "processedAt": datetime.now()
                    })

        if keyword_docs:
            db.processed_keywords.insert_many(keyword_docs)
            print(f"  ✓ processed_keywords: {len(keyword_docs)}개 저장")

        # 2. trends 저장
        if state["trends"]:
            for trend in state["trends"]:
                db.trends.replace_one(
                    {"combination": trend["combination"], "country": country},
                    {
                        **trend,
                        "calculatedAt": datetime.now(),
                        "updatedAt": datetime.now()
                    },
                    upsert=True
                )
            print(f"  ✓ trends: {len(state['trends'])}개 저장")

        # 3. sns_platform_stats 저장
        for platform, keywords in state["sns_stats"].items():
            if keywords:
                db.sns_platform_stats.replace_one(
                    {"platform": platform, "country": country},
                    {
                        "platform": platform,
                        "country": country,
                        "keywords": keywords,
                        "date": datetime.now(),
                        "calculatedAt": datetime.now()
                    },
                    upsert=True
                )
        print(f"  ✓ sns_platform_stats: {len(state['sns_stats'])}개 플랫폼 저장")

        # 4. leaderboard 생성 (keywordType별 집계)
        db.leaderboard.delete_many({"country": country})
        for kw_type in ["ingredient", "formula", "effect", "mood"]:
            pipeline = [
                {"$match": {"keywordType": kw_type, "country": country}},
                {"$group": {
                    "_id": "$keyword",
                    "count": {"$sum": 1},
                    "sources": {"$addToSet": "$sourceId"}
                }},
                {"$sort": {"count": -1}},
                {"$limit": 20}
            ]
            keywords = list(db.processed_keywords.aggregate(pipeline))

            for idx, kw in enumerate(keywords):
                # 관련 트렌드에서 점수 가져오기
                related_trends = list(db.trends.find({
                    "$or": [
                        {"ingredients": kw["_id"]},
                        {"formulas": kw["_id"]},
                        {"effects": kw["_id"]}
                    ],
                    "country": country
                }))

                avg_score = (sum(t.get("score", 0) for t in related_trends) / len(related_trends)) if related_trends else kw["count"] * 8
                best_category = "Early"
                if related_trends:
                    categories = [t.get("category", "Early") for t in related_trends]
                    if "Actionable" in categories:
                        best_category = "Actionable"
                    elif "Growing" in categories:
                        best_category = "Growing"

                db.leaderboard.insert_one({
                    "rank": idx + 1,
                    "keyword": kw["_id"],
                    "keywordType": kw_type,
                    "score": round(avg_score, 1),
                    "productCount": len(kw["sources"]),
                    "trendLevel": best_category,
                    "country": country,
                    "category": state["category"],
                    "updatedAt": datetime.now()
                })

        leaderboard_count = db.leaderboard.count_documents({"country": country})
        print(f"  ✓ leaderboard: {leaderboard_count}개 항목 생성")

        print("✅ DB 저장 완료")

    except Exception as e:
        print(f"⚠️ DB 저장 오류: {e}")
        import traceback
        traceback.print_exc()


# ============================================================
# 메인 실행
# ============================================================
def run_workflow(country="usa", category="Skincare", weeks=8):
    """워크플로우 실행"""
    print(f"\n{'='*60}")
    print(f"🚀 AMORE CLUE 워크플로우 시작")
    print(f"   국가: {country} | 카테고리: {category} | 기간: {weeks}주")
    print(f"{'='*60}\n")

    # MongoDB 연결 테스트
    try:
        client.admin.command('ping')
        print("✅ MongoDB 연결 확인")
    except Exception as e:
        print(f"❌ MongoDB 연결 실패: {e}")
        return None

    # 날짜 범위 계산
    date_range = get_date_range(country, category, weeks)
    print(f"📅 데이터 기간: {date_range['start'].strftime('%Y-%m-%d')} ~ {date_range['end'].strftime('%Y-%m-%d')}")

    # 제품 데이터 로드
    products = list(db.raw_retail_sales.find({
        "country": country,
        "category": category,
        "date": {"$gte": date_range["start"], "$lte": date_range["end"]}
    }))

    # 제품별 최신 데이터만 (중복 제거)
    product_map = {}
    for p in products:
        pid = p["productId"]
        if pid not in product_map or p.get("date", datetime.min) > product_map[pid].get("date", datetime.min):
            product_map[pid] = p

    unique_products = list(product_map.values())
    print(f"📦 {len(unique_products)}개 고유 제품 발견 (총 {len(products)}개 레코드)")

    if not unique_products:
        print("❌ 제품 데이터가 없습니다. seed_data.py를 먼저 실행하세요.")
        return None

    # 초기 State
    initial_state: WorkflowState = {
        "country": country,
        "category": category,
        "weeks": weeks,
        "date_range": date_range,
        "product_descriptions": [
            {
                "productId": p.get("productId", f"product-{i}"),
                "description": p.get("description", ""),
                "salesRank": p.get("salesRank", 500),
                "salesVolume": p.get("salesVolume", 0),
                "brand": p.get("brand", ""),
                "productName": p.get("productName", "")
            }
            for i, p in enumerate(unique_products)
        ],
        "extracted_keywords": {},
        "mapped_effects": {},
        "combinations": [],
        "trends": [],
        "sns_stats": {}
    }

    # 워크플로우 실행
    print(f"\n{'─'*40}")
    app = create_workflow()
    final_state = app.invoke(initial_state)
    print(f"{'─'*40}\n")

    # DB 저장
    save_to_db(final_state)

    # 결과 요약
    print(f"\n{'='*60}")
    print(f"🎉 워크플로우 완료!")
    print(f"   추출된 키워드: {sum(sum(len(v) for v in kw.values()) for kw in final_state['extracted_keywords'].values())}개")
    print(f"   분석된 조합: {len(final_state['combinations'])}개")
    print(f"   트렌드: {len(final_state['trends'])}개")
    print(f"   SNS 플랫폼: {sum(1 for v in final_state['sns_stats'].values() if v)}개")
    if final_state['trends']:
        top = final_state['trends'][0]
        print(f"   🏆 Top 트렌드: {top['combination']} (score: {top['score']}, {top['category']})")
    print(f"{'='*60}\n")

    return final_state


if __name__ == "__main__":
    country = sys.argv[1] if len(sys.argv) > 1 else "usa"
    category = sys.argv[2] if len(sys.argv) > 2 else "Skincare"
    weeks = int(sys.argv[3]) if len(sys.argv) > 3 else 8

    result = run_workflow(country=country, category=category, weeks=weeks)

    if result:
        # JSON 결과 출력 (서버에서 파싱 가능)
        summary = {
            "success": True,
            "keywords_count": sum(sum(len(v) for v in kw.values()) for kw in result['extracted_keywords'].values()),
            "combinations_count": len(result['combinations']),
            "trends_count": len(result['trends']),
            "top_trends": [
                {"combination": t["combination"], "score": t["score"], "category": t["category"]}
                for t in result['trends'][:5]
            ]
        }
        print(f"\n__RESULT_JSON__:{json.dumps(summary)}")
    else:
        print(json.dumps({"success": False, "error": "No data available"}))
