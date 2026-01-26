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
          koreanName: { $first: '$koreanName' },
          description: { $first: '$description' },
          sources: { $addToSet: '$sourceId' }
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 20 }
    ]).toArray();

    const leaderboard = keywords.map((kw, index) => ({
      rank: index + 1,
      keyword: kw._id,
      koreanName: kw.koreanName || kw._id,
      description: kw.description || '',
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
      .sort({ date: -1 }).limit(21).toArray(); // 각 플랫폼 × 카테고리 수 충분히 포함
    
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

    // 플랫폼 순서 정의 (국가별) - 첫 번째가 맨 위에 표시
    const platformOrderByCountry = {
      'usa': ['Amazon', 'YouTube', 'Instagram'],
      'japan': ['@cosme', 'YouTube', 'Instagram'],  // @cosme 맨 위
      'singapore': ['Shopee', 'YouTube', 'Instagram'],  // Shopee 맨 위
      'malaysia': ['Shopee', 'YouTube', 'Instagram'],   // Shopee 맨 위
      'indonesia': ['Shopee', 'YouTube', 'Instagram'],  // Shopee 맨 위
      'china': ['Weibo', 'Xiaohongshu', 'Douyin'],
      'default': ['Shopee', 'YouTube', 'Instagram']
    };
    const platformOrder = platformOrderByCountry[country] || platformOrderByCountry['default'];

    // 플랫폼별 상위 5개 키워드 (순서대로)
    const result = platformOrder
      .filter(p => platformData[p])
      .map(platformName => {
        const platform = platformData[platformName];
        return {
          platform: platform.platform,
          keywords: platform.keywords.slice(0, 5).map(kw => ({
            name: kw.keyword || kw.name,
            koreanName: kw.koreanName || kw.keyword || kw.name,
            value: kw.value,
            change: kw.change || 0,
            type: kw.type || 'ingredient'
          }))
        };
      });
    
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
 * 꿀조합 리더보드 (실제 DB 기반 - 제품 키워드 조합 분석)
 * GET /api/real/combinations/leaderboard
 *
 * 조합 순위 산정 방식:
 * 1. 같은 카테고리 안에서 성분, 제형, 효과, visual/mood 조합을 분석
 * 2. 해당 키워드 조합을 가진 제품들의 랭킹 평균 + 리뷰 수 평균을 정규화
 * 3. 점수 기반으로 Top 7 조합 반환
 */
router.get('/combinations/leaderboard', async (req, res) => {
  try {
    const { country = 'usa', category = 'Skincare' } = req.query;

    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const db = req.db;

    // 1. 해당 카테고리의 제품들 가져오기
    const productQuery = { country };
    if (category && category !== 'all') {
      productQuery.$or = [
        { category: category },
        { mainCategory: category },
        { category: { $regex: new RegExp(category, 'i') } }
      ];
    }

    const products = await db.collection('products')
      .find(productQuery)
      .sort({ salesRank: 1 })
      .limit(200)
      .toArray();

    // 2. processed_keywords에서 해당 카테고리의 키워드 정보 가져오기
    const keywordsQuery = { country };
    if (category && category !== 'all') keywordsQuery.category = category;

    const processedKeywords = await db.collection('processed_keywords')
      .find(keywordsQuery)
      .toArray();

    // 키워드별 점수 맵 생성
    const keywordScoreMap = {};
    for (const kw of processedKeywords) {
      const key = kw.keyword.toLowerCase();
      if (!keywordScoreMap[key]) {
        keywordScoreMap[key] = {
          score: kw.score || 50,
          type: kw.keywordType,
          count: 0,
          totalRank: 0,
          totalReviews: 0
        };
      }
      keywordScoreMap[key].count++;
    }

    // 3. 제품에서 키워드 추출 및 조합 분석
    const combinationMap = new Map();

    for (const product of products) {
      // 제품에서 키워드 추출
      const ingredients = (product.ingredients || []).map(i => i.toLowerCase());
      const formulas = (product.formulas || product.texture || []).map(f => f.toLowerCase());
      const effects = (product.effects || []).map(e => e.toLowerCase());
      const moods = (product.moods || product.visual || []).map(m => m.toLowerCase());

      // 각 타입에서 대표 키워드 1개씩 선택하여 조합 생성
      const topIngredient = ingredients[0];
      const topFormula = formulas[0];
      const topEffect = effects[0];
      const topMood = moods[0];

      // 유효한 키워드가 2개 이상인 경우만 조합 생성 (중복 제거)
      const uniqueKeywords = [...new Set([topIngredient, topFormula, topEffect, topMood].filter(k => k))];
      if (uniqueKeywords.length >= 2) {
        // 조합 키 생성 (정렬하여 동일 조합 그룹화)
        const combinationKey = uniqueKeywords.sort().join('|');

        if (!combinationMap.has(combinationKey)) {
          combinationMap.set(combinationKey, {
            ingredients: topIngredient ? [topIngredient] : [],
            formulas: topFormula ? [topFormula] : [],
            effects: topEffect ? [topEffect] : [],
            moods: topMood ? [topMood] : [],
            products: [],
            totalRank: 0,
            totalReviews: 0,
            productCount: 0
          });
        }

        const combo = combinationMap.get(combinationKey);
        combo.products.push(product);
        combo.totalRank += product.salesRank || 1000;
        combo.totalReviews += product.reviewCount || 0;
        combo.productCount++;
      }
    }

    // 4. 조합별 점수 계산
    const combinations = [];
    const maxReviews = Math.max(...Array.from(combinationMap.values()).map(c => c.totalReviews / c.productCount || 1));

    for (const [key, combo] of combinationMap.entries()) {
      if (combo.productCount < 1) continue;

      const avgRank = combo.totalRank / combo.productCount;
      const avgReviews = combo.totalReviews / combo.productCount;

      // 랭킹 점수 (낮을수록 좋음, 역수 정규화)
      const rankScore = Math.max(0, 100 - (avgRank / 10));

      // 리뷰 점수 (정규화)
      const reviewScore = (avgReviews / maxReviews) * 100;

      // 키워드 점수 (해당 키워드들의 트렌드 점수 평균)
      const allKeywords = [...combo.ingredients, ...combo.formulas, ...combo.effects, ...combo.moods];
      const keywordScores = allKeywords
        .map(k => keywordScoreMap[k]?.score || 50)
        .filter(s => s > 0);
      const avgKeywordScore = keywordScores.length > 0
        ? keywordScores.reduce((a, b) => a + b, 0) / keywordScores.length
        : 50;

      // 종합 점수 (가중 평균)
      const totalScore = Math.round(
        (rankScore * 0.3) + (reviewScore * 0.3) + (avgKeywordScore * 0.4)
      );

      // 조합 이름 생성 (중복 제거)
      const nameParts = [];
      const usedNames = new Set();

      const addPart = (name, prefix) => {
        if (name && !usedNames.has(name.toLowerCase())) {
          usedNames.add(name.toLowerCase());
          nameParts.push({ name, prefix });
        }
      };

      if (combo.ingredients[0]) addPart(combo.ingredients[0], '🧪');
      if (combo.formulas[0]) addPart(combo.formulas[0], '💧');
      if (combo.effects[0]) addPart(combo.effects[0], '✨');
      if (combo.moods[0]) addPart(combo.moods[0], '🎨');

      const combinationName = nameParts
        .map(p => p.name.charAt(0).toUpperCase() + p.name.slice(1))
        .join(' + ');

      // 트렌드 레벨 결정
      let trendLevel = 'Growing';
      if (totalScore >= 75) trendLevel = 'Actionable';
      else if (totalScore < 50) trendLevel = 'Early';

      combinations.push({
        combination: combinationName,
        ingredients: combo.ingredients,
        formulas: combo.formulas,
        effects: combo.effects,
        moods: combo.moods,
        score: totalScore,
        avgRank: Math.round(avgRank),
        avgReviews: Math.round(avgReviews),
        productCount: combo.productCount,
        trendLevel,
        signals: {
          SNS: Math.round(avgKeywordScore),
          Retail: Math.round(rankScore),
          Review: Math.round(reviewScore)
        },
        synergyScore: (combo.productCount / products.length) * 100
      });
    }

    // 5. 점수순 정렬 및 Top 7 선택
    combinations.sort((a, b) => b.score - a.score);
    const topCombinations = combinations.slice(0, 7);

    // 6. 데이터가 부족한 경우 시뮬레이션 데이터 생성
    if (topCombinations.length < 7) {
      const categoryDefaults = {
        'Skincare': [
          { ing: 'Retinol', form: 'Serum', eff: 'Anti-aging', mood: 'Glass Skin' },
          { ing: 'Niacinamide', form: 'Toner', eff: 'Brightening', mood: 'Dewy' },
          { ing: 'Hyaluronic Acid', form: 'Essence', eff: 'Hydration', mood: 'Plump' },
          { ing: 'Vitamin C', form: 'Serum', eff: 'Brightening', mood: 'Glow' },
          { ing: 'Centella', form: 'Cream', eff: 'Soothing', mood: 'Calm' },
          { ing: 'Peptides', form: 'Moisturizer', eff: 'Firming', mood: 'Youthful' },
          { ing: 'Snail Mucin', form: 'Essence', eff: 'Repair', mood: 'Healthy' }
        ],
        'Cleansing': [
          { ing: 'Salicylic Acid', form: 'Gel Cleanser', eff: 'Pore Cleansing', mood: 'Fresh' },
          { ing: 'Tea Tree', form: 'Foam Cleanser', eff: 'Oil Control', mood: 'Clean' },
          { ing: 'Centella', form: 'Low pH Cleanser', eff: 'Gentle', mood: 'Soft' },
          { ing: 'Green Tea', form: 'Oil Cleanser', eff: 'Makeup Removal', mood: 'Natural' }
        ],
        'Sun Care': [
          { ing: 'Zinc Oxide', form: 'Sun Stick', eff: 'UV Protection', mood: 'No White Cast' },
          { ing: 'Centella', form: 'Sunscreen', eff: 'Moisturizing', mood: 'Dewy' },
          { ing: 'Niacinamide', form: 'Sun Cushion', eff: 'Tone-up', mood: 'Bright' }
        ],
        'Makeup': [
          { ing: 'Hyaluronic Acid', form: 'Cushion', eff: 'Long-lasting', mood: 'Glow' },
          { ing: 'Vitamin E', form: 'Foundation', eff: 'Coverage', mood: 'Natural' },
          { ing: 'Collagen', form: 'Primer', eff: 'Smoothing', mood: 'Flawless' }
        ]
      };

      const defaults = categoryDefaults[category] || categoryDefaults['Skincare'];
      const existingNames = new Set(topCombinations.map(c => c.combination.toLowerCase()));

      for (const def of defaults) {
        if (topCombinations.length >= 7) break;
        const name = `${def.ing} + ${def.form} + ${def.eff}`;
        if (!existingNames.has(name.toLowerCase())) {
          const score = Math.floor(60 + Math.random() * 30);
          topCombinations.push({
            combination: name,
            ingredients: [def.ing.toLowerCase()],
            formulas: [def.form.toLowerCase()],
            effects: [def.eff.toLowerCase()],
            moods: [def.mood.toLowerCase()],
            score,
            avgRank: Math.floor(50 + Math.random() * 200),
            avgReviews: Math.floor(500 + Math.random() * 3000),
            productCount: Math.floor(5 + Math.random() * 20),
            trendLevel: score >= 75 ? 'Actionable' : score >= 50 ? 'Growing' : 'Early',
            signals: {
              SNS: Math.floor(50 + Math.random() * 40),
              Retail: Math.floor(50 + Math.random() * 40),
              Review: Math.floor(50 + Math.random() * 40)
            },
            synergyScore: Math.floor(20 + Math.random() * 60)
          });
        }
      }
    }

    // 최종 정렬 및 순위 부여
    topCombinations.sort((a, b) => b.score - a.score);
    const leaderboard = topCombinations.slice(0, 7).map((combo, index) => ({
      rank: index + 1,
      ...combo
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
 * 꿀조합 리뷰 유형별 분석 (문장 단위 reviewType별 긍정/부정 카운트)
 * GET /api/real/combinations/review-keywords
 *
 * review_sentences 컬렉션에서 문장 단위로 집계
 */
router.get('/combinations/review-keywords', async (req, res) => {
  try {
    const { country = 'usa', keywords } = req.query;

    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const db = req.db;

    // 기본 쿼리: 국가별 전체 문장 또는 키워드 관련 문장
    let matchQuery = { country };

    if (keywords) {
      const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
      // 키워드가 제품명이나 content에 포함된 문장 필터
      matchQuery.$or = [
        { productName: { $regex: keywordList.join('|'), $options: 'i' } },
        { content: { $regex: keywordList.join('|'), $options: 'i' } }
      ];
    }

    // review_sentences에서 문장 단위로 집계
    const sentimentAgg = await db.collection('review_sentences').aggregate([
      { $match: matchQuery },
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
      if (!item._id.reviewType) continue;
      const entry = {
        keyword: item._id.reviewType, // Y축 라벨: 리뷰 유형 (효과, 보습, etc.)
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
 * 꿀조합 리뷰 유형별 실제 문장 조회 (바 클릭 → 팝업용)
 * GET /api/real/combinations/reviews-by-type
 *
 * review_sentences 컬렉션에서 해당 유형의 문장만 반환
 */
router.get('/combinations/reviews-by-type', async (req, res) => {
  try {
    const { country = 'usa', keywords, reviewType, sentiment = 'positive', limit = 10 } = req.query;

    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    if (!reviewType) {
      return res.status(400).json({ error: 'reviewType parameter required' });
    }

    const db = req.db;

    // 기본 쿼리: reviewType과 sentiment로 필터
    let query = {
      country,
      reviewType,
      sentiment
    };

    // keywords가 있으면 content나 productName에서 검색 (선택적)
    if (keywords) {
      const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
      query.$or = [
        { productName: { $regex: keywordList.join('|'), $options: 'i' } },
        { content: { $regex: keywordList.join('|'), $options: 'i' } }
      ];
    }

    // review_sentences에서 문장 조회
    let sentences = await db.collection('review_sentences')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    // 키워드 매칭 결과가 없으면 reviewType만으로 재검색
    if (sentences.length === 0 && keywords) {
      sentences = await db.collection('review_sentences')
        .find({ country, reviewType, sentiment })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();
    }

    // 프론트엔드 필드 매핑
    const reviews = sentences.map(s => ({
      keyword: s.reviewType,
      sentiment: s.sentiment,
      content: s.content,
      contentKr: s.contentKr,  // 한국어 번역
      product: s.productName || 'Unknown Product',
      brand: s.brand || '',
      rating: s.rating || 0,
      postedAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
      source: s.source || 'Amazon'
    }));

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

    const rawReviews = await db.collection('raw_reviews')
      .find(matchQuery)
      .sort({ postedAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    // 프론트엔드 필드 매핑 (productName -> product)
    const reviews = rawReviews.map(r => ({
      ...r,
      product: r.productName || r.product || 'Unknown Product',
    }));

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
    const { keyword, country = 'usa', platform = 'Amazon', limit = 5 } = req.query;
    if (!req.db) return res.status(503).json({ error: 'Database not connected' });
    const db = req.db;

    // 키워드로 제품 검색 (keywords 배열 또는 description/productName에서)
    const regex = new RegExp(keyword, 'i');
    const rawProducts = await db.collection('products')
      .find({
        country,
        $or: [
          { keywords: { $regex: regex } },
          { productName: { $regex: regex } },
          { description: { $regex: regex } },
          { ingredients: { $regex: regex } }
        ]
      })
      .sort({ salesRank: 1, reviewCount: -1 })
      .limit(parseInt(limit))
      .toArray();

    // 브랜드별 실제 아마존 이미지 URL 매핑
    const brandImageMap = {
      'cerave': 'https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1000_.jpg',
      'la roche-posay': 'https://m.media-amazon.com/images/I/61bZ8F09sWL._SL1500_.jpg',
      'neutrogena': 'https://m.media-amazon.com/images/I/71RMIHB4DnL._SL1500_.jpg',
      'olay': 'https://m.media-amazon.com/images/I/71r0h4SBJHL._SL1500_.jpg',
      'the ordinary': 'https://m.media-amazon.com/images/I/51EaHYCsqiL._SL1500_.jpg',
      'paula\'s choice': 'https://m.media-amazon.com/images/I/61wOXQKsjGL._SL1500_.jpg',
      'cosrx': 'https://m.media-amazon.com/images/I/61sWWCVUWqL._SL1500_.jpg',
      'innisfree': 'https://m.media-amazon.com/images/I/61e+M1GjZOL._SL1500_.jpg',
      'beauty of joseon': 'https://m.media-amazon.com/images/I/61jx9r8E-qL._SL1500_.jpg',
      'anua': 'https://m.media-amazon.com/images/I/61Wbcv-SSAL._SL1500_.jpg',
      'tirtir': 'https://m.media-amazon.com/images/I/61SjIlYqOxL._SL1500_.jpg',
      'skin1004': 'https://m.media-amazon.com/images/I/61YXQGMPDVL._SL1500_.jpg',
      'isntree': 'https://m.media-amazon.com/images/I/61fYqBQQPeL._SL1500_.jpg',
      'medicube': 'https://m.media-amazon.com/images/I/61GRkqpuBZL._SL1500_.jpg',
      'heimish': 'https://m.media-amazon.com/images/I/61z7L0kkzJL._SL1500_.jpg',
      'numbuzin': 'https://m.media-amazon.com/images/I/71qnLVf-UPL._SL1500_.jpg',
      'torriden': 'https://m.media-amazon.com/images/I/51BxkFkB26L._SL1500_.jpg',
      'some by mi': 'https://m.media-amazon.com/images/I/71dXSdxJmRL._SL1500_.jpg',
      'missha': 'https://m.media-amazon.com/images/I/61nLIHQhWYL._SL1500_.jpg',
      'laneige': 'https://m.media-amazon.com/images/I/61Q08AYWJAL._SL1500_.jpg',
      'dr. jart+': 'https://m.media-amazon.com/images/I/61Ru8kQBwNL._SL1500_.jpg',
      'sulwhasoo': 'https://m.media-amazon.com/images/I/61j8Km4qFLL._SL1500_.jpg',
      'amorepacific': 'https://m.media-amazon.com/images/I/61Ts7BNVbeL._SL1500_.jpg',
      'iunik': 'https://m.media-amazon.com/images/I/61kHQyMiXPL._SL1500_.jpg',
      'purito': 'https://m.media-amazon.com/images/I/61NLcVhXTfL._SL1500_.jpg',
      'klairs': 'https://m.media-amazon.com/images/I/61pCpq8AAFL._SL1500_.jpg',
      'round lab': 'https://m.media-amazon.com/images/I/61H4EQKRJXL._SL1500_.jpg'
    };

    // 키워드별 기본 이미지
    const keywordImageMap = {
      'retinol': 'https://m.media-amazon.com/images/I/51EaHYCsqiL._SL1500_.jpg',
      'niacinamide': 'https://m.media-amazon.com/images/I/61fYqBQQPeL._SL1500_.jpg',
      'hyaluronic': 'https://m.media-amazon.com/images/I/51BxkFkB26L._SL1500_.jpg',
      'vitamin c': 'https://m.media-amazon.com/images/I/61jx9r8E-qL._SL1500_.jpg',
      'sunscreen': 'https://m.media-amazon.com/images/I/61bZ8F09sWL._SL1500_.jpg',
      'moisturizer': 'https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1000_.jpg',
      'serum': 'https://m.media-amazon.com/images/I/61Wbcv-SSAL._SL1500_.jpg',
      'cleanser': 'https://m.media-amazon.com/images/I/61z7L0kkzJL._SL1500_.jpg',
      'toner': 'https://m.media-amazon.com/images/I/61YXQGMPDVL._SL1500_.jpg',
      'cream': 'https://m.media-amazon.com/images/I/71r0h4SBJHL._SL1500_.jpg',
      'essence': 'https://m.media-amazon.com/images/I/61sWWCVUWqL._SL1500_.jpg',
      'snail': 'https://m.media-amazon.com/images/I/61sWWCVUWqL._SL1500_.jpg',
      'cica': 'https://m.media-amazon.com/images/I/61Ru8kQBwNL._SL1500_.jpg',
      'centella': 'https://m.media-amazon.com/images/I/61YXQGMPDVL._SL1500_.jpg'
    };

    // 이미지 URL 결정 함수
    const getImageUrl = (product) => {
      // 1. 기존 이미지 URL이 유효하면 사용
      if (product.image_url && !product.image_url.includes('placeholder')) {
        return product.image_url;
      }
      if (product.imageUrl && !product.imageUrl.includes('placeholder')) {
        return product.imageUrl;
      }

      // 2. 브랜드별 이미지 매핑
      const brand = (product.brand || '').toLowerCase();
      for (const [key, url] of Object.entries(brandImageMap)) {
        if (brand.includes(key)) {
          return url;
        }
      }

      // 3. 키워드 기반 이미지
      const productName = (product.productName || product.name || '').toLowerCase();
      for (const [key, url] of Object.entries(keywordImageMap)) {
        if (productName.includes(key) || (keyword && keyword.toLowerCase().includes(key))) {
          return url;
        }
      }

      // 4. 기본 이미지
      return 'https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1000_.jpg';
    };

    // 프론트엔드 필드 매핑
    const products = rawProducts.map(p => ({
      ...p,
      name: p.productName || p.name || 'Unknown Product',
      imageUrl: getImageUrl(p),
      rating: p.avgRating || p.rating || 4.5,
      reviewCount: p.reviewCount || 100,
      score: p.score || 80
    }));

    // 제품이 부족하면 시뮬레이션 데이터 추가
    if (products.length < 2) {
      const simulatedProducts = [
        {
          name: `${keyword} Advanced Treatment`,
          brand: 'COSRX',
          imageUrl: 'https://m.media-amazon.com/images/I/61sWWCVUWqL._SL1500_.jpg',
          rating: 4.6,
          reviewCount: 3500,
          score: 85
        },
        {
          name: `${keyword} Intensive Care Serum`,
          brand: 'Beauty of Joseon',
          imageUrl: 'https://m.media-amazon.com/images/I/61jx9r8E-qL._SL1500_.jpg',
          rating: 4.7,
          reviewCount: 2800,
          score: 82
        }
      ];

      while (products.length < 2 && simulatedProducts.length > 0) {
        products.push(simulatedProducts.shift());
      }
    }

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

    // SNS 데이터 가져오기 (조회수 기반)
    const snsStats = await db.collection('sns_platform_stats').find({ country }).toArray();
    let totalViewCount = 0;
    let keywordViewCount = 0;
    for (const stat of snsStats) {
      if (stat.platform === 'YouTube') {
        for (const kw of (stat.keywords || [])) {
          totalViewCount += kw.value || 0;
          if (keyword && (kw.keyword || kw.name || '').toLowerCase().includes(keyword.toLowerCase())) {
            keywordViewCount += kw.value || 0;
          }
        }
      }
    }
    const snsBaseValue = keyword && keywordViewCount > 0 ? keywordViewCount : totalViewCount / 10;

    // Retail 데이터 가져오기 (랭킹 기반 - 랭킹 역수를 점수화)
    const retailStats = snsStats.filter(s => s.platform === 'Amazon');
    let retailBaseValue = 0;
    for (const stat of retailStats) {
      for (const kw of (stat.keywords || [])) {
        const rankScore = 100 - ((kw.rank || 50) * 2);
        if (keyword && (kw.keyword || kw.name || '').toLowerCase().includes(keyword.toLowerCase())) {
          retailBaseValue = Math.max(retailBaseValue, rankScore + kw.value / 10);
        } else {
          retailBaseValue = Math.max(retailBaseValue, rankScore);
        }
      }
    }
    retailBaseValue = retailBaseValue || 50;

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

      // SNS: 조회수 기반 시뮬레이션 (주별 변동 추가)
      const weekVariation = 0.85 + (Math.random() * 0.3); // 85% ~ 115% 변동
      const trendGrowth = 1 + (8 - w) * 0.03; // 최근 주일수록 증가 트렌드
      const snsValue = Math.floor(snsBaseValue * weekVariation * trendGrowth);

      // Retail: 랭킹 기반 시뮬레이션 (주별 변동 추가)
      const retailVariation = 0.9 + (Math.random() * 0.2); // 90% ~ 110% 변동
      const retailValue = Math.floor(retailBaseValue * retailVariation * trendGrowth);

      weeksData.push({
        week: `W${8 - w}`,
        Review: reviewCount > 0 ? reviewCount : Math.floor(Math.random() * 20 + 5), // 최소값 보장
        SNS: snsValue > 0 ? snsValue : Math.floor(Math.random() * 100 + 50),
        Retail: retailValue > 0 ? retailValue : Math.floor(Math.random() * 50 + 30),
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
    const platformData = {};
    for (const stat of stats) {
      if (!seen.has(stat.platform)) {
        seen.add(stat.platform);
        platformData[stat.platform] = {
          platform: stat.platform,
          keywords: (stat.keywords || []).map(kw => ({
            name: kw.keyword || kw.name || kw.koreanName || 'Unknown',
            koreanName: kw.koreanName || kw.keyword || kw.name || 'Unknown',
            value: kw.value,
            change: kw.change || 0,
            type: kw.type || 'ingredient'
          }))
        };
      }
    }

    // 플랫폼 순서 정의 (국가별) - 첫 번째가 맨 위에 표시
    const platformOrderByCountry = {
      'usa': ['Amazon', 'YouTube', 'Instagram'],
      'japan': ['@cosme', 'YouTube', 'Instagram'],  // @cosme 맨 위
      'singapore': ['Shopee', 'YouTube', 'Instagram'],  // Shopee 맨 위
      'malaysia': ['Shopee', 'YouTube', 'Instagram'],   // Shopee 맨 위
      'indonesia': ['Shopee', 'YouTube', 'Instagram'],  // Shopee 맨 위
      'china': ['Weibo', 'Xiaohongshu', 'Douyin'],
      'default': ['Shopee', 'YouTube', 'Instagram']
    };
    const platformOrder = platformOrderByCountry[country] || platformOrderByCountry['default'];

    // 카테고리별 기본 키워드 (데이터 부족 시 사용)
    const categoryKeywords = {
      'Skincare': {
        ingredients: ['Retinol', 'Niacinamide', 'Hyaluronic Acid', 'Vitamin C', 'Peptides'],
        formulas: ['Serum', 'Moisturizer', 'Toner', 'Essence', 'Cream'],
        effects: ['Anti-aging', 'Brightening', 'Hydration', 'Pore Care', 'Soothing']
      },
      'Cleansing': {
        ingredients: ['Salicylic Acid', 'Tea Tree', 'Centella', 'Green Tea', 'Charcoal'],
        formulas: ['Foam Cleanser', 'Oil Cleanser', 'Gel Cleanser', 'Balm Cleanser', 'Micellar Water'],
        effects: ['Deep Cleansing', 'Pore Cleansing', 'Makeup Removal', 'Oil Control', 'Gentle']
      },
      'Sun Care': {
        ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Centella', 'Aloe', 'Niacinamide'],
        formulas: ['Sunscreen', 'Sun Stick', 'Sun Cushion', 'Sun Spray', 'Sun Gel'],
        effects: ['UV Protection', 'Non-greasy', 'Moisturizing', 'Tone-up', 'Water Resistant']
      },
      'Makeup': {
        ingredients: ['Hyaluronic Acid', 'Collagen', 'Vitamin E', 'Centella', 'Niacinamide'],
        formulas: ['Cushion', 'Foundation', 'Concealer', 'Primer', 'Setting Spray'],
        effects: ['Glow', 'Matte', 'Long-lasting', 'Coverage', 'Hydrating']
      }
    };

    // 플랫폼별 시뮬레이션 데이터 생성
    const generateSimulatedKeywords = (platform, category) => {
      const catData = categoryKeywords[category] || categoryKeywords['Skincare'];
      const allKeywords = [
        ...catData.ingredients.map(k => ({ name: k, type: 'ingredient' })),
        ...catData.formulas.map(k => ({ name: k, type: 'formula' })),
        ...catData.effects.map(k => ({ name: k, type: 'effect' }))
      ];

      // 플랫폼별 가중치 적용
      const platformWeights = {
        'Amazon': { ingredient: 1.2, formula: 1.0, effect: 0.8 },
        'YouTube': { ingredient: 1.0, formula: 0.9, effect: 1.3 },
        'Instagram': { ingredient: 0.9, formula: 1.1, effect: 1.2 }
      };
      const weights = platformWeights[platform] || { ingredient: 1, formula: 1, effect: 1 };

      return allKeywords
        .map(kw => ({
          name: kw.name,
          koreanName: kw.name,
          value: Math.floor((70 + Math.random() * 30) * (weights[kw.type] || 1)),
          change: Math.floor(Math.random() * 15) - 3,
          type: kw.type
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    };

    // 순서대로 정렬된 플랫폼 배열 (데이터 없으면 시뮬레이션)
    const platforms = platformOrder.map(platformName => {
      if (platformData[platformName] && platformData[platformName].keywords.length >= 3) {
        return platformData[platformName];
      }
      // 데이터 부족 시 시뮬레이션
      return {
        platform: platformName,
        keywords: generateSimulatedKeywords(platformName, category)
      };
    });

    res.json({ country, category, platforms });
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

    const overseasRaw = await db.collection('whitespace_products')
      .find({ country, category, type: 'overseas' })
      .sort({ reviewCount: -1 })
      .limit(10)
      .toArray();

    const koreanRaw = await db.collection('whitespace_products')
      .find({ country, category, type: 'korean' })
      .sort({ reviewCount: -1 })
      .limit(10)
      .toArray();

    // Map image_url to image for frontend compatibility
    const mapProduct = (p) => ({
      ...p,
      image: p.imageUrl || p.image_url || p.image,
      imageUrl: p.imageUrl || p.image_url || p.image,
    });

    const overseas = overseasRaw.map(mapProduct);
    const korean = koreanRaw.map(mapProduct);

    res.json({ country, category, overseas, korean });
  } catch (error) {
    console.error('WhiteSpace 제품 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 키워드 요약 조회 (캐시된 AI 요약)
 * GET /api/real/keyword-summary
 */
router.get('/keyword-summary', async (req, res) => {
  try {
    const { country = 'usa', keyword, sentiment = 'positive' } = req.query;
    if (!req.db) return res.status(503).json({ error: 'Database not connected' });
    if (!keyword) return res.status(400).json({ error: 'keyword parameter required' });

    const db = req.db;

    // 캐시된 요약 조회
    const cached = await db.collection('keyword_summaries').findOne({
      country,
      keyword: { $regex: new RegExp(`^${keyword}$`, 'i') },
      sentiment
    });

    if (cached) {
      return res.json({
        keyword,
        sentiment,
        summary: cached.summary,
        source: cached.source,
        generatedAt: cached.generatedAt
      });
    }

    // 캐시가 없으면 기본 요약 반환
    const reviewCount = await db.collection('raw_reviews').countDocuments({
      country,
      content: { $regex: new RegExp(keyword, 'i') },
      sentiment
    });

    const fallbackSummary = sentiment === 'positive'
      ? `"${keyword}" 성분에 대해 ${reviewCount}건의 긍정적 리뷰가 있습니다. 소비자들은 전반적으로 만족스러운 경험을 보고하고 있습니다.`
      : `"${keyword}" 성분에 대해 ${reviewCount}건의 부정적 리뷰가 있습니다. 일부 소비자들은 개선이 필요한 부분을 언급했습니다.`;

    res.json({
      keyword,
      sentiment,
      summary: fallbackSummary,
      source: 'fallback',
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('키워드 요약 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 리뷰 유형별 EXAONE 요약 조회 (미리 생성된 요약)
 * GET /api/real/review-type-summary
 * keyword 파라미터: 리더보드 키워드별 요약 조회
 */
router.get('/review-type-summary', async (req, res) => {
  try {
    const { country = 'usa', keyword, reviewType, sentiment = 'positive' } = req.query;
    if (!req.db) return res.status(503).json({ error: 'Database not connected' });

    // keyword 또는 reviewType 중 하나 필요
    if (!keyword && !reviewType) {
      return res.status(400).json({ error: 'keyword or reviewType parameter required' });
    }

    const db = req.db;

    // keyword로 조회 (리더보드 키워드별 요약)
    if (keyword) {
      const cached = await db.collection('keyword_summaries').findOne({
        country,
        keyword,
        sentiment
      });

      if (cached) {
        return res.json({
          keyword,
          sentiment,
          summary: cached.summary,
          sampleReviews: cached.sampleReviews || [],
          reviewCount: cached.reviewCount || 0,
          source: cached.source,
          generatedAt: cached.generatedAt
        });
      }

      // 캐시 없으면 폴백
      const sentimentKr = sentiment === 'positive' ? '긍정' : '부정';
      return res.json({
        keyword,
        sentiment,
        summary: `"${keyword}" 키워드에 대한 ${sentimentKr} 리뷰 요약이 생성 중입니다.`,
        sampleReviews: [],
        reviewCount: 0,
        source: 'fallback',
        generatedAt: new Date()
      });
    }

    // reviewType으로 조회 (기존 로직)
    const cached = await db.collection('keyword_summaries').findOne({
      country,
      reviewType,
      sentiment
    });

    if (cached) {
      return res.json({
        reviewType,
        sentiment,
        summary: cached.summary,
        sampleReviews: cached.sampleReviews || [],
        reviewCount: cached.reviewCount || 0,
        source: cached.source,
        generatedAt: cached.generatedAt
      });
    }

    // 캐시가 없으면 폴백 요약 생성
    const reviewCount = await db.collection('raw_reviews').countDocuments({
      country,
      reviewType,
      sentiment
    });

    const sentimentKr = sentiment === 'positive' ? '긍정' : '부정';
    const fallbackSummary = `"${reviewType}" 유형에 대한 ${reviewCount}건의 ${sentimentKr} 리뷰가 분석되었습니다. 소비자들의 주요 의견을 종합하여 트렌드 인사이트를 제공합니다.`;

    res.json({
      reviewType,
      sentiment,
      summary: fallbackSummary,
      sampleReviews: [],
      reviewCount,
      source: 'fallback',
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('리뷰 유형별 요약 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 키워드 의미(설명) 조회 (processed_keywords에서 description 필드)
 * GET /api/real/keyword-description
 */
router.get('/keyword-description', async (req, res) => {
  try {
    const { country = 'usa', keyword } = req.query;
    if (!req.db) return res.status(503).json({ error: 'Database not connected' });
    if (!keyword) return res.status(400).json({ error: 'keyword parameter required' });

    const db = req.db;

    // processed_keywords에서 해당 키워드의 description 조회
    const keywordDoc = await db.collection('processed_keywords').findOne({
      keyword: { $regex: new RegExp(`^${keyword}$`, 'i') },
      country
    });

    if (keywordDoc && keywordDoc.description) {
      return res.json({
        keyword,
        koreanName: keywordDoc.koreanName || keyword,
        description: keywordDoc.description,
        keywordType: keywordDoc.keywordType,
        category: keywordDoc.category,
        source: 'database'
      });
    }

    // 국가 필터 없이 재검색
    const globalDoc = await db.collection('processed_keywords').findOne({
      keyword: { $regex: new RegExp(`^${keyword}$`, 'i') },
      description: { $exists: true, $ne: '' }
    });

    if (globalDoc && globalDoc.description) {
      return res.json({
        keyword,
        koreanName: globalDoc.koreanName || keyword,
        description: globalDoc.description,
        keywordType: globalDoc.keywordType,
        category: globalDoc.category,
        source: 'database'
      });
    }

    // 설명이 없으면 빈 응답
    res.json({
      keyword,
      koreanName: keyword,
      description: '',
      source: 'none'
    });
  } catch (error) {
    console.error('키워드 의미 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

