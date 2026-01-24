# LangChain + LangGraph 기반 Multi-Agent 워크플로우

## 🎯 목표

1. **제품 설명 분석**: 성분, 제형, 효과, Mood 키워드 추출
2. **효과 추출**: 각 키워드별 관련 효과 추출
3. **조합 분석**: 가장 잘 팔리는 조합 (성분 + 제형 + 효과) 분석
4. **리더보드 재구성**: DB 기반 리더보드 생성
5. **SNS 플랫폼별 키워드 순위**: 플랫폼별 키워드 순위 바 출력
6. **시각화 데이터 저장**: LLM 출력을 DB에 저장 → 집계 → 시각화

---

## 🔄 전체 워크플로우

```
Raw 데이터 (제품 설명, 리뷰, SNS)
    ↓
[Agent 1] 키워드 추출 Agent
    ├─→ 성분 추출
    ├─→ 제형 추출
    ├─→ 효과 추출
    └─→ Mood 추출
    ↓
[Agent 2] 효과 매핑 Agent
    └─→ 각 키워드별 관련 효과 추출
    ↓
[Agent 3] 조합 분석 Agent
    └─→ 성분 + 제형 + 효과 조합 분석
    ↓
[Agent 4] 트렌드 집계 Agent
    └─→ 조합별 판매 랭킹 집계
    ↓
[Agent 5] SNS 플랫폼 분석 Agent
    └─→ 플랫폼별 키워드 순위 분석
    ↓
DB 저장 (processed_keywords, trends, sns_platform_stats)
    ↓
시각화 (리더보드, 트렌드 차트, SNS 순위 바)
```

---

## 📦 LangChain + LangGraph 구조

### Node 정의

```python
# 각 Node는 특정 Agent 역할
nodes = {
    "extract_keywords": KeywordExtractorAgent,
    "map_effects": EffectMapperAgent,
    "analyze_combinations": CombinationAnalyzerAgent,
    "aggregate_trends": TrendAggregatorAgent,
    "analyze_sns_platforms": SNSPlatformAnalyzerAgent
}
```

### Edge 정의

```python
# 데이터 흐름 정의
edges = [
    ("extract_keywords", "map_effects"),
    ("map_effects", "analyze_combinations"),
    ("analyze_combinations", "aggregate_trends"),
    ("aggregate_trends", "analyze_sns_platforms")
]
```

---

## 🤖 Agent 상세 설계

### Agent 1: 키워드 추출 Agent

**입력**: 제품 설명 텍스트
**출력**: 
```json
{
  "ingredients": ["레티놀", "히알루론산"],
  "formulas": ["앰플", "세럼"],
  "effects": ["모공 케어", "장벽 강화"],
  "mood": ["미니어처", "매트 텍스처"]
}
```

### Agent 2: 효과 매핑 Agent

**입력**: 키워드 리스트 (성분/제형/효과/Mood)
**출력**: 각 키워드별 관련 효과
```json
{
  "레티놀": {
    "effects": ["모공 케어", "각질 제거", "안티에이징"],
    "frequency": 45
  },
  "앰플": {
    "effects": ["고농축 전달", "빠른 흡수"],
    "frequency": 32
  }
}
```

### Agent 3: 조합 분석 Agent

**입력**: 
- 제품별 키워드 (성분 + 제형 + 효과)
- 제품 랭킹 데이터
**출력**: 조합별 판매 성과
```json
{
  "combination": "레티놀 + 앰플 + 모공 케어",
  "avgRank": 12.5,
  "productCount": 15,
  "totalSales": 125000,
  "synergyScore": 0.92
}
```

### Agent 4: 트렌드 집계 Agent

**입력**: 조합 분석 결과
**출력**: 트렌드 점수 및 분류
```json
{
  "combination": "레티놀 + 앰플 + 모공 케어",
  "score": 98,
  "category": "Actionable",
  "signals": {
    "SNS": 95,
    "Retail": 86,
    "Review": 90
  }
}
```

### Agent 5: SNS 플랫폼 분석 Agent

**입력**: SNS 게시물 데이터
**출력**: 플랫폼별 키워드 순위
```json
{
  "platform": "Instagram",
  "keywords": [
    {"keyword": "레티놀", "value": 95, "change": 12},
    {"keyword": "앰플", "value": 88, "change": 8}
  ]
}
```

---

## 💾 DB 저장 구조

### processed_keywords 컬렉션

```javascript
{
  _id: ObjectId,
  keyword: "레티놀",
  keywordType: "ingredient", // ingredient, formula, effect, mood
  sourceType: "product_description", // product_description, review, sns
  sourceId: ObjectId, // 제품 ID 또는 리뷰 ID
  effects: ["모공 케어", "각질 제거"], // Agent 2 출력
  extractedAt: Date,
  processedAt: Date
}
```

