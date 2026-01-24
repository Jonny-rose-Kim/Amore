"""
LLM Inference Server for AMORE CLUE Dashboard
Uses EXAONE-3.5-7.8B-Instruct (LG AI Research) for Korean beauty trend analysis
"""
import os
import json
import torch
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)

# GPU 설정
DEVICE = "cuda:0"
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
print("Model loaded successfully!")

# ===== RAG: Vector DB (ChromaDB + sentence-transformers) =====
import chromadb
from sentence_transformers import SentenceTransformer

VECTOR_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vector_db')
print(f"Loading RAG vector DB from: {VECTOR_DB_PATH}")
try:
    chroma_client = chromadb.PersistentClient(path=VECTOR_DB_PATH)
    embed_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
    rag_collections = {
        'marketing': chroma_client.get_collection('rag_marketing'),
        'npd': chroma_client.get_collection('rag_npd'),
        'overseas': chroma_client.get_collection('rag_overseas'),
    }
    print("RAG Vector DB loaded successfully!")
    RAG_AVAILABLE = True
except Exception as e:
    print(f"WARNING: RAG Vector DB not available: {e}")
    RAG_AVAILABLE = False
    rag_collections = {}
    embed_model = None


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
    import re
    text = text.replace("**", "").replace("*", "")
    text = re.sub(r'^#+\s*', '', text)  # Remove heading markers
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)  # Remove links
    text = text.replace("``", "").replace("`", "")
    return text.strip()


@app.route("/api/llm/review-summary", methods=["POST"])
def review_summary():
    """리뷰 AI 분석 요약 생성 - 종합적이고 상세한 분석"""
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

위 데이터를 바탕으로, 데이터에서 직접 확인되는 내용뿐만 아니라 당신의 전문 지식을 활용하여 다음을 종합적으로 분석해주세요:

[요약]
"{keyword}" 키워드의 리뷰 트렌드를 5-7문장으로 상세하게 분석해주세요. 다음 관점들을 포함해주세요:
1) 전반적인 소비자 만족도와 감성 분포 해석
2) 긍정/부정 키워드에서 드러나는 소비자 니즈와 기대치
3) {country_name} 시장에서 이 키워드가 갖는 의미와 트렌드 맥락
4) K-뷰티 브랜드 관점에서의 기회 요인 또는 주의점
5) 향후 시장 전망이나 소비자 행동 변화 예측

[인사이트] 핵심 인사이트 키워드 4개를 쉼표로 구분해서 작성해주세요 (각 2-6자).
[긍정비율] {pos_ratio}"""

        response = generate_response(prompt, max_new_tokens=800)

        # Parse response - flexible matching for EXAONE output
        summary = ""
        insights = []
        sentiment_ratio = pos_ratio / 100

        import re
        lines = response.split("\n")
        summary_lines = []
        current_section = None

        def is_section_header(line, keywords):
            """Check if line matches section header variants"""
            for kw in keywords:
                if f"[{kw}]" in line or f"#{kw}" in line or line.startswith(f"{kw}:") or line.startswith(f"{kw} :"):
                    return True
            return False

        def extract_after_header(line, keywords):
            """Extract text after the section header"""
            for kw in keywords:
                for pattern in [f"[{kw}]", f"#{kw}", f"{kw}:", f"{kw} :"]:
                    if pattern in line:
                        return line.split(pattern)[-1].strip().lstrip(":").strip()
            return ""

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if is_section_header(line, ["요약", "종합 요약", "분석 요약"]):
                rest = extract_after_header(line, ["요약", "종합 요약", "분석 요약"])
                if rest:
                    summary_lines.append(rest)
                current_section = "summary"
            elif is_section_header(line, ["인사이트", "핵심 인사이트", "키워드"]):
                insight_text = extract_after_header(line, ["인사이트", "핵심 인사이트", "키워드"])
                if insight_text:
                    insights = [i.strip() for i in insight_text.split(",") if i.strip()][:5]
                current_section = "insights"
            elif is_section_header(line, ["긍정비율", "긍정 비율"]):
                try:
                    ratio_str = extract_after_header(line, ["긍정비율", "긍정 비율"])
                    val = float(re.sub(r'[^\d.]', '', ratio_str))
                    sentiment_ratio = val / 100 if val > 1 else val
                except:
                    pass
                current_section = None
            elif current_section == "summary":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and not clean_line.startswith("[") and len(clean_line) > 5:
                    summary_lines.append(clean_line)
            elif current_section == "insights" and not insights:
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and "," in clean_line:
                    insights = [i.strip() for i in clean_line.split(",") if i.strip()][:5]

        summary = clean_text(" ".join(summary_lines)) if summary_lines else ""

        # Fallback if parsing failed
        if not summary:
            clean_response = response.replace("[요약]", "").replace("[인사이트]", "").replace("[긍정비율]", "")
            summary = clean_text(clean_response.strip()[:500]) if clean_response.strip() else f"{keyword}에 대한 리뷰 분석 결과입니다."
        if not insights:
            insights = ["효과 우수", "보습력", "가성비", "만족도"]
        else:
            insights = [clean_text(i) for i in insights]

        return jsonify({
            "success": True,
            "summary": summary,
            "insights": insights,
            "sentimentRatio": sentiment_ratio,
        })

    except Exception as e:
        print(f"Error in review_summary: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/sns-analysis", methods=["POST"])
def sns_analysis():
    """Retail/SNS 인기 키워드 AI 분석 생성 - 종합적이고 상세한 분석"""
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

        # 플랫폼별 키워드 정리
        platform_info = ""
        for p in platforms[:6]:
            keywords = ", ".join([f"{k['name']}({k['value']}점)" for k in p.get("keywords", [])[:5]])
            platform_info += f"- {p['platform']}: {keywords}\n"

        prompt = f"""다음은 {country_name} 시장의 {category} 카테고리에서 각 Retail/SNS 플랫폼별 인기 키워드 데이터입니다.

