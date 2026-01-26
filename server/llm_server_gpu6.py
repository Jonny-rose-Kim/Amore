"""
LLM Inference Server GPU6 for AMORE CLUE Dashboard
Uses EXAONE-3.5-7.8B-Instruct on cuda:6
Endpoints: plc-prediction, category-prediction (향후 예측)
"""
import os
import json
import re
import torch
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)

# GPU 설정
DEVICE = "cuda:6"
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
print("Model loaded successfully on GPU6!")


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


@app.route("/api/llm/plc-prediction", methods=["POST"])
def plc_prediction():
    """다중 프레임워크 기반 향후 6-12개월 예측 (PLC + Trend Diffusion + Consumer Demand)"""
    try:
        data = request.json
        keyword = data.get("keyword", "")
        trend_level = data.get("trendLevel", "Actionable")
        current_score = data.get("currentScore", 75)
        sns_growth = data.get("snsGrowth", 30)
        retail_signal = data.get("retailSignal", 70)
        category = data.get("category", "Skincare")

        prompt = f"""당신은 뷰티 키워드 트렌드를 예측하는 시니어 애널리스트입니다.
단순 PLC(Product Life Cycle) 이론만으로 판단하지 말고, 아래 3가지 프레임을 함께 사용해 복합적으로 예측하세요.

[프레임 A: PLC 단계(기본)]
- 도입기: 얼리어답터 중심, 낮은 인지도, 혁신 소비자 타겟
- 성장기: 빠른 확산, SNS 바이럴, 시장 점유율 확대, 경쟁자 진입 시작
- 성숙기: 대중화 완료, 성장률 둔화, 경쟁 심화, 안정적 수요
- 쇠퇴기: 관심 감소, 새로운 트렌드로 대체, 니치 시장으로 축소

[프레임 B: 확산/가속(Trend Diffusion & Momentum)]
- 주요 키워드가 '단발성 버즈'인지 '루틴화/사용 맥락 확장'인지 구분
- SNS 반응과 리테일 반응이 함께 움직이면 수요형(지속), SNS만 과열이면 버즈형(단기)
- 인플루언서 주도 vs 일반 소비자 확산 여부 판단

[프레임 C: 수요 안정성 + 리스크(Consumer Demand & Risk)]
- 키워드가 상시 고민(장벽/진정/여드름/보습 등) 기반인지, 시즌/유행 기반인지 평가
- 자극/불만/피로감(과각질/과자극) 이슈가 커지는지 고려
- 경쟁/대체재 출현 속도를 고려 (급격한 성숙/하락 가능)
- 가격대비 효과 인식 변화 추적

[키워드 데이터]
- 키워드: {keyword}
- 트렌드 레벨: {trend_level}
- 현재 종합 점수: {current_score}/100
- SNS 성장률: {sns_growth}%
- 리테일 신호 강도: {retail_signal}%
- 카테고리: {category}

판정 규칙(반드시 준수):
1) 점수 하나로 단계 결정 금지 - 키워드 특성, 확산/리테일 균형, 리스크 모두 반영
2) 월별점수는 항상 단조 증가/감소 금지 - 변곡점/피크/안정화 구간을 현실적으로 반영
3) SNS만 높고 Retail 낮으면 버즈 소멸 리스크, 둘 다 높으면 지속 성장 가능성 높음

다음 형식으로 정확히 답변해주세요:

[현재단계] 도입기/성장기/성숙기/쇠퇴기 중 하나
[6개월예측] 도입기/성장기/성숙기/쇠퇴기 중 하나
[12개월예측] 도입기/성장기/성숙기/쇠퇴기 중 하나
[월별점수] 현재부터 12개월 후까지 13개의 예측 점수를 쉼표로 구분 (0-100 범위)
[분석] 3-5문장으로 다음 포함: (a)성장/지속 드라이버 (b)하락/소멸 리스크 (c)조건부 시나리오"""

        response = generate_response(prompt, max_new_tokens=600)

        # Parse response
        current_phase = "성장기"
        prediction_6m = "성숙기"
        prediction_12m = "성숙기"
        monthly_scores = []
        explanation = ""

        lines = response.split("\n")
        explanation_lines = []
        current_section = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(kw in line for kw in ["[현재단계]", "현재단계:", "현재 단계"]):
                for phase in ["도입기", "성장기", "성숙기", "쇠퇴기"]:
                    if phase in line:
                        current_phase = phase
                        break
            elif any(kw in line for kw in ["[6개월예측]", "6개월예측:", "6개월 예측"]):
                for phase in ["도입기", "성장기", "성숙기", "쇠퇴기"]:
                    if phase in line:
                        prediction_6m = phase
                        break
            elif any(kw in line for kw in ["[12개월예측]", "12개월예측:", "12개월 예측"]):
                for phase in ["도입기", "성장기", "성숙기", "쇠퇴기"]:
                    if phase in line:
                        prediction_12m = phase
                        break
            elif any(kw in line for kw in ["[월별점수]", "월별점수:", "월별 점수"]):
                numbers = re.findall(r'\d+(?:\.\d+)?', line.split("]")[-1] if "]" in line else line.split(":")[-1])
                monthly_scores = [min(100, max(0, float(n))) for n in numbers[:13]]
                current_section = "scores"
            elif any(kw in line for kw in ["[분석]", "분석:", "## 분석"]):
                current_section = "explanation"
                rest = re.sub(r'^\[분석\]|^분석:|^## 분석', '', line).strip()
                if rest and len(rest) > 5:
                    explanation_lines.append(rest)
            elif current_section == "scores" and not monthly_scores:
                numbers = re.findall(r'\d+(?:\.\d+)?', line)
                if numbers:
                    monthly_scores = [min(100, max(0, float(n))) for n in numbers[:13]]
            elif current_section == "explanation":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 5:
                    explanation_lines.append(clean_line)

        explanation = clean_text(" ".join(explanation_lines)) if explanation_lines else ""

        # Generate fallback monthly scores if parsing failed
        if len(monthly_scores) < 13:
            base = current_score
            phase_map = {"도입기": "growth", "성장기": "peak", "성숙기": "stable", "쇠퇴기": "decline"}
            trend = phase_map.get(current_phase, "stable")

            monthly_scores = [base]
            for i in range(1, 13):
                if trend == "growth":
                    delta = 2.5 + (i * 0.3)
                elif trend == "peak":
                    delta = 1.5 - (i * 0.2) if i < 6 else -0.5
                elif trend == "stable":
                    delta = 0.5 - (i * 0.1)
                else:
                    delta = -1.5 - (i * 0.3)
                monthly_scores.append(min(100, max(10, monthly_scores[-1] + delta)))

        if not explanation:
            explanation = f"{keyword}는 현재 {current_phase} 단계에 있으며, 6개월 후 {prediction_6m}, 12개월 후 {prediction_12m} 단계로 진행될 것으로 예측됩니다."

        return jsonify({
            "success": True,
            "currentPhase": current_phase,
            "prediction6m": prediction_6m,
            "prediction12m": prediction_12m,
            "monthlyScores": monthly_scores[:13],
            "explanation": explanation,
        })

    except Exception as e:
        print(f"Error in plc_prediction: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/category-prediction", methods=["POST"])
