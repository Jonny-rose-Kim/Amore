"""
LLM Inference Server for AMORE CLUE Dashboard
- Text: EXAONE-3.5-7.8B-Instruct (LG AI Research)
- Multimodal: Qwen2-VL-2B-Instruct (Lazy Loading)
Endpoints: rag-insight, plc-prediction, category-prediction, chat
"""
import os
import json
import re
import base64
import io
import torch
import setproctitle
import threading
import time
import gc
setproctitle.setproctitle("wook-llm-port7")
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer, Qwen2VLForConditionalGeneration, AutoProcessor
from PIL import Image

app = Flask(__name__)

# ===== CUDA Error Handling =====
# 동시 요청 제한 (GPU 충돌 방지)
inference_semaphore = threading.Semaphore(1)
MAX_RETRIES = 2
CUDA_ERROR_COUNT = 0
MAX_CUDA_ERRORS = 5  # 이 횟수 초과시 서버 재시작 권장

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

# ===== VLM Model (Lazy Loading) =====
vlm_model = None
vlm_processor = None
VLM_MODEL_NAME = "Qwen/Qwen2-VL-2B-Instruct"

# GPU 설정
DEVICE = "cuda:7"
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
print("Model loaded successfully!")


def load_vlm_model():
    """Lazy load Qwen2-VL model when first multimodal request comes in"""
    global vlm_model, vlm_processor
    if vlm_model is None:
        print(f"Loading VLM model: {VLM_MODEL_NAME} on {DEVICE}...")
        from qwen_vl_utils import process_vision_info
        vlm_processor = AutoProcessor.from_pretrained(VLM_MODEL_NAME, trust_remote_code=True)
        vlm_model = Qwen2VLForConditionalGeneration.from_pretrained(
            VLM_MODEL_NAME,
            torch_dtype=torch.float16,
            device_map=DEVICE,
            trust_remote_code=True,
        )
        vlm_model.eval()
        print(f"VLM model loaded successfully on {DEVICE}!")
    return vlm_model, vlm_processor


# ===== RAG: 새 임베딩 데이터 (마케팅 사례 + 시장 신호) =====
import numpy as np
from transformers import AutoTokenizer as EmbedTokenizer, AutoModel as EmbedModel

RAG_DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rag_data', 'rag_embeddings.json')
print(f"Loading RAG embeddings from: {RAG_DATA_PATH}")

RAG_AVAILABLE = False
rag_data = None
rag_embeddings = None
embed_tokenizer = None
embed_model_rag = None

def mean_pooling_rag(model_output, attention_mask):
    """Mean pooling for sentence embeddings"""
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

def get_query_embedding(query_text):
    """쿼리 텍스트의 임베딩 생성"""
    global embed_tokenizer, embed_model_rag

    if embed_tokenizer is None:
        return None

    encoded = embed_tokenizer([query_text], padding=True, truncation=True, max_length=512, return_tensors='pt')

    with torch.no_grad():
        output = embed_model_rag(**encoded)

    embedding = mean_pooling_rag(output, encoded['attention_mask'])
    embedding = torch.nn.functional.normalize(embedding, p=2, dim=1)
    return embedding.numpy()[0]

def search_rag(query_text, insight_type="marketing", top_k=3):
    """RAG 검색 - 유사한 문서 반환"""
    global rag_data, rag_embeddings

    if not RAG_AVAILABLE or rag_data is None:
        return []

    query_embedding = get_query_embedding(query_text)
    if query_embedding is None:
        return []

    # 코사인 유사도 계산
    similarities = np.dot(rag_embeddings, query_embedding)

    # insight_type에 따라 필터링 (marketing은 marketing_case, npd/overseas는 둘 다)
    filtered_indices = []
    for i, doc in enumerate(rag_data['documents']):
        if insight_type == "marketing" and doc['type'] == 'marketing_case':
            filtered_indices.append(i)
        elif insight_type in ["npd", "overseas"]:
            # NPD와 해외진출은 둘 다 참고
            filtered_indices.append(i)

    # 필터링된 문서에서 상위 K개 선택
    if not filtered_indices:
        filtered_indices = list(range(len(rag_data['documents'])))

    filtered_sims = [(i, similarities[i]) for i in filtered_indices]
    filtered_sims.sort(key=lambda x: x[1], reverse=True)
    top_results = filtered_sims[:top_k]

    results = []
    for idx, sim in top_results:
        doc = rag_data['documents'][idx]
        results.append({
            'id': doc['id'],
            'type': doc['type'],
            'country': doc.get('country', ''),
            'brand': doc.get('brand', ''),
            'product': doc.get('product', ''),
            'category': doc.get('category', ''),
            'text': doc.get('text', ''),
            'similarity': float(sim),
            # 마케팅 사례 추가 정보
            'why_it_worked': doc.get('why_it_worked', ''),
            'evidence_snippet': doc.get('evidence_snippet', ''),
            'key_message': doc.get('key_message', ''),
            'channel': doc.get('channel', ''),
            # 시장 신호 추가 정보
            'signal_type': doc.get('signal_type', ''),
            'signal_strength': doc.get('signal_strength', ''),
            'evidence_summary': doc.get('evidence_summary', ''),
        })

    return results

