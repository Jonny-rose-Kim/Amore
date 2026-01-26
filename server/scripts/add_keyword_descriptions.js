/**
 * 키워드 설명 데이터 추가 스크립트
 * 화장품 관점에서 각 키워드의 의미를 설명
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// 키워드별 화장품 관점 설명 데이터
const keywordDescriptions = {
  // ===== Formulas (제형) =====
  'blush': {
    koreanName: '블러쉬',
    description: '블러쉬는 뺨에 자연스러운 혈색감을 부여하는 색조 화장품입니다. 파우더, 크림, 리퀴드 등 다양한 제형으로 출시되며, 피부톤에 맞는 컬러 선택이 중요합니다. 최근에는 자연스러운 글로우 효과를 주는 멀티유즈 제품이 인기를 얻고 있습니다.'
  },
  'butter': {
    koreanName: '버터',
    description: '버터 제형은 시어버터, 코코아버터 등 천연 오일이 풍부하게 함유된 고보습 제형입니다. 피부에 밀착되어 깊은 보습막을 형성하고, 건조한 피부나 바디 케어에 특히 효과적입니다. 부드럽게 녹아드는 텍스처가 특징입니다.'
  },
  'concealer': {
    koreanName: '컨실러',
    description: '컨실러는 다크서클, 잡티, 홍조 등 피부 결점을 커버하는 색조 화장품입니다. 파운데이션보다 커버력이 높고, 액체, 스틱, 크림 등 다양한 제형이 있습니다. 피부톤보다 밝은 컬러로 하이라이트 효과도 연출할 수 있습니다.'
  },
  'conditioner': {
    koreanName: '컨디셔너',
    description: '컨디셔너는 샴푸 후 모발에 수분과 영양을 공급하는 헤어 케어 제품입니다. 큐티클을 정돈하여 부드럽고 윤기 있는 모발로 가꿔주며, 엉킴 방지와 정전기 예방에도 효과적입니다. 손상 모발용, 볼륨업용 등 다양한 기능성 제품이 있습니다.'
  },
  'foundation': {
    koreanName: '파운데이션',
    description: '파운데이션은 피부톤을 균일하게 정돈하고 결점을 커버하는 베이스 메이크업의 핵심 제품입니다. 리퀴드, 쿠션, 파우더 등 다양한 제형이 있으며, 피부 타입과 원하는 커버력에 따라 선택합니다. 최근에는 스킨케어 성분이 함유된 하이브리드 제품이 트렌드입니다.'
  },
  'lipstick': {
    koreanName: '립스틱',
    description: '립스틱은 입술에 색상과 윤기를 부여하는 색조 화장품입니다. 매트, 새틴, 글로시 등 다양한 피니쉬가 있으며, 발색력과 지속력이 중요한 선택 기준입니다. 최근에는 보습 성분이 함유되어 입술 건강까지 케어하는 제품이 인기입니다.'
  },
  'mascara': {
    koreanName: '마스카라',
    description: '마스카라는 속눈썹에 볼륨감, 길이, 컬을 부여하는 아이 메이크업 제품입니다. 워터프루프, 롱래쉬, 볼류마이징 등 다양한 기능이 있으며, 브러시 형태에 따라 효과가 달라집니다. 눈매를 또렷하게 강조하는 핵심 아이템입니다.'
  },
  'powder': {
    koreanName: '파우더',
    description: '파우더는 메이크업 마무리 단계에서 유분기를 잡아주고 화장을 고정시키는 제품입니다. 루스 파우더와 컴팩트 파우더로 나뉘며, 피부 표면을 매끄럽게 정돈해줍니다. 세팅 효과와 함께 모공 커버, 피지 컨트롤 기능을 갖춘 제품도 많습니다.'
  },
  'primer': {
    koreanName: '프라이머',
    description: '프라이머는 메이크업 전 피부 결을 정돈하고 화장 지속력을 높여주는 베이스 제품입니다. 모공 커버, 피지 컨트롤, 보습, 톤업 등 다양한 기능이 있으며, 파운데이션의 밀착력을 높여줍니다. 메이크업의 완성도를 높이는 필수 단계로 자리잡았습니다.'
  },
  'scrub': {
    koreanName: '스크럽',
    description: '스크럽은 미세한 입자를 이용해 피부 표면의 각질과 노폐물을 물리적으로 제거하는 각질 케어 제품입니다. 설탕, 소금, 곡물 등 천연 스크럽 입자를 사용한 제품이 많으며, 주 1-2회 사용으로 매끄럽고 투명한 피부를 유지할 수 있습니다.'
  },
  'shampoo': {
    koreanName: '샴푸',
    description: '샴푸는 두피와 모발의 노폐물, 유분, 스타일링 잔여물을 세정하는 헤어 케어의 기본 제품입니다. 두피 타입(지성/건성/민감성)과 모발 고민(탈모/손상/비듬)에 따라 다양한 기능성 제품이 있습니다. pH 균형을 맞춘 저자극 포뮬러가 두피 건강에 중요합니다.'
  },

  // ===== Effects (효과) =====
  'coverage': {
    koreanName: '커버력',
    description: '커버력은 피부의 잡티, 홍조, 색소 침착 등 결점을 가려주는 화장품의 핵심 기능입니다. 쉬어(투명), 미디엄, 풀 커버리지로 구분되며, 자연스러운 피부 표현을 원하면 빌더블 커버리지 제품을 선택합니다. TPO에 맞는 커버력 선택이 메이크업 완성도를 좌우합니다.'
  },
  'shine': {
    koreanName: '윤기/광택',
    description: '샤인은 피부나 모발에 건강한 윤기와 광택을 부여하는 효과입니다. 스킨케어에서는 글로우 피부를, 헤어케어에서는 찰랑거리는 모발을 연출합니다. 하이라이터, 글로우 세럼, 헤어 오일 등 다양한 제품이 이 효과를 극대화합니다.'
  },
  'strengthening': {
    koreanName: '강화/탄력',
    description: '스트렝쓰닝은 피부 장벽, 모발 큐티클, 손톱 등을 튼튼하게 강화하는 효과입니다. 케라틴, 콜라겐, 펩타이드 등의 성분이 구조를 보강하고 손상을 예방합니다. 특히 약해진 모발이나 얇아진 피부에 탄력과 건강함을 되찾아줍니다.'
  },
  'volume': {
    koreanName: '볼륨',
    description: '볼륨은 모발에 풍성함과 탄력을 부여하거나, 속눈썹을 두껍고 풍성하게 보이게 하는 효과입니다. 헤어 제품에서는 루트 리프팅, 마스카라에서는 볼류마이징 기능으로 구현됩니다. 가늘고 힘없는 모발이나 속눈썹에 생기를 더해줍니다.'
  },

  // ===== Ingredients (성분) =====
  'protein': {
    koreanName: '단백질/프로틴',
    description: '프로틴(단백질)은 피부와 모발의 구조를 이루는 핵심 성분입니다. 콜라겐, 케라틴, 실크 프로틴 등이 화장품에 활용되며, 손상된 피부와 모발을 보수하고 탄력을 높여줍니다. 특히 열이나 화학적 손상을 받은 모발 복구에 효과적입니다.'
  },

  // ===== Mood (무드) =====
  'refreshing': {
    koreanName: '상쾌한/리프레싱',
    description: '리프레싱은 시원하고 산뜻한 느낌을 주는 화장품의 사용감을 의미합니다. 페퍼민트, 유칼립투스, 시트러스 계열 향과 쿨링 성분이 청량감을 선사합니다. 여름철 스킨케어나 두피 케어 제품에서 특히 선호되는 무드입니다.'
  },
  'relaxing': {
    koreanName: '편안한/릴랙싱',
    description: '릴랙싱은 심신의 긴장을 풀어주는 편안하고 안정적인 느낌을 주는 화장품의 무드입니다. 라벤더, 캐모마일, 샌달우드 등 진정 효과가 있는 아로마 성분이 주로 사용됩니다. 나이트 케어 제품이나 바스 & 바디 라인에서 인기 있는 컨셉입니다.'
  }
};

async function addDescriptions() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  await client.connect();
  const db = client.db('amore');

  console.log('키워드 설명 추가 시작...\n');

  let updatedCount = 0;
  let skippedCount = 0;

  for (const [keyword, data] of Object.entries(keywordDescriptions)) {
    // 해당 키워드의 모든 문서 업데이트
    const result = await db.collection('processed_keywords').updateMany(
      { keyword: { $regex: new RegExp(`^${keyword}$`, 'i') } },
      {
        $set: {
          description: data.description,
          koreanName: data.koreanName
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ "${keyword}" (${data.koreanName}): ${result.modifiedCount}개 문서 업데이트`);
      updatedCount += result.modifiedCount;
    } else {
      console.log(`⏭️ "${keyword}": 이미 최신 상태이거나 해당 키워드 없음`);
      skippedCount++;
    }
  }

  console.log(`\n===== 완료 =====`);
  console.log(`업데이트된 문서: ${updatedCount}개`);
  console.log(`스킵된 키워드: ${skippedCount}개`);

  // 결과 확인
  const remaining = await db.collection('processed_keywords').aggregate([
    { $match: { $or: [{ description: null }, { description: '' }, { description: { $exists: false } }] } },
    { $group: { _id: '$keyword' } }
  ]).toArray();

  if (remaining.length > 0) {
    console.log(`\n⚠️ 아직 설명이 없는 키워드: ${remaining.length}개`);
    remaining.forEach(k => console.log(' -', k._id));
  } else {
    console.log('\n✅ 모든 키워드에 설명이 추가되었습니다!');
  }

  await client.close();
}

addDescriptions().catch(console.error);
