/**
 * SNS 플랫폼별 키워드 순위 API
 */

import express from 'express';

const router = express.Router();

/**
 * SNS 플랫폼별 키워드 순위 조회
 * GET /api/sns-platform/rankings
 */
router.get('/rankings', async (req, res) => {
  try {
    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const { country = 'usa', platform = null } = req.query;

    const db = req.db;
    
    // 최신 통계 조회
    const query = {
      country,
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }  // 최근 7일
    };
    
    if (platform) {
      query.platform = platform;
    }
    
    const stats = await db.collection('sns_platform_stats')
      .find(query)
      .sort({ date: -1 })
      .toArray();
    
    // 플랫폼별로 그룹화
    const platformRankings = {};
    
    for (const stat of stats) {
      if (!platformRankings[stat.platform]) {
        platformRankings[stat.platform] = {
          platform: stat.platform,
          keywords: stat.keywords || []
        };
      }
    }
    
    // 플랫폼별로 정렬 (상위 5개)
    for (const platform in platformRankings) {
      platformRankings[platform].keywords = platformRankings[platform].keywords
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    }
    
    res.json({
      country,
      platforms: Object.values(platformRankings)
    });
    
  } catch (error) {
    console.error('SNS 플랫폼 순위 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 특정 플랫폼의 키워드 순위 조회
 * GET /api/sns-platform/:platform
 */
router.get('/:platform', async (req, res) => {
  try {
    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const { platform } = req.params;
    const { country = 'usa' } = req.query;

    const db = req.db;
    
    const stat = await db.collection('sns_platform_stats')
      .findOne({
        platform,
        country
      }, {
        sort: { date: -1 }
      });
    
    if (!stat) {
      return res.status(404).json({
        error: '플랫폼 데이터를 찾을 수 없습니다'
      });
    }
    
    res.json({
      platform: stat.platform,
      country: stat.country,
      keywords: stat.keywords || [],
      date: stat.date
    });
    
  } catch (error) {
    console.error('플랫폼 순위 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

