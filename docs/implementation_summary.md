# 구현 요약: DB 변수 활용 및 LLM Multi-Agent 구조

## 📊 DB 변수 → UI 기능 매핑

### 현재 DB 변수
1. **리뷰 수** (`raw_reviews.reviewCount`)
2. **언급 수** (`raw_sns_posts` 집계)
3. **제품 랭킹** (`raw_retail_sales.salesRank`)
4. **제품 설명** (`raw_retail_sales.description`) ⭐ LLM 처리 대상

### 성분 트렌드 리더보드 구축 방법

#### **점수 계산 공식**
```javascript
종합 점수 = 
  제품 랭킹 점수 (40%) +
  리뷰 언급 수 점수 (30%) +
  SNS 언급 수 점수 (20%) +
  효과 점수 (10%)
```

#### **각 점수 계산 방법**

1. **제품 랭킹 점수 (40%)**
   ```javascript
   // 해당 성분이 포함된 제품들의 평균 랭킹
   avgRank = 평균(제품들의 salesRank)
   rankingScore = max(0, 100 - (avgRank - 1) * 0.2)
   // 1위 = 100점, 500위 = 0점
   ```

2. **리뷰 언급 수 점수 (30%)**
   ```javascript
   // LLM으로 리뷰에서 성분 언급 확인
   mentionCount = LLM으로 확인된 언급 수
   mentionRate = mentionCount / totalReviews
   mentionScore = min(100, mentionRate * 1000)
   // 10% 언급률 = 100점
   ```

3. **SNS 언급 수 점수 (20%)**
   ```javascript
   // SNS 게시물에서 성분 언급 수
   snsCount = SNS 게시물에서 성분 언급 수
   snsScore = min(100, snsCount / 100)
   // 100개 언급 = 100점
   ```

4. **효과 점수 (10%)**
   ```javascript
   // LLM으로 추출된 효과 개수
   effects = LLM Agent 4로 추출된 효과
   effectScore = min(100, effects.length * 20)
   // 효과 5개 = 100점
   ```

---

## 🤖 LLM Multi-Agent 구조

### Agent 역할 분담

| Agent | 역할 | 입력 | 출력 | 모델 |
|-------|------|------|------|------|
| **Agent 1** | 성분 추출 | 제품 설명 | 성분 리스트 | gpt-4o-mini |
| **Agent 2** | 키워드 분류 | 키워드 | category (ingredient/formula/effect/visual) | gpt-4o-mini |
| **Agent 3** | 감성 분석 | 리뷰 텍스트 | 긍정/부정 키워드 | gpt-4o-mini |
| **Agent 4** | 효과 추출 | 리뷰 + 성분명 | 효과 리스트 | gpt-4o |
| **Agent 5** | 조합 분석 | 성분 리스트 + 리뷰 | 조합 이유 + 시너지 점수 | gpt-4o |

### 처리 파이프라인

```
1. Raw 데이터 수집
   ↓
2. Agent 1: 제품 설명에서 성분 추출
   ↓
3. Agent 2: 키워드 분류 (성분/제형/효과/Mood)
   ↓
4. 데이터 집계
   - 제품 랭킹 집계 (DB 변수: salesRank)
   - 리뷰 언급 수 집계 (Agent 1 결과 활용)
   - SNS 언급 수 집계 (DB 변수: content, hashtags)
   ↓
5. Agent 3: 리뷰 감성 분석
   - 긍정 키워드 추출
   - 부정 키워드 추출
   ↓
6. Agent 4: 성분 효과 추출
   - 리뷰에서 효과 언급 추출
   - 효과별 빈도 계산
   ↓
7. 트렌드 점수 계산
   - 7가지 요소 종합 점수
   - 트렌드 분류 (Early/Growing/Actionable)
   ↓
8. Agent 5: 조합 분석 (선택적)
   - 성분 조합 시너지 분석
   - 조합 이유 설명
   ↓
9. UI 표시용 데이터 생성
```

---

## 📁 파일 구조

