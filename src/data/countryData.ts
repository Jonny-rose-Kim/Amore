import { TrendItem, Country, BubbleItem, TrendEvidence, ReviewKeywords, TrendStatus, CombinationProduct } from './mockData';

// 국가별 트렌드 데이터 생성 함수
export const getCountryTrendData = (country: Country): TrendItem[] => {
  const baseData: TrendItem[] = [
    {
      rank: 1,
      category: 'Skincare',
      combination: country === 'usa' ? '레티놀 + 세럼 + 안티에이징' :
                   country === 'japan' ? '히알루론산 + 에센스 + 보습' :
                   country === 'singapore' ? '나이아신아마이드 + 토너 + 미백' :
                   country === 'malaysia' ? '비타민C + 세럼 + 광채' :
                   country === 'indonesia' ? '달팽이 점액 + 에센스 + 리페어' :
                   '레티놀 + 앰플 + 모공 케어',
      status: '🔥 Actionable Trend',
      trendType: 'Actionable Trend',
      signals: [
        {
          type: 'SNS',
          data: [
            { name: 'Week 1', value: 52 },
            { name: 'Week 2', value: 58 },
            { name: 'Week 3', value: 65 },
            { name: 'Week 4', value: 72 },
            { name: 'Week 5', value: 79 },
            { name: 'Week 6', value: 85 },
            { name: 'Week 7', value: 91 },
            { name: 'Week 8', value: 96 },
          ],
        },
        {
          type: 'Retail',
          data: [
            { name: 'Week 1', value: 48 },
            { name: 'Week 2', value: 55 },
            { name: 'Week 3', value: 62 },
            { name: 'Week 4', value: 69 },
            { name: 'Week 5', value: 76 },
            { name: 'Week 6', value: 82 },
            { name: 'Week 7', value: 88 },
            { name: 'Week 8', value: 93 },
          ],
        },
        {
          type: 'Review',
          data: [
            { name: 'Week 1', value: 50 },
            { name: 'Week 2', value: 57 },
            { name: 'Week 3', value: 64 },
            { name: 'Week 4', value: 71 },
            { name: 'Week 5', value: 78 },
            { name: 'Week 6', value: 84 },
            { name: 'Week 7', value: 90 },
            { name: 'Week 8', value: 95 },
          ],
        },
      ],
      insightText: country === 'usa' ? 'Retinol serum shows strong growth in US anti-aging market.' :
                   country === 'japan' ? '히알루론산 에센스가 일본 보습 시장에서 급성장 중.' :
                   country === 'singapore' ? 'Niacinamide toner trending in Singapore brightening market.' :
                   country === 'malaysia' ? 'Vitamin C serum gaining popularity in Malaysia.' :
                   country === 'indonesia' ? 'Snail mucin essence rising in Indonesia repair category.' :
                   '레티놀과 앰플 제형의 조합이 2030 모공 고객층에서 8주 연속 상승세입니다.',
      combinationReason: country === 'usa' 
        ? '레티놀의 각질 제거 효과와 세럼의 고농축 전달력이 안티에이징에 시너지를 일으키며, SNS(96%), 리테일(93%), 리뷰(95%) 3가지 신호에서 모두 상승세를 보이고 있어 즉시 활용 가능한 트렌드입니다.'
        : country === 'japan'
        ? '히알루론산의 강력한 보습력과 에센스의 침투력이 일본 보습 시장에 최적화되었습니다. SNS(94%), 리테일(92%), 리뷰(93%)에서 모두 급상승세를 보이고 있습니다.'
        : country === 'singapore'
        ? '나이아신아마이드의 미백 효과와 토너의 부드러운 사용감이 싱가포르 미백 시장에 적합합니다. SNS(92%), 리테일(90%), 리뷰(91%)에서 모두 상승세를 보이고 있습니다.'
        : country === 'malaysia'
        ? '비타민C의 미백 효과와 세럼의 고농축 전달력이 말레이시아 시장에서 인기를 얻고 있습니다. SNS(91%), 리테일(89%), 리뷰(90%)에서 모두 상승세를 보이고 있습니다.'
        : country === 'indonesia'
        ? '달팽이 점액의 리페어 효과와 에센스의 침투력이 인도네시아 시장에서 급성장 중입니다. SNS(93%), 리테일(91%), 리뷰(92%)에서 모두 상승세를 보이고 있습니다.'
        : '레티놀의 각질 제거 효과와 앰플의 고농축 전달력이 모공 케어에 시너지를 일으키며, SNS(95%), 리테일(86%), 리뷰(90%) 3가지 신호에서 모두 상승세를 보이고 있어 즉시 활용 가능한 트렌드입니다.',
      actionGuide: '🚀 Rising 단계: 테스트 제품이나 파일럿 기획에 적합. 신제품 라인업에 빠르게 반영하여 시장 반응을 확인할 수 있습니다.',
      metrics: [
        { label: country === 'domestic' ? '성장률' : 'Growth Rate', value: 35.2, unit: '%', change: 9.1, trend: 'up' },
        { label: country === 'domestic' ? 'SNS 언급' : 'SNS Mentions', value: 96, unit: '%', change: 13.5, trend: 'up' },
        { label: country === 'domestic' ? '판매 증가' : 'Sales Growth', value: 30.8, unit: '%', change: 7.2, trend: 'up' },
        { label: country === 'domestic' ? '긍정 리뷰' : 'Positive Reviews', value: 95, unit: '%', change: 4.2, trend: 'up' },
        { label: country === 'domestic' ? '시장 점유' : 'Market Share', value: 22.1, unit: '%', change: 3.5, trend: 'up' },
        { label: country === 'domestic' ? '인지도' : 'Awareness', value: 89.3, unit: '%', change: 11.2, trend: 'up' },
      ],
    },
    {
      rank: 2,
      category: 'Suncare',
      combination: country === 'usa' ? '아연옥사이드 + 선크림 + 끈적임 없는' :
                   country === 'japan' ? 'SPF50+ + 가벼운 + 자외선 차단' :
                   country === 'singapore' ? '이산화티타늄 + 젤 + 방수' :
                   country === 'malaysia' ? '광범위 스펙트럼 + 스프레이 + 땀 방지' :
                   country === 'indonesia' ? 'PA++++ + 크림 + 끈적임 없는' :
                   '아연옥사이드 + 선스틱 + 끈적임 없는',
      status: '🚀 Growing Trend',
      trendType: 'Actionable Trend',
      signals: [
        {
          type: 'SNS',
          data: [
            { name: 'Week 1', value: 88 },
            { name: 'Week 2', value: 90 },
            { name: 'Week 3', value: 89 },
            { name: 'Week 4', value: 91 },
            { name: 'Week 5', value: 92 },
            { name: 'Week 6', value: 90 },
            { name: 'Week 7', value: 91 },
            { name: 'Week 8', value: 93 },
          ],
        },
        {
          type: 'Retail',
          data: [
            { name: 'Week 1', value: 94 },
            { name: 'Week 2', value: 96 },
            { name: 'Week 3', value: 95 },
            { name: 'Week 4', value: 97 },
            { name: 'Week 5', value: 98 },
            { name: 'Week 6', value: 97 },
            { name: 'Week 7', value: 98 },
            { name: 'Week 8', value: 99 },
          ],
        },
        {
          type: 'Review',
          data: [
            { name: 'Week 1', value: 90 },
            { name: 'Week 2', value: 91 },
            { name: 'Week 3', value: 92 },
            { name: 'Week 4', value: 93 },
            { name: 'Week 5', value: 94 },
            { name: 'Week 6', value: 93 },
            { name: 'Week 7', value: 94 },
            { name: 'Week 8', value: 95 },
          ],
        },
      ],
      insightText: country === 'usa' ? 'Mineral sunscreen maintains #1 position in US market.' :
                   country === 'japan' ? 'SPF50+ 제품이 일본 자외선 차단 시장에서 안정적 인기.' :
                   country === 'singapore' ? 'Waterproof sunscreen essential in Singapore climate.' :
                   country === 'malaysia' ? 'Sweatproof formula trending in hot Malaysian market.' :
                   country === 'indonesia' ? 'Non-sticky sunscreen preferred in humid Indonesia.' :
                   '끈적임 없는 무기자차 선스틱이 야외 활동 증가로 리테일 랭킹 1위 유지 중.',
      metrics: [
        { label: country === 'domestic' ? '성장률' : 'Growth Rate', value: 5.8, unit: '%', change: 1.2, trend: 'up' },
        { label: country === 'domestic' ? 'SNS 언급' : 'SNS Mentions', value: 93, unit: '%', change: 2.5, trend: 'stable' },
        { label: country === 'domestic' ? '판매 증가' : 'Sales Growth', value: 4.1, unit: '%', change: 0.5, trend: 'up' },
        { label: country === 'domestic' ? '긍정 리뷰' : 'Positive Reviews', value: 95, unit: '%', change: 0.8, trend: 'stable' },
        { label: country === 'domestic' ? '시장 점유' : 'Market Share', value: 28.5, unit: '%', change: 0.3, trend: 'stable' },
        { label: country === 'domestic' ? '인지도' : 'Awareness', value: 85.2, unit: '%', change: 1.8, trend: 'up' },
      ],
    },
    {
      rank: 3,
      category: 'Skincare',
      combination: country === 'usa' ? 'Bakuchiol + Oil + Natural' :
                   country === 'japan' ? 'Ceramide + Lotion + Barrier' :
                   country === 'singapore' ? 'Centella + Gel + Soothing' :
                   country === 'malaysia' ? 'Aloe Vera + Gel + Cooling' :
                   country === 'indonesia' ? 'Rice Extract + Essence + Whitening' :
                   'AHA/BHA + Cleansing Oil + Blackhead',
      status: '🌱 Early Trend',
      trendType: 'Early Signal',
      signals: [
        {
          type: 'SNS',
          data: [
            { name: 'Week 1', value: 28 },
            { name: 'Week 2', value: 35 },
            { name: 'Week 3', value: 44 },
            { name: 'Week 4', value: 55 },
            { name: 'Week 5', value: 68 },
            { name: 'Week 6', value: 78 },
            { name: 'Week 7', value: 86 },
            { name: 'Week 8', value: 92 },
          ],
        },
        {
          type: 'Retail',
          data: [
            { name: 'Week 1', value: 25 },
            { name: 'Week 2', value: 32 },
            { name: 'Week 3', value: 41 },
            { name: 'Week 4', value: 52 },
            { name: 'Week 5', value: 65 },
            { name: 'Week 6', value: 75 },
            { name: 'Week 7', value: 83 },
            { name: 'Week 8', value: 89 },
          ],
        },
        {
          type: 'Review',
          data: [
            { name: 'Week 1', value: 30 },
            { name: 'Week 2', value: 38 },
            { name: 'Week 3', value: 47 },
            { name: 'Week 4', value: 58 },
            { name: 'Week 5', value: 71 },
            { name: 'Week 6', value: 80 },
            { name: 'Week 7', value: 88 },
            { name: 'Week 8', value: 93 },
          ],
        },
      ],
      insightText: country === 'usa' ? 'Bakuchiol emerging as natural retinol alternative in US.' :
                   country === 'japan' ? '세라마이드 로션이 일본 장벽 강화 시장에서 초기 트렌드.' :
                   country === 'singapore' ? 'Centella gel gaining traction for sensitive skin in Singapore.' :
                   country === 'malaysia' ? 'Aloe vera gel popular for cooling effect in hot climate.' :
                   country === 'indonesia' ? 'Rice extract essence trending for whitening in Indonesia.' :
                   '여름철 피지 관리를 위한 산성 성분 오일이 SNS에서 급상승 중인 초기 트렌드.',
      combinationReason: country === 'usa'
        ? '바쿠치올의 천연 레티놀 대체 효과와 오일의 침투력이 미국 시장에서 주목받고 있습니다. SNS(92%), 리테일(89%), 리뷰(90%)에서 8주간 급상승하며 초기 트렌드로 부상하고 있습니다.'
        : country === 'japan'
        ? '세라마이드의 장벽 강화 효과와 로션의 부드러운 사용감이 일본 시장에서 초기 트렌드로 주목받고 있습니다. SNS(88%), 리테일(85%), 리뷰(87%)에서 급상승세를 보이고 있습니다.'
        : country === 'singapore'
        ? '센텔라의 진정 효과와 젤의 쿨링감이 싱가포르 시장에서 초기 트렌드로 부상하고 있습니다. SNS(90%), 리테일(87%), 리뷰(89%)에서 급상승세를 보이고 있습니다.'
        : country === 'malaysia'
        ? '알로에의 쿨링 효과와 젤의 시원한 사용감이 말레이시아 시장에서 주목받고 있습니다. SNS(89%), 리테일(86%), 리뷰(88%)에서 급상승세를 보이고 있습니다.'
        : country === 'indonesia'
        ? '쌀 추출물의 미백 효과와 에센스의 침투력이 인도네시아 시장에서 초기 트렌드로 부상하고 있습니다. SNS(91%), 리테일(88%), 리뷰(90%)에서 급상승세를 보이고 있습니다.'
        : 'AHA/BHA의 각질 제거 효과와 오일의 모공 클렌징력이 결합되어 여름철 피지 관리에 효과적입니다. SNS(88%), 리테일(82%), 리뷰(90%)에서 8주간 급상승하며 초기 트렌드로 주목받고 있습니다.',
      actionGuide: '🌱 Early 단계: 테스트 제품이나 파일럿 기획에 적합. 빠른 성장세를 보이므로 조기 진입을 통해 시장 선점이 가능합니다.',
      metrics: [
        { label: country === 'domestic' ? '성장률' : 'Growth Rate', value: 52.3, unit: '%', change: 18.5, trend: 'up' },
        { label: country === 'domestic' ? 'SNS 언급' : 'SNS Mentions', value: 92, unit: '%', change: 20.2, trend: 'up' },
        { label: country === 'domestic' ? '판매 증가' : 'Sales Growth', value: 41.5, unit: '%', change: 15.3, trend: 'up' },
        { label: country === 'domestic' ? '긍정 리뷰' : 'Positive Reviews', value: 93, unit: '%', change: 7.8, trend: 'up' },
        { label: country === 'domestic' ? '시장 점유' : 'Market Share', value: 11.2, unit: '%', change: 2.8, trend: 'up' },
        { label: country === 'domestic' ? '인지도' : 'Awareness', value: 58.7, unit: '%', change: 15.2, trend: 'up' },
      ],
    },
    {
      rank: 4,
      category: 'Makeup',
      combination: country === 'usa' ? 'Hyaluronic Acid + Foundation + Glow' :
                   country === 'japan' ? 'Cushion + SPF + Natural' :
                   country === 'singapore' ? 'BB Cream + Lightweight + Coverage' :
                   country === 'malaysia' ? 'Powder + Matte + Long-lasting' :
                   country === 'indonesia' ? 'Tint + Dewy + Hydrating' :
                   'Hyaluronic acid + Cushion + Glow',
      status: '🚀 Growing Trend',
      trendType: 'Actionable Trend',
      signals: [
        {
          type: 'SNS',
          data: [
            { name: 'Week 1', value: 82 },
            { name: 'Week 2', value: 84 },
            { name: 'Week 3', value: 83 },
            { name: 'Week 4', value: 85 },
            { name: 'Week 5', value: 86 },
            { name: 'Week 6', value: 85 },
            { name: 'Week 7', value: 87 },
            { name: 'Week 8', value: 88 },
          ],
        },
        {
          type: 'Retail',
          data: [
            { name: 'Week 1', value: 78 },
            { name: 'Week 2', value: 80 },
            { name: 'Week 3', value: 79 },
            { name: 'Week 4', value: 81 },
            { name: 'Week 5', value: 82 },
            { name: 'Week 6', value: 81 },
            { name: 'Week 7', value: 83 },
            { name: 'Week 8', value: 84 },
          ],
        },
        {
          type: 'Review',
          data: [
            { name: 'Week 1', value: 85 },
            { name: 'Week 2', value: 87 },
            { name: 'Week 3', value: 86 },
            { name: 'Week 4', value: 88 },
            { name: 'Week 5', value: 89 },
            { name: 'Week 6', value: 88 },
            { name: 'Week 7', value: 90 },
            { name: 'Week 8', value: 91 },
          ],
        },
      ],
      insightText: country === 'usa' ? 'Hyaluronic acid foundation maintains stable popularity.' :
                   country === 'japan' ? '쿠션 제품이 일본 자연스러운 메이크업 트렌드에서 인기.' :
                   country === 'singapore' ? 'Lightweight BB cream preferred in Singapore.' :
                   country === 'malaysia' ? 'Matte powder foundation trending in humid Malaysia.' :
                   country === 'indonesia' ? 'Dewy tint popular for natural look in Indonesia.' :
                   '촉촉한 광채 피부 표현을 위한 히알루론산 쿠션이 건성 피부 타겟으로 인기.',
      metrics: [
        { label: country === 'domestic' ? '성장률' : 'Growth Rate', value: 4.2, unit: '%', change: 0.7, trend: 'stable' },
        { label: country === 'domestic' ? 'SNS 언급' : 'SNS Mentions', value: 88, unit: '%', change: 1.5, trend: 'stable' },
        { label: country === 'domestic' ? '판매 증가' : 'Sales Growth', value: 2.5, unit: '%', change: 0.4, trend: 'stable' },
        { label: country === 'domestic' ? '긍정 리뷰' : 'Positive Reviews', value: 91, unit: '%', change: 1.0, trend: 'stable' },
        { label: country === 'domestic' ? '시장 점유' : 'Market Share', value: 18.3, unit: '%', change: 0.2, trend: 'stable' },
        { label: country === 'domestic' ? '인지도' : 'Awareness', value: 81.5, unit: '%', change: 2.1, trend: 'up' },
      ],
    },
    {
      rank: 5,
      category: 'Skincare',
      combination: country === 'usa' ? 'Peptide + Moisturizer + Anti-aging' :
                   country === 'japan' ? 'Collagen + Cream + Firming' :
                   country === 'singapore' ? 'Adenosine + Serum + Wrinkle' :
                   country === 'malaysia' ? 'Coenzyme Q10 + Cream + Energy' :
                   country === 'indonesia' ? 'Stem Cell + Essence + Regeneration' :
                   'Panthenol + Cream + Barrier Repair',
      status: '🔥 Actionable Trend',
      trendType: 'Actionable Trend',
      signals: [
        {
          type: 'SNS',
          data: [
            { name: 'Week 1', value: 58 },
            { name: 'Week 2', value: 64 },
            { name: 'Week 3', value: 71 },
            { name: 'Week 4', value: 78 },
            { name: 'Week 5', value: 84 },
            { name: 'Week 6', value: 90 },
            { name: 'Week 7', value: 94 },
            { name: 'Week 8', value: 97 },
          ],
        },
        {
          type: 'Retail',
          data: [
            { name: 'Week 1', value: 54 },
            { name: 'Week 2', value: 60 },
            { name: 'Week 3', value: 67 },
            { name: 'Week 4', value: 74 },
            { name: 'Week 5', value: 80 },
            { name: 'Week 6', value: 86 },
            { name: 'Week 7', value: 91 },
            { name: 'Week 8', value: 95 },
          ],
        },
        {
          type: 'Review',
          data: [
            { name: 'Week 1', value: 92 },
            { name: 'Week 2', value: 93 },
            { name: 'Week 3', value: 94 },
            { name: 'Week 4', value: 95 },
            { name: 'Week 5', value: 96 },
            { name: 'Week 6', value: 96 },
            { name: 'Week 7', value: 97 },
            { name: 'Week 8', value: 97 },
          ],
        },
      ],
      insightText: country === 'usa' ? 'Peptide moisturizer shows strong growth with 97% positive reviews.' :
                   country === 'japan' ? '콜라겐 크림이 일본 탄력 케어 시장에서 급성장.' :
                   country === 'singapore' ? 'Adenosine serum trending for wrinkle care in Singapore.' :
                   country === 'malaysia' ? 'CoQ10 cream gaining popularity for energy boost.' :
                   country === 'indonesia' ? 'Stem cell essence rising for skin regeneration.' :
                   '환절기 장벽 강화 니즈로 판테놀 고농축 크림의 리뷰 긍정 반응 95% 기록.',
      metrics: [
        { label: country === 'domestic' ? '성장률' : 'Growth Rate', value: 31.5, unit: '%', change: 8.7, trend: 'up' },
        { label: country === 'domestic' ? 'SNS 언급' : 'SNS Mentions', value: 97, unit: '%', change: 11.8, trend: 'up' },
        { label: country === 'domestic' ? '판매 증가' : 'Sales Growth', value: 27.2, unit: '%', change: 6.5, trend: 'up' },
        { label: country === 'domestic' ? '긍정 리뷰' : 'Positive Reviews', value: 97, unit: '%', change: 3.2, trend: 'up' },
        { label: country === 'domestic' ? '시장 점유' : 'Market Share', value: 16.8, unit: '%', change: 2.1, trend: 'up' },
        { label: country === 'domestic' ? '인지도' : 'Awareness', value: 76.4, unit: '%', change: 7.8, trend: 'up' },
      ],
    },
    {
      rank: 6,
      category: 'Skincare',
      combination: country === 'usa' ? 'Vitamin C + Serum + Brightening' :
                   country === 'japan' ? 'Tranexamic Acid + Essence + Spot' :
                   country === 'singapore' ? 'Arbutin + Toner + Even Tone' :
                   country === 'malaysia' ? 'Kojic Acid + Serum + Lightening' :
                   country === 'indonesia' ? 'Glutathione + Ampoule + Whitening' :
                   'Cica + All-in-one + Soothing',
      status: '🚀 Growing Trend',
      trendType: 'Actionable Trend',
      signals: [
        {
          type: 'SNS',
          data: [
            { name: 'Week 1', value: 75 },
            { name: 'Week 2', value: 77 },
            { name: 'Week 3', value: 76 },
            { name: 'Week 4', value: 78 },
            { name: 'Week 5', value: 79 },
            { name: 'Week 6', value: 78 },
            { name: 'Week 7', value: 80 },
            { name: 'Week 8', value: 81 },
          ],
        },
        {
          type: 'Retail',
          data: [
            { name: 'Week 1', value: 71 },
            { name: 'Week 2', value: 73 },
            { name: 'Week 3', value: 72 },
            { name: 'Week 4', value: 74 },
            { name: 'Week 5', value: 75 },
            { name: 'Week 6', value: 74 },
            { name: 'Week 7', value: 76 },
            { name: 'Week 8', value: 77 },
          ],
        },
        {
          type: 'Review',
          data: [
            { name: 'Week 1', value: 78 },
            { name: 'Week 2', value: 80 },
            { name: 'Week 3', value: 81 },
            { name: 'Week 4', value: 82 },
            { name: 'Week 5', value: 83 },
            { name: 'Week 6', value: 84 },
            { name: 'Week 7', value: 85 },
            { name: 'Week 8', value: 86 },
          ],
        },
      ],
      insightText: country === 'usa' ? 'Vitamin C serum maintains stable position in brightening category.' :
                   country === 'japan' ? '트란엑삼산 에센스가 일본 잡티 케어 시장에서 안정적.' :
                   country === 'singapore' ? 'Arbutin toner popular for even skin tone in Singapore.' :
                   country === 'malaysia' ? 'Kojic acid serum trending for lightening in Malaysia.' :
                   country === 'indonesia' ? 'Glutathione ampoule rising for whitening in Indonesia.' :
                   '면도 후 자극 진정을 원하는 남성 고객층에서 시카 올인원 제품 재구매율 상승.',
      metrics: [
        { label: country === 'domestic' ? '성장률' : 'Growth Rate', value: 3.5, unit: '%', change: 0.6, trend: 'stable' },
        { label: country === 'domestic' ? 'SNS 언급' : 'SNS Mentions', value: 81, unit: '%', change: 1.2, trend: 'stable' },
        { label: country === 'domestic' ? '판매 증가' : 'Sales Growth', value: 2.1, unit: '%', change: 0.3, trend: 'stable' },
        { label: country === 'domestic' ? '긍정 리뷰' : 'Positive Reviews', value: 86, unit: '%', change: 0.9, trend: 'stable' },
        { label: country === 'domestic' ? '시장 점유' : 'Market Share', value: 14.2, unit: '%', change: 0.1, trend: 'stable' },
        { label: country === 'domestic' ? '인지도' : 'Awareness', value: 79.8, unit: '%', change: 1.5, trend: 'up' },
      ],
    },
    {
      rank: 7,
      category: 'Skincare',
      combination: country === 'usa' ? 'Ceramide + Repair + Barrier' :
                   country === 'japan' ? 'Madecassoside + Cream + Calming' :
                   country === 'singapore' ? 'Allantoin + Gel + Healing' :
                   country === 'malaysia' ? 'Chamomile + Lotion + Soothing' :
                   country === 'indonesia' ? 'Aloe + Gel + Cooling' :
                   'Biotin + Shampoo + Anti-hair loss',
      status: '🔥 Actionable Trend',
      trendType: country === 'usa' ? 'Actionable Trend' : 'Early Signal',
      signals: [
        {
          type: 'SNS',
          data: [
            { name: 'Week 1', value: 55 },
            { name: 'Week 2', value: 62 },
            { name: 'Week 3', value: 70 },
            { name: 'Week 4', value: 78 },
            { name: 'Week 5', value: 85 },
            { name: 'Week 6', value: 91 },
            { name: 'Week 7', value: 95 },
            { name: 'Week 8', value: 98 },
          ],
        },
        {
          type: 'Retail',
          data: [
            { name: 'Week 1', value: 52 },
            { name: 'Week 2', value: 59 },
            { name: 'Week 3', value: 67 },
            { name: 'Week 4', value: 75 },
            { name: 'Week 5', value: 82 },
            { name: 'Week 6', value: 88 },
            { name: 'Week 7', value: 93 },
            { name: 'Week 8', value: 96 },
          ],
        },
        {
          type: 'Review',
          data: [
            { name: 'Week 1', value: 90 },
            { name: 'Week 2', value: 92 },
            { name: 'Week 3', value: 94 },
            { name: 'Week 4', value: 95 },
            { name: 'Week 5', value: 96 },
            { name: 'Week 6', value: 97 },
            { name: 'Week 7', value: 97 },
            { name: 'Week 8', value: 98 },
          ],
        },
      ],
      insightText: country === 'usa' ? 'Ceramide barrier repair products show strong growth with seasonal demand.' :
                   country === 'japan' ? '마데카소사이드 크림이 일본 진정 케어 시장에서 급성장.' :
                   country === 'singapore' ? 'Allantoin gel trending for healing in Singapore.' :
                   country === 'malaysia' ? 'Chamomile lotion popular for soothing in Malaysia.' :
                   country === 'indonesia' ? 'Aloe gel rising for cooling effect in Indonesia.' :
                   '탈모 샴푸 시장은 포화 상태이나, 비오틴 고함량 제품은 여전히 상위권 유지.',
      metrics: [
        { label: country === 'domestic' ? '성장률' : 'Growth Rate', value: 33.8, unit: '%', change: 9.2, trend: 'up' },
        { label: country === 'domestic' ? 'SNS 언급' : 'SNS Mentions', value: 98, unit: '%', change: 12.5, trend: 'up' },
        { label: country === 'domestic' ? '판매 증가' : 'Sales Growth', value: 29.5, unit: '%', change: 7.1, trend: 'up' },
        { label: country === 'domestic' ? '긍정 리뷰' : 'Positive Reviews', value: 98, unit: '%', change: 4.5, trend: 'up' },
        { label: country === 'domestic' ? '시장 점유' : 'Market Share', value: 17.5, unit: '%', change: 2.3, trend: 'up' },
        { label: country === 'domestic' ? '인지도' : 'Awareness', value: 78.2, unit: '%', change: 8.5, trend: 'up' },
      ],
    },
  ];

  // evidence와 reviewKeywords 추가
  return baseData.map(item => ({
    ...item,
    evidence: getCombinationEvidence(item, country),
    reviewKeywords: getCombinationReviewKeywords(item),
  }));
};

