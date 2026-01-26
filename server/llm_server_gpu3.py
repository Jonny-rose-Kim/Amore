"""
VLM Chatbot Server GPU3 for AMORE CLUE Dashboard
Uses Qwen/Qwen2-VL-2B-Instruct on cuda:3
Endpoints: chat/text, chat/multimodal, chat/health
Features: RAG (ChromaDB), MongoDB context, VLM (image+text)
"""
import os
import json
import re
import uuid
import base64
import io
from datetime import datetime

import torch
from flask import Flask, request, jsonify
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
from qwen_vl_utils import process_vision_info
from PIL import Image
import chromadb
from chromadb.config import Settings
from pymongo import MongoClient

app = Flask(__name__)

# ===== Configuration =====
DEVICE = "cuda:7"
MODEL_NAME = "Qwen/Qwen2-VL-2B-Instruct"
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.environ.get("MONGODB_DATABASE", "amore")
CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "vector_db", "chat_history")

# ===== Model Loading =====
print(f"Loading VLM model: {MODEL_NAME} on {DEVICE}...")
processor = AutoProcessor.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = Qwen2VLForConditionalGeneration.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map=DEVICE,
    trust_remote_code=True,
)
model.eval()
print(f"VLM model loaded successfully on {DEVICE}!")

# ===== MongoDB Connection =====
mongo_client = None
mongo_db = None
try:
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    mongo_client.server_info()
    mongo_db = mongo_client[MONGODB_DATABASE]
    print(f"MongoDB connected: {MONGODB_DATABASE}")
except Exception as e:
    print(f"MongoDB connection failed: {e}")

# ===== ChromaDB Setup =====
os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
chroma_client = chromadb.Client(Settings(
    persist_directory=CHROMA_PERSIST_DIR,
    anonymized_telemetry=False,
    is_persistent=True,
))
chat_collection = chroma_client.get_or_create_collection(
    name="chat_history",
    metadata={"description": "AMORE CLUE chatbot conversation history"}
)
print(f"ChromaDB initialized: {CHROMA_PERSIST_DIR}")

