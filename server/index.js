import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://amore-fc103.web.app',
  'https://amore-fc103.firebaseapp.com',
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true }));
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB
let dbConnection = null;
try {
  const mongoose = await connectDB();
  dbConnection = mongoose.connection.db;
  console.log('✅ MongoDB 연결 성공');
} catch (error) {
  console.warn('⚠️ MongoDB 연결 실패:', error.message);
}

// req.db에 MongoDB native driver 연결 추가
app.use((req, res, next) => {
  req.db = dbConnection;
  next();
});

// Routes
app.use('/api/leaderboard', (await import('./routes/leaderboard.js')).default);
app.use('/api/sns-platform', (await import('./routes/snsPlatform.js')).default);
app.use('/api/workflow', (await import('./routes/workflow.js')).default);
app.use('/api/batch', (await import('./routes/batch.js')).default);
app.use('/api/real', (await import('./routes/realData.js')).default);

// LLM Proxy Routes (Python LLM servers on GPUs)
// 포트 5 (5005): review-summary, keyword-why, category-trend
// 포트 6 (5006): sns-analysis, plc-prediction, category-prediction, whitespace-product
// 포트 7 (5007): chat/text, country-strategy, category-strategy, rag-insight, whitespace-category
// 실제 파이썬 파일 엔드포인트 기준 라우팅
const LLM_SERVER_PORT5 = process.env.LLM_SERVER_PORT5 || 'http://localhost:5005';  // llm_server_port5.py: sns-analysis, whitespace-product
const LLM_SERVER_PORT6 = process.env.LLM_SERVER_PORT6 || 'http://localhost:5006';  // llm_server_port6.py: category-strategy, whitespace-category
const LLM_SERVER_PORT7 = process.env.LLM_SERVER_PORT7 || 'http://localhost:5007';  // llm_server_port7.py: review-summary, category-trend, rag-insight, chat/text, chat/multimodal

// PORT7: 리뷰 AI 분석 요약
app.post('/api/llm/review-summary', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT7}/api/llm/review-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU5 server not available: ' + error.message });
  }
});

// PORT5: Retail/SNS 인기 키워드 AI 분석
app.post('/api/llm/sns-analysis', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT5}/api/llm/sns-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU6 server not available: ' + error.message });
  }
});

app.get('/api/llm/health', async (req, res) => {
  try {
    const [gpu5, gpu6, gpu7] = await Promise.allSettled([
      fetch(`${LLM_SERVER_PORT5}/api/llm/health`).then(r => r.json()),
      fetch(`${LLM_SERVER_PORT6}/api/llm/health`).then(r => r.json()),
      fetch(`${LLM_SERVER_PORT7}/api/llm/health`).then(r => r.json()),
    ]);
    res.json({
      gpu5: gpu5.status === 'fulfilled' ? gpu5.value : { status: 'offline' },
      gpu6: gpu6.status === 'fulfilled' ? gpu6.value : { status: 'offline' },
      gpu7: gpu7.status === 'fulfilled' ? gpu7.value : { status: 'offline' },
    });
  } catch (error) {
    res.json({ status: 'offline', error: error.message });
  }
});