// actionGuide와 combinationReason을 동적으로 생성하는 헬퍼 함수
const getActionGuide = (status?: string): string => {
  if (!status) return '🚀 Actionable Trend: 관심·구매·리뷰 지표가 모두 정합성을 보이며 실무 의사결정에 즉시 활용 가능한 단계입니다.';
  if (status.includes('Actionable Trend')) return '🚀 Actionable Trend: 관심·구매·리뷰 지표가 모두 정합성을 보이며 실무 의사결정에 즉시 활용 가능한 단계입니다. 신제품 라인업에 빠르게 반영하여 시장 반응을 확인할 수 있습니다.';
  if (status.includes('Growing Trend')) return '📈 Growing Trend: SNS 관심 증가와 함께 구매 지표가 동반 상승하는 단계입니다. Action 가능성을 검토하며 메인 제품 확장이나 조합 전략에 활용 가능합니다.';
  if (status.includes('Early Trend')) return '🌱 Early Trend: SNS 중심으로 초기 관심 신호가 관찰되는 단계입니다. 테스트 제품이나 파일럿 기획에 적합하며, 빠른 성장세를 보이므로 조기 진입을 통해 시장 선점이 가능합니다.';
  return '🚀 Actionable Trend: 관심·구매·리뷰 지표가 모두 정합성을 보이며 실무 의사결정에 즉시 활용 가능한 단계입니다.';
};

