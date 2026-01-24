/**
 * 배치 작업 관리 API
 * 수동 실행 및 상태 확인
 */

import express from 'express';
import { runManualBatch } from '../services/batchProcessor.js';

const router = express.Router();

/**
 * 배치 작업 수동 실행
 * POST /api/batch/run
 */
router.post('/run', async (req, res) => {
  try {
    const { country = 'usa', category = 'Skincare', weeks = 8 } = req.body;
    
    console.log(`📋 수동 배치 작업 요청: ${country}/${category} (${weeks}주)`);
    
    // 비동기로 실행 (응답은 즉시 반환)
    runManualBatch(country, category, weeks)
      .then(result => {
        console.log('✅ 배치 작업 완료:', result);
      })
      .catch(error => {
        console.error('❌ 배치 작업 실패:', error);
      });
    
    res.json({
      success: true,
      message: '배치 작업이 시작되었습니다. 백그라운드에서 실행 중입니다.',
      country,
      category,
      weeks
    });
    
  } catch (error) {
    console.error('배치 작업 시작 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 배치 작업 상태 확인
 * GET /api/batch/status
 */
router.get('/status', async (req, res) => {
  try {
    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const db = req.db;
    
    // 최근 10개 배치 작업 로그 조회
    const logs = await db.collection('batch_job_logs').find({
      jobType: 'llm_workflow'
    })
    .sort({ completedAt: -1 })
    .limit(10)
    .toArray();
    
    // 마지막 실행 정보
    const lastRun = logs[0] || null;
    
    res.json({
      lastRun: lastRun ? {
        status: lastRun.status,
        startedAt: lastRun.startedAt,
        completedAt: lastRun.completedAt,
        duration: lastRun.duration,
        country: lastRun.country,
        category: lastRun.category
      } : null,
      recentLogs: logs.map(log => ({
        status: log.status,
        startedAt: log.startedAt,
        completedAt: log.completedAt,
        duration: log.duration,
        reason: log.reason
      }))
    });
    
  } catch (error) {
    console.error('배치 상태 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