try:
    if os.path.exists(RAG_DATA_PATH):
        with open(RAG_DATA_PATH, 'r', encoding='utf-8') as f:
            rag_data = json.load(f)

        # 임베딩 배열 추출
        rag_embeddings = np.array([doc['embedding'] for doc in rag_data['documents']])

        # 임베딩 모델 로드 (쿼리용)
        EMBED_MODEL_NAME = rag_data.get('model', 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
        embed_tokenizer = EmbedTokenizer.from_pretrained(EMBED_MODEL_NAME)
        embed_model_rag = EmbedModel.from_pretrained(EMBED_MODEL_NAME)
        embed_model_rag.eval()

        RAG_AVAILABLE = True
        print(f"RAG embeddings loaded: {rag_data['total_documents']} documents, {rag_data['dimension']}D")
    else:
        print(f"WARNING: RAG embeddings file not found: {RAG_DATA_PATH}")
except Exception as e:
    print(f"WARNING: RAG not available: {e}")
    RAG_AVAILABLE = False

# 레거시 변수 (호환성)
embed_model = None
rag_collections = {}


SYSTEM_PROMPT = """당신은 글로벌 K-뷰티(K-Beauty) 시장 분석 및 화장품 산업 트렌드 전문가입니다.
아모레퍼시픽, LG생활건강 등 한국 화장품 기업의 글로벌 전략을 자문하는 수준의 전문성을 갖추고 있습니다.
주어진 데이터를 바탕으로 심층적이고 전문적인 분석을 제공하되, 데이터에 나타나지 않는 시장 맥락, 소비자 심리, 산업 동향까지 종합적으로 고려하여 풍부한 인사이트를 제공합니다.
반드시 한국어로만 답변하세요."""


def generate_response(prompt: str, max_new_tokens: int = 1024) -> str:
    """Generate a response from the LLM with CUDA error handling"""
    global CUDA_ERROR_COUNT

    # 동시 요청 제한 (세마포어로 1개씩 처리)
    acquired = inference_semaphore.acquire(timeout=120)  # 최대 2분 대기
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
                        temperature=0.75,  # 0.7 → 0.75 (수치 안정성)
                        top_p=0.9,
                        top_k=50,  # 추가: 샘플링 풀 제한
                        do_sample=True,
                        repetition_penalty=1.05,  # 1.1 → 1.05 (inf/nan 방지)
                    )

                generated = outputs[0][inputs["input_ids"].shape[1]:]
                response = tokenizer.decode(generated, skip_special_tokens=True)

                # 성공 시 에러 카운트 리셋
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
                        time.sleep(2)  # 잠시 대기 후 재시도
                        continue
                    else:
                        raise RuntimeError(f"Inference error after {MAX_RETRIES + 1} attempts. Server restart may be needed.")
                else:
                    raise  # 기타 에러는 그대로 전파

    finally:
        # 항상 세마포어 해제 및 메모리 정리
        inference_semaphore.release()
        torch.cuda.empty_cache()


