# DB 변수 매핑 및 LLM 기반 처리 전략

## 📊 현재 DB 변수 → UI 기능 매핑

### 1. 기본 DB 변수 (Raw 데이터)

```javascript
// raw_reviews 컬렉션
{
  reviewId: String,           // 리뷰 ID
  productId: String,          // 제품 ID
  productName: String,        // 제품명
  brand: String,              // 브랜드
  content: String,            // 리뷰 텍스트 (원본)
  rating: Number,             // 평점 (1-5)
  helpful: Number,            // 도움됨 수
  images: [String],           // 리뷰 이미지
  postedAt: Date,             // 작성 시간
  country: String            // 국가
}

// raw_retail_sales 컬렉션
{
  productId: String,          // 제품 ID
  productName: String,        // 제품명
  brand: String,              // 브랜드
  category: String,           // 카테고리
  salesRank: Number,          // 판매 순위 ⭐
  salesVolume: Number,        // 판매량
  revenue: Number,            // 매출
  price: Number,              // 가격
  description: String,        // 제품 설명 ⭐ (LLM 처리 대상)
  specifications: Object,     // 제품 사양
  date: Date,                 // 데이터 기준일
  country: String
}

// raw_sns_posts 컬렉션
{
  postId: String,            // 게시물 ID
  content: String,           // 게시물 텍스트 (원본)
  hashtags: [String],       // 해시태그
  mentions: [String],        // 멘션
  likes: Number,             // 좋아요 수
  comments: Number,          // 댓글 수
  shares: Number,            // 공유 수
  postedAt: Date,            // 게시 시간
  country: String
}
```

---

## 🎯 성분 트렌드 리더보드 구축 전략

### 변수 활용 방법

#### **1. 성분별 제품 랭킹 집계**

```javascript
// 성분이 포함된 제품들의 랭킹 집계
async function aggregateIngredientRanking(ingredient, country, startDate, endDate) {
  // 1. 해당 성분이 포함된 제품 찾기 (LLM으로 제품 설명 분석)
  const productsWithIngredient = await findProductsByIngredient(
    ingredient, 
    country, 
    startDate, 
    endDate
  );
  
  // 2. 각 제품의 랭킹 데이터 집계
  const rankingData = await db.raw_retail_sales.aggregate([
    {
      $match: {
        productId: { $in: productsWithIngredient.map(p => p.productId) },
        country: country,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          week: { $week: "$date" },
          productId: "$productId"
        },
        avgRank: { $avg: "$salesRank" },        // 평균 랭킹
        bestRank: { $min: "$salesRank" },        // 최고 랭킹
        rankCount: { $sum: 1 },                  // 랭킹 데이터 개수
        totalSales: { $sum: "$salesVolume" }     // 총 판매량
      }
    },
    {
      $group: {
        _id: "$_id.week",
        ingredientScore: {
          $avg: {
            $subtract: [1000, "$avgRank"]  // 랭킹이 낮을수록 점수 높음
          }
        },
        productCount: { $sum: 1 },
        totalSales: { $sum: "$totalSales" }
      }
    }
  ]).toArray();
  
  return rankingData;
}
```

#### **2. 리뷰에서 성분 언급 수 집계**

```javascript
// 리뷰에서 성분 언급 횟수 집계
async function aggregateIngredientMentions(ingredient, country, startDate, endDate) {
  // LLM으로 리뷰에서 성분 언급 여부 확인
  const reviews = await db.raw_reviews.find({
    country: country,
    postedAt: { $gte: startDate, $lte: endDate }
  }).toArray();
  
  // LLM Agent로 성분 언급 여부 확인
  const mentionCounts = await Promise.all(
    reviews.map(async (review) => {
      const hasIngredient = await llmAgent.checkIngredientMention(
        review.content,
        ingredient
      );
      return hasIngredient ? 1 : 0;
    })
  );
  
  const totalMentions = mentionCounts.reduce((sum, count) => sum + count, 0);
  
  return {
    ingredient,
    totalMentions,
    reviewCount: reviews.length,
    mentionRate: totalMentions / reviews.length
  };
}
```

