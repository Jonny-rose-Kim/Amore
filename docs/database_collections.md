# 데이터베이스 컬렉션 구조

## 개요

이 문서는 `amore_ver2/server` 폴더에서 클로드 코딩에 의해 추가된 모든 MongoDB 컬렉션의 구조를 설명합니다.

## 컬렉션 목록

### 1. 로우 데이터 컬렉션 (Raw Data)

#### `raw_retail_sales`
제품 판매 데이터 (원본)

```javascript
{
  productId: String,           // 제품 ID
  productName: String,        // 제품 이름
  brand: String,              // 브랜드
  category: String,           // 카테고리 (Skincare, Makeup, etc.)
  country: String,            // 국가 (usa, japan, etc.)
  date: Date,                 // 판매 날짜
  salesRank: Number,         // 판매 순위
  salesVolume: Number,       // 판매량
  price: Number,              // 가격
  description: String,        // 제품 설명 (LLM 처리용)
  mainCategory: String       // 대분류
}
```

**인덱스:**
- `{ productId: 1 }`
- `{ country: 1, category: 1, date: 1 }`
- `{ salesRank: 1 }`

#### `raw_reviews`
제품 리뷰 데이터 (원본)

```javascript
{
  reviewId: String,          // 리뷰 ID
  productId: String,         // 제품 ID
  content: String,           // 리뷰 내용
  rating: Number,            // 평점 (1-5)
  postedAt: Date,            // 작성 날짜
  country: String,           // 국가
  reviewerName: String,     // 리뷰어 이름 (선택)
  helpful: Number            // 도움됨 수 (선택)
}
```

**인덱스:**
- `{ productId: 1 }`
- `{ postedAt: 1 }`
- `{ country: 1 }`

#### `raw_sns_posts`
SNS 게시물 데이터 (원본)

```javascript
{
  postId: String,            // 게시물 ID
  platform: String,          // 플랫폼 (Instagram, TikTok, YouTube, Amazon, Shopee, Cosme)
  content: String,           // 게시물 내용
  hashtags: [String],       // 해시태그 배열
  postedAt: Date,           // 게시 날짜
  country: String,          // 국가
  likes: Number,            // 좋아요 수 (선택)
  shares: Number,           // 공유 수 (선택)
  productId: String         // 관련 제품 ID (선택)
}
```

**인덱스:**
- `{ platform: 1 }`
- `{ postedAt: 1 }`
- `{ country: 1 }`
- `{ content: "text" }` (텍스트 검색)

---

### 2. 처리된 데이터 컬렉션 (Processed Data)

#### `processed_keywords`
LLM으로 추출된 키워드 (성분, 제형, 효과, Mood)

```javascript
{
  keyword: String,           // 키워드 이름
  keywordType: String,       // 타입: 'ingredient', 'formula', 'effect', 'mood'
  sourceType: String,       // 출처: 'product_description', 'review', 'sns_post'
  sourceId: String,          // 출처 ID (productId, reviewId, postId)
  country: String,           // 국가
  category: String,          // 카테고리
  effects: [String],         // 관련 효과 배열
  extractedAt: Date,         // 추출 시간
  processedAt: Date          // 처리 시간
}
```

**인덱스:**
- `{ keyword: 1, country: 1, category: 1 }`
- `{ keywordType: 1 }`
- `{ sourceId: 1 }`
- `{ extractedAt: -1 }`

#### `trends`
트렌드 분석 결과

```javascript
{
  combination: String,        // 조합 문자열 (예: "레티놀 + 앰플 + 모공 케어")
  ingredients: [String],     // 성분 배열
  formulas: [String],        // 제형 배열
  effects: [String],         // 효과 배열
  mood: [String],            // Mood 배열
  country: String,           // 국가
  category: String,          // 카테고리
  score: Number,             // 트렌드 점수 (0-100)
  category: String,          // 트렌드 카테고리: 'Actionable', 'Growing', 'Early'
  avgRank: Number,           // 평균 판매 순위
  productCount: Number,      // 관련 제품 수
  signals: {                 // 3-Signal 데이터
    SNS: Number,             // SNS 신호 점수
    Retail: Number,          // Retail 신호 점수
    Review: Number           // Review 신호 점수
  },
  synergyScore: Number,      // 시너지 점수 (0-1)
  calculatedAt: Date,        // 계산 시간
  updatedAt: Date            // 업데이트 시간
}
```

**인덱스:**
- `{ country: 1, category: 1, status: 1 }`
- `{ score: -1 }`
- `{ combination: 1 }`
- `{ calculatedAt: -1 }`

#### `sns_platform_stats`
SNS 플랫폼별 키워드 통계

