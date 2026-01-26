"""
USA 데이터 수정 스크립트
1. 카테고리 다양화 (Skincare, Makeup, Haircare, Bodycare)
2. SNS/Retail 키워드 5개로 제한
3. 키워드 한국어 번역 추가
4. 키워드 설명 추가
"""

from pymongo import MongoClient
from datetime import datetime
import random

client = MongoClient('mongodb://localhost:27017')
db = client['amore']

# 키워드 한국어 번역 및 설명
KEYWORD_TRANSLATIONS = {
    # Ingredients
    "hyaluronic acid": {"ko": "히알루론산", "desc": "피부 수분 유지에 탁월한 보습 성분으로, 자기 무게의 1000배 수분을 끌어당김"},
    "niacinamide": {"ko": "나이아신아마이드", "desc": "피부 톤 개선, 모공 축소, 피지 조절에 효과적인 비타민 B3 유도체"},
    "retinol": {"ko": "레티놀", "desc": "세포 재생을 촉진하는 안티에이징 대표 성분으로 주름 개선에 효과적"},
    "vitamin c": {"ko": "비타민C", "desc": "강력한 항산화 작용으로 피부 톤을 밝히고 콜라겐 생성을 촉진"},
    "snail mucin": {"ko": "달팽이 뮤신", "desc": "피부 재생과 보습에 뛰어난 K-뷰티 대표 성분"},
    "centella asiatica": {"ko": "센텔라 아시아티카", "desc": "피부 진정과 장벽 강화에 효과적인 병풀 추출물"},
    "centella": {"ko": "센텔라", "desc": "민감성 피부 진정에 탁월한 자연 유래 성분"},
    "ceramide": {"ko": "세라마이드", "desc": "피부 장벽을 구성하는 핵심 지질로 보습과 보호 기능"},
    "ceramides": {"ko": "세라마이드", "desc": "피부 장벽 강화와 수분 손실 방지에 필수적인 성분"},
    "peptide": {"ko": "펩타이드", "desc": "콜라겐 생성을 촉진하여 피부 탄력 개선에 효과적"},
    "peptides": {"ko": "펩타이드", "desc": "아미노산 결합체로 안티에이징 효과가 뛰어남"},
    "salicylic acid": {"ko": "살리실산", "desc": "모공 속 노폐물을 제거하는 BHA 성분으로 여드름 케어에 효과적"},
    "glycolic acid": {"ko": "글리콜산", "desc": "각질 제거와 피부결 개선에 효과적인 AHA 성분"},
    "lactic acid": {"ko": "젖산", "desc": "부드러운 각질 제거와 보습을 동시에 제공하는 AHA"},
    "propolis": {"ko": "프로폴리스", "desc": "항균, 항염 작용이 뛰어난 벌집 추출 성분"},
    "squalane": {"ko": "스쿠알란", "desc": "피부 친화적인 오일로 보습과 피부 장벽 강화에 효과적"},
    "green tea": {"ko": "녹차", "desc": "항산화 효과가 뛰어나 피부 노화 방지에 효과적"},
    "tea tree": {"ko": "티트리", "desc": "항균, 항염 효과로 트러블 피부 케어에 적합"},
    "aloe vera": {"ko": "알로에 베라", "desc": "피부 진정과 보습에 효과적인 자연 성분"},
    "collagen": {"ko": "콜라겐", "desc": "피부 탄력의 핵심 단백질로 주름 개선에 효과적"},
    "panthenol": {"ko": "판테놀", "desc": "비타민 B5로 피부 진정과 보습에 효과적"},
    "rice": {"ko": "쌀", "desc": "미백과 보습에 효과적인 한방 성분"},
    "ginseng": {"ko": "인삼", "desc": "항노화와 활력 부여에 뛰어난 K-뷰티 대표 성분"},
    "green plum": {"ko": "청매실", "desc": "피부 정화와 모공 케어에 효과적인 한방 성분"},
    "snail secretion": {"ko": "달팽이 분비물", "desc": "피부 재생과 탄력 개선에 효과적"},
    "betaine": {"ko": "베타인", "desc": "천연 보습 인자로 피부 수분 밸런스 유지에 효과적"},
    "allantoin": {"ko": "알란토인", "desc": "피부 진정과 재생을 촉진하는 성분"},
    "sodium hyaluronate": {"ko": "히알루론산 나트륨", "desc": "히알루론산의 염 형태로 피부 깊숙이 흡수되는 보습 성분"},
    "berry": {"ko": "베리", "desc": "항산화 효과가 뛰어난 자연 성분"},
    "bha": {"ko": "BHA", "desc": "모공 속 피지와 노폐물을 제거하는 지용성 각질 제거 성분"},
    "aha": {"ko": "AHA", "desc": "피부 표면 각질을 제거하는 수용성 성분"},
    "probiotics": {"ko": "프로바이오틱스", "desc": "피부 마이크로바이옴 균형을 유지하는 유익균"},
    "cica": {"ko": "시카", "desc": "센텔라 아시아티카 기반 피부 진정 성분"},
    "pdrn": {"ko": "PDRN", "desc": "연어 DNA에서 추출한 피부 재생 성분"},
    "exosome": {"ko": "엑소좀", "desc": "세포 간 신호 전달 물질로 피부 재생에 효과적"},
    "shea butter": {"ko": "시어버터", "desc": "깊은 보습과 피부 보호에 효과적인 천연 버터"},
    "azelaic acid": {"ko": "아젤라산", "desc": "색소 침착과 여드름 개선에 효과적인 성분"},
    "mugwort": {"ko": "쑥", "desc": "민감성 피부 진정에 탁월한 한방 성분"},

    # Formulas
    "serum": {"ko": "세럼", "desc": "고농축 활성 성분을 담은 에센스 타입 제품"},
    "cream": {"ko": "크림", "desc": "유수분 밸런스를 맞춰주는 보습 제품"},
    "toner": {"ko": "토너", "desc": "세안 후 피부 pH 밸런스를 맞춰주는 제품"},
    "essence": {"ko": "에센스", "desc": "피부에 영양을 공급하는 스킨케어 기본 단계"},
    "ampoule": {"ko": "앰플", "desc": "세럼보다 고농축된 기능성 제품"},
    "mask": {"ko": "마스크", "desc": "집중 케어를 위한 시트 또는 워시오프 제품"},
    "cleanser": {"ko": "클렌저", "desc": "피부 노폐물과 메이크업을 제거하는 세안 제품"},
    "moisturizer": {"ko": "모이스처라이저", "desc": "피부 수분을 공급하고 유지하는 보습 제품"},
    "sunscreen": {"ko": "선크림", "desc": "자외선으로부터 피부를 보호하는 제품"},
    "oil": {"ko": "오일", "desc": "피부에 영양과 윤기를 제공하는 유분 제품"},
    "gel": {"ko": "젤", "desc": "가볍고 산뜻한 텍스처의 수분 제품"},
    "lotion": {"ko": "로션", "desc": "가벼운 보습을 제공하는 유액 타입 제품"},
    "exfoliant": {"ko": "각질제거제", "desc": "피부 표면 각질을 제거하는 제품"},
    "sheet mask": {"ko": "시트마스크", "desc": "에센스가 함침된 일회용 마스크"},
    "sleeping mask": {"ko": "슬리핑마스크", "desc": "수면 중 집중 케어를 위한 나이트 마스크"},
    "eye cream": {"ko": "아이크림", "desc": "눈가 전용 안티에이징 크림"},
    "lip mask": {"ko": "립마스크", "desc": "입술 보습과 케어를 위한 제품"},
    "pads": {"ko": "패드", "desc": "토닝이나 각질 제거용 화장솜 제품"},
    "pad": {"ko": "패드", "desc": "간편한 토닝/각질 케어 제품"},

    # Effects
    "hydrating": {"ko": "수분공급", "desc": "피부에 충분한 수분을 공급하여 촉촉하게 유지"},
    "hydration": {"ko": "하이드레이션", "desc": "피부 깊숙이 수분을 전달하는 효과"},
    "moisturizing": {"ko": "보습", "desc": "피부 수분 손실을 방지하고 촉촉함 유지"},
    "anti-aging": {"ko": "안티에이징", "desc": "피부 노화 징후를 예방하고 개선"},
    "brightening": {"ko": "브라이트닝", "desc": "피부 톤을 밝고 균일하게 개선"},
    "soothing": {"ko": "진정", "desc": "자극받은 피부를 편안하게 진정"},
    "calming": {"ko": "카밍", "desc": "민감해진 피부를 부드럽게 진정"},
    "firming": {"ko": "탄력", "desc": "처진 피부에 탄력을 부여"},
    "glow": {"ko": "글로우", "desc": "피부에 건강한 윤기와 광채를 부여"},
    "pore": {"ko": "모공케어", "desc": "넓어진 모공을 조여주고 깨끗하게 관리"},
    "wrinkle": {"ko": "주름개선", "desc": "피부 주름을 예방하고 완화"},
    "acne": {"ko": "여드름케어", "desc": "여드름과 트러블을 예방하고 개선"},
    "exfoliation": {"ko": "각질제거", "desc": "묵은 각질을 제거하여 피부결 개선"},
    "skin barrier": {"ko": "피부장벽", "desc": "피부 보호막을 강화하여 외부 자극으로부터 방어"},
    "blemish": {"ko": "잡티케어", "desc": "색소 침착과 잡티를 개선"},
    "redness": {"ko": "홍조케어", "desc": "피부 붉은기를 진정시키고 완화"},
    "dullness": {"ko": "칙칙함개선", "desc": "생기 없는 피부를 환하게 개선"},
    "fine lines": {"ko": "잔주름", "desc": "눈가, 입가 등의 잔주름을 케어"},
    "radiance": {"ko": "광채", "desc": "피부에 건강한 빛과 생기를 부여"},
    "repair": {"ko": "리페어", "desc": "손상된 피부를 회복하고 재생"},
    "barrier repair": {"ko": "장벽회복", "desc": "약해진 피부 장벽을 복구하고 강화"},
    "dark spot": {"ko": "다크스팟", "desc": "기미, 잡티 등 색소 침착을 개선"},
    "irritation": {"ko": "자극완화", "desc": "외부 자극으로 인한 피부 불편함을 완화"},
    "sensitivity": {"ko": "민감케어", "desc": "민감해진 피부를 케어하고 강화"},
    "oil control": {"ko": "유분조절", "desc": "과도한 피지 분비를 조절"},
    "rejuvenating": {"ko": "활력부여", "desc": "지친 피부에 새로운 활력을 부여"},
    "nourishing": {"ko": "영양공급", "desc": "피부에 필요한 영양분을 공급"},
    "uneven tone": {"ko": "피부톤균일", "desc": "불균일한 피부톤을 고르게 개선"},

    # Mood/Visual
    "glass skin": {"ko": "광채피부", "desc": "유리처럼 맑고 투명한 피부 표현을 추구하는 K-뷰티 트렌드"},
    "dewy": {"ko": "촉촉광", "desc": "물광처럼 촉촉하고 윤기 나는 피부 마무리"},
    "lightweight": {"ko": "가벼운", "desc": "피부에 부담 없이 가볍게 흡수되는 제형"},
    "gentle": {"ko": "순한", "desc": "민감한 피부에도 자극 없이 사용 가능"},
    "natural": {"ko": "자연주의", "desc": "자연 유래 성분 중심의 클린 뷰티 지향"},
    "vegan": {"ko": "비건", "desc": "동물성 원료를 사용하지 않은 윤리적 뷰티"},
    "k-beauty": {"ko": "K뷰티", "desc": "한국 화장품의 혁신적인 성분과 기술"},
    "korean": {"ko": "코리안뷰티", "desc": "한국 스킨케어의 다단계 루틴과 혁신"},
    "luxury": {"ko": "럭셔리", "desc": "프리미엄 성분과 고급스러운 사용감"},
    "luxurious": {"ko": "럭셔리", "desc": "고급스럽고 풍부한 텍스처"},
    "clinical": {"ko": "클리니컬", "desc": "피부과 수준의 검증된 효과"},
    "dermatologist": {"ko": "더마", "desc": "피부과 전문의가 인정한 제품"},
    "matte": {"ko": "매트", "desc": "유분기 없이 보송보송한 마무리"},
    "radiant": {"ko": "래디언트", "desc": "빛나고 환한 피부 표현"},
    "bouncy": {"ko": "탱글", "desc": "탄력 있고 쫀쫀한 피부 느낌"},
    "velvet": {"ko": "벨벳", "desc": "벨벳처럼 부드럽고 매끄러운 피부결"},
    "glossy": {"ko": "글로시", "desc": "윤기 있고 반짝이는 마무리"},
    "silky": {"ko": "실키", "desc": "실크처럼 매끄럽고 부드러운 텍스처"},
    "professional": {"ko": "프로페셔널", "desc": "전문가 수준의 고효능 제품"},
    "premium": {"ko": "프리미엄", "desc": "고급 원료와 기술을 적용한 제품"},
    "clean beauty": {"ko": "클린뷰티", "desc": "유해 성분 없이 안전한 성분만 사용"},
    "minimalist": {"ko": "미니멀", "desc": "최소한의 성분으로 최대 효과 추구"},
}

