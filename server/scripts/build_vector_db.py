"""
K-Beauty RAG Vector DB Builder
실제 웹 뉴스/기사 기반 벡터 DB 구축
- sentence-transformers로 임베딩
- ChromaDB에 벡터 저장
- 3개 컬렉션: marketing, npd, overseas (각 10건)
"""

import os
import json
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

# ChromaDB 저장 경로
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'vector_db')
os.makedirs(CHROMA_DB_PATH, exist_ok=True)

print("Loading embedding model (multilingual)...")
# 다국어 지원 모델 사용 (한국어+영어)
embed_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
print("Embedding model loaded!")

# ==================== 마케팅 캠페인 뉴스 데이터 (10건) ====================
marketing_news = [
    {
        "id": "mkt_001",
        "title": "COSRX TikTok 바이럴 전략: 스네일 뮤신이 아마존 1위가 된 비결",
        "source": "Cosmetics & Toiletries, Business of Fashion",
        "category": "Skincare",
        "keywords": ["COSRX", "TikTok", "viral", "snail mucin", "influencer", "Amazon"],
        "content": """COSRX의 Advanced Snail 96 Mucin Power Essence는 TikTok에서 바이럴되며 아마존 뷰티 카테고리 1위를 달성했다. 핵심 전략은 수천 명의 마이크로 인플루언서에게 제품을 대량 배포하는 '매스 기프팅' 방식이었다. 스네일 뮤신의 독특한 점성 텍스처가 ASMR 컨텐츠로 자연스럽게 퍼지며, #CosRX 해시태그는 20억 뷰를 돌파했다. 2024년 3월에는 #PatThePeptide 캠페인을 론칭하여 4900만 뷰를 기록했고, 이후 Peptide Collagen Hydrogel Eye Patch가 TikTok Shop 아이 트리트먼트 1위에 올랐다. 크리에이터 Mikayla Nogueira의 제품 소개 영상은 5일 만에 1200만 조회수를 달성했다. COSRX는 e-커머스 매출의 72%를 아마존에서 발생시키며, Q3 2025 기준 분기 평균 +182% 성장률을 유지하고 있다. 이 사례는 '정통 인플루언서 리뷰 + ASMR 텍스처 바이럴 + 아마존 연동'이라는 삼각 구조의 성공을 보여준다.""",
        "visual_mood": "ASMR 텍스처 클로즈업, 투명한 점액질 텍스처의 만족스러운 비주얼, 미니멀 화이트 패키징",
        "strategy_type": "social_viral",
        "country": "usa"
    },
    {
        "id": "mkt_002",
        "title": "Laneige 립 슬리핑 마스크: ASMR + 셀럽 앰배서더의 시너지",
        "source": "Pepper Agency, BoF",
        "category": "Skincare",
        "keywords": ["Laneige", "lip mask", "ASMR", "Sydney Sweeney", "Sephora", "celebrity"],
        "content": """Laneige 립 슬리핑 마스크는 미국 시장에서 두자릿수 성장을 기록하며 Sephora 립케어 카테고리 1위를 달성했다. 핵심 마케팅 전략은 세 가지다. 첫째, 유포리아 배우 Sydney Sweeney를 브랜드 앰배서더로 발탁하여 셀럽 영향력을 극대화했다. 둘째, ASMR 제품 비디오를 통해 TikTok에서 자연스러운 바이럴을 유도했다. 셋째, '수면 중 립케어'라는 새로운 뷰티 루틴 카테고리를 창출하는 교육적 마케팅을 전개했다. 모회사 아모레퍼시픽은 데이터 기반 개인화 마케팅에 대규모 투자를 하며, 얼굴 스캐닝과 기후 데이터를 활용한 맞춤형 루틴 추천 시스템을 구축했다. Laneige의 Water Bank 라인은 '물과 피부의 깊은 연결'이라는 감성적 스토리텔링으로 하이드레이션 시장에서 차별화를 이뤄냈다.""",
        "visual_mood": "소프트 블루/핑크 그라데이션, 프로스티드 텍스처, 밤 시간대의 고급스러운 분위기",
        "strategy_type": "celebrity_endorsement",
        "country": "usa"
    },
    {
        "id": "mkt_003",
        "title": "TIRTIR 마스크핏 쿠션: 30 쉐이드 인클루시브 전략으로 TikTok 5000만 뷰 달성",
        "source": "BoF, Retailboss",
        "category": "Makeup",
        "keywords": ["TIRTIR", "cushion", "inclusive", "shade range", "TikTok", "Ulta Beauty"],
        "content": """TIRTIR의 마스크핏 레드 쿠션은 다양한 피부톤을 위한 30개 쉐이드를 제공하며 TikTok에서 5000만 이상의 조회수를 기록했다. 어두운 피부톤을 위한 쉐이드 개발이 바이럴의 핵심 포인트였다. 이 전략은 K-뷰티 최초의 인클루시브 쿠션 파운데이션으로 브랜드를 포지셔닝했다. 2025년 8월, TIRTIR는 K-뷰티 브랜드 최초로 Ulta Beauty의 프레스티지 존에 입점했다. CEO 안병준은 "K-컬처 - PSY, BTS, 기생충 - 이 우리의 길을 열어주었다"고 언급했다. 모회사 Goodai Global은 2024년 6억7600만 달러 매출에서 2025년 12억 달러 매출을 전망하며, 31억 달러 기업가치의 6억 달러 PE 투자를 유치했다. 마스크 프루프 기술과 인클루시브한 쉐이드 레인지의 결합이 미국 컴플렉션 시장에서 유의미한 점유율을 확보하게 했다.""",
        "visual_mood": "다양한 피부톤 모델, 레드 패키징의 강렬한 비주얼, 쿠션 텍스처 클로즈업",
        "strategy_type": "inclusive_marketing",
        "country": "usa"
    },
    {
        "id": "mkt_004",
        "title": "K-뷰티 패키징 디자인: 미니멀 엘레건스와 플레이풀의 이중 전략",
        "source": "Red Dot Design Award, CWay Software",
        "category": "Skincare",
        "keywords": ["packaging", "design", "minimal", "aesthetic", "Instagram", "branding"],
        "content": """K-뷰티 패키징은 두 가지 미학 방향을 추구한다. 첫째, Tamburins와 Huxley 같은 브랜드의 '미니멀 엘레건스' - 클린 폰트, 소프트터치 매트 마감, 파스텔 팔레트로 부티크 호텔 스파의 느낌을 구현한다. 둘째, Tony Moly와 Etude House의 '플레이풀' - Gen Z와 밀레니얼이 좋아하는 데코 겸용 제품 디자인이다. Laneige Water Sleeping Mask의 소프트 블루, 서브틀 그라데이션, 프로스티드 텍스처는 '럭셔리하면서도 접근 가능한' 느낌의 대표 사례다. Innisfree는 FSC 인증 종이 병과 리필 스테이션으로 에코프렌들리 디자인을 선도하고 있다. 아모레퍼시픽의 EASY PEASY 브랜드는 밀레니얼 대상의 스틱형 코스메틱으로 2020년 레드닷 어워드를 수상했다. K-뷰티에서 패키징은 단순한 포장이 아니라 제품 아이덴티티의 핵심이며, 성분표를 읽기 전에 이미 구매 결정에 영향을 미치는 감성적 연결을 만든다.""",
        "visual_mood": "파스텔 컬러 팔레트, 미니멀 타이포그래피, 소프트터치 매트 마감, 인스타그래머블",
        "strategy_type": "brand_design",
        "country": "usa"
    },
    {
        "id": "mkt_005",
        "title": "rom&nd 쥬시 래스팅 틴트: 일본 시장을 석권한 컬러 마케팅의 정석",
        "source": "Spray.io, K-Beauty Industry Reports",
        "category": "Makeup",
        "keywords": ["rom&nd", "lip tint", "color marketing", "Japan", "Loft", "fruity"],
        "content": """rom&nd의 쥬시 래스팅 틴트는 '과즙상 컬러'라는 독특한 감성 마케팅으로 일본 립틴트 시장 점유율 1위를 달성했다. 시즌별 과일을 테마로 한 컬러 스토리(복숭아, 체리, 포도 등)가 일본의 kawaii 문화와 결합하며 폭발적 인기를 끌었다. Loft, Plaza 등 일본 주요 버라이어티숍에 입점하며, Loft 뷰티 어워드를 수상했다. 일본 현지 모델과 인플루언서를 활용한 '데일리 립 스타일링' 콘텐츠로 자연스러운 바이럴을 유도했다. Twitter/X와 Instagram에서의 립 스와치 릴레이 이벤트가 화제가 되어 일본 10-20대 여성 사이에서 '국민 립틴트'로 자리매김했다. 핵심 비주얼은 과즙이 흐르는 듯한 글로시 텍스처와 과일 그라데이션 컬러다.""",
        "visual_mood": "과일 그라데이션, 글로시 텍스처, 상큼한 컬러 팔레트, 페미닌 무드",
        "strategy_type": "color_marketing",
        "country": "japan"
    },
    {
        "id": "mkt_006",
        "title": "Anua 어성초 토너: 미니멀 클린뷰티로 Ulta 1400개 매장 입점",
        "source": "BoF, Reuters",
        "category": "Skincare",
        "keywords": ["Anua", "heartleaf", "clean beauty", "minimalist", "Ulta", "skinimalism"],
        "content": """Anua는 K-뷰티 역사상 가장 빠른 리테일 확장을 실행하여 2025년 2월 1,400개 Ulta Beauty 매장에 입점했다. Heartleaf 77% Soothing Toner의 민감성 피부 진정 효과가 바이럴되며, '클린뷰티' 포지셔닝과 미니멀 미학이 미국의 '스키니멀리즘' 트렌드와 맞아떨어졌다. 모회사 The Founders의 영업이익률은 30%를 초과하여, 관세 인상 압력도 흡수할 수 있는 높은 수익성을 갖추고 있다. 패키징은 화이트와 그린의 심플한 조합으로 '순수하고 깨끗한' 이미지를 전달하며, 성분 투명성과 식물성 원료 스토리텔링이 핵심 마케팅 메시지다. Olive Young 글로벌에서도 토너 카테고리 1위를 유지하고 있으며, 미국 매출 400% 증가를 기록했다.""",
        "visual_mood": "화이트+그린 미니멀, 자연 허브 이미지, 클린한 패키징, 내추럴 톤",
        "strategy_type": "minimalist_branding",
        "country": "usa"
    },
    {
        "id": "mkt_007",
        "title": "Peripera 잉크 무드 틴트: K-pop 콜라보와 동남아 시장 공략",
        "source": "K-Beauty Industry, Shopee Trends",
        "category": "Makeup",
        "keywords": ["Peripera", "K-pop", "Southeast Asia", "Shopee", "affordable", "idol"],
        "content": """Peripera는 K-pop 콜라보 전략으로 동남아 시장을 성공적으로 공략했다. 잉크 무드 글로이 틴트는 '아이돌 립'이라는 콘셉트로 K-pop 팬덤(15-25세)을 핵심 타겟으로 삼았다. Shopee, Lazada 등 동남아 이커머스 플랫폼에서 립 카테고리 Top 3에 진입했으며, K-pop 팬미팅 이벤트와 연계한 마케팅으로 5개국 동시 진출에 성공했다. 가격대는 SGD 10-15로 어포더블하면서도 프리미엄 감성을 유지하는 전략을 취했다. 패키징은 아이돌 무대 메이크업을 연상시키는 글리터와 파스텔톤으로, SNS에서 '언박싱 영상'이 자연스럽게 바이럴되는 디자인이다. K-pop 아이돌 메이크업 튜토리얼 컨텐츠가 핵심 성장 동력이다.""",
        "visual_mood": "글리터 + 파스텔, 아이돌 무대 감성, 귀여운 패키징, K-pop 비주얼",
        "strategy_type": "kpop_collaboration",
        "country": "singapore"
    },
    {
        "id": "mkt_008",
        "title": "Innisfree 지속가능성 캠페인: 제주 스토리텔링과 에코 브랜딩",
        "source": "Red Dot Design, CosmeticsDesign",
        "category": "Skincare",
        "keywords": ["Innisfree", "sustainability", "Jeju", "eco-friendly", "refill", "green"],
        "content": """Innisfree는 제주도 녹차밭의 스토리텔링과 지속가능성 메시지를 결합한 에코 브랜딩으로 글로벌 클린뷰티 시장에 성공적으로 진입했다. 서울 매장에 리필 스테이션을 론칭하고, FSC 인증 종이 병과 생분해성 패키징을 도입했다. '자연에서 온 깨끗한 에너지'라는 브랜드 메시지가 환경 의식이 높은 밀레니얼과 Gen Z에게 강한 공감을 형성했다. 그린티 시드 세럼 라인은 '제주 농장 다큐멘터리' 형식의 컨텐츠로 원료의 출처와 생산 과정의 투명성을 강조했다. 리사이클링 챌린지 캠페인으로 브랜드 인지도 40% 상승을 달성했으며, 2025년에는 바이오 분해 가능 카톤과 업사이클 원료를 적극 활용하는 트렌드의 선두주자로 자리매김했다.""",
        "visual_mood": "그린 톤, 자연 풍경, 에코 프렌들리 패키징, 제주 이미지, 미니멀 그린",
        "strategy_type": "sustainability",
        "country": "usa"
    },
    {
        "id": "mkt_009",
        "title": "Beauty of Joseon: 조선시대 헤리티지로 Sephora 진입한 K-뷰티",
        "source": "BoF, Reuters, Retailboss",
        "category": "Skincare",
        "keywords": ["Beauty of Joseon", "heritage", "Sephora", "sunscreen", "rice", "tradition"],
        "content": """Beauty of Joseon은 조선시대 미용법에서 영감받은 전통 성분의 현대적 재해석으로 글로벌 시장을 공략했다. Relief Sun: Rice + Probiotics 선크림이 글로벌 히트 제품이 되며, Amazon에서의 폭발적 성공 이후 2024-2025년 Sephora에 입점했다. '합리적 가격대의 프리미엄 한방'이라는 포지셔닝으로 전통 성분(쌀, 인삼, 프로폴리스)을 현대 소비자에게 접근 가능하게 만들었다. 모회사 Goodai Global의 2024년 매출은 6억7600만 달러를 기록했으며, 2025년에는 12억 달러를 전망하고 있다. 조선시대 도자기와 한지에서 영감받은 패키징 디자인이 '동양 미학의 고급스러움'을 전달하며, Reddit r/SkincareAddiction에서 커뮤니티 추천 1위를 달성하는 등 오가닉 바이럴이 핵심 성장 동력이다.""",
        "visual_mood": "한국 전통 미학, 도자기/한지 영감 패키징, 골드+화이트, 헤리티지 감성",
        "strategy_type": "heritage_branding",
        "country": "usa"
    },
    {
        "id": "mkt_010",
        "title": "Medicube AGE-R 디바이스: 홈 에스테틱 트렌드와 피부과 마케팅",
        "source": "Beauty Packaging, Industry Analysis",
        "category": "Skincare",
        "keywords": ["Medicube", "device", "home aesthetic", "PDRN", "dermatologist", "anti-aging"],
        "content": """Medicube는 AGE-R 뷰티 디바이스와 PDRN 스킨케어 라인을 결합하여 '홈 에스테틱' 시장을 선도하고 있다. 핵심 전략은 피부과 전문의 추천 컨텐츠와 사용 전후 비교 영상이다. PDRN 라인은 스킨케어 레인지의 30% 이상을 차지하며, 2025년 3월 온라인 매출 급증으로 글로벌 베스트셀러가 되었다. 연어 유래 PDRN과 식물성 PDRN(야생 인삼 추출) 두 가지 포뮬러를 출시하여 비건 소비자까지 포용했다. Amazon 뷰티 디바이스 Top 10에 진입하며 론칭 첫 달 완판을 기록했다. '피부과 수준의 시술을 집에서'라는 메시지와 프로페셔널한 실버/화이트 디바이스 디자인이 30-45세 안티에이징 관심층의 신뢰를 확보했다.""",
        "visual_mood": "실버/화이트 메탈릭, 의료기기 감성, 프로페셔널, 클린 테크",
        "strategy_type": "dermatologist_marketing",
        "country": "usa"
    },
]

