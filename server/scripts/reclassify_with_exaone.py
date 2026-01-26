#!/usr/bin/env python3
"""
EXAONE을 사용하여 리뷰 문장을 더 정확하게 재분류하는 스크립트
- 기존 keyword 기반 분류의 오류를 수정
- 특히 부정어("without", "no", "not")가 포함된 문장 처리
"""

import os
import sys
import time
import json
import re
import requests
from datetime import datetime
from pymongo import MongoClient

MONGO_URI = 'mongodb://localhost:27017/amore'
EXAONE_URL = 'http://localhost:5006/api/llm/classify-review'
BATCH_SIZE = 10  # EXAONE에 한번에 보낼 문장 수

# 리뷰 유형
REVIEW_TYPES = ['효과', '보습', '텍스처', '향', '가성비', '자극', '지속력', '흡수력', '재구매', '성분']


def classify_with_exaone(sentences: list) -> list:
    """EXAONE을 사용하여 문장들을 분류"""

    # 프롬프트 구성
    sentences_text = "\n".join([f"{i+1}. {s}" for i, s in enumerate(sentences)])

    prompt = f"""다음 화장품 리뷰 문장들을 분석하세요. 각 문장에 대해:
1. sentiment: positive 또는 negative
2. reviewType: 효과, 보습, 텍스처, 향, 가성비, 자극, 지속력, 흡수력, 재구매, 성분 중 하나

중요 규칙:
- "without irritating", "no breakout", "doesn't sting" 처럼 부정어로 문제가 없다고 표현하면 positive
- "causes irritation", "broke me out", "stings" 처럼 문제가 있다고 표현하면 negative

문장들:
{sentences_text}

각 문장에 대해 JSON 형식으로 응답:
[{{"id": 1, "sentiment": "positive", "reviewType": "효과"}}, ...]"""

    try:
        response = requests.post(EXAONE_URL, json={
            "prompt": prompt,
            "max_tokens": 1500
        }, timeout=120)

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                content = result.get('response', '')

                # JSON 추출
                try:
                    # JSON 배열 찾기
                    start = content.find('[')
                    end = content.rfind(']') + 1
                    if start >= 0 and end > start:
                        json_str = content[start:end]
                        # 주석 제거 (// ... 형태)
                        json_str = re.sub(r'//[^\n]*', '', json_str)
                        # <!-- ... --> 형태 주석 제거
                        json_str = re.sub(r'<!--[^>]*-->', '', json_str)
                        # 배열을 문자열로 변경 (["a", "b"] -> "a")
                        json_str = re.sub(r'\[(["\'][^"\']+["\'])[^\]]*\]', r'\1', json_str)
                        return json.loads(json_str)
                except json.JSONDecodeError as e:
                    print(f"  JSON 파싱 실패: {e}")
                    print(f"  응답 내용: {content[:200]}...")
        else:
            print(f"  HTTP 에러: {response.status_code}")
    except Exception as e:
        print(f"  EXAONE 에러: {e}")

    return None


def main():
    print("=" * 60)
    print("EXAONE 기반 리뷰 문장 재분류")
    print(f"시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # MongoDB 연결
    client = MongoClient(MONGO_URI)
    db = client.amore

    # EXAONE 연결 테스트
    try:
        resp = requests.get('http://localhost:5006/health', timeout=5)
        print(f"EXAONE 서버 상태: {resp.json()}")
    except:
        print("EXAONE 서버 연결 실패!")
        return

    # 분류가 의심스러운 문장들 찾기 (부정어가 포함된 경우)
    suspicious_patterns = [
        'without irritat', 'without sting', 'without break',
        'no irritat', 'no sting', 'no break', 'no redness',
        "doesn't irritate", "doesn't sting", "doesn't break",
        "didn't irritate", "didn't sting", "didn't break",
        'not irritat', 'not sting', 'never irritat', 'never break'
    ]

    # 의심스러운 문장 쿼리
    or_conditions = [{'content': {'$regex': pattern, '$options': 'i'}} for pattern in suspicious_patterns]

    suspicious_sentences = list(db.review_sentences.find({
        'country': 'usa',
        '$or': or_conditions
    }))

    print(f"\n부정어 포함 문장 (재분류 대상): {len(suspicious_sentences)}개")

    if not suspicious_sentences:
        print("재분류할 문장이 없습니다.")
        return

    # 배치로 처리
    reclassified = 0
    changed = 0

    for i in range(0, len(suspicious_sentences), BATCH_SIZE):
        batch = suspicious_sentences[i:i+BATCH_SIZE]
        contents = [s['content'] for s in batch]

        # EXAONE으로 분류
        results = classify_with_exaone(contents)

        if results:
            for j, result in enumerate(results):
                if j >= len(batch):
                    break

                sent = batch[j]
                new_sentiment = result.get('sentiment', sent['sentiment'])
                new_type = result.get('reviewType', sent['reviewType'])

                # 변경 사항 확인
                old_sentiment = sent.get('sentiment')
                old_type = sent.get('reviewType')

                if new_sentiment != old_sentiment or new_type != old_type:
                    # 업데이트
                    db.review_sentences.update_one(
                        {'_id': sent['_id']},
                        {'$set': {
                            'sentiment': new_sentiment,
                            'reviewType': new_type,
                            'reclassified': True,
                            'reclassifiedAt': datetime.utcnow()
                        }}
                    )
                    changed += 1

                    if changed <= 10:  # 처음 10개만 출력
                        print(f"\n  변경: {sent['content'][:60]}...")
                        print(f"    이전: {old_sentiment}/{old_type} → 변경: {new_sentiment}/{new_type}")

                reclassified += 1

        print(f"  진행: {min(i+BATCH_SIZE, len(suspicious_sentences))}/{len(suspicious_sentences)} ({changed}개 변경)")
        time.sleep(1)  # Rate limiting

    print(f"\n{'=' * 60}")
    print(f"재분류 완료!")
    print(f"총 처리: {reclassified}개")
    print(f"변경됨: {changed}개")
    print("=" * 60)

    # 최종 통계
    print("\n[최종 분류 통계]")
    for review_type in REVIEW_TYPES:
        pos = db.review_sentences.count_documents({'country': 'usa', 'reviewType': review_type, 'sentiment': 'positive'})
        neg = db.review_sentences.count_documents({'country': 'usa', 'reviewType': review_type, 'sentiment': 'negative'})
        if pos > 0 or neg > 0:
            print(f"  {review_type}: 긍정 {pos} / 부정 {neg}")

    client.close()


if __name__ == '__main__':
    main()
