"""
LLM Inference Server GPU7 for AMORE CLUE Dashboard
Uses EXAONE-3.5-7.8B-Instruct on cuda:7
Endpoints: country-strategy, category-strategy, chat/text, rag-insight, whitespace-category
"""
import os
import json
import re
import torch
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
from pymongo import MongoClient

app = Flask(__name__)

# MongoDB 연결
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.environ.get("MONGODB_DATABASE", "amore")
mongo_client = None
mongo_db = None
try:
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
    mongo_db = mongo_client[MONGODB_DATABASE]
    print("MongoDB connected for GPU7")
except Exception as e:
    print(f"MongoDB connection failed: {e}")

# GPU 설정
DEVICE = "cuda:7"
MODEL_NAME = "LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct"

print(f"Loading model: {MODEL_NAME} on {DEVICE}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.bfloat16,
    device_map=DEVICE,
    trust_remote_code=True,
)
model.eval()
print("Model loaded successfully on GPU7!")


SYSTEM_PROMPT = """당신은 글로벌 K-뷰티(K-Beauty) 시장 분석 및 화장품 산업 트렌드 전문가입니다.
아모레퍼시픽, LG생활건강 등 한국 화장품 기업의 글로벌 전략을 자문하는 수준의 전문성을 갖추고 있습니다.
주어진 데이터를 바탕으로 심층적이고 전문적인 분석을 제공하되, 데이터에 나타나지 않는 시장 맥락, 소비자 심리, 산업 동향까지 종합적으로 고려하여 풍부한 인사이트를 제공합니다.
반드시 한국어로만 답변하세요."""


def generate_response(prompt: str, max_new_tokens: int = 1024) -> str:
    """Generate a response from the LLM"""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]

    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(DEVICE)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            repetition_penalty=1.1,
        )

    generated = outputs[0][inputs["input_ids"].shape[1]:]
    response = tokenizer.decode(generated, skip_special_tokens=True)
    return response.strip()


def clean_text(text: str) -> str:
    """Remove markdown formatting from LLM output"""
    text = text.replace("**", "").replace("*", "")
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = text.replace("``", "").replace("`", "")
    return text.strip()


