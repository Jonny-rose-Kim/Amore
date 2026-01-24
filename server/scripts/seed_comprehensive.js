/**
 * 종합 시드 데이터 생성 스크립트
 * 5개 나라 × 7개 카테고리 × 4개 키워드 타입 × 3개 트렌드 레벨
 * 실제 플랫폼 데이터 기반 현실적 트렌드 점수
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DATABASE || 'amore';

// === 나라별 키워드 데이터 ===
const countryKeywords = {
  usa: {
    platform: { retail: 'Amazon', sns: ['YouTube', 'Instagram', 'TikTok'] },
    Skincare: {
      ingredient: {
        Actionable: [
          { keyword: 'Snail Mucin', score: 96, products: ['COSRX Snail Mucin 96% Power Repairing Essence'] },
          { keyword: 'Hyaluronic Acid', score: 94, products: ['The Ordinary Hyaluronic Acid 2% + B5'] },
          { keyword: 'Niacinamide', score: 93, products: ['The Ordinary Niacinamide 10% + Zinc 1%'] },
          { keyword: 'Ceramides', score: 91, products: ['CeraVe Moisturizing Cream'] },
          { keyword: 'Retinol', score: 89, products: ['CeraVe Resurfacing Retinol Serum'] },
        ],
        Growing: [
          { keyword: 'Peptides', score: 82, products: ['The Ordinary Multi-Peptide Serum'] },
          { keyword: 'Vitamin C', score: 80, products: ['TruSkin Vitamin C Serum'] },
          { keyword: 'Centella Asiatica', score: 78, products: ['SKIN1004 Centella Ampoule'] },
          { keyword: 'PDRN', score: 75, products: ['BIODANCE Bio-Collagen Mask'] },
          { keyword: 'Bakuchiol', score: 73, products: ['Herbivore Bakuchiol Serum'] },
        ],
        Early: [
          { keyword: 'Exosomes', score: 65, products: ['AESTURA A-Cica 365 Calming Cream'] },
          { keyword: 'Signal Peptides', score: 62, products: ['Drunk Elephant Protini Polypeptide'] },
          { keyword: 'DNA Repair Enzymes', score: 58, products: ['iS Clinical Active Serum'] },
          { keyword: 'Bio-fermented Actives', score: 55, products: ['SK-II Facial Treatment Essence'] },
          { keyword: 'Mushroom Complex', score: 52, products: ['Origins Mega-Mushroom Relief'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Serum', score: 95, products: ['COSRX Snail Mucin Essence'] },
          { keyword: 'Gel Cream', score: 90, products: ['Neutrogena Hydro Boost Water Gel'] },
          { keyword: 'Sheet Mask', score: 88, products: ['BIODANCE Bio-Collagen Real Deep Mask'] },
          { keyword: 'Toner', score: 86, products: ['The Ordinary Glycolic Acid 7% Toner'] },
          { keyword: 'Ampoule', score: 84, products: ['SKIN1004 Centella Ampoule'] },
        ],
        Growing: [
          { keyword: 'Essence', score: 79, products: ['SK-II Facial Treatment Essence'] },
          { keyword: 'Balm', score: 76, products: ['COSRX Balancium Comfort Ceramide Cream'] },
          { keyword: 'Mist', score: 74, products: ['Mario Badescu Facial Spray'] },
          { keyword: 'Lightweight Cream', score: 72, products: ['CeraVe Daily Moisturizing Lotion'] },
          { keyword: 'Oil Serum', score: 70, products: ['The Ordinary Rosehip Seed Oil'] },
        ],
        Early: [
          { keyword: 'Overnight Mask', score: 64, products: ['Laneige Water Sleeping Mask'] },
          { keyword: 'Powder Wash', score: 60, products: ['Tosowoong Enzyme Powder Wash'] },
          { keyword: 'Jelly Mask', score: 57, products: ['I Dew Care Sugar Kitten Mask'] },
          { keyword: 'Oil-to-Foam', score: 54, products: ['COSRX Full Fit Propolis Synergy Toner'] },
          { keyword: 'Stick Balm', score: 51, products: ['Dr. Jart+ Cicapair Tiger Grass Camo Drops'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Hydrating', score: 95, products: ['CeraVe Hydrating Facial Cleanser'] },
          { keyword: 'Barrier Repair', score: 92, products: ['CeraVe Moisturizing Cream'] },
          { keyword: 'Anti-aging', score: 90, products: ['The Ordinary Retinol 0.5% in Squalane'] },
          { keyword: 'Brightening', score: 88, products: ['TruSkin Vitamin C Serum'] },
          { keyword: 'Soothing', score: 85, products: ['COSRX Centella Blemish Cream'] },
        ],
        Growing: [
          { keyword: 'Glass Skin', score: 80, products: ['Beauty of Joseon Glow Serum'] },
          { keyword: 'Pore Care', score: 78, products: ['Paula\'s Choice 2% BHA Exfoliant'] },
          { keyword: 'Firming', score: 75, products: ['Olay Regenerist Micro-Sculpting Cream'] },
          { keyword: 'Exfoliating', score: 73, products: ['The Ordinary AHA 30% + BHA 2%'] },
          { keyword: 'Dark Spot Correcting', score: 71, products: ['Good Molecules Discoloration Serum'] },
        ],
        Early: [
          { keyword: 'Longevity Skincare', score: 63, products: ['OneSkin OS-01 FACE'] },
          { keyword: 'Microbiome Balance', score: 60, products: ['TULA Probiotic Skincare'] },
          { keyword: 'Blue Light Protection', score: 57, products: ['Supergoop Unseen Sunscreen'] },
          { keyword: 'Cellular Repair', score: 54, products: ['Estee Lauder Advanced Night Repair'] },
          { keyword: 'Inflammation Control', score: 51, products: ['La Roche-Posay Cicaplast Baume'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Clean Beauty', score: 92, products: ['Drunk Elephant Protini'] },
          { keyword: 'Dermatology Vibe', score: 89, products: ['CeraVe Moisturizing Cream'] },
          { keyword: 'Glass Skin Aesthetic', score: 87, products: ['COSRX Snail Mucin Essence'] },
          { keyword: 'Clinical', score: 85, products: ['The Ordinary Niacinamide'] },
        ],
        Growing: [
          { keyword: 'Minimal Skincare', score: 78, products: ['CeraVe Hydrating Cleanser'] },
          { keyword: 'K-Beauty Layering', score: 75, products: ['Beauty of Joseon Dynasty Cream'] },
          { keyword: 'Sustainable Packaging', score: 72, products: ['Herbivore Botanicals'] },
        ],
        Early: [
          { keyword: 'Skin Cycling', score: 63, products: ['Paula\'s Choice Retinol'] },
          { keyword: 'Biotech Luxury', score: 59, products: ['Augustinus Bader The Cream'] },
          { keyword: 'Customizable Routine', score: 55, products: ['The Ordinary Regimen Builder'] },
        ]
      }
    },
    Cleansing: {
      ingredient: {
        Actionable: [
          { keyword: 'Salicylic Acid', score: 92, products: ['CeraVe SA Cleanser'] },
          { keyword: 'Hyaluronic Acid', score: 89, products: ['CeraVe Hydrating Cleanser'] },
          { keyword: 'Amino Acids', score: 86, products: ['Krave Beauty Matcha Hemp Cleanser'] },
        ],
        Growing: [
          { keyword: 'Tea Tree Oil', score: 78, products: ['The Body Shop Tea Tree Wash'] },
          { keyword: 'Glycolic Acid', score: 75, products: ['Mario Badescu Glycolic Foaming Cleanser'] },
        ],
        Early: [
          { keyword: 'Micellar Technology', score: 62, products: ['Garnier Micellar Water'] },
          { keyword: 'Probiotics', score: 58, products: ['TULA Purifying Cleanser'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Foaming Cleanser', score: 93, products: ['CeraVe Foaming Facial Cleanser'] },
          { keyword: 'Cleansing Oil', score: 88, products: ['DHC Deep Cleansing Oil'] },
          { keyword: 'Gel Cleanser', score: 85, products: ['La Roche-Posay Toleriane Cleanser'] },
        ],
        Growing: [
          { keyword: 'Cleansing Balm', score: 79, products: ['Banila Co Clean It Zero'] },
          { keyword: 'Micellar Water', score: 76, products: ['Bioderma Sensibio H2O'] },
        ],
        Early: [
          { keyword: 'Powder Wash', score: 63, products: ['Tosowoong Enzyme Powder Wash'] },
          { keyword: 'Gel-to-Foam', score: 59, products: ['Hada Labo Gokujyun Foam'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Deep Cleansing', score: 91, products: ['CeraVe SA Cleanser'] },
          { keyword: 'Gentle / Low pH', score: 88, products: ['COSRX Low pH Good Morning Cleanser'] },
          { keyword: 'Makeup Removal', score: 85, products: ['DHC Deep Cleansing Oil'] },
        ],
        Growing: [
          { keyword: 'Pore Care', score: 77, products: ['Paula\'s Choice CLEAR Cleanser'] },
          { keyword: 'Soothing', score: 74, products: ['Vanicream Gentle Facial Cleanser'] },
        ],
        Early: [
          { keyword: 'Non-stripping', score: 62, products: ['Krave Beauty Matcha Hemp'] },
          { keyword: 'Oil Control', score: 58, products: ['Neutrogena Oil-Free Acne Wash'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Satisfying Cleanse', score: 88, products: ['DHC Deep Cleansing Oil'] },
          { keyword: 'Clinical Clean', score: 85, products: ['CeraVe Foaming Cleanser'] },
        ],
        Growing: [
          { keyword: 'Transparent Package', score: 74, products: ['Bioderma Sensibio H2O'] },
        ],
        Early: [
          { keyword: 'Eco Refillable', score: 60, products: ['By Humankind Refill System'] },
        ]
      }
    },
    'Sun Care': {
      ingredient: {
        Actionable: [
          { keyword: 'Zinc Oxide', score: 90, products: ['EltaMD UV Clear SPF 46'] },
          { keyword: 'Niacinamide', score: 87, products: ['EltaMD UV Clear SPF 46'] },
          { keyword: 'Hyaluronic Acid', score: 84, products: ['Supergoop Unseen Sunscreen'] },
        ],
        Growing: [
          { keyword: 'Vitamin E', score: 76, products: ['La Roche-Posay Anthelios'] },
          { keyword: 'Centella', score: 73, products: ['Beauty of Joseon Relief Sun'] },
        ],
        Early: [
          { keyword: 'MBBT Filter', score: 62, products: ['Skin1004 Hyalu-Cica Sun Serum'] },
          { keyword: 'Uvinul A Plus', score: 58, products: ['Canmake Mermaid Skin Gel UV'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Sun Cream', score: 91, products: ['EltaMD UV Clear SPF 46'] },
          { keyword: 'Sun Gel', score: 87, products: ['Biore UV Aqua Rich Watery Essence'] },
          { keyword: 'Sun Stick', score: 84, products: ['Supergoop Glow Stick'] },
        ],
        Growing: [
          { keyword: 'Tone-up Cream', score: 77, products: ['Beauty of Joseon Relief Sun'] },
          { keyword: 'Sun Milk', score: 74, products: ['Anessa Perfect UV Milk'] },
        ],
        Early: [
          { keyword: 'Sun Spray', score: 61, products: ['Neutrogena Beach Defense Spray'] },
          { keyword: 'Sun Serum', score: 57, products: ['Skin1004 Hyalu-Cica Sun Serum'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'No White Cast', score: 92, products: ['Supergoop Unseen Sunscreen'] },
          { keyword: 'SPF50+ PA++++', score: 90, products: ['Biore UV Aqua Rich'] },
          { keyword: 'Non-greasy', score: 87, products: ['EltaMD UV Clear'] },
        ],
        Growing: [
          { keyword: 'Water-resistant', score: 76, products: ['Anessa Perfect UV Milk'] },
          { keyword: 'Tone-up Effect', score: 73, products: ['Beauty of Joseon Relief Sun'] },
        ],
        Early: [
          { keyword: 'Blue Light Block', score: 61, products: ['Supergoop Unseen Sunscreen'] },
          { keyword: 'Reef-friendly', score: 57, products: ['Sun Bum Mineral SPF 50'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Daily-friendly', score: 89, products: ['Supergoop Unseen Sunscreen'] },
          { keyword: 'Lightweight Feel', score: 86, products: ['Biore UV Aqua Rich'] },
        ],
        Growing: [
          { keyword: 'Mini Travel Size', score: 74, products: ['Supergoop Play SPF 50'] },
        ],
        Early: [
          { keyword: 'Eco-conscious', score: 59, products: ['Sun Bum Mineral SPF 50'] },
        ]
      }
    },
    Makeup: {
      ingredient: {
        Actionable: [
          { keyword: 'Hyaluronic Acid', score: 88, products: ['Rare Beauty Liquid Touch Foundation'] },
          { keyword: 'Vitamin E', score: 85, products: ['Charlotte Tilbury Airbrush Flawless'] },
        ],
        Growing: [
          { keyword: 'Collagen', score: 76, products: ['TIRTIR Mask Fit Red Cushion'] },
          { keyword: 'Peptides', score: 73, products: ['IT Cosmetics CC+ Cream'] },
        ],
        Early: [
          { keyword: 'Pearl Extract', score: 61, products: ['Chanel Les Beiges Foundation'] },
          { keyword: 'Silica', score: 57, products: ['Laura Mercier Translucent Powder'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Cushion Foundation', score: 91, products: ['TIRTIR Mask Fit Red Cushion'] },
          { keyword: 'Lip Tint', score: 89, products: ['Rare Beauty Soft Pinch Liquid Blush'] },
          { keyword: 'Setting Spray', score: 86, products: ['NYX Matte Finish Setting Spray'] },
        ],
        Growing: [
          { keyword: 'Liquid Foundation', score: 78, products: ['Rare Beauty Liquid Touch'] },
          { keyword: 'Stick Blush', score: 75, products: ['Milk Makeup Lip + Cheek'] },
        ],
        Early: [
          { keyword: 'Velvet Texture', score: 62, products: ['Charlotte Tilbury Matte Revolution'] },
          { keyword: 'Loose Powder', score: 58, products: ['Laura Mercier Translucent Powder'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Long-lasting', score: 92, products: ['TIRTIR Mask Fit Red Cushion'] },
          { keyword: 'Dewy Finish', score: 89, products: ['Charlotte Tilbury Flawless Filter'] },
          { keyword: 'Full Coverage', score: 86, products: ['Rare Beauty Liquid Touch'] },
        ],
        Growing: [
          { keyword: 'Matte Finish', score: 77, products: ['Maybelline Fit Me Matte'] },
          { keyword: 'Smudge-proof', score: 74, products: ['Maybelline Lash Sensational'] },
        ],
        Early: [
          { keyword: 'Color Correcting', score: 61, products: ['Dr. Jart+ Cicapair Tiger Grass'] },
          { keyword: 'Natural Coverage', score: 57, products: ['Glossier Stretch Concealer'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Tanghulu / Glassy Lips', score: 90, products: ['rom&nd Glasting Water Tint'] },
          { keyword: 'Dewy Glow', score: 87, products: ['Charlotte Tilbury Flawless Filter'] },
        ],
        Growing: [
          { keyword: 'Y2K Aesthetic', score: 76, products: ['NYX Butter Gloss'] },
        ],
        Early: [
          { keyword: 'Character Collab', score: 60, products: ['ColourPop x Disney'] },
        ]
      }
    },
    'Hair Care': {
      ingredient: {
        Actionable: [
          { keyword: 'Keratin', score: 89, products: ['Olaplex No.3 Hair Perfector'] },
          { keyword: 'Argan Oil', score: 86, products: ['Moroccanoil Treatment'] },
          { keyword: 'Biotin', score: 84, products: ['Nutrafol Hair Growth Supplement'] },
        ],
        Growing: [
          { keyword: 'Caffeine', score: 76, products: ['Briogeo Scalp Revival Shampoo'] },
          { keyword: 'Panthenol', score: 73, products: ['Olaplex No.5 Bond Maintenance'] },
        ],
        Early: [
          { keyword: 'Salicylic Acid', score: 62, products: ['Neutrogena T/Sal Shampoo'] },
          { keyword: 'Rosemary Oil', score: 58, products: ['Mielle Rosemary Mint Oil'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Hair Oil', score: 90, products: ['Moroccanoil Treatment'] },
          { keyword: 'Hair Mask', score: 87, products: ['Olaplex No.8 Bond Intense Mask'] },
          { keyword: 'Shampoo', score: 85, products: ['Olaplex No.4 Bond Maintenance'] },
        ],
        Growing: [
          { keyword: 'Scalp Tonic', score: 77, products: ['The Ordinary Multi-Peptide Serum for Hair'] },
          { keyword: 'Leave-in Conditioner', score: 74, products: ['It\'s A 10 Miracle Leave-In'] },
        ],
        Early: [
          { keyword: 'Hair Serum', score: 62, products: ['Olaplex No.9 Bond Protector'] },
          { keyword: 'Water Treatment', score: 57, products: ['Moremo Water Treatment Miracle 10'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Damage Repair', score: 91, products: ['Olaplex No.3 Hair Perfector'] },
          { keyword: 'Frizz Control', score: 87, products: ['Moroccanoil Treatment'] },
        ],
        Growing: [
          { keyword: 'Scalp Care', score: 77, products: ['Briogeo Scalp Revival'] },
          { keyword: 'Volumizing', score: 74, products: ['Living Proof Full Shampoo'] },
        ],
        Early: [
          { keyword: 'Anti-hair Loss', score: 62, products: ['Nutrafol Hair Growth'] },
          { keyword: 'Heat Protection', score: 58, products: ['CHI 44 Iron Guard Spray'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Salon Quality', score: 88, products: ['Olaplex No.3'] },
        ],
        Growing: [
          { keyword: 'Gender-neutral', score: 74, products: ['Function of Beauty'] },
        ],
        Early: [
          { keyword: 'Eco Refillable', score: 59, products: ['By Humankind Shampoo Bar'] },
        ]
      }
    },
    'Body Care': {
      ingredient: {
        Actionable: [
          { keyword: 'Shea Butter', score: 88, products: ['Sol de Janeiro Brazilian Bum Bum Cream'] },
          { keyword: 'Ceramides', score: 85, products: ['CeraVe Moisturizing Cream'] },
          { keyword: 'Glycerin', score: 83, products: ['Neutrogena Hydro Boost Body Gel Cream'] },
        ],
        Growing: [
          { keyword: 'Niacinamide', score: 76, products: ['Naturium Body Wash'] },
          { keyword: 'Retinol', score: 73, products: ['Necessaire The Body Retinol'] },
        ],
        Early: [
          { keyword: 'Urea', score: 62, products: ['Eucerin Roughness Relief'] },
          { keyword: 'Lactic Acid', score: 58, products: ['AmLactin Daily Lotion'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Body Lotion', score: 90, products: ['CeraVe Daily Moisturizing Lotion'] },
          { keyword: 'Body Cream', score: 87, products: ['Sol de Janeiro Bum Bum Cream'] },
        ],
        Growing: [
          { keyword: 'Body Oil', score: 76, products: ['Bio-Oil Skincare Oil'] },
          { keyword: 'Body Scrub', score: 73, products: ['Tree Hut Shea Sugar Scrub'] },
        ],
        Early: [
          { keyword: 'Body Butter', score: 62, products: ['The Body Shop Body Butter'] },
          { keyword: 'Body Mist', score: 58, products: ['Sol de Janeiro Brazilian Bum Bum Mist'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Deep Moisturizing', score: 89, products: ['CeraVe Moisturizing Cream'] },
          { keyword: 'Fragrance-led', score: 86, products: ['Sol de Janeiro Bum Bum Cream'] },
        ],
        Growing: [
          { keyword: 'Firming', score: 75, products: ['Necessaire The Body Serum'] },
          { keyword: 'Exfoliating', score: 72, products: ['Tree Hut Shea Sugar Scrub'] },
        ],
        Early: [
          { keyword: 'KP Treatment', score: 61, products: ['First Aid Beauty KP Bump Eraser'] },
          { keyword: 'Body Brightening', score: 57, products: ['Alpha Skin Care Renewal Body Lotion'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Luxury Scent', score: 88, products: ['Sol de Janeiro Bum Bum Cream'] },
        ],
        Growing: [
          { keyword: 'Self-care Ritual', score: 74, products: ['Nécessaire Body Wash'] },
        ],
        Early: [
          { keyword: 'Active Body Care', score: 59, products: ['Necessaire The Body Retinol'] },
        ]
      }
    },
    'Mens Care': {
      ingredient: {
        Actionable: [
          { keyword: 'Niacinamide', score: 87, products: ['CeraVe AM Facial Moisturizing Lotion'] },
          { keyword: 'Salicylic Acid', score: 84, products: ['Neutrogena Men Face Wash'] },
        ],
        Growing: [
          { keyword: 'Centella Asiatica', score: 75, products: ['Brickell Daily Essential Moisturizer'] },
          { keyword: 'Charcoal', score: 72, products: ['Bulldog Skincare Face Wash'] },
        ],
        Early: [
          { keyword: 'Allantoin', score: 61, products: ['Harry\'s Post-Shave Balm'] },
          { keyword: 'Caffeine', score: 57, products: ['Kiehl\'s Facial Fuel'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'All-in-one', score: 88, products: ['Bulldog Original Moisturiser'] },
          { keyword: 'Gel Moisturizer', score: 85, products: ['Neutrogena Hydro Boost Men'] },
        ],
        Growing: [
          { keyword: 'Aftershave Balm', score: 76, products: ['Harry\'s Post-Shave Balm'] },
          { keyword: 'Sun Stick', score: 73, products: ['Supergoop Play SPF 50'] },
        ],
        Early: [
          { keyword: 'BB Cream for Men', score: 61, products: ['Stryx Concealer for Men'] },
          { keyword: 'Toner Pad', score: 57, products: ['COSRX One Step Pimple Pad'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Oil Control', score: 87, products: ['Neutrogena Men Face Wash'] },
          { keyword: 'Post-shave Soothing', score: 84, products: ['Harry\'s Post-Shave Balm'] },
        ],
        Growing: [
          { keyword: 'Pore Care', score: 75, products: ['Paula\'s Choice BHA Exfoliant'] },
          { keyword: 'Simple Routine', score: 72, products: ['Bulldog Original Moisturiser'] },
        ],
        Early: [
          { keyword: 'Non-sticky', score: 60, products: ['Kiehl\'s Ultra Facial Cream'] },
          { keyword: 'Natural Coverage', score: 56, products: ['Stryx Concealer for Men'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Minimal Design', score: 86, products: ['Bulldog Skincare'] },
        ],
        Growing: [
          { keyword: 'Gender-neutral', score: 73, products: ['The Ordinary Niacinamide'] },
        ],
        Early: [
          { keyword: 'Grip Ergonomic', score: 58, products: ['Harry\'s Razors'] },
        ]
      }
    }
  },

  japan: {
    platform: { retail: '@cosme', sns: ['YouTube', 'Instagram'] },
    Skincare: {
      ingredient: {
        Actionable: [
          { keyword: 'Ceramides', score: 95, products: ['Curel Intensive Moisture Cream'] },
          { keyword: 'Rice Ferment', score: 93, products: ['SK-II Facial Treatment Essence'] },
          { keyword: 'Hyaluronic Acid', score: 91, products: ['Hada Labo Gokujyun Premium Lotion'] },
          { keyword: 'Vitamin C', score: 89, products: ['Obagi C25 Serum NEO'] },
          { keyword: 'Niacinamide', score: 87, products: ['ONE BY KOSE Melanoshot White D'] },
        ],
        Growing: [
          { keyword: 'Retinal', score: 81, products: ['SHISEIDO Vital Perfection Cream'] },
          { keyword: 'Tranexamic Acid', score: 79, products: ['HAKU Melanofocus Z'] },
          { keyword: 'PDRN', score: 76, products: ['VT Cosmetics PDRN Essence'] },
          { keyword: 'Madecassoside', score: 74, products: ['A\'PIEU Madecassoside Cream'] },
          { keyword: 'Centella Asiatica', score: 72, products: ['VT CICA Cream'] },
        ],
        Early: [
          { keyword: 'Exosomes', score: 64, products: ['AXXZIA Beauty Eyes Essence'] },
          { keyword: 'Fermented Soybean', score: 61, products: ['Menard Lisciare Serum'] },
          { keyword: 'Probiotics', score: 58, products: ['KINS Serum'] },
          { keyword: 'Bakuchiol', score: 55, products: ['Herbivore Bakuchiol Serum'] },
          { keyword: 'Astaxanthin', score: 52, products: ['Astalift Jelly Aquarysta'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Essence', score: 94, products: ['SK-II Facial Treatment Essence'] },
          { keyword: 'Lotion (化粧水)', score: 92, products: ['Hada Labo Gokujyun Premium'] },
          { keyword: 'Serum (美容液)', score: 90, products: ['SHISEIDO Ultimune'] },
          { keyword: 'Sheet Mask', score: 87, products: ['LuLuLun Precious Red'] },
          { keyword: 'Gel Cream', score: 84, products: ['Curel Moisture Gel Cream'] },
        ],
        Growing: [
          { keyword: 'Ampoule', score: 79, products: ['VT Cosmetics CICA Ampoule'] },
          { keyword: 'Balm', score: 76, products: ['DUO The Cleansing Balm'] },
          { keyword: 'Mist', score: 73, products: ['Avene Thermal Spring Water'] },
        ],
        Early: [
          { keyword: 'Overnight Pack', score: 63, products: ['Laneige Water Sleeping Mask'] },
          { keyword: 'Toner Pad', score: 60, products: ['Abib Heartleaf Toner Pad'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Moisturizing', score: 94, products: ['Hada Labo Gokujyun Premium'] },
          { keyword: 'Whitening/Brightening', score: 92, products: ['HAKU Melanofocus Z'] },
          { keyword: 'Anti-aging', score: 89, products: ['SHISEIDO Vital Perfection'] },
          { keyword: 'Barrier Repair', score: 86, products: ['Curel Intensive Moisture Cream'] },
        ],
        Growing: [
          { keyword: 'Soothing/Calming', score: 79, products: ['VT CICA Cream'] },
          { keyword: 'Firming/Lifting', score: 76, products: ['Domo Horn Wrinkle Cream 20'] },
          { keyword: 'Pore Care', score: 73, products: ['Obagi C10 Serum'] },
        ],
        Early: [
          { keyword: 'Recovery/Regeneration', score: 63, products: ['Attenir Skin Clear Cleanse Oil'] },
          { keyword: 'Radiance', score: 60, products: ['SUQQU Treatment Serum'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Aesthetic/Shelfie', score: 91, products: ['SUQQU Treatment Serum'] },
          { keyword: 'Clean/White Tone', score: 88, products: ['Curel Intensive Moisture'] },
          { keyword: 'Dermatology Vibe', score: 85, products: ['NOV AC Active'] },
        ],
        Growing: [
          { keyword: 'Fragrance/Aroma', score: 77, products: ['Attenir Skin Clear Cleanse Oil'] },
          { keyword: 'Hygiene Design', score: 74, products: ['Orbis U Lotion'] },
        ],
        Early: [
          { keyword: 'Spatula/Scoop', score: 62, products: ['Domo Horn Wrinkle Cream'] },
          { keyword: 'Airless Container', score: 58, products: ['POLA B.A Lotion'] },
        ]
      }
    },
    Cleansing: {
      ingredient: {
        Actionable: [
          { keyword: 'Amino Acids', score: 91, products: ['Curel Foaming Wash'] },
          { keyword: 'AHA/BHA', score: 87, products: ['FANCL Mild Cleansing Oil'] },
        ],
        Growing: [
          { keyword: 'Rice Bran', score: 77, products: ['Rosette Rice Bran Face Wash'] },
        ],
        Early: [
          { keyword: 'Enzyme', score: 62, products: ['Suisai Beauty Clear Powder Wash'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Cleansing Oil', score: 95, products: ['Attenir Skin Clear Cleanse Oil'] },
          { keyword: 'Foaming Wash', score: 91, products: ['Curel Foaming Wash'] },
        ],
        Growing: [
          { keyword: 'Cleansing Balm', score: 78, products: ['DUO The Cleansing Balm'] },
        ],
        Early: [
          { keyword: 'Powder Wash', score: 63, products: ['Suisai Beauty Clear Powder'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Gentle Cleansing', score: 92, products: ['FANCL Mild Cleansing Oil'] },
          { keyword: 'Makeup Removal', score: 89, products: ['Attenir Skin Clear Cleanse Oil'] },
        ],
        Growing: [
          { keyword: 'Pore Care', score: 77, products: ['DUO The Cleansing Balm Black'] },
        ],
        Early: [
          { keyword: 'Fragrance Experience', score: 61, products: ['Attenir Cleanse Oil Aroma'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Satisfying Texture', score: 90, products: ['DUO The Cleansing Balm'] },
        ],
        Growing: [
          { keyword: 'Aroma Experience', score: 76, products: ['Attenir Cleanse Oil'] },
        ],
        Early: [
          { keyword: 'Refillable', score: 60, products: ['FANCL Refill Pack'] },
        ]
      }
    },
    'Sun Care': {
      ingredient: {
        Actionable: [
          { keyword: 'Hyaluronic Acid', score: 90, products: ['Biore UV Aqua Rich'] },
          { keyword: 'Zinc Oxide', score: 87, products: ['Anessa Perfect UV Milk'] },
        ],
        Growing: [
          { keyword: 'Ceramides', score: 76, products: ['Curel UV Lotion SPF50+'] },
        ],
        Early: [
          { keyword: 'Vitamin C', score: 61, products: ['Obagi UV Emulsion EX'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Sun Milk', score: 93, products: ['Anessa Perfect UV Sunscreen Milk'] },
          { keyword: 'Sun Gel', score: 90, products: ['Biore UV Aqua Rich Watery Essence'] },
        ],
        Growing: [
          { keyword: 'Tone-up Cream', score: 77, products: ['ALLIE Chrono Beauty Tone Up UV'] },
        ],
        Early: [
          { keyword: 'Sun Stick', score: 62, products: ['Shiseido Clear Suncare Stick'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'No White Cast', score: 92, products: ['Biore UV Aqua Rich'] },
          { keyword: 'SPF50+ PA++++', score: 90, products: ['Anessa Perfect UV Milk'] },
        ],
        Growing: [
          { keyword: 'Water-resistant', score: 77, products: ['Anessa Perfect UV Milk'] },
        ],
        Early: [
          { keyword: 'Tone-up Effect', score: 61, products: ['ALLIE Chrono Beauty'] },
        ]
      },
      mood: {
        Actionable: [{ keyword: 'Daily-friendly', score: 89, products: ['Biore UV Aqua Rich'] }],
        Growing: [{ keyword: 'Mini/Travel Size', score: 75, products: ['Anessa Mini'] }],
        Early: [{ keyword: 'Eco-conscious', score: 59, products: ['Shiseido Clear Suncare'] }]
      }
    },
    Makeup: {
      ingredient: {
        Actionable: [
          { keyword: 'Hyaluronic Acid', score: 88, products: ['KATE Lip Monster'] },
          { keyword: 'Collagen', score: 85, products: ['Canmake Marshmallow Finish Powder'] },
        ],
        Growing: [
          { keyword: 'Ceramides', score: 76, products: ['Curel BB Cream'] },
        ],
        Early: [
          { keyword: 'Pearl Extract', score: 61, products: ['RMK Liquid Foundation'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Lip Tint', score: 92, products: ['KATE Lip Monster'] },
          { keyword: 'Cushion Foundation', score: 89, products: ['Cle de Peau Radiant Cushion'] },
          { keyword: 'Loose Powder', score: 86, products: ['Canmake Marshmallow Finish'] },
        ],
        Growing: [
          { keyword: 'Liquid Foundation', score: 78, products: ['SUQQU The Liquid Foundation'] },
        ],
        Early: [
          { keyword: 'Setting Spray', score: 62, products: ['INTEGRATE Finishing Powder'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Long-lasting', score: 91, products: ['KATE Lip Monster'] },
          { keyword: 'Dewy Finish', score: 88, products: ['Cle de Peau Radiant Cushion'] },
        ],
        Growing: [
          { keyword: 'Matte Finish', score: 77, products: ['Canmake Marshmallow Finish'] },
        ],
        Early: [
          { keyword: 'Color Correcting', score: 61, products: ['IPSA Creative Concealer'] },
        ]
      },
      mood: {
        Actionable: [{ keyword: 'Tanghulu/Glassy', score: 90, products: ['KATE Lip Monster'] }],
        Growing: [{ keyword: 'Egg Shape/Pebble', score: 75, products: ['Canmake Powder'] }],
        Early: [{ keyword: 'Character Collab', score: 59, products: ['Sailor Moon x Creer Beaute'] }]
      }
    },
    'Hair Care': {
      ingredient: {
        Actionable: [
          { keyword: 'Keratin', score: 88, products: ['Fino Premium Touch Hair Mask'] },
          { keyword: 'Amino Acids', score: 85, products: ['&honey Deep Moist Shampoo'] },
        ],
        Growing: [
          { keyword: 'Argan Oil', score: 76, products: ['Moroccanoil Treatment'] },
        ],
        Early: [
          { keyword: 'CICA', score: 61, products: ['VT CICA Scalp Tonic'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Hair Mask', score: 91, products: ['Fino Premium Touch Hair Mask'] },
          { keyword: 'Shampoo', score: 88, products: ['&honey Deep Moist Shampoo'] },
        ],
        Growing: [
          { keyword: 'Hair Oil', score: 77, products: ['N. Polishing Oil'] },
        ],
        Early: [
          { keyword: 'Scalp Tonic', score: 62, products: ['h&s Scalp Tonic'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Damage Repair', score: 90, products: ['Fino Premium Touch'] },
          { keyword: 'Moisturizing', score: 87, products: ['&honey Deep Moist'] },
        ],
        Growing: [{ keyword: 'Scalp Care', score: 76, products: ['h&s Scalp Tonic'] }],
        Early: [{ keyword: 'Volumizing', score: 61, products: ['BOTANIST Volume Shampoo'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Salon Quality', score: 88, products: ['Fino Hair Mask'] }],
        Growing: [{ keyword: 'Natural/Organic', score: 74, products: ['BOTANIST'] }],
        Early: [{ keyword: 'Gender-neutral', score: 58, products: ['BULK HOMME'] }]
      }
    },
    'Body Care': {
      ingredient: {
        Actionable: [
          { keyword: 'Shea Butter', score: 87, products: ['Sabon Body Scrub'] },
          { keyword: 'Ceramides', score: 84, products: ['Curel Body Lotion'] },
        ],
        Growing: [{ keyword: 'Niacinamide', score: 75, products: ['Nivea Premium Body Milk'] }],
        Early: [{ keyword: 'Urea', score: 61, products: ['Eucerin Body Lotion'] }]
      },
      formulas: {
        Actionable: [
          { keyword: 'Body Lotion', score: 89, products: ['Curel Moisture Body Lotion'] },
          { keyword: 'Body Scrub', score: 86, products: ['Sabon Body Scrub'] },
        ],
        Growing: [{ keyword: 'Body Oil', score: 76, products: ['WELEDA Skin Food Body Butter'] }],
        Early: [{ keyword: 'Body Mist', score: 61, products: ['SHIRO Savon Body Cologne'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Deep Moisturizing', score: 88, products: ['Curel Body Lotion'] }],
        Growing: [{ keyword: 'Fragrance-led', score: 75, products: ['Sabon Body Scrub'] }],
        Early: [{ keyword: 'Firming', score: 60, products: ['Clarins Body Fit'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Luxury', score: 87, products: ['Sabon Body Scrub'] }],
        Growing: [{ keyword: 'Aesthetic/Shelfie', score: 74, products: ['SHIRO Savon'] }],
        Early: [{ keyword: 'Refillable', score: 58, products: ['Curel Refill Pack'] }]
      }
    },
    'Mens Care': {
      ingredient: {
        Actionable: [
          { keyword: 'Niacinamide', score: 86, products: ['UNO Skin Care Tank'] },
          { keyword: 'Hyaluronic Acid', score: 83, products: ['GATSBY Perfect Lotion'] },
        ],
        Growing: [{ keyword: 'Centella', score: 74, products: ['BULK HOMME The Toner'] }],
        Early: [{ keyword: 'Charcoal', score: 60, products: ['OXY Deep Wash'] }]
      },
      formulas: {
        Actionable: [
          { keyword: 'All-in-one', score: 89, products: ['UNO All in One Vital Cream'] },
          { keyword: 'Gel Moisturizer', score: 85, products: ['Nivea Men Active Age Cream'] },
        ],
        Growing: [{ keyword: 'Aftershave', score: 75, products: ['GATSBY Aftershave Water'] }],
        Early: [{ keyword: 'BB Cream', score: 60, products: ['UNO Face Color Creator'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Oil Control', score: 87, products: ['OXY Oil Control Film'] }],
        Growing: [{ keyword: 'Post-shave Soothing', score: 75, products: ['Nivea Men Sensitive'] }],
        Early: [{ keyword: 'Pore Care', score: 60, products: ['GATSBY Facial Paper'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Minimal Design', score: 85, products: ['BULK HOMME'] }],
        Growing: [{ keyword: 'Daily-friendly', score: 73, products: ['UNO All in One'] }],
        Early: [{ keyword: 'Matte Texture', score: 57, products: ['OXY Perfect Wash'] }]
      }
    }
  },

  singapore: {
    platform: { retail: 'Shopee', sns: ['YouTube', 'Instagram'] },
    Skincare: {
      ingredient: {
        Actionable: [
          { keyword: 'Centella Asiatica', score: 94, products: ['SKIN1004 Madagascar Centella Ampoule'] },
          { keyword: 'Snail Mucin', score: 92, products: ['COSRX Advanced Snail 96 Mucin'] },
          { keyword: 'Niacinamide', score: 90, products: ['The Ordinary Niacinamide 10%'] },
          { keyword: 'Hyaluronic Acid', score: 88, products: ['Hada Labo Hydrating Lotion'] },
          { keyword: 'Ceramides', score: 86, products: ['Illiyoon Ceramide Ato Cream'] },
        ],
        Growing: [
          { keyword: 'Rice Extract', score: 80, products: ['Beauty of Joseon Dynasty Cream'] },
          { keyword: 'Green Tea', score: 78, products: ['Innisfree Green Tea Seed Serum'] },
          { keyword: 'Propolis', score: 75, products: ['COSRX Full Fit Propolis Synergy Toner'] },
          { keyword: 'Vitamin C', score: 73, products: ['Melano CC Intensive Serum'] },
        ],
        Early: [
          { keyword: 'Peptides', score: 64, products: ['The Ordinary Multi-Peptide Serum'] },
          { keyword: 'Tranexamic Acid', score: 61, products: ['Hada Labo Shirojyun Premium'] },
          { keyword: 'Mugwort', score: 58, products: ['I\'m From Mugwort Essence'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Serum', score: 93, products: ['SKIN1004 Centella Ampoule'] },
          { keyword: 'Essence', score: 90, products: ['COSRX Snail Mucin Essence'] },
          { keyword: 'Toner', score: 87, products: ['Hada Labo Hydrating Lotion'] },
        ],
        Growing: [
          { keyword: 'Sheet Mask', score: 79, products: ['Mediheal N.M.F Aquaring Ampoule Mask'] },
          { keyword: 'Gel Cream', score: 76, products: ['Illiyoon Ceramide Ato Gel'] },
        ],
        Early: [
          { keyword: 'Ampoule', score: 63, products: ['Torriden DIVE-IN Low Serum'] },
          { keyword: 'Sleeping Mask', score: 59, products: ['Laneige Water Sleeping Mask'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Hydrating', score: 93, products: ['Hada Labo Gokujyun'] },
          { keyword: 'Soothing', score: 90, products: ['SKIN1004 Centella Ampoule'] },
          { keyword: 'Brightening', score: 87, products: ['Melano CC Intensive Serum'] },
        ],
        Growing: [
          { keyword: 'Anti-aging', score: 78, products: ['Innisfree Retinol Cica Serum'] },
          { keyword: 'Barrier Repair', score: 75, products: ['Illiyoon Ceramide Cream'] },
        ],
        Early: [
          { keyword: 'Glass Skin', score: 63, products: ['Beauty of Joseon Glow Serum'] },
          { keyword: 'Pore Minimizing', score: 59, products: ['COSRX BHA Blackhead Power'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'K-Beauty', score: 91, products: ['COSRX Snail Mucin'] },
          { keyword: 'Clean Beauty', score: 88, products: ['The Ordinary Niacinamide'] },
        ],
        Growing: [{ keyword: 'Glass Skin Aesthetic', score: 77, products: ['Beauty of Joseon'] }],
        Early: [{ keyword: 'Minimal Skincare', score: 62, products: ['Torriden DIVE-IN'] }]
      }
    },
    Cleansing: {
      ingredient: {
        Actionable: [{ keyword: 'Amino Acids', score: 90, products: ['COSRX Low pH Good Morning Cleanser'] }],
        Growing: [{ keyword: 'Tea Tree', score: 76, products: ['Innisfree Tea Tree Cleanser'] }],
        Early: [{ keyword: 'Centella', score: 61, products: ['SKIN1004 Centella Cleansing Oil'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Gel Cleanser', score: 91, products: ['COSRX Good Morning Cleanser'] }],
        Growing: [{ keyword: 'Cleansing Oil', score: 77, products: ['Banila Co Clean It Zero'] }],
        Early: [{ keyword: 'Micellar Water', score: 62, products: ['Bioderma Sensibio H2O'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Low pH Gentle', score: 90, products: ['COSRX Good Morning Cleanser'] }],
        Growing: [{ keyword: 'Deep Cleansing', score: 76, products: ['Banila Co Clean It Zero'] }],
        Early: [{ keyword: 'Oil Control', score: 60, products: ['Innisfree Volcanic Pore Cleanser'] }]
      },
      mood: {
        Actionable: [{ keyword: 'K-Beauty Clean', score: 88, products: ['COSRX'] }],
        Growing: [{ keyword: 'Satisfying', score: 74, products: ['Banila Co'] }],
        Early: [{ keyword: 'Eco Packaging', score: 58, products: ['Innisfree'] }]
      }
    },
    'Sun Care': {
      ingredient: {
        Actionable: [{ keyword: 'Centella', score: 90, products: ['Beauty of Joseon Relief Sun'] }],
        Growing: [{ keyword: 'Niacinamide', score: 76, products: ['SKIN1004 Hyalu-Cica Sun Serum'] }],
        Early: [{ keyword: 'Vitamin E', score: 60, products: ['Biore UV Aqua Rich'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Sun Cream', score: 91, products: ['Beauty of Joseon Relief Sun SPF50+'] }],
        Growing: [{ keyword: 'Sun Gel', score: 77, products: ['Biore UV Aqua Rich'] }],
        Early: [{ keyword: 'Sun Serum', score: 61, products: ['SKIN1004 Sun Serum'] }]
      },
      effects: {
        Actionable: [{ keyword: 'No White Cast', score: 91, products: ['Beauty of Joseon Sun'] }],
        Growing: [{ keyword: 'Lightweight', score: 76, products: ['Biore UV Aqua Rich'] }],
        Early: [{ keyword: 'Moisturizing SPF', score: 60, products: ['SKIN1004 Sun Serum'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Daily-friendly', score: 89, products: ['Beauty of Joseon Sun'] }],
        Growing: [{ keyword: 'Lightweight Feel', score: 75, products: ['Biore UV'] }],
        Early: [{ keyword: 'Travel Size', score: 58, products: ['Anessa Mini'] }]
      }
    },
    Makeup: {
      ingredient: {
        Actionable: [{ keyword: 'Hyaluronic Acid', score: 87, products: ['Peripera Ink Velvet'] }],
        Growing: [{ keyword: 'Vitamin E', score: 74, products: ['Maybelline Fit Me'] }],
        Early: [{ keyword: 'Collagen', score: 59, products: ['Clio Kill Cover Cushion'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Lip Tint', score: 91, products: ['Peripera Ink Velvet'] }],
        Growing: [{ keyword: 'Cushion Foundation', score: 78, products: ['Clio Kill Cover'] }],
        Early: [{ keyword: 'Setting Powder', score: 62, products: ['Innisfree No Sebum Powder'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Long-lasting', score: 90, products: ['Peripera Ink Velvet'] }],
        Growing: [{ keyword: 'Dewy Finish', score: 77, products: ['Clio Kill Cover'] }],
        Early: [{ keyword: 'Oil Control', score: 61, products: ['Innisfree No Sebum'] }]
      },
      mood: {
        Actionable: [{ keyword: 'K-Beauty Look', score: 89, products: ['Peripera Ink Velvet'] }],
        Growing: [{ keyword: 'Dewy Glow', score: 75, products: ['Clio Kill Cover'] }],
        Early: [{ keyword: 'Minimal Makeup', score: 58, products: ['Innisfree'] }]
      }
    },
    'Hair Care': {
      ingredient: {
        Actionable: [{ keyword: 'Keratin', score: 87, products: ['Shiseido Tsubaki Premium Mask'] }],
        Growing: [{ keyword: 'Argan Oil', score: 74, products: ['Moroccanoil Treatment'] }],
        Early: [{ keyword: 'Biotin', score: 59, products: ['Innisfree Green Tea Scalp'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Hair Mask', score: 89, products: ['Shiseido Tsubaki Premium'] }],
        Growing: [{ keyword: 'Hair Oil', score: 76, products: ['Moroccanoil Treatment'] }],
        Early: [{ keyword: 'Scalp Tonic', score: 61, products: ['The Ordinary Peptide Serum'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Damage Repair', score: 88, products: ['Shiseido Tsubaki'] }],
        Growing: [{ keyword: 'Frizz Control', score: 75, products: ['Moroccanoil'] }],
        Early: [{ keyword: 'Scalp Care', score: 60, products: ['Innisfree Scalp'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Salon Quality', score: 86, products: ['Shiseido Tsubaki'] }],
        Growing: [{ keyword: 'Natural/Organic', score: 73, products: ['Innisfree'] }],
        Early: [{ keyword: 'Gender-neutral', score: 57, products: ['The Ordinary'] }]
      }
    },
    'Body Care': {
      ingredient: {
        Actionable: [{ keyword: 'Shea Butter', score: 86, products: ['The Body Shop Shea Body Butter'] }],
        Growing: [{ keyword: 'Niacinamide', score: 73, products: ['Vaseline Healthy White'] }],
        Early: [{ keyword: 'Glycolic Acid', score: 58, products: ['Alpha Skin Care Renewal'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Body Lotion', score: 88, products: ['Vaseline Healthy White'] }],
        Growing: [{ keyword: 'Body Scrub', score: 75, products: ['The Body Shop Body Scrub'] }],
        Early: [{ keyword: 'Body Oil', score: 60, products: ['Bio-Oil'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Whitening', score: 87, products: ['Vaseline Healthy White'] }],
        Growing: [{ keyword: 'Moisturizing', score: 74, products: ['The Body Shop Shea'] }],
        Early: [{ keyword: 'Firming', score: 59, products: ['Nivea Firming Body Lotion'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Fragrance-led', score: 85, products: ['The Body Shop'] }],
        Growing: [{ keyword: 'Self-care', score: 72, products: ['Vaseline'] }],
        Early: [{ keyword: 'Luxury', score: 57, products: ['L\'Occitane'] }]
      }
    },
    'Mens Care': {
      ingredient: {
        Actionable: [{ keyword: 'Niacinamide', score: 85, products: ['Nivea Men Extra White'] }],
        Growing: [{ keyword: 'Charcoal', score: 72, products: ['Garnier Men TurboLight'] }],
        Early: [{ keyword: 'Centella', score: 57, products: ['Some By Mi Toner'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'All-in-one', score: 87, products: ['Nivea Men Extra White'] }],
        Growing: [{ keyword: 'Gel Moisturizer', score: 74, products: ['L\'Oreal Men Expert'] }],
        Early: [{ keyword: 'Sun Stick', score: 59, products: ['Supergoop Play'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Oil Control', score: 86, products: ['Nivea Men Oil Control'] }],
        Growing: [{ keyword: 'Whitening', score: 73, products: ['Garnier Men TurboLight'] }],
        Early: [{ keyword: 'Pore Care', score: 58, products: ['Some By Mi Toner'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Daily-friendly', score: 84, products: ['Nivea Men'] }],
        Growing: [{ keyword: 'Minimal', score: 71, products: ['L\'Oreal Men Expert'] }],
        Early: [{ keyword: 'Gender-neutral', score: 56, products: ['The Ordinary'] }]
      }
    }
  },

  malaysia: {
    platform: { retail: 'Shopee', sns: ['YouTube', 'Instagram'] },
    Skincare: {
      ingredient: {
        Actionable: [
          { keyword: 'Niacinamide', score: 93, products: ['The Ordinary Niacinamide 10%'] },
          { keyword: 'Hyaluronic Acid', score: 91, products: ['Hada Labo Hydrating Lotion'] },
          { keyword: 'Centella Asiatica', score: 89, products: ['SKIN1004 Centella Ampoule'] },
          { keyword: 'Ceramides', score: 87, products: ['Skintific 5X Ceramide Serum'] },
          { keyword: 'Snail Mucin', score: 85, products: ['COSRX Snail Mucin Essence'] },
        ],
        Growing: [
          { keyword: 'Vitamin C', score: 80, products: ['Garnier Light Complete Serum'] },
          { keyword: 'Rice Extract', score: 78, products: ['Beauty of Joseon Dynasty Cream'] },
          { keyword: 'Retinol', score: 75, products: ['The Ordinary Retinol 0.2%'] },
          { keyword: 'Propolis', score: 73, products: ['COSRX Propolis Toner'] },
        ],
        Early: [
          { keyword: 'Peptides', score: 64, products: ['The Ordinary Multi-Peptide'] },
          { keyword: 'Probiotics', score: 61, products: ['Skintific Probiotic Serum'] },
          { keyword: 'Tranexamic Acid', score: 58, products: ['Hada Labo Shirojyun'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Serum', score: 92, products: ['Skintific 5X Ceramide Serum'] },
          { keyword: 'Essence', score: 89, products: ['COSRX Snail Mucin Essence'] },
          { keyword: 'Toner', score: 86, products: ['Hada Labo Hydrating Lotion'] },
        ],
        Growing: [
          { keyword: 'Sheet Mask', score: 78, products: ['Mediheal NMF Mask'] },
          { keyword: 'Gel Cream', score: 75, products: ['Skintific Moisturizer Gel'] },
        ],
        Early: [
          { keyword: 'Ampoule', score: 63, products: ['SKIN1004 Centella Ampoule'] },
          { keyword: 'Sleeping Mask', score: 59, products: ['Laneige Water Sleeping Mask'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Brightening', score: 92, products: ['Garnier Light Complete'] },
          { keyword: 'Hydrating', score: 90, products: ['Hada Labo Gokujyun'] },
          { keyword: 'Barrier Repair', score: 87, products: ['Skintific 5X Ceramide'] },
        ],
        Growing: [
          { keyword: 'Anti-aging', score: 78, products: ['The Ordinary Retinol'] },
          { keyword: 'Soothing', score: 75, products: ['SKIN1004 Centella'] },
        ],
        Early: [
          { keyword: 'Pore Minimizing', score: 63, products: ['COSRX BHA Blackhead'] },
          { keyword: 'Dark Spot Correcting', score: 59, products: ['Melano CC'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Halal Certified', score: 90, products: ['Safi Derma Acne'] },
          { keyword: 'K-Beauty', score: 88, products: ['COSRX Snail Mucin'] },
        ],
        Growing: [{ keyword: 'Clean Beauty', score: 76, products: ['The Ordinary'] }],
        Early: [{ keyword: 'Glass Skin', score: 62, products: ['Beauty of Joseon'] }]
      }
    },
    Cleansing: {
      ingredient: {
        Actionable: [{ keyword: 'Salicylic Acid', score: 89, products: ['COSRX Salicylic Acid Cleanser'] }],
        Growing: [{ keyword: 'Tea Tree', score: 75, products: ['Innisfree Tea Tree Cleanser'] }],
        Early: [{ keyword: 'Amino Acids', score: 60, products: ['Hada Labo Gokujyun Foam'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Foaming Cleanser', score: 90, products: ['COSRX Salicylic Cleanser'] }],
        Growing: [{ keyword: 'Cleansing Oil', score: 76, products: ['Banila Co Clean It Zero'] }],
        Early: [{ keyword: 'Gel Cleanser', score: 61, products: ['Hada Labo Gokujyun'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Acne Control', score: 89, products: ['COSRX Salicylic'] }],
        Growing: [{ keyword: 'Gentle Cleansing', score: 75, products: ['Hada Labo'] }],
        Early: [{ keyword: 'Oil Control', score: 60, products: ['Innisfree Volcanic'] }]
      },
      mood: {
        Actionable: [{ keyword: 'K-Beauty Clean', score: 87, products: ['COSRX'] }],
        Growing: [{ keyword: 'Halal', score: 74, products: ['Safi'] }],
        Early: [{ keyword: 'Natural', score: 58, products: ['Innisfree'] }]
      }
    },
    'Sun Care': {
      ingredient: {
        Actionable: [{ keyword: 'Centella', score: 89, products: ['Beauty of Joseon Relief Sun'] }],
        Growing: [{ keyword: 'Niacinamide', score: 75, products: ['Garnier UV Bright'] }],
        Early: [{ keyword: 'Hyaluronic Acid', score: 60, products: ['Biore UV Aqua Rich'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Sun Cream', score: 90, products: ['Beauty of Joseon Relief Sun'] }],
        Growing: [{ keyword: 'Sun Gel', score: 76, products: ['Biore UV Aqua Rich'] }],
        Early: [{ keyword: 'Sun Milk', score: 60, products: ['Anessa Perfect UV'] }]
      },
      effects: {
        Actionable: [{ keyword: 'No White Cast', score: 90, products: ['Beauty of Joseon Sun'] }],
        Growing: [{ keyword: 'Brightening SPF', score: 75, products: ['Garnier UV Bright'] }],
        Early: [{ keyword: 'Water-resistant', score: 59, products: ['Anessa'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Daily-friendly', score: 88, products: ['Beauty of Joseon'] }],
        Growing: [{ keyword: 'Lightweight', score: 74, products: ['Biore UV'] }],
        Early: [{ keyword: 'Halal Certified', score: 58, products: ['Safi Sun'] }]
      }
    },
    Makeup: {
      ingredient: {
        Actionable: [{ keyword: 'Hyaluronic Acid', score: 86, products: ['Maybelline Fit Me'] }],
        Growing: [{ keyword: 'Vitamin E', score: 73, products: ['Wardah Instaperfect'] }],
        Early: [{ keyword: 'Collagen', score: 58, products: ['Clio Kill Cover'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Cushion Foundation', score: 90, products: ['Maybelline Fit Me Cushion'] }],
        Growing: [{ keyword: 'Lip Tint', score: 77, products: ['Peripera Ink Velvet'] }],
        Early: [{ keyword: 'Setting Powder', score: 61, products: ['Innisfree No Sebum'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Long-lasting', score: 89, products: ['Maybelline Fit Me'] }],
        Growing: [{ keyword: 'Full Coverage', score: 76, products: ['Wardah Instaperfect'] }],
        Early: [{ keyword: 'Matte Finish', score: 60, products: ['Innisfree No Sebum'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Halal Beauty', score: 88, products: ['Wardah'] }],
        Growing: [{ keyword: 'K-Beauty Look', score: 75, products: ['Peripera'] }],
        Early: [{ keyword: 'Natural Makeup', score: 59, products: ['Innisfree'] }]
      }
    },
    'Hair Care': {
      ingredient: {
        Actionable: [{ keyword: 'Keratin', score: 86, products: ['Shiseido Tsubaki'] }],
        Growing: [{ keyword: 'Argan Oil', score: 73, products: ['Moroccanoil'] }],
        Early: [{ keyword: 'Biotin', score: 58, products: ['Pantene Biotin Shampoo'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Shampoo', score: 88, products: ['Pantene Pro-V'] }],
        Growing: [{ keyword: 'Hair Mask', score: 75, products: ['Shiseido Tsubaki'] }],
        Early: [{ keyword: 'Hair Oil', score: 60, products: ['Moroccanoil'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Damage Repair', score: 87, products: ['Pantene Pro-V'] }],
        Growing: [{ keyword: 'Frizz Control', score: 74, products: ['Moroccanoil'] }],
        Early: [{ keyword: 'Scalp Care', score: 59, products: ['Head & Shoulders'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Salon Quality', score: 85, products: ['Shiseido Tsubaki'] }],
        Growing: [{ keyword: 'Natural', score: 72, products: ['Innisfree'] }],
        Early: [{ keyword: 'Halal', score: 57, products: ['Safi Hair'] }]
      }
    },
    'Body Care': {
      ingredient: {
        Actionable: [{ keyword: 'Niacinamide', score: 86, products: ['Vaseline Healthy White'] }],
        Growing: [{ keyword: 'Shea Butter', score: 73, products: ['The Body Shop'] }],
        Early: [{ keyword: 'Glycerin', score: 58, products: ['Nivea Body Lotion'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Body Lotion', score: 88, products: ['Vaseline Healthy White'] }],
        Growing: [{ keyword: 'Body Scrub', score: 75, products: ['The Body Shop'] }],
        Early: [{ keyword: 'Body Cream', score: 60, products: ['Nivea Cream'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Whitening', score: 88, products: ['Vaseline Healthy White'] }],
        Growing: [{ keyword: 'Moisturizing', score: 74, products: ['Nivea Body Lotion'] }],
        Early: [{ keyword: 'Fragrance-led', score: 59, products: ['The Body Shop'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Daily-friendly', score: 86, products: ['Vaseline'] }],
        Growing: [{ keyword: 'Halal', score: 73, products: ['Safi'] }],
        Early: [{ keyword: 'Luxury', score: 57, products: ['L\'Occitane'] }]
      }
    },
    'Mens Care': {
      ingredient: {
        Actionable: [{ keyword: 'Niacinamide', score: 84, products: ['Nivea Men Extra White'] }],
        Growing: [{ keyword: 'Charcoal', score: 71, products: ['Garnier Men TurboLight'] }],
        Early: [{ keyword: 'Salicylic Acid', score: 56, products: ['Clean & Clear Men'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'All-in-one', score: 86, products: ['Nivea Men Extra White'] }],
        Growing: [{ keyword: 'Face Wash', score: 73, products: ['Garnier Men'] }],
        Early: [{ keyword: 'Gel Moisturizer', score: 58, products: ['L\'Oreal Men Expert'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Whitening', score: 86, products: ['Nivea Men Extra White'] }],
        Growing: [{ keyword: 'Oil Control', score: 73, products: ['Garnier Men'] }],
        Early: [{ keyword: 'Pore Care', score: 57, products: ['Clean & Clear Men'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Daily-friendly', score: 84, products: ['Nivea Men'] }],
        Growing: [{ keyword: 'Halal', score: 71, products: ['Safi Men'] }],
        Early: [{ keyword: 'Minimal', score: 55, products: ['L\'Oreal Men'] }]
      }
    }
  },

  indonesia: {
    platform: { retail: 'Shopee', sns: ['YouTube', 'Instagram', 'TikTok'] },
    Skincare: {
      ingredient: {
        Actionable: [
          { keyword: 'Ceramides', score: 95, products: ['Skintific 5X Ceramide Barrier Moisturize Gel'] },
          { keyword: 'Niacinamide', score: 93, products: ['Somethinc Niacinamide Moisture Sabi Beet Serum'] },
          { keyword: 'Centella Asiatica', score: 91, products: ['SKIN1004 Centella Ampoule'] },
          { keyword: 'Hyaluronic Acid', score: 89, products: ['Glad2Glow 5% HA Moisturizer'] },
          { keyword: 'Snail Mucin', score: 87, products: ['COSRX Snail Mucin Essence'] },
        ],
        Growing: [
          { keyword: 'Retinol', score: 81, products: ['Somethinc Retinol Serum'] },
          { keyword: 'Vitamin C', score: 79, products: ['Wardah C-Defense Serum'] },
          { keyword: 'Rice Extract', score: 76, products: ['Beauty of Joseon Dynasty Cream'] },
          { keyword: 'Propolis', score: 74, products: ['COSRX Propolis Synergy Toner'] },
          { keyword: 'Green Tea', score: 72, products: ['Innisfree Green Tea Seed Serum'] },
        ],
        Early: [
          { keyword: 'Peptides', score: 65, products: ['Skintific Peptide Serum'] },
          { keyword: 'Probiotics', score: 62, products: ['Skintific Probiotic Serum'] },
          { keyword: 'Bakuchiol', score: 59, products: ['Avoskin Miraculous Retinol'] },
          { keyword: 'Mugwort', score: 56, products: ['I\'m From Mugwort Essence'] },
          { keyword: 'Tranexamic Acid', score: 53, products: ['Hanasui Bright Serum'] },
        ]
      },
      formulas: {
        Actionable: [
          { keyword: 'Serum', score: 94, products: ['Somethinc Niacinamide Serum'] },
          { keyword: 'Gel Cream', score: 91, products: ['Skintific 5X Ceramide Gel'] },
          { keyword: 'Essence', score: 88, products: ['COSRX Snail Mucin Essence'] },
          { keyword: 'Toner', score: 85, products: ['Wardah Lightening Toner'] },
        ],
        Growing: [
          { keyword: 'Sheet Mask', score: 79, products: ['Garnier Serum Mask'] },
          { keyword: 'Ampoule', score: 76, products: ['SKIN1004 Centella Ampoule'] },
          { keyword: 'Moisturizer', score: 73, products: ['Glad2Glow Moisturizer'] },
        ],
        Early: [
          { keyword: 'Sleeping Mask', score: 63, products: ['Laneige Water Sleeping Mask'] },
          { keyword: 'Mist', score: 59, products: ['Wardah Hydra Rose Mist'] },
        ]
      },
      effects: {
        Actionable: [
          { keyword: 'Brightening', score: 94, products: ['Wardah C-Defense Serum'] },
          { keyword: 'Hydrating', score: 91, products: ['Skintific 5X Ceramide'] },
          { keyword: 'Acne Care', score: 89, products: ['Somethinc AHA BHA PHA Toner'] },
          { keyword: 'Barrier Repair', score: 86, products: ['Skintific Ceramide Gel'] },
        ],
        Growing: [
          { keyword: 'Anti-aging', score: 79, products: ['Somethinc Retinol'] },
          { keyword: 'Soothing', score: 76, products: ['SKIN1004 Centella'] },
          { keyword: 'Oil Control', score: 73, products: ['Wardah Acnederm'] },
        ],
        Early: [
          { keyword: 'Glass Skin', score: 64, products: ['Beauty of Joseon Glow'] },
          { keyword: 'Pore Minimizing', score: 61, products: ['COSRX BHA Blackhead'] },
        ]
      },
      mood: {
        Actionable: [
          { keyword: 'Local Pride', score: 92, products: ['Wardah'] },
          { keyword: 'Affordable Luxury', score: 89, products: ['Skintific'] },
          { keyword: 'K-Beauty', score: 86, products: ['COSRX'] },
        ],
        Growing: [
          { keyword: 'Halal Certified', score: 78, products: ['Wardah'] },
          { keyword: 'TikTok Viral', score: 75, products: ['Skintific'] },
        ],
        Early: [
          { keyword: 'Clean Beauty', score: 63, products: ['Avoskin'] },
          { keyword: 'Glass Skin Aesthetic', score: 59, products: ['Beauty of Joseon'] },
        ]
      }
    },
    Cleansing: {
      ingredient: {
        Actionable: [{ keyword: 'Salicylic Acid', score: 90, products: ['Wardah Acnederm Cleanser'] }],
        Growing: [{ keyword: 'Tea Tree', score: 76, products: ['Innisfree Tea Tree Cleanser'] }],
        Early: [{ keyword: 'Centella', score: 61, products: ['Somethinc Low pH Cleanser'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Foaming Cleanser', score: 91, products: ['Wardah Acnederm Foam'] }],
        Growing: [{ keyword: 'Gel Cleanser', score: 77, products: ['COSRX Good Morning Cleanser'] }],
        Early: [{ keyword: 'Cleansing Oil', score: 62, products: ['Banila Co Clean It Zero'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Acne Control', score: 90, products: ['Wardah Acnederm'] }],
        Growing: [{ keyword: 'Gentle Cleansing', score: 76, products: ['COSRX Low pH'] }],
        Early: [{ keyword: 'Deep Cleansing', score: 61, products: ['Garnier Micellar'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Halal Clean', score: 89, products: ['Wardah'] }],
        Growing: [{ keyword: 'K-Beauty', score: 75, products: ['COSRX'] }],
        Early: [{ keyword: 'Natural', score: 59, products: ['Innisfree'] }]
      }
    },
    'Sun Care': {
      ingredient: {
        Actionable: [{ keyword: 'Niacinamide', score: 89, products: ['Wardah UV Shield SPF50'] }],
        Growing: [{ keyword: 'Centella', score: 75, products: ['Beauty of Joseon Sun'] }],
        Early: [{ keyword: 'Vitamin E', score: 59, products: ['Emina Sun Protection'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Sun Cream', score: 90, products: ['Wardah UV Shield'] }],
        Growing: [{ keyword: 'Sun Gel', score: 76, products: ['Biore UV Aqua Rich'] }],
        Early: [{ keyword: 'Sun Stick', score: 60, products: ['Skintific Sun Stick'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Brightening SPF', score: 89, products: ['Wardah UV Shield'] }],
        Growing: [{ keyword: 'No White Cast', score: 75, products: ['Biore UV'] }],
        Early: [{ keyword: 'Water-resistant', score: 59, products: ['Anessa'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Halal', score: 88, products: ['Wardah'] }],
        Growing: [{ keyword: 'Daily-friendly', score: 74, products: ['Biore'] }],
        Early: [{ keyword: 'Travel Size', score: 57, products: ['Emina'] }]
      }
    },
    Makeup: {
      ingredient: {
        Actionable: [{ keyword: 'Hyaluronic Acid', score: 87, products: ['Maybelline Fit Me'] }],
        Growing: [{ keyword: 'Vitamin E', score: 74, products: ['Wardah Exclusive Cushion'] }],
        Early: [{ keyword: 'Collagen', score: 59, products: ['Make Over Powerstay'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Cushion Foundation', score: 91, products: ['Maybelline Fit Me Cushion'] }],
        Growing: [{ keyword: 'Lip Tint', score: 78, products: ['Wardah Colorfit Velvet'] }],
        Early: [{ keyword: 'Loose Powder', score: 62, products: ['Make Over Powerstay'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Long-lasting', score: 90, products: ['Maybelline Fit Me'] }],
        Growing: [{ keyword: 'Full Coverage', score: 77, products: ['Make Over Powerstay'] }],
        Early: [{ keyword: 'Matte Finish', score: 61, products: ['Wardah Exclusive'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Halal Beauty', score: 89, products: ['Wardah'] }],
        Growing: [{ keyword: 'Local Brand Pride', score: 76, products: ['Make Over'] }],
        Early: [{ keyword: 'K-Beauty Look', score: 60, products: ['Peripera'] }]
      }
    },
    'Hair Care': {
      ingredient: {
        Actionable: [{ keyword: 'Keratin', score: 86, products: ['Pantene Pro-V Miracle'] }],
        Growing: [{ keyword: 'Argan Oil', score: 73, products: ['Makarizo Hair Energy'] }],
        Early: [{ keyword: 'Biotin', score: 58, products: ['TRESemme Keratin'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Shampoo', score: 89, products: ['Pantene Pro-V'] }],
        Growing: [{ keyword: 'Hair Mask', score: 76, products: ['Makarizo Hair Energy'] }],
        Early: [{ keyword: 'Hair Oil', score: 61, products: ['Ellips Hair Vitamin'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Damage Repair', score: 87, products: ['Pantene Pro-V'] }],
        Growing: [{ keyword: 'Frizz Control', score: 74, products: ['Makarizo'] }],
        Early: [{ keyword: 'Anti-hair Loss', score: 59, products: ['Dove Hair Fall Rescue'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Affordable', score: 85, products: ['Pantene'] }],
        Growing: [{ keyword: 'Local Brand', score: 72, products: ['Makarizo'] }],
        Early: [{ keyword: 'Natural', score: 57, products: ['Innisfree'] }]
      }
    },
    'Body Care': {
      ingredient: {
        Actionable: [{ keyword: 'Niacinamide', score: 87, products: ['Vaseline Healthy White'] }],
        Growing: [{ keyword: 'Glutathione', score: 74, products: ['Scarlett Whitening Body Lotion'] }],
        Early: [{ keyword: 'Shea Butter', score: 59, products: ['The Body Shop'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Body Lotion', score: 89, products: ['Vaseline Healthy White'] }],
        Growing: [{ keyword: 'Body Scrub', score: 76, products: ['Scarlett Whitening Scrub'] }],
        Early: [{ keyword: 'Body Serum', score: 61, products: ['Somethinc Body Serum'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Whitening', score: 90, products: ['Vaseline Healthy White'] }],
        Growing: [{ keyword: 'Moisturizing', score: 75, products: ['Nivea Body Lotion'] }],
        Early: [{ keyword: 'Fragrance-led', score: 60, products: ['Scarlett Body Mist'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Affordable', score: 87, products: ['Vaseline'] }],
        Growing: [{ keyword: 'Local Brand', score: 74, products: ['Scarlett'] }],
        Early: [{ keyword: 'TikTok Viral', score: 59, products: ['Somethinc'] }]
      }
    },
    'Mens Care': {
      ingredient: {
        Actionable: [{ keyword: 'Charcoal', score: 85, products: ['Garnier Men TurboLight'] }],
        Growing: [{ keyword: 'Niacinamide', score: 72, products: ['MS Glow Men'] }],
        Early: [{ keyword: 'Salicylic Acid', score: 57, products: ['Nivea Men Anti-Acne'] }]
      },
      formulas: {
        Actionable: [{ keyword: 'Face Wash', score: 88, products: ['Garnier Men TurboLight'] }],
        Growing: [{ keyword: 'All-in-one', score: 75, products: ['MS Glow Men'] }],
        Early: [{ keyword: 'Gel Moisturizer', score: 60, products: ['Nivea Men'] }]
      },
      effects: {
        Actionable: [{ keyword: 'Oil Control', score: 87, products: ['Garnier Men TurboLight'] }],
        Growing: [{ keyword: 'Brightening', score: 74, products: ['MS Glow Men'] }],
        Early: [{ keyword: 'Acne Control', score: 59, products: ['Nivea Men Anti-Acne'] }]
      },
      mood: {
        Actionable: [{ keyword: 'Affordable', score: 86, products: ['Garnier Men'] }],
        Growing: [{ keyword: 'Local Brand', score: 73, products: ['MS Glow Men'] }],
        Early: [{ keyword: 'Minimal', score: 57, products: ['Nivea Men'] }]
      }
    }
  }
};

// === SNS 플랫폼 데이터 ===
const snsData = {
  usa: [
    { platform: 'YouTube', keywords: [
      { keyword: 'snail mucin', value: 95, change: 15, type: 'ingredients' },
      { keyword: 'glass skin', value: 92, change: 25, type: 'effects' },
      { keyword: 'peptides', value: 88, change: 40, type: 'ingredients' },
      { keyword: 'retinol', value: 85, change: -5, type: 'ingredients' },
      { keyword: 'serum', value: 83, change: 10, type: 'formulas' },
    ]},
    { platform: 'Instagram', keywords: [
      { keyword: 'ceramides', value: 93, change: 20, type: 'ingredients' },
      { keyword: 'dewy skin', value: 90, change: 30, type: 'effects' },
      { keyword: 'clean beauty', value: 87, change: 5, type: 'effects' },
      { keyword: 'niacinamide', value: 85, change: 10, type: 'ingredients' },
      { keyword: 'cushion', value: 82, change: 35, type: 'formulas' },
    ]},
    { platform: 'TikTok', keywords: [
      { keyword: 'snail mucin', value: 98, change: 50, type: 'ingredients' },
      { keyword: 'skin cycling', value: 95, change: 60, type: 'effects' },
      { keyword: 'PDRN', value: 90, change: 80, type: 'ingredients' },
      { keyword: 'gel cream', value: 85, change: 25, type: 'formulas' },
      { keyword: 'glass skin', value: 92, change: 35, type: 'effects' },
    ]},
    { platform: 'Amazon', keywords: [
      { keyword: 'hyaluronic acid', value: 95, change: 10, type: 'ingredients' },
      { keyword: 'vitamin C', value: 88, change: 5, type: 'ingredients' },
      { keyword: 'moisturizer', value: 92, change: 8, type: 'formulas' },
      { keyword: 'anti-aging', value: 86, change: 12, type: 'effects' },
      { keyword: 'SPF50', value: 83, change: 15, type: 'effects' },
    ]},
  ],
  japan: [
    { platform: 'YouTube', keywords: [
      { keyword: 'ceramides', value: 92, change: 15, type: 'ingredients' },
      { keyword: 'rice ferment', value: 88, change: 20, type: 'ingredients' },
      { keyword: 'essence', value: 90, change: 10, type: 'formulas' },
      { keyword: 'brightening', value: 85, change: 12, type: 'effects' },
      { keyword: 'glass skin', value: 87, change: 25, type: 'effects' },
    ]},
    { platform: 'Instagram', keywords: [
      { keyword: 'vitamin C', value: 90, change: 18, type: 'ingredients' },
      { keyword: 'sheet mask', value: 86, change: 8, type: 'formulas' },
      { keyword: 'aesthetic shelfie', value: 88, change: 30, type: 'effects' },
      { keyword: 'retinal', value: 82, change: 35, type: 'ingredients' },
      { keyword: 'recovery', value: 84, change: 40, type: 'effects' },
    ]},
    { platform: '@cosme', keywords: [
      { keyword: 'cleansing oil', value: 95, change: 5, type: 'formulas' },
      { keyword: 'tranexamic acid', value: 88, change: 22, type: 'ingredients' },
      { keyword: 'moisturizing', value: 93, change: 3, type: 'effects' },
      { keyword: 'UV protection', value: 90, change: 10, type: 'effects' },
      { keyword: 'centella', value: 85, change: 18, type: 'ingredients' },
    ]},
  ],
  singapore: [
    { platform: 'YouTube', keywords: [
      { keyword: 'centella', value: 90, change: 15, type: 'ingredients' },
      { keyword: 'snail mucin', value: 88, change: 20, type: 'ingredients' },
      { keyword: 'serum', value: 92, change: 8, type: 'formulas' },
      { keyword: 'hydrating', value: 87, change: 12, type: 'effects' },
      { keyword: 'glass skin', value: 85, change: 30, type: 'effects' },
    ]},
    { platform: 'Instagram', keywords: [
      { keyword: 'niacinamide', value: 91, change: 18, type: 'ingredients' },
      { keyword: 'K-beauty', value: 89, change: 10, type: 'effects' },
      { keyword: 'sunscreen', value: 86, change: 15, type: 'formulas' },
      { keyword: 'brightening', value: 84, change: 12, type: 'effects' },
      { keyword: 'ceramides', value: 82, change: 22, type: 'ingredients' },
    ]},
    { platform: 'Shopee', keywords: [
      { keyword: 'centella ampoule', value: 93, change: 25, type: 'formulas' },
      { keyword: 'hyaluronic acid', value: 90, change: 10, type: 'ingredients' },
      { keyword: 'SPF50+', value: 88, change: 20, type: 'effects' },
      { keyword: 'gel cream', value: 85, change: 15, type: 'formulas' },
      { keyword: 'snail mucin', value: 87, change: 30, type: 'ingredients' },
    ]},
  ],
  malaysia: [
    { platform: 'YouTube', keywords: [
      { keyword: 'niacinamide', value: 91, change: 15, type: 'ingredients' },
      { keyword: 'ceramides', value: 88, change: 25, type: 'ingredients' },
      { keyword: 'serum', value: 90, change: 10, type: 'formulas' },
      { keyword: 'brightening', value: 86, change: 12, type: 'effects' },
      { keyword: 'halal beauty', value: 84, change: 20, type: 'effects' },
    ]},
    { platform: 'Instagram', keywords: [
      { keyword: 'vitamin C', value: 89, change: 18, type: 'ingredients' },
      { keyword: 'cushion', value: 86, change: 22, type: 'formulas' },
      { keyword: 'dewy skin', value: 84, change: 15, type: 'effects' },
      { keyword: 'centella', value: 82, change: 20, type: 'ingredients' },
      { keyword: 'K-beauty', value: 87, change: 10, type: 'effects' },
    ]},
    { platform: 'Shopee', keywords: [
      { keyword: 'skintific', value: 94, change: 30, type: 'ingredients' },
      { keyword: 'sunscreen SPF50', value: 90, change: 15, type: 'formulas' },
      { keyword: 'whitening', value: 88, change: 8, type: 'effects' },
      { keyword: 'hyaluronic acid', value: 86, change: 12, type: 'ingredients' },
      { keyword: 'acne care', value: 83, change: 18, type: 'effects' },
    ]},
  ],
  indonesia: [
    { platform: 'YouTube', keywords: [
      { keyword: 'ceramides', value: 93, change: 20, type: 'ingredients' },
      { keyword: 'niacinamide', value: 91, change: 15, type: 'ingredients' },
      { keyword: 'serum', value: 92, change: 12, type: 'formulas' },
      { keyword: 'brightening', value: 89, change: 18, type: 'effects' },
      { keyword: 'acne care', value: 86, change: 22, type: 'effects' },
    ]},
    { platform: 'Instagram', keywords: [
      { keyword: 'skintific', value: 95, change: 35, type: 'ingredients' },
      { keyword: 'wardah', value: 90, change: 10, type: 'formulas' },
      { keyword: 'glass skin', value: 88, change: 30, type: 'effects' },
      { keyword: 'centella', value: 85, change: 20, type: 'ingredients' },
      { keyword: 'halal beauty', value: 87, change: 15, type: 'effects' },
    ]},
    { platform: 'TikTok', keywords: [
      { keyword: 'skintific ceramide', value: 97, change: 50, type: 'ingredients' },
      { keyword: 'somethinc', value: 93, change: 40, type: 'ingredients' },
      { keyword: 'gel cream', value: 90, change: 25, type: 'formulas' },
      { keyword: 'acne care', value: 88, change: 30, type: 'effects' },
      { keyword: 'viral skincare', value: 95, change: 60, type: 'effects' },
    ]},
    { platform: 'Shopee', keywords: [
      { keyword: 'skintific 5X ceramide', value: 96, change: 40, type: 'ingredients' },
      { keyword: 'somethinc niacinamide', value: 92, change: 25, type: 'ingredients' },
      { keyword: 'wardah acnederm', value: 89, change: 15, type: 'formulas' },
      { keyword: 'brightening', value: 87, change: 18, type: 'effects' },
      { keyword: 'sunscreen SPF50', value: 85, change: 20, type: 'formulas' },
    ]},
  ]
};

// === 메인 실행 함수 ===
async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('MongoDB 연결 성공');
    const db = client.db(DB_NAME);

    // 1. 기존 데이터 삭제
    console.log('기존 데이터 삭제 중...');
    await db.collection('processed_keywords').deleteMany({});
    await db.collection('trends').deleteMany({});
    await db.collection('sns_platform_stats').deleteMany({});
    await db.collection('leaderboard').deleteMany({});
    await db.collection('products').deleteMany({});
    console.log('기존 데이터 삭제 완료');

    // 2. processed_keywords 생성
    console.log('processed_keywords 생성 중...');
    const keywordDocs = [];
    const productDocs = [];

    for (const [country, categories] of Object.entries(countryKeywords)) {
      if (country === 'platform') continue;
      const platformInfo = categories.platform;

      for (const [category, types] of Object.entries(categories)) {
        if (category === 'platform') continue;

        for (const [keywordType, levels] of Object.entries(types)) {
          for (const [trendLevel, items] of Object.entries(levels)) {
            for (const item of items) {
              // processed_keywords 문서 생성
              const numSources = Math.floor(Math.random() * 5) + 1;
              for (let i = 0; i < numSources; i++) {
                keywordDocs.push({
                  keyword: item.keyword.toLowerCase(),
                  keywordType: keywordType,
                  sourceType: 'product_description',
                  sourceId: `${country}-${category}-${i}`.replace(/\s/g, '-'),
                  effects: generateEffects(category, keywordType),
                  country: country,
                  category: category,
                  trendLevel: trendLevel,
                  score: item.score,
                  extractedAt: randomDate(56), // 최근 8주 내
                  processedAt: new Date()
                });
              }

              // 제품 문서 생성
              for (const productName of (item.products || [])) {
                productDocs.push({
                  name: productName,
                  brand: productName.split(' ')[0],
                  country: country,
                  category: category,
                  keywords: [item.keyword.toLowerCase()],
                  keywordType: keywordType,
                  trendLevel: trendLevel,
                  score: item.score,
                  rating: (4.0 + Math.random() * 0.9).toFixed(1),
                  reviewCount: Math.floor(Math.random() * 50000) + 1000,
                  description: generateDescription(item.keyword, category, keywordType),
                  platform: platformInfo.retail,
                  imageUrl: `https://via.placeholder.com/300x300?text=${encodeURIComponent(productName.substring(0, 20))}`,
                  createdAt: new Date()
                });
              }
            }
          }
        }
      }
    }

    if (keywordDocs.length > 0) {
      await db.collection('processed_keywords').insertMany(keywordDocs);
      console.log(`  processed_keywords: ${keywordDocs.length}개 삽입`);
    }

    if (productDocs.length > 0) {
      await db.collection('products').insertMany(productDocs);
      console.log(`  products: ${productDocs.length}개 삽입`);
    }

    // 3. trends 생성
    console.log('trends 생성 중...');
    const trendDocs = [];

    for (const [country, categories] of Object.entries(countryKeywords)) {
      if (country === 'platform') continue;

      for (const [category, types] of Object.entries(categories)) {
        if (category === 'platform') continue;

        const ingredients = types.ingredient || {};
        const formulas = types.formulas || {};
        const effects = types.effects || {};

        // 각 트렌드 레벨별 조합 생성
        for (const level of ['Actionable', 'Growing', 'Early']) {
          const ingItems = (ingredients[level] || []).slice(0, 3);
          const forItems = (formulas[level] || []).slice(0, 2);
          const effItems = (effects[level] || []).slice(0, 2);

          if (ingItems.length > 0 && forItems.length > 0 && effItems.length > 0) {
            // 조합 생성
            for (let i = 0; i < Math.min(3, ingItems.length); i++) {
              const ing = ingItems[i];
              const form = forItems[i % forItems.length];
              const eff = effItems[i % effItems.length];

              const score = (ing.score + form.score + eff.score) / 3;
              const signals = generateSignals(level, score);

              trendDocs.push({
                combination: `${ing.keyword.toLowerCase()} + ${form.keyword.toLowerCase()} + ${eff.keyword.toLowerCase()}`,
                ingredients: ingItems.map(x => x.keyword.toLowerCase()),
                formulas: [form.keyword.toLowerCase()],
                effects: effItems.map(x => x.keyword.toLowerCase()),
                mood: [],
                avgRank: Math.floor(Math.random() * 20) + 1,
                productCount: Math.floor(Math.random() * 5) + 1,
                totalSales: Math.floor(Math.random() * 10000) + 500,
                score: Math.round(score * 100) / 100,
                category: level,
                mainCategory: category,
                signals: signals,
                synergyScore: (0.4 + Math.random() * 0.2).toFixed(3) * 1,
                country: country,
                calculatedAt: new Date(),
                updatedAt: new Date()
              });
            }
          }
        }
      }
    }

    if (trendDocs.length > 0) {
      await db.collection('trends').insertMany(trendDocs);
      console.log(`  trends: ${trendDocs.length}개 삽입`);
    }

    // 4. sns_platform_stats 생성
    console.log('sns_platform_stats 생성 중...');
    const snsDocs = [];

    for (const [country, platforms] of Object.entries(snsData)) {
      for (const platform of platforms) {
        snsDocs.push({
          platform: platform.platform,
          keywords: platform.keywords,
          country: country,
          date: new Date(),
          createdAt: new Date()
        });
      }
    }

    if (snsDocs.length > 0) {
      await db.collection('sns_platform_stats').insertMany(snsDocs);
      console.log(`  sns_platform_stats: ${snsDocs.length}개 삽입`);
    }

    // 5. raw_reviews 생성 (8주 데이터)
    console.log('raw_reviews 생성 중...');
    const reviewDocs = [];
    const countries = ['usa', 'japan', 'singapore', 'malaysia', 'indonesia'];

    for (const country of countries) {
      for (let week = 0; week < 8; week++) {
        const reviewCount = Math.floor(Math.random() * 30) + 10;
        for (let i = 0; i < reviewCount; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (week * 7) - Math.floor(Math.random() * 7));
          reviewDocs.push({
            country: country,
            postedAt: date,
            rating: (3.5 + Math.random() * 1.5).toFixed(1) * 1,
            content: 'Sample review content',
            source: country === 'usa' ? 'Amazon' : country === 'japan' ? '@cosme' : 'Shopee',
            createdAt: new Date()
          });
        }
      }
    }

    if (reviewDocs.length > 0) {
      await db.collection('raw_reviews').deleteMany({});
      await db.collection('raw_reviews').insertMany(reviewDocs);
      console.log(`  raw_reviews: ${reviewDocs.length}개 삽입`);
    }

    // 6. 인덱스 생성
    console.log('인덱스 생성 중...');
    await db.collection('processed_keywords').createIndex({ country: 1, keywordType: 1, category: 1 });
    await db.collection('processed_keywords').createIndex({ keyword: 1, country: 1 });
    await db.collection('trends').createIndex({ country: 1, category: 1, mainCategory: 1 });
    await db.collection('trends').createIndex({ score: -1 });
    await db.collection('products').createIndex({ country: 1, category: 1, keywordType: 1 });
    await db.collection('products').createIndex({ keywords: 1 });
    await db.collection('sns_platform_stats').createIndex({ country: 1, platform: 1 });
    console.log('인덱스 생성 완료');

    // 최종 통계
    console.log('\n=== 시드 데이터 생성 완료 ===');
    const collections = ['processed_keywords', 'trends', 'sns_platform_stats', 'products', 'raw_reviews'];
    for (const col of collections) {
      const count = await db.collection(col).countDocuments();
      console.log(`  ${col}: ${count}개`);
    }

  } catch (error) {
    console.error('시드 데이터 생성 오류:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB 연결 종료');
  }
}

// === 헬퍼 함수 ===
function generateEffects(category, keywordType) {
  const effectPools = {
    Skincare: ['hydration', 'anti-aging', 'brightening', 'soothing', 'barrier repair', 'pore minimizing'],
    Cleansing: ['deep cleansing', 'gentle', 'pore care', 'oil control', 'soothing'],
    'Sun Care': ['UV protection', 'no white cast', 'moisturizing', 'tone-up', 'lightweight'],
    Makeup: ['long-lasting', 'full coverage', 'dewy finish', 'matte finish', 'color correcting'],
    'Hair Care': ['damage repair', 'moisturizing', 'scalp care', 'volumizing', 'frizz control'],
    'Body Care': ['moisturizing', 'brightening', 'firming', 'exfoliating', 'fragrance'],
    'Mens Care': ['oil control', 'soothing', 'pore care', 'non-sticky', 'simple routine']
  };
  const pool = effectPools[category] || effectPools.Skincare;
  const count = Math.floor(Math.random() * 2) + 2;
  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

function generateSignals(level, baseScore) {
  if (level === 'Actionable') {
    return {
      SNS: Math.round(70 + Math.random() * 30),
      Retail: Math.round(60 + Math.random() * 30),
      Review: Math.round(65 + Math.random() * 30)
    };
  } else if (level === 'Growing') {
    return {
      SNS: Math.round(50 + Math.random() * 40),
      Retail: Math.round(30 + Math.random() * 40),
      Review: Math.round(40 + Math.random() * 40)
    };
  } else {
    return {
      SNS: Math.round(30 + Math.random() * 40),
      Retail: Math.round(10 + Math.random() * 30),
      Review: Math.round(20 + Math.random() * 40)
    };
  }
}

function generateDescription(keyword, category, type) {
  const descriptions = {
    ingredient: `A popular ${category.toLowerCase()} product featuring ${keyword} as the key active ingredient. Highly rated for its effectiveness and gentle formulation.`,
    formulas: `A ${keyword} formulation designed for ${category.toLowerCase()} that delivers lightweight yet effective results. Features advanced texture technology.`,
    effects: `A ${category.toLowerCase()} product focused on ${keyword} benefits. Clinically tested and widely recommended by dermatologists.`,
    mood: `A ${category.toLowerCase()} product embodying the ${keyword} aesthetic. Known for its appealing design and sensory experience.`
  };
  return descriptions[type] || descriptions.ingredient;
}

function randomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
}

// 실행
seedDatabase();
