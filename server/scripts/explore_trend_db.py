"""
amore_trend_db 데이터베이스 구조 탐색 스크립트 (MongoDB Atlas)
"""

from pymongo import MongoClient
import json
from pprint import pprint
import os

# MongoDB Atlas 연결
ATLAS_URI = "mongodb+srv://amore_admin:0512@cluster0.mhfe3ia.mongodb.net"

def explore_database():
    client = MongoClient(ATLAS_URI)

    # 모든 데이터베이스 목록
    print("=" * 60)
    print("Available Databases on Atlas:")
    print("=" * 60)
    for db_name in client.list_database_names():
        print(f"  - {db_name}")

    # amore_trend_db 탐색
    db = client["amore_trend_db"]

    print("\n" + "=" * 60)
    print("amore_trend_db Collections:")
    print("=" * 60)

    collections = db.list_collection_names()
    for col_name in sorted(collections):
        count = db[col_name].count_documents({})
        print(f"  {col_name:<40} {count:>10} documents")

    # 각 컬렉션 샘플 데이터 조회
    print("\n" + "=" * 60)
    print("Sample Data from each collection:")
    print("=" * 60)

    for col_name in sorted(collections):
        print(f"\n>>> {col_name}:")
        print("-" * 50)

        sample = db[col_name].find_one({})
        if sample:
            # ObjectId를 문자열로 변환
            if '_id' in sample:
                sample['_id'] = str(sample['_id'])
            # 긴 텍스트 필드 잘라내기
            for key, value in sample.items():
                if isinstance(value, str) and len(value) > 300:
                    sample[key] = value[:300] + "..."
                if isinstance(value, list) and len(value) > 5:
                    sample[key] = value[:5] + ["...truncated"]
            print(json.dumps(sample, indent=2, ensure_ascii=False, default=str))
        else:
            print("  (empty collection)")

    # 브랜드별 제품 수 통계
    print("\n" + "=" * 60)
    print("Brand Statistics (from raw_products_*):")
    print("=" * 60)

    brand_stats = {}
    for col_name in collections:
        if col_name.startswith("raw_products_") and "bestsellers" not in col_name:
            brand = col_name.replace("raw_products_", "").replace("_", " ").title()
            product_count = db[col_name].count_documents({})

            # 해당 브랜드의 리뷰 컬렉션 확인
            review_col = col_name.replace("raw_products_", "raw_reviews_")
            review_count = db[review_col].count_documents({}) if review_col in collections else 0

            brand_stats[brand] = {"products": product_count, "reviews": review_count}

    for brand, stats in sorted(brand_stats.items()):
        print(f"  {brand:<30} Products: {stats['products']:>5}, Reviews: {stats['reviews']:>6}")

    # 총계
    total_products = sum(s["products"] for s in brand_stats.values())
    total_reviews = sum(s["reviews"] for s in brand_stats.values())
    print(f"\n  {'TOTAL':<30} Products: {total_products:>5}, Reviews: {total_reviews:>6}")

    # YouTube 통계
    youtube_count = db["raw_youtube"].count_documents({}) if "raw_youtube" in collections else 0
    print(f"\n  YouTube videos: {youtube_count}")

    # Amazon Bestsellers 통계
    bestseller_count = db["raw_products_amazon_bestsellers"].count_documents({}) if "raw_products_amazon_bestsellers" in collections else 0
    print(f"  Amazon Bestsellers: {bestseller_count}")

    client.close()

if __name__ == "__main__":
    explore_database()
