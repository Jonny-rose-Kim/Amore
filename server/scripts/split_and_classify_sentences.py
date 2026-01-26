#!/usr/bin/env python3
"""
리뷰를 문장 단위로 분리하고 각 문장을 분류하는 스크립트

1. raw_reviews에서 리뷰를 가져옴
2. 문장 단위로 분리
3. 각 문장을 긍정/부정 + 리뷰 유형으로 분류
4. 한국어 번역 추가
5. review_sentences 컬렉션에 저장
"""

import os
import re
from datetime import datetime, timezone
from pymongo import MongoClient
from googletrans import Translator

MONGO_URI = 'mongodb://localhost:27017/amore'

# 리뷰 유형과 키워드 매핑
REVIEW_TYPE_KEYWORDS = {
    '효과': ['work', 'effect', 'result', 'improve', 'clear', 'bright', 'change', 'difference', 'better', 'amazing', 'love it', 'great', 'perfect', 'fantastic'],
    '보습': ['hydrat', 'moistur', 'dry', 'plump', 'dewy', 'soft', 'smooth', 'nourish', 'water', 'moisture'],
    '텍스처': ['texture', 'absorb', 'sticky', 'light', 'silky', 'creamy', 'thick', 'thin', 'spread', 'apply', 'sink'],
    '향': ['smell', 'scent', 'fragrance', 'odor', 'perfume', 'aroma'],
    '가성비': ['price', 'value', 'worth', 'money', 'afford', 'cheap', 'expensive', 'cost', 'deal', 'budget'],
    '자극': ['irritat', 'sensitiv', 'break out', 'acne', 'redness', 'burn', 'sting', 'reaction', 'allerg'],
    '지속력': ['last', 'stay', 'hour', 'all day', 'long', 'wear', 'fade', 'duration'],
    '흡수력': ['absorb', 'sink', 'quick', 'fast', 'instant', 'residue', 'greasy'],
    '재구매': ['repurchase', 'buy again', 'reorder', 'stock up', 'recommend', 'must have', 'holy grail'],
    '성분': ['ingredient', 'vitamin', 'acid', 'extract', 'niacinamide', 'retinol', 'hyaluronic', 'snail', 'centella']
}

# 긍정/부정 키워드
POSITIVE_KEYWORDS = ['love', 'great', 'amazing', 'perfect', 'excellent', 'fantastic', 'wonderful', 'best', 'good', 'nice', 'happy', 'recommend', 'worth', 'effective', 'smooth', 'soft', 'hydrat', 'moistur', 'gentle', 'sooth']
NEGATIVE_KEYWORDS = ['hate', 'bad', 'terrible', 'awful', 'worst', 'disappoint', 'waste', 'broke out', 'irritat', 'burn', 'sting', 'sticky', 'greasy', 'expensive', 'not worth', 'don\'t like', 'didn\'t work', 'no effect', 'dry out']


def split_into_sentences(text: str) -> list:
    """텍스트를 문장 단위로 분리"""
    # 기본 문장 분리 (마침표, 느낌표, 물음표)
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    # 빈 문장 제거 및 최소 길이 필터
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    return sentences


def classify_sentence(sentence: str) -> dict:
    """문장을 분류 (sentiment + reviewType)"""
    sentence_lower = sentence.lower()

    # Sentiment 분류
    positive_score = sum(1 for kw in POSITIVE_KEYWORDS if kw in sentence_lower)
    negative_score = sum(1 for kw in NEGATIVE_KEYWORDS if kw in sentence_lower)

    if positive_score > negative_score:
        sentiment = 'positive'
    elif negative_score > positive_score:
        sentiment = 'negative'
    else:
        sentiment = 'positive'  # 기본값

    # ReviewType 분류
    type_scores = {}
    for review_type, keywords in REVIEW_TYPE_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in sentence_lower)
        if score > 0:
            type_scores[review_type] = score

    if type_scores:
        review_type = max(type_scores, key=type_scores.get)
    else:
        review_type = '효과'  # 기본값

    return {'sentiment': sentiment, 'reviewType': review_type}


