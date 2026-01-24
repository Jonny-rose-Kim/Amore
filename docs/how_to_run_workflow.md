# 워크플로우 실행 가이드

## 🚀 실행 방법 3가지

### 방법 1: 서버 시작 (자동 스케줄링) ⭐ 추천

서버를 시작하면 자동으로 스케줄러가 등록되어 **매일 새벽 2시**에 실행됩니다.

```bash
cd /srv2/jinwook/amore_ver2/server
node index.js
```

**로그 확인:**
```
✅ MongoDB 연결 성공
Server running on http://localhost:5000
✅ 일일 배치 스케줄러 등록 완료 (매일 새벽 2시)
```

### 방법 2: API로 수동 실행 (즉시 실행)

서버가 실행 중일 때, API를 호출하여 즉시 워크플로우를 실행할 수 있습니다.

```bash
curl -X POST http://localhost:5000/api/batch/run \
  -H "Content-Type: application/json" \
  -d '{
    "country": "usa",
    "category": "Skincare",
    "weeks": 8
  }'
```

**응답:**
```json
{
  "success": true,
  "message": "배치 작업이 시작되었습니다. 백그라운드에서 실행 중입니다.",
  "country": "usa",
  "category": "Skincare",
  "weeks": 8
}
```

### 방법 3: 스크립트 직접 실행 (테스트용)

배치 프로세서를 직접 실행할 수 있습니다.

```bash
cd /srv2/jinwook/amore_ver2/server
node services/batchProcessor.js usa Skincare 8
```

또는 Python 워크플로우를 직접 실행:

```bash
cd /srv2/jinwook/amore_ver2/server
python3 services/gemini_agents.py usa Skincare 8
```

## 📊 실행 상태 확인

### 배치 작업 상태 조회

```bash
curl http://localhost:5000/api/batch/status
```

**응답 예시:**
```json
{
  "lastRun": {
    "status": "completed",
    "startedAt": "2024-01-15T02:00:00.000Z",
    "completedAt": "2024-01-15T02:05:23.000Z",
    "duration": 323000,
    "country": "usa",
    "category": "Skincare"
  },
  "recentLogs": [
    {
      "status": "completed",
      "startedAt": "2024-01-15T02:00:00.000Z",
      "completedAt": "2024-01-15T02:05:23.000Z",
      "duration": 323000
    },
    {
      "status": "skipped",
      "startedAt": "2024-01-15T01:00:00.000Z",
      "completedAt": "2024-01-15T01:00:01.000Z",
      "duration": 1000,
      "reason": "no_new_data"
    }
  ]
}
```

### 서버 로그 확인

서버 콘솔에서 실시간으로 진행 상황을 확인할 수 있습니다:

```
🔄 배치 작업 시작: 2024-01-15T02:00:00.000Z
   국가: usa, 카테고리: Skincare, 기간: 8주
   마지막 처리 시간: 2024-01-14T02:00:00.000Z
   📊 새로운 데이터 발견 - 워크플로우 실행
🚀 워크플로우 시작: usa/Skincare (8주)
📦 150개 제품 발견
🔍 Agent 1: 키워드 추출 시작...
  ✓ product-1: 5 성분, 2 제형
  ✓ product-2: 3 성분, 1 제형
...
✅ Agent 1 완료: 150개 제품 처리
🔍 Agent 2: 효과 매핑 시작...
...
✅ 배치 작업 완료: 323.45초
```

## ⚙️ 실행 조건

### 자동 실행 조건

1. **스케줄 시간**: 매일 새벽 2시 (Asia/Seoul)
2. **새 데이터 확인**: 마지막 처리 이후 새로운 데이터가 있는지 확인
   - `raw_retail_sales` 컬렉션에 새 데이터
   - `raw_reviews` 컬렉션에 새 리뷰
   - `raw_sns_posts` 컬렉션에 새 게시물
3. **실행 결정**:
   - 새 데이터 있음 → 워크플로우 실행
   - 새 데이터 없음 → 건너뜀 (로그만 기록)

### 수동 실행 조건

- 서버가 실행 중이어야 함
- MongoDB 연결 필요
- Python 3 및 필요한 라이브러리 설치 필요

## 🔧 환경 설정

### 필수 환경 변수

`.env` 파일에 설정:

```env
GEMINI_API_KEY=AIzaSyAV1UstQpGv-_wXaYXfAPkH4ts1aHFuWBo
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=amore
PORT=5000
```

### 필수 패키지

**Node.js:**
```bash
cd /srv2/jinwook/amore_ver2/server
npm install
```

**Python:**
```bash
cd /srv2/jinwook/amore_ver2/server
pip3 install -r requirements.txt
```

## 📝 실행 흐름

```
1. 서버 시작
   ↓
2. 스케줄러 등록 (매일 새벽 2시)
   ↓
3. 스케줄 시간 도래
   ↓
4. 마지막 처리 시간 확인
   ↓
5. 새 데이터 확인
   ├─ 새 데이터 있음 → 워크플로우 실행
   └─ 새 데이터 없음 → 건너뜀
   ↓
6. LLM Agent 워크플로우 실행
   ├─ Agent 1: 키워드 추출
   ├─ Agent 2: 효과 매핑
   ├─ Agent 3: 조합 분석
   ├─ Agent 4: 트렌드 집계
   └─ Agent 5: SNS 플랫폼 분석
   ↓
7. 정제된 데이터 DB 저장
   ├─ processed_keywords
   ├─ trends
   └─ sns_platform_stats
   ↓
8. 배치 로그 기록
```

## 🎯 빠른 시작 (테스트)

1. **서버 시작:**
   ```bash
   cd /srv2/jinwook/amore_ver2/server
   node index.js
   ```

2. **수동 실행 (즉시 테스트):**
   ```bash
   curl -X POST http://localhost:5000/api/batch/run \
     -H "Content-Type: application/json" \
     -d '{"country": "usa", "category": "Skincare", "weeks": 8}'
   ```

3. **상태 확인:**
   ```bash
   curl http://localhost:5000/api/batch/status
   ```

## ⚠️ 주의사항

1. **MongoDB 연결 필요**: 로우 데이터 확인 및 결과 저장을 위해 필요
2. **Python 환경**: LangChain 워크플로우 실행을 위해 Python 3 필요
3. **Gemini API 키**: LLM 호출을 위해 필요
4. **실행 시간**: 워크플로우는 수 분에서 수십 분이 걸릴 수 있음 (데이터 양에 따라)

