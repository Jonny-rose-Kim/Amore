/**
 * API 서비스 - 실제 백엔드 API 호출
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface LeaderboardItem {
  rank: number;
  keyword: string;
  score: number;
  change?: number;
  trendLevel?: string;
  metadata?: {
    productCount?: number;
    trendCount?: number;
    effects?: string[];
  };
}

export interface ReviewCountData {
  country: string;
  keyword?: string;
  period: string;
  data: { name: string; value: number }[];
}

export interface SNSPlatformData {
  country: string;
  platforms: {
    platform: string;
    keywords: {
      name: string;
      value: number;
      change: number;
      type: 'ingredient' | 'formula' | 'effect';
    }[];
  }[];
}

export interface CombinationLeaderboardItem {
  rank: number;
  combination: string;
  ingredients: string[];
  formulas: string[];
  effects: string[];
  moods: string[];
  score: number;
  category: string;
  mainCategory: string;
  avgRank: number;
  productCount: number;
  signals: {
    SNS: number;
    Retail: number;
    Review: number;
  };
  synergyScore: number;
}

export interface CombinationReviewKeywordItem {
  keyword: string;
  count: number;
  type: string;
}

export interface CombinationReviewKeywordsResult {
  positive: CombinationReviewKeywordItem[];
  negative: CombinationReviewKeywordItem[];
  totalPositive: number;
  totalNegative: number;
}

/**
 * 리더보드 데이터 조회
 */
export async function fetchLeaderboard(
  country: string = 'usa',
  category: string = 'Skincare',
  itemType: string = 'Ingredients',
  trendLevel: string = 'Actionable'
): Promise<LeaderboardItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/real/leaderboard?country=${country}&category=${category}&itemType=${itemType}&trendLevel=${trendLevel}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    console.error('리더보드 조회 오류:', error);
    // 오류 시 빈 배열 반환 (UI는 mock 데이터 사용)
    return [];
  }
}

/**
 * 리뷰 카운트 데이터 조회
 */
export async function fetchReviewCount(
  country: string = 'usa',
  keyword?: string,
  period: string = '8weeks'
): Promise<ReviewCountData> {
  try {
    const params = new URLSearchParams({
      country,
      period
    });
    if (keyword) params.append('keyword', keyword);
    
    const response = await fetch(`${API_BASE_URL}/real/reviews/count?${params}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('리뷰 카운트 조회 오류:', error);
    return {
      country,
      keyword,
      period,
      data: []
    };
  }
}

/**
 * SNS 플랫폼 순위 조회
 */
export async function fetchSNSPlatformRankings(
  country: string = 'usa'
): Promise<SNSPlatformData> {
  try {
    const response = await fetch(`${API_BASE_URL}/real/sns-platform/popular?country=${country}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('SNS 플랫폼 순위 조회 오류:', error);
    return {
      country,
      platforms: []
    };
  }
}

/**
 * 꿀조합 리더보드 조회
 */
export async function fetchCombinationLeaderboard(
  country: string = 'usa',
  category: string = 'Skincare'
): Promise<CombinationLeaderboardItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/real/combinations/leaderboard?country=${country}&category=${category}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    console.error('꿀조합 리더보드 조회 오류:', error);
    return [];
  }
}

/**
 * 꿀조합 리뷰 키워드 분석 (키워드별 긍정/부정 + 타입)
 */
export async function fetchCombinationReviewKeywords(
  country: string = 'usa',
  keywords: string[]
): Promise<CombinationReviewKeywordsResult> {
  try {
    const params = new URLSearchParams({ country, keywords: keywords.join(',') });
    const response = await fetch(`${API_BASE_URL}/real/combinations/review-keywords?${params}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('꿀조합 리뷰 키워드 분석 오류:', error);
    return { positive: [], negative: [], totalPositive: 0, totalNegative: 0 };
  }
}

/**
 * 꿀조합 리뷰 유형별 실제 리뷰 조회 (바 클릭 → 팝업)
 */
export async function fetchCombinationReviewsByType(
  country: string = 'usa',
  keywords: string[],
  reviewType: string,
  sentiment: string = 'positive',
  limit: number = 10
): Promise<ReviewDetail[]> {
  try {
    const params = new URLSearchParams({
      country,
      keywords: keywords.join(','),
      reviewType,
      sentiment,
      limit: String(limit)
    });
    const response = await fetch(`${API_BASE_URL}/real/combinations/reviews-by-type?${params}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error('리뷰 유형별 조회 오류:', error);
    return [];
  }
}

/**
 * 배치 작업 상태 확인
 */
export async function fetchBatchStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/batch/status`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('배치 상태 조회 오류:', error);
    return null;
  }
}

/**
 * 리뷰 감성 분석 (긍정/부정 카운트)
 */
export async function fetchReviewSentiment(
  country: string = 'usa',
  keyword?: string
): Promise<{ positive: number; negative: number; total: number }> {
  try {
    const params = new URLSearchParams({ country });
    if (keyword) params.append('keyword', keyword);
    const response = await fetch(`${API_BASE_URL}/real/reviews/sentiment?${params}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('리뷰 감성 분석 오류:', error);
    return { positive: 0, negative: 0, total: 0 };
  }
}

