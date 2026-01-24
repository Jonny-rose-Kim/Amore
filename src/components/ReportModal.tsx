import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, FlaskConical, Plane, Layers, Tag, ArrowLeft } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (scope: 'keyword' | 'category', type: 'marketing' | 'npd' | 'overseas') => void;
  hasKeywordSelected: boolean;
  selectedKeyword?: string;
  currentCategory?: string;
}

export default function ReportModal({ isOpen, onClose, onSelect, hasKeywordSelected, selectedKeyword, currentCategory }: ReportModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedScope, setSelectedScope] = useState<'keyword' | 'category' | null>(null);

  const handleClose = () => {
    setStep(1);
    setSelectedScope(null);
    onClose();
  };

  const handleScopeSelect = (scope: 'keyword' | 'category') => {
    setSelectedScope(scope);
    setStep(2);
  };

  const handleTypeSelect = (type: 'marketing' | 'npd' | 'overseas') => {
    if (selectedScope) {
      onSelect(selectedScope, type);
      handleClose();
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedScope(null);
  };

  const scopeOptions = [
    {
      type: 'category' as const,
      icon: Layers,
      title: '카테고리 단위 인사이트',
      description: currentCategory ? `${currentCategory} 카테고리 전체를 분석합니다` : '현재 카테고리 전체를 분석합니다',
      gradient: 'from-indigo-500/20 to-blue-500/20',
      borderColor: 'border-indigo-500/50',
      disabled: false,
    },
    {
      type: 'keyword' as const,
      icon: Tag,
      title: '키워드 단위 인사이트',
      description: hasKeywordSelected
        ? `"${selectedKeyword}" 키워드를 분석합니다`
        : '키워드를 먼저 선택해주세요 (리더보드에서 클릭)',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/50',
      disabled: !hasKeywordSelected,
    },
  ];

  const typeOptions = [
    {
      type: 'marketing' as const,
      icon: Megaphone,
      title: '마케팅 캠페인용',
      description: '메시지, 타겟팅, 홍보 채널',
      gradient: 'from-rose-500/20 to-pink-500/20',
      borderColor: 'border-rose-500/50',
    },
    {
      type: 'npd' as const,
      icon: FlaskConical,
      title: '신제품 기획(BM)용',
      description: '성분 배합, 제형 컨셉, USP',
      gradient: 'from-pink-500/20 to-rose-500/20',
      borderColor: 'border-pink-500/50',
    },
    {
      type: 'overseas' as const,
      icon: Plane,
      title: '해외 진출 전략용',
      description: '국가별 선호도, 진입 장벽 분석',
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/50',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-rose-950/95 to-pink-950/95 backdrop-blur-xl border border-rose-800/50 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {step === 2 && (
                    <button
                      onClick={handleBack}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <h2 className="text-2xl font-bold text-white">
                    ✨ AI 맞춤형 인사이트 제공
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  step === 1 ? 'bg-rose-500/30 text-rose-200' : 'bg-slate-700/50 text-slate-400'
                }`}>
                  <span className="w-4 h-4 rounded-full bg-rose-500/50 flex items-center justify-center text-[10px]">1</span>
                  분석 범위
                </div>
                <div className="w-4 h-px bg-slate-600" />
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  step === 2 ? 'bg-rose-500/30 text-rose-200' : 'bg-slate-700/50 text-slate-400'
                }`}>
                  <span className="w-4 h-4 rounded-full bg-rose-500/50 flex items-center justify-center text-[10px]">2</span>
                  목적 선택
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-slate-400 mb-6">
                      분석 범위를 선택해주세요
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                      {scopeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <motion.button
                            key={option.type}
                            whileHover={option.disabled ? {} : { scale: 1.02 }}
                            whileTap={option.disabled ? {} : { scale: 0.98 }}
                            onClick={() => !option.disabled && handleScopeSelect(option.type)}
                            disabled={option.disabled}
                            className={`relative bg-gradient-to-br ${option.gradient} border-2 ${option.borderColor} rounded-xl p-6 text-left transition-all group backdrop-blur-sm ${
                              option.disabled
                                ? 'opacity-40 cursor-not-allowed'
                                : 'hover:border-opacity-100 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg bg-slate-800/50 ${!option.disabled ? 'group-hover:scale-110' : ''} transition-transform`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">
                                  {option.title}
                                </h3>
                                <p className="text-slate-400 text-sm">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-slate-400 mb-2">
                      보고서 유형을 선택해주세요
                    </p>
                    <p className="text-slate-500 text-xs mb-6">
                      {selectedScope === 'keyword'
                        ? `"${selectedKeyword}" 키워드에 대한`
                        : `${currentCategory || 'Skincare'} 카테고리에 대한`
                      } 맞춤형 인사이트를 생성합니다
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                      {typeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <motion.button
                            key={option.type}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTypeSelect(option.type)}
                            className={`relative bg-gradient-to-br ${option.gradient} border-2 ${option.borderColor} rounded-xl p-6 text-left hover:border-opacity-100 transition-all group backdrop-blur-sm`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg bg-slate-800/50 group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">
                                  {option.title}
                                </h3>
                                <p className="text-slate-400 text-sm">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