const getCombinationReason = (item: BubbleItem, country: Country): string => {
  const snsValue = Math.floor(item.value * 0.96);
  const retailValue = Math.floor(item.value * 0.93);
  const reviewValue = Math.floor(item.value * 0.95);
  
  const typeName = item.type === 'ingredient' ? '성분' : item.type === 'formula' ? '제형' : '효과';
  const countryName = country === 'usa' ? '미국' : country === 'japan' ? '일본' : country === 'singapore' ? '싱가포르' : country === 'malaysia' ? '말레이시아' : '인도네시아';
  
  if (item.status?.includes('Actionable Trend')) {
    return `${item.name}의 효과와 다양한 조합이 ${countryName} 시장에서 급성장 중입니다. SNS(${snsValue}%), 리테일(${retailValue}%), 리뷰(${reviewValue}%)에서 모두 상승세를 보이고 있습니다.`;
  } else if (item.status?.includes('Growing Trend')) {
    return `${item.name}의 효과와 다양한 조합이 ${countryName} 시장에서 안정적인 인기를 유지하고 있습니다. SNS(${snsValue}%), 리테일(${retailValue}%), 리뷰(${reviewValue}%)에서 안정적인 수준을 보이고 있습니다.`;
  } else if (item.status?.includes('Early Trend')) {
    return `${item.name}의 효과와 다양한 조합이 ${countryName} 시장에서 초기 트렌드로 부상하고 있습니다. SNS(${snsValue}%), 리테일(${retailValue}%), 리뷰(${reviewValue}%)에서 급상승세를 보이고 있습니다.`;
  }
  return `${item.name}의 효과와 다양한 조합이 ${countryName} 시장에서 인기를 얻고 있습니다. SNS(${snsValue}%), 리테일(${retailValue}%), 리뷰(${reviewValue}%)에서 모두 상승세를 보이고 있습니다.`;
};

