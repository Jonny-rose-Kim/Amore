import { useState, useEffect, useRef } from 'react';
import { singleKeywordData, reportResults, ReportResult, snsTopIngredients, Country, countryThemes, BubbleItem, TrendItem, generateReport } from '../data/mockData';
import { getSNSTopKeywordsByCountry } from '../data/leaderboardData';
import { getCountryTrendData as getCountryData, getCountryBubbleData as getCountryBubble } from '../data/countryData';
import TrendCard from './TrendCard';
import InsightPanel from './InsightPanel';
import TrendVisualization from './TrendVisualization';
import SegmentedLeaderboard from './SegmentedLeaderboard';
import ReportModal from './ReportModal';
import ReportViewModal from './ReportViewModal';
import SNSTopChart from './SNSTopChart';
// TrendMetrics removed - TrendEvidenceChart moved to InsightPanel
import InfoTooltip from './InfoTooltip';
import ReviewKeywordsPanel from './ReviewKeywordsPanel';
import OverseasProductList, { OverseasProduct } from './OverseasProductList';
import DomesticProductList, { DomesticProduct } from './DomesticProductList';
import ProductComparison from './ProductComparison';
import { fetchWhitespaceProducts, fetchCombinationLeaderboard, CombinationLeaderboardItem, fetchRAGInsight, getInsights, exportInsightsWord, saveInsight } from '../services/api';
import WhitespaceGapAnalysis from './WhitespaceGapAnalysis';
import ChatBot from './ChatBot';
import KbeautyNewProductTrends from './KbeautyNewProductTrends';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, Sparkles, X, Download, FileText, ThumbsUp, ThumbsDown, MessageCircle, Save, BookOpen } from 'lucide-react';
import { translateReview } from '../utils/koreanTranslations';

type TabType = 'single' | 'combination';
type MainCategory = 'Skincare' | 'Cleansing' | 'Sun Care' | 'Makeup' | 'Hair Care' | 'Body Care' | 'Mens Care' | 'Haircare' | 'Bodycare';