#### **3. 성분 효과 추출 (리뷰 기반)**

```javascript
// 리뷰에서 성분의 효과 추출
async function extractIngredientEffects(ingredient, country, startDate, endDate) {
  const reviews = await db.raw_reviews.find({
    country: country,
    postedAt: { $gte: startDate, $lte: endDate },
    // LLM으로 필터링된 리뷰만 (성분 언급 있는 리뷰)
  }).toArray();
  
  // LLM Agent로 효과 추출
  const effects = await llmAgent.extractEffects(
    reviews.map(r => r.content),
    ingredient
  );
  
  return {
    ingredient,
    effects: effects.map(e => ({
      effect: e.effect,              // '모공 케어', '장벽 강화', ...
      frequency: e.frequency,        // 언급 빈도
      sentiment: e.sentiment,        // 'positive', 'negative', 'neutral'
      examples: e.exampleReviews     // 예시 리뷰
    }))
  };
}
```

---

## 🔄 UI 기능별 변수 매핑

### **1. 리더보드 (SegmentedLeaderboard)**

```javascript
// 필요한 변수
const leaderboardData = {
  country: 'usa',
  mainCategory: 'Skincare',
  itemType: 'Ingredients',  // 'Ingredients', 'Texture', 'Effects', 'Visual/Mood', 'Combined'
  trendLevel: 'Actionable', // 'Actionable', 'Growing', 'Early'
  items: [
    {
      rank: 1,
      keyword: '레티놀',
      score: 98,  // 계산된 점수
      change: 12.5  // 전주 대비 변화
    }
  ]
};

// 점수 계산 공식
function calculateLeaderboardScore(ingredient, country, period) {
  // 1. 제품 랭킹 점수 (40%)
  const rankingScore = calculateRankingScore(ingredient, country, period);
  
  // 2. 리뷰 언급 수 점수 (30%)
  const mentionScore = calculateMentionScore(ingredient, country, period);
  
  // 3. SNS 언급 수 점수 (20%)
  const snsScore = calculateSNSScore(ingredient, country, period);
  
  // 4. 효과 언급 점수 (10%) - LLM으로 추출된 효과 빈도
  const effectScore = calculateEffectScore(ingredient, country, period);
  
  const totalScore = 
    rankingScore * 0.4 +
    mentionScore * 0.3 +
    snsScore * 0.2 +
    effectScore * 0.1;
  
  return totalScore;
}

// 제품 랭킹 점수 계산
function calculateRankingScore(ingredient, country, period) {
  // 해당 성분이 포함된 제품들의 평균 랭킹
  // 랭킹이 낮을수록 (1위에 가까울수록) 점수 높음
  const avgRank = getAverageRanking(ingredient, country, period);
  return Math.max(0, 100 - (avgRank - 1) * 2);  // 1위 = 100점, 50위 = 0점
}

// 리뷰 언급 수 점수 계산
function calculateMentionScore(ingredient, country, period) {
  const mentions = getMentionCount(ingredient, country, period);
  const totalReviews = getTotalReviewCount(country, period);
  const mentionRate = mentions / totalReviews;
  return Math.min(100, mentionRate * 1000);  // 10% 언급률 = 100점
}
```

### **2. 트렌드 카드 (TrendCard)**

```javascript
// 필요한 변수
const trendData = {
  rank: 1,
  category: 'Skincare',
  combination: '레티놀 + 앰플 + 모공 케어',
  status: '🚀 Actionable Trend',
  signals: [
    {
      type: 'SNS',
      data: [
        { name: 'Week 1', value: 45 },  // LLM으로 추출된 언급 수
        { name: 'Week 2', value: 52 },
        // ...
      ]
    },
    {
      type: 'Retail',
      data: [
        { name: 'Week 1', value: 38 },  // 제품 랭킹 기반 점수
        // ...
      ]
    },
    {
      type: 'Review',
      data: [
        { name: 'Week 1', value: 42 },  // 리뷰 언급 수
        // ...
      ]
    }
  ],
  metrics: [
    { label: '성장률', value: 32.5, unit: '%' },      // 랭킹/언급 수 변화율
    { label: 'SNS 언급', value: 95, unit: '%' },      // LLM 추출
    { label: '판매 증가', value: 28.3, unit: '%' },   // 랭킹 기반
    { label: '긍정 리뷰', value: 92.5, unit: '%' },    // LLM 감성 분석
    { label: '시장 점유', value: 18.7, unit: '%' },   // 랭킹 기반
    { label: '인지도', value: 75.2, unit: '%' }       // 종합 점수
  ]
};
```