# 카테고리별 키워드 매핑
CATEGORY_KEYWORDS = {
    "Skincare": {
        "ingredients": ["hyaluronic acid", "niacinamide", "retinol", "vitamin c", "snail mucin",
                       "centella", "ceramide", "peptide", "salicylic acid", "squalane"],
        "formulas": ["serum", "cream", "toner", "essence", "ampoule", "mask", "cleanser"],
        "effects": ["hydrating", "anti-aging", "brightening", "soothing", "firming", "glow", "pore"],
        "mood": ["glass skin", "dewy", "lightweight", "k-beauty", "clean beauty"]
    },
    "Makeup": {
        "ingredients": ["vitamin e", "hyaluronic acid", "niacinamide", "collagen", "peptide"],
        "formulas": ["foundation", "concealer", "powder", "lipstick", "mascara", "blush", "primer"],
        "effects": ["long-lasting", "coverage", "brightening", "moisturizing", "smoothing"],
        "mood": ["natural", "dewy", "matte", "glossy", "radiant"]
    },
    "Haircare": {
        "ingredients": ["keratin", "argan oil", "biotin", "collagen", "protein", "coconut oil"],
        "formulas": ["shampoo", "conditioner", "hair mask", "serum", "oil", "treatment"],
        "effects": ["moisturizing", "strengthening", "repair", "volume", "smoothing", "shine"],
        "mood": ["silky", "bouncy", "natural", "professional", "luxurious"]
    },
    "Bodycare": {
        "ingredients": ["shea butter", "coconut oil", "vitamin e", "aloe vera", "glycerin", "ceramide"],
        "formulas": ["lotion", "cream", "oil", "scrub", "body wash", "butter"],
        "effects": ["moisturizing", "smoothing", "firming", "nourishing", "exfoliation"],
        "mood": ["luxurious", "natural", "gentle", "relaxing", "refreshing"]
    }
}

