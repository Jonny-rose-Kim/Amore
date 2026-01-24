/**
 * 트렌드 분류 서비스
 * 다요소 점수 기반 + AI 모델 하이브리드 분류
 */

// 집계 기간 설정
const AGGREGATION_CONFIG = {
  SHORT_TERM: 14,      // 2주 - Early Trend 감지
  MEDIUM_TERM: 28,     // 4주 - Growing Trend 확인
  LONG_TERM: 56,       // 8주 - Actionable Trend 검증
  STABILITY_CHECK: 84  // 12주 - 안정성 검증
};

// 주별 가중치 (최근 데이터에 더 높은 가중치)
const WEEK_WEIGHTS = [0.25, 0.20, 0.18, 0.15, 0.12, 0.06, 0.03, 0.01];

// 트렌드 분류 임계값
const TREND_THRESHOLDS = {
  GROWTH_RATE: {
    EARLY: { min: 30, max: 100 },
    GROWING: { min: 10, max: 30 },
    ACTIONABLE: { min: 5, max: 10 }
  },
  SIGNAL_CONSISTENCY: {
    EARLY: 0.3,
    GROWING: 0.6,
    ACTIONABLE: 0.8
  },
  VOLUME: {
    EARLY: { sns: 1000, retail: 500, review: 200 },
    GROWING: { sns: 5000, retail: 2000, review: 1000 },
    ACTIONABLE: { sns: 10000, retail: 5000, review: 3000 }
  },
  PERSISTENCE: {
    EARLY: 2,      // 2주 이상
    GROWING: 4,    // 4주 이상
    ACTIONABLE: 6  // 6주 이상
  },
  MARKET_SHARE: {
    EARLY: { min: 0, max: 5 },
    GROWING: { min: 5, max: 15 },
    ACTIONABLE: { min: 15, max: 100 }
  },
  REVIEW_QUALITY: {
    EARLY: { positiveRate: 0.7, avgRating: 3.5 },
    GROWING: { positiveRate: 0.85, avgRating: 4.0 },
    ACTIONABLE: { positiveRate: 0.9, avgRating: 4.3 }
  }
};

// 요소별 가중치
const FACTOR_WEIGHTS = {
  GROWTH_RATE: 0.25,
  SIGNAL_CONSISTENCY: 0.20,
  VOLUME: 0.15,
  PERSISTENCE: 0.15,
  MARKET_SHARE: 0.10,
  REVIEW_QUALITY: 0.10,
  ACCELERATION: 0.05
};

/**
 * 성장률 점수 계산
 */
function calculateGrowthScore(growthRate) {
  const scores = { EARLY: 0, GROWING: 0, ACTIONABLE: 0 };
  
  if (growthRate >= TREND_THRESHOLDS.GROWTH_RATE.EARLY.min) {
    scores.EARLY = Math.min(1, (growthRate - 30) / 70);
  }
  if (growthRate >= TREND_THRESHOLDS.GROWTH_RATE.GROWING.min && 
      growthRate < TREND_THRESHOLDS.GROWTH_RATE.GROWING.max) {
    scores.GROWING = Math.min(1, (growthRate - 10) / 20);
  }
  if (growthRate >= TREND_THRESHOLDS.GROWTH_RATE.ACTIONABLE.min && 
      growthRate < TREND_THRESHOLDS.GROWTH_RATE.ACTIONABLE.max) {
    scores.ACTIONABLE = Math.min(1, (growthRate - 5) / 5);
  }
  
  return scores;
}

/**
 * 신호 일관성 점수 계산 (SNS, Retail, Review 상관관계)
 */
function calculateConsistencyScore(signals) {
  const scores = { EARLY: 0, GROWING: 0, ACTIONABLE: 0 };
  
  if (!signals || signals.length < 3) {
    return scores;
  }
  
  // 각 신호 타입별 최근 8주 데이터 추출
  const snsData = signals.find(s => s.type === 'SNS')?.data || [];
  const retailData = signals.find(s => s.type === 'Retail')?.data || [];
  const reviewData = signals.find(s => s.type === 'Review')?.data || [];
  
  if (snsData.length < 4 || retailData.length < 4 || reviewData.length < 4) {
    return scores;
  }
  
  // 피어슨 상관계수 계산
  const snsRetailCorr = calculateCorrelation(
    snsData.slice(-8).map(d => d.value),
    retailData.slice(-8).map(d => d.value)
  );
  const snsReviewCorr = calculateCorrelation(
    snsData.slice(-8).map(d => d.value),
    reviewData.slice(-8).map(d => d.value)
  );
  const retailReviewCorr = calculateCorrelation(
    retailData.slice(-8).map(d => d.value),
    reviewData.slice(-8).map(d => d.value)
  );
  
  const avgCorrelation = (snsRetailCorr + snsReviewCorr + retailReviewCorr) / 3;
  
  if (avgCorrelation >= TREND_THRESHOLDS.SIGNAL_CONSISTENCY.ACTIONABLE) {
    scores.ACTIONABLE = Math.min(1, (avgCorrelation - 0.8) / 0.2);
  } else if (avgCorrelation >= TREND_THRESHOLDS.SIGNAL_CONSISTENCY.GROWING) {
    scores.GROWING = Math.min(1, (avgCorrelation - 0.6) / 0.2);
  } else if (avgCorrelation >= TREND_THRESHOLDS.SIGNAL_CONSISTENCY.EARLY) {
    scores.EARLY = Math.min(1, (avgCorrelation - 0.3) / 0.3);
  }
  
  return scores;
}

