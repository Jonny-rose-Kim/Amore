#!/usr/bin/env python3
"""
EXAONE을 사용하여 리뷰를 분류하고 요약하는 배치 스크립트

1. raw_reviews에서 리뷰를 가져옴
2. EXAONE으로 각 리뷰의 sentiment(긍정/부정)와 reviewType(보습, 효과 등) 분류
3. 분류 결과를 raw_reviews에 업데이트
4. 각 reviewType별 EXAONE 요약 생성 → keyword_summaries에 저장
"""

import os
import sys
import json
import requests
from datetime import datetime, timezone
from pymongo import MongoClient
from dotenv import load_dotenv
import time

# .env 파일 로드
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/amore')
EXAONE_URL = os.getenv('EXAONE_URL', 'http://localhost:5006')  # GPU6

# 리뷰 유형 목록
REVIEW_TYPES = ['효과', '보습', '텍스처', '향', '가성비', '자극', '지속력', '흡수력']


def call_exaone(prompt: str, max_tokens: int = 500) -> str:
    """EXAONE API 호출"""
    try:
        response = requests.post(
            f"{EXAONE_URL}/api/llm/classify-review",
            json={
                'prompt': prompt,
                'max_tokens': max_tokens
            },
            timeout=60
        )
        if response.status_code == 200:
            result = response.json()
            return result.get('response', result.get('text', ''))
        else:
            print(f"EXAONE API error: {response.status_code}")
            return None
    except Exception as e:
        print(f"EXAONE request failed: {e}")
        return None


def classify_review_with_exaone(review_content: str, rating: float) -> dict:
    """EXAONE으로 리뷰 분류 (sentiment + reviewType)"""

    prompt = f"""다음 화장품 리뷰를 분석해주세요.

리뷰: "{review_content}"
평점: {rating}/5

다음 형식으로만 답변하세요:
sentiment: [positive 또는 negative]
reviewType: [효과, 보습, 텍스처, 향, 가성비, 자극, 지속력, 흡수력 중 하나]

분류 기준:
- sentiment: 평점 4-5는 positive, 1-2는 negative, 3은 리뷰 내용으로 판단
- reviewType: 리뷰 내용에서 가장 주된 주제를 선택
  - 효과: 피부 개선, 결과, 변화 언급
  - 보습: 수분, 촉촉함, 건조함 언급
  - 텍스처: 질감, 흡수, 끈적임, 가벼움 언급
  - 향: 냄새, 향기 언급
  - 가성비: 가격, 가치, 용량 언급
  - 자극: 민감성, 자극, 트러블 언급
  - 지속력: 유지, 지속 시간 언급
  - 흡수력: 흡수 속도, 스며듦 언급"""

    response = call_exaone(prompt, max_tokens=100)

    if response:
        # 응답 파싱
        sentiment = 'positive' if rating >= 4 else 'negative' if rating <= 2 else 'positive'
        review_type = '효과'  # 기본값

        lines = response.strip().split('\n')
        for line in lines:
            if 'sentiment:' in line.lower():
                if 'negative' in line.lower():
                    sentiment = 'negative'
                elif 'positive' in line.lower():
                    sentiment = 'positive'
            if 'reviewtype:' in line.lower() or 'review_type:' in line.lower():
                for rt in REVIEW_TYPES:
                    if rt in line:
                        review_type = rt
                        break

        return {'sentiment': sentiment, 'reviewType': review_type}

    # EXAONE 실패 시 규칙 기반 분류
    return classify_review_rule_based(review_content, rating)


def classify_review_rule_based(content: str, rating: float) -> dict:
    """규칙 기반 리뷰 분류 (EXAONE 실패 시 폴백)"""
    content_lower = content.lower()

    # Sentiment 분류
    sentiment = 'positive' if rating >= 4 else 'negative' if rating <= 2 else 'positive'

    # ReviewType 분류 (키워드 매칭)
    type_keywords = {
        '보습': ['hydrat', 'moistur', 'dry', 'plump', '촉촉', '수분', 'dewy'],
        '효과': ['result', 'effect', 'improve', 'work', 'change', 'clear', 'bright', '효과'],
        '텍스처': ['texture', 'absorb', 'sticky', 'light', 'smooth', 'silky', '질감', '흡수'],
        '향': ['smell', 'scent', 'fragrance', 'odor', '향', '냄새'],
        '가성비': ['price', 'value', 'worth', 'money', 'affordable', 'expensive', '가격', '가성비'],
        '자극': ['irritat', 'sensitiv', 'break out', 'acne', 'redness', 'burn', '자극', '민감'],
        '지속력': ['last', 'stay', 'hour', 'all day', 'wear', '지속', '유지'],
        '흡수력': ['sink', 'absorb', 'quick', 'fast', 'residue', '흡수', '스며'],
    }

    # 키워드 매칭으로 타입 결정
    type_scores = {t: 0 for t in REVIEW_TYPES}
    for review_type, keywords in type_keywords.items():
        for kw in keywords:
            if kw in content_lower:
                type_scores[review_type] += 1

    # 가장 높은 점수의 타입 선택
    max_type = max(type_scores, key=type_scores.get)
    if type_scores[max_type] == 0:
        max_type = '효과'  # 기본값

    return {'sentiment': sentiment, 'reviewType': max_type}


