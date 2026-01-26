import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { BubbleItem, TrendItem } from '../data/mockData';
import { useState, useEffect } from 'react';
import KeywordAIAnalysis from './KeywordAIAnalysis';
import CategoryAIAnalysis from './CategoryAIAnalysis';

interface InsightPanelProps {
  selectedInsight: string | null;
  selectedBubbleItem: BubbleItem | null;
  selectedTrendItem: TrendItem | null;
  selectedBubbleItemRank?: number; // 리더보드에서의 등수
  selectedBubbleItemType?: 'ingredient' | 'formula' | 'effect' | 'visual' | 'combined'; // 리더보드 타입
  country?: string;
  category?: string;
  onOpenModal: () => void;
}


export default function InsightPanel({ selectedInsight, selectedBubbleItem, selectedTrendItem, selectedBubbleItemRank, selectedBubbleItemType, country, category = 'Skincare', onOpenModal }: InsightPanelProps) {
  const [showAiContent, setShowAiContent] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'category' | 'keyword' | null>(null);

  // TrendItem 또는 BubbleItem에서 evidence 추출
  const evidence = selectedBubbleItem?.evidence || selectedTrendItem?.evidence;
  const itemName = selectedBubbleItem?.name || selectedTrendItem?.combination || '';
  const hasKeywordSelected = !!(selectedBubbleItem || selectedTrendItem);
  const hasContent = selectedInsight || evidence || hasKeywordSelected;

  // 리더보드 항목이 변경되면 키워드 분석 상태 리셋
  useEffect(() => {
    setShowAiContent(false);
    setAnalysisMode(null);
  }, [selectedBubbleItem, selectedTrendItem]);

  // 카테고리 변경 시 카테고리 분석 리셋
  useEffect(() => {
    if (analysisMode === 'category') {
      setAnalysisMode(null);
    }
  }, [category]);

  const handleCategoryAnalysisClick = () => {
    if (analysisMode === 'category') {
      setAnalysisMode(null);
      return;
    }
    setShowAiContent(false);
    setAnalysisMode('category');
  };

  const handleKeywordAnalysisClick = () => {
    if (showAiContent && analysisMode === 'keyword') {
      setShowAiContent(false);
      setAnalysisMode(null);
      return;
    }
    setAnalysisMode('keyword');
    setShowAiContent(true);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* AI 분석 박스 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-xl overflow-y-auto"
      >
        {/* 항목 정보 헤더 - 크고 눈에 띄게 (카테고리 분석 모드에서는 숨김) */}
        {analysisMode !== 'category' && (selectedBubbleItem || selectedTrendItem) && (
          <div className="mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-start gap-4">
              {/* 등수 표시 */}
              {selectedBubbleItemRank && (
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <span className="text-white font-bold text-2xl">{selectedBubbleItemRank}</span>
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-xs text-slate-900">등</span>
                  </div>
                </div>
              )}
              {selectedTrendItem && (
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <span className="text-white font-bold text-2xl">{selectedTrendItem.rank}</span>
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-xs text-slate-900">등</span>
                  </div>
                </div>
              )}
              
              {/* 항목 이름 및 타입 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {selectedBubbleItemType && (
                    <>
                      <span className={`px-3 py-1.5 rounded-lg border backdrop-blur-sm text-sm font-semibold ${
                        selectedBubbleItemType === 'ingredient'
                          ? 'bg-pink-400/80 text-slate-900 border-pink-500 font-semibold'
                          : selectedBubbleItemType === 'formula'
                          ? 'bg-rose-400/80 text-slate-900 border-rose-500 font-semibold'
                          : 'bg-coral-400/80 text-slate-900 border-coral-500 font-semibold'
                      }`}>
                        {selectedBubbleItemType === 'ingredient' ? '🧪 성분' : selectedBubbleItemType === 'formula' ? '💧 제형' : '✨ 효과'}
                      </span>
                      {/* 트렌드 상태 태그 */}
                      {selectedBubbleItem?.status && (
                        <span className={`px-3 py-1.5 rounded-lg border text-sm font-extrabold ${
                          selectedBubbleItem.status.includes('Early')
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                            : selectedBubbleItem.status.includes('Growing')
                            ? 'bg-blue-100 text-blue-800 border-blue-400'
                            : selectedBubbleItem.status.includes('Actionable')
                            ? 'bg-orange-100 text-orange-800 border-orange-400'
                            : 'bg-slate-100 text-slate-700 border-slate-400'
                        }`}>
                          {selectedBubbleItem.status}
                        </span>
                      )}
                    </>
                  )}
                  {selectedTrendItem && (
                    <span className="px-3 py-1.5 rounded-lg border backdrop-blur-sm text-sm font-semibold bg-purple-400/80 text-slate-900 border-purple-500">
                      🧩 꿀조합
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{itemName}</h2>
                {selectedBubbleItemType && (
                  <p className="text-sm text-slate-900">
                    {selectedBubbleItemType === 'ingredient' ? '성분' : selectedBubbleItemType === 'formula' ? '제형' : '효과'} 트렌드 리더보드
                  </p>
                )}
                {selectedTrendItem && (
                  <p className="text-sm text-slate-900">
                    꿀조합 리더보드 · {selectedTrendItem.category}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-semibold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-500" />
            {analysisMode === 'category' ? `${category} AI 분석` : 'AI 분석'}
        </h3>
          <div className="flex items-center gap-2">
          </div>
        </div>

        {/* 분석 버튼 영역 */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={handleCategoryAnalysisClick}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-5 rounded-xl text-sm font-bold transition-all ${
              analysisMode === 'category'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-rose-50 text-rose-700 border-2 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {category} AI 분석
          </button>
          <button
            onClick={handleKeywordAnalysisClick}
            disabled={!hasContent}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-5 rounded-xl text-sm font-bold transition-all ${
              analysisMode === 'keyword'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                : !hasContent
                ? 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                : 'bg-rose-50 text-rose-700 border-2 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            키워드 AI 분석
          </button>
        </div>

        {/* 분석 내용 */}
        {analysisMode === 'category' ? (
          <CategoryAIAnalysis
            country={country || 'usa'}
            category={category}
            onClose={handleCategoryAnalysisClick}
          />
        ) : analysisMode !== 'keyword' ? (
          <div className="min-h-[120px] flex items-center justify-center">
            <p className="text-slate-500 italic text-sm text-center">
              {hasContent
                ? '키워드 AI 분석 버튼을 눌러 상세 분석을 확인하세요'
                : '카테고리 AI 분석 버튼을 누르거나,\n리더보드 항목 클릭 후 키워드 AI 분석을 확인하세요'}
            </p>
          </div>
        ) : (
          <KeywordAIAnalysis
            keyword={itemName}
            country={country || 'usa'}
            category={category || 'Skincare'}
            keywordType={selectedBubbleItemType || 'ingredient'}
            trendLevel={selectedBubbleItem?.status || 'Actionable'}
            score={selectedBubbleItem?.value || 75}
            signals={{
              SNS: Math.round((selectedBubbleItem?.value || 70) * 0.9),
              Retail: Math.round((selectedBubbleItem?.value || 70) * 0.85),
              Review: Math.round((selectedBubbleItem?.value || 70) * 0.8),
            }}
            reviewKeywords={selectedBubbleItem?.reviewKeywords || selectedTrendItem?.reviewKeywords}
            onClose={handleKeywordAnalysisClick}
          />
        )}
      </motion.div>

      {/* 보고서 생성 버튼 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenModal}
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/30"
      >
        <Sparkles className="w-5 h-5" />
        <span>✨ AI 맞춤형 인사이트 제공</span>
      </motion.button>
    </div>
  );
}
