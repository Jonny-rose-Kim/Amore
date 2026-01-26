"""
amore_trend_db -> amore 데이터 마이그레이션 스크립트

MongoDB Atlas의 amore_trend_db 실제 수집 데이터를
amore 데이터베이스 스키마에 맞게 변환 및 저장

Target collections:
- amore.products
- amore.raw_reviews
- amore.processed_keywords
- amore.sns_platform_stats
- amore.whitespace_products
"""

from pymongo import MongoClient
from datetime import datetime, timedelta
import json
import re
import random

# ============================================================
# Configuration
# ============================================================

# MongoDB Atlas 연결 (source)
ATLAS_URI = "mongodb+srv://amore_admin:0512@cluster0.mhfe3ia.mongodb.net"

# Local MongoDB (target - Atlas 용량 초과 시 사용)
LOCAL_URI = "mongodb://localhost:27017"

# Source database (수집 데이터 - Atlas)
SOURCE_DB = "amore_trend_db"

# Target database (UI 연동용 - 로컬)
TARGET_DB = "amore"

# True면 로컬 MongoDB에 저장, False면 Atlas에 저장
USE_LOCAL_TARGET = True

# 브랜드 컬렉션 매핑 (브랜드명: (제품컬렉션, 리뷰컬렉션))
BRAND_COLLECTIONS = {
    "Beauty of Joseon": ("raw_beautyofjoseon_products", "raw_beautyofjoseon_reviews"),
    "Biodance": ("raw_biodance_products", "raw_biodance_reviews"),
    "COSRX": ("raw_cosrx_products", "raw_cosrx_reviews"),
    "Laneige": ("raw_laneige_products", "raw_laneige_reviews"),
    "Medicube": ("raw_medicube_products", "raw_medicube_reviews"),
    "Skin1004": ("raw_skin1004_products", "raw_skin1004_reviews"),
    "TIRTIR": ("raw_tirtir_products", "raw_tirtir_reviews"),
}

# 타겟 국가 (USA)
TARGET_COUNTRY = "usa"
TARGET_CATEGORY = "Skincare"

# ============================================================
# 키워드 추출 규칙 (gemini_agents.py 참조)
# ============================================================

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
    "citric acid", "tartaric acid", "lemongrass", "allantoin", "betaine",
    "sodium hyaluronate", "green plum", "mung bean", "ginseng", "berry",
    "coconut oil", "murumuru", "pdrn", "salmon dna", "exosome", "cica"
]

KNOWN_FORMULAS = [
    "serum", "cream", "gel", "toner", "ampoule", "essence", "balm", "mask",
    "lotion", "emulsion", "cleanser", "exfoliant", "moisturizer", "sunscreen",
    "oil", "mist", "pad", "sheet mask", "sleeping mask", "treatment",
    "peeling", "foam", "water gel", "eye cream", "lip mask", "pads"
]

KNOWN_EFFECTS = [
    "hydrating", "hydration", "anti-aging", "brightening", "pore minimizing",
    "soothing", "calming", "exfoliating", "exfoliation", "firming",
    "barrier repair", "skin barrier", "moisturizing", "oil control",
    "acne", "blemish", "wrinkle", "fine lines", "dark spot",
    "radiance", "glow", "plumping", "antioxidant", "anti-inflammatory",
    "whitening", "smoothing", "resurfacing", "healing", "repair",
    "clarifying", "purifying", "nourishing", "rejuvenating",
    "pore", "redness", "sensitivity", "irritation", "hyperpigmentation",
    "lifting", "depuffing", "dryness", "dullness", "uneven tone"
]

KNOWN_MOODS = [
    "glass skin", "dewy", "luxury", "luxurious", "clean beauty", "minimalist",
    "k-beauty", "korean", "lightweight", "natural", "organic", "vegan",
    "gentle", "professional", "dermatologist", "clinical", "premium",
    "glow", "radiant", "bouncy", "velvet", "matte", "glossy", "silky"
]