def generate_type_summary_with_exaone(reviews: list, review_type: str, sentiment: str) -> str:
    """EXAONE으로 리뷰 유형별 요약 생성"""

    # 샘플 리뷰 텍스트 준비
    sample_texts = [r.get('content', '')[:200] for r in reviews[:5]]
    reviews_text = '\n'.join([f"- {t}" for t in sample_texts if t])

    sentiment_kr = '긍정적' if sentiment == 'positive' else '부정적'

    prompt = f"""다음은 화장품에 대한 "{review_type}" 관련 {sentiment_kr} 리뷰들입니다.

리뷰 샘플:
{reviews_text}

위 리뷰들의 공통된 특징과 소비자 의견을 2-3문장으로 요약해주세요.
- 소비자들이 {review_type}에 대해 어떻게 평가하는지
- 주요 장점 또는 단점
- 전반적인 만족도"""

    response = call_exaone(prompt, max_tokens=300)

    if response:
        return response.strip()

    # 폴백 요약
    return generate_fallback_summary(review_type, sentiment, len(reviews))


def generate_fallback_summary(review_type: str, sentiment: str, count: int) -> str:
    """폴백 요약 생성"""
    positive_templates = {
        '효과': f"총 {count}건의 긍정 리뷰에서 소비자들은 눈에 띄는 피부 개선 효과를 경험했다고 보고했습니다. 지속적인 사용 후 피부 톤 개선과 탄력 증가에 대한 만족도가 높게 나타났습니다.",
        '보습': f"총 {count}건의 긍정 리뷰에서 소비자들은 뛰어난 보습력과 촉촉한 사용감을 높이 평가했습니다. 건성 피부 사용자들의 만족도가 특히 높았습니다.",
        '텍스처': f"총 {count}건의 긍정 리뷰에서 소비자들은 가볍고 산뜻한 텍스처를 칭찬했습니다. 빠른 흡수력과 끈적임 없는 마무리감이 좋은 평가를 받았습니다.",
        '향': f"총 {count}건의 긍정 리뷰에서 소비자들은 은은하고 기분 좋은 향에 대해 만족감을 표현했습니다.",
        '가성비': f"총 {count}건의 긍정 리뷰에서 소비자들은 가격 대비 뛰어난 효과에 높은 만족도를 보였습니다.",
        '자극': f"총 {count}건의 긍정 리뷰에서 민감성 피부 사용자들도 자극 없이 편안하게 사용할 수 있었다고 보고했습니다.",
        '지속력': f"총 {count}건의 긍정 리뷰에서 소비자들은 오랜 시간 효과가 지속된다고 평가했습니다.",
        '흡수력': f"총 {count}건의 긍정 리뷰에서 소비자들은 빠른 흡수력에 높은 점수를 주었습니다.",
    }

    negative_templates = {
        '효과': f"총 {count}건의 부정 리뷰에서 소비자들은 기대만큼의 효과를 느끼지 못했다고 보고했습니다.",
        '보습': f"총 {count}건의 부정 리뷰에서 소비자들은 보습력이 부족하다고 평가했습니다.",
        '텍스처': f"총 {count}건의 부정 리뷰에서 소비자들은 끈적이거나 무거운 텍스처에 대한 불만을 표현했습니다.",
        '향': f"총 {count}건의 부정 리뷰에서 소비자들은 향이 너무 강하거나 인공적이라고 평가했습니다.",
        '가성비': f"총 {count}건의 부정 리뷰에서 소비자들은 가격 대비 효과가 부족하다고 평가했습니다.",
        '자극': f"총 {count}건의 부정 리뷰에서 일부 소비자들은 피부 자극이나 트러블을 경험했다고 보고했습니다.",
        '지속력': f"총 {count}건의 부정 리뷰에서 소비자들은 효과 지속 시간이 짧다고 평가했습니다.",
        '흡수력': f"총 {count}건의 부정 리뷰에서 소비자들은 흡수가 느리고 잔여감이 남는다고 평가했습니다.",
    }

    templates = positive_templates if sentiment == 'positive' else negative_templates
    return templates.get(review_type, f"총 {count}건의 리뷰가 분석되었습니다.")


