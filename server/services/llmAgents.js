/**
 * LLM Multi-Agent 서비스 (Gemini 사용)
 * 각 Agent는 특정 작업을 담당
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 키 (amore 폴더에서 가져온 값)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAV1UstQpGv-_wXaYXfAPkH4ts1aHFuWBo';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 캐시 (실제로는 Redis 사용 권장)
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

/**
 * Agent 1: 성분 추출 Agent
 * 제품 설명에서 화장품 성분 추출
 */
export async function extractIngredients(productDescription) {
  const cacheKey = `ingredients:${productDescription.substring(0, 100)}`;
  
  // 캐시 확인
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an expert in cosmetic ingredients. 
Extract all cosmetic ingredients mentioned in the product description.
Return only a JSON object with an "ingredients" array containing ingredient names in Korean.
Example: {"ingredients": ["레티놀", "히알루론산", "나이아신아마이드"]}
If no ingredients found, return {"ingredients": []}.

Product description: ${productDescription}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // JSON 파싱
    let content = text.trim();
    if (content.startsWith("```json")) {
      content = content.replace("```json", "").replace("```", "").trim();
    } else if (content.startsWith("```")) {
      content = content.replace("```", "").trim();
    }
    
    const parsed = JSON.parse(content);
    const ingredients = parsed.ingredients || [];
    
    // 캐시 저장
    cache.set(cacheKey, {
      data: ingredients,
      timestamp: Date.now()
    });
    
    return ingredients;
  } catch (error) {
    console.error('Error extracting ingredients:', error);
    return [];
  }
}

/**
 * Agent 2: 키워드 분류 Agent
 * 키워드를 성분/제형/효과/Visual로 분류
 */
