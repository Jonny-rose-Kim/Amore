import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, Package, Star, ChevronRight,
  Loader2, Lightbulb, Beaker, Target, BarChart3, MessageSquare, ExternalLink,
  Info, Clock, Eye, X, ThumbsUp, ThumbsDown, Filter, Check
} from 'lucide-react';
import {
  fetchKbeautyTrendsData,
  fetchKbeautyTrendsAnalysis,
  KbeautyProduct,
  KbeautyTrendsDataResponse,
  KbeautyTrendsAnalysisResponse,
  saveInsight
} from '../services/api';

// LLM을 통한 성분 상세 정보 생성 API
async function fetchIngredientDetailFromLLM(ingredient: string): Promise<{ description: string; effects: string[]; skinTypes: string[]; usage: string } | null> {
  try {
    const response = await fetch('/api/llm/ingredient-detail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredient }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('LLM 성분 상세 조회 오류:', error);
    return null;
  }
}

// 성분별 색상 팔레트 (그라데이션)
const INGREDIENT_COLORS: string[] = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  // 보라 그라데이션
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',  // 핑크 그라데이션
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',  // 스카이블루 그라데이션
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',  // 민트 그라데이션
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',  // 코랄 그라데이션
];

interface KbeautyNewProductTrendsProps {
  category?: string;
  onClose?: () => void;
}

// 브랜드 컬러 - Premium Design
const BRAND_COLORS: Record<string, { primary: string; bg: string; text: string; gradient: string }> = {
  'TIRTIR': { primary: '#E84D6A', bg: 'rgba(232,77,106,0.05)', text: '#E84D6A', gradient: 'linear-gradient(135deg, #E84D6A, #FF8FA3)' },
  'Medicube': { primary: '#4F6AF5', bg: 'rgba(79,106,245,0.05)', text: '#4F6AF5', gradient: 'linear-gradient(135deg, #4F6AF5, #7B93FF)' },
  'Beauty of Joseon': { primary: '#C9A962', bg: 'rgba(201,169,98,0.05)', text: '#C9A962', gradient: 'linear-gradient(135deg, #C9A962, #E5CB8A)' },
  'Laneige': { primary: '#5BB4D4', bg: 'rgba(91,180,212,0.05)', text: '#5BB4D4', gradient: 'linear-gradient(135deg, #5BB4D4, #8AD0E8)' },
  'COSRX': { primary: '#3D9970', bg: 'rgba(61,153,112,0.05)', text: '#3D9970', gradient: 'linear-gradient(135deg, #3D9970, #6BBF96)' },
  'SKIN1004': { primary: '#7CB342', bg: 'rgba(124,179,66,0.05)', text: '#7CB342', gradient: 'linear-gradient(135deg, #7CB342, #A5D66B)' },
  'BIODANCE': { primary: '#9B6BD4', bg: 'rgba(155,107,212,0.05)', text: '#9B6BD4', gradient: 'linear-gradient(135deg, #9B6BD4, #C09AEA)' },
};

