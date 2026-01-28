import { getCustomInsight } from './insightData';

export interface TrendSignal {
  type: 'SNS' | 'Retail' | 'Review';
  data: { name: string; value: number }[];
}

export type TrendStatus = '🌱 Early Trend' | '🚀 Growing Trend' | '🔥 Actionable Trend' | '📉 Cooling';

export interface ReviewKeywords {
  positive: { keyword: string; count: number }[];
  negative: { keyword: string; count: number }[];
}
export type TrendType = 'Early Signal' | 'Actionable Trend';

export interface TrendItem {
  rank: number;
  category: string;
  combination: string;
  status: TrendStatus;
  trendType?: TrendType; // Early Signal 또는 Actionable Trend
  signals: TrendSignal[];
  insightText: string;
  combinationReason?: string; // 꿀조합인 이유 설명 (SNS/리테일/리뷰 데이터 기반)
  actionGuide?: string; // 트렌드 단계별 기획자 참고 방향성 힌트
  metrics?: TrendMetric[]; // 각 트렌드별 개별 지표
  evidence?: TrendEvidence; // AI 근거 설명 데이터 (꿀조합용)
  reviewKeywords?: ReviewKeywords; // 긍정/부정 리뷰 키워드 (꿀조합용)
  ingredients?: string[]; // 성분 키워드 (DB 기반)
  formulas?: string[]; // 제형 키워드 (DB 기반)
  effects?: string[]; // 효과 키워드 (DB 기반)
  moods?: string[]; // 무드 키워드 (DB 기반)
}

export type Country = 'domestic' | 'usa' | 'japan' | 'singapore' | 'malaysia' | 'indonesia';

// 국가별 색상 테마
export const countryThemes: Record<Country, {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  name: string;
  flag: string;
}> = {
  domestic: {
    primary: 'rose',
    secondary: 'pink',
    accent: 'rose-400',
    gradient: 'from-rose-500 to-pink-500',
    name: '국내',
    flag: '🇰🇷',
  },
  usa: {
    primary: 'blue',
    secondary: 'indigo',
    accent: 'blue-400',
    gradient: 'from-blue-600 to-blue-400', // 미국 국기 파란색
    name: '미국',
    flag: '🇺🇸',
  },
  japan: {
    primary: 'red',
    secondary: 'rose',
    accent: 'red-400',
    gradient: 'from-red-600 to-red-400', // 일본 국기 빨간색
    name: '일본',
    flag: '🇯🇵',
  },
  singapore: {
    primary: 'emerald',
    secondary: 'red',
    accent: 'emerald-400',
    gradient: 'from-emerald-600 to-red-500', // 싱가포르 국기 (빨강+초록)
    name: '싱가포르',
    flag: '🇸🇬',
  },
  malaysia: {
    primary: 'blue',
    secondary: 'red',
    accent: 'blue-400',
    gradient: 'from-blue-600 to-red-500', // 말레이시아 국기 (파랑+빨강)
    name: '말레이시아',
    flag: '🇲🇾',
  },
  indonesia: {
    primary: 'red',
    secondary: 'red',
    accent: 'red-400',
    gradient: 'from-red-600 to-red-500', // 인도네시아 국기 빨간색
    name: '인도네시아',
    flag: '🇮🇩',
  },
};

export interface CombinationProduct {
  name: string;
  brand: string;
  imageUrl?: string; // 제품 이미지 URL
  mentionCount: number; // 함께 언급된 횟수
  rating?: number; // 평점
}

export interface TrendEvidence {
  reviewTrend: string; // 리뷰 추세 내용 요약
  numericalEvidence: {
    snsMentions: number; // SNS 언급 수
    reviewCount: number; // 리뷰 개수
    growthRate: number; // 성장률 (%)
    marketShare: number; // 시장 점유율 (%)
    previousMentions?: number; // 이전 기간 언급 수 (상승률 계산용)
    previousReviewCount?: number; // 이전 기간 리뷰 수 (성장률 계산용)
    coMentionCount?: number; // 함께 언급된 횟수 (꿀조합용)
    combinationProducts?: CombinationProduct[]; // 함께 조합된 제품 예시 (꿀조합용)
  };
  aiExplanation: string; // AI가 분석한 트렌드 근거 설명
  keywords?: string[]; // 주요 키워드 언급
  actionPlan?: string; // 행동 강령/활용 방안
}

export interface BubbleItem {
  id: string;
  name: string;
  type: 'ingredient' | 'formula' | 'effect' | 'visual' | 'combined';
  x: number;
  y: number;
  size: number;
  value: number;
  status?: TrendStatus; // Early Trend, Growing Trend, Actionable Trend, Cooling
  trendLevel?: TrendLevel; // Early, Growing, Actionable - 이모지 매핑용
  actionGuide?: string; // 트렌드 단계별 기획자 참고 방향성 힌트
  combinationReason?: string; // 꿀조합인 이유 설명 (SNS/리테일/리뷰 데이터 기반)
  evidence?: TrendEvidence; // AI 근거 설명 데이터
  reviewKeywords?: ReviewKeywords; // 긍정/부정 리뷰 키워드
  category?: string; // 대분류 카테고리 (스킨케어, 클렌징, 선케어, 메이크업, 헤어케어, 바디케어, 맨즈케어)
}

// 새로운 데이터 구조 타입 정의
export type MainCategory = 'Skincare' | 'Cleansing' | 'Sun Care' | 'Makeup' | 'Hair Care' | 'Body Care' | 'Mens Care' | 'Haircare' | 'Bodycare';
export type ItemType = 'Ingredients' | 'Texture' | 'Effects' | 'Visual/Mood' | 'Combined';
export type TrendLevel = 'Actionable' | 'Growing' | 'Early';