@app.route("/api/llm/country-strategy", methods=["POST"])
def country_strategy():
    """국가별 키워드 전략 분석"""
    try:
        data = request.json
        keyword = data.get("keyword", "")
        country = data.get("country", "usa")
        category = data.get("category", "Skincare")
        keyword_type = data.get("keywordType", "ingredient")
        trend_level = data.get("trendLevel", "Actionable")
        score = data.get("score", 75)
        signals = data.get("signals", {})

        country_names = {
            "usa": "미국", "japan": "일본", "singapore": "싱가포르",
            "malaysia": "말레이시아", "indonesia": "인도네시아"
        }
        country_name = country_names.get(country, "해외")

        type_names = {
            "ingredient": "성분", "formula": "제형", "effect": "효과"
        }
        type_name = type_names.get(keyword_type, "성분")

        signals_text = ""
        if signals:
            signals_text = f"SNS: {signals.get('SNS', 0)}%, Retail: {signals.get('Retail', 0)}%, Review: {signals.get('Review', 0)}%"

        prompt = f"""다음은 {country_name} {category} 시장에서 "{keyword}" ({type_name}) 키워드에 대한 전략 분석 요청입니다.

[키워드 데이터]
- 키워드: {keyword} ({type_name})
- 국가: {country_name}
- 카테고리: {category}
- 트렌드 레벨: {trend_level}
- 종합 점수: {score}/100
- 신호 지표: {signals_text}

{country_name} 시장에서 이 키워드를 활용한 K-뷰티 브랜드의 전략을 다음 형식으로 분석해주세요:

[시장분석]
{country_name} {category} 시장에서 "{keyword}"의 현재 위치와 시장 환경을 3-5문장으로 분석해주세요.

[기회요인]
이 키워드를 활용할 수 있는 기회 요인 3-4개를 각각 한 줄씩 작성해주세요.

[리스크요인]
주의해야 할 리스크 요인 2-3개를 각각 한 줄씩 작성해주세요.

[전략제안]
구체적인 전략 제안 3-4개를 각각 한 줄씩 작성해주세요.

[액션플랜]
즉시 실행 가능한 액션 플랜 3-4개를 각각 한 줄씩 작성해주세요."""

        response = generate_response(prompt, max_new_tokens=1000)

        # Parse response
        market_analysis = ""
        opportunities = []
        risks = []
        strategies = []
        action_plan = []
        current_section = None
        market_lines = []

        lines = response.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(kw in line for kw in ["[시장분석]", "시장분석:", "## 시장분석", "시장 분석"]):
                current_section = "market"
                rest = re.sub(r'^\[시장\s*분석\]|^시장\s*분석:|^## 시장\s*분석', '', line).strip()
                if rest and len(rest) > 5:
                    market_lines.append(rest)
            elif any(kw in line for kw in ["[기회요인]", "기회요인:", "## 기회요인", "기회 요인"]):
                current_section = "opportunities"
                rest = re.sub(r'^\[기회\s*요인\]|^기회\s*요인:|^## 기회\s*요인', '', line).strip()
                if rest and len(rest) > 3:
                    opportunities.append(clean_text(rest))
            elif any(kw in line for kw in ["[리스크요인]", "리스크요인:", "## 리스크요인", "리스크 요인"]):
                current_section = "risks"
                rest = re.sub(r'^\[리스크\s*요인\]|^리스크\s*요인:|^## 리스크\s*요인', '', line).strip()
                if rest and len(rest) > 3:
                    risks.append(clean_text(rest))
            elif any(kw in line for kw in ["[전략제안]", "전략제안:", "## 전략제안", "전략 제안"]):
                current_section = "strategies"
                rest = re.sub(r'^\[전략\s*제안\]|^전략\s*제안:|^## 전략\s*제안', '', line).strip()
                if rest and len(rest) > 3:
                    strategies.append(clean_text(rest))
            elif any(kw in line for kw in ["[액션플랜]", "액션플랜:", "## 액션플랜", "액션 플랜"]):
                current_section = "action"
                rest = re.sub(r'^\[액션\s*플랜\]|^액션\s*플랜:|^## 액션\s*플랜', '', line).strip()
                if rest and len(rest) > 3:
                    action_plan.append(clean_text(rest))
            elif current_section:
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 3:
                    if current_section == "market":
                        market_lines.append(clean_line)
                    elif current_section == "opportunities":
                        opportunities.append(clean_text(clean_line))
                    elif current_section == "risks":
                        risks.append(clean_text(clean_line))
                    elif current_section == "strategies":
                        strategies.append(clean_text(clean_line))
                    elif current_section == "action":
                        action_plan.append(clean_text(clean_line))

        market_analysis = clean_text(" ".join(market_lines)) if market_lines else ""

        # Fallbacks
        if not market_analysis:
            market_analysis = f"{country_name} {category} 시장에서 {keyword}는 현재 {trend_level} 수준의 트렌드 키워드로, 종합 점수 {score}점을 기록하고 있습니다."
        if not opportunities:
            opportunities = [
                f"{country_name} 소비자의 {keyword} 관련 관심도 상승",
                f"SNS 바이럴 잠재력 높음",
                f"기존 K-뷰티 브랜드 인지도 활용 가능"
            ]
        if not risks:
            risks = [
                "현지 브랜드와의 경쟁 심화 가능성",
                "트렌드 지속성에 대한 불확실성"
            ]
        if not strategies:
            strategies = [
                f"{keyword} 중심의 신제품 라인업 기획",
                f"{country_name} 현지 인플루언서 마케팅 강화",
                "단계적 시장 진입 전략 수립"
            ]
        if not action_plan:
            action_plan = [
                "경쟁사 제품 벤치마킹 분석 실시",
                f"{country_name} 현지 소비자 설문조사 진행",
                "프로토타입 제품 개발 착수"
            ]

        return jsonify({
            "success": True,
            "marketAnalysis": market_analysis,
            "opportunities": opportunities[:4],
            "risks": risks[:3],
            "strategies": strategies[:4],
            "actionPlan": action_plan[:4],
        })

    except Exception as e:
        print(f"Error in country_strategy: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/category-strategy", methods=["POST"])