### **3. 리뷰 키워드 패널 (ReviewKeywordsPanel)**

```javascript
// 필요한 변수 (LLM으로 추출)
const reviewKeywords = {
  positive: [
    { keyword: '효과 좋아요', count: 1250 },      // LLM 감성 분석 + 키워드 추출
    { keyword: '피부가 좋아졌어요', count: 890 },
    // ...
  ],
  negative: [
    { keyword: '자극 있어요', count: 120 },
    { keyword: '효과 없어요', count: 85 },
    // ...
  ]
};
```

---

## 🤖 LLM Multi-Agent 구조

### Agent 역할 분담

```javascript
// 1. Ingredient Extractor Agent
// 역할: 제품 설명에서 성분 추출
const ingredientExtractorAgent = {
  name: 'ingredient-extractor',
  task: 'Extract cosmetic ingredients from product descriptions',
  input: 'product description text',
  output: {
    ingredients: ['레티놀', '히알루론산', ...],
    confidence: 0.95
  },
  llmConfig: {
    model: 'gpt-4o-mini',
    temperature: 0.1,  // 낮은 온도로 정확도 높임
    systemPrompt: `You are an expert in cosmetic ingredients. 
    Extract all cosmetic ingredients mentioned in the product description.
    Return only the ingredient names in Korean.`
  }
};

// 2. Keyword Classifier Agent
// 역할: 키워드를 성분/제형/효과/Mood로 분류
const keywordClassifierAgent = {
  name: 'keyword-classifier',
  task: 'Classify keywords into categories',
  input: 'keyword text',
  output: {
    category: 'ingredient' | 'formula' | 'effect' | 'visual',
    confidence: 0.92
  },
  llmConfig: {
    model: 'gpt-4o-mini',
    temperature: 0.2,
    systemPrompt: `Classify the keyword into one of these categories:
    - ingredient: cosmetic ingredients (e.g., 레티놀, 히알루론산)
    - formula: product forms (e.g., 앰플, 크림, 세럼)
    - effect: effects (e.g., 모공 케어, 장벽 강화)
    - visual: visual/mood (e.g., 미니어처, 매트 텍스처)
    Return only the category name.`
  }
};

// 3. Sentiment Analyzer Agent
// 역할: 리뷰 감성 분석 및 긍정/부정 키워드 추출
const sentimentAnalyzerAgent = {
  name: 'sentiment-analyzer',
  task: 'Analyze review sentiment and extract keywords',
  input: 'review text',
  output: {
    sentiment: 'positive' | 'negative' | 'neutral',
    positiveKeywords: ['효과 좋아요', '만족해요', ...],
    negativeKeywords: ['자극 있어요', '효과 없어요', ...],
    confidence: 0.88
  },
  llmConfig: {
    model: 'gpt-4o-mini',
    temperature: 0.3,
    systemPrompt: `Analyze the sentiment of this cosmetic product review.
    Extract positive and negative keywords.
    Return JSON format with sentiment and keyword arrays.`
  }
};

// 4. Effect Extractor Agent
// 역할: 리뷰에서 성분의 효과 추출
const effectExtractorAgent = {
  name: 'effect-extractor',
  task: 'Extract effects of specific ingredient from reviews',
  input: 'review texts + ingredient name',
  output: {
    effects: [
      {
        effect: '모공 케어',
        frequency: 45,
        sentiment: 'positive',
        exampleReviews: ['리뷰 텍스트 1', '리뷰 텍스트 2']
      },
      // ...
    ]
  },
  llmConfig: {
    model: 'gpt-4o',
    temperature: 0.2,
    systemPrompt: `Extract the effects mentioned for this ingredient in the reviews.
    Group similar effects together.
    Return effects with frequency and example reviews.`
  }
};

// 5. Combination Analyzer Agent
// 역할: 성분 조합 분석 및 꿀조합 판단
const combinationAnalyzerAgent = {
  name: 'combination-analyzer',
  task: 'Analyze ingredient combinations and their synergy',
  input: 'ingredient list + review texts',
  output: {
    combination: '레티놀 + 앰플 + 모공 케어',
    reason: '레티놀의 각질 제거 효과와 앰플의 고농축 전달력이...',
    synergyScore: 0.92
  },
  llmConfig: {
    model: 'gpt-4o',
    temperature: 0.4,
    systemPrompt: `Analyze the synergy of these ingredient combinations based on reviews.
    Explain why this combination works well together.
    Provide a synergy score from 0 to 1.`
  }
};
```

