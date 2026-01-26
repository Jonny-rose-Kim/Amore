#!/usr/bin/env python3
"""
RAG용 벡터 임베딩 구축 스크립트
- 마케팅 성공 사례 데이터셋
- 시장/제품 신호 데이터셋
- Transformers 직접 사용
"""

import os
import json
import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np

# 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data_for_rag")
OUTPUT_DIR = os.path.join(BASE_DIR, "rag_data")

# 임베딩 모델 (다국어 지원)
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

def mean_pooling(model_output, attention_mask):
    """Mean pooling for sentence embeddings"""
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

def get_embeddings(texts, tokenizer, model, device, batch_size=16):
    """배치 처리로 임베딩 생성"""
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        encoded = tokenizer(batch, padding=True, truncation=True, max_length=512, return_tensors='pt')
        encoded = {k: v.to(device) for k, v in encoded.items()}

        with torch.no_grad():
            output = model(**encoded)

        embeddings = mean_pooling(output, encoded['attention_mask'])
        embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
        all_embeddings.append(embeddings.cpu().numpy())

        print(f"  처리 중: {min(i+batch_size, len(texts))}/{len(texts)}")

    return np.vstack(all_embeddings)

def load_data():
    """엑셀 데이터 로드"""
    marketing_df = pd.read_excel(os.path.join(DATA_DIR, "마케팅 성공 사례 데이터셋.xlsx"))
    signal_df = pd.read_excel(os.path.join(DATA_DIR, "시장, 제품 신호 데이터셋.xlsx"))
    return marketing_df, signal_df

def create_marketing_documents(df):
    """마케팅 성공 사례를 임베딩용 문서로 변환"""
    documents = []
    records = []

    for _, row in df.iterrows():
        # 임베딩할 텍스트 구성 (검색에 최적화)
        text = f"""마케팅 성공 사례 - {row['country']} {row['brand']} {row['product']}
카테고리: {row['category']}
타겟: {row['target_persona']}
문제: {row['core_problem']}
메시지: {row['key_message']}
채널: {row['channel']}
성공요인: {row['why_it_worked']}
근거: {row['evidence_snippet']}"""

        documents.append(text)

        # 메타데이터
        records.append({
            "id": f"marketing_{row['case_id']}",
            "type": "marketing_case",
            "case_id": str(row['case_id']),
            "country": str(row['country']),
            "brand": str(row['brand']),
            "product": str(row['product']),
            "category": str(row['category']),
            "target_persona": str(row['target_persona']),
            "core_problem": str(row['core_problem']),
            "key_message": str(row['key_message']),
            "creative_format": str(row['creative_format']),
            "channel": str(row['channel']),
            "why_it_worked": str(row['why_it_worked']),
            "evidence_snippet": str(row['evidence_snippet']),
            "source_url": str(row['source_url']) if pd.notna(row['source_url']) else "",
            "tags": str(row['tags']),
            "text": text
        })

    return documents, records

def create_signal_documents(df):
    """시장/제품 신호를 임베딩용 문서로 변환"""
    documents = []
    records = []

    for _, row in df.iterrows():
        # 임베딩할 텍스트 구성
        text = f"""시장 신호 - {row['country']} {row['platform']} {row['brand']} {row['product']}
카테고리: {row['category']}
성분: {row['ingredient']}
제형: {row['texture_form']}
효과: {row['effect']}
시기: {row['time_window']}
신호유형: {row['signal_type']} ({row['signal_strength']})
근거: {row['evidence_summary']}"""

        documents.append(text)

        # 메타데이터
        records.append({
            "id": f"signal_{row['trend_id']}",
            "type": "market_signal",
            "trend_id": str(row['trend_id']),
            "country": str(row['country']),
            "platform": str(row['platform']),
            "brand": str(row['brand']),
            "product": str(row['product']),
            "category": str(row['category']),
            "ingredient": str(row['ingredient']) if pd.notna(row['ingredient']) else "",
            "texture_form": str(row['texture_form']) if pd.notna(row['texture_form']) else "",
            "effect": str(row['effect']) if pd.notna(row['effect']) else "",
            "time_window": str(row['time_window']),
            "signal_type": str(row['signal_type']),
            "signal_strength": str(row['signal_strength']),
            "evidence_summary": str(row['evidence_summary']),
            "source_platform_detail": str(row['source_platform_detail']),
            "linked_case_ids": str(row['linked_case_ids']) if pd.notna(row['linked_case_ids']) else "",
            "text": text
        })

    return documents, records

def build_embeddings():
    """임베딩 구축"""
    print("=" * 60)
    print("RAG 벡터 임베딩 구축 시작")
    print("=" * 60)

    # 1. 데이터 로드
    print("\n[1/5] 데이터 로드 중...")
    marketing_df, signal_df = load_data()
    print(f"   - 마케팅 성공 사례: {len(marketing_df)}건")
    print(f"   - 시장/제품 신호: {len(signal_df)}건")

    # 2. 문서 생성
    print("\n[2/5] 문서 생성 중...")
    marketing_docs, marketing_records = create_marketing_documents(marketing_df)
    signal_docs, signal_records = create_signal_documents(signal_df)

    all_documents = marketing_docs + signal_docs
    all_records = marketing_records + signal_records

    print(f"   - 총 문서 수: {len(all_documents)}건")

    # 3. 임베딩 모델 로드
    print(f"\n[3/5] 임베딩 모델 로드 중: {MODEL_NAME}")
    # CPU 사용 (GPU 메모리 절약)
    device = torch.device("cpu")
    print(f"   - 디바이스: {device}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModel.from_pretrained(MODEL_NAME).to(device)
    model.eval()

    # 4. 임베딩 생성
    print("\n[4/5] 임베딩 생성 중...")
    embeddings = get_embeddings(all_documents, tokenizer, model, device)
    print(f"   - 임베딩 차원: {embeddings.shape[1]}")

    # 5. 저장
    print(f"\n[5/5] 저장 중: {OUTPUT_DIR}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 임베딩을 records에 추가
    for i, record in enumerate(all_records):
        record["embedding"] = embeddings[i].tolist()

    # JSON으로 저장
    output_file = os.path.join(OUTPUT_DIR, "rag_embeddings.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "model": MODEL_NAME,
            "dimension": int(embeddings.shape[1]),
            "total_documents": len(all_records),
            "documents": all_records
        }, f, ensure_ascii=False, indent=2)

    print(f"   - 저장 완료: {output_file}")

    # 테스트 쿼리
    print("\n[테스트] 유사도 검색...")
    test_query = "일본 시장에서 VT 리들샷 마케팅"
    test_embedding = get_embeddings([test_query], tokenizer, model, device)[0]

    # 코사인 유사도 계산
    similarities = np.dot(embeddings, test_embedding)
    top_indices = np.argsort(similarities)[::-1][:3]

    print(f"   쿼리: '{test_query}'")
    print(f"   TOP 3 결과:")
    for i, idx in enumerate(top_indices):
        print(f"     {i+1}. {all_records[idx]['id']} (유사도: {similarities[idx]:.3f})")
        print(f"        - {all_records[idx].get('brand', '')} {all_records[idx].get('product', '')}")

    print("\n" + "=" * 60)
    print("RAG 벡터 임베딩 구축 완료!")
    print("=" * 60)

    return output_file

if __name__ == "__main__":
    build_embeddings()
