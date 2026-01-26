# 서버 실행 상태

## 구현 완료 사항

### ✅ 1. 서버 시작 시 첫 워크플로우 자동 실행
- `server/index.js`에 서버 시작 후 3초 뒤 자동 실행 로직 추가
- `runManualBatch()` 함수를 호출하여 첫 워크플로우 실행

### ✅ 2. UI API 연동
- `src/services/api.ts` 생성 - 실제 백엔드 API 호출 함수
- `src/components/SegmentedLeaderboard.tsx` 수정 - API 데이터 우선 사용

### ✅ 3. 배치 처리 시스템
- 하루에 한 번 자동 실행 (매일 새벽 2시)
- 새 데이터 있을 때만 실행
- 배치 로그 저장

## 실행 방법

### 서버 시작
```bash
cd /srv2/jinwook/amore_ver2/server
node index.js
```

**기대 동작:**
1. 서버 시작
2. MongoDB 연결 시도
3. 스케줄러 등록 (매일 새벽 2시)
4. 3초 후 첫 워크플로우 자동 실행

### 수동 실행 (테스트)
```bash
curl -X POST http://localhost:5000/api/batch/run \
  -H "Content-Type: application/json" \
  -d '{"country": "usa", "category": "Skincare", "weeks": 8}'
```

## 확인 사항

### 1. 서버 상태
```bash
curl http://localhost:5000/api/health
```

### 2. 배치 상태
```bash
curl http://localhost:5000/api/batch/status
```

### 3. API 엔드포인트
```bash
# 리더보드
curl "http://localhost:5000/api/real/leaderboard?country=usa&category=Skincare&itemType=Ingredients&trendLevel=Actionable"

# 리뷰 카운트
curl "http://localhost:5000/api/real/reviews/count?country=usa&period=8weeks"

# SNS 플랫폼
curl "http://localhost:5000/api/real/sns-platform/popular?country=usa"

# 꿀조합
curl "http://localhost:5000/api/real/combinations/leaderboard?country=usa&category=Skincare"
```

## 문제 해결

### MongoDB 연결 실패
- `.env` 파일에 `MONGODB_URI` 확인
- MongoDB 서버 실행 확인
- 연결 실패해도 서버는 실행되지만 일부 기능 제한

### 워크플로우 실행 실패
- Python 3 설치 확인
- `pip3 install -r requirements.txt` 실행
- Gemini API 키 확인

### UI에 데이터 표시 안 됨
- 브라우저 콘솔 확인
- API 응답 확인 (네트워크 탭)
- Mock 데이터로 폴백되는지 확인

