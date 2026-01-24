# UI AI 분석 기능 리스트

## 개요

UI에서 사용되는 모든 AI 분석 및 요약 기능을 정리하고, 각 기능에 적합한 LLM 모델을 추천합니다.

---

## 1. 트렌드 인사이트 패널 (InsightPanel) 📊

### 기능 설명
리더보드 항목 선택 시 표시되는 AI 분석 패널

### AI 분석 항목

#### 1.1 AI 요약 (generateSummary)
- **위치**: `InsightPanel.tsx` - `generateSummary()` 함수
- **입력 데이터**:
  - `numericalEvidence`: SNS 언급 수, 리뷰 수, 성장률, 시장 점유율
  - `aiExplanation`: AI 근거 설명
  - `reviewTrend`: 리뷰 추세 요약
- **출력**: 3-5문장 요약 텍스트
- **용도**: 트렌드/꿀조합의 핵심 정보를 간결하게 요약

**예시 출력**:
```
레티놀은 현재 트렌드로 급성장 중입니다. SNS에서 12,500건의 언급과 8,500건의 리뷰가 축적되었으며, 
전월 대비 45%의 성장률을 보이고 있습니다. 시장 점유율 15%를 기록하며...
```

#### 1.2 AI 근거 설명 (aiExplanation)
- **위치**: `TrendEvidence.aiExplanation`
- **입력 데이터**: 
  - 트렌드 수치 데이터 (SNS/Retail/Review 신호)
  - 성장률, 시장 점유율
  - 관련 제품 정보
- **출력**: 트렌드가 왜 주목받는지에 대한 상세 설명
- **용도**: 트렌드의 근거와 배경 설명

#### 1.3 리뷰 추세 요약 (reviewTrend)
- **위치**: `TrendEvidence.reviewTrend`
- **입력 데이터**: 리뷰 데이터, 감성 분석 결과
- **출력**: 리뷰에서 나타나는 트렌드 패턴 요약
- **용도**: 소비자 피드백 기반 트렌드 분석

#### 1.4 행동 강령 (actionPlan)
- **위치**: `TrendEvidence.actionPlan`
- **입력 데이터**: 트렌드 상태, 수치 데이터
- **출력**: 기획자가 활용할 수 있는 구체적 행동 방안
- **용도**: 마케팅/NPD/전략 수립 가이드

**추천 LLM**: 
- **요약**: `gemini-1.5-flash` (빠른 응답, 간결한 요약)
- **근거 설명**: `gemini-1.5-pro` (상세한 분석, 논리적 설명)
- **행동 강령**: `gemini-1.5-pro` (전략적 사고, 구체적 제안)

---

## 2. 리뷰 키워드 분석 패널 (ReviewKeywordsPanel) 💬

### 기능 설명
긍정/부정 리뷰 키워드를 분석하고 AI 요약 제공

### AI 분석 항목

#### 2.1 AI 리뷰 키워드 분석 요약 (generateAISummary)
- **위치**: `ReviewKeywordsPanel.tsx` - `generateAISummary()` 함수
- **입력 데이터**:
  - 긍정 키워드 배열 (상위 3개)
  - 부정 키워드 배열 (상위 3개)
  - 감성 비율 (sentimentRatio)
  - 키워드별 언급 횟수
- **출력**:
  - `summary`: 리뷰 분석 요약 텍스트
  - `sentimentRatio`: 긍정/부정 비율
  - `insights`: 핵심 인사이트 배열 (3개)
- **용도**: 리뷰 데이터를 종합 분석하여 소비자 인식 파악

**예시 출력**:
```
레티놀에 대한 리뷰 키워드 분석 결과, 소비자들은 주로 "효과 빠름", "피부 개선", "만족도 높음" 등의 
긍정적 피드백을 보였습니다. 전반적인 만족도가 매우 높으며...
```

**핵심 인사이트 예시**:
- 높은 소비자 만족도
- 효과에 대한 긍정적 인식
- 재구매 의향 강함

**추천 LLM**: 
- `gemini-1.5-flash` (빠른 감성 분석, 키워드 요약)
- 또는 `gemini-1.5-pro` (더 정교한 감성 분석 필요 시)

---

## 3. SNS 플랫폼 인기 키워드 분석 (SNSTopChart) 📱

### 기능 설명
SNS 플랫폼별(Instagram, TikTok, YouTube 등) 키워드 순위를 분석

