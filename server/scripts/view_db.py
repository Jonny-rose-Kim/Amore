"""
MongoDB 데이터 조회 스크립트 (Python 버전)
"""

from pymongo import MongoClient
from datetime import datetime
import json
import sys
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "amore")

def view_collections():
    client = MongoClient(MONGODB_URI)
    db = client[MONGODB_DATABASE]
    
    print("✅ MongoDB 연결 성공\n")
    
    # 컬렉션 목록
    collections = db.list_collection_names()
    print("📋 컬렉션 목록:")
    print("=" * 50)
    
    for col_name in collections:
        count = db[col_name].count_documents({})
        print(f"  {col_name:<30} {count:>10}개 문서")
    
    print("\n")
    
    # 각 컬렉션 샘플 데이터
    collections_to_view = [
        'raw_retail_sales',
        'raw_reviews',
        'raw_sns_posts',
        'processed_keywords',
        'trends',
        'sns_platform_stats',
        'leaderboard',
        'combination_leaderboard',
        'batch_job_logs'
    ]
    
    for col_name in collections_to_view:
        collection = db[col_name]
        count = collection.count_documents({})
        
        if count > 0:
            print(f"\n📊 {col_name} (총 {count}개)")
            print("-" * 50)
            
            samples = list(collection.find({}).limit(2))
            for idx, doc in enumerate(samples):
                print(f"\n[샘플 {idx + 1}]")
                # ObjectId를 문자열로 변환
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
                print(json.dumps(doc, indent=2, ensure_ascii=False, default=str))
        else:
            print(f"\n📊 {col_name} (데이터 없음)")
    
    client.close()
    print("\n✅ 조회 완료")

def view_specific_collection(collection_name, limit=5):
    client = MongoClient(MONGODB_URI)
    db = client[MONGODB_DATABASE]
    
    collection = db[collection_name]
    count = collection.count_documents({})
    
    print(f"\n📊 {collection_name} (총 {count}개, 최근 {limit}개 표시)")
    print("=" * 50)
    
    docs = list(collection.find({}).sort("_id", -1).limit(limit))
    
    for idx, doc in enumerate(docs):
        print(f"\n[{idx + 1}]")
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])
        print(json.dumps(doc, indent=2, ensure_ascii=False, default=str))
    
    client.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        collection_name = sys.argv[1]
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 5
        view_specific_collection(collection_name, limit)
    else:
        view_collections()

