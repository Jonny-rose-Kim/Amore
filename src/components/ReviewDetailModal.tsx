import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, Music, Youtube, ShoppingBag, Store, Star } from 'lucide-react';

interface ReviewEntry {
  review: string;
  koreanTranslation: string;
  author: string;
  postedAt: string;
  rating: number;
  product?: string;
  brand?: string;
}

interface ReviewDetail {
  keyword: string;
  review: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Amazon' | 'Shopee' | 'Cosme' | 'Naver' | 'Kakao';
  author: string;
  date: string;
  additionalInfo: string;
  isPositive: boolean;
  reviews?: ReviewEntry[];
}

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewDetail: ReviewDetail | null;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'Instagram':
      return Instagram;
    case 'TikTok':
      return Music;
    case 'YouTube':
      return Youtube;
    case 'Amazon':
    case 'Shopee':
      return ShoppingBag;
    case 'Cosme':
    case 'Naver':
    case 'Kakao':
      return Store;
    default:
      return Instagram;
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'Instagram':
      return 'text-pink-500';
    case 'TikTok':
      return 'text-cyan-500';
    case 'YouTube':
      return 'text-red-500';
    case 'Amazon':
    case 'Shopee':
      return 'text-orange-500';
    case 'Cosme':
    case 'Naver':
    case 'Kakao':
      return 'text-purple-500';
    default:
      return 'text-slate-500';
  }
};

// Mock review entries with Korean translations
const generateMockReviews = (keyword: string, platform: string, isPositive: boolean): ReviewEntry[] => {
  const positiveReviews: ReviewEntry[] = [
    {
      review: `I've been using products with ${keyword} for about 3 months now and the difference is incredible. My skin feels so much smoother and more hydrated throughout the day.`,
      koreanTranslation: `${keyword}이 들어간 제품을 약 3개월간 사용했는데 차이가 정말 놀랍습니다. 피부가 하루 종일 훨씬 매끄럽고 촉촉하게 느껴져요.`,
      author: 'beautyreview_23',
      postedAt: '2025-01-15',
      rating: 5,
      product: 'Hydra Boost Serum',
      brand: 'Laneige',
    },
    {
      review: `This ${keyword} product is a game changer! I noticed visible improvement in my skin texture within 2 weeks. Highly recommend for anyone dealing with dullness.`,
      koreanTranslation: `이 ${keyword} 제품은 정말 판도를 바꿔놓았어요! 2주 안에 피부결이 눈에 띄게 개선된 것을 느꼈습니다. 칙칙함으로 고민하시는 분들께 강력 추천합니다.`,
      author: 'skincare_lover',
      postedAt: '2025-01-08',
      rating: 4,
      product: 'Glow Revival Cream',
      brand: 'Sulwhasoo',
    },
    {
      review: `Finally found a ${keyword} formula that doesn't irritate my sensitive skin. The lightweight texture absorbs quickly and leaves no residue. Perfect for layering!`,
      koreanTranslation: `드디어 민감한 피부에 자극을 주지 않는 ${keyword} 포뮬라를 찾았어요. 가벼운 텍스처가 빠르게 흡수되고 잔여감이 없습니다. 레이어링에 완벽해요!`,
      author: 'gentle_beauty',
      postedAt: '2024-12-28',
      rating: 5,
      product: 'Calming Essence',
      brand: 'Innisfree',
    },
  ];

  const negativeReviews: ReviewEntry[] = [
    {
      review: `I had high hopes for this ${keyword} product but unfortunately it caused breakouts after a week of use. The formula feels heavy and clogged my pores.`,
      koreanTranslation: `이 ${keyword} 제품에 기대가 컸는데 안타깝게도 사용 일주일 만에 트러블이 생겼어요. 포뮬라가 무겁게 느껴지고 모공을 막는 것 같았습니다.`,
      author: 'honest_reviewer',
      postedAt: '2025-01-12',
      rating: 2,
      product: 'Rich Repair Cream',
      brand: 'Hera',
    },
    {
      review: `Not worth the hype. The ${keyword} concentration seems too low to make any real difference. Used it for a month with zero visible results.`,
      koreanTranslation: `기대만큼은 아니었어요. ${keyword} 농도가 실질적인 차이를 만들기엔 너무 낮은 것 같습니다. 한 달간 사용했지만 눈에 보이는 결과는 전혀 없었어요.`,
      author: 'critical_beauty',
      postedAt: '2025-01-05',
      rating: 2,
      product: 'Active Ampoule',
      brand: 'Etude',
    },
    {
      review: `Disappointing experience with this ${keyword} serum. Strong fragrance that irritated my skin and the dropper dispenser wastes product. Returning this one.`,
      koreanTranslation: `이 ${keyword} 세럼은 실망스러운 경험이었습니다. 강한 향이 피부를 자극했고 드로퍼 디스펜서가 제품을 낭비하게 됩니다. 반품 예정이에요.`,
      author: 'no_nonsense_skincare',
      postedAt: '2024-12-20',
      rating: 1,
      product: 'Intensive Serum',
      brand: 'Mamonde',
    },
  ];

  return isPositive ? positiveReviews : negativeReviews;
};

export default function ReviewDetailModal({ isOpen, onClose, reviewDetail }: ReviewDetailModalProps) {
  if (!reviewDetail) return null;

  const Icon = getPlatformIcon(reviewDetail.platform);
  const platformColor = getPlatformColor(reviewDetail.platform);

  // Use provided reviews or generate mock ones
  const reviews = reviewDetail.reviews || generateMockReviews(reviewDetail.keyword, reviewDetail.platform, reviewDetail.isPositive);
  // Show 2-3 reviews
  const displayReviews = reviews.slice(0, 3);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[85vh] overflow-y-auto ${
              reviewDetail.isPositive ? 'border-2 border-emerald-200' : 'border-2 border-rose-200'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${reviewDetail.isPositive ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    <Icon className={`w-7 h-7 ${platformColor}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{reviewDetail.keyword}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-600 font-medium">{reviewDetail.platform}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        reviewDetail.isPositive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {reviewDetail.isPositive ? 'Positive' : 'Negative'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-5">
                {displayReviews.map((entry, index) => (
                  <div key={index} className={`rounded-xl overflow-hidden border ${
                    reviewDetail.isPositive ? 'border-emerald-200' : 'border-rose-200'
                  }`}>
                    {/* Review Header with product/brand info */}
                    <div className={`px-5 py-3 flex items-center justify-between ${
                      reviewDetail.isPositive ? 'bg-emerald-50' : 'bg-rose-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {entry.product && entry.brand
                            ? `${entry.brand} - ${entry.product}`
                            : `Review ${index + 1}`
                          }
                        </span>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-xs text-slate-500">by {entry.author}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Rating */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= entry.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-200 text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        {/* Posted Date */}
                        <span className="text-xs text-slate-500 bg-white/70 px-2 py-0.5 rounded">
                          {entry.postedAt}
                        </span>
                      </div>
                    </div>

                    {/* English Review */}
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">EN</span>
                        <span className="text-xs text-slate-400">Original Review</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed text-sm">{entry.review}</p>
                    </div>

                    {/* Korean Translation */}
                    <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">KR</span>
                        <span className="text-xs text-slate-400">한국어 번역</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-sm">{entry.koreanTranslation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              {reviewDetail.additionalInfo && (
                <div className="mt-5 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">부가 설명</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{reviewDetail.additionalInfo}</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
