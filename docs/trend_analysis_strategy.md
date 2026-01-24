# 트렌드 분석 전략: 집계 기간 및 분류 알고리즘

## 1. 집계 기간 설정 (Rolling Window)

### 📊 마케팅/경제학적 근거

#### **권장 집계 기간: 8주 (56일) Rolling Window**

**이유:**
1. **제품 라이프사이클 고려**
   - 화장품 제품의 평균 인지도 형성 기간: 6-8주
   - 소비자 구매 결정 주기: 4-6주
   - 재구매 주기: 8-12주

2. **노이즈 제거**
   - 일일 변동성: ±15-20% (이벤트, 프로모션 영향)
   - 주간 변동성: ±8-12% (주말 효과)
   - 8주 평균: ±3-5% (안정적인 트렌드 반영)

3. **시장 반응 속도**
   - SNS 트렌드: 2-4주 내 급상승 가능
   - 리테일 반영: 4-6주 소요
   - 리뷰 축적: 6-8주 필요

4. **경제학적 근거**
   - **지수 이동평균(EMA)**: 최근 데이터에 더 높은 가중치
   - **계절성 조정**: 8주 = 2개월, 계절 변화 반영
   - **신뢰구간**: 8주 데이터로 95% 신뢰구간 확보 가능

### 🔄 Rolling Window 구현 방식

```javascript
// 집계 기간 설정
const AGGREGATION_PERIODS = {
  SHORT_TERM: 14,      // 2주 - Early Trend 감지용
  MEDIUM_TERM: 28,    // 4주 - Growing Trend 확인용
  LONG_TERM: 56,      // 8주 - Actionable Trend 검증용
  STABILITY_CHECK: 84  // 12주 - 안정성 검증용
};

// 가중치 설정 (최근 데이터에 더 높은 가중치)
const WEIGHTS = {
  WEEK_8: 0.25,  // 가장 최근 주
  WEEK_7: 0.20,
  WEEK_6: 0.18,
  WEEK_5: 0.15,
  WEEK_4: 0.12,
  WEEK_3: 0.06,
  WEEK_2: 0.03,
  WEEK_1: 0.01   // 가장 오래된 주
};
```

### 📈 리더보드 안정성 확보

**문제:** 매일 집계하면 순위가 계속 변동
**해결:** 슬라이딩 윈도우 + 임계값 설정

```javascript
// 리더보드 업데이트 전략
const LEADERBOARD_UPDATE_STRATEGY = {
  UPDATE_FREQUENCY: 'daily',      // 매일 집계
  STABILITY_THRESHOLD: 0.05,      // 5% 이상 변화 시에만 순위 변경
  MIN_CHANGE_FOR_UPDATE: 2,        // 최소 2점 이상 변화
  ROLLING_WINDOW: 56,              // 8주 기준
  MIN_DATA_POINTS: 42              // 최소 6주 데이터 필요
};
```

---

## 2. 다요소 트렌드 분류 시스템

### 🎯 현재 문제점
- 단일 지표(예: 성장률)만으로 분류
- 주관적 판단 기준
- 일관성 없는 분류

### ✅ 개선: Multi-Factor Scoring System

#### **분류 요소 (7가지 핵심 지표)**