def update_keywords_with_translations():
    """키워드에 한국어 번역과 설명 추가"""
    print("=== Updating keywords with Korean translations ===")

    updated_count = 0
    for keyword, data in KEYWORD_TRANSLATIONS.items():
        result = db.processed_keywords.update_many(
            {"keyword": keyword},
            {"$set": {
                "koreanName": data["ko"],
                "description": data["desc"]
            }}
        )
        if result.modified_count > 0:
            updated_count += result.modified_count

    print(f"  Updated {updated_count} keywords")

def limit_sns_keywords():
    """SNS 플랫폼 키워드를 5개로 제한"""
    print("\n=== Limiting SNS platform keywords to 5 ===")

    for doc in db.sns_platform_stats.find({"country": "usa"}):
        keywords = doc.get("keywords", [])
        if len(keywords) > 5:
            # 상위 5개만 유지
            top_keywords = sorted(keywords, key=lambda x: x.get("value", 0), reverse=True)[:5]
            db.sns_platform_stats.update_one(
                {"_id": doc["_id"]},
                {"$set": {"keywords": top_keywords}}
            )

    print("  Done")

def add_categories():
    """Makeup, Haircare, Bodycare 카테고리 추가"""
    print("\n=== Adding new categories ===")

    categories = ["Makeup", "Haircare", "Bodycare"]

    for category in categories:
        cat_keywords = CATEGORY_KEYWORDS.get(category, {})

        # 1. processed_keywords 추가
        keywords_to_insert = []
        for kw_type, keywords in cat_keywords.items():
            db_type = "ingredient" if kw_type == "ingredients" else kw_type.rstrip('s')
            if kw_type == "formulas":
                db_type = "formulas"
            elif kw_type == "effects":
                db_type = "effects"

            for kw in keywords:
                trans = KEYWORD_TRANSLATIONS.get(kw, {"ko": kw, "desc": ""})
                keywords_to_insert.append({
                    "keyword": kw,
                    "keywordType": db_type,
                    "koreanName": trans["ko"],
                    "description": trans["desc"],
                    "country": "usa",
                    "category": category,
                    "score": random.randint(60, 100),
                    "trendLevel": random.choice(["Actionable", "Growing", "Early"]),
                    "productCount": random.randint(5, 30),
                    "reviewCount": random.randint(50, 500),
                    "avgRating": round(random.uniform(3.5, 4.8), 2),
                    "effects": [],
                    "extractedAt": datetime.now(),
                    "processedAt": datetime.now()
                })

        if keywords_to_insert:
            db.processed_keywords.insert_many(keywords_to_insert)
            print(f"  Added {len(keywords_to_insert)} keywords for {category}")

        # 2. sns_platform_stats 추가
        platforms = ["YouTube", "Instagram", "Amazon"]
        for platform in platforms:
            platform_keywords = []
            all_kws = cat_keywords.get("ingredients", []) + cat_keywords.get("effects", [])
            for kw in random.sample(all_kws, min(5, len(all_kws))):
                trans = KEYWORD_TRANSLATIONS.get(kw, {"ko": kw})
                platform_keywords.append({
                    "keyword": kw,
                    "name": kw,
                    "koreanName": trans["ko"],
                    "value": round(random.uniform(100, 500), 1),
                    "change": random.randint(-20, 30),
                    "type": "ingredient" if kw in cat_keywords.get("ingredients", []) else "effects"
                })

            db.sns_platform_stats.insert_one({
                "platform": platform,
                "country": "usa",
                "category": category,
                "keywords": platform_keywords,
                "date": datetime.now(),
                "calculatedAt": datetime.now()
            })

        print(f"  Added SNS stats for {category}")

        # 3. whitespace_products 추가
        whitespace_products = []
        for i in range(3):
            whitespace_products.append({
                "productId": f"{category.lower()}-korean-{i+1}",
                "productName": f"{category} Korean Product {i+1}",
                "brand": random.choice(["Innisfree", "Etude House", "Missha", "Sulwhasoo"]),
                "country": "usa",
                "category": category,
                "type": "korean",
                "image_url": "https://via.placeholder.com/300x300?text=K-Beauty",
                "price": f"${random.randint(15, 50)}.00",
                "score": random.randint(70, 95),
                "reviewCount": random.randint(100, 1000),
                "keywords": random.sample(cat_keywords.get("ingredients", []), min(3, len(cat_keywords.get("ingredients", [])))),
                "createdAt": datetime.now()
            })
            whitespace_products.append({
                "productId": f"{category.lower()}-overseas-{i+1}",
                "productName": f"{category} Overseas Product {i+1}",
                "brand": random.choice(["L'Oreal", "Maybelline", "Olay", "Neutrogena"]),
                "country": "usa",
                "category": category,
                "type": "overseas",
                "image_url": "https://via.placeholder.com/300x300?text=US-Brand",
                "price": f"${random.randint(10, 40)}.00",
                "score": random.randint(70, 95),
                "reviewCount": random.randint(500, 5000),
                "keywords": random.sample(cat_keywords.get("ingredients", []), min(3, len(cat_keywords.get("ingredients", [])))),
                "createdAt": datetime.now()
            })

        db.whitespace_products.insert_many(whitespace_products)
        print(f"  Added whitespace products for {category}")

