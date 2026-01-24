import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, BarChart3, Globe, ChevronDown, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  fetchLLMCategoryTrend,
  fetchLLMCategoryPrediction,
  fetchLLMCategoryStrategy,
  fetchLeaderboard,
  CategoryTrendData,
  CategoryPredictionData,
  CategoryStrategyData,
} from '../services/api';

interface CategoryAIAnalysisProps {
  country: string;
  category: string;
  onClose: () => void;
}

function SectionSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full mb-3"
        style={{ borderWidth: '3px' }}
      />
      <p className="text-slate-500 text-xs">{label}</p>
    </div>
  );
}

function SectionError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 py-4 px-3 bg-red-50 border border-red-200 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <p className="text-red-600 text-xs">{message}</p>
    </div>
  );
}

export default function CategoryAIAnalysis({
  country,
  category,
  onClose,
}: CategoryAIAnalysisProps) {
  // Section states
  const [trendData, setTrendData] = useState<CategoryTrendData | null>(null);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState('');

  const [predictionData, setPredictionData] = useState<CategoryPredictionData | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(true);
  const [predictionError, setPredictionError] = useState('');

  const [strategyData, setStrategyData] = useState<CategoryStrategyData | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(true);
  const [strategyError, setStrategyError] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      // First fetch leaderboard to get top keywords for all 3 types
      const [ingredients, formulas, effects] = await Promise.all([
        fetchLeaderboard(country, category, 'Ingredients', 'all'),
        fetchLeaderboard(country, category, 'Formulas', 'all'),
        fetchLeaderboard(country, category, 'Effects', 'all'),
      ]);

      const topKeywords = [
        ...ingredients.slice(0, 5).map(k => ({ keyword: k.keyword, score: k.score, trendLevel: k.trendLevel || 'Actionable', type: 'ingredient' })),
        ...formulas.slice(0, 5).map(k => ({ keyword: k.keyword, score: k.score, trendLevel: k.trendLevel || 'Actionable', type: 'formula' })),
        ...effects.slice(0, 5).map(k => ({ keyword: k.keyword, score: k.score, trendLevel: k.trendLevel || 'Actionable', type: 'effect' })),
      ];

      const avgScore = topKeywords.length > 0
        ? Math.round(topKeywords.reduce((sum, k) => sum + k.score, 0) / topKeywords.length)
        : 70;

      // Section 1: Category trend analysis (GPU0)
      fetchLLMCategoryTrend({
        country,
        category,
        topKeywords,
      }).then(data => {
        if (data.success) {
          setTrendData(data);
        } else {
          setTrendError(data.error || 'AI 분석 서버 응답 오류');
        }
        setTrendLoading(false);
      }).catch(() => {
        setTrendError('AI 분석 서버 연결 실패');
        setTrendLoading(false);
      });

      // Section 2: Category prediction (GPU1)
      fetchLLMCategoryPrediction({
        country,
        category,
        topKeywords,
        avgScore,
      }).then(data => {
        if (data.success) {
          setPredictionData(data);
        } else {
          setPredictionError(data.error || 'AI 예측 서버 응답 오류');
        }
        setPredictionLoading(false);
      }).catch(() => {
        setPredictionError('AI 예측 서버 연결 실패');
        setPredictionLoading(false);
      });

      // Section 3: Category strategy (GPU2)
      fetchLLMCategoryStrategy({
        country,
        category,
        topKeywords,
        avgScore,
      }).then(data => {
        if (data.success) {
          setStrategyData(data);
        } else {
          setStrategyError(data.error || '전략 분석 서버 응답 오류');
        }
        setStrategyLoading(false);
      }).catch(() => {
        setStrategyError('전략 분석 서버 연결 실패');
        setStrategyLoading(false);
      });
    };

    loadAll();
  }, [country, category]);

  const countryNames: Record<string, string> = {
    usa: '미국', japan: '일본', singapore: '싱가포르',
    malaysia: '말레이시아', indonesia: '인도네시아',
  };
  const countryName = countryNames[country] || country;

  return (
    <div className="space-y-5">
      {/* Section 1: 카테고리 트렌드 경향성 분석 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-amber-50/50 to-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h4 className="text-slate-900 font-semibold text-sm">{category} 카테고리 트렌드 분석</h4>
          <span className="ml-auto text-xs text-slate-400">GPU0</span>
        </div>

        {trendLoading ? (
          <SectionSpinner label={`${category} 카테고리 트렌드를 분석하고 있습니다...`} />
        ) : trendError ? (
          <SectionError message={trendError} />
        ) : trendData ? (
          <div className="space-y-3">
            <p className="text-slate-700 text-sm leading-relaxed">
              {trendData.explanation}
            </p>
            {trendData.keyFactors.length > 0 && (
              <div className="space-y-1.5 mt-3">
                <span className="text-xs font-medium text-slate-500">핵심 동인</span>
                {trendData.keyFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-700">{factor}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </motion.div>

      {/* Section 2: AI 기반 향후 6-12개월 예측 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-purple-50/50 to-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          <h4 className="text-slate-900 font-semibold text-sm">AI 기반 향후 6-12개월 예측</h4>
          <span className="ml-auto text-xs text-slate-400">GPU1</span>
        </div>

        {predictionLoading ? (
          <SectionSpinner label="AI 예측 모델 생성 중..." />
        ) : predictionError ? (
          <SectionError message={predictionError} />
        ) : predictionData ? (
          <div className="space-y-3">
            {/* Phase badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                현재: {predictionData.currentPhase}
              </span>
              <span className="text-slate-400 text-xs">→</span>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                6개월: {predictionData.prediction6m}
              </span>
              <span className="text-slate-400 text-xs">→</span>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                12개월: {predictionData.prediction12m}
              </span>
            </div>

            {/* Area chart */}
            {predictionData.monthlyScores.length > 0 && (
              <div className="bg-white border border-purple-100 rounded-lg p-3">
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={predictionData.monthlyScores.map((val, idx) => ({
                    name: idx === 0 ? '현재' : `${idx}개월`,
                    value: Math.round(val),
                  }))}>
                    <defs>
                      <linearGradient id="categoryPlcGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(30,41,59,0.95)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                      formatter={(value: number) => [`${value}점`, '예측 점수']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#categoryPlcGradient)" dot={{ fill: '#8b5cf6', r: 2.5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <p className="text-slate-600 text-xs leading-relaxed">
              {predictionData.explanation}
            </p>
          </div>
        ) : null}
      </motion.div>

      {/* Section 3: 국가 카테고리 전략 분석 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-blue-50/50 to-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-blue-500" />
          <h4 className="text-slate-900 font-semibold text-sm">{countryName} {category} 전략 분석</h4>
          <span className="ml-auto text-xs text-slate-400">GPU2</span>
        </div>

        {strategyLoading ? (
          <SectionSpinner label={`${countryName} ${category} 전략을 분석하고 있습니다...`} />
        ) : strategyError ? (
          <SectionError message={strategyError} />
        ) : strategyData ? (
          <div className="space-y-4">
            {/* 시장 분석 */}
            <div>
              <span className="text-xs font-medium text-slate-500 mb-1 block">시장 분석</span>
              <p className="text-xs text-slate-700 leading-relaxed">{strategyData.marketAnalysis}</p>
            </div>

            {/* 기회 요인 */}
            {strategyData.opportunities.length > 0 && (
              <div>
                <span className="text-xs font-medium text-green-600 mb-1 block">기회 요인</span>
                <div className="space-y-1">
                  {strategyData.opportunities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 리스크 요인 */}
            {strategyData.risks.length > 0 && (
              <div>
                <span className="text-xs font-medium text-red-600 mb-1 block">리스크 요인</span>
                <div className="space-y-1">
                  {strategyData.risks.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 전략 제안 */}
            {strategyData.strategies.length > 0 && (
              <div>
                <span className="text-xs font-medium text-blue-600 mb-1 block">전략 제안</span>
                <div className="space-y-1">
                  {strategyData.strategies.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Target className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 플랜 */}
            {strategyData.actionPlan.length > 0 && (
              <div>
                <span className="text-xs font-medium text-purple-600 mb-1 block">액션 플랜</span>
                <div className="space-y-1">
                  {strategyData.actionPlan.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-3.5 h-3.5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </motion.div>

      {/* 접기 버튼 */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
          접기
        </button>
      </div>
    </div>
  );
}
