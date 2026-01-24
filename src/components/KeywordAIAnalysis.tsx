import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, BarChart3, ShoppingBag, Globe, ChevronDown, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  fetchLLMKeywordWhy,
  fetchLLMPLCPrediction,
  fetchLLMCountryStrategy,
  fetchTrendEvidence,
  fetchProductsByKeyword,
  WhyTrendingData,
  PLCPredictionData,
  CountryStrategyData,
  TrendEvidenceData,
  ProductInfo,
} from '../services/api';

interface KeywordAIAnalysisProps {
  keyword: string;
  country: string;
  category: string;
  keywordType: string;
  trendLevel: string;
  score: number;
  signals: { SNS: number; Retail: number; Review: number };
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
  onClose,
}: KeywordAIAnalysisProps) {
  // Section states
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
    // Fire all 5 requests in parallel on mount
    const loadAll = async () => {
      // Section 1: Why trending (GPU1)
      fetchLLMKeywordWhy({
        keyword,
        country,
        category,
        trendLevel,
        score,
        signals,
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
      {/* Section 1: 왜 이 키워드가 트렌드인가? */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-amber-50/50 to-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h4 className="text-slate-900 font-semibold text-sm">왜 이 키워드가 트렌드인가?</h4>
          <span className="ml-auto text-xs text-slate-400">GPU0</span>
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
        transition={{ delay: 0.05 }}
        className="border border-slate-200 rounded-lg p-4 bg-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <h4 className="text-slate-900 font-semibold text-sm">키워드 추세 시각화</h4>
          <span className="ml-auto text-xs text-slate-400">DB</span>
        </div>

        {trendLoading ? (
          <SectionSpinner label="추세 데이터를 불러오는 중..." />
        ) : trendData && trendData.weeksData && trendData.weeksData.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'SNS', color: '#ec4899', label: 'SNS 추세' },
              { key: 'Retail', color: '#f97316', label: 'Retail 추세' },
              { key: 'Review', color: '#06b6d4', label: 'Review 추세' },
            ].map(({ key, color, label }) => (
              <div key={key} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600 font-medium">{label}</span>
                  <span className="text-xs font-semibold" style={{ color }}>
                    {trendData.weeksData[trendData.weeksData.length - 1]?.[key as keyof typeof trendData.weeksData[0]] || 0}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={trendData.weeksData}>
                    <XAxis dataKey="week" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(30,41,59,0.95)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                      formatter={(value: number) => [`${value}`, key]}
                    />
                    <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-xs text-center py-4">추세 데이터가 없습니다</p>
        )}
      </motion.div>

      {/* Section 3: PLC 기반 예측 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-purple-50/50 to-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          <h4 className="text-slate-900 font-semibold text-sm">AI 기반 향후 6-12개월 예측</h4>
          <span className="ml-auto text-xs text-slate-400">GPU1</span>
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
        transition={{ delay: 0.15 }}
        className="border border-slate-200 rounded-lg p-4 bg-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-4 h-4 text-rose-500" />
          <h4 className="text-slate-900 font-semibold text-sm">관련 제품</h4>
          <span className="ml-auto text-xs text-slate-400">DB</span>
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
                    {product.score > 0 && (
                      <span className="text-xs text-rose-600 font-medium flex-shrink-0">{product.score}점</span>
                    )}
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
        transition={{ delay: 0.2 }}
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-blue-50/50 to-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-blue-500" />
          <h4 className="text-slate-900 font-semibold text-sm">{countryName} 키워드 전략 분석</h4>
          <span className="ml-auto text-xs text-slate-400">GPU2</span>
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