export interface LeaderboardItem {
  rank?: number;
  keyword: string;
  score: number;
}

export type CategoryData = {
  [K in ItemType]?: {
    [L in TrendLevel]?: LeaderboardItem[];
  };
};

export type CountryLeaderboardData = {
  [K in MainCategory]?: CategoryData;
};

export interface ReportResult {
  type: 'marketing' | 'npd' | 'overseas';
  content: string;
  agentInsight?: string;  // 마케팅 타입 전용: 최종 전략 요약
  sources?: { title: string; source: string }[];
  scope?: 'keyword' | 'category';
  keyword?: string;
  category?: string;
}

export const trendData: TrendItem[] = [
  {
    rank: 1,
    category: 'Skincare',
    combination: '레티놀 + 앰플 + 모공 케어',
    status: '🔥 Actionable Trend',
    trendType: 'Actionable Trend',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 45 },
          { name: 'Week 2', value: 52 },
          { name: 'Week 3', value: 61 },
          { name: 'Week 4', value: 68 },
          { name: 'Week 5', value: 75 },
          { name: 'Week 6', value: 82 },
          { name: 'Week 7', value: 88 },
          { name: 'Week 8', value: 95 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 38 },
          { name: 'Week 2', value: 44 },
          { name: 'Week 3', value: 51 },
          { name: 'Week 4', value: 58 },
          { name: 'Week 5', value: 65 },
          { name: 'Week 6', value: 72 },
          { name: 'Week 7', value: 79 },
          { name: 'Week 8', value: 86 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 42 },
          { name: 'Week 2', value: 48 },
          { name: 'Week 3', value: 55 },
          { name: 'Week 4', value: 62 },
          { name: 'Week 5', value: 69 },
          { name: 'Week 6', value: 76 },
          { name: 'Week 7', value: 83 },
          { name: 'Week 8', value: 90 },
        ],
      },
    ],
    insightText: '레티놀과 앰플 제형의 조합이 2030 모공 고민 고객층에서 8주 연속 상승세입니다.',
    combinationReason: '레티놀의 각질 제거 효과와 앰플의 고농축 전달력이 모공 케어에 시너지를 일으키며, SNS(95%), 리테일(86%), 리뷰(90%) 3가지 신호에서 모두 상승세를 보이고 있어 즉시 활용 가능한 트렌드입니다. 특히 SNS에서 8주간 지속적인 상승세를 보이며 2030 모공 고민 고객층에서 강한 관심을 받고 있습니다.',
    metrics: [
      { label: '성장률', value: 32.5, unit: '%', change: 8.2, trend: 'up' },
      { label: 'SNS 언급', value: 95, unit: '%', change: 12.5, trend: 'up' },
      { label: '판매 증가', value: 28.3, unit: '%', change: 6.1, trend: 'up' },
      { label: '긍정 리뷰', value: 92.5, unit: '%', change: 3.2, trend: 'up' },
      { label: '시장 점유', value: 18.7, unit: '%', change: 2.4, trend: 'up' },
      { label: '인지도', value: 75.2, unit: '%', change: 8.5, trend: 'up' },
    ],
  },
  {
    rank: 2,
    category: 'Suncare',
    combination: '아연옥사이드 + 선스틱 + 끈적임 없는',
    status: '🚀 Growing Trend',
    trendType: 'Actionable Trend',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 85 },
          { name: 'Week 2', value: 87 },
          { name: 'Week 3', value: 86 },
          { name: 'Week 4', value: 88 },
          { name: 'Week 5', value: 89 },
          { name: 'Week 6', value: 87 },
          { name: 'Week 7', value: 88 },
          { name: 'Week 8', value: 90 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 92 },
          { name: 'Week 2', value: 94 },
          { name: 'Week 3', value: 93 },
          { name: 'Week 4', value: 95 },
          { name: 'Week 5', value: 96 },
          { name: 'Week 6', value: 95 },
          { name: 'Week 7', value: 96 },
          { name: 'Week 8', value: 97 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 88 },
          { name: 'Week 2', value: 89 },
          { name: 'Week 3', value: 90 },
          { name: 'Week 4', value: 91 },
          { name: 'Week 5', value: 92 },
          { name: 'Week 6', value: 91 },
          { name: 'Week 7', value: 92 },
          { name: 'Week 8', value: 93 },
        ],
      },
    ],
    insightText: '끈적임 없는(Non-greasy) 무기자차(Zinc Oxide) 선스틱이 야외 활동 증가로 리테일 랭킹 1위 유지 중.',
    combinationReason: '무기자차의 안전한 자외선 차단과 선스틱의 휴대성, Non-greasy 포뮬러의 사용감이 결합되어 야외 활동 증가 시즌에 완벽한 제품으로 자리잡았습니다. SNS(90%), 리테일(97%), 리뷰(93%) 모두 안정적인 수준을 유지하고 있습니다.',
    actionGuide: '🏆 Stable 단계: 메인 제품 확장이나 조합 전략에 활용 가능. 검증된 트렌드이므로 기존 제품 라인업 확장이나 관련 제품군 개발에 적합합니다.',
    metrics: [
      { label: '성장률', value: 5.2, unit: '%', change: 0.8, trend: 'up' },
      { label: 'SNS 언급', value: 90, unit: '%', change: 2.1, trend: 'stable' },
      { label: '판매 증가', value: 3.5, unit: '%', change: 0.3, trend: 'up' },
      { label: '긍정 리뷰', value: 93, unit: '%', change: 0.5, trend: 'stable' },
      { label: '시장 점유', value: 25.3, unit: '%', change: 0.2, trend: 'stable' },
      { label: '인지도', value: 82.1, unit: '%', change: 1.2, trend: 'up' },
    ],
  },
  {
    rank: 3,
    category: 'Cleansing',
    combination: 'AHA/BHA + 클렌징 오일 + 블랙헤드',
    status: '🌱 Early Trend',
    trendType: 'Early Signal',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 15 },
          { name: 'Week 2', value: 22 },
          { name: 'Week 3', value: 31 },
          { name: 'Week 4', value: 42 },
          { name: 'Week 5', value: 55 },
          { name: 'Week 6', value: 68 },
          { name: 'Week 7', value: 78 },
          { name: 'Week 8', value: 88 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 12 },
          { name: 'Week 2', value: 18 },
          { name: 'Week 3', value: 25 },
          { name: 'Week 4', value: 35 },
          { name: 'Week 5', value: 48 },
          { name: 'Week 6', value: 62 },
          { name: 'Week 7', value: 72 },
          { name: 'Week 8', value: 82 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 18 },
          { name: 'Week 2', value: 25 },
          { name: 'Week 3', value: 33 },
          { name: 'Week 4', value: 44 },
          { name: 'Week 5', value: 57 },
          { name: 'Week 6', value: 70 },
          { name: 'Week 7', value: 80 },
          { name: 'Week 8', value: 90 },
        ],
      },
    ],
    insightText: '여름철 피지 관리를 위한 산성 성분 오일이 SNS에서 급상승 중인 초기 트렌드.',
    combinationReason: 'AHA/BHA의 각질 제거 효과와 오일의 모공 클렌징력이 결합되어 여름철 피지 관리에 효과적입니다. SNS(88%), 리테일(82%), 리뷰(90%)에서 8주간 급상승하며 초기 트렌드로 주목받고 있습니다.',
    actionGuide: '🌱 Early 단계: 테스트 제품이나 파일럿 기획에 적합. 빠른 성장세를 보이므로 조기 진입을 통해 시장 선점이 가능합니다.',
    metrics: [
      { label: '성장률', value: 48.2, unit: '%', change: 15.3, trend: 'up' },
      { label: 'SNS 언급', value: 88, unit: '%', change: 18.5, trend: 'up' },
      { label: '판매 증가', value: 35.7, unit: '%', change: 12.2, trend: 'up' },
      { label: '긍정 리뷰', value: 85.3, unit: '%', change: 5.8, trend: 'up' },
      { label: '시장 점유', value: 8.2, unit: '%', change: 1.5, trend: 'up' },
      { label: '인지도', value: 45.8, unit: '%', change: 12.3, trend: 'up' },
    ],
  },
  {
    rank: 4,
    category: 'Makeup',
    combination: '히알루론산 + 쿠션 + 광채',
    status: '🚀 Growing Trend',
    signals: [
      {
        type: 'SNS',
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
        type: 'Retail',
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
        type: 'Review',
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
    ],
    insightText: '촉촉한 광채(Glow) 피부 표현을 위한 히알루론산 쿠션이 건성 피부 타겟으로 인기.',
    combinationReason: '히알루론산의 강력한 보습력과 쿠션 제형의 밀착력이 결합되어 건성 피부 타겟에게 최적화되었습니다. SNS(84%), 리테일(81%), 리뷰(88%)에서 안정적인 수준을 유지하며 검증된 트렌드입니다.',
    actionGuide: '🏆 Stable 단계: 메인 제품 확장이나 조합 전략에 활용 가능. 검증된 트렌드이므로 기존 제품 라인업 확장이나 관련 제품군 개발에 적합합니다.',
    metrics: [
      { label: '성장률', value: 3.8, unit: '%', change: 0.5, trend: 'stable' },
      { label: 'SNS 언급', value: 84, unit: '%', change: 1.2, trend: 'stable' },
      { label: '판매 증가', value: 2.1, unit: '%', change: 0.3, trend: 'stable' },
      { label: '긍정 리뷰', value: 88, unit: '%', change: 0.8, trend: 'stable' },
      { label: '시장 점유', value: 15.2, unit: '%', change: 0.1, trend: 'stable' },
      { label: '인지도', value: 78.5, unit: '%', change: 1.5, trend: 'up' },
    ],
  },
  {
    rank: 5,
    category: 'Skincare',
    combination: '판테놀 + 크림 + 장벽 강화',
    status: '🔥 Actionable Trend',
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
          { name: 'Week 2', value: 54 },
          { name: 'Week 3', value: 61 },
          { name: 'Week 4', value: 68 },
          { name: 'Week 5', value: 75 },
          { name: 'Week 6', value: 81 },
          { name: 'Week 7', value: 87 },
          { name: 'Week 8', value: 92 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 88 },
          { name: 'Week 2', value: 90 },
          { name: 'Week 3', value: 92 },
          { name: 'Week 4', value: 93 },
          { name: 'Week 5', value: 94 },
          { name: 'Week 6', value: 95 },
          { name: 'Week 7', value: 95 },
          { name: 'Week 8', value: 95 },
        ],
      },
    ],
    insightText: '환절기 장벽 강화 니즈로 판테놀 고농축 크림의 리뷰 긍정 반응 95% 기록.',
    combinationReason: '판테놀의 진정 효과와 크림 제형의 보습력이 배리어 리페어에 최적화되었습니다. SNS(92%), 리테일(88%), 리뷰(95%)에서 모두 급상승세를 보이며 즉시 활용 가능한 트렌드입니다.',
    actionGuide: '🚀 Rising 단계: 테스트 제품이나 파일럿 기획에 적합. 신제품 라인업에 빠르게 반영하여 시장 반응을 확인할 수 있습니다.',
    metrics: [
      { label: '성장률', value: 28.7, unit: '%', change: 7.3, trend: 'up' },
      { label: 'SNS 언급', value: 96, unit: '%', change: 10.2, trend: 'up' },
      { label: '판매 증가', value: 24.5, unit: '%', change: 5.8, trend: 'up' },
      { label: '긍정 리뷰', value: 95, unit: '%', change: 2.5, trend: 'up' },
      { label: '시장 점유', value: 14.8, unit: '%', change: 1.9, trend: 'up' },
      { label: '인지도', value: 72.3, unit: '%', change: 6.2, trend: 'up' },
    ],
  },
  {
    rank: 6,
    category: 'Menscare',
    combination: '시카 + 올인원 + 진정',
    status: '🚀 Growing Trend',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 72 },
          { name: 'Week 2', value: 74 },
          { name: 'Week 3', value: 73 },
          { name: 'Week 4', value: 75 },
          { name: 'Week 5', value: 76 },
          { name: 'Week 6', value: 75 },
          { name: 'Week 7', value: 77 },
          { name: 'Week 8', value: 78 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 68 },
          { name: 'Week 2', value: 70 },
          { name: 'Week 3', value: 69 },
          { name: 'Week 4', value: 71 },
          { name: 'Week 5', value: 72 },
          { name: 'Week 6', value: 71 },
          { name: 'Week 7', value: 73 },
          { name: 'Week 8', value: 74 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 75 },
          { name: 'Week 2', value: 77 },
          { name: 'Week 3', value: 78 },
          { name: 'Week 4', value: 79 },
          { name: 'Week 5', value: 80 },
          { name: 'Week 6', value: 81 },
          { name: 'Week 7', value: 82 },
          { name: 'Week 8', value: 83 },
        ],
      },
    ],
    insightText: '면도 후 자극 진정을 원하는 남성 고객층에서 시카 올인원 제품 재구매율 상승.',
  },
  {
    rank: 7,
    category: 'Haircare',
    combination: '비오틴 + 샴푸 + 탈모 방지',
    status: '📉 Cooling',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 65 },
          { name: 'Week 2', value: 62 },
          { name: 'Week 3', value: 59 },
          { name: 'Week 4', value: 56 },
          { name: 'Week 5', value: 54 },
          { name: 'Week 6', value: 52 },
          { name: 'Week 7', value: 50 },
          { name: 'Week 8', value: 48 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 58 },
          { name: 'Week 2', value: 56 },
          { name: 'Week 3', value: 54 },
          { name: 'Week 4', value: 52 },
          { name: 'Week 5', value: 51 },
          { name: 'Week 6', value: 50 },
          { name: 'Week 7', value: 49 },
          { name: 'Week 8', value: 48 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 72 },
          { name: 'Week 2', value: 73 },
          { name: 'Week 3', value: 74 },
          { name: 'Week 4', value: 75 },
          { name: 'Week 5', value: 75 },
          { name: 'Week 6', value: 76 },
          { name: 'Week 7', value: 76 },
          { name: 'Week 8', value: 77 },
        ],
      },
    ],
    insightText: '탈모 샴푸 시장은 포화 상태이나, 비오틴 고함량 제품은 여전히 상위권 유지.',
  },
];