def clean_text(text: str) -> str:
    """Remove markdown formatting from LLM output"""
    import re
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
        # 마크다운 포맷팅 제거
        response = clean_text(response)

        # Parse response - 새로운 구조화된 형식
        import re
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

            # 섹션 헤더 감지
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

            # 섹션별 내용 수집
            if current_section == "consumer":
                consumer_lines.append(line)
            elif current_section == "insights":
                clean_line = line.lstrip("0123456789.-•→·)#* ").strip()
                if clean_line and len(clean_line) > 5:
                    insight_lines.append(clean_line)
            elif current_section == "outlook":
                outlook_lines.append(line)

        # 결과 조합
        consumer_response = "\n".join(consumer_lines) if consumer_lines else ""
        insight_list = insight_lines[:4] if insight_lines else []
        market_outlook = " ".join(outlook_lines) if outlook_lines else ""

        # 전체 요약 생성 (구조화된 형식)
        summary_parts = []
        if consumer_response:
            summary_parts.append(f"📊 소비자 반응\n{consumer_response}")
        if insight_list:
            insights_text = "\n".join([f"{i+1}. {ins}" for i, ins in enumerate(insight_list)])
            summary_parts.append(f"🔍 핵심 인사이트\n{insights_text}")
        if market_outlook:
            summary_parts.append(f"💡 시장 전망\n{clean_text(market_outlook)}")

        summary = "\n\n".join(summary_parts) if summary_parts else ""

        # Fallback
        if not summary:
            summary = f"📊 소비자 반응\n• 긍정 비율 {pos_ratio}%로 전반적으로 호의적인 반응\n• 주요 긍정 키워드: {pos_list[:100]}\n\n🔍 핵심 인사이트\n1. {keyword}에 대한 소비자 관심도 상승\n2. 리뷰 데이터 기반 시장 잠재력 확인\n\n💡 시장 전망\n{country_name} 시장에서 {keyword} 키워드의 성장 가능성이 높습니다."
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
        positive_reviews = data.get("positiveReviews", [])
        negative_reviews = data.get("negativeReviews", [])

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

        # ===== Vector Search (새 임베딩 기반) =====
        rag_text = ""
        rag_sources = []
        if RAG_AVAILABLE:
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

            # RAG 검색
            search_results = search_rag(query_text, insight_type, top_k=3)

            if search_results:
                rag_text = "\n\n[시장 참고 사례 - 실제 마케팅 성공 사례 및 시장 신호 데이터]\n"
                for i, result in enumerate(search_results, 1):
                    doc_type = "마케팅 성공 사례" if result['type'] == 'marketing_case' else "시장 신호"
                    rag_sources.append({
                        "id": result['id'],
                        "brand": result['brand'],
                        "product": result['product'],
                        "type": doc_type
                    })

                    rag_text += f"\n사례 {i}: [{doc_type}] {result['brand']} - {result['product']}\n"
                    rag_text += f"  국가: {result['country']} | 카테고리: {result['category']}\n"

                    if result['type'] == 'marketing_case':
                        if result.get('key_message'):
                            rag_text += f"  핵심 메시지: {result['key_message']}\n"
                        if result.get('channel'):
                            rag_text += f"  채널: {result['channel']}\n"
                        if result.get('why_it_worked'):
                            rag_text += f"  성공 요인: {result['why_it_worked']}\n"
                        if result.get('evidence_snippet'):
                            rag_text += f"  근거: {result['evidence_snippet']}\n"
                    else:  # market_signal
                        if result.get('signal_type'):
                            rag_text += f"  신호 유형: {result['signal_type']} ({result.get('signal_strength', '')})\n"
                        if result.get('evidence_summary'):
                            rag_text += f"  근거: {result['evidence_summary']}\n"

                print(f"  RAG: Found {len(search_results)} relevant cases for '{query_text[:50]}...'")

        if scope == "keyword":
            target_desc = f'"{keyword}" 키워드'
        else:
            target_desc = f'{category} 카테고리 전체 (주요 키워드: {keywords_text})'

        # 목적별 프롬프트
        if insight_type == "marketing":
            # 마케팅: Query 1 - 섹션 1, 2, 3만 생성
            purpose_instruction = """다음 형식으로 마케팅 캠페인 인사이트를 작성해주세요. 반드시 아래 3개 섹션을 포함해야 합니다:

**1. 타겟 오디언스 분석**
• **핵심 타겟층:** 주요 타겟 고객군의 특성과 니즈를 구체적으로 설명
• **타겟 인사이트:** 참고 사례를 바탕으로 한 효과적인 타겟팅 전략 제안

**2. 채널 및 콘텐츠 전략**
• **추천 채널:** 가장 효과적인 마케팅 채널 (SNS, 인플루언서, 리테일 등)
• **콘텐츠 방향:** 참고 사례의 성공 전략을 반영한 콘텐츠 유형 및 바이럴 포인트

**3. 핵심 메시지 및 비주얼 컨셉**
• **핵심 메시지:** 타겟에게 어필할 수 있는 캠페인 슬로건/메시지
• **비주얼 방향:** 패키징, 분위기, 색감 등 비주얼 컨셉 제안

위 3개 섹션만 작성하세요. 각 섹션 제목과 하위 카테고리는 반드시 **굵은 글씨**로 표시하세요."""

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

        # 리뷰 데이터 섹션 구성
        review_section = ""
        if positive_reviews or negative_reviews:
            review_section = "\n[고객 리뷰 분석 - 실제 소비자 목소리]\n"
            if positive_reviews:
                review_section += f"• 긍정 리뷰 주요 키워드: {', '.join(positive_reviews[:6])}\n"
            if negative_reviews:
                review_section += f"• 부정 리뷰 주요 키워드 (개선 필요): {', '.join(negative_reviews[:6])}\n"
            review_section += "※ 특히 부정 리뷰에서 언급된 불만 사항을 해결하는 방향으로 전략을 제안해주세요.\n"

        prompt = f"""다음은 {country_name} 시장의 {target_desc}에 대한 {type_name} 인사이트 요청입니다.

[분석 대상]
- 국가: {country_name}
- 카테고리: {category}
- 분석 범위: {scope} ({keyword if scope == 'keyword' else '카테고리 전체'})
- 주요 트렌드 키워드: {keywords_text}
{review_section}{rag_text}

위의 실제 시장 참고 사례와 고객 리뷰 데이터를 핵심 근거로 활용하여, 당신의 K-뷰티 시장 전문 지식과 결합해 실행 가능한 인사이트를 제공해주세요.
반드시 참고 사례의 구체적인 데이터와 성과를 인용하고, 고객 리뷰에서 도출된 개선점을 반영하여 인사이트의 실용성을 높여주세요.

{purpose_instruction}"""

        response = generate_response(prompt, max_new_tokens=1200)

        content = clean_text(response) if response else f"{country_name} {category} 시장에 대한 {type_name} 인사이트입니다."

        # ===== 마케팅 타입: Query 2 - 과거 성공 사례 (4번만) =====
        query2_section = ""
        if insight_type == "marketing" and rag_sources:
            print("  [Marketing] Query 2: Generating past success cases...")
            query2_prompt = f"""당신은 K-뷰티 마케팅 전략 전문가입니다.
아래 실제 마케팅 성공 사례들을 분석해주세요.

[분석 대상]
- 국가: {country_name}
- 카테고리: {category}
- 주요 키워드: {keywords_text}

{rag_text}

다음 형식으로 정확히 작성해주세요:

**4. 과거 성공 사례 분석**

**4-1. [브랜드명 - 제품명]**
• <성과지표> 해당 사례의 구체적인 성공 수치 (매출 증가율, 판매량, 인지도 상승 등)
• <핵심전략> 이 사례에서 배울 수 있는 핵심 성공 전략
• <적용방안> {target_desc}에 이 전략을 어떻게 적용할 수 있는지

**4-2. [브랜드명 - 제품명]**
• <성과지표> 해당 사례의 구체적인 성공 수치
• <핵심전략> 이 사례에서 배울 수 있는 핵심 성공 전략
• <적용방안> {target_desc}에 이 전략을 어떻게 적용할 수 있는지

**4-3. [브랜드명 - 제품명]**
• <성과지표> 해당 사례의 구체적인 성공 수치
• <핵심전략> 이 사례에서 배울 수 있는 핵심 성공 전략
• <적용방안> {target_desc}에 이 전략을 어떻게 적용할 수 있는지

반드시 위 형식을 준수하세요. 4-1, 4-2, 4-3 제목은 **굵은 글씨**로 표시하고, 하위 항목은 <성과지표>, <핵심전략>, <적용방안> 형식으로 작성하세요.
Agent Insight는 작성하지 마세요."""

            query2_response = generate_response(query2_prompt, max_new_tokens=800)
            if query2_response:
                # 마크다운 유지 (** 굵은글씨, <> 구분자)
                query2_section = "\n\n" + query2_response.strip()
                print("  [Marketing] Query 2 completed successfully")

        # ===== 마케팅 타입: Query 3 - Agent Insight (종합 전략 요약) =====
        agent_insight_content = ""
        if insight_type == "marketing":
            print("  [Marketing] Query 3: Generating Agent Insight summary...", flush=True)

            # 이전 쿼리 결과를 캐시로 사용 (1~4번 내용)
            cached_analysis = content.strip()
            if query2_section:
                cached_analysis += query2_section

            query3_prompt = f"""당신은 K-뷰티 마케팅 전략 수석 컨설턴트입니다.

[분석 대상]
- 국가: {country_name}
- 카테고리: {category}
- 타겟: {target_desc}

[이전 분석 내용 요약]
{cached_analysis}

위 분석 내용(타겟 오디언스, 채널 전략, 핵심 메시지, 과거 성공 사례)을 종합하여 최종 마케팅 전략을 간결하게 요약해주세요.

다음 형식으로 정확히 작성해주세요 (5-6문장 이내로 핵심만):

{country_name} {category} 시장에서 {target_desc}을 위한 최종 마케팅 전략입니다.

**핵심 타겟** 집중해야 할 타겟층 (1문장)
**추천 채널** 최우선 마케팅 채널 (1문장)
**핵심 메시지** 캠페인 핵심 메시지/컨셉 (1문장)
**벤치마크** 과거 성공 사례에서 배운 핵심 포인트 (1문장)
**실행 액션** 즉시 실행 가능한 액션 (1문장)

간결하고 실행 가능한 형태로 작성하세요. 각 항목은 **항목명** 형식으로 시작하고 콜론(:)은 넣지 마세요."""

            query3_response = generate_response(query3_prompt, max_new_tokens=400)
            if query3_response:
                # Agent Insight는 마크다운(**굵은글씨**) 유지 - 프론트엔드에서 파싱함
                agent_insight_content = query3_response.strip()
                print(f"  [Marketing] Query 3 (Agent Insight) completed: {len(agent_insight_content)} chars", flush=True)
            else:
                print("  [Marketing] Query 3 FAILED - no response!", flush=True)

        # 콘텐츠 조합 (Agent Insight는 별도 필드로 반환)
        if insight_type == "marketing":
            # Query 1 (1, 2, 3번) + Query 2 (4번) - Agent Insight는 별도
            content = content.strip() + query2_section
        else:
            if "Agent Insight" not in content:
                content = f"Agent Insight\n\n{content}"
            if "Agent Conclusion" not in content:
                content += "\n\nAgent Conclusion\n\n위 분석을 종합하면, 현재 시장 트렌드와 실제 사례를 기반으로 전략적 접근이 필요합니다."

        return jsonify({
            "success": True,
            "content": content,
            "agentInsight": agent_insight_content if insight_type == "marketing" else "",
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


@app.route("/api/llm/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "model": MODEL_NAME, "device": DEVICE})


# ===== Chat Endpoint for Text-only Chatbot (EXAONE) =====

CHAT_SYSTEM_PROMPT = """당신은 AMORE CLUE 대시보드의 K-뷰티 트렌드 분석 AI 어시스턴트입니다.

## 역할
- 글로벌 K-뷰티(K-Beauty) 시장 트렌드 분석 전문가
- 화장품 산업 데이터 기반 인사이트 제공
- 아모레퍼시픽, LG생활건강 등 한국 화장품 기업의 글로벌 전략 자문 수준의 전문성

## 데이터 소스
당신에게 제공되는 [DB 데이터]는 실제 시장에서 수집된 데이터입니다:
- 리더보드: 현재 트렌드 키워드 순위 및 점수
- SNS 데이터: 인스타그램, 틱톡, 레딧 등 플랫폼별 버즈량
- 리뷰 분석: 아마존 등 실제 소비자 리뷰 감성 분석
- 트렌드 조합: 성분+제형+효과의 인기 조합

## 답변 규칙
1. 반드시 한국어로 답변하세요
2. 제공된 [DB 데이터]를 핵심 근거로 활용하여 답변하세요
3. 답변은 구조화하여 제공하세요 (소제목, 번호 매기기 등 활용)
4. 구체적인 수치와 데이터를 인용하세요
5. 답변은 간결하고 핵심적으로 작성하세요

## 중요 금지사항
- 같은 문장이나 표현을 반복하지 마세요
- 동일한 정보를 다른 말로 반복하지 마세요
- 한 번 언급한 내용은 다시 언급하지 마세요
- 답변은 명확하고 간결하게 한 번만 작성하세요"""


VLM_SYSTEM_PROMPT = """당신은 AMORE CLUE 대시보드의 K-뷰티 이미지 분석 AI 어시스턴트입니다.

## 역할
- 글로벌 K-뷰티(K-Beauty) 이미지 분석 전문가
- 화장품 제품, 패키지, 광고 이미지 시각적 분석
- 트렌드 이미지에서 인사이트 도출

## 이미지 분석 포인트
- 제품 이미지: 패키지 디자인, 색상, 텍스처, 브랜딩 요소
- 광고 이미지: 타겟 오디언스, 컬러 톤, 무드, 마케팅 메시지
- 성분/텍스트 이미지: 성분 목록, 효능 표기, 인증 마크

## 답변 규칙
1. 반드시 한국어로 답변하세요
2. 이미지에서 관찰한 내용을 구체적으로 설명하세요
3. 답변은 구조화하여 제공하세요 (소제목, 번호 매기기 등)
4. K-뷰티 산업 관점에서 분석하세요

## 중요 금지사항
- 같은 문장이나 표현을 반복하지 마세요
- 동일한 정보를 다른 말로 반복하지 마세요
- 한 번 언급한 내용은 다시 언급하지 마세요
- 답변은 명확하고 간결하게 한 번만 작성하세요"""


def generate_multimodal_response(user_message: str, image_base64: str, db_context: str) -> str:
    """Qwen2-VL 기반 멀티모달 (이미지+텍스트) 응답 생성"""
    from qwen_vl_utils import process_vision_info

    # Lazy load VLM model
    vlm, processor = load_vlm_model()

    # base64 → PIL Image
    image_data = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")

    # 프롬프트 구성
    context_block = ""
    if db_context:
        context_block = f"\n[현재 DB 데이터]\n{db_context}\n"

    text_content = f"""{context_block}
사용자 질문: {user_message}

위 이미지를 분석하고 질문에 답변해주세요.
중요: 같은 내용을 반복하지 말고, 한 번 언급한 내용은 다시 언급하지 마세요.""" if context_block else f"""{user_message}

위 이미지를 분석하고 질문에 답변해주세요.
중요: 같은 내용을 반복하지 말고, 한 번 언급한 내용은 다시 언급하지 마세요."""

    messages = [
        {"role": "system", "content": [{"type": "text", "text": VLM_SYSTEM_PROMPT}]},
        {"role": "user", "content": [
            {"type": "image", "image": image},
            {"type": "text", "text": text_content},
        ]},
    ]

    text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    image_inputs, video_inputs = process_vision_info(messages)
    inputs = processor(
        text=[text],
        images=image_inputs,
        videos=video_inputs,
        return_tensors="pt",
        padding=True,
    ).to(DEVICE)

    with torch.no_grad():
        outputs = vlm.generate(
            **inputs,
            max_new_tokens=1024,
            temperature=0.7,
            top_p=0.85,
            do_sample=True,
            repetition_penalty=1.3,
            no_repeat_ngram_size=4,
        )

    generated = outputs[0][inputs["input_ids"].shape[1]:]
    response = processor.decode(generated, skip_special_tokens=True)

    # 후처리: 마크다운 제거 + 반복 문장 제거
    response = clean_text(response)
    response = remove_repetitions(response)

    return response.strip()


def get_chat_db_context(query: str) -> str:
    """MongoDB에서 챗봇용 종합 데이터 컨텍스트 조회"""
    import re as regex
    from pymongo import MongoClient

    try:
        mongo_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
        mongo_database = os.environ.get("MONGODB_DATABASE", "amore")
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
        db = client[mongo_database]

        context_parts = []

        # 1. 리더보드 데이터 (상위 키워드)
        try:
            leaderboard = list(db.get_collection("leaderboard").find(
                {},
                {"keyword": 1, "score": 1, "trendLevel": 1, "itemType": 1, "country": 1, "category": 1, "_id": 0}
            ).sort("score", -1).limit(20))

            if leaderboard:
                by_country = {}
                for item in leaderboard:
                    country = item.get("country", "usa")
                    if country not in by_country:
                        by_country[country] = []
                    by_country[country].append(f"{item.get('keyword')}({item.get('trendLevel')}/{item.get('score')}점)")

                for country, keywords in by_country.items():
                    country_name = {"usa": "미국", "japan": "일본", "singapore": "싱가포르"}.get(country, country)
                    context_parts.append(f"[{country_name} 인기 키워드] {', '.join(keywords[:10])}")
        except Exception as e:
            print(f"Leaderboard query error: {e}")

        # 2. 트렌드 조합 데이터
        try:
            trends = list(db.get_collection("trends").find(
                {},
                {"combination": 1, "category": 1, "score": 1, "country": 1, "ingredients": 1, "effects": 1, "_id": 0}
            ).sort("score", -1).limit(15))

            if trends:
                trend_list = [f"{t.get('combination')}({t.get('category')}/{t.get('score')}점)" for t in trends]
                context_parts.append(f"[인기 트렌드 조합 Top15] {', '.join(trend_list)}")
        except Exception as e:
            print(f"Trends query error: {e}")

        # 3. SNS 플랫폼 통계
        try:
            sns_stats = list(db.get_collection("sns_platform_stats").find(
                {},
                {"keyword": 1, "platform": 1, "mentionCount": 1, "country": 1, "_id": 0}
            ).sort("mentionCount", -1).limit(15))

            if sns_stats:
                sns_list = [f"{s.get('keyword')}({s.get('platform')}/{s.get('mentionCount')}건)" for s in sns_stats]
                context_parts.append(f"[SNS 인기 키워드] {', '.join(sns_list)}")
        except Exception as e:
            print(f"SNS stats query error: {e}")

        # 4. 리뷰 감성 통계 (키워드별)
        try:
            review_keywords = list(db.get_collection("review_keywords").find(
                {},
                {"keyword": 1, "sentiment": 1, "count": 1, "country": 1, "_id": 0}
            ).sort("count", -1).limit(20))

            if review_keywords:
                positive = [r for r in review_keywords if r.get("sentiment") == "positive"]
                negative = [r for r in review_keywords if r.get("sentiment") == "negative"]

                if positive:
                    pos_list = [f"{r.get('keyword')}({r.get('count')}건)" for r in positive[:8]]
                    context_parts.append(f"[긍정 리뷰 키워드] {', '.join(pos_list)}")
                if negative:
                    neg_list = [f"{r.get('keyword')}({r.get('count')}건)" for r in negative[:8]]
                    context_parts.append(f"[부정 리뷰 키워드] {', '.join(neg_list)}")
        except Exception as e:
            print(f"Review keywords query error: {e}")

        # 5. 키워드 설명 데이터 (질문과 관련된 키워드)
        try:
            # 질문에서 키워드 추출 시도
            keyword_descriptions = db.get_collection("keyword_descriptions")
            query_keywords = regex.findall(r'[A-Za-z가-힣]+', query)

            for kw in query_keywords[:5]:
                desc = keyword_descriptions.find_one({"keyword": {"$regex": kw, "$options": "i"}})
                if desc:
                    context_parts.append(f"[키워드 정보: {desc.get('keyword')}] {desc.get('koreanName', '')}: {desc.get('description', '')[:100]}")
        except Exception as e:
            print(f"Keyword descriptions query error: {e}")

        client.close()
        return "\n".join(context_parts) if context_parts else ""

    except Exception as e:
        print(f"MongoDB context error: {e}")
        return ""


def generate_chat_response(user_message: str, db_context: str, max_new_tokens: int = 1024) -> str:
    """EXAONE 기반 챗봇 응답 생성 (반복 방지 강화)"""

    # 컨텍스트 포함 프롬프트 구성
    if db_context:
        full_prompt = f"""[DB 데이터 - 실제 시장 데이터 기반]
{db_context}

[사용자 질문]
{user_message}

위 DB 데이터를 참고하여 질문에 답변해주세요. 답변 시 구체적인 데이터를 인용하고, 같은 내용을 반복하지 마세요."""
    else:
        full_prompt = f"""[사용자 질문]
{user_message}

K-뷰티 트렌드 전문가로서 답변해주세요. 답변은 간결하게 작성하고, 같은 내용을 반복하지 마세요."""

    messages = [
        {"role": "system", "content": CHAT_SYSTEM_PROMPT},
        {"role": "user", "content": full_prompt}
    ]

    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(DEVICE)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=0.7,
            top_p=0.85,
            do_sample=True,
            repetition_penalty=1.3,  # 반복 방지 강화 (1.1 → 1.3)
            no_repeat_ngram_size=4,  # 4-gram 반복 금지
            encoder_repetition_penalty=1.2,  # 인코더 반복 페널티
        )

    generated = outputs[0][inputs["input_ids"].shape[1]:]
    response = tokenizer.decode(generated, skip_special_tokens=True)

    # 후처리: 마크다운 제거 + 반복 문장 제거
    response = clean_text(response)
    response = remove_repetitions(response)

    return response.strip()


def remove_repetitions(text: str) -> str:
    """텍스트에서 반복되는 문장/구문 제거"""
    import re as regex

    # 줄 단위로 분리
    lines = text.split('\n')
    seen_lines = set()
    unique_lines = []

    for line in lines:
        # 정규화된 버전으로 비교 (공백, 특수문자 제거)
        normalized = regex.sub(r'[^\w가-힣]', '', line.lower())
        if normalized and len(normalized) > 10:  # 짧은 줄은 무시
            if normalized in seen_lines:
                continue
            seen_lines.add(normalized)
        unique_lines.append(line)

    # 연속 반복 문장 제거
    result = '\n'.join(unique_lines)

    # 같은 문장이 2번 이상 나오면 첫 번째만 유지
    sentences = regex.split(r'(?<=[.!?])\s+', result)
    seen_sentences = set()
    unique_sentences = []

    for sentence in sentences:
        normalized = regex.sub(r'[^\w가-힣]', '', sentence.lower())
        if normalized and len(normalized) > 20:
            if normalized in seen_sentences:
                continue
            seen_sentences.add(normalized)
        unique_sentences.append(sentence)

    return ' '.join(unique_sentences)


@app.route("/api/chat/text", methods=["POST"])
def chat_text():
    """텍스트 전용 챗봇 엔드포인트 (EXAONE)"""
    try:
        data = request.json
        message = data.get("message", "").strip()
        session_id = data.get("sessionId", "")

        if not message:
            return jsonify({"success": False, "error": "메시지가 비어있습니다."}), 400

        # MongoDB에서 관련 데이터 컨텍스트 조회
        db_context = get_chat_db_context(message)

        # EXAONE 응답 생성
        response = generate_chat_response(message, db_context)

        return jsonify({
            "success": True,
            "response": response,
            "sessionId": session_id,
            "model": "EXAONE-3.5-7.8B-Instruct",
        })

    except Exception as e:
        print(f"Chat text error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/chat/multimodal", methods=["POST"])
def chat_multimodal():
    """멀티모달 (이미지+텍스트) 채팅 엔드포인트 (Qwen2-VL)"""
    try:
        data = request.json
        message = data.get("message", "").strip()
        image_base64 = data.get("image", "")
        session_id = data.get("sessionId", "")

        if not message and not image_base64:
            return jsonify({"success": False, "error": "메시지 또는 이미지가 필요합니다."}), 400

        # MongoDB에서 관련 데이터 컨텍스트 조회
        db_context = get_chat_db_context(message or "이미지 분석")

        if not image_base64:
            # 이미지가 없으면 텍스트 전용 EXAONE으로 처리
            response = generate_chat_response(message, db_context)
            used_model = "EXAONE-3.5-7.8B-Instruct"
        else:
            # base64 헤더 제거 (data:image/...;base64, 부분)
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]

            # Qwen2-VL로 이미지 분석
            response = generate_multimodal_response(
                message or "이 이미지를 분석해주세요.",
                image_base64,
                db_context
            )
            used_model = "Qwen2-VL-2B-Instruct"

        return jsonify({
            "success": True,
            "response": response,
            "sessionId": session_id,
            "model": used_model,
        })

    except Exception as e:
        print(f"Chat multimodal error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5007, debug=False)