# 클로드가 새로 구축한 DB 컬렉션 및 데이터

## 개요

클로드 코딩에 의해 새로 추가/구축된 MongoDB 컬렉션과 데이터 처리 워크플로우를 정리합니다.

## 새로 생성된 컬렉션 (5개)

### 1. `processed_keywords` ⭐
**목적**: LLM(Gemini)으로 제품 설명에서 추출한 키워드 저장

**데이터 소스**: 
- `raw_retail_sales`의 `description` 필드
- LLM Agent 1 (키워드 추출)에서 생성

**구조**:
```javascript
{
  keyword: String,           // 추출된 키워드 (예: "hyaluronic acid")
  keywordType: String,       // 타입: 'ingredient', 'formula', 'effect', 'mood'
  sourceType: String,        // 'product_description'
  sourceId: String,          // 제품 ID
  effects: [String],         // 관련 효과 (LLM Agent 2에서 매핑)
  country: String,           // 국가
  extractedAt: Date,        // 추출 시간
  processedAt: Date          // 처리 시간
}
```

**현재 데이터**: 181개 문서

**생성 위치**: `gemini_agents.py` - `save_to_db()` 함수

---

### 2. `trends` ⭐
**목적**: 트렌드 분석 결과 저장 (성분+제형+효과 조합)

**데이터 소스**:
- `processed_keywords`에서 집계
- LLM Agent 3 (조합 분석) + Agent 4 (트렌드 집계)에서 생성

**구조**:
```javascript
{
  combination: String,       // 조합 문자열 (예: "niacinamide + serum + hydration")
  ingredients: [String],     // 성분 배열
  formulas: [String],        // 제형 배열
  effects: [String],         // 효과 배열
  country: String,           // 국가
  category: String,          // 트렌드 카테고리: 'Actionable', 'Growing', 'Early'
  score: Number,             // 트렌드 점수 (0-100)
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

**현재 데이터**: 20개 문서

**생성 위치**: `gemini_agents.py` - `save_to_db()` 함수

---

### 3. `sns_platform_stats` ⭐
**목적**: SNS 플랫폼별 키워드 순위 통계

**데이터 소스**:
- `raw_sns_posts`에서 집계
- LLM Agent 5 (SNS 플랫폼 분석)에서 생성

**구조**:
```javascript
{
  platform: String,          // 플랫폼: 'Instagram', 'TikTok', 'YouTube', 'Amazon', 'Shopee', 'Cosme'
  country: String,           // 국가
  keywords: [{               // 키워드 배열 (상위 10개)
    keyword: String,         // 키워드 이름
    value: Number,           // 값 (언급 수 기반, 0-100)
    change: Number,          // 변화율 (%)
    type: String,           // 타입: 'ingredients', 'formulas', 'effects'
    mentionCount: Number     // 언급 횟수
  }],
  date: Date,                // 통계 날짜
  calculatedAt: Date         // 계산 시간
}
```

**현재 데이터**: 6개 문서 (플랫폼별)

**생성 위치**: `gemini_agents.py` - `save_to_db()` 함수

---

### 4. `leaderboard` ⭐
**목적**: 리더보드 데이터 (키워드별 순위)

**데이터 소스**:
- `processed_keywords` + `trends` 집계
- `gemini_agents.py`의 `save_to_db()` 함수에서 생성

**구조**:
```javascript
{
  rank: Number,              // 순위
  keyword: String,           // 키워드 이름
  keywordType: String,       // 타입: 'ingredient', 'formula', 'effect', 'mood'
  country: String,           // 국가
  category: String,          // 카테고리
  score: Number,            // 점수
  productCount: Number,      // 관련 제품 수
  trendLevel: String,        // 트렌드 레벨: 'Actionable', 'Growing', 'Early'
  updatedAt: Date           // 업데이트 시간
}
```

**현재 데이터**: 29개 문서

**생성 위치**: `gemini_agents.py` - `save_to_db()` 함수

---

### 5. `batch_job_logs` ⭐
**목적**: 배치 작업 실행 로그

**데이터 소스**: 배치 프로세서 실행 시 자동 생성

**구조**:
```javascript
{
  jobType: String,           // 'llm_workflow'
  status: String,            // 'completed', 'skipped', 'failed'
  country: String,           // 국가 (선택)
  category: String,          // 카테고리 (선택)
  weeks: Number,            // 기간 (선택)
  startedAt: Date,           // 시작 시간
  completedAt: Date,        // 완료 시간
  duration: Number,         // 실행 시간 (밀리초)
  reason: String,           // 건너뜀 이유 (skipped인 경우)
  output: String,           // 출력 로그 (최대 1000자)
  error: String             // 오류 메시지 (failed인 경우)
}
```

**현재 데이터**: 없음 (아직 배치 작업이 실행되지 않음)

**생성 위치**: `batchProcessor.js` - `runBatchJob()` 함수

---

## 데이터 처리 워크플로우

### LLM Multi-Agent 워크플로우

```
1. raw_retail_sales (로우 데이터)
   ↓