[플랫폼별 인기 키워드 데이터]
{platform_info}

위 데이터를 바탕으로, 데이터에서 직접 확인되는 트렌드뿐만 아니라 당신의 글로벌 뷰티 시장 전문 지식을 활용하여 종합적으로 분석해주세요:

[요약]
{country_name} {category} 시장의 Retail/SNS 트렌드를 5-7문장으로 상세하게 분석해주세요. 다음을 포함해주세요:
1) 플랫폼별 인기 키워드의 공통점과 차이점 분석
2) {country_name} 소비자들의 뷰티 관심사와 구매 결정 요인
3) 현재 키워드 트렌드가 시사하는 {category} 시장의 방향성
4) 글로벌 뷰티 트렌드와의 연관성 및 {country_name} 시장만의 특수성
5) 시즌별/시기별 트렌드 변화 가능성

[인사이트]
핵심 인사이트를 4개 작성해주세요. 각 인사이트는 구체적인 데이터 근거와 함께 1-2문장으로 작성합니다.

[전략]
K-뷰티 브랜드가 {country_name} {category} 시장에서 활용할 수 있는 구체적인 전략 3개를 작성해주세요. 각 전략은 실행 가능한 수준으로 구체적으로 1-2문장으로 작성합니다."""

        response = generate_response(prompt, max_new_tokens=1000)

        # Parse response - flexible matching
        import re
        summary = ""
        insights = []
        recommendations = []

        current_section = None
        summary_lines = []
        lines = response.split("\n")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check section headers (flexible matching)
            is_summary = any(kw in line for kw in ["[요약]", "요약:", "## 요약", "# 요약", "종합 요약", "트렌드 분석"])
            is_insight = any(kw in line for kw in ["[인사이트]", "인사이트:", "## 인사이트", "# 인사이트", "핵심 인사이트"])
            is_strategy = any(kw in line for kw in ["[전략]", "전략:", "## 전략", "# 전략", "전략 제안", "K-뷰티 전략"])

            if is_summary and not is_insight and not is_strategy:
                for kw in ["[요약]", "요약:", "## 요약", "# 요약", "종합 요약:", "트렌드 분석:"]:
                    if kw in line:
                        rest = line.split(kw)[-1].strip()
                        if rest and len(rest) > 5:
                            summary_lines.append(rest)
                        break
                current_section = "summary"
            elif is_insight:
                for kw in ["[인사이트]", "인사이트:", "## 인사이트", "# 인사이트", "핵심 인사이트:"]:
                    if kw in line:
                        rest = line.split(kw)[-1].strip()
                        if rest and len(rest) > 5:
                            insights.append(rest)
                        break
                current_section = "insights"
            elif is_strategy:
                for kw in ["[전략]", "전략:", "## 전략", "# 전략", "전략 제안:", "K-뷰티 전략:"]:
                    if kw in line:
                        rest = line.split(kw)[-1].strip()
                        if rest and len(rest) > 5:
                            recommendations.append(rest)
                        break
                current_section = "recommendations"
            elif current_section:
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 5:
                    if current_section == "summary":
                        summary_lines.append(clean_line)
                    elif current_section == "insights":
                        insights.append(clean_line)
                    elif current_section == "recommendations":
                        recommendations.append(clean_line)

        summary = clean_text(" ".join(summary_lines)) if summary_lines else ""

        # Fallback
        if not summary:
            clean_response = response.replace("[요약]", "").replace("[인사이트]", "").replace("[전략]", "")
            summary = clean_text(clean_response.strip()[:500]) if clean_response.strip() else f"{country_name} {category} 시장 분석 결과입니다."
        if not insights:
            insights = [f"{category} 카테고리 성장세 지속", "SNS 언급량 증가 추세", "소비자 관심도 상승"]
        else:
            insights = [clean_text(i) for i in insights if clean_text(i)]
        if not recommendations:
            recommendations = ["타겟 성분 기반 신제품 개발 검토", "SNS 마케팅 강화 필요"]
        else:
            recommendations = [clean_text(r) for r in recommendations if clean_text(r)]

        return jsonify({
            "success": True,
            "summary": summary,
            "insights": insights[:5],
            "recommendations": recommendations[:4],
        })

    except Exception as e:
        print(f"Error in sns_analysis: {e}")
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

        prompt = f"""다음은 {country_name} {category} 시장에서 "{keyword}" 키워드의 트렌드 분석 데이터입니다.

