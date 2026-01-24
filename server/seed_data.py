"""
Seed MongoDB with realistic cosmetics data for 8-week trend analysis.
Creates data in raw_retail_sales, raw_reviews, raw_sns_posts collections.
"""

from pymongo import MongoClient
from datetime import datetime, timedelta
import random

client = MongoClient('mongodb://localhost:27017')
db = client['amore']

# Clear existing data
db.raw_retail_sales.drop()
db.raw_reviews.drop()
db.raw_sns_posts.drop()
db.processed_keywords.drop()
db.trends.drop()
db.sns_platform_stats.drop()
db.leaderboard.drop()
db.combination_leaderboard.drop()

print("🗑️  기존 데이터 삭제 완료")

# === Configuration ===
NUM_WEEKS = 8
BASE_DATE = datetime.now()
COUNTRY = "usa"
CATEGORY = "Skincare"

# === Realistic Product Data ===
PRODUCTS = [
    {
        "productId": "SKU-001",
        "productName": "CeraVe Hydrating Facial Cleanser",
        "brand": "CeraVe",
        "description": "Ceramide-infused hydrating cleanser with hyaluronic acid for dry to normal skin. Gentle foaming formula that removes dirt and excess oil without disrupting the skin barrier. Contains 3 essential ceramides and MVE technology for 24-hour hydration.",
        "baseRank": 3,
        "baseSales": 15000
    },
    {
        "productId": "SKU-002",
        "productName": "The Ordinary Niacinamide 10% + Zinc 1%",
        "brand": "The Ordinary",
        "description": "High-strength niacinamide serum with zinc PCA for pore minimizing and oil control. Vitamin B3 formula targets blemishes, congestion, and uneven skin tone. Lightweight water-based texture absorbs quickly.",
        "baseRank": 5,
        "baseSales": 12000
    },
    {
        "productId": "SKU-003",
        "productName": "Paula's Choice 2% BHA Liquid Exfoliant",
        "brand": "Paula's Choice",
        "description": "Salicylic acid BHA exfoliant for blackheads and enlarged pores. Leave-on exfoliator unclogs pores and smooths wrinkles. Green tea extract provides antioxidant protection. Suitable for all skin types.",
        "baseRank": 8,
        "baseSales": 9500
    },
    {
        "productId": "SKU-004",
        "productName": "COSRX Advanced Snail 96 Mucin Power Essence",
        "brand": "COSRX",
        "description": "96% snail mucin essence for intense hydration and skin repair. Helps reduce hyperpigmentation, fine lines, and acne scars. Lightweight gel-like texture with snail secretion filtrate. Korean skincare essential for glass skin effect.",
        "baseRank": 2,
        "baseSales": 18000
    },
    {
        "productId": "SKU-005",
        "productName": "La Roche-Posay Cicaplast Baume B5+",
        "brand": "La Roche-Posay",
        "description": "Multi-purpose repair balm with panthenol (vitamin B5) and madecassoside. Soothes irritated skin, repairs damaged skin barrier, and accelerates healing. Suitable for sensitive skin post-procedure recovery.",
        "baseRank": 12,
        "baseSales": 7500
    },
    {
        "productId": "SKU-006",
        "productName": "Drunk Elephant Protini Polypeptide Cream",
        "brand": "Drunk Elephant",
        "description": "Signal peptide complex moisturizer with amino acids and pygmy waterlily. Protein-based anti-aging cream that firms and improves skin texture. Contains matrixyl peptide blend and soybean folic acid ferment extract.",
        "baseRank": 15,
        "baseSales": 6800
    },
    {
        "productId": "SKU-007",
        "productName": "Glow Recipe Watermelon Glow Niacinamide Dew Drops",
        "brand": "Glow Recipe",
        "description": "Niacinamide serum with watermelon extract and hyaluronic acid for dewy glow. Lightweight highlighting serum that hydrates and minimizes pores. Contains moringa seed oil and peony root extract for radiance.",
        "baseRank": 10,
        "baseSales": 8200
    },
    {
        "productId": "SKU-008",
        "productName": "Neutrogena Hydro Boost Water Gel",
        "brand": "Neutrogena",
        "description": "Hyaluronic acid water gel moisturizer for supple, smooth skin. Oil-free formula instantly quenches dry skin. Unique aqua-gel technology locks in hydration. Absorbs quickly like a gel and provides long-lasting moisture.",
        "baseRank": 7,
        "baseSales": 10500
    },
    {
        "productId": "SKU-009",
        "productName": "Tatcha The Dewy Skin Cream",
        "brand": "Tatcha",
        "description": "Rich cream with Japanese purple rice, Okinawa algae blend, and hyaluronic acid. Plumping moisturizer delivers dewy, bouncy skin. Ceramide complex and botanical extracts provide anti-aging benefits.",
        "baseRank": 20,
        "baseSales": 5500
    },
    {
        "productId": "SKU-010",
        "productName": "Beauty of Joseon Glow Serum: Propolis + Niacinamide",
        "brand": "Beauty of Joseon",
        "description": "Propolis and niacinamide glow serum for brightening and hydration. 60% propolis extract soothes and repairs. Contains grain ferment filtrate and niacinamide for luminous skin tone. Korean beauty bestseller.",
        "baseRank": 4,
        "baseSales": 14000
    },
    {
        "productId": "SKU-011",
        "productName": "Supergoop! Unseen Sunscreen SPF 40",
        "brand": "Supergoop!",
        "description": "Invisible, weightless, scentless broad-spectrum SPF 40 sunscreen. Oil-free, makeup-gripping primer texture. Contains red algae, frankincense, and meadowfoam seed for antioxidant protection.",
        "baseRank": 6,
        "baseSales": 11000
    },
    {
        "productId": "SKU-012",
        "productName": "Laneige Water Sleeping Mask",
        "brand": "Laneige",
        "description": "Overnight gel sleeping mask with SLEEP-TOX purifying technology. Hydro ionized mineral water delivers intense moisture. Contains squalane and probiotics for skin barrier repair during sleep.",
        "baseRank": 14,
        "baseSales": 7000
    },
    {
        "productId": "SKU-013",
        "productName": "The Ordinary AHA 30% + BHA 2% Peeling Solution",
        "brand": "The Ordinary",
        "description": "Chemical peeling solution with alpha hydroxy acids and beta hydroxy acids. Glycolic acid, lactic acid, and salicylic acid for deep exfoliation. Tasmanian pepperberry derivative reduces irritation.",
        "baseRank": 9,
        "baseSales": 9000
    },
    {
        "productId": "SKU-014",
        "productName": "Innisfree Green Tea Seed Serum",
        "brand": "Innisfree",
        "description": "Hydrating serum with Jeju green tea seed extract and amino acid complex. Dual-moisture formula with green tea water and green tea seed oil. Builds moisture barrier and provides antioxidant protection.",
        "baseRank": 18,
        "baseSales": 5800
    },
    {
        "productId": "SKU-015",
        "productName": "Sunday Riley Good Genes Lactic Acid Treatment",
        "brand": "Sunday Riley",
        "description": "Lactic acid exfoliant treatment for instant visible results. Purified grade lactic acid at high concentration clarifies and smooths. Licorice root and lemongrass provide brightening. Anti-aging and glow-boosting overnight treatment.",
        "baseRank": 22,
        "baseSales": 4800
    },
    {
        "productId": "SKU-016",
        "productName": "SKIN1004 Madagascar Centella Ampoule",
        "brand": "SKIN1004",
        "description": "100% centella asiatica extract ampoule for calming and soothing. Madagascar-sourced centella addresses redness, sensitivity, and inflammation. Lightweight hydrating formula strengthens skin barrier.",
        "baseRank": 11,
        "baseSales": 8000
    },
    {
        "productId": "SKU-017",
        "productName": "Kiehl's Ultra Facial Cream",
        "brand": "Kiehl's",
        "description": "Squalane and glycerin enriched 24-hour moisturizing cream. Lightweight yet deeply hydrating formula for all skin types. Glacial glycoprotein and olive-derived squalane for lasting moisture barrier.",
        "baseRank": 16,
        "baseSales": 6500
    },
    {
        "productId": "SKU-018",
        "productName": "ANUA Heartleaf 77% Soothing Toner",
        "brand": "ANUA",
        "description": "77% heartleaf (houttuynia cordata) extract toner for sensitive and acne-prone skin. Mildly acidic pH balancing formula calms redness and irritation. Contains panthenol and hyaluronic acid for gentle hydration.",
        "baseRank": 1,
        "baseSales": 20000
    },
    {
        "productId": "SKU-019",
        "productName": "Drunk Elephant T.L.C. Sukari Babyfacial",
        "brand": "Drunk Elephant",
        "description": "25% AHA and 2% BHA acid mask for professional-level resurfacing at home. Glycolic, tartaric, lactic, citric acids with salicylic acid. Chickpea flour and pumpkin ferment for skin brightening.",
        "baseRank": 25,
        "baseSales": 4200
    },
    {
        "productId": "SKU-020",
        "productName": "Missha Time Revolution First Treatment Essence",
        "brand": "Missha",
        "description": "Fermented yeast extract (saccharomyces ferment filtrate) first treatment essence. 97% fermented ingredients for brightening, anti-aging, and hydration. Niacinamide and bifida ferment lysate for radiant skin.",
        "baseRank": 13,
        "baseSales": 7200
    },
]

