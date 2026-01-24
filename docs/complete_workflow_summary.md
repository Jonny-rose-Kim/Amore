# 완전한 워크플로우 요약

## 🎯 전체 구조

### 데이터 흐름
```
Raw 데이터 (제품 설명, 리뷰, SNS)
    ↓
[LangChain + LangGraph 워크플로우]
    ├─ Agent 1: 키워드 추출 (성분/제형/효과/Mood)
    ├─ Agent 2: 효과 매핑 (각 키워드별 효과)
    ├─ Agent 3: 조합 분석 (성분 + 제형 + 효과)
    ├─ Agent 4: 트렌드 집계 (점수 계산 및 분류)
    └─ Agent 5: SNS 플랫폼 분석 (플랫폼별 키워드 순위)
    ↓
DB 저장 (processed_keywords, trends, sns_platform_stats)
    ↓
API 엔드포인트
    ├─ /api/leaderboard (리더보드 조회/재구성)
    └─ /api/sns-platform (SNS 플랫폼별 순위)
    ↓
UI 시각화
    ├─ 리더보드 (SegmentedLeaderboard)
    └─ SNS 순위 바 (SNSTopChart)
```

---

## 📁 파일 구조

```
server/
├── services/
│   ├── langchain_workflow.py    # LangChain + LangGraph 워크플로우
│   ├── llmAgents.js             # JavaScript LLM Agent (기존)
│   └── trendClassifier.js       # 트렌드 분류 로직
├── routes/
│   ├── trends.js                # 트렌드 API
│   ├── leaderboard.js           # 리더보드 API
│   └── snsPlatform.js           # SNS 플랫폼 API
├── db.js                        # MongoDB 연결
├── index.js                     # Express 서버
└── requirements.txt             # Python 의존성

docs/
├── langchain_langgraph_architecture.md  # 아키텍처 상세
├── langchain_implementation_guide.md   # 구현 가이드
└── complete_workflow_summary.md        # 이 파일
```

---

## 🔄 워크플로우 상세

### Agent 1: 키워드 추출
- **입력**: 제품 설명 텍스트
- **출력**: 
  ```json
  {
    "ingredients": ["레티놀", "히알루론산"],
    "formulas": ["앰플", "세럼"],
    "effects": ["모공 케어", "장벽 강화"],
    "mood": ["미니어처", "매트 텍스처"]
  }
  ```
- **저장**: `processed_keywords` 컬렉션

### Agent 2: 효과 매핑
- **입력**: 키워드 리스트 + 리뷰 텍스트
- **출력**: 각 키워드별 관련 효과
  ```json
  {
    "레티놀": ["모공 케어", "각질 제거", "안티에이징"],
    "앰플": ["고농축 전달", "빠른 흡수"]
  }
  ```
- **저장**: `processed_keywords.effects` 필드

### Agent 3: 조합 분석
- **입력**: 키워드 + 제품 랭킹 데이터
- **출력**: 조합별 판매 성과
  ```json
  {
    "combination": "레티놀 + 앰플 + 모공 케어",
    "avgRank": 12.5,
    "productCount": 15,
    "synergyScore": 0.92
  }
  ```

### Agent 4: 트렌드 집계
- **입력**: 조합 분석 결과
- **출력**: 트렌드 점수 및 분류
  ```json
  {
    "combination": "레티놀 + 앰플 + 모공 케어",
    "score": 98,
    "category": "Actionable",
    "signals": {"SNS": 95, "Retail": 86, "Review": 90}
  }
  ```
- **저장**: `trends` 컬렉션

### Agent 5: SNS 플랫폼 분석
- **입력**: SNS 게시물 데이터
- **출력**: 플랫폼별 키워드 순위
  ```json
  {
    "Instagram": [
      {"keyword": "레티놀", "value": 95, "change": 12, "type": "ingredient"}
    ]
  }
  ```
- **저장**: `sns_platform_stats` 컬렉션

---

## 🚀 실행 방법

### 1. Python 워크플로우 직접 실행

```bash
cd server
python3 services/langchain_workflow.py usa Skincare 8
```

### 2. API를 통해 실행

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

### 3. 주기적 실행 (Cron)

```bash
# 매주 월요일 오전 2시 실행
0 2 * * 1 cd /srv2/jinwook/amore_ver2/server && python3 services/langchain_workflow.py usa Skincare 8
```

---

## 📊 API 엔드포인트

### 리더보드
- `POST /api/leaderboard/regenerate` - 리더보드 재구성
- `GET /api/leaderboard` - 리더보드 조회

### SNS 플랫폼
- `GET /api/sns-platform/rankings` - 모든 플랫폼 순위
- `GET /api/sns-platform/:platform` - 특정 플랫폼 순위

---

## 💡 핵심 포인트

1. **Multi-Agent 구조**: LangChain + LangGraph로 Agent 간 데이터 전달
2. **DB 저장**: 각 Agent의 출력을 DB에 저장하여 재사용 가능
3. **시각화 준비**: 집계된 데이터를 바로 UI에 표시 가능
4. **주기적 실행**: 최신 8주 데이터 기준으로 주기적 업데이트
5. **리더보드 재구성**: DB 기반으로 실제 데이터로 리더보드 생성

---

## ✅ 체크리스트

- [x] LangChain + LangGraph 워크플로우 구현
- [x] 5개 Agent 구현 (키워드 추출, 효과 매핑, 조합 분석, 트렌드 집계, SNS 분석)
- [x] DB 저장 구조 설계
- [x] API 엔드포인트 구현
- [x] 리더보드 재구성 로직
- [x] SNS 플랫폼별 순위 조회
- [ ] 테스트 실행
- [ ] 프로덕션 배포
- [ ] 모니터링 설정

