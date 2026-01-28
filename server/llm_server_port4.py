"""
LLM Inference Server GPU4 for AMORE CLUE Dashboard
Uses EXAONE-3.5-7.8B-Instruct on cuda:4
Endpoints: keyword-why (dedicated)
"""
import os
import json
import re
import torch
import setproctitle
import threading
import time
import gc
setproctitle.setproctitle("wook-llm-port4")
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)

# ===== CUDA Error Handling =====
inference_semaphore = threading.Semaphore(1)
MAX_RETRIES = 3  # 더 많은 재시도
CUDA_ERROR_COUNT = 0
MAX_CUDA_ERRORS = 5

def reset_cuda_state():
    """CUDA 상태 초기화"""
    global CUDA_ERROR_COUNT
    try:
        torch.cuda.empty_cache()
        gc.collect()
        print("[CUDA] Memory cache cleared")
    except Exception as e:
        print(f"[CUDA] Cache clear failed: {e}")
    CUDA_ERROR_COUNT += 1
    if CUDA_ERROR_COUNT >= MAX_CUDA_ERRORS:
        print(f"[WARNING] CUDA errors exceeded {MAX_CUDA_ERRORS}. Server restart recommended.")

# GPU 설정 - GPU 4 사용
DEVICE = "cuda:4"
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
print("Model loaded successfully on GPU4!")


SYSTEM_PROMPT = """당신은 글로벌 K-뷰티(K-Beauty) 시장 분석 및 화장품 산업 트렌드 전문가입니다.
아모레퍼시픽, LG생활건강 등 한국 화장품 기업의 글로벌 전략을 자문하는 수준의 전문성을 갖추고 있습니다.
주어진 데이터를 바탕으로 심층적이고 전문적인 분석을 제공하되, 데이터에 나타나지 않는 시장 맥락, 소비자 심리, 산업 동향까지 종합적으로 고려하여 풍부한 인사이트를 제공합니다.
반드시 한국어로만 답변하세요."""


def generate_response(prompt: str, max_new_tokens: int = 1024) -> str:
    """Generate a response from the LLM with CUDA error handling"""
    global CUDA_ERROR_COUNT

    acquired = inference_semaphore.acquire(timeout=120)
    if not acquired:
        raise RuntimeError("Inference timeout: too many concurrent requests")

    try:
        for attempt in range(MAX_RETRIES + 1):
            try:
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
                        temperature=0.8,  # 더 높은 temperature로 안정성 향상
                        top_p=0.85,
                        top_k=40,
                        do_sample=True,
                        repetition_penalty=1.02,  # 더 낮은 penalty
                    )

                generated = outputs[0][inputs["input_ids"].shape[1]:]
                response = tokenizer.decode(generated, skip_special_tokens=True)
                CUDA_ERROR_COUNT = max(0, CUDA_ERROR_COUNT - 1)
                return response.strip()

            except RuntimeError as e:
                error_msg = str(e)
                is_cuda_error = "CUDA" in error_msg or "device-side assert" in error_msg or "out of memory" in error_msg.lower()
                is_prob_error = "probability tensor" in error_msg or "inf" in error_msg or "nan" in error_msg

                if is_cuda_error or is_prob_error:
                    print(f"[INFERENCE ERROR] Attempt {attempt + 1}/{MAX_RETRIES + 1}: {error_msg[:100]}")
                    reset_cuda_state()
                    if attempt < MAX_RETRIES:
                        time.sleep(3)  # 더 긴 대기
                        continue
                    else:
                        raise RuntimeError(f"Inference error after {MAX_RETRIES + 1} attempts")
                else:
                    raise
    finally:
        inference_semaphore.release()
        torch.cuda.empty_cache()


def clean_text(text: str) -> str:
    """Remove markdown formatting from LLM output"""
    text = text.replace("**", "").replace("*", "")
    text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = text.replace("``", "").replace("`", "")
    text = re.sub(r'^\s*[-*+]\s+', '• ', text, flags=re.MULTILINE)
    return text.strip()