/**
 * 볼륨 점수 계산
 */
function calculateVolumeScore(signals) {
  const scores = { EARLY: 0, GROWING: 0, ACTIONABLE: 0 };
  
  const snsData = signals.find(s => s.type === 'SNS');
  const retailData = signals.find(s => s.type === 'Retail');
  const reviewData = signals.find(s => s.type === 'Review');
  
  const snsVolume = snsData?.data[snsData.data.length - 1]?.value || 0;
  const retailVolume = retailData?.data[retailData.data.length - 1]?.value || 0;
  const reviewVolume = reviewData?.data[reviewData.data.length - 1]?.value || 0;
  
  // ACTIONABLE 체크
  if (snsVolume >= TREND_THRESHOLDS.VOLUME.ACTIONABLE.sns &&
      retailVolume >= TREND_THRESHOLDS.VOLUME.ACTIONABLE.retail &&
      reviewVolume >= TREND_THRESHOLDS.VOLUME.ACTIONABLE.review) {
    scores.ACTIONABLE = 1;
  }
  // GROWING 체크
  else if (snsVolume >= TREND_THRESHOLDS.VOLUME.GROWING.sns &&
           retailVolume >= TREND_THRESHOLDS.VOLUME.GROWING.retail &&
           reviewVolume >= TREND_THRESHOLDS.VOLUME.GROWING.review) {
    scores.GROWING = 1;
  }
  // EARLY 체크
  else if (snsVolume >= TREND_THRESHOLDS.VOLUME.EARLY.sns ||
           retailVolume >= TREND_THRESHOLDS.VOLUME.EARLY.retail ||
           reviewVolume >= TREND_THRESHOLDS.VOLUME.EARLY.review) {
    scores.EARLY = 1;
  }
  
  return scores;
}

/**
 * 지속성 점수 계산 (연속 상승 주수)
 */
function calculatePersistenceScore(signals) {
  const scores = { EARLY: 0, GROWING: 0, ACTIONABLE: 0 };
  
  if (!signals || signals.length === 0) {
    return scores;
  }
  
  // 모든 신호 타입의 평균 증가 주수 계산
  let totalWeeks = 0;
  let signalCount = 0;
  
  signals.forEach(signal => {
    if (signal.data && signal.data.length >= 2) {
      let consecutiveWeeks = 0;
      for (let i = signal.data.length - 1; i > 0; i--) {
        if (signal.data[i].value > signal.data[i - 1].value) {
          consecutiveWeeks++;
        } else {
          break;
        }
      }
      totalWeeks += consecutiveWeeks;
      signalCount++;
    }
  });
  
  const avgWeeks = signalCount > 0 ? totalWeeks / signalCount : 0;
  
  if (avgWeeks >= TREND_THRESHOLDS.PERSISTENCE.ACTIONABLE) {
    scores.ACTIONABLE = Math.min(1, avgWeeks / 8);
  } else if (avgWeeks >= TREND_THRESHOLDS.PERSISTENCE.GROWING) {
    scores.GROWING = Math.min(1, avgWeeks / 6);
  } else if (avgWeeks >= TREND_THRESHOLDS.PERSISTENCE.EARLY) {
    scores.EARLY = Math.min(1, avgWeeks / 4);
  }
  
  return scores;
}

/**
 * 시장 점유율 점수 계산
 */
function calculateMarketShareScore(marketShare) {
  const scores = { EARLY: 0, GROWING: 0, ACTIONABLE: 0 };
  
  if (marketShare >= TREND_THRESHOLDS.MARKET_SHARE.ACTIONABLE.min) {
    scores.ACTIONABLE = Math.min(1, marketShare / 50);
  } else if (marketShare >= TREND_THRESHOLDS.MARKET_SHARE.GROWING.min) {
    scores.GROWING = Math.min(1, (marketShare - 5) / 10);
  } else if (marketShare >= TREND_THRESHOLDS.MARKET_SHARE.EARLY.min) {
    scores.EARLY = Math.min(1, marketShare / 5);
  }
  
  return scores;
}