// AI 근거 설명 데이터 생성
export const getTrendEvidence = (item: BubbleItem, country: Country): TrendEvidence => {
  const countryName = country === 'usa' ? '미국' : country === 'japan' ? '일본' : country === 'singapore' ? '싱가포르' : country === 'malaysia' ? '말레이시아' : '인도네시아';
  const typeName = item.type === 'ingredient' ? '성분' : item.type === 'formula' ? '제형' : '효과';
  
  // 수치적 근거 계산
  const baseValue = item.value;
  const snsMentions = Math.floor(baseValue * 120 + Math.random() * 5000);
  const reviewCount = Math.floor(baseValue * 80 + Math.random() * 3000);
  const growthRate = item.status?.includes('Actionable Trend') ? Math.floor(25 + Math.random() * 30) :
                     item.status?.includes('Early Trend') ? Math.floor(40 + Math.random() * 40) :
                     item.status?.includes('Growing Trend') ? Math.floor(15 + Math.random() * 20) : 0;
  const marketShare = Math.floor(baseValue * 0.8 + Math.random() * 5);
  const previousMentions = Math.floor(snsMentions / (1 + growthRate / 100));
  const previousReviewCount = Math.floor(reviewCount / (1 + growthRate / 100));
  
  // 주요 키워드 생성
  const keywords = item.type === 'ingredient' 
    ? ['효과적', '피부 개선', '만족도 높음', '추천', '재구매 의향']
    : item.type === 'formula'
    ? ['사용감 좋음', '흡수 빠름', '부드러움', '텍스처 우수', '지속력']
    : ['빠른 효과', '체감 개선', '신뢰할 수 있음', '가성비', '만족'];
  
  // 행동 강령/활용 방안 생성
  const actionPlan = item.status?.includes('Actionable Trend')
    ? `🚀 Actionable Trend 활용 방안:\n\n• 즉시 대응: 신제품 기획 시 ${item.name}을 핵심 성분/제형/기능으로 활용한 제품 개발 검토\n• 마케팅 전략: SNS 캠페인에서 ${item.name}의 효과를 강조한 콘텐츠 제작 (${snsMentions.toLocaleString()}건 언급 활용)\n• 시장 진입: 조기 진입을 통해 시장 선점 및 브랜드 포지셔닝 강화\n• 제품 포트폴리오: 기존 제품 라인업에 ${item.name} 버전 추가 검토`
    : item.status?.includes('Growing Trend')
    ? `📈 Growing Trend 활용 방안:\n\n• 제품 확장: 검증된 트렌드이므로 기존 제품 라인업 확장에 적극 활용\n• 조합 전략: ${item.name}과 다른 인기 성분/제형과의 조합으로 차별화 제품 개발\n• 브랜드 신뢰도: 안정적인 트렌드 활용으로 브랜드 신뢰도 강화\n• 장기 전략: 시장 점유율 ${marketShare}% 유지를 위한 지속적인 마케팅 투자`
    : `🌱 Early Trend 활용 방안:\n\n• 파일럿 테스트: 조기 진입을 위한 소규모 테스트 제품 출시 검토\n• 트렌드 모니터링: ${item.name}의 성장세를 지속적으로 모니터링하며 대규모 투자 시점 판단\n• 차별화 포인트: 초기 트렌드 활용으로 브랜드 혁신성 강조\n• 리스크 관리: 빠른 성장세(${growthRate}%)를 보이지만 아직 확정되지 않았으므로 단계적 투자 권장`;
  
  // 리뷰 추세 요약
  const reviewTrend = item.status?.includes('Actionable Trend') 
    ? `최근 3개월간 ${item.name} 관련 제품 리뷰가 ${growthRate}% 증가했습니다. 소비자들은 주로 "효과가 빠르게 나타났다", "피부 개선이 체감된다"는 긍정적 피드백을 남기고 있습니다. 특히 ${countryName} 시장에서는 고효능 ${typeName}에 대한 수요가 높아지고 있습니다.`
    : item.status?.includes('Growing Trend')
    ? `${item.name} 관련 제품 리뷰가 안정적으로 유지되고 있으며, 평균 평점 4.5/5.0을 기록하고 있습니다. 소비자들은 "신뢰할 수 있는 제품", "지속적인 효과"를 주요 키워드로 언급하고 있습니다. ${countryName} 시장에서 검증된 ${typeName}으로 인정받고 있습니다.`
    : `최근 ${item.name} 관련 제품 리뷰가 급증하고 있으며, 초기 사용자들의 긍정적 반응이 두드러집니다. "새로운 발견", "예상보다 효과적"이라는 리뷰가 증가하고 있어 ${countryName} 시장에서 유망한 ${typeName}으로 주목받고 있습니다.`;
  
  // AI 근거 설명
  const aiExplanation = item.status?.includes('Actionable Trend')
    ? `${item.name}은 ${countryName} 시장에서 Actionable Trend입니다. SNS에서 ${snsMentions.toLocaleString()}건의 언급과 ${reviewCount.toLocaleString()}건의 리뷰가 축적되었으며, 전월 대비 ${growthRate}%의 성장률을 보이고 있습니다. 시장 점유율 ${marketShare}%를 기록하며, 소비자들의 관심도와 실제 구매 행동이 일치하는 검증된 트렌드입니다.`
    : item.status?.includes('Growing Trend')
    ? `${item.name}은 ${countryName} 시장에서 Growing Trend입니다. SNS ${snsMentions.toLocaleString()}건, 리뷰 ${reviewCount.toLocaleString()}건이 축적되었으며, 시장 점유율 ${marketShare}%를 유지하고 있습니다. 신뢰도가 높은 ${typeName}으로, 기존 제품 라인업 확장이나 조합 전략에 활용하기 적합합니다.`
    : `${item.name}은 ${countryName} 시장에서 Early Trend입니다. SNS에서 ${snsMentions.toLocaleString()}건의 언급과 ${reviewCount.toLocaleString()}건의 리뷰가 있으며, 전월 대비 ${growthRate}%의 급성장률을 보이고 있습니다. 시장 점유율은 아직 ${marketShare}%이지만, 빠른 성장세를 보이고 있어 조기 진입을 통해 시장 선점이 가능합니다.`;
  
  return {
    reviewTrend,
    numericalEvidence: {
      snsMentions,
      reviewCount,
      growthRate,
      marketShare,
      previousMentions,
      previousReviewCount,
    },
    aiExplanation,
    keywords,
    actionPlan,
  };
};

