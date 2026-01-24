import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { SNSTopIngredient, Country } from '../data/mockData';
import { motion } from 'framer-motion';
import { Instagram, Music, Youtube, ShoppingBag, Store, Sparkles, Loader2 } from 'lucide-react';
import { getIntegratedAIAnalysis } from '../data/leaderboardData';
import { useState, useEffect } from 'react';
import ProductDetailModal from './ProductDetailModal';
import { fetchSNSPlatformData, fetchProductsByKeyword, fetchLLMSNSAnalysis, SNSPlatformDBData } from '../services/api';

interface SNSTopChartProps {
  data: SNSTopIngredient[];
  country?: Country;
  category?: string;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'Instagram':
      return Instagram;
    case 'TikTok':
      return Music;
    case 'YouTube':
      return Youtube;
    case 'Amazon':
      return ShoppingBag;
    case 'Shopee':
      return ShoppingBag;
    case 'Cosme':
      return Store;
    default:
      return Instagram;
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'Instagram':
      return { gradient: 'from-pink-500 to-rose-500', bar: '#ec4899' };
    case 'TikTok':
      return { gradient: 'from-cyan-500 to-blue-500', bar: '#06b6d4' };
    case 'YouTube':
      return { gradient: 'from-red-500 to-rose-500', bar: '#ef4444' };
    case 'Amazon':
      return { gradient: 'from-orange-500 to-amber-500', bar: '#f97316' };
    case 'Shopee':
      return { gradient: 'from-orange-500 to-red-500', bar: '#f97316' };
    case 'Cosme':
      return { gradient: 'from-pink-500 to-purple-500', bar: '#a855f7' };
    default:
      return { gradient: 'from-pink-500 to-rose-500', bar: '#ec4899' };
  }
};

