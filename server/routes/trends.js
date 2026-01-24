/**
 * 트렌드 관련 API 라우트
 * DB 변수 활용 및 LLM Agent 통합
 */

import express from 'express';
import { 
  extractIngredients, 
  classifyKeyword, 
  analyzeSentiment, 
  extractEffects,
  analyzeCombination,
  countIngredientMentions
} from '../services/llmAgents.js';
import { classifyTrend } from '../services/trendClassifier.js';

const router = express.Router();

/**
 * 성분 트렌드 리더보드 생성
 * GET /api/trends/ingredient-leaderboard
 */
router.get('/ingredient-leaderboard', async (req, res) => {
  try {
    const { country, category, period = '8weeks' } = req.query;
    
    if (!country || !category) {
      return res.status(400).json({ 
        error: 'country and category are required' 
      });
    }
    
    // 기간 계산
    const endDate = new Date();
    const startDate = new Date();
    const weeks = parseInt(period) || 8;
    startDate.setDate(startDate.getDate() - (weeks * 7));
    
    const db = req.db; // MongoDB 연결 객체
    
    // 1. 해당 기간의 모든 제품 조회
    const products = await db.collection('raw_retail_sales').find({
      country,
      category,
      date: { $gte: startDate, $lte: endDate }
    }).toArray();
    
    console.log(`Found ${products.length} products for ${country}/${category}`);
    
    // 2. 각 제품에서 성분 추출 (LLM Agent 1)
    const ingredientMap = new Map();
    
    for (const product of products) {
      if (!product.description) continue;
      
      const ingredients = await extractIngredients(product.description);
      
      ingredients.forEach(ingredient => {
        if (!ingredientMap.has(ingredient)) {
          ingredientMap.set(ingredient, {
            ingredient,
            products: [],
            totalMentions: 0,
            totalReviews: 0,
            rankings: []
          });
        }
        
        const data = ingredientMap.get(ingredient);
        data.products.push({
          productId: product.productId,
          productName: product.productName,
          brand: product.brand,
          salesRank: product.salesRank,
          date: product.date
        });
        
        if (product.salesRank) {
          data.rankings.push(product.salesRank);
        }
      });
    }
    
    console.log(`Extracted ${ingredientMap.size} unique ingredients`);
    
    // 3. 각 성분별 점수 계산
    const scores = await Promise.all(
      Array.from(ingredientMap.entries()).map(async ([ingredient, data]) => {
        // 제품 랭킹 점수 (40%)
        const avgRank = data.rankings.length > 0
          ? data.rankings.reduce((sum, r) => sum + r, 0) / data.rankings.length
          : 1000;
        const rankingScore = Math.max(0, 100 - (avgRank - 1) * 0.2); // 1위 = 100점, 500위 = 0점
        
        // 리뷰 언급 수 (30%)
        const productIds = [...new Set(data.products.map(p => p.productId))];
        const reviews = await db.collection('raw_reviews').find({
          productId: { $in: productIds },
          country,
          postedAt: { $gte: startDate, $lte: endDate }
        }).toArray();
        
        const mentionCount = await countIngredientMentions(reviews, ingredient);
        const totalReviews = reviews.length;
        const mentionRate = totalReviews > 0 ? mentionCount / totalReviews : 0;
        const mentionScore = Math.min(100, mentionRate * 1000); // 10% 언급률 = 100점
        
        // SNS 언급 수 (20%) - 간단한 키워드 매칭 (실제로는 LLM 사용)
        const snsPosts = await db.collection('raw_sns_posts').find({
          country,
          postedAt: { $gte: startDate, $lte: endDate },
          $or: [
            { content: { $regex: ingredient, $options: 'i' } },
            { hashtags: { $in: [ingredient] } }
          ]
        }).count();
        
        const snsScore = Math.min(100, snsPosts / 100); // 100개 언급 = 100점
        
        // 효과 점수 (10%) - LLM Agent 4
        const effects = await extractEffects(reviews.slice(0, 20), ingredient);
        const effectScore = Math.min(100, effects.effects.length * 20); // 효과 5개 = 100점
        
        // 종합 점수
        const totalScore = 
          rankingScore * 0.4 +
          mentionScore * 0.3 +
          snsScore * 0.2 +
          effectScore * 0.1;
        
        return {
          ingredient,
          score: Math.round(totalScore),
          breakdown: {
            rankingScore: Math.round(rankingScore),
            mentionScore: Math.round(mentionScore),
            snsScore: Math.round(snsScore),
            effectScore: Math.round(effectScore)
          },
          metrics: {
            productCount: data.products.length,
            reviewCount: totalReviews,
            mentionCount,
            mentionRate: Math.round(mentionRate * 100) / 100,
            snsMentions: snsPosts,
            avgRank: Math.round(avgRank),
            effects: effects.effects
          }
        };
      })
    );
    
    // 4. 점수 순으로 정렬
    scores.sort((a, b) => b.score - a.score);
    
    // 5. 리더보드 형식으로 변환
    const leaderboard = scores.map((item, index) => ({
      rank: index + 1,
      keyword: item.ingredient,
      score: item.score,
      change: 0, // 전주 대비 (추후 계산)
      metadata: item.metrics,
      breakdown: item.breakdown
    }));
    
    res.json({
      country,
      category,
      period: `${weeks}weeks`,
      leaderboard,
      totalIngredients: scores.length
    });
    
  } catch (error) {
    console.error('Error generating ingredient leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 트렌드 조합 분석
 * GET /api/trends/combination
 */
router.get('/combination', async (req, res) => {
  try {
    const { ingredients, country } = req.query;
    
    if (!ingredients || !country) {
      return res.status(400).json({ 
        error: 'ingredients and country are required' 
      });
    }
    
    const ingredientList = ingredients.split(',').map(i => i.trim());
    
    const db = req.db;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 56); // 8주
    
    // 해당 성분들이 포함된 제품 찾기
    const products = await db.collection('raw_retail_sales').find({
      country,
      date: { $gte: startDate, $lte: endDate }
    }).toArray();
    
    // 성분이 포함된 제품 필터링
    const relevantProducts = [];
    for (const product of products) {
      if (!product.description) continue;
      const ingredients = await extractIngredients(product.description);
      const hasAllIngredients = ingredientList.every(ing => 
        ingredients.includes(ing)
      );
      if (hasAllIngredients) {
        relevantProducts.push(product);
      }
    }
    
    // 관련 리뷰 조회
    const productIds = relevantProducts.map(p => p.productId);
    const reviews = await db.collection('raw_reviews').find({
      productId: { $in: productIds },
      country,
      postedAt: { $gte: startDate, $lte: endDate }
    }).toArray();
    
    // LLM Agent 5: 조합 분석
    const combinationAnalysis = await analyzeCombination(ingredientList, reviews);
    
    // 트렌드 신호 계산
    const signals = await calculateTrendSignals(
      db,
      ingredientList,
      country,
      startDate,
      endDate
    );
    
    // 트렌드 분류
    const metrics = {
      growthRate: calculateGrowthRate(signals),
      marketShare: calculateMarketShare(relevantProducts, country),
      reviewQuality: calculateReviewQuality(reviews)
    };
    
    const classification = classifyTrend(signals, metrics);
    
    res.json({
      combination: combinationAnalysis.combination,
      reason: combinationAnalysis.reason,
      synergyScore: combinationAnalysis.synergyScore,
      classification: classification.category,
      confidence: classification.confidence,
      signals,
      metrics,
      scores: classification.scores
    });
    
  } catch (error) {
    console.error('Error analyzing combination:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 리뷰 키워드 추출
 * GET /api/trends/review-keywords
 */
router.get('/review-keywords', async (req, res) => {
  try {
    const { productId, country, period = '8weeks' } = req.query;
    
    if (!productId || !country) {
      return res.status(400).json({ 
        error: 'productId and country are required' 
      });
    }
    
    const db = req.db;
    const endDate = new Date();
    const startDate = new Date();
    const weeks = parseInt(period) || 8;
    startDate.setDate(startDate.getDate() - (weeks * 7));
    
    // 리뷰 조회
    const reviews = await db.collection('raw_reviews').find({
      productId,
      country,
      postedAt: { $gte: startDate, $lte: endDate }
    }).toArray();
    
    // LLM Agent 3: 감성 분석
    const sentimentAnalysis = await analyzeSentiment(reviews);
    
    res.json({
      productId,
      country,
      period: `${weeks}weeks`,
      reviewCount: reviews.length,
      keywords: {
        positive: sentimentAnalysis.positive,
        negative: sentimentAnalysis.negative
      }
    });
    
  } catch (error) {
    console.error('Error extracting review keywords:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper 함수들

async function calculateTrendSignals(db, ingredients, country, startDate, endDate) {
  // 주별 데이터 집계
  const weeks = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    // SNS 언급 수
    const snsCount = await db.collection('raw_sns_posts').countDocuments({
      country,
      postedAt: { $gte: currentDate, $lt: weekEnd },
      $or: ingredients.map(ing => ({
        content: { $regex: ing, $options: 'i' }
      }))
    });
    
    // 리테일 랭킹 (제품 랭킹 평균)
    const products = await db.collection('raw_retail_sales').find({
      country,
      date: { $gte: currentDate, $lt: weekEnd }
    }).toArray();
    
    // 성분 포함 제품 필터링 (간단화: 실제로는 LLM 사용)
    const relevantProducts = products.filter(p => {
      if (!p.description) return false;
      return ingredients.some(ing => 
        p.description.toLowerCase().includes(ing.toLowerCase())
      );
    });
    
    const avgRank = relevantProducts.length > 0
      ? relevantProducts.reduce((sum, p) => sum + (p.salesRank || 1000), 0) / relevantProducts.length
      : 1000;
    const retailScore = Math.max(0, 100 - (avgRank - 1) * 0.2);
    
    // 리뷰 수
    const reviewCount = await db.collection('raw_reviews').countDocuments({
      country,
      postedAt: { $gte: currentDate, $lt: weekEnd },
      productId: { $in: relevantProducts.map(p => p.productId) }
    });
    
    weeks.push({
      week: weeks.length + 1,
      sns: Math.min(100, snsCount / 10),
      retail: retailScore,
      review: Math.min(100, reviewCount / 5)
    });
    
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return {
    SNS: {
      type: 'SNS',
      data: weeks.map(w => ({ name: `Week ${w.week}`, value: w.sns }))
    },
    Retail: {
      type: 'Retail',
      data: weeks.map(w => ({ name: `Week ${w.week}`, value: w.retail }))
    },
    Review: {
      type: 'Review',
      data: weeks.map(w => ({ name: `Week ${w.week}`, value: w.review }))
    }
  };
}

function calculateGrowthRate(signals) {
  if (!signals.SNS || signals.SNS.data.length < 2) return 0;
  
  const values = signals.SNS.data.map(d => d.value);
  const first = values[0];
  const last = values[values.length - 1];
  
  if (first === 0) return 0;
  return ((last - first) / first) * 100;
}

function calculateMarketShare(products, country) {
  // 간단화: 실제로는 전체 시장 대비 계산
  return products.length * 0.5; // 임시 값
}

function calculateReviewQuality(reviews) {
  if (reviews.length === 0) {
    return { positiveRate: 0, avgRating: 0 };
  }
  
  const ratings = reviews.map(r => r.rating || 0).filter(r => r > 0);
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;
  
  const positiveCount = ratings.filter(r => r >= 4).length;
  const positiveRate = ratings.length > 0 ? positiveCount / ratings.length : 0;
  
  return { positiveRate, avgRating };
}

export default router;