# ==================== 신제품 기획/제형 혁신 뉴스 (10건) ====================
npd_news = [
    {
        "id": "npd_001",
        "title": "PDRN (연어 DNA) 스킨케어 혁명: 레티놀 대안의 부상",
        "source": "Unicare Biotech, EvenSkyn, BoF",
        "category": "Skincare",
        "keywords": ["PDRN", "salmon DNA", "regenerative", "anti-aging", "wound healing", "retinol alternative"],
        "content": """PDRN(Polydeoxyribonucleotide)은 원래 상처 치유를 위해 개발되었으나, 2014년 Rejuran의 클리닉 전용 주사제로 한국 에스테틱 시장에 진입했다. 2023년 Jennifer Aniston, 2024년 Kim Kardashian의 '연어 정자 페이셜' 언급으로 서양에서도 주류가 되었다. PDRN은 피부의 자연 치유 능력을 촉발하여, 레티놀이 유발하는 자극 없이 주름을 완화하고 노화를 역전시킨다. Medicube는 스킨케어 레인지의 30% 이상을 PDRN으로 구성하며, 연어 유래와 야생 인삼 추출 식물성 PDRN 두 가지 포뮬러를 출시했다. 2025년 3월 온라인 매출 급증으로 PDRN 라인이 브랜드 글로벌 베스트셀러가 되었다. 핵심 배합 인사이트: PDRN + 세라마이드 + 펩타이드의 조합이 피부 재생 시너지를 극대화한다.""",
        "formulation_insight": "PDRN은 세포 재생 신호를 보내는 폴리뉴클레오타이드로, 세라마이드 장벽 보호 + 펩타이드 콜라겐 자극과의 시너지 효과",
        "country": "usa"
    },
    {
        "id": "npd_002",
        "title": "엑소좀 스킨케어: 세포 간 커뮤니케이션 기술의 화장품 적용",
        "source": "Yahoo Shopping, Rion Aesthetics, BoF",
        "category": "Skincare",
        "keywords": ["exosome", "regenerative", "growth factor", "vesicle", "cellular", "repair"],
        "content": """엑소좀은 피부의 커뮤니케이션 네트워크로 기능하는 초소형 소포체로, 성장인자와 단백질을 전달하여 복구와 재생 신호를 보낸다. 기존 단일 성분과 달리, 엑소좀은 세포가 자연적으로 인식하는 완전한 생물학적 패키지를 전달한다. 지질 막 구조 내에 여러 활성 성분을 동시에 보호하며 운반할 수 있어, 단일 성분 접근법보다 효율적이다. Plated Skin Science(Rion Aesthetics)는 메이요 클리닉의 심장 재생 의학 연구에서 파생된 기술로, 1억5000만 달러 이상의 연구가 뒷받침된다. RedCabbage ExoSkin™은 적양배추에서 추출한 고농도 엑소좀으로 퀘르세틴과 시나피산 등 항산화 성분이 풍부하다. 사프란 엑소좀도 조직 재생과 시술 후 회복에 활용되고 있다. 핵심 과제: 안정성과 확장성이 가장 큰 허들이며, 히알루론산/펩타이드/성장인자와의 복합 제형이 시너지 효과를 극대화한다.""",
        "formulation_insight": "엑소좀의 지질 이중층이 활성 성분을 보호하며 세포 수준에서 전달, HA+펩타이드+성장인자 복합 시 시너지",
        "country": "usa"
    },
    {
        "id": "npd_003",
        "title": "마이크로바이옴 스킨케어: 유산균 발효와 피부 생태계 혁신",
        "source": "K-BeautyN, Safic-Alcan, InCos Korea",
        "category": "Skincare",
        "keywords": ["microbiome", "probiotic", "ferment", "bifida", "lactobacillus", "skin flora"],
        "content": """2025년 가장 큰 스킨케어 혁신 중 하나는 마이크로바이옴 포커스 스킨케어다. 한국 연구자들은 건강한 피부 마이크로바이오타가 조기 노화, 여드름, 염증 예방에 필수적임을 발견했다. K-뷰티는 발효물과 프로바이오틱 활성 물질을 처방에 도입한 선구자로, 락토바실러스 발효물, 비피다 발효물 여과액, 쌀/녹차와 효모 발효물이 대표적이다. InCos Korea 2025에서는 Triplobiome™ Technology 기반 Pureblome™이 소개되어, 여드름/유분/염증을 개선하면서 동시에 노화 징후를 예방하는 삼중 효능을 제공한다. 핵심 배합: 프리바이오틱(피부 유익균 먹이) + 프로바이오틱(유산균) + 포스트바이오틱(발효 대사산물)의 3단계 마이크로바이옴 시스템이 차세대 표준이 되고 있다.""",
        "formulation_insight": "프리바이오틱+프로바이오틱+포스트바이오틱 3중 시스템, 발효 기술로 피부 생태계 강화",
        "country": "usa"
    },
    {
        "id": "npd_004",
        "title": "VT 리들샷: 스피큘 마이크로니들 기술의 성분 전달 혁신",
        "source": "Mayk Factory, K-BeautyN",
        "category": "Skincare",
        "keywords": ["VT", "reedle shot", "spicule", "microneedle", "delivery", "absorption"],
        "content": """VT Cosmetics의 REEDLE SHOT은 천연 해면침(스피큘)을 활용한 물리적 성분 전달 기술로 스킨케어의 새로운 카테고리를 개척했다. 실리카 기반 마이크로니들이 피부에 미세 채널을 형성하여 센텔라 아시아티카 같은 진정 성분의 흡수율을 극적으로 향상시킨다. 도포 시 느껴지는 미세한 따끔함이 '효과 체감'의 감각적 피드백을 제공하여, 사용자가 제품의 작동을 체감할 수 있다. 이 시너지 기술은 '전통 진정 성분 + 현대적 전달 기술'의 결합을 보여주는 대표 사례다. TikTok에서 바이럴되며 미국 안티에이징 세럼 Top 10에 진입했다. 핵심 포뮬러: 스피큘 + 콜라겐 + 펩타이드 + 나이아신아마이드의 조합으로, 물리적 전달과 화학적 활성의 시너지를 구현한다.""",
        "formulation_insight": "천연 스피큘의 미세 채널 형성 → 유효 성분 전달력 300% 향상, 물리적+화학적 시너지",
        "country": "usa"
    },
    {
        "id": "npd_005",
        "title": "5중 히알루론산 멀티레이어 기술: Torriden DIVE-IN의 수분 과학",
        "source": "K-BeautyN, Industry Analysis",
        "category": "Skincare",
        "keywords": ["hyaluronic acid", "multi-molecular", "hydration", "lightweight", "Torriden", "layers"],
        "content": """Torriden의 DIVE-IN Low Molecular Hyaluronic Acid Serum은 5가지 분자량의 히알루론산을 조합하는 멀티레이어 기술로 깊은 수분 공급을 실현했다. 고분자 HA(피부 표면 보호막), 중분자 HA(각질층 수분 유지), 저분자 HA(진피층 침투), 초저분자 HA(세포간 수분 공급), 나노 HA(깊은 층 도달)의 5단계 시스템이다. 수분감 있으면서도 끈적임 없는 워터리 텍스처가 핵심 차별점으로, '수분 세럼인데 가벼운'이라는 소비자 니즈를 정확히 충족했다. Amazon Choice에 선정되었고, Skincare Community에서 추천 1위를 기록했다. 판테놀, 알란토인, 베타인과의 조합으로 즉각적 수분 + 장기적 장벽 강화 효과를 동시에 제공한다. 월 판매량 10만 개를 돌파하며 수분 세럼 카테고리의 기준을 새로 세웠다.""",
        "formulation_insight": "5가지 분자량 HA의 레이어링으로 각 피부층 맞춤 수분 공급, 판테놀+알란토인 시너지",
        "country": "usa"
    },
    {
        "id": "npd_006",
        "title": "미니프로틴: 2025년의 차세대 펩타이드 - 더 정밀한 시그널링",
        "source": "Trilogy Laboratories, NYSCC 2025",
        "category": "Skincare",
        "keywords": ["miniprotein", "peptide", "signaling", "collagen", "targeted", "copper peptide"],
        "content": """2025년은 '미니프로틴의 해'로 불린다. 펩타이드와 유사하지만, 미니프로틴은 더 긴 아미노산 체인으로 더 정의된 3차원 구조를 형성하여 더 정밀한 타겟 결과를 제공한다. Helixa Peptide 스마트 펩타이드 기술은 콜라겐과 엘라스틴을 타겟팅하고, 세포외기질 네트워크에 결합하여 피부 탄력과 밀도를 촉진한다. 구리 펩타이드(Copper Peptide)는 특히 높은 CAGR 성장률을 보이며, 콜라겐 합성 자극과 항산화 효과를 동시에 제공한다. 핵심 트렌드: 단순 보습에서 '세포 신호 조절'로의 패러다임 전환이 일어나고 있으며, 미니프로틴은 레티놀이나 비타민C 같은 기존 코어 액티브와 함께 차세대 핵심 성분으로 자리매김하고 있다.""",
        "formulation_insight": "미니프로틴의 3D 구조로 정밀 시그널링, 구리 펩타이드의 콜라겐 합성 + 항산화 이중 효과",
        "country": "usa"
    },
    {
        "id": "npd_007",
        "title": "한방 2.0: 전통 한의학과 바이오테크의 융합 - 발효 인삼의 과학",
        "source": "K-BeautyN, Safic-Alcan, OEM Cosmetic",
        "category": "Skincare",
        "keywords": ["hanbang", "ginseng", "fermentation", "biotech", "traditional", "modern"],
        "content": """전통 한방(Hanbang)이 바이오테크와 만나는 '한방 2.0' 시대가 도래했다. 현대 K-뷰티 브랜드들은 수세기 된 처방을 발효 기술과 정밀 과학으로 재해석하고 있다. 인삼의 사포닌 성분을 나노화하여 흡수율을 극대화하고, 발효를 통해 생체이용률을 높이는 기술이 핵심이다. Sulwhasoo의 자음생 크림은 인삼 사포닌 복합체와 발효 기술의 결합으로 럭셔리 안티에이징 시장을 선도한다. 녹차 줄기세포 배양으로 고순도 EGCG를 추출하는 아모레퍼시픽의 바이오테크도 이 범주에 속한다. 핵심: 전통 한약재(인삼, 녹차, 쌀, 동백) + 현대 발효/나노 기술 + 과학적 효능 검증의 3단계가 한방 2.0의 공식이다.""",
        "formulation_insight": "전통 한약재의 나노화+발효로 생체이용률 극대화, 사포닌/EGCG 고순도 추출 기술",
        "country": "japan"
    },
    {
        "id": "npd_008",
        "title": "스마트 전달 시스템: pH/온도 반응형 나노 캐리어의 화장품 혁신",
        "source": "NYSCC 2025, OEM Cosmetic, Industry Analysis",
        "category": "Skincare",
        "keywords": ["delivery system", "nanocarrier", "pH responsive", "controlled release", "encapsulation"],
        "content": """2025년은 '스마트 캐리어, 나노플랫폼, 트리거 릴리즈'의 해다. 피부 pH, 온도, 효소에 반응하여 필요한 때와 장소에서만 활성 성분을 방출하는 시스템이 등장했다. 레티놀의 리포솜 캡슐 봉입으로 자극 최소화 + 안정성 극대화하는 IOPE의 기술이 대표적이다. 크리미한 텍스처에서 캡슐이 터지며 레티놀이 방출되는 감각적 사용 경험을 제공한다. COSRX의 그래듀얼 릴리즈 레티놀은 시간차 방출 기술로 즉각 자극을 최소화하며 점진적 효과를 발현한다. 바쿠치올(Bakuchiol)과의 조합은 레티놀 입문자를 위한 저자극 설계를 가능하게 한다. 엑소좀과 PDRN도 효과적인 제형화를 위해 고급 전달 시스템이나 특수 안정화 기술이 필수적이다.""",
        "formulation_insight": "pH/온도/효소 반응형 트리거 릴리즈, 리포솜 캡슐화로 불안정 성분 안정화",
        "country": "usa"
    },
    {
        "id": "npd_009",
        "title": "글래스 스킨 과학: 광도 지수와 포스트바이오틱 텍스처 혁신",
        "source": "InCos Korea 2025, Provital Blog",
        "category": "Skincare",
        "keywords": ["glass skin", "luminosity", "texture", "post-biotic", "smooth", "glow"],
        "content": """과학적으로 글래스 스킨은 '광도 지수(Luminosity Index)' - 빛이 피부에서 얼마나 균일하게 반사되는지를 측정하는 것으로 정의된다. 핵심 요소는 피부 매끄러움, 균일한 피부톤, 최적의 수분도, 피부 탄력이다. InCos Korea 2025에서 소개된 Pureblome™(Triplobiome™ Technology)은 포스트바이오틱 성분으로, 여드름/유분/염증을 개선하면서 노화 징후를 예방하는 삼중 효능을 제공한다. K-뷰티의 텍스처 혁신: 젤리→크림, 파우더→세럼 등 멀티 센서리 포뮬레이션이 온도와 습도에 적응하며 연중 최적의 흡수를 보장한다. 갈락토미세스 발효 여과물 88.9% 고농축(Numbuzin 3번 세럼)으로 즉각적 피부결 개선을 구현하는 것도 글래스 스킨 과학의 일부다.""",
        "formulation_insight": "광도 지수 극대화 = 매끄러움+균일톤+수분+탄력, 포스트바이오틱으로 피부 생태계 최적화",
        "country": "usa"
    },
    {
        "id": "npd_010",
        "title": "비건 레티놀 대안: 바쿠치올과 아피놀360의 과학적 검증",
        "source": "NYSCC 2025, HerbElementz",
        "category": "Skincare",
        "keywords": ["bakuchiol", "retinol alternative", "vegan", "plant-based", "anti-aging", "gentle"],
        "content": """바쿠치올(Maxcel® BKC)은 COSMOS 인증을 받은 100% 천연 식물 유래 레티놀 대안으로, 광민감성 없이 레티놀과 동등한 효과를 제공한다. 레티놀의 안정화에도 효과적이어서 레티놀 포뮬레이션의 보조 성분으로도 활용된다. Apinol360™은 '레티놀보다 나은' 것을 표방하는 특허 천연 항염노화(Anti-inflammaging) 대안으로, 홍조 감소, 염증 진정, 장벽 회복을 지원한다. 2024-2025년 레티놀 제품이 폭발적으로 증가했지만, 민감 피부 소비자의 자극 우려도 동시에 커지면서 '저자극 안티에이징' 시장이 급성장하고 있다. 핵심 배합: 바쿠치올 + 스쿠알란 + 세라마이드의 조합으로 레티놀급 효과를 피부 장벽 보호와 함께 제공하는 것이 트렌드다.""",
        "formulation_insight": "바쿠치올의 레티놀 안정화+대안 효과, 스쿠알란/세라마이드와의 장벽 보호 시너지",
        "country": "usa"
    },
]