export default function TrendInsightDashboard() {
  const [country, setCountry] = useState<Country>('usa');
  const [activeTab, setActiveTab] = useState<TabType>('single');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [selectedTrendMetrics, setSelectedTrendMetrics] = useState<any[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [selectedBubbleItem, setSelectedBubbleItem] = useState<BubbleItem | null>(null);
  const [selectedTrendItem, setSelectedTrendItem] = useState<TrendItem | null>(null);
  const [selectedBubbleItemRank, setSelectedBubbleItemRank] = useState<number | undefined>(undefined);
  const [selectedBubbleItemType, setSelectedBubbleItemType] = useState<'ingredient' | 'formula' | 'effect' | 'visual' | 'combined' | undefined>(undefined);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  
  // WhiteSpace 모드 관련 상태
  const [isWhiteSpaceMode, setIsWhiteSpaceMode] = useState(false);

  // K-Beauty 동향 모드 상태
  const [isKbeautyMode, setIsKbeautyMode] = useState(false);

  // 인사이트 저장 모달 상태
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [insightNotification, setInsightNotification] = useState<{ show: boolean; count: number }>({ show: false, count: 0 });
  const prevInsightCountRef = useRef(0);
  const [showInsightTooltip, setShowInsightTooltip] = useState(true); // 초기에 말풍선 표시

  // 리뷰 키워드 팝업 상태 (대시보드 레벨)
  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean;
    reviews: any[];
    sentimentType: 'positive' | 'negative';
    reviewType: string;
  }>({ isOpen: false, reviews: [], sentimentType: 'positive', reviewType: '' });
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>('Skincare');
  const [selectedOverseasProduct, setSelectedOverseasProduct] = useState<OverseasProduct | null>(null);
  const [selectedDomesticProduct, setSelectedDomesticProduct] = useState<DomesticProduct | null>(null);
  const [wsOverseasProducts, setWsOverseasProducts] = useState<OverseasProduct[]>([]);
  const [wsKoreanProducts, setWsKoreanProducts] = useState<DomesticProduct[]>([]);

  // Combination tab: real DB data
  const [combinationData, setCombinationData] = useState<TrendItem[]>([]);
  const [isCombinationLoading, setIsCombinationLoading] = useState(false);
  const [combinationComponentKeywords, setCombinationComponentKeywords] = useState<string[]>([]);

  // Fetch WhiteSpace products from DB when category or country changes
  useEffect(() => {
    if (isWhiteSpaceMode && selectedCategory) {
      fetchWhitespaceProducts(country, selectedCategory).then(data => {
        setWsOverseasProducts((data.overseas || []).map((p: any, i: number) => ({
          id: `ws-ov-${i}`,
          name: p.name,
          brand: p.brand,
          category: selectedCategory,
          image: p.imageUrl,
          price: p.price,
          rating: p.rating,
          reviewCount: p.reviewCount,
        })));
        setWsKoreanProducts((data.korean || []).map((p: any, i: number) => ({
          id: `ws-kr-${i}`,
          name: p.name,
          brand: p.brand,
          category: selectedCategory,
          image: p.imageUrl,
          price: p.price,
          rating: p.rating,
          reviewCount: p.reviewCount,
        })));
      });
    }
  }, [isWhiteSpaceMode, selectedCategory, country]);

  // Fetch combination leaderboard from API
  useEffect(() => {
    if (activeTab === 'combination' && !isWhiteSpaceMode) {
      setIsCombinationLoading(true);
      fetchCombinationLeaderboard(country, selectedCategory || 'Skincare').then(items => {
        const trendItems: TrendItem[] = items.map((item: CombinationLeaderboardItem, idx: number) => {
          const statusMap: Record<string, TrendItem['status']> = {
            'Actionable': '🔥 Actionable Trend',
            'Growing': '🚀 Growing Trend',
            'Early': '🌱 Early Trend',
          };
          return {
            rank: idx + 1,
            category: item.mainCategory || selectedCategory || 'Skincare',
            combination: item.combination,
            status: statusMap[item.category] || '🚀 Growing Trend',
            signals: [
              { type: 'SNS' as const, data: [{ name: 'SNS', value: item.signals?.SNS || 0 }] },
              { type: 'Retail' as const, data: [{ name: 'Retail', value: item.signals?.Retail || 0 }] },
              { type: 'Review' as const, data: [{ name: 'Review', value: item.signals?.Review || 0 }] },
            ],
            insightText: `${item.combination} 조합 (Score: ${item.score})`,
            ingredients: item.ingredients,
            formulas: item.formulas,
            effects: item.effects,
            moods: item.moods,
          };
        });
        setCombinationData(trendItems);
        setIsCombinationLoading(false);
      }).catch(() => {
        setIsCombinationLoading(false);
      });
    }
  }, [activeTab, country, selectedCategory, isWhiteSpaceMode]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

  // 인사이트 카운트 폴링 및 알림
  useEffect(() => {
    const pollInsightCount = async () => {
      try {
        const result = await getInsights();
        const newCount = result.count;

        // 카운트가 증가했을 때 알림 표시
        if (newCount > prevInsightCountRef.current && prevInsightCountRef.current > 0) {
          setInsightNotification({ show: true, count: newCount });
          // 3초 후 알림 숨기기
          setTimeout(() => {
            setInsightNotification({ show: false, count: newCount });
          }, 3000);
        }

        prevInsightCountRef.current = newCount;
        setInsightCount(newCount);
      } catch (error) {
        // 에러 무시
      }
    };

    // 초기 로드
    pollInsightCount();

    // 5초마다 폴링
    const interval = setInterval(pollInsightCount, 5000);

    return () => clearInterval(interval);
  }, []);

  // 1분마다 인사이트 저장 버튼 설명 말풍선 표시
  useEffect(() => {
    // 초기에 5초 후 말풍선 숨기기
    const initialTimeout = setTimeout(() => {
      setShowInsightTooltip(false);
    }, 5000);

    // 1분마다 말풍선 다시 표시
    const tooltipInterval = setInterval(() => {
      setShowInsightTooltip(true);
      // 5초 후 숨기기
      setTimeout(() => {
        setShowInsightTooltip(false);
      }, 5000);
    }, 60000); // 1분

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(tooltipInterval);
    };
  }, []);

  const isOverseas = true; // 항상 해외 모드
  const theme = countryThemes[country];
  
  // 국가별 데이터 가져오기
  const currentTrendData = getCountryData(country);
  const currentBubbleData = getCountryBubble(country);
  const currentData = activeTab === 'single' ? singleKeywordData : (combinationData.length > 0 ? combinationData : currentTrendData);

  // 카테고리 이름 매핑
  const categoryNames: Record<MainCategory, string> = {
    'Skincare': '스킨케어',
    'Cleansing': '클렌징',
    'Sun Care': '선케어',
    'Makeup': '메이크업',
    'Hair Care': '헤어케어',
    'Body Care': '바디케어',
    'Mens Care': '맨즈케어',
    'Haircare': '헤어케어',
    'Bodycare': '바디케어',
  };

  const mainCategories: MainCategory[] = ['Skincare', 'Cleansing', 'Sun Care', 'Makeup', 'Hair Care', 'Body Care', 'Mens Care'];

  // 제품 선택 핸들러 (토글 기능 포함)
  const handleOverseasProductSelect = (product: OverseasProduct) => {
    // 이미 선택된 제품을 다시 클릭하면 선택 해제
    if (selectedOverseasProduct?.id === product.id) {
      setSelectedOverseasProduct(null);
      return;
    }
    
    setSelectedOverseasProduct(product);
  };

  const handleDomesticProductSelect = (product: DomesticProduct) => {
    // 이미 선택된 제품을 다시 클릭하면 선택 해제
    if (selectedDomesticProduct?.id === product.id) {
      setSelectedDomesticProduct(null);
      return;
    }

    setSelectedDomesticProduct(product);
  };


  const handleToggle = (index: number) => {
    const newExpandedIndex = expandedIndex === index ? null : index;
    setExpandedIndex(newExpandedIndex);
    
    // 선택된 아이템의 인사이트 텍스트 및 지표 업데이트
    if (newExpandedIndex !== null) {
      const selectedItem = currentData[newExpandedIndex];
      setSelectedInsight(selectedItem.insightText);
      setSelectedTrendMetrics(selectedItem.metrics || null);
    } else {
      setSelectedInsight(null);
      setSelectedTrendMetrics(null);
    }
  };

  const handleReportSelect = async (scope: 'keyword' | 'category', type: 'marketing' | 'npd' | 'overseas') => {
    setIsGeneratingInsight(true);

    // 키워드 결정 (try/catch 밖에서 정의)
    const keywordForInsight = scope === 'keyword'
      ? (selectedBubbleItem?.name || selectedTrendItem?.combination || '')
      : '';

    try {
      // 상위 키워드 수집
      const topKeywords = currentData.slice(0, 10).map(item => ({
        keyword: item.combination || '',
        score: 0,
        trendLevel: typeof item.status === 'string' ? item.status : '',
      }));

      // 리뷰 키워드 수집 (긍정/부정)
      const reviewKeywords = selectedBubbleItem?.reviewKeywords || selectedTrendItem?.reviewKeywords;
      const positiveReviews = reviewKeywords?.positive?.map(k => k.keyword) || [];
      const negativeReviews = reviewKeywords?.negative?.map(k => k.keyword) || [];

      const result = await fetchRAGInsight({
        scope,
        type,
        keyword: keywordForInsight,
        category: selectedCategory || 'Skincare',
        country,
        topKeywords,
        positiveReviews,
        negativeReviews,
      });

      if (result.success && result.content) {
        setReportResult({
          type,
          content: result.content,
          agentInsight: result.agentInsight,  // 마케팅 타입: 종합 전략 요약
          sources: result.ragSources,
          scope,
          keyword: scope === 'keyword' ? keywordForInsight : undefined,
          category: selectedCategory || 'Skincare',
        });
        setIsGeneratingInsight(false);
        setIsReportModalOpen(true);

        // 인사이트 자동 저장
        const typeNames = { marketing: '마케팅 전략', npd: '신제품 개발', overseas: '해외 진출' };
        saveInsight(
          type,
          `${typeNames[type]} - ${keywordForInsight || selectedCategory || 'Skincare'}`,
          result.content,
          { keyword: keywordForInsight, category: selectedCategory, country, scope }
        );
      } else {
        // LLM 실패 시 mock 데이터 폴백
        const report = generateReport(type, selectedBubbleItem, country);
        setReportResult({
          ...report,
          scope,
          keyword: scope === 'keyword' ? keywordForInsight : undefined,
          category: selectedCategory || 'Skincare',
        });
        setIsGeneratingInsight(false);
        setIsReportModalOpen(true);
      }
    } catch {
      // 에러 시 mock 폴백
      const report = generateReport(type, selectedBubbleItem, country);
      setReportResult({
        ...report,
        scope,
        keyword: scope === 'keyword' ? keywordForInsight : undefined,
        category: selectedCategory || 'Skincare',
      });
      setIsGeneratingInsight(false);
      setIsReportModalOpen(true);
    }
  };

  // 국가별 배경 색상 (화장품 회사 스타일 - 부드러운 파스텔 톤)
  const getCountryBgGradient = () => {
    const bgColors: Record<Country, { base: string; gradient: string; radial: string }> = {
      domestic: { 
        base: 'bg-rose-50', // 부드러운 분홍 파스텔
        gradient: 'from-rose-50 via-pink-50/80 to-rose-50', 
        radial: 'rgba(251, 207, 232, 0.3)' // 분홍 톤
      },
      usa: { 
        base: 'bg-blue-50', // 부드러운 파란 파스텔
        gradient: 'from-blue-50 via-indigo-50/80 to-blue-50', 
        radial: 'rgba(219, 234, 254, 0.3)' // 파란 톤
      },
      japan: { 
        base: 'bg-amber-50', // 부드러운 베이지/크림 파스텔
        gradient: 'from-amber-50 via-yellow-50/80 to-amber-50', 
        radial: 'rgba(254, 243, 199, 0.3)' // 베이지 톤
      },
      singapore: { 
        base: 'bg-emerald-50', // 부드러운 민트 파스텔
        gradient: 'from-emerald-50 via-teal-50/80 to-emerald-50', 
        radial: 'rgba(209, 250, 229, 0.3)' // 민트 톤
      },
      malaysia: { 
        base: 'bg-orange-50', // 부드러운 코랄 파스텔
        gradient: 'from-orange-50 via-rose-50/80 to-orange-50', 
        radial: 'rgba(255, 237, 213, 0.3)' // 코랄 톤
      },
      indonesia: { 
        base: 'bg-purple-50', // 부드러운 라벤더 파스텔
        gradient: 'from-purple-50 via-violet-50/80 to-purple-50', 
        radial: 'rgba(243, 232, 255, 0.3)' // 라벤더 톤
      },
    };
    return bgColors[country];
  };

  const bgStyle = getCountryBgGradient();

  return (
    <div className={`h-screen ${bgStyle.base} relative overflow-hidden flex flex-col transition-all duration-500`}>
      {/* 배경 그라데이션 효과 - 국가별 파스텔 톤 */}
      <div className={`fixed inset-0 bg-gradient-to-br ${bgStyle.gradient} pointer-events-none transition-all duration-500`} />
      <div className={`fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,${bgStyle.radial},transparent_70%)] pointer-events-none transition-all duration-500`} />
      
      <div className="flex-1 flex flex-col p-4 gap-4 relative z-10 overflow-hidden">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img
                src="/images/amore_clue.png"
                alt="AMORE CLUE Logo"
                className="w-20 h-20 object-contain rounded-xl"
              />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className={`text-3xl font-bold mb-1 bg-clip-text text-transparent transition-all duration-500 flex items-center gap-2 ${
                    isOverseas
                      ? `bg-gradient-to-r ${theme.gradient}`
                      : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600'
                  }`}>
                    <span>✨</span>
                    <span>AMORE CLUE</span>
                    <span>✨</span>
                  </h1>
                  <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md font-medium">
                    Updated: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })} (Daily)
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  화장품 산업 트렌드 분석 대시보드
                </p>
              </div>
            </div>

            {/* 인사이트 저장 버튼 + 국가 선택 드롭박스 */}
            <div className="flex items-center gap-4">
              {/* 인사이트 저장 버튼 - 동적 애니메이션 */}
              <div className="relative">
                {/* 설명 말풍선 - 1분마다 표시 */}
                <AnimatePresence>
                  {showInsightTooltip && !insightNotification.show && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 py-3 rounded-xl shadow-xl whitespace-nowrap z-50 max-w-xs"
                    >
                      <div className="flex items-start gap-2">
                        <MessageCircle className="w-5 h-5 text-violet-300 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">AI 분석 후 생성된 인사이트를</p>
                          <p className="font-medium text-sm">저장하고 싶다면 눌러주세요!</p>
                        </div>
                      </div>
                      {/* 말풍선 꼬리 - 상단 중앙 */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-slate-700"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 알림 말풍선 - 좌측 하단 */}
                <AnimatePresence>
                  {insightNotification.show && (
                    <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.9 }}
                      className="absolute top-full left-0 mt-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl shadow-lg whitespace-nowrap z-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <span className="font-bold">인사이트 {insightNotification.count}회 생성!</span>
                      </div>
                      {/* 말풍선 꼬리 - 좌측 상단 */}
                      <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-emerald-500"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 인사이트 카운트 배지 */}
                {insightCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-10 shadow-lg"
                  >
                    {insightCount}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(139, 92, 246, 0.4)',
                      '0 0 0 12px rgba(139, 92, 246, 0)',
                      '0 0 0 0 rgba(139, 92, 246, 0)'
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }
                  }}
                  onClick={async () => {
                    const result = await getInsights();
                    setInsightCount(result.count);
                    setExportError(null);
                    setIsInsightModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30 relative overflow-hidden"
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <span>📥 인사이트 저장</span>
                  {/* 반짝이는 효과 */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                  />
                </motion.button>
              </div>

              {/* 국가 선택 드롭박스 */}
              <div className="relative" ref={countryDropdownRef}>
                <span className="text-sm text-slate-600 mr-2">국가 선택:</span>
              <div className="relative inline-block">
                <button
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-gradient-to-r ${countryThemes[country].gradient} text-white shadow-md hover:shadow-lg`}
                >
                  <span>{countryThemes[country].flag}</span>
                  <span>{countryThemes[country].name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCountryDropdownOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-xl z-50 min-w-[160px]">
                    {(['usa', 'japan', 'singapore', 'malaysia', 'indonesia'] as Country[]).map((c) => {
                      const countryTheme = countryThemes[c];
                      return (
                        <button
                          key={c}
                          onClick={() => {
                            setCountry(c);
                            setExpandedIndex(null);
                            setSelectedInsight(null);
                            setSelectedTrendMetrics(null);
                            setSelectedBubbleItem(null);
                            setIsCountryDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2 hover:bg-slate-100 ${
                            country === c
                              ? `bg-gradient-to-r ${countryTheme.gradient} text-white`
                              : 'text-slate-700'
                          } ${c === 'usa' ? 'rounded-t-lg' : ''} ${c === 'indonesia' ? 'rounded-b-lg' : ''}`}
                        >
                          <span>{countryTheme.flag}</span>
                          <span>{countryTheme.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </motion.div>

        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
          {/* 좌측 패널: 트렌드 발견 (70% / WhiteSpace,K-Beauty 모드에서는 100%) */}
          <div className="flex-1 flex flex-col min-w-0" style={{ width: (isWhiteSpaceMode || isKbeautyMode) ? '100%' : '70%' }}>
            <div className="flex-1 backdrop-blur-sm rounded-xl p-4 shadow-xl flex flex-col overflow-y-auto transition-all duration-500 bg-white/80 border border-slate-200">
              {/* 탭 전환 */}
              <div className="flex gap-3 mb-4 flex-shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('single');
                    setExpandedIndex(null);
                    setSelectedInsight(null);
                    setSelectedTrendMetrics(null);
                    setIsWhiteSpaceMode(false);
                    setIsKbeautyMode(false);
                  }}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${
                    activeTab === 'single' && !isWhiteSpaceMode && !isKbeautyMode
                      ? `bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 scale-105`
                      : 'bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-700 border-2 border-slate-200 hover:border-violet-300'
                  }`}
                >
                  <span className="text-base">✨</span> 핵심 키워드
                </button>
                <button
                  onClick={() => {
                    setActiveTab('combination');
                    setExpandedIndex(null);
                    setSelectedInsight(null);
                    setSelectedTrendMetrics(null);
                    setIsWhiteSpaceMode(false);
                    setIsKbeautyMode(false);
                  }}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${
                    activeTab === 'combination' && !isWhiteSpaceMode && !isKbeautyMode
                      ? `bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-105`
                      : 'bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700 border-2 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <span className="text-base">💎</span> 꿀조합
                </button>
                <button
                  onClick={() => {
                    setIsWhiteSpaceMode(true);
                    setIsKbeautyMode(false);
                    setSelectedOverseasProduct(null);
                    setSelectedDomesticProduct(null);
                    setExpandedIndex(null);
                    setSelectedInsight(null);
                    setSelectedTrendMetrics(null);
                  }}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${
                    isWhiteSpaceMode
                      ? `bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-105`
                      : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border-2 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-base">🎯</span> WhiteSpace 비교
                </button>
                <button
                  onClick={() => {
                    setIsKbeautyMode(true);
                    setIsWhiteSpaceMode(false);
                    setExpandedIndex(null);
                    setSelectedInsight(null);
                    setSelectedTrendMetrics(null);
                  }}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${
                    isKbeautyMode
                      ? `bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 scale-105`
                      : 'bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700 border-2 border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <span className="text-base">🌸</span> K-Beauty 최신 동향
                </button>
              </div>


              {/* 메인 콘텐츠 영역 */}
              {isKbeautyMode ? (
                /* K-Beauty 동향 모드 */
                <div className="flex-1 overflow-y-auto">
                  <KbeautyNewProductTrends
                    category={selectedCategory || 'Skincare'}
                    onClose={() => setIsKbeautyMode(false)}
                  />
                </div>
              ) : isWhiteSpaceMode ? (
                <>
                {/* WhiteSpace 모드에서만 카테고리 버튼 표시 */}
                <div className="mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-slate-900 font-medium">대분류 카테고리:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mainCategories.map((category) => {
                      const categoryEmojis: Record<MainCategory, string> = {
                        'Skincare': '🧴',
                        'Cleansing': '🫧',
                        'Sun Care': '☀️',
                        'Makeup': '💄',
                        'Hair Care': '💇‍♀️',
                        'Body Care': '🛁',
                        'Mens Care': '👨',
                        'Haircare': '💇‍♀️',
                        'Bodycare': '🛁',
                      };
                      const categoryColors: Record<MainCategory, { selected: string; unselected: string }> = {
                        'Skincare': { selected: 'from-pink-500 to-rose-500', unselected: 'border-pink-300 hover:bg-pink-50' },
                        'Cleansing': { selected: 'from-sky-500 to-cyan-500', unselected: 'border-sky-300 hover:bg-sky-50' },
                        'Sun Care': { selected: 'from-amber-500 to-yellow-500', unselected: 'border-amber-300 hover:bg-amber-50' },
                        'Makeup': { selected: 'from-fuchsia-500 to-pink-500', unselected: 'border-fuchsia-300 hover:bg-fuchsia-50' },
                        'Hair Care': { selected: 'from-violet-500 to-purple-500', unselected: 'border-violet-300 hover:bg-violet-50' },
                        'Body Care': { selected: 'from-emerald-500 to-teal-500', unselected: 'border-emerald-300 hover:bg-emerald-50' },
                        'Mens Care': { selected: 'from-indigo-500 to-blue-500', unselected: 'border-indigo-300 hover:bg-indigo-50' },
                        'Haircare': { selected: 'from-violet-500 to-purple-500', unselected: 'border-violet-300 hover:bg-violet-50' },
                        'Bodycare': { selected: 'from-emerald-500 to-teal-500', unselected: 'border-emerald-300 hover:bg-emerald-50' },
                      };
                      const colors = categoryColors[category];
                      return (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedOverseasProduct(null);
                            setSelectedDomesticProduct(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                            (selectedCategory || 'Skincare') === category
                              ? `bg-gradient-to-r ${colors.selected} text-white shadow-md scale-105`
                              : `bg-white text-slate-700 border-2 ${colors.unselected} hover:scale-105`
                          }`}
                        >
                          <span className="text-sm">{categoryEmojis[category]}</span>
                          <span>{categoryNames[category]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {selectedCategory ? (
                  <>
                  <div className="grid grid-cols-12 gap-4">
                    {/* 해당 국가 인기 제품 리스트 (3/12) */}
                    <div className="col-span-3 flex flex-col min-w-0">
                      <OverseasProductList
                        products={wsOverseasProducts}
                        selectedProduct={selectedOverseasProduct}
                        onSelectProduct={handleOverseasProductSelect}
                        country={country}
                      />
                    </div>

                    {/* 한국 인기 제품 리스트 (3/12) */}
                    <div className="col-span-3 flex flex-col min-w-0">
                      <DomesticProductList
                        products={wsKoreanProducts}
                        selectedProduct={selectedDomesticProduct}
                        onSelectProduct={handleDomesticProductSelect}
                        country={country}
                      />
                    </div>

                    {/* AI 비교 분석 (6/12) */}
                    <div className="col-span-6 flex flex-col min-w-0">
                      <ProductComparison
                        overseasProduct={selectedOverseasProduct}
                        domesticProduct={selectedDomesticProduct}
                        country={country}
                      />
                    </div>
                  </div>

                  {/* WhiteSpace 기회 분석 */}
                  <WhitespaceGapAnalysis
                    country={country}
                    category={selectedCategory}
                    overseasProducts={wsOverseasProducts.map(p => ({ name: p.name, brand: p.brand, price: p.price || '', rating: p.rating || 0 }))}
                    koreanProducts={wsKoreanProducts.map(p => ({ name: p.name, brand: p.brand, price: p.price || '', rating: p.rating || 0 }))}
                  />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-slate-500 text-lg mb-2">카테고리를 선택해주세요</p>
                      <p className="text-slate-400 text-sm">위의 카테고리 버튼 중 하나를 선택하면 제품 리스트가 표시됩니다.</p>
                    </div>
                  </div>
                )}
                </>
              ) : (
              <div className="grid grid-cols-12 gap-4">
                {/* 리더보드 (5/12) */}
                <div className="col-span-5 flex flex-col min-w-0">
                  {activeTab === 'single' ? (
                    <SegmentedLeaderboard
                      data={currentBubbleData}
                      region={country === 'domestic' ? 'domestic' : 'overseas'}
                      country={country}
                      onSelectItem={(item, rank, type) => {
                        setSelectedBubbleItem(item);
                        setSelectedBubbleItemRank(rank);
                        setSelectedBubbleItemType(type);
                        setSelectedTrendItem(null);
                        setExpandedIndex(null);
                        setSelectedInsight(null);
                        setSelectedTrendMetrics(null);
                      }}
                      onCategoryChange={(cat) => {
                        setSelectedCategory(cat);
                        setSelectedOverseasProduct(null);
                        setSelectedDomesticProduct(null);
                      }}
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-slate-800">꿀조합 리더보드</h2>
                      </div>
                      {/* 대분류 카테고리 선택 */}
                      <div className="mb-3 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-slate-900 font-medium">대분류 카테고리:</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {mainCategories.map((category) => {
                            const categoryEmojis: Record<MainCategory, string> = {
                              'Skincare': '🧴',
                              'Cleansing': '🫧',
                              'Sun Care': '☀️',
                              'Makeup': '💄',
                              'Hair Care': '💇‍♀️',
                              'Body Care': '🛁',
                              'Mens Care': '👨',
                              'Haircare': '💇‍♀️',
                              'Bodycare': '🛁',
                            };
                            const categoryColors: Record<MainCategory, { selected: string; unselected: string }> = {
                              'Skincare': { selected: 'from-pink-500 to-rose-500', unselected: 'border-pink-300 hover:bg-pink-50' },
                              'Cleansing': { selected: 'from-sky-500 to-cyan-500', unselected: 'border-sky-300 hover:bg-sky-50' },
                              'Sun Care': { selected: 'from-amber-500 to-yellow-500', unselected: 'border-amber-300 hover:bg-amber-50' },
                              'Makeup': { selected: 'from-fuchsia-500 to-pink-500', unselected: 'border-fuchsia-300 hover:bg-fuchsia-50' },
                              'Hair Care': { selected: 'from-violet-500 to-purple-500', unselected: 'border-violet-300 hover:bg-violet-50' },
                              'Body Care': { selected: 'from-emerald-500 to-teal-500', unselected: 'border-emerald-300 hover:bg-emerald-50' },
                              'Mens Care': { selected: 'from-indigo-500 to-blue-500', unselected: 'border-indigo-300 hover:bg-indigo-50' },
                              'Haircare': { selected: 'from-violet-500 to-purple-500', unselected: 'border-violet-300 hover:bg-violet-50' },
                              'Bodycare': { selected: 'from-emerald-500 to-teal-500', unselected: 'border-emerald-300 hover:bg-emerald-50' },
                            };
                            const colors = categoryColors[category];
                            return (
                              <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                                  (selectedCategory || 'Skincare') === category
                                    ? `bg-gradient-to-r ${colors.selected} text-white shadow-md scale-105`
                                    : `bg-white text-slate-700 border-2 ${colors.unselected} hover:scale-105`
                                }`}
                              >
                                <span className="text-sm">{categoryEmojis[category]}</span>
                                <span>{categoryNames[category]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* 카테고리 헤더 */}
                      {selectedCategory && (
                        <div className="mb-3">
                          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${
                            selectedCategory === 'Skincare' ? 'bg-gradient-to-r from-pink-100 to-rose-50 border border-pink-200' :
                            selectedCategory === 'Cleansing' ? 'bg-gradient-to-r from-sky-100 to-cyan-50 border border-sky-200' :
                            selectedCategory === 'Sun Care' ? 'bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200' :
                            selectedCategory === 'Makeup' ? 'bg-gradient-to-r from-fuchsia-100 to-pink-50 border border-fuchsia-200' :
                            selectedCategory === 'Hair Care' ? 'bg-gradient-to-r from-violet-100 to-purple-50 border border-violet-200' :
                            selectedCategory === 'Body Care' ? 'bg-gradient-to-r from-emerald-100 to-teal-50 border border-emerald-200' :
                            selectedCategory === 'Mens Care' ? 'bg-gradient-to-r from-indigo-100 to-blue-50 border border-indigo-200' :
                            'bg-gradient-to-r from-slate-100 to-gray-50 border border-slate-200'
                          }`}>
                            <span className="text-xl">
                              {selectedCategory === 'Skincare' ? '🧴' :
                               selectedCategory === 'Cleansing' ? '🫧' :
                               selectedCategory === 'Sun Care' ? '☀️' :
                               selectedCategory === 'Makeup' ? '💄' :
                               selectedCategory === 'Hair Care' ? '💇‍♀️' :
                               selectedCategory === 'Body Care' ? '🛁' :
                               selectedCategory === 'Mens Care' ? '👨' : '📦'}
                            </span>
                            <div>
                              <h3 className={`font-bold text-sm ${
                                selectedCategory === 'Skincare' ? 'text-pink-800' :
                                selectedCategory === 'Cleansing' ? 'text-sky-800' :
                                selectedCategory === 'Sun Care' ? 'text-amber-800' :
                                selectedCategory === 'Makeup' ? 'text-fuchsia-800' :
                                selectedCategory === 'Hair Care' ? 'text-violet-800' :
                                selectedCategory === 'Body Care' ? 'text-emerald-800' :
                                selectedCategory === 'Mens Care' ? 'text-indigo-800' : 'text-slate-800'
                              }`}>
                                {categoryNames[selectedCategory]} 꿀조합 Top 7
                              </h3>
                              <p className="text-xs text-slate-500">
                                성분 + 제형 + 효과 + Mood 조합 순위
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {isCombinationLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                            <span className="ml-2 text-sm text-slate-500">로딩 중...</span>
                          </div>
                        ) : currentData.slice(0, 7).map((item, index) => (
                          <TrendCard
                            key={`${activeTab}-${item.rank}`}
                            item={item}
                            isExpanded={expandedIndex === index}
                            onToggle={() => {
                              // 드롭다운 제거로 인해 onToggle은 사용하지 않음
                            }}
                            onClick={() => {
                              setSelectedBubbleItem(null);
                              setSelectedBubbleItemRank(undefined);
                              setSelectedBubbleItemType(undefined);
                              setExpandedIndex(null);
                              setSelectedTrendItem(item);

                              // Extract component keywords from item arrays or parse from combination string
                              let componentKws = [
                                ...(item.ingredients || []),
                                ...(item.formulas || []),
                                ...(item.effects || []),
                                ...(item.moods || []),
                              ];
                              if (componentKws.length === 0 && item.combination) {
                                componentKws = item.combination.split('+').map(s => s.trim()).filter(Boolean);
                              }
                              setCombinationComponentKeywords(componentKws);
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 리뷰 키워드 패널 (3/12) */}
                <div className="col-span-3 flex flex-col min-w-0">
                  <ReviewKeywordsPanel
                    keywords={selectedBubbleItem?.reviewKeywords || selectedTrendItem?.reviewKeywords || null}
                    itemName={selectedBubbleItem?.name || selectedTrendItem?.combination || ''}
                    isCombination={!!selectedTrendItem}
                    country={country}
                    componentKeywords={combinationComponentKeywords}
                    onOpenReviewModal={(reviews, sentimentType, reviewType) => {
                      setReviewModalData({ isOpen: true, reviews, sentimentType, reviewType });
                    }}
                  />
                </div>

                {/* Retail/SNS Top Chart & Metrics (4/12) */}
                <div className="col-span-4 flex flex-col gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-slate-900">Retail/SNS Top 키워드</h3>
                      <InfoTooltip
                        title="Retail/SNS 차트 가이드"
                        description="국가별 주요 SNS·리테일 플랫폼에서 인기 키워드(성분, 제형, 효과) Top 5를 보여줍니다."
                        usage="플랫폼별 타겟 고객층 파악 / 채널별 마케팅 전략 수립 / 키워드별 SNS 트렌드 비교"
                        position="bottom-left"
                      />
                    </div>
                    <SNSTopChart data={getSNSTopKeywordsByCountry(country)} country={country} category={selectedCategory || 'Skincare'} />
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* 우측 패널: AI 근거 (30%) - WhiteSpace/K-Beauty 모드가 아닐 때만 표시 */}
          {!isWhiteSpaceMode && !isKbeautyMode && (
            <div className="flex-shrink-0 flex flex-col min-w-0" style={{ width: '30%' }}>
              <InsightPanel
                selectedInsight={selectedInsight}
                selectedBubbleItem={selectedBubbleItem}
                selectedTrendItem={selectedTrendItem}
                selectedBubbleItemRank={selectedBubbleItemRank}
                selectedBubbleItemType={selectedBubbleItemType}
                country={country}
                category={selectedCategory || 'Skincare'}
                onOpenModal={() => setIsModalOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 보고서 생성 모달 */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleReportSelect}
        hasKeywordSelected={!!(selectedBubbleItem || selectedTrendItem)}
        selectedKeyword={selectedBubbleItem?.name || selectedTrendItem?.combination || ''}
        currentCategory={selectedCategory || 'Skincare'}
      />
      
      {/* AI 인사이트 생성 중 로딩 모달 */}
      <AnimatePresence>
        {isGeneratingInsight && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            
            {/* Loading Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-gradient-to-br from-rose-950/95 to-pink-950/95 backdrop-blur-xl border border-rose-800/50 rounded-2xl p-12 max-w-md w-full shadow-2xl text-center">
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-rose-400 animate-spin" />
                    <Sparkles className="w-8 h-8 text-pink-400 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      AI 인사이트 생성 중
                    </h3>
                    <p className="text-slate-400 text-sm">
                      선택하신 목적에 맞는 맞춤형 인사이트를 생성하고 있습니다...
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4 justify-center">
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 보고서 표시 모달 */}
      <ReportViewModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportResult={reportResult}
      />

      {/* AI 챗봇 */}
      <ChatBot />

      {/* 인사이트 저장 모달 - 개선된 UI */}
      <AnimatePresence>
        {isInsightModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setIsInsightModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl max-w-xl w-full mx-4 overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 - 그라데이션 배경 */}
              <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">AI 인사이트 저장</h3>
                      <p className="text-white/80 text-sm mt-1">분석 결과를 문서로 내보내기</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsInsightModalOpen(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className="p-8">
                {/* 인사이트 카운트 카드 */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-600 text-sm font-medium">현재 세션 수집 인사이트</p>
                        <p className="text-3xl font-bold text-emerald-600">{insightCount}<span className="text-lg ml-1">개</span></p>
                      </div>
                    </div>
                    {insightCount > 0 && (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-sm font-medium rounded-full">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          저장 가능
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 안내 메시지 */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-slate-600">
                      <p className="font-medium text-slate-700 mb-1">인사이트란?</p>
                      <p>키워드 AI 분석, 카테고리 AI 분석, 리뷰 AI 요약, SNS/Retail 분석 등을 실행하면 자동으로 수집됩니다.</p>
                    </div>
                  </div>
                </div>

                {insightCount === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <FileText className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-lg font-medium mb-2">아직 수집된 인사이트가 없습니다</p>
                    <p className="text-slate-400 text-sm">AI 분석 기능을 사용해보세요!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exportError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                        <X className="w-5 h-5 flex-shrink-0" />
                        {exportError}
                      </div>
                    )}

                    {/* Word 저장 버튼 */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        setIsExporting(true);
                        setExportError(null);
                        try {
                          const blob = await exportInsightsWord();
                          if (blob) {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `amore_insights_${new Date().toISOString().split('T')[0]}.docx`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            setIsInsightModalOpen(false);
                            setExportError(null);
                          } else {
                            setExportError('Word 내보내기에 실패했습니다. 인사이트가 저장되어 있는지 확인해주세요.');
                          }
                        } catch (err) {
                          console.error('Word export failed:', err);
                          setExportError('Word 내보내기 중 오류가 발생했습니다.');
                        } finally {
                          setIsExporting(false);
                        }
                      }}
                      disabled={isExporting}
                      className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50 text-lg"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>내보내는 중...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-6 h-6" />
                          <span>Word 문서로 저장</span>
                          <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-lg text-sm">.docx</span>
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                      저장 후 인사이트는 초기화됩니다
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 리뷰 키워드 팝업 - 대시보드 레벨 */}
      <AnimatePresence>
        {reviewModalData.isOpen && reviewModalData.reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setReviewModalData({ ...reviewModalData, isOpen: false })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border-2 ${
                reviewModalData.sentimentType === 'positive' ? 'border-emerald-300' : 'border-rose-300'
              }`}
              onClick={e => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className={`flex items-center justify-between p-6 border-b ${
                reviewModalData.sentimentType === 'positive'
                  ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50'
                  : 'border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50'
              } rounded-t-3xl`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    reviewModalData.sentimentType === 'positive'
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                      : 'bg-rose-500 shadow-lg shadow-rose-500/30'
                  }`}>
                    {reviewModalData.sentimentType === 'positive' ? (
                      <ThumbsUp className="w-7 h-7 text-white" />
                    ) : (
                      <ThumbsDown className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-2xl">
                      {reviewModalData.sentimentType === 'positive' ? '긍정' : '부정'} 리뷰 분석
                    </h4>
                    <p className="text-slate-500">
                      "{reviewModalData.reviewType}" 키워드 관련 · 총 {reviewModalData.reviews.length}건의 리뷰
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReviewModalData({ ...reviewModalData, isOpen: false })}
                  className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              {/* 리뷰 목록 */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reviewModalData.reviews.map((review: any, idx: number) => {
                    const korTranslation = review.contentKr || translateReview(review.content);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`p-5 rounded-2xl border-2 ${
                          reviewModalData.sentimentType === 'positive'
                            ? 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200 hover:border-emerald-300'
                            : 'bg-gradient-to-br from-rose-50 to-pink-50/50 border-rose-200 hover:border-rose-300'
                        } transition-all hover:shadow-lg`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-slate-800 truncate flex-1">{review.product}</span>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ml-2 ${
                            reviewModalData.sentimentType === 'positive'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            ⭐ {review.rating?.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed mb-3 line-clamp-3">"{review.content}"</p>
                        {korTranslation && (
                          <div className={`p-3 rounded-xl mb-3 ${
                            reviewModalData.sentimentType === 'positive'
                              ? 'bg-emerald-100/50 border-l-4 border-emerald-400'
                              : 'bg-rose-100/50 border-l-4 border-rose-400'
                          }`}>
                            <p className="text-slate-700 text-sm leading-relaxed italic line-clamp-3">
                              🇰🇷 {korTranslation}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 font-medium">{review.brand}</span>
                          <span className="text-slate-400 text-xs">
                            {review.source} · {new Date(review.postedAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

