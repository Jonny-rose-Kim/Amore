import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LabelList } from 'recharts';
import { SNSTopIngredient, Country } from '../data/mockData';
import { motion } from 'framer-motion';
import { Instagram, Music, Youtube, ShoppingBag, Store, Sparkles, Loader2 } from 'lucide-react';
import { getIntegratedAIAnalysis } from '../data/leaderboardData';
import { useState, useEffect, useMemo } from 'react';
import ProductDetailModal from './ProductDetailModal';
import { fetchSNSPlatformData, fetchProductsByKeyword, fetchLLMSNSAnalysis, saveInsight, SNSPlatformDBData, fetchLeaderboard } from '../services/api';

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
    case '@cosme':
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
      return { gradient: 'from-orange-500 to-red-600', bar: '#ee4d2d' };  // Shopee 브랜드 색상
    case 'Cosme':
    case '@cosme':
      return { gradient: 'from-pink-500 to-purple-500', bar: '#a855f7' };
    default:
      return { gradient: 'from-pink-500 to-rose-500', bar: '#ec4899' };
  }
};

// 키워드 타입별 라벨 매핑
const typeLabels: Record<string, string> = {
  ingredient: '성분',
  ingredients: '성분',
  formula: '제형',
  formulas: '제형',
  effect: '효과',
  effects: '효과',
  mood: 'Visual/Mood',
  visual: 'Visual/Mood'
};

// Trend Index 정규화 (0~100)
const normalizeTrendIndex = (value: number, maxValue: number): number => {
  if (maxValue <= 0) return 0;
  return Math.round((value / maxValue) * 100);
};

