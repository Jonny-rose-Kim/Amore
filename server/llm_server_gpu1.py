"""
LLM Inference Server GPU1 for AMORE CLUE Dashboard
Uses EXAONE-3.5-7.8B-Instruct on cuda:1
Endpoints: plc-prediction, category-prediction
"""
import os
import json
import re
import torch
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)

# GPU 설정
DEVICE = "cuda:1"
MODEL_NAME = "LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct"

print(f"Loading model: {MODEL_NAME} on {DEVICE}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map=DEVICE,
    trust_remote_code=True,
)
model.eval()
print("Model loaded successfully on GPU1!")


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
    """PLC 이론 기반 향후 6-12개월 예측"""
    try:
        data = request.json
        keyword = data.get("keyword", "")
        trend_level = data.get("trendLevel", "Actionable")
        current_score = data.get("currentScore", 75)
        sns_growth = data.get("snsGrowth", 30)
        retail_signal = data.get("retailSignal", 70)
        category = data.get("category", "Skincare")

        prompt = f"""당신은 제품 수명 주기(PLC: Product Life Cycle) 이론 전문가입니다.

PLC 이론에 따르면 트렌드 키워드는 다음 4단계를 거칩니다:
- 도입기(Introduction): 새로운 트렌드 등장, 낮은 인지도, 소수 얼리어답터 관심
- 성장기(Growth): 빠른 확산, SNS 바이럴, 리뷰 급증, 시장 점유율 확대
- 성숙기(Maturity): 대중화 완료, 성장률 둔화, 경쟁 심화, 안정적 수요
- 쇠퇴기(Decline): 관심 감소, 새로운 트렌드로 대체, 니치 시장으로 축소

다음 키워드의 PLC 단계를 분석해주세요:

[키워드 데이터]
- 키워드: {keyword}
- 트렌드 레벨: {trend_level}
- 현재 종합 점수: {current_score}/100
- SNS 성장률: {sns_growth}%
- 리테일 신호 강도: {retail_signal}%
- 카테고리: {category}

다음 형식으로 정확히 답변해주세요:

[현재단계] 도입기/성장기/성숙기/쇠퇴기 중 하나
[6개월예측] 도입기/성장기/성숙기/쇠퇴기 중 하나
[12개월예측] 도입기/성장기/성숙기/쇠퇴기 중 하나
[월별점수] 현재부터 12개월 후까지 13개의 예측 점수를 쉼표로 구분 (0-100 범위)
[분석] PLC 관점에서 이 키워드의 향후 전망을 3-5문장으로 분석해주세요."""

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
                # Extract numbers from the line
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
    """카테고리 전체의 AI 기반 향후 6-12개월 예측"""
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

        prompt = f"""당신은 제품 수명 주기(PLC: Product Life Cycle) 이론 전문가입니다.

PLC 이론에 따르면 뷰티 카테고리 트렌드는 다음 4단계를 거칩니다:
- 도입기(Introduction): 새로운 트렌드 등장, 얼리어답터 중심 관심
- 성장기(Growth): 빠른 확산, SNS 바이럴, 시장 점유율 확대
- 성숙기(Maturity): 대중화 완료, 성장률 둔화, 안정적 수요
- 쇠퇴기(Decline): 관심 감소, 새로운 트렌드로 대체

다음 카테고리의 전체적인 PLC 단계를 분석해주세요:

[카테고리 데이터]
- 국가: {country_name}
- 카테고리: {category}
- 카테고리 평균 점수: {avg_score}/100
- 주요 키워드: {keywords_summary}

다음 형식으로 정확히 답변해주세요:

[현재단계] 도입기/성장기/성숙기/쇠퇴기 중 하나
[6개월예측] 도입기/성장기/성숙기/쇠퇴기 중 하나
[12개월예측] 도입기/성장기/성숙기/쇠퇴기 중 하나
[월별점수] 현재부터 12개월 후까지 13개의 예측 점수를 쉼표로 구분 (0-100 범위)
[분석] 이 카테고리의 향후 전망을 3-5문장으로 분석해주세요."""

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


@app.route("/api/llm/whitespace-product", methods=["POST"])
def whitespace_product():
    """WhiteSpace 제품 비교 AI 분석 + Agent Insight"""
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

        # Parse response
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

        # Strip leftover section headers from content
        def strip_headers(text):
            return re.sub(r'^\[[\w\s]+\]\s*', '', text).strip()

        overseas_summary = strip_headers(overseas_summary)
        domestic_summary = strip_headers(domestic_summary)
        overall_summary = strip_headers(overall_summary)
        diff_points = [strip_headers(p) for p in diff_points if not re.match(r'^\[[\w\s]+\]$', p.strip())]

        # Fallbacks
        if not overseas_summary:
            overseas_summary = f"{overseas.get('name', '해외 제품')}은(는) {overseas.get('brand', '')}의 대표 제품으로, {country_name} {category} 시장에서 높은 인기를 얻고 있습니다. 해외 소비자들에게 검증된 성분과 제형으로 안정적인 효과를 제공합니다."
        if not domestic_summary:
            domestic_summary = f"{domestic.get('name', '한국 제품')}은(는) {domestic.get('brand', '')}의 인기 제품으로, 한국 시장에서 강력한 입지를 구축하고 있습니다. 국내 소비자들의 피부 특성에 맞춘 맞춤형 포뮬레이션으로 높은 평가를 받고 있습니다."
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


@app.route("/api/llm/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "model": MODEL_NAME, "device": DEVICE, "port": 5002})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)