export default function SNSTopChart({ data, country, category }: SNSTopChartProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<{ summary: string; insights: string[]; recommendations: string[] } | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<{ keyword: string; platform: string } | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [dbPlatforms, setDbPlatforms] = useState<SNSPlatformDBData[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbAdditionalInfo, setDbAdditionalInfo] = useState('');

  // DB에서 SNS 플랫폼 데이터 가져오기 (카테고리별)
  useEffect(() => {
    if (country) {
      fetchSNSPlatformData(country, category || 'Skincare').then(platforms => {
        if (platforms.length > 0) {
          setDbPlatforms(platforms);
        }
      });
    }
  }, [country, category]);

  // 실제 DB 데이터와 mock 데이터 병합
  const displayData = dbPlatforms.length > 0
    ? dbPlatforms.map(p => ({
        platform: p.platform,
        keywords: p.keywords.map(k => ({
          name: k.name,
          value: k.value,
          change: k.change,
          type: k.type
        }))
      }))
    : data;

  const getKoreanDescription = (keyword: string, platform: string, products: any[]) => {
    const productNames = products.slice(0, 3).map(p => p.name).join(', ');
    const topBrand = products[0]?.brand || 'K-Beauty';
    const reviewTotal = products.reduce((sum: number, p: any) => sum + (p.reviewCount || 0), 0);
    const avgRating = products.length > 0
      ? (products.reduce((sum: number, p: any) => sum + (p.rating || 4.5), 0) / products.length).toFixed(1)
      : '4.5';
    return `"${keyword}" 키워드는 ${platform}에서 높은 언급량과 검색량을 기록하고 있습니다. ` +
      `대표 제품으로는 ${productNames} 등이 있으며, ` +
      `평균 평점 ${avgRating}점, 총 리뷰 수 ${reviewTotal.toLocaleString()}개를 보유하고 있습니다. ` +
      `${topBrand} 브랜드가 해당 키워드에서 가장 높은 인기를 얻고 있으며, ` +
      `소비자들의 구매 전환율이 높은 트렌드 키워드입니다.`;
  };

  const handleBarClick = (keyword: string, platform: string) => {
    setSelectedKeyword({ keyword, platform });
    // DB에서 관련 제품 가져오기
    fetchProductsByKeyword(keyword, country).then(products => {
      if (products.length > 0) {
        setDbProducts(products.map((p, idx) => ({
          id: `db-product-${idx}`,
          name: p.name,
          brand: p.brand,
          image: p.imageUrl || `https://via.placeholder.com/200x200?text=${encodeURIComponent(p.brand)}`,
          salesRank: idx + 1,
          rating: p.rating?.toFixed(1) || '4.5',
          reviewCount: p.reviewCount || 0,
          popularityScore: p.score || 80,
        })));
        setDbAdditionalInfo(getKoreanDescription(keyword, platform, products));
      } else {
        setDbProducts(generateBestSellerProducts(keyword, platform).products);
        setDbAdditionalInfo(`"${keyword}" 키워드는 ${platform}에서 주목받고 있는 트렌드 키워드입니다. 관련 K-Beauty 제품이 높은 관심을 받고 있습니다.`);
      }
      setIsProductModalOpen(true);
    });
  };

  const generateBestSellerProducts = (keyword: string, platform: string) => {
    const products = [
      {
        id: `product-1-${keyword}`,
        name: `${keyword} K-Beauty Product`,
        brand: 'K-Beauty Brand',
        image: '/images/products/cerave-1.jpg',
        salesRank: 1,
        rating: '4.6',
        reviewCount: 3000,
        popularityScore: 85,
      },
    ];
    const additionalInfo = `${keyword} is trending on ${platform}.`;
    return { products, additionalInfo };
  };

  // 국가/카테고리 변경 시 분석 상태 리셋
  useEffect(() => {
    setShowAnalysis(false);
    setIsAnalyzing(false);
    setAnalysisData(null);
  }, [data, country, dbPlatforms]);

  const handleAnalysisClick = async () => {
    if (showAnalysis) {
      setShowAnalysis(false);
      return;
    }
    setIsAnalyzing(true);

    // LLM API 호출 시도
    try {
      const platformsForLLM = displayData.map((p: any) => ({
        platform: p.platform,
        keywords: (p.keywords || []).slice(0, 5).map((k: any) => ({
          name: k.name,
          value: k.value,
        })),
      }));

      const result = await fetchLLMSNSAnalysis({
        country: country || 'usa',
        category: category || 'Skincare',
        platforms: platformsForLLM,
      });

      if (result.success && result.summary) {
        setAnalysisData({
          summary: result.summary,
          insights: result.insights,
          recommendations: result.recommendations,
        });
        setIsAnalyzing(false);
        setShowAnalysis(true);
        return;
      }
    } catch (e) {
      console.error('LLM API 실패, fallback 사용:', e);
    }

    // Fallback: 기존 mock 분석
    if (country && (data.length > 0 || dbPlatforms.length > 0)) {
      const analysis = getIntegratedAIAnalysis(data.length > 0 ? data : displayData as any, country);
      setAnalysisData(analysis);
    }
    setIsAnalyzing(false);
    setShowAnalysis(true);
  };

  return (
    <div className="space-y-4">
      {/* 플랫폼별 차트 */}
      {displayData.map((platformData, index) => {
        const Icon = getPlatformIcon(platformData.platform);
        const colors = getPlatformColor(platformData.platform);
        
        return (
          <motion.div
            key={platformData.platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-5 h-5 text-rose-600" />
              <h4 className="text-slate-900 font-bold text-base">{platformData.platform}</h4>
              <span className="text-xs text-slate-700 font-semibold">Top 키워드</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart 
                data={platformData.keywords} 
                layout="vertical"
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    const keyword = data.activePayload[0].payload.name;
                    handleBarClick(keyword, platformData.platform);
                  }
                }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 'bold' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    border: '1px solid rgba(251, 113, 133, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '8px 12px',
                  }}
                  labelStyle={{
                    color: '#fda4af',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    const changeText = props.payload.change > 0 ? `+${props.payload.change}` : `${props.payload.change}`;
                    const typeMap: Record<string, string> = { ingredient: '성분', ingredients: '성분', formula: '제형', formulas: '제형', effect: '효과', effects: '효과', mood: 'Mood/Visual' };
                    const typeText = typeMap[props.payload.type] || props.payload.type;
                    return [`${value}% (${changeText}%)`, `${typeText} - 언급량`];
                  }}
                  itemStyle={{
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 8, 8, 0]}
                  style={{ cursor: 'pointer' }}
                >
                  {platformData.keywords.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={colors.bar}
                      opacity={0.8 - idx * 0.1}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        );
      })}

      {/* 통합 AI 분석 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: displayData.length * 0.1 + 0.2 }}
        className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-rose-600" />
          <h4 className="text-slate-900 font-bold text-base">Retail/SNS 인기 키워드 AI 분석</h4>
        </div>

        {!showAnalysis && !isAnalyzing && (
          <div className="flex justify-center py-4">
            <button
              onClick={handleAnalysisClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-rose-600 hover:to-pink-600 transition-all hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              AI 분석하기
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin mb-3" />
            <p className="text-sm text-slate-600 font-medium">AI 분석 중...</p>
            <p className="text-xs text-slate-500 mt-1">플랫폼 데이터를 종합 분석하고 있습니다</p>
          </div>
        )}

        {showAnalysis && analysisData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* 종합 요약 */}
            <div>
              <p className="text-sm text-slate-900 leading-relaxed font-medium">
                {analysisData.summary}
              </p>
            </div>

            {/* 핵심 인사이트 */}
            {analysisData.insights.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <h5 className="text-sm font-bold text-slate-900 mb-2">핵심 인사이트</h5>
                <ul className="space-y-2">
                  {analysisData.insights.map((insight, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-2 text-xs text-slate-900"
                    >
                      <span className="text-rose-600 font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{insight}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* 전략 제안 */}
            {analysisData.recommendations.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <h5 className="text-sm font-bold text-slate-900 mb-2">전략 제안</h5>
                <ul className="space-y-2">
                  {analysisData.recommendations.map((rec, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (analysisData.insights.length + idx) * 0.1 }}
                      className="flex items-start gap-2 text-xs text-slate-900"
                    >
                      <span className="text-emerald-600 font-bold mt-0.5">→</span>
                      <span className="leading-relaxed">{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                onClick={handleAnalysisClick}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                접기
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {selectedKeyword && (
        <ProductDetailModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedKeyword(null);
          }}
          keyword={selectedKeyword.keyword}
          platform={selectedKeyword.platform}
          products={dbProducts.length > 0 ? dbProducts : generateBestSellerProducts(selectedKeyword.keyword, selectedKeyword.platform).products}
          additionalInfo={dbAdditionalInfo || generateBestSellerProducts(selectedKeyword.keyword, selectedKeyword.platform).additionalInfo}
        />
      )}
    </div>
  );
}

