# LangChain + LangGraph 구현 가이드

## 📋 요약

### 워크플로우 구조
```
제품 설명 → [Agent 1] 키워드 추출 (성분/제형/효과/Mood)
    ↓
[Agent 2] 효과 매핑 (각 키워드별 효과)
    ↓
[Agent 3] 조합 분석 (성분 + 제형 + 효과 조합)
    ↓
[Agent 4] 트렌드 집계 (점수 계산 및 분류)
    ↓
[Agent 5] SNS 플랫폼 분석 (플랫폼별 키워드 순위)
    ↓
DB 저장 → 시각화
```

### 주요 기능
1. **키워드 추출**: 제품 설명에서 성분, 제형, 효과, Mood 추출
2. **효과 매핑**: 각 키워드별 관련 효과 추출
3. **조합 분석**: 가장 잘 팔리는 조합 분석
4. **리더보드 재구성**: DB 기반 리더보드 생성
5. **SNS 플랫폼별 순위**: 플랫폼별 키워드 순위 바 출력

---

## 🚀 설치 및 설정

### 1. Python 의존성 설치

```bash
cd server
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일에 추가:
```bash
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=mongodb://your_mongodb_uri
MONGODB_DATABASE=your_database_name
```

### 3. 워크플로우 실행

#### Python에서 직접 실행
```python
from services.langchain_workflow import run_workflow

# 최신 8주 데이터로 실행
result = run_workflow(
    country="usa",
    category="Skincare",
    weeks=8
)
```

#### API를 통해 실행
```bash
# 리더보드 재구성
curl -X POST http://localhost:5000/api/leaderboard/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "country": "usa",
    "category": "Skincare",
    "weeks": 8
  }'
```

---

## 📊 API 사용법

### 1. 리더보드 조회

```bash
GET /api/leaderboard?country=usa&category=Skincare&itemType=Ingredients&trendLevel=Actionable
```

**Response:**
```json
{
  "country": "usa",
  "category": "Skincare",
  "itemType": "Ingredients",
  "trendLevel": "Actionable",
  "leaderboard": {
    "ingredients": [
      {
        "rank": 1,
        "keyword": "레티놀",
        "score": 98,
        "change": 0,
        "metadata": {
          "count": 15,
          "avgRank": 12.5
        }
      },
      ...
    ]
  }
}
```

### 2. SNS 플랫폼별 키워드 순위

```bash
GET /api/sns-platform/rankings?country=usa
```

**Response:**
```json
{
  "country": "usa",
  "platforms": [
    {
      "platform": "Instagram",
      "keywords": [
        {
          "keyword": "레티놀",
          "value": 95,
          "change": 12,
          "type": "ingredient"
        },
        ...
      ]
    },
    ...
  ]
}
```

### 3. 특정 플랫폼 순위

```bash
GET /api/sns-platform/Instagram?country=usa
```

---

## 🔄 주기적 실행

### Cron Job 설정 (매주 월요일 실행)

```bash
# crontab -e
0 2 * * 1 cd /srv2/jinwook/amore_ver2/server && python3 services/langchain_workflow.py usa Skincare 8
```

또는 Node.js 스케줄러 사용:

```javascript
// server/scheduler.js
import cron from 'node-cron';
import { spawn } from 'child_process';

// 매주 월요일 오전 2시 실행
cron.schedule('0 2 * * 1', () => {
  console.log('🔄 주간 워크플로우 실행');
  
  const pythonProcess = spawn('python3', [
    'services/langchain_workflow.py',
    'usa',
    'Skincare',
    '8'
  ]);
  
  pythonProcess.on('close', (code) => {
    console.log(`✅ 워크플로우 완료 (코드: ${code})`);
  });
});
```

---

## 💾 DB 저장 구조

### processed_keywords
```javascript
{
  keyword: "레티놀",
  keywordType: "ingredient",
  sourceType: "product_description",
  sourceId: "product-123",
  effects: ["모공 케어", "각질 제거"],
  extractedAt: Date,
  processedAt: Date
}
```

### trends
```javascript
{
  combination: "레티놀 + 앰플 + 모공 케어",
  ingredients: ["레티놀"],
  formulas: ["앰플"],
  effects: ["모공 케어"],
  avgRank: 12.5,
  productCount: 15,
  score: 98,
  category: "Actionable",
  signals: {
    SNS: 95,
    Retail: 86,
    Review: 90
  },
  calculatedAt: Date
}
```

### sns_platform_stats
```javascript
{
  platform: "Instagram",
  country: "usa",
  keywords: [
    {
      keyword: "레티놀",
      value: 95,
      change: 12,
      type: "ingredient"
    }
  ],
  date: Date,
  calculatedAt: Date
}
```

---

## 🎨 프론트엔드 연동

### 리더보드 데이터 조회

```javascript
// 리더보드 조회
const response = await fetch(
  '/api/leaderboard?country=usa&category=Skincare&itemType=Ingredients&trendLevel=Actionable'
);
const data = await response.json();

// UI에 표시
data.leaderboard.ingredients.forEach(item => {
  console.log(`${item.rank}. ${item.keyword}: ${item.score}점`);
});
```

### SNS 플랫폼별 순위 조회

```javascript
// SNS 플랫폼별 순위 조회
const response = await fetch('/api/sns-platform/rankings?country=usa');
const data = await response.json();

// SNSTopChart 컴포넌트에 전달
data.platforms.forEach(platform => {
  console.log(`${platform.platform}:`);
  platform.keywords.forEach(kw => {
    console.log(`  - ${kw.keyword}: ${kw.value}`);
  });
});
```

---

## 🔧 최적화 팁

### 1. 배치 처리
- 여러 제품을 한 번에 처리
- LLM 호출 최소화

### 2. 캐싱
- 이미 처리된 제품은 캐시 사용
- Redis 활용 권장

### 3. 병렬 처리
- 각 제품별 키워드 추출을 병렬로 처리
- asyncio 사용

### 4. 증분 업데이트
- 변경된 데이터만 재처리
- 전체 재처리는 주기적으로만 실행

---

## 📝 다음 단계

1. **환경 설정 완료**
2. **테스트 실행**: 소량 데이터로 테스트
3. **프로덕션 배포**: 전체 데이터로 실행
4. **모니터링**: 실행 시간 및 오류 모니터링
5. **최적화**: 성능 개선