### AI 분석 항목

#### 3.1 SNS 플랫폼 종합 분석 (analysisData)
- **위치**: `SNSTopChart.tsx` - `generateAnalysis()` 함수
- **입력 데이터**:
  - 플랫폼별 키워드 순위 (6개 플랫폼)
  - 키워드별 변화율
  - 플랫폼별 특성
- **출력**:
  - `summary`: 플랫폼별 트렌드 종합 요약
  - `insights`: 핵심 인사이트 배열
  - `recommendations`: 전략 제안 배열
- **용도**: 플랫폼별 트렌드 차이 분석 및 마케팅 전략 수립

**예시 출력**:
```
Instagram에서는 "Glass Skin" 키워드가 TikTok보다 3배 높은 언급률을 보이며, 
YouTube에서는 교육적 콘텐츠와 연계된 "Barrier Repair" 키워드가 강세입니다...
```

**핵심 인사이트 예시**:
- Instagram: 시각적 미학 중심 트렌드
- TikTok: 바이럴 트렌드 중심
- YouTube: 교육적/전문적 콘텐츠

**전략 제안 예시**:
- Instagram: 시각적 스토리텔링 강화
- TikTok: 챌린지/트렌드 참여 전략

**추천 LLM**: 
- `gemini-1.5-pro` (플랫폼별 특성 이해, 전략적 분석)

---

## 4. 제품 비교 분석 (ProductComparison) 🔄

### 기능 설명
해외 인기 제품 vs 한국 인기 제품 비교 분석

### AI 분석 항목

#### 4.1 해외 제품 요약 (overseasSummary)
- **입력 데이터**: 해외 제품 정보 (이름, 브랜드, 카테고리)
- **출력**: 해외 시장에서의 제품 포지셔닝 및 특징 요약

#### 4.2 국내 제품 요약 (domesticSummary)
- **입력 데이터**: 국내 제품 정보
- **출력**: 국내 시장에서의 제품 포지셔닝 및 특징 요약

#### 4.3 종합 비교 분석 (overallComparison)
- **입력 데이터**: 두 제품의 정보
- **출력**: 시장 포지셔닝, 강점, 가격 대비 효과 등 종합 비교
- **용도**: 해외 진출 전략, 제품 기획 참고

**예시 출력**:
```
두 제품을 종합적으로 비교 분석한 결과, CeraVe Hydrating Cleanser은 해외 시장에서 검증된 
성분 조합과 안정성을 강점으로 하며, 한국 제품은 한국 소비자들의 피부 특성에 최적화된 
포뮬레이션을 강점으로 합니다...
```

**추천 LLM**: 
- `gemini-1.5-pro` (비교 분석, 시장 이해도)

---

## 5. AI 맞춤형 인사이트 보고서 (ReportModal/ReportViewModal) 📄

### 기능 설명
트렌드 기반 맞춤형 보고서 생성 (3가지 유형)

### AI 분석 항목

#### 5.1 마케팅 캠페인용 보고서 (marketing)
- **위치**: `mockData.ts` - `generateReport()` 함수
- **입력 데이터**: 
  - 선택된 트렌드 항목
  - 국가별 데이터
  - 트렌드 수치
- **출력**: 마케팅 메시지, 타겟팅, 홍보 채널 제안
- **용도**: 마케팅 캠페인 기획

#### 5.2 신제품 기획(BM)용 보고서 (npd)
- **입력 데이터**: 동일
- **출력**: 성분 배합, 제형 컨셉, USP 제안
- **용도**: 신제품 개발 기획

#### 5.3 해외 진출 전략용 보고서 (overseas)
- **입력 데이터**: 동일
- **출력**: 국가별 선호도, 진입 장벽 분석, 전략 제안
- **용도**: 해외 시장 진출 전략

**예시 출력 (마케팅용)**:
```
레티놀 트렌드를 활용한 마케팅 캠페인 전략:
- 타겟: 2030 모공 고민 고객층
- 메시지: "과학적 검증된 레티놀, 모공 케어의 새로운 기준"
- 채널: Instagram, TikTok (바이럴 콘텐츠 중심)
...
```

**추천 LLM**: 
- **마케팅**: `gemini-1.5-pro` (크리에이티브, 전략적 사고)
- **NPD**: `gemini-1.5-pro` (기술적 이해, 제품 기획)
- **해외진출**: `gemini-1.5-pro` (시장 분석, 전략 수립)