export async function classifyKeyword(keyword) {
  const cacheKey = `classify:${keyword}`;
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Classify the keyword into one of these categories:
- ingredient: cosmetic ingredients (e.g., 레티놀, 히알루론산, 나이아신아마이드)
- formula: product forms/textures (e.g., 앰플, 크림, 세럼, 토너, 패드)
- effect: effects/benefits (e.g., 모공 케어, 장벽 강화, 미백, 진정)
- visual: visual/mood elements (e.g., 미니어처, 매트 텍스처, 럭셔리)

Return only the category name in lowercase.

Keyword: ${keyword}`;
    
    const result = await model.generateContent(prompt);
    const category = result.response.text().trim().toLowerCase();
    
    // 캐시 저장
    cache.set(cacheKey, {
      data: category,
      timestamp: Date.now()
    });
    
    return category;
  } catch (error) {
    console.error('Error classifying keyword:', error);
    return 'unknown';
  }
}

/**
 * Agent 3: 감성 분석 Agent
 * 리뷰 감성 분석 및 긍정/부정 키워드 추출
 */
export async function analyzeSentiment(reviews) {
  if (!reviews || reviews.length === 0) {
    return { positive: [], negative: [] };
  }
  
  const batchSize = 50; // 한 번에 처리할 리뷰 수
  const batches = [];
  
  for (let i = 0; i < reviews.length; i += batchSize) {
    batches.push(reviews.slice(i, i + batchSize));
  }
  
  try {
    const results = await Promise.all(
      batches.map(async (batch, batchIndex) => {
        const cacheKey = `sentiment:${batch.map(r => r.reviewId || r._id).join(',')}`;
        
        if (cache.has(cacheKey)) {
          const cached = cache.get(cacheKey);
          if (Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
          }
        }
        
        const reviewTexts = batch.map(r => r.content || r.review || '').filter(Boolean);
        if (reviewTexts.length === 0) {
          return { positive: [], negative: [] };
        }
        
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: `Analyze sentiment of these cosmetic product reviews.
              Extract positive and negative keywords that appear frequently.
              Return JSON format:
              {
                "positive": [{"keyword": "string", "count": number}],
                "negative": [{"keyword": "string", "count": number}]
              }
              
              Focus on cosmetic-related keywords like effects, feelings, results.
              Return top 10 keywords for each sentiment.`
            },
            {
              role: 'user',
              content: reviewTexts.join('\n---\n')
            }
          ],
          response_format: { type: 'json_object' }
        });
        
        const result = JSON.parse(response.choices[0].message.content);
        
        // 캐시 저장
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
      })
    );
    
    // 결과 합치기
    const merged = {
      positive: {},
      negative: {}
    };
    
    results.forEach(result => {
      if (result.positive) {
        result.positive.forEach(kw => {
          merged.positive[kw.keyword] = (merged.positive[kw.keyword] || 0) + (kw.count || 1);
        });
      }
      if (result.negative) {
        result.negative.forEach(kw => {
          merged.negative[kw.keyword] = (merged.negative[kw.keyword] || 0) + (kw.count || 1);
        });
      }
    });
    
    return {
      positive: Object.entries(merged.positive)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20), // 상위 20개
      negative: Object.entries(merged.negative)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20) // 상위 20개
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { positive: [], negative: [] };
  }
}

/**
 * Agent 4: 효과 추출 Agent
 * 리뷰에서 특정 성분의 효과 추출
 */
export async function extractEffects(reviews, ingredient) {
  if (!reviews || reviews.length === 0) {
    return { effects: [] };
  }
  
  const cacheKey = `effects:${ingredient}:${reviews.map(r => r.reviewId || r._id).join(',')}`;
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  try {
    // 리뷰 텍스트만 추출 (최대 20개)
    const reviewTexts = reviews
      .slice(0, 20)
      .map(r => r.content || r.review || '')
      .filter(Boolean);
    
    if (reviewTexts.length === 0) {
      return { effects: [] };
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `Extract effects mentioned for "${ingredient}" in these cosmetic product reviews.
          Group similar effects together.
          Return JSON format:
          {
            "effects": [
              {
                "effect": "string (e.g., 모공 케어, 장벽 강화)",
                "frequency": number,
                "sentiment": "positive" | "negative" | "neutral",
                "exampleReviews": ["review text 1", "review text 2"]
              }
            ]
          }
          
          Focus on cosmetic effects and benefits. Return top 5 effects.`
        },
        {
          role: 'user',
          content: reviewTexts.join('\n---\n')
        }
      ],
      response_format: { type: 'json_object' }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    // 캐시 저장
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Error extracting effects:', error);
    return { effects: [] };
  }
}

/**
 * Agent 5: 조합 분석 Agent
 * 성분 조합의 시너지 분석
 */
export async function analyzeCombination(ingredients, reviews) {
  if (!ingredients || ingredients.length === 0 || !reviews || reviews.length === 0) {
    return {
      combination: ingredients.join(' + '),
      reason: '데이터 부족으로 분석 불가',
      synergyScore: 0.5
    };
  }
  
  const cacheKey = `combination:${ingredients.sort().join(',')}:${reviews.length}`;
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  try {
    const reviewTexts = reviews
      .slice(0, 30)
      .map(r => r.content || r.review || '')
      .filter(Boolean)
      .join('\n---\n');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `Analyze the synergy of these ingredient combinations: ${ingredients.join(' + ')}
          Based on the reviews, explain why this combination works well together.
          Return JSON format:
          {
            "combination": "string (e.g., 레티놀 + 앰플 + 모공 케어)",
            "reason": "string (detailed explanation in Korean)",
            "synergyScore": number (0-1, where 1 is perfect synergy)
          }
          
          Provide a detailed explanation in Korean about how these ingredients work together.`
        },
        {
          role: 'user',
          content: reviewTexts
        }
      ],
      response_format: { type: 'json_object' }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    // 캐시 저장
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Error analyzing combination:', error);
    return {
      combination: ingredients.join(' + '),
      reason: '분석 중 오류 발생',
      synergyScore: 0.5
    };
  }
}

/**
 * Helper: 성분 언급 확인
 * 리뷰에서 특정 성분 언급 여부 확인 (배치 처리)
 */
export async function checkIngredientMentions(reviews, ingredient) {
  if (!reviews || reviews.length === 0) {
    return [];
  }
  
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < reviews.length; i += batchSize) {
    batches.push(reviews.slice(i, i + batchSize));
  }
  
  const results = await Promise.all(
    batches.map(async (batch) => {
      const reviewTexts = batch.map(r => r.content || r.review || '').filter(Boolean);
      
      if (reviewTexts.length === 0) {
        return batch.map(() => false);
      }
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: `Check if "${ingredient}" is mentioned in each review.
              Return JSON array of booleans: [true, false, true, ...]
              true if ingredient is mentioned, false otherwise.`
            },
            {
              role: 'user',
              content: reviewTexts.map((text, idx) => `Review ${idx + 1}: ${text}`).join('\n---\n')
            }
          ],
          response_format: { type: 'json_object' }
        });
        
        const result = JSON.parse(response.choices[0].message.content);
        return result.mentions || batch.map(() => false);
      } catch (error) {
        console.error('Error checking ingredient mentions:', error);
        return batch.map(() => false);
      }
    })
  );
  
  return results.flat();
}

/**
 * Helper: 성분 언급 수 집계
 */
export async function countIngredientMentions(reviews, ingredient) {
  const mentions = await checkIngredientMentions(reviews, ingredient);
  return mentions.filter(Boolean).length;
}