/**
 * 리뷰 품질 점수 계산
 */
function calculateReviewScore(reviewQuality) {
  const scores = { EARLY: 0, GROWING: 0, ACTIONABLE: 0 };
  
  const { positiveRate, avgRating } = reviewQuality || {};
  
  if (!positiveRate || !avgRating) {
    return scores;
  }
  
  // ACTIONABLE 체크
  if (positiveRate >= TREND_THRESHOLDS.REVIEW_QUALITY.ACTIONABLE.positiveRate &&
      avgRating >= TREND_THRESHOLDS.REVIEW_QUALITY.ACTIONABLE.avgRating) {
    scores.ACTIONABLE = 1;
  }
  // GROWING 체크
  else if (positiveRate >= TREND_THRESHOLDS.REVIEW_QUALITY.GROWING.positiveRate &&
           avgRating >= TREND_THRESHOLDS.REVIEW_QUALITY.GROWING.avgRating) {
    scores.GROWING = 1;
  }
  // EARLY 체크
  else if (positiveRate >= TREND_THRESHOLDS.REVIEW_QUALITY.EARLY.positiveRate &&
           avgRating >= TREND_THRESHOLDS.REVIEW_QUALITY.EARLY.avgRating) {
    scores.EARLY = 1;
  }
  
  return scores;
}

/**
 * 가속도 점수 계산 (변화율의 변화율)
 */
function calculateAccelerationScore(signals) {
  const scores = { EARLY: 0, GROWING: 0, ACTIONABLE: 0 };
  
  if (!signals || signals.length === 0) {
    return scores;
  }
  
  // 최근 4주 데이터로 가속도 계산
  const snsData = signals.find(s => s.type === 'SNS')?.data || [];
  if (snsData.length < 4) {
    return scores;
  }
  
  const recentValues = snsData.slice(-4).map(d => d.value);
  const growthRates = [];
  for (let i = 1; i < recentValues.length; i++) {
    growthRates.push((recentValues[i] - recentValues[i - 1]) / recentValues[i - 1]);
  }
  
  const acceleration = growthRates.length >= 2 
    ? growthRates[growthRates.length - 1] - growthRates[growthRates.length - 2]
    : 0;
  
  if (acceleration >= 0.15) {
    scores.EARLY = Math.min(1, acceleration / 0.3);
  } else if (acceleration >= 0.05) {
    scores.GROWING = Math.min(1, acceleration / 0.1);
  } else if (acceleration >= -0.05) {
    scores.ACTIONABLE = 1; // 안정화 = Actionable
  }
  
  return scores;
}

/**
 * 피어슨 상관계수 계산
 */
function calculateCorrelation(x, y) {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) {
    return 0;
  }
  
  return numerator / denominator;
}

/**
 * 종합 점수 계산 및 트렌드 분류
 */