```javascript
const TREND_CLASSIFICATION_FACTORS = {
  // 1. 성장률 (Growth Rate)
  GROWTH_RATE: {
    weight: 0.25,
    thresholds: {
      EARLY: { min: 30, max: 100 },      // 30% 이상 급성장
      GROWING: { min: 10, max: 30 },      // 10-30% 성장
      ACTIONABLE: { min: 5, max: 10 }     // 5-10% 안정적 성장
    }
  },
  
  // 2. 신호 일관성 (Signal Consistency)
  SIGNAL_CONSISTENCY: {
    weight: 0.20,
    // SNS, Retail, Review 3가지 신호의 상관관계
    thresholds: {
      EARLY: { correlation: 0.3 },        // 낮은 일관성
      GROWING: { correlation: 0.6 },      // 중간 일관성
      ACTIONABLE: { correlation: 0.8 }    // 높은 일관성
    }
  },
  
  // 3. 절대 규모 (Absolute Volume)
  VOLUME: {
    weight: 0.15,
    thresholds: {
      EARLY: { sns: 1000, retail: 500, review: 200 },      // 소규모
      GROWING: { sns: 5000, retail: 2000, review: 1000 },  // 중규모
      ACTIONABLE: { sns: 10000, retail: 5000, review: 3000 } // 대규모
    }
  },
  
  // 4. 지속성 (Persistence)
  PERSISTENCE: {
    weight: 0.15,
    // 연속 상승 주수
    thresholds: {
      EARLY: { weeks: 2 },        // 2주 이상
      GROWING: { weeks: 4 },      // 4주 이상
      ACTIONABLE: { weeks: 6 }     // 6주 이상
    }
  },
  
  // 5. 시장 점유율 (Market Share)
  MARKET_SHARE: {
    weight: 0.10,
    thresholds: {
      EARLY: { min: 0, max: 5 },        // 0-5%
      GROWING: { min: 5, max: 15 },     // 5-15%
      ACTIONABLE: { min: 15, max: 100 } // 15% 이상
    }
  },
  
  // 6. 리뷰 품질 (Review Quality)
  REVIEW_QUALITY: {
    weight: 0.10,
    thresholds: {
      EARLY: { positiveRate: 0.7, avgRating: 3.5 },      // 70% 긍정, 3.5점
      GROWING: { positiveRate: 0.85, avgRating: 4.0 },  // 85% 긍정, 4.0점
      ACTIONABLE: { positiveRate: 0.9, avgRating: 4.3 } // 90% 긍정, 4.3점
    }
  },
  
  // 7. 가속도 (Acceleration)
  ACCELERATION: {
    weight: 0.05,
    // 2차 미분 (변화율의 변화율)
    thresholds: {
      EARLY: { min: 0.15 },       // 급가속
      GROWING: { min: 0.05 },     // 가속
      ACTIONABLE: { min: -0.05 }   // 감속 (안정화)
    }
  }
};
```

### 🧮 종합 점수 계산

```javascript
function calculateTrendScore(keyword, signals, metrics) {
  const scores = {
    EARLY: 0,
    GROWING: 0,
    ACTIONABLE: 0
  };
  
  // 각 요소별 점수 계산
  const growthScore = calculateGrowthScore(metrics.growthRate);
  const consistencyScore = calculateConsistencyScore(signals);
  const volumeScore = calculateVolumeScore(signals);
  const persistenceScore = calculatePersistenceScore(signals);
  const marketShareScore = calculateMarketShareScore(metrics.marketShare);
  const reviewScore = calculateReviewScore(metrics.reviewQuality);
  const accelerationScore = calculateAccelerationScore(signals);
  
  // 가중 합산
  scores.EARLY = 
    growthScore.EARLY * 0.25 +
    consistencyScore.EARLY * 0.20 +
    volumeScore.EARLY * 0.15 +
    persistenceScore.EARLY * 0.15 +
    marketShareScore.EARLY * 0.10 +
    reviewScore.EARLY * 0.10 +
    accelerationScore.EARLY * 0.05;
  
  scores.GROWING = 
    growthScore.GROWING * 0.25 +
    consistencyScore.GROWING * 0.20 +
    volumeScore.GROWING * 0.15 +
    persistenceScore.GROWING * 0.15 +
    marketShareScore.GROWING * 0.10 +
    reviewScore.GROWING * 0.10 +
    accelerationScore.GROWING * 0.05;
  
  scores.ACTIONABLE = 
    growthScore.ACTIONABLE * 0.25 +
    consistencyScore.ACTIONABLE * 0.20 +
    volumeScore.ACTIONABLE * 0.15 +
    persistenceScore.ACTIONABLE * 0.15 +
    marketShareScore.ACTIONABLE * 0.10 +
    reviewScore.ACTIONABLE * 0.10 +
    accelerationScore.ACTIONABLE * 0.05;
  
  // 최고 점수 카테고리 반환
  const maxScore = Math.max(scores.EARLY, scores.GROWING, scores.ACTIONABLE);
  
  if (maxScore === scores.ACTIONABLE && maxScore > 0.7) {
    return 'ACTIONABLE';
  } else if (maxScore === scores.GROWING && maxScore > 0.6) {
    return 'GROWING';
  } else if (maxScore === scores.EARLY && maxScore > 0.5) {
    return 'EARLY';
  } else {
    return 'COOLING';
  }
}
```

