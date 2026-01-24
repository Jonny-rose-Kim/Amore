/**
 * 영어 키워드 → 한국어 번역 맵
 */

// 성분 (Ingredients)
const ingredientTranslations: Record<string, string> = {
  'snail mucin': '달팽이 뮤신',
  'PDRN': 'PDRN(연어DNA)',
  'niacinamide': '나이아신아마이드',
  'centella asiatica': '센텔라 아시아티카',
  'heartleaf': '어성초',
  'hyaluronic acid': '히알루론산',
  'propolis': '프로폴리스',
  'rice extract': '쌀 추출물',
  'ceramides': '세라마이드',
  'mugwort': '쑥',
  'green tea': '녹차',
  'peptides': '펩타이드',
  'exosomes': '엑소좀',
  'tranexamic acid': '트라넥사믹산',
  'bifida ferment': '비피다 발효물',
  'low pH': '약산성',
  'salicylic acid': '살리실산',
  'amino acid': '아미노산',
  'tea tree': '티트리',
  'green plum': '매실',
  'volcanic ash': '화산재',
  'centella': '센텔라',
  'rice bran': '쌀겨',
  'moringa oil': '모링가 오일',
  'panthenol': '판테놀',
  'zinc oxide': '징크옥사이드',
  'adenosine': '아데노신',
  'centella extract': '센텔라 추출물',
  'aloe vera': '알로에 베라',
  'vitamin E': '비타민E',
  'retinol': '레티놀',
  'vitamin C': '비타민C',
  'collagen': '콜라겐',
  'ginseng': '인삼',
  'fermented ingredients': '발효 성분',
  'argan oil': '아르간 오일',
  'keratin': '케라틴',
  'biotin': '비오틴',
  'shea butter': '시어버터',
  'jojoba oil': '호호바 오일',
  'witch hazel': '위치하젤',
  'BHA': 'BHA(베타하이드록시산)',
  'AHA': 'AHA(알파하이드록시산)',
  'cica': '시카',
  'bamboo': '대나무',
  'centella + PDRN': '센텔라+PDRN',
  'madecassoside': '마데카소사이드',
  'mushroom': '버섯',
  'lotus': '연꽃',
  'yuzu': '유자',
  'camellia': '동백',
  'rice water': '쌀뜨물',
  'sakura': '벚꽃',
};

// 제형 (Formulas)
const formulaTranslations: Record<string, string> = {
  'essence': '에센스',
  'serum': '세럼',
  'toner': '토너',
  'sheet mask': '시트마스크',
  'gel cream': '젤크림',
  'cream': '크림',
  'emulsion': '에멀전',
  'sleeping mask': '슬리핑 마스크',
  'ampoule': '앰플',
  'toner pad': '토너패드',
  'mist toner': '미스트 토너',
  'oil serum': '오일 세럼',
  'cica balm': '시카 밤',
  'gel cleanser': '젤 클렌저',
  'foam cleanser': '폼 클렌저',
  'cleansing oil': '클렌징 오일',
  'cleansing water': '클렌징 워터',
  'cleansing balm': '클렌징 밤',
  'scrub': '스크럽',
  'peeling gel': '필링 젤',
  'micellar water': '미셀라 워터',
  'sun cream': '선크림',
  'sun stick': '선스틱',
  'sun serum': '선세럼',
  'sun cushion': '선쿠션',
  'UV gel': 'UV 젤',
  'sun milk': '선밀크',
  'tone-up cream': '톤업크림',
  'cushion': '쿠션',
  'lip tint': '립틴트',
  'lip balm': '립밤',
  'setting spray': '세팅 스프레이',
  'foundation': '파운데이션',
  'primer': '프라이머',
  'shampoo': '샴푸',
  'conditioner': '컨디셔너',
  'hair mask': '헤어마스크',
  'scalp serum': '두피 세럼',
  'hair oil': '헤어오일',
  'body lotion': '바디로션',
  'body oil': '바디오일',
  'body wash': '바디워시',
  'hand cream': '핸드크림',
  'body scrub': '바디스크럽',
  'all-in-one': '올인원',
  'aftershave': '애프터쉐이브',
  'balm': '밤',
  'eye cream': '아이크림',
  'pact': '팩트',
};