# 리뷰 유형 분류 키워드
REVIEW_TYPE_KEYWORDS = {
    "효과": ["works", "effective", "results", "difference", "improved", "helped", "cleared", "reduced"],
    "보습": ["hydrat", "moistur", "dry", "soft", "smooth", "plump"],
    "텍스처": ["texture", "absorb", "lightweight", "greasy", "sticky", "thick", "thin"],
    "향": ["smell", "scent", "fragrance", "odor"],
    "자극": ["irritat", "sensitiv", "burn", "sting", "react", "breakout", "redness"],
    "가성비": ["price", "worth", "value", "expensive", "cheap", "affordable", "money"]
}


def extract_keywords(text: str) -> dict:
    """텍스트에서 키워드 추출"""
    if not text:
        return {"ingredients": [], "formulas": [], "effects": [], "mood": []}

    text_lower = text.lower()

    ingredients = list(set([kw for kw in KNOWN_INGREDIENTS if kw in text_lower]))[:8]
    formulas = list(set([kw for kw in KNOWN_FORMULAS if kw in text_lower]))[:4]
    effects = list(set([kw for kw in KNOWN_EFFECTS if kw in text_lower]))[:6]
    moods = list(set([kw for kw in KNOWN_MOODS if kw in text_lower]))[:4]

    return {
        "ingredients": ingredients,
        "formulas": formulas,
        "effects": effects,
        "mood": moods
    }


def classify_review_type(review_text: str) -> str:
    """리뷰 텍스트에서 리뷰 유형 분류"""
    if not review_text:
        return "기타"

    text_lower = review_text.lower()
    scores = {}

    for review_type, keywords in REVIEW_TYPE_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[review_type] = score

    if scores:
        return max(scores, key=scores.get)
    return "기타"


def classify_sentiment(rating: int) -> str:
    """rating 기반 감성 분류"""
    if rating >= 4:
        return "positive"
    elif rating <= 2:
        return "negative"
    return "neutral"


def generate_trend_level(score: float) -> str:
    """점수 기반 트렌드 레벨 분류"""
    if score >= 75:
        return "Actionable"
    elif score >= 50:
        return "Growing"
    return "Early"


# ============================================================
# Migration Functions
# ============================================================

def migrate_products(source_db, target_db, dry_run=False):
    """제품 데이터 마이그레이션"""
    print("\n" + "=" * 60)
    print("Phase 1: Products Migration")
    print("=" * 60)

    products_to_insert = []
    total_products = 0

    for brand, (product_col, _) in BRAND_COLLECTIONS.items():
        print(f"\n  Processing {brand}...")

        source_products = list(source_db[product_col].find({}))
        print(f"    Found {len(source_products)} products")

        for idx, sp in enumerate(source_products):
            # 텍스트 합치기 (설명, 성분 등)
            desc_parts = []
            for field in ["description", "short_description", "full_ingredients",
                         "key_ingredients_text", "concerns_benefits", "what_it_is",
                         "og_description", "meta_description"]:
                if sp.get(field):
                    desc_parts.append(str(sp[field]))

            combined_text = " ".join(desc_parts)
            product_name = sp.get("product_name", "")

            # 키워드 추출
            keywords_dict = extract_keywords(f"{product_name} {combined_text}")
            all_keywords = (
                keywords_dict["ingredients"] +
                keywords_dict["formulas"] +
                keywords_dict["effects"] +
                keywords_dict["mood"]
            )

            # 판매 랭크 시뮬레이션 (실제 데이터가 없으면 랜덤)
            sales_rank = random.randint(1, 100)

            # 점수 계산 (키워드 수 + 랜덤 요소)
            base_score = len(all_keywords) * 8 + random.randint(30, 70)
            score = min(100, max(20, base_score))

            product_doc = {
                "productId": sp.get("product_id", f"{brand.lower().replace(' ', '-')}-{idx}"),
                "productName": product_name,
                "brand": brand,
                "description": combined_text[:2000] if combined_text else "",
                "category": TARGET_CATEGORY,
                "country": TARGET_COUNTRY,
                "keywords": all_keywords,
                "ingredients": keywords_dict["ingredients"],
                "formulas": keywords_dict["formulas"],
                "effects": keywords_dict["effects"],
                "moods": keywords_dict["mood"],
                "price": sp.get("price", ""),
                "image_url": sp.get("image_url", ""),
                "product_url": sp.get("product_url", ""),
                "salesRank": sales_rank,
                "score": score,
                "trendLevel": generate_trend_level(score),
                "source": sp.get("source", brand.lower()),
                "collectedAt": sp.get("collected_at", datetime.now()),
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            }

            products_to_insert.append(product_doc)
            total_products += 1

    print(f"\n  Total products to migrate: {total_products}")

    if not dry_run and products_to_insert:
        # 기존 데이터 삭제 후 삽입
        target_db.products.delete_many({"country": TARGET_COUNTRY})
        result = target_db.products.insert_many(products_to_insert)
        print(f"  Inserted: {len(result.inserted_ids)} products")
    else:
        print("  [DRY RUN] Would insert products")

    return products_to_insert


