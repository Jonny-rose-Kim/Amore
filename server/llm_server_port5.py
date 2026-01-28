"""
LLM Inference Server GPU1 for AMORE CLUE Dashboard
Uses EXAONE-3.5-7.8B-Instruct on cuda:1
Endpoints: sns-analysis, whitespace-product
"""
import os
import json
import re
import torch
import setproctitle
import threading
import time
import gc
setproctitle.setproctitle("wook-llm-port5")
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)

# ===== CUDA Error Handling =====
inference_semaphore = threading.Semaphore(1)
MAX_RETRIES = 2
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

# GPU 설정
DEVICE = "cuda:5"
MODEL_NAME = "LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct"

print(f"Loading model: {MODEL_NAME} on {DEVICE}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.bfloat16,  # float16 → bfloat16 (수치 안정성 개선)
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
                        temperature=0.75,
                        top_p=0.9,
                        top_k=50,
                        do_sample=True,
                        repetition_penalty=1.05,
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
                        time.sleep(2)
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
    # Remove bold/italic markers
    text = text.replace("**", "").replace("*", "")
    # Remove heading markers (##, ###, etc.) at start of lines
    text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
    # Remove links [text](url) -> text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Remove code markers
    text = text.replace("``", "").replace("`", "")
    # Remove any remaining markdown-style formatting
    text = re.sub(r'^\s*[-*+]\s+', '• ', text, flags=re.MULTILINE)  # Convert list markers to bullet
    return text.strip()


@app.route("/api/llm/sns-analysis", methods=["POST"])
def sns_analysis():
    """Retail/SNS 인기 키워드 AI 분석 생성 - Multi-Query 방식"""
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

        # 플랫폼별 키워드를 Retail/SNS로 분리
        retail_platforms = []
        sns_platforms = []
        retail_names = ["Amazon", "Sephora", "Ulta", "Olive Young", "Watsons", "Guardian", "Shopee", "Lazada", "Rakuten", "Qoo10", "@cosme", "Cosme"]
        sns_names = ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook", "Pinterest", "Reddit", "Threads"]

        for p in platforms[:8]:
            platform_name = p.get('platform', '')
            keywords_list = p.get("keywords", [])[:5]
            keywords_str = ", ".join([f"{k['name']}({k['value']}점)" for k in keywords_list])
            platform_data = f"- {platform_name}: {keywords_str}"

            if any(rn.lower() in platform_name.lower() for rn in retail_names):
                retail_platforms.append(platform_data)
            else:
                sns_platforms.append(platform_data)

        retail_info = "\n".join(retail_platforms) if retail_platforms else "- 데이터 없음"
        sns_info = "\n".join(sns_platforms) if sns_platforms else "- 데이터 없음"

        # 공통 출력 규칙
        output_rules = """
[출력 규칙]
- 반드시 한국어로 작성
- 텍스트와 숫자 중심으로 구체적으로 작성
- 특수기호, 이모지, 박스 문자 사용 금지
- 구분이 필요하면 1. 2. 3. 또는 - 로 표시
- 각 문장은 완성된 형태로 작성"""

        print(f"  Multi-Query SNS Analysis: Starting for {country_name} {category}...")
        sub_results = {}

        # ===== Sub Query 1: Retail 채널 분석 =====
        print("    [1/4] Retail 채널 분석...")
        prompt_retail = f"""다음은 {country_name} 시장 {category} 카테고리의 Retail 채널 인기 키워드 데이터입니다.

[Retail 채널 데이터]
{retail_info}

위 데이터를 바탕으로 Retail 채널 분석을 작성해주세요.

[Retail 채널 분석]

1. 주요 트렌드
- 상위 키워드와 점수를 근거로 현재 트렌드 설명 (2-3문장)

2. 소비자 특성
- Retail 구매자들의 관심사와 구매 패턴 (1-2문장)

3. 수치 기반 인사이트
- 키워드별 점수 차이가 의미하는 바 (1-2문장)
{output_rules}"""

        sub_results['retail'] = generate_response(prompt_retail, max_new_tokens=400)

        # ===== Sub Query 2: SNS 채널 분석 =====
        print("    [2/4] SNS 채널 분석...")
        prompt_sns = f"""다음은 {country_name} 시장 {category} 카테고리의 SNS 채널 인기 키워드 데이터입니다.

[SNS 채널 데이터]
{sns_info}

위 데이터를 바탕으로 SNS 채널 분석을 작성해주세요.

[SNS 채널 분석]

1. 주요 트렌드
- 상위 키워드와 점수를 근거로 현재 바이럴 트렌드 설명 (2-3문장)

2. 바이럴 포인트
- SNS에서 화제가 되는 요소와 콘텐츠 유형 (1-2문장)

3. 수치 기반 인사이트
- 플랫폼별 키워드 점수가 의미하는 바 (1-2문장)
{output_rules}"""

        sub_results['sns'] = generate_response(prompt_sns, max_new_tokens=400)

        # ===== Sub Query 3: 핵심 인사이트 =====
        print("    [3/4] 핵심 인사이트 도출...")
        prompt_insights = f"""다음은 {country_name} {category} 시장의 Retail과 SNS 채널 분석 결과입니다.

[Retail 채널 분석]
{sub_results.get('retail', '')}

[SNS 채널 분석]
{sub_results.get('sns', '')}

위 분석을 종합하여 핵심 인사이트 3가지를 도출해주세요.

[핵심 인사이트]

1. (Retail과 SNS 공통 트렌드 - 수치 근거 포함)

2. (Retail 채널 고유 인사이트 - 수치 근거 포함)

3. (SNS 채널 고유 인사이트 - 수치 근거 포함)
{output_rules}"""

        sub_results['insights'] = generate_response(prompt_insights, max_new_tokens=400)

        # ===== Sub Query 4: 전략 제안 =====
        print("    [4/4] 전략 제안 생성...")
        prompt_strategy = f"""다음은 {country_name} {category} 시장 분석 결과입니다.

[Retail 채널 분석]
{sub_results.get('retail', '')}

[SNS 채널 분석]
{sub_results.get('sns', '')}

[핵심 인사이트]
{sub_results.get('insights', '')}

위 분석을 바탕으로 K-뷰티 브랜드를 위한 전략을 제안해주세요.

[전략 제안]

1. Retail 채널 전략
- 구체적인 실행 방안 (1-2문장)

2. SNS 채널 전략
- 구체적인 실행 방안 (1-2문장)

3. 통합 마케팅 전략
- Retail과 SNS를 연계한 전략 (1-2문장)
{output_rules}"""

        sub_results['strategy'] = generate_response(prompt_strategy, max_new_tokens=400)

        print("  Multi-Query 완료: 결과 정리 중...")

        # ===== 결과 파싱 및 정리 =====
        retail_analysis = clean_text(sub_results.get('retail', ''))
        sns_analysis_text = clean_text(sub_results.get('sns', ''))

        # 인사이트 파싱
        insights_raw = sub_results.get('insights', '')
        insights = []
        for line in insights_raw.split('\n'):
            line = line.strip()
            if line and len(line) > 10:
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 10:
                    insights.append(clean_text(clean_line))
        insights = insights[:5]

        # 전략 파싱
        strategy_raw = sub_results.get('strategy', '')
        recommendations = []
        for line in strategy_raw.split('\n'):
            line = line.strip()
            if line and len(line) > 10:
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 10:
                    recommendations.append(clean_text(clean_line))
        recommendations = recommendations[:4]

        # Fallback
        if not retail_analysis or len(retail_analysis) < 20:
            retail_analysis = f"{country_name} Retail 채널에서는 검증된 효과와 브랜드 신뢰도가 구매 결정에 중요한 역할을 합니다."
        if not sns_analysis_text or len(sns_analysis_text) < 20:
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

        # 요약 텍스트 생성
        summary = f"Retail 분석: {retail_analysis[:150]}...\n\nSNS 분석: {sns_analysis_text[:150]}..."

        return jsonify({
            "success": True,
            "summary": summary,
            "retailAnalysis": retail_analysis,
            "snsAnalysis": sns_analysis_text,
            "insights": insights,
            "recommendations": recommendations,
            "multiQuery": True,
        })

    except Exception as e:
        print(f"Error in sns_analysis: {e}")
        import traceback
        traceback.print_exc()
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

        explanation = re.sub(r'\[설명\]|\[핵심\s*요인\]', '', explanation).strip()
        key_factors = [re.sub(r'\[설명\]|\[핵심\s*요인\]', '', f).strip() for f in key_factors]
        key_factors = [f for f in key_factors if len(f) > 3]

        return jsonify({"success": True, "explanation": explanation, "keyFactors": key_factors[:5]})

    except Exception as e:
        print(f"Error in keyword_why: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "model": MODEL_NAME, "device": DEVICE, "port": 5005})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=False)
