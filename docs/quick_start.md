# 빠른 시작 가이드

## 📋 요약

### DB 변수 활용
- **리뷰 수**: `raw_reviews` 컬렉션에서 집계
- **언급 수**: `raw_sns_posts` 컬렉션에서 집계
- **제품 랭킹**: `raw_retail_sales.salesRank` 사용
- **제품 설명**: LLM으로 성분 추출

### LLM Multi-Agent 구조
- **Agent 1**: 성분 추출 (제품 설명 → 성분 리스트)
- **Agent 2**: 키워드 분류 (키워드 → category)
- **Agent 3**: 감성 분석 (리뷰 → 긍정/부정 키워드)
- **Agent 4**: 효과 추출 (리뷰 + 성분 → 효과)
- **Agent 5**: 조합 분석 (성분 리스트 → 조합 이유)

### 점수 계산
```
종합 점수 = 
  제품 랭킹 점수 (40%) +
  리뷰 언급 수 점수 (30%) +
  SNS 언급 수 점수 (20%) +
  효과 점수 (10%)
```

---

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
cd server
npm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:
```bash
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=mongodb://your_mongodb_uri
MONGODB_DATABASE=your_database_name
PORT=5000
```

### 3. 서버 실행

```bash
npm run dev
```

### 4. API 테스트

```bash
# 성분 리더보드 조회
curl "http://localhost:5000/api/trends/ingredient-leaderboard?country=usa&category=Skincare"

# 트렌드 조합 분석
curl "http://localhost:5000/api/trends/combination?ingredients=레티놀,앰플&country=usa"

# 리뷰 키워드 추출
curl "http://localhost:5000/api/trends/review-keywords?productId=product-123&country=usa"
```

---

## 📚 관련 문서

- `db_variable_mapping.md` - DB 변수 매핑 상세
- `trend_analysis_strategy.md` - 트렌드 분석 전략
- `implementation_summary.md` - 구현 요약