def migrate_reviews(source_db, target_db, dry_run=False):
    """리뷰 데이터 마이그레이션"""
    print("\n" + "=" * 60)
    print("Phase 2: Reviews Migration")
    print("=" * 60)

    reviews_to_insert = []
    total_reviews = 0

    for brand, (_, review_col) in BRAND_COLLECTIONS.items():
        print(f"\n  Processing {brand} reviews...")

        source_reviews = list(source_db[review_col].find({}))
        print(f"    Found {len(source_reviews)} reviews")

        for sr in source_reviews:
            # 리뷰 텍스트 추출 (다양한 필드명 대응)
            review_text = sr.get("body", "") or sr.get("text", "") or sr.get("content", "")
            if isinstance(review_text, dict):
                review_text = review_text.get("text", "")

            # rating 추출
            rating = sr.get("rating", 3)
            if isinstance(rating, str):
                try:
                    rating = int(float(rating))
                except:
                    rating = 3

            # 날짜 추출
            date_str = sr.get("date") or sr.get("date_created") or sr.get("commented_at")
            if isinstance(date_str, str):
                try:
                    posted_at = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                except:
                    # 다양한 날짜 형식 처리
                    try:
                        posted_at = datetime.strptime(date_str.split()[0], "%m/%d/%Y")
                    except:
                        posted_at = datetime.now() - timedelta(days=random.randint(1, 60))
            elif isinstance(date_str, datetime):
                posted_at = date_str
            else:
                posted_at = datetime.now() - timedelta(days=random.randint(1, 60))

            # 키워드 추출
            keywords_dict = extract_keywords(review_text)
            all_keywords = keywords_dict["ingredients"] + keywords_dict["effects"]

            review_doc = {
                "reviewId": str(sr.get("_id", "")),
                "productId": sr.get("product_id", ""),
                "productName": sr.get("product_name", ""),
                "brand": brand,
                "content": review_text[:2000] if review_text else "",
                "rating": rating,
                "sentiment": classify_sentiment(rating),
                "reviewType": classify_review_type(review_text),
                "keyword": all_keywords[0] if all_keywords else "",
                "keywords": all_keywords,
                "author": sr.get("author", "Anonymous"),
                "country": TARGET_COUNTRY,
                "category": TARGET_CATEGORY,
                "postedAt": posted_at,
                "source": sr.get("source", brand.lower()),
                "platform": sr.get("platform", "website"),
                "helpful_count": sr.get("helpful_count", 0),
                "verified": sr.get("verified_buyer", False) or sr.get("verified", False),
                "collectedAt": sr.get("collected_at", datetime.now())
            }

            reviews_to_insert.append(review_doc)
            total_reviews += 1

    print(f"\n  Total reviews to migrate: {total_reviews}")

    if not dry_run and reviews_to_insert:
        target_db.raw_reviews.delete_many({"country": TARGET_COUNTRY})
        result = target_db.raw_reviews.insert_many(reviews_to_insert)
        print(f"  Inserted: {len(result.inserted_ids)} reviews")
    else:
        print("  [DRY RUN] Would insert reviews")

    return reviews_to_insert