/**
 * 리뷰 상세 목록 (원본 리뷰)
 */
export interface ReviewDetail {
  keyword: string;
  sentiment: string;
  content: string;
  product: string;
  brand: string;
  rating: number;
  postedAt: string;
  source: string;
}

export async function fetchReviewDetails(
  country: string = 'usa',
  keyword?: string,
  sentiment?: string,
  limit: number = 10
): Promise<ReviewDetail[]> {
  try {
    const params = new URLSearchParams({ country, limit: String(limit) });
    if (keyword) params.append('keyword', keyword);
    if (sentiment) params.append('sentiment', sentiment);
    const response = await fetch(`${API_BASE_URL}/real/reviews/details?${params}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error('리뷰 상세 조회 오류:', error);
    return [];
  }
}

/**
 * 키워드 관련 제품 조회
 */
export interface ProductInfo {
  name: string;
  brand: string;
  description: string;
  score: number;
  rating: number;
  reviewCount: number;
  category: string;
  trendLevel: string;
  imageUrl?: string;
}

export async function fetchProductsByKeyword(
  keyword: string,
  country: string = 'usa'
): Promise<ProductInfo[]> {
  try {
    const params = new URLSearchParams({ keyword, country });
    const response = await fetch(`${API_BASE_URL}/real/products/by-keyword?${params}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('제품 조회 오류:', error);
    return [];
  }
}

/**
 * 트렌드 근거 데이터 (시계열 + PLC 예측)
 */
export interface TrendEvidenceData {
  weeksData: { week: string; Review: number; SNS: number; Retail: number }[];
  plcPrediction: { month: string; value: number; phase: string }[];
  trendLevel: string;
}

export async function fetchTrendEvidence(
  country: string = 'usa',
  keyword?: string
): Promise<TrendEvidenceData | null> {
  try {
    const params = new URLSearchParams({ country });
    if (keyword) params.append('keyword', keyword);
    const response = await fetch(`${API_BASE_URL}/real/trend-evidence?${params}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('트렌드 근거 조회 오류:', error);
    return null;
  }
}

/**
 * SNS 플랫폼 데이터 (DB 기반)
 */
export interface SNSPlatformDBData {
  platform: string;
  keywords: { name: string; value: number; change: number; type: string }[];
}

export async function fetchSNSPlatformData(
  country: string = 'usa',
  category: string = 'Skincare'
): Promise<SNSPlatformDBData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/real/sns-platform/data?country=${country}&category=${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.platforms || [];
  } catch (error) {
    console.error('SNS 플랫폼 데이터 조회 오류:', error);
    return [];
  }
}

/**
 * WhiteSpace 비교 제품 조회 (DB 기반)
 */
export interface WhitespaceProduct {
  name: string;
  brand: string;
  price: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  country: string;
  category: string;
  type: 'overseas' | 'korean';
}

export async function fetchWhitespaceProducts(
  country: string = 'usa',
  category: string = 'Skincare'
): Promise<{ overseas: WhitespaceProduct[]; korean: WhitespaceProduct[] }> {
  try {
    const params = new URLSearchParams({ country, category });
    const response = await fetch(`${API_BASE_URL}/real/whitespace/products?${params}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('WhiteSpace 제품 조회 오류:', error);
    return { overseas: [], korean: [] };
  }
}

// ===== LLM API Functions =====

export interface LLMReviewSummaryRequest {
  keyword: string;
  country: string;
  positiveKeywords: { keyword: string; count: number }[];
  negativeKeywords: { keyword: string; count: number }[];
  positiveCount: number;
  negativeCount: number;
  isCombination: boolean;
}

export interface LLMReviewSummaryResponse {
  success: boolean;
  summary: string;
  insights: string[];
  sentimentRatio: number;
  error?: string;
}

export async function fetchLLMReviewSummary(
  data: LLMReviewSummaryRequest
): Promise<LLMReviewSummaryResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/review-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'LLM server error');
  } catch (error) {
    console.error('LLM 리뷰 분석 오류:', error);
    return { success: false, summary: '', insights: [], sentimentRatio: 0.7, error: String(error) };
  }
}

