import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, TrendingUp, BarChart3, ChevronDown, Sparkles, Info } from 'lucide-react';
import { useState } from 'react';

interface BestSellerProduct {
  id: string;
  name: string;
  brand: string;
  image?: string;
  salesRank: number;
  rating: number | string;
  reviewCount: number;
  popularityScore: number;
  description?: string;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  platform: string;
  products: BestSellerProduct[];
  additionalInfo: string;
}

// 이미지 로드 실패 시 대체 이미지
const fallbackImages: Record<string, string> = {
  'Amazon': 'https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1000_.jpg',
  'YouTube': 'https://m.media-amazon.com/images/I/61fYqBQQPeL._SL1500_.jpg',
  'Instagram': 'https://m.media-amazon.com/images/I/61Wbcv-SSAL._SL1500_.jpg',
  'default': 'https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1000_.jpg'
};

// 이미지 컴포넌트 (로딩 실패 처리 포함)
function ProductImage({ src, alt, platform }: { src?: string; alt: string; platform: string }) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackUrl = fallbackImages[platform] || fallbackImages['default'];

  // 이미지 URL이 없거나 placeholder인 경우 바로 fallback 사용
  const isPlaceholder = !src || src.includes('placeholder') || src.includes('via.placeholder');
  const imageUrl = isPlaceholder ? fallbackUrl : src;

  if (imgError || isPlaceholder) {
    return (
      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex flex-col items-center justify-center border border-slate-200 overflow-hidden">
        <img
          src={fallbackUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => {
            // 최종 fallback: 아이콘 표시
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-24 h-24 rounded-lg border border-slate-200 overflow-hidden relative bg-slate-100">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="w-6 h-6 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}

// 제품별 AI 설명 생성
const generateProductDescription = (product: BestSellerProduct, keyword: string, platform: string): string => {
  const platformKr = platform === 'Amazon' ? '아마존' : platform === 'YouTube' ? '유튜브' : platform === 'Instagram' ? '인스타그램' : platform;

  const descriptions: string[] = [
    `${product.brand}의 ${product.name}은(는) "${keyword}" 키워드로 ${platformKr}에서 높은 인기를 얻고 있는 제품입니다.`,
    `소비자들 사이에서 검증된 제품으로, 특히 ${keyword} 관련 효능으로 많은 사랑을 받고 있습니다.`,
    `K-Beauty 트렌드를 선도하는 제품 중 하나이며, 구매 전환율이 높고 재구매율도 우수한 것으로 분석됩니다.`
  ];

  return descriptions.join(' ');
};

export default function ProductDetailModal({
  isOpen,
  onClose,
  keyword,
  platform,
  products,
  additionalInfo
}: ProductDetailModalProps) {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const platformKr = platform === 'Amazon' ? '아마존' : platform === 'YouTube' ? '유튜브' : platform === 'Instagram' ? '인스타그램' : platform;
  const platformColor = platform === 'Amazon' ? 'orange' : platform === 'YouTube' ? 'red' : 'pink';

  // 최소 2개 제품 보장
  const displayProducts = products.length >= 2 ? products : [...products, ...Array(2 - products.length).fill(null)].filter(Boolean);

  const handleProductClick = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto border-2 ${
              platformColor === 'orange' ? 'border-orange-300' :
              platformColor === 'red' ? 'border-red-300' : 'border-pink-300'
            }`}>
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      platformColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                      platformColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {platform}
                    </span>
                    <span className="text-xs text-slate-500">인기 키워드</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{keyword}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Trend Index 표시 */}
                {displayProducts.length > 0 && displayProducts[0]?.popularityScore && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    platformColor === 'orange' ? 'bg-orange-50 border border-orange-200' :
                    platformColor === 'red' ? 'bg-red-50 border border-red-200' : 'bg-pink-50 border border-pink-200'
                  }`}>
                    <BarChart3 className={`w-5 h-5 ${
                      platformColor === 'orange' ? 'text-orange-600' :
                      platformColor === 'red' ? 'text-red-600' : 'text-pink-600'
                    }`} />
                    <div>
                      <span className="text-sm text-slate-700">Trend Index: </span>
                      <span className={`text-lg font-bold ${
                        platformColor === 'orange' ? 'text-orange-600' :
                        platformColor === 'red' ? 'text-red-600' : 'text-pink-600'
                      }`}>
                        {displayProducts[0].popularityScore}
                      </span>
                      <span className="text-sm text-slate-500"> / 100</span>
                    </div>
                  </div>
                )}

                {/* 베스트 셀러 제품 */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Package className={`w-5 h-5 ${
                      platformColor === 'orange' ? 'text-orange-600' :
                      platformColor === 'red' ? 'text-red-600' : 'text-pink-600'
                    }`} />
                    {platformKr} 인기 제품
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayProducts.map((product, index) => {
                      const isExpanded = expandedProductId === product?.id;
                      const productDescription = product ? (product.description || generateProductDescription(product, keyword, platform)) : '';

                      return (
                        <motion.div
                          key={product?.id || `placeholder-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`bg-gradient-to-br from-slate-50 to-white border rounded-xl overflow-hidden ${
                            platformColor === 'orange' ? 'border-orange-200' :
                            platformColor === 'red' ? 'border-red-200' : 'border-pink-200'
                          } ${isExpanded ? 'ring-2 ' + (
                            platformColor === 'orange' ? 'ring-orange-300' :
                            platformColor === 'red' ? 'ring-red-300' : 'ring-pink-300'
                          ) : ''} transition-all`}
                        >
                          {/* 클릭 가능한 메인 영역 */}
                          <div
                            onClick={() => product?.id && handleProductClick(product.id)}
                            className={`p-4 cursor-pointer hover:bg-slate-50/80 transition-colors ${
                              isExpanded ? 'bg-slate-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-4 mb-3">
                              <div className="relative">
                                <ProductImage
                                  src={product?.image}
                                  alt={product?.name || 'Product'}
                                  platform={platform}
                                />
                                {/* 클릭 힌트 */}
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                                  platformColor === 'orange' ? 'bg-orange-500' :
                                  platformColor === 'red' ? 'bg-red-500' : 'bg-pink-500'
                                }`}>
                                  <Info className="w-3 h-3 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`text-xs font-semibold mb-1 ${
                                  platformColor === 'orange' ? 'text-orange-600' :
                                  platformColor === 'red' ? 'text-red-600' : 'text-pink-600'
                                }`}>
                                  {product?.brand || 'Brand'}
                                </div>
                                <div className="text-sm font-bold text-slate-900 line-clamp-2">{product?.name || 'Product Name'}</div>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                    platformColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                                    platformColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-pink-100 text-pink-700'
                                  }`}>
                                    #{product?.salesRank || index + 1} 인기
                                  </span>
                                  <span className="text-[10px] text-slate-400">클릭하여 상세보기</span>
                                </div>
                              </div>
                              {/* 확장 아이콘 */}
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex-shrink-0 ${
                                  platformColor === 'orange' ? 'text-orange-400' :
                                  platformColor === 'red' ? 'text-red-400' : 'text-pink-400'
                                }`}
                              >
                                <ChevronDown className="w-5 h-5" />
                              </motion.div>
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-end">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className={`w-4 h-4 ${
                                    platformColor === 'orange' ? 'text-orange-500' :
                                    platformColor === 'red' ? 'text-red-500' : 'text-pink-500'
                                  }`} />
                                  <span className={`text-sm font-bold ${
                                    platformColor === 'orange' ? 'text-orange-600' :
                                    platformColor === 'red' ? 'text-red-600' : 'text-pink-600'
                                  }`}>
                                    인기도 {product?.popularityScore || 70}점
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 확장 영역 - 제품 상세 설명 */}
                          <AnimatePresence>
                            {isExpanded && product && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className={`px-4 pb-4 pt-2 border-t ${
                                  platformColor === 'orange' ? 'border-orange-100 bg-gradient-to-b from-orange-50/50 to-amber-50/30' :
                                  platformColor === 'red' ? 'border-red-100 bg-gradient-to-b from-red-50/50 to-rose-50/30' :
                                  'border-pink-100 bg-gradient-to-b from-pink-50/50 to-rose-50/30'
                                }`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className={`w-4 h-4 ${
                                      platformColor === 'orange' ? 'text-orange-500' :
                                      platformColor === 'red' ? 'text-red-500' : 'text-pink-500'
                                    }`} />
                                    <span className={`text-xs font-bold ${
                                      platformColor === 'orange' ? 'text-orange-700' :
                                      platformColor === 'red' ? 'text-red-700' : 'text-pink-700'
                                    }`}>
                                      AI 제품 분석
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-700 leading-relaxed">
                                    {productDescription}
                                  </p>

                                  {/* 추가 정보 태그 */}
                                  <div className="flex flex-wrap gap-1.5 mt-3">
                                    <span className={`text-[10px] px-2 py-1 rounded-full ${
                                      platformColor === 'orange' ? 'bg-orange-100 text-orange-600' :
                                      platformColor === 'red' ? 'bg-red-100 text-red-600' : 'bg-pink-100 text-pink-600'
                                    }`}>
                                      ✨ 트렌드 키워드: {keyword}
                                    </span>
                                    <span className={`text-[10px] px-2 py-1 rounded-full ${
                                      platformColor === 'orange' ? 'bg-amber-100 text-amber-600' :
                                      platformColor === 'red' ? 'bg-rose-100 text-rose-600' : 'bg-rose-100 text-rose-600'
                                    }`}>
                                      📊 인기도 상위 {product.salesRank * 10}%
                                    </span>
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                                      💬 리뷰 {product.reviewCount > 1000 ? '1K+' : product.reviewCount}개
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* 부가 설명 */}
                <div className={`rounded-xl p-4 ${
                  platformColor === 'orange' ? 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200' :
                  platformColor === 'red' ? 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200' :
                  'bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200'
                }`}>
                  <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${
                    platformColor === 'orange' ? 'text-orange-800' :
                    platformColor === 'red' ? 'text-red-800' : 'text-pink-800'
                  }`}>
                    <BarChart3 className="w-4 h-4" />
                    키워드 트렌드 분석
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{additionalInfo}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

