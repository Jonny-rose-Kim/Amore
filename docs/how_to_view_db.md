# MongoDB 데이터 조회 방법

## 방법 1: 스크립트 사용 (추천) ⭐

### Node.js 스크립트

```bash
cd /srv2/jinwook/amore_ver2/server

# 모든 컬렉션 조회
node scripts/view_db.js

# 특정 컬렉션만 조회
node scripts/view_db.js processed_keywords 10
node scripts/view_db.js trends 5
node scripts/view_db.js leaderboard 20
```

### Python 스크립트

```bash
cd /srv2/jinwook/amore_ver2/server

# 모든 컬렉션 조회
python3 scripts/view_db.py

# 특정 컬렉션만 조회
python3 scripts/view_db.py processed_keywords 10
python3 scripts/view_db.py trends 5
python3 scripts/view_db.py leaderboard 20
```

## 방법 2: MongoDB Shell (mongosh)

### 설치 (없는 경우)
```bash
# Ubuntu/Debian
sudo apt-get install mongodb-mongosh

# 또는 직접 다운로드
# https://www.mongodb.com/try/download/shell
```

### 사용법

```bash
# MongoDB 연결
mongosh mongodb://localhost:27017/amore

# 또는
mongosh "mongodb://localhost:27017" --eval "use amore"
```

**MongoDB Shell 명령어:**

```javascript
// 데이터베이스 선택
use amore

// 컬렉션 목록
show collections

// 컬렉션 문서 수
db.processed_keywords.countDocuments()

// 샘플 데이터 조회
db.processed_keywords.find().limit(5).pretty()

// 특정 조건으로 조회
db.trends.find({ country: "usa" }).limit(10).pretty()

// 집계 쿼리
db.processed_keywords.aggregate([
  { $group: { _id: "$keywordType", count: { $sum: 1 } } }
]).pretty()

// 최근 데이터 조회
db.leaderboard.find().sort({ updatedAt: -1 }).limit(10).pretty()
```

## 방법 3: MongoDB Compass (GUI 도구) 🖥️

### 설치
1. https://www.mongodb.com/try/download/compass 에서 다운로드
2. 설치 후 실행

### 연결
- **Connection String**: `mongodb://localhost:27017`
- **Database**: `amore`

### 기능
- 시각적 데이터 브라우징
- 쿼리 작성 및 실행
- 인덱스 확인
- 성능 분석

## 방법 4: API 엔드포인트 사용

서버가 실행 중일 때:

```bash
# Health check (컬렉션별 문서 수 확인)
curl http://localhost:5000/api/health

# 리더보드 데이터
curl "http://localhost:5000/api/real/leaderboard?country=usa&category=Skincare&itemType=Ingredients&trendLevel=Actionable"

# 리뷰 카운트
curl "http://localhost:5000/api/real/reviews/count?country=usa&period=8weeks"

# SNS 플랫폼 순위
curl "http://localhost:5000/api/real/sns-platform/popular?country=usa"

# 꿀조합 리더보드
curl "http://localhost:5000/api/real/combinations/leaderboard?country=usa&category=Skincare"

# 배치 작업 로그
curl http://localhost:5000/api/batch/status
```

## 방법 5: 간단한 쿼리 스크립트

### 특정 컬렉션 통계

```bash
# Node.js로 실행
node -e "
import('./db.js').then(async ({ default: connectDB }) => {
  const mongoose = await connectDB();
  const db = mongoose.connection.db;
  
  const stats = {
    raw_retail_sales: await db.collection('raw_retail_sales').countDocuments(),
    raw_reviews: await db.collection('raw_reviews').countDocuments(),
    processed_keywords: await db.collection('processed_keywords').countDocuments(),
    trends: await db.collection('trends').countDocuments(),
    leaderboard: await db.collection('leaderboard').countDocuments()
  };
  
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
});
"
```

## 유용한 쿼리 예제

### 1. 최근 처리된 키워드
```javascript
db.processed_keywords.find()
  .sort({ extractedAt: -1 })
  .limit(10)
  .pretty()
```

### 2. Actionable 트렌드만 조회
```javascript
db.trends.find({ 
  category: "Actionable",
  country: "usa" 
})
.sort({ score: -1 })
.limit(10)
.pretty()
```

### 3. 특정 키워드 관련 데이터
```javascript
// 키워드가 포함된 제품
db.processed_keywords.find({ 
  keyword: "레티놀" 
}).pretty()

// 관련 트렌드
db.trends.find({ 
  ingredients: "레티놀" 
}).pretty()
```

### 4. 배치 작업 로그
```javascript
db.batch_job_logs.find()
  .sort({ completedAt: -1 })
  .limit(5)
  .pretty()
```

### 5. 국가별 통계
```javascript
db.processed_keywords.aggregate([
  { $group: { 
    _id: "$country", 
    count: { $sum: 1 },
    keywords: { $addToSet: "$keyword" }
  }},
  { $project: { 
    country: "$_id", 
    count: 1,
    uniqueKeywords: { $size: "$keywords" }
  }}
]).pretty()
```

## 빠른 참조

### 컬렉션별 주요 필드

**processed_keywords:**
- `keyword`, `keywordType`, `country`, `effects`

**trends:**
- `combination`, `score`, `category`, `signals`, `country`

**leaderboard:**
- `keyword`, `rank`, `score`, `trendLevel`, `country`

**batch_job_logs:**
- `status`, `startedAt`, `completedAt`, `duration`

## 문제 해결

### 연결 실패
```bash
# MongoDB 서버 실행 확인
sudo systemctl status mongod

# 또는
ps aux | grep mongod
```

### 권한 오류
```bash
# MongoDB 사용자 확인
mongosh --eval "db.getUsers()"
```

### 데이터 없음
```bash
# 시드 데이터 생성
cd /srv2/jinwook/amore_ver2/server
python3 seed_data.py
```