---

## 🔄 처리 파이프라인

### 전체 흐름도

```
1. Raw 데이터 수집
   ↓
2. LLM Agent 1: 성분 추출 (제품 설명)
   ↓
3. LLM Agent 2: 키워드 분류 (성분/제형/효과/Mood)
   ↓
4. 데이터 집계
   - 제품 랭킹 집계
   - 리뷰 언급 수 집계
   - SNS 언급 수 집계
   ↓
5. LLM Agent 3: 감성 분석 (리뷰)
   ↓
6. LLM Agent 4: 효과 추출 (리뷰)
   ↓
7. 트렌드 점수 계산
   ↓
8. LLM Agent 5: 조합 분석 (선택적)
   ↓
9. UI 표시용 데이터 생성
```

### 구현 코드

```javascript
// server/services/llmAgents.js

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Agent 1: 성분 추출
export async function extractIngredients(productDescription) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: `You are an expert in cosmetic ingredients. 
        Extract all cosmetic ingredients mentioned in the product description.
        Return only a JSON array of ingredient names in Korean.
        Example: ["레티놀", "히알루론산", "나이아신아마이드"]`
      },
      {
        role: 'user',
        content: productDescription
      }
    ],
    response_format: { type: 'json_object' }
  });
  
  const result = JSON.parse(response.choices[0].message.content);
  return result.ingredients || [];
}

// Agent 2: 키워드 분류
export async function classifyKeyword(keyword) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: `Classify the keyword into one category:
        - ingredient: cosmetic ingredients
        - formula: product forms
        - effect: effects
        - visual: visual/mood
        Return only the category name.`
      },
      {
        role: 'user',
        content: keyword
      }
    ]
  });
  
  return response.choices[0].message.content.trim();
}

// Agent 3: 감성 분석 및 키워드 추출
export async function analyzeSentiment(reviews) {
  const batchSize = 50;  // 한 번에 처리할 리뷰 수
  const batches = [];
  
  for (let i = 0; i < reviews.length; i += batchSize) {
    batches.push(reviews.slice(i, i + batchSize));
  }
  
  const results = await Promise.all(
    batches.map(async (batch) => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `Analyze sentiment of these cosmetic product reviews.
            Extract positive and negative keywords.
            Return JSON: {
              positive: [{keyword: string, count: number}],
              negative: [{keyword: string, count: number}]
            }`
          },
          {
            role: 'user',
            content: batch.map(r => r.content).join('\n---\n')
          }
        ],
        response_format: { type: 'json_object' }
      });
      
      return JSON.parse(response.choices[0].message.content);
    })
  );
  
  // 결과 합치기
  const merged = {
    positive: {},
    negative: {}
  };
  
  results.forEach(result => {
    result.positive?.forEach(kw => {
      merged.positive[kw.keyword] = (merged.positive[kw.keyword] || 0) + kw.count;
    });
    result.negative?.forEach(kw => {
      merged.negative[kw.keyword] = (merged.negative[kw.keyword] || 0) + kw.count;
    });
  });
  
  return {
    positive: Object.entries(merged.positive)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count),
    negative: Object.entries(merged.negative)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
  };
}

// Agent 4: 효과 추출
export async function extractEffects(reviews, ingredient) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: `Extract effects mentioned for "${ingredient}" in these reviews.
        Group similar effects together.
        Return JSON: {
          effects: [{
            effect: string,
            frequency: number,
            sentiment: "positive" | "negative" | "neutral",
            exampleReviews: [string]
          }]
        }`
      },
      {
        role: 'user',
        content: reviews.map(r => r.content).join('\n---\n')
      }
    ],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}

// Agent 5: 조합 분석
export async function analyzeCombination(ingredients, reviews) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: `Analyze the synergy of these ingredient combinations: ${ingredients.join(' + ')}
        Based on the reviews, explain why this combination works well.
        Return JSON: {
          combination: string,
          reason: string,
          synergyScore: number (0-1)
        }`
      },
      {
        role: 'user',
        content: reviews.map(r => r.content).join('\n---\n')
      }
    ],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

---

## 📝 실제 사용 예시

### 성분 트렌드 리더보드 생성

```javascript
// server/routes/trends.js