2. Agent 1: 키워드 추출 (Gemini)
   → processed_keywords 생성
   ↓
3. Agent 2: 효과 매핑 (Gemini)
   → processed_keywords.effects 업데이트
   ↓
4. Agent 3: 조합 분석
   → 조합 데이터 생성
   ↓
5. Agent 4: 트렌드 집계
   → trends 생성
   ↓
6. Agent 5: SNS 플랫폼 분석
   → sns_platform_stats 생성
   ↓
7. 리더보드 집계
   → leaderboard 생성
```

## 기존 컬렉션 (시드 데이터)

다음 컬렉션들은 `seed_data.py`로 생성된 테스트 데이터입니다:

- `raw_retail_sales` (160개) - 제품 판매 데이터
- `raw_reviews` (185개) - 제품 리뷰 데이터
- `raw_sns_posts` (128개) - SNS 게시물 데이터

## 주요 특징

### 1. LLM 기반 자동 추출
- 제품 설명에서 성분/제형/효과/Mood 키워드 자동 추출
- Gemini API 사용 (`gemini-1.5-flash`, `gemini-1.5-pro`)

### 2. 트렌드 분석
- 조합 기반 트렌드 분석
- 3-Signal 검증 (SNS, Retail, Review)
- 트렌드 카테고리 자동 분류 (Actionable, Growing, Early)

### 3. 실시간 집계
- 리더보드 자동 생성
- SNS 플랫폼별 키워드 순위 집계
- 배치 작업으로 하루 1회 자동 업데이트

### 4. 데이터 추적
- 배치 작업 로그 저장
- 처리 시간 추적
- 오류 로깅

## 생성 파일

### JavaScript
- `server/services/db_setup.js` - 컬렉션 초기화
- `server/services/batchProcessor.js` - 배치 작업 처리
- `server/routes/realData.js` - 실제 DB 기반 API
- `server/scripts/view_db.js` - DB 조회 스크립트

### Python
- `server/services/gemini_agents.py` - LLM 워크플로우 (메인)
- `server/services/langchain_workflow.py` - LangChain 워크플로우 (대체)

## 사용 방법

### 컬렉션 생성
```bash
cd /srv2/jinwook/amore_ver2/server
node services/db_setup.js
```

### 워크플로우 실행 (데이터 생성)
```bash
# 자동 (서버 시작 시)
node index.js

# 수동
curl -X POST http://localhost:5000/api/batch/run \
  -H "Content-Type: application/json" \
  -d '{"country": "usa", "category": "Skincare", "weeks": 8}'
```

### 데이터 조회
```bash
node scripts/view_db.js
node scripts/view_db.js processed_keywords 10
node scripts/view_db.js trends 5
```

## 요약

클로드가 새로 구축한 것:
1. ✅ **5개 새 컬렉션** 생성 및 인덱스 설정
2. ✅ **LLM 기반 키워드 추출** 워크플로우
3. ✅ **트렌드 분석 및 집계** 시스템
4. ✅ **배치 작업 시스템** (하루 1회 자동 실행)
5. ✅ **API 엔드포인트** (실제 DB 데이터 조회)
6. ✅ **DB 조회 스크립트** (데이터 확인용)

