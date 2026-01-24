/**
 * 리더보드 재구성 API
 * DB 기반 리더보드 생성 (최신 8주 데이터)
 */

import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * 리더보드 재구성 (워크플로우 실행)
 * POST /api/leaderboard/regenerate
 */
router.post('/regenerate', async (req, res) => {
  try {
    const { country = 'usa', category = 'Skincare', weeks = 8 } = req.body;
    
    console.log(`🔄 리더보드 재구성 시작: ${country}/${category} (${weeks}주)`);
    
    // Python 워크플로우 실행
    const pythonScript = path.join(__dirname, '../services/langchain_workflow.py');
    const pythonProcess = spawn('python3', [pythonScript, country, category, weeks.toString()]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({
          error: '워크플로우 실행 실패',
          details: errorOutput
        });
      }
      
      // 리더보드 데이터 조회
      getLeaderboardData(req.db, country, category)
        .then(leaderboard => {
          res.json({
            success: true,
            country,
            category,
            weeks,
            leaderboard,
            message: '리더보드 재구성 완료'
          });
        })
        .catch(err => {
          res.status(500).json({
            error: '리더보드 데이터 조회 실패',
            details: err.message
          });
        });
    });
    
  } catch (error) {
    console.error('리더보드 재구성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 리더보드 조회
 * GET /api/leaderboard
 */
router.get('/', async (req, res) => {
  try {
    const { country = 'usa', category = 'Skincare', itemType = 'Ingredients', trendLevel = 'Actionable' } = req.query;
    
    const leaderboard = await getLeaderboardData(req.db, country, category, itemType, trendLevel);
    
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
 * 리더보드 데이터 생성 함수
 */
async function getLeaderboardData(db, country, category, itemType = null, trendLevel = null) {
  // DB에서 trends 데이터 조회
  const query = {
    country: country || { $exists: true }
  };
  
  if (category) {
    // trends의 combination에서 카테고리 추론 또는 별도 필드 사용
  }
  
  const trends = await db.collection('trends')
    .find(query)
    .sort({ score: -1 })
    .limit(100)
    .toArray();
  
  // 키워드별 점수 집계
  const keywordScores = {
    ingredients: {},
    formulas: {},
    effects: {},
    mood: {}
  };
  
  for (const trend of trends) {
    // 성분 점수 집계
    for (const ingredient of trend.ingredients || []) {
      if (!keywordScores.ingredients[ingredient]) {
        keywordScores.ingredients[ingredient] = {
          keyword: ingredient,
          score: 0,
          count: 0,
          avgRank: 0,
          ranks: []
        };
      }
      keywordScores.ingredients[ingredient].score += trend.score;
      keywordScores.ingredients[ingredient].count += 1;
      keywordScores.ingredients[ingredient].ranks.push(trend.avgRank);
    }
    
    // 제형 점수 집계
    for (const formula of trend.formulas || []) {
      if (!keywordScores.formulas[formula]) {
        keywordScores.formulas[formula] = {
          keyword: formula,
          score: 0,
          count: 0,
          avgRank: 0,
          ranks: []
        };
      }
      keywordScores.formulas[formula].score += trend.score;
      keywordScores.formulas[formula].count += 1;
      keywordScores.formulas[formula].ranks.push(trend.avgRank);
    }
    
    // 효과 점수 집계
    for (const effect of trend.effects || []) {
      if (!keywordScores.effects[effect]) {
        keywordScores.effects[effect] = {
          keyword: effect,
          score: 0,
          count: 0,
          avgRank: 0,
          ranks: []
        };
      }
      keywordScores.effects[effect].score += trend.score;
      keywordScores.effects[effect].count += 1;
      keywordScores.effects[effect].ranks.push(trend.avgRank);
    }
    
    // Mood 점수 집계
    for (const mood of trend.mood || []) {
      if (!keywordScores.mood[mood]) {
        keywordScores.mood[mood] = {
          keyword: mood,
          score: 0,
          count: 0,
          avgRank: 0,
          ranks: []
        };
      }
      keywordScores.mood[mood].score += trend.score;
      keywordScores.mood[mood].count += 1;
      keywordScores.mood[mood].ranks.push(trend.avgRank);
    }
  }
  
  // 평균 랭킹 계산 및 정렬
  const processKeywords = (keywords) => {
    return Object.values(keywords)
      .map(kw => ({
        ...kw,
        avgRank: kw.ranks.length > 0 
          ? kw.ranks.reduce((a, b) => a + b, 0) / kw.ranks.length 
          : 1000,
        score: kw.score / kw.count  // 평균 점수
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)  // 상위 20개
      .map((kw, idx) => ({
        rank: idx + 1,
        keyword: kw.keyword,
        score: Math.round(kw.score),
        change: 0,  // 전주 대비 (추후 계산)
        metadata: {
          count: kw.count,
          avgRank: Math.round(kw.avgRank)
        }
      }));
  };
  
  const leaderboard = {
    ingredients: processKeywords(keywordScores.ingredients),
    formulas: processKeywords(keywordScores.formulas),
    effects: processKeywords(keywordScores.effects),
    mood: processKeywords(keywordScores.mood)
  };
  
  // itemType과 trendLevel 필터링 (필요시)
  if (itemType) {
    const typeMap = {
      'Ingredients': 'ingredients',
      'Texture': 'formulas',
      'Effects': 'effects',
      'Visual/Mood': 'mood'
    };
    
    const selectedType = typeMap[itemType] || 'ingredients';
    return {
      [selectedType]: leaderboard[selectedType]
    };
  }
  
  return leaderboard;
}

export default router;

