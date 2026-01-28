/**
 * K-Beauty Atlas Server
 * MongoDB Atlas와 연결하여 K-Beauty 신제품 동향 데이터 제공
 * 포트: 5002 (기존 시스템과 독립적으로 운영)
 */

import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 상위 디렉토리의 .env 파일 로드
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.KBEAUTY_PORT || 5002;

// MongoDB Atlas 연결 설정
const ATLAS_URI = process.env.MONGODB_ATLAS_URI || 'mongodb+srv://username:password@cluster.mongodb.net/';
const DB_NAME = 'amore_trend_db';

let db = null;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Atlas 연결
async function connectAtlas() {
  try {
    const client = new MongoClient(ATLAS_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`✅ MongoDB Atlas 연결 성공 (DB: ${DB_NAME})`);
    return db;
  } catch (error) {
    console.error('❌ MongoDB Atlas 연결 실패:', error.message);
    return null;
  }
}

// K-Beauty 브랜드 제품 컬렉션 매핑 (GitHub 원본과 동일)
const KBEAUTY_PRODUCT_COLLECTIONS = {
  'TIRTIR': 'raw_tirtir_products',
  'Medicube': 'raw_medicube_products',
  'Beauty of Joseon': 'raw_beautyofjoseon_products',
  'Laneige': 'raw_laneige_products',
  'COSRX': 'raw_cosrx_products',
  'SKIN1004': 'raw_skin1004_products',
  'BIODANCE': 'raw_biodance_products'
};

/**
 * 제품 카테고리 통합 (브랜드별 필드명 차이 처리)
 */
function getProductCategory(product) {
  if (product.category) {
    return Array.isArray(product.category) ? product.category[0] : product.category;
  }
  if (product.categories && product.categories.length > 0) {
    return product.categories[0];
  }
  if (product.product_lines && product.product_lines.length > 0) {
    return product.product_lines[0];
  }
  return 'Skincare';
}

/**
 * 제품 정보 정규화 (GitHub 원본과 동일)
 */
function normalizeProduct(product, brandName) {
  // 성분 정보 추출
  let keyIngredients = [];
  if (product.key_ingredients) {
    keyIngredients = Array.isArray(product.key_ingredients) ? product.key_ingredients : [product.key_ingredients];
  } else if (product.featured_ingredients) {
    keyIngredients = Array.isArray(product.featured_ingredients) ? product.featured_ingredients : [product.featured_ingredients];
  }

  // 효능/고민 정보 추출
  let concerns = [];
  if (product.concerns) {
    concerns = Array.isArray(product.concerns) ? product.concerns : [product.concerns];
  } else if (product.skin_concerns) {
    concerns = Array.isArray(product.skin_concerns) ? product.skin_concerns : [product.skin_concerns];
  }

  // 효과/혜택 정보 추출
  let benefits = [];
  if (product.key_benefits) {
    benefits = Array.isArray(product.key_benefits) ? product.key_benefits : [product.key_benefits];
  } else if (product.product_benefits) {
    benefits = Array.isArray(product.product_benefits) ? product.product_benefits : [product.product_benefits];
  }

  return {
    id: product._id?.toString() || product.product_id,
    name: product.product_name || product.name || 'Unknown Product',
    brand: brandName,
    price: product.price || '',
    category: getProductCategory(product),
    imageUrl: product.image_url || product.all_images?.[0] || '',
    productUrl: product.product_url || '',
    description: product.description || product.short_description || product.meta_description || '',
    keyIngredients: keyIngredients.filter(i => i && typeof i === 'string'),
    fullIngredients: product.full_ingredients || '',
    concerns: concerns.filter(c => c && typeof c === 'string'),
    benefits: benefits.filter(b => b && typeof b === 'string'),
    formulation: product.formulation || '',
    skinType: product.skin_type || product.skin_types || [],
    marketingPoints: product.marketing_points || product.marketing_highlights || product.marketing_headlines || [],
    tags: product.raw_tags || [],
    isNew: product.is_new === true,
    isBestSeller: product.is_best_selling === true,
    bestSellingRank: product.best_selling_rank || null,
    createdAt: product.created_at || null
  };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'K-Beauty Atlas Server',
    port: PORT,
    dbConnected: db !== null
  });
});