// 리뷰 키워드 생성 함수
export const getReviewKeywords = (item: BubbleItem, country?: Country): ReviewKeywords => {
  const typeName = item.type === 'ingredient' ? '성분' : item.type === 'formula' ? '제형' : '효과';
  
  // 긍정 키워드 (타입별로 다르게)
  const positiveKeywords = item.type === 'ingredient'
    ? [
        { keyword: '효과적', count: Math.floor(item.value * 15 + Math.random() * 50) },
        { keyword: '피부 개선', count: Math.floor(item.value * 12 + Math.random() * 40) },
        { keyword: '만족도 높음', count: Math.floor(item.value * 10 + Math.random() * 35) },
        { keyword: '추천', count: Math.floor(item.value * 8 + Math.random() * 30) },
        { keyword: '재구매 의향', count: Math.floor(item.value * 6 + Math.random() * 25) },
        { keyword: '빠른 효과', count: Math.floor(item.value * 5 + Math.random() * 20) },
        { keyword: '가성비 좋음', count: Math.floor(item.value * 4 + Math.random() * 18) },
      ]
    : item.type === 'formula'
    ? [
        { keyword: '사용감 좋음', count: Math.floor(item.value * 15 + Math.random() * 50) },
        { keyword: '흡수 빠름', count: Math.floor(item.value * 12 + Math.random() * 40) },
        { keyword: '부드러움', count: Math.floor(item.value * 10 + Math.random() * 35) },
        { keyword: '텍스처 우수', count: Math.floor(item.value * 8 + Math.random() * 30) },
        { keyword: '지속력', count: Math.floor(item.value * 6 + Math.random() * 25) },
        { keyword: '촉촉함', count: Math.floor(item.value * 5 + Math.random() * 20) },
        { keyword: '가벼움', count: Math.floor(item.value * 4 + Math.random() * 18) },
      ]
    : [
        { keyword: '빠른 효과', count: Math.floor(item.value * 15 + Math.random() * 50) },
        { keyword: '체감 개선', count: Math.floor(item.value * 12 + Math.random() * 40) },
        { keyword: '신뢰할 수 있음', count: Math.floor(item.value * 10 + Math.random() * 35) },
        { keyword: '가성비', count: Math.floor(item.value * 8 + Math.random() * 30) },
        { keyword: '만족', count: Math.floor(item.value * 6 + Math.random() * 25) },
        { keyword: '기대 이상', count: Math.floor(item.value * 5 + Math.random() * 20) },
        { keyword: '지속적 효과', count: Math.floor(item.value * 4 + Math.random() * 18) },
      ];
  
  // 부정 키워드 (공통)
  const negativeKeywords = [
    { keyword: '효과 미미', count: Math.floor(item.value * 2 + Math.random() * 10) },
    { keyword: '알레르기', count: Math.floor(item.value * 1.5 + Math.random() * 8) },
    { keyword: '가격 부담', count: Math.floor(item.value * 1.2 + Math.random() * 7) },
    { keyword: '지속력 부족', count: Math.floor(item.value * 1 + Math.random() * 6) },
    { keyword: '향 불호', count: Math.floor(item.value * 0.8 + Math.random() * 5) },
    { keyword: '텍스처 불만', count: Math.floor(item.value * 0.6 + Math.random() * 4) },
    { keyword: '기대 이하', count: Math.floor(item.value * 0.5 + Math.random() * 3) },
  ];
  
  return {
    positive: positiveKeywords.sort((a, b) => b.count - a.count),
    negative: negativeKeywords.sort((a, b) => b.count - a.count),
  };
};

