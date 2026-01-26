import { BubbleItem } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Sparkles, Lightbulb, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TrendVisualizationProps {
  data: BubbleItem[];
  region?: 'domestic' | 'overseas';
  showRanking?: boolean;
  leaderboardType?: 'ingredient' | 'formula' | 'effect' | 'combined';
  onItemClick?: (item: BubbleItem) => void;
}

const getBubbleColor = (type: string, isOverseas: boolean = false) => {
  if (isOverseas) {
    switch (type) {
      case 'ingredient':
        return {
          bg: 'from-amber-500/20 to-yellow-500/20',
          border: 'border-amber-400/40',
          text: 'text-amber-300',
          glow: 'shadow-amber-500/30',
          icon: 'bg-amber-500/30',
        };
      case 'formula':
        return {
          bg: 'from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-400/40',
          text: 'text-yellow-300',
          glow: 'shadow-yellow-500/30',
          icon: 'bg-yellow-500/30',
        };
      case 'effect':
        return {
          bg: 'from-orange-500/20 to-amber-500/20',
          border: 'border-orange-400/40',
          text: 'text-orange-200',
          glow: 'shadow-orange-500/30',
          icon: 'bg-orange-500/30',
        };
      default:
        return {
          bg: 'from-slate-500/20 to-slate-600/20',
          border: 'border-slate-400/40',
          text: 'text-slate-300',
          glow: 'shadow-slate-500/30',
          icon: 'bg-slate-500/30',
        };
    }
  } else {
    switch (type) {
      case 'ingredient':
        return {
          bg: 'from-pink-500/20 to-rose-500/20',
          border: 'border-pink-400/40',
          text: 'text-pink-300',
          glow: 'shadow-pink-500/30',
          icon: 'bg-pink-500/30',
        };
      case 'formula':
        return {
          bg: 'from-rose-500/20 to-pink-500/20',
          border: 'border-rose-400/40',
          text: 'text-rose-300',
          glow: 'shadow-rose-500/30',
          icon: 'bg-rose-500/30',
        };
      case 'effect':
        return {
          bg: 'from-pink-400/20 to-rose-400/20',
          border: 'border-pink-300/40',
          text: 'text-pink-200',
          glow: 'shadow-pink-400/30',
          icon: 'bg-pink-400/30',
        };
      default:
        return {
          bg: 'from-slate-500/20 to-slate-600/20',
          border: 'border-slate-400/40',
          text: 'text-slate-300',
          glow: 'shadow-slate-500/30',
          icon: 'bg-slate-500/30',
        };
    }
  }
};

const getTrendIntensity = (value: number, status?: string) => {
  // trendLevel 기반 (status에서 추출)
  if (status) {
    if (status.includes('Actionable')) return { level: '🔥', label: '핫', color: 'text-red-400' };
    if (status.includes('Growing')) return { level: '🚀', label: '상승', color: 'text-rose-400' };
    if (status.includes('Early')) return { level: '🌱', label: '초기', color: 'text-green-400' };
  }
  // Fallback: score 기반
  if (value >= 80) return { level: '🔥', label: '핫', color: 'text-red-400' };
  if (value >= 60) return { level: '🚀', label: '상승', color: 'text-rose-400' };
  return { level: '🌱', label: '초기', color: 'text-green-400' };
};

const getStatusColor = (status?: string) => {
  if (!status) return {
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/30',
    text: 'text-slate-300',
    badge: 'bg-slate-500/30 text-slate-300 border-slate-500/30',
  };
  
  if (status.includes('Actionable Trend')) {
    return {
      bg: 'bg-orange-500/25',
      border: 'border-orange-400/50',
      text: 'text-orange-200',
      badge: 'bg-orange-500/40 text-orange-100 border-orange-400/60',
    };
  } else if (status.includes('Growing Trend')) {
    return {
      bg: 'bg-emerald-500/25',
      border: 'border-emerald-400/50',
      text: 'text-emerald-200',
      badge: 'bg-emerald-500/40 text-emerald-100 border-emerald-400/60',
    };
  } else if (status.includes('Early Trend')) {
    return {
      bg: 'bg-violet-500/25',
      border: 'border-violet-400/50',
      text: 'text-violet-200',
      badge: 'bg-violet-500/40 text-violet-100 border-violet-400/60',
    };
  } else {
    return {
      bg: 'bg-slate-500/20',
      border: 'border-slate-500/40',
      text: 'text-slate-400',
      badge: 'bg-slate-500/30 text-slate-400 border-slate-500/50',
    };
  }
};

