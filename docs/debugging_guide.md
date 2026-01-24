# 디버깅 가이드

## 서버 실행 및 워크플로우 확인

### 1. 서버 시작

```bash
cd /srv2/jinwook/amore_ver2/server
node index.js
```

**기대 출력:**
```
✅ MongoDB 연결 성공
Server running on http://localhost:5000
✅ 일일 배치 스케줄러 등록 완료 (매일 새벽 2시)

🚀 서버 시작 시 첫 워크플로우 실행 시작...
🔄 배치 작업 시작: ...
```

### 2. 서버 상태 확인

```bash
# Health check
curl http://localhost:5000/api/health

# 배치 상태 확인
curl http://localhost:5000/api/batch/status
```

### 3. 워크플로우 수동 실행

```bash
curl -X POST http://localhost:5000/api/batch/run \
  -H "Content-Type: application/json" \
  -d '{"country": "usa", "category": "Skincare", "weeks": 8}'
```

### 4. API 엔드포인트 테스트

```bash
# 리더보드 조회
curl "http://localhost:5000/api/real/leaderboard?country=usa&category=Skincare&itemType=Ingredients&trendLevel=Actionable"

# 리뷰 카운트
curl "http://localhost:5000/api/real/reviews/count?country=usa&period=8weeks"

# SNS 플랫폼 순위
curl "http://localhost:5000/api/real/sns-platform/popular?country=usa"

# 꿀조합 리더보드
curl "http://localhost:5000/api/real/combinations/leaderboard?country=usa&category=Skincare"
```

## UI 연동 확인

### 1. 프론트엔드 서버 실행

```bash
cd /srv2/jinwook/amore_ver2
npm run dev
```

### 2. 브라우저에서 확인

1. `http://localhost:5173` 접속
2. 개발자 도구 콘솔 열기 (F12)
3. 네트워크 탭에서 API 호출 확인
4. 리더보드 데이터가 실제 API에서 로드되는지 확인

### 3. API 호출 확인

브라우저 콘솔에서:
```javascript
// API 호출 테스트
fetch('http://localhost:5000/api/real/leaderboard?country=usa&category=Skincare&itemType=Ingredients&trendLevel=Actionable')
  .then(r => r.json())
  .then(console.log)
```

## 문제 해결

### MongoDB 연결 실패

```
⚠️ MongoDB 연결 실패: ...
```

**해결:**
- `.env` 파일에 `MONGODB_URI` 확인
- MongoDB 서버 실행 확인

### 워크플로우 실행 실패

```
❌ 배치 작업 실패
```

**확인 사항:**
1. Python 3 설치 확인: `python3 --version`
2. Python 라이브러리 설치: `pip3 install -r requirements.txt`
3. Gemini API 키 확인: `.env` 파일의 `GEMINI_API_KEY`
4. 로그 확인: 서버 콘솔 출력

### API 응답 없음

**확인:**
1. 서버 실행 중인지 확인: `curl http://localhost:5000/api/health`
2. CORS 설정 확인
3. 네트워크 탭에서 요청/응답 확인

### UI에 데이터가 표시되지 않음

**확인:**
1. 브라우저 콘솔 오류 확인
2. API 응답 확인: 네트워크 탭
3. `src/services/api.ts`의 API 호출 로직 확인
4. Mock 데이터로 폴백되는지 확인

## 로그 확인

### 서버 로그

서버 콘솔에서 실시간으로 확인:
- 워크플로우 실행 시작/완료
- 각 Agent 실행 상태
- DB 저장 성공/실패

### 배치 로그

```bash
# MongoDB에서 배치 로그 조회
# mongo shell 또는 MongoDB Compass 사용
db.batch_job_logs.find().sort({completedAt: -1}).limit(5)
```

## 성능 모니터링

### 워크플로우 실행 시간

배치 로그의 `duration` 필드 확인:
```json
{
  "duration": 323000,  // 밀리초 (약 5분)
  "status": "completed"
}
```

### API 응답 시간

브라우저 네트워크 탭에서 확인:
- 리더보드 API: < 1초
- 리뷰 카운트 API: < 500ms
- SNS 플랫폼 API: < 1초

