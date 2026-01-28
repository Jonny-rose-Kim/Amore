import { motion } from 'framer-motion';
import { Sparkles, Loader2, Bot, Zap, ArrowRight } from 'lucide-react';
import { OverseasProduct } from './OverseasProductList';
import { DomesticProduct } from './DomesticProductList';
import { useState, useEffect } from 'react';
import { fetchWhitespaceProductAnalysis, saveInsight } from '../services/api';

interface ProductComparisonProps {
  overseasProduct: OverseasProduct | null;
  domesticProduct: DomesticProduct | null;
  country: string;
}

interface AgentInsight {
  title: string;
  points: string[];
  summary: string;
}

interface ComparisonResult {
  overseasSummary: string;
  domesticSummary: string;
  overseasImage?: string;
  domesticImage?: string;
  agentInsight: AgentInsight;
}

function FormattedText({ text }: { text: string }) {
  // Bold formatting: **text** or text between colons with emphasis
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function ProductComparison({ overseasProduct, domesticProduct, country }: ProductComparisonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 제품 변경 시 분석 결과 초기화
  useEffect(() => {
    setComparisonResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, [overseasProduct?.name, domesticProduct?.name]);

  const startAnalysis = () => {
    if (!overseasProduct || !domesticProduct) return;

    setIsAnalyzing(true);
    setError(null);
    setComparisonResult(null);

    fetchWhitespaceProductAnalysis({
      overseasProduct: {
        name: overseasProduct.name,
        brand: overseasProduct.brand,
        category: overseasProduct.category,
        price: overseasProduct.price || '',
        rating: overseasProduct.rating || 0,
        reviewCount: overseasProduct.reviewCount || 0,
      },
      domesticProduct: {
        name: domesticProduct.name,
        brand: domesticProduct.brand,
        category: domesticProduct.category,
        price: domesticProduct.price || '',
        rating: domesticProduct.rating || 0,
        reviewCount: domesticProduct.reviewCount || 0,
      },
      country,
      category: overseasProduct.category,
    }).then(result => {
      if (result.success) {
        setComparisonResult({
          overseasSummary: result.overseasSummary,
          domesticSummary: result.domesticSummary,
          overseasImage: overseasProduct.image,
          domesticImage: domesticProduct.image,
          agentInsight: result.agentInsight,
        });

        // 인사이트 자동 저장
        const fullContent = `
## 제품 비교 분석

### ${overseasProduct.name} (해외)
${result.overseasSummary}

### ${domesticProduct.name} (K-Beauty)
${result.domesticSummary}

### AI 인사이트: ${result.agentInsight.title}
${result.agentInsight.points.map((p: string) => `- ${p}`).join('\n')}

**요약:** ${result.agentInsight.summary}
        `.trim();

        saveInsight(
          'comparison',
          `제품 비교: ${overseasProduct.name} vs ${domesticProduct.name}`,
          fullContent,
          {
            overseasProduct: overseasProduct.name,
            domesticProduct: domesticProduct.name,
            country,
            category: overseasProduct.category
          }
        );
      } else {
        setError(result.error || 'AI 분석에 실패했습니다.');
      }
      setIsAnalyzing(false);
    }).catch(err => {
      setError(String(err));
      setIsAnalyzing(false);
    });
  };

  // 제품이 하나도 선택되지 않은 경우
  if (!overseasProduct && !domesticProduct) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 backdrop-blur-sm border border-slate-200/80 rounded-xl p-8 shadow-xl h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-inner">
            <Sparkles className="w-10 h-10 text-rose-400" />
          </div>
          <h4 className="text-slate-800 font-bold text-2xl mb-3">AI 제품 비교 분석</h4>
          <p className="text-slate-500 text-sm leading-relaxed">
            양쪽 리스트에서 비교할 제품을 선택해주세요.<br />
            <span className="text-rose-500 font-medium">AI가 두 제품의 차이점과 인사이트를 분석</span>해 드립니다.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              해외 제품
            </div>
            <div className="text-slate-300">→</div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              K-Beauty 제품
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 두 제품이 모두 선택되었지만 아직 분석 시작 전 - 제품 미리보기와 버튼 표시
  if (overseasProduct && domesticProduct && !isAnalyzing && !comparisonResult && !error) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-rose-50 backdrop-blur-sm border border-violet-200/80 rounded-xl p-4 shadow-xl h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <h4 className="text-slate-800 font-bold text-xl">AI 제품 비교</h4>
        </div>

        {/* 두 제품 미리보기 */}
        <div className="flex-1 flex items-center justify-center gap-4">
          {/* 해외 제품 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <div className="w-[22rem] h-[22rem] rounded-2xl overflow-hidden border-4 border-blue-400 shadow-xl mb-3 mx-auto bg-white">
              {overseasProduct.image ? (
                <img src={overseasProduct.image} alt={overseasProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <span className="text-8xl">🌍</span>
                </div>
              )}
            </div>
            <p className="text-blue-600 font-bold text-base">{overseasProduct.brand}</p>
            <p className="text-slate-700 text-sm mt-1 max-w-[300px] truncate">{overseasProduct.name}</p>
          </motion.div>

          {/* VS 표시 */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-rose-500 rounded-full flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-lg">VS</span>
            </div>
          </motion.div>

          {/* 한국 제품 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <div className="w-[22rem] h-[22rem] rounded-2xl overflow-hidden border-4 border-rose-400 shadow-xl mb-3 mx-auto bg-white">
              {domesticProduct.image ? (
                <img src={domesticProduct.image} alt={domesticProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-rose-100">
                  <span className="text-8xl">🇰🇷</span>
                </div>
              )}
            </div>
            <p className="text-rose-600 font-bold text-base">{domesticProduct.brand}</p>
            <p className="text-slate-700 text-sm mt-1 max-w-[300px] truncate">{domesticProduct.name}</p>
          </motion.div>
        </div>

        {/* 분석 버튼 */}
        <div className="text-center mt-4">
          <motion.button
            onClick={startAnalysis}
            className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-rose-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-400 to-rose-400 rounded-2xl"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 relative z-10" />
            </motion.div>
            <span className="relative z-10">AI 비교 분석 시작</span>
            <ArrowRight className="w-5 h-5 relative z-10" />
          </motion.button>
          <p className="text-slate-500 text-xs mt-2">
            클릭하면 AI가 두 제품을 심층 분석합니다
          </p>
        </div>
      </div>
    );
  }

  // 하나의 제품만 선택된 경우
  if (!overseasProduct || !domesticProduct) {
    const selectedProduct = overseasProduct || domesticProduct;
    const isOverseas = !!overseasProduct;

    return (
      <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-xl h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-rose-400" />
          <h4 className="text-slate-800 font-bold text-2xl">AI 제품 비교 분석</h4>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* 선택된 제품 표시 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-24 h-24 rounded-2xl overflow-hidden border-3 shadow-lg mb-4 ${
              isOverseas ? 'border-blue-400' : 'border-rose-400'
            }`}
          >
            {selectedProduct?.image ? (
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${isOverseas ? 'bg-blue-100' : 'bg-rose-100'}`}>
                <span className="text-3xl">{isOverseas ? '🌍' : '🇰🇷'}</span>
              </div>
            )}
          </motion.div>

          <p className={`text-sm font-medium mb-1 ${isOverseas ? 'text-blue-600' : 'text-rose-600'}`}>
            {selectedProduct?.brand}
          </p>
          <p className="text-slate-700 text-sm mb-6">{selectedProduct?.name}</p>

          {/* 안내 메시지 */}
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                isOverseas ? 'bg-rose-100' : 'bg-blue-100'
              }`}
            >
              <span className="text-2xl">{isOverseas ? '🇰🇷' : '🌍'}</span>
            </motion.div>
            <p className="text-slate-500 text-sm">
              {isOverseas ? (
                <>왼쪽에서 <span className="text-rose-500 font-medium">K-Beauty 제품</span>을 선택해주세요</>
              ) : (
                <>왼쪽에서 <span className="text-blue-500 font-medium">해외 제품</span>을 선택해주세요</>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 backdrop-blur-sm border border-purple-200/80 rounded-xl p-8 shadow-xl h-full flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-rose-400 rounded-2xl animate-pulse opacity-20"></div>
            <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-10 h-10 text-purple-500" />
            </div>
            <Loader2 className="absolute -top-2 -right-2 w-8 h-8 text-rose-500 animate-spin" />
          </div>
          <h4 className="text-slate-800 font-bold text-lg mb-2">AI가 분석 중입니다</h4>
          <p className="text-slate-500 text-sm">
            두 제품의 특성을 비교하고 인사이트를 도출하고 있어요
          </p>
          <div className="flex justify-center gap-1 mt-4">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-xl h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">분석 오류</p>
          <p className="text-slate-500 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setComparisonResult(null);
            }}
            className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!comparisonResult) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-xl h-full flex flex-col overflow-y-auto"
    >
      <div className="flex items-center gap-2 mb-6 flex-shrink-0">
        <Sparkles className="w-5 h-5 text-rose-600" />
        <h3 className="text-slate-900 font-bold text-xl">AI 비교 분석</h3>
      </div>

      <div className="space-y-6 flex-1">
        {/* 해외 제품 요약 */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-5">
          <h4 className="text-blue-900 font-bold text-lg mb-3 flex items-center gap-2">
            <span>🌍</span>
            {overseasProduct.name}
          </h4>
          {comparisonResult.overseasImage ? (
            <img
              src={comparisonResult.overseasImage}
              alt={overseasProduct.name}
              className="w-72 h-72 object-cover rounded-xl mb-4 border-2 border-blue-200 shadow-md"
            />
          ) : (
            <div className="w-72 h-72 bg-blue-200 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-blue-600 text-6xl">🌍</span>
            </div>
          )}
          <p className="text-slate-800 leading-relaxed text-sm">
            <FormattedText text={comparisonResult.overseasSummary} />
          </p>
        </div>

        {/* 한국 제품 요약 */}
        <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-5">
          <h4 className="text-rose-900 font-bold text-lg mb-3 flex items-center gap-2">
            <span>🇰🇷</span>
            {domesticProduct.name}
          </h4>
          {comparisonResult.domesticImage ? (
            <img
              src={comparisonResult.domesticImage}
              alt={domesticProduct.name}
              className="w-72 h-72 object-cover rounded-xl mb-4 border-2 border-rose-200 shadow-md"
            />
          ) : (
            <div className="w-72 h-72 bg-rose-200 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-rose-600 text-6xl">🇰🇷</span>
            </div>
          )}
          <p className="text-slate-800 leading-relaxed text-sm">
            <FormattedText text={comparisonResult.domesticSummary} />
          </p>
        </div>

        {/* Agent Insight 섹션 */}
        {comparisonResult.agentInsight && comparisonResult.agentInsight.points.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50/90 to-indigo-50/80 border border-purple-200 rounded-lg p-5">
            <h4 className="text-purple-900 font-bold text-lg mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              {comparisonResult.agentInsight.title}
            </h4>
            <div className="space-y-3 mb-4">
              {comparisonResult.agentInsight.points.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="bg-purple-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-800 text-sm leading-relaxed">
                    <FormattedText text={point} />
                  </p>
                </div>
              ))}
            </div>
            <div className="bg-white/80 border border-purple-300/60 rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs font-bold text-purple-800">핵심 요약</span>
              </div>
              <p className="text-slate-800 text-sm leading-relaxed font-medium">
                <FormattedText text={comparisonResult.agentInsight.summary} />
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