def category_prediction():
    """카테고리 전체의 다중 프레임워크 기반 향후 6-12개월 예측"""
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
            keywords_summary = ", ".join([f"{k.get('keyword', '')}({k.get('score', 0)}점)" for k in top_keywords[:10]])

        prompt = f"""당신은 뷰티 카테고리 트렌드를 예측하는 시니어 애널리스트입니다.
단순 PLC(Product Life Cycle) 이론만으로 판단하지 말고, 아래 3가지 프레임을 함께 사용해 복합적으로 예측하세요.

[프레임 A: PLC 단계(기본)]
- 도입기: 얼리어답터 중심 관심, 혁신적 키워드 등장
- 성장기: 빠른 확산, SNS 바이럴, 시장 점유율 확대
- 성숙기: 대중화 완료, 성장률 둔화, 안정적 수요
- 쇠퇴기: 관심 감소, 새로운 트렌드로 대체

[프레임 B: 확산/가속(Trend Diffusion & Momentum)]
- 카테고리 내 주요 키워드들이 '단발성 버즈'인지 '루틴화/사용 맥락 확장'인지 구분
- SNS 반응과 리테일 반응이 함께 움직이면 수요형(지속), SNS만 과열이면 버즈형(단기)
- 카테고리 내 다양한 키워드의 트렌드 레벨 분포 고려 (Emerging 다수 vs Actionable/Mature 다수)

[프레임 C: 수요 안정성 + 리스크(Consumer Demand & Risk)]
- 카테고리가 상시 고민(장벽/진정/여드름/보습 등) 기반인지, 시즌/유행 기반인지 평가
- 자극/불만/피로감(과각질/과자극) 이슈가 커지는지 고려
- 경쟁/대체재 출현 속도를 고려 (급격한 성숙/하락 가능)
- 규제 환경 변화(성분 규제, 클린뷰티 기준 등) 리스크 반영

[카테고리 데이터]
- 국가: {country_name}
- 카테고리: {category}
- 카테고리 평균 점수: {avg_score}/100
- 주요 키워드: {keywords_summary}

판정 규칙(반드시 준수):
1) 점수 하나로 단계 결정 금지 - 키워드 구성, 확산/리테일 균형, 리스크 반영
2) 월별점수는 항상 단조 증가/감소 금지 - 변곡/피크 가능성 반영
3) 국가별 시장 특성(미국=성분주의, 일본=텍스처/기능, 동남아=기초스킨케어) 반영

다음 형식으로 정확히 답변해주세요:

[현재단계] 도입기/성장기/성숙기/쇠퇴기 중 하나
[6개월예측] 도입기/성장기/성숙기/쇠퇴기 중 하나
[12개월예측] 도입기/성장기/성숙기/쇠퇴기 중 하나
[월별점수] 현재부터 12개월 후까지 13개의 예측 점수를 쉼표로 구분 (0-100 범위)
[분석] 3-5문장으로 다음 포함: (a)성장/지속 드라이버 (b)하락/소멸 리스크 (c)조건부 시나리오"""

        response = generate_response(prompt, max_new_tokens=600)

        # Parse response
        current_phase = "성장기"
        prediction_6m = "성숙기"
        prediction_12m = "성숙기"
        monthly_scores = []
        explanation = ""

        lines = response.split("\n")
        explanation_lines = []
        current_section = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(kw in line for kw in ["[현재단계]", "현재단계:", "현재 단계"]):
                for phase in ["도입기", "성장기", "성숙기", "쇠퇴기"]:
                    if phase in line:
                        current_phase = phase
                        break
            elif any(kw in line for kw in ["[6개월예측]", "6개월예측:", "6개월 예측"]):
                for phase in ["도입기", "성장기", "성숙기", "쇠퇴기"]:
                    if phase in line:
                        prediction_6m = phase
                        break
            elif any(kw in line for kw in ["[12개월예측]", "12개월예측:", "12개월 예측"]):
                for phase in ["도입기", "성장기", "성숙기", "쇠퇴기"]:
                    if phase in line:
                        prediction_12m = phase
                        break
            elif any(kw in line for kw in ["[월별점수]", "월별점수:", "월별 점수"]):
                numbers = re.findall(r'\d+(?:\.\d+)?', line.split("]")[-1] if "]" in line else line.split(":")[-1])
                monthly_scores = [min(100, max(0, float(n))) for n in numbers[:13]]
                current_section = "scores"
            elif any(kw in line for kw in ["[분석]", "분석:", "## 분석"]):
                current_section = "explanation"
                rest = re.sub(r'^\[분석\]|^분석:|^## 분석', '', line).strip()
                if rest and len(rest) > 5:
                    explanation_lines.append(rest)
            elif current_section == "scores" and not monthly_scores:
                numbers = re.findall(r'\d+(?:\.\d+)?', line)
                if numbers:
                    monthly_scores = [min(100, max(0, float(n))) for n in numbers[:13]]
            elif current_section == "explanation":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 5:
                    explanation_lines.append(clean_line)

        explanation = clean_text(" ".join(explanation_lines)) if explanation_lines else ""

        # Generate fallback monthly scores if parsing failed
        if len(monthly_scores) < 13:
            base = avg_score
            phase_map = {"도입기": "growth", "성장기": "peak", "성숙기": "stable", "쇠퇴기": "decline"}
            trend = phase_map.get(current_phase, "stable")

            monthly_scores = [base]
            for i in range(1, 13):
                if trend == "growth":
                    delta = 2.0 + (i * 0.25)
                elif trend == "peak":
                    delta = 1.2 - (i * 0.15) if i < 6 else -0.3
                elif trend == "stable":
                    delta = 0.3 - (i * 0.05)
                else:
                    delta = -1.2 - (i * 0.2)
                monthly_scores.append(min(100, max(10, monthly_scores[-1] + delta)))

        if not explanation:
            explanation = f"{country_name} {category} 카테고리는 현재 {current_phase} 단계에 있으며, 6개월 후 {prediction_6m}, 12개월 후 {prediction_12m} 단계로 진행될 것으로 예측됩니다."

        return jsonify({
            "success": True,
            "currentPhase": current_phase,
            "prediction6m": prediction_6m,
            "prediction12m": prediction_12m,
            "monthlyScores": monthly_scores[:13],
            "explanation": explanation,
        })

    except Exception as e:
        print(f"Error in category_prediction: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/classify-review", methods=["POST"])