export default function TrendVisualization({ data, region = 'domestic', onItemClick }: TrendVisualizationProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const isOverseas = region === 'overseas';
  
  // 값에 따라 정렬 (높은 순)
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  const handleItemClick = (item: BubbleItem) => {
    setExpandedItem(expandedItem === item.id ? null : item.id);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`backdrop-blur-sm rounded-xl p-4 border h-full flex flex-col shadow-2xl overflow-hidden transition-all duration-500 ${
        isOverseas
          ? 'bg-gradient-to-br from-amber-950/40 to-yellow-950/40 border-amber-500/30'
          : 'bg-gradient-to-br from-rose-950/40 to-pink-950/40 border-rose-500/30'
      }`}
    >
      <div className="flex-shrink-0 mb-4">
        <h3 className={`text-xl font-bold text-white mb-3 flex items-center gap-2 transition-colors duration-500 ${
          isOverseas ? '' : ''
        }`}>
          <Sparkles className={`w-5 h-5 transition-colors duration-500 ${
            isOverseas ? 'text-amber-300' : 'text-rose-300'
          }`} />
          <span className={`bg-clip-text text-transparent transition-all duration-500 ${
            isOverseas
              ? 'bg-gradient-to-r from-amber-300 to-yellow-300'
              : 'bg-gradient-to-r from-rose-300 to-pink-300'
          }`}>
            실시간 트렌드 맵
          </span>
        </h3>
        <div className="flex gap-2 text-xs mb-3">
          <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all duration-500 ${
            isOverseas
              ? 'bg-amber-500/20 border-amber-500/30'
              : 'bg-pink-500/20 border-pink-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
              isOverseas ? 'bg-amber-400' : 'bg-pink-400'
            }`}></div>
            <span className={isOverseas ? 'text-amber-200' : 'text-rose-200'}>
              성분
            </span>
          </div>
          <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all duration-500 ${
            isOverseas
              ? 'bg-yellow-500/20 border-yellow-500/30'
              : 'bg-rose-500/20 border-rose-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
              isOverseas ? 'bg-yellow-500' : 'bg-rose-500'
            }`}></div>
            <span className={isOverseas ? 'text-amber-200' : 'text-rose-200'}>
              제형
            </span>
          </div>
          <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all duration-500 ${
            isOverseas
              ? 'bg-orange-500/20 border-orange-500/30'
              : 'bg-pink-300/20 border-pink-300/30'
          }`}>
            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
              isOverseas ? 'bg-orange-400' : 'bg-pink-300'
            }`}></div>
            <span className={isOverseas ? 'text-amber-200' : 'text-rose-200'}>
              효과
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3" style={{ height: '100%', maxHeight: '100%' }}>
        {/* 모든 트렌드 */}
        <div>
          <div className="space-y-2">
            {sortedData.map((item, index) => {
              const colors = getBubbleColor(item.type, isOverseas);
              const intensity = getTrendIntensity(item.value, item.status);
              const statusColors = getStatusColor(item.status);
              const isHovered = hoveredItem === item.id;
              
              const isExpanded = expandedItem === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: isHovered ? 1.02 : 1,
                  }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`relative bg-gradient-to-r ${statusColors.bg} border-2 ${statusColors.border} rounded-lg overflow-hidden transition-all ${
                    isHovered ? 'shadow-lg ' + colors.glow : ''
                  }`}
                >
                  <button
                    onClick={() => handleItemClick(item)}
                    className="w-full p-3 flex items-center justify-between hover:opacity-90 transition-opacity"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      {/* 순위 배지 */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.icon} flex items-center justify-center font-bold text-white text-sm`}>
                        {index + 1}
                      </div>
                      
                      {/* 트렌드 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-bold text-white">{item.name}</span>
                          <span className={`text-lg ${intensity.color}`}>{intensity.level}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded ${colors.icon} ${colors.text} font-medium`}>
                            {item.type === 'ingredient' ? '성분' : item.type === 'formula' ? '제형' : '효과'}
                          </span>
                          <span className="text-rose-200/70">{intensity.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* 인기도 바 및 확장 아이콘 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{item.value}%</div>
                        <div className="text-xs text-rose-200/70">인기도</div>
                      </div>
                      <div className="w-24 h-2 bg-rose-900/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            item.value >= 90 ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                            item.value >= 80 ? 'bg-gradient-to-r from-rose-500 to-pink-500' :
                            'bg-gradient-to-r from-pink-500 to-rose-400'
                          }`}
                          style={{ boxShadow: `0 0 10px ${colors.glow.replace('shadow-', '').replace('/30', '')}` }}
                        />
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-white/70" />
                      </motion.div>
                    </div>
                  </button>
                  
                  {/* 확장 영역 */}
                  <AnimatePresence>
                    {isExpanded && (item.actionGuide || item.combinationReason) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-0 space-y-3">
                          {/* 행동 가이드 */}
                          {item.actionGuide && (
                            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-700/30 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-cyan-300 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-cyan-200 mb-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    기획자 참고 가이드
                                  </h4>
                                  <p className="text-xs text-cyan-100/90 leading-relaxed">{item.actionGuide}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 꿀조합 설명 */}
                          {item.combinationReason && (
                            <div className="bg-gradient-to-r from-rose-900/30 to-pink-900/30 border border-rose-700/30 rounded-lg p-3">
                              <div className="flex items-start gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-rose-300 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-rose-200 mb-1">왜 꿀조합인가요?</h4>
                                  <p className="text-xs text-rose-100/80 leading-relaxed mb-2">{item.combinationReason}</p>
                                  <div className="flex items-center gap-3 text-xs text-rose-200/70 mt-2 pt-2 border-t border-rose-700/30">
                                    <span className="flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                      SNS 데이터 기반
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                      리테일 데이터 기반
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                      리뷰 데이터 기반
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 하단 설명 - 최소화 */}
      <div className={`flex-shrink-0 mt-2 pt-2 border-t transition-colors duration-500 ${
        isOverseas ? 'border-amber-500/20' : 'border-rose-500/20'
      }`}>
        <div className={`flex items-center justify-center gap-3 text-xs transition-colors duration-500 ${
          isOverseas ? 'text-amber-200/70' : 'text-rose-200/70'
        }`}>
          <div className="flex items-center gap-1">
            <span className="text-red-400">🔥</span>
            <span>90%+ 핫</span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-1">
            <span className="text-rose-400">🚀</span>
            <span>80%+ 상승</span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-1">
            <span className="text-pink-400">📈</span>
            <span>70%+ 안정</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

