#!/usr/bin/env python3
"""
키워드별 리뷰 요약 생성 스크립트
- 리더보드 키워드별로 긍정/부정 문장들을 EXAONE으로 요약
- keyword_summaries 컬렉션에 저장
"""

import os
import sys
import time
import json
import requests
from datetime import datetime, timezone
from pymongo import MongoClient

MONGO_URI = 'mongodb://localhost:27017/amore'
EXAONE_URL = 'http://localhost:5006/api/llm/summarize-reviews'

# 요약에 사용할 샘플 문장 수
SAMPLE_SIZE = 10


def get_sentences_for_keyword(db, keyword: str, sentiment: str, limit: int = SAMPLE_SIZE) -> list:
    """키워드와 관련된 문장들 가져오기"""
    # 키워드가 content에 포함된 문장 검색
    query = {
        'country': 'usa',
        'sentiment': sentiment,
        '$or': [
            {'content': {'$regex': keyword, '$options': 'i'}},
            {'keywords': {'$elemMatch': {'$regex': keyword, '$options': 'i'}}}
        ]
    }

    sentences = list(db.review_sentences.find(query).limit(limit))
    return sentences


def generate_summary_with_exaone(keyword: str, sentiment: str, sentences: list) -> str:
    """EXAONE을 사용하여 요약 생성"""
    if not sentences:
        return None

    sentiment_kr = "긍정적" if sentiment == "positive" else "부정적"

    # 문장 텍스트 추출
    texts = [s.get('content', '')[:200] for s in sentences]
    reviews_text = "\n".join([f"- {t}" for t in texts])

    prompt = f"""다음은 "{keyword}" 키워드와 관련된 {sentiment_kr} 화장품 리뷰 문장들입니다.

리뷰 샘플:
{reviews_text}

위 리뷰들의 공통된 특징과 소비자 의견을 3-4문장으로 요약해주세요.
- "{keyword}"에 대해 소비자들이 어떻게 평가하는지
- 주요 장점 또는 단점
- 전반적인 만족도

반드시 한국어로 작성하세요."""

    try:
        response = requests.post(
            'http://localhost:5006/api/llm/classify-review',
            json={'prompt': prompt, 'max_tokens': 500},
            timeout=120
        )

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                return result.get('response', '').strip()
    except Exception as e:
        print(f"    EXAONE 에러: {e}")

    return None


def main():
    print("=" * 60)
    print("키워드별 리뷰 요약 생성 (EXAONE)")
    print(f"시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # MongoDB 연결
    client = MongoClient(MONGO_URI)
    db = client.amore

    # EXAONE 연결 테스트
    try:
        resp = requests.get('http://localhost:5006/health', timeout=5)
        print(f"EXAONE 서버: {resp.json()}")
    except:
        print("EXAONE 서버 연결 실패!")
        return

    # 기존 요약 삭제
    db.keyword_summaries.delete_many({'country': 'usa'})
    print("기존 요약 삭제 완료")

    # 리더보드 키워드 가져오기
    keywords = list(db.processed_keywords.find({'country': 'usa'}))
    print(f"\n총 {len(keywords)}개 키워드 처리 시작...")

    generated = 0
    skipped = 0

    for i, kw_doc in enumerate(keywords):
        keyword = kw_doc.get('keyword', kw_doc.get('name', ''))
        if not keyword:
            continue

        for sentiment in ['positive', 'negative']:
            # 해당 키워드의 문장들 가져오기
            sentences = get_sentences_for_keyword(db, keyword, sentiment)

            if len(sentences) < 3:
                skipped += 1
                continue

            # EXAONE으로 요약 생성
            summary = generate_summary_with_exaone(keyword, sentiment, sentences)

            if summary:
                # DB에 저장
                summary_doc = {
                    'keyword': keyword,
                    'country': 'usa',
                    'sentiment': sentiment,
                    'summary': summary,
                    'reviewCount': len(sentences),
                    'sampleReviews': [
                        {
                            'content': s.get('content', '')[:200],
                            'contentKr': s.get('contentKr', ''),
                            'product': s.get('productName', ''),
                            'brand': s.get('brand', ''),
                            'rating': s.get('rating', 0)
                        }
                        for s in sentences[:5]
                    ],
                    'generatedAt': datetime.now(timezone.utc),
                    'source': 'EXAONE-3.5-7.8B'
                }

                db.keyword_summaries.insert_one(summary_doc)
                generated += 1

                if generated <= 5:
                    print(f"\n  [{keyword}] {sentiment}:")
                    print(f"    {summary[:100]}...")

            time.sleep(0.5)  # Rate limiting

        if (i + 1) % 20 == 0:
            print(f"\n  진행: {i + 1}/{len(keywords)} 키워드 ({generated}개 요약 생성)")

    # 인덱스 생성
    db.keyword_summaries.create_index([('keyword', 1), ('country', 1), ('sentiment', 1)])

    print(f"\n{'=' * 60}")
    print(f"요약 생성 완료!")
    print(f"생성된 요약: {generated}개")
    print(f"스킵 (문장 부족): {skipped}개")
    print(f"완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    client.close()


if __name__ == '__main__':
    main()