[키워드 데이터]
- 키워드: {keyword}
- 국가: {country_name}
- 카테고리: {category}
- 트렌드 레벨: {trend_level}
- 종합 점수: {score}점
- 신호 지표: {signals_text}
- 관련 긍정 키워드: {pos_keywords_text}

위 데이터를 바탕으로, 이 키워드가 왜 현재 트렌드로 부상하고 있는지 종합적으로 분석해주세요.

다음 형식으로 정확히 답변해주세요:

[설명]
이 키워드가 트렌드인 이유를 5-7문장으로 상세하게 분석해주세요. 소비자 니즈, 시장 맥락, 글로벌 뷰티 트렌드와의 연관성, 신호 지표 해석을 포함해주세요.

[핵심요인]
이 키워드가 트렌드인 핵심 요인 4-5개를 각각 한 줄씩 작성해주세요. 각 요인은 구체적이고 데이터에 근거해야 합니다."""

        response = generate_response(prompt, max_new_tokens=800)

        import re as re2
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
                rest = re2.sub(r'^\[설명\]|^설명:|^## 설명', '', line).strip()
                if rest and len(rest) > 5:
                    explanation_lines.append(rest)
            elif any(kw in line for kw in ["[핵심요인]", "핵심요인:", "## 핵심요인", "핵심 요인", "[핵심 요인]"]):
                current_section = "factors"
                rest = re2.sub(r'^\[핵심\s*요인\]|^핵심\s*요인:|^## 핵심\s*요인', '', line).strip()
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
        import re as re3
        explanation = re3.sub(r'\[설명\]|\[핵심\s*요인\]', '', explanation).strip()
        key_factors = [re3.sub(r'\[설명\]|\[핵심\s*요인\]', '', f).strip() for f in key_factors]
        key_factors = [f for f in key_factors if len(f) > 3]

        return jsonify({"success": True, "explanation": explanation, "keyFactors": key_factors[:5]})

    except Exception as e:
        print(f"Error in keyword_why: {e}")
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

        import re as re2
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
                rest = re2.sub(r'^\[설명\]|^설명:|^## 설명', '', line).strip()
                if rest and len(rest) > 5:
                    explanation_lines.append(rest)
            elif any(kw in line for kw in ["[핵심요인]", "핵심요인:", "## 핵심요인", "핵심 요인", "[핵심 요인]"]):
                current_section = "factors"
                rest = re2.sub(r'^\[핵심\s*요인\]|^핵심\s*요인:|^## 핵심\s*요인', '', line).strip()
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

        # Clean up any remaining section markers
        import re as re3
        explanation = re3.sub(r'\[설명\]|\[핵심\s*요인\]', '', explanation).strip()
        key_factors = [re3.sub(r'\[설명\]|\[핵심\s*요인\]', '', f).strip() for f in key_factors]
        key_factors = [f for f in key_factors if len(f) > 3]

        return jsonify({"success": True, "explanation": explanation, "keyFactors": key_factors[:5]})

    except Exception as e:
        print(f"Error in category_trend: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/rag-insight", methods=["POST"])
def rag_insight():
    """RAG 기반 맞춤형 인사이트 생성 - ChromaDB 벡터 검색 + EXAONE 인사이트"""
    try:
        data = request.json
        scope = data.get("scope", "category")
        insight_type = data.get("type", "marketing")
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
            "marketing": "마케팅 캠페인",
            "npd": "신제품 기획(BM)",
            "overseas": "해외 진출 전략"
        }
        type_name = type_names.get(insight_type, "마케팅 캠페인")

        keywords_text = ""
        if top_keywords:
            keywords_text = ", ".join([k.get("keyword", "") for k in top_keywords[:10]])

        # ===== Vector Search (ChromaDB) =====
        rag_text = ""
        rag_sources = []
        if RAG_AVAILABLE and embed_model is not None:
            collection = rag_collections.get(insight_type)
            if collection:
                # 쿼리 구성: keyword + category + country + topKeywords
                query_parts = []
                if keyword:
                    query_parts.append(keyword)
                if category:
                    query_parts.append(category)
                if country_name:
                    query_parts.append(country_name)
                if top_keywords:
                    query_parts.extend([k.get("keyword", "") for k in top_keywords[:5]])
                query_text = " ".join(filter(None, query_parts))

                # 임베딩 생성 & 벡터 검색
                query_embedding = embed_model.encode([query_text]).tolist()
                results = collection.query(
                    query_embeddings=query_embedding,
                    n_results=3,
                    include=["metadatas", "distances"]
                )

                if results and results["metadatas"] and results["metadatas"][0]:
                    rag_text = "\n\n[시장 참고 사례 - 실제 뉴스/기사 기반]\n"
                    for i, meta in enumerate(results["metadatas"][0], 1):
                        title = meta.get("title", "")
                        source = meta.get("source", "")
                        content_text = meta.get("content", "")
                        rag_sources.append({"title": title, "source": source})

                        rag_text += f"\n사례 {i}: {title}\n"
                        rag_text += f"  출처: {source}\n"

                        if insight_type == "marketing":
                            visual_mood = meta.get("visual_mood", "")
                            if visual_mood:
                                rag_text += f"  비주얼/무드: {visual_mood}\n"
                            # 핵심 내용 요약 (첫 300자)
                            if content_text:
                                rag_text += f"  내용: {content_text[:400]}\n"
                        elif insight_type == "npd":
                            formulation = meta.get("formulation_insight", "")
                            if formulation:
                                rag_text += f"  제형 인사이트: {formulation}\n"
                            if content_text:
                                rag_text += f"  내용: {content_text[:400]}\n"
                        elif insight_type == "overseas":
                            market_insight = meta.get("market_insight", "")
                            if market_insight:
                                rag_text += f"  시장 인사이트: {market_insight}\n"
                            if content_text:
                                rag_text += f"  내용: {content_text[:400]}\n"

                    print(f"  RAG: Found {len(results['metadatas'][0])} relevant articles for '{query_text[:50]}...'")

        if scope == "keyword":
            target_desc = f'"{keyword}" 키워드'
        else:
            target_desc = f'{category} 카테고리 전체 (주요 키워드: {keywords_text})'

        # 목적별 프롬프트
        if insight_type == "marketing":
            purpose_instruction = """다음 형식으로 마케팅 캠페인 인사이트를 작성해주세요:

