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
import { fetchWhitespaceProducts, fetchCombinationLeaderboard, CombinationLeaderboardItem, fetchRAGInsight } from '../services/api';
import WhitespaceGapAnalysis from './WhitespaceGapAnalysis';
import ChatBot from './ChatBot';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, Sparkles } from 'lucide-react';

type TabType = 'single' | 'combination';
type MainCategory = 'Skincare' | 'Cleansing' | 'Sun Care' | 'Makeup' | 'Hair Care' | 'Body Care' | 'Mens Care';

export default function TrendInsightDashboard() {
  const [country, setCountry] = useState<Country>('usa');
  const [activeTab, setActiveTab] = useState<TabType>('combination');
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
  const [selectedBubbleItemType, setSelectedBubbleItemType] = useState<'ingredient' | 'formula' | 'effect' | 'combined' | undefined>(undefined);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  
  // WhiteSpace 모드 관련 상태
  const [isWhiteSpaceMode, setIsWhiteSpaceMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>('Skincare');
  const [selectedOverseasProduct, setSelectedOverseasProduct] = useState<OverseasProduct | null>(null);
  const [selectedDomesticProduct, setSelectedDomesticProduct] = useState<DomesticProduct | null>(null);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [pendingOverseasProduct, setPendingOverseasProduct] = useState<OverseasProduct | null>(null);
  const [pendingDomesticProduct, setPendingDomesticProduct] = useState<DomesticProduct | null>(null);
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
            'Actionable': '🚀 Actionable Trend',
            'Growing': '📈 Growing Trend',
            'Early': '🌱 Early Trend',
          };
          return {
            rank: idx + 1,
            category: item.mainCategory || selectedCategory || 'Skincare',
            combination: item.combination,
            status: statusMap[item.category] || '📈 Growing Trend',
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
  };

  const mainCategories: MainCategory[] = ['Skincare', 'Cleansing', 'Sun Care', 'Makeup', 'Hair Care', 'Body Care', 'Mens Care'];

  // 제품 선택 핸들러 (토글 기능 포함)
  const handleOverseasProductSelect = (product: OverseasProduct) => {
    // 이미 선택된 제품을 다시 클릭하면 선택 해제
    if (selectedOverseasProduct?.id === product.id) {
      setSelectedOverseasProduct(null);
      return;
    }
    
    setPendingOverseasProduct(product);
    if (selectedDomesticProduct) {
      setShowComparisonDialog(true);
    } else {
      setSelectedOverseasProduct(product);
    }
  };

  const handleDomesticProductSelect = (product: DomesticProduct) => {
    // 이미 선택된 제품을 다시 클릭하면 선택 해제
    if (selectedDomesticProduct?.id === product.id) {
      setSelectedDomesticProduct(null);
      return;
    }
    
    setPendingDomesticProduct(product);
    if (selectedOverseasProduct) {
      setShowComparisonDialog(true);
    } else {
      setSelectedDomesticProduct(product);
    }
  };

  const handleComparisonConfirm = () => {
    if (pendingOverseasProduct) {
      setSelectedOverseasProduct(pendingOverseasProduct);
      setPendingOverseasProduct(null);
    }
    if (pendingDomesticProduct) {
      setSelectedDomesticProduct(pendingDomesticProduct);
      setPendingDomesticProduct(null);
    }
    setShowComparisonDialog(false);
  };

  const handleComparisonCancel = () => {
    setPendingOverseasProduct(null);
    setPendingDomesticProduct(null);
    setShowComparisonDialog(false);
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

    try {
      // 키워드 결정
      const keywordForInsight = scope === 'keyword'
        ? (selectedBubbleItem?.name || selectedTrendItem?.combination || '')
        : '';

      // 상위 키워드 수집
      const topKeywords = currentData.slice(0, 10).map(item => ({
        keyword: item.combination || '',
        score: 0,
        trendLevel: typeof item.status === 'string' ? item.status : '',
      }));

      const result = await fetchRAGInsight({
        scope,
        type,
        keyword: keywordForInsight,
        category: selectedCategory || 'Skincare',
        country,
        topKeywords,
      });

      if (result.success && result.content) {
        setReportResult({ type, content: result.content, sources: result.ragSources });
        setIsGeneratingInsight(false);
        setIsReportModalOpen(true);
      } else {
        // LLM 실패 시 mock 데이터 폴백
        const report = generateReport(type, selectedBubbleItem, country);
        setReportResult(report);
        setIsGeneratingInsight(false);
        setIsReportModalOpen(true);
      }
    } catch {
      // 에러 시 mock 폴백
      const report = generateReport(type, selectedBubbleItem, country);
      setReportResult(report);
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
        </motion.div>
        
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
          {/* 좌측 패널: 트렌드 발견 (70%) */}
          <div className="flex-1 flex flex-col min-w-0" style={{ width: '70%' }}>
            <div className="flex-1 backdrop-blur-sm rounded-xl p-4 shadow-xl flex flex-col overflow-y-auto transition-all duration-500 bg-white/80 border border-slate-200">
              {/* 탭 전환 */}
              <div className="flex gap-2 mb-4 flex-shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('single');
                    setExpandedIndex(null);
                    setSelectedInsight(null);
                    setSelectedTrendMetrics(null);
                    setIsWhiteSpaceMode(false);
                  }}
                  className={`px-5 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'single' && !isWhiteSpaceMode
                      ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  🔥 핵심 키워드 (Single)
                </button>
                <button
                  onClick={() => {
                    setActiveTab('combination');
                    setExpandedIndex(null);
                    setSelectedInsight(null);
                    setSelectedTrendMetrics(null);
                    setIsWhiteSpaceMode(false);
                  }}
                  className={`px-5 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'combination' && !isWhiteSpaceMode
                      ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  🧩 꿀조합 (Combination)
                </button>
                <button
                  onClick={() => {
                    setIsWhiteSpaceMode(true);
                    setSelectedOverseasProduct(null);
                    setSelectedDomesticProduct(null);
                    setExpandedIndex(null);
                    setSelectedInsight(null);
                    setSelectedTrendMetrics(null);
                  }}
                  className={`px-5 py-2 rounded-lg font-medium transition-all text-sm ${
                    isWhiteSpaceMode
                      ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  🔄 WhiteSpace 비교
                </button>
              </div>


              {/* 메인 콘텐츠 영역 */}
              {isWhiteSpaceMode ? (
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
                      };
                      const categoryColors: Record<MainCategory, { selected: string; unselected: string }> = {
                        'Skincare': { selected: 'from-pink-500 to-rose-500', unselected: 'border-pink-300 hover:bg-pink-50' },
                        'Cleansing': { selected: 'from-sky-500 to-cyan-500', unselected: 'border-sky-300 hover:bg-sky-50' },
                        'Sun Care': { selected: 'from-amber-500 to-yellow-500', unselected: 'border-amber-300 hover:bg-amber-50' },
                        'Makeup': { selected: 'from-fuchsia-500 to-pink-500', unselected: 'border-fuchsia-300 hover:bg-fuchsia-50' },
                        'Hair Care': { selected: 'from-violet-500 to-purple-500', unselected: 'border-violet-300 hover:bg-violet-50' },
                        'Body Care': { selected: 'from-emerald-500 to-teal-500', unselected: 'border-emerald-300 hover:bg-emerald-50' },
                        'Mens Care': { selected: 'from-indigo-500 to-blue-500', unselected: 'border-indigo-300 hover:bg-indigo-50' },
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
                        <InfoTooltip
                          title="꿀조합 가이드"
                          description="여러 성분, 제형, 기능이 조합된 트렌드를 보여줍니다. 각 조합이 왜 효과적인지 SNS, 리테일, 리뷰 데이터로 검증된 트렌드입니다."
                          usage="기획팀: 신제품 개발 시 참고 / 마케팅팀: 캠페인 메시지 개발 / R&D: 성분 조합 연구"
                          terms={[
                            { term: '🌱 Early Trend', meaning: 'SNS 중심으로 초기 관심 신호가 관찰되는 단계 (구매·리뷰 데이터는 제한적)' },
                            { term: '📈 Growing Trend', meaning: 'SNS 관심 증가와 함께 구매 지표가 동반 상승하는 단계 (Action 가능성 검토 구간)' },
                            { term: '🚀 Actionable Trend', meaning: '관심·구매·리뷰 지표가 모두 정합성을 보이며 실무 의사결정에 즉시 활용 가능한 단계' },
                            { term: '📉 Cooling', meaning: '하락세인 트렌드 - 인기가 감소하고 있는 트렌드' },
                            { term: '🚀 Actionable Trend', meaning: '즉시 활용 가능한 검증된 트렌드' },
                            { term: '🌱 Early Signal', meaning: '초기 단계의 유망 트렌드' },
                          ]}
                        />
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
                            };
                            const categoryColors: Record<MainCategory, { selected: string; unselected: string }> = {
                              'Skincare': { selected: 'from-pink-500 to-rose-500', unselected: 'border-pink-300 hover:bg-pink-50' },
                              'Cleansing': { selected: 'from-sky-500 to-cyan-500', unselected: 'border-sky-300 hover:bg-sky-50' },
                              'Sun Care': { selected: 'from-amber-500 to-yellow-500', unselected: 'border-amber-300 hover:bg-amber-50' },
                              'Makeup': { selected: 'from-fuchsia-500 to-pink-500', unselected: 'border-fuchsia-300 hover:bg-fuchsia-50' },
                              'Hair Care': { selected: 'from-violet-500 to-purple-500', unselected: 'border-violet-300 hover:bg-violet-50' },
                              'Body Care': { selected: 'from-emerald-500 to-teal-500', unselected: 'border-emerald-300 hover:bg-emerald-50' },
                              'Mens Care': { selected: 'from-indigo-500 to-blue-500', unselected: 'border-indigo-300 hover:bg-indigo-50' },
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
                      <div className="space-y-0">
                        {isCombinationLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                            <span className="ml-2 text-sm text-slate-500">로딩 중...</span>
                          </div>
                        ) : currentData.map((item, index) => (
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
                  />
                </div>

                {/* Retail/SNS Top Chart & Metrics (4/12) */}
                <div className="col-span-4 flex flex-col gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-slate-800">Retail/SNS Top 키워드</h3>
                      <InfoTooltip
                        title="Retail/SNS 차트 가이드"
                        description="국가별 주요 SNS·리테일 플랫폼에서 인기 키워드(성분, 제형, 효과) Top 5를 보여줍니다."
                        usage="플랫폼별 타겟 고객층 파악 / 채널별 마케팅 전략 수립 / 키워드별 SNS 트렌드 비교"
                      />
                    </div>
                    <SNSTopChart data={getSNSTopKeywordsByCountry(country)} country={country} category={selectedCategory || 'Skincare'} />
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* 우측 패널: AI 근거 (30%) - WhiteSpace 모드가 아닐 때만 표시 */}
          {!isWhiteSpaceMode && (
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

      {/* 제품 비교 확인 다이얼로그 */}
      <AnimatePresence>
        {showComparisonDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleComparisonCancel}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">제품 비교</h3>
                <p className="text-slate-700 mb-6">
                  {pendingOverseasProduct?.name}과(와) {pendingDomesticProduct?.name}을(를) 비교하시겠습니까?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleComparisonCancel}
                    className="px-6 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleComparisonConfirm}
                    className={`px-6 py-2 rounded-lg bg-gradient-to-r ${theme.gradient} text-white font-medium hover:shadow-lg transition-all`}
                  >
                    확인
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
    </div>
  );
}