export function classifyTrend(signals, metrics) {
  // 각 요소별 점수 계산
  const growthScore = calculateGrowthScore(metrics.growthRate || 0);
  const consistencyScore = calculateConsistencyScore(signals);
  const volumeScore = calculateVolumeScore(signals);
  const persistenceScore = calculatePersistenceScore(signals);
  const marketShareScore = calculateMarketShareScore(metrics.marketShare || 0);
  const reviewScore = calculateReviewScore(metrics.reviewQuality);
  const accelerationScore = calculateAccelerationScore(signals);
  
  // 가중 합산
  const finalScores = {
    EARLY: 
      growthScore.EARLY * FACTOR_WEIGHTS.GROWTH_RATE +
      consistencyScore.EARLY * FACTOR_WEIGHTS.SIGNAL_CONSISTENCY +
      volumeScore.EARLY * FACTOR_WEIGHTS.VOLUME +
      persistenceScore.EARLY * FACTOR_WEIGHTS.PERSISTENCE +
      marketShareScore.EARLY * FACTOR_WEIGHTS.MARKET_SHARE +
      reviewScore.EARLY * FACTOR_WEIGHTS.REVIEW_QUALITY +
      accelerationScore.EARLY * FACTOR_WEIGHTS.ACCELERATION,
    
    GROWING:
      growthScore.GROWING * FACTOR_WEIGHTS.GROWTH_RATE +
      consistencyScore.GROWING * FACTOR_WEIGHTS.SIGNAL_CONSISTENCY +
      volumeScore.GROWING * FACTOR_WEIGHTS.VOLUME +
      persistenceScore.GROWING * FACTOR_WEIGHTS.PERSISTENCE +
      marketShareScore.GROWING * FACTOR_WEIGHTS.MARKET_SHARE +
      reviewScore.GROWING * FACTOR_WEIGHTS.REVIEW_QUALITY +
      accelerationScore.GROWING * FACTOR_WEIGHTS.ACCELERATION,
    
    ACTIONABLE:
      growthScore.ACTIONABLE * FACTOR_WEIGHTS.GROWTH_RATE +
      consistencyScore.ACTIONABLE * FACTOR_WEIGHTS.SIGNAL_CONSISTENCY +
      volumeScore.ACTIONABLE * FACTOR_WEIGHTS.VOLUME +
      persistenceScore.ACTIONABLE * FACTOR_WEIGHTS.PERSISTENCE +
      marketShareScore.ACTIONABLE * FACTOR_WEIGHTS.MARKET_SHARE +
      reviewScore.ACTIONABLE * FACTOR_WEIGHTS.REVIEW_QUALITY +
      accelerationScore.ACTIONABLE * FACTOR_WEIGHTS.ACCELERATION
  };
  
  // 최고 점수 찾기
  const maxScore = Math.max(finalScores.EARLY, finalScores.GROWING, finalScores.ACTIONABLE);
  const maxCategory = Object.keys(finalScores).find(
    key => finalScores[key] === maxScore
  );
  
  // 신뢰도 계산
  const confidence = maxScore;
  
  // 최종 분류
  let category;
  if (maxCategory === 'ACTIONABLE' && confidence > 0.7) {
    category = '🚀 Actionable Trend';
  } else if (maxCategory === 'GROWING' && confidence > 0.6) {
    category = '📈 Growing Trend';
  } else if (maxCategory === 'EARLY' && confidence > 0.5) {
    category = '🌱 Early Trend';
  } else {
    category = '📉 Cooling';
  }
  
  return {
    category,
    confidence,
    scores: finalScores,
    breakdown: {
      growthRate: growthScore,
      consistency: consistencyScore,
      volume: volumeScore,
      persistence: persistenceScore,
      marketShare: marketShareScore,
      reviewQuality: reviewScore,
      acceleration: accelerationScore
    }
  };
}

/**
 * 8주 Rolling Window 집계
 */
export async function aggregateTrendData(db, keyword, country, endDate = new Date()) {
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - AGGREGATION_CONFIG.LONG_TERM);
  
  const pipeline = [
    {
      $match: {
        keyword: keyword,
        country: country,
        date: { $gte: startDate, $lte: endDate }
      }
    },
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
    {
      $sort: { "_id.year": 1, "_id.week": 1 }
    }
  ];
  
  const results = await db.collection('processed_trend_signals').aggregate(pipeline).toArray();
  
  // 주별 데이터를 신호 타입별로 재구성
  const signals = {
    SNS: { type: 'SNS', data: [] },
    Retail: { type: 'Retail', data: [] },
    Review: { type: 'Review', data: [] }
  };
  
  const currentWeek = getWeekNumber(endDate);
  const weekMap = new Map();
  
  results.forEach(result => {
    const weekKey = `${result._id.year}-${result._id.week}`;
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        week: result._id.week,
        year: result._id.year,
        sns: null,
        retail: null,
        review: null
      });
    }
    
    const weekData = weekMap.get(weekKey);
    const signalType = result._id.signalType;
    if (signalType === 'SNS') weekData.sns = result.avgValue;
    if (signalType === 'Retail') weekData.retail = result.avgValue;
    if (signalType === 'Review') weekData.review = result.avgValue;
  });
  
  // 최근 8주 데이터만 추출 및 가중치 적용
  const weeks = Array.from(weekMap.values())
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.week - b.week;
    })
    .slice(-8);
  
  weeks.forEach((week, index) => {
    const weight = WEEK_WEIGHTS[index] || 0.01;
    signals.SNS.data.push({
      name: `Week ${index + 1}`,
      value: (week.sns || 0) * weight,
      date: new Date(week.year, 0, 1 + (week.week - 1) * 7)
    });
    signals.Retail.data.push({
      name: `Week ${index + 1}`,
      value: (week.retail || 0) * weight,
      date: new Date(week.year, 0, 1 + (week.week - 1) * 7)
    });
    signals.Review.data.push({
      name: `Week ${index + 1}`,
      value: (week.review || 0) * weight,
      date: new Date(week.year, 0, 1 + (week.week - 1) * 7)
    });
  });
  
  return Object.values(signals).filter(s => s.data.length > 0);
}

/**
 * 주 번호 계산
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