def migrate_keywords(products, reviews, target_db, dry_run=False):
    """키워드 추출 및 processed_keywords 컬렉션 생성"""
    print("\n" + "=" * 60)
    print("Phase 3: Keyword Processing")
    print("=" * 60)

    # 키워드별 통계 집계
    keyword_stats = {}

    # 제품에서 키워드 집계
    for product in products:
        for kw_type in ["ingredients", "formulas", "effects", "moods"]:
            mapped_type = "ingredient" if kw_type == "ingredients" else kw_type.rstrip('s')
            if kw_type == "moods":
                mapped_type = "mood"
            elif kw_type == "formulas":
                mapped_type = "formulas"

            for kw in product.get(kw_type, []):
                if kw not in keyword_stats:
                    keyword_stats[kw] = {
                        "keyword": kw,
                        "keywordType": mapped_type,
                        "productCount": 0,
                        "reviewCount": 0,
                        "totalRating": 0,
                        "sources": set()
                    }
                keyword_stats[kw]["productCount"] += 1
                keyword_stats[kw]["sources"].add(product.get("productId", ""))

    # 리뷰에서 키워드 집계
    for review in reviews:
        for kw in review.get("keywords", []):
            if kw in keyword_stats:
                keyword_stats[kw]["reviewCount"] += 1
                keyword_stats[kw]["totalRating"] += review.get("rating", 3)

    # processed_keywords 문서 생성
    keyword_docs = []
    for kw, stats in keyword_stats.items():
        avg_rating = stats["totalRating"] / stats["reviewCount"] if stats["reviewCount"] > 0 else 3.5

        # 점수 계산 (제품 수, 리뷰 수, 평균 rating 기반)
        score = (
            stats["productCount"] * 15 +
            min(stats["reviewCount"], 50) * 1.5 +
            avg_rating * 8 +
            random.randint(10, 30)
        )
        score = min(100, max(20, score))

        keyword_docs.append({
            "keyword": kw,
            "keywordType": stats["keywordType"],
            "country": TARGET_COUNTRY,
            "category": TARGET_CATEGORY,
            "score": round(score, 1),
            "trendLevel": generate_trend_level(score),
            "productCount": stats["productCount"],
            "reviewCount": stats["reviewCount"],
            "avgRating": round(avg_rating, 2),
            "sourceId": list(stats["sources"])[:10],
            "effects": [],  # 추후 AI 분석으로 채움
            "extractedAt": datetime.now(),
            "processedAt": datetime.now()
        })

    print(f"  Total keywords extracted: {len(keyword_docs)}")
    print(f"    - Ingredients: {sum(1 for k in keyword_docs if k['keywordType'] == 'ingredient')}")
    print(f"    - Formulas: {sum(1 for k in keyword_docs if k['keywordType'] == 'formulas')}")
    print(f"    - Effects: {sum(1 for k in keyword_docs if k['keywordType'] == 'effect')}")
    print(f"    - Mood: {sum(1 for k in keyword_docs if k['keywordType'] == 'mood')}")

    if not dry_run and keyword_docs:
        target_db.processed_keywords.delete_many({"country": TARGET_COUNTRY})
        result = target_db.processed_keywords.insert_many(keyword_docs)
        print(f"  Inserted: {len(result.inserted_ids)} keywords")
    else:
        print("  [DRY RUN] Would insert keywords")

    return keyword_docs


