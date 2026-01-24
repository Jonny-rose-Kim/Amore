# 구현 상태 요약

## 완료된 작업

### 1. Gemini API 통합
- ✅ `amore` 폴더에서 Gemini API 키 추출: `AIzaSyAV1UstQpGv-_wXaYXfAPkH4ts1aHFuWBo`
- ✅ `llmAgents.js`를 Gemini API로 전환
- ✅ `gemini_agents.py` (LangChain + LangGraph 워크플로우) 생성
- ✅ `@google/generative-ai` 패키지 설치

### 2. 백엔드 서버 구조
- ✅ Express 서버 설정 (`server/index.js`)
- ✅ MongoDB 연결 설정 (Mongoose 사용)
- ✅ API 라우트 구성:
  - `/api/health` - 서버 상태 확인
  - `/api/workflow/run` - LangChain 워크플로우 실행
  - `/api/real/leaderboard` - 실제 DB 기반 리더보드
  - `/api/real/reviews/count` - 리뷰 카운트 바 데이터
  - `/api/real/sns-platform/popular` - SNS 플랫폼 순위
  - `/api/real/combinations/leaderboard` - 꿀조합 리더보드

### 3. DB 컬렉션 설계
- ✅ `processed_keywords` - LLM으로 추출된 키워드 저장
- ✅ `trends` - 트렌드 분석 결과 저장
- ✅ `sns_platform_stats` - SNS 플랫폼별 통계
- ✅ `leaderboard` - 리더보드 데이터
- ✅ `combination_leaderboard` - 꿀조합 리더보드

### 4. LangChain + LangGraph 워크플로우
- ✅ Multi-Agent 시스템 구현:
  1. **키워드 추출 Agent**: 제품 설명에서 성분/제형/효과/Mood 추출
  2. **효과 매핑 Agent**: 각 키워드별 관련 효과 추출
  3. **조합 분석 Agent**: 가장 잘 팔리는 조합 분석
  4. **트렌드 집계 Agent**: 트렌드 점수 계산 및 분류
  5. **SNS 플랫폼 분석 Agent**: SNS 플랫폼별 키워드 순위 분석

### 5. Python 의존성
- ✅ `requirements.txt` 업데이트:
  - `langchain>=0.1.0`
  - `langchain-google-genai>=1.0.0`
  - `langgraph>=0.0.20`
  - `pymongo>=4.6.1`
  - `python-dotenv>=1.0.0`
  - `google-generativeai>=0.3.0`

## 실행 방법

### 1. 백엔드 서버 실행
```bash
cd /srv2/jinwook/amore_ver2/server
node index.js
```

### 2. LangChain 워크플로우 실행
```bash
# API를 통해 실행
curl -X POST http://localhost:5000/api/workflow/run \
  -H "Content-Type: application/json" \
  -d '{"country": "usa", "category": "Skincare", "weeks": 8}'

# 또는 Python 스크립트 직접 실행
cd /srv2/jinwook/amore_ver2/server
python3 services/gemini_agents.py usa Skincare 8
```

### 3. DB 컬렉션 생성
```bash
cd /srv2/jinwook/amore_ver2/server
node services/db_setup.js
```

## 환경 변수 설정

`.env` 파일에 다음 변수 설정 필요:
```
GEMINI_API_KEY=AIzaSyAV1UstQpGv-_wXaYXfAPkH4ts1aHFuWBo
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=amore
PORT=5000
```

## 다음 단계

1. **MongoDB 연결**: 실제 MongoDB URI 설정 필요
2. **데이터 수집**: `raw_retail_sales`, `raw_reviews`, `raw_sns_posts` 컬렉션에 데이터 입력
3. **워크플로우 테스트**: 실제 데이터로 워크플로우 실행 및 검증
4. **UI 연동**: 프론트엔드에서 실제 API 호출하도록 수정

## 주요 파일

- `server/index.js` - Express 서버 메인 파일
- `server/services/llmAgents.js` - Gemini 기반 LLM Agent 함수들
- `server/services/gemini_agents.py` - LangChain + LangGraph 워크플로우
- `server/services/db_setup.js` - DB 컬렉션 초기화
- `server/routes/workflow.js` - 워크플로우 실행 API
- `server/routes/realData.js` - 실제 DB 기반 데이터 API