// 효과 (Effects)
const effectTranslations: Record<string, string> = {
  'hydrating': '보습',
  'soothing': '진정',
  'brightening': '미백/브라이트닝',
  'glass skin': '글래스 스킨',
  'anti-aging': '안티에이징',
  'barrier repair': '장벽 강화',
  'firming': '탄력',
  'pore minimizing': '모공 축소',
  'acne care': '여드름 케어',
  'dark spot fading': '잡티 완화',
  'redness relief': '홍조 완화',
  'skin plumping': '피부 탱탱',
  'deep cleansing': '딥 클렌징',
  'gentle cleansing': '순한 세정',
  'makeup removing': '메이크업 제거',
  'pore cleansing': '모공 세정',
  'oil control': '유분 조절',
  'exfoliating': '각질 제거',
  'sebum control': '피지 조절',
  'UV protection': '자외선 차단',
  'tone-up': '톤업',
  'lightweight feel': '가벼운 사용감',
  'no white cast': '백탁 없음',
  'water-resistant': '워터프루프',
  'matte finish': '매트 피니쉬',
  'dewy finish': '윤광 마무리',
  'long-lasting': '지속력',
  'natural coverage': '자연스러운 커버',
  'lip hydrating': '입술 보습',
  'color payoff': '발색력',
  'scalp care': '두피 케어',
  'hair repair': '모발 보수',
  'volume boost': '볼륨업',
  'shine control': '윤기 조절',
  'smoothing': '매끄럽게',
  'body hydrating': '바디 보습',
  'skin softening': '피부 유연',
  'body firming': '바디 탄력',
  'refreshing': '상쾌함',
  'exfoliation': '각질 관리',
  'moisturizing': '보습',
  'oil-free': '무유분',
  'anti-wrinkle': '주름 개선',
  'skin calming': '피부 진정',
};

// 무드 (Moods)
const moodTranslations: Record<string, string> = {
  'glass skin aesthetic': '글래스 스킨 무드',
  'butter skin': '버터 스킨',
  'K-beauty layering': '케이뷰티 레이어링',
  'skin flooding': '스킨 플러딩',
  'skinimalism': '스키니멀리즘',
  'glazed donut skin': '글레이즈드 도넛 스킨',
  'clean girl glow': '클린걸 글로우',
  'dewy glow': '촉촉 윤광',
  'skin cycling': '스킨 사이클링',
  'no-filter skin': '노필터 피부',
  'slow beauty': '슬로우 뷰티',
  'jelly skin': '젤리 스킨',
  'morning skincare hack': '아침 스킨케어 팁',
  'one-step cleansing': '원스텝 클렌징',
  'double cleansing': '더블 클렌징',
  'oil cleansing method': '오일 클렌징법',
  'spa at home': '홈스파',
  'pore detox': '모공 디톡스',
  'skin barrier repair': '피부 장벽 수복',
  'sunscreen layering': '선크림 레이어링',
  'sun-kissed glow': '선키스드 글로우',
  'outdoor protection': '아웃도어 보호',
  'UV daily routine': 'UV 데일리 루틴',
  'sun care minimalism': '선케어 미니멀리즘',
  'barely-there makeup': '민낯 메이크업',
  'K-beauty glow': '케이뷰티 글로우',
  'idol makeup': '아이돌 메이크업',
  'no-makeup makeup': '노메이크업 메이크업',
  'gradient lip': '그라데이션 립',
  'glass hair': '글래스 헤어',
  'silk hair routine': '실크 헤어 루틴',
  'scalp-first approach': '두피 우선 관리',
  'hair oiling ritual': '헤어 오일링',
  'K-hair trend': '케이 헤어 트렌드',
  'body glow up': '바디 글로우업',
  'self-care ritual': '셀프케어 루틴',
  'body skin cycling': '바디 스킨 사이클링',
  'bath ritual': '배스 리추얼',
  'smooth body skin': '매끈 바디 피부',
  'effortless grooming': '간편 그루밍',
  'gentleman skincare': '젠틀맨 스킨케어',
  'mens minimalist': '남성 미니멀 케어',
  'one-step routine': '원스텝 루틴',
  'skin confidence': '피부 자신감',
};