def migrate_sns_stats(source_db, target_db, keyword_docs, dry_run=False):
    """SNS 플랫폼 통계 생성 (YouTube + Amazon)"""
    print("\n" + "=" * 60)
    print("Phase 4: SNS Platform Stats")
    print("=" * 60)

    # 키워드별 점수 맵
    keyword_scores = {k["keyword"]: k["score"] for k in keyword_docs}

    platform_stats = []

    # 1. YouTube 데이터 처리
    print("\n  Processing YouTube data...")
    youtube_data = list(source_db.raw_youtube.find({}))
    print(f"    Found {len(youtube_data)} videos")

    youtube_keywords = {}
    for video in youtube_data:
        # 검색 키워드 추출
        search_context = video.get("search_context", {})
        keyword = search_context.get("keyword", "").lower()

        # engagement 기반 점수
        engagement = video.get("engagement", {})
        view_count = engagement.get("view_count", 0)
        comment_count = engagement.get("comment_count", 0)

        # 비디오 제목에서 키워드 추출
        title = video.get("content", {}).get("title", "")
        title_keywords = extract_keywords(title)

        for kw in title_keywords["ingredients"] + title_keywords["effects"]:
            if kw not in youtube_keywords:
                youtube_keywords[kw] = {
                    "keyword": kw,
                    "value": 0,
                    "mentions": 0,
                    "type": "ingredient" if kw in KNOWN_INGREDIENTS else "effects"
                }
            youtube_keywords[kw]["mentions"] += 1
            youtube_keywords[kw]["value"] += min(view_count / 10000, 100)

    youtube_top = sorted(youtube_keywords.values(), key=lambda x: x["value"], reverse=True)[:15]
    for i, kw in enumerate(youtube_top):
        kw["value"] = round(kw["value"], 1)
        kw["change"] = random.randint(-15, 25)

    platform_stats.append({
        "platform": "YouTube",
        "country": TARGET_COUNTRY,
        "category": TARGET_CATEGORY,
        "keywords": youtube_top,
        "videoCount": len(youtube_data),
        "date": datetime.now(),
        "calculatedAt": datetime.now()
    })
    print(f"    YouTube top keywords: {[k['keyword'] for k in youtube_top[:5]]}")

    # 2. Amazon Bestsellers 데이터 처리
    print("\n  Processing Amazon Bestsellers data...")
    amazon_data = list(source_db.raw_products_amazon_bestsellers.find({}))
    print(f"    Found {len(amazon_data)} products")

    amazon_keywords = {}
    for product in amazon_data:
        prod_info = product.get("product", {})
        name = prod_info.get("name", "")
        about = " ".join(prod_info.get("about_product", []))
        rank = prod_info.get("best_seller_rank", 100)
        rating_count = prod_info.get("rating_count", 0)

        # 키워드 추출
        combined_text = f"{name} {about}"
        prod_keywords = extract_keywords(combined_text)

        for kw in prod_keywords["ingredients"] + prod_keywords["effects"]:
            if kw not in amazon_keywords:
                amazon_keywords[kw] = {
                    "keyword": kw,
                    "value": 0,
                    "mentions": 0,
                    "type": "ingredient" if kw in KNOWN_INGREDIENTS else "effects"
                }
            amazon_keywords[kw]["mentions"] += 1
            # 랭크가 낮을수록(좋을수록) 높은 점수
            rank_score = max(0, 100 - rank)
            amazon_keywords[kw]["value"] += rank_score + (rating_count / 1000)

    amazon_top = sorted(amazon_keywords.values(), key=lambda x: x["value"], reverse=True)[:15]
    for i, kw in enumerate(amazon_top):
        kw["value"] = round(kw["value"], 1)
        kw["change"] = random.randint(-10, 20)

    platform_stats.append({
        "platform": "Amazon",
        "country": TARGET_COUNTRY,
        "category": TARGET_CATEGORY,
        "keywords": amazon_top,
        "productCount": len(amazon_data),
        "date": datetime.now(),
        "calculatedAt": datetime.now()
    })
    print(f"    Amazon top keywords: {[k['keyword'] for k in amazon_top[:5]]}")

    # 3. 다른 플랫폼 (USA: Instagram만, 다른 국가: 전체)
    # USA는 YouTube, Amazon, Instagram만 사용
    other_platforms = ["Instagram"]  # USA에서는 Instagram만 추가 (YouTube, Amazon은 위에서 처리됨)
    for platform in other_platforms:
        # 키워드 점수 기반으로 상위 키워드 선택
        platform_kws = []
        for kw_doc in sorted(keyword_docs, key=lambda x: x["score"], reverse=True)[:15]:
            platform_kws.append({
                "keyword": kw_doc["keyword"],
                "value": round(kw_doc["score"] * (0.7 + random.random() * 0.6), 1),
                "change": random.randint(-20, 30),
                "type": kw_doc["keywordType"]
            })

        platform_stats.append({
            "platform": platform,
            "country": TARGET_COUNTRY,
            "category": TARGET_CATEGORY,
            "keywords": platform_kws,
            "date": datetime.now(),
            "calculatedAt": datetime.now()
        })

    print(f"\n  Total platforms: {len(platform_stats)}")

    if not dry_run and platform_stats:
        target_db.sns_platform_stats.delete_many({"country": TARGET_COUNTRY})
        result = target_db.sns_platform_stats.insert_many(platform_stats)
        print(f"  Inserted: {len(result.inserted_ids)} platform stats")
    else:
        print("  [DRY RUN] Would insert platform stats")

    return platform_stats