export interface LLMSNSAnalysisRequest {
  country: string;
  category: string;
  platforms: { platform: string; keywords: { name: string; value: number }[] }[];
}

export interface LLMSNSAnalysisResponse {
  success: boolean;
  summary: string;
  insights: string[];
  recommendations: string[];
  error?: string;
}

export async function fetchLLMSNSAnalysis(
  data: LLMSNSAnalysisRequest
): Promise<LLMSNSAnalysisResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/sns-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'LLM server error');
  } catch (error) {
    console.error('LLM SNS 분석 오류:', error);
    return { success: false, summary: '', insights: [], recommendations: [], error: String(error) };
  }
}

// ===== Keyword AI Analysis LLM API Functions (GPU1 + GPU2) =====

export interface WhyTrendingRequest {
  keyword: string;
  country: string;
  category: string;
  trendLevel: string;
  score: number;
  signals: { SNS: number; Retail: number; Review: number };
  positiveKeywords?: string[];
}

export interface WhyTrendingData {
  success: boolean;
  explanation: string;
  keyFactors: string[];
  error?: string;
}

export interface PLCPredictionRequest {
  keyword: string;
  trendLevel: string;
  currentScore: number;
  snsGrowth: number;
  retailSignal: number;
  category: string;
}

export interface PLCPredictionData {
  success: boolean;
  currentPhase: string;
  prediction6m: string;
  prediction12m: string;
  monthlyScores: number[];
  explanation: string;
  error?: string;
}

export interface CountryStrategyRequest {
  keyword: string;
  country: string;
  category: string;
  keywordType: string;
  trendLevel: string;
  score: number;
  signals: { SNS: number; Retail: number; Review: number };
}

export interface CountryStrategyData {
  success: boolean;
  marketAnalysis: string;
  opportunities: string[];
  risks: string[];
  strategies: string[];
  actionPlan: string[];
  error?: string;
}