// 해외 트렌드 데이터
export const trendDataOverseas: TrendItem[] = [
  {
    rank: 1,
    category: 'Skincare',
    combination: '레티놀 + 세럼 + 안티에이징',
    status: '🔥 Actionable Trend',
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
    insightText: 'Retinol and serum combination shows 8-week continuous growth in anti-aging market.',
    metrics: [
      { label: 'Growth Rate', value: 35.2, unit: '%', change: 9.1, trend: 'up' },
      { label: 'SNS Mentions', value: 96, unit: '%', change: 13.5, trend: 'up' },
      { label: 'Sales Growth', value: 30.8, unit: '%', change: 7.2, trend: 'up' },
      { label: 'Positive Reviews', value: 95, unit: '%', change: 4.2, trend: 'up' },
      { label: 'Market Share', value: 22.1, unit: '%', change: 3.5, trend: 'up' },
      { label: 'Awareness', value: 89.3, unit: '%', change: 11.2, trend: 'up' },
    ],
  },
  {
    rank: 2,
    category: 'Suncare',
    combination: '아연옥사이드 + 선크림 + 끈적임 없는',
    status: '🚀 Growing Trend',
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
    insightText: 'Non-greasy mineral sunscreen maintains #1 retail ranking due to increased outdoor activities.',
    metrics: [
      { label: 'Growth Rate', value: 5.8, unit: '%', change: 1.2, trend: 'up' },
      { label: 'SNS Mentions', value: 93, unit: '%', change: 2.5, trend: 'stable' },
      { label: 'Sales Growth', value: 4.1, unit: '%', change: 0.5, trend: 'up' },
      { label: 'Positive Reviews', value: 95, unit: '%', change: 0.8, trend: 'stable' },
      { label: 'Market Share', value: 28.5, unit: '%', change: 0.3, trend: 'stable' },
      { label: 'Awareness', value: 85.2, unit: '%', change: 1.8, trend: 'up' },
    ],
  },
  {
    rank: 3,
    category: 'Skincare',
    combination: '나이아신아마이드 + 에센스 + 미백',
    status: '🌱 Early Trend',
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
    insightText: 'Niacinamide essence shows rapid growth in brightening category for early trend.',
    metrics: [
      { label: 'Growth Rate', value: 52.3, unit: '%', change: 18.5, trend: 'up' },
      { label: 'SNS Mentions', value: 92, unit: '%', change: 20.2, trend: 'up' },
      { label: 'Sales Growth', value: 41.5, unit: '%', change: 15.3, trend: 'up' },
      { label: 'Positive Reviews', value: 93, unit: '%', change: 7.8, trend: 'up' },
      { label: 'Market Share', value: 11.2, unit: '%', change: 2.8, trend: 'up' },
      { label: 'Awareness', value: 58.7, unit: '%', change: 15.2, trend: 'up' },
    ],
  },
  {
    rank: 4,
    category: 'Makeup',
    combination: '히알루론산 + 파운데이션 + 광채',
    status: '🚀 Growing Trend',
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
    insightText: 'Hyaluronic acid foundation maintains stable popularity for dry skin target.',
    metrics: [
      { label: 'Growth Rate', value: 4.2, unit: '%', change: 0.7, trend: 'stable' },
      { label: 'SNS Mentions', value: 88, unit: '%', change: 1.5, trend: 'stable' },
      { label: 'Sales Growth', value: 2.5, unit: '%', change: 0.4, trend: 'stable' },
      { label: 'Positive Reviews', value: 91, unit: '%', change: 1.0, trend: 'stable' },
      { label: 'Market Share', value: 18.3, unit: '%', change: 0.2, trend: 'stable' },
      { label: 'Awareness', value: 81.5, unit: '%', change: 2.1, trend: 'up' },
    ],
  },
  {
    rank: 5,
    category: 'Skincare',
    combination: '펩타이드 + 모이스처라이저 + 안티에이징',
    status: '🔥 Actionable Trend',
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
    insightText: 'Peptide moisturizer shows strong growth with 97% positive review rate.',
    metrics: [
      { label: 'Growth Rate', value: 31.5, unit: '%', change: 8.7, trend: 'up' },
      { label: 'SNS Mentions', value: 97, unit: '%', change: 11.8, trend: 'up' },
      { label: 'Sales Growth', value: 27.2, unit: '%', change: 6.5, trend: 'up' },
      { label: 'Positive Reviews', value: 97, unit: '%', change: 3.2, trend: 'up' },
      { label: 'Market Share', value: 16.8, unit: '%', change: 2.1, trend: 'up' },
      { label: 'Awareness', value: 76.4, unit: '%', change: 7.8, trend: 'up' },
    ],
  },
  {
    rank: 6,
    category: 'Skincare',
    combination: '비타민C + 세럼 + 미백',
    status: '🚀 Growing Trend',
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
    insightText: 'Vitamin C serum maintains stable position in brightening category.',
    metrics: [
      { label: 'Growth Rate', value: 3.5, unit: '%', change: 0.6, trend: 'stable' },
      { label: 'SNS Mentions', value: 81, unit: '%', change: 1.2, trend: 'stable' },
      { label: 'Sales Growth', value: 2.1, unit: '%', change: 0.3, trend: 'stable' },
      { label: 'Positive Reviews', value: 86, unit: '%', change: 0.9, trend: 'stable' },
      { label: 'Market Share', value: 14.2, unit: '%', change: 0.1, trend: 'stable' },
      { label: 'Awareness', value: 79.8, unit: '%', change: 1.5, trend: 'up' },
    ],
  },
  {
    rank: 7,
    category: 'Skincare',
    combination: '세라마이드 + 리페어 + 장벽 강화',
    status: '🔥 Actionable Trend',
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
    insightText: 'Ceramide barrier repair products show strong growth with seasonal demand.',
    metrics: [
      { label: 'Growth Rate', value: 33.8, unit: '%', change: 9.2, trend: 'up' },
      { label: 'SNS Mentions', value: 98, unit: '%', change: 12.5, trend: 'up' },
      { label: 'Sales Growth', value: 29.5, unit: '%', change: 7.1, trend: 'up' },
      { label: 'Positive Reviews', value: 98, unit: '%', change: 4.5, trend: 'up' },
      { label: 'Market Share', value: 17.5, unit: '%', change: 2.3, trend: 'up' },
      { label: 'Awareness', value: 78.2, unit: '%', change: 8.5, trend: 'up' },
    ],
  },
];