def category_strategy():
    """카테고리 전체의 국가별 전략 분석"""
    try:
        data = request.json
        country = data.get("country", "usa")
        category = data.get("category", "Skincare")
        top_keywords = data.get("topKeywords", [])
        avg_score = data.get("avgScore", 70)

        country_names = {
            "usa": "미국", "japan": "일본", "singapore": "싱가포르",
            "malaysia": "말레이시아", "indonesia": "인도네시아"
        }
        country_name = country_names.get(country, "해외")

        keywords_summary = ""
        if top_keywords:
            keywords_summary = "\n".join([f"  - {k.get('keyword', '')} (점수: {k.get('score', 0)}, 유형: {k.get('type', '')})" for k in top_keywords[:12]])

        prompt = f"""다음은 {country_name} {category} 카테고리의 전략 분석 요청입니다.

[카테고리 데이터]
- 국가: {country_name}
- 카테고리: {category}
- 카테고리 평균 점수: {avg_score}/100
- 주요 트렌드 키워드:
{keywords_summary}

{country_name} 시장에서 {category} 카테고리를 활용한 K-뷰티 브랜드의 전략을 다음 형식으로 분석해주세요:

[시장분석]
{country_name} {category} 시장의 현재 위치와 시장 환경을 3-5문장으로 분석해주세요.

[기회요인]
이 카테고리에서 활용할 수 있는 기회 요인 3-4개를 각각 한 줄씩 작성해주세요.

[리스크요인]
주의해야 할 리스크 요인 2-3개를 각각 한 줄씩 작성해주세요.

[전략제안]
구체적인 전략 제안 3-4개를 각각 한 줄씩 작성해주세요.

[액션플랜]
즉시 실행 가능한 액션 플랜 3-4개를 각각 한 줄씩 작성해주세요."""

        response = generate_response(prompt, max_new_tokens=1000)

        # Parse response
        market_analysis = ""
        opportunities = []
        risks = []
        strategies = []
        action_plan = []
        current_section = None
        market_lines = []

        lines = response.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(kw in line for kw in ["[시장분석]", "시장분석:", "## 시장분석", "시장 분석"]):
                current_section = "market"
                rest = re.sub(r'^\[시장\s*분석\]|^시장\s*분석:|^## 시장\s*분석', '', line).strip()
                if rest and len(rest) > 5:
                    market_lines.append(rest)
            elif any(kw in line for kw in ["[기회요인]", "기회요인:", "## 기회요인", "기회 요인"]):
                current_section = "opportunities"
                rest = re.sub(r'^\[기회\s*요인\]|^기회\s*요인:|^## 기회\s*요인', '', line).strip()
                if rest and len(rest) > 3:
                    opportunities.append(clean_text(rest))
            elif any(kw in line for kw in ["[리스크요인]", "리스크요인:", "## 리스크요인", "리스크 요인"]):
                current_section = "risks"
                rest = re.sub(r'^\[리스크\s*요인\]|^리스크\s*요인:|^## 리스크\s*요인', '', line).strip()
                if rest and len(rest) > 3:
                    risks.append(clean_text(rest))
            elif any(kw in line for kw in ["[전략제안]", "전략제안:", "## 전략제안", "전략 제안"]):
                current_section = "strategies"
                rest = re.sub(r'^\[전략\s*제안\]|^전략\s*제안:|^## 전략\s*제안', '', line).strip()
                if rest and len(rest) > 3:
                    strategies.append(clean_text(rest))
            elif any(kw in line for kw in ["[액션플랜]", "액션플랜:", "## 액션플랜", "액션 플랜"]):
                current_section = "action"
                rest = re.sub(r'^\[액션\s*플랜\]|^액션\s*플랜:|^## 액션\s*플랜', '', line).strip()
                if rest and len(rest) > 3:
                    action_plan.append(clean_text(rest))
            elif current_section:
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 3:
                    if current_section == "market":
                        market_lines.append(clean_line)
                    elif current_section == "opportunities":
                        opportunities.append(clean_text(clean_line))
                    elif current_section == "risks":
                        risks.append(clean_text(clean_line))
                    elif current_section == "strategies":
                        strategies.append(clean_text(clean_line))
                    elif current_section == "action":
                        action_plan.append(clean_text(clean_line))

        market_analysis = clean_text(" ".join(market_lines)) if market_lines else ""

        # Fallbacks
        if not market_analysis:
            market_analysis = f"{country_name} {category} 시장은 현재 K-뷰티 브랜드의 진출 기회가 확대되고 있으며, 평균 트렌드 점수 {avg_score}점을 기록하고 있습니다."
        if not opportunities:
            opportunities = [
                f"{country_name} 소비자의 {category} 관심도 상승",
                "K-뷰티 기술력에 대한 글로벌 신뢰도 확대",
                "SNS 기반 마케팅 효과 극대화 가능"
            ]
        if not risks:
            risks = [
                "현지 브랜드와의 경쟁 심화",
                "트렌드 변화 속도에 대한 대응 필요"
            ]
        if not strategies:
            strategies = [
                f"{category} 카테고리 핵심 성분 기반 신제품 개발",
                f"{country_name} 현지 채널 파트너십 구축",
                "디지털 마케팅 중심 브랜드 인지도 확보"
            ]
        if not action_plan:
            action_plan = [
                "경쟁사 벤치마킹 분석 실시",
                f"{country_name} 현지 소비자 리서치 진행",
                "파일럿 제품 라인업 기획"
            ]

        return jsonify({
            "success": True,
            "marketAnalysis": market_analysis,
            "opportunities": opportunities[:4],
            "risks": risks[:3],
            "strategies": strategies[:4],
            "actionPlan": action_plan[:4],
        })

    except Exception as e:
        print(f"Error in category_strategy: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/chat/text", methods=["POST"])