def classify_review():
    """리뷰 분류 (sentiment + reviewType)"""
    try:
        data = request.json
        prompt = data.get("prompt", "")
        max_tokens = data.get("max_tokens", 200)

        if not prompt:
            return jsonify({"success": False, "error": "prompt required"}), 400

        response = generate_response(prompt, max_new_tokens=max_tokens)

        return jsonify({
            "success": True,
            "response": clean_text(response),
        })

    except Exception as e:
        print(f"Error in classify_review: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/summarize-reviews", methods=["POST"])
def summarize_reviews():
    """리뷰 유형별 요약 생성"""
    try:
        data = request.json
        review_type = data.get("reviewType", "효과")
        sentiment = data.get("sentiment", "positive")
        reviews = data.get("reviews", [])

        if not reviews:
            return jsonify({"success": False, "error": "reviews required"}), 400

        sentiment_kr = "긍정적" if sentiment == "positive" else "부정적"
        reviews_text = "\n".join([f"- {r[:200]}" for r in reviews[:5]])

        prompt = f"""다음은 화장품에 대한 "{review_type}" 관련 {sentiment_kr} 리뷰들입니다.

리뷰 샘플:
{reviews_text}

위 리뷰들의 공통된 특징과 소비자 의견을 2-3문장으로 요약해주세요.
- 소비자들이 {review_type}에 대해 어떻게 평가하는지
- 주요 장점 또는 단점
- 전반적인 만족도"""

        response = generate_response(prompt, max_new_tokens=300)

        return jsonify({
            "success": True,
            "summary": clean_text(response),
            "reviewType": review_type,
            "sentiment": sentiment,
        })

    except Exception as e:
        print(f"Error in summarize_reviews: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/sns-analysis", methods=["POST"])
