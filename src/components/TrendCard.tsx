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

export default function TrendCard({ item, isExpanded: _isExpanded, onToggle: _onToggle, onClick }: TrendCardProps) {
  const [isUpdated, setIsUpdated] = useState(false);

  // 랜덤하게 업데이트 효과 트리거
  useEffect(() => {
    const randomDelay = Math.random() * 10000 + 5000; // 5-15초 사이 랜덤
    const timer = setTimeout(() => {
      setIsUpdated(true);
      setTimeout(() => {
        setIsUpdated(false);
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
      className={`bg-white/95 backdrop-blur-sm border rounded-xl overflow-hidden hover:border-rose-400 transition-all cursor-pointer shadow-md relative ${
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

      <div className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-4 flex-1 text-left">
          {/* 순위 - 메달 아이콘 */}
          <motion.span
            className={`font-bold text-xl w-10 text-center ${
              item.rank === 1 ? 'text-amber-500' :
              item.rank === 2 ? 'text-slate-400' :
              item.rank === 3 ? 'text-amber-700' : 'text-rose-600'
            }`}
            animate={isUpdated ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
          </motion.span>
          <div className="flex-1">
            {/* 조합 이름 */}
            <h3 className="text-slate-900 font-semibold text-base mb-2">
              {item.combination}
              {item.combination && (
                <span className="text-slate-500 text-sm font-normal ml-2">
                  ({translateCombination(item.combination)})
                </span>
              )}
            </h3>
            {/* 조합 구성 요소 태그 */}
            <div className="flex items-center gap-2 flex-wrap">
              {item.ingredients?.map((ing, i) => (
                <span key={`ing-${i}`} className="text-sm px-2 py-1 bg-pink-100 text-pink-700 rounded-lg border border-pink-200 font-medium">
                  🧪 {ing}
                </span>
              ))}
              {item.formulas?.map((form, i) => (
                <span key={`form-${i}`} className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 font-medium">
                  💧 {form}
                </span>
              ))}
              {item.effects?.map((eff, i) => (
                <span key={`eff-${i}`} className="text-sm px-2 py-1 bg-amber-100 text-amber-700 rounded-lg border border-amber-200 font-medium">
                  ✨ {eff}
                </span>
              ))}
              {item.moods?.filter(m => !item.effects?.includes(m)).map((mood, i) => (
                <span key={`mood-${i}`} className="text-sm px-2 py-1 bg-purple-100 text-purple-700 rounded-lg border border-purple-200 font-medium">
                  🎨 {mood}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 드롭다운 제거 - 클릭 시 바로 AI 분석 표시 */}
    </motion.div>
  );
}