@app.route("/api/llm/keyword-why", methods=["POST"])
def keyword_why():
    """키워드가 왜 트렌드인지 분석 (GPU 4 전용)"""
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

        explanation = re.sub(r'\[설명\]|\[핵심\s*요인\]', '', explanation).strip()
        key_factors = [re.sub(r'\[설명\]|\[핵심\s*요인\]', '', f).strip() for f in key_factors]
        key_factors = [f for f in key_factors if len(f) > 3]

        return jsonify({"success": True, "explanation": explanation, "keyFactors": key_factors[:5]})

    except Exception as e:
        print(f"Error in keyword_why: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/category-trend", methods=["POST"])
def category_trend():
    """카테고리 전체 키워드 경향성 기반 트렌드 분석 (Port 7에서 이동)"""
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


@app.route("/api/llm/kbeauty-trends", methods=["POST"])
def kbeauty_trends():
    """K-Beauty 신제품 동향 AI 분석 (amore_trend_db 데이터 기반)"""
    try:
        data = request.json
        category = data.get("category", "All")
        brand_summaries = data.get("brandSummaries", [])
        trends = data.get("trends", {})
        sample_new_products = data.get("sampleNewProducts", [])
        sample_best_sellers = data.get("sampleBestSellers", [])

        # 브랜드별 신제품 요약
        brand_summary_text = ""
        for b in brand_summaries[:7]:
            brand_name = b.get("brand", "")
            new_count = b.get("newCount", 0)
            best_count = b.get("bestCount", 0)
            new_products = b.get("newProducts", [])[:3]
            products_text = ", ".join([p.get("name", "")[:30] for p in new_products])
            brand_summary_text += f"- {brand_name}: 신제품 {new_count}개, 베스트셀러 {best_count}개\n  대표 신제품: {products_text}\n"

        # 인기 성분 TOP 5
        ingredients = trends.get("ingredients", [])[:5]
        ingredients_text = "\n".join([f"- {i.get('name', '')}: 신제품 {i.get('new', 0)}개에서 사용" for i in ingredients])

        # 피부 고민 TOP 5
        concerns = trends.get("concerns", [])[:5]
        concerns_text = "\n".join([f"- {c.get('name', '')}: {c.get('new', 0)}개 제품" for c in concerns])

        # 효과/기능 TOP 5
        benefits = trends.get("benefits", [])[:5]
        benefits_text = "\n".join([f"- {bf.get('name', '')}: {bf.get('new', 0)}개 제품" for bf in benefits])

        # 신제품 샘플
        sample_products_text = ""
        for p in sample_new_products[:8]:
            name = p.get("name", "")[:40]
            brand = p.get("brand", "")
            key_ings = ", ".join((p.get("keyIngredients", []) or [])[:3])
            cons = ", ".join((p.get("concerns", []) or [])[:2])
            sample_products_text += f"- [{brand}] {name}\n  주요성분: {key_ings or '정보없음'} | 타겟고민: {cons or '정보없음'}\n"

        prompt = f"""당신은 글로벌 K-Beauty 시장 분석 전문가입니다.
다음은 MongoDB Atlas에 수집된 7개 K-Beauty 브랜드(TIRTIR, Medicube, Beauty of Joseon, Laneige, COSRX, SKIN1004, BIODANCE)의 실제 신제품 동향 데이터입니다.

## 분석 대상 카테고리: {category}

## 브랜드별 현황
{brand_summary_text}

## 신제품에서 가장 많이 사용된 성분 TOP 5
{ingredients_text}

## 신제품이 타겟하는 피부 고민 TOP 5
{concerns_text}

## 신제품의 주요 효과/기능 TOP 5
{benefits_text}

## 대표 신제품 샘플 (8개)
{sample_products_text}

---

위 실제 데이터를 기반으로 K-Beauty 신제품 동향을 종합 분석해주세요.

다음 형식으로 정확히 답변해주세요:

[브랜드별 전략]
각 브랜드의 신제품 전략 방향을 1-2문장씩 분석 (4개 브랜드)

[성분 트렌드]
현재 K-Beauty 신제품에서 주목받는 성분 트렌드 3가지 (각 1-2문장)

[기능 트렌드]
소비자들이 원하는 주요 기능/효과 트렌드 3가지 (각 1-2문장)

[시장 전망]
K-Beauty 신제품 시장의 향후 전망과 기회 (2-3문장)"""

        response = generate_response(prompt, max_new_tokens=1200)

        # 응답 파싱
        brand_strategies = []
        ingredient_trends = []
        function_trends = []
        market_outlook = ""
        current_section = None

        lines = response.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(kw in line for kw in ["[브랜드별 전략]", "브랜드별 전략", "## 브랜드"]):
                current_section = "brand"
                continue
            elif any(kw in line for kw in ["[성분 트렌드]", "성분 트렌드", "## 성분"]):
                current_section = "ingredient"
                continue
            elif any(kw in line for kw in ["[기능 트렌드]", "기능 트렌드", "## 기능"]):
                current_section = "function"
                continue
            elif any(kw in line for kw in ["[시장 전망]", "시장 전망", "## 시장"]):
                current_section = "market"
                continue

            clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
            if clean_line and len(clean_line) > 5:
                if current_section == "brand" and len(brand_strategies) < 4:
                    brand_strategies.append(clean_text(clean_line))
                elif current_section == "ingredient" and len(ingredient_trends) < 3:
                    ingredient_trends.append(clean_text(clean_line))
                elif current_section == "function" and len(function_trends) < 3:
                    function_trends.append(clean_text(clean_line))
                elif current_section == "market":
                    market_outlook += clean_line + " "

        # Fallback
        if not brand_strategies:
            brand_strategies = [
                f"{brand_summaries[0].get('brand', 'TIRTIR')}: 글로벌 시장 확대를 위한 다양한 신제품 라인업 구축",
                f"{brand_summaries[1].get('brand', 'Medicube')}: 더마 코스메틱 기반 기능성 스킨케어 강화",
                f"{brand_summaries[2].get('brand', 'COSRX')}: 민감 피부 솔루션 중심 제품 확대",
                f"{brand_summaries[3].get('brand', 'Laneige')}: 프리미엄 수분 케어 라인 강화"
            ]
        if not ingredient_trends:
            ing_names = [i.get('name', '') for i in ingredients[:3]]
            ingredient_trends = [
                f"{ing_names[0] if ing_names else 'Hyaluronic Acid'}: K-Beauty 핵심 보습 성분으로 자리매김",
                f"{ing_names[1] if len(ing_names) > 1 else 'Niacinamide'}: 멀티 기능성 성분으로 인기 상승",
                f"{ing_names[2] if len(ing_names) > 2 else 'Centella'}: 진정 케어 트렌드 주도"
            ]
        if not function_trends:
            concern_names = [c.get('name', '') for c in concerns[:3]]
            function_trends = [
                f"{concern_names[0] if concern_names else 'Hydration'}: 수분 케어 수요 지속 증가",
                f"{concern_names[1] if len(concern_names) > 1 else 'Brightening'}: 톤업/브라이트닝 제품 인기",
                f"{concern_names[2] if len(concern_names) > 2 else 'Anti-aging'}: 안티에이징 관심 확대"
            ]
        if not market_outlook.strip():
            market_outlook = f"K-Beauty 시장은 {ingredients[0].get('name', '혁신 성분')} 등 고효능 성분 중심의 기능성 제품이 주도하고 있습니다. 7개 브랜드 모두 글로벌 시장을 타겟으로 신제품을 출시하며, 특히 {concerns[0].get('name', '보습')} 관련 제품 수요가 높습니다."

        return jsonify({
            "success": True,
            "category": category,
            "brandStrategies": brand_strategies[:4],
            "ingredientTrends": ingredient_trends[:3],
            "functionTrends": function_trends[:3],
            "comparisonPoints": [
                "각 브랜드별 차별화된 성분 전략 보유",
                "기능성 중심의 제품 라인업 강화",
                "글로벌 시장 타겟 제품 확대"
            ],
            "marketOutlook": market_outlook.strip()
        })

    except Exception as e:
        print(f"Error in kbeauty_trends: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "model": MODEL_NAME, "device": DEVICE, "port": 5004})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=False)