// 꿀조합용 AI 근거 설명 데이터 생성
const getCombinationEvidence = (item: TrendItem, country: Country): TrendEvidence => {
  const countryName = country === 'usa' ? '미국' : country === 'japan' ? '일본' : country === 'singapore' ? '싱가포르' : country === 'malaysia' ? '말레이시아' : country === 'indonesia' ? '인도네시아' : '국내';
  
  // signals에서 최신 값 추출
  const snsValue = item.signals.find(s => s.type === 'SNS')?.data[item.signals.find(s => s.type === 'SNS')!.data.length - 1]?.value || 85;
  const retailValue = item.signals.find(s => s.type === 'Retail')?.data[item.signals.find(s => s.type === 'Retail')!.data.length - 1]?.value || 80;
  const reviewValue = item.signals.find(s => s.type === 'Review')?.data[item.signals.find(s => s.type === 'Review')!.data.length - 1]?.value || 82;
  
  // 수치적 근거 계산
  const snsMentions = Math.floor(snsValue * 120 + Math.random() * 5000);
  const reviewCount = Math.floor(reviewValue * 80 + Math.random() * 3000);
  const growthRate = item.status?.includes('Actionable Trend') ? Math.floor(25 + Math.random() * 30) :
                     item.status?.includes('Early Trend') ? Math.floor(40 + Math.random() * 40) :
                     item.status?.includes('Growing Trend') ? Math.floor(15 + Math.random() * 20) : 0;
  const marketShare = Math.floor((snsValue + retailValue + reviewValue) / 3 * 0.8 + Math.random() * 5);
  const previousMentions = Math.floor(snsMentions / (1 + growthRate / 100));
  const previousReviewCount = Math.floor(reviewCount / (1 + growthRate / 100));
  
  // 함께 언급된 횟수 (꿀조합용)
  const coMentionCount = Math.floor((snsMentions + reviewCount) * 0.65);
  
  // 함께 조합된 제품 예시 생성
  const combinationParts = item.combination.split(' + ').filter(p => p.trim());
  const brands = country === 'domestic' 
    ? ['더마코스', '토리든', '라로슈포제', '에뛰드', '이니스프리']
    : country === 'usa' 
    ? ['CeraVe', 'The Ordinary', 'La Roche-Posay', 'Neutrogena', 'Olay']
    : country === 'japan'
    ? ['스킨아쿠아', '하다라보', '미샤', '코세', '시세이도']
    : ['라네즈', '설화수', '에스티로더', 'SK-II', '설화수'];
  
  // 이미지 파일명 생성 (실제 파일명에 맞춰서)
  const generateImageUrl = (productName: string, brand: string, index: number): string | undefined => {
    // 브랜드명을 파일명 형식으로 변환
    const brandMap: Record<string, string> = {
      'CeraVe': 'cerave',
      'The Ordinary': 'the-ordinary',
      'La Roche-Posay': 'la-roche-posa', // 실제 파일명: la-roche-posa-3.jpg
      '더마코스': 'dermacos',
      '토리든': 'torriden',
      '라로슈포제': 'la-roche-posa',
      '스킨아쿠아': 'skin-aqua',
      '하다라보': 'hadalabo',
      '미샤': 'misha',
      '라네즈': 'laneige',
      '설화수': 'sulwhasoo',
      '에스티로더': 'estee-lauder',
    };
    
    // 브랜드명을 영어로 변환
    const englishBrand = brandMap[brand] || brand.replace(/\s+/g, '-').toLowerCase();
    
    // 실제 파일명 패턴에 맞춰서 생성
    // cerave-1.jpg, the-ordinary.jpg, la-roche-posa-3.jpg
    let fileName: string;
    if (englishBrand === 'the-ordinary') {
      // the-ordinary는 번호 없이
      fileName = `${englishBrand}.jpg`;
    } else {
      // 나머지는 브랜드명-번호.jpg 형식
      fileName = `${englishBrand}-${index + 1}.jpg`;
    }
    
    return `/images/products/${fileName}`;
  };

  const combinationProducts = combinationParts.length >= 3 ? [
    {
      name: `${combinationParts[0]} ${combinationParts[1]}`,
      brand: brands[0],
      imageUrl: generateImageUrl(`${combinationParts[0]} ${combinationParts[1]}`, brands[0], 0),
      mentionCount: Math.floor(coMentionCount * 0.35),
      rating: 4.5 + Math.random() * 0.5,
    },
    {
      name: `${combinationParts[1]} ${combinationParts[2]}`,
      brand: brands[1],
      imageUrl: generateImageUrl(`${combinationParts[1]} ${combinationParts[2]}`, brands[1], 1),
      mentionCount: Math.floor(coMentionCount * 0.28),
      rating: 4.3 + Math.random() * 0.4,
    },
    {
      name: `${combinationParts[0]} ${combinationParts[2]}`,
      brand: brands[2],
      imageUrl: generateImageUrl(`${combinationParts[0]} ${combinationParts[2]}`, brands[2], 2),
      mentionCount: Math.floor(coMentionCount * 0.22),
      rating: 4.4 + Math.random() * 0.5,
    },
  ] : combinationParts.length >= 2 ? [
    {
      name: `${combinationParts[0]} ${combinationParts[1]}`,
      brand: brands[0],
      imageUrl: generateImageUrl(`${combinationParts[0]} ${combinationParts[1]}`, brands[0], 0),
      mentionCount: Math.floor(coMentionCount * 0.4),
      rating: 4.5 + Math.random() * 0.5,
    },
    {
      name: `${combinationParts[0]} 세트`,
      brand: brands[1],
      imageUrl: generateImageUrl(`${combinationParts[0]} 세트`, brands[1], 1),
      mentionCount: Math.floor(coMentionCount * 0.3),
      rating: 4.3 + Math.random() * 0.4,
    },
    {
      name: `${combinationParts[1]} 세트`,
      brand: brands[2],
      imageUrl: generateImageUrl(`${combinationParts[1]} 세트`, brands[2], 2),
      mentionCount: Math.floor(coMentionCount * 0.25),
      rating: 4.4 + Math.random() * 0.5,
    },
  ] : [
    {
      name: `${combinationParts[0] || item.combination} 제품`,
      brand: brands[0],
      imageUrl: generateImageUrl(`${combinationParts[0] || item.combination} 제품`, brands[0], 0),
      mentionCount: Math.floor(coMentionCount * 0.4),
      rating: 4.5 + Math.random() * 0.5,
    },
    {
      name: `${combinationParts[0] || item.combination} 세트`,
      brand: brands[1],
      imageUrl: generateImageUrl(`${combinationParts[0] || item.combination} 세트`, brands[1], 1),
      mentionCount: Math.floor(coMentionCount * 0.3),
      rating: 4.3 + Math.random() * 0.4,
    },
    {
      name: `${combinationParts[0] || item.combination} 라인`,
      brand: brands[2],
      imageUrl: generateImageUrl(`${combinationParts[0] || item.combination} 라인`, brands[2], 2),
      mentionCount: Math.floor(coMentionCount * 0.25),
      rating: 4.4 + Math.random() * 0.5,
    },
  ];
  
  // 주요 키워드 생성 (꿀조합 특성에 맞게)
  const keywords = [
    '시너지 효과', '조합 완성도', '검증된 트렌드', '소비자 만족', '재구매 의향'
  ];
  
  // 리뷰 추세 요약
  const reviewTrend = item.status?.includes('Actionable Trend') 
    ? `최근 3개월간 ${item.combination} 관련 제품 리뷰가 ${growthRate}% 증가했습니다. 소비자들은 주로 "각 성분의 시너지 효과가 뛰어나다", "예상보다 효과가 좋다"는 긍정적 피드백을 남기고 있습니다. 특히 ${countryName} 시장에서는 이 조합에 대한 수요가 높아지고 있습니다.`
    : item.status?.includes('Growing Trend')
    ? `${item.combination} 관련 제품 리뷰가 안정적으로 유지되고 있으며, 평균 평점 4.5/5.0을 기록하고 있습니다. 소비자들은 "신뢰할 수 있는 조합", "지속적인 효과"를 주요 키워드로 언급하고 있습니다. ${countryName} 시장에서 검증된 꿀조합으로 인정받고 있습니다.`
    : `최근 ${item.combination} 관련 제품 리뷰가 급증하고 있으며, 초기 사용자들의 긍정적 반응이 두드러집니다. "새로운 발견", "예상보다 효과적"이라는 리뷰가 증가하고 있어 ${countryName} 시장에서 유망한 조합으로 주목받고 있습니다.`;
  
  // AI 근거 설명
  const aiExplanation = item.status?.includes('Actionable Trend')
    ? `${item.combination}은 ${countryName} 시장에서 Actionable Trend입니다. SNS에서 ${snsMentions.toLocaleString()}건의 언급과 ${reviewCount.toLocaleString()}건의 리뷰가 축적되었으며, 전월 대비 ${growthRate}%의 성장률을 보이고 있습니다. 시장 점유율 ${marketShare}%를 기록하며, SNS(${snsValue}%), 리테일(${retailValue}%), 리뷰(${reviewValue}%) 3가지 신호에서 모두 상승세를 보이고 있어 즉시 활용 가능한 검증된 꿀조합입니다.`
    : item.status?.includes('Growing Trend')
    ? `${item.combination}은 ${countryName} 시장에서 Growing Trend입니다. SNS ${snsMentions.toLocaleString()}건, 리뷰 ${reviewCount.toLocaleString()}건이 축적되었으며, 시장 점유율 ${marketShare}%를 유지하고 있습니다. SNS(${snsValue}%), 리테일(${retailValue}%), 리뷰(${reviewValue}%)에서 안정적인 수준을 보이며, 신뢰도가 높은 조합으로 기존 제품 라인업 확장이나 조합 전략에 활용하기 적합합니다.`
    : `${item.combination}은 ${countryName} 시장에서 Early Trend입니다. SNS에서 ${snsMentions.toLocaleString()}건의 언급과 ${reviewCount.toLocaleString()}건의 리뷰가 있으며, 전월 대비 ${growthRate}%의 급성장률을 보이고 있습니다. 시장 점유율은 아직 ${marketShare}%이지만, SNS(${snsValue}%), 리테일(${retailValue}%), 리뷰(${reviewValue}%)에서 급상승세를 보이고 있어 조기 진입을 통해 시장 선점이 가능합니다.`;
  
  return {
    reviewTrend,
    numericalEvidence: {
      snsMentions,
      reviewCount,
      growthRate,
      marketShare,
      previousMentions,
      previousReviewCount,
      coMentionCount,
      combinationProducts,
    },
    aiExplanation,
    keywords,
    actionPlan: item.actionGuide || '',
  };
};