# === Review templates ===
REVIEW_TEMPLATES = {
    "positive": [
        "This product is amazing for my {effect}! I've been using it for {weeks} weeks and can already see results. The {ingredient} really works.",
        "Love the {formula} texture - absorbs quickly and leaves my skin feeling {effect}. Will definitely repurchase!",
        "After trying so many products, this is the one that finally helped with my {effect}. The {ingredient} concentration is perfect.",
        "My skin has never looked better since I started using this. {effect} has improved dramatically. The {ingredient} is a game changer.",
        "Great value for the price. {ingredient} works well for {effect}. The {formula} formula is lightweight and non-greasy.",
        "Holy grail product! The {ingredient} combined with {ingredient2} gives incredible {effect}. My skin is glowing!",
        "Noticed visible improvement in {effect} within the first week. The {formula} texture is luxurious and absorbs beautifully.",
        "Been using this morning and night for {weeks} weeks. My {effect} concerns have significantly reduced. Love the {formula} consistency.",
    ],
    "neutral": [
        "Decent product. The {ingredient} seems to work but results are slow. {formula} texture is okay.",
        "It's fine for the price. Helps a bit with {effect} but nothing revolutionary. The {formula} format is convenient.",
        "Average product. Some improvement in {effect} after {weeks} weeks but expected more from {ingredient}.",
    ],
    "negative": [
        "Didn't work for my skin type. The {ingredient} caused some irritation. Returning this.",
        "Overpriced for what it does. Saw no improvement in {effect} after {weeks} weeks of consistent use.",
    ]
}

