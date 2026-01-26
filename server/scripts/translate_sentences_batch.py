#!/usr/bin/env python3
"""
리뷰 문장 한국어 번역 스크립트 (배치 처리)
- review_sentences 컬렉션의 영어 문장을 한국어로 번역
- googletrans 라이브러리 사용
"""

import os
import sys
import time
from datetime import datetime
from pymongo import MongoClient

# googletrans 설치 확인
try:
    from googletrans import Translator
except ImportError:
    os.system('pip install googletrans==4.0.0-rc1 -q')
    from googletrans import Translator

MONGO_URI = 'mongodb://localhost:27017/amore'
BATCH_SIZE = 100
RATE_LIMIT_DELAY = 0.5  # seconds between batches


def is_korean(text: str) -> bool:
    """한국어 포함 여부 확인"""
    return any('\uac00' <= char <= '\ud7a3' for char in text)


def translate_batch(translator, texts: list) -> list:
    """여러 텍스트를 한 번에 번역"""
    results = []
    for text in texts:
        try:
            if not text or len(text.strip()) < 10:
                results.append(None)
                continue
            if is_korean(text):
                results.append(None)
                continue

            # 최대 500자만 번역
            result = translator.translate(text[:500], src='en', dest='ko')
            results.append(result.text)
            time.sleep(0.1)  # 요청 간 짧은 딜레이
        except Exception as e:
            results.append(None)
    return results


def main():
    print("=" * 60)
    print("리뷰 문장 한국어 번역 시작")
    print(f"시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # MongoDB 연결
    client = MongoClient(MONGO_URI)
    db = client.amore

    # 번역기 초기화
    translator = Translator()

    # 번역 테스트
    try:
        test = translator.translate("Hello world", src='en', dest='ko')
        print(f"번역기 테스트 성공: 'Hello world' -> '{test.text}'")
    except Exception as e:
        print(f"번역기 오류: {e}")
        return

    # 번역 필요한 문장 수 확인
    total_needed = db.review_sentences.count_documents({
        'country': 'usa',
        '$or': [
            {'contentKr': None},
            {'contentKr': {'$exists': False}}
        ]
    })
    print(f"\n번역 필요 문장: {total_needed}개")

    if total_needed == 0:
        print("모든 문장이 이미 번역되어 있습니다.")
        return

    translated_total = 0
    error_count = 0

    while True:
        # 번역되지 않은 문장 가져오기
        sentences = list(db.review_sentences.find({
            'country': 'usa',
            '$or': [
                {'contentKr': None},
                {'contentKr': {'$exists': False}}
            ]
        }).limit(BATCH_SIZE))

        if not sentences:
            break

        # 텍스트 추출
        texts = [s.get('content', '') for s in sentences]

        # 번역
        translations = translate_batch(translator, texts)

        # 업데이트
        batch_translated = 0
        for sent, kr_text in zip(sentences, translations):
            if kr_text:
                try:
                    db.review_sentences.update_one(
                        {'_id': sent['_id']},
                        {'$set': {'contentKr': kr_text}}
                    )
                    batch_translated += 1
                except Exception as e:
                    error_count += 1

        translated_total += batch_translated

        # 진행 상황 출력
        remaining = total_needed - translated_total
        print(f"  진행: {translated_total}/{total_needed} ({translated_total/total_needed*100:.1f}%) - 남은 문장: {remaining}")

        # Rate limiting
        time.sleep(RATE_LIMIT_DELAY)

        # 1000개마다 상태 저장
        if translated_total % 1000 == 0:
            print(f"\n[체크포인트] {translated_total}개 번역 완료")
            sys.stdout.flush()

    print(f"\n{'=' * 60}")
    print(f"번역 완료!")
    print(f"총 번역: {translated_total}개")
    print(f"에러: {error_count}개")
    print(f"완료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # 최종 통계
    with_kr = db.review_sentences.count_documents({'country': 'usa', 'contentKr': {'$ne': None}})
    total = db.review_sentences.count_documents({'country': 'usa'})
    print(f"\n최종 통계: {with_kr}/{total} 문장 번역됨 ({with_kr/total*100:.1f}%)")

    client.close()


if __name__ == '__main__':
    main()