def sns_analysis():
    """Retail/SNS 인기 키워드 AI 분석 생성"""
    try:
        data = request.json
        country = data.get("country", "usa")
        category = data.get("category", "Skincare")
        platforms = data.get("platforms", [])

        country_names = {
            "usa": "미국", "japan": "일본", "singapore": "싱가포르",
            "malaysia": "말레이시아", "indonesia": "인도네시아"
        }
        country_name = country_names.get(country, "해외")

        retail_platforms = []
        sns_platforms = []
        retail_names = ["Amazon", "Sephora", "Ulta", "Olive Young", "Watsons", "Guardian", "Shopee", "Lazada", "Rakuten", "Qoo10"]
        sns_names = ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook", "Pinterest", "Reddit", "Threads"]

        for p in platforms[:8]:
            platform_name = p.get('platform', '')
            keywords_list = p.get("keywords", [])[:5]
            keywords_str = ", ".join([f"{k['name']}({k['value']}점)" for k in keywords_list])
            platform_data = f"• {platform_name}: {keywords_str}"

            if any(rn.lower() in platform_name.lower() for rn in retail_names):
                retail_platforms.append(platform_data)
            else:
                sns_platforms.append(platform_data)

        retail_info = "\n".join(retail_platforms) if retail_platforms else "• 데이터 없음"
        sns_info = "\n".join(sns_platforms) if sns_platforms else "• 데이터 없음"

        prompt = f"""다음은 {country_name} 시장의 {category} 카테고리에서 Retail과 SNS 채널별 인기 키워드 데이터입니다.

[Retail 채널 데이터]
{retail_info}

[SNS 채널 데이터]
{sns_info}

위 데이터를 Retail과 SNS를 명확히 구분하여 분석해주세요. 반드시 아래 형식을 정확히 따라주세요:

[Retail분석]
• 주요 트렌드: Retail 채널에서 가장 주목받는 키워드와 점수를 근거로 트렌드 설명 (2-3문장)
• 소비자 특성: Retail 구매자들의 관심사와 구매 패턴 분석 (1-2문장)
• 수치 근거: 상위 키워드의 점수와 순위를 구체적으로 언급

[SNS분석]
• 주요 트렌드: SNS 채널에서 가장 주목받는 키워드와 점수를 근거로 트렌드 설명 (2-3문장)
• 바이럴 포인트: SNS에서 화제가 되는 요소와 콘텐츠 유형 분석 (1-2문장)
• 수치 근거: 상위 키워드의 점수와 순위를 구체적으로 언급

[핵심인사이트]
1. Retail과 SNS 공통 트렌드 (수치 근거 포함)
2. Retail 고유 인사이트 (수치 근거 포함)
3. SNS 고유 인사이트 (수치 근거 포함)

[전략제안]
1. Retail 채널 활용 전략
2. SNS 채널 활용 전략
3. 통합 마케팅 전략"""

        response = generate_response(prompt, max_new_tokens=1200)
        response = clean_text(response)

        retail_analysis = ""
        sns_analysis_text = ""
        insights = []
        recommendations = []
        current_section = None
        retail_lines = []
        sns_lines = []
        insight_lines = []
        strategy_lines = []

        lines = response.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(kw in line for kw in ["[Retail분석]", "Retail분석:", "Retail 분석"]):
                current_section = "retail"
                continue
            elif any(kw in line for kw in ["[SNS분석]", "SNS분석:", "SNS 분석"]):
                current_section = "sns"
                continue
            elif any(kw in line for kw in ["[핵심인사이트]", "핵심인사이트:", "핵심 인사이트"]):
                current_section = "insights"
                continue
            elif any(kw in line for kw in ["[전략제안]", "전략제안:", "전략 제안"]):
                current_section = "strategy"
                continue

            if current_section == "retail":
                retail_lines.append(line)
            elif current_section == "sns":
                sns_lines.append(line)
            elif current_section == "insights":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 5:
                    insight_lines.append(clean_line)
            elif current_section == "strategy":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 5:
                    strategy_lines.append(clean_line)

        retail_analysis = clean_text(" ".join(retail_lines)) if retail_lines else ""
        sns_analysis_text = clean_text(" ".join(sns_lines)) if sns_lines else ""
        insights = [clean_text(i) for i in insight_lines if clean_text(i)][:5]
        recommendations = [clean_text(r) for r in strategy_lines if clean_text(r)][:4]

        if not retail_analysis:
            retail_analysis = f"{country_name} Retail 채널에서는 검증된 효과와 브랜드 신뢰도가 구매 결정에 중요한 역할을 합니다."
        if not sns_analysis_text:
            sns_analysis_text = f"{country_name} SNS 채널에서는 트렌디한 성분과 비주얼이 바이럴 확산에 핵심입니다."
        if not insights:
            insights = [
                f"{category} 카테고리 Retail/SNS 공통 성장 트렌드 확인",
                "Retail에서는 기능성 성분 키워드가 상위권 유지",
                "SNS에서는 비주얼/텍스처 관련 키워드 급상승"
            ]
        if not recommendations:
            recommendations = [
                "Retail: 검증된 효능 강조 마케팅 전략",
                "SNS: 트렌디 성분 활용 바이럴 콘텐츠 제작",
                "통합: Retail 후기를 SNS 콘텐츠로 재활용"
            ]

        summary = f"Retail 분석: {retail_analysis[:200]}{'...' if len(retail_analysis) > 200 else ''}\n\nSNS 분석: {sns_analysis_text[:200]}{'...' if len(sns_analysis_text) > 200 else ''}"

        return jsonify({
            "success": True,
            "summary": summary,
            "retailAnalysis": retail_analysis,
            "snsAnalysis": sns_analysis_text,
            "insights": insights,
            "recommendations": recommendations,
        })

    except Exception as e:
        print(f"Error in sns_analysis: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/whitespace-product", methods=["POST"])
