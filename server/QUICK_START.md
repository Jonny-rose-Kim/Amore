# 🚀 빠른 시작 가이드

## 워크플로우 실행하기

### 1단계: 서버 시작

```bash
cd /srv2/jinwook/amore_ver2/server
node index.js
```

**기대 출력:**
```
✅ MongoDB 연결 성공
Server running on http://localhost:5000
✅ 일일 배치 스케줄러 등록 완료 (매일 새벽 2시)
```

### 2단계: 워크플로우 실행 (선택)

#### 옵션 A: 즉시 실행 (API 호출)

새 터미널에서:
```bash
curl -X POST http://localhost:5000/api/batch/run \
  -H "Content-Type: application/json" \
  -d '{"country": "usa", "category": "Skincare", "weeks": 8}'
```

#### 옵션 B: 자동 실행 대기

매일 새벽 2시에 자동으로 실행됩니다.

### 3단계: 상태 확인

```bash
curl http://localhost:5000/api/batch/status
```

## 📋 체크리스트

- [ ] MongoDB 연결 확인
- [ ] `.env` 파일에 `GEMINI_API_KEY` 설정
- [ ] Python 3 및 라이브러리 설치 (`pip3 install -r requirements.txt`)
- [ ] 서버 실행 (`node index.js`)
- [ ] 워크플로우 실행 (API 호출 또는 자동 대기)

## 🎯 가장 간단한 방법

```bash
# 1. 서버 시작
cd /srv2/jinwook/amore_ver2/server
node index.js

# 2. 새 터미널에서 즉시 실행
curl -X POST http://localhost:5000/api/batch/run \
  -H "Content-Type: application/json" \
  -d '{"country": "usa", "category": "Skincare", "weeks": 8}'
```

끝! 🎉