EFFECTS = ["hydration", "pore minimizing", "brightening", "anti-aging", "skin barrier repair",
           "acne control", "soothing", "exfoliation", "wrinkle reduction", "oil control",
           "dark spot fading", "glass skin", "dewy glow", "firmness", "radiance"]

INGREDIENTS = ["hyaluronic acid", "niacinamide", "retinol", "vitamin C", "salicylic acid",
               "ceramides", "peptides", "snail mucin", "centella asiatica", "propolis",
               "AHA/BHA", "squalane", "green tea", "lactic acid", "panthenol"]

FORMULAS = ["serum", "cream", "gel", "toner", "ampoule", "essence", "balm", "mask",
            "lotion", "emulsion"]

# === SNS Content Templates ===
SNS_TEMPLATES = {
    "Instagram": [
        "My current skincare routine featuring {product} 🧴✨ The {ingredient} is seriously life-changing for {effect}! #skincare #beauty #{hashtag}",
        "Before & after using {product} for {weeks} weeks! The {effect} improvement is unreal 😍 #{hashtag} #skincareaddict",
        "Morning routine dump: cleanser → {product} → SPF ☀️ The {ingredient} in this is *chef's kiss* #{hashtag}",
    ],
    "TikTok": [
        "POV: You finally found the right {ingredient} product 😭 {product} review - {weeks} weeks update! The {effect} is real #{hashtag}",
        "Viral skincare product test: {product} with {ingredient}. Does it actually work for {effect}? Let me tell you... #{hashtag} #skincaretok",
        "Dermatologist reacts to {product} ingredients: {ingredient} for {effect}. Here's what you need to know #{hashtag}",
    ],
    "YouTube": [
        "{product} Honest Review - {weeks} Week Update | {ingredient} for {effect} | Is it worth the hype?",
        "Best {ingredient} Products for {effect} in 2024 | Featuring {product} | Full Routine",
        "Testing viral K-beauty products: {product} with {ingredient} | {effect} Results",
    ],
    "Amazon": [
        "Verified Purchase: Been using {product} for {weeks} weeks now. The {ingredient} really helps with {effect}. Would recommend for anyone looking for a good {formula}.",
        "Excellent {formula} product. {ingredient} concentration is effective for {effect}. Fast shipping.",
        "{product} is my go-to for {effect}. The {ingredient} formula absorbs well. Repurchased 3 times already.",
    ],
    "Shopee": [
        "Love this {product}! Great for {effect}, the {ingredient} works so well. Fast delivery from Korea 🇰🇷 #{hashtag}",
        "Authentic {product} review: {ingredient} serum helps with {effect}. Texture is nice, not sticky #{hashtag}",
    ],
    "Cosme": [
        "{product}を使って{weeks}週間。{ingredient}のおかげで{effect}が改善された気がします。テクスチャーも軽くて使いやすい。",
        "{ingredient}配合の{product}、{effect}効果を実感中。毎日のスキンケアに欠かせなくなりました。",
    ]
}

