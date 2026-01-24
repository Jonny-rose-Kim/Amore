import { motion } from 'framer-motion';
import { Sparkles, Loader2, Bot } from 'lucide-react';
import { OverseasProduct } from './OverseasProductList';
import { DomesticProduct } from './DomesticProductList';
import { useState, useEffect } from 'react';
import { fetchWhitespaceProductAnalysis } from '../services/api';

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

  useEffect(() => {
    if (overseasProduct && domesticProduct) {
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
        } else {
          setError(result.error || 'AI 분석에 실패했습니다.');
        }
        setIsAnalyzing(false);
      }).catch(err => {
        setError(String(err));
        setIsAnalyzing(false);
      });
    } else {
      setComparisonResult(null);
      setError(null);
    }
  }, [overseasProduct, domesticProduct, country]);

  if (!overseasProduct || !domesticProduct) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-xl h-full flex items-center justify-center">
        <p className="text-slate-500 text-center">
          해당 국가 인기 제품과 한국 인기 제품을 각각 선택하면<br />
          AI 비교 분석 결과가 표시됩니다.
        </p>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-xl h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 font-semibold">AI 비교 분석 중...</p>
          <p className="text-slate-500 text-sm mt-2">두 제품을 종합적으로 분석하고 있습니다.</p>
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
              className="w-32 h-32 object-cover rounded-lg mb-3 border border-blue-200"
            />
          ) : (
            <div className="w-32 h-32 bg-blue-200 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-blue-600 text-4xl">🌍</span>
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
              className="w-32 h-32 object-cover rounded-lg mb-3 border border-rose-200"
            />
          ) : (
            <div className="w-32 h-32 bg-rose-200 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-rose-600 text-4xl">🇰🇷</span>
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