def main():
    print("=" * 60)
    print("EXAONE 리뷰 분류 및 요약 생성 시작")
    print("=" * 60)
    print(f"MongoDB URI: {MONGO_URI[:50]}...")
    print(f"EXAONE URL: {EXAONE_URL}")

    # EXAONE 서버 상태 확인
    try:
        health = requests.get(f"{EXAONE_URL}/health", timeout=5)
        if health.status_code == 200:
            print(f"✅ EXAONE 서버 연결 성공")
            use_exaone = True
        else:
            print(f"⚠️ EXAONE 서버 응답 이상: {health.status_code}")
            use_exaone = False
    except:
        print("⚠️ EXAONE 서버 연결 실패 - 규칙 기반 분류 사용")
        use_exaone = False

    # MongoDB 연결
    client = MongoClient(MONGO_URI)
    db = client.get_default_database() if 'mongodb+srv' in MONGO_URI else client.amore

    # Step 1: 분류되지 않은 리뷰 가져오기
    print("\n[Step 1] 리뷰 분류 시작...")

    # 이미 분류된 리뷰도 다시 분류할지 여부
    RECLASSIFY_ALL = False

    if RECLASSIFY_ALL:
        query = {'country': 'usa'}
    else:
        # reviewType이 없거나 비어있는 리뷰만
        query = {'country': 'usa', '$or': [
            {'reviewType': {'$exists': False}},
            {'reviewType': ''},
            {'reviewType': None}
        ]}

    reviews_to_classify = list(db.raw_reviews.find(query).limit(1000))
    print(f"  분류할 리뷰: {len(reviews_to_classify)}건")

    classified_count = 0
    for i, review in enumerate(reviews_to_classify):
        content = review.get('content', '')
        rating = review.get('rating', 3)

        if not content:
            continue

        # 분류 실행
        if use_exaone:
            result = classify_review_with_exaone(content, rating)
        else:
            result = classify_review_rule_based(content, rating)

        # DB 업데이트
        db.raw_reviews.update_one(
            {'_id': review['_id']},
            {'$set': {
                'sentiment': result['sentiment'],
                'reviewType': result['reviewType'],
                'classifiedAt': datetime.now(timezone.utc)
            }}
        )

        classified_count += 1
        if (i + 1) % 100 == 0:
            print(f"  진행: {i + 1}/{len(reviews_to_classify)}")

    print(f"  ✅ {classified_count}건 분류 완료")

    # Step 2: 리뷰 유형별 요약 생성
    print("\n[Step 2] 리뷰 유형별 EXAONE 요약 생성...")

    for review_type in REVIEW_TYPES:
        for sentiment in ['positive', 'negative']:
            # 해당 유형의 리뷰 가져오기
            type_reviews = list(db.raw_reviews.find({
                'country': 'usa',
                'reviewType': review_type,
                'sentiment': sentiment
            }).limit(10))

            review_count = db.raw_reviews.count_documents({
                'country': 'usa',
                'reviewType': review_type,
                'sentiment': sentiment
            })

            if review_count == 0:
                continue

            # 요약 생성
            if use_exaone and len(type_reviews) > 0:
                summary = generate_type_summary_with_exaone(type_reviews, review_type, sentiment)
            else:
                summary = generate_fallback_summary(review_type, sentiment, review_count)

            # 샘플 리뷰 저장
            sample_reviews = [
                {
                    'content': r.get('content', '')[:300],
                    'product': r.get('productName', r.get('product', '')),
                    'brand': r.get('brand', ''),
                    'rating': r.get('rating', 0)
                }
                for r in type_reviews[:3]
            ]

            # DB에 저장 (upsert)
            db.keyword_summaries.update_one(
                {
                    'country': 'usa',
                    'reviewType': review_type,
                    'sentiment': sentiment
                },
                {
                    '$set': {
                        'summary': summary,
                        'sampleReviews': sample_reviews,
                        'reviewCount': review_count,
                        'source': 'EXAONE' if use_exaone else 'rule-based',
                        'generatedAt': datetime.now(timezone.utc)
                    }
                },
                upsert=True
            )

            print(f"  [{sentiment}] {review_type}: {review_count}건")

    print(f"\n✅ 완료!")

    # 통계 출력
    print("\n[통계]")
    for review_type in REVIEW_TYPES:
        pos_count = db.raw_reviews.count_documents({'country': 'usa', 'reviewType': review_type, 'sentiment': 'positive'})
        neg_count = db.raw_reviews.count_documents({'country': 'usa', 'reviewType': review_type, 'sentiment': 'negative'})
        print(f"  {review_type}: 긍정 {pos_count}건 / 부정 {neg_count}건")

    client.close()


if __name__ == '__main__':
    main()