// Single 키워드 데이터 (핵심 키워드)
export const singleKeywordData: TrendItem[] = [
  {
    rank: 1,
    category: 'Ingredient',
    combination: '레티놀',
    status: '🔥 Actionable Trend',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 55 },
          { name: 'Week 2', value: 62 },
          { name: 'Week 3', value: 70 },
          { name: 'Week 4', value: 78 },
          { name: 'Week 5', value: 85 },
          { name: 'Week 6', value: 92 },
          { name: 'Week 7', value: 96 },
          { name: 'Week 8', value: 98 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 48 },
          { name: 'Week 2', value: 55 },
          { name: 'Week 3', value: 63 },
          { name: 'Week 4', value: 71 },
          { name: 'Week 5', value: 78 },
          { name: 'Week 6', value: 85 },
          { name: 'Week 7', value: 91 },
          { name: 'Week 8', value: 95 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 52 },
          { name: 'Week 2', value: 59 },
          { name: 'Week 3', value: 67 },
          { name: 'Week 4', value: 75 },
          { name: 'Week 5', value: 82 },
          { name: 'Week 6', value: 89 },
          { name: 'Week 7', value: 94 },
          { name: 'Week 8', value: 97 },
        ],
      },
    ],
    insightText: '레티놀 단일 성분이 2030 모공 고민 고객층에서 8주 연속 급상승 중입니다.',
    metrics: [
      { label: '성장률', value: 35.8, unit: '%', change: 9.5, trend: 'up' },
      { label: 'SNS 언급', value: 98, unit: '%', change: 15.2, trend: 'up' },
      { label: '판매 증가', value: 30.2, unit: '%', change: 7.8, trend: 'up' },
      { label: '긍정 리뷰', value: 97, unit: '%', change: 4.5, trend: 'up' },
      { label: '시장 점유', value: 22.3, unit: '%', change: 3.1, trend: 'up' },
      { label: '인지도', value: 88.5, unit: '%', change: 10.2, trend: 'up' },
    ],
  },
  {
    rank: 2,
    category: 'Ingredient',
    combination: '판테놀',
    status: '🔥 Actionable Trend',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 45 },
          { name: 'Week 2', value: 52 },
          { name: 'Week 3', value: 60 },
          { name: 'Week 4', value: 68 },
          { name: 'Week 5', value: 75 },
          { name: 'Week 6', value: 82 },
          { name: 'Week 7', value: 88 },
          { name: 'Week 8', value: 93 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 42 },
          { name: 'Week 2', value: 49 },
          { name: 'Week 3', value: 57 },
          { name: 'Week 4', value: 65 },
          { name: 'Week 5', value: 72 },
          { name: 'Week 6', value: 79 },
          { name: 'Week 7', value: 85 },
          { name: 'Week 8', value: 90 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 88 },
          { name: 'Week 2', value: 90 },
          { name: 'Week 3', value: 92 },
          { name: 'Week 4', value: 93 },
          { name: 'Week 5', value: 94 },
          { name: 'Week 6', value: 95 },
          { name: 'Week 7', value: 95 },
          { name: 'Week 8', value: 96 },
        ],
      },
    ],
    insightText: '환절기 장벽 강화 니즈로 판테놀 단일 성분의 리뷰 긍정 반응 96% 기록.',
    metrics: [
      { label: '성장률', value: 26.4, unit: '%', change: 6.8, trend: 'up' },
      { label: 'SNS 언급', value: 93, unit: '%', change: 9.5, trend: 'up' },
      { label: '판매 증가', value: 22.7, unit: '%', change: 5.2, trend: 'up' },
      { label: '긍정 리뷰', value: 96, unit: '%', change: 3.1, trend: 'up' },
      { label: '시장 점유', value: 16.5, unit: '%', change: 2.3, trend: 'up' },
      { label: '인지도', value: 74.8, unit: '%', change: 7.5, trend: 'up' },
    ],
  },
  {
    rank: 3,
    category: 'Formula',
    combination: '앰플',
    status: '🚀 Growing Trend',
    signals: [
      {
        type: 'SNS',
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
        type: 'Retail',
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
        type: 'Review',
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
    ],
    insightText: '앰플 제형이 고농축 성분 전달 수단으로 안정적인 인기 유지 중.',
  },
  {
    rank: 4,
    category: 'Ingredient',
    combination: '시카',
    status: '🚀 Growing Trend',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 72 },
          { name: 'Week 2', value: 74 },
          { name: 'Week 3', value: 73 },
          { name: 'Week 4', value: 75 },
          { name: 'Week 5', value: 76 },
          { name: 'Week 6', value: 75 },
          { name: 'Week 7', value: 77 },
          { name: 'Week 8', value: 78 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 68 },
          { name: 'Week 2', value: 70 },
          { name: 'Week 3', value: 69 },
          { name: 'Week 4', value: 71 },
          { name: 'Week 5', value: 72 },
          { name: 'Week 6', value: 71 },
          { name: 'Week 7', value: 73 },
          { name: 'Week 8', value: 74 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 75 },
          { name: 'Week 2', value: 77 },
          { name: 'Week 3', value: 78 },
          { name: 'Week 4', value: 79 },
          { name: 'Week 5', value: 80 },
          { name: 'Week 6', value: 81 },
          { name: 'Week 7', value: 82 },
          { name: 'Week 8', value: 83 },
        ],
      },
    ],
    insightText: '시카 성분이 자극 진정 니즈로 남성 고객층에서 안정적인 인기 유지.',
  },
  {
    rank: 5,
    category: 'Formula',
    combination: '크림',
    status: '🚀 Growing Trend',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 85 },
          { name: 'Week 2', value: 87 },
          { name: 'Week 3', value: 86 },
          { name: 'Week 4', value: 88 },
          { name: 'Week 5', value: 89 },
          { name: 'Week 6', value: 87 },
          { name: 'Week 7', value: 88 },
          { name: 'Week 8', value: 90 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 92 },
          { name: 'Week 2', value: 94 },
          { name: 'Week 3', value: 93 },
          { name: 'Week 4', value: 95 },
          { name: 'Week 5', value: 96 },
          { name: 'Week 6', value: 95 },
          { name: 'Week 7', value: 96 },
          { name: 'Week 8', value: 97 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 88 },
          { name: 'Week 2', value: 89 },
          { name: 'Week 3', value: 90 },
          { name: 'Week 4', value: 91 },
          { name: 'Week 5', value: 92 },
          { name: 'Week 6', value: 91 },
          { name: 'Week 7', value: 92 },
          { name: 'Week 8', value: 93 },
        ],
      },
    ],
    insightText: '크림 제형이 보습과 장벽 강화 목적으로 안정적인 시장 점유율 유지.',
  },
  {
    rank: 6,
    category: 'Effect',
    combination: '모공 케어',
    status: '🌱 Early Trend',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 25 },
          { name: 'Week 2', value: 32 },
          { name: 'Week 3', value: 41 },
          { name: 'Week 4', value: 52 },
          { name: 'Week 5', value: 63 },
          { name: 'Week 6', value: 72 },
          { name: 'Week 7', value: 80 },
          { name: 'Week 8', value: 87 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 22 },
          { name: 'Week 2', value: 28 },
          { name: 'Week 3', value: 36 },
          { name: 'Week 4', value: 46 },
          { name: 'Week 5', value: 58 },
          { name: 'Week 6', value: 68 },
          { name: 'Week 7', value: 76 },
          { name: 'Week 8', value: 83 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 28 },
          { name: 'Week 2', value: 35 },
          { name: 'Week 3', value: 43 },
          { name: 'Week 4', value: 54 },
          { name: 'Week 5', value: 65 },
          { name: 'Week 6', value: 74 },
          { name: 'Week 7', value: 82 },
          { name: 'Week 8', value: 89 },
        ],
      },
    ],
    insightText: '모공 케어 효과가 2030 세대에서 급상승 중인 초기 트렌드.',
  },
  {
    rank: 7,
    category: 'Effect',
    combination: '장벽 강화',
    status: '🔥 Actionable Trend',
    signals: [
      {
        type: 'SNS',
        data: [
          { name: 'Week 1', value: 48 },
          { name: 'Week 2', value: 55 },
          { name: 'Week 3', value: 63 },
          { name: 'Week 4', value: 71 },
          { name: 'Week 5', value: 78 },
          { name: 'Week 6', value: 84 },
          { name: 'Week 7', value: 89 },
          { name: 'Week 8', value: 93 },
        ],
      },
      {
        type: 'Retail',
        data: [
          { name: 'Week 1', value: 45 },
          { name: 'Week 2', value: 52 },
          { name: 'Week 3', value: 60 },
          { name: 'Week 4', value: 68 },
          { name: 'Week 5', value: 75 },
          { name: 'Week 6', value: 81 },
          { name: 'Week 7', value: 86 },
          { name: 'Week 8', value: 90 },
        ],
      },
      {
        type: 'Review',
        data: [
          { name: 'Week 1', value: 85 },
          { name: 'Week 2', value: 87 },
          { name: 'Week 3', value: 89 },
          { name: 'Week 4', value: 91 },
          { name: 'Week 5', value: 92 },
          { name: 'Week 6', value: 93 },
          { name: 'Week 7', value: 94 },
          { name: 'Week 8', value: 95 },
        ],
      },
    ],
    insightText: '환절기와 환경 변화로 인한 장벽 강화 니즈가 지속적으로 상승 중.',
  },
];