HASHTAGS = ["skincare", "glowup", "kbeauty", "skincareRoutine", "beauty", "selfcare",
            "glassSkin", "skincareTips", "cleanBeauty", "skinHealth", "retinol",
            "niacinamide", "hyaluronicAcid", "ceramides", "snailMucin", "centella"]


def generate_weekly_dates(week_num):
    """Generate random dates within a specific week"""
    week_start = BASE_DATE - timedelta(weeks=(NUM_WEEKS - week_num))
    return [week_start + timedelta(days=random.randint(0, 6), hours=random.randint(0, 23)) for _ in range(random.randint(3, 7))]


def generate_retail_data():
    """Generate 8 weeks of retail sales data"""
    print("📦 Retail Sales 데이터 생성 중...")
    records = []

    for week in range(NUM_WEEKS):
        week_date = BASE_DATE - timedelta(weeks=(NUM_WEEKS - 1 - week))

        for product in PRODUCTS:
            # Simulate rank changes over time (some products trending up)
            rank_variance = random.randint(-3, 3)
            trending_boost = 0

            # Make certain products trend upward
            if product["productId"] in ["SKU-004", "SKU-018", "SKU-010", "SKU-016"]:
                trending_boost = -max(0, (week - 3))  # Gets better rank in later weeks

            current_rank = max(1, product["baseRank"] + rank_variance + trending_boost)

            # Sales volume grows for trending products
            sales_growth = 1 + (week * 0.05 if product["productId"] in ["SKU-004", "SKU-018", "SKU-010"] else week * 0.01)
            current_sales = int(product["baseSales"] * sales_growth / NUM_WEEKS + random.randint(-200, 500))

            records.append({
                "productId": product["productId"],
                "productName": product["productName"],
                "brand": product["brand"],
                "description": product["description"],
                "salesRank": current_rank,
                "salesVolume": current_sales,
                "country": COUNTRY,
                "category": CATEGORY,
                "date": week_date,
                "week": week + 1
            })

    db.raw_retail_sales.insert_many(records)
    print(f"  ✅ {len(records)}개 레코드 삽입")
    return records


def generate_reviews():
    """Generate product reviews spanning 8 weeks"""
    print("📝 Reviews 데이터 생성 중...")
    records = []

    for product in PRODUCTS:
        # Each product gets 5-15 reviews across 8 weeks
        num_reviews = random.randint(5, 15)

        for _ in range(num_reviews):
            week = random.randint(0, NUM_WEEKS - 1)
            review_date = BASE_DATE - timedelta(weeks=(NUM_WEEKS - 1 - week), days=random.randint(0, 6))

            # Determine sentiment
            sentiment_roll = random.random()
            if sentiment_roll < 0.65:
                sentiment = "positive"
                rating = random.choice([4, 5, 5, 5])
            elif sentiment_roll < 0.9:
                sentiment = "neutral"
                rating = random.choice([3, 3, 4])
            else:
                sentiment = "negative"
                rating = random.choice([1, 2, 2])

            # Pick random template
            template = random.choice(REVIEW_TEMPLATES[sentiment])

            # Fill template
            ingredient = random.choice(INGREDIENTS)
            ingredient2 = random.choice([i for i in INGREDIENTS if i != ingredient])
            effect = random.choice(EFFECTS)
            formula = random.choice(FORMULAS)
            weeks = random.randint(1, 8)

            content = template.format(
                ingredient=ingredient,
                ingredient2=ingredient2,
                effect=effect,
                formula=formula,
                weeks=weeks
            )

            records.append({
                "productId": product["productId"],
                "productName": product["productName"],
                "brand": product["brand"],
                "content": content,
                "rating": rating,
                "sentiment": sentiment,
                "country": COUNTRY,
                "postedAt": review_date,
                "week": week + 1
            })

    db.raw_reviews.insert_many(records)
    print(f"  ✅ {len(records)}개 레코드 삽입")
    return records