def chat_text():
    """하단 챗봇 텍스트 채팅"""
    try:
        data = request.json
        message = data.get("message", "").strip()
        session_id = data.get("sessionId", "")

        if not message:
            return jsonify({"success": False, "error": "메시지가 비어있습니다."}), 400

        # MongoDB 컨텍스트 조회
        db_context = ""
        if mongo_db is not None:
            try:
                leaderboard = list(mongo_db.get_collection("leaderboard").find(
                    {}, {"keyword": 1, "score": 1, "trendLevel": 1, "_id": 0}
                ).sort("score", -1).limit(15))
                if leaderboard:
                    keywords_text = ", ".join([f"{k.get('keyword', '')}({k.get('score', 0)}점)" for k in leaderboard])
                    db_context = f"[현재 인기 키워드 Top15] {keywords_text}"
            except:
                pass

        context_block = f"\n{db_context}\n" if db_context else ""

        chat_prompt = f"""당신은 AMORE CLUE 대시보드의 K-뷰티 트렌드 전문 AI 어시스턴트입니다.

{context_block}
사용자 질문: {message}

위 데이터베이스 컨텍스트를 참고하여 답변해주세요.
- 반드시 한국어로 답변하세요
- 구체적인 데이터를 인용하여 답변하세요
- 답변은 간결하고 실용적으로 작성하세요"""

        response = generate_response(chat_prompt, max_new_tokens=800)

        return jsonify({
            "success": True,
            "response": clean_text(response),
            "sessionId": session_id,
        })

    except Exception as e:
        print(f"Error in chat_text: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/rag-insight", methods=["POST"])