### trends 컬렉션

```javascript
{
  _id: ObjectId,
  combination: "레티놀 + 앰플 + 모공 케어",
  ingredients: ["레티놀"],
  formulas: ["앰플"],
  effects: ["모공 케어"],
  avgRank: 12.5, // Agent 3 출력
  productCount: 15,
  totalSales: 125000,
  synergyScore: 0.92,
  score: 98, // Agent 4 출력
  category: "Actionable", // Early, Growing, Actionable
  signals: {
    SNS: 95,
    Retail: 86,
    Review: 90
  },
  calculatedAt: Date
}
```

### sns_platform_stats 컬렉션

```javascript
{
  _id: ObjectId,
  platform: "Instagram", // Instagram, TikTok, YouTube, Amazon, Shopee, Cosme
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
  calculatedAt: Date // Agent 5 출력
}
```

---

## 🔧 구현 예시

### LangGraph 워크플로우 정의

```python
from langchain.graph import StateGraph
from langchain.schema import BaseMessage
from typing import TypedDict, List
import json

# State 정의
class WorkflowState(TypedDict):
    product_descriptions: List[str]
    product_ids: List[str]
    extracted_keywords: dict
    mapped_effects: dict
    combinations: dict
    trends: dict
    sns_stats: dict

# Agent 1: 키워드 추출
def extract_keywords_node(state: WorkflowState) -> WorkflowState:
    # LLM 호출하여 키워드 추출
    keywords = {}
    for desc in state["product_descriptions"]:
        result = llm_agent1.extract(desc)
        keywords[state["product_ids"][state["product_descriptions"].index(desc)]] = result
    
    state["extracted_keywords"] = keywords
    return state

# Agent 2: 효과 매핑
def map_effects_node(state: WorkflowState) -> WorkflowState:
    # 각 키워드별 효과 추출
    effects = {}
    for product_id, keywords in state["extracted_keywords"].items():
        all_keywords = (
            keywords.get("ingredients", []) +
            keywords.get("formulas", []) +
            keywords.get("effects", []) +
            keywords.get("mood", [])
        )
        effects[product_id] = llm_agent2.map_effects(all_keywords)
    
    state["mapped_effects"] = effects
    return state

# Agent 3: 조합 분석
def analyze_combinations_node(state: WorkflowState) -> WorkflowState:
    # 조합별 판매 성과 분석
    combinations = llm_agent3.analyze(
        state["extracted_keywords"],
        state["mapped_effects"],
        db.get_ranking_data()
    )
    
    state["combinations"] = combinations
    return state

# Agent 4: 트렌드 집계
def aggregate_trends_node(state: WorkflowState) -> WorkflowState:
    # 트렌드 점수 계산 및 분류
    trends = llm_agent4.aggregate(
        state["combinations"],
        db.get_signal_data()
    )
    
    state["trends"] = trends
    return state

# Agent 5: SNS 플랫폼 분석
def analyze_sns_platforms_node(state: WorkflowState) -> WorkflowState:
    # 플랫폼별 키워드 순위 분석
    sns_stats = llm_agent5.analyze(
        db.get_sns_data(),
        state["extracted_keywords"]
    )
    
    state["sns_stats"] = sns_stats
    return state

# 워크플로우 구성
workflow = StateGraph(WorkflowState)
workflow.add_node("extract_keywords", extract_keywords_node)
workflow.add_node("map_effects", map_effects_node)
workflow.add_node("analyze_combinations", analyze_combinations_node)
workflow.add_node("aggregate_trends", aggregate_trends_node)
workflow.add_node("analyze_sns_platforms", analyze_sns_platforms_node)

# Edge 정의
workflow.set_entry_point("extract_keywords")
workflow.add_edge("extract_keywords", "map_effects")
workflow.add_edge("map_effects", "analyze_combinations")
workflow.add_edge("analyze_combinations", "aggregate_trends")
workflow.add_edge("aggregate_trends", "analyze_sns_platforms")

# 컴파일
app = workflow.compile()
```

---

## 📊 실행 및 DB 저장

```python
# 워크플로우 실행
initial_state = {
    "product_descriptions": product_descriptions,
    "product_ids": product_ids,
    "extracted_keywords": {},
    "mapped_effects": {},
    "combinations": {},
    "trends": {},
    "sns_stats": {}
}

final_state = app.invoke(initial_state)

# DB 저장
save_to_db(final_state)
```

---

## 🎨 시각화 데이터 생성