# ==================== 해외 진출 전략 뉴스 (10건) ====================
overseas_news = [
    {
        "id": "ovs_001",
        "title": "K-뷰티 미국 수출 1위 달성: 프랑스를 제치고 최대 화장품 수출국으로",
        "source": "Euromonitor, Reuters, Korea.net",
        "category": "Skincare",
        "keywords": ["USA", "export", "number one", "France", "Amazon", "market share"],
        "content": """한국은 2024년 미국 최대 화장품 수출국으로 프랑스를 제치며 역사적 이정표를 세웠다. 미국향 수출은 15.1% 증가한 약 22억 달러를 기록했다. K-뷰티의 미국 온라인 매출은 2025년 상반기 전체 해외 온라인 매출의 55%를 차지하며, 2022년 20%에서 급증했다. 미국 스킨케어/선케어 Top 300 브랜드 중 35개가 K-뷰티 브랜드다. 핵심 성공 요인: ①가벼운 텍스처와 기능성 혁신 ②디지털 미디어를 통한 K-컬처 영향력 ③Amazon 우선 전략 후 Sephora/Ulta 확장. '피부 건강이 내 건강'이라는 철학이 미국에서 K-뷰티의 성장을 주도하고 있다. 그러나 2025년 Q2 미-한 FTA 잠재적 종료와 관세 우려가 리스크로 존재한다.""",
        "market_insight": "미국 수출 1위, 55% 온라인 매출 비중, Amazon-first → Sephora/Ulta 전략 검증",
        "country": "usa"
    },
    {
        "id": "ovs_002",
        "title": "일본 K-뷰티 수입 120.8% 급증: 프랑스를 넘어선 한국 화장품",
        "source": "Euromonitor, KED Global",
        "category": "Skincare",
        "keywords": ["Japan", "import surge", "120%", "France", "Qoo10", "Olive Young"],
        "content": """일본의 K-뷰티 수입이 2024년 120.8% 급증하며 프랑스를 넘어섰다. 일본향 수출은 2025년 약 11억 달러로 5% 증가했다. 혁신적인 성분과 가벼운 텍스처에 대한 수요가 성장을 주도했다. CJ 올리브영은 2024년 5월 일본 자회사를 설립하여 현지 유통업체에 화장품을 공급하기 시작했다. 2025년 첫 3분기 일본 K-뷰티 온라인 매출은 2024년 전체의 86%에 이미 도달했다. 메이저 브랜드부터 인디 브랜드까지 균형 잡힌 선호도를 보이고 있다. linnofashion 같은 기업은 일본 패션 브랜드 ANAP과 콜라보를 논의하며, 패션과 뷰티의 경계를 허무는 차별화 전략을 추진하고 있다. 핵심: Qoo10/@cosme 온라인 → Don Quijote/Loft 오프라인 확장 공식이 검증되었다.""",
        "market_insight": "수입 120.8% 급증, 올리브영 일본 법인, 온라인→오프라인 확장 공식",
        "country": "japan"
    },
    {
        "id": "ovs_003",
        "title": "동남아시아: K-뷰티의 차세대 성장 엔진 - 기후 맞춤 전략",
        "source": "Euromonitor, CosmeticsDesign Asia",
        "category": "Skincare",
        "keywords": ["Southeast Asia", "tropical", "climate", "Shopee", "TikTok Shop", "affordable"],
        "content": """동남아시아와 중남미는 미국 노출을 보완하는 핵심 지리적 다각화 전략 지역이다. 동남아 전역에서 스킨케어가 자기관리와 사회적 정체성의 형태로 문화적 전환이 일어나고 있어, K-뷰티 채택의 비옥한 토양이 되고 있다. C&T Dream은 Retail Lagoon과 파트너십을 맺어 JEJU suguk 브랜드를 일본, 인도, 태국, UAE에 론칭하며, 동남아 열대 기후에 맞춘 Clear Line을 별도 개발했다. 디지털 리테일 확장과 뷰티 블로거/인플루언서 협업을 통한 현지화 전략이 핵심이다. TikTok Shop에서 K-뷰티는 132% 성장률로 최고 판매 카테고리를 유지하고 있다. 핵심 전략: 열대 기후 맞춤 경량 포뮬라 + 어포더블 가격 + 로컬 인플루언서 + Shopee/TikTok Shop 이커머스.""",
        "market_insight": "열대 기후 맞춤 제형, TikTok Shop 132% 성장, 어포더블 가격 필수",
        "country": "singapore"
    },
    {
        "id": "ovs_004",
        "title": "Sephora-Olive Young 연합: 미국 리테일에서의 K-뷰티 큐레이션 전략",
        "source": "Retail Dive, BoF",
        "category": "Skincare",
        "keywords": ["Sephora", "Olive Young", "retail", "curation", "US market", "prestige"],
        "content": """Sephora는 K-뷰티 라이벌 Olive Young과 협업하여 매장 내 큐레이티드 K-뷰티 스페이스를 론칭할 계획이다. 이는 TikTok-프렌들리 캠페인과 독점 K-뷰티 드롭 전략의 일환이다. 미국 소매업체들 - Sephora, Ulta Beauty에서 Costco, Target까지 - 한국 화장품 브랜드와 오프라인 매장 판매 론칭을 협의 중이다. K-뷰티 브랜드들은 Cosmax, Kolmar 같은 계약 제조업체('패스트 뷰티의 Foxconn')를 활용하여 비용을 낮추고 높은 마진 비즈니스 모델을 유지한다. 이를 통해 관세 충격도 흡수할 수 있는 재정적 유연성을 확보하고 있다. TIRTIR의 Ulta 프레스티지 존 입점(2025년 8월)은 K-뷰티가 미국 프리미엄 리테일에서도 통한다는 것을 증명했다.""",
        "market_insight": "Sephora+Olive Young 큐레이션, Cosmax/Kolmar OEM 비용 경쟁력, 프레스티지 존 진입",
        "country": "usa"
    },
    {
        "id": "ovs_005",
        "title": "K-뷰티 2.0: 온라인 매출이 2024년 전체를 넘어선 디지털 전환",
        "source": "Euromonitor, Personal Care Insights",
        "category": "Skincare",
        "keywords": ["digital", "online sales", "e-commerce", "K-beauty 2.0", "export record"],
        "content": """한국 화장품 수출이 2025년 114.3억 달러 사상 최고치를 기록하며 전년 대비 12.3% 증가했다. 'K-뷰티 2.0'에 힘입어, 2025년 첫 3분기 글로벌 K-뷰티 온라인 매출이 이미 2024년 전체 매출의 86%를 달성했다. 전체 생산량의 80%가 수출용이며, 이커머스가 주요 성장 채널이다. 한국 정부는 300개 젊은 브랜드 크리에이터와 500개 소규모 사업팀을 수출 지향 기업으로 육성하는 4대 전략(글로벌 진입, 확장, 성장, 기반 구축)을 추진 중이다. 데이터 기반 제품 기획과 멀티 글로벌 플랫폼 맞춤 마케팅이 차세대 K-뷰티 기업들의 핵심 성장 동력이다. IPO도 국제 확장 이후에 이루어지며, K-뷰티 기업들은 장기적 글로벌 플레이어로 포지셔닝하고 있다.""",
        "market_insight": "수출 114.3억불 사상 최고, 온라인 매출 전년 초과, 정부 300+500 육성 전략",
        "country": "usa"
    },
    {
        "id": "ovs_006",
        "title": "멕시코·브라질: K-뷰티의 신흥 성장 시장 (149.9% / 115.1% 성장)",
        "source": "Euromonitor, IMARC Group",
        "category": "Skincare",
        "keywords": ["Mexico", "Brazil", "Latin America", "emerging", "growth", "diversification"],
        "content": """K-뷰티는 핵심 시장을 넘어 유럽, 중동, 중남미, 남/서남아시아로 적극 다각화하고 있다. 멕시코는 비율 성장률 기준 가장 빠른 수출 시장(149.9%)이며, 브라질(115.1%)이 그 뒤를 잇는다. 이 시장들에서는 K-팝과 한국 드라마의 문화적 영향력이 뷰티 소비에 직접적으로 연결되고 있다. 인도와 태국 정부는 화장품 수입 규제를 완화하여 시장 접근성을 높이고 있다. 핵심 전략: ①문화적 친밀성(K-pop/K-drama) 활용 ②현지 이커머스 플랫폼(Mercado Libre, Shopee) 입점 ③어포더블 가격 포지셔닝 ④현지 인플루언서 네트워크 구축. K-뷰티의 글로벌 성장은 단일 시장 의존에서 다시장 포트폴리오로의 전환을 보여준다.""",
        "market_insight": "멕시코 149.9%, 브라질 115.1% 성장, K-컬처 연계, 다시장 포트폴리오 전략",
        "country": "usa"
    },
    {
        "id": "ovs_007",
        "title": "프리미엄화 전략: 관세 충격 흡수를 위한 K-뷰티의 업마켓 이동",
        "source": "BoF, Reuters, Euromonitor",
        "category": "Skincare",
        "keywords": ["premiumization", "tariff", "margin", "luxury", "brand equity", "pricing"],
        "content": """K-뷰티 기업들은 프리미엄화를 통해 더 높은 가격대를 책정하고, 관세 충격을 흡수할 마진 유연성을 확보하며, 브랜드 가치를 강화하고 있다. Anua의 모회사 The Founders는 영업이익률 30%를 초과하여 경쟁사보다 높은 관세 흡수 능력을 보유하고 있다. Goodai Global(Beauty of Joseon, TIRTIR)은 31억 달러 가치 평가를 받았다. 이는 K-뷰티가 '저가 트렌디 제품'에서 '고마진 프리미엄 브랜드'로 진화하고 있음을 보여준다. 미국 에스테틱 시술에서 유래한 성분(PDRN, 엑소좀)의 스킨케어 도입이 이 프리미엄화 트렌드를 가속화하고 있으며, 두피 건강(Scalp Health)도 프리미엄 카테고리로 부상 중이다.""",
        "market_insight": "영업이익률 30%+ 프리미엄 전략, 관세 흡수 가능, 에스테틱 성분의 대중화",
        "country": "usa"
    },
    {
        "id": "ovs_008",
        "title": "일본 시장: CICA/센텔라 더마 포지셔닝과 @cosme 입소문 전략",
        "source": "Industry Analysis, CosmeticsDesign Asia",
        "category": "Skincare",
        "keywords": ["Japan", "CICA", "centella", "derma", "@cosme", "sensitive skin"],
        "content": """일본 시장에서 K-뷰티는 시카/센텔라 성분의 더마코스메틱 포지셔닝으로 강력한 성장을 이끌고 있다. 진입 전략: Qoo10/Rakuten 입점 → @cosme 입소문 형성 → Don Quijote/Loft 오프라인 확대. 일본 소비자는 극저자극, 성분 안전성, 심플 스텝, 센텔라/시카의 진정 효과를 높이 평가한다. 가격대는 1500-4000엔(중가)으로, 일본 더마 코스메틱과 동등한 수준이다. @cosme 평점 관리와 일본어 성분 교육 컨텐츠가 핵심 성공 요인이다. 일본의 높은 품질 기준, 현지 더마 브랜드(Hada Labo, MUJI) 경쟁, 약사법 규제가 주요 도전 과제다. 민감 피부 포지셔닝이 일본 시장 공략의 가장 효과적인 각도로 검증되고 있다.""",
        "market_insight": "CICA/센텔라 더마 포지셔닝, @cosme 리뷰 전략, Qoo10→오프라인 공식",
        "country": "japan"
    },
    {
        "id": "ovs_009",
        "title": "말레이시아/인도네시아: 할랄 인증과 어포더블 K-뷰티의 동남아 전략",
        "source": "Industry Analysis, Shopee Trends",
        "category": "Skincare",
        "keywords": ["halal", "Malaysia", "Indonesia", "affordable", "Muslim", "hijab"],
        "content": """말레이시아와 인도네시아 시장에서 할랄 인증은 K-뷰티 진입의 필수 조건이다. 말레이시아: 할랄 인증 + 미백(브라이트닝) 효과 + 합리적 가격(RM 30-80)이 핵심. 히잡 착용 여성을 위한 트랜스퍼프루프 립틴트와 지속력 메이크업이 높은 수요를 보인다. 인도네시아: 극도의 가격 민감도(IDR 50,000-200,000)에 대응하는 저가 고효능 전략이 필수. TikTok Shop 라이브커머스가 핵심 판매 채널이며, Shopee/Tokopedia가 주요 이커머스 플랫폼이다. SOME BY MI의 '30일 기적' Before/After 챌린지가 인도네시아에서 매출 500% 증가를 달성한 것이 대표 사례다. 핵심: 할랄 원료 소싱 + 현지 가격 맞춤 + 무슬림 인플루언서 협업.""",
        "market_insight": "할랄 인증 필수, 극저가 필요(인도네시아), 히잡 맞춤 제품, TikTok Shop 라이브커머스",
        "country": "indonesia"
    },
    {
        "id": "ovs_010",
        "title": "K-뷰티 선케어 글로벌 전략: 경량 포뮬라와 무백탁의 기술 우위",
        "source": "Industry Analysis, Euromonitor",
        "category": "Sun Care",
        "keywords": ["sunscreen", "lightweight", "no white cast", "tropical", "SPF", "global"],
        "content": """K-뷰티 선케어는 '경량 포뮬라 + 무백탁 + 스킨케어 효과'라는 3대 차별화로 글로벌 시장을 공략하고 있다. 미국: 선케어 교육 컨텐츠 → 경량 포뮬라 차별화 → 데일리 선케어 습관 형성 전략. FDA의 새 UV 필터 승인 지연이 기회로 작용(한국은 더 다양한 필터 사용 가능). 동남아: 열대 자외선 대응 SPF50+ PA++++ 방수 포뮬라가 필수. SKIN1004 센텔라 선세럼이 인도네시아 Shopee 선케어 Top 3에 진입. 일본: Anessa/Biore와의 기술 경쟁에서 톤업+자외선 차단 하이브리드 포뮬라로 차별화. 선스틱(Isntree HA 에어리 선스틱)은 '재도포 간편함'이라는 포맷 혁신으로 새로운 카테고리를 개척했다. 핵심: 세럼/젤/스틱 등 다양한 포맷 혁신 + 센텔라/HA 스킨케어 효과 겸비.""",
        "market_insight": "경량 무백탁 기술 우위, 포맷 혁신(세럼/스틱), 지역별 맞춤 SPF 전략",
        "country": "usa"
    },
]