export async function fetchLLMKeywordWhy(
  data: WhyTrendingRequest
): Promise<WhyTrendingData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/keyword-why`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'LLM server error');
  } catch (error) {
    console.error('LLM 키워드 분석 오류:', error);
    return { success: false, explanation: '', keyFactors: [], error: String(error) };
  }
}

export async function fetchLLMPLCPrediction(
  data: PLCPredictionRequest
): Promise<PLCPredictionData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/plc-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'LLM server error');
  } catch (error) {
    console.error('LLM PLC 예측 오류:', error);
    return { success: false, currentPhase: '', prediction6m: '', prediction12m: '', monthlyScores: [], explanation: '', error: String(error) };
  }
}

export async function fetchLLMCountryStrategy(
  data: CountryStrategyRequest
): Promise<CountryStrategyData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/country-strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'LLM server error');
  } catch (error) {
    console.error('LLM 국가 전략 분석 오류:', error);
    return { success: false, marketAnalysis: '', opportunities: [], risks: [], strategies: [], actionPlan: [], error: String(error) };
  }
}

// ===== Category AI Analysis LLM API Functions (GPU0 + GPU1 + GPU2) =====

export interface CategoryTrendRequest {
  country: string;
  category: string;
  topKeywords: { keyword: string; score: number; trendLevel: string; type?: string }[];
}

export interface CategoryTrendData {
  success: boolean;
  explanation: string;
  keyFactors: string[];
  error?: string;
}

export interface CategoryPredictionRequest {
  country: string;
  category: string;
  topKeywords: { keyword: string; score: number; trendLevel: string }[];
  avgScore: number;
}

export interface CategoryPredictionData {
  success: boolean;
  currentPhase: string;
  prediction6m: string;
  prediction12m: string;
  monthlyScores: number[];
  explanation: string;
  error?: string;
}

export interface CategoryStrategyRequest {
  country: string;
  category: string;
  topKeywords: { keyword: string; score: number; type?: string }[];
  avgScore: number;
}

export interface CategoryStrategyData {
  success: boolean;
  marketAnalysis: string;
  opportunities: string[];
  risks: string[];
  strategies: string[];
  actionPlan: string[];
  error?: string;
}

export async function fetchLLMCategoryTrend(
  data: CategoryTrendRequest
): Promise<CategoryTrendData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/category-trend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'LLM server error');
  } catch (error) {
    console.error('LLM 카테고리 트렌드 분석 오류:', error);
    return { success: false, explanation: '', keyFactors: [], error: String(error) };
  }
}

export async function fetchLLMCategoryPrediction(
  data: CategoryPredictionRequest
): Promise<CategoryPredictionData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/category-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'LLM server error');
  } catch (error) {
    console.error('LLM 카테고리 예측 오류:', error);
    return { success: false, currentPhase: '', prediction6m: '', prediction12m: '', monthlyScores: [], explanation: '', error: String(error) };
  }
}

// ===== RAG Insight API =====

export interface RAGInsightRequest {
  scope: 'keyword' | 'category';
  type: 'marketing' | 'npd' | 'overseas';
  keyword?: string;
  category: string;
  country: string;
  topKeywords?: { keyword: string; score?: number; trendLevel?: string }[];
}

export interface RAGInsightResponse {
  success: boolean;
  content: string;
  scope: string;
  type: string;
  keyword?: string;
  category: string;
  country: string;
  ragSources?: { title: string; source: string }[];
  error?: string;
}

export async function fetchRAGInsight(
  data: RAGInsightRequest
): Promise<RAGInsightResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/rag-insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'RAG Insight server error');
  } catch (error) {
    console.error('RAG Insight 생성 오류:', error);
    return { success: false, content: '', scope: data.scope, type: data.type, category: data.category, country: data.country, error: String(error) };
  }
}

// ===== WhiteSpace AI Analysis API Functions (GPU1 + GPU2) =====

export interface WhitespaceProductRequest {
  overseasProduct: { name: string; brand: string; category: string; price: string; rating: number; reviewCount: number };
  domesticProduct: { name: string; brand: string; category: string; price: string; rating: number; reviewCount: number };
  country: string;
  category: string;
}

export interface WhitespaceProductResponse {
  success: boolean;
  overseasSummary: string;
  domesticSummary: string;
  agentInsight: {
    title: string;
    points: string[];
    summary: string;
  };
  error?: string;
}

export interface WhitespaceCategoryRequest {
  country: string;
  category: string;
  overseasProducts: { name: string; brand: string; price: string; rating: number }[];
  koreanProducts: { name: string; brand: string; price: string; rating: number }[];
}

export interface WhitespaceCategoryResponse {
  success: boolean;
  title: string;
  points: string[];
  summary: string;
  error?: string;
}

export async function fetchWhitespaceProductAnalysis(
  data: WhitespaceProductRequest
): Promise<WhitespaceProductResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/whitespace-product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'LLM server error');
  } catch (error) {
    console.error('WhiteSpace 제품 비교 분석 오류:', error);
    return { success: false, overseasSummary: '', domesticSummary: '', agentInsight: { title: '', points: [], summary: '' }, error: String(error) };
  }
}

export async function fetchWhitespaceCategoryInsight(
  data: WhitespaceCategoryRequest
): Promise<WhitespaceCategoryResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/whitespace-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'LLM server error');
  } catch (error) {
    console.error('WhiteSpace 카테고리 인사이트 오류:', error);
    return { success: false, title: '', points: [], summary: '', error: String(error) };
  }
}

// ===== Chat API Functions (GPU3 VLM Chatbot) =====

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  image?: string;
  timestamp: number;
}

export interface ChatTextRequest {
  message: string;
  sessionId: string;
}

export interface ChatMultimodalRequest {
  message: string;
  image: string;
  sessionId: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  sessionId?: string;
  error?: string;
}

export async function sendChatMessage(data: ChatTextRequest): Promise<ChatResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/chat/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return await response.json();
  } catch (error) {
    console.error('Chat 메시지 전송 오류:', error);
    return { success: false, response: '', error: String(error) };
  }
}

export async function sendChatMultimodal(data: ChatMultimodalRequest): Promise<ChatResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);
    const response = await fetch(`${API_BASE_URL}/chat/multimodal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return await response.json();
  } catch (error) {
    console.error('Chat 멀티모달 전송 오류:', error);
    return { success: false, response: '', error: String(error) };
  }
}

export async function fetchLLMCategoryStrategy(
  data: CategoryStrategyRequest
): Promise<CategoryStrategyData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${API_BASE_URL}/llm/category-strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await response.json();
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'LLM server error');
  } catch (error) {
    console.error('LLM 카테고리 전략 분석 오류:', error);
    return { success: false, marketAnalysis: '', opportunities: [], risks: [], strategies: [], actionPlan: [], error: String(error) };
  }
}