---

## 3. AI 기반 트렌드 분류

### 🤖 머신러닝 접근법

#### **Option 1: 지도학습 (Supervised Learning)**

```python
# 특성 벡터 구성
features = [
    'growth_rate',           # 성장률
    'signal_consistency',     # 신호 일관성
    'sns_volume',            # SNS 볼륨
    'retail_volume',         # 리테일 볼륨
    'review_volume',         # 리뷰 볼륨
    'persistence_weeks',     # 지속 주수
    'market_share',          # 시장 점유율
    'positive_review_rate',  # 긍정 리뷰 비율
    'avg_rating',            # 평균 평점
    'acceleration',          # 가속도
    'volatility',            # 변동성
    'trend_strength'         # 트렌드 강도
]

# 라벨 (정답)
labels = ['EARLY', 'GROWING', 'ACTIONABLE', 'COOLING']

# 모델 선택
# 1. Random Forest (해석 가능성 높음)
# 2. XGBoost (성능 우수)
# 3. Neural Network (복잡한 패턴 학습)
```

#### **Option 2: 비지도학습 (Unsupervised Learning)**

```python
# 클러스터링으로 트렌드 그룹 발견
from sklearn.cluster import KMeans, DBSCAN

# K-Means (4개 클러스터: Early, Growing, Actionable, Cooling)
kmeans = KMeans(n_clusters=4, random_state=42)
clusters = kmeans.fit_predict(features)

# DBSCAN (노이즈 제거, 밀도 기반)
dbscan = DBSCAN(eps=0.5, min_samples=5)
clusters = dbscan.fit_predict(features)
```

#### **Option 3: 딥러닝 (Deep Learning)**

```python
import tensorflow as tf
from tensorflow import keras

# LSTM (시계열 패턴 학습)
model = keras.Sequential([
    keras.layers.LSTM(64, return_sequences=True, input_shape=(8, 12)),  # 8주, 12개 특성
    keras.layers.LSTM(32),
    keras.layers.Dense(16, activation='relu'),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(4, activation='softmax')  # 4개 클래스
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
```

### 🎯 실전 추천: 하이브리드 접근

```javascript
// 1단계: 규칙 기반 필터링 (빠른 처리)
function ruleBasedClassification(data) {
  // 명확한 케이스는 규칙으로 처리
  if (data.growthRate > 50 && data.volume < 1000) {
    return 'EARLY';
  }
  if (data.growthRate > 10 && data.consistency > 0.8 && data.volume > 5000) {
    return 'ACTIONABLE';
  }
  // 애매한 케이스는 ML 모델로
  return 'UNCERTAIN';
}

// 2단계: ML 모델 (애매한 케이스)
async function mlClassification(data) {
  const features = extractFeatures(data);
  const prediction = await mlModel.predict(features);
  return prediction;
}

// 3단계: 앙상블 (최종 결정)
function ensembleClassification(data) {
  const ruleResult = ruleBasedClassification(data);
  if (ruleResult !== 'UNCERTAIN') {
    return ruleResult;
  }
  
  const mlResult = await mlClassification(data);
  const confidence = mlResult.confidence;
  
  // 신뢰도가 낮으면 보수적 분류
  if (confidence < 0.7) {
    return 'GROWING'; // 중간 단계로 분류
  }
  
  return mlResult.label;
}
```