```javascript
{
  platform: String,          // 플랫폼 이름 (Instagram, TikTok, etc.)
  country: String,           // 국가
  keywords: [{               // 키워드 배열
    keyword: String,         // 키워드 이름
    value: Number,           // 값 (언급 수 기반)
    change: Number,          // 변화율
    type: String             // 타입: 'ingredient', 'formula', 'effect'
  }],
  date: Date,                // 통계 날짜
  calculatedAt: Date         // 계산 시간
}
```

**인덱스:**
- `{ platform: 1, country: 1, date: -1 }`
- `{ date: -1 }`

---

### 3. 집계 데이터 컬렉션 (Aggregated Data)

#### `leaderboard`
리더보드 데이터 (키워드별 개별 문서)

```javascript
{
  rank: Number,              // 순위
  keyword: String,           // 키워드 이름
  keywordType: String,       // 키워드 타입: 'ingredient', 'formula', 'effect', 'mood'
  country: String,           // 국가
  score: Number,             // 점수
  productCount: Number,      // 관련 제품 수
  trendLevel: String,        // 트렌드 레벨: 'Actionable', 'Growing', 'Early'
  trendCount: Number,        // 관련 트렌드 수 (선택)
  calculatedAt: Date         // 계산 시간
}
```

**인덱스:**
- `{ country: 1, mainCategory: 1, itemType: 1, trendLevel: 1 }` (db_setup.js에서 정의)
- `{ updatedAt: -1 }` (db_setup.js에서 정의)

**참고:** 실제 구현에서는 각 키워드가 개별 문서로 저장되며, API에서 집계하여 반환합니다.

#### `combination_leaderboard`
꿀조합 리더보드 데이터

```javascript
{
  country: String,           // 국가
  category: String,          // 카테고리
  leaderboard: [{            // 리더보드 배열
    rank: Number,            // 순위
    combination: String,      // 조합 문자열
    ingredients: [String],   // 성분 배열
    formulas: [String],      // 제형 배열
    effects: [String],       // 효과 배열
    score: Number,           // 점수
    category: String,        // 카테고리
    avgRank: Number,         // 평균 순위
    productCount: Number,    // 제품 수
    signals: {               // 신호
      SNS: Number,
      Retail: Number,
      Review: Number
    },
    synergyScore: Number     // 시너지 점수
  }],
  calculatedAt: Date         // 계산 시간
}
```

**인덱스:**
- `{ country: 1, category: 1 }`
- `{ score: -1 }`
- `{ calculatedAt: -1 }`

---

### 4. 시스템 컬렉션 (System Collections)

#### `batch_job_logs`
배치 작업 실행 로그

```javascript
{
  jobType: String,           // 작업 타입: 'llm_workflow'
  status: String,            // 상태: 'completed', 'skipped', 'failed'
  country: String,           // 국가 (선택)
  category: String,          // 카테고리 (선택)
  weeks: Number,             // 기간 (선택)
  startedAt: Date,           // 시작 시간
  completedAt: Date,         // 완료 시간
  duration: Number,          // 실행 시간 (밀리초)
  reason: String,            // 건너뜀 이유 (skipped인 경우): 'no_new_data'
  output: String,            // 출력 로그 (최대 1000자)
  error: String              // 오류 메시지 (failed인 경우)
}
```

**인덱스:**
- `{ jobType: 1, completedAt: -1 }`

#### `processed_trend_signals`
트렌드 신호 처리 데이터 (trendClassifier.js에서 사용)

```javascript
{
  keyword: String,           // 키워드
  country: String,           // 국가
  signals: {                 // 신호 데이터
    SNS: Number,
    Retail: Number,
    Review: Number
  },
  metrics: {                 // 메트릭
    growthRate: Number,
    marketShare: Number,
    reviewQuality: Number
  },
  calculatedAt: Date         // 계산 시간
}
```

---

## 데이터 흐름

```
1. 로우 데이터 수집
   raw_retail_sales, raw_reviews, raw_sns_posts
   ↓
2. LLM 워크플로우 실행 (하루 1회)
   ↓
3. 키워드 추출 및 저장
   processed_keywords
   ↓
4. 트렌드 분석 및 저장
   trends, sns_platform_stats
   ↓
5. 리더보드 집계 및 저장
   leaderboard, combination_leaderboard
   ↓
6. API를 통한 UI 표시
```

## 컬렉션 생성 방법

### 자동 생성 (권장)
```bash
cd /srv2/jinwook/amore_ver2/server
node services/db_setup.js
```

### 수동 생성
MongoDB에서 직접 실행하거나, 워크플로우 실행 시 자동으로 생성됩니다.

## 데이터 시드 (테스트 데이터)

```bash
cd /srv2/jinwook/amore_ver2/server
python3 seed_data.py
```

이 스크립트는 모든 컬렉션에 테스트 데이터를 생성합니다.

