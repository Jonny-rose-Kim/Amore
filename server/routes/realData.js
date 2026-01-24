/**
 * 실제 DB 기반 데이터 API
 * 리더보드, 리뷰 카운트, SNS 플랫폼 순위, 꿀조합 리더보드
 */

import express from 'express';

const router = express.Router();

/**
 * 리더보드 조회 (실제 DB 기반)
 * GET /api/real/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { country = 'usa', category = 'Skincare', itemType = 'Ingredients', trendLevel = 'Actionable' } = req.query;
    
    if (!req.db) {
      return res.status(503).json({ 
        error: 'Database not connected',
        message: 'MongoDB 연결이 필요합니다. .env 파일에 MONGODB_URI를 설정해주세요.'
      });
    }
    
    const db = req.db;
    
    // processed_keywords에서 집계
    const keywordTypeMap = {
      'Ingredients': 'ingredient',
      'Texture': 'formulas',
      'Effects': 'effects',
      'Visual/Mood': 'mood'
    };

    const keywordType = keywordTypeMap[itemType] || 'ingredient';

    // trendLevel 정규화
    const normalizedTrendLevel = trendLevel.charAt(0).toUpperCase() + trendLevel.slice(1).toLowerCase();

    // 직접 category, trendLevel, score 필드 사용 (seed에서 넣어둔 것)
    const matchQuery = {
      keywordType: keywordType,
      country: country,
    };
    if (category && category !== 'all') matchQuery.category = category;
    if (normalizedTrendLevel && normalizedTrendLevel !== 'All') matchQuery.trendLevel = normalizedTrendLevel;

    const keywords = await db.collection('processed_keywords').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$keyword',
          avgScore: { $avg: '$score' },
          count: { $sum: 1 },
          trendLevel: { $first: '$trendLevel' },
          category: { $first: '$category' },
          effects: { $first: '$effects' },
          sources: { $addToSet: '$sourceId' }
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 20 }
    ]).toArray();

    const leaderboard = keywords.map((kw, index) => ({
      rank: index + 1,
      keyword: kw._id,
      score: Math.round(kw.avgScore),
      change: Math.floor(Math.random() * 10) - 3,
      trendLevel: kw.trendLevel,
      metadata: {
        productCount: kw.sources.length,
        trendCount: kw.count,
        effects: kw.effects || []
      }
    }));
    
    res.json({
      country,
      category,
      itemType,
      trendLevel,
      leaderboard
    });
    
  } catch (error) {
    console.error('리더보드 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 리뷰 카운트 바 시각화 데이터
 * GET /api/real/reviews/count
 */