```python
def save_to_db(state: WorkflowState):
    # 1. processed_keywords 저장
    for product_id, keywords in state["extracted_keywords"].items():
        for keyword_type, keyword_list in keywords.items():
            for keyword in keyword_list:
                effects = state["mapped_effects"].get(product_id, {}).get(keyword, [])
                db.processed_keywords.insert_one({
                    "keyword": keyword,
                    "keywordType": keyword_type,
                    "sourceType": "product_description",
                    "sourceId": product_id,
                    "effects": effects,
                    "extractedAt": datetime.now()
                })
    
    # 2. trends 저장
    for combination, data in state["trends"].items():
        db.trends.insert_one({
            "combination": combination,
            "ingredients": data["ingredients"],
            "formulas": data["formulas"],
            "effects": data["effects"],
            "avgRank": data["avgRank"],
            "productCount": data["productCount"],
            "score": data["score"],
            "category": data["category"],
            "signals": data["signals"],
            "calculatedAt": datetime.now()
        })
    
    # 3. sns_platform_stats 저장
    for platform, stats in state["sns_stats"].items():
        db.sns_platform_stats.insert_one({
            "platform": platform,
            "country": "usa",
            "keywords": stats["keywords"],
            "date": datetime.now(),
            "calculatedAt": datetime.now()
        })
```

---

## 🔄 주기적 실행 (8주 데이터 기준)

```python
# 매주 월요일 실행
def weekly_workflow():
    # 최근 8주 데이터 조회
    end_date = datetime.now()
    start_date = end_date - timedelta(weeks=8)
    
    # 제품 데이터 조회
    products = db.raw_retail_sales.find({
        "date": {"$gte": start_date, "$lte": end_date}
    })
    
    product_descriptions = [p["description"] for p in products]
    product_ids = [p["productId"] for p in products]
    
    # 워크플로우 실행
    initial_state = {
        "product_descriptions": product_descriptions,
        "product_ids": product_ids,
        "extracted_keywords": {},
        "mapped_effects": {},
        "combinations": {},
        "trends": {},
        "sns_stats": {}
    }
    
    final_state = app.invoke(initial_state)
    save_to_db(final_state)
    
    # 리더보드 재생성
    regenerate_leaderboard()
```

---

## 📈 리더보드 재구성

```python
def regenerate_leaderboard():
    # DB에서 집계된 데이터로 리더보드 생성
    trends = db.trends.find().sort("score", -1).limit(100)
    
    leaderboard = {
        "ingredients": [],
        "formulas": [],
        "effects": [],
        "mood": []
    }
    
    for trend in trends:
        # 성분 리더보드
        for ingredient in trend["ingredients"]:
            leaderboard["ingredients"].append({
                "keyword": ingredient,
                "score": calculate_ingredient_score(ingredient, trends)
            })
        
        # 제형 리더보드
        for formula in trend["formulas"]:
            leaderboard["formulas"].append({
                "keyword": formula,
                "score": calculate_formula_score(formula, trends)
            })
        
        # 효과 리더보드
        for effect in trend["effects"]:
            leaderboard["effects"].append({
                "keyword": effect,
                "score": calculate_effect_score(effect, trends)
            })
    
    # 점수 순으로 정렬
    for category in leaderboard:
        leaderboard[category].sort(key=lambda x: x["score"], reverse=True)
        leaderboard[category] = [
            {**item, "rank": idx + 1}
            for idx, item in enumerate(leaderboard[category][:20])
        ]
    
    # DB 저장
    db.leaderboard.replace_one(
        {"country": "usa", "period": "8weeks"},
        {
            "country": "usa",
            "period": "8weeks",
            "data": leaderboard,
            "updatedAt": datetime.now()
        },
        upsert=True
    )
```

---

## 🎯 SNS 플랫폼별 키워드 순위

```python
def get_sns_platform_rankings(country="usa"):
    # DB에서 플랫폼별 통계 조회
    platforms = ["Instagram", "TikTok", "YouTube", "Amazon", "Shopee", "Cosme"]
    
    rankings = {}
    for platform in platforms:
        stats = db.sns_platform_stats.find_one({
            "platform": platform,
            "country": country
        }, sort=[("date", -1)])
        
        if stats:
            rankings[platform] = stats["keywords"][:10]  # 상위 10개
    
    return rankings
```

---

## 💡 최적화 전략

1. **병렬 처리**: 각 제품별 키워드 추출을 병렬로 처리
2. **캐싱**: 이미 처리된 제품은 캐시 사용
3. **배치 처리**: 여러 제품을 한 번에 처리
4. **증분 업데이트**: 변경된 데이터만 재처리