import { extractIngredients, classifyKeyword, analyzeSentiment, extractEffects } from '../services/llmAgents.js';

// 성분 리더보드 생성
export async function generateIngredientLeaderboard(country, category, period) {
  // 1. 해당 기간의 모든 제품 조회
  const products = await db.raw_retail_sales.find({
    country,
    category,
    date: { $gte: period.start, $lte: period.end }
  }).toArray();
  
  // 2. 각 제품에서 성분 추출 (LLM Agent 1)
  const ingredientMap = new Map();
  
  for (const product of products) {
    const ingredients = await extractIngredients(product.description);
    
    ingredients.forEach(ingredient => {
      if (!ingredientMap.has(ingredient)) {
        ingredientMap.set(ingredient, {
          ingredient,
          products: [],
          totalMentions: 0,
          totalReviews: 0
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
    });
  }
  
  // 3. 각 성분별 점수 계산
  const scores = await Promise.all(
    Array.from(ingredientMap.entries()).map(async ([ingredient, data]) => {
      // 제품 랭킹 점수
      const avgRank = data.products.reduce((sum, p) => sum + p.salesRank, 0) / data.products.length;
      const rankingScore = Math.max(0, 100 - (avgRank - 1) * 2);
      
      // 리뷰 언급 수
      const reviews = await db.raw_reviews.find({
        productId: { $in: data.products.map(p => p.productId) },
        country,
        postedAt: { $gte: period.start, $lte: period.end }
      }).toArray();
      
      // LLM으로 성분 언급 확인
      const mentionCount = await countIngredientMentions(reviews, ingredient);
      const mentionScore = (mentionCount / reviews.length) * 1000;
      
      // 효과 추출 (LLM Agent 4)
      const effects = await extractEffects(reviews, ingredient);
      
      // 종합 점수
      const totalScore = rankingScore * 0.4 + mentionScore * 0.3 + (effects.effects.length * 10) * 0.3;
      
      return {
        ingredient,
        score: totalScore,
        rankingScore,
        mentionScore,
        effects: effects.effects,
        productCount: data.products.length,
        reviewCount: reviews.length
      };
    })
  );
  
  // 4. 점수 순으로 정렬
  scores.sort((a, b) => b.score - a.score);
  
  // 5. 리더보드 형식으로 변환
  return scores.map((item, index) => ({
    rank: index + 1,
    keyword: item.ingredient,
    score: Math.round(item.score),
    change: 0,  // 전주 대비 (추후 계산)
    metadata: {
      productCount: item.productCount,
      reviewCount: item.reviewCount,
      effects: item.effects
    }
  }));
}
```

---

## 💡 최적화 팁

### 1. LLM 호출 최소화
- 배치 처리: 여러 리뷰를 한 번에 처리
- 캐싱: 이미 처리된 제품/리뷰는 캐시 사용
- 병렬 처리: 여러 Agent 동시 실행

### 2. 비용 절감
- 간단한 작업: gpt-4o-mini 사용
- 복잡한 작업: gpt-4o 사용
- 프롬프트 최적화: 토큰 수 최소화

### 3. 성능 향상
- 비동기 처리: Promise.all 사용
- 큐 시스템: 대량 작업은 큐로 처리
- 결과 저장: 처리 결과를 DB에 저장하여 재사용