# ===== System Prompt =====
SYSTEM_PROMPT = """당신은 AMORE CLUE 대시보드의 K-뷰티 이미지 분석 AI 어시스턴트입니다.

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


def get_rag_context(query: str, top_k: int = 3) -> str:
    """ChromaDB에서 유사한 이전 대화 검색"""
    try:
        if chat_collection.count() == 0:
            return ""

        results = chat_collection.query(
            query_texts=[query],
            n_results=min(top_k, chat_collection.count()),
        )

        if not results or not results["documents"] or not results["documents"][0]:
            return ""

        context_parts = []
        for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
            context_parts.append(f"Q: {meta.get('question', '')}\nA: {doc}")

        return "\n---\n".join(context_parts)
    except Exception as e:
        print(f"RAG search error: {e}")
        return ""


def get_mongodb_context(query: str) -> str:
    """MongoDB에서 관련 트렌드/리더보드/SNS 데이터 조회 (풍부한 컨텍스트)"""
    if mongo_db is None:
        return ""

    try:
        context_parts = []

        # 1. 트렌드 데이터 조회
        try:
            trends_collection = mongo_db.get_collection("trends")
            trends = list(trends_collection.find(
                {},
                {"combination": 1, "category": 1, "score": 1, "country": 1, "ingredients": 1, "effects": 1, "_id": 0}
            ).sort("score", -1).limit(15))

            if trends:
                trend_summary = ", ".join([
                    f"{t.get('combination', '')}({t.get('category', '')}/{t.get('score', 0)}점)"
                    for t in trends
                ])
                context_parts.append(f"[인기 트렌드 조합 Top15] {trend_summary}")
        except Exception as e:
            print(f"Trends query error: {e}")

        # 2. 리더보드 데이터 조회
        try:
            leaderboard_collection = mongo_db.get_collection("leaderboard")
            leaders = list(leaderboard_collection.find(
                {},
                {"keyword": 1, "score": 1, "trendLevel": 1, "itemType": 1, "country": 1, "_id": 0}
            ).sort("score", -1).limit(20))

            if leaders:
                # 국가별로 그룹화
                by_country = {}
                for l in leaders:
                    country = l.get("country", "usa")
                    if country not in by_country:
                        by_country[country] = []
                    by_country[country].append(f"{l.get('keyword', '')}({l.get('trendLevel', '')}/{l.get('score', 0)}점)")

                for country, keywords in by_country.items():
                    country_name = {"usa": "미국", "japan": "일본", "singapore": "싱가포르"}.get(country, country)
                    context_parts.append(f"[{country_name} 인기 키워드] {', '.join(keywords[:10])}")
        except Exception as e:
            print(f"Leaderboard query error: {e}")

        # 3. SNS 플랫폼 통계
        try:
            sns_collection = mongo_db.get_collection("sns_platform_stats")
            sns_stats = list(sns_collection.find(
                {},
                {"keyword": 1, "platform": 1, "mentionCount": 1, "_id": 0}
            ).sort("mentionCount", -1).limit(10))

            if sns_stats:
                sns_summary = ", ".join([
                    f"{s.get('keyword', '')}({s.get('platform', '')}/{s.get('mentionCount', 0)}건)"
                    for s in sns_stats
                ])
                context_parts.append(f"[SNS 인기 키워드] {sns_summary}")
        except Exception as e:
            print(f"SNS stats query error: {e}")

        # 4. 리뷰 키워드 통계
        try:
            review_collection = mongo_db.get_collection("review_keywords")
            review_keywords = list(review_collection.find(
                {},
                {"keyword": 1, "sentiment": 1, "count": 1, "_id": 0}
            ).sort("count", -1).limit(15))

            if review_keywords:
                positive = [r for r in review_keywords if r.get("sentiment") == "positive"]
                if positive:
                    pos_summary = ", ".join([f"{r.get('keyword', '')}({r.get('count', 0)}건)" for r in positive[:8]])
                    context_parts.append(f"[긍정 리뷰 키워드] {pos_summary}")
        except Exception as e:
            print(f"Review keywords query error: {e}")

        return "\n".join(context_parts)
    except Exception as e:
        print(f"MongoDB context error: {e}")
        return ""


def save_conversation(session_id: str, question: str, answer: str):
    """대화를 MongoDB와 ChromaDB에 저장"""
    try:
        # MongoDB에 저장
        if mongo_db is not None:
            mongo_db.get_collection("chat_conversations").insert_one({
                "sessionId": session_id,
                "question": question,
                "answer": answer,
                "timestamp": datetime.utcnow(),
            })

        # ChromaDB에 임베딩 저장
        doc_id = str(uuid.uuid4())
        chat_collection.add(
            documents=[answer],
            metadatas=[{"question": question, "sessionId": session_id, "timestamp": datetime.utcnow().isoformat()}],
            ids=[doc_id],
        )
    except Exception as e:
        print(f"Save conversation error: {e}")


def remove_repetitions(text: str) -> str:
    """텍스트에서 반복되는 문장/구문 제거"""
    # 줄 단위로 분리
    lines = text.split('\n')
    seen_lines = set()
    unique_lines = []

    for line in lines:
        # 정규화된 버전으로 비교 (공백, 특수문자 제거)
        normalized = re.sub(r'[^\w가-힣]', '', line.lower())
        if normalized and len(normalized) > 10:  # 짧은 줄은 무시
            if normalized in seen_lines:
                continue
            seen_lines.add(normalized)
        unique_lines.append(line)

    # 연속 반복 문장 제거
    result = '\n'.join(unique_lines)

    # 같은 문장이 2번 이상 나오면 첫 번째만 유지
    sentences = re.split(r'(?<=[.!?])\s+', result)
    seen_sentences = set()
    unique_sentences = []

    for sentence in sentences:
        normalized = re.sub(r'[^\w가-힣]', '', sentence.lower())
        if normalized and len(normalized) > 20:
            if normalized in seen_sentences:
                continue
            seen_sentences.add(normalized)
        unique_sentences.append(sentence)

    return ' '.join(unique_sentences)


def generate_text_response(user_message: str, rag_context: str, db_context: str) -> str:
    """텍스트 전용 VLM 응답 생성 (반복 방지 강화)"""
    # 프롬프트 구성
    context_block = ""
    if rag_context:
        context_block += f"\n[이전 관련 대화]\n{rag_context}\n"
    if db_context:
        context_block += f"\n[현재 DB 데이터]\n{db_context}\n"

    full_prompt = f"{context_block}\n사용자 질문: {user_message}\n\n답변 시 같은 내용을 반복하지 마세요." if context_block else f"{user_message}\n\n답변 시 같은 내용을 반복하지 마세요."

    messages = [
        {"role": "system", "content": [{"type": "text", "text": SYSTEM_PROMPT}]},
        {"role": "user", "content": [{"type": "text", "text": full_prompt}]},
    ]

    text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = processor(text=[text], return_tensors="pt", padding=True).to(DEVICE)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=1024,
            temperature=0.7,
            top_p=0.85,
            do_sample=True,
            repetition_penalty=1.3,  # 반복 방지 강화 (1.1 → 1.3)
            no_repeat_ngram_size=4,  # 4-gram 반복 금지
        )

    generated = outputs[0][inputs["input_ids"].shape[1]:]
    response = processor.decode(generated, skip_special_tokens=True)

    # 후처리: 반복 문장 제거
    response = remove_repetitions(response)

    return response.strip()


def generate_multimodal_response(user_message: str, image_base64: str, rag_context: str, db_context: str) -> str:
    """멀티모달 (이미지+텍스트) VLM 응답 생성 (반복 방지 강화)"""
    # base64 → PIL Image
    image_data = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")

    # 프롬프트 구성
    context_block = ""
    if rag_context:
        context_block += f"\n[이전 관련 대화]\n{rag_context}\n"
    if db_context:
        context_block += f"\n[현재 DB 데이터]\n{db_context}\n"

    text_content = f"""{context_block}