def rag_insight():
    """AI 맞춤형 인사이트 제공 (RAG 기반)"""
    try:
        data = request.json
        scope = data.get("scope", "keyword")  # 'keyword' or 'category'
        insight_type = data.get("type", "marketing")  # 'marketing', 'npd', 'overseas'
        keyword = data.get("keyword", "")
        category = data.get("category", "Skincare")
        country = data.get("country", "usa")
        top_keywords = data.get("topKeywords", [])

        country_names = {
            "usa": "미국", "japan": "일본", "singapore": "싱가포르",
            "malaysia": "말레이시아", "indonesia": "인도네시아"
        }
        country_name = country_names.get(country, "해외")

        type_names = {
            "marketing": "마케팅 전략",
            "npd": "신제품 기획(NPD)",
            "overseas": "해외 진출 전략"
        }
        type_name = type_names.get(insight_type, "전략")

        # Build context
        if scope == "keyword":
            target = f'"{keyword}" 키워드'
            keywords_info = ""
        else:
            target = f"{category} 카테고리"
            if top_keywords:
                keywords_info = "주요 키워드: " + ", ".join([f"{k.get('keyword', '')}({k.get('score', 0)}점)" for k in top_keywords[:10]])
            else:
                keywords_info = ""

        prompt = f"""다음은 {country_name} 시장에서 {target}에 대한 {type_name} 인사이트 요청입니다.

[분석 대상]
- 국가: {country_name}
- 대상: {target}
- 카테고리: {category}
- 인사이트 유형: {type_name}
{f'- {keywords_info}' if keywords_info else ''}

위 정보를 바탕으로 {type_name} 관점에서 실행 가능한 인사이트를 제공해주세요.

다음 형식으로 정확히 답변해주세요:

[인사이트]
{type_name} 관점에서 {target}를 활용한 구체적이고 실행 가능한 전략 인사이트를 5-8문장으로 작성해주세요.

포함해야 할 내용:
1. 현재 시장 상황 분석
2. {type_name}의 핵심 기회 포인트
3. 구체적인 실행 방안 제안
4. 주의해야 할 리스크 요인
5. 기대 효과"""

        response = generate_response(prompt, max_new_tokens=1000)
        response = clean_text(response)

        # Parse to get clean insight
        insight_text = response
        if "[인사이트]" in response:
            insight_text = response.split("[인사이트]", 1)[-1].strip()

        if not insight_text or len(insight_text) < 50:
            insight_text = f"{country_name} {category} 시장에서 {target}를 활용한 {type_name} 인사이트: K-뷰티의 기술력과 결합하여 시장 진출 기회를 모색할 수 있습니다. 트렌드 데이터를 기반으로 타겟 소비자 니즈를 정밀하게 분석하고, 현지화된 마케팅 전략을 수립하는 것이 중요합니다."

        return jsonify({
            "success": True,
            "content": insight_text,
            "scope": scope,
            "type": insight_type,
            "keyword": keyword,
            "category": category,
            "country": country,
        })

    except Exception as e:
        print(f"Error in rag_insight: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/whitespace-category", methods=["POST"])