def whitespace_product():
    """WhiteSpace 제품 비교 AI 분석"""
    try:
        data = request.json
        overseas = data.get("overseasProduct", {})
        domestic = data.get("domesticProduct", {})
        country = data.get("country", "usa")
        category = data.get("category", "Skincare")

        country_names = {
            "usa": "미국", "japan": "일본", "singapore": "싱가포르",
            "malaysia": "말레이시아", "indonesia": "인도네시아"
        }
        country_name = country_names.get(country, "해외")

        prompt = f"""다음은 {country_name} 인기 해외 제품과 한국 인기 제품의 비교 분석 요청입니다.

[해외 제품 정보]
- 제품명: {overseas.get('name', '')}
- 브랜드: {overseas.get('brand', '')}
- 카테고리: {category}
- 가격: {overseas.get('price', '')}
- 평점: {overseas.get('rating', '')}
- 리뷰수: {overseas.get('reviewCount', '')}

[한국 제품 정보]
- 제품명: {domestic.get('name', '')}
- 브랜드: {domestic.get('brand', '')}
- 카테고리: {category}
- 가격: {domestic.get('price', '')}
- 평점: {domestic.get('rating', '')}
- 리뷰수: {domestic.get('reviewCount', '')}

다음 형식으로 정확히 답변해주세요:

[해외제품요약]
{overseas.get('name', '')} 제품의 특성, 강점, 소비자 선호 포인트를 3-4문장으로 요약해주세요.

[한국제품요약]
{domestic.get('name', '')} 제품의 특성, 강점, 소비자 선호 포인트를 3-4문장으로 요약해주세요.

[차별화포인트]
한국 제품에는 없고 해외 제품에만 있는 차별화된 소구 포인트를 4-5개 제시해주세요. 각 포인트는 구체적이고 실행 가능한 인사이트여야 합니다.

[종합요약]
위 차별화 포인트를 종합하여 K-뷰티 브랜드가 해외 제품의 장점을 어떻게 활용할 수 있는지 2-3문장으로 요약해주세요."""

        response = generate_response(prompt, max_new_tokens=1200)

        overseas_summary = ""
        domestic_summary = ""
        diff_points = []
        overall_summary = ""
        current_section = None
        overseas_lines = []
        domestic_lines = []
        summary_lines = []

        lines = response.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(kw in line for kw in ["[해외제품요약]", "해외제품요약:", "해외 제품 요약"]):
                current_section = "overseas"
                rest = re.sub(r'^\[해외\s*제품\s*요약\]|^해외\s*제품\s*요약:', '', line).strip()
                if rest and len(rest) > 5:
                    overseas_lines.append(rest)
            elif any(kw in line for kw in ["[한국제품요약]", "한국제품요약:", "한국 제품 요약"]):
                current_section = "domestic"
                rest = re.sub(r'^\[한국\s*제품\s*요약\]|^한국\s*제품\s*요약:', '', line).strip()
                if rest and len(rest) > 5:
                    domestic_lines.append(rest)
            elif any(kw in line for kw in ["[차별화포인트]", "차별화포인트:", "차별화 포인트"]):
                current_section = "diff"
                rest = re.sub(r'^\[차별화\s*포인트\]|^차별화\s*포인트:', '', line).strip()
                if rest and len(rest) > 3:
                    diff_points.append(clean_text(rest))
            elif any(kw in line for kw in ["[종합요약]", "종합요약:", "종합 요약"]):
                current_section = "summary"
                rest = re.sub(r'^\[종합\s*요약\]|^종합\s*요약:', '', line).strip()
                if rest and len(rest) > 5:
                    summary_lines.append(rest)
            elif current_section:
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 3:
                    if current_section == "overseas":
                        overseas_lines.append(clean_line)
                    elif current_section == "domestic":
                        domestic_lines.append(clean_line)
                    elif current_section == "diff":
                        diff_points.append(clean_text(clean_line))
                    elif current_section == "summary":
                        summary_lines.append(clean_line)

        overseas_summary = clean_text(" ".join(overseas_lines)) if overseas_lines else ""
        domestic_summary = clean_text(" ".join(domestic_lines)) if domestic_lines else ""
        overall_summary = clean_text(" ".join(summary_lines)) if summary_lines else ""

        def strip_headers(text):
            return re.sub(r'^\[[\w\s]+\]\s*', '', text).strip()

        overseas_summary = strip_headers(overseas_summary)
        domestic_summary = strip_headers(domestic_summary)
        overall_summary = strip_headers(overall_summary)
        diff_points = [strip_headers(p) for p in diff_points if not re.match(r'^\[[\w\s]+\]$', p.strip())]

        if not overseas_summary:
            overseas_summary = f"{overseas.get('name', '해외 제품')}은(는) {overseas.get('brand', '')}의 대표 제품으로, {country_name} {category} 시장에서 높은 인기를 얻고 있습니다."
        if not domestic_summary:
            domestic_summary = f"{domestic.get('name', '한국 제품')}은(는) {domestic.get('brand', '')}의 인기 제품으로, 한국 시장에서 강력한 입지를 구축하고 있습니다."
        if not diff_points:
            diff_points = [
                f"{country_name} 소비자가 선호하는 고효능 활성 성분 배합",
                "해외 시장 특화 제형 기술 적용",
                f"{country_name} 현지 피부 고민에 최적화된 솔루션",
                "글로벌 클린뷰티 트렌드 반영한 성분 구성"
            ]
        if not overall_summary:
            overall_summary = f"해외 제품의 차별화된 소구 포인트를 K-뷰티의 기술력과 결합하면, {country_name} 시장에서 경쟁 우위를 확보할 수 있는 기회가 있습니다."

        return jsonify({
            "success": True,
            "overseasSummary": overseas_summary,
            "domesticSummary": domestic_summary,
            "agentInsight": {
                "title": "Agent Insight: 해외 제품의 차별화 소구 포인트",
                "points": diff_points[:5],
                "summary": overall_summary,
            }
        })

    except Exception as e:
        print(f"Error in whitespace_product: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Simple health check"""
    return jsonify({"status": "ok", "port": 5006})


@app.route("/api/llm/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "model": MODEL_NAME, "device": DEVICE, "port": 5006})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5006, debug=False)
