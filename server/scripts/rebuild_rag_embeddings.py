"""
RAG 임베딩 재구축 스크립트
- market_signal 데이터 제외
- marketing_case에서 source_url, tags 컬럼 제외하고 재임베딩
"""
import json
import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModel
import os

# 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data_for_rag')
OUTPUT_PATH = os.path.join(BASE_DIR, 'rag_data', 'rag_embeddings.json')

# 임베딩 모델
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

print(f"Loading embedding model: {MODEL_NAME}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)
model.eval()

def mean_pooling(model_output, attention_mask):
    """Mean pooling for sentence embeddings"""
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

def get_embedding(text: str) -> list:
    """텍스트 임베딩 생성"""
    encoded = tokenizer([text], padding=True, truncation=True, max_length=512, return_tensors='pt')
    with torch.no_grad():
        output = model(**encoded)
    embedding = mean_pooling(output, encoded['attention_mask'])
    embedding = torch.nn.functional.normalize(embedding, p=2, dim=1)
    return embedding.numpy()[0].tolist()

def process_marketing_cases():
    """마케팅 성공 사례 데이터 처리 (source_url, tags 제외)"""
    excel_path = os.path.join(DATA_DIR, '마케팅 성공 사례 데이터셋.xlsx')
    print(f"Loading: {excel_path}")

    df = pd.read_excel(excel_path)
    print(f"Loaded {len(df)} marketing cases")

    # source_url, tags 컬럼 제외
    exclude_cols = ['source_url', 'tags']
    print(f"Excluding columns: {exclude_cols}")

    documents = []
    for idx, row in df.iterrows():
        # 텍스트 생성 (source_url, tags 제외)
        text_parts = [
            f"마케팅 성공 사례 - {row['country']} {row['brand']} {row['product']}",
            f"카테고리: {row['category']}",
            f"타겟: {row['target_persona']}",
            f"문제: {row['core_problem']}",
            f"메시지: {row['key_message']}",
            f"채널: {row['channel']}",
            f"성공요인: {row['why_it_worked']}",
            f"근거: {row['evidence_snippet']}"
        ]
        text = "\n".join(text_parts)

        # 임베딩 생성
        embedding = get_embedding(text)

        # 문서 구조 (source_url, tags 제외)
        doc = {
            "id": f"marketing_{row['case_id']}",
            "type": "marketing_case",
            "case_id": row['case_id'],
            "country": row['country'],
            "brand": row['brand'],
            "product": row['product'],
            "category": row['category'],
            "target_persona": row['target_persona'],
            "core_problem": row['core_problem'],
            "key_message": row['key_message'],
            "creative_format": row['creative_format'],
            "channel": row['channel'],
            "why_it_worked": row['why_it_worked'],
            "evidence_snippet": row['evidence_snippet'],
            # source_url, tags 제외됨
            "text": text,
            "embedding": embedding
        }
        documents.append(doc)

        if (idx + 1) % 20 == 0:
            print(f"  Processed {idx + 1}/{len(df)} documents")

    return documents

def main():
    print("=" * 50)
    print("RAG 임베딩 재구축 시작")
    print("=" * 50)

    # 마케팅 성공 사례만 처리 (market_signal 제외)
    documents = process_marketing_cases()

    # 최종 JSON 구조
    result = {
        "model": MODEL_NAME,
        "dimension": 384,
        "total_documents": len(documents),
        "documents": documents
    }

    # 백업 생성
    if os.path.exists(OUTPUT_PATH):
        backup_path = OUTPUT_PATH.replace('.json', '_backup.json')
        os.rename(OUTPUT_PATH, backup_path)
        print(f"Backup created: {backup_path}")

    # 저장
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n저장 완료: {OUTPUT_PATH}")
    print(f"총 문서 수: {len(documents)}")
    print("- market_signal: 0 (제외됨)")
    print(f"- marketing_case: {len(documents)} (source_url, tags 제외)")

if __name__ == "__main__":
    main()