// 국내 Bubble Chart 데이터
export const bubbleDataDomestic: BubbleItem[] = [
  // 성분
  { id: '1', name: '레티놀', type: 'ingredient', x: 20, y: 30, size: 85, value: 95, status: '🔥 Actionable Trend' },
  { id: '2', name: '판테놀', type: 'ingredient', x: 35, y: 45, size: 75, value: 90, status: '🔥 Actionable Trend' },
  { id: '3', name: '시카', type: 'ingredient', x: 50, y: 25, size: 65, value: 78, status: '🌱 Early Trend' },
  { id: '4', name: '히알루론산', type: 'ingredient', x: 25, y: 60, size: 70, value: 82, status: '🚀 Growing Trend' },
  { id: '5', name: '나이아신아마이드', type: 'ingredient', x: 60, y: 40, size: 60, value: 75, status: '🌱 Early Trend' },
  // 제형
  { id: '6', name: '앰플', type: 'formula', x: 70, y: 35, size: 80, value: 88, status: '🚀 Growing Trend' },
  { id: '7', name: '크림', type: 'formula', x: 80, y: 55, size: 90, value: 97, status: '🔥 Actionable Trend' },
  { id: '8', name: '선스틱', type: 'formula', x: 65, y: 70, size: 55, value: 68, status: '🌱 Early Trend' },
  { id: '9', name: '쿠션', type: 'formula', x: 45, y: 75, size: 65, value: 81, status: '🚀 Growing Trend' },
  // 효과
  { id: '10', name: '모공 케어', type: 'effect', x: 15, y: 50, size: 70, value: 87, status: '🚀 Growing Trend' },
  { id: '11', name: '장벽 강화', type: 'effect', x: 40, y: 65, size: 75, value: 93, status: '🔥 Actionable Trend' },
  { id: '12', name: '진정', type: 'effect', x: 55, y: 50, size: 60, value: 78, status: '🌱 Early Trend' },
  { id: '13', name: '광채', type: 'effect', x: 30, y: 80, size: 55, value: 72, status: '🌱 Early Trend' },
];

