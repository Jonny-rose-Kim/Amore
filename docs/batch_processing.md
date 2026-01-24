# 배치 처리 시스템

## 개요

대시보드는 하루에 한 번만 업데이트되므로, LLM Agent 워크플로우는 **하루에 한 번만 실행**됩니다. 새로운 로우 데이터가 있을 때만 처리하고, 이미 정제된 데이터는 재사용합니다.

## 동작 방식

### 1. 자동 스케줄링
- **매일 새벽 2시**에 자동 실행
- `node-cron`을 사용한 스케줄링
- 서버 시작 시 자동 등록

### 2. 스마트 실행 조건
- 마지막 처리 시간 이후 **새로운 데이터가 있는지 확인**
- 새로운 데이터가 없으면 **건너뜀** (LLM API 호출 없음)
- 새로운 데이터가 있으면 **워크플로우 실행**

### 3. 데이터 흐름

```
로우 데이터 (raw_retail_sales, raw_reviews, raw_sns_posts)
    ↓
[배치 작업 - 하루 1회]
    ↓
LLM Agent 워크플로우 실행 (새 데이터 있을 때만)
    ↓
정제된 데이터 저장 (processed_keywords, trends, sns_platform_stats)
    ↓
[API - 정제된 데이터만 조회]
    ↓
대시보드 표시
```

## 사용 방법

### 1. 자동 실행 (기본)
서버를 시작하면 자동으로 스케줄러가 등록됩니다:

```bash
cd /srv2/jinwook/amore_ver2/server
node index.js
```

로그에서 확인:
```
✅ 일일 배치 스케줄러 등록 완료 (매일 새벽 2시)
```

### 2. 수동 실행 (테스트/긴급 업데이트)
API를 통해 수동으로 실행할 수 있습니다:

```bash
curl -X POST http://localhost:5000/api/batch/run \
  -H "Content-Type: application/json" \
  -d '{"country": "usa", "category": "Skincare", "weeks": 8}'
```

또는 스크립트로 직접 실행:

```bash
cd /srv2/jinwook/amore_ver2/server
node services/batchProcessor.js usa Skincare 8
```

### 3. 배치 상태 확인
최근 실행 내역 확인:

```bash
curl http://localhost:5000/api/batch/status
```

응답 예시:
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
  "recentLogs": [...]
}
```

## 배치 작업 로그

모든 배치 작업은 `batch_job_logs` 컬렉션에 기록됩니다:

```javascript
{
  jobType: 'llm_workflow',
  status: 'completed' | 'skipped' | 'failed',
  country: 'usa',
  category: 'Skincare',
  weeks: 8,
  startedAt: Date,
  completedAt: Date,
  duration: Number, // 밀리초
  reason: 'no_new_data', // skipped인 경우
  output: String, // 최대 1000자
  error: String // failed인 경우
}
```

## 새로운 데이터 확인 로직

배치 작업은 다음을 확인합니다:

1. **raw_retail_sales**: 마지막 처리 이후 새로운 판매 데이터
2. **raw_reviews**: 마지막 처리 이후 새로운 리뷰
3. **raw_sns_posts**: 마지막 처리 이후 새로운 SNS 게시물

하나라도 있으면 워크플로우 실행, 모두 없으면 건너뜀.

## 스케줄 변경

`server/services/batchProcessor.js`의 `scheduleDailyBatch()` 함수에서 변경:

```javascript
// 매일 새벽 2시
cron.schedule('0 2 * * *', ...)

// 매일 오전 9시로 변경하려면
cron.schedule('0 9 * * *', ...)

// 매 6시간마다 실행하려면
cron.schedule('0 */6 * * *', ...)
```

## 장점

1. **비용 절감**: LLM API는 하루에 한 번만 호출
2. **효율성**: 새로운 데이터가 없으면 불필요한 처리 건너뜀
3. **안정성**: 정제된 데이터는 재사용하여 일관성 유지
4. **모니터링**: 배치 로그로 실행 내역 추적 가능

## 주의사항

- 배치 작업은 **백그라운드에서 실행**되므로 API 응답은 즉시 반환됩니다
- 실행 중인 배치 작업은 서버 로그에서 확인할 수 있습니다
- MongoDB 연결이 필요합니다 (새 데이터 확인 및 로그 저장)