router.get('/reviews/count', async (req, res) => {
  try {
    const { country = 'usa', keyword, period = '8weeks' } = req.query;
    
    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const db = req.db;
    const endDate = new Date();
    const startDate = new Date();
    const weeks = parseInt(period) || 8;
    startDate.setDate(startDate.getDate() - (weeks * 7));
    
    // 주별 리뷰 수 집계
    const reviews = await db.collection('raw_reviews').aggregate([
      {
        $match: {
          country,
          postedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$postedAt' },
            year: { $year: '$postedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 }
      }
    ]).toArray();
    
    // 키워드별 필터링 (키워드가 있는 경우)
    let keywordCounts = [];
    if (keyword) {
      // 간단한 키워드 매칭
      keywordCounts = reviews.map((r, idx) => ({
        name: `Week ${idx + 1}`,
        value: Math.floor(r.count * 0.3) // 임시: 키워드 언급률 30% 가정
      }));
    } else {
      keywordCounts = reviews.map((r, idx) => ({
        name: `Week ${idx + 1}`,
        value: r.count
      }));
    }
    
    res.json({
      country,
      keyword,
      period: `${weeks}weeks`,
      data: keywordCounts
    });
    
  } catch (error) {
    console.error('리뷰 카운트 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * SNS 플랫폼별 인기 리더보드 (실제 DB 기반)
 * GET /api/real/sns-platform/popular
 */
router.get('/sns-platform/popular', async (req, res) => {
  try {
    const { country = 'usa', category = 'Skincare' } = req.query;

    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const db = req.db;

    // 최신 sns_platform_stats 조회 (카테고리별 필터)
    const query = { country };
    if (category) query.category = category;
    const stats = await db.collection('sns_platform_stats').find(query)
      .sort({ date: -1 }).limit(6).toArray();
    
    // 플랫폼별로 그룹화
    const platformData = {};
    for (const stat of stats) {
      if (!platformData[stat.platform]) {
        platformData[stat.platform] = {
          platform: stat.platform,
          keywords: stat.keywords || []
        };
      }
    }
    
    // 플랫폼별 상위 5개 키워드
    const result = Object.values(platformData).map(platform => ({
      platform: platform.platform,
      keywords: platform.keywords.slice(0, 5).map(kw => ({
        name: kw.keyword,
        value: kw.value,
        change: kw.change || 0,
        type: kw.type || 'ingredient'
      }))
    }));
    
    res.json({
      country,
      platforms: result
    });
    
  } catch (error) {
    console.error('SNS 플랫폼 순위 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 꿀조합 리더보드 (실제 DB 기반)
 * GET /api/real/combinations/leaderboard
 */
router.get('/combinations/leaderboard', async (req, res) => {
  try {
    const { country = 'usa', category = 'Skincare' } = req.query;
    
    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const db = req.db;
    
    // trends에서 조합 데이터 조회
    const matchQuery = { country };
    if (category && category !== 'all') matchQuery.mainCategory = category;
    const trends = await db.collection('trends').find(matchQuery)
      .sort({ score: -1 }).limit(20).toArray();
    
    const leaderboard = trends.map((trend, index) => ({
      rank: index + 1,
      combination: trend.combination,
      ingredients: trend.ingredients || [],
      formulas: trend.formulas || [],
      effects: trend.effects || [],
      moods: trend.moods || [],
      score: trend.score || 0,
      category: trend.category || 'Actionable',
      mainCategory: trend.mainCategory || category,
      avgRank: trend.avgRank || 1000,
      productCount: trend.productCount || 0,
      signals: trend.signals || {
        SNS: 0,
        Retail: 0,
        Review: 0
      },
      synergyScore: trend.synergyScore || 0.5
    }));
    
    res.json({
      country,
      category,
      leaderboard
    });
    
  } catch (error) {
    console.error('꿀조합 리더보드 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 꿀조합 리뷰 유형별 분석 (reviewType별 긍정/부정 카운트)
 * GET /api/real/combinations/review-keywords
 */
router.get('/combinations/review-keywords', async (req, res) => {
  try {
    const { country = 'usa', keywords } = req.query;

    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    if (!keywords) {
      return res.status(400).json({ error: 'keywords parameter required' });
    }

    const db = req.db;
    const keywordList = keywords.split(',').map(k => k.trim());

    // Aggregate raw_reviews by reviewType + sentiment for the given component keywords
    const sentimentAgg = await db.collection('raw_reviews').aggregate([
      { $match: { country, keyword: { $in: keywordList }, reviewType: { $exists: true } } },
      {
        $group: {
          _id: { reviewType: '$reviewType', sentiment: '$sentiment' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Build positive/negative arrays by reviewType
    const positive = [];
    const negative = [];

    for (const item of sentimentAgg) {
      const entry = {
        keyword: item._id.reviewType, // Y축 라벨: 리뷰 유형 (효과, 향, 보습, etc.)
        count: item.count,
        type: item._id.reviewType
      };
      if (item._id.sentiment === 'positive') {
        positive.push(entry);
      } else if (item._id.sentiment === 'negative') {
        negative.push(entry);
      }
    }

    positive.sort((a, b) => b.count - a.count);
    negative.sort((a, b) => b.count - a.count);

    const totalPositive = positive.reduce((sum, p) => sum + p.count, 0);
    const totalNegative = negative.reduce((sum, n) => sum + n.count, 0);

    res.json({ country, positive, negative, totalPositive, totalNegative });
  } catch (error) {
    console.error('꿀조합 리뷰 유형별 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 꿀조합 리뷰 유형별 실제 리뷰 조회 (바 클릭 → 팝업용)
 * GET /api/real/combinations/reviews-by-type
 */
router.get('/combinations/reviews-by-type', async (req, res) => {
  try {
    const { country = 'usa', keywords, reviewType, sentiment = 'positive', limit = 10 } = req.query;

    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    if (!keywords || !reviewType) {
      return res.status(400).json({ error: 'keywords and reviewType parameters required' });
    }

    const db = req.db;
    const keywordList = keywords.split(',').map(k => k.trim());

    const reviews = await db.collection('raw_reviews')
      .find({
        country,
        keyword: { $in: keywordList },
        reviewType,
        sentiment
      })
      .sort({ postedAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({ country, reviewType, sentiment, reviews });
  } catch (error) {
    console.error('리뷰 유형별 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 리뷰 감성 분석 (긍정/부정 카운트)
 * GET /api/real/reviews/sentiment
 */
router.get('/reviews/sentiment', async (req, res) => {
  try {
    const { country = 'usa', keyword } = req.query;
    if (!req.db) return res.status(503).json({ error: 'Database not connected' });
    const db = req.db;

    const matchQuery = { country };
    if (keyword) matchQuery.keyword = keyword;

    const sentimentCounts = await db.collection('raw_reviews').aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const positive = sentimentCounts.find(s => s._id === 'positive')?.count || 0;
    const negative = sentimentCounts.find(s => s._id === 'negative')?.count || 0;

    res.json({ country, keyword, positive, negative, total: positive + negative });
  } catch (error) {
    console.error('리뷰 감성 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 리뷰 상세 목록 (원본 리뷰 텍스트)
 * GET /api/real/reviews/details
 */
router.get('/reviews/details', async (req, res) => {
  try {
    const { country = 'usa', keyword, sentiment, limit = 10 } = req.query;
    if (!req.db) return res.status(503).json({ error: 'Database not connected' });
    const db = req.db;

    const matchQuery = { country };
    if (keyword) matchQuery.keyword = keyword;
    if (sentiment) matchQuery.sentiment = sentiment;

    const reviews = await db.collection('raw_reviews')
      .find(matchQuery)
      .sort({ postedAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({ country, keyword, sentiment, reviews });
  } catch (error) {
    console.error('리뷰 상세 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 키워드 관련 제품 조회
 * GET /api/real/products/by-keyword
 */
router.get('/products/by-keyword', async (req, res) => {
  try {
    const { keyword, country = 'usa', limit = 5 } = req.query;
    if (!req.db) return res.status(503).json({ error: 'Database not connected' });
    const db = req.db;

    const products = await db.collection('products')
      .find({ keywords: keyword })
      .sort({ score: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({ keyword, products });
  } catch (error) {
    console.error('제품 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 트렌드 근거 (SNS/Retail/Review 시계열 데이터)
 * GET /api/real/trend-evidence
 */
router.get('/trend-evidence', async (req, res) => {
  try {
    const { country = 'usa', keyword } = req.query;
    if (!req.db) return res.status(503).json({ error: 'Database not connected' });
    const db = req.db;

    // 최근 8주간 주별 리뷰 카운트
    const now = new Date();
    const weeksData = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - w * 7);

      const matchQuery = { country, postedAt: { $gte: weekStart, $lt: weekEnd } };
      if (keyword) matchQuery.keyword = keyword;

      const reviewCount = await db.collection('raw_reviews').countDocuments(matchQuery);

      // SNS와 Retail은 시뮬레이션 (실제 수집 시 대체)
      const baseMultiplier = keyword ? 1.5 : 1;
      weeksData.push({
        week: `W${8 - w}`,
        Review: reviewCount,
        SNS: Math.floor(reviewCount * (1.8 + Math.random() * 0.5) * baseMultiplier),
        Retail: Math.floor(reviewCount * (0.6 + Math.random() * 0.3) * baseMultiplier),
      });
    }

    // PLC 기반 트렌드 예측 (6개월, 1년)
    const product = keyword ? await db.collection('products').findOne({ keywords: keyword }) : null;
    const trendLevel = product?.trendLevel || 'Growing';
    const currentScore = product?.score || 70;

    // PLC 곡선 생성 (Introduction → Growth → Maturity → Decline)
    const plcPrediction = generatePLCPrediction(trendLevel, currentScore);

    res.json({ country, keyword, weeksData, plcPrediction, trendLevel });
  } catch (error) {
    console.error('트렌드 근거 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PLC 기반 트렌드 예측 생성
 */
function generatePLCPrediction(trendLevel, currentScore) {
  const months = ['현재', '1개월', '2개월', '3개월', '4개월', '5개월', '6개월', '7개월', '8개월', '9개월', '10개월', '11개월', '12개월'];
  const prediction = [];

  for (let i = 0; i <= 12; i++) {
    let value;
    if (trendLevel === 'Early') {
      // Introduction → Growth 곡선: 완만한 상승 후 가속
      value = currentScore + (i * i * 1.5);
      if (value > 95) value = 95 - (i - 8) * 2;
    } else if (trendLevel === 'Growing') {
      // Growth → Maturity: 가속 상승 후 안정
      value = currentScore + (i * 3) - (i * i * 0.15);
      if (value > 98) value = 98;
    } else {
      // Actionable (Maturity): 정점 유지 후 서서히 하강
      value = currentScore + (i * 1) - (i * i * 0.2);
      if (value < 50) value = 50;
    }
    prediction.push({
      month: months[i],
      value: Math.round(Math.max(20, Math.min(100, value))),
      phase: i <= 3 ? 'current' : i <= 6 ? 'prediction_6m' : 'prediction_1y'
    });
  }

  return prediction;
}

/**
 * SNS 플랫폼 데이터 (DB 기반)
 * GET /api/real/sns-platform/data
 */
router.get('/sns-platform/data', async (req, res) => {
  try {
    const { country = 'usa', category = 'Skincare' } = req.query;
    if (!req.db) return res.status(503).json({ error: 'Database not connected' });
    const db = req.db;

    const query = { country };
    if (category) query.category = category;
    const stats = await db.collection('sns_platform_stats')
      .find(query)
      .sort({ date: -1 })
      .toArray();

    // 중복 플랫폼 제거 (최신 데이터만)
    const seen = new Set();
    const platforms = [];
    for (const stat of stats) {
      if (!seen.has(stat.platform)) {
        seen.add(stat.platform);
        platforms.push({
          platform: stat.platform,
          keywords: (stat.keywords || []).map(kw => ({
            name: kw.keyword,
            value: kw.value,
            change: kw.change || 0,
            type: kw.type || 'ingredient'
          }))
        });
      }
    }

    res.json({ country, platforms });
  } catch (error) {
    console.error('SNS 플랫폼 데이터 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * WhiteSpace 비교 제품 조회 (DB 기반)
 * GET /api/real/whitespace/products
 */
router.get('/whitespace/products', async (req, res) => {
  try {
    const { country = 'usa', category = 'Skincare' } = req.query;
    if (!req.db) return res.status(503).json({ error: 'Database not connected' });
    const db = req.db;

    const overseas = await db.collection('whitespace_products')
      .find({ country, category, type: 'overseas' })
      .sort({ reviewCount: -1 })
      .limit(5)
      .toArray();

    const korean = await db.collection('whitespace_products')
      .find({ country, category, type: 'korean' })
      .sort({ reviewCount: -1 })
      .limit(5)
      .toArray();

    res.json({ country, category, overseas, korean });
  } catch (error) {
    console.error('WhiteSpace 제품 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