// 해외 Bubble Chart 데이터
export const bubbleDataOverseas: BubbleItem[] = [
  // 성분
  { id: 'ov1', name: 'Retinol', type: 'ingredient', x: 25, y: 35, size: 90, value: 98, status: '🔥 Actionable Trend' },
  { id: 'ov2', name: 'Niacinamide', type: 'ingredient', x: 40, y: 50, size: 85, value: 92, status: '🔥 Actionable Trend' },
  { id: 'ov3', name: 'Hyaluronic Acid', type: 'ingredient', x: 55, y: 30, size: 88, value: 95, status: '🔥 Actionable Trend' },
  { id: 'ov4', name: 'Vitamin C', type: 'ingredient', x: 30, y: 65, size: 75, value: 88, status: '🚀 Growing Trend' },
  { id: 'ov5', name: 'Peptide', type: 'ingredient', x: 65, y: 45, size: 70, value: 82, status: '🚀 Growing Trend' },
  // 제형
  { id: 'ov6', name: 'Serum', type: 'formula', x: 75, y: 40, size: 85, value: 93, status: '🔥 Actionable Trend' },
  { id: 'ov7', name: 'Moisturizer', type: 'formula', x: 85, y: 60, size: 92, value: 96, status: '🔥 Actionable Trend' },
  { id: 'ov8', name: 'Sunscreen', type: 'formula', x: 70, y: 75, size: 80, value: 90, status: '🔥 Actionable Trend' },
  { id: 'ov9', name: 'Essence', type: 'formula', x: 50, y: 80, size: 72, value: 85, status: '🚀 Growing Trend' },
  // 효과
  { id: 'ov10', name: 'Anti-aging', type: 'effect', x: 20, y: 55, size: 88, value: 94, status: '🔥 Actionable Trend' },
  { id: 'ov11', name: 'Brightening', type: 'effect', x: 45, y: 70, size: 82, value: 91, status: '🔥 Actionable Trend' },
  { id: 'ov12', name: 'Hydration', type: 'effect', x: 60, y: 55, size: 75, value: 87, status: '🚀 Growing Trend' },
  { id: 'ov13', name: 'Repair', type: 'effect', x: 35, y: 85, size: 68, value: 80, status: '🚀 Growing Trend' },
];