---

## 4. 구현 예시 코드

### 📝 MongoDB 집계 쿼리

```javascript
// 8주 Rolling Window 집계
async function aggregateTrendData(keyword, country, endDate) {
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 56); // 8주 전
  
  const pipeline = [
    // 1. 기간 필터링
    {
      $match: {
        keyword: keyword,
        country: country,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    
    // 2. 주별 그룹화
    {
      $group: {
        _id: {
          week: { $week: "$date" },
          year: { $year: "$date" },
          signalType: "$signalType"
        },
        count: { $sum: 1 },
        avgValue: { $avg: "$value" },
        totalVolume: { $sum: "$volume" }
      }
    },
    
    // 3. 가중치 적용 (최근 주에 더 높은 가중치)
    {
      $addFields: {
        weightedValue: {
          $multiply: [
            "$avgValue",
            {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id.week", currentWeek] }, then: 0.25 },
                  { case: { $eq: ["$_id.week", currentWeek - 1] }, then: 0.20 },
                  { case: { $eq: ["$_id.week", currentWeek - 2] }, then: 0.18 },
                  { case: { $eq: ["$_id.week", currentWeek - 3] }, then: 0.15 },
                  { case: { $eq: ["$_id.week", currentWeek - 4] }, then: 0.12 },
                  { case: { $eq: ["$_id.week", currentWeek - 5] }, then: 0.06 },
                  { case: { $eq: ["$_id.week", currentWeek - 6] }, then: 0.03 },
                  { case: { $eq: ["$_id.week", currentWeek - 7] }, then: 0.01 }
                ],
                default: 0.01
              }
            }
          ]
        }
      }
    },
    
    // 4. 신호 타입별 집계
    {
      $group: {
        _id: "$_id.signalType",
        totalWeightedValue: { $sum: "$weightedValue" },
        totalVolume: { $sum: "$totalVolume" },
        weekCount: { $sum: 1 }
      }
    }
  ];
  
  return await db.processed_trend_signals.aggregate(pipeline);
}
```

### 🧮 트렌드 분류 함수

```javascript
async function classifyTrend(keyword, country) {
  // 1. 데이터 수집
  const signals = await aggregateTrendData(keyword, country, new Date());
  const metrics = await calculateMetrics(keyword, country);
  
  // 2. 다요소 점수 계산
  const scores = {
    growthRate: calculateGrowthScore(metrics.growthRate),
    consistency: calculateConsistencyScore(signals),
    volume: calculateVolumeScore(signals),
    persistence: calculatePersistenceScore(signals),
    marketShare: calculateMarketShareScore(metrics.marketShare),
    reviewQuality: calculateReviewScore(metrics.reviewQuality),
    acceleration: calculateAccelerationScore(signals)
  };
  
  // 3. 종합 점수 계산
  const finalScore = calculateFinalScore(scores);
  
  // 4. AI 모델 검증 (선택적)
  if (finalScore.confidence < 0.8) {
    const mlPrediction = await mlModel.predict({
      features: extractFeatures(signals, metrics),
      scores: scores
    });
    
    // 앙상블
    return ensembleDecision(finalScore, mlPrediction);
  }
  
  return finalScore.category;
}
```

---

## 5. 실무 권장사항

### ✅ 집계 기간
- **일일 집계**: Raw 데이터 수집
- **주간 집계**: 트렌드 신호 계산 (매주 월요일)
- **8주 Rolling Window**: 트렌드 분류 기준
- **리더보드 업데이트**: 매일 집계하되, 5% 이상 변화 시에만 순위 변경

### ✅ 분류 기준
- **7가지 요소 종합 점수** 사용
- **임계값 기반 규칙** + **ML 모델** 하이브리드
- **신뢰도 점수** 함께 제공 (0-1)

### ✅ 안정성 확보
- **최소 데이터 포인트**: 6주 이상
- **변화 임계값**: 5% 이상
- **롤백 메커니즘**: 급격한 변화 시 이전 상태 유지