// 꿀조합용 리뷰 키워드 생성
const getCombinationReviewKeywords = (item: TrendItem): ReviewKeywords => {
  const avgValue = item.signals.reduce((sum, signal) => {
    const lastValue = signal.data[signal.data.length - 1]?.value || 0;
    return sum + lastValue;
  }, 0) / item.signals.length;
  
  // 긍정 키워드 (꿀조합 특성)
  const positiveKeywords = [
    { keyword: '시너지 효과', count: Math.floor(avgValue * 15 + Math.random() * 50) },
    { keyword: '조합 완성도', count: Math.floor(avgValue * 12 + Math.random() * 40) },
    { keyword: '효과 배가', count: Math.floor(avgValue * 10 + Math.random() * 35) },
    { keyword: '만족도 높음', count: Math.floor(avgValue * 8 + Math.random() * 30) },
    { keyword: '재구매 의향', count: Math.floor(avgValue * 6 + Math.random() * 25) },
    { keyword: '추천', count: Math.floor(avgValue * 5 + Math.random() * 20) },
    { keyword: '기대 이상', count: Math.floor(avgValue * 4 + Math.random() * 18) },
  ];
  
  // 부정 키워드 (공통)
  const negativeKeywords = [
    { keyword: '효과 미미', count: Math.floor(avgValue * 2 + Math.random() * 10) },
    { keyword: '가격 부담', count: Math.floor(avgValue * 1.5 + Math.random() * 8) },
    { keyword: '사용법 복잡', count: Math.floor(avgValue * 1.2 + Math.random() * 7) },
    { keyword: '지속력 부족', count: Math.floor(avgValue * 1 + Math.random() * 6) },
    { keyword: '향 불호', count: Math.floor(avgValue * 0.8 + Math.random() * 5) },
    { keyword: '텍스처 불만', count: Math.floor(avgValue * 0.6 + Math.random() * 4) },
    { keyword: '기대 이하', count: Math.floor(avgValue * 0.5 + Math.random() * 3) },
  ];
  
  return {
    positive: positiveKeywords.sort((a, b) => b.count - a.count),
    negative: negativeKeywords.sort((a, b) => b.count - a.count),
  };
};