사용자 질문: {user_message}

위 이미지를 분석하고 질문에 답변해주세요.
중요: 같은 내용을 반복하지 말고, 한 번 언급한 내용은 다시 언급하지 마세요.""" if context_block else f"""{user_message}

위 이미지를 분석하고 질문에 답변해주세요.
중요: 같은 내용을 반복하지 말고, 한 번 언급한 내용은 다시 언급하지 마세요."""

    messages = [
        {"role": "system", "content": [{"type": "text", "text": SYSTEM_PROMPT}]},
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
        outputs = model.generate(
            **inputs,
            max_new_tokens=1024,
            temperature=0.7,
            top_p=0.85,
            do_sample=True,
            repetition_penalty=1.3,  # 반복 방지 강화 (1.1 → 1.3)
            no_repeat_ngram_size=4,  # 4-gram 반복 금지
        )

    generated = outputs[0][inputs["input_ids"].shape[1]:]
    response = processor.decode(generated, skip_special_tokens=True)

    # 후처리: 반복 문장 제거
    response = remove_repetitions(response)

    return response.strip()


# ===== API Endpoints =====

@app.route("/api/chat/text", methods=["POST"])
def chat_text():
    """텍스트 전용 채팅 엔드포인트"""
    try:
        data = request.json
        message = data.get("message", "").strip()
        session_id = data.get("sessionId", str(uuid.uuid4()))

        if not message:
            return jsonify({"success": False, "error": "메시지가 비어있습니다."}), 400

        # RAG: 유사 이전 대화 검색
        rag_context = get_rag_context(message)

        # MongoDB: 관련 데이터 조회
        db_context = get_mongodb_context(message)

        # VLM 응답 생성
        response = generate_text_response(message, rag_context, db_context)

        # 대화 저장
        save_conversation(session_id, message, response)

        return jsonify({
            "success": True,
            "response": response,
            "sessionId": session_id,
        })

    except Exception as e:
        print(f"Chat text error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/chat/multimodal", methods=["POST"])
def chat_multimodal():
    """멀티모달 (이미지+텍스트) 채팅 엔드포인트"""
    try:
        data = request.json
        message = data.get("message", "").strip()
        image_base64 = data.get("image", "")
        session_id = data.get("sessionId", str(uuid.uuid4()))

        if not message and not image_base64:
            return jsonify({"success": False, "error": "메시지 또는 이미지가 필요합니다."}), 400

        if not image_base64:
            # 이미지가 없으면 텍스트 전용으로 처리
            rag_context = get_rag_context(message)
            db_context = get_mongodb_context(message)
            response = generate_text_response(message, rag_context, db_context)
        else:
            # base64 헤더 제거 (data:image/...;base64, 부분)
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]

            rag_context = get_rag_context(message or "이미지 분석")
            db_context = get_mongodb_context(message or "이미지 분석")
            response = generate_multimodal_response(message or "이 이미지를 분석해주세요.", image_base64, rag_context, db_context)

        # 대화 저장
        save_conversation(session_id, message or "[이미지 분석]", response)

        return jsonify({
            "success": True,
            "response": response,
            "sessionId": session_id,
        })

    except Exception as e:
        print(f"Chat multimodal error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/chat/health", methods=["GET"])
def health_check():
    """헬스체크 엔드포인트"""
    return jsonify({
        "status": "ok",
        "model": MODEL_NAME,
        "device": DEVICE,
        "port": 5008,
        "mongodb": "connected" if mongo_db is not None else "disconnected",
        "chromadb_docs": chat_collection.count(),
    })


if __name__ == "__main__":
    print(f"\n{'='*50}")
    print(f"  AMORE CLUE VLM Chatbot Server")
    print(f"  Model: {MODEL_NAME}")
    print(f"  Device: {DEVICE}")
    print(f"  Port: 5008")
    print(f"  MongoDB: {'connected' if mongo_db is not None else 'disconnected'}")
    print(f"  ChromaDB: {CHROMA_PERSIST_DIR}")
    print(f"{'='*50}\n")
    app.run(host="0.0.0.0", port=5008, debug=False)