/**
 * K-Beauty 트렌드 분석용 데이터 집계
 * GET /api/real/kbeauty/trends-data
 */
app.get('/api/real/kbeauty/trends-data', async (req, res) => {
  try {
    const { category } = req.query;

    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    // 전체 브랜드 제품 수집
    const allProducts = [];
    const brandSummaries = [];

    for (const [brandName, collectionName] of Object.entries(KBEAUTY_PRODUCT_COLLECTIONS)) {
      try {
        const products = await db.collection(collectionName).find({}).toArray();
        const normalized = products.map(p => normalizeProduct(p, brandName));

        const newProducts = normalized.filter(p => p.isNew);
        const bestSellers = normalized.filter(p => p.isBestSeller);

        brandSummaries.push({
          brand: brandName,
          newProducts: newProducts.slice(0, 10).map(p => ({
            name: p.name,
            keyIngredients: p.keyIngredients,
            concerns: p.concerns,
            benefits: p.benefits,
            description: p.description
          })),
          bestSellers: bestSellers.slice(0, 5).map(p => ({
            name: p.name,
            keyIngredients: p.keyIngredients,
            concerns: p.concerns
          })),
          newCount: newProducts.length,
          bestCount: bestSellers.length
        });

        allProducts.push(...normalized);
      } catch (e) {
        console.error(`K-Beauty ${brandName} 로드 오류:`, e.message);
      }
    }

    // 카테고리 필터링
    const filteredProducts = category
      ? allProducts.filter(p => p.category && p.category.toLowerCase().includes(category.toLowerCase()))
      : allProducts;

    const newProducts = filteredProducts.filter(p => p.isNew);
    const bestSellers = filteredProducts.filter(p => p.isBestSeller);

    // 성분 트렌드 분석
    const ingredientStats = {};
    const concernStats = {};
    const benefitStats = {};

    for (const product of newProducts) {
      for (const ing of (product.keyIngredients || [])) {
        if (!ing) continue;
        const key = ing.toLowerCase();
        if (!ingredientStats[key]) ingredientStats[key] = { new: 0, best: 0 };
        ingredientStats[key].new++;
      }
      for (const concern of (product.concerns || [])) {
        if (!concern) continue;
        const key = concern.toLowerCase();
        if (!concernStats[key]) concernStats[key] = { new: 0, best: 0 };
        concernStats[key].new++;
      }
      for (const benefit of (product.benefits || [])) {
        if (!benefit) continue;
        const key = benefit.toLowerCase();
        if (!benefitStats[key]) benefitStats[key] = { new: 0, best: 0 };
        benefitStats[key].new++;
      }
    }

    for (const product of bestSellers) {
      for (const ing of (product.keyIngredients || [])) {
        if (!ing) continue;
        const key = ing.toLowerCase();
        if (!ingredientStats[key]) ingredientStats[key] = { new: 0, best: 0 };
        ingredientStats[key].best++;
      }
    }

    // 상위 항목 추출
    const topIngredients = Object.entries(ingredientStats)
      .map(([name, stats]) => ({ name, ...stats, total: stats.new + stats.best }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const topConcerns = Object.entries(concernStats)
      .map(([name, stats]) => ({ name, ...stats, total: stats.new + stats.best }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const topBenefits = Object.entries(benefitStats)
      .map(([name, stats]) => ({ name, ...stats, total: stats.new + stats.best }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    res.json({
      category: category || 'All',
      summary: {
        totalProducts: filteredProducts.length,
        newProducts: newProducts.length,
        bestSellers: bestSellers.length
      },
      brandSummaries,
      trends: {
        ingredients: topIngredients,
        concerns: topConcerns,
        benefits: topBenefits
      },
      sampleNewProducts: newProducts.slice(0, 100),
      sampleBestSellers: bestSellers.slice(0, 50)
    });

  } catch (error) {
    console.error('K-Beauty 트렌드 데이터 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * K-Beauty 성분별 제품 조회
 * GET /api/real/kbeauty/products-by-ingredient
 */
app.get('/api/real/kbeauty/products-by-ingredient', async (req, res) => {
  try {
    const { ingredient } = req.query;

    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    if (!ingredient) {
      return res.status(400).json({ error: 'ingredient parameter required' });
    }

    const products = [];
    const searchTerm = ingredient.toLowerCase();

    for (const [brandName, collectionName] of Object.entries(KBEAUTY_PRODUCT_COLLECTIONS)) {
      try {
        const brandProducts = await db.collection(collectionName).find({
          $or: [
            { key_ingredients: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
            { featured_ingredients: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
            { full_ingredients: { $regex: searchTerm, $options: 'i' } }
          ]
        }).toArray();

        for (const product of brandProducts) {
          products.push(normalizeProduct(product, brandName));
        }
      } catch (e) {
        console.error(`Error fetching from ${collectionName}:`, e.message);
      }
    }

    // 중복 제거 및 신제품 필터링
    const uniqueProducts = products.reduce((acc, curr) => {
      if (!acc.find(p => p.name === curr.name && p.brand === curr.brand)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    const newProductsOnly = uniqueProducts.filter(p => p.isNew === true);

    res.json({
      ingredient,
      products: newProductsOnly,
      totalCount: newProductsOnly.length
    });

  } catch (error) {
    console.error('K-Beauty 성분별 제품 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * K-Beauty 피부 고민별 제품 조회
 * GET /api/real/kbeauty/products-by-concern
 */
app.get('/api/real/kbeauty/products-by-concern', async (req, res) => {
  try {
    const { concern } = req.query;

    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    if (!concern) {
      return res.status(400).json({ error: 'concern parameter required' });
    }

    const products = [];

    const concernKeywords = {
      'sensitivity': ['sensitive', 'sensitivity', 'redness', 'irritation', 'calming', 'soothing'],
      'dryness': ['dryness', 'dry', 'hydrating', 'hydration', 'moisture', 'moisturizing'],
      'aging': ['anti-aging', 'aging', 'wrinkle', 'fine lines', 'firming', 'elasticity'],
      'acne': ['acne', 'blemish', 'breakout', 'pimple', 'trouble'],
      'pores': ['pore', 'pores', 'oily', 'sebum', 'blackhead'],
      'dullness': ['dullness', 'dull', 'brightening', 'radiance', 'glow', 'tone'],
      'dark_spots': ['dark spots', 'hyperpigmentation', 'pigmentation', 'spots', 'melasma']
    };

    const searchTerms = concernKeywords[concern.toLowerCase()] || [concern.toLowerCase()];

    for (const [brandName, collectionName] of Object.entries(KBEAUTY_PRODUCT_COLLECTIONS)) {
      try {
        const brandProducts = await db.collection(collectionName).find({
          $or: [
            { concerns: { $elemMatch: { $regex: searchTerms.join('|'), $options: 'i' } } },
            { skin_concerns: { $elemMatch: { $regex: searchTerms.join('|'), $options: 'i' } } },
            { key_benefits: { $elemMatch: { $regex: searchTerms.join('|'), $options: 'i' } } },
            { description: { $regex: searchTerms.join('|'), $options: 'i' } }
          ]
        }).toArray();

        for (const product of brandProducts) {
          products.push(normalizeProduct(product, brandName));
        }
      } catch (e) {
        console.error(`Error fetching from ${collectionName}:`, e.message);
      }
    }

    // 중복 제거 및 신제품 필터링
    const uniqueProducts = products.reduce((acc, curr) => {
      if (!acc.find(p => p.name === curr.name && p.brand === curr.brand)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    const newProductsOnly = uniqueProducts.filter(p => p.isNew === true);

    res.json({
      concern,
      searchTerms,
      products: newProductsOnly,
      totalCount: newProductsOnly.length
    });

  } catch (error) {
    console.error('K-Beauty 고민별 제품 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * K-Beauty 트렌드 AI 분석 (EXAONE GPU4 연동)
 * POST /api/llm/kbeauty-trends
 * llm_server_port4.py의 /api/llm/kbeauty-trends 엔드포인트로 직접 요청
 */
const LLM_SERVER_GPU4 = process.env.LLM_SERVER_GPU4 || 'http://localhost:5004';

app.post('/api/llm/kbeauty-trends', async (req, res) => {
  try {
    const { category, brandSummaries, trends, sampleNewProducts, sampleBestSellers } = req.body;

    // LLM 서버(GPU4)의 /api/llm/kbeauty-trends 엔드포인트로 직접 요청
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000); // 3분 타임아웃

    console.log(`[K-Beauty AI] LLM 서버로 분석 요청 중... (${LLM_SERVER_GPU4})`);

    const llmResponse = await fetch(`${LLM_SERVER_GPU4}/api/llm/kbeauty-trends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        brandSummaries,
        trends,
        sampleNewProducts,
        sampleBestSellers
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (llmResponse.ok) {
      const llmData = await llmResponse.json();
      console.log(`[K-Beauty AI] LLM 분석 완료`);

      // LLM 서버 응답을 그대로 전달
      res.json(llmData);
    } else {
      throw new Error(`LLM 서버 응답 오류: ${llmResponse.status}`);
    }

  } catch (error) {
    console.error('K-Beauty 트렌드 분석 오류:', error.message);

    // Fallback 응답 (LLM 서버 연결 실패 시)
    const { brandSummaries = [], trends = { ingredients: [], concerns: [] } } = req.body;
    res.json({
      success: true,
      category: req.body.category,
      brandStrategies: brandSummaries.slice(0, 4).map(b =>
        `${b.brand}: ${b.newCount}개 신제품 출시, 글로벌 시장 확대 전략`
      ),
      ingredientTrends: (trends.ingredients || []).slice(0, 3).map(i =>
        `${i.name}: 신제품 ${i.new}개에서 사용, K-Beauty 핵심 성분`
      ),
      functionTrends: (trends.concerns || []).slice(0, 3).map(c =>
        `${c.name}: ${c.new}개 제품이 타겟, 소비자 관심 증가`
      ),
      comparisonPoints: [
        '각 브랜드별 차별화된 성분 전략 보유',
        '기능성 중심의 제품 라인업 강화',
        '글로벌 시장 타겟 제품 확대'
      ],
      marketOutlook: `K-Beauty 시장은 혁신적인 성분과 기능성 제품이 주도하고 있습니다. (LLM 서버 연결 대기 중)`,
      fallback: true
    });
  }
});

/**
 * LLM 성분 상세 정보 (Mock)
 * POST /api/llm/ingredient-detail
 */
app.post('/api/llm/ingredient-detail', async (req, res) => {
  try {
    const { ingredient } = req.body;

    const ingredientInfo = {
      'Hyaluronic Acid': { description: '피부 수분을 1000배 끌어당기는 강력한 보습 성분', effects: ['보습', '수분 유지', '탄력'], skinTypes: ['모든 피부'], usage: '토너 후 세럼 단계에서 사용' },
      'Niacinamide': { description: '멜라닌 생성을 억제하고 피부 톤을 균일하게', effects: ['미백', '모공 케어', '피지 조절'], skinTypes: ['지성', '복합성'], usage: '아침저녁 세럼으로 사용' },
      'Retinol': { description: '검증된 안티에이징 성분의 대표주자', effects: ['주름 개선', '탄력', '세포 재생'], skinTypes: ['노화 피부'], usage: '저녁에만 사용, 자외선 차단 필수' },
      'Centella': { description: '피부 진정과 재생에 효과적인 전통 성분', effects: ['진정', '재생', '장벽 강화'], skinTypes: ['민감성', '트러블'], usage: '자극받은 피부에 집중 사용' },
      'Vitamin C': { description: '강력한 항산화와 브라이트닝 효과', effects: ['미백', '항산화', '콜라겐 생성'], skinTypes: ['칙칙한 피부'], usage: '아침 세럼으로 사용' }
    };

    const info = ingredientInfo[ingredient] || {
      description: `${ingredient}은(는) 스킨케어에서 중요한 역할을 하는 성분입니다.`,
      effects: ['피부 개선'],
      skinTypes: ['모든 피부'],
      usage: '제품 설명서에 따라 사용'
    };

    res.json({ success: true, ...info });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 서버 시작
async function startServer() {
  await connectAtlas();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 K-Beauty Atlas Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Trends: http://localhost:${PORT}/api/real/kbeauty/trends-data`);
    console.log(`   By Ingredient: http://localhost:${PORT}/api/real/kbeauty/products-by-ingredient?ingredient=Hyaluronic`);
    console.log(`   By Concern: http://localhost:${PORT}/api/real/kbeauty/products-by-concern?concern=acne`);
  });
}

startServer();