// 리뷰 영한 번역 맵
const reviewTranslations: Record<string, string> = {
  // 긍정 - 효과
  'Visible improvement in my skin after just 2 weeks of using this!': '사용한 지 2주 만에 눈에 띄는 피부 개선이 있었어요!',
  'My acne scars are fading noticeably. This really works!': '여드름 자국이 눈에 띄게 옅어지고 있어요. 진짜 효과 있어요!',
  'Noticed brighter and clearer skin within a week.': '일주일 만에 더 밝고 투명한 피부를 느꼈어요.',
  'Finally found a product that actually delivers on its promises!': '드디어 약속한 효과를 실제로 보여주는 제품을 찾았어요!',
  // 긍정 - 보습
  'Love this product! My skin feels so hydrated and smooth all day.': '이 제품 너무 좋아요! 하루 종일 피부가 촉촉하고 매끄러워요.',
  'Deep hydration without feeling greasy. Perfect for dry skin.': '끈적임 없이 깊은 보습. 건성 피부에 완벽해요.',
  'My dehydrated skin drinks this up. Plump and dewy all day.': '탈수된 피부가 쫙 흡수해요. 하루 종일 탱탱하고 윤기나요.',
  // 긍정 - 텍스처
  'The texture is amazing - absorbs quickly without stickiness.': '텍스처가 놀라워요 - 끈적임 없이 빠르게 흡수돼요.',
  'Lightweight and silky. Layers beautifully under makeup.': '가볍고 실크 같아요. 메이크업 아래 레이어링이 잘 돼요.',
  'Smooth application, melts right into the skin.': '부드럽게 발리고 피부에 바로 녹아들어요.',
  // 긍정 - 향
  'Subtle, pleasant scent that is not overpowering at all.': '은은하고 기분 좋은 향이에요. 전혀 부담스럽지 않아요.',
  'Love the fresh, clean fragrance. Very calming.': '신선하고 깨끗한 향이 좋아요. 매우 진정되는 느낌이에요.',
  // 긍정 - 가성비
  'Great value for money. Works better than expensive brands.': '가성비 최고에요. 비싼 브랜드보다 더 잘 먹혀요.',
  'Affordable yet so effective. Best budget-friendly find!': '저렴하면서도 효과적이에요. 최고의 가성비 제품!',
  // 긍정 - 자극없음
  'My sensitive skin loves this. No irritation at all.': '민감한 제 피부에 딱이에요. 자극이 전혀 없어요.',
  'Zero irritation even on my reactive, redness-prone skin.': '반응성이 높고 홍조가 잘 생기는 피부인데도 자극이 제로예요.',
  // 긍정 - 지속력
  'Keeps my skin moisturized for 12+ hours. Amazing staying power.': '12시간 넘게 피부를 촉촉하게 유지해줘요. 놀라운 지속력!',
  'Lasts all day under makeup without fading or pilling.': '하루 종일 메이크업 아래서 밀림이나 뭉침 없이 지속돼요.',
  // 긍정 - 흡수력
  'Absorbs in seconds, no residue. Perfect for morning routine.': '초 만에 흡수되고 잔여물이 없어요. 아침 루틴에 완벽!',
  'Sinks in immediately - no waiting time needed before next step.': '바로 스며들어요 - 다음 단계 전에 기다릴 필요 없어요.',
  // 부정 - 효과
  'Did not notice any difference after using for a month.': '한 달 동안 사용했는데 아무런 변화를 느끼지 못했어요.',
  'Expected more results. Barely any visible change.': '더 많은 결과를 기대했는데 눈에 띄는 변화가 거의 없어요.',
  // 부정 - 보습
  'Not moisturizing enough for my dry skin type.': '건성 피부인 저에게는 보습력이 충분하지 않았어요.',
  'Made my skin feel tight and dry after a few hours.': '몇 시간 후에 피부가 당기고 건조하게 느껴졌어요.',
  // 부정 - 텍스처
  'Too sticky for my oily skin type. Hard to layer.': '지성 피부에는 너무 끈적여요. 레이어링하기 어려워요.',
  'Leaves a white cast and pills under makeup.': '백탁이 생기고 메이크업 아래서 뭉쳐요.',
  // 부정 - 향
  'Fragrance is too strong for my preference. Gave me headache.': '향이 제 취향에는 너무 강해요. 두통이 생겼어요.',
  'Chemical smell that lingers. Wish it was fragrance-free.': '화학적인 냄새가 남아요. 무향이었으면 좋겠어요.',
  // 부정 - 가성비
  'Expected more for the price point. Overpriced for what it does.': '가격 대비 더 많은 것을 기대했어요. 효과에 비해 비싸요.',
  'Too expensive for the small amount you get.': '양에 비해 너무 비싸요.',
  // 부정 - 자극
  'Broke me out unfortunately. Not suitable for acne-prone skin.': '안타깝게도 뾰루지가 났어요. 여드름 피부에 적합하지 않아요.',
  'Caused some redness and burning on my sensitive skin.': '민감한 피부에 홍조와 화끈거림이 생겼어요.',
  // 부정 - 지속력
  'Effects wear off within 2-3 hours. Need constant reapplication.': '2-3시간 내에 효과가 사라져요. 계속 덧발라야 해요.',
  'Fades quickly. Does not last as long as advertised.': '빨리 사라져요. 광고만큼 오래가지 않아요.',
  // 부정 - 흡수력
  'Takes forever to absorb. Leaves greasy film on skin.': '흡수가 너무 오래 걸려요. 피부에 기름막이 남아요.',
  'Sits on top of skin and never fully sinks in.': '피부 위에 떠 있고 완전히 흡수되지 않아요.',
};

