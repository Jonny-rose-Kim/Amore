"""
LLM Inference Server GPU5 for AMORE CLUE Dashboard
Uses EXAONE-3.5-7.8B-Instruct on cuda:5
Endpoints: keyword-why (왜 트렌드인가 분석)
"""
import os
import json
import re
import torch
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)

# GPU 설정
DEVICE = "cuda:5"
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
print("Model loaded successfully on GPU5!")


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


@app.route("/api/llm/keyword-why", methods=["POST"])
def keyword_why():
    """키워드가 왜 트렌드인지 분석"""
    try:
        data = request.json
        keyword = data.get("keyword", "")
        country = data.get("country", "usa")
        category = data.get("category", "Skincare")
        trend_level = data.get("trendLevel", "Actionable")
        score = data.get("score", 75)
        signals = data.get("signals", {})
        positive_keywords = data.get("positiveKeywords", [])
        negative_keywords = data.get("negativeKeywords", [])

        country_names = {
            "usa": "미국", "japan": "일본", "singapore": "싱가포르",
            "malaysia": "말레이시아", "indonesia": "인도네시아"
        }
        country_name = country_names.get(country, "해외")

        signals_text = ""
        if signals:
            signals_text = f"SNS 신호: {signals.get('SNS', 0)}%, Retail 신호: {signals.get('Retail', 0)}%, Review 신호: {signals.get('Review', 0)}%"

        pos_keywords_text = ""
        if positive_keywords:
            pos_keywords_text = ", ".join([k if isinstance(k, str) else k.get('keyword', '') for k in positive_keywords[:6]])

        neg_keywords_text = ""
        if negative_keywords:
            neg_keywords_text = ", ".join([k if isinstance(k, str) else k.get('keyword', '') for k in negative_keywords[:6]])

        # 리뷰 데이터 섹션 구성
        review_section = ""
        if pos_keywords_text or neg_keywords_text:
            review_section = f"""
[리뷰 데이터 분석]
이 키워드와 관련된 리뷰에서 자주 언급되는 키워드들입니다:
- 긍정 리뷰에서 자주 언급: {pos_keywords_text if pos_keywords_text else '데이터 없음'}
- 부정 리뷰에서 자주 언급: {neg_keywords_text if neg_keywords_text else '데이터 없음'}
※ 위 리뷰 데이터를 참고하여 소비자들이 이 키워드에 대해 어떤 점을 좋아하고 어떤 점을 불편해하는지 분석에 반영해주세요."""

        prompt = f"""다음은 {country_name} {category} 시장에서 "{keyword}" 키워드의 트렌드 분석 데이터입니다.

[키워드 데이터]
- 키워드: {keyword}
- 국가: {country_name}
- 카테고리: {category}
- 트렌드 레벨: {trend_level}
- 종합 점수: {score}점
- 신호 지표: {signals_text}
{review_section}

위 데이터를 바탕으로, 이 키워드가 왜 현재 트렌드로 부상하고 있는지 종합적으로 분석해주세요. 특히 리뷰 데이터가 있다면 소비자들의 실제 반응을 반영해주세요.

다음 형식으로 정확히 답변해주세요:

[설명]
이 키워드가 트렌드인 이유를 5-7문장으로 상세하게 분석해주세요. 소비자 니즈, 시장 맥락, 글로벌 뷰티 트렌드와의 연관성, 신호 지표 해석을 포함해주세요.

[핵심요인]
이 키워드가 트렌드인 핵심 요인 4-5개를 각각 한 줄씩 작성해주세요. 각 요인은 구체적이고 데이터에 근거해야 합니다."""

        response = generate_response(prompt, max_new_tokens=800)

        explanation = ""
        key_factors = []
        current_section = None
        explanation_lines = []

        lines = response.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if any(kw in line for kw in ["[설명]", "설명:", "## 설명"]):
                current_section = "explanation"
                rest = re.sub(r'^\[설명\]|^설명:|^## 설명', '', line).strip()
                if rest and len(rest) > 5:
                    explanation_lines.append(rest)
            elif any(kw in line for kw in ["[핵심요인]", "핵심요인:", "## 핵심요인", "핵심 요인", "[핵심 요인]"]):
                current_section = "factors"
                rest = re.sub(r'^\[핵심\s*요인\]|^핵심\s*요인:|^## 핵심\s*요인', '', line).strip()
                if rest and len(rest) > 3:
                    key_factors.append(clean_text(rest))
            elif current_section == "explanation":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 5:
                    explanation_lines.append(clean_line)
            elif current_section == "factors":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 3:
                    key_factors.append(clean_text(clean_line))

        explanation = clean_text(" ".join(explanation_lines)) if explanation_lines else ""
        if not explanation:
            explanation = clean_text(response[:500]) if response else f"{keyword}는 {country_name} {category} 시장에서 주목받는 트렌드 키워드입니다."
        if not key_factors:
            key_factors = [
                "SNS 언급량 급증으로 소비자 관심도 상승",
                f"{country_name} 시장에서의 높은 검색 트래픽",
                "리뷰 긍정 비율 증가",
                "리테일 채널에서의 판매량 상승 추세"
            ]

        # Clean up any remaining section markers
        explanation = re.sub(r'\[설명\]|\[핵심\s*요인\]', '', explanation).strip()
        key_factors = [re.sub(r'\[설명\]|\[핵심\s*요인\]', '', f).strip() for f in key_factors]
        key_factors = [f for f in key_factors if len(f) > 3]

        return jsonify({"success": True, "explanation": explanation, "keyFactors": key_factors[:5]})

    except Exception as e:
        print(f"Error in keyword_why: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/review-summary", methods=["POST"])