// 국가별 버블 데이터 생성
export const getCountryBubbleData = (country: Country): BubbleItem[] => {
  if (country === 'domestic') {
    const domesticData: BubbleItem[] = [
      { id: '1', name: '레티놀', type: 'ingredient', x: 20, y: 30, size: 85, value: 95, status: '🔥 Actionable Trend' },
      { id: '2', name: '판테놀', type: 'ingredient', x: 35, y: 45, size: 75, value: 90, status: '🔥 Actionable Trend' },
      { id: '3', name: '시카', type: 'ingredient', x: 50, y: 25, size: 65, value: 78, status: '🌱 Early Trend' },
      { id: '4', name: '히알루론산', type: 'ingredient', x: 25, y: 60, size: 70, value: 82, status: '🚀 Growing Trend' },
      { id: '5', name: '나이아신아마이드', type: 'ingredient', x: 60, y: 40, size: 60, value: 75, status: '🌱 Early Trend' },
      { id: '6', name: '아데노신', type: 'ingredient', x: 45, y: 20, size: 68, value: 80, status: '🚀 Growing Trend' },
      { id: '7', name: '비타민C', type: 'ingredient', x: 70, y: 50, size: 72, value: 85, status: '🔥 Actionable Trend' },
      { id: '8', name: '세라마이드', type: 'ingredient', x: 15, y: 40, size: 66, value: 79, status: '🚀 Growing Trend' },
      { id: '9', name: '콜라겐', type: 'ingredient', x: 55, y: 65, size: 64, value: 77, status: '🌱 Early Trend' },
      { id: '10', name: '앰플', type: 'formula', x: 70, y: 35, size: 80, value: 88, status: '🚀 Growing Trend' },
      { id: '11', name: '크림', type: 'formula', x: 80, y: 55, size: 90, value: 97, status: '🔥 Actionable Trend' },
      { id: '12', name: '선스틱', type: 'formula', x: 65, y: 70, size: 55, value: 68, status: '🌱 Early Trend' },
      { id: '13', name: '쿠션', type: 'formula', x: 45, y: 75, size: 65, value: 81, status: '🚀 Growing Trend' },
      { id: '14', name: '세럼', type: 'formula', x: 75, y: 25, size: 78, value: 86, status: '🔥 Actionable Trend' },
      { id: '15', name: '토너', type: 'formula', x: 30, y: 45, size: 71, value: 83, status: '🚀 Growing Trend' },
      { id: '16', name: '에센스', type: 'formula', x: 60, y: 60, size: 69, value: 80, status: '🌱 Early Trend' },
      { id: '17', name: '모공 케어', type: 'effect', x: 15, y: 50, size: 70, value: 87, status: '🚀 Growing Trend' },
      { id: '18', name: '장벽 강화', type: 'effect', x: 40, y: 65, size: 75, value: 93, status: '🔥 Actionable Trend' },
      { id: '19', name: '진정', type: 'effect', x: 55, y: 50, size: 60, value: 78, status: '🌱 Early Trend' },
      { id: '20', name: '광채', type: 'effect', x: 30, y: 80, size: 55, value: 72, status: '🌱 Early Trend' },
      { id: '21', name: '미백', type: 'effect', x: 50, y: 35, size: 73, value: 84, status: '🔥 Actionable Trend' },
      { id: '22', name: '안티에이징', type: 'effect', x: 65, y: 55, size: 76, value: 89, status: '🚀 Growing Trend' },
      { id: '23', name: '보습', type: 'effect', x: 25, y: 30, size: 67, value: 81, status: '🚀 Growing Trend' },
    ];
    return domesticData.map(item => ({
      ...item,
      actionGuide: getActionGuide(item.status),
      combinationReason: getCombinationReason(item, country),
      evidence: getTrendEvidence(item, country),
      reviewKeywords: getReviewKeywords(item),
    }));
  }

  // 해외 국가별 데이터 (기본 데이터)
  const baseCountryData: Record<Exclude<Country, 'domestic'>, Omit<BubbleItem, 'actionGuide' | 'combinationReason'>[]> = {
    usa: [
      { id: 'us1', name: 'Retinol (레티놀)', type: 'ingredient', x: 25, y: 35, size: 90, value: 98, status: '🔥 Actionable Trend' },
      { id: 'us2', name: 'Niacinamide (나이아신아마이드)', type: 'ingredient', x: 40, y: 50, size: 85, value: 92, status: '🔥 Actionable Trend' },
      { id: 'us3', name: 'Hyaluronic Acid (히알루론산)', type: 'ingredient', x: 55, y: 30, size: 88, value: 95, status: '🔥 Actionable Trend' },
      { id: 'us4', name: 'Vitamin C (비타민C)', type: 'ingredient', x: 30, y: 65, size: 75, value: 88, status: '🚀 Growing Trend' },
      { id: 'us5', name: 'Bakuchiol (바쿠치올)', type: 'ingredient', x: 65, y: 45, size: 70, value: 78, status: '🌱 Early Trend' },
      { id: 'us6', name: 'Serum (세럼)', type: 'formula', x: 75, y: 40, size: 85, value: 93, status: '🔥 Actionable Trend' },
      { id: 'us7', name: 'Moisturizer (모이스처라이저)', type: 'formula', x: 85, y: 60, size: 92, value: 96, status: '🔥 Actionable Trend' },
      { id: 'us8', name: 'Sunscreen (선크림)', type: 'formula', x: 70, y: 75, size: 80, value: 90, status: '🔥 Actionable Trend' },
      { id: 'us9', name: 'Essence (에센스)', type: 'formula', x: 50, y: 80, size: 72, value: 85, status: '🚀 Growing Trend' },
      { id: 'us10', name: 'Anti-aging (안티에이징)', type: 'effect', x: 20, y: 55, size: 88, value: 94, status: '🔥 Actionable Trend' },
      { id: 'us11', name: 'Brightening (미백)', type: 'effect', x: 45, y: 70, size: 82, value: 91, status: '🔥 Actionable Trend' },
      { id: 'us12', name: 'Hydration (보습)', type: 'effect', x: 60, y: 55, size: 75, value: 87, status: '🚀 Growing Trend' },
      { id: 'us13', name: 'Natural (천연)', type: 'effect', x: 35, y: 85, size: 68, value: 76, status: '🌱 Early Trend' },
    ],
    japan: [
      { id: 'jp1', name: 'ヒアルロン酸 (히알루론산)', type: 'ingredient', x: 25, y: 35, size: 88, value: 96, status: '🔥 Actionable Trend' },
      { id: 'jp2', name: 'セラミド (세라마이드)', type: 'ingredient', x: 40, y: 50, size: 82, value: 90, status: '🔥 Actionable Trend' },
      { id: 'jp3', name: 'コラーゲン (콜라겐)', type: 'ingredient', x: 55, y: 30, size: 80, value: 88, status: '🚀 Growing Trend' },
      { id: 'jp4', name: 'プラセンタ (플라센타)', type: 'ingredient', x: 30, y: 65, size: 75, value: 85, status: '🚀 Growing Trend' },
      { id: 'jp5', name: 'ビタミンC (비타민C)', type: 'ingredient', x: 65, y: 45, size: 70, value: 82, status: '🚀 Growing Trend' },
      { id: 'jp6', name: 'エッセンス (에센스)', type: 'formula', x: 75, y: 40, size: 85, value: 92, status: '🔥 Actionable Trend' },
      { id: 'jp7', name: 'クリーム (크림)', type: 'formula', x: 85, y: 60, size: 90, value: 95, status: '🔥 Actionable Trend' },
      { id: 'jp8', name: 'ローション (로션)', type: 'formula', x: 70, y: 75, size: 78, value: 88, status: '🚀 Growing Trend' },
      { id: 'jp9', name: 'クッション (쿠션)', type: 'formula', x: 50, y: 80, size: 72, value: 85, status: '🚀 Growing Trend' },
      { id: 'jp10', name: '保湿 (보습)', type: 'effect', x: 20, y: 55, size: 85, value: 93, status: '🔥 Actionable Trend' },
      { id: 'jp11', name: '美白 (미백)', type: 'effect', x: 45, y: 70, size: 80, value: 90, status: '🔥 Actionable Trend' },
      { id: 'jp12', name: 'アンチエイジング (안티에이징)', type: 'effect', x: 60, y: 55, size: 75, value: 87, status: '🚀 Growing Trend' },
      { id: 'jp13', name: 'リフトアップ (리프트업)', type: 'effect', x: 35, y: 85, size: 68, value: 77, status: '🌱 Early Trend' },
    ],
    singapore: [
      { id: 'sg1', name: 'Niacinamide (나이아신아마이드)', type: 'ingredient', x: 25, y: 35, size: 85, value: 94, status: '🔥 Actionable Trend' },
      { id: 'sg2', name: 'Centella (센텔라)', type: 'ingredient', x: 40, y: 50, size: 80, value: 91, status: '🔥 Actionable Trend' },
      { id: 'sg3', name: 'Adenosine (아데노신)', type: 'ingredient', x: 55, y: 30, size: 78, value: 89, status: '🚀 Growing Trend' },
      { id: 'sg4', name: 'Arbutin (아르부틴)', type: 'ingredient', x: 30, y: 65, size: 75, value: 87, status: '🚀 Growing Trend' },
      { id: 'sg5', name: 'Tranexamic Acid (트라넥삼산)', type: 'ingredient', x: 65, y: 45, size: 72, value: 79, status: '🌱 Early Trend' },
      { id: 'sg6', name: 'Toner (토너)', type: 'formula', x: 75, y: 40, size: 82, value: 90, status: '🔥 Actionable Trend' },
      { id: 'sg7', name: 'Gel (젤)', type: 'formula', x: 85, y: 60, size: 88, value: 93, status: '🔥 Actionable Trend' },
      { id: 'sg8', name: 'BB Cream (BB크림)', type: 'formula', x: 70, y: 75, size: 76, value: 86, status: '🚀 Growing Trend' },
      { id: 'sg9', name: 'Essence (에센스)', type: 'formula', x: 50, y: 80, size: 74, value: 84, status: '🚀 Growing Trend' },
      { id: 'sg10', name: 'Brightening (미백)', type: 'effect', x: 20, y: 55, size: 83, value: 92, status: '🔥 Actionable Trend' },
      { id: 'sg11', name: 'Soothing (진정)', type: 'effect', x: 45, y: 70, size: 79, value: 89, status: '🚀 Growing Trend' },
      { id: 'sg12', name: 'Wrinkle Care (주름 케어)', type: 'effect', x: 60, y: 55, size: 75, value: 87, status: '🚀 Growing Trend' },
      { id: 'sg13', name: 'Even Tone (톤 균일)', type: 'effect', x: 35, y: 85, size: 70, value: 76, status: '🌱 Early Trend' },
    ],
    malaysia: [
      { id: 'my1', name: 'Vitamin C (비타민C)', type: 'ingredient', x: 25, y: 35, size: 83, value: 93, status: '🔥 Actionable Trend' },
      { id: 'my2', name: 'Aloe Vera (알로에)', type: 'ingredient', x: 40, y: 50, size: 81, value: 91, status: '🔥 Actionable Trend' },
      { id: 'my3', name: 'Coenzyme Q10 (코엔자임Q10)', type: 'ingredient', x: 55, y: 30, size: 79, value: 89, status: '🚀 Growing Trend' },
      { id: 'my4', name: 'Kojic Acid (코직산)', type: 'ingredient', x: 30, y: 65, size: 77, value: 87, status: '🚀 Growing Trend' },
      { id: 'my5', name: 'Niacinamide (나이아신아마이드)', type: 'ingredient', x: 65, y: 45, size: 75, value: 78, status: '🌱 Early Trend' },
      { id: 'my6', name: 'Serum (세럼)', type: 'formula', x: 75, y: 40, size: 84, value: 91, status: '🔥 Actionable Trend' },
      { id: 'my7', name: 'Cream (크림)', type: 'formula', x: 85, y: 60, size: 87, value: 92, status: '🔥 Actionable Trend' },
      { id: 'my8', name: 'Powder (파우더)', type: 'formula', x: 70, y: 75, size: 80, value: 88, status: '🚀 Growing Trend' },
      { id: 'my9', name: 'Gel (젤)', type: 'formula', x: 50, y: 80, size: 78, value: 86, status: '🚀 Growing Trend' },
      { id: 'my10', name: 'Glow (광채)', type: 'effect', x: 20, y: 55, size: 82, value: 90, status: '🔥 Actionable Trend' },
      { id: 'my11', name: 'Cooling (쿨링)', type: 'effect', x: 45, y: 70, size: 80, value: 88, status: '🚀 Growing Trend' },
      { id: 'my12', name: 'Lightening (미백)', type: 'effect', x: 60, y: 55, size: 76, value: 86, status: '🚀 Growing Trend' },
      { id: 'my13', name: 'Matte (매트)', type: 'effect', x: 35, y: 85, size: 72, value: 77, status: '🌱 Early Trend' },
    ],
    indonesia: [
      { id: 'id1', name: 'Snail Mucin (달팽이 점액)', type: 'ingredient', x: 25, y: 35, size: 86, value: 95, status: '🔥 Actionable Trend' },
      { id: 'id2', name: 'Rice Extract (쌀 추출물)', type: 'ingredient', x: 40, y: 50, size: 84, value: 93, status: '🔥 Actionable Trend' },
      { id: 'id3', name: 'Glutathione (글루타티온)', type: 'ingredient', x: 55, y: 30, size: 82, value: 91, status: '🔥 Actionable Trend' },
      { id: 'id4', name: 'Aloe (알로에)', type: 'ingredient', x: 30, y: 65, size: 80, value: 89, status: '🚀 Growing Trend' },
      { id: 'id5', name: 'Centella (센텔라)', type: 'ingredient', x: 65, y: 45, size: 78, value: 79, status: '🌱 Early Trend' },
      { id: 'id6', name: 'Essence (에센스)', type: 'formula', x: 75, y: 40, size: 85, value: 92, status: '🔥 Actionable Trend' },
      { id: 'id7', name: 'Ampoule (앰플)', type: 'formula', x: 85, y: 60, size: 88, value: 94, status: '🔥 Actionable Trend' },
      { id: 'id8', name: 'Tint (틴트)', type: 'formula', x: 70, y: 75, size: 81, value: 89, status: '🚀 Growing Trend' },
      { id: 'id9', name: 'Gel (젤)', type: 'formula', x: 50, y: 80, size: 79, value: 87, status: '🚀 Growing Trend' },
      { id: 'id10', name: 'Repair (리페어)', type: 'effect', x: 20, y: 55, size: 84, value: 91, status: '🔥 Actionable Trend' },
      { id: 'id11', name: 'Whitening (미백)', type: 'effect', x: 45, y: 70, size: 83, value: 90, status: '🔥 Actionable Trend' },
      { id: 'id12', name: 'Cooling (쿨링)', type: 'effect', x: 60, y: 55, size: 79, value: 88, status: '🚀 Growing Trend' },
      { id: 'id13', name: 'Dewy (듀이)', type: 'effect', x: 35, y: 85, size: 75, value: 77, status: '🌱 Early Trend' },
    ],
  };

  // 기본 데이터에 actionGuide, combinationReason, evidence, reviewKeywords 추가
  const baseData = baseCountryData[country] || baseCountryData.usa;
  return baseData.map(item => ({
    ...item,
    actionGuide: getActionGuide(item.status),
    combinationReason: getCombinationReason(item as BubbleItem, country),
    evidence: getTrendEvidence(item as BubbleItem, country),
    reviewKeywords: getReviewKeywords(item as BubbleItem),
  }));
};

