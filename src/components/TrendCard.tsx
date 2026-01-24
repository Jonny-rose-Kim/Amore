import { motion, AnimatePresence } from 'framer-motion';
import { TrendItem } from '../data/mockData';
import { useState, useEffect } from 'react';
import { translateCombination } from '../utils/koreanTranslations';

interface TrendCardProps {
  item: TrendItem;
  isExpanded: boolean;
  onToggle: () => void;
  onClick?: () => void;
}

const getStatusBadgeClass = (status: string) => {
  if (status.includes('Actionable Trend')) {
    return 'bg-orange-400/80 text-slate-900 border-orange-500 font-semibold';
  } else if (status.includes('Growing Trend')) {
    return 'bg-emerald-400/80 text-slate-900 border-emerald-500 font-semibold';
  } else if (status.includes('Early Trend')) {
    return 'bg-violet-400/80 text-slate-900 border-violet-500 font-semibold';
  } else {
    return 'bg-slate-300/80 text-slate-900 border-slate-400 font-semibold';
  }
};

export default function TrendCard({ item, isExpanded, onToggle, onClick }: TrendCardProps) {
  const [isUpdated, setIsUpdated] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // 랜덤하게 업데이트 효과 트리거
  useEffect(() => {
    const randomDelay = Math.random() * 10000 + 5000; // 5-15초 사이 랜덤
    const timer = setTimeout(() => {
      setIsUpdated(true);
      setPulseAnimation(true);
      setTimeout(() => {
        setIsUpdated(false);
        setPulseAnimation(false);
      }, 2000);
    }, randomDelay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isUpdated ? [1, 1.02, 1] : 1,
        boxShadow: isUpdated ? '0 0 20px rgba(244, 63, 94, 0.3)' : 'none'
      }}
      transition={{ 
        scale: { duration: 0.3 },
        boxShadow: { duration: 0.3 }
      }}
      className={`bg-white/95 backdrop-blur-sm border rounded-lg overflow-hidden mb-2 hover:border-rose-400 transition-all cursor-pointer shadow-sm relative ${
        isUpdated ? 'border-rose-400 ring-2 ring-rose-300/50' : 'border-slate-200/80'
      }`}
      onClick={onClick}
    >
      {/* 업데이트 인디케이터 */}
      <AnimatePresence>
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
      </AnimatePresence>

      <div className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-4 flex-1 text-left">
          <motion.span 
            className="text-rose-600 font-bold text-lg w-8"
            animate={isUpdated ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {item.rank}
          </motion.span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-slate-900 bg-slate-200 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-400 font-medium">
                {item.category}
              </span>
              {item.trendType && (
                <span className={`text-xs px-2 py-0.5 rounded border backdrop-blur-sm font-semibold ${
                  item.trendType === 'Early Signal'
                    ? 'bg-purple-400/80 text-slate-900 border-purple-500'
                    : 'bg-cyan-400/80 text-slate-900 border-cyan-500'
                }`}>
                  {item.trendType === 'Early Signal' ? '🌱 Early Signal' : '🚀 Actionable Trend'}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded border backdrop-blur-sm ${getStatusBadgeClass(item.status)}`}>
                {item.status}
              </span>
            </div>
            <h3 className="text-slate-900 font-medium">
              {item.combination}
              {item.combination && (
                <span className="text-slate-500 text-xs font-normal ml-1">
                  ({translateCombination(item.combination)})
                </span>
              )}
            </h3>
          </div>
        </div>
      </div>
      
      {/* 드롭다운 제거 - 클릭 시 바로 AI 분석 표시 */}
    </motion.div>
  );
}