```
server/
├── services/
│   ├── llmAgents.js          # LLM Multi-Agent 서비스
│   └── trendClassifier.js    # 트렌드 분류 로직
├── routes/
│   └── trends.js             # 트렌드 API 라우트
├── db.js                     # MongoDB 연결
└── index.js                  # Express 서버
```

---

## 🔌 API 엔드포인트

### 1. 성분 리더보드 생성
```
GET /api/trends/ingredient-leaderboard
Query Parameters:
  - country: 'usa' | 'domestic' | 'japan' | ...
  - category: 'Skincare' | 'Cleansing' | ...
  - period: '8weeks' (default)

Response:
{
  country: 'usa',
  category: 'Skincare',
  period: '8weeks',
  leaderboard: [
    {
      rank: 1,
      keyword: '레티놀',
      score: 98,
      change: 0,
      metadata: {
        productCount: 15,
        reviewCount: 1250,
        mentionCount: 890,
        mentionRate: 0.71,
        snsMentions: 450,
        avgRank: 12.5,
        effects: [...]
      }
    },
    ...
  ]
}
```

### 2. 트렌드 조합 분석
```
GET /api/trends/combination
Query Parameters:
  - ingredients: '레티놀,앰플,모공 케어'
  - country: 'usa'

Response:
{
  combination: '레티놀 + 앰플 + 모공 케어',
  reason: '레티놀의 각질 제거 효과와...',
  synergyScore: 0.92,
  classification: '🚀 Actionable Trend',
  confidence: 0.85,
  signals: {...},
  metrics: {...}
}
```

### 3. 리뷰 키워드 추출
```
GET /api/trends/review-keywords
Query Parameters:
  - productId: 'product-123'
  - country: 'usa'
  - period: '8weeks'

Response:
{
  productId: 'product-123',
  country: 'usa',
  period: '8weeks',
  reviewCount: 250,
  keywords: {
    positive: [
      { keyword: '효과 좋아요', count: 125 },
      { keyword: '피부가 좋아졌어요', count: 89 },
      ...
    ],
    negative: [
      { keyword: '자극 있어요', count: 12 },
      ...
    ]
  }
}
```

---

## 💡 최적화 전략

### 1. LLM 호출 최소화
- **캐싱**: 처리 결과를 24시간 캐시
- **배치 처리**: 여러 리뷰를 한 번에 처리
- **병렬 처리**: 여러 Agent 동시 실행

### 2. 비용 절감
- **간단한 작업**: gpt-4o-mini 사용 (Agent 1, 2, 3)
- **복잡한 작업**: gpt-4o 사용 (Agent 4, 5)
- **프롬프트 최적화**: 토큰 수 최소화

### 3. 성능 향상
- **비동기 처리**: Promise.all 사용
- **큐 시스템**: 대량 작업은 큐로 처리
- **결과 저장**: 처리 결과를 DB에 저장하여 재사용

---

## 🚀 사용 예시

### 프론트엔드에서 호출

```javascript
// 성분 리더보드 조회
const response = await fetch(
  '/api/trends/ingredient-leaderboard?country=usa&category=Skincare&period=8weeks'
);
const data = await response.json();

// 리더보드 데이터를 UI에 표시
data.leaderboard.forEach(item => {
  console.log(`${item.rank}. ${item.keyword}: ${item.score}점`);
  console.log(`  - 제품 수: ${item.metadata.productCount}`);
  console.log(`  - 리뷰 수: ${item.metadata.reviewCount}`);
  console.log(`  - 효과: ${item.metadata.effects.map(e => e.effect).join(', ')}`);
});
```

---

## 📝 다음 단계

1. **환경 변수 설정**
   ```bash
   OPENAI_API_KEY=your_api_key
   MONGODB_URI=your_mongodb_uri
   MONGODB_DATABASE=your_database
   ```

2. **의존성 설치**
   ```bash
   npm install openai
   ```

3. **테스트 실행**
   ```bash
   # 서버 시작
   npm run dev
   
   # API 테스트
   curl "http://localhost:5000/api/trends/ingredient-leaderboard?country=usa&category=Skincare"
   ```

4. **프로덕션 최적화**
   - Redis 캐싱 도입
   - 큐 시스템 (Bull/BullMQ) 도입
   - 모니터링 및 로깅