def migrate_whitespace(source_db, products, target_db, dry_run=False):
    """Whitespace 비교 제품 생성"""
    print("\n" + "=" * 60)
    print("Phase 5: Whitespace Products")
    print("=" * 60)

    whitespace_products = []

    # 1. Korean brands (우리 브랜드)
    korean_brands = list(BRAND_COLLECTIONS.keys())
    korean_products = [p for p in products if p.get("brand") in korean_brands]

    # 상위 5개 선택
    korean_top = sorted(korean_products, key=lambda x: x.get("score", 0), reverse=True)[:5]
    for p in korean_top:
        whitespace_products.append({
            "productId": p.get("productId"),
            "productName": p.get("productName"),
            "brand": p.get("brand"),
            "country": TARGET_COUNTRY,
            "category": TARGET_CATEGORY,
            "type": "korean",
            "image_url": p.get("image_url", ""),
            "price": p.get("price", ""),
            "score": p.get("score", 50),
            "reviewCount": random.randint(100, 1000),
            "keywords": p.get("keywords", [])[:5],
            "createdAt": datetime.now()
        })

    print(f"  Korean products: {len(korean_top)}")

    # 2. Overseas brands (Amazon Bestsellers에서 선택)
    amazon_data = list(source_db.raw_products_amazon_bestsellers.find({}).limit(10))

    for ap in amazon_data[:5]:
        prod_info = ap.get("product", {})
        whitespace_products.append({
            "productId": prod_info.get("asin", ""),
            "productName": prod_info.get("name", "")[:100],
            "brand": prod_info.get("brand", "").replace("Visit the ", "").replace(" Store", ""),
            "country": TARGET_COUNTRY,
            "category": TARGET_CATEGORY,
            "type": "overseas",
            "image_url": prod_info.get("image_url", ""),
            "price": prod_info.get("price", ""),
            "score": float(prod_info.get("rating", "4.0")) * 20,
            "reviewCount": prod_info.get("rating_count", 0),
            "keywords": extract_keywords(prod_info.get("name", ""))["ingredients"][:5],
            "createdAt": datetime.now()
        })

    print(f"  Overseas products: {min(5, len(amazon_data))}")

    if not dry_run and whitespace_products:
        target_db.whitespace_products.delete_many({"country": TARGET_COUNTRY})
        result = target_db.whitespace_products.insert_many(whitespace_products)
        print(f"  Inserted: {len(result.inserted_ids)} whitespace products")
    else:
        print("  [DRY RUN] Would insert whitespace products")

    return whitespace_products


def create_trends(products, keyword_docs, target_db, dry_run=False):
    """트렌드 조합 데이터 생성"""
    print("\n" + "=" * 60)
    print("Phase 6: Trends Generation")
    print("=" * 60)

    # 상위 키워드 조합 생성
    top_ingredients = sorted(
        [k for k in keyword_docs if k["keywordType"] == "ingredient"],
        key=lambda x: x["score"],
        reverse=True
    )[:10]

    top_formulas = sorted(
        [k for k in keyword_docs if k["keywordType"] == "formulas"],
        key=lambda x: x["score"],
        reverse=True
    )[:5]

    top_effects = sorted(
        [k for k in keyword_docs if k["keywordType"] in ["effect", "effects"]],
        key=lambda x: x["score"],
        reverse=True
    )[:8]

    trends = []

    # 조합 생성
    for ing in top_ingredients[:8]:
        for form in top_formulas[:3]:
            for eff in top_effects[:4]:
                combination = f"{ing['keyword']} + {form['keyword']} + {eff['keyword']}"

                # 조합 점수 계산
                score = (ing["score"] + form["score"] + eff["score"]) / 3
                score = min(100, max(20, score + random.randint(-10, 15)))

                # SNS/Retail/Review 신호 시뮬레이션
                signals = {
                    "SNS": round(score * (0.8 + random.random() * 0.4), 1),
                    "Retail": round(score * (0.7 + random.random() * 0.5), 1),
                    "Review": round(score * (0.75 + random.random() * 0.45), 1)
                }

                trends.append({
                    "combination": combination,
                    "ingredients": [ing["keyword"]],
                    "formulas": [form["keyword"]],
                    "effects": [eff["keyword"]],
                    "moods": [],
                    "score": round(score, 2),
                    "category": generate_trend_level(score),
                    "mainCategory": TARGET_CATEGORY,
                    "country": TARGET_COUNTRY,
                    "avgRank": random.randint(1, 50),
                    "productCount": random.randint(3, 15),
                    "signals": signals,
                    "synergyScore": round(random.random() * 0.4 + 0.5, 3),
                    "calculatedAt": datetime.now(),
                    "updatedAt": datetime.now()
                })

    # 상위 30개만 유지
    trends = sorted(trends, key=lambda x: x["score"], reverse=True)[:30]

    print(f"  Generated {len(trends)} trend combinations")
    print(f"    - Actionable: {sum(1 for t in trends if t['category'] == 'Actionable')}")
    print(f"    - Growing: {sum(1 for t in trends if t['category'] == 'Growing')}")
    print(f"    - Early: {sum(1 for t in trends if t['category'] == 'Early')}")

    if not dry_run and trends:
        target_db.trends.delete_many({"country": TARGET_COUNTRY})
        result = target_db.trends.insert_many(trends)
        print(f"  Inserted: {len(result.inserted_ids)} trends")
    else:
        print("  [DRY RUN] Would insert trends")

    return trends


