import { useState, useEffect, useMemo, useCallback } from 'react';
import { BubbleItem, MainCategory, ItemType, TrendLevel, TrendStatus, Country } from '../data/mockData';
import InfoTooltip from './InfoTooltip';
import { Info, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { leaderboardData, convertLeaderboardToBubbleItems, getCountryDataKey } from '../data/leaderboardData';
import { fetchLeaderboard } from '../services/api';
import { translateKeyword } from '../utils/koreanTranslations';

type LeaderboardType = 'ingredient' | 'formula' | 'effect' | 'visual' | 'combined';
type StatusFilter = 'all' | 'early' | 'growing' | 'actionable';

interface SegmentedLeaderboardProps {
  data: BubbleItem[];
  region?: 'domestic' | 'overseas';
  country?: Country;
  onSelectItem?: (item: BubbleItem, rank: number, type: 'ingredient' | 'formula' | 'effect' | 'visual' | 'combined') => void;
  onCategoryChange?: (category: MainCategory) => void;
}

export default function SegmentedLeaderboard({ data, region = 'domestic', country = 'usa', onSelectItem, onCategoryChange }: SegmentedLeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>('Skincare');
  const [activeType, setActiveType] = useState<LeaderboardType>('combined');
  // 각 타입별로 별도의 상태 필터 관리 (기본값 actionable)
  const [statusFilters, setStatusFilters] = useState<Record<LeaderboardType, Exclude<StatusFilter, 'all'>>>({
    ingredient: 'actionable',
    formula: 'actionable',
    effect: 'actionable',
    visual: 'actionable',
    combined: 'actionable',
  });
  
  // 대분류 카테고리 목록
  const mainCategories: MainCategory[] = ['Skincare', 'Cleansing', 'Sun Care', 'Makeup', 'Hair Care', 'Body Care', 'Mens Care'];
  
  // 대분류 카테고리 한글 이름
  const categoryNames: Record<MainCategory, string> = {
    'Skincare': '스킨케어',
    'Cleansing': '클렌징',
    'Sun Care': '선케어',
    'Makeup': '메이크업',
    'Hair Care': '헤어케어',
    'Body Care': '바디케어',
    'Mens Care': '맨즈케어',
  };
  
  // API에서 실제 데이터 가져오기
  const [apiData, setApiData] = useState<BubbleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (selectedCategory) {
      setIsLoading(true);
      const itemTypeMap: Record<LeaderboardType, string> = {
        ingredient: 'Ingredients',
        formula: 'Texture',
        effect: 'Effects',
        visual: 'Visual/Mood',
        combined: 'all'
      };

      const fetchType = itemTypeMap[activeType];

      // 종합 탭은 모든 타입 데이터를 병합
      const fetchPromise = fetchType === 'all'
        ? Promise.all([
            fetchLeaderboard(country, selectedCategory, 'Ingredients', statusFilters[activeType]),
            fetchLeaderboard(country, selectedCategory, 'Texture', statusFilters[activeType]),
            fetchLeaderboard(country, selectedCategory, 'Effects', statusFilters[activeType]),
            fetchLeaderboard(country, selectedCategory, 'Visual/Mood', statusFilters[activeType]),
          ]).then(([ing, tex, eff, vis]) => [...ing, ...tex, ...eff, ...vis].sort((a, b) => b.score - a.score).slice(0, 7))
        : fetchLeaderboard(country, selectedCategory, fetchType, statusFilters[activeType]);

      fetchPromise
        .then(items => {
          // API 데이터를 BubbleItem 형식으로 변환
          const bubbleItems: BubbleItem[] = items.map((item, idx) => {
            // API 응답의 trendLevel 사용, 없으면 현재 필터 기준
            const level = item.trendLevel || (statusFilters[activeType] === 'actionable' ? 'Actionable' :
                          statusFilters[activeType] === 'growing' ? 'Growing' : 'Early');
            const statusMap: Record<string, TrendStatus> = {
              'Actionable': '🚀 Actionable Trend',
              'Growing': '📈 Growing Trend',
              'Early': '🌱 Early Trend'
            };
            // Generate mock reviewKeywords based on keyword name
            const positiveKeywords = ['효과 좋음', '보습력', '순한 성분', '재구매 의사', '가성비'];
            const negativeKeywords = ['자극', '효과 미미', '가격 부담'];
            const reviewKeywords = {
              positive: positiveKeywords.map((kw, i) => ({
                keyword: kw,
                count: Math.floor(Math.random() * 80) + 20 + (positiveKeywords.length - i) * 10
              })),
              negative: negativeKeywords.map((kw, i) => ({
                keyword: kw,
                count: Math.floor(Math.random() * 30) + 5 + (negativeKeywords.length - i) * 5
              }))
            };

            return {
              id: `api-${item.keyword}-${idx}`,
              name: item.keyword,
              type: activeType === 'combined' ? 'combined' as const :
                    activeType === 'ingredient' ? 'ingredient' as const :
                    activeType === 'formula' ? 'formula' as const :
                    activeType === 'effect' ? 'effect' as const : 'visual' as const,
              x: Math.random() * 100,
              y: Math.random() * 100,
              size: item.score,
              value: item.score,
              status: statusMap[level] || ('📈 Growing Trend' as TrendStatus),
              reviewKeywords
            };
          });
          setApiData(bubbleItems);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('API 데이터 로드 실패:', error);
          setIsLoading(false);
        });
    }
  }, [selectedCategory, country, activeType, statusFilters]);
  
  // 새로운 데이터 구조 사용 여부 확인
  const countryDataKey = getCountryDataKey(country);
  const hasNewData = leaderboardData[countryDataKey] !== undefined;
  
  // 실제 API 데이터가 있으면 우선 사용, 없으면 mock 데이터 사용
  const displayData = useMemo(() => {
    if (apiData.length > 0) {
      return apiData;
    }
    if (hasNewData && selectedCategory) {
      return convertLeaderboardToBubbleItems(
        leaderboardData[countryDataKey],
        selectedCategory,
        null,
        null,
        country
      );
    }
    return data;
  }, [apiData, hasNewData, selectedCategory, countryDataKey, country, data]);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedItems, setUpdatedItems] = useState<Set<string>>(new Set());
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [pulsingBars, setPulsingBars] = useState<Set<string>>(new Set());

  // 상태별 필터링 함수
  const filterByStatus = (items: BubbleItem[], filter: Exclude<StatusFilter, 'all'>) => {
    return items.filter(item => {
      if (!item.status) return true;
      if (filter === 'early') return item.status.includes('Early Trend');
      if (filter === 'growing') return item.status.includes('Growing Trend');
      if (filter === 'actionable') return item.status.includes('Actionable Trend');
      return true;
    });
  };

  // 타입별 데이터 필터링 (각 타입의 상태 필터 적용)
  const ingredientData = useMemo(() => {
    return filterByStatus(displayData.filter(item => item.type === 'ingredient'), statusFilters.ingredient).slice(0, 7);
  }, [displayData, statusFilters.ingredient]);
  
  const formulaData = useMemo(() => {
    return filterByStatus(displayData.filter(item => item.type === 'formula'), statusFilters.formula).slice(0, 7);
  }, [displayData, statusFilters.formula]);
  
  const effectData = useMemo(() => {
    return filterByStatus(displayData.filter(item => item.type === 'effect'), statusFilters.effect).slice(0, 7);
  }, [displayData, statusFilters.effect]);
  
  const visualData = useMemo(() => {
    return filterByStatus(displayData.filter(item => item.type === 'visual'), statusFilters.visual).slice(0, 7);
  }, [displayData, statusFilters.visual]);
  
  const combinedData = useMemo(() => {
    const combinedItems = displayData.filter(item => item.type === 'combined');
    return filterByStatus([...combinedItems].sort((a, b) => b.value - a.value), statusFilters.combined).slice(0, 7);
  }, [displayData, statusFilters.combined]);

  const getCurrentData = useCallback(() => {
    switch (activeType) {
      case 'ingredient':
        return ingredientData;
      case 'formula':
        return formulaData;
      case 'effect':
        return effectData;
      case 'visual':
        return visualData;
      case 'combined':
        return combinedData;
      default:
        return combinedData;
    }
  }, [activeType, ingredientData, formulaData, effectData, visualData, combinedData]);

  // 실시간으로 진행 바가 미세하게 변동하는 효과
  useEffect(() => {
    const currentData = getCurrentData();
    const pulseInterval = setInterval(() => {
      const newPulsing = new Set<string>();
      const newValues: Record<string, number> = {};
      
      // 랜덤하게 일부 항목 선택하여 미세한 변동
      currentData.forEach(item => {
        if (Math.random() > 0.7) { // 30% 확률
          newPulsing.add(item.id);
          // 원래 값 기준으로 ±0.5% 범위에서 미세하게 변동
          const variation = (Math.random() - 0.5) * 1; // -0.5 ~ +0.5
          newValues[item.id] = Math.max(0, Math.min(100, item.value + variation));
        }
      });
      
      setPulsingBars(newPulsing);
      if (Object.keys(newValues).length > 0) {
        setAnimatedValues(prev => ({ ...prev, ...newValues }));
      }
      
      // 1초 후 원래 값으로 복원
      setTimeout(() => {
        const restoreValues: Record<string, number> = {};
        currentData.forEach(item => {
          if (newPulsing.has(item.id)) {
            restoreValues[item.id] = item.value;
          }
        });
        setAnimatedValues(prev => ({ ...prev, ...restoreValues }));
        setPulsingBars(new Set());
      }, 1000);
    }, 2000); // 2초마다 미세한 변동
    
    return () => clearInterval(pulseInterval);
  }, [activeType, statusFilters, displayData, ingredientData, formulaData, effectData, visualData, combinedData, getCurrentData]);

  // 실시간 업데이트 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => {
        setIsUpdating(false);
        // 랜덤하게 일부 항목을 업데이트된 것으로 표시
        const currentData = getCurrentData();
        if (currentData.length === 0) return;
        
        const randomItems = new Set<string>();
        const count = Math.min(2, currentData.length);
        const usedIndices = new Set<number>();
        
        for (let i = 0; i < count; i++) {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * currentData.length);
          } while (usedIndices.has(randomIndex));
          usedIndices.add(randomIndex);
          randomItems.add(currentData[randomIndex].id);
        }
        
        setUpdatedItems(randomItems);
        
        // 애니메이션 값 업데이트 (값을 약간 변경하여 업데이트 효과)
        const newValues: Record<string, number> = {};
        currentData.forEach(item => {
          if (randomItems.has(item.id)) {
            // 값에 약간의 변동을 주어 업데이트 효과
            const variation = (Math.random() - 0.5) * 2; // -1 ~ +1
            newValues[item.id] = Math.max(0, Math.min(100, item.value + variation));
          }
        });
        setAnimatedValues(prev => ({ ...prev, ...newValues }));
        
        // 2초 후 하이라이트 제거 및 원래 값으로 복원
        setTimeout(() => {
          setUpdatedItems(new Set());
          const restoreValues: Record<string, number> = {};
          currentData.forEach(item => {
            if (randomItems.has(item.id)) {
              restoreValues[item.id] = item.value;
            }
          });
          setAnimatedValues(prev => ({ ...prev, ...restoreValues }));
        }, 2000);
      }, 500);
    }, 8000); // 8초마다 업데이트

    return () => clearInterval(interval);
  }, [activeType, statusFilters, displayData, ingredientData, formulaData, effectData, visualData, combinedData, getCurrentData]);

  // 숫자 카운터 애니메이션을 위한 useEffect
  useEffect(() => {
    const currentData = getCurrentData();
    // 초기값을 실제 값으로 설정 (애니메이션 없이 바로 표시)
    const initialValues: Record<string, number> = {};
    currentData.forEach(item => {
      initialValues[item.id] = item.value;
    });
    setAnimatedValues(initialValues);
  }, [activeType, statusFilters, displayData, ingredientData, formulaData, effectData, visualData, combinedData, getCurrentData]);

  const tabs: Array<{ id: LeaderboardType; label: string; icon: string }> = [
    { id: 'ingredient', label: '성분', icon: '🧪' },
    { id: 'formula', label: '제형', icon: '💧' },
    { id: 'effect', label: '효과', icon: '✨' },
    { id: 'visual', label: 'visual/mood', icon: '🎨' },
    { id: 'combined', label: '종합', icon: '📊' },
  ];
  
  return (
    <div className="flex flex-col h-full">
      {/* 탭 헤더 */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-900">리더보드</h2>
        <InfoTooltip
          title="리더보드 가이드"
          description="성분, 제형, 기능별로 분리된 트렌드 순위를 확인할 수 있습니다. 종합은 모든 카테고리를 통합한 순위입니다."
          usage="성분 리더보드: 어떤 성분이 유행인지 빠르게 확인 / 제형 리더보드: 사용감이나 제형 변화 흐름 파악 / 기능 리더보드: 소비자 니즈 변화 확인 / 종합 리더보드: 실제 시장에서 의미 있게 결합되고 있는 조합을 한번에 확인"
          terms={[
            { term: '🌱 Early Trend', meaning: 'SNS 중심으로 초기 관심 신호가 관찰되는 단계 (구매·리뷰 데이터는 제한적)' },
            { term: '📈 Growing Trend', meaning: 'SNS 관심 증가와 함께 구매 지표가 동반 상승하는 단계 (Action 가능성 검토 구간)' },
            { term: '🚀 Actionable Trend', meaning: '관심·구매·리뷰 지표가 모두 정합성을 보이며 실무 의사결정에 즉시 활용 가능한 단계' },
            { term: '📉 Cooling', meaning: '하락세인 트렌드 - 인기가 감소하고 있는 트렌드' },
          ]}
        />
      </div>

      {/* 대분류 카테고리 선택 (새 데이터 구조 사용 시) */}
      {hasNewData && (
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
                  onClick={() => {
                    setSelectedCategory(category);
                    onCategoryChange?.(category);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                    selectedCategory === category
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
      )}

      {/* 탭 버튼 */}
      <div className="flex gap-2 mb-3 flex-wrap flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeType === tab.id
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 상태 필터 - 각 탭별로 독립적으로 작동 (전체 제외) */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <span className="text-sm text-slate-900">상태 필터:</span>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'early' as const, label: '🌱 Early Trend', icon: '🌱', tooltip: 'SNS 중심으로 초기 관심 신호가 관찰되는 단계 (구매·리뷰 데이터는 제한적)' },
            { id: 'growing' as const, label: '📈 Growing Trend', icon: '📈', tooltip: 'SNS 관심 증가와 함께 구매 지표가 동반 상승하는 단계 (Action 가능성 검토 구간)' },
            { id: 'actionable' as const, label: '🚀 Actionable Trend', icon: '🚀', tooltip: '관심·구매·리뷰 지표가 모두 정합성을 보이며 실무 의사결정에 즉시 활용 가능한 단계' },
          ].map((filter) => (
            <div key={filter.id} className="relative group">
              <button
                onClick={() => setStatusFilters(prev => ({ ...prev, [activeType]: filter.id }))}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 ${
                  statusFilters[activeType] === filter.id
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-rose-900/30 text-rose-200/70 hover:bg-rose-900/50 border border-rose-800/30'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
                <div className="relative">
                  <Info className="w-3 h-3 text-slate-700 hover:text-slate-900" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    <div className="bg-white/98 backdrop-blur-md border border-slate-300 rounded-lg p-3 shadow-2xl">
                      <p className="text-slate-900 text-xs leading-relaxed">{filter.tooltip}</p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-700" />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 리더보드 내용 */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        <div className="space-y-2">
          {getCurrentData().map((item, index) => {
            const getStatusColor = (status?: string) => {
              if (status?.includes('Actionable Trend')) {
                return 'bg-orange-400/80 text-slate-900 border-orange-500 font-semibold';
              } else if (status?.includes('Growing Trend')) {
                return 'bg-emerald-400/80 text-slate-900 border-emerald-500 font-semibold';
              } else if (status?.includes('Early Trend')) {
                return 'bg-violet-400/80 text-slate-900 border-violet-500 font-semibold';
              } else {
                return 'bg-slate-300/80 text-slate-900 border-slate-400 font-semibold';
              }
            };

            const getTypeColor = (type: string) => {
              if (type === 'ingredient') {
                return 'bg-pink-400/80 text-slate-900 border-pink-500 font-semibold';
              } else if (type === 'formula') {
                return 'bg-rose-400/80 text-slate-900 border-rose-500 font-semibold';
              } else if (type === 'visual') {
                return 'bg-purple-400/80 text-slate-900 border-purple-500 font-semibold';
              } else {
                return 'bg-coral-400/80 text-slate-900 border-coral-500 font-semibold';
              }
            };

            const getIntensity = (value: number) => {
              if (value >= 90) return { level: '🔥', color: 'text-red-400', label: '핫' };
              if (value >= 80) return { level: '🚀', color: 'text-rose-400', label: '상승' };
              return { level: '📈', color: 'text-pink-400', label: '안정' };
            };

            const intensity = getIntensity(item.value);
            const statusColor = getStatusColor(item.status);
            const typeColor = getTypeColor(item.type);

            const isUpdated = updatedItems.has(item.id);
            // animatedValues가 있으면 사용, 없거나 0이면 원래 값 사용
            const displayValue = (animatedValues[item.id] !== undefined && animatedValues[item.id] > 0) 
              ? Math.round(animatedValues[item.id]) 
              : item.value;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: isUpdated ? [1, 1.02, 1] : 1,
                  boxShadow: isUpdated ? '0 0 20px rgba(244, 63, 94, 0.3)' : 'none'
                }}
                transition={{ 
                  delay: index * 0.05,
                  scale: { duration: 0.3 },
                  boxShadow: { duration: 0.3 }
                }}
                className={`bg-white/95 backdrop-blur-sm border rounded-lg overflow-hidden hover:border-rose-400 transition-all cursor-pointer shadow-sm ${
                  isUpdated ? 'border-rose-400 ring-2 ring-rose-300/50' : 'border-slate-200/80'
                }`}
                onClick={() => onSelectItem?.(item, index + 1, activeType)}
              >
                <div className="w-full px-4 py-3 flex items-center justify-between relative">
                  {/* 업데이트 인디케이터 */}
                  {isUpdated && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-2 right-2"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 bg-rose-500 rounded-full"
                      />
                    </motion.div>
                  )}
                  
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <motion.span 
                      className="text-rose-600 font-bold text-lg w-8"
                      animate={isUpdated ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {index + 1}
                    </motion.span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded border backdrop-blur-sm ${typeColor}`}>
                          {item.type === 'ingredient' ? '성분' : item.type === 'formula' ? '제형' : item.type === 'effect' ? '효과' : item.type === 'visual' ? 'visual/mood' : '종합'}
                        </span>
                        {item.status && (
                          <span className={`text-xs px-2 py-0.5 rounded border backdrop-blur-sm ${statusColor}`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-slate-900 font-medium">
                        {item.name}
                        {(() => {
                          const translated = translateKeyword(item.name);
                          return translated !== item.name ? (
                            <span className="text-slate-500 text-xs font-normal ml-1">({translated})</span>
                          ) : null;
                        })()}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <motion.div 
                        className="text-lg font-bold text-slate-900 flex items-center gap-1"
                        animate={isUpdated ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <span className={intensity.color}>{intensity.level}</span>
                        <motion.span
                          key={displayValue}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {displayValue}%
                        </motion.span>
                      </motion.div>
                      <div className="text-xs text-slate-900">{intensity.label}</div>
                    </div>
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${displayValue}%`,
                          scaleX: pulsingBars.has(item.id) ? [1, 1.02, 1] : 1,
                        }}
                        transition={{ 
                          delay: index * 0.1 + 0.3, 
                          duration: pulsingBars.has(item.id) ? 0.5 : 0.8, 
                          ease: pulsingBars.has(item.id) ? 'easeInOut' : 'easeOut',
                          ...(pulsingBars.has(item.id) ? { repeat: Infinity, repeatType: 'reverse' as const } : { repeat: 0 }),
                        }}
                        className={`h-full rounded-full relative ${
                          displayValue >= 90 ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                          displayValue >= 80 ? 'bg-gradient-to-r from-rose-500 to-pink-500' :
                          'bg-gradient-to-r from-pink-500 to-rose-400'
                        }`}
                        style={{
                          boxShadow: pulsingBars.has(item.id) 
                            ? '0 0 8px rgba(244, 63, 94, 0.6)' 
                            : 'none',
                        }}
                      >
                        {/* 실시간 변동 효과를 위한 글로우 애니메이션 */}
                        {pulsingBars.has(item.id) && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                            animate={{
                              x: ['-100%', '100%'],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

