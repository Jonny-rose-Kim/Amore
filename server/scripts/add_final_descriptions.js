/**
 * 최종 키워드 설명 추가
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const keywordDescriptions = {
  'dewy glow': {
    koreanName: '듀이 글로우',
    description: '듀이 글로우는 이슬이 맺힌 듯 촉촉하고 광채 나는 피부 무드입니다. 글래스 스킨의 변형으로, 수분 가득한 건강한 피부 표현이 특징이며, 하이라이터와 글로우 스킨케어로 연출합니다.'
  },
  'heat protection': {
    koreanName: '열 손상 방지',
    description: '열 손상 방지는 헤어 드라이어, 고데기 등 열기구 사용 시 모발을 보호하는 효과입니다. 실리콘, 세라마이드 성분이 열에 의한 큐티클 손상과 단백질 변성을 방지합니다.'
  },
  'skin tint': {
    koreanName: '스킨 틴트',
    description: '스킨 틴트는 피부처럼 자연스러운 마무리감의 가벼운 베이스 메이크업입니다. 파운데이션보다 커버력이 낮지만 피부 본연의 아름다움을 살려 건강한 피부 표현에 적합합니다.'
  },
  'aloe vera body': {
    koreanName: '알로에 베라 바디',
    description: '알로에 베라 바디 제품은 알로에의 진정, 보습 효과를 몸 전체에 적용합니다. 햇볕에 탄 피부 진정, 샤워 후 수분 공급에 효과적이며 시원하고 산뜻한 사용감이 특징입니다.'
  },
  'fresh start': {
    koreanName: '프레쉬 스타트',
    description: '프레쉬 스타트는 상쾌하게 하루를 시작하는 모닝 스킨케어 무드입니다. 비타민 C, 시트러스 향 등이 피부에 활력을 불어넣고 맑고 생기 있는 아침 피부를 연출합니다.'
  },
  'minimal design': {
    koreanName: '미니멀 디자인',
    description: '미니멀 디자인은 군더더기 없이 깔끔하고 세련된 패키지 디자인 트렌드입니다. 단순한 컬러, 깨끗한 라인, 필수 정보만 담은 라벨로 현대적이고 고급스러운 느낌을 줍니다.'
  },
  'lightweight daily': {
    koreanName: '가벼운 데일리',
    description: '라이트웨이트 데일리는 매일 부담 없이 사용할 수 있는 가벼운 제형의 스킨케어입니다. 끈적임 없이 빠르게 흡수되어 아침 스킨케어나 메이크업 전 사용에 적합합니다.'
  },
  'makeup removal': {
    koreanName: '메이크업 제거',
    description: '메이크업 리무벌은 화장을 효과적으로 지우는 클렌징 효과입니다. 오일, 밤, 워터 등 다양한 제형이 워터프루프 메이크업까지 깔끔하게 녹여 제거합니다.'
  },
  'healthy scalp': {
    koreanName: '건강한 두피',
    description: '건강한 두피는 탈모 예방과 모발 성장의 기초입니다. 두피 스크럽, 토닉, 세럼 등으로 두피 환경을 개선하고 모근에 영양을 공급하여 건강한 모발이 자라도록 합니다.'
  },
  'body skincare routine': {
    koreanName: '바디 스킨케어 루틴',
    description: '바디 스킨케어 루틴은 얼굴처럼 몸 피부도 체계적으로 관리하는 트렌드입니다. 바디 세럼, 바디 오일, 보디 로션을 레이어링하여 전신 피부를 촉촉하고 건강하게 유지합니다.'
  },
  'sake extract': {
    koreanName: '사케 추출물',
    description: '사케(일본 청주) 추출물은 쌀 발효 과정에서 얻는 미백, 보습 성분입니다. 아미노산과 코직산이 풍부하여 피부 톤을 밝게 하고 투명한 광채를 부여합니다.'
  },
  'juicy lips': {
    koreanName: '쥬시 립',
    description: '쥬시 립은 과즙처럼 촉촉하고 탱글한 입술 무드입니다. 글로시한 립글로스나 틴트로 물기 가득한 생기 있는 입술을 연출하며, 한국 메이크업 트렌드의 핵심입니다.'
  },
  'sun serum': {
    koreanName: '선세럼',
    description: '선세럼은 세럼처럼 가볍고 고기능성인 자외선차단제입니다. 스킨케어 성분이 함유되어 UV 차단과 피부 케어를 동시에 제공하며, 아침 루틴을 간소화합니다.'
  },
  'butter skin': {
    koreanName: '버터 스킨',
    description: '버터 스킨은 버터처럼 부드럽고 매끄러운 피부 질감을 의미합니다. 충분한 보습과 영양 공급으로 거칠고 건조한 피부를 촉촉하고 매끈한 피부로 만듭니다.'
  },
  'hair wellness': {
    koreanName: '헤어 웰니스',
    description: '헤어 웰니스는 모발과 두피의 전반적인 건강을 케어하는 홀리스틱 뷰티 트렌드입니다. 두피 케어, 영양 공급, 스트레스 관리를 통합하여 건강한 모발을 유지합니다.'
  },
  'aloe vera SPF': {
    koreanName: '알로에 베라 자외선차단',
    description: '알로에 베라가 함유된 자외선차단제는 UV 차단과 피부 진정을 동시에 제공합니다. 알로에의 쿨링 효과로 여름철 열감을 낮추고 자외선 자극을 완화합니다.'
  },
  'mist': {
    koreanName: '미스트',
    description: '미스트는 스프레이 형태로 피부에 수분을 공급하는 제품입니다. 메이크업 위에도 사용 가능하여 낮 동안 수분 보충과 세팅에 활용하며, 상쾌한 사용감이 특징입니다.'
  },
  'Mist': {
    koreanName: '미스트',
    description: '미스트는 스프레이 형태로 피부에 수분을 공급하는 제품입니다. 메이크업 위에도 사용 가능하여 낮 동안 수분 보충과 세팅에 활용하며, 상쾌한 사용감이 특징입니다.'
  },
  'outdoor active': {
    koreanName: '아웃도어 액티브',
    description: '아웃도어 액티브는 야외 활동에 최적화된 스킨케어 컨셉입니다. 땀과 물에 강한 워터프루프 선케어, 휴대 편리한 스틱 제형 등이 활동적인 라이프스타일을 지원합니다.'
  },
  'sensitive care': {
    koreanName: '민감성 케어',
    description: '민감성 케어는 자극에 쉽게 반응하는 민감한 피부를 위한 순한 스킨케어입니다. 무향, 저자극 포뮬러와 진정 성분으로 피부를 편안하게 케어합니다.'
  },
  'power clean': {
    koreanName: '파워 클린',
    description: '파워 클린은 강력한 세정력으로 노폐물을 확실하게 제거하는 클렌징입니다. 딥 클렌징, 모공 정화, 피지 제거에 효과적이며 지성 피부에 적합합니다.'
  },
  'smudge-proof': {
    koreanName: '번짐 방지',
    description: '스머지프루프는 땀, 유분, 습기에도 메이크업이 번지지 않는 기능입니다. 아이라이너, 마스카라, 립 제품에 적용되어 오랜 시간 깔끔한 메이크업을 유지합니다.'
  },
  'cleansing pad': {
    koreanName: '클렌징 패드',
    description: '클렌징 패드는 클렌징 성분이 함침된 패드로 닦아내는 방식의 세안 제품입니다. 물 없이 간편하게 메이크업과 노폐물을 제거할 수 있어 여행이나 캠핑에 유용합니다.'
  },
  'sun spray': {
    koreanName: '선스프레이',
    description: '선스프레이는 스프레이 형태의 자외선차단제입니다. 손에 묻히지 않고 넓은 면적에 빠르게 도포할 수 있어 바디와 헤어라인에 편리하게 사용할 수 있습니다.'
  },
  'soothing UV': {
    koreanName: '진정 자외선차단',
    description: '진정 자외선차단제는 UV 차단과 피부 진정을 동시에 제공합니다. 시카, 알로에 등 진정 성분이 자외선 자극을 완화하고 민감해진 피부를 케어합니다.'
  },
  'winter moisture': {
    koreanName: '겨울 보습',
    description: '윈터 모이스처는 건조한 겨울철 피부에 집중 수분을 공급하는 케어입니다. 두꺼운 크림, 오일, 밤 제형으로 수분 증발을 막고 피부 장벽을 보호합니다.'
  },
  'clean girl glow': {
    koreanName: '클린 걸 글로우',
    description: '클린 걸 글로우는 자연스럽고 건강한 광채 피부 메이크업 트렌드입니다. 미니멀한 메이크업에 글로우 스킨케어로 속광을 연출하여 세련되고 깨끗한 이미지를 만듭니다.'
  },
  'fixing spray': {
    koreanName: '픽싱 스프레이',
    description: '픽싱 스프레이(세팅 스프레이)는 메이크업 마무리 단계에서 뿌려 화장을 고정시키는 제품입니다. 메이크업 지속력을 높이고 가루날림과 무너짐을 방지합니다.'
  },
  'no-makeup look': {
    koreanName: '노메이크업 룩',
    description: '노메이크업 룩은 화장을 하지 않은 듯 자연스러운 메이크업 스타일입니다. 스킨케어로 피부 상태를 좋게 하고 최소한의 베이스와 립 제품으로 꾸민 듯 안 꾸민 듯 연출합니다.'
  },
  'body cream': {
    koreanName: '바디 크림',
    description: '바디 크림은 로션보다 농밀한 질감의 고보습 바디 케어 제품입니다. 건조한 팔꿈치, 무릎, 발뒤꿈치 등에 집중 보습을 제공하며 겨울철 필수 아이템입니다.'
  },
  'leave-in conditioner': {
    koreanName: '리브인 컨디셔너',
    description: '리브인 컨디셔너는 헹굼 없이 모발에 바르고 남겨두는 컨디셔닝 제품입니다. 모발을 부드럽게 하고 엉킴을 방지하며, 열 보호와 스타일링 베이스 역할을 합니다.'
  },
  'pH balancing': {
    koreanName: 'pH 균형',
    description: 'pH 밸런싱은 피부의 자연 pH(약산성)를 유지하거나 회복시키는 효과입니다. 세안 후 알칼리화된 피부를 정상 pH로 되돌려 피부 장벽 기능을 보호합니다.'
  },
  'tea tree scalp': {
    koreanName: '티트리 두피',
    description: '티트리 두피 케어는 티트리의 항균, 항염 효과를 두피에 적용한 제품입니다. 지성 두피의 피지와 비듬을 케어하고 가려움을 완화하여 상쾌한 두피 환경을 만듭니다.'
  },
  'buildable': {
    koreanName: '빌더블',
    description: '빌더블은 얇게 바르면 자연스럽고 겹쳐 바르면 커버력이 높아지는 특성입니다. 파운데이션, 블러쉬 등에 적용되어 상황에 따라 원하는 정도로 조절할 수 있습니다.'
  },
  'soft girl': {
    koreanName: '소프트 걸',
    description: '소프트 걸은 파스텔톤과 부드러운 핑크를 기반으로 한 사랑스러운 메이크업 무드입니다. 홍조 블러쉬, 글로시 립, 피치톤 아이섀도우로 부드럽고 여성스러운 이미지를 연출합니다.'
  },
  'gel moisturizer': {
    koreanName: '젤 모이스처라이저',
    description: '젤 모이스처라이저는 젤 제형의 가벼운 보습 제품입니다. 크림보다 산뜻하게 흡수되어 지성 피부나 여름철에 적합하며, 끈적임 없이 충분한 수분을 공급합니다.'
  },
  'jojoba oil tint': {
    koreanName: '호호바 오일 틴트',
    description: '호호바 오일 틴트는 호호바 오일이 함유된 촉촉한 립 틴트입니다. 자연스러운 발색과 함께 입술에 영양을 공급하여 건조함 없이 오래 지속되는 립 컬러를 제공합니다.'
  },
  'dark circles': {
    koreanName: '다크서클',
    description: '다크서클은 눈 밑에 생기는 어두운 그림자로, 피로, 유전, 색소침착이 원인입니다. 비타민 C, 레티놀, 카페인이 함유된 아이크림으로 개선하며, 컨실러로 커버할 수 있습니다.'
  },
  'Dark Circles': {
    koreanName: '다크서클',
    description: '다크서클은 눈 밑에 생기는 어두운 그림자로, 피로, 유전, 색소침착이 원인입니다. 비타민 C, 레티놀, 카페인이 함유된 아이크림으로 개선하며, 컨실러로 커버할 수 있습니다.'
  },
  'eye cream': {
    koreanName: '아이크림',
    description: '아이크림은 눈가의 얇고 민감한 피부를 위한 전용 케어 제품입니다. 다크서클, 주름, 붓기 등 눈가 고민을 개선하며, 부드러운 제형으로 자극 없이 사용합니다.'
  },
  'anti-acne': {
    koreanName: '안티 아크네',
    description: '안티 아크네는 여드름을 예방하고 치료하는 스킨케어 효과입니다. 살리실산, 벤조일 퍼옥사이드, 티트리 등이 여드름균을 억제하고 피지를 조절합니다.'
  },
  'treatment': {
    koreanName: '트리트먼트',
    description: '트리트먼트는 특정 피부 고민을 집중적으로 케어하는 고기능성 제품입니다. 여드름, 미백, 주름 등 목표에 따라 활성 성분을 고농축으로 함유하여 효과를 극대화합니다.'
  },
  'antioxidant': {
    koreanName: '항산화',
    description: '항산화는 활성산소로 인한 피부 손상과 노화를 방지하는 효과입니다. 비타민 C, E, 녹차, 레스베라트롤 등이 자유라디칼을 중화하여 피부를 보호합니다.'
  },
  'Antioxidants': {
    koreanName: '항산화제',
    description: '항산화제는 피부를 산화 스트레스로부터 보호하는 성분입니다. 환경 오염, 자외선, 스트레스로 인한 피부 손상을 방지하고 젊고 건강한 피부를 유지합니다.'
  },
  'Acne Control': {
    koreanName: '여드름 케어',
    description: '여드름 케어는 여드름의 원인인 피지, 각질, 세균을 타깃으로 하는 스킨케어입니다. BHA, 티트리, 징크 등의 성분이 모공을 정화하고 트러블을 예방합니다.'
  },
  'water-resistant': {
    koreanName: '워터 레지스턴트',
    description: '워터 레지스턴트는 물에 닿아도 쉽게 지워지지 않는 내수성 기능입니다. 수영, 운동, 여름철에 선크림과 메이크업이 오래 유지되도록 합니다.'
  },
  'brow gel': {
    koreanName: '브로우 젤',
    description: '브로우 젤은 눈썹을 정돈하고 고정시키는 아이브로우 제품입니다. 투명 젤과 컬러 젤이 있으며, 눈썹 결을 자연스럽게 세우고 하루 종일 흐트러짐 없이 유지합니다.'
  }
};

async function addFinalDescriptions() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  await client.connect();
  const db = client.db('amore');

  console.log('최종 키워드 설명 추가...\n');

  let updatedCount = 0;

  for (const [keyword, data] of Object.entries(keywordDescriptions)) {
    const result = await db.collection('processed_keywords').updateMany(
      { keyword: { $regex: new RegExp(`^${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
      {
        $set: {
          description: data.description,
          koreanName: data.koreanName
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ "${keyword}": ${result.modifiedCount}개 업데이트`);
      updatedCount += result.modifiedCount;
    }
  }

  console.log(`\n업데이트: ${updatedCount}개`);

  // 최종 통계
  const total = await db.collection('processed_keywords').countDocuments({});
  const withDesc = await db.collection('processed_keywords').countDocuments({
    description: { $exists: true, $ne: null, $ne: '' }
  });

  // 고점수(70+) 키워드 커버리지
  const highScoreTotal = await db.collection('processed_keywords').countDocuments({ score: { $gte: 70 } });
  const highScoreWithDesc = await db.collection('processed_keywords').countDocuments({
    score: { $gte: 70 },
    description: { $exists: true, $ne: null, $ne: '' }
  });

  console.log(`\n===== 최종 현황 =====`);
  console.log(`전체 키워드: ${total}개`);
  console.log(`설명 있음: ${withDesc}개 (${Math.round(withDesc/total*100)}%)`);
  console.log(`\n고점수(70+) 키워드: ${highScoreTotal}개`);
  console.log(`고점수 설명 있음: ${highScoreWithDesc}개 (${Math.round(highScoreWithDesc/highScoreTotal*100)}%)`);

  await client.close();
}

addFinalDescriptions().catch(console.error);