---

## 6. 트렌드 근거 설명 (TrendEvidence) 📈

### 기능 설명
트렌드의 근거와 배경을 설명하는 AI 분석

### AI 분석 항목

#### 6.1 꿀조합 이유 설명 (combinationReason)
- **위치**: `TrendItem.combinationReason`
- **입력 데이터**: 
  - 조합된 성분/제형/효과
  - SNS/Retail/Review 신호 데이터
  - 시너지 점수
- **출력**: 왜 이 조합이 효과적인지 설명
- **용도**: 제품 조합 전략 수립

**예시 출력**:
```
레티놀의 각질 제거 효과와 앰플의 고농축 전달력이 모공 케어에 시너지를 일으키며, 
SNS(95%), 리테일(86%), 리뷰(90%) 3가지 신호에서 모두 상승세를 보이고 있습니다...
```

#### 6.2 트렌드 단계별 가이드 (actionGuide)
- **위치**: `BubbleItem.actionGuide`
- **입력 데이터**: 트렌드 상태 (Early/Growing/Actionable)
- **출력**: 트렌드 단계별 기획자 참고 방향성
- **용도**: 트렌드 단계에 맞는 전략 수립

**예시 출력**:
```
🚀 Rising 단계: 테스트 제품이나 파일럿 기획에 적합. 신제품 라인업에 빠르게 반영하여 
시장 반응을 확인할 수 있습니다.
```

**추천 LLM**: 
- `gemini-1.5-pro` (논리적 설명, 전략적 사고)

---

## LLM 모델 추천 요약

### 빠른 응답이 필요한 기능 (Flash 모델)
- ✅ **리뷰 키워드 분석 요약** (`gemini-1.5-flash`)
- ✅ **트렌드 요약** (`gemini-1.5-flash`)
- ✅ **간단한 설명** (`gemini-1.5-flash`)

### 정교한 분석이 필요한 기능 (Pro 모델)
- ✅ **AI 근거 설명** (`gemini-1.5-pro`)
- **SNS 플랫폼 종합 분석** (`gemini-1.5-pro`)
- **제품 비교 분석** (`gemini-1.5-pro`)
- **맞춤형 보고서 생성** (`gemini-1.5-pro`)
- **꿀조합 이유 설명** (`gemini-1.5-pro`)
- **행동 강령/전략 제안** (`gemini-1.5-pro`)

### 모델 선택 기준

| 기능 | 복잡도 | 응답 속도 | 추천 모델 |
|------|--------|----------|----------|
| 요약 | 낮음 | 빠름 | `gemini-1.5-flash` |
| 감성 분석 | 중간 | 빠름 | `gemini-1.5-flash` |
| 근거 설명 | 높음 | 보통 | `gemini-1.5-pro` |
| 전략 제안 | 높음 | 보통 | `gemini-1.5-pro` |
| 비교 분석 | 높음 | 보통 | `gemini-1.5-pro` |
| 보고서 생성 | 매우 높음 | 느림 | `gemini-1.5-pro` |

---

## 구현 우선순위

### Phase 1: 기본 분석 (Flash 모델)
1. 트렌드 요약
2. 리뷰 키워드 분석 요약

### Phase 2: 상세 분석 (Pro 모델)
3. AI 근거 설명
4. 리뷰 추세 요약
5. 꿀조합 이유 설명

### Phase 3: 전략 분석 (Pro 모델)
6. SNS 플랫폼 종합 분석
7. 제품 비교 분석
8. 행동 강령/전략 제안
9. 맞춤형 보고서 생성

---

## API 엔드포인트 설계 제안

```javascript
// 1. 트렌드 요약
POST /api/ai/summarize-trend
Body: { trendId, country, category }

// 2. 리뷰 키워드 분석
POST /api/ai/analyze-reviews
Body: { keyword, country, reviews }

// 3. SNS 플랫폼 분석
POST /api/ai/analyze-sns-platforms
Body: { country, platforms }

// 4. 제품 비교 분석
POST /api/ai/compare-products
Body: { overseasProduct, domesticProduct }

// 5. 맞춤형 보고서 생성
POST /api/ai/generate-report
Body: { type: 'marketing' | 'npd' | 'overseas', trendId, country }
```

