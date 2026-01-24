import { motion } from 'framer-motion';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchWhitespaceCategoryInsight } from '../services/api';

interface WhitespaceProduct {
  name: string;
  brand: string;
  price: string;
  rating: number;
}

interface WhitespaceGapAnalysisProps {
  country: string;
  category: string;
  overseasProducts?: WhitespaceProduct[];
  koreanProducts?: WhitespaceProduct[];
}

interface InsightResult {
  title: string;
  points: string[];
  summary: string;
}

const countryInfo: Record<string, { flag: string; name: string }> = {
  usa: { flag: '🇺🇸', name: '미국' },
  japan: { flag: '🇯🇵', name: '일본' },
  singapore: { flag: '🇸🇬', name: '싱가포르' },
  malaysia: { flag: '🇲🇾', name: '말레이시아' },
  indonesia: { flag: '🇮🇩', name: '인도네시아' },
};

function FormattedText({ text }: { text: string }) {
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

export default function WhitespaceGapAnalysis({ country, category, overseasProducts, koreanProducts }: WhitespaceGapAnalysisProps) {
  const [showInsight, setShowInsight] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insightResult, setInsightResult] = useState<InsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const info = countryInfo[country] || countryInfo.usa;

  // 국가 또는 카테고리 변경 시 리셋
  useEffect(() => {
    setShowInsight(false);
    setIsLoading(false);
    setInsightResult(null);
    setError(null);
  }, [country, category]);

  const handleInsightClick = async () => {
    if (showInsight) {
      setShowInsight(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWhitespaceCategoryInsight({
        country,
        category,
        overseasProducts: (overseasProducts || []).map(p => ({
          name: p.name,
          brand: p.brand,
          price: p.price,
          rating: p.rating,
        })),
        koreanProducts: (koreanProducts || []).map(p => ({
          name: p.name,
          brand: p.brand,
          price: p.price,
          rating: p.rating,
        })),
      });

      if (result.success) {
        setInsightResult({
          title: result.title,
          points: result.points,
          summary: result.summary,
        });
        setShowInsight(true);
      } else {
        setError(result.error || 'AI 인사이트 생성에 실패했습니다.');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-xl mt-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-slate-900 font-bold text-lg">카테고리별 WhiteSpace AI 인사이트</h3>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            {info.flag} {info.name} × {category}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {!showInsight && !isLoading && !error && (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm mb-4">
              한국 시장에 없는 {info.name} 인기 제품의 장점과 소구 포인트를 AI가 분석합니다.
            </p>
            <button
              onClick={handleInsightClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:from-amber-600 hover:to-orange-600 transition-all hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              인사이트 제공
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-700 text-sm font-medium">AI 인사이트 분석 중...</p>
            <p className="text-slate-400 text-xs mt-1">{info.name} × {category} 시장 분석</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-4">
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button
              onClick={handleInsightClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors text-sm"
            >
              다시 시도
            </button>
          </div>
        )}

        {showInsight && insightResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/60 border border-amber-200 rounded-lg p-5 mb-3">
              <h4 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <FormattedText text={insightResult.title} />
              </h4>
              <div className="space-y-3 mb-4">
                {insightResult.points.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold text-sm mt-0.5 flex-shrink-0">{idx + 1}.</span>
                    <p className="text-slate-800 text-sm leading-relaxed">
                      <FormattedText text={point} />
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-white/80 border border-amber-300/60 rounded-lg p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-800">핵심 기회 요약</span>
                </div>
                <p className="text-slate-800 text-sm leading-relaxed font-medium">
                  <FormattedText text={insightResult.summary} />
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleInsightClick}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                접기
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