// 하위 호환성을 위한 기본 export
export const bubbleData = bubbleDataDomestic;

// SNS 플랫폼별 Top 성분 데이터
export interface SNSTopIngredient {
  platform: 'Amazon' | 'TikTok' | 'Instagram' | 'YouTube' | 'Cosme' | 'Shopee';
  keywords: { name: string; value: number; change: number; type: 'ingredient' | 'formula' | 'effect' }[];
}

// 국가별 SNS 플랫폼 Top 키워드 생성 함수는 leaderboardData.ts에 정의됨

// 기존 호환성을 위한 기본 데이터
export const snsTopIngredients: SNSTopIngredient[] = [
  {
    platform: 'Instagram',
    keywords: [
      { name: '레티놀', value: 95, change: 12, type: 'ingredient' },
      { name: '히알루론산', value: 88, change: 8, type: 'ingredient' },
      { name: '나이아신아마이드', value: 82, change: 5, type: 'ingredient' },
      { name: '시카', value: 78, change: 3, type: 'ingredient' },
      { name: '판테놀', value: 75, change: 10, type: 'ingredient' },
    ],
  },
  {
    platform: 'TikTok',
    keywords: [
      { name: '레티놀', value: 98, change: 15, type: 'ingredient' },
      { name: '판테놀', value: 90, change: 12, type: 'ingredient' },
      { name: '시카', value: 85, change: 8, type: 'ingredient' },
      { name: '히알루론산', value: 80, change: 6, type: 'ingredient' },
      { name: '나이아신아마이드', value: 72, change: 4, type: 'ingredient' },
    ],
  },
  {
    platform: 'YouTube',
    keywords: [
      { name: '히알루론산', value: 92, change: 7, type: 'ingredient' },
      { name: '레티놀', value: 89, change: 10, type: 'ingredient' },
      { name: '나이아신아마이드', value: 85, change: 6, type: 'ingredient' },
      { name: '시카', value: 80, change: 5, type: 'ingredient' },
      { name: '판테놀', value: 78, change: 9, type: 'ingredient' },
    ],
  },
];