def build_vector_db():
    """ChromaDB에 뉴스 데이터를 임베딩하여 저장"""
    print(f"\nInitializing ChromaDB at: {CHROMA_DB_PATH}")
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

    # 기존 컬렉션 삭제 후 재생성
    for name in ['rag_marketing', 'rag_npd', 'rag_overseas']:
        try:
            client.delete_collection(name)
            print(f"  Deleted existing collection: {name}")
        except:
            pass

    # 마케팅 컬렉션
    print("\nBuilding marketing collection...")
    mkt_collection = client.create_collection(
        name='rag_marketing',
        metadata={"description": "K-Beauty 마케팅 캠페인 성공 사례"}
    )
    mkt_documents = []
    mkt_metadatas = []
    mkt_ids = []
    for item in marketing_news:
        # 임베딩용 텍스트: 제목 + 내용 + 비주얼 무드 + 키워드
        embed_text = f"{item['title']} {item['content']} 비주얼: {item['visual_mood']} 키워드: {', '.join(item['keywords'])}"
        mkt_documents.append(embed_text)
        mkt_metadatas.append({
            "title": item["title"],
            "source": item["source"],
            "category": item["category"],
            "country": item["country"],
            "strategy_type": item["strategy_type"],
            "visual_mood": item["visual_mood"],
            "keywords": ", ".join(item["keywords"]),
            "content": item["content"][:2000],
        })
        mkt_ids.append(item["id"])

    embeddings = embed_model.encode(mkt_documents).tolist()
    mkt_collection.add(
        documents=mkt_documents,
        embeddings=embeddings,
        metadatas=mkt_metadatas,
        ids=mkt_ids,
    )
    print(f"  Added {len(mkt_documents)} marketing articles with embeddings")

    # NPD/제형 컬렉션
    print("Building NPD/formulation collection...")
    npd_collection = client.create_collection(
        name='rag_npd',
        metadata={"description": "K-Beauty 제형/성분 혁신 사례"}
    )
    npd_documents = []
    npd_metadatas = []
    npd_ids = []
    for item in npd_news:
        embed_text = f"{item['title']} {item['content']} 제형인사이트: {item['formulation_insight']} 키워드: {', '.join(item['keywords'])}"
        npd_documents.append(embed_text)
        npd_metadatas.append({
            "title": item["title"],
            "source": item["source"],
            "category": item["category"],
            "country": item["country"],
            "formulation_insight": item["formulation_insight"],
            "keywords": ", ".join(item["keywords"]),
            "content": item["content"][:2000],
        })
        npd_ids.append(item["id"])

    embeddings = embed_model.encode(npd_documents).tolist()
    npd_collection.add(
        documents=npd_documents,
        embeddings=embeddings,
        metadatas=npd_metadatas,
        ids=npd_ids,
    )
    print(f"  Added {len(npd_documents)} NPD articles with embeddings")

    # 해외 진출 컬렉션
    print("Building overseas strategy collection...")
    ovs_collection = client.create_collection(
        name='rag_overseas',
        metadata={"description": "K-Beauty 해외 진출 전략 사례"}
    )
    ovs_documents = []
    ovs_metadatas = []
    ovs_ids = []
    for item in overseas_news:
        embed_text = f"{item['title']} {item['content']} 시장인사이트: {item['market_insight']} 키워드: {', '.join(item['keywords'])}"
        ovs_documents.append(embed_text)
        ovs_metadatas.append({
            "title": item["title"],
            "source": item["source"],
            "category": item["category"],
            "country": item["country"],
            "market_insight": item["market_insight"],
            "keywords": ", ".join(item["keywords"]),
            "content": item["content"][:2000],
        })
        ovs_ids.append(item["id"])

    embeddings = embed_model.encode(ovs_documents).tolist()
    ovs_collection.add(
        documents=ovs_documents,
        embeddings=embeddings,
        metadatas=ovs_metadatas,
        ids=ovs_ids,
    )
    print(f"  Added {len(ovs_documents)} overseas articles with embeddings")

    print("\n✅ Vector DB build complete!")
    print(f"   Location: {CHROMA_DB_PATH}")
    print(f"   Collections: rag_marketing({len(mkt_documents)}), rag_npd({len(npd_documents)}), rag_overseas({len(ovs_documents)})")
    print(f"   Embedding model: paraphrase-multilingual-MiniLM-L12-v2")
    print(f"   Total articles: {len(mkt_documents) + len(npd_documents) + len(ovs_documents)}")


if __name__ == "__main__":
    build_vector_db()