def whitespace_category():
    """WhiteSpace 카테고리 인사이트 버튼"""
    try:
        data = request.json
        country = data.get("country", "usa")
        category = data.get("category", "Skincare")
        overseas_products = data.get("overseasProducts", [])
        korean_products = data.get("koreanProducts", [])

        country_names = {
            "usa": "미국", "japan": "일본", "singapore": "싱가포르",
            "malaysia": "말레이시아", "indonesia": "인도네시아"
        }
        country_name = country_names.get(country, "해외")

        overseas_list = "\n".join([
            f"  - {p.get('name', '')} ({p.get('brand', '')}, 평점: {p.get('rating', '')}, 가격: {p.get('price', '')})"
            for p in overseas_products[:10]
        ]) if overseas_products else "  (데이터 없음)"

        korean_list = "\n".join([
            f"  - {p.get('name', '')} ({p.get('brand', '')}, 평점: {p.get('rating', '')}, 가격: {p.get('price', '')})"
            for p in korean_products[:10]
        ]) if korean_products else "  (데이터 없음)"

        prompt = f"""다음은 {country_name} {category} 카테고리의 WhiteSpace(시장 공백) 분석 요청입니다.

[{country_name} 인기 제품 목록]
{overseas_list}

[한국 인기 제품 목록]
{korean_list}

위 두 시장의 인기 제품을 비교하여, 한국 시장에는 없지만 {country_name} 시장에서 인기 있는 차별화된 소구 포인트와 시장 기회를 분석해주세요.

다음 형식으로 정확히 답변해주세요:

[인사이트제목]
{country_name} {category} 시장의 WhiteSpace 기회를 한 줄로 표현해주세요.

[핵심포인트]
한국 시장에 없는 {country_name} 제품들의 차별화된 소구 포인트를 4-6개 제시해주세요.

[종합요약]
위 분석을 종합하여 K-뷰티 브랜드가 {country_name} {category} 시장에서 활용할 수 있는 핵심 기회를 2-3문장으로 요약해주세요."""

        response = generate_response(prompt, max_new_tokens=1200)

        # Parse response
        title = ""
        points = []
        summary = ""
        current_section = None
        title_lines = []
        summary_lines = []

        lines = response.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(kw in line for kw in ["[인사이트제목]", "인사이트제목:", "인사이트 제목"]):
                current_section = "title"
                rest = re.sub(r'^\[인사이트\s*제목\]|^인사이트\s*제목:', '', line).strip()
                if rest and len(rest) > 3:
                    title_lines.append(rest)
            elif any(kw in line for kw in ["[핵심포인트]", "핵심포인트:", "핵심 포인트"]):
                current_section = "points"
                rest = re.sub(r'^\[핵심\s*포인트\]|^핵심\s*포인트:', '', line).strip()
                if rest and len(rest) > 3:
                    points.append(clean_text(rest))
            elif any(kw in line for kw in ["[종합요약]", "종합요약:", "종합 요약"]):
                current_section = "summary"
                rest = re.sub(r'^\[종합\s*요약\]|^종합\s*요약:', '', line).strip()
                if rest and len(rest) > 5:
                    summary_lines.append(rest)
            elif current_section:
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 3:
                    if current_section == "title":
                        title_lines.append(clean_line)
                    elif current_section == "points":
                        points.append(clean_text(clean_line))
                    elif current_section == "summary":
                        summary_lines.append(clean_line)

        title = clean_text(" ".join(title_lines)) if title_lines else ""
        summary = clean_text(" ".join(summary_lines)) if summary_lines else ""

        def strip_headers(text):
            return re.sub(r'^\[[\w\s]+\]\s*', '', text).strip()

        title = strip_headers(title)
        summary = strip_headers(summary)
        points = [strip_headers(p) for p in points if not re.match(r'^\[[\w\s]+\]$', p.strip())]

        # Fallbacks
        if not title:
            title = f"{country_name} {category} 시장의 차별화 포인트"
        if not points:
            points = [
                f"{country_name} 소비자가 선호하는 고효능 활성 성분 배합 트렌드",
                "해외 시장 특화 제형 기술과 텍스처 차별화",
                f"{country_name} 현지 피부 고민에 최적화된 솔루션 부재",
                "글로벌 클린뷰티 트렌드를 반영한 성분 구성 기회"
            ]
        if not summary:
            summary = f"{country_name} {category} 시장에서 K-뷰티 브랜드가 해외 인기 제품의 차별화 포인트를 활용하면 시장 공백을 효과적으로 공략할 수 있습니다."

        return jsonify({
            "success": True,
            "title": title,
            "points": points[:6],
            "summary": summary,
        })

    except Exception as e:
        print(f"Error in whitespace_category: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "model": MODEL_NAME, "device": DEVICE, "port": 5007})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5007, debug=False)