def review_summary():
    """리뷰 AI 분석 요약 생성"""
    try:
        data = request.json
        keyword = data.get("keyword", "")
        country = data.get("country", "usa")
        positive_keywords = data.get("positiveKeywords", [])
        negative_keywords = data.get("negativeKeywords", [])
        positive_count = data.get("positiveCount", 0)
        negative_count = data.get("negativeCount", 0)
        is_combination = data.get("isCombination", False)

        country_names = {
            "usa": "미국", "japan": "일본", "singapore": "싱가포르",
            "malaysia": "말레이시아", "indonesia": "인도네시아"
        }
        country_name = country_names.get(country, "해외")

        pos_list = ", ".join([f"{k['keyword']}({k['count']}건)" for k in positive_keywords[:8]])
        neg_list = ", ".join([f"{k['keyword']}({k['count']}건)" for k in negative_keywords[:8]])

        total = positive_count + negative_count
        pos_ratio = round(positive_count / total * 100, 1) if total > 0 else 50

        item_type = "꿀조합(성분+제형+효과 조합) 키워드" if is_combination else "트렌드 키워드"

        prompt = f"""다음은 {country_name} 시장에서 "{keyword}" {item_type}에 대한 소비자 리뷰 분석 데이터입니다.

[리뷰 데이터 현황]
- 전체 리뷰 수: {total}건
- 긍정 리뷰: {positive_count}건 ({pos_ratio}%)
- 부정 리뷰: {negative_count}건 ({round(100 - pos_ratio, 1)}%)
- 긍정 리뷰 주요 키워드: {pos_list}
- 부정 리뷰 주요 키워드: {neg_list}

위 데이터를 바탕으로 가독성 좋은 형식으로 분석해주세요. 반드시 아래 형식을 정확히 따라주세요:

[소비자반응]
• 긍정 요인: 긍정 키워드 데이터를 바탕으로 소비자들이 만족하는 핵심 포인트 2-3가지를 구체적 수치와 함께 설명
• 부정 요인: 부정 키워드 데이터를 바탕으로 소비자들이 불만족하는 포인트 1-2가지를 구체적 수치와 함께 설명

[핵심인사이트]
1. 첫 번째 인사이트 (데이터 근거 포함)
2. 두 번째 인사이트 (데이터 근거 포함)
3. 세 번째 인사이트 (데이터 근거 포함)

[시장전망]
{country_name} 시장에서 "{keyword}" 키워드의 향후 전망과 K-뷰티 브랜드 관점에서의 기회/주의점을 2-3문장으로 요약

[키워드] 핵심 인사이트 키워드 4개를 쉼표로 구분 (각 2-6자)"""

        response = generate_response(prompt, max_new_tokens=1500)
        response = clean_text(response)

        # Parse response
        consumer_response = ""
        insight_list = []
        market_outlook = ""
        keywords = []
        sentiment_ratio = pos_ratio / 100

        lines = response.split("\n")
        current_section = None
        consumer_lines = []
        insight_lines = []
        outlook_lines = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(kw in line for kw in ["[소비자반응]", "소비자반응:", "소비자 반응"]):
                current_section = "consumer"
                continue
            elif any(kw in line for kw in ["[핵심인사이트]", "핵심인사이트:", "핵심 인사이트"]):
                current_section = "insights"
                continue
            elif any(kw in line for kw in ["[시장전망]", "시장전망:", "시장 전망"]):
                current_section = "outlook"
                continue
            elif any(kw in line for kw in ["[키워드]", "키워드:"]):
                rest = re.sub(r'^\[키워드\]|^키워드:', '', line).strip()
                if rest:
                    keywords = [k.strip() for k in rest.split(",") if k.strip()][:5]
                current_section = None
                continue

            if current_section == "consumer":
                consumer_lines.append(line)
            elif current_section == "insights":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 5:
                    insight_lines.append(clean_line)
            elif current_section == "outlook":
                outlook_lines.append(line)

        consumer_response = "\n".join(consumer_lines) if consumer_lines else ""
        insight_list = insight_lines[:4] if insight_lines else []
        market_outlook = " ".join(outlook_lines) if outlook_lines else ""

        summary_parts = []
        if consumer_response:
            summary_parts.append(f"소비자 반응\n{consumer_response}")
        if insight_list:
            insights_text = "\n".join([f"{i+1}. {ins}" for i, ins in enumerate(insight_list)])
            summary_parts.append(f"핵심 인사이트\n{insights_text}")
        if market_outlook:
            summary_parts.append(f"시장 전망\n{clean_text(market_outlook)}")

        summary = "\n\n".join(summary_parts) if summary_parts else ""

        if not summary:
            summary = f"소비자 반응\n• 긍정 비율 {pos_ratio}%로 전반적으로 호의적인 반응\n• 주요 긍정 키워드: {pos_list[:100]}\n\n핵심 인사이트\n1. {keyword}에 대한 소비자 관심도 상승\n2. 리뷰 데이터 기반 시장 잠재력 확인\n\n시장 전망\n{country_name} 시장에서 {keyword} 키워드의 성장 가능성이 높습니다."
        if not keywords:
            keywords = ["효과 우수", "보습력", "가성비", "만족도"]

        return jsonify({
            "success": True,
            "summary": summary,
            "insights": keywords,
            "sentimentRatio": sentiment_ratio,
        })

    except Exception as e:
        print(f"Error in review_summary: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/category-trend", methods=["POST"])
