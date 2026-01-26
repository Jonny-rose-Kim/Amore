import { Info } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoTooltipProps {
  title: string;
  description: string;
  usage?: string;
  terms?: { term: string; meaning: string }[];
  position?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'bottom-right';
}

export default function InfoTooltip({
  title,
  description,
  usage,
  terms = [],
  position = 'bottom'
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    'bottom-left': 'top-full right-0 mt-2',
    'bottom-right': 'top-full left-0 mt-2',
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-600 hover:text-slate-800 transition-colors"
      >
        <Info className="w-4 h-4" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 w-80 ${positionClasses[position]}`}
          >
            <div className="bg-white/98 backdrop-blur-md border border-slate-300 rounded-lg p-4 shadow-2xl">
              <h4 className="text-slate-900 font-semibold text-sm mb-2">{title}</h4>
              <p className="text-slate-900 text-xs mb-3 leading-relaxed">{description}</p>
              
              {usage && (
                <div className="mb-3">
                  <p className="text-slate-700 text-xs font-medium mb-1">활용 방법:</p>
                  <p className="text-slate-900 text-xs leading-relaxed">{usage}</p>
                </div>
              )}
              
              {terms.length > 0 && (
                <div>
                  <p className="text-slate-700 text-xs font-medium mb-2">용어 설명:</p>
                  <div className="space-y-1">
                    {terms.map((term, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-rose-600 text-xs font-medium min-w-[60px]">{term.term}:</span>
                        <span className="text-slate-900 text-xs flex-1">{term.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* 화살표 */}
            <div className={`absolute ${position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2' : position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 rotate-180' : ''} w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-300`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

