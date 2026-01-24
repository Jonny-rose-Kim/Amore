/**
 * RAG Seed Data Script
 * 3개 MongoDB 컬렉션에 K-뷰티 사례 데이터 시딩
 * - rag_marketing: 마케팅 캠페인 사례 (18건)
 * - rag_product: 제형/성분 혁신 사례 (18건)
 * - rag_overseas: 해외 시장 진출 전략 사례 (18건)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'amore';

// ==================== rag_marketing (18건) ====================
const marketingData = [
  {
    brand: 'COSRX',
    campaign_name: 'TikTok Snail Mucin Challenge',
    category: 'Skincare',
    keywords: ['snail mucin', 'viral', 'tiktok', 'hydration', 'texture'],
    country: 'usa',
    strategy_type: 'social_viral',
    summary: 'COSRX의 스네일 뮤신 에센스가 TikTok에서 바이럴되며 미국 시장 1위를 달성한 캠페인 사례',
    details: {
      target_audience: 'Gen Z, 18-25세 스킨케어 초보자',
      channels: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
      key_message: 'Snail mucin texture ASMR - 자연 유래 성분의 신기한 텍스처',
      results: 'Amazon Best Seller 1위, 월 매출 300% 증가',
      content_strategy: 'UGC 기반 텍스처 ASMR 영상, Before/After 챌린지'
    },
    ingredients: ['snail mucin', 'hyaluronic acid'],
    effects: ['hydration', 'skin repair', 'anti-aging'],
    formulas: ['essence', 'serum']
  },
  {
    brand: 'Laneige',
    campaign_name: 'Lip Sleeping Mask Social Campaign',
    category: 'Skincare',
    keywords: ['lip mask', 'overnight', 'berry', 'sleeping mask', 'lip care'],
    country: 'usa',
    strategy_type: 'influencer_marketing',
    summary: 'Laneige 립 슬리핑 마스크의 인플루언서 캠페인으로 미국 립케어 시장 점유율 확대',
    details: {
      target_audience: '밀레니얼 여성, 20-35세',
      channels: ['Instagram', 'YouTube', 'Sephora'],
      key_message: 'Wake up to softer lips - 수면 중 립케어 혁신',
      results: 'Sephora 립케어 카테고리 1위, SNS 언급량 500% 증가',
      content_strategy: '셀럽 및 뷰티 인플루언서 협업, Night routine 컨텐츠'
    },
    ingredients: ['berry complex', 'vitamin C', 'hyaluronic acid'],
    effects: ['moisturizing', 'lip care', 'overnight treatment'],
    formulas: ['sleeping mask', 'balm']
  },
  {
    brand: 'Beauty of Joseon',
    campaign_name: 'Glow Serum Influencer Wave',
    category: 'Skincare',
    keywords: ['glow serum', 'propolis', 'niacinamide', 'glass skin', 'korean beauty'],
    country: 'usa',
    strategy_type: 'influencer_marketing',
    summary: 'Beauty of Joseon의 글로우 세럼이 스킨플루언서들의 자발적 추천으로 글로벌 히트',
    details: {
      target_audience: 'K-beauty 매니아, 25-35세',
      channels: ['YouTube', 'Reddit r/SkincareAddiction', 'Instagram'],
      key_message: 'Glass skin in a bottle - 한방 성분의 현대적 해석',
      results: '글로벌 매출 200% 증가, Reddit 커뮤니티 추천 1위',
      content_strategy: '스킨케어 전문 유튜버 리뷰, 커뮤니티 추천 유도'
    },
    ingredients: ['propolis', 'niacinamide', 'rice bran'],
    effects: ['brightening', 'glow', 'anti-inflammation'],
    formulas: ['serum', 'essence']
  },
  {
    brand: 'Medicube',
    campaign_name: 'AGE-R Device Launch',
    category: 'Skincare',
    keywords: ['beauty device', 'anti-aging', 'collagen', 'LED', 'home aesthetic'],
    country: 'usa',
    strategy_type: 'product_launch',
    summary: 'Medicube AGE-R 뷰티 디바이스의 홈 에스테틱 트렌드를 활용한 성공적 론칭',
    details: {
      target_audience: '30-45세 안티에이징 관심층',
      channels: ['Instagram', 'YouTube', 'Amazon Live'],
      key_message: 'Professional skin treatment at home - 전문가 수준의 홈케어',
      results: 'Amazon 뷰티 디바이스 Top 10, 론칭 첫 달 완판',
      content_strategy: '전문의 추천 컨텐츠, 사용 전후 비교 영상'
    },
    ingredients: ['collagen', 'peptide', 'EGF'],
    effects: ['anti-aging', 'firming', 'wrinkle care'],
    formulas: ['device', 'gel cream']
  },
  {
    brand: 'Innisfree',
    campaign_name: 'Green Tea Sustainability Campaign',
    category: 'Skincare',
    keywords: ['green tea', 'sustainability', 'eco-friendly', 'clean beauty', 'jeju'],
    country: 'usa',
    strategy_type: 'brand_storytelling',
    summary: 'Innisfree의 제주 녹차 스토리텔링과 지속가능성 메시지를 결합한 브랜드 캠페인',
    details: {
      target_audience: '환경 의식 있는 밀레니얼/Gen Z',
      channels: ['Instagram', 'YouTube', 'Brand Website'],
      key_message: 'From Jeju with love - 자연과 과학의 조화',
      results: '브랜드 인지도 40% 상승, 클린뷰티 카테고리 진입',
      content_strategy: '제주도 농장 다큐멘터리, 리사이클링 챌린지'
    },
    ingredients: ['green tea', 'green tea seed oil'],
    effects: ['antioxidant', 'hydration', 'soothing'],
    formulas: ['serum', 'cream', 'cleanser']
  },
  {
    brand: 'Sulwhasoo',
    campaign_name: 'First Care Luxury Positioning',
    category: 'Skincare',
    keywords: ['luxury', 'ginseng', 'anti-aging', 'first care', 'premium'],
    country: 'usa',
    strategy_type: 'luxury_positioning',
    summary: 'Sulwhasoo의 럭셔리 한방 포지셔닝으로 미국 프리미엄 스킨케어 시장 진입',
    details: {
      target_audience: '35-55세 프리미엄 스킨케어 소비자',
      channels: ['Nordstrom', 'Bergdorf Goodman', 'Instagram'],
      key_message: 'Korean herbal luxury - 5000년 한방 지혜의 럭셔리',
      results: 'Nordstrom 프리미엄 스킨케어 Top 20 진입',
      content_strategy: '한방 스토리텔링, 럭셔리 언박싱 영상'
    },
    ingredients: ['ginseng', 'jaumdan complex'],
    effects: ['anti-aging', 'firming', 'radiance'],
    formulas: ['activator', 'cream', 'serum']
  },
  {
    brand: 'Anua',
    campaign_name: 'Heartleaf Toner Viral Campaign',
    category: 'Skincare',
    keywords: ['heartleaf', 'toner', 'pore care', 'calming', 'sensitive skin'],
    country: 'usa',
    strategy_type: 'social_viral',
    summary: 'Anua 어성초 토너의 TikTok/YouTube 바이럴로 민감성 피부 시장 공략',
    details: {
      target_audience: '민감성 피부, 20-30대',
      channels: ['TikTok', 'YouTube', 'Olive Young Global'],
      key_message: 'Calm your skin naturally - 자연 유래 진정 솔루션',
      results: 'Olive Young 글로벌 토너 1위, 미국 매출 400% 증가',
      content_strategy: '민감성 피부 Before/After, 성분 교육 컨텐츠'
    },
    ingredients: ['heartleaf', 'panthenol', 'madecassoside'],
    effects: ['calming', 'pore care', 'hydration'],
    formulas: ['toner', 'pad']
  },
  {
    brand: 'SKIN1004',
    campaign_name: 'Centella Madagascar Campaign',
    category: 'Skincare',
    keywords: ['centella', 'madagascar', 'ampoule', 'soothing', 'acne'],
    country: 'japan',
    strategy_type: 'ingredient_storytelling',
    summary: 'SKIN1004의 마다가스카르 센텔라 원료 스토리텔링으로 일본 시장 공략',
    details: {
      target_audience: '성분 중시 소비자, 20-35세',
      channels: ['Qoo10', 'Instagram', '@cosme'],
      key_message: 'Pure Centella from Madagascar - 순수 원료의 힘',
      results: 'Qoo10 스킨케어 Top 5, @cosme 평점 5.5/7.0',
      content_strategy: '원료 산지 스토리, 일본 피부과 의사 추천'
    },
    ingredients: ['centella asiatica', 'madecassoside', 'asiaticoside'],
    effects: ['soothing', 'acne care', 'barrier repair'],
    formulas: ['ampoule', 'cream']
  },
  {
    brand: 'Mixsoon',
    campaign_name: 'Bean Essence Minimalist Appeal',
    category: 'Skincare',
    keywords: ['bean essence', 'minimalist', 'fermented', 'soybean', 'clean'],
    country: 'japan',
    strategy_type: 'minimalist_branding',
    summary: 'Mixsoon의 미니멀리스트 브랜딩으로 일본 클린뷰티 시장 진입 성공',
    details: {
      target_audience: '미니멀 스킨케어 추구, 25-40세',
      channels: ['Qoo10', 'Rakuten', 'Instagram'],
      key_message: 'One ingredient, maximum effect - 단일 성분의 순수한 효과',
      results: 'Qoo10 에센스 카테고리 Top 3',
      content_strategy: '미니멀 패키징 강조, 성분 투명성 마케팅'
    },
    ingredients: ['soybean', 'galactomyces', 'bifida ferment'],
    effects: ['hydration', 'brightening', 'anti-aging'],
    formulas: ['essence', 'toner']
  },
  {
    brand: 'TIRTIR',
    campaign_name: 'Mask Fit Red Cushion Viral',
    category: 'Makeup',
    keywords: ['cushion', 'foundation', 'shade range', 'inclusive', 'coverage'],
    country: 'usa',
    strategy_type: 'social_viral',
    summary: 'TIRTIR 마스크핏 레드 쿠션의 다양한 쉐이드 레인지로 미국 다인종 시장 공략',
    details: {
      target_audience: '다양한 피부톤, 18-35세',
      channels: ['TikTok', 'Instagram', 'Ulta Beauty'],
      key_message: '30 shades for everyone - 모든 피부톤을 위한 K-beauty',
      results: 'TikTok 조회수 5000만+, Ulta Beauty 입점',
      content_strategy: '다양한 피부톤 모델 활용, 쉐이드 매칭 컨텐츠'
    },
    ingredients: ['titanium dioxide', 'hyaluronic acid'],
    effects: ['coverage', 'long-lasting', 'moisturizing'],
    formulas: ['cushion', 'foundation']
  },
  {
    brand: 'rom&nd',
    campaign_name: 'Juicy Lasting Tint Color Marketing',
    category: 'Makeup',
    keywords: ['lip tint', 'juicy', 'color', 'long-lasting', 'glossy'],
    country: 'japan',
    strategy_type: 'color_marketing',
    summary: 'rom&nd 쥬시 래스팅 틴트의 컬러 마케팅으로 일본 립 시장 석권',
    details: {
      target_audience: '트렌디한 10-20대 여성',
      channels: ['Twitter/X', 'Instagram', 'Loft/Plaza'],
      key_message: 'Fruity colors for every mood - 과즙상 컬러의 정석',
      results: '일본 립틴트 시장 점유율 1위, Loft 뷰티 어워드 수상',
      content_strategy: '시즌별 컬러 스토리, 일본 모델/인플루언서 협업'
    },
    ingredients: ['jojoba oil', 'rosehip oil'],
    effects: ['color payoff', 'moisturizing', 'long-lasting'],
    formulas: ['lip tint', 'gloss']
  },
  {
    brand: 'Torriden',
    campaign_name: 'DIVE-IN Serum Hydration Hero',
    category: 'Skincare',
    keywords: ['hyaluronic acid', 'hydration', 'lightweight', 'sensitive', 'dive-in'],
    country: 'usa',
    strategy_type: 'product_hero',
    summary: 'Torriden DIVE-IN 세럼의 5중 히알루론산 기술력 강조로 미국 수분 세럼 시장 공략',
    details: {
      target_audience: '건조/민감 피부, 20-35세',
      channels: ['TikTok', 'Amazon', 'Olive Young Global'],
      key_message: '5 types of HA for deep hydration - 과학적 수분 충전',
      results: 'Amazon Choice 선정, 월 판매량 10만개 돌파',
      content_strategy: '성분 과학 교육, 수분 측정 Before/After'
    },
    ingredients: ['hyaluronic acid', 'panthenol', 'allantoin'],
    effects: ['deep hydration', 'soothing', 'barrier strengthening'],
    formulas: ['serum', 'cream', 'pad']
  },
  {
    brand: 'Banila Co',
    campaign_name: 'Clean It Zero Cleansing Balm Campaign',
    category: 'Cleansing',
    keywords: ['cleansing balm', 'double cleanse', 'oil cleansing', 'sherbet', 'makeup removal'],
    country: 'usa',
    strategy_type: 'education_marketing',
    summary: 'Banila Co 클린잇제로의 더블클렌징 교육 마케팅으로 미국 클렌징 시장 개척',
    details: {
      target_audience: '스킨케어 루틴 관심자, 20-40세',
      channels: ['YouTube', 'Sephora', 'Instagram'],
      key_message: 'The first step to perfect skin - 더블클렌징의 시작',
      results: 'Sephora 클렌저 Top 10, 더블클렌징 트렌드 선도',
      content_strategy: '더블클렌징 튜토리얼, 클렌징 전후 비교'
    },
    ingredients: ['hot springs water', 'vitamin E', 'acerola'],
    effects: ['deep cleansing', 'moisturizing', 'pore care'],
    formulas: ['cleansing balm', 'sherbet cleanser']
  },
  {
    brand: 'ROUND LAB',
    campaign_name: 'Dokdo Toner Japanese Market Entry',
    category: 'Skincare',
    keywords: ['dokdo', 'mineral', 'toner', 'hydration', 'deep sea water'],
    country: 'japan',
    strategy_type: 'localization',
    summary: 'ROUND LAB 독도 토너의 일본 시장 로컬라이제이션 전략',
    details: {
      target_audience: '일본 20-30대 민감 피부',
      channels: ['Qoo10', '@cosme', 'Don Quijote'],
      key_message: 'Deep sea mineral hydration - 심해수 미네랄 수분 공급',
      results: '@cosme 토너 부문 상위권, Don Quijote 입점',
      content_strategy: '미네랄 성분 과학, 일본 피부 맞춤 루틴 제안'
    },
    ingredients: ['deep sea water', 'hyaluronic acid', 'panthenol'],
    effects: ['hydration', 'mineral supply', 'soothing'],
    formulas: ['toner', 'cleanser', 'cream']
  },
  {
    brand: 'Dr.Jart+',
    campaign_name: 'Ceramidin Barrier Repair Campaign',
    category: 'Skincare',
    keywords: ['ceramide', 'barrier', 'moisturizer', 'dry skin', 'repair'],
    country: 'usa',
    strategy_type: 'dermatologist_endorsed',
    summary: 'Dr.Jart+ 세라마이딘 라인의 피부장벽 리페어 포지셔닝으로 미국 더마 시장 공략',
    details: {
      target_audience: '건조/손상 피부, 25-45세',
      channels: ['Sephora', 'Dermstore', 'Instagram'],
      key_message: 'Repair your barrier with ceramides - 세라마이드로 피부장벽 강화',
      results: 'Sephora 모이스처라이저 Top 5, 피부과 추천 제품',
      content_strategy: '피부과 전문의 추천, 피부장벽 교육 컨텐츠'
    },
    ingredients: ['ceramide', '5-cera complex', 'panthenol'],
    effects: ['barrier repair', 'deep moisturizing', 'soothing'],
    formulas: ['cream', 'serum', 'liquid']
  },
  {
    brand: 'Peripera',
    campaign_name: 'Ink Mood Glowy Tint SEA Campaign',
    category: 'Makeup',
    keywords: ['lip tint', 'glowy', 'affordable', 'cute', 'K-pop'],
    country: 'singapore',
    strategy_type: 'k-pop_collaboration',
    summary: 'Peripera 잉크 무드 글로이 틴트의 K-pop 콜라보로 동남아 시장 공략',
    details: {
      target_audience: 'K-pop 팬, 15-25세',
      channels: ['Shopee', 'Lazada', 'Instagram', 'TikTok'],
      key_message: 'K-pop idol lips at affordable price - 아이돌 립 메이크업',
      results: 'Shopee 립 카테고리 Top 3, 동남아 5개국 진출',
      content_strategy: 'K-pop 아이돌 메이크업 튜토리얼, 팬미팅 이벤트'
    },
    ingredients: ['jojoba oil', 'rosehip seed oil'],
    effects: ['color payoff', 'glossy finish', 'moisturizing'],
    formulas: ['lip tint', 'lip gloss']
  },
  {
    brand: 'SOME BY MI',
    campaign_name: 'AHA BHA PHA 30 Days Miracle',
    category: 'Skincare',
    keywords: ['AHA', 'BHA', 'PHA', 'acne', 'miracle', '30 days'],
    country: 'indonesia',
    strategy_type: 'before_after_challenge',
    summary: 'SOME BY MI 30일 기적 라인의 Before/After 챌린지로 인도네시아 여드름 케어 시장 공략',
    details: {
      target_audience: '여드름 피부, 16-28세',
      channels: ['Shopee', 'TikTok', 'Instagram'],
      key_message: '30 Days to clear skin - 30일 피부 혁신 챌린지',
      results: 'Shopee 스킨케어 베스트셀러, 인도네시아 매출 500% 증가',
      content_strategy: '30일 챌린지 UGC, Before/After 리뷰 캠페인'
    },
    ingredients: ['AHA', 'BHA', 'PHA', 'tea tree'],
    effects: ['acne care', 'exfoliation', 'pore care'],
    formulas: ['toner', 'serum', 'cleanser']
  },
  {
    brand: 'Etude',
    campaign_name: 'Fixing Tint Long-wear Campaign',
    category: 'Makeup',
    keywords: ['lip tint', 'fixing', 'long-wear', 'mask-proof', 'transfer-proof'],
    country: 'malaysia',
    strategy_type: 'product_benefit',
    summary: 'Etude 픽싱 틴트의 마스크 프루프 특성 강조로 말레이시아 히잡 착용자 타겟 마케팅',
    details: {
      target_audience: '히잡 착용 여성, 18-30세',
      channels: ['Shopee', 'Lazada', 'Instagram'],
      key_message: 'All-day color that stays - 하루종일 지속되는 컬러',
      results: '말레이시아 립틴트 시장 점유율 15% 달성',
      content_strategy: '히잡 메이크업 튜토리얼, 내구성 테스트 영상'
    },
    ingredients: ['silicone elastomer', 'vitamin E'],
    effects: ['long-lasting', 'transfer-proof', 'color retention'],
    formulas: ['lip tint', 'lip lacquer']
  }
];

// ==================== rag_product (18건) ====================
const productData = [
  {
    brand: 'COSRX',
    product_name: 'Advanced Snail 96 Mucin Power Essence',
    category: 'Skincare',
    keywords: ['snail mucin', 'essence', 'hydration', 'texture', 'sticky'],
    country: 'usa',
    innovation_type: 'texture_innovation',
    summary: 'COSRX 스네일 96 뮤신 에센스의 독특한 점성 텍스처가 ASMR 트렌드와 결합하며 글로벌 히트',
    details: {
      key_ingredients: ['Snail Secretion Filtrate 96%', 'Betaine', 'Hyaluronic Acid'],
      formulation_insight: '96% 고농축 스네일 뮤신의 점성 텍스처가 피부 흡수 시 ASMR 감각 제공',
      texture_innovation: '끈적임을 긍정적 경험으로 전환 - 줄줄 늘어나는 텍스처가 SNS 바이럴 요소',
      usp: '단일 고농축 성분으로 다기능 효과 - 수분, 진정, 재생을 하나의 에센스로',
      market_response: '아마존 뷰티 카테고리 지속 1위, 리뷰 10만건 이상'
    },
    ingredients: ['snail mucin', 'betaine', 'hyaluronic acid'],
    effects: ['hydration', 'repair', 'anti-aging', 'soothing'],
    formulas: ['essence']
  },
  {
    brand: 'Torriden',
    product_name: 'DIVE-IN Low Molecular Hyaluronic Acid Serum',
    category: 'Skincare',
    keywords: ['hyaluronic acid', 'low molecular', '5-layer', 'hydration', 'lightweight'],
    country: 'usa',
    innovation_type: 'ingredient_technology',
    summary: 'Torriden DIVE-IN 세럼의 5중 히알루론산 멀티레이어 기술로 깊은 수분 공급 실현',
    details: {
      key_ingredients: ['5-Molecular Weight HA', 'Panthenol', 'Allantoin', 'Betaine'],
      formulation_insight: '5가지 분자량의 히알루론산을 조합하여 피부 각 층에 맞춤 수분 공급',
      texture_innovation: '수분감 있으면서도 가벼운 워터리 텍스처 - 끈적임 없는 수분 세럼',
      usp: '저분자~고분자 HA의 멀티레이어 시스템으로 즉각+장기 수분 효과',
      market_response: 'Amazon Choice 선정, Skincare Community 추천 1위'
    },
    ingredients: ['hyaluronic acid', 'panthenol', 'allantoin', 'betaine'],
    effects: ['deep hydration', 'barrier strengthening', 'soothing'],
    formulas: ['serum']
  },
  {
    brand: 'VT Cosmetics',
    product_name: 'REEDLE SHOT 300',
    category: 'Skincare',
    keywords: ['spicule', 'microneedle', 'collagen', 'anti-aging', 'reedle shot'],
    country: 'usa',
    innovation_type: 'delivery_technology',
    summary: 'VT 리들샷의 천연 스피큘 마이크로니들 기술로 성분 전달력 혁신',
    details: {
      key_ingredients: ['Natural Spicule', 'Collagen', 'Peptide', 'Niacinamide'],
      formulation_insight: '해면침(스피큘)을 활용한 물리적 성분 전달 - 미세 채널 형성으로 흡수율 극대화',
      texture_innovation: '도포 시 미세한 따끔함으로 효과 체감 제공 - 감각적 피드백',
      usp: '주사 없이 마이크로니들 효과 - 가정에서 전문적 수준의 성분 전달',
      market_response: 'TikTok 바이럴, 미국 안티에이징 세럼 Top 10'
    },
    ingredients: ['spicule', 'collagen', 'peptide', 'niacinamide'],
    effects: ['anti-aging', 'firming', 'ingredient delivery', 'skin texture'],
    formulas: ['serum', 'essence']
  },
  {
    brand: 'Sulwhasoo',
    product_name: 'Concentrated Ginseng Renewing Cream EX',
    category: 'Skincare',
    keywords: ['ginseng', 'luxury', 'anti-aging', 'herbal', 'premium cream'],
    country: 'usa',
    innovation_type: 'ingredient_heritage',
    summary: 'Sulwhasoo 자음생 크림의 인삼 사포닌 복합 기술로 럭셔리 안티에이징 시장 선도',
    details: {
      key_ingredients: ['Ginsenoside Compound', 'Jaumdan Complex', 'Red Ginseng Oil'],
      formulation_insight: '인삼의 사포닌 성분을 나노화하여 피부 흡수율 극대화, 한방 발효 기술 적용',
      texture_innovation: '리치하면서도 녹아드는 크림 텍스처 - 무거움 없는 영양감',
      usp: '5000년 한방 지혜와 현대 과학의 결합 - 인삼 유래 안티에이징',
      market_response: 'Nordstrom 프리미엄 크림 부문 상위권'
    },
    ingredients: ['ginseng', 'red ginseng oil', 'jaumdan complex'],
    effects: ['anti-aging', 'firming', 'nourishing', 'radiance'],
    formulas: ['cream']
  },
  {
    brand: 'Anua',
    product_name: 'Heartleaf 77% Soothing Toner',
    category: 'Skincare',
    keywords: ['heartleaf', 'soothing', 'sensitive', 'toner', 'pore care'],
    country: 'usa',
    innovation_type: 'single_ingredient_focus',
    summary: 'Anua 어성초 77% 토너의 단일 허브 고농축 전략으로 민감성 피부 시장 공략',
    details: {
      key_ingredients: ['Heartleaf Extract 77%', 'Panthenol', 'Madecassoside'],
      formulation_insight: '어성초(호투투이니아코르다타) 77% 고농축으로 진정 효과 극대화',
      texture_innovation: '물처럼 가벼운 텍스처에 높은 유효 성분 함량 - 자극 없는 고기능',
      usp: '한국 전통 허브의 현대적 재해석 - 과학적 근거의 진정 솔루션',
      market_response: 'Olive Young 글로벌 토너 1위, Amazon 스킨케어 Top 20'
    },
    ingredients: ['heartleaf', 'panthenol', 'madecassoside'],
    effects: ['soothing', 'pore care', 'hydration', 'calming'],
    formulas: ['toner']
  },
  {
    brand: 'Beauty of Joseon',
    product_name: 'Glow Serum: Propolis + Niacinamide',
    category: 'Skincare',
    keywords: ['propolis', 'niacinamide', 'glow', 'brightening', 'korean heritage'],
    country: 'usa',
    innovation_type: 'heritage_ingredient',
    summary: 'Beauty of Joseon 글로우 세럼의 프로폴리스+나이아신아마이드 조합으로 광채 피부 구현',
    details: {
      key_ingredients: ['Propolis Extract 60%', 'Niacinamide 2%', 'Rice Bran Water'],
      formulation_insight: '프로폴리스의 항염+영양 효과와 나이아신아마이드의 브라이트닝 시너지',
      texture_innovation: '꿀처럼 점성 있으면서 빠르게 흡수되는 독특한 텍스처',
      usp: '조선시대 미용법에서 영감받은 현대 K-beauty - 동양 미학의 재해석',
      market_response: 'Amazon Best Seller, Skincare Redditor 추천 Top 5'
    },
    ingredients: ['propolis', 'niacinamide', 'rice bran'],
    effects: ['brightening', 'glow', 'anti-inflammation', 'nourishing'],
    formulas: ['serum']
  },
  {
    brand: 'TIRTIR',
    product_name: 'Mask Fit Red Cushion',
    category: 'Makeup',
    keywords: ['cushion', 'shade range', 'coverage', 'long-lasting', 'inclusive'],
    country: 'usa',
    innovation_type: 'inclusive_beauty',
    summary: 'TIRTIR 마스크핏 레드 쿠션의 30 쉐이드 확장으로 인클루시브 K-beauty 선도',
    details: {
      key_ingredients: ['Titanium Dioxide', 'Hyaluronic Acid', 'Centella Asiatica'],
      formulation_insight: '다양한 피부톤에 맞는 30개 쉐이드 개발 - K-beauty 최초 수준',
      texture_innovation: '얇고 가벼운 레이어링이 가능한 빌더블 커버리지',
      usp: '다인종 시장을 위한 K-beauty 쿠션 - 인클루시브 쉐이드 레인지',
      market_response: 'TikTok 5000만 조회수, Ulta Beauty 입점'
    },
    ingredients: ['titanium dioxide', 'hyaluronic acid', 'centella asiatica'],
    effects: ['coverage', 'long-lasting', 'moisturizing', 'sun protection'],
    formulas: ['cushion foundation']
  },
  {
    brand: 'Medicube',
    product_name: 'AGE-R Booster Pro',
    category: 'Skincare',
    keywords: ['beauty device', 'EMS', 'LED', 'anti-aging', 'home aesthetic'],
    country: 'usa',
    innovation_type: 'device_skincare',
    summary: 'Medicube AGE-R 부스터 프로의 EMS+LED 결합 디바이스로 홈 에스테틱 시장 선도',
    details: {
      key_ingredients: ['Collagen Peptide', 'EGF', 'Adenosine'],
      formulation_insight: 'EMS(전기근육자극) + LED(광테라피) + 이온토포레시스 3중 기술 결합',
      texture_innovation: '디바이스와 전용 세럼의 시너지 - 성분 전달력 300% 향상',
      usp: '피부과 수준의 시술을 집에서 - 전문 디바이스의 대중화',
      market_response: 'Amazon 뷰티 디바이스 Top 10, 론칭 첫 달 완판'
    },
    ingredients: ['collagen', 'EGF', 'adenosine', 'peptide'],
    effects: ['anti-aging', 'firming', 'lifting', 'skin rejuvenation'],
    formulas: ['device', 'serum']
  },
  {
    brand: 'Laneige',
    product_name: 'Water Sleeping Mask',
    category: 'Skincare',
    keywords: ['sleeping mask', 'hydration', 'overnight', 'water', 'gel'],
    country: 'singapore',
    innovation_type: 'usage_innovation',
    summary: 'Laneige 워터 슬리핑 마스크의 수면 중 스킨케어 컨셉으로 동남아 시장 공략',
    details: {
      key_ingredients: ['Sleep-Tox', 'CICA', 'Squalane', 'Probiotic Complex'],
      formulation_insight: '수면 중 피부 재생 리듬에 맞춘 성분 방출 기술 (Sleep-Tox)',
      texture_innovation: '젤리 같은 워터 텍스처 - 열대 기후에서도 편안한 사용감',
      usp: '바르고 자면 끝 - 간편한 나이트 스킨케어 혁명',
      market_response: '싱가포르 Sephora 마스크 1위, 동남아 전역 히트'
    },
    ingredients: ['sleep-tox', 'CICA', 'squalane'],
    effects: ['overnight hydration', 'skin recovery', 'brightening'],
    formulas: ['sleeping mask', 'gel cream']
  },
  {
    brand: 'IOPE',
    product_name: 'Retinol Expert 0.1%',
    category: 'Skincare',
    keywords: ['retinol', 'anti-aging', 'wrinkle', 'encapsulation', 'sensitive'],
    country: 'japan',
    innovation_type: 'stability_technology',
    summary: 'IOPE 레티놀 엑스퍼트의 캡슐화 기술로 민감 피부도 사용 가능한 레티놀 구현',
    details: {
      key_ingredients: ['Encapsulated Retinol 0.1%', 'Ceramide', 'Panthenol'],
      formulation_insight: '레티놀을 리포솜 캡슐에 봉입하여 자극 최소화 + 안정성 극대화',
      texture_innovation: '크리미한 텍스처에 캡슐이 터지며 레티놀 방출 - 감각적 사용 경험',
      usp: '민감 피부도 안심하고 쓰는 레티놀 - 캡슐화 안정화 기술',
      market_response: '@cosme 안티에이징 부문 화제 제품'
    },
    ingredients: ['retinol', 'ceramide', 'panthenol'],
    effects: ['anti-aging', 'wrinkle care', 'skin renewal'],
    formulas: ['serum', 'cream']
  },
  {
    brand: 'Goodal',
    product_name: 'Green Tangerine Vita C Dark Spot Serum',
    category: 'Skincare',
    keywords: ['vitamin C', 'dark spot', 'brightening', 'tangerine', 'natural'],
    country: 'indonesia',
    innovation_type: 'natural_vitamin_c',
    summary: 'Goodal 청귤 비타C 세럼의 천연 비타민C 추출 기술로 동남아 미백 시장 공략',
    details: {
      key_ingredients: ['Green Tangerine Extract 70%', 'Vitamin C', 'Niacinamide'],
      formulation_insight: '제주 청귤에서 추출한 천연 비타민C로 합성 비타민C 대비 저자극',
      texture_innovation: '오렌지빛 투명 세럼 - 시각적으로 비타민C 효과 연상',
      usp: '천연 비타민C의 안정화 - 자극 없이 강력한 브라이트닝',
      market_response: '인도네시아 Shopee 세럼 Top 5'
    },
    ingredients: ['vitamin C', 'green tangerine', 'niacinamide'],
    effects: ['brightening', 'dark spot care', 'antioxidant'],
    formulas: ['serum', 'cream']
  },
  {
    brand: 'Missha',
    product_name: 'Time Revolution Night Repair Ampoule',
    category: 'Skincare',
    keywords: ['bifida', 'ferment', 'night repair', 'anti-aging', 'ampoule'],
    country: 'japan',
    innovation_type: 'fermentation_technology',
    summary: 'Missha 타임 레볼루션 나이트 리페어의 비피다 발효 기술로 일본 안티에이징 시장 공략',
    details: {
      key_ingredients: ['Bifida Ferment Lysate', 'Lactobacillus', 'Saccharomyces'],
      formulation_insight: '이중 발효(비피다+유산균) 기술로 피부 마이크로바이옴 강화',
      texture_innovation: '농밀하면서도 빠르게 흡수되는 앰플 텍스처',
      usp: '발효 과학의 정수 - 피부 자생력 강화 안티에이징',
      market_response: '@cosme 앰플 부문 Top 10'
    },
    ingredients: ['bifida ferment', 'lactobacillus', 'saccharomyces'],
    effects: ['anti-aging', 'skin renewal', 'barrier strengthening'],
    formulas: ['ampoule', 'serum']
  },
  {
    brand: 'Numbuzin',
    product_name: 'No.3 Skin Softening Serum',
    category: 'Skincare',
    keywords: ['galactomyces', 'softening', 'texture', 'pore', 'first serum'],
    country: 'usa',
    innovation_type: 'texture_refinement',
    summary: 'Numbuzin 3번 세럼의 갈락토미세스 기반 피부결 개선으로 미국 텍스처 케어 시장 공략',
    details: {
      key_ingredients: ['Galactomyces Ferment Filtrate 88.9%', 'Niacinamide', 'Rice Ferment'],
      formulation_insight: '갈락토미세스 발효 여과물 88.9% 고농축으로 피부결 즉각 개선',
      texture_innovation: '실키한 워터 텍스처 - 즉각적인 피부결 부드러움 체감',
      usp: '발효 성분으로 피부 결 정돈 - 숫자 라인업으로 스킨케어 단순화',
      market_response: 'TikTok 바이럴, Olive Young 글로벌 Top 10'
    },
    ingredients: ['galactomyces', 'niacinamide', 'rice ferment'],
    effects: ['skin texture', 'pore care', 'brightening', 'softening'],
    formulas: ['serum', 'essence']
  },
  {
    brand: 'COSRX',
    product_name: 'The RX Retinol 0.3% Treatment',
    category: 'Skincare',
    keywords: ['retinol', 'anti-aging', 'gradual release', 'beginner', 'gentle'],
    country: 'usa',
    innovation_type: 'controlled_release',
    summary: 'COSRX RX 레티놀의 그래듀얼 릴리즈 기술로 레티놀 입문자 시장 공략',
    details: {
      key_ingredients: ['Retinol 0.3%', 'Bakuchiol', 'Squalane'],
      formulation_insight: '시간차 방출 기술로 레티놀의 즉각 자극 최소화, 점진적 효과 발현',
      texture_innovation: '오일-세럼 하이브리드 텍스처 - 보호막 형성과 동시에 레티놀 전달',
      usp: '레티놀 초보자를 위한 저자극 설계 - 그래듀얼 릴리즈',
      market_response: 'Amazon 레티놀 세럼 Top 15'
    },
    ingredients: ['retinol', 'bakuchiol', 'squalane'],
    effects: ['anti-aging', 'wrinkle care', 'skin renewal'],
    formulas: ['serum', 'oil']
  },
  {
    brand: 'Amorepacific',
    product_name: 'Time Response Skin Reserve Serum',
    category: 'Skincare',
    keywords: ['green tea', 'EGCG', 'luxury', 'antioxidant', 'anti-aging'],
    country: 'usa',
    innovation_type: 'proprietary_extract',
    summary: 'Amorepacific 타임 리스폰스의 독자 녹차 EGCG 추출 기술로 초럭셔리 시장 공략',
    details: {
      key_ingredients: ['EGCG Complex', 'Green Tea Stem Cell', 'Amino Acid'],
      formulation_insight: '녹차 줄기세포 배양 기술로 고순도 EGCG 추출 - 항산화력 극대화',
      texture_innovation: '실크처럼 부드러운 세럼 텍스처 - 럭셔리 감각 경험',
      usp: '녹차 바이오테크놀로지의 정수 - 자사 녹차밭 원료의 과학적 활용',
      market_response: 'Bergdorf Goodman, Neiman Marcus 입점'
    },
    ingredients: ['green tea', 'EGCG', 'amino acid'],
    effects: ['anti-aging', 'antioxidant', 'firming', 'radiance'],
    formulas: ['serum']
  },
  {
    brand: 'ma:nyo',
    product_name: 'Bifida Biome Complex Ampoule',
    category: 'Skincare',
    keywords: ['bifida', 'microbiome', 'barrier', 'probiotic', 'sensitive'],
    country: 'japan',
    innovation_type: 'microbiome_science',
    summary: 'ma:nyo 비피다 바이옴의 마이크로바이옴 기술로 일본 민감 피부 시장 공략',
    details: {
      key_ingredients: ['Bifida Ferment Lysate', 'Lactobacillus', '10 Probiotics Complex'],
      formulation_insight: '10종 프로바이오틱스 복합체로 피부 마이크로바이옴 생태계 강화',
      texture_innovation: '워터리 앰플 텍스처 - 빠른 흡수와 레이어링 가능',
      usp: '피부 유익균 강화 - 마이크로바이옴 사이언스 기반 스킨케어',
      market_response: 'Qoo10 앰플 Top 5, 일본 민감 피부 커뮤니티 추천'
    },
    ingredients: ['bifida', 'lactobacillus', 'probiotics'],
    effects: ['barrier repair', 'soothing', 'microbiome balance'],
    formulas: ['ampoule', 'serum']
  },
  {
    brand: 'SKIN1004',
    product_name: 'Madagascar Centella Hyalu-Cica Water-Fit Sun Serum',
    category: 'Sun Care',
    keywords: ['sunscreen', 'centella', 'hyaluronic acid', 'lightweight', 'no white cast'],
    country: 'indonesia',
    innovation_type: 'sun_protection_innovation',
    summary: 'SKIN1004 센텔라 선세럼의 백탁 없는 경량 포뮬라로 동남아 선케어 시장 공략',
    details: {
      key_ingredients: ['Centella Asiatica', 'Hyaluronic Acid', 'Chemical UV Filters'],
      formulation_insight: '케미컬 UV 필터와 센텔라+HA 조합으로 자극 없는 고보습 선케어',
      texture_innovation: '세럼 제형의 선크림 - 백탁/끈적임 없는 경량 사용감',
      usp: '열대 기후에 최적화된 가벼운 선케어 - 스킨케어+선프로텍션',
      market_response: '인도네시아 Shopee 선케어 Top 3'
    },
    ingredients: ['centella asiatica', 'hyaluronic acid'],
    effects: ['sun protection', 'hydration', 'soothing', 'no white cast'],
    formulas: ['sun serum', 'sunscreen']
  },
  {
    brand: 'Isntree',
    product_name: 'Hyaluronic Acid Airy Sun Stick',
    category: 'Sun Care',
    keywords: ['sun stick', 'hyaluronic acid', 'reapplication', 'portable', 'airy'],
    country: 'malaysia',
    innovation_type: 'format_innovation',
    summary: 'Isntree HA 에어리 선스틱의 휴대용 스틱 포맷으로 동남아 선케어 재도포 시장 개척',
    details: {
      key_ingredients: ['Hyaluronic Acid', 'Centella', 'Zinc Oxide'],
      formulation_insight: '메이크업 위에 덧바를 수 있는 투명 스틱 포뮬라',
      texture_innovation: '에어리한 파우더리 피니시 - 기존 선스틱의 끈적임 해결',
      usp: '재도포가 간편한 포맷 혁신 - 메이크업 위에도 OK',
      market_response: '말레이시아 Shopee 선케어 Top 10'
    },
    ingredients: ['hyaluronic acid', 'centella', 'zinc oxide'],
    effects: ['sun protection', 'hydration', 'easy reapplication'],
    formulas: ['sun stick', 'sunscreen']
  }
];

// ==================== rag_overseas (18건) ====================
const overseasData = [
  // USA (6건)
  {
    brand: 'K-Beauty Industry',
    country: 'usa',
    category: 'Skincare',
    keywords: ['glass skin', 'multi-step routine', 'clean beauty', 'skincare', 'innovation'],
    strategy_type: 'market_entry',
    summary: '미국 스킨케어 시장 진입 전략 - K-beauty 혁신 기술과 클린뷰티 트렌드의 융합',
    details: {
      entry_strategy: 'Sephora/Ulta 입점 → Amazon 확장 → D2C 구축의 단계적 채널 전략',
      consumer_preferences: '성분 투명성, 클린뷰티 인증, 다단계 루틴보다 간소화된 효과적 루틴 선호',
      distribution_channels: ['Sephora', 'Ulta Beauty', 'Amazon', 'Olive Young Global'],
      pricing_strategy: '프리미엄 가격대($25-60) 포지셔닝 - 더마 코스메틱 대비 합리적',
      success_factors: 'SNS 바이럴 + 성분 스토리텔링 + 인클루시브 마케팅',
      challenges: '미국 FDA 규제 대응, 인클루시브 쉐이드 개발, 현지 물류 인프라'
    },
    ingredients: ['hyaluronic acid', 'niacinamide', 'centella'],
    effects: ['hydration', 'brightening', 'anti-aging'],
    formulas: ['serum', 'essence', 'cream']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'usa',
    category: 'Makeup',
    keywords: ['cushion', 'lip tint', 'dewy', 'lightweight', 'shade range'],
    strategy_type: 'category_expansion',
    summary: '미국 메이크업 시장 확장 전략 - K-beauty 쿠션/립 틴트의 차별화 포지셔닝',
    details: {
      entry_strategy: '스킨케어 인지도 활용 → 쿠션/틴트 카테고리 진입 → 인클루시브 확장',
      consumer_preferences: '가볍고 자연스러운 베이스, 롱래스팅 립, 다양한 피부톤 대응',
      distribution_channels: ['Ulta Beauty', 'TikTok Shop', 'Amazon'],
      pricing_strategy: '중가 포지셔닝($15-35) - 드럭스토어와 프리미엄 사이',
      success_factors: '인클루시브 쉐이드 레인지, TikTok 바이럴, K-pop 연계',
      challenges: '쉐이드 다양성 개발비, 미국 소비자 피부톤 이해, 현지 트렌드 속도'
    },
    ingredients: ['titanium dioxide', 'jojoba oil'],
    effects: ['coverage', 'long-lasting', 'moisturizing'],
    formulas: ['cushion', 'lip tint', 'foundation']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'usa',
    category: 'Sun Care',
    keywords: ['sunscreen', 'lightweight', 'no white cast', 'daily use', 'SPF'],
    strategy_type: 'education_driven',
    summary: '미국 선케어 시장 교육 전략 - 매일 사용하는 경량 선크림의 필요성 인식 확산',
    details: {
      entry_strategy: '선케어 교육 컨텐츠 → 경량 포뮬라 차별화 → 디일리 선케어 습관 형성',
      consumer_preferences: '백탁 없는 경량 포뮬라, 메이크업 베이스 겸용, 보습 효과',
      distribution_channels: ['Amazon', 'Sephora', 'DTC Website'],
      pricing_strategy: '프리미엄 선케어($20-40) - 일본 선케어 대비 동등 가격대',
      success_factors: '텍스처 혁신(경량/무백탁), 스킨케어 효과 겸비, SNS 교육',
      challenges: 'FDA 규제(새 UV 필터 승인 지연), 일본 선케어와의 경쟁'
    },
    ingredients: ['centella', 'hyaluronic acid', 'niacinamide'],
    effects: ['sun protection', 'hydration', 'no white cast'],
    formulas: ['sun cream', 'sun serum', 'sun stick']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'usa',
    category: 'Cleansing',
    keywords: ['double cleanse', 'oil cleanser', 'gentle', 'pH balanced', 'cleansing balm'],
    strategy_type: 'category_creation',
    summary: '미국 클렌징 시장 카테고리 창출 - 더블클렌징 습관 교육으로 신규 시장 개척',
    details: {
      entry_strategy: '더블클렌징 교육 → 오일/밤 클렌저 1단계 시장 개척 → 저자극 2단계 확대',
      consumer_preferences: '순한 성분, 메이크업 완벽 제거, 피부 장벽 보호',
      distribution_channels: ['Sephora', 'Amazon', 'Target'],
      pricing_strategy: '중가($15-30) - 기존 미국 클렌저 대비 프리미엄',
      success_factors: '더블클렌징 교육 컨텐츠, 텍스처 혁신(밤→오일 전환)',
      challenges: '미국 소비자의 클렌징 습관 변화 유도, 기존 미국 브랜드 경쟁'
    },
    ingredients: ['jojoba oil', 'vitamin E', 'green tea'],
    effects: ['deep cleansing', 'moisturizing', 'gentle'],
    formulas: ['cleansing balm', 'oil cleanser', 'foam cleanser']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'usa',
    category: 'Hair Care',
    keywords: ['scalp care', 'hair loss', 'biotin', 'keratin', 'treatment'],
    strategy_type: 'niche_entry',
    summary: '미국 헤어케어 시장 니치 진입 - 두피 케어와 탈모 방지의 K-beauty 솔루션',
    details: {
      entry_strategy: '두피케어 전문 포지셔닝 → 탈모 방지 라인 확대 → 헤어 트리트먼트 확장',
      consumer_preferences: '두피 건강 중시, 자연 유래 성분, 비건/크루엘티프리',
      distribution_channels: ['Amazon', 'Specialty Beauty Stores', 'DTC'],
      pricing_strategy: '프리미엄 두피케어($25-50)',
      success_factors: '두피 과학 기반 마케팅, 한방 성분 스토리텔링',
      challenges: '미국 탈모 시장의 의료기기 규제, 기존 대형 브랜드 경쟁'
    },
    ingredients: ['biotin', 'caffeine', 'rosemary', 'ginseng'],
    effects: ['scalp care', 'hair growth', 'strengthening'],
    formulas: ['scalp serum', 'shampoo', 'treatment']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'usa',
    category: 'Body Care',
    keywords: ['body care', 'ceramide', 'moisturizing', 'fragrance', 'premium body'],
    strategy_type: 'premiumization',
    summary: '미국 바디케어 시장 프리미엄화 - K-beauty 스킨케어 기술의 바디 적용',
    details: {
      entry_strategy: '스킨케어 기술의 바디 적용 → 프리미엄 바디 세럼/크림 시장 개척',
      consumer_preferences: '스킨케어급 바디케어, 고급 향, 보습 지속력',
      distribution_channels: ['Sephora', 'Amazon', 'Bath & Body Works 대안'],
      pricing_strategy: '프리미엄($20-45) - 일반 바디로션 대비 2-3배',
      success_factors: '스킨케어 성분의 바디 적용, 럭셔리 감각 경험',
      challenges: '바디케어 시장의 낮은 가격 기대치, 대용량 필요'
    },
    ingredients: ['ceramide', 'shea butter', 'hyaluronic acid'],
    effects: ['deep moisturizing', 'barrier care', 'fragrance'],
    formulas: ['body serum', 'body cream', 'body oil']
  },
  // Japan (5건)
  {
    brand: 'K-Beauty Industry',
    country: 'japan',
    category: 'Skincare',
    keywords: ['centella', 'CICA', 'sensitive', 'minimal', 'derma'],
    strategy_type: 'ingredient_trend',
    summary: '일본 스킨케어 시장 성분 트렌드 전략 - 시카/센텔라 성분의 더마코스메틱 포지셔닝',
    details: {
      entry_strategy: 'Qoo10/Rakuten 입점 → @cosme 입소문 → Don Quijote/Loft 오프라인 확대',
      consumer_preferences: '저자극, 성분 안전성, 심플 스텝, 센텔라/시카 효과 신뢰',
      distribution_channels: ['Qoo10', '@cosme', 'Don Quijote', 'Loft', 'Plaza'],
      pricing_strategy: '중가(1500-4000엔) - 일본 더마 코스메틱 동등 가격대',
      success_factors: '@cosme 평점 관리, 일본어 성분 교육, 민감 피부 포지셔닝',
      challenges: '일본 약사법 규제, 현지 더마 브랜드 경쟁, 배송 속도'
    },
    ingredients: ['centella', 'madecassoside', 'panthenol'],
    effects: ['soothing', 'barrier repair', 'calming'],
    formulas: ['cream', 'serum', 'toner']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'japan',
    category: 'Makeup',
    keywords: ['lip tint', 'blush', 'natural look', 'K-pop', 'idol makeup'],
    strategy_type: 'cultural_influence',
    summary: '일본 메이크업 시장 한류 전략 - K-pop 아이돌 메이크업 트렌드의 일본 현지화',
    details: {
      entry_strategy: 'K-pop 팬덤 타겟 → 일본 모델/인플루언서 협업 → 일반 소비자 확대',
      consumer_preferences: '자연스러운 혈색감, 초경량 텍스처, 귀여운 패키징',
      distribution_channels: ['Loft', 'Plaza', 'Amazon Japan', '@cosme'],
      pricing_strategy: '저~중가(800-2500엔) - 일본 드럭스토어 가격대',
      success_factors: 'K-pop 콜라보, 일본 한정판, 귀여운 패키징 디자인',
      challenges: '일본 메이크업 문화 차이, 현지 브랜드 경쟁, 트렌드 속도'
    },
    ingredients: ['jojoba oil', 'vitamin E'],
    effects: ['color payoff', 'natural finish', 'long-lasting'],
    formulas: ['lip tint', 'cream blush', 'cushion']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'japan',
    category: 'Cleansing',
    keywords: ['oil cleanser', 'low pH', 'gentle', 'hydrophilic', 'sensitive skin'],
    strategy_type: 'quality_competition',
    summary: '일본 클렌징 시장 품질 경쟁 전략 - 저자극 오일 클렌저의 기술 차별화',
    details: {
      entry_strategy: '고품질 저자극 포뮬라 → 일본 피부과 인증 → 오프라인 매장 확대',
      consumer_preferences: '극저자극, 무향, 약산성, 높은 세정력과 보습력 양립',
      distribution_channels: ['Qoo10', 'Don Quijote', 'Matsumoto Kiyoshi'],
      pricing_strategy: '중가(1500-3000엔) - 일본 프리미엄 클렌저 동등',
      success_factors: '일본 피부과 테스트 인증, 극저자극 소구, 성분 투명성',
      challenges: '일본의 높은 품질 기준, 현지 MUJI/Hada Labo 경쟁'
    },
    ingredients: ['jojoba oil', 'olive oil', 'vitamin E'],
    effects: ['gentle cleansing', 'moisturizing', 'pore care'],
    formulas: ['oil cleanser', 'milk cleanser', 'foam cleanser']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'japan',
    category: 'Sun Care',
    keywords: ['UV protection', 'tone-up', 'lightweight', 'daily', 'sensitive'],
    strategy_type: 'innovation_competition',
    summary: '일본 선케어 시장 혁신 경쟁 - 톤업+자외선 차단의 하이브리드 포뮬라',
    details: {
      entry_strategy: '한국 선케어 기술 차별화 → 톤업/스킨케어 효과 강조 → 일본 시장 점유',
      consumer_preferences: '초경량 텍스처, 톤업 효과, 화장 베이스 겸용',
      distribution_channels: ['Qoo10', '@cosme', 'Amazon Japan'],
      pricing_strategy: '중가(1500-3500엔) - Anessa/Biore 동등 가격대',
      success_factors: '혁신 텍스처, 스킨케어 효과, @cosme 리뷰 관리',
      challenges: '일본 선케어 시장의 높은 기술 수준, Anessa/Biore 브랜드 인지도'
    },
    ingredients: ['centella', 'niacinamide', 'hyaluronic acid'],
    effects: ['UV protection', 'tone-up', 'moisturizing'],
    formulas: ['sun cream', 'sun essence', 'sun stick']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'japan',
    category: 'Hair Care',
    keywords: ['damage repair', 'amino acid', 'treatment', 'glossy', 'keratin'],
    strategy_type: 'premium_treatment',
    summary: '일본 헤어케어 시장 프리미엄 트리트먼트 전략 - 아미노산 기반 손상 케어',
    details: {
      entry_strategy: '살롱급 홈케어 포지셔닝 → 헤어 트리트먼트 시장 진입',
      consumer_preferences: '찰랑이는 윤기, 손상 복구, 향기 지속',
      distribution_channels: ['Loft', 'Plaza', 'Amazon Japan'],
      pricing_strategy: '중~고가(2000-5000엔)',
      success_factors: '일본 미용실 수준의 홈케어 효과, 좋은 향',
      challenges: '일본 헤어케어 시장의 성숙도, Shiseido/Milbon 경쟁'
    },
    ingredients: ['amino acid', 'keratin', 'camellia oil'],
    effects: ['damage repair', 'glossy', 'moisturizing'],
    formulas: ['hair treatment', 'hair mask', 'shampoo']
  },
  // Singapore (3건)
  {
    brand: 'K-Beauty Industry',
    country: 'singapore',
    category: 'Skincare',
    keywords: ['lightweight', 'oil control', 'hydration', 'tropical', 'glass skin'],
    strategy_type: 'climate_adaptation',
    summary: '싱가포르 스킨케어 시장 기후 적응 전략 - 열대 기후에 맞는 경량 K-beauty',
    details: {
      entry_strategy: 'Shopee/Lazada 온라인 진출 → Watsons 오프라인 → 프리미엄 백화점',
      consumer_preferences: '경량 텍스처, 오일 컨트롤, 수분 공급, 끈적임 없음',
      distribution_channels: ['Shopee', 'Lazada', 'Watsons', 'Sephora SG'],
      pricing_strategy: '중가(SGD 20-50) - 현지 구매력 고려 프리미엄',
      success_factors: '열대 기후 맞춤 포뮬라, 동남아 뷰티 인플루언서 협업',
      challenges: '열대 기후 제형 안정성, 일본/서양 브랜드 경쟁'
    },
    ingredients: ['hyaluronic acid', 'niacinamide', 'centella'],
    effects: ['oil control', 'hydration', 'lightweight'],
    formulas: ['gel cream', 'water serum', 'toner']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'singapore',
    category: 'Sun Care',
    keywords: ['SPF50', 'waterproof', 'lightweight', 'daily', 'tropical sun'],
    strategy_type: 'necessity_marketing',
    summary: '싱가포르 선케어 시장 필수품 전략 - 열대 자외선 대응 고보호 경량 선크림',
    details: {
      entry_strategy: '일상 선케어 필수성 교육 → 경량 고자외선 차단 포뮬라 차별화',
      consumer_preferences: 'SPF50+ PA++++, 방수, 경량, 백탁 없음',
      distribution_channels: ['Shopee', 'Watsons', 'Guardian'],
      pricing_strategy: '중가(SGD 15-35)',
      success_factors: '열대 기후 맞춤 방수 포뮬라, 경량 텍스처',
      challenges: '강한 자외선 환경에서의 지속력 증명, 일본 선케어 경쟁'
    },
    ingredients: ['centella', 'hyaluronic acid'],
    effects: ['sun protection', 'waterproof', 'lightweight'],
    formulas: ['sun cream', 'sun gel', 'sun spray']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'singapore',
    category: 'Makeup',
    keywords: ['long-lasting', 'transfer-proof', 'humidity-proof', 'natural', 'cushion'],
    strategy_type: 'performance_focus',
    summary: '싱가포르 메이크업 시장 내구성 전략 - 고온다습 환경에서도 지속되는 K-beauty 메이크업',
    details: {
      entry_strategy: '고온다습 환경 내구성 강조 → 쿠션/틴트 지속력 마케팅',
      consumer_preferences: '고온다습 환경 내구성, 자연스러운 마무리, 가벼운 사용감',
      distribution_channels: ['Shopee', 'Sephora SG', 'Lazada'],
      pricing_strategy: '중가(SGD 15-40)',
      success_factors: '습도 테스트 마케팅, 현지 인플루언서 리뷰',
      challenges: '고습도 환경 제형 안정성, 일본/서양 메이크업 경쟁'
    },
    ingredients: ['silicone elastomer', 'titanium dioxide'],
    effects: ['long-lasting', 'transfer-proof', 'natural finish'],
    formulas: ['cushion', 'lip tint', 'setting spray']
  },
  // Malaysia (2건)
  {
    brand: 'K-Beauty Industry',
    country: 'malaysia',
    category: 'Skincare',
    keywords: ['halal', 'gentle', 'whitening', 'hydration', 'affordable'],
    strategy_type: 'halal_certification',
    summary: '말레이시아 스킨케어 시장 할랄 전략 - 할랄 인증과 미백 효과의 결합',
    details: {
      entry_strategy: '할랄 인증 확보 → Shopee/Watsons 입점 → 무슬림 소비자 타겟 마케팅',
      consumer_preferences: '할랄 인증, 미백(브라이트닝), 저자극, 합리적 가격',
      distribution_channels: ['Shopee', 'Watsons', 'Guardian', 'Lazada'],
      pricing_strategy: '중저가(RM 30-80) - 현지 구매력 고려',
      success_factors: '할랄 인증, 미백 효과 강조, 무슬림 인플루언서 협업',
      challenges: '할랄 인증 비용/시간, 현지 할랄 브랜드 경쟁, 가격 민감도'
    },
    ingredients: ['niacinamide', 'glutathione', 'vitamin C'],
    effects: ['brightening', 'hydration', 'gentle'],
    formulas: ['serum', 'cream', 'toner']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'malaysia',
    category: 'Makeup',
    keywords: ['halal', 'long-lasting', 'hijab-friendly', 'transfer-proof', 'lip'],
    strategy_type: 'cultural_adaptation',
    summary: '말레이시아 메이크업 시장 문화 적응 전략 - 히잡 착용자를 위한 지속력 메이크업',
    details: {
      entry_strategy: '히잡 착용자 니즈 분석 → 지속력/트랜스퍼프루프 강조 → 할랄 인증',
      consumer_preferences: '히잡에 묻지 않는 립, 오랜 지속력, 할랄 인증',
      distribution_channels: ['Shopee', 'Watsons', 'Sephora MY'],
      pricing_strategy: '중가(RM 25-60)',
      success_factors: '히잡 착용자 맞춤 마케팅, 할랄 인증, 지속력 테스트',
      challenges: '문화적 민감성, 할랄 원료 소싱, 현지 브랜드 경쟁'
    },
    ingredients: ['silicone', 'vitamin E', 'jojoba oil'],
    effects: ['long-lasting', 'transfer-proof', 'moisturizing'],
    formulas: ['lip tint', 'cushion', 'setting powder']
  },
  // Indonesia (2건)
  {
    brand: 'K-Beauty Industry',
    country: 'indonesia',
    category: 'Skincare',
    keywords: ['whitening', 'acne', 'affordable', 'halal', 'natural'],
    strategy_type: 'mass_market',
    summary: '인도네시아 스킨케어 시장 대중 전략 - 저가 고효능 미백+여드름 케어',
    details: {
      entry_strategy: 'Shopee/Tokopedia 가격 경쟁 → TikTok Shop 바이럴 → 오프라인 확대',
      consumer_preferences: '저렴한 가격, 미백 효과, 여드름 케어, 할랄',
      distribution_channels: ['Shopee', 'Tokopedia', 'TikTok Shop', 'Sociolla'],
      pricing_strategy: '저~중가(IDR 50,000-200,000) - 현지 구매력 맞춤',
      success_factors: 'TikTok Shop 라이브커머스, 저가 고효능, 현지 KOL 협업',
      challenges: '극도의 가격 민감도, 현지 저가 브랜드 경쟁, 물류 인프라'
    },
    ingredients: ['niacinamide', 'salicylic acid', 'centella'],
    effects: ['brightening', 'acne care', 'pore care'],
    formulas: ['serum', 'toner', 'cleanser']
  },
  {
    brand: 'K-Beauty Industry',
    country: 'indonesia',
    category: 'Sun Care',
    keywords: ['SPF', 'affordable', 'daily', 'lightweight', 'no white cast'],
    strategy_type: 'habit_formation',
    summary: '인도네시아 선케어 시장 습관 형성 전략 - 일상 선케어 교육과 저가 접근성',
    details: {
      entry_strategy: '선케어 중요성 교육 → 저가 경량 선크림 제공 → 데일리 습관화',
      consumer_preferences: '저렴함, 백탁 없음, 경량, 데일리 사용 가능',
      distribution_channels: ['Shopee', 'TikTok Shop', 'Alfamart/Indomaret'],
      pricing_strategy: '저가(IDR 30,000-100,000) - 데일리 사용 가능한 가격',
      success_factors: '선케어 교육 컨텐츠, 저가 포지셔닝, TikTok 바이럴',
      challenges: '선케어 습관 부재, 극저가 필요, 열대 기후 안정성'
    },
    ingredients: ['centella', 'hyaluronic acid', 'aloe vera'],
    effects: ['sun protection', 'hydration', 'lightweight'],
    formulas: ['sun cream', 'sun gel', 'sun lotion']
  }
];

async function seedRAG() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DATABASE });
    console.log('Connected to MongoDB:', MONGODB_DATABASE);

    const db = mongoose.connection.db;

    // Drop existing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    for (const name of ['rag_marketing', 'rag_product', 'rag_overseas']) {
      if (collectionNames.includes(name)) {
        await db.dropCollection(name);
        console.log(`  Dropped existing collection: ${name}`);
      }
    }

    // Insert data
    console.log('\nInserting rag_marketing data...');
    await db.collection('rag_marketing').insertMany(marketingData);
    console.log(`  Inserted ${marketingData.length} marketing cases`);

    console.log('Inserting rag_product data...');
    await db.collection('rag_product').insertMany(productData);
    console.log(`  Inserted ${productData.length} product cases`);

    console.log('Inserting rag_overseas data...');
    await db.collection('rag_overseas').insertMany(overseasData);
    console.log(`  Inserted ${overseasData.length} overseas cases`);

    // Create text indexes
    console.log('\nCreating text indexes...');

    await db.collection('rag_marketing').createIndex(
      { keywords: 'text', summary: 'text', brand: 'text' },
      { weights: { keywords: 10, summary: 5, brand: 3 }, name: 'rag_marketing_text' }
    );
    console.log('  Created text index for rag_marketing');

    await db.collection('rag_product').createIndex(
      { keywords: 'text', summary: 'text', brand: 'text' },
      { weights: { keywords: 10, summary: 5, brand: 3 }, name: 'rag_product_text' }
    );
    console.log('  Created text index for rag_product');

    await db.collection('rag_overseas').createIndex(
      { keywords: 'text', summary: 'text', brand: 'text', country: 'text' },
      { weights: { keywords: 10, country: 8, summary: 5, brand: 3 }, name: 'rag_overseas_text' }
    );
    console.log('  Created text index for rag_overseas');

    console.log('\n✅ RAG seed data complete!');
    console.log(`   rag_marketing: ${marketingData.length} cases`);
    console.log(`   rag_product: ${productData.length} cases`);
    console.log(`   rag_overseas: ${overseasData.length} cases`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding RAG data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedRAG();
