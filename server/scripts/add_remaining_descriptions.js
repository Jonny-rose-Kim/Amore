/**
 * 나머지 키워드 설명 추가 스크립트
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const keywordDescriptions = {
  // 추가 키워드 설명
  'moisture UV': {
    koreanName: '보습 자외선차단',
    description: '보습 자외선차단은 UV 차단과 피부 수분 공급을 동시에 제공하는 선케어 제품입니다. 건조함 없이 촉촉하게 마무리되어 건성 피부에 적합하며, 메이크업 베이스로도 활용 가능합니다.'
  },
  'whitening': {
    koreanName: '미백',
    description: '미백은 피부 톤을 밝게 하고 기미, 잡티 등 색소침착을 개선하는 기능성 화장품 효과입니다. 비타민 C, 나이아신아마이드, 알부틴 등의 성분이 멜라닌 생성을 억제합니다.'
  },
  'PDRN': {
    koreanName: 'PDRN',
    description: 'PDRN(폴리디옥시리보뉴클레오타이드)은 연어에서 추출한 DNA 조각으로, 피부 재생과 상처 치유를 촉진하는 성분입니다. 피부과 시술에서 유래하여 화장품으로 확장된 안티에이징 트렌드 성분입니다.'
  },
  'skin softening': {
    koreanName: '피부 연화',
    description: '피부 연화는 거칠고 건조한 피부를 부드럽고 매끄럽게 만드는 효과입니다. 각질 제거와 보습 성분이 피부 결을 정돈하고 촉감을 개선합니다.'
  },
  'clean sun care': {
    koreanName: '클린 선케어',
    description: '클린 선케어는 유해 성분을 배제하고 피부와 환경에 안전한 성분으로 만든 자외선차단제입니다. 산호초에 무해한 리프 세이프 제품, 비건 포뮬러 등이 포함됩니다.'
  },
  'skin flooding': {
    koreanName: '스킨 플러딩',
    description: '스킨 플러딩은 젖은 피부에 여러 겹의 수분 제품을 바르는 K-뷰티 보습 기법입니다. 히알루론산 제품을 촉촉한 상태에서 층층이 바르면 수분 흡수가 극대화됩니다.'
  },
  'color payoff': {
    koreanName: '발색력',
    description: '컬러 페이오프는 색조 화장품이 피부에 얼마나 선명하고 풍부하게 발색되는지를 나타냅니다. 높은 발색력은 한 번에 원하는 컬러를 표현할 수 있어 메이크업 완성도를 높입니다.'
  },
  'full coverage': {
    koreanName: '풀 커버리지',
    description: '풀 커버리지는 잡티, 홍조, 다크서클 등 피부 결점을 완벽하게 가리는 높은 수준의 커버력입니다. 특별한 날이나 피부 고민이 많을 때 선택하는 베이스 메이크업 타입입니다.'
  },
  'silk amino acids': {
    koreanName: '실크 아미노산',
    description: '실크 아미노산은 누에고치에서 추출한 천연 단백질 성분입니다. 피부와 모발에 윤기와 부드러움을 부여하며, 보습막을 형성하여 수분 손실을 방지합니다.'
  },
  'dad skincare': {
    koreanName: '아빠 스킨케어',
    description: '아빠 스킨케어는 중장년 남성을 위한 간편하면서도 효과적인 스킨케어 트렌드입니다. 복잡한 단계 없이 올인원 제품으로 피부 관리를 시작하는 남성 뷰티 입문 컨셉입니다.'
  },
  'glass skin SPF': {
    koreanName: '글래스 스킨 자외선차단',
    description: '글래스 스킨 SPF는 유리알처럼 투명하고 광채나는 피부를 연출하면서 UV를 차단하는 선케어입니다. 글로우 피니쉬로 K-뷰티 글래스 스킨 트렌드를 완성합니다.'
  },
  'micellar water': {
    koreanName: '미셀라 워터',
    description: '미셀라 워터는 미셀(마이셀) 입자가 노폐물과 메이크업을 부드럽게 제거하는 클렌징 워터입니다. 물로 헹굴 필요 없이 화장솜으로 닦아내어 간편하게 사용할 수 있습니다.'
  },
  'clean girl': {
    koreanName: '클린 걸',
    description: '클린 걸은 자연스럽고 건강한 노메이크업 메이크업 트렌드입니다. 글로우 피부, 브러시드 업 눈썹, 립밤 정도의 미니멀한 메이크업으로 세련된 무드를 연출합니다.'
  },
  'minimal cleanse': {
    koreanName: '미니멀 클렌징',
    description: '미니멀 클렌징은 피부에 부담을 주지 않는 순한 세안법입니다. 저자극 세안제로 필요한 만큼만 세정하여 피부 장벽을 보호하고, 과도한 세안으로 인한 건조함을 방지합니다.'
  },
  'sebum control SPF': {
    koreanName: '피지조절 자외선차단',
    description: '피지조절 자외선차단제는 UV 차단과 함께 피지를 흡착하여 번들거림을 방지합니다. 지성 피부에 적합하며, 매트한 마무리감으로 메이크업 지속력을 높여줍니다.'
  },
  'body wash': {
    koreanName: '바디워시',
    description: '바디워시는 샤워 시 몸을 세정하는 액체형 세정제입니다. 비누보다 거품이 풍부하고 보습 성분이 함유되어 샤워 후에도 피부가 건조하지 않습니다. 다양한 향으로 아로마테라피 효과도 있습니다.'
  },
  'spa at home': {
    koreanName: '홈스파',
    description: '홈스파는 집에서 스파 수준의 프리미엄 케어를 즐기는 셀프 뷰티 트렌드입니다. 시트 마스크, 바스 솔트, 페이스 마사지 등으로 휴식과 피부 관리를 동시에 누립니다.'
  },
  'sebum control': {
    koreanName: '피지 조절',
    description: '피지 조절은 과도한 피지 분비를 억제하여 번들거림과 모공 확대를 예방하는 효과입니다. 나이아신아마이드, 징크, BHA 등의 성분이 피지선 활동을 조절합니다.'
  },
  'camellia oil': {
    koreanName: '동백유/카멜리아 오일',
    description: '카멜리아 오일(동백 오일)은 올레산이 풍부한 고급 식물성 오일입니다. 피부와 모발에 깊은 영양을 공급하고 윤기를 부여하며, 일본과 한국에서 전통적으로 사용해온 미용 오일입니다.'
  },
  'gel cream': {
    koreanName: '젤 크림',
    description: '젤 크림은 젤의 가벼움과 크림의 보습력을 결합한 제형입니다. 빠르게 흡수되어 끈적임 없이 촉촉하게 마무리되며, 지성~복합성 피부에 적합한 보습 제품입니다.'
  },
  'skinimalism': {
    koreanName: '스키니멀리즘',
    description: '스키니멀리즘은 스킨케어 + 미니멀리즘의 합성어로, 적은 제품으로 효과적인 스킨케어를 추구하는 트렌드입니다. 다기능 제품과 간소화된 루틴으로 시간과 비용을 절약합니다.'
  },
  'foam': {
    koreanName: '폼/거품',
    description: '폼 제형은 풍성한 거품으로 피부를 부드럽게 세정하는 클렌징 타입입니다. 거품이 노폐물을 감싸 피부 자극 없이 깨끗하게 씻어내며, 한국에서 가장 대중적인 세안 방식입니다.'
  },
  'Foam': {
    koreanName: '폼/거품',
    description: '폼 제형은 풍성한 거품으로 피부를 부드럽게 세정하는 클렌징 타입입니다. 거품이 노폐물을 감싸 피부 자극 없이 깨끗하게 씻어내며, 한국에서 가장 대중적인 세안 방식입니다.'
  },
  'low pH': {
    koreanName: '약산성',
    description: '약산성(Low pH)은 피부의 자연 pH(4.5~5.5)에 가까운 제품을 의미합니다. 피부 장벽을 보호하고 자극을 최소화하여 민감성 피부에도 적합한 순한 세안제의 기준입니다.'
  },
  'frizz control': {
    koreanName: '곱슬머리 정돈',
    description: '프리즈 컨트롤은 부스스하고 뻗치는 모발을 매끄럽게 정돈하는 효과입니다. 실리콘, 오일, 케라틴 성분이 큐티클을 코팅하여 습기에도 모발이 부풀지 않게 합니다.'
  },
  'glazed donut skin': {
    koreanName: '글레이즈드 도넛 피부',
    description: '글레이즈드 도넛 스킨은 도넛 위 글레이즈처럼 윤기 나고 촉촉한 피부 트렌드입니다. 수분 공급과 하이라이터로 피부에 건강한 광택을 더하는 서양 버전의 글로우 피부입니다.'
  },
  'rice + probiotics': {
    koreanName: '쌀 + 프로바이오틱스',
    description: '쌀과 프로바이오틱스의 조합은 전통 성분과 최신 과학을 결합한 K-뷰티 트렌드입니다. 쌀 발효물이 피부를 밝게 하고, 프로바이오틱스가 피부 마이크로바이옴 균형을 유지합니다.'
  },
  'Gel': {
    koreanName: '젤',
    description: '젤 제형은 수분 함량이 높고 가벼운 수용성 화장품입니다. 끈적임 없이 빠르게 흡수되어 지성 피부와 여름철에 선호됩니다. 클렌저, 모이스처라이저, 선크림 등 다양한 제품에 적용됩니다.'
  },
  'sweat-proof': {
    koreanName: '땀에 강한',
    description: '스웻프루프는 땀이 나도 메이크업이나 선크림이 흘러내리지 않는 기능입니다. 운동이나 야외 활동 시 필수적이며, 특수 피막 형성 기술로 지속력을 높인 제품들입니다.'
  },
  'Patch': {
    koreanName: '패치',
    description: '패치는 피부에 직접 붙여 사용하는 국소 케어 제품입니다. 여드름 패치, 아이 패치, 마이크로니들 패치 등이 있으며, 활성 성분을 집중적으로 전달하여 부분 케어에 효과적입니다.'
  },
  'cleansing oil': {
    koreanName: '클렌징 오일',
    description: '클렌징 오일은 오일이 오일을 녹이는 원리로 메이크업과 선크림을 효과적으로 제거합니다. 물과 만나면 유화되어 깔끔하게 씻기며, 더블 클렌징의 첫 번째 단계로 사용됩니다.'
  },
  'Cleansing Oil': {
    koreanName: '클렌징 오일',
    description: '클렌징 오일은 오일이 오일을 녹이는 원리로 메이크업과 선크림을 효과적으로 제거합니다. 물과 만나면 유화되어 깔끔하게 씻기며, 더블 클렌징의 첫 번째 단계로 사용됩니다.'
  },
  'cleansing balm': {
    koreanName: '클렌징 밤',
    description: '클렌징 밤은 고체 오일이 체온에 녹아 메이크업을 녹이는 클렌저입니다. 클렌징 오일보다 휴대가 편리하고 흘러내리지 않아 사용하기 쉽습니다. 더블 클렌징의 1단계로 인기 있습니다.'
  },
  'Cleansing Balm': {
    koreanName: '클렌징 밤',
    description: '클렌징 밤은 고체 오일이 체온에 녹아 메이크업을 녹이는 클렌저입니다. 클렌징 오일보다 휴대가 편리하고 흘러내리지 않아 사용하기 쉽습니다. 더블 클렌징의 1단계로 인기 있습니다.'
  },
  'oil serum': {
    koreanName: '오일 세럼',
    description: '오일 세럼은 세럼의 고농축 효과와 오일의 영양 공급을 결합한 제품입니다. 피부에 빠르게 흡수되면서 윤기와 영양을 동시에 제공하며, 건성 피부의 안티에이징 케어에 효과적입니다.'
  },
  'toner pad': {
    koreanName: '토너 패드',
    description: '토너 패드는 토너가 함침된 원형 패드로, 닦아내면서 토너를 바르는 편리한 스킨케어 제품입니다. 각질 제거, 진정, 보습 등 다양한 기능의 패드가 있으며, K-뷰티에서 크게 인기를 얻고 있습니다.'
  },
  'pore care': {
    koreanName: '모공 케어',
    description: '모공 케어는 넓어진 모공을 최소화하고 피지와 블랙헤드를 관리하는 스킨케어입니다. BHA, 나이아신아마이드, 클레이 등이 모공을 깨끗하게 하고 타이트닝 효과를 제공합니다.'
  },
  'hair mask': {
    koreanName: '헤어 마스크',
    description: '헤어 마스크는 손상된 모발에 집중적인 영양과 수분을 공급하는 딥 트리트먼트 제품입니다. 주 1-2회 사용하며, 헤어팩보다 농축된 성분이 모발을 보수하고 윤기를 더합니다.'
  },
  'scalp care': {
    koreanName: '두피 케어',
    description: '스칼프 케어는 건강한 모발의 기초인 두피를 관리하는 헤어 케어 트렌드입니다. 두피 스크럽, 토닉, 세럼 등으로 각질과 피지를 제거하고, 두피 환경을 개선하여 탈모를 예방합니다.'
  },
  'anti-hair loss': {
    koreanName: '탈모 케어',
    description: '안티 헤어로스는 탈모를 예방하고 모발 성장을 촉진하는 헤어 케어입니다. 카페인, 비오틴, 미녹시딜 등의 성분이 두피 혈액순환을 촉진하고 모근을 강화합니다.'
  },
  'peeling gel': {
    koreanName: '필링 젤',
    description: '필링 젤은 피부 위에서 문지르면 각질이 뭉쳐 나오는 젤 타입 각질 제거 제품입니다. 물리적, 화학적 각질 제거가 동시에 일어나며, 부드럽게 피부 결을 정돈합니다.'
  },
  'tone-up': {
    koreanName: '톤업',
    description: '톤업은 피부 톤을 한 단계 밝게 보이게 하는 효과입니다. 자외선차단제, 프라이머, 크림 등에 적용되어 화사한 피부 톤을 연출합니다. 핑크, 라벤더 등 보색 효과를 활용합니다.'
  },
  'setting powder': {
    koreanName: '세팅 파우더',
    description: '세팅 파우더는 메이크업 마무리 단계에서 화장을 고정하고 유분기를 잡아주는 파우더입니다. 루스 파우더와 프레스드 파우더가 있으며, 메이크업 지속력을 높이고 매트한 피부를 유지합니다.'
  },
  'lip oil': {
    koreanName: '립 오일',
    description: '립 오일은 입술에 영양과 윤기를 공급하는 오일 타입 립 제품입니다. 립글로스보다 끈적임이 적고 립밤보다 가벼우며, 틴티드 립 오일은 발색과 보습을 동시에 제공합니다.'
  },
  'emulsion': {
    koreanName: '에멀전/유액',
    description: '에멀전은 토너와 크림 사이의 가벼운 보습 제품입니다. 로션보다 수분감이 많고 크림보다 가벼워, 지성~복합성 피부나 여름철에 크림 대신 사용하기 적합합니다.'
  },
  'vitamin E': {
    koreanName: '비타민 E',
    description: '비타민 E(토코페롤)는 강력한 항산화 작용으로 피부를 보호하는 성분입니다. 자외선과 환경 오염으로부터 피부를 방어하고, 보습 효과도 있어 건조한 피부를 케어합니다.'
  },
  'argan oil': {
    koreanName: '아르간 오일',
    description: '아르간 오일은 모로코 원산의 고급 식물성 오일입니다. 비타민 E와 지방산이 풍부하여 피부와 모발에 깊은 영양을 공급합니다. 특히 건조하고 손상된 모발 케어에 효과적입니다.'
  },
  'biotin': {
    koreanName: '비오틴',
    description: '비오틴(비타민 B7)은 모발, 피부, 손톱 건강에 필수적인 비타민입니다. 케라틴 생성을 돕고 모발 성장을 촉진하여 탈모 예방과 모발 강화에 효과적입니다.'
  },
  'keratin': {
    koreanName: '케라틴',
    description: '케라틴은 모발과 손톱을 구성하는 핵심 단백질입니다. 손상된 모발의 빈 부분을 채워 강도와 탄력을 회복시키며, 케라틴 트리트먼트는 곱슬머리를 매끄럽게 펴주는 시술로도 유명합니다.'
  },
  'galactomyces': {
    koreanName: '갈락토미세스',
    description: '갈락토미세스는 효모 발효 여과물로, SK-II 피테라로 유명해진 성분입니다. 피부 톤을 밝게 하고 피부결을 정돈하며, 수분 공급과 피부 재생에 도움을 줍니다.'
  },
  'bifida': {
    koreanName: '비피다',
    description: '비피다는 비피더스균 발효물로, 피부 장벽 강화와 면역력 증진에 효과적인 성분입니다. 에스티로더의 시그니처 성분으로 유명하며, 피부 자생력을 높이고 노화를 방지합니다.'
  },
  'propolis': {
    koreanName: '프로폴리스',
    description: '프로폴리스는 꿀벌이 만드는 천연 항균 물질입니다. 항염, 항균, 보습 효과가 뛰어나 트러블 피부와 민감성 피부 케어에 효과적입니다. 꿀, 로열젤리와 함께 비 스킨케어 트렌드의 핵심입니다.'
  },
  'madecassoside': {
    koreanName: '마데카소사이드',
    description: '마데카소사이드는 센텔라(병풀)에서 추출한 핵심 진정 성분입니다. 피부 재생을 촉진하고 염증을 완화하여 트러블, 홍조, 시술 후 피부 진정에 효과적입니다. 시카 화장품의 주성분입니다.'
  },
  'snail mucin': {
    koreanName: '달팽이 뮤신',
    description: '달팽이 뮤신은 달팽이 점액에서 추출한 K-뷰티 시그니처 성분입니다. 피부 재생, 보습, 진정 효과가 뛰어나 손상된 피부를 회복시키고 탄력을 부여합니다. 에센스, 크림 등 다양한 제품에 활용됩니다.'
  },
  'tranexamic acid': {
    koreanName: '트라넥사믹애시드',
    description: '트라넥사믹애시드는 기미와 색소침착 개선에 효과적인 미백 성분입니다. 멜라닌 전달을 차단하여 피부 톤을 균일하게 정돈합니다. 일본에서 의약품으로 먼저 사용되어 효과가 입증되었습니다.'
  },
  'alpha arbutin': {
    koreanName: '알파 알부틴',
    description: '알파 알부틴은 식물에서 추출한 미백 성분으로, 하이드로퀴논보다 안전하면서 효과적입니다. 멜라닌 생성을 억제하여 기미, 잡티를 개선하고 피부 톤을 밝게 합니다.'
  },
  'licorice': {
    koreanName: '감초',
    description: '감초 추출물은 글라브리딘 성분이 미백과 진정 효과를 제공합니다. 멜라닌 생성을 억제하고 피부를 밝게 하며, 항염 효과로 민감한 피부를 진정시킵니다.'
  },
  'jojoba': {
    koreanName: '호호바',
    description: '호호바 오일은 인체 피지와 유사한 구조의 식물성 왁스입니다. 모공을 막지 않으면서 피부에 보습막을 형성하고, 모든 피부 타입에 사용 가능한 저자극 오일입니다.'
  },
  'glycerin': {
    koreanName: '글리세린',
    description: '글리세린은 공기 중 수분을 끌어당기는 휴멕턴트로, 가장 기본적이면서 효과적인 보습 성분입니다. 피부에 수분을 공급하고 유지시키며, 거의 모든 스킨케어 제품에 함유되어 있습니다.'
  },
  'caffeine': {
    koreanName: '카페인',
    description: '카페인은 혈액순환을 촉진하고 부기를 빼는 효과가 있는 성분입니다. 눈가 다크서클, 아이백 개선에 효과적이며, 셀룰라이트 케어 바디 제품에도 활용됩니다.'
  },
  'organic': {
    koreanName: '유기농',
    description: '유기농 화장품은 화학 농약이나 비료 없이 재배한 원료로 만든 제품입니다. 피부와 환경에 순한 성분을 선호하는 소비자들에게 인기 있으며, 클린 뷰티 트렌드의 핵심입니다.'
  },
  'vegan': {
    koreanName: '비건',
    description: '비건 화장품은 동물성 원료를 사용하지 않고, 동물 실험을 하지 않은 제품입니다. 윤리적 소비와 환경 보호를 중시하는 소비자 트렌드에 맞춰 성장하고 있습니다.'
  },
  'eco-friendly': {
    koreanName: '친환경',
    description: '친환경 화장품은 환경에 미치는 영향을 최소화한 제품입니다. 생분해성 포장, 리필 가능 용기, 지속가능한 원료 사용 등 환경을 고려한 요소를 포함합니다.'
  },
  'reef-safe': {
    koreanName: '산호초 안전',
    description: '리프 세이프는 산호초에 해를 끼치지 않는 자외선차단제를 의미합니다. 옥시벤존, 옥티녹세이트 등 해양 생태계에 유해한 화학 필터를 배제한 친환경 선케어입니다.'
  },
  'hand cream': {
    koreanName: '핸드크림',
    description: '핸드크림은 손 피부에 보습과 영양을 공급하는 제품입니다. 잦은 손 씻기와 외부 환경으로 거칠어진 손을 촉촉하고 부드럽게 케어합니다. 다양한 향과 휴대성으로 인기 있습니다.'
  },
  'body serum': {
    koreanName: '바디 세럼',
    description: '바디 세럼은 얼굴 세럼처럼 고농축 성분을 바디에 적용한 제품입니다. 보습, 탄력, 화이트닝 등 기능성 성분이 몸 피부에도 집중 케어 효과를 제공합니다.'
  },
  'body scrub': {
    koreanName: '바디 스크럽',
    description: '바디 스크럽은 몸의 각질을 제거하고 피부 결을 매끄럽게 정돈하는 제품입니다. 설탕, 소금, 커피 등의 스크럽 입자가 노폐물을 제거하고 혈액순환을 촉진합니다.'
  },
  'exosomes': {
    koreanName: '엑소좀',
    description: '엑소좀은 세포 간 신호 전달 물질을 담은 나노 입자로, 차세대 안티에이징 성분입니다. 피부 재생과 회복을 촉진하며, 줄기세포 유래 엑소좀이 특히 주목받고 있습니다.'
  },
  'exfoliating': {
    koreanName: '각질 제거',
    description: '각질 제거(엑스폴리에이팅)는 피부 표면의 죽은 세포를 제거하여 피부결을 매끄럽게 하는 과정입니다. AHA, BHA 화학적 각질 제거와 스크럽 물리적 각질 제거로 나뉩니다.'
  },
  'anti-pollution': {
    koreanName: '안티폴루션',
    description: '안티폴루션은 미세먼지, 대기오염 물질로부터 피부를 보호하는 효과입니다. 항산화 성분과 보호막 형성 성분이 외부 오염물질의 피부 침투를 차단합니다.'
  },
  'overnight repair': {
    koreanName: '오버나이트 리페어',
    description: '오버나이트 리페어는 수면 중 피부 재생을 극대화하는 나이트 케어입니다. 잠자는 동안 세포 재생이 활발해지는 점을 활용하여 레티놀, 펩타이드 등 활성 성분을 집중 공급합니다.'
  },
  'sleep mask': {
    koreanName: '수면 마스크/슬리핑 팩',
    description: '슬리핑 마스크(수면팩)는 밤새 피부에 두고 자는 워시오프 불필요 마스크입니다. 수분과 영양을 집중 공급하고, 다음 날 아침 촉촉하고 탄력있는 피부로 깨어납니다.'
  },
  'blackhead removal': {
    koreanName: '블랙헤드 제거',
    description: '블랙헤드 제거는 모공에 쌓인 피지와 각질이 산화된 블랙헤드를 제거하는 케어입니다. BHA, 클레이 마스크, 코팩 등이 모공을 정화하고 깨끗하게 유지합니다.'
  },
  'pore minimizing': {
    koreanName: '모공 축소',
    description: '모공 미니마이징은 넓어진 모공을 작고 덜 눈에 띄게 하는 효과입니다. 나이아신아마이드, 레티놀 등이 피지 분비를 조절하고 피부 탄력을 높여 모공 크기를 개선합니다.'
  },
  'lifting': {
    koreanName: '리프팅',
    description: '리프팅은 처진 피부를 끌어올려 탄력있고 젊은 인상을 만드는 효과입니다. 펩타이드, DMAE, 콜라겐 부스팅 성분이 피부를 탄탄하게 하고 윤곽을 정돈합니다.'
  },
  'plumping': {
    koreanName: '플럼핑',
    description: '플럼핑은 피부에 볼륨감과 탄력을 부여하여 통통하고 건강해 보이게 하는 효과입니다. 히알루론산, 펩타이드 등이 피부 속부터 채워주어 주름을 완화하고 생기를 더합니다.'
  },
  'healing': {
    koreanName: '힐링/회복',
    description: '힐링은 손상되거나 자극받은 피부를 빠르게 회복시키는 효과입니다. 시카, 판테놀, 마데카소사이드 등의 성분이 피부 재생을 촉진하고 상처 치유를 돕습니다.'
  },
  'purifying': {
    koreanName: '정화',
    description: '퓨리파잉은 피부 속 불순물과 노폐물을 제거하여 맑고 깨끗한 피부로 만드는 효과입니다. 클레이, 차콜, 그린티 등이 모공을 정화하고 피부를 맑게 합니다.'
  },
  'clarifying': {
    koreanName: '투명하게',
    description: '클래리파잉은 피부 톤을 맑고 투명하게 개선하는 효과입니다. 각질 제거와 미백 성분이 칙칙함을 개선하고 맑은 피부 톤을 연출합니다.'
  },
  'smoothing': {
    koreanName: '매끄럽게',
    description: '스무딩은 피부 결을 매끄럽고 균일하게 정돈하는 효과입니다. 각질 제거, 모공 케어, 실리콘 프라이머 등이 요철을 메우고 부드러운 피부 표면을 만듭니다.'
  },
  'firming': {
    koreanName: '탄력 강화',
    description: '퍼밍은 늘어진 피부에 탄력을 부여하여 탄탄하고 젊은 피부로 만드는 효과입니다. 펩타이드, 레티놀, 콜라겐 부스팅 성분이 피부 구조를 강화합니다.'
  },
  'nourishing': {
    koreanName: '영양 공급',
    description: '너리싱은 피부에 필수 영양분을 공급하여 건강하고 생기 있게 만드는 효과입니다. 비타민, 미네랄, 오일 성분이 피부에 영양을 채워 활력을 불어넣습니다.'
  }
};

async function addRemainingDescriptions() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  await client.connect();
  const db = client.db('amore');

  console.log('나머지 키워드 설명 추가 시작...\n');

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

  console.log(`\n===== 완료 =====`);
  console.log(`업데이트된 문서: ${updatedCount}개`);

  // 최종 확인
  const total = await db.collection('processed_keywords').countDocuments({});
  const withDesc = await db.collection('processed_keywords').countDocuments({
    description: { $exists: true, $ne: null, $ne: '' }
  });

  console.log(`\n전체 키워드: ${total}개`);
  console.log(`설명 있음: ${withDesc}개 (${Math.round(withDesc/total*100)}%)`);
  console.log(`설명 없음: ${total - withDesc}개`);

  await client.close();
}

addRemainingDescriptions().catch(console.error);