def category_trend():
    """카테고리 전체 키워드 경향성 기반 트렌드 분석"""
    try:
        data = request.json
        country = data.get("country", "usa")
        category = data.get("category", "Skincare")
        top_keywords = data.get("topKeywords", [])

        country_names = {
            "usa": "미국", "japan": "일본", "singapore": "싱가포르",
            "malaysia": "말레이시아", "indonesia": "인도네시아"
        }
        country_name = country_names.get(country, "해외")

        keywords_text = ""
        if top_keywords:
            keywords_text = "\n".join([f"  - {k.get('keyword', '')} (점수: {k.get('score', 0)}, 트렌드: {k.get('trendLevel', '')})" for k in top_keywords[:15]])

        prompt = f"""다음은 {country_name} {category} 카테고리의 전체 키워드 경향성 데이터입니다.

[카테고리 데이터]
- 국가: {country_name}
- 카테고리: {category}
- 상위 키워드 목록:
{keywords_text}

위 데이터를 바탕으로, {country_name} {category} 카테고리의 전체적인 트렌드 경향성을 종합 분석해주세요.

다음 형식으로 정확히 답변해주세요:

[설명]
이 카테고리의 전반적인 트렌드 방향성을 5-7문장으로 상세하게 분석해주세요. 주요 키워드 간의 관계, 소비자 니즈 변화, 시장 흐름을 포함해주세요.

[핵심요인]
이 카테고리 트렌드의 핵심 동인 4-5개를 각각 한 줄씩 작성해주세요."""

        response = generate_response(prompt, max_new_tokens=800)

        explanation = ""
        key_factors = []
        current_section = None
        explanation_lines = []

        lines = response.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if any(kw in line for kw in ["[설명]", "설명:", "## 설명"]):
                current_section = "explanation"
                rest = re.sub(r'^\[설명\]|^설명:|^## 설명', '', line).strip()
                if rest and len(rest) > 5:
                    explanation_lines.append(rest)
            elif any(kw in line for kw in ["[핵심요인]", "핵심요인:", "## 핵심요인", "핵심 요인", "[핵심 요인]"]):
                current_section = "factors"
                rest = re.sub(r'^\[핵심\s*요인\]|^핵심\s*요인:|^## 핵심\s*요인', '', line).strip()
                if rest and len(rest) > 3:
                    key_factors.append(clean_text(rest))
            elif current_section == "explanation":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 5:
                    explanation_lines.append(clean_line)
            elif current_section == "factors":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 3:
                    key_factors.append(clean_text(clean_line))

        explanation = clean_text(" ".join(explanation_lines)) if explanation_lines else ""
        if not explanation:
            explanation = f"{country_name} {category} 카테고리는 현재 다양한 혁신 성분과 기술이 주목받고 있습니다."
        if not key_factors:
            key_factors = [
                "고효능 성분에 대한 소비자 관심 증가",
                "클린뷰티 트렌드 확산",
                "SNS 기반 뷰티 트렌드 가속화",
                "K-뷰티 기술력에 대한 글로벌 신뢰도 상승"
            ]

        explanation = re.sub(r'\[설명\]|\[핵심\s*요인\]', '', explanation).strip()
        key_factors = [re.sub(r'\[설명\]|\[핵심\s*요인\]', '', f).strip() for f in key_factors]
        key_factors = [f for f in key_factors if len(f) > 3]

        return jsonify({"success": True, "explanation": explanation, "keyFactors": key_factors[:5]})

    except Exception as e:
        print(f"Error in category_trend: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "model": MODEL_NAME, "device": DEVICE, "port": 5005})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=False)