// 고민별 색상/아이콘 매핑
const CONCERN_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  'Dryness': { icon: '💧', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', label: '건조함' },
  'Hydration': { icon: '💦', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: '수분 부족' },
  'Dullness': { icon: '✨', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '칙칙함' },
  'Anti-Aging': { icon: '🌟', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', label: '노화' },
  'Acne': { icon: '🍃', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: '트러블' },
  'Pore': { icon: '🔍', color: '#f97316', bg: 'rgba(249,115,22,0.1)', label: '모공' },
  'Brightening': { icon: '☀️', color: '#eab308', bg: 'rgba(234,179,8,0.1)', label: '미백' },
  'Moisturizing': { icon: '🌊', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', label: '보습' },
  'Firming': { icon: '💪', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', label: '탄력' },
  'Soothing': { icon: '🌸', color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: '진정' },
  'Sensitivity': { icon: '🌷', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', label: '민감성' },
};

// 성분 효능 매핑
const INGREDIENT_INFO: Record<string, { korean: string; effects: string[]; description: string }> = {
  'Hyaluronic Acid': { korean: '히알루론산', effects: ['보습', '수분 유지', '탄력'], description: '피부 수분을 1000배 끌어당기는 강력한 보습 성분' },
  'Niacinamide': { korean: '나이아신아마이드', effects: ['미백', '모공 케어', '피지 조절'], description: '멜라닌 생성을 억제하고 피부 톤을 균일하게' },
  'Ceramide': { korean: '세라마이드', effects: ['장벽 강화', '보습', '진정'], description: '피부 장벽을 구성하는 핵심 지질 성분' },
  'Vitamin C': { korean: '비타민 C', effects: ['미백', '항산화', '콜라겐 생성'], description: '강력한 항산화와 브라이트닝 효과' },
  'Retinol': { korean: '레티놀', effects: ['주름 개선', '탄력', '세포 재생'], description: '검증된 안티에이징 성분의 대표주자' },
  'Glycerin': { korean: '글리세린', effects: ['보습', '피부 보호', '수분 공급'], description: '안전하고 효과적인 기본 보습 성분' },
  'Squalane': { korean: '스쿠알란', effects: ['보습', '피부 장벽', '유연성'], description: '피부 친화적인 오일 성분으로 빠른 흡수' },
  'Peptide': { korean: '펩타이드', effects: ['탄력', '주름 개선', '리프팅'], description: '아미노산 결합체로 피부 재생 촉진' },
  'Collagen': { korean: '콜라겐', effects: ['탄력', '보습', '주름 개선'], description: '피부 구조를 지지하는 단백질 성분' },
  'Panthenol': { korean: '판테놀', effects: ['진정', '보습', '재생'], description: '비타민 B5로 피부 진정과 재생 촉진' },
};

// 숫자 카운트업 컴포넌트
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

// Premium Tooltip 컴포넌트
function PremiumTooltip({ children, content, delay = 300 }: { children: React.ReactNode; content: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2"
          >
            <div className="px-3 py-2 bg-neutral-800 text-white rounded-lg text-[13px] max-w-[240px] shadow-xl">
              {content}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-[6px] border-transparent border-t-neutral-800" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Premium Modal 컴포넌트
function PremiumModal({
  isOpen,
  onClose,
  children,
  maxWidth = '800px'
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
            style={{ maxWidth, width: '100%', maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 제품 상세 모달 컴포넌트
function ProductDetailModal({ product, onClose }: { product: KbeautyProduct; onClose: () => void; }) {
  const brandConfig = BRAND_COLORS[product.brand] || BRAND_COLORS['TIRTIR'];

  return (
    <PremiumModal isOpen={true} onClose={onClose} maxWidth="720px">
      <div className="flex flex-col md:flex-row">
        {/* 이미지 영역 */}
        <div className="md:w-2/5 bg-gradient-to-br from-neutral-50 to-neutral-100 p-8 flex items-center justify-center">
          <div className="relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-56 h-56 object-contain"
              />
            ) : (
              <div className="w-56 h-56 bg-neutral-200 rounded-2xl flex items-center justify-center">
                <Package className="w-16 h-16 text-neutral-400" />
              </div>
            )}
            <div
              className="absolute -top-2 -left-2 px-3 py-1 text-white text-xs font-semibold rounded-full"
              style={{ background: brandConfig.gradient }}
            >
              NEW
            </div>
          </div>
        </div>

        {/* 상세 정보 영역 */}
        <div className="md:w-3/5 p-8 overflow-y-auto max-h-[70vh]">
          <div
            className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium mb-3"
            style={{ background: brandConfig.gradient }}
          >
            {product.brand}
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2 leading-tight">{product.name}</h2>
          <p className="text-2xl font-bold mb-6" style={{ color: brandConfig.primary }}>{product.price}</p>

          <div className="space-y-5">
            {product.description && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2">제품 설명</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.keyIngredients && product.keyIngredients.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                  <Beaker className="w-4 h-4 text-blue-500" /> 주요 성분
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.keyIngredients.map((ing, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.concerns && product.concerns.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-rose-500" /> 타겟 고민
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.concerns.map((concern, idx) => {
                    const config = CONCERN_CONFIG[concern];
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs rounded-lg font-medium"
                        style={{ backgroundColor: config?.bg || '#f1f5f9', color: config?.color || '#64748b' }}
                      >
                        {config?.icon} {config?.label || concern}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {product.benefits && product.benefits.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> 기대 효과
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.benefits.map((benefit, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg font-medium">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.reviews && product.reviews.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-neutral-500" /> 실제 리뷰
                </h3>
                <div className="space-y-2">
                  {product.reviews.slice(0, 2).map((review, idx) => (
                    <div key={idx} className="bg-neutral-50 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-neutral-600">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.productUrl && (
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: brandConfig.gradient }}
              >
                공식 사이트에서 보기 <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </PremiumModal>
  );
}

// 성분 상세 패널 컴포넌트 (LLM 연동)
function IngredientDetailPanel({
  ingredient,
  count,
  products,
  onProductClick,
  isLoading = false
}: {
  ingredient: string | null;
  count: number;
  products: KbeautyProduct[];
  onProductClick: (product: KbeautyProduct) => void;
  isLoading?: boolean;
}) {
  const [llmData, setLlmData] = useState<{ description: string; effects: string[]; skinTypes: string[]; usage: string } | null>(null);
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const staticInfo = ingredient ? INGREDIENT_INFO[ingredient] : null;

  // LLM에서 성분 정보 가져오기
  useEffect(() => {
    if (!ingredient) {
      setLlmData(null);
      return;
    }

    const fetchLLMData = async () => {
      setIsLoadingLLM(true);
      const data = await fetchIngredientDetailFromLLM(ingredient);
      setLlmData(data);
      setIsLoadingLLM(false);
    };

    fetchLLMData();
  }, [ingredient]);

  if (!ingredient) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <Beaker className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-neutral-500 text-sm">성분을 선택하면<br />상세 정보가 표시됩니다</p>
      </div>
    );
  }

  const description = llmData?.description || staticInfo?.description || '이 성분에 대한 상세 정보를 불러오는 중...';
  const effects = llmData?.effects || staticInfo?.effects || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full bg-white rounded-2xl border border-neutral-200 p-6 shadow-editorial"
    >
      <div className="mb-4">
        <h3 className="font-display text-2xl text-neutral-800">{ingredient}</h3>
        <p className="text-sm text-neutral-500">{staticInfo?.korean || ingredient}</p>
      </div>

      {isLoadingLLM ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          AI가 성분 정보를 분석 중...
        </div>
      ) : (
        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
          {description}
        </p>
      )}

      {effects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {effects.map((effect, idx) => (
            <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
              {effect}
            </span>
          ))}
        </div>
      )}

      {llmData?.skinTypes && llmData.skinTypes.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-neutral-500 mb-2">추천 피부 타입</p>
          <div className="flex flex-wrap gap-1.5">
            {llmData.skinTypes.map((type, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {llmData?.usage && (
        <div className="mb-4 p-3 bg-amber-50 rounded-xl">
          <p className="text-xs font-semibold text-amber-700 mb-1">💡 사용 팁</p>
          <p className="text-xs text-amber-800">{llmData.usage}</p>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center justify-between">
          <span>이 성분이 포함된 신제품</span>
          <span className="text-xs font-normal text-neutral-500">
            {isLoading ? '로딩중...' : `${count}개`}
          </span>
        </h4>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-[var(--color-primary-500)] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">해당 성분이 포함된 신제품이 없습니다</p>
        ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {products.slice(0, 6).map((product, idx) => (
            <motion.div
              key={idx}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors"
              onClick={() => onProductClick(product)}
              whileHover={{ x: 4 }}
            >
              <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{product.name}</p>
                <p className="text-xs text-neutral-500">{product.brand}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </motion.div>
          ))}
          {products.length > 6 && (
            <p className="text-xs text-center text-neutral-500 pt-2">+{products.length - 6}개 더보기</p>
          )}
        </div>
        )}
      </div>
    </motion.div>
  );
}

export default function KbeautyNewProductTrends({ category = 'All', onClose }: KbeautyNewProductTrendsProps) {
  const [trendsData, setTrendsData] = useState<KbeautyTrendsDataResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<KbeautyTrendsAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<KbeautyProduct | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedConcern, setSelectedConcern] = useState<{ name: string; label: string; products: KbeautyProduct[]; loading?: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'brands' | 'products'>('overview');
  const [displayedProducts, setDisplayedProducts] = useState(100); // 전체 신제품 표시
  const [filterBrands, setFilterBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'brand' | 'name' | 'price-asc' | 'price-desc'>('brand');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchKbeautyTrendsData(category === 'All' ? undefined : category);
      setTrendsData(data);
      setIsLoading(false);
    };
    loadData();
  }, [category]);

  const handleAnalysis = async () => {
    if (!trendsData) return;
    setIsAnalyzing(true);
    const result = await fetchKbeautyTrendsAnalysis({
      category: trendsData.category,
      brandSummaries: trendsData.brandSummaries,
      trends: trendsData.trends,
      sampleNewProducts: trendsData.sampleNewProducts,
      sampleBestSellers: trendsData.sampleBestSellers,
    });
    setAnalysisResult(result);
    setIsAnalyzing(false);

    // 인사이트 자동 저장
    if (result.success) {
      const analysisText = [
        '## 브랜드별 전략',
        ...result.brandStrategies.map(s => `- ${s}`),
        '',
        '## 성분 트렌드',
        ...result.ingredientTrends.map(s => `- ${s}`),
        '',
        '## 기능 트렌드',
        ...result.functionTrends.map(s => `- ${s}`),
        '',
        '## 시장 전망',
        result.marketOutlook
      ].join('\n');
      saveInsight(
        'kbeauty',
        `K-Beauty 동향 분석 - ${trendsData.category || '전체'}`,
        analysisText,
        { category: trendsData.category, brands: Object.keys(trendsData.brandSummaries || {}) }
      );
    }
  };

  const handleLoadMore = () => {
    setDisplayedProducts(prev => prev + 12);
  };

  // 성분별 제품 데이터 (API에서 가져옴)
  const [ingredientProducts, setIngredientProducts] = useState<KbeautyProduct[]>([]);
  const [ingredientLoading, setIngredientLoading] = useState(false);

  // 성분 선택 시 API에서 제품 가져오기
  const handleIngredientSelect = async (ingredientName: string | null) => {
    setSelectedIngredient(ingredientName);

    if (!ingredientName) {
      setIngredientProducts([]);
      return;
    }

    setIngredientLoading(true);
    try {
      const response = await fetch(`/api/real/kbeauty/products-by-ingredient?ingredient=${encodeURIComponent(ingredientName)}`);
      if (response.ok) {
        const data = await response.json();
        setIngredientProducts(data.products || []);
      } else {
        // API 실패 시 로컬 데이터로 폴백
        const localProducts = trendsData?.sampleNewProducts.filter(p =>
          p.keyIngredients?.some(ing => ing.toLowerCase().includes(ingredientName.toLowerCase()))
        ) || [];
        setIngredientProducts(localProducts);
      }
    } catch (error) {
      console.error('성분별 제품 조회 오류:', error);
      setIngredientProducts([]);
    } finally {
      setIngredientLoading(false);
    }
  };

  const [concernLoading, setConcernLoading] = useState(false);

  const handleConcernClick = async (concernName: string) => {
    const config = CONCERN_CONFIG[concernName] || { label: concernName };

    // 먼저 모달을 열고 로딩 상태로 표시
    setSelectedConcern({ name: concernName, label: config.label, products: [], loading: true });
    setConcernLoading(true);

    try {
      // DB에서 해당 고민 타겟 제품 조회
      const response = await fetch(`/api/real/kbeauty/products-by-concern?concern=${encodeURIComponent(concernName)}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedConcern({
          name: concernName,
          label: config.label,
          products: data.products || [],
          loading: false
        });
      } else {
        // API 실패 시 로컬 데이터로 폴백
        const localProducts = trendsData?.sampleNewProducts.filter(p =>
          p.concerns?.some(c => c.toLowerCase().includes(concernName.toLowerCase()))
        ) || [];
        setSelectedConcern({ name: concernName, label: config.label, products: localProducts, loading: false });
      }
    } catch (error) {
      console.error('고민별 제품 조회 오류:', error);
      // 에러 시 로컬 데이터로 폴백
      const localProducts = trendsData?.sampleNewProducts.filter(p =>
        p.concerns?.some(c => c.toLowerCase().includes(concernName.toLowerCase()))
      ) || [];
      setSelectedConcern({ name: concernName, label: config.label, products: localProducts, loading: false });
    } finally {
      setConcernLoading(false);
    }
  };

  const filteredProducts = (trendsData?.sampleNewProducts.filter(p =>
    filterBrands.length === 0 || filterBrands.includes(p.brand)
  ) || []).sort((a, b) => {
    switch (sortOrder) {
      case 'brand':
        return a.brand.localeCompare(b.brand);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-asc':
        const priceA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
        const priceB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
        return priceA - priceB;
      case 'price-desc':
        const priceA2 = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
        const priceB2 = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
        return priceB2 - priceA2;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-neutral-200 rounded-full" />
          <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-[var(--color-primary-500)] animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-neutral-700 font-medium">데이터 로딩 중</p>
          <p className="text-sm text-neutral-500">6개 브랜드 분석</p>
        </div>
      </div>
    );
  }

  if (!trendsData) {
    return (
      <div className="text-center py-12 text-neutral-500">
        데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const maxIngredientCount = Math.max(...trendsData.trends.ingredients.map(i => i.new));

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center pt-4 pb-6"
      >
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">K-Beauty Trends</p>
        <h1 className="font-display text-3xl md:text-4xl text-neutral-800 mb-3">
          K-Beauty 신제품 동향
        </h1>
        <p className="text-neutral-500 text-sm">
          6개의 브랜드, <span className="font-semibold text-neutral-700">{trendsData.summary.totalProducts}개</span>의 제품에서 발견한 트렌드
        </p>

        {/* Hero Stats */}
        <div className="flex justify-center gap-8 mt-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-4xl font-bold text-emerald-600">
              <AnimatedNumber value={trendsData.summary.newProducts} />
            </p>
            <p className="text-xs text-neutral-500 mt-1">신제품</p>
          </motion.div>
          <div className="w-px bg-neutral-200" />
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-4xl font-bold text-amber-600">
              <AnimatedNumber value={trendsData.summary.bestSellers} />
            </p>
            <p className="text-xs text-neutral-500 mt-1">베스트셀러</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Tab Navigation - Sticky */}
      <div className="sticky top-0 z-20 bg-[var(--color-neutral-50)]/80 backdrop-blur-md py-3 -mx-4 px-4 border-b border-neutral-200">
        <div className="flex justify-center gap-2">
          {[
            { id: 'overview', label: '트렌드 개요', icon: BarChart3 },
            { id: 'brands', label: '브랜드별 분석', icon: Package },
            { id: 'products', label: '신제품 목록', icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-neutral-800 rounded-full"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* 인기 성분 섹션 - 2컬럼 레이아웃 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl text-neutral-800">지금 주목해야 할 성분</h2>
                  <p className="text-sm text-neutral-500 mt-1">신제품에서 가장 많이 사용된 성분 TOP 5</p>
                </div>
                <PremiumTooltip content="195개 제품의 성분을 분석했습니다">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-xs text-neutral-600 cursor-help">
                    <Info className="w-3 h-3" />
                    {trendsData.summary.newProducts}개 제품 분석
                  </div>
                </PremiumTooltip>
              </div>

              <div className="grid grid-cols-5 gap-6">
                {/* 세로 막대 그래프 - 좌측 60% */}
                <div className="col-span-3 bg-white rounded-2xl border border-neutral-200 p-6 shadow-editorial">
                  <div className="flex items-end justify-between gap-6 h-[220px]">
                    {trendsData.trends.ingredients.slice(0, 5).map((ing, idx) => {
                      const percentage = (ing.new / maxIngredientCount) * 100;
                      const isSelected = selectedIngredient === ing.name;
                      const barColor = INGREDIENT_COLORS[idx % INGREDIENT_COLORS.length];

                      return (
                        <motion.div
                          key={ing.name}
                          className="flex-1 flex flex-col items-center cursor-pointer"
                          onClick={() => handleIngredientSelect(isSelected ? null : ing.name)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <motion.span
                            className="text-sm font-semibold mb-2"
                            style={{ color: isSelected ? 'var(--color-primary-500)' : 'var(--color-neutral-800)' }}
                          >
                            {ing.new}
                          </motion.span>
                          <motion.div
                            className="w-12 rounded-t-xl relative shadow-sm"
                            style={{
                              height: `${Math.max(percentage * 1.6, 20)}px`,
                              background: barColor,
                              boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
                            }}
                            initial={{ height: 0 }}
                            animate={{
                              height: `${Math.max(percentage * 1.6, 20)}px`,
                              opacity: selectedIngredient && !isSelected ? 0.5 : 1,
                              scale: isSelected ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{
                              y: -6,
                              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                            }}
                          >
                            {isSelected && (
                              <motion.div
                                className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-neutral-800"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              />
                            )}
                          </motion.div>
                          <p className={`text-xs mt-3 text-center font-medium leading-tight ${isSelected ? 'text-neutral-900 font-bold' : 'text-neutral-600'}`}>
                            {ing.name.split(' ')[0]}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* 성분 상세 패널 - 우측 40% */}
                <div className="col-span-2">
                  <IngredientDetailPanel
                    ingredient={selectedIngredient}
                    count={ingredientProducts.length}
                    products={ingredientProducts}
                    onProductClick={setSelectedProduct}
                    isLoading={ingredientLoading}
                  />
                </div>
              </div>
            </section>

            {/* 피부 고민별 신제품 분포 - 순위별 정렬 + 클릭 시 팝업 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl text-neutral-800">피부 고민별 신제품 분포</h2>
                  <p className="text-sm text-neutral-500 mt-1">클릭하면 해당 고민 타겟 제품을 확인할 수 있습니다</p>
                </div>
              </div>

              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-snap-x"
                style={{ paddingLeft: '4px', paddingRight: '16px' }}
              >
                {/* 순위별 정렬 (new 개수 기준 내림차순) */}
                {[...trendsData.trends.concerns]
                  .sort((a, b) => b.new - a.new)
                  .slice(0, 8)
                  .map((concern, idx) => {
                  const config = CONCERN_CONFIG[concern.name] || { icon: '🎯', color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: concern.name };
                  const rank = idx + 1;

                  return (
                    <motion.div
                      key={concern.name}
                      className="flex-shrink-0 w-40 scroll-snap-start cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.03, y: -6 }}
                      onClick={() => handleConcernClick(concern.name)}
                    >
                      <div
                        className="h-48 rounded-2xl p-4 flex flex-col items-center justify-center transition-all hover:shadow-lg relative border-2 border-transparent hover:border-white/50"
                        style={{ backgroundColor: config.bg }}
                      >
                        {/* 순위 배지 */}
                        <div
                          className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                          style={{ backgroundColor: config.color }}
                        >
                          {rank}
                        </div>

                        <motion.span
                          className="text-5xl mb-3"
                          whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          {config.icon}
                        </motion.span>
                        <p className="font-bold text-neutral-800 text-sm">{config.label}</p>
                        <p
                          className="text-lg font-bold mt-1"
                          style={{ color: config.color }}
                        >
                          {concern.new}개
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1">클릭하여 제품 보기</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* AI 분석 섹션 */}
            <section className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-neutral-800">AI 트렌드 분석</h2>
                    <p className="text-xs text-neutral-500">EXAONE 기반 심층 분석</p>
                  </div>
                </div>
                {!analysisResult && (
                  <button
                    onClick={handleAnalysis}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>EXAONE 분석 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>✨ AI 트렌드 분석</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {analysisResult ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-xs text-emerald-700">
                      <Check className="w-4 h-4" />
                      {trendsData.summary.totalProducts}개 제품 데이터 분석 완료
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700 mb-3">브랜드별 전략 방향</h4>
                    <div className="space-y-2">
                      {analysisResult.brandStrategies.map((strategy, idx) => (
                        <motion.div
                          key={idx}
                          className="text-sm text-neutral-600 pl-4 border-l-2 border-[var(--color-primary-300)] py-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          {strategy}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                        <Beaker className="w-4 h-4 text-blue-500" /> 성분 트렌드
                      </h4>
                      <ul className="space-y-1.5">
                        {analysisResult.ingredientTrends.map((trend, idx) => (
                          <li key={idx} className="text-sm text-neutral-600 flex items-start gap-2">
                            <span className="text-[var(--color-primary-500)] mt-1">•</span>
                            {trend}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-rose-500" /> 기능 트렌드
                      </h4>
                      <ul className="space-y-1.5">
                        {analysisResult.functionTrends.map((trend, idx) => (
                          <li key={idx} className="text-sm text-neutral-600 flex items-start gap-2">
                            <span className="text-rose-500 mt-1">•</span>
                            {trend}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-amber-500" /> 시장 전망
                    </h4>
                    <p className="text-sm text-neutral-600">{analysisResult.marketOutlook}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                    <span className="text-xs text-neutral-500">이 분석이 도움이 되었나요?</span>
                    <button className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors">
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
                      <ThumbsDown className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <p className="text-sm text-neutral-500 text-center py-8">
                  AI 분석 버튼을 클릭하여 K-Beauty 브랜드 전략과 트렌드를 심층 분석하세요.
                </p>
              )}
            </section>
          </motion.div>
        )}

        {activeTab === 'brands' && (
          <motion.div
            key="brands"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-neutral-800">브랜드별 신제품 현황</h2>
                <p className="text-sm text-neutral-500 mt-1">브랜드를 클릭하여 상세 정보 확인</p>
              </div>
            </div>

            {/* 브랜드 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trendsData.brandSummaries.map((brand, idx) => {
                const config = BRAND_COLORS[brand.brand] || BRAND_COLORS['TIRTIR'];
                const isSelected = selectedBrand === brand.brand;

                return (
                  <motion.div
                    key={brand.brand}
                    className={`relative cursor-pointer rounded-2xl p-5 transition-all ${isSelected ? 'ring-2' : ''}`}
                    style={{
                      backgroundColor: config.bg,
                      borderColor: config.primary,
                      // @ts-ignore - ringColor for Tailwind ring
                      '--tw-ring-color': config.primary
                    } as React.CSSProperties}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: selectedBrand && !isSelected ? 0.6 : 1,
                      y: 0,
                      scale: isSelected ? 1.02 : 1
                    }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => setSelectedBrand(isSelected ? null : brand.brand)}
                  >
                    {isSelected && (
                      <div
                        className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: config.primary }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    <h3
                      className="font-bold text-lg mb-3"
                      style={{ color: config.primary }}
                    >
                      {brand.brand}
                    </h3>

                    {/* 대표 제품 이미지 미리보기 */}
                    <div className="flex -space-x-2 mb-4">
                      {trendsData.sampleNewProducts
                        .filter(p => p.brand === brand.brand)
                        .slice(0, 3)
                        .map((product, pIdx) => (
                          <div
                            key={pIdx}
                            className="w-10 h-10 rounded-lg bg-white border-2 border-white overflow-hidden shadow-sm"
                            style={{ transform: `rotate(${(pIdx - 1) * 5}deg)` }}
                          >
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                                <Package className="w-4 h-4 text-neutral-400" />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    <div className="flex gap-3 text-xs">
                      <span className="px-2 py-1 bg-white/60 rounded-lg font-medium text-emerald-700">
                        신제품 {brand.newCount}
                      </span>
                      <span className="px-2 py-1 bg-white/60 rounded-lg font-medium text-amber-700">
                        베스트 {brand.bestCount}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* 선택된 브랜드 상세 패널 */}
            <AnimatePresence>
              {selectedBrand && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  {(() => {
                    const brandData = trendsData.brandSummaries.find(b => b.brand === selectedBrand);
                    const config = BRAND_COLORS[selectedBrand] || BRAND_COLORS['TIRTIR'];
                    const brandProducts = trendsData.sampleNewProducts.filter(p => p.brand === selectedBrand);

                    return (
                      <div className="card-premium p-6 mt-4">
                        <div className="flex flex-col md:flex-row gap-8">
                          {/* 브랜드 정보 - 좌측 */}
                          <div className="md:w-1/4">
                            <h3
                              className="font-display text-2xl mb-2"
                              style={{ color: config.primary }}
                            >
                              {selectedBrand}
                            </h3>
                            <p className="text-sm text-neutral-500 mb-4">
                              {selectedBrand === 'TIRTIR' && '쿠션 파운데이션의 글로벌 강자'}
                              {selectedBrand === 'Medicube' && '더마 코스메틱 전문 브랜드'}
                              {selectedBrand === 'Beauty of Joseon' && '한방 성분의 현대적 해석'}
                              {selectedBrand === 'Laneige' && '워터 사이언스 스킨케어'}
                              {selectedBrand === 'COSRX' && '민감 피부 전문 솔루션'}
                              {selectedBrand === 'SKIN1004' && '센텔라 아시아티카 전문'}
                              {selectedBrand === 'BIODANCE' && '바이오 셀룰로스 마스크 혁신'}
                            </p>
                            <div className="space-y-2 text-sm">
                              <p className="text-neutral-600">
                                <span className="font-medium">총 제품:</span> {(brandData?.newCount || 0) + (brandData?.bestCount || 0)}개
                              </p>
                            </div>
                          </div>

                          {/* 신제품 - 우측 */}
                          <div className="md:w-3/4">
                            <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-emerald-500" /> 신제품
                            </h4>
                            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                              {brandProducts.slice(0, 6).map((product, idx) => (
                                <motion.div
                                  key={idx}
                                  className="flex-shrink-0 w-36 bg-white rounded-xl border border-neutral-100 overflow-hidden cursor-pointer hover:shadow-editorial-hover transition-shadow"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  onClick={() => setSelectedProduct(product)}
                                >
                                  <div className="h-24 bg-neutral-50 overflow-hidden">
                                    {product.imageUrl ? (
                                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-8 h-8 text-neutral-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-2.5">
                                    <p className="text-xs font-medium text-neutral-800 line-clamp-2 leading-tight">{product.name}</p>
                                    <p className="text-xs font-semibold mt-1" style={{ color: config.primary }}>{product.price}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* 베스트셀러 태그 */}
                            {brandData?.bestSellers && brandData.bestSellers.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                                  <Star className="w-4 h-4 text-amber-500" /> 베스트셀러
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {brandData.bestSellers.slice(0, 5).map((product, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1.5 text-xs font-medium rounded-lg"
                                      style={{ backgroundColor: config.bg, color: config.primary }}
                                    >
                                      {product.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* 필터/정렬 바 */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-neutral-800">신제품 갤러리</h2>
                <p className="text-sm text-neutral-500 mt-1">{filteredProducts.length}개의 신제품</p>
              </div>
              <div className="flex items-center gap-2">
                {/* 정렬 드롭다운 */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'brand' | 'name' | 'price-asc' | 'price-desc')}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-neutral-100 text-neutral-700 border-none focus:ring-2 focus:ring-[var(--color-primary-500)] cursor-pointer"
                >
                  <option value="brand">브랜드순</option>
                  <option value="name">이름순</option>
                  <option value="price-asc">가격 낮은순</option>
                  <option value="price-desc">가격 높은순</option>
                </select>

                {/* 필터 버튼 */}
                <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filterBrands.length > 0
                      ? 'bg-[var(--color-primary-500)] text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  필터 {filterBrands.length > 0 && `(${filterBrands.length})`}
                </button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 p-3 z-30"
                    >
                      <p className="text-xs font-semibold text-neutral-500 mb-2">브랜드 필터</p>
                      <div className="space-y-1.5">
                        {Object.keys(BRAND_COLORS).map(brand => (
                          <label key={brand} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filterBrands.includes(brand)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilterBrands([...filterBrands, brand]);
                                } else {
                                  setFilterBrands(filterBrands.filter(b => b !== brand));
                                }
                              }}
                              className="w-4 h-4 rounded border-neutral-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                            />
                            <span className="text-sm text-neutral-700">{brand}</span>
                          </label>
                        ))}
                      </div>
                      {filterBrands.length > 0 && (
                        <button
                          onClick={() => setFilterBrands([])}
                          className="w-full mt-3 text-xs text-neutral-500 hover:text-neutral-700"
                        >
                          필터 초기화
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </div>
            </div>

            {/* 제품 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.slice(0, displayedProducts).map((product, idx) => {
                const brandConfig = BRAND_COLORS[product.brand] || BRAND_COLORS['TIRTIR'];

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 12) * 0.03 }}
                    className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden cursor-pointer transition-all hover:border-[var(--color-primary-300)] hover:shadow-editorial-hover"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* 이미지 영역 - 3:4 비율 */}
                    <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden">
                      {product.imageUrl ? (
                        <motion.img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x267?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-neutral-300" />
                        </div>
                      )}

                      {/* 호버 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                          <span className="px-4 py-2 bg-white/90 rounded-lg text-sm font-medium text-neutral-800 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Quick View
                          </span>
                        </div>
                      </div>

                      {/* NEW 배지 */}
                      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                        NEW
                      </div>

                      {/* 브랜드 태그 */}
                      <div
                        className="absolute top-2 right-2 px-2 py-1 rounded-full text-white text-[10px] font-semibold"
                        style={{ background: brandConfig.gradient }}
                      >
                        {product.brand}
                      </div>
                    </div>

                    {/* 정보 영역 */}
                    <div className="p-3">
                      <h4 className="font-medium text-neutral-800 text-sm line-clamp-2 group-hover:text-[var(--color-primary-600)] transition-colors leading-tight mb-1.5">
                        {product.name}
                      </h4>
                      <p className="font-bold text-sm" style={{ color: brandConfig.primary }}>{product.price}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* 더보기 버튼 */}
            {displayedProducts < filteredProducts.length && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  className="btn-premium px-8"
                >
                  더 보기 ({filteredProducts.length - displayedProducts}개 남음)
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 제품 상세 모달 */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* 피부 고민별 제품 목록 팝업 */}
      <AnimatePresence>
        {selectedConcern && (
          <PremiumModal isOpen={true} onClose={() => setSelectedConcern(null)} maxWidth="900px">
            <div className="p-6">
              {/* 헤더 */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-neutral-100">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: CONCERN_CONFIG[selectedConcern.name]?.bg || 'rgba(100,116,139,0.1)' }}
                >
                  {CONCERN_CONFIG[selectedConcern.name]?.icon || '🎯'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-800">
                    {selectedConcern.label} 타겟 신제품
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {selectedConcern.loading
                      ? '제품 정보를 불러오는 중...'
                      : `총 ${selectedConcern.products.length}개의 제품이 ${selectedConcern.label} 고민을 타겟으로 합니다`
                    }
                  </p>
                </div>
              </div>

              {/* 제품 그리드 */}
              {selectedConcern.loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="w-8 h-8 text-[var(--color-primary-500)] animate-spin" />
                  <p className="text-neutral-500">제품 정보를 불러오는 중...</p>
                </div>
              ) : selectedConcern.products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
                  {selectedConcern.products.map((product, idx) => {
                    const brandConfig = BRAND_COLORS[product.brand] || BRAND_COLORS['TIRTIR'];

                    return (
                      <motion.div
                        key={product.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-xl border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:border-[var(--color-primary-300)]"
                        onClick={() => {
                          setSelectedConcern(null);
                          setSelectedProduct(product);
                        }}
                      >
                        {/* 제품 이미지 */}
                        <div className="aspect-square bg-neutral-50 relative overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-neutral-300" />
                            </div>
                          )}
                          {/* 브랜드 태그 */}
                          <div
                            className="absolute top-2 right-2 px-2 py-1 rounded-full text-white text-[10px] font-semibold"
                            style={{ background: brandConfig.gradient }}
                          >
                            {product.brand}
                          </div>
                        </div>

                        {/* 제품 정보 */}
                        <div className="p-3">
                          <p className="text-sm font-medium text-neutral-800 line-clamp-2 leading-tight mb-1">
                            {product.name}
                          </p>
                          <p className="text-sm font-bold" style={{ color: brandConfig.primary }}>
                            {product.price}
                          </p>
                          {product.keyIngredients && product.keyIngredients.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.keyIngredients.slice(0, 2).map((ing, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                                  {ing}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <p>해당 고민을 타겟으로 하는 신제품이 없습니다.</p>
                </div>
              )}
            </div>
          </PremiumModal>
        )}
      </AnimatePresence>

      {/* 하단 메타 정보 */}
      <div className="text-center py-6 border-t border-neutral-200">
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
          <Clock className="w-3 h-3" />
          <span>Updated: {new Date().toLocaleDateString('ko-KR')}</span>
          <span className="mx-2">|</span>
          <span>Data: 7 K-Beauty Brands</span>
        </div>
      </div>
    </div>
  );
}
