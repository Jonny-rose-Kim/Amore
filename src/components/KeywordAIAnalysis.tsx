import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, BarChart3, ShoppingBag, Globe, ChevronDown, AlertTriangle, CheckCircle, Target, BookOpen, Info } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  fetchLLMKeywordWhy,
  fetchLLMPLCPrediction,
  fetchLLMCountryStrategy,
  fetchTrendEvidence,
  fetchProductsByKeyword,
  fetchCombinedKeywordDescription,
  WhyTrendingData,
  PLCPredictionData,
  CountryStrategyData,
  TrendEvidenceData,
  ProductInfo,
  CombinedKeywordDescriptionData,
} from '../services/api';

interface ReviewKeywords {
  positive: { keyword: string; count: number }[];
  negative: { keyword: string; count: number }[];
}

interface KeywordAIAnalysisProps {
  keyword: string;
  country: string;
  category: string;
  keywordType: string;
  trendLevel: string;
  score: number;
  signals: { SNS: number; Retail: number; Review: number };
  reviewKeywords?: ReviewKeywords;
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

export default function KeywordAIAnalysis({
  keyword,
  country,
  category,
  keywordType,
  trendLevel,
  score,
  signals,
  reviewKeywords,
  onClose,
}: KeywordAIAnalysisProps) {
  // Section states
  const [descriptionData, setDescriptionData] = useState<CombinedKeywordDescriptionData | null>(null);
  const [descriptionLoading, setDescriptionLoading] = useState(true);

  const [whyData, setWhyData] = useState<WhyTrendingData | null>(null);
  const [whyLoading, setWhyLoading] = useState(true);
  const [whyError, setWhyError] = useState('');

  const [trendData, setTrendData] = useState<TrendEvidenceData | null>(null);
  const [trendLoading, setTrendLoading] = useState(true);

  const [plcData, setPlcData] = useState<PLCPredictionData | null>(null);
  const [plcLoading, setPlcLoading] = useState(true);
  const [plcError, setPlcError] = useState('');

  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [strategyData, setStrategyData] = useState<CountryStrategyData | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(true);
  const [strategyError, setStrategyError] = useState('');

  useEffect(() => {
    // Fire all 6 requests in parallel on mount
    const loadAll = async () => {
      // Section 0: Keyword Description (DB) - 조합 키워드 지원
      fetchCombinedKeywordDescription(keyword, country).then(data => {
        setDescriptionData(data);
        setDescriptionLoading(false);
      }).catch(() => {
        setDescriptionLoading(false);
      });

      // Section 1: Why trending (GPU1)
      fetchLLMKeywordWhy({
        keyword,
        country,
        category,
        trendLevel,
        score,
        signals,
        positiveKeywords: reviewKeywords?.positive?.map(k => k.keyword) || [],
        negativeKeywords: reviewKeywords?.negative?.map(k => k.keyword) || [],
      }).then(data => {
        if (data.success) {
          setWhyData(data);
        } else {
          setWhyError(data.error || 'AI 분석 서버 응답 오류');
        }
        setWhyLoading(false);
      }).catch(() => {
        setWhyError('AI 분석 서버 연결 실패');
        setWhyLoading(false);
      });

      // Section 2: Trend evidence (DB)
      fetchTrendEvidence(country, keyword).then(data => {
        setTrendData(data);
        setTrendLoading(false);
      }).catch(() => {
        setTrendLoading(false);
      });

      // Section 3: PLC prediction (GPU1)
      fetchLLMPLCPrediction({
        keyword,
        trendLevel,
        currentScore: score,
        snsGrowth: signals.SNS,
        retailSignal: signals.Retail,
        category,
      }).then(data => {
        if (data.success) {
          setPlcData(data);
        } else {
          setPlcError(data.error || 'PLC 예측 서버 응답 오류');
        }
        setPlcLoading(false);
      }).catch(() => {
        setPlcError('PLC 예측 서버 연결 실패');
        setPlcLoading(false);
      });

      // Section 4: Products (DB)
      fetchProductsByKeyword(keyword, country).then(data => {
        setProducts(data);
        setProductsLoading(false);
      }).catch(() => {
        setProductsLoading(false);
      });

      // Section 5: Country strategy (GPU2)
      fetchLLMCountryStrategy({
        keyword,
        country,
        category,
        keywordType,
        trendLevel,
        score,
        signals,
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
  }, [keyword, country, category, keywordType, trendLevel, score, signals]);

  const countryNames: Record<string, string> = {
    usa: '미국', japan: '일본', singapore: '싱가포르',
    malaysia: '말레이시아', indonesia: '인도네시아',
  };
  const countryName = countryNames[country] || country;

  return (
    <div className="space-y-5">
      {/* Section 0: 키워드의 의미 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-emerald-50/50 to-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <h4 className="text-slate-900 font-semibold text-sm">키워드의 의미</h4>
        </div>

        {descriptionLoading ? (
          <SectionSpinner label="키워드 설명을 불러오는 중..." />
        ) : descriptionData && descriptionData.keywords.length > 0 ? (
          <div className="space-y-3">
            {/* 조합 키워드인 경우 */}
            {descriptionData.keywords.length > 1 ? (
              <>
                {/* 조합 키워드 헤더 */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="text-xs text-slate-500 font-medium">조합 키워드:</span>
                  {descriptionData.keywords.map((kw, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                        kw.keywordType === 'ingredient' ? 'bg-pink-100 text-pink-700' :
                        kw.keywordType === 'formulas' ? 'bg-blue-100 text-blue-700' :
                        kw.keywordType === 'effects' ? 'bg-amber-100 text-amber-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {kw.koreanName || kw.keyword}
                      </span>
                      {idx < descriptionData.keywords.length - 1 && (
                        <span className="text-slate-400 mx-0.5">+</span>
                      )}
                    </span>
                  ))}
                </div>

                {/* 각 키워드별 설명 */}
                <div className="space-y-3">
                  {descriptionData.keywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        kw.keywordType === 'ingredient' ? 'bg-pink-50/50 border-pink-200' :
                        kw.keywordType === 'formulas' ? 'bg-blue-50/50 border-blue-200' :
                        kw.keywordType === 'effects' ? 'bg-amber-50/50 border-amber-200' :
                        'bg-purple-50/50 border-purple-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          kw.keywordType === 'ingredient' ? 'bg-pink-200 text-pink-800' :
                          kw.keywordType === 'formulas' ? 'bg-blue-200 text-blue-800' :
                          kw.keywordType === 'effects' ? 'bg-amber-200 text-amber-800' :
                          'bg-purple-200 text-purple-800'
                        }`}>
                          {kw.koreanName || kw.keyword}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          kw.keywordType === 'ingredient' ? 'bg-pink-100 text-pink-600' :
                          kw.keywordType === 'formulas' ? 'bg-blue-100 text-blue-600' :
                          kw.keywordType === 'effects' ? 'bg-amber-100 text-amber-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {kw.keywordType === 'ingredient' ? '성분' :
                           kw.keywordType === 'formulas' ? '제형' :
                           kw.keywordType === 'effects' ? '효과' : '무드'}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed">
                        {kw.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 조합 시너지 설명 */}
                <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-emerald-600 text-xs">✨</span>
                    <span className="text-emerald-700 text-xs font-bold">꿀조합 시너지</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    {descriptionData.keywords.map(k => k.koreanName || k.keyword).join(' + ')} 조합은
                    {descriptionData.keywords.some(k => k.keywordType === 'ingredient') && ' 효과적인 성분과'}
                    {descriptionData.keywords.some(k => k.keywordType === 'formulas') && ' 우수한 제형,'}
                    {descriptionData.keywords.some(k => k.keywordType === 'effects') && ' 원하는 효과를'}
                    함께 제공하여 시너지 효과를 발휘합니다.
                  </p>
                </div>
              </>
            ) : (
              /* 단일 키워드인 경우 */
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">
                    {descriptionData.keywords[0].koreanName || keyword}
                  </span>
                  {descriptionData.keywords[0].keywordType && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      descriptionData.keywords[0].keywordType === 'ingredient' ? 'bg-pink-100 text-pink-600' :
                      descriptionData.keywords[0].keywordType === 'formulas' ? 'bg-blue-100 text-blue-600' :
                      descriptionData.keywords[0].keywordType === 'effects' ? 'bg-amber-100 text-amber-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {descriptionData.keywords[0].keywordType === 'ingredient' ? '성분' :
                       descriptionData.keywords[0].keywordType === 'formulas' ? '제형' :
                       descriptionData.keywords[0].keywordType === 'effects' ? '효과' : '무드'}
                    </span>
                  )}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {descriptionData.keywords[0].description}
                </p>
              </>
            )}
          </div>
        ) : (
          <p className="text-slate-400 text-xs text-center py-4">
            이 키워드에 대한 설명이 아직 등록되지 않았습니다.
          </p>
        )}
      </motion.div>

      {/* Section 1: 왜 이 키워드가 트렌드인가? */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-amber-50/50 to-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h4 className="text-slate-900 font-semibold text-sm">왜 이 키워드가 트렌드인가?</h4>
        </div>

        {whyLoading ? (
          <SectionSpinner label="AI가 트렌드 이유를 분석하고 있습니다..." />
        ) : whyError ? (
          <SectionError message={whyError} />
        ) : whyData ? (
          <div className="space-y-3">
            <p className="text-slate-700 text-sm leading-relaxed">
              {whyData.explanation}
            </p>
            {whyData.keyFactors.length > 0 && (
              <div className="space-y-1.5 mt-3">
                <span className="text-xs font-medium text-slate-500">핵심 요인</span>
                {whyData.keyFactors.map((factor, idx) => (
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

      {/* Section 2: 키워드 추세 시각화 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-slate-200 rounded-lg p-4 bg-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <h4 className="text-slate-900 font-semibold text-sm">키워드 추세 시각화</h4>
          <div className="relative group ml-1">
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="font-semibold mb-2 text-rose-300">추세 지표 설명</div>
              <div className="space-y-1.5">
                <div><span className="text-pink-400 font-medium">SNS 추세:</span> Instagram, TikTok 등 소셜미디어 언급량 기반 정규화 지수 (0-100)</div>
                <div><span className="text-orange-400 font-medium">Retail 추세:</span> Amazon, Sephora 등 리테일 플랫폼 검색/판매 신호 정규화 지수 (0-100)</div>
                <div><span className="text-cyan-400 font-medium">Review 추세:</span> 소비자 리뷰 언급 빈도 및 감성 반영 정규화 지수 (0-100)</div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-600 text-slate-300">
                숫자가 높을수록 해당 채널에서 키워드 관심도가 높음을 의미합니다.
              </div>
              <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        </div>

        {trendLoading ? (
          <SectionSpinner label="추세 데이터를 불러오는 중..." />
        ) : trendData && trendData.weeksData && trendData.weeksData.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'SNS', color: '#ec4899', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', label: 'SNS 추세', description: '소셜미디어 버즈' },
                { key: 'Retail', color: '#f97316', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', label: 'Retail 추세', description: '리테일 신호' },
                { key: 'Review', color: '#06b6d4', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', label: 'Review 추세', description: '리뷰 반응' },
              ].map(({ key, color, bgColor, borderColor, label, description }) => {
                // 0-100 스케일링: 최대값을 기준으로 정규화
                const rawValues = trendData.weeksData.map(w => Number(w[key as keyof typeof w] || 0));
                const maxVal = Math.max(...rawValues, 1);
                const normalizedData = trendData.weeksData.map(w => ({
                  ...w,
                  [key]: maxVal > 100 ? Math.round((Number(w[key as keyof typeof w] || 0) / maxVal) * 100) : Math.min(100, Number(w[key as keyof typeof w] || 0))
                }));
                const latestValue = normalizedData[normalizedData.length - 1]?.[key as keyof typeof normalizedData[0]] as number || 0;
                const firstValue = normalizedData[0]?.[key as keyof typeof normalizedData[0]] as number || 0;
                const change = latestValue - firstValue;
                const changePercent = firstValue > 0 ? Math.round((change / firstValue) * 100) : 0;

                return (
                  <div key={key} className={`${bgColor} border ${borderColor} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600 font-medium">{label}</span>
                      <div className="relative group/info">
                        <Info className="w-3 h-3 text-slate-400 cursor-help" />
                        <div className="absolute right-0 bottom-full mb-1 w-40 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50">
                          {description} 정규화 지수
                          <div className="absolute right-2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-bold" style={{ color }}>
                        {latestValue}
                      </span>
                      <span className="text-[10px] text-slate-500">/100</span>
                      {change !== 0 && (
                        <span className={`text-[10px] font-medium ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {change > 0 ? '+' : ''}{changePercent}%
                        </span>
                      )}
                    </div>
                    <ResponsiveContainer width="100%" height={70}>
                      <LineChart data={normalizedData}>
                        <XAxis dataKey="week" tick={{ fontSize: 7, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(30,41,59,0.95)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '10px', padding: '6px 10px' }}
                          formatter={(value: number) => [`${value}/100`, label]}
                          labelFormatter={(label) => `${label}주차`}
                        />
                        <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>

            {/* 추세 종합 요약 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-slate-700">추세 종합 의견</span>
              </div>
              {(() => {
                const snsVal = Math.min(100, trendData.weeksData[trendData.weeksData.length - 1]?.SNS || 0);
                const retailVal = Math.min(100, trendData.weeksData[trendData.weeksData.length - 1]?.Retail || 0);
                const reviewVal = Math.min(100, trendData.weeksData[trendData.weeksData.length - 1]?.Review || 0);
                const avgVal = Math.round((snsVal + retailVal + reviewVal) / 3);

                // 추세 종합 의견 생성
                let summaryOpinion = '';
                const strongChannels: string[] = [];
                const weakChannels: string[] = [];

                if (snsVal >= 70) strongChannels.push('SNS');
                else if (snsVal < 40) weakChannels.push('SNS');

                if (retailVal >= 70) strongChannels.push('Retail');
                else if (retailVal < 40) weakChannels.push('Retail');

                if (reviewVal >= 70) strongChannels.push('Review');
                else if (reviewVal < 40) weakChannels.push('Review');

                if (avgVal >= 70) {
                  summaryOpinion = `전 채널에서 높은 관심도를 보이며, ${strongChannels.length > 0 ? strongChannels.join(', ') + ' 채널에서 특히 강세입니다. ' : ''}지속적인 모니터링과 적극적인 마케팅 투자가 권장됩니다.`;
                } else if (avgVal >= 50) {
                  if (strongChannels.length > 0 && weakChannels.length > 0) {
                    summaryOpinion = `${strongChannels.join(', ')} 채널에서 강한 신호가 감지되나, ${weakChannels.join(', ')} 채널은 상대적으로 약세입니다. 채널별 차별화 전략이 필요합니다.`;
                  } else {
                    summaryOpinion = `전반적으로 안정적인 추세를 보이고 있습니다. 현재 포지션 유지하며 성장 기회를 모색하는 것이 좋습니다.`;
                  }
                } else {
                  summaryOpinion = `아직 초기 단계이거나 니치 시장입니다. ${strongChannels.length > 0 ? strongChannels.join(', ') + ' 채널을 중심으로 타겟 마케팅을 고려해보세요.' : '시장 반응을 더 지켜볼 필요가 있습니다.'}`;
                }

                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">종합 지수:</span>
                        <span className="font-bold text-rose-600 text-sm">{avgVal}</span>
                        <span className="text-slate-400">/100</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{summaryOpinion}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-xs text-center py-4">추세 데이터가 없습니다</p>
        )}
      </motion.div>

      {/* Section 3: PLC 기반 예측 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-purple-50/50 to-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          <h4 className="text-slate-900 font-semibold text-sm">AI 기반 향후 6-12개월 예측</h4>
        </div>

        {plcLoading ? (
          <SectionSpinner label="AI 예측 모델 생성 중..." />
        ) : plcError ? (
          <SectionError message={plcError} />
        ) : plcData ? (
          <div className="space-y-3">
            {/* Phase badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                현재: {plcData.currentPhase}
              </span>
              <span className="text-slate-400 text-xs">→</span>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                6개월: {plcData.prediction6m}
              </span>
              <span className="text-slate-400 text-xs">→</span>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                12개월: {plcData.prediction12m}
              </span>
            </div>

            {/* Area chart */}
            {plcData.monthlyScores.length > 0 && (
              <div className="bg-white border border-purple-100 rounded-lg p-3">
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={plcData.monthlyScores.map((val, idx) => ({
                    name: idx === 0 ? '현재' : `${idx}개월`,
                    value: Math.round(val),
                  }))}>
                    <defs>
                      <linearGradient id="plcGradient" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#plcGradient)" dot={{ fill: '#8b5cf6', r: 2.5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <p className="text-slate-600 text-xs leading-relaxed">
              {plcData.explanation}
            </p>
          </div>
        ) : null}
      </motion.div>

      {/* Section 4: 관련 제품 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border border-slate-200 rounded-lg p-4 bg-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-4 h-4 text-rose-500" />
          <h4 className="text-slate-900 font-semibold text-sm">관련 제품</h4>
        </div>

        {productsLoading ? (
          <SectionSpinner label="관련 제품을 검색하는 중..." />
        ) : products.length > 0 ? (
          <div className="space-y-2.5">
            {products.slice(0, 6).map((product, idx) => (
              <div key={idx} className="flex gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-rose-100 to-pink-50 rounded-md flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-rose-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-900 font-medium truncate">{product.name}</span>
                  </div>
                  <div className="text-xs text-slate-500">{product.brand}</div>
                  {product.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-xs text-center py-4">관련 제품 데이터가 없습니다</p>
        )}
      </motion.div>

      {/* Section 5: 국가 키워드 전략 분석 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-blue-50/50 to-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-blue-500" />
          <h4 className="text-slate-900 font-semibold text-sm">{countryName} 키워드 전략 분석</h4>
        </div>

        {strategyLoading ? (
          <SectionSpinner label={`${countryName} 시장 전략을 분석하고 있습니다...`} />
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