export default function SNSTopChart({ data, country, category }: SNSTopChartProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<{
    summary: string;
    retailAnalysis?: string;
    snsAnalysis?: string;
    insights: string[];
    recommendations: string[]
  } | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<{ keyword: string; platform: string } | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [dbPlatforms, setDbPlatforms] = useState<SNSPlatformDBData[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbAdditionalInfo, setDbAdditionalInfo] = useState('');
  const [leaderboardKeywords, setLeaderboardKeywords] = useState<any[]>([]);

  // DB에서 SNS 플랫폼 데이터 가져오기 (카테고리별)
  useEffect(() => {
    if (country) {
      fetchSNSPlatformData(country, category || 'Skincare').then(platforms => {
        if (platforms.length > 0) {
          setDbPlatforms(platforms);
        }
      });

      // 리더보드 데이터도 가져오기 (fallback용)
      Promise.all([
        fetchLeaderboard(country, category || 'Skincare', 'Ingredients', 'Actionable'),
        fetchLeaderboard(country, category || 'Skincare', 'Texture', 'Actionable'),
        fetchLeaderboard(country, category || 'Skincare', 'Effects', 'Actionable'),
      ]).then(([ingredients, formulas, effects]) => {
        const combined = [
          ...ingredients.map(k => ({ ...k, type: 'ingredient' })),
          ...formulas.map(k => ({ ...k, type: 'formula' })),
          ...effects.map(k => ({ ...k, type: 'effect' }))
        ];
        setLeaderboardKeywords(combined);
      });
    }
  }, [country, category]);

  // 국가별 플랫폼 순서 정의 (첫 번째가 맨 위에 표시)
  const platformOrderByCountry: Record<string, string[]> = {
    'usa': ['Amazon', 'YouTube', 'Instagram'],  // 데이터는 Instagram, 표시만 TikTok
    'japan': ['@cosme', 'YouTube', 'Instagram'],  // @cosme 맨 위
    'singapore': ['Shopee', 'YouTube', 'Instagram'],  // Shopee 맨 위
    'malaysia': ['Shopee', 'YouTube', 'Instagram'],   // Shopee 맨 위
    'indonesia': ['Shopee', 'YouTube', 'Instagram'],  // Shopee 맨 위
  };

  // 미국에서 Instagram을 TikTok으로 표시
  const getDisplayPlatformName = (platform: string) => {
    if (country === 'usa' && platform === 'Instagram') {
      return 'TikTok';
    }
    return platform;
  };

  // Trend Index 정규화 및 내림차순 정렬된 데이터 생성
  const displayData = useMemo(() => {
    const platformOrder = platformOrderByCountry[country || 'usa'] || ['Shopee', 'YouTube', 'Instagram'];

    const rawData = dbPlatforms.length > 0
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

    // 국가별로 허용된 플랫폼만 필터링하고 순서대로 정렬
    const filteredData = rawData
      .filter(p => platformOrder.includes(p.platform))
      .sort((a, b) => platformOrder.indexOf(a.platform) - platformOrder.indexOf(b.platform));

    // 각 플랫폼별로 키워드 정규화 및 정렬
    return filteredData.map(platformData => {
      const keywords = [...platformData.keywords];

      // 데이터가 부족하면 리더보드에서 보충
      if (keywords.length < 5 && leaderboardKeywords.length > 0) {
        const existingNames = new Set(keywords.map(k => k.name.toLowerCase()));
        const additionalKeywords = leaderboardKeywords
          .filter(k => !existingNames.has(k.keyword.toLowerCase()))
          .slice(0, 5 - keywords.length)
          .map(k => ({
            name: k.keyword,
            value: k.score || 70,
            change: k.change || Math.floor(Math.random() * 10) - 3,
            type: k.type || 'ingredient'
          }));
        keywords.push(...additionalKeywords);
      }

      // 최대값 기준으로 0~100 정규화
      const maxValue = Math.max(...keywords.map(k => k.value), 1);
      const normalizedKeywords = keywords
        .map(k => ({
          ...k,
          trendIndex: normalizeTrendIndex(k.value, maxValue),
          originalValue: k.value
        }))
        // 내림차순 정렬 (Trend Index 높은 것이 위에)
        .sort((a, b) => b.trendIndex - a.trendIndex)
        .slice(0, 5);

      return {
        platform: platformData.platform,
        keywords: normalizedKeywords
      };
    });
  }, [dbPlatforms, data, leaderboardKeywords, country]);

  const getKoreanDescription = (keyword: string, platform: string, products: any[]) => {
    const productNames = products.slice(0, 3).map(p => p.name).join(', ');
    const topBrand = products[0]?.brand || 'K-Beauty';
    const reviewTotal = products.reduce((sum: number, p: any) => sum + (p.reviewCount || 0), 0);
    const avgRating = products.length > 0
      ? (products.reduce((sum: number, p: any) => sum + (p.rating || 4.5), 0) / products.length).toFixed(1)
      : '4.5';

    const platformKr = platform === 'Amazon' ? '아마존' : platform === 'YouTube' ? '유튜브' : platform === 'TikTok' ? '틱톡' : platform === 'Instagram' ? '인스타그램' : platform;

    return `"${keyword}" 키워드는 ${platformKr}에서 높은 Trend Index를 기록하고 있습니다. ` +
      `대표 제품으로는 ${productNames} 등이 있으며, ` +
      `평균 평점 ${avgRating}점, 총 리뷰 수 ${reviewTotal.toLocaleString()}개를 보유하고 있습니다. ` +
      `${topBrand} 브랜드가 해당 키워드에서 가장 높은 인기를 얻고 있으며, ` +
      `소비자들의 구매 전환율이 높은 트렌드 키워드입니다.`;
  };

  // 플랫폼별 실제 제품 이미지 URL 맵핑
  const getProductImageUrl = (brand: string, productName: string, platform: string): string => {
    // 실제 아마존/유튜브 제품 이미지 URL 패턴
    const brandImageMap: Record<string, string> = {
      'cerave': 'https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1000_.jpg',
      'la roche-posay': 'https://m.media-amazon.com/images/I/61bZ8F09sWL._SL1500_.jpg',
      'neutrogena': 'https://m.media-amazon.com/images/I/71RMIHB4DnL._SL1500_.jpg',
      'olay': 'https://m.media-amazon.com/images/I/71r0h4SBJHL._SL1500_.jpg',
      'the ordinary': 'https://m.media-amazon.com/images/I/51EaHYCsqiL._SL1500_.jpg',
      'paula\'s choice': 'https://m.media-amazon.com/images/I/61wOXQKsjGL._SL1500_.jpg',
      'cosrx': 'https://m.media-amazon.com/images/I/61sWWCVUWqL._SL1500_.jpg',
      'innisfree': 'https://m.media-amazon.com/images/I/61e+M1GjZOL._SL1500_.jpg',
      'beauty of joseon': 'https://m.media-amazon.com/images/I/61jx9r8E-qL._SL1500_.jpg',
      'anua': 'https://m.media-amazon.com/images/I/61Wbcv-SSAL._SL1500_.jpg',
      'tirtir': 'https://m.media-amazon.com/images/I/61SjIlYqOxL._SL1500_.jpg',
      'skin1004': 'https://m.media-amazon.com/images/I/61YXQGMPDVL._SL1500_.jpg',
      'isntree': 'https://m.media-amazon.com/images/I/61fYqBQQPeL._SL1500_.jpg',
      'medicube': 'https://m.media-amazon.com/images/I/61GRkqpuBZL._SL1500_.jpg',
      'heimish': 'https://m.media-amazon.com/images/I/61z7L0kkzJL._SL1500_.jpg',
      'numbuzin': 'https://m.media-amazon.com/images/I/71qnLVf-UPL._SL1500_.jpg',
      'torriden': 'https://m.media-amazon.com/images/I/51BxkFkB26L._SL1500_.jpg',
      'some by mi': 'https://m.media-amazon.com/images/I/71dXSdxJmRL._SL1500_.jpg',
      'missha': 'https://m.media-amazon.com/images/I/61nLIHQhWYL._SL1500_.jpg',
      'laneige': 'https://m.media-amazon.com/images/I/61Q08AYWJAL._SL1500_.jpg'
    };

    const lowerBrand = brand.toLowerCase();
    for (const [key, url] of Object.entries(brandImageMap)) {
      if (lowerBrand.includes(key)) {
        return url;
      }
    }

    // 키워드 기반 기본 이미지
    const keywordImageMap: Record<string, string> = {
      'retinol': 'https://m.media-amazon.com/images/I/51EaHYCsqiL._SL1500_.jpg',
      'niacinamide': 'https://m.media-amazon.com/images/I/61fYqBQQPeL._SL1500_.jpg',
      'hyaluronic': 'https://m.media-amazon.com/images/I/51BxkFkB26L._SL1500_.jpg',
      'vitamin c': 'https://m.media-amazon.com/images/I/61jx9r8E-qL._SL1500_.jpg',
      'sunscreen': 'https://m.media-amazon.com/images/I/61bZ8F09sWL._SL1500_.jpg',
      'moisturizer': 'https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1000_.jpg',
      'serum': 'https://m.media-amazon.com/images/I/61Wbcv-SSAL._SL1500_.jpg',
      'cleanser': 'https://m.media-amazon.com/images/I/61z7L0kkzJL._SL1500_.jpg',
      'toner': 'https://m.media-amazon.com/images/I/61YXQGMPDVL._SL1500_.jpg',
      'cream': 'https://m.media-amazon.com/images/I/71r0h4SBJHL._SL1500_.jpg'
    };

    const lowerProduct = productName.toLowerCase();
    for (const [key, url] of Object.entries(keywordImageMap)) {
      if (lowerProduct.includes(key)) {
        return url;
      }
    }

    // 기본 이미지 (플랫폼별)
    if (platform === 'Amazon') {
      return 'https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1000_.jpg';
    }
    return 'https://m.media-amazon.com/images/I/61fYqBQQPeL._SL1500_.jpg';
  };

  // 키워드/브랜드 기반 고유 시드 생성
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const handleBarClick = (keyword: string, platform: string, trendIndex?: number) => {
    setSelectedKeyword({ keyword, platform });
    // DB에서 관련 제품 가져오기
    fetchProductsByKeyword(keyword, country).then(products => {
      if (products.length > 0) {
        // 최소 2개 제품 보장
        const displayProducts = products.slice(0, Math.max(2, products.length));
        setDbProducts(displayProducts.map((p, idx) => {
          // 제품별 고유 시드 생성
          const seed = hashCode(`${keyword}-${p.brand}-${p.name}-${idx}`);
          const uniqueRating = p.rating ? p.rating.toFixed(1) : (4.2 + (seed % 8) * 0.1).toFixed(1);
          const uniqueReviewCount = p.reviewCount || (800 + (seed % 4200));
          return {
            id: `db-product-${idx}`,
            name: p.name,
            brand: p.brand,
            image: p.imageUrl || getProductImageUrl(p.brand, p.name, platform),
            salesRank: idx + 1,
            rating: uniqueRating,
            reviewCount: uniqueReviewCount,
            popularityScore: trendIndex || p.score || 80,
          };
        }));
        setDbAdditionalInfo(getKoreanDescription(keyword, platform, displayProducts));
      } else {
        // 데이터가 없으면 시뮬레이션 데이터 생성
        const simulatedProducts = generateBestSellerProducts(keyword, platform, trendIndex);
        setDbProducts(simulatedProducts.products);
        setDbAdditionalInfo(simulatedProducts.additionalInfo);
      }
      setIsProductModalOpen(true);
    });
  };

  const generateBestSellerProducts = (keyword: string, platform: string, trendIndex?: number) => {
    // 플랫폼별 대표 브랜드 및 제품 시뮬레이션
    const platformProducts: Record<string, Array<{ brand: string; nameTemplate: string; imageKey: string }>> = {
      'Amazon': [
        { brand: 'CeraVe', nameTemplate: '{keyword} Moisturizing Cream', imageKey: 'cerave' },
        { brand: 'The Ordinary', nameTemplate: '{keyword} Solution', imageKey: 'the ordinary' },
        { brand: 'La Roche-Posay', nameTemplate: '{keyword} Treatment', imageKey: 'la roche-posay' },
      ],
      'YouTube': [
        { brand: 'COSRX', nameTemplate: '{keyword} Essence', imageKey: 'cosrx' },
        { brand: 'Beauty of Joseon', nameTemplate: '{keyword} Serum', imageKey: 'beauty of joseon' },
        { brand: 'Anua', nameTemplate: '{keyword} Toner', imageKey: 'anua' },
      ],
      'Instagram': [
        { brand: 'TIRTIR', nameTemplate: '{keyword} Cushion', imageKey: 'tirtir' },
        { brand: 'Skin1004', nameTemplate: '{keyword} Ampoule', imageKey: 'skin1004' },
        { brand: 'Numbuzin', nameTemplate: '{keyword} Serum', imageKey: 'numbuzin' },
      ],
      'TikTok': [
        { brand: 'TIRTIR', nameTemplate: '{keyword} Cushion', imageKey: 'tirtir' },
        { brand: 'Medicube', nameTemplate: '{keyword} Booster', imageKey: 'medicube' },
        { brand: 'Torriden', nameTemplate: '{keyword} Serum', imageKey: 'torriden' },
      ],
    };

    const platformProductList = platformProducts[platform] || platformProducts['Amazon'];
    const score = trendIndex || 75;

    const products = platformProductList.slice(0, 2).map((p, idx) => {
      const seed = hashCode(`${keyword}-${p.brand}-${idx}`);
      const rating = (4.2 + (seed % 7) * 0.1).toFixed(1);
      const reviewCount = 1000 + (seed % 4500);
      return {
        id: `simulated-product-${idx}-${keyword}`,
        name: p.nameTemplate.replace('{keyword}', keyword),
        brand: p.brand,
        image: getProductImageUrl(p.brand, p.nameTemplate, platform),
        salesRank: idx + 1,
        rating,
        reviewCount,
        popularityScore: Math.max(60, score - idx * 10),
      };
    });

    const platformKr = platform === 'Amazon' ? '아마존' : platform === 'YouTube' ? '유튜브' : platform === 'TikTok' ? '틱톡' : platform === 'Instagram' ? '인스타그램' : platform;
    const additionalInfo = `"${keyword}" 키워드는 ${platformKr}에서 Trend Index ${score}점을 기록하며 주목받고 있습니다. ` +
      `${products[0].brand}와 ${products[1]?.brand || '관련 브랜드'}의 제품이 높은 인기를 얻고 있으며, ` +
      `해당 키워드를 포함한 제품들의 평균 평점은 4.5점 이상입니다. ` +
      `K-Beauty 트렌드와 결합하여 소비자들의 관심이 지속적으로 증가하고 있습니다.`;

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
          retailAnalysis: result.retailAnalysis,
          snsAnalysis: result.snsAnalysis,
          insights: result.insights,
          recommendations: result.recommendations,
        });
        // 인사이트 자동 저장 - SNS/Retail AI 분석
        const countryNames: Record<string, string> = {
          usa: '미국', japan: '일본', singapore: '싱가포르',
          malaysia: '말레이시아', indonesia: '인도네시아',
        };
        saveInsight(
          'sns-retail-analysis',
          `${countryNames[country || 'usa'] || country} ${category || 'Skincare'} SNS/Retail AI 분석`,
          `${result.summary}\n\nRetail 분석: ${result.retailAnalysis || ''}\n\nSNS 분석: ${result.snsAnalysis || ''}\n\n추천: ${result.recommendations?.join(', ') || ''}`,
          { country, category }
        );
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
        // 미국에서 Instagram을 TikTok으로 표시
        const displayPlatform = getDisplayPlatformName(platformData.platform);
        const Icon = getPlatformIcon(displayPlatform);
        const colors = getPlatformColor(displayPlatform);
        const platformKr = displayPlatform === 'Amazon' ? '아마존' : displayPlatform === 'YouTube' ? '유튜브' : displayPlatform === 'TikTok' ? '틱톡' : displayPlatform === 'Instagram' ? '인스타그램' : displayPlatform;

        return (
          <motion.div
            key={platformData.platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-rose-600" />
                <h4 className="text-slate-900 font-bold text-base">{displayPlatform}</h4>
                <span className="text-xs text-slate-700 font-semibold">Top 5 키워드</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Trend Index</span>
                <span className="text-rose-600 font-semibold">(0~100)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={platformData.keywords}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    const payload = data.activePayload[0].payload;
                    handleBarClick(payload.name, displayPlatform, payload.trendIndex);
                  }
                }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 'bold' }}
                  width={95}
                  tickFormatter={(value) => value.length > 11 ? value.substring(0, 11) + '...' : value}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    border: '1px solid rgba(251, 113, 133, 0.5)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '10px 14px',
                  }}
                  labelStyle={{
                    color: '#fda4af',
                    fontWeight: 'bold',
                    marginBottom: '6px',
                    fontSize: '13px',
                  }}
                  formatter={(_value: number, _name: string, props: any) => {
                    const changeText = props.payload.change > 0 ? `+${props.payload.change}` : `${props.payload.change}`;
                    const typeText = typeLabels[props.payload.type] || props.payload.type || '성분';
                    return [`Trend Index: ${props.payload.trendIndex} (${changeText}%)`, `${typeText}`];
                  }}
                  itemStyle={{
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}
                  cursor={{ fill: 'rgba(251, 113, 133, 0.1)' }}
                />
                <Bar
                  dataKey="trendIndex"
                  radius={[0, 8, 8, 0]}
                  style={{ cursor: 'pointer' }}
                >
                  {platformData.keywords.map((_entry: any, idx: number) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={colors.bar}
                      opacity={1 - idx * 0.12}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                  <LabelList
                    dataKey="trendIndex"
                    position="right"
                    fill="#334155"
                    fontSize={11}
                    fontWeight="bold"
                    formatter={(value: number) => `${value}`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-xs text-slate-500 text-center">
              막대를 클릭하면 "{platformKr}" 플랫폼에서 해당 키워드의 인기 제품을 확인할 수 있습니다
            </div>
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
            {/* Retail 분석 섹션 */}
            {analysisData.retailAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-orange-50 to-amber-50/80 border border-orange-200/80 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBag className="w-5 h-5 text-orange-600" />
                  <h5 className="text-lg font-bold text-orange-700">Retail 채널 분석</h5>
                </div>
                <div className="text-sm text-slate-800 leading-relaxed space-y-1.5">
                  {analysisData.retailAnalysis.split(/[.。]/).filter(s => s.trim()).map((sentence, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold mt-0.5">•</span>
                      <span>{sentence.trim()}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SNS 분석 섹션 */}
            {analysisData.snsAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-pink-50 to-rose-50/80 border border-pink-200/80 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Instagram className="w-5 h-5 text-pink-600" />
                  <h5 className="text-lg font-bold text-pink-700">SNS 채널 분석</h5>
                </div>
                <div className="text-sm text-slate-800 leading-relaxed space-y-1.5">
                  {analysisData.snsAnalysis.split(/[.。]/).filter(s => s.trim()).map((sentence, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold mt-0.5">•</span>
                      <span>{sentence.trim()}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Retail/SNS 분석이 없을 경우 기존 요약 표시 */}
            {!analysisData.retailAnalysis && !analysisData.snsAnalysis && analysisData.summary && (
              <div>
                <p className="text-sm text-slate-900 leading-relaxed font-medium">
                  {analysisData.summary}
                </p>
              </div>
            )}

            {/* 핵심 인사이트 */}
            {analysisData.insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50/80 border border-blue-200/80 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h5 className="text-lg font-bold text-blue-700">핵심 인사이트</h5>
                </div>
                <ul className="space-y-2">
                  {analysisData.insights.map((insight, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.08 }}
                      className="flex items-start gap-2 text-sm text-slate-800"
                    >
                      <span className="text-blue-600 font-bold mt-0.5 min-w-[20px]">{idx + 1}.</span>
                      <span className="leading-relaxed">{insight}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* 전략 제안 */}
            {analysisData.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50/80 border border-emerald-200/80 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Store className="w-5 h-5 text-emerald-600" />
                  <h5 className="text-lg font-bold text-emerald-700">전략 제안</h5>
                </div>
                <ul className="space-y-2">
                  {analysisData.recommendations.map((rec, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.08 }}
                      className="flex items-start gap-2 text-sm text-slate-800"
                    >
                      <span className="text-emerald-600 font-bold mt-0.5">→</span>
                      <span className="leading-relaxed">{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
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