Agent Insight

1. 타겟 오디언스 분석
위 데이터와 시장 사례를 바탕으로 핵심 타겟층과 그들의 니즈를 분석하고, 참고 사례의 성공적인 비주얼/무드를 반영한 타겟팅을 제안해주세요.

2. 채널 및 콘텐츠 전략
가장 효과적인 마케팅 채널과 콘텐츠 유형을 제안하되, 참고 사례의 성공 채널과 바이럴 전략을 구체적으로 언급해주세요.

3. 핵심 메시지 및 비주얼 컨셉
타겟에게 어필할 수 있는 핵심 메시지, 캠페인 컨셉, 그리고 참고 사례를 바탕으로 한 비주얼 방향성(패키징, 분위기, 색감)을 제안해주세요.

Market Precedent
참고 사례에서 도출된 시장 선례와 벤치마크를 불릿(•)으로 정리하되, 각 사례의 구체적인 성과 지표를 포함해주세요.

Agent Conclusion
종합적인 캠페인 추천 방향을 2-3문장으로 정리해주세요."""

        elif insight_type == "npd":
            purpose_instruction = """다음 형식으로 신제품 기획 인사이트를 작성해주세요:

Agent Insight

1. 성분 배합 제안
참고 사례의 과학적 배합 인사이트를 바탕으로, 현재 트렌드에 맞는 유망 핵심 성분 조합과 그 과학적 근거를 제안해주세요.