def generate_sns_posts():
    """Generate SNS posts across multiple platforms spanning 8 weeks"""
    print("📱 SNS Posts 데이터 생성 중...")
    records = []

    platforms_weight = {
        "Instagram": 40,
        "TikTok": 35,
        "YouTube": 15,
        "Amazon": 20,
        "Shopee": 10,
        "Cosme": 8
    }

    for platform, post_count in platforms_weight.items():
        templates = SNS_TEMPLATES[platform]

        for _ in range(post_count):
            week = random.randint(0, NUM_WEEKS - 1)
            post_date = BASE_DATE - timedelta(weeks=(NUM_WEEKS - 1 - week), days=random.randint(0, 6))

            product = random.choice(PRODUCTS)
            template = random.choice(templates)

            ingredient = random.choice(INGREDIENTS)
            effect = random.choice(EFFECTS)
            formula = random.choice(FORMULAS)
            hashtag = random.choice(HASHTAGS)
            weeks = random.randint(1, 8)

            content = template.format(
                product=product["productName"],
                ingredient=ingredient,
                effect=effect,
                formula=formula,
                hashtag=hashtag,
                weeks=weeks
            )

            # Generate hashtags
            post_hashtags = random.sample(HASHTAGS, random.randint(2, 5))
            post_hashtags.append(ingredient.replace(" ", ""))

            # Engagement metrics
            engagement = {
                "likes": random.randint(50, 50000) if platform in ["Instagram", "TikTok"] else random.randint(5, 500),
                "comments": random.randint(5, 2000) if platform in ["Instagram", "TikTok"] else random.randint(1, 50),
                "shares": random.randint(0, 5000) if platform == "TikTok" else random.randint(0, 200),
            }

            records.append({
                "platform": platform,
                "content": content,
                "hashtags": post_hashtags,
                "productMentioned": product["productName"],
                "productId": product["productId"],
                "engagement": engagement,
                "country": COUNTRY,
                "postedAt": post_date,
                "week": week + 1
            })

    db.raw_sns_posts.insert_many(records)
    print(f"  ✅ {len(records)}개 레코드 삽입")
    return records


def create_indexes():
    """Create necessary indexes"""
    print("🔧 인덱스 생성 중...")

    db.raw_retail_sales.create_index([("productId", 1)])
    db.raw_retail_sales.create_index([("country", 1), ("category", 1), ("date", 1)])
    db.raw_retail_sales.create_index([("salesRank", 1)])

    db.raw_reviews.create_index([("productId", 1)])
    db.raw_reviews.create_index([("postedAt", 1)])
    db.raw_reviews.create_index([("country", 1)])

    db.raw_sns_posts.create_index([("platform", 1)])
    db.raw_sns_posts.create_index([("postedAt", 1)])
    db.raw_sns_posts.create_index([("country", 1)])
    db.raw_sns_posts.create_index([("content", "text")])

    db.processed_keywords.create_index([("keyword", 1)])
    db.processed_keywords.create_index([("keywordType", 1)])

    db.trends.create_index([("combination", 1)])
    db.trends.create_index([("score", -1)])
    db.trends.create_index([("category", 1)])

    print("  ✅ 인덱스 생성 완료")


if __name__ == "__main__":
    print("🚀 AMORE DB 시딩 시작...")
    print(f"   기간: {NUM_WEEKS}주 (가상)")
    print(f"   국가: {COUNTRY}")
    print(f"   카테고리: {CATEGORY}")
    print(f"   제품 수: {len(PRODUCTS)}")
    print()

    generate_retail_data()
    generate_reviews()
    generate_sns_posts()
    create_indexes()

    print()
    print("=" * 50)
    print("✅ 시딩 완료!")
    print(f"   raw_retail_sales: {db.raw_retail_sales.count_documents({})} docs")
    print(f"   raw_reviews: {db.raw_reviews.count_documents({})} docs")
    print(f"   raw_sns_posts: {db.raw_sns_posts.count_documents({})} docs")
    print("=" * 50)