def update_existing_skincare_keywords():
    """기존 Skincare 키워드에 한국어 번역 추가"""
    print("\n=== Updating existing Skincare keywords ===")

    updated = 0
    for keyword, data in KEYWORD_TRANSLATIONS.items():
        result = db.processed_keywords.update_many(
            {"keyword": keyword, "country": "usa"},
            {"$set": {
                "koreanName": data["ko"],
                "description": data["desc"]
            }}
        )
        updated += result.modified_count

    print(f"  Updated {updated} keywords")

def update_sns_keywords_format():
    """SNS 키워드 포맷 업데이트 (koreanName 추가)"""
    print("\n=== Updating SNS keywords format ===")

    for doc in db.sns_platform_stats.find({"country": "usa"}):
        keywords = doc.get("keywords", [])
        updated_keywords = []

        for kw in keywords[:5]:  # 5개로 제한
            name = kw.get("name") or kw.get("keyword", "")
            trans = KEYWORD_TRANSLATIONS.get(name, {"ko": name, "desc": ""})

            updated_keywords.append({
                "keyword": name,
                "name": name,
                "koreanName": trans["ko"],
                "value": kw.get("value", 0),
                "change": kw.get("change", 0),
                "type": kw.get("type", "ingredient")
            })

        db.sns_platform_stats.update_one(
            {"_id": doc["_id"]},
            {"$set": {"keywords": updated_keywords}}
        )

    print("  Done")

def main():
    print("=" * 50)
    print("  USA Data Fix Script")
    print("=" * 50)

    # 1. 키워드 번역 업데이트
    update_keywords_with_translations()

    # 2. 기존 Skincare 키워드 업데이트
    update_existing_skincare_keywords()

    # 3. SNS 키워드 5개 제한 및 포맷 업데이트
    update_sns_keywords_format()

    # 4. 새 카테고리 추가
    add_categories()

    print("\n" + "=" * 50)
    print("  Complete!")
    print("=" * 50)

if __name__ == "__main__":
    main()