def translate_to_korean(text: str, translator) -> str:
    """영어를 한국어로 번역"""
    try:
        # 이미 한국어가 포함된 경우 스킵
        if any('\uac00' <= char <= '\ud7a3' for char in text):
            return None

        result = translator.translate(text, src='en', dest='ko')
        return result.text
    except Exception as e:
        return None


def main():
    print("=" * 60)
    print("리뷰 문장 분리 및 분류 시작")
    print("=" * 60)

    # MongoDB 연결
    client = MongoClient(MONGO_URI)
    db = client.amore

    # 기존 review_sentences 삭제
    db.review_sentences.delete_many({'country': 'usa'})
    print("기존 데이터 삭제 완료")

    # 번역기 초기화
    try:
        translator = Translator()
        use_translator = True
        print("✅ 번역기 초기화 성공")
    except:
        use_translator = False
        print("⚠️ 번역기 초기화 실패")

    # raw_reviews에서 리뷰 가져오기
    reviews = list(db.raw_reviews.find({'country': 'usa'}).limit(2000))
    print(f"\n총 {len(reviews)}개 리뷰 처리 시작...")

    sentence_count = 0
    batch = []

    for i, review in enumerate(reviews):
        content = review.get('content', '')
        if not content or len(content) < 15:
            continue

        # 문장 분리
        sentences = split_into_sentences(content)

        for sent in sentences:
            # 분류
            classification = classify_sentence(sent)

            # 한국어 번역
            korean_translation = None
            if use_translator and len(sent) < 500:
                korean_translation = translate_to_korean(sent, translator)

            # 문장 문서 생성
            sentence_doc = {
                'reviewId': str(review.get('_id')),
                'productId': review.get('productId', ''),
                'productName': review.get('productName', review.get('product', '')),
                'brand': review.get('brand', ''),
                'content': sent,
                'contentKr': korean_translation,
                'sentiment': classification['sentiment'],
                'reviewType': classification['reviewType'],
                'rating': review.get('rating', 0),
                'country': 'usa',
                'category': review.get('category', ''),
                'keywords': review.get('keywords', []),
                'source': review.get('source', ''),
                'createdAt': datetime.now(timezone.utc)
            }

            batch.append(sentence_doc)
            sentence_count += 1

            # 배치 저장 (100개씩)
            if len(batch) >= 100:
                db.review_sentences.insert_many(batch)
                batch = []

        if (i + 1) % 200 == 0:
            print(f"  진행: {i + 1}/{len(reviews)} 리뷰 ({sentence_count} 문장)")

    # 남은 배치 저장
    if batch:
        db.review_sentences.insert_many(batch)

    print(f"\n✅ 완료: {sentence_count}개 문장 저장됨")

    # 인덱스 생성
    db.review_sentences.create_index([('country', 1), ('sentiment', 1), ('reviewType', 1)])
    db.review_sentences.create_index([('keywords', 1)])
    db.review_sentences.create_index([('productName', 1)])
    print("인덱스 생성 완료")

    # 통계 출력
    print("\n[분류 통계]")
    for review_type in REVIEW_TYPE_KEYWORDS.keys():
        pos = db.review_sentences.count_documents({'country': 'usa', 'reviewType': review_type, 'sentiment': 'positive'})
        neg = db.review_sentences.count_documents({'country': 'usa', 'reviewType': review_type, 'sentiment': 'negative'})
        if pos > 0 or neg > 0:
            print(f"  {review_type}: 긍정 {pos} / 부정 {neg}")

    total_pos = db.review_sentences.count_documents({'country': 'usa', 'sentiment': 'positive'})
    total_neg = db.review_sentences.count_documents({'country': 'usa', 'sentiment': 'negative'})
    print(f"\n  총계: 긍정 {total_pos} / 부정 {total_neg}")

    client.close()


if __name__ == '__main__':
    main()