// 보조 지표 데이터
export interface TrendMetric {
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export const trendMetrics: TrendMetric[] = [
  { label: '전체 트렌드 성장률', value: 24.5, unit: '%', change: 5.2, trend: 'up' },
  { label: 'SNS 언급량 증가', value: 18.3, unit: '%', change: 3.1, trend: 'up' },
  { label: '리테일 판매 증가', value: 15.7, unit: '%', change: 2.8, trend: 'up' },
  { label: '긍정 리뷰 비율', value: 87.2, unit: '%', change: 1.5, trend: 'up' },
  { label: '시장 점유율', value: 12.4, unit: '%', change: -0.3, trend: 'down' },
  { label: '브랜드 인지도', value: 68.9, unit: '%', change: 4.2, trend: 'up' },
];

// 보고서 생성 함수 (선택된 항목 기반)
export const generateReport = (
  type: 'marketing' | 'npd' | 'overseas',
  selectedItem: BubbleItem | null,
  country: Country
): ReportResult => {
  // 맞춤형 인사이트 사용
  const content = getCustomInsight(country, selectedItem, type);
  
  return {
    type,
    content,
  };
};

// 보고서 결과 Mock 데이터 (하위 호환성)
export const reportResults = {
  marketing: {
    type: 'marketing' as const,
    content: '타겟: 2030 트러블 피부 / 키워드: "깐달걀 피부" / 채널: 틱톡 챌린지 추천',
  },
  npd: {
    type: 'npd' as const,
    content: '제안: 저자극 레티놀 시카 앰플 / 소구점: 밤낮없이 바르는 레티놀',
  },
  overseas: {
    type: 'overseas' as const,
    content: '추천 국가: 일본 / 이유: Qoo10 랭킹 급상승 중 / 전략: 오프라인 버라이어티샵 선점',
  },
};