// GPU5: 키워드 AI - 왜 트렌드인지
app.post('/api/llm/keyword-why', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT5}/api/llm/keyword-why`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU5 server not available: ' + error.message });
  }
});

// PORT7: 카테고리 트렌드 분석
app.post('/api/llm/category-trend', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT7}/api/llm/category-trend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU5 server not available: ' + error.message });
  }
});

// GPU7: RAG Insight (AI 맞춤형 인사이트)
app.post('/api/llm/rag-insight', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT7}/api/llm/rag-insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU7 RAG Insight not available: ' + error.message });
  }
});

// PORT7: PLC 예측
app.post('/api/llm/plc-prediction', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT7}/api/llm/plc-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU6 server not available: ' + error.message });
  }
});

// PORT7: 카테고리 예측
app.post('/api/llm/category-prediction', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT7}/api/llm/category-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU6 server not available: ' + error.message });
  }
});

// PORT5: WhiteSpace 제품 비교
app.post('/api/llm/whitespace-product', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT5}/api/llm/whitespace-product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU6 server not available: ' + error.message });
  }
});

// PORT6: WhiteSpace 인사이트 버튼
app.post('/api/llm/whitespace-category', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT6}/api/llm/whitespace-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU7 server not available: ' + error.message });
  }
});

// PORT6: 국가 전략 분석
app.post('/api/llm/country-strategy', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT6}/api/llm/country-strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU7 server not available: ' + error.message });
  }
});

// PORT6: 카테고리 전략 분석
app.post('/api/llm/category-strategy', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT6}/api/llm/category-strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU7 server not available: ' + error.message });
  }
});

// GPU7: 하단 챗봇 (텍스트 전용)
app.post('/api/chat/text', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${LLM_SERVER_PORT7}/api/chat/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'LLM GPU7 chatbot not available: ' + error.message });
  }
});

app.post('/api/chat/multimodal', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);
    // Multimodal now handled by GPU7 (llm_server.py with lazy-loaded Qwen2-VL)
    const response = await fetch(`${LLM_SERVER_PORT7}/api/chat/multimodal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ success: false, error: 'VLM chatbot server not available: ' + error.message });
  }
});

app.get('/api/chat/health', async (req, res) => {
  try {
    // Chat health now on GPU7 (unified llm_server.py)
    const response = await fetch(`${LLM_SERVER_PORT7}/api/llm/health`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.json({ status: 'offline', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: dbConnection ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 트렌드 조회 API (DB 기반)
app.get('/api/trends', async (req, res) => {
  try {
    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const { country = 'usa', category } = req.query;
    const query = { country };
    if (category) query.category = category;

    const trends = await req.db.collection('trends')
      .find(query)
      .sort({ score: -1 })
      .limit(50)
      .toArray();

    res.json({ country, trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 트렌드 분류 API
app.get('/api/trends/classify', async (req, res) => {
  try {
    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const { keyword, country = 'usa' } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: 'keyword is required' });
    }

    // 해당 키워드를 포함하는 트렌드 조회
    const trends = await req.db.collection('trends').find({
      country,
      $or: [
        { ingredients: keyword },
        { formulas: keyword },
        { effects: keyword }
      ]
    }).sort({ score: -1 }).toArray();

    if (trends.length === 0) {
      return res.json({ keyword, country, classification: 'Unknown', message: 'No trend data found' });
    }

    const topTrend = trends[0];
    res.json({
      keyword,
      country,
      classification: topTrend.category,
      score: topTrend.score,
      signals: topTrend.signals,
      relatedCombinations: trends.map(t => ({
        combination: t.combination,
        score: t.score,
        category: t.category
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DB 통계 API
app.get('/api/stats', async (req, res) => {
  try {
    if (!req.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const stats = {
      raw_retail_sales: await req.db.collection('raw_retail_sales').countDocuments(),
      raw_reviews: await req.db.collection('raw_reviews').countDocuments(),
      raw_sns_posts: await req.db.collection('raw_sns_posts').countDocuments(),
      processed_keywords: await req.db.collection('processed_keywords').countDocuments(),
      trends: await req.db.collection('trends').countDocuments(),
      sns_platform_stats: await req.db.collection('sns_platform_stats').countDocuments(),
      leaderboard: await req.db.collection('leaderboard').countDocuments()
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 AMORE CLUE Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Stats:  http://localhost:${PORT}/api/stats`);
  console.log(`   Trends: http://localhost:${PORT}/api/trends?country=usa`);
  console.log(`   Leaderboard: http://localhost:${PORT}/api/leaderboard?country=usa&itemType=Ingredients`);
  console.log(`   SNS: http://localhost:${PORT}/api/real/sns-platform/popular?country=usa`);
  console.log(`   Workflow: POST http://localhost:${PORT}/api/workflow/run`);
  console.log('');
});
