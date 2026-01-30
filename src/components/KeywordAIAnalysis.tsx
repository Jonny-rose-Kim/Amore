import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, TrendingUp, BarChart3, ShoppingBag, Globe, ChevronDown, AlertTriangle, CheckCircle, Target, BookOpen, Info, X, Maximize2, ArrowUpRight, ArrowDownRight, Shuffle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  fetchLLMKeywordWhy,
  fetchLLMPLCPrediction,
  fetchLLMCountryStrategy,
  fetchTrendEvidence,
  fetchProductsByKeyword,
  fetchCombinedKeywordDescription,
  saveInsight,
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

// 확대 모달 컴포넌트
interface ExpandedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  gradientClass: string;
  children: React.ReactNode;
}

function ExpandedModal({ isOpen, onClose, title, icon, gradientClass, children }: ExpandedModalProps) {
  if (!isOpen) return null;

  // Portal을 사용하여 document.body에 직접 렌더링 (대시보드 전체 레벨)
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border-2 border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className={`flex items-center justify-between p-6 border-b bg-gradient-to-r ${gradientClass} text-white rounded-t-3xl`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/20">
                {icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="text-white/80 text-sm">상세 분석 정보</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* 내용 */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
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

  // 확대 모달 상태
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  // 중복 저장 방지를 위한 ref
  const savedInsightsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 키워드/국가 변경 시 저장 기록 초기화
    savedInsightsRef.current = new Set();
  }, [keyword, country]);

  // 이미 로딩 중인지 추적하는 ref (중복 호출 방지)
  const isLoadingRef = useRef(false);
  const loadedKeyRef = useRef<string | null>(null); // keyword+country 조합 저장

  useEffect(() => {
    const currentKey = `${keyword}-${country}`;

    // 이미 같은 키워드+국가 조합으로 로딩 중이거나 로딩 완료된 경우 재실행 방지
    if (isLoadingRef.current || loadedKeyRef.current === currentKey) {
      return;
    }

    isLoadingRef.current = true;
    loadedKeyRef.current = currentKey;

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
          // 인사이트 자동 저장 - 트렌드 이유 분석 (중복 방지)
          const insightKey = `why-${keyword}`;
          if (!savedInsightsRef.current.has(insightKey)) {
            savedInsightsRef.current.add(insightKey);
            saveInsight(
              'keyword-why',
              `키워드 분석: ${keyword} - 트렌드 이유`,
              `${data.explanation}\n\n핵심 요인: ${data.keyFactors.join(', ')}`,
              { keyword, country, category, trendLevel }
            );
          }
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
          // 인사이트 자동 저장 - 6-12개월 예측 (중복 방지)
          const insightKey = `plc-${keyword}`;
          if (!savedInsightsRef.current.has(insightKey)) {
            savedInsightsRef.current.add(insightKey);
            saveInsight(
              'keyword-plc',
              `키워드 분석: ${keyword} - 6-12개월 예측`,
              `현재: ${data.currentPhase} → 6개월: ${data.prediction6m} → 12개월: ${data.prediction12m}\n\n${data.summary || data.explanation}`,
              { keyword, country, category, currentPhase: data.currentPhase }
            );
          }
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
          // 인사이트 자동 저장 - 국가별 전략 (중복 방지)
          const insightKey = `strategy-${keyword}-${country}`;
          if (!savedInsightsRef.current.has(insightKey)) {
            savedInsightsRef.current.add(insightKey);
            const countryNames: Record<string, string> = {
              usa: '미국', japan: '일본', singapore: '싱가포르',
              malaysia: '말레이시아', indonesia: '인도네시아',
            };
            saveInsight(
              'keyword-strategy',
              `키워드 분석: ${keyword} - ${countryNames[country] || country} 전략`,
              `시장분석: ${data.marketAnalysis}\n\n기회: ${data.opportunities.join(', ')}\n\n전략: ${data.strategies.join(', ')}`,
              { keyword, country, category }
            );
          }
        } else {
          setStrategyError(data.error || '전략 분석 서버 응답 오류');
        }
        setStrategyLoading(false);
      }).catch(() => {
        setStrategyError('전략 분석 서버 연결 실패');
        setStrategyLoading(false);
      });

      // 모든 요청 완료 후 로딩 상태 해제
      isLoadingRef.current = false;
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, country]); // 핵심 파라미터만 dependency로 설정 (signals 객체 제외)

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
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-emerald-50/50 to-white cursor-pointer hover:shadow-lg hover:border-emerald-300 transition-all group"
        onClick={() => setExpandedSection('description')}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <h4 className="text-slate-900 font-semibold text-sm">키워드의 의미</h4>
          </div>
          <Maximize2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-amber-50/50 to-white cursor-pointer hover:shadow-lg hover:border-amber-300 transition-all group"
        onClick={() => setExpandedSection('why')}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h4 className="text-slate-900 font-semibold text-sm">왜 이 키워드가 트렌드인가?</h4>
          </div>
          <Maximize2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
        className="border border-slate-200 rounded-lg p-4 bg-white cursor-pointer hover:shadow-lg hover:border-rose-300 transition-all group"
        onClick={() => setExpandedSection('trend')}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <h4 className="text-slate-900 font-semibold text-sm">키워드 추세 시각화</h4>
            <div className="relative group/info ml-1" onClick={(e) => e.stopPropagation()}>
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50">
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
          <Maximize2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-purple-50/50 to-white cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all group"
        onClick={() => setExpandedSection('plc')}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <h4 className="text-slate-900 font-semibold text-sm">AI 기반 향후 6-12개월 예측</h4>
            <div className="relative group/info" onClick={(e) => e.stopPropagation()}>
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50">
                <div className="font-semibold mb-1.5 text-purple-300">💡 상세 보기</div>
                <div className="text-slate-300 leading-relaxed">
                  박스를 클릭하면 성장 드라이버, 하락 리스크, 시나리오 분석 등 더 자세한 내용을 확인할 수 있습니다.
                </div>
                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          </div>
          <Maximize2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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

            {/* 종합의견 (전체 표시) */}
            {plcData.summary && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs font-semibold text-purple-700">종합의견</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {plcData.summary}
                </p>
              </div>
            )}
            {!plcData.summary && plcData.explanation && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs font-semibold text-purple-700">종합의견</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {plcData.explanation}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </motion.div>

      {/* PLC 확대 모달 */}
      <ExpandedModal
        isOpen={expandedSection === 'plc'}
        onClose={() => setExpandedSection(null)}
        title="AI 기반 향후 6-12개월 예측"
        icon={<BarChart3 className="w-6 h-6" />}
        gradientClass="from-purple-500 to-violet-600"
      >
        {plcData && (
          <div className="space-y-6">
            {/* Phase badges - 큰 버전 */}
            <div className="flex items-center justify-center gap-4 flex-wrap py-4 bg-purple-50 rounded-xl">
              <div className="text-center px-6 py-3 bg-purple-100 rounded-xl">
                <div className="text-xs text-purple-600 mb-1">현재 단계</div>
                <div className="text-xl font-bold text-purple-700">{plcData.currentPhase}</div>
              </div>
              <div className="text-purple-300 text-2xl">→</div>
              <div className="text-center px-6 py-3 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-xs text-purple-500 mb-1">6개월 후</div>
                <div className="text-lg font-semibold text-purple-600">{plcData.prediction6m}</div>
              </div>
              <div className="text-purple-300 text-2xl">→</div>
              <div className="text-center px-6 py-3 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-xs text-purple-500 mb-1">12개월 후</div>
                <div className="text-lg font-semibold text-purple-600">{plcData.prediction12m}</div>
              </div>
            </div>

            {/* 큰 차트 */}
            {plcData.monthlyScores.length > 0 && (
              <div className="bg-white border border-purple-100 rounded-xl p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={plcData.monthlyScores.map((val, idx) => ({
                    name: idx === 0 ? '현재' : `${idx}개월`,
                    value: Math.round(val),
                  }))}>
                    <defs>
                      <linearGradient id="plcGradientExpanded" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(30,41,59,0.95)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', padding: '10px 14px' }}
                      formatter={(value: number) => [`${value}점`, '예측 점수']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fill="url(#plcGradientExpanded)" dot={{ fill: '#8b5cf6', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 구조화된 분석 내용 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 성장 드라이버 */}
              {plcData.growthDrivers && plcData.growthDrivers.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                    <h5 className="font-bold text-emerald-700">성장 드라이버</h5>
                  </div>
                  <div className="space-y-2">
                    {plcData.growthDrivers.map((driver, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{driver}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 하락 리스크 */}
              {plcData.declineRisks && plcData.declineRisks.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowDownRight className="w-5 h-5 text-rose-500" />
                    <h5 className="font-bold text-rose-700">하락 리스크</h5>
                  </div>
                  <div className="space-y-2">
                    {plcData.declineRisks.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 시나리오 */}
            {plcData.scenarios && plcData.scenarios.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shuffle className="w-5 h-5 text-amber-500" />
                  <h5 className="font-bold text-amber-700">조건부 시나리오</h5>
                </div>
                <div className="space-y-3">
                  {plcData.scenarios.map((scenario, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white/50 rounded-lg p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 ${
                        scenario.includes('긍정') || scenario.includes('성장') || scenario.includes('지속')
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {scenario.includes('긍정') || scenario.includes('성장') || scenario.includes('지속') ? '긍정' : '부정'}
                      </span>
                      <span className="text-sm text-slate-700">{scenario.replace(/^(긍정|부정)\s*시나리오\s*:\s*/i, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 종합 의견 */}
            {(plcData.summary || plcData.explanation) && (
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-200" />
                  <h5 className="font-bold">종합 의견</h5>
                </div>
                <p className="text-white/95 leading-relaxed">
                  {plcData.summary || plcData.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </ExpandedModal>

      {/* Section 4: 관련 제품 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border border-slate-200 rounded-lg p-4 bg-white cursor-pointer hover:shadow-lg hover:border-rose-300 transition-all group"
        onClick={() => setExpandedSection('products')}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-rose-500" />
            <h4 className="text-slate-900 font-semibold text-sm">관련 제품</h4>
          </div>
          <Maximize2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
        className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-blue-50/50 to-white cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
        onClick={() => setExpandedSection('strategy')}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <h4 className="text-slate-900 font-semibold text-sm">{countryName} 키워드 전략 분석</h4>
          </div>
          <Maximize2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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

      {/* 키워드 의미 확대 모달 */}
      <ExpandedModal
        isOpen={expandedSection === 'description'}
        onClose={() => setExpandedSection(null)}
        title="키워드의 의미"
        icon={<BookOpen className="w-6 h-6" />}
        gradientClass="from-emerald-500 to-teal-600"
      >
        {descriptionData && descriptionData.keywords.length > 0 && (
          <div className="space-y-6">
            {descriptionData.keywords.map((kw, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl border-2 ${
                  kw.keywordType === 'ingredient' ? 'bg-pink-50 border-pink-300' :
                  kw.keywordType === 'formulas' ? 'bg-blue-50 border-blue-300' :
                  kw.keywordType === 'effects' ? 'bg-amber-50 border-amber-300' :
                  'bg-purple-50 border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-4 py-2 rounded-lg text-lg font-bold ${
                    kw.keywordType === 'ingredient' ? 'bg-pink-200 text-pink-800' :
                    kw.keywordType === 'formulas' ? 'bg-blue-200 text-blue-800' :
                    kw.keywordType === 'effects' ? 'bg-amber-200 text-amber-800' :
                    'bg-purple-200 text-purple-800'
                  }`}>
                    {kw.koreanName || kw.keyword}
                  </span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    kw.keywordType === 'ingredient' ? 'bg-pink-100 text-pink-600' :
                    kw.keywordType === 'formulas' ? 'bg-blue-100 text-blue-600' :
                    kw.keywordType === 'effects' ? 'bg-amber-100 text-amber-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {kw.keywordType === 'ingredient' ? '🧪 성분' :
                     kw.keywordType === 'formulas' ? '💧 제형' :
                     kw.keywordType === 'effects' ? '✨ 효과' : '🎨 무드'}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed text-base">
                  {kw.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </ExpandedModal>

      {/* 왜 트렌드인가 확대 모달 */}
      <ExpandedModal
        isOpen={expandedSection === 'why'}
        onClose={() => setExpandedSection(null)}
        title="왜 이 키워드가 트렌드인가?"
        icon={<Lightbulb className="w-6 h-6" />}
        gradientClass="from-amber-500 to-orange-600"
      >
        {whyData && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-slate-700 leading-relaxed text-base">
                {whyData.explanation}
              </p>
            </div>
            {whyData.keyFactors.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-800 mb-4 text-lg">핵심 요인</h5>
                <div className="grid gap-3">
                  {whyData.keyFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white border border-amber-200 rounded-lg p-4">
                      <CheckCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ExpandedModal>

      {/* 관련 제품 확대 모달 */}
      <ExpandedModal
        isOpen={expandedSection === 'products'}
        onClose={() => setExpandedSection(null)}
        title="관련 제품"
        icon={<ShoppingBag className="w-6 h-6" />}
        gradientClass="from-rose-500 to-pink-600"
      >
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product, idx) => (
              <div key={idx} className="flex gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-rose-100 to-pink-50 rounded-lg flex items-center justify-center overflow-hidden">
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
                    <ShoppingBag className="w-8 h-8 text-rose-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-slate-900 mb-1">{product.name}</h5>
                  <div className="text-sm text-slate-500 mb-2">{product.brand}</div>
                  {product.description && (
                    <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ExpandedModal>

      {/* 국가 전략 확대 모달 */}
      <ExpandedModal
        isOpen={expandedSection === 'strategy'}
        onClose={() => setExpandedSection(null)}
        title={`${countryName} 키워드 전략 분석`}
        icon={<Globe className="w-6 h-6" />}
        gradientClass="from-blue-500 to-indigo-600"
      >
        {strategyData && (
          <div className="space-y-6">
            {/* 시장 분석 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h5 className="font-bold text-blue-800 mb-3">시장 분석</h5>
              <p className="text-slate-700 leading-relaxed">{strategyData.marketAnalysis}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 기회 요인 */}
              {strategyData.opportunities.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <h5 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> 기회 요인
                  </h5>
                  <div className="space-y-2">
                    {strategyData.opportunities.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-emerald-500">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 리스크 요인 */}
              {strategyData.risks.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                  <h5 className="font-bold text-rose-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> 리스크 요인
                  </h5>
                  <div className="space-y-2">
                    {strategyData.risks.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-rose-500">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 전략 제안 */}
            {strategyData.strategies.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h5 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" /> 전략 제안
                </h5>
                <div className="space-y-2">
                  {strategyData.strategies.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-blue-500">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 플랜 */}
            {strategyData.actionPlan.length > 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                <h5 className="font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-200" /> 액션 플랜
                </h5>
                <div className="space-y-3">
                  {strategyData.actionPlan.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white/10 rounded-lg p-3">
                      <span className="w-6 h-6 bg-white/20 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-white/95">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ExpandedModal>

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