2. 제형 컨셉 및 텍스처
참고 사례의 제형 혁신을 바탕으로, 소비자 선호도에 맞는 차별화된 제형/텍스처와 전달 시스템을 제안해주세요.

3. USP 및 포지셔닝
참고 사례의 시장 반응을 바탕으로, 경쟁 제품 대비 차별화 포인트와 시장 포지셔닝 전략을 제안해주세요.

Market Precedent
참고 사례에서 도출된 제형/성분 혁신 선례를 불릿(•)으로 정리하되, 과학적 작용 원리를 포함해주세요.

Agent Conclusion
종합적인 신제품 기획 방향을 2-3문장으로 정리해주세요."""

        else:
            purpose_instruction = """다음 형식으로 해외 진출 전략 인사이트를 작성해주세요:

Agent Insight

1. 시장 진입 전략
참고 사례의 실제 시장 데이터를 바탕으로, 해당 시장의 최적 진입 전략(유통, 타이밍, 포지셔닝)을 제안해주세요.

2. 현지 소비자 분석
참고 사례의 소비자 인사이트를 바탕으로, 타겟 시장의 선호도, 구매 패턴, 문화적 특성을 분석해주세요.

3. 유통 및 가격 전략
참고 사례의 성공/실패를 바탕으로, 적합한 유통 채널과 가격 포지셔닝을 구체적 수치와 함께 제안해주세요.

Market Precedent
참고 사례에서 도출된 해외 진출 선례와 성공/실패 요인을 불릿(•)으로 정리하되, 구체적 시장 수치를 포함해주세요.

Agent Conclusion
종합적인 해외 진출 추천 방향을 2-3문장으로 정리해주세요."""

        prompt = f"""다음은 {country_name} 시장의 {target_desc}에 대한 {type_name} 인사이트 요청입니다.

[분석 대상]
- 국가: {country_name}
- 카테고리: {category}
- 분석 범위: {scope} ({keyword if scope == 'keyword' else '카테고리 전체'})
- 주요 트렌드 키워드: {keywords_text}
{rag_text}

위의 실제 시장 참고 사례(뉴스/기사 기반)를 핵심 근거로 활용하여, 당신의 K-뷰티 시장 전문 지식과 결합해 실행 가능한 인사이트를 제공해주세요.
반드시 참고 사례의 구체적인 데이터와 성과를 인용하여 인사이트의 신뢰성을 높여주세요.

{purpose_instruction}"""

        response = generate_response(prompt, max_new_tokens=1200)

        content = clean_text(response) if response else f"{country_name} {category} 시장에 대한 {type_name} 인사이트입니다."

        if "Agent Insight" not in content:
            content = f"Agent Insight\n\n{content}"
        if "Agent Conclusion" not in content:
            content += "\n\nAgent Conclusion\n\n위 분석을 종합하면, 현재 시장 트렌드와 실제 사례를 기반으로 전략적 접근이 필요합니다."

        return jsonify({
            "success": True,
            "content": content,
            "scope": scope,
            "type": insight_type,
            "keyword": keyword,
            "category": category,
            "country": country,
            "ragSources": rag_sources,
        })

    except Exception as e:
        print(f"Error in rag_insight: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/llm/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "model": MODEL_NAME, "device": DEVICE})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