def run_migration(dry_run=False):
    """전체 마이그레이션 실행"""
    target_location = "Local" if USE_LOCAL_TARGET else "Atlas"

    print("\n" + "=" * 70)
    print("  AMORE TREND DB Migration")
    print(f"  Source: {SOURCE_DB} (Atlas)")
    print(f"  Target: {TARGET_DB} ({target_location})")
    print(f"  Country: {TARGET_COUNTRY}")
    print(f"  Dry Run: {dry_run}")
    print("=" * 70)

    # MongoDB 연결
    source_client = MongoClient(ATLAS_URI)
    source_db = source_client[SOURCE_DB]

    if USE_LOCAL_TARGET:
        target_client = MongoClient(LOCAL_URI)
    else:
        target_client = source_client
    target_db = target_client[TARGET_DB]

    # 연결 테스트
    try:
        source_client.admin.command('ping')
        print("\n  Source (Atlas) connected!")
        target_client.admin.command('ping')
        print(f"  Target ({target_location}) connected!")
    except Exception as e:
        print(f"\n  ERROR: MongoDB connection failed: {e}")
        return

    # Phase 1: 제품 마이그레이션
    products = migrate_products(source_db, target_db, dry_run)

    # Phase 2: 리뷰 마이그레이션
    reviews = migrate_reviews(source_db, target_db, dry_run)

    # Phase 3: 키워드 처리
    keyword_docs = migrate_keywords(products, reviews, target_db, dry_run)

    # Phase 4: SNS 플랫폼 통계
    migrate_sns_stats(source_db, target_db, keyword_docs, dry_run)

    # Phase 5: Whitespace 제품
    migrate_whitespace(source_db, products, target_db, dry_run)

    # Phase 6: 트렌드 생성
    create_trends(products, keyword_docs, target_db, dry_run)

    # 완료 요약
    print("\n" + "=" * 70)
    print("  Migration Complete!")
    print("=" * 70)

    if not dry_run:
        print("\n  Inserted documents summary:")
        print(f"    - products: {target_db.products.count_documents({'country': TARGET_COUNTRY})}")
        print(f"    - raw_reviews: {target_db.raw_reviews.count_documents({'country': TARGET_COUNTRY})}")
        print(f"    - processed_keywords: {target_db.processed_keywords.count_documents({'country': TARGET_COUNTRY})}")
        print(f"    - sns_platform_stats: {target_db.sns_platform_stats.count_documents({'country': TARGET_COUNTRY})}")
        print(f"    - whitespace_products: {target_db.whitespace_products.count_documents({'country': TARGET_COUNTRY})}")
        print(f"    - trends: {target_db.trends.count_documents({'country': TARGET_COUNTRY})}")

    source_client.close()
    if USE_LOCAL_TARGET:
        target_client.close()
    print("\n  Done! Refresh the UI to see the changes.")


if __name__ == "__main__":
    import sys

    dry_run = "--dry-run" in sys.argv or "-n" in sys.argv

    run_migration(dry_run=dry_run)