/**
 * 영어 키워드를 한국어로 번역합니다.
 * 매칭되지 않는 키워드는 원문 그대로 반환합니다.
 */
export function translateKeyword(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase().trim();

  // 모든 맵에서 검색 (대소문자 무시)
  const allMaps = [ingredientTranslations, formulaTranslations, effectTranslations, moodTranslations];

  for (const map of allMaps) {
    for (const [eng, kor] of Object.entries(map)) {
      if (eng.toLowerCase() === lowerKeyword) {
        return kor;
      }
    }
  }

  return keyword; // 번역 없으면 원문 반환
}

/**
 * 조합 문자열 전체를 한국어로 번역합니다.
 * "snail mucin + essence + hydrating + glass skin aesthetic"
 * → "달팽이 뮤신 + 에센스 + 보습 + 글래스 스킨 무드"
 */
export function translateCombination(combination: string): string {
  const parts = combination.split('+').map(s => s.trim());
  const translated = parts.map(part => translateKeyword(part));
  return translated.join(' + ');
}

/**
 * 영어 리뷰 내용을 한국어로 번역합니다.
 */
export function translateReview(content: string): string {
  // 정확한 매칭 시도
  if (reviewTranslations[content]) {
    return reviewTranslations[content];
  }

  // 부분 매칭 시도 (앞뒤 공백/따옴표 제거 후)
  const trimmed = content.replace(/^["']|["']$/g, '').trim();
  if (reviewTranslations[trimmed]) {
    return reviewTranslations[trimmed];
  }

  // 매칭 안되면 null 반환 (번역 불가)
  return '';
}

/**
 * 리뷰 목록으로부터 종합 요약을 생성합니다.
 */
export function generateReviewSummary(reviews: { content: string; sentiment: string; brand: string; product: string; rating: number }[], sentiment: string): string {
  if (reviews.length === 0) return '';

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const brands = [...new Set(reviews.map(r => r.brand))];
  const products = [...new Set(reviews.map(r => r.product))];

  if (sentiment === 'positive') {
    const positiveHighlights = [
      reviews.length >= 5 ? '다수의 소비자가 효과를 체감' : '일부 소비자가 효과를 인정',
      Number(avgRating) >= 4.5 ? '매우 높은 평점' : '양호한 평점',
      brands.length >= 3 ? '다양한 브랜드에서 고르게 검증' : `${brands.slice(0, 2).join(', ')} 제품에서 확인`,
    ];

    return `총 ${reviews.length}건의 긍정 리뷰를 분석한 결과, 평균 평점 ${avgRating}점으로 ${positiveHighlights[0]}하였습니다. ` +
      `${positiveHighlights[2]}되었으며, 전반적으로 사용감과 효과에 대한 만족도가 높게 나타났습니다. ` +
      `주요 제품: ${products.slice(0, 3).join(', ')} 등에서 긍정적 반응이 확인됩니다.`;
  } else {
    const negativeHighlights = [
      Number(avgRating) <= 2.5 ? '낮은 평점으로 불만족 표시' : '개선 요구 사항 존재',
      brands.length >= 3 ? '여러 제품에서 공통적인 문제점 발견' : `${brands.slice(0, 2).join(', ')} 제품에서 지적`,
    ];

    return `총 ${reviews.length}건의 부정 리뷰를 분석한 결과, 평균 평점 ${avgRating}점으로 ${negativeHighlights[0]}됩니다. ` +
      `${negativeHighlights[1]}되었으며, 제품 개선 시 해당 피드백을 우선적으로 반영할 필요가 있습니다. ` +
      `개선이 필요한 제품: ${products.slice(0, 3).join(', ')} 등입니다.`;
  }
}
