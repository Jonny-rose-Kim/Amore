import { CountryLeaderboardData, MainCategory, ItemType, TrendLevel, LeaderboardItem, BubbleItem, TrendStatus, Country, SNSTopIngredient } from './mockData';
import { getTrendEvidence, getReviewKeywords } from './countryData';

// 국가별 리더보드 데이터
export const leaderboardData: Record<string, CountryLeaderboardData> = {
  USA: {
    "Skincare": {
      "Ingredients": {
        "Actionable": [
          { rank: 1, keyword: "Centella Asiatica", score: 98 },
          { rank: 2, keyword: "Snail Mucin", score: 96 },
          { rank: 3, keyword: "Retinol", score: 94 },
          { rank: 4, keyword: "Niacinamide", score: 92 },
          { rank: 5, keyword: "Ceramides", score: 91 }
        ],
        "Growing": [
          { rank: 1, keyword: "PDRN (Salmon DNA)", score: 85 },
          { rank: 2, keyword: "Spicule", score: 82 },
          { rank: 3, keyword: "Rice Extract", score: 79 },
          { rank: 4, keyword: "Ginseng", score: 76 },
          { rank: 5, keyword: "Kombucha", score: 74 }
        ],
        "Early": [
          { rank: 1, keyword: "Exosomes", score: 65 },
          { rank: 2, keyword: "Onion Extract", score: 62 },
          { rank: 3, keyword: "Succinic Acid", score: 58 },
          { rank: 4, keyword: "Mushroom Complex", score: 55 },
          { rank: 5, keyword: "Red Algae", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Toner Pad", score: 95 },
          { keyword: "Serum", score: 93 },
          { keyword: "Lightweight Cream", score: 90 },
          { keyword: "Pimple Patch", score: 98 },
          { keyword: "Sheet Mask", score: 89 }
        ],
        "Growing": [
          { keyword: "Modeling Mask", score: 85 },
          { keyword: "Essence Mist", score: 80 },
          { keyword: "Stick Balm", score: 78 },
          { keyword: "Bubble Toner", score: 75 },
          { keyword: "Melting Balm", score: 72 }
        ],
        "Early": [
          { keyword: "Overnight Mask", score: 65 },
          { keyword: "Powder Wash", score: 60 },
          { keyword: "Jelly Mask", score: 58 },
          { keyword: "Oil-to-Foam", score: 55 },
          { keyword: "Freeze-dried", score: 52 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Barrier Repair", score: 99 },
          { keyword: "Glass Skin", score: 97 },
          { keyword: "Soothing", score: 95 },
          { keyword: "Hydrating", score: 92 },
          { keyword: "Glow", score: 91 }
        ],
        "Growing": [
          { keyword: "Slow Aging", score: 86 },
          { keyword: "Dark Spot", score: 83 },
          { keyword: "Redness Relief", score: 80 },
          { keyword: "Textured Skin", score: 77 },
          { keyword: "Plumping", score: 75 }
        ],
        "Early": [
          { keyword: "Neuro-Glow", score: 68 },
          { keyword: "Stress Care", score: 64 },
          { keyword: "Heat Aging", score: 60 },
          { keyword: "Microbiome Balance", score: 57 },
          { keyword: "Hormonal Acne", score: 54 }
        ]
      },
      "Visual/Mood": {
        "Early": [
          { rank: 1, keyword: "Keyring / Bag Pendant", score: 68 },
          { rank: 2, keyword: "Customizable / DIY", score: 65 }
        ],
        "Growing": [
          { rank: 1, keyword: "Grip / Ergonomic", score: 86 },
          { rank: 2, keyword: "Luxury-", score: 83 },
          { rank: 3, keyword: "Tanghulu / Glassy", score: 80 }
        ],
        "Actionable": [
          { rank: 1, keyword: "Miniature / Pocket-sized", score: 97 },
          { rank: 2, keyword: "Matte texture", score: 94 },
          { rank: 3, keyword: "Dermatology vibe", score: 91 }
        ]
      },
      "Combined": {
        "Actionable": [
          { rank: 1, keyword: "The Snail Glow", score: 99 },
          { rank: 2, keyword: "Organic Sunscreen", score: 97 },
          { rank: 3, keyword: "Redness Killer", score: 95 },
          { rank: 4, keyword: "Barrier Builder", score: 93 },
          { rank: 5, keyword: "Gentle Glow", score: 91 }
        ]
      }
    },
    "Cleansing": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Salicylic Acid", score: 96 },
          { keyword: "AHA/BHA", score: 94 },
          { keyword: "Tea Tree", score: 92 },
          { keyword: "Centella", score: 90 },
          { keyword: "Charcoal", score: 88 }
        ],
        "Growing": [
          { keyword: "Enzyme", score: 82 },
          { keyword: "Probiotics", score: 79 },
          { keyword: "Green Tea", score: 76 },
          { keyword: "Witch Hazel", score: 73 },
          { keyword: "Niacinamide", score: 70 }
        ],
        "Early": [
          { keyword: "Prebiotics", score: 65 },
          { keyword: "Mugwort", score: 62 },
          { keyword: "Rice Extract", score: 58 },
          { keyword: "Honey", score: 55 },
          { keyword: "Oat Extract", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Cleansing Balm", score: 96 },
          { keyword: "Micellar Water", score: 92 },
          { keyword: "Cleansing Oil", score: 90 },
          { keyword: "Gel Cleanser", score: 88 },
          { keyword: "Salicylic Wash", score: 85 }
        ],
        "Growing": [
          { keyword: "Oil-to-Milk", score: 82 },
          { keyword: "Powder Wash", score: 79 },
          { keyword: "Cleansing Stick", score: 75 },
          { keyword: "Wipe-off Milk", score: 72 },
          { keyword: "Clay Cleanser", score: 70 }
        ],
        "Early": [
          { keyword: "Melting Gel", score: 65 },
          { keyword: "Serum Cleanser", score: 62 },
          { keyword: "Carbonated Foam", score: 59 },
          { keyword: "Dry Oil", score: 55 },
          { keyword: "Solid Bar", score: 52 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Deep Clean", score: 97 },
          { keyword: "Pore Purifying", score: 95 },
          { keyword: "Acne Control", score: 93 },
          { keyword: "Oil Control", score: 91 },
          { keyword: "Gentle Exfoliation", score: 89 }
        ],
        "Growing": [
          { keyword: "Barrier Support", score: 84 },
          { keyword: "Soothing", score: 81 },
          { keyword: "Brightening", score: 78 },
          { keyword: "Hydrating", score: 75 },
          { keyword: "Anti-pollution", score: 72 }
        ],
        "Early": [
          { keyword: "Microbiome Balance", score: 66 },
          { keyword: "Stress Relief", score: 63 },
          { keyword: "Detox", score: 60 },
          { keyword: "Cooling", score: 57 },
          { keyword: "Anti-aging", score: 54 }
        ]
      }
    },
    "Sun Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Zinc Oxide", score: 97 },
          { keyword: "Titanium Dioxide", score: 95 },
          { keyword: "Niacinamide", score: 93 },
          { keyword: "Hyaluronic Acid", score: 91 },
          { keyword: "Vitamin E", score: 89 }
        ],
        "Growing": [
          { keyword: "Probiotics", score: 84 },
          { keyword: "Rice Extract", score: 81 },
          { keyword: "Centella", score: 78 },
          { keyword: "Aloe Vera", score: 75 },
          { keyword: "Green Tea", score: 72 }
        ],
        "Early": [
          { keyword: "Blue Light Filter", score: 66 },
          { keyword: "Antioxidants", score: 63 },
          { keyword: "Ceramides", score: 60 },
          { keyword: "Peptides", score: 57 },
          { keyword: "Retinol", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Sun Cream", score: 96 },
          { keyword: "Sun Gel", score: 94 },
          { keyword: "Sun Stick", score: 92 },
          { keyword: "Sun Mist", score: 90 },
          { keyword: "Sun Serum", score: 88 }
        ],
        "Growing": [
          { keyword: "Tinted Sunscreen", score: 83 },
          { keyword: "Cushion Sun", score: 80 },
          { keyword: "Powder Sun", score: 77 },
          { keyword: "Oil Sun", score: 74 },
          { keyword: "Watery Essence", score: 71 }
        ],
        "Early": [
          { keyword: "Sun Mousse", score: 65 },
          { keyword: "Spray Sun", score: 62 },
          { keyword: "Patch Sun", score: 59 },
          { keyword: "Gel-to-Water", score: 56 },
          { keyword: "Foam Sun", score: 53 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "No White Cast", score: 98 },
          { keyword: "Reef Safe", score: 95 },
          { keyword: "Hydrating", score: 93 },
          { keyword: "Non-greasy", score: 90 },
          { keyword: "Glow Finish", score: 89 }
        ],
        "Growing": [
          { keyword: "Tinted Sunscreen", score: 85 },
          { keyword: "Sun Serum", score: 82 },
          { keyword: "Mineral Filter", score: 79 },
          { keyword: "Blue Light Block", score: 76 },
          { keyword: "Stick Format", score: 74 }
        ],
        "Early": [
          { keyword: "Scalp Sunscreen", score: 68 },
          { keyword: "Sun Mousse", score: 64 },
          { keyword: "Oral Sunblock", score: 55 },
          { keyword: "Wash-off Sun", score: 52 },
          { keyword: "Probiotic Sun", score: 50 }
        ]
      }
    },
    "Makeup": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Hyaluronic Acid", score: 94 },
          { keyword: "Niacinamide", score: 92 },
          { keyword: "Ceramides", score: 90 },
          { keyword: "Vitamin E", score: 88 },
          { keyword: "Squalane", score: 86 }
        ],
        "Growing": [
          { keyword: "Snail Mucin", score: 82 },
          { keyword: "Centella", score: 79 },
          { keyword: "Aloe Vera", score: 76 },
          { keyword: "Rose Extract", score: 73 },
          { keyword: "Peptides", score: 70 }
        ],
        "Early": [
          { keyword: "Probiotics", score: 65 },
          { keyword: "Collagen", score: 62 },
          { keyword: "Retinol", score: 58 },
          { keyword: "Vitamin C", score: 55 },
          { keyword: "Ginseng", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Liquid Blush", score: 95 },
          { keyword: "Lip Oil", score: 93 },
          { keyword: "Skin Tint", score: 90 },
          { keyword: "Setting Spray", score: 88 },
          { keyword: "Cream Bronzer", score: 85 }
        ],
        "Growing": [
          { keyword: "Cushion Foundation", score: 82 },
          { keyword: "Jelly Highlighter", score: 78 },
          { keyword: "Lip Stain", score: 75 },
          { keyword: "Brow Glue", score: 72 },
          { keyword: "Blurring Powder", score: 70 }
        ],
        "Early": [
          { keyword: "Peel-off Tint", score: 65 },
          { keyword: "Color Changing", score: 60 },
          { keyword: "Water Foundation", score: 58 },
          { keyword: "Stamp Blush", score: 55 },
          { keyword: "Magnetic Lashes", score: 52 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Long-lasting", score: 97 },
          { keyword: "Natural Finish", score: 95 },
          { keyword: "Hydrating", score: 93 },
          { keyword: "Glow", score: 91 },
          { keyword: "Blurring", score: 89 }
        ],
        "Growing": [
          { keyword: "Skin-like", score: 84 },
          { keyword: "Transfer-proof", score: 81 },
          { keyword: "Buildable", score: 78 },
          { keyword: "Lightweight", score: 75 },
          { keyword: "Radiant", score: 72 }
        ],
        "Early": [
          { keyword: "Color Adaptive", score: 66 },
          { keyword: "Self-setting", score: 63 },
          { keyword: "Multi-use", score: 60 },
          { keyword: "Skin Care", score: 57 },
          { keyword: "Waterproof", score: 54 }
        ]
      },
      "Visual/Mood": {
        "Early": [
          { rank: 1, keyword: "Customizable / DIY", score: 68 },
          { rank: 2, keyword: "Stringy / Slime", score: 65 }
        ],
        "Growing": [
          { rank: 1, keyword: "Keyring / Bag Accessory", score: 86 },
          { rank: 2, keyword: "Y2K / Silver", score: 83 },
          { rank: 3, keyword: "Egg Shape / Pebble", score: 80 }
        ],
        "Actionable": [
          { rank: 1, keyword: "Tanghulu / Glassy", score: 97 },
          { rank: 2, keyword: "Character collaboration", score: 94 },
          { rank: 3, keyword: "Daily-friendly", score: 91 }
        ]
      }
    },
    "Hair Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Keratin", score: 96 },
          { keyword: "Argan Oil", score: 94 },
          { keyword: "Biotin", score: 92 },
          { keyword: "Coconut Oil", score: 90 },
          { keyword: "Peptides", score: 88 }
        ],
        "Growing": [
          { keyword: "Rosemary Oil", score: 83 },
          { keyword: "Rice Water", score: 80 },
          { keyword: "Collagen", score: 77 },
          { keyword: "Hyaluronic Acid", score: 74 },
          { keyword: "Niacinamide", score: 71 }
        ],
        "Early": [
          { keyword: "CBD", score: 66 },
          { keyword: "Probiotics", score: 63 },
          { keyword: "Ceramides", score: 60 },
          { keyword: "Retinol", score: 57 },
          { keyword: "Vitamin C", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Shampoo", score: 95 },
          { keyword: "Conditioner", score: 93 },
          { keyword: "Hair Mask", score: 91 },
          { keyword: "Hair Oil", score: 89 },
          { keyword: "Scalp Serum", score: 87 }
        ],
        "Growing": [
          { keyword: "Hair Ampoule", score: 83 },
          { keyword: "Scalp Scrub", score: 80 },
          { keyword: "Dry Shampoo", score: 77 },
          { keyword: "Hair Mist", score: 74 },
          { keyword: "Hair Essence", score: 71 }
        ],
        "Early": [
          { keyword: "Hair Patch", score: 66 },
          { keyword: "Hair Gel", score: 63 },
          { keyword: "Hair Foam", score: 60 },
          { keyword: "Hair Cream", score: 57 },
          { keyword: "Hair Powder", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Bond Repair", score: 96 },
          { keyword: "Scalp Detox", score: 93 },
          { keyword: "Frizz Control", score: 90 },
          { keyword: "Heat Protection", score: 88 },
          { keyword: "Growth", score: 85 }
        ],
        "Growing": [
          { keyword: "Rosemary Oil", score: 82 },
          { keyword: "Rice Water", score: 79 },
          { keyword: "Clarifying", score: 76 },
          { keyword: "Glossing", score: 73 },
          { keyword: "Peptide Treatment", score: 70 }
        ],
        "Early": [
          { keyword: "Scalp Sunscreen", score: 65 },
          { keyword: "Hair Botox", score: 62 },
          { keyword: "Scalp Microneedling", score: 58 },
          { keyword: "Custom Color", score: 55 },
          { keyword: "Hard Water Detox", score: 52 }
        ]
      },
      "Visual/Mood": {
        "Early": [
          { rank: 1, keyword: "Silver / Y2K", score: 66 },
          { rank: 2, keyword: "Grip / Ergonomic", score: 63 }
        ],
        "Growing": [
          { rank: 1, keyword: "Aesthetic / Shelfie", score: 85 },
          { rank: 2, keyword: "Refillable / Eco-luxe", score: 82 },
          { rank: 3, keyword: "Satisfying", score: 79 }
        ],
        "Actionable": [
          { rank: 1, keyword: "Clinical / Dermatology", score: 96 },
          { rank: 2, keyword: "Pump container", score: 93 },
          { rank: 3, keyword: "Clean / Calm mood", score: 90 }
        ]
      }
    },
    "Body Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Retinol", score: 94 },
          { keyword: "Glycolic Acid", score: 91 },
          { keyword: "Ceramides", score: 89 },
          { keyword: "Shea Butter", score: 87 },
          { keyword: "Salicylic Acid", score: 85 }
        ],
        "Growing": [
          { keyword: "Niacinamide", score: 82 },
          { keyword: "Hyaluronic Acid", score: 79 },
          { keyword: "Vitamin C", score: 76 },
          { keyword: "Caffeine", score: 73 },
          { keyword: "Collagen", score: 70 }
        ],
        "Early": [
          { keyword: "Bakuchiol", score: 65 },
          { keyword: "Magnesium", score: 62 },
          { keyword: "Kombucha", score: 59 },
          { keyword: "Pheromones", score: 55 },
          { keyword: "CBD", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Body Lotion", score: 95 },
          { keyword: "Body Cream", score: 93 },
          { keyword: "Body Oil", score: 91 },
          { keyword: "Body Scrub", score: 89 },
          { keyword: "Body Serum", score: 87 }
        ],
        "Growing": [
          { keyword: "Body Gel", score: 83 },
          { keyword: "Body Mist", score: 80 },
          { keyword: "Body Butter", score: 77 },
          { keyword: "Body Essence", score: 74 },
          { keyword: "Body Ampoule", score: 71 }
        ],
        "Early": [
          { keyword: "Body Patch", score: 66 },
          { keyword: "Body Foam", score: 63 },
          { keyword: "Body Powder", score: 60 },
          { keyword: "Body Jelly", score: 57 },
          { keyword: "Body Stick", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Moisturizing", score: 96 },
          { keyword: "Smoothing", score: 94 },
          { keyword: "Firming", score: 92 },
          { keyword: "Brightening", score: 90 },
          { keyword: "Exfoliating", score: 88 }
        ],
        "Growing": [
          { keyword: "Anti-aging", score: 84 },
          { keyword: "Cellulite", score: 81 },
          { keyword: "Stretch Marks", score: 78 },
          { keyword: "Hydrating", score: 75 },
          { keyword: "Glowing", score: 72 }
        ],
        "Early": [
          { keyword: "Detox", score: 66 },
          { keyword: "Cooling", score: 63 },
          { keyword: "Soothing", score: 60 },
          { keyword: "Toning", score: 57 },
          { keyword: "Lifting", score: 54 }
        ]
      },
      "Visual/Mood": {
        "Early": [
          { rank: 1, keyword: "Customizable", score: 66 },
          { rank: 2, keyword: "Keyring", score: 63 }
        ],
        "Growing": [
          { rank: 1, keyword: "Egg Shape / Pebble", score: 85 },
          { rank: 2, keyword: "Aesthetic / Shelfie", score: 82 },
          { rank: 3, keyword: "Grip / Ergonomic", score: 79 }
        ],
        "Actionable": [
          { rank: 1, keyword: "Luxury-", score: 96 },
          { rank: 2, keyword: "Refillable / Eco-luxe", score: 93 },
          { rank: 3, keyword: "Minimal design", score: 90 }
        ]
      }
    },
    "Mens Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Niacinamide", score: 94 },
          { keyword: "Salicylic Acid", score: 92 },
          { keyword: "Tea Tree", score: 90 },
          { keyword: "Charcoal", score: 88 },
          { keyword: "Vitamin C", score: 86 }
        ],
        "Growing": [
          { keyword: "Retinol", score: 82 },
          { keyword: "Peptides", score: 79 },
          { keyword: "Centella", score: 76 },
          { keyword: "Hyaluronic Acid", score: 73 },
          { keyword: "Ceramides", score: 70 }
        ],
        "Early": [
          { keyword: "Bakuchiol", score: 65 },
          { keyword: "Probiotics", score: 62 },
          { keyword: "Collagen", score: 58 },
          { keyword: "CBD", score: 55 },
          { keyword: "Ginseng", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Face Wash", score: 95 },
          { keyword: "Moisturizer", score: 93 },
          { keyword: "Sunscreen", score: 91 },
          { keyword: "Serum", score: 89 },
          { keyword: "Toner", score: 87 }
        ],
        "Growing": [
          { keyword: "All-in-One", score: 83 },
          { keyword: "Gel", score: 80 },
          { keyword: "Stick", score: 77 },
          { keyword: "Mist", score: 74 },
          { keyword: "Patch", score: 71 }
        ],
        "Early": [
          { keyword: "Foam", score: 66 },
          { keyword: "Powder", score: 63 },
          { keyword: "Oil", score: 60 },
          { keyword: "Cream", score: 57 },
          { keyword: "Essence", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Beard Care", score: 93 },
          { keyword: "Simple Routine", score: 90 },
          { keyword: "Anti-fatigue", score: 87 },
          { keyword: "Acne Control", score: 85 },
          { keyword: "Oil Control", score: 83 }
        ],
        "Growing": [
          { keyword: "Concealer", score: 79 },
          { keyword: "Tinted Moisturizer", score: 76 },
          { keyword: "Dark Circles", score: 73 },
          { keyword: "Razor Bump", score: 70 },
          { keyword: "Hair Loss", score: 68 }
        ],
        "Early": [
          { keyword: "Nail Care", score: 60 },
          { keyword: "Intimate Wash", score: 58 },
          { keyword: "Makeup", score: 55 },
          { keyword: "Brow Grooming", score: 52 },
          { keyword: "Hand Mask", score: 50 }
        ]
      },
      "Visual/Mood": {
        "Early": [
          { rank: 1, keyword: "Y2K / Silver", score: 66 },
          { rank: 2, keyword: "Egg Shape / Pebble", score: 63 }
        ],
        "Growing": [
          { rank: 1, keyword: "Gender-neutral", score: 85 },
          { rank: 2, keyword: "Clinical", score: 82 },
          { rank: 3, keyword: "Pump / Airless", score: 79 }
        ],
        "Actionable": [
          { rank: 1, keyword: "Minimal / Matte", score: 96 },
          { rank: 2, keyword: "Daily-friendly", score: 93 },
          { rank: 3, keyword: "Clean / White tone", score: 90 }
        ]
      }
    }
  },
  Japan: {
    "Skincare": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Vitamin C", score: 99 },
          { keyword: "Retinol", score: 97 },
          { keyword: "Cica", score: 95 },
          { keyword: "Ceramides", score: 93 },
          { keyword: "Hyaluronic Acid", score: 91 }
        ],
        "Growing": [
          { keyword: "Azelaic Acid", score: 88 },
          { keyword: "Niacinamide", score: 85 },
          { keyword: "Glutathione", score: 82 },
          { keyword: "Bakuchiol", score: 79 },
          { keyword: "Heartleaf", score: 76 }
        ],
        "Early": [
          { keyword: "EGF / FGF", score: 68 },
          { keyword: "Human Stem Cell", score: 65 },
          { keyword: "Raw Vitamin", score: 62 },
          { keyword: "Fullerene", score: 59 },
          { keyword: "Proteoglycan", score: 55 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Sheet Mask", score: 98 },
          { keyword: "Lotion (Toner)", score: 96 },
          { keyword: "Enzyme Powder", score: 93 },
          { keyword: "Cleansing Oil", score: 91 },
          { keyword: "All-in-One Gel", score: 89 }
        ],
        "Growing": [
          { keyword: "Needle Shot", score: 86 },
          { keyword: "Toner Pad", score: 83 },
          { keyword: "Booster Serum", score: 80 },
          { keyword: "Balm Cleanser", score: 78 },
          { keyword: "Carbonated Foam", score: 75 }
        ],
        "Early": [
          { keyword: "Melting Balm", score: 68 },
          { keyword: "Freeze-dried", score: 64 },
          { keyword: "Solid Serum", score: 60 },
          { keyword: "Jelly Mist", score: 57 },
          { keyword: "Peel-off Pack", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Pore Care", score: 98 },
          { keyword: "Whitening", score: 96 },
          { keyword: "Anti-aging", score: 94 },
          { keyword: "Moisturizing", score: 92 },
          { keyword: "Rough Skin", score: 90 }
        ],
        "Growing": [
          { keyword: "Vertical Pores", score: 86 },
          { keyword: "Tone-up", score: 84 },
          { keyword: "Sebum Control", score: 81 },
          { keyword: "Acne Scars", score: 79 },
          { keyword: "Elasticity", score: 76 }
        ],
        "Early": [
          { keyword: "Inner Dryness", score: 68 },
          { keyword: "Blue Light", score: 63 },
          { keyword: "Pollution Care", score: 59 },
          { keyword: "Neck Care", score: 56 },
          { keyword: "Eye Bags", score: 53 }
        ]
      },
      "Combined": {
        "Actionable": [
          { rank: 1, keyword: "Needle Pore Care", score: 99 },
          { rank: 2, keyword: "Vitamin Brightening", score: 97 },
          { rank: 3, keyword: "Retinol Repair", score: 95 },
          { rank: 4, keyword: "Glass Skin Base", score: 93 },
          { rank: 5, keyword: "Trouble Rescue", score: 91 }
        ]
      }
    },
    "Cleansing": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Enzyme", score: 96 },
          { keyword: "Rice Bran", score: 94 },
          { keyword: "Green Tea", score: 92 },
          { keyword: "Charcoal", score: 90 },
          { keyword: "AHA/BHA", score: 88 }
        ],
        "Growing": [
          { keyword: "Probiotics", score: 82 },
          { keyword: "Centella", score: 79 },
          { keyword: "Hyaluronic Acid", score: 76 },
          { keyword: "Ceramides", score: 73 },
          { keyword: "Niacinamide", score: 70 }
        ],
        "Early": [
          { keyword: "Prebiotics", score: 65 },
          { keyword: "Mugwort", score: 62 },
          { keyword: "Collagen", score: 58 },
          { keyword: "Peptides", score: 55 },
          { keyword: "Vitamin C", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Cleansing Oil", score: 97 },
          { keyword: "Enzyme Powder", score: 94 },
          { keyword: "Cleansing Balm", score: 91 },
          { keyword: "Foam", score: 89 },
          { keyword: "Gel", score: 86 }
        ],
        "Growing": [
          { keyword: "Carbonated Foam", score: 83 },
          { keyword: "Hot Gel", score: 80 },
          { keyword: "Milk", score: 77 },
          { keyword: "Clay Wash", score: 74 },
          { keyword: "Wipe-off Water", score: 71 }
        ],
        "Early": [
          { keyword: "Solid Soap", score: 65 },
          { keyword: "Oil-in-Water", score: 62 },
          { keyword: "Stick Cleanser", score: 59 },
          { keyword: "Serum Wash", score: 56 },
          { keyword: "Peeling Mousse", score: 53 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Deep Clean", score: 97 },
          { keyword: "Pore Care", score: 95 },
          { keyword: "Gentle", score: 93 },
          { keyword: "Moisturizing", score: 91 },
          { keyword: "Brightening", score: 89 }
        ],
        "Growing": [
          { keyword: "Barrier Support", score: 84 },
          { keyword: "Soothing", score: 81 },
          { keyword: "Exfoliating", score: 78 },
          { keyword: "Hydrating", score: 75 },
          { keyword: "Anti-aging", score: 72 }
        ],
        "Early": [
          { keyword: "Detox", score: 66 },
          { keyword: "Cooling", score: 63 },
          { keyword: "Microbiome", score: 60 },
          { keyword: "Stress Relief", score: 57 },
          { keyword: "Anti-pollution", score: 54 }
        ]
      }
    },
    "Sun Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Zinc Oxide", score: 97 },
          { keyword: "Titanium Dioxide", score: 95 },
          { keyword: "Hyaluronic Acid", score: 93 },
          { keyword: "Ceramides", score: 91 },
          { keyword: "Vitamin E", score: 89 }
        ],
        "Growing": [
          { keyword: "Rice Extract", score: 84 },
          { keyword: "Centella", score: 81 },
          { keyword: "Aloe Vera", score: 78 },
          { keyword: "Green Tea", score: 75 },
          { keyword: "Niacinamide", score: 72 }
        ],
        "Early": [
          { keyword: "Blue Light Filter", score: 66 },
          { keyword: "Antioxidants", score: 63 },
          { keyword: "Peptides", score: 60 },
          { keyword: "Retinol", score: 57 },
          { keyword: "Probiotics", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Sun Cream", score: 96 },
          { keyword: "Sun Gel", score: 94 },
          { keyword: "Sun Stick", score: 92 },
          { keyword: "Sun Mist", score: 90 },
          { keyword: "Sun Serum", score: 88 }
        ],
        "Growing": [
          { keyword: "Tinted Sun", score: 83 },
          { keyword: "Cushion Sun", score: 80 },
          { keyword: "Powder Sun", score: 77 },
          { keyword: "Oil Sun", score: 74 },
          { keyword: "Watery Essence", score: 71 }
        ],
        "Early": [
          { keyword: "Sun Mousse", score: 65 },
          { keyword: "Spray Sun", score: 62 },
          { keyword: "Patch Sun", score: 59 },
          { keyword: "Gel-to-Water", score: 56 },
          { keyword: "Foam Sun", score: 53 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "UV Protection", score: 98 },
          { keyword: "Tone-up", score: 96 },
          { keyword: "Makeup Base", score: 93 },
          { keyword: "Water-proof", score: 91 },
          { keyword: "Non-chemical", score: 88 }
        ],
        "Growing": [
          { keyword: "Beautifying", score: 84 },
          { keyword: "Cooling", score: 81 },
          { keyword: "Pollen Block", score: 78 },
          { keyword: "Stick Type", score: 75 },
          { keyword: "Spray Type", score: 72 }
        ],
        "Early": [
          { keyword: "Hair Sunscreen", score: 65 },
          { keyword: "Lip Sunscreen", score: 62 },
          { keyword: "Drinkable Sun", score: 58 },
          { keyword: "Cushion Sun", score: 55 },
          { keyword: "Patch", score: 52 }
        ]
      }
    },
    "Makeup": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Hyaluronic Acid", score: 94 },
          { keyword: "Ceramides", score: 92 },
          { keyword: "Niacinamide", score: 90 },
          { keyword: "Vitamin E", score: 88 },
          { keyword: "Squalane", score: 86 }
        ],
        "Growing": [
          { keyword: "Snail Mucin", score: 82 },
          { keyword: "Centella", score: 79 },
          { keyword: "Aloe Vera", score: 76 },
          { keyword: "Rose Extract", score: 73 },
          { keyword: "Peptides", score: 70 }
        ],
        "Early": [
          { keyword: "Probiotics", score: 65 },
          { keyword: "Collagen", score: 62 },
          { keyword: "Retinol", score: 58 },
          { keyword: "Vitamin C", score: 55 },
          { keyword: "Ginseng", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Cushion Founde", score: 97 },
          { keyword: "Loose Powder", score: 94 },
          { keyword: "Mascara Base", score: 91 },
          { keyword: "Lip Tint", score: 89 },
          { keyword: "Cream Blush", score: 86 }
        ],
        "Growing": [
          { keyword: "Stick Highlighter", score: 83 },
          { keyword: "Liquid Glitter", score: 80 },
          { keyword: "Brow Mascara", score: 77 },
          { keyword: "Melting Lip", score: 74 },
          { keyword: "Concealer Palette", score: 71 }
        ],
        "Early": [
          { keyword: "Lip Plumper", score: 66 },
          { keyword: "Setting Mist", score: 63 },
          { keyword: "Mineral Powder", score: 60 },
          { keyword: "Multi-pencil", score: 57 },
          { keyword: "Stamp Liner", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Long-lasting", score: 97 },
          { keyword: "Natural Finish", score: 95 },
          { keyword: "Hydrating", score: 93 },
          { keyword: "Glow", score: 91 },
          { keyword: "Blurring", score: 89 }
        ],
        "Growing": [
          { keyword: "Skin-like", score: 84 },
          { keyword: "Transfer-proof", score: 81 },
          { keyword: "Buildable", score: 78 },
          { keyword: "Lightweight", score: 75 },
          { keyword: "Radiant", score: 72 }
        ],
        "Early": [
          { keyword: "Color Adaptive", score: 66 },
          { keyword: "Self-setting", score: 63 },
          { keyword: "Multi-use", score: 60 },
          { keyword: "Skin Care", score: 57 },
          { keyword: "Waterproof", score: 54 }
        ]
      }
    },
    "Hair Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Keratin", score: 96 },
          { keyword: "Argan Oil", score: 94 },
          { keyword: "Biotin", score: 92 },
          { keyword: "Coconut Oil", score: 90 },
          { keyword: "Peptides", score: 88 }
        ],
        "Growing": [
          { keyword: "Rosemary Oil", score: 83 },
          { keyword: "Rice Water", score: 80 },
          { keyword: "Collagen", score: 77 },
          { keyword: "Hyaluronic Acid", score: 74 },
          { keyword: "Niacinamide", score: 71 }
        ],
        "Early": [
          { keyword: "CBD", score: 66 },
          { keyword: "Probiotics", score: 63 },
          { keyword: "Ceramides", score: 60 },
          { keyword: "Retinol", score: 57 },
          { keyword: "Vitamin C", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Shampoo", score: 95 },
          { keyword: "Conditioner", score: 93 },
          { keyword: "Hair Mask", score: 91 },
          { keyword: "Hair Oil", score: 89 },
          { keyword: "Scalp Serum", score: 87 }
        ],
        "Growing": [
          { keyword: "Hair Ampoule", score: 83 },
          { keyword: "Scalp Scrub", score: 80 },
          { keyword: "Dry Shampoo", score: 77 },
          { keyword: "Hair Mist", score: 74 },
          { keyword: "Hair Essence", score: 71 }
        ],
        "Early": [
          { keyword: "Hair Patch", score: 66 },
          { keyword: "Hair Gel", score: 63 },
          { keyword: "Hair Foam", score: 60 },
          { keyword: "Hair Cream", score: 57 },
          { keyword: "Hair Powder", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Damage Repair", score: 98 },
          { keyword: "Smoothness (Sarra)", score: 96 },
          { keyword: "Moisturizing", score: 93 },
          { keyword: "Scent", score: 91 },
          { keyword: "Color Care", score: 88 }
        ],
        "Growing": [
          { keyword: "Scalp Care", score: 85 },
          { keyword: "Frizz Control", score: 82 },
          { keyword: "Night Repair", score: 79 },
          { keyword: "Heat Protect", score: 76 },
          { keyword: "Volumizing", score: 73 }
        ],
        "Early": [
          { keyword: "Acid Heat Treat", score: 68 },
          { keyword: "Gray Hair Care", score: 65 },
          { keyword: "Head Spa", score: 61 },
          { keyword: "Hair Water", score: 58 },
          { keyword: "Scalp Essence", score: 55 }
        ]
      }
    },
    "Body Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Ceramides", score: 95 },
          { keyword: "Urea", score: 92 },
          { keyword: "Shea Butter", score: 90 },
          { keyword: "Placenta", score: 87 },
          { keyword: "Collagen", score: 85 }
        ],
        "Growing": [
          { keyword: "Cica", score: 82 },
          { keyword: "Vitamin C", score: 79 },
          { keyword: "Job's Tears", score: 76 },
          { keyword: "Retinol", score: 73 },
          { keyword: "White Clay", score: 70 }
        ],
        "Early": [
          { keyword: "CBD", score: 62 },
          { keyword: "Stem Cell", score: 59 },
          { keyword: "Gold", score: 56 },
          { keyword: "Sake Lees", score: 53 },
          { keyword: "Matcha", score: 50 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Body Lotion", score: 95 },
          { keyword: "Body Cream", score: 93 },
          { keyword: "Body Oil", score: 91 },
          { keyword: "Body Scrub", score: 89 },
          { keyword: "Body Serum", score: 87 }
        ],
        "Growing": [
          { keyword: "Body Gel", score: 83 },
          { keyword: "Body Mist", score: 80 },
          { keyword: "Body Butter", score: 77 },
          { keyword: "Body Essence", score: 74 },
          { keyword: "Body Ampoule", score: 71 }
        ],
        "Early": [
          { keyword: "Body Patch", score: 66 },
          { keyword: "Body Foam", score: 63 },
          { keyword: "Body Powder", score: 60 },
          { keyword: "Body Jelly", score: 57 },
          { keyword: "Body Stick", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Moisturizing", score: 96 },
          { keyword: "Smoothing", score: 94 },
          { keyword: "Firming", score: 92 },
          { keyword: "Brightening", score: 90 },
          { keyword: "Exfoliating", score: 88 }
        ],
        "Growing": [
          { keyword: "Anti-aging", score: 84 },
          { keyword: "Cellulite", score: 81 },
          { keyword: "Stretch Marks", score: 78 },
          { keyword: "Hydrating", score: 75 },
          { keyword: "Glowing", score: 72 }
        ],
        "Early": [
          { keyword: "Detox", score: 66 },
          { keyword: "Cooling", score: 63 },
          { keyword: "Soothing", score: 60 },
          { keyword: "Toning", score: 57 },
          { keyword: "Lifting", score: 54 }
        ]
      }
    },
    "Mens Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Niacinamide", score: 94 },
          { keyword: "Salicylic Acid", score: 92 },
          { keyword: "Tea Tree", score: 90 },
          { keyword: "Charcoal", score: 88 },
          { keyword: "Vitamin C", score: 86 }
        ],
        "Growing": [
          { keyword: "Retinol", score: 82 },
          { keyword: "Peptides", score: 79 },
          { keyword: "Centella", score: 76 },
          { keyword: "Hyaluronic Acid", score: 73 },
          { keyword: "Ceramides", score: 70 }
        ],
        "Early": [
          { keyword: "Bakuchiol", score: 65 },
          { keyword: "Probiotics", score: 62 },
          { keyword: "Collagen", score: 58 },
          { keyword: "CBD", score: 55 },
          { keyword: "Ginseng", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Face Wash", score: 95 },
          { keyword: "Moisturizer", score: 93 },
          { keyword: "Sunscreen", score: 91 },
          { keyword: "Serum", score: 89 },
          { keyword: "Toner", score: 87 }
        ],
        "Growing": [
          { keyword: "All-in-One", score: 83 },
          { keyword: "Gel", score: 80 },
          { keyword: "Stick", score: 77 },
          { keyword: "Mist", score: 74 },
          { keyword: "Patch", score: 71 }
        ],
        "Early": [
          { keyword: "Foam", score: 66 },
          { keyword: "Powder", score: 63 },
          { keyword: "Oil", score: 60 },
          { keyword: "Cream", score: 57 },
          { keyword: "Essence", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Sebum Control", score: 94 },
          { keyword: "Pore Care", score: 92 },
          { keyword: "Smell Control", score: 89 },
          { keyword: "After Shave", score: 87 },
          { keyword: "Face Wash", score: 85 }
        ],
        "Growing": [
          { keyword: "BB Cream", score: 82 },
          { keyword: "Eyebrow Trim", score: 79 },
          { keyword: "Lip Care", score: 76 },
          { keyword: "Whitening", score: 73 },
          { keyword: "Hair Removal", score: 70 }
        ],
        "Early": [
          { keyword: "Nail Polish", score: 62 },
          { keyword: "Concealer", score: 59 },
          { keyword: "Anti-aging", score: 56 },
          { keyword: "Eye Makeup", score: 53 },
          { keyword: "Intimate Care", score: 50 }
        ]
      }
    }
  },
  Indonesia: {
    "Skincare": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Niacinamide", score: 99 },
          { keyword: "Salicylic Acid", score: 97 },
          { keyword: "Ceramides", score: 95 },
          { keyword: "Centella", score: 93 },
          { keyword: "Alpha Arbutin", score: 91 }
        ],
        "Growing": [
          { keyword: "SymWhite 377", score: 88 },
          { keyword: "Mugwort", score: 85 },
          { keyword: "Retinal", score: 82 },
          { keyword: "Panthenol", score: 79 },
          { keyword: "Propolis", score: 76 }
        ],
        "Early": [
          { keyword: "Kombucha", score: 68 },
          { keyword: "Sea Buckthorn", score: 65 },
          { keyword: "Cactus Extract", score: 62 },
          { keyword: "Blue Tansy", score: 59 },
          { keyword: "Truffle", score: 55 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Gel Moisturizer", score: 98 },
          { keyword: "Clay Stick", score: 97 },
          { keyword: "Toner Pad", score: 94 },
          { keyword: "Sun Gel", score: 92 },
          { keyword: "Micellar Water", score: 90 }
        ],
        "Growing": [
          { keyword: "Skin Tint", score: 86 },
          { keyword: "Mugwort Mask", score: 83 },
          { keyword: "Cleansing Balm", score: 80 },
          { keyword: "Mist", score: 77 },
          { keyword: "Watery Essence", score: 75 }
        ],
        "Early": [
          { keyword: "Modeling Mask", score: 65 },
          { keyword: "Powder Wash", score: 62 },
          { keyword: "Bubble Toner", score: 58 },
          { keyword: "Stick Balm", score: 55 },
          { keyword: "Oil-to-Foam", score: 52 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Brightening", score: 99 },
          { keyword: "Acne Care", score: 98 },
          { keyword: "Barrier Repair", score: 95 },
          { keyword: "Oil Control", score: 93 },
          { keyword: "Dark Spot", score: 91 }
        ],
        "Growing": [
          { keyword: "Glowing", score: 86 },
          { keyword: "Pore Tightening", score: 83 },
          { keyword: "Redness", score: 80 },
          { keyword: "Anti-aging", score: 78 },
          { keyword: "Sun Damage", score: 75 }
        ],
        "Early": [
          { keyword: "Glass Skin", score: 68 },
          { keyword: "Fungal Acne", score: 65 },
          { keyword: "Texture Repair", score: 62 },
          { keyword: "Neck Lines", score: 58 },
          { keyword: "Under Eye", score: 55 }
        ]
      },
      "Combined": {
        "Actionable": [
          { rank: 1, keyword: "Barrier Gel", score: 99 },
          { rank: 2, keyword: "Instant Detox", score: 97 },
          { rank: 3, keyword: "Spot Eraser", score: 95 },
          { rank: 4, keyword: "Acne Solution", score: 93 },
          { rank: 5, keyword: "Tone-up Sun", score: 91 }
        ]
      }
    },
    "Cleansing": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Salicylic Acid", score: 96 },
          { keyword: "AHA/BHA", score: 94 },
          { keyword: "Tea Tree", score: 92 },
          { keyword: "Centella", score: 90 },
          { keyword: "Charcoal", score: 88 }
        ],
        "Growing": [
          { keyword: "Enzyme", score: 82 },
          { keyword: "Probiotics", score: 79 },
          { keyword: "Green Tea", score: 76 },
          { keyword: "Witch Hazel", score: 73 },
          { keyword: "Niacinamide", score: 70 }
        ],
        "Early": [
          { keyword: "Prebiotics", score: 65 },
          { keyword: "Mugwort", score: 62 },
          { keyword: "Rice Extract", score: 58 },
          { keyword: "Honey", score: 55 },
          { keyword: "Oat Extract", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Foam Cleanser", score: 98 },
          { keyword: "Micellar Water", score: 96 },
          { keyword: "Gel Cleanser", score: 93 },
          { keyword: "Bar Soap (Acne)", score: 90 },
          { keyword: "Clay Wash", score: 88 }
        ],
        "Growing": [
          { keyword: "Cleansing Balm", score: 85 },
          { keyword: "Cleansing Oil", score: 82 },
          { keyword: "Salicylic Wash", score: 79 },
          { keyword: "Wipes", score: 76 },
          { keyword: "Low pH Gel", score: 73 }
        ],
        "Early": [
          { keyword: "Powder Wash", score: 65 },
          { keyword: "Milk Cleanser", score: 62 },
          { keyword: "Stick Cleanser", score: 59 },
          { keyword: "Jelly Wash", score: 56 },
          { keyword: "Bi-phase", score: 53 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Deep Clean", score: 97 },
          { keyword: "Pore Purifying", score: 95 },
          { keyword: "Acne Control", score: 93 },
          { keyword: "Oil Control", score: 91 },
          { keyword: "Gentle Exfoliation", score: 89 }
        ],
        "Growing": [
          { keyword: "Barrier Support", score: 84 },
          { keyword: "Soothing", score: 81 },
          { keyword: "Brightening", score: 78 },
          { keyword: "Hydrating", score: 75 },
          { keyword: "Anti-pollution", score: 72 }
        ],
        "Early": [
          { keyword: "Microbiome Balance", score: 66 },
          { keyword: "Stress Relief", score: 63 },
          { keyword: "Detox", score: 60 },
          { keyword: "Cooling", score: 57 },
          { keyword: "Anti-aging", score: 54 }
        ]
      }
    },
    "Sun Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Zinc Oxide", score: 97 },
          { keyword: "Titanium Dioxide", score: 95 },
          { keyword: "Niacinamide", score: 93 },
          { keyword: "Hyaluronic Acid", score: 91 },
          { keyword: "Vitamin E", score: 89 }
        ],
        "Growing": [
          { keyword: "Probiotics", score: 84 },
          { keyword: "Rice Extract", score: 81 },
          { keyword: "Centella", score: 78 },
          { keyword: "Aloe Vera", score: 75 },
          { keyword: "Green Tea", score: 72 }
        ],
        "Early": [
          { keyword: "Blue Light Filter", score: 66 },
          { keyword: "Antioxidants", score: 63 },
          { keyword: "Ceramides", score: 60 },
          { keyword: "Peptides", score: 57 },
          { keyword: "Retinol", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Sun Cream", score: 96 },
          { keyword: "Sun Gel", score: 94 },
          { keyword: "Sun Stick", score: 92 },
          { keyword: "Sun Mist", score: 90 },
          { keyword: "Sun Serum", score: 88 }
        ],
        "Growing": [
          { keyword: "Tinted Sunscreen", score: 83 },
          { keyword: "Cushion Sun", score: 80 },
          { keyword: "Powder Sun", score: 77 },
          { keyword: "Oil Sun", score: 74 },
          { keyword: "Watery Essence", score: 71 }
        ],
        "Early": [
          { keyword: "Sun Mousse", score: 65 },
          { keyword: "Spray Sun", score: 62 },
          { keyword: "Patch Sun", score: 59 },
          { keyword: "Gel-to-Water", score: 56 },
          { keyword: "Foam Sun", score: 53 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Tone-up", score: 98 },
          { keyword: "Non-sticky", score: 96 },
          { keyword: "No White Cast", score: 94 },
          { keyword: "SPF 50+", score: 92 },
          { keyword: "Blue Light", score: 89 }
        ],
        "Growing": [
          { keyword: "Serum Texture", score: 85 },
          { keyword: "Cooling", score: 82 },
          { keyword: "Mist Spray", score: 79 },
          { keyword: "Acne Safe", score: 76 },
          { keyword: "Water-proof", score: 73 }
        ],
        "Early": [
          { keyword: "Sun Mousse", score: 65 },
          { keyword: "Tinted Sun", score: 62 },
          { keyword: "Cushion Sun", score: 59 },
          { keyword: "Body Sun Stick", score: 56 },
          { keyword: "Shimmer Sun", score: 53 }
        ]
      }
    },
    "Makeup": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Hyaluronic Acid", score: 94 },
          { keyword: "Niacinamide", score: 92 },
          { keyword: "Ceramides", score: 90 },
          { keyword: "Vitamin E", score: 88 },
          { keyword: "Squalane", score: 86 }
        ],
        "Growing": [
          { keyword: "Snail Mucin", score: 82 },
          { keyword: "Centella", score: 79 },
          { keyword: "Aloe Vera", score: 76 },
          { keyword: "Rose Extract", score: 73 },
          { keyword: "Peptides", score: 70 }
        ],
        "Early": [
          { keyword: "Probiotics", score: 65 },
          { keyword: "Collagen", score: 62 },
          { keyword: "Retinol", score: 58 },
          { keyword: "Vitamin C", score: 55 },
          { keyword: "Ginseng", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Lip Tint", score: 99 },
          { keyword: "Cushion Founde", score: 97 },
          { keyword: "Loose Powder", score: 95 },
          { keyword: "Matte Lip", score: 92 },
          { keyword: "Eyebrow Pencil", score: 90 }
        ],
        "Growing": [
          { keyword: "Skin Tint", score: 86 },
          { keyword: "Lip Gloss", score: 83 },
          { keyword: "Setting Spray", score: 80 },
          { keyword: "Liquid Blush", score: 77 },
          { keyword: "Cream Contour", score: 74 }
        ],
        "Early": [
          { keyword: "Lip Liner", score: 68 },
          { keyword: "Glitter Gel", score: 65 },
          { keyword: "Soap Brow", score: 62 },
          { keyword: "Freckle Pen", score: 59 },
          { keyword: "Colored Mascara", score: 56 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Long-lasting", score: 97 },
          { keyword: "Natural Finish", score: 95 },
          { keyword: "Hydrating", score: 93 },
          { keyword: "Glow", score: 91 },
          { keyword: "Blurring", score: 89 }
        ],
        "Growing": [
          { keyword: "Skin-like", score: 84 },
          { keyword: "Transfer-proof", score: 81 },
          { keyword: "Buildable", score: 78 },
          { keyword: "Lightweight", score: 75 },
          { keyword: "Radiant", score: 72 }
        ],
        "Early": [
          { keyword: "Color Adaptive", score: 66 },
          { keyword: "Self-setting", score: 63 },
          { keyword: "Multi-use", score: 60 },
          { keyword: "Skin Care", score: 57 },
          { keyword: "Waterproof", score: 54 }
        ]
      }
    },
    "Hair Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Keratin", score: 96 },
          { keyword: "Argan Oil", score: 94 },
          { keyword: "Biotin", score: 92 },
          { keyword: "Coconut Oil", score: 90 },
          { keyword: "Peptides", score: 88 }
        ],
        "Growing": [
          { keyword: "Rosemary Oil", score: 83 },
          { keyword: "Rice Water", score: 80 },
          { keyword: "Collagen", score: 77 },
          { keyword: "Hyaluronic Acid", score: 74 },
          { keyword: "Niacinamide", score: 71 }
        ],
        "Early": [
          { keyword: "CBD", score: 66 },
          { keyword: "Probiotics", score: 63 },
          { keyword: "Ceramides", score: 60 },
          { keyword: "Retinol", score: 57 },
          { keyword: "Vitamin C", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Shampoo", score: 95 },
          { keyword: "Conditioner", score: 93 },
          { keyword: "Hair Mask", score: 91 },
          { keyword: "Hair Oil", score: 89 },
          { keyword: "Scalp Serum", score: 87 }
        ],
        "Growing": [
          { keyword: "Hair Ampoule", score: 83 },
          { keyword: "Scalp Scrub", score: 80 },
          { keyword: "Dry Shampoo", score: 77 },
          { keyword: "Hair Mist", score: 74 },
          { keyword: "Hair Essence", score: 71 }
        ],
        "Early": [
          { keyword: "Hair Patch", score: 66 },
          { keyword: "Hair Gel", score: 63 },
          { keyword: "Hair Foam", score: 60 },
          { keyword: "Hair Cream", score: 57 },
          { keyword: "Hair Powder", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Anti-hair Loss", score: 98 },
          { keyword: "Scalp Cooling", score: 96 },
          { keyword: "Dandruff Care", score: 94 },
          { keyword: "Scent (Hijab)", score: 92 },
          { keyword: "Smoothness", score: 90 }
        ],
        "Growing": [
          { keyword: "Hair Vitamin", score: 86 },
          { keyword: "Root Lift", score: 83 },
          { keyword: "Dry Shampoo", score: 80 },
          { keyword: "Heat Protect", score: 77 },
          { keyword: "Split Ends", score: 74 }
        ],
        "Early": [
          { keyword: "Scalp Scrub", score: 68 },
          { keyword: "Hair Tonic", score: 65 },
          { keyword: "Hair Perfume", score: 62 },
          { keyword: "Keratin", score: 59 },
          { keyword: "Hair Mask Stick", score: 56 }
        ]
      }
    },
    "Body Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Niacinamide", score: 97 },
          { keyword: "Glutathione", score: 95 },
          { keyword: "Goat Milk", score: 92 },
          { keyword: "Vitamin C", score: 90 },
          { keyword: "Scrub Beads", score: 88 }
        ],
        "Growing": [
          { keyword: "AHA", score: 84 },
          { keyword: "Shea Butter", score: 81 },
          { keyword: "Kojic Acid", score: 78 },
          { keyword: "Collagen", score: 75 },
          { keyword: "Ceramides", score: 72 }
        ],
        "Early": [
          { keyword: "Retinol", score: 65 },
          { keyword: "Symwhite", score: 62 },
          { keyword: "Bakuchiol", score: 59 },
          { keyword: "Mugwort", score: 56 },
          { keyword: "Saffron", score: 53 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Body Lotion", score: 95 },
          { keyword: "Body Cream", score: 93 },
          { keyword: "Body Oil", score: 91 },
          { keyword: "Body Scrub", score: 89 },
          { keyword: "Body Serum", score: 87 }
        ],
        "Growing": [
          { keyword: "Body Gel", score: 83 },
          { keyword: "Body Mist", score: 80 },
          { keyword: "Body Butter", score: 77 },
          { keyword: "Body Essence", score: 74 },
          { keyword: "Body Ampoule", score: 71 }
        ],
        "Early": [
          { keyword: "Body Patch", score: 66 },
          { keyword: "Body Foam", score: 63 },
          { keyword: "Body Powder", score: 60 },
          { keyword: "Body Jelly", score: 57 },
          { keyword: "Body Stick", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Moisturizing", score: 96 },
          { keyword: "Smoothing", score: 94 },
          { keyword: "Firming", score: 92 },
          { keyword: "Brightening", score: 90 },
          { keyword: "Exfoliating", score: 88 }
        ],
        "Growing": [
          { keyword: "Anti-aging", score: 84 },
          { keyword: "Cellulite", score: 81 },
          { keyword: "Stretch Marks", score: 78 },
          { keyword: "Hydrating", score: 75 },
          { keyword: "Glowing", score: 72 }
        ],
        "Early": [
          { keyword: "Detox", score: 66 },
          { keyword: "Cooling", score: 63 },
          { keyword: "Soothing", score: 60 },
          { keyword: "Toning", score: 57 },
          { keyword: "Lifting", score: 54 }
        ]
      }
    },
    "Mens Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Niacinamide", score: 94 },
          { keyword: "Salicylic Acid", score: 92 },
          { keyword: "Tea Tree", score: 90 },
          { keyword: "Charcoal", score: 88 },
          { keyword: "Vitamin C", score: 86 }
        ],
        "Growing": [
          { keyword: "Retinol", score: 82 },
          { keyword: "Peptides", score: 79 },
          { keyword: "Centella", score: 76 },
          { keyword: "Hyaluronic Acid", score: 73 },
          { keyword: "Ceramides", score: 70 }
        ],
        "Early": [
          { keyword: "Bakuchiol", score: 65 },
          { keyword: "Probiotics", score: 62 },
          { keyword: "Collagen", score: 58 },
          { keyword: "CBD", score: 55 },
          { keyword: "Ginseng", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Face Wash", score: 95 },
          { keyword: "Moisturizer", score: 93 },
          { keyword: "Sunscreen", score: 91 },
          { keyword: "Serum", score: 89 },
          { keyword: "Toner", score: 87 }
        ],
        "Growing": [
          { keyword: "All-in-One", score: 83 },
          { keyword: "Gel", score: 80 },
          { keyword: "Stick", score: 77 },
          { keyword: "Mist", score: 74 },
          { keyword: "Patch", score: 71 }
        ],
        "Early": [
          { keyword: "Foam", score: 66 },
          { keyword: "Powder", score: 63 },
          { keyword: "Oil", score: 60 },
          { keyword: "Cream", score: 57 },
          { keyword: "Essence", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Oil Control", score: 96 },
          { keyword: "Acne Care", score: 94 },
          { keyword: "Cooling", score: 91 },
          { keyword: "Brightening", score: 89 },
          { keyword: "Face Wash", score: 87 }
        ],
        "Growing": [
          { keyword: "Pore Strip", score: 83 },
          { keyword: "Sunscreen", score: 80 },
          { keyword: "Lip Balm", score: 77 },
          { keyword: "Beard Oil", score: 74 },
          { keyword: "Scrub", score: 71 }
        ],
        "Early": [
          { keyword: "Tone-up Cream", score: 65 },
          { keyword: "Serum", score: 62 },
          { keyword: "Eye Cream", score: 59 },
          { keyword: "Sheet Mask", score: 56 },
          { keyword: "Concealer", score: 53 }
        ]
      }
    }
  },
  Malaysia: {
    "Skincare": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Niacinamide", score: 98 },
          { keyword: "AHA / BHA", score: 95 },
          { keyword: "Vitamin C", score: 93 },
          { keyword: "Aloe Vera", score: 91 },
          { keyword: "Tea Tree", score: 90 }
        ],
        "Growing": [
          { keyword: "Tranexamic Acid", score: 86 },
          { keyword: "Ceramides", score: 83 },
          { keyword: "Snail Mucin", score: 80 },
          { keyword: "Galactomyces", score: 77 },
          { keyword: "Retinol", score: 74 }
        ],
        "Early": [
          { keyword: "Bakuchiol", score: 65 },
          { keyword: "Peptides", score: 62 },
          { keyword: "Bifida", score: 59 },
          { keyword: "Rosehip Oil", score: 56 },
          { keyword: "Grapeseed", score: 53 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Gel Cream", score: 97 },
          { keyword: "Sheet Mask", score: 95 },
          { keyword: "Sun Stick", score: 93 },
          { keyword: "Clay Mask", score: 91 },
          { keyword: "Foam Cleanser", score: 89 }
        ],
        "Growing": [
          { keyword: "Sun Serum", score: 85 },
          { keyword: "Sleeping Mask", score: 82 },
          { keyword: "Peeling Gel", score: 79 },
          { keyword: "Lip Oil", score: 76 },
          { keyword: "Toner Pad", score: 73 }
        ],
        "Early": [
          { keyword: "Cleansing Oil", score: 66 },
          { keyword: "Spicule Cream", score: 63 },
          { keyword: "Jelly Mask", score: 60 },
          { keyword: "Mousse", score: 57 },
          { keyword: "Capsule Cream", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Whitening", score: 99 },
          { keyword: "Oil Control", score: 96 },
          { keyword: "Hydration", score: 93 },
          { keyword: "Spot Fading", score: 91 },
          { keyword: "Pore Care", score: 90 }
        ],
        "Growing": [
          { keyword: "Barrier Repair", score: 85 },
          { keyword: "Glow", score: 82 },
          { keyword: "Anti-aging", score: 79 },
          { keyword: "Soothing", score: 76 },
          { keyword: "Exfoliation", score: 73 }
        ],
        "Early": [
          { keyword: "Skin Resilience", score: 65 },
          { keyword: "Plumping", score: 61 },
          { keyword: "De-puffing", score: 58 },
          { keyword: "Lifting", score: 55 },
          { keyword: "Detox", score: 52 }
        ]
      },
      "Combined": {
        "Actionable": [
          { rank: 1, keyword: "K-Brightening", score: 99 },
          { rank: 2, keyword: "Acne Eraser", score: 97 },
          { rank: 3, keyword: "Soothing Sun", score: 95 },
          { rank: 4, keyword: "Scar Care", score: 93 },
          { rank: 5, keyword: "Fresh Cleanse", score: 91 }
        ]
      }
    },
    "Cleansing": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Salicylic Acid", score: 96 },
          { keyword: "AHA/BHA", score: 94 },
          { keyword: "Tea Tree", score: 92 },
          { keyword: "Centella", score: 90 },
          { keyword: "Charcoal", score: 88 }
        ],
        "Growing": [
          { keyword: "Enzyme", score: 82 },
          { keyword: "Probiotics", score: 79 },
          { keyword: "Green Tea", score: 76 },
          { keyword: "Witch Hazel", score: 73 },
          { keyword: "Niacinamide", score: 70 }
        ],
        "Early": [
          { keyword: "Prebiotics", score: 65 },
          { keyword: "Mugwort", score: 62 },
          { keyword: "Rice Extract", score: 58 },
          { keyword: "Honey", score: 55 },
          { keyword: "Oat Extract", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Foam", score: 97 },
          { keyword: "Micellar Water", score: 95 },
          { keyword: "Gel", score: 92 },
          { keyword: "Scrub Wash", score: 89 },
          { keyword: "Soap Bar", score: 87 }
        ],
        "Growing": [
          { keyword: "Cleansing Balm", score: 84 },
          { keyword: "Oil Cleanser", score: 81 },
          { keyword: "Wipes", score: 78 },
          { keyword: "Clay Wash", score: 75 },
          { keyword: "Low pH", score: 72 }
        ],
        "Early": [
          { keyword: "Powder Wash", score: 65 },
          { keyword: "Milk", score: 62 },
          { keyword: "Stick", score: 59 },
          { keyword: "Mousse", score: 56 },
          { keyword: "Cream", score: 53 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Deep Clean", score: 97 },
          { keyword: "Pore Purifying", score: 95 },
          { keyword: "Acne Control", score: 93 },
          { keyword: "Oil Control", score: 91 },
          { keyword: "Gentle Exfoliation", score: 89 }
        ],
        "Growing": [
          { keyword: "Barrier Support", score: 84 },
          { keyword: "Soothing", score: 81 },
          { keyword: "Brightening", score: 78 },
          { keyword: "Hydrating", score: 75 },
          { keyword: "Anti-pollution", score: 72 }
        ],
        "Early": [
          { keyword: "Microbiome Balance", score: 66 },
          { keyword: "Stress Relief", score: 63 },
          { keyword: "Detox", score: 60 },
          { keyword: "Cooling", score: 57 },
          { keyword: "Anti-aging", score: 54 }
        ]
      }
    },
    "Sun Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Zinc Oxide", score: 97 },
          { keyword: "Titanium Dioxide", score: 95 },
          { keyword: "Niacinamide", score: 93 },
          { keyword: "Hyaluronic Acid", score: 91 },
          { keyword: "Vitamin E", score: 89 }
        ],
        "Growing": [
          { keyword: "Probiotics", score: 84 },
          { keyword: "Rice Extract", score: 81 },
          { keyword: "Centella", score: 78 },
          { keyword: "Aloe Vera", score: 75 },
          { keyword: "Green Tea", score: 72 }
        ],
        "Early": [
          { keyword: "Blue Light Filter", score: 66 },
          { keyword: "Antioxidants", score: 63 },
          { keyword: "Ceramides", score: 60 },
          { keyword: "Peptides", score: 57 },
          { keyword: "Retinol", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Sun Cream", score: 96 },
          { keyword: "Sun Gel", score: 94 },
          { keyword: "Sun Stick", score: 92 },
          { keyword: "Sun Mist", score: 90 },
          { keyword: "Sun Serum", score: 88 }
        ],
        "Growing": [
          { keyword: "Tinted Sunscreen", score: 83 },
          { keyword: "Cushion Sun", score: 80 },
          { keyword: "Powder Sun", score: 77 },
          { keyword: "Oil Sun", score: 74 },
          { keyword: "Watery Essence", score: 71 }
        ],
        "Early": [
          { keyword: "Sun Mousse", score: 65 },
          { keyword: "Spray Sun", score: 62 },
          { keyword: "Patch Sun", score: 59 },
          { keyword: "Gel-to-Water", score: 56 },
          { keyword: "Foam Sun", score: 53 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Non-greasy", score: 98 },
          { keyword: "Tone-up", score: 96 },
          { keyword: "Halal Friendly", score: 94 },
          { keyword: "Matte Finish", score: 92 },
          { keyword: "SPF 50+", score: 90 }
        ],
        "Growing": [
          { keyword: "Sun Stick", score: 86 },
          { keyword: "Serum Sun", score: 83 },
          { keyword: "Hydrating", score: 80 },
          { keyword: "No White Cast", score: 77 },
          { keyword: "Glow", score: 74 }
        ],
        "Early": [
          { keyword: "Cushion Sun", score: 68 },
          { keyword: "Tinted", score: 65 },
          { keyword: "Physical UV", score: 62 },
          { keyword: "Mist", score: 59 },
          { keyword: "Body Stick", score: 56 }
        ]
      }
    },
    "Makeup": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Hyaluronic Acid", score: 94 },
          { keyword: "Niacinamide", score: 92 },
          { keyword: "Ceramides", score: 90 },
          { keyword: "Vitamin E", score: 88 },
          { keyword: "Squalane", score: 86 }
        ],
        "Growing": [
          { keyword: "Snail Mucin", score: 82 },
          { keyword: "Centella", score: 79 },
          { keyword: "Aloe Vera", score: 76 },
          { keyword: "Rose Extract", score: 73 },
          { keyword: "Peptides", score: 70 }
        ],
        "Early": [
          { keyword: "Probiotics", score: 65 },
          { keyword: "Collagen", score: 62 },
          { keyword: "Retinol", score: 58 },
          { keyword: "Vitamin C", score: 55 },
          { keyword: "Ginseng", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Cushion Founde", score: 96 },
          { keyword: "Lip Matte", score: 94 },
          { keyword: "Loose Powder", score: 92 },
          { keyword: "Eyeliner", score: 90 },
          { keyword: "Compact Powder", score: 88 }
        ],
        "Growing": [
          { keyword: "Lip Tint", score: 85 },
          { keyword: "Setting Spray", score: 82 },
          { keyword: "Liquid Blush", score: 79 },
          { keyword: "Brow Gel", score: 76 },
          { keyword: "Priming Base", score: 73 }
        ],
        "Early": [
          { keyword: "Lip Oil", score: 66 },
          { keyword: "Glossy Stain", score: 63 },
          { keyword: "Stick Blush", score: 60 },
          { keyword: "Glitter", score: 57 },
          { keyword: "Color Corrector", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Long-lasting", score: 97 },
          { keyword: "Natural Finish", score: 95 },
          { keyword: "Hydrating", score: 93 },
          { keyword: "Glow", score: 91 },
          { keyword: "Blurring", score: 89 }
        ],
        "Growing": [
          { keyword: "Skin-like", score: 84 },
          { keyword: "Transfer-proof", score: 81 },
          { keyword: "Buildable", score: 78 },
          { keyword: "Lightweight", score: 75 },
          { keyword: "Radiant", score: 72 }
        ],
        "Early": [
          { keyword: "Color Adaptive", score: 66 },
          { keyword: "Self-setting", score: 63 },
          { keyword: "Multi-use", score: 60 },
          { keyword: "Skin Care", score: 57 },
          { keyword: "Waterproof", score: 54 }
        ]
      }
    },
    "Hair Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Keratin", score: 96 },
          { keyword: "Argan Oil", score: 94 },
          { keyword: "Biotin", score: 92 },
          { keyword: "Coconut Oil", score: 90 },
          { keyword: "Peptides", score: 88 }
        ],
        "Growing": [
          { keyword: "Rosemary Oil", score: 83 },
          { keyword: "Rice Water", score: 80 },
          { keyword: "Collagen", score: 77 },
          { keyword: "Hyaluronic Acid", score: 74 },
          { keyword: "Niacinamide", score: 71 }
        ],
        "Early": [
          { keyword: "CBD", score: 66 },
          { keyword: "Probiotics", score: 63 },
          { keyword: "Ceramides", score: 60 },
          { keyword: "Retinol", score: 57 },
          { keyword: "Vitamin C", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Shampoo", score: 95 },
          { keyword: "Conditioner", score: 93 },
          { keyword: "Hair Mask", score: 91 },
          { keyword: "Hair Oil", score: 89 },
          { keyword: "Scalp Serum", score: 87 }
        ],
        "Growing": [
          { keyword: "Hair Ampoule", score: 83 },
          { keyword: "Scalp Scrub", score: 80 },
          { keyword: "Dry Shampoo", score: 77 },
          { keyword: "Hair Mist", score: 74 },
          { keyword: "Hair Essence", score: 71 }
        ],
        "Early": [
          { keyword: "Hair Patch", score: 66 },
          { keyword: "Hair Gel", score: 63 },
          { keyword: "Hair Foam", score: 60 },
          { keyword: "Hair Cream", score: 57 },
          { keyword: "Hair Powder", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Anti-hair Loss", score: 97 },
          { keyword: "Scalp Care", score: 95 },
          { keyword: "Dandruff", score: 93 },
          { keyword: "Scent", score: 91 },
          { keyword: "Cooling", score: 89 }
        ],
        "Growing": [
          { keyword: "Smoothness", score: 85 },
          { keyword: "Hair Vitamin", score: 82 },
          { keyword: "Root Volume", score: 79 },
          { keyword: "Heat Protect", score: 76 },
          { keyword: "Dry Shampoo", score: 73 }
        ],
        "Early": [
          { keyword: "Scalp Scrub", score: 67 },
          { keyword: "Hair Tonic", score: 64 },
          { keyword: "Vinegar Rinse", score: 61 },
          { keyword: "Hair Perfume", score: 58 },
          { keyword: "Edge Control", score: 55 }
        ]
      }
    },
    "Body Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Niacinamide", score: 96 },
          { keyword: "Shea Butter", score: 93 },
          { keyword: "Goat Milk", score: 91 },
          { keyword: "Rose", score: 89 },
          { keyword: "Aloe Vera", score: 87 }
        ],
        "Growing": [
          { keyword: "AHA", score: 84 },
          { keyword: "Vitamin C", score: 81 },
          { keyword: "Ceramides", score: 78 },
          { keyword: "Coffee Scrub", score: 75 },
          { keyword: "Argan Oil", score: 72 }
        ],
        "Early": [
          { keyword: "Retinol", score: 66 },
          { keyword: "Salicylic Acid", score: 63 },
          { keyword: "Pearl", score: 60 },
          { keyword: "Lavender", score: 57 },
          { keyword: "Peptides", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Body Lotion", score: 95 },
          { keyword: "Body Cream", score: 93 },
          { keyword: "Body Oil", score: 91 },
          { keyword: "Body Scrub", score: 89 },
          { keyword: "Body Serum", score: 87 }
        ],
        "Growing": [
          { keyword: "Body Gel", score: 83 },
          { keyword: "Body Mist", score: 80 },
          { keyword: "Body Butter", score: 77 },
          { keyword: "Body Essence", score: 74 },
          { keyword: "Body Ampoule", score: 71 }
        ],
        "Early": [
          { keyword: "Body Patch", score: 66 },
          { keyword: "Body Foam", score: 63 },
          { keyword: "Body Powder", score: 60 },
          { keyword: "Body Jelly", score: 57 },
          { keyword: "Body Stick", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Moisturizing", score: 96 },
          { keyword: "Smoothing", score: 94 },
          { keyword: "Firming", score: 92 },
          { keyword: "Brightening", score: 90 },
          { keyword: "Exfoliating", score: 88 }
        ],
        "Growing": [
          { keyword: "Anti-aging", score: 84 },
          { keyword: "Cellulite", score: 81 },
          { keyword: "Stretch Marks", score: 78 },
          { keyword: "Hydrating", score: 75 },
          { keyword: "Glowing", score: 72 }
        ],
        "Early": [
          { keyword: "Detox", score: 66 },
          { keyword: "Cooling", score: 63 },
          { keyword: "Soothing", score: 60 },
          { keyword: "Toning", score: 57 },
          { keyword: "Lifting", score: 54 }
        ]
      }
    },
    "Mens Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Niacinamide", score: 94 },
          { keyword: "Salicylic Acid", score: 92 },
          { keyword: "Tea Tree", score: 90 },
          { keyword: "Charcoal", score: 88 },
          { keyword: "Vitamin C", score: 86 }
        ],
        "Growing": [
          { keyword: "Retinol", score: 82 },
          { keyword: "Peptides", score: 79 },
          { keyword: "Centella", score: 76 },
          { keyword: "Hyaluronic Acid", score: 73 },
          { keyword: "Ceramides", score: 70 }
        ],
        "Early": [
          { keyword: "Bakuchiol", score: 65 },
          { keyword: "Probiotics", score: 62 },
          { keyword: "Collagen", score: 58 },
          { keyword: "CBD", score: 55 },
          { keyword: "Ginseng", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Face Wash", score: 95 },
          { keyword: "Moisturizer", score: 93 },
          { keyword: "Sunscreen", score: 91 },
          { keyword: "Serum", score: 89 },
          { keyword: "Toner", score: 87 }
        ],
        "Growing": [
          { keyword: "All-in-One", score: 83 },
          { keyword: "Gel", score: 80 },
          { keyword: "Stick", score: 77 },
          { keyword: "Mist", score: 74 },
          { keyword: "Patch", score: 71 }
        ],
        "Early": [
          { keyword: "Foam", score: 66 },
          { keyword: "Powder", score: 63 },
          { keyword: "Oil", score: 60 },
          { keyword: "Cream", score: 57 },
          { keyword: "Essence", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Oil Control", score: 95 },
          { keyword: "Acne Care", score: 93 },
          { keyword: "Cooling", score: 91 },
          { keyword: "Face Wash", score: 89 },
          { keyword: "Shaving", score: 87 }
        ],
        "Growing": [
          { keyword: "Pore Care", score: 84 },
          { keyword: "Blackhead", score: 81 },
          { keyword: "Sun Protection", score: 78 },
          { keyword: "Pomade", score: 75 },
          { keyword: "Lip Balm", score: 72 }
        ],
        "Early": [
          { keyword: "Whitening", score: 66 },
          { keyword: "Eye Care", score: 63 },
          { keyword: "Sheet Mask", score: 60 },
          { keyword: "Concealer", score: 57 },
          { keyword: "Toner", score: 54 }
        ]
      }
    }
  },
  Singapore: {
    "Skincare": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Hyaluronic Acid", score: 97 },
          { keyword: "Niacinamide", score: 95 },
          { keyword: "Retinol", score: 93 },
          { keyword: "Vitamin C", score: 91 },
          { keyword: "Ceramides", score: 89 }
        ],
        "Growing": [
          { keyword: "Copper Peptide", score: 85 },
          { keyword: "Retinal", score: 82 },
          { keyword: "Panthenol", score: 80 },
          { keyword: "Resveratrol", score: 77 },
          { keyword: "Ferments", score: 74 }
        ],
        "Early": [
          { keyword: "PDRN", score: 67 },
          { keyword: "Spicule", score: 64 },
          { keyword: "Idebenone", score: 61 },
          { keyword: "Ectoin", score: 58 },
          { keyword: "Beta-Glucan", score: 55 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Watery Cream", score: 96 },
          { keyword: "Mist", score: 94 },
          { keyword: "Gel Cleanser", score: 92 },
          { keyword: "Sheet Mask", score: 90 },
          { keyword: "Ampoule", score: 88 }
        ],
        "Growing": [
          { keyword: "Enzyme Powder", score: 85 },
          { keyword: "Multi Balm", score: 82 },
          { keyword: "Sun Serum", score: 79 },
          { keyword: "Toner Pad", score: 76 },
          { keyword: "Soft Peel", score: 73 }
        ],
        "Early": [
          { keyword: "Modeling Pack", score: 68 },
          { keyword: "Needle Shot", score: 65 },
          { keyword: "Freeze-dried", score: 62 },
          { keyword: "Bi-phase Oil", score: 59 },
          { keyword: "Stick Foundation", score: 56 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Deep Hydration", score: 98 },
          { keyword: "Anti-aging", score: 95 },
          { keyword: "Firming", score: 92 },
          { keyword: "Radiance", score: 90 },
          { keyword: "Pore Care", score: 89 }
        ],
        "Growing": [
          { keyword: "Barrier Support", score: 86 },
          { keyword: "Texture Smoothing", score: 83 },
          { keyword: "Redness Control", score: 80 },
          { keyword: "V-Shape", score: 77 },
          { keyword: "Dark Circles", score: 74 }
        ],
        "Early": [
          { keyword: "Micro-biome", score: 68 },
          { keyword: "Cellular Repair", score: 65 },
          { keyword: "Hormonal Balance", score: 62 },
          { keyword: "Stress Relief", score: 59 },
          { keyword: "Tech-Neck", score: 56 }
        ]
      },
      "Combined": {
        "Actionable": [
          { rank: 1, keyword: "Deep Dive Hydra", score: 99 },
          { rank: 2, keyword: "Quick Calming", score: 97 },
          { rank: 3, keyword: "Ageless Retinol", score: 95 },
          { rank: 4, keyword: "Glow Sunscreen", score: 93 },
          { rank: 5, keyword: "Salmon Homecare", score: 91 }
        ]
      }
    },
    "Cleansing": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Salicylic Acid", score: 96 },
          { keyword: "AHA/BHA", score: 94 },
          { keyword: "Tea Tree", score: 92 },
          { keyword: "Centella", score: 90 },
          { keyword: "Charcoal", score: 88 }
        ],
        "Growing": [
          { keyword: "Enzyme", score: 82 },
          { keyword: "Probiotics", score: 79 },
          { keyword: "Green Tea", score: 76 },
          { keyword: "Witch Hazel", score: 73 },
          { keyword: "Niacinamide", score: 70 }
        ],
        "Early": [
          { keyword: "Prebiotics", score: 65 },
          { keyword: "Mugwort", score: 62 },
          { keyword: "Rice Extract", score: 58 },
          { keyword: "Honey", score: 55 },
          { keyword: "Oat Extract", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Gel Cleanser", score: 95 },
          { keyword: "Micellar Water", score: 93 },
          { keyword: "Cleansing Balm", score: 90 },
          { keyword: "Foam", score: 88 },
          { keyword: "Milk", score: 85 }
        ],
        "Growing": [
          { keyword: "Enzyme Powder", score: 82 },
          { keyword: "Oil Cleanser", score: 79 },
          { keyword: "Acid Wash", score: 76 },
          { keyword: "Clay Wash", score: 73 },
          { keyword: "Lotion", score: 70 }
        ],
        "Early": [
          { keyword: "Cleansing Stick", score: 65 },
          { keyword: "Mousse", score: 62 },
          { keyword: "Essence Wash", score: 59 },
          { keyword: "Soap Bar", score: 56 },
          { keyword: "Cold Cream", score: 53 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Deep Clean", score: 97 },
          { keyword: "Pore Purifying", score: 95 },
          { keyword: "Acne Control", score: 93 },
          { keyword: "Oil Control", score: 91 },
          { keyword: "Gentle Exfoliation", score: 89 }
        ],
        "Growing": [
          { keyword: "Barrier Support", score: 84 },
          { keyword: "Soothing", score: 81 },
          { keyword: "Brightening", score: 78 },
          { keyword: "Hydrating", score: 75 },
          { keyword: "Anti-pollution", score: 72 }
        ],
        "Early": [
          { keyword: "Microbiome Balance", score: 66 },
          { keyword: "Stress Relief", score: 63 },
          { keyword: "Detox", score: 60 },
          { keyword: "Cooling", score: 57 },
          { keyword: "Anti-aging", score: 54 }
        ]
      }
    },
    "Sun Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Zinc Oxide", score: 97 },
          { keyword: "Titanium Dioxide", score: 95 },
          { keyword: "Niacinamide", score: 93 },
          { keyword: "Hyaluronic Acid", score: 91 },
          { keyword: "Vitamin E", score: 89 }
        ],
        "Growing": [
          { keyword: "Probiotics", score: 84 },
          { keyword: "Rice Extract", score: 81 },
          { keyword: "Centella", score: 78 },
          { keyword: "Aloe Vera", score: 75 },
          { keyword: "Green Tea", score: 72 }
        ],
        "Early": [
          { keyword: "Blue Light Filter", score: 66 },
          { keyword: "Antioxidants", score: 63 },
          { keyword: "Ceramides", score: 60 },
          { keyword: "Peptides", score: 57 },
          { keyword: "Retinol", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Sun Cream", score: 96 },
          { keyword: "Sun Gel", score: 94 },
          { keyword: "Sun Stick", score: 92 },
          { keyword: "Sun Mist", score: 90 },
          { keyword: "Sun Serum", score: 88 }
        ],
        "Growing": [
          { keyword: "Tinted Sunscreen", score: 83 },
          { keyword: "Cushion Sun", score: 80 },
          { keyword: "Powder Sun", score: 77 },
          { keyword: "Oil Sun", score: 74 },
          { keyword: "Watery Essence", score: 71 }
        ],
        "Early": [
          { keyword: "Sun Mousse", score: 65 },
          { keyword: "Spray Sun", score: 62 },
          { keyword: "Patch Sun", score: 59 },
          { keyword: "Gel-to-Water", score: 56 },
          { keyword: "Foam Sun", score: 53 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Non-sticky", score: 97 },
          { keyword: "SPF 50+", score: 95 },
          { keyword: "Hydrating", score: 93 },
          { keyword: "No White Cast", score: 91 },
          { keyword: "Anti-pollution", score: 89 }
        ],
        "Growing": [
          { keyword: "Glow Finish", score: 85 },
          { keyword: "Serum Sun", score: 82 },
          { keyword: "Blue Light", score: 79 },
          { keyword: "Primer Hybrid", score: 76 },
          { keyword: "Stick", score: 73 }
        ],
        "Early": [
          { keyword: "Oral Sunblock", score: 66 },
          { keyword: "Tinted", score: 63 },
          { keyword: "Scalp Spray", score: 60 },
          { keyword: "Mineral Mousse", score: 57 },
          { keyword: "Cushion Sun", score: 54 }
        ]
      }
    },
    "Makeup": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Hyaluronic Acid", score: 94 },
          { keyword: "Niacinamide", score: 92 },
          { keyword: "Ceramides", score: 90 },
          { keyword: "Vitamin E", score: 88 },
          { keyword: "Squalane", score: 86 }
        ],
        "Growing": [
          { keyword: "Snail Mucin", score: 82 },
          { keyword: "Centella", score: 79 },
          { keyword: "Aloe Vera", score: 76 },
          { keyword: "Rose Extract", score: 73 },
          { keyword: "Peptides", score: 70 }
        ],
        "Early": [
          { keyword: "Probiotics", score: 65 },
          { keyword: "Collagen", score: 62 },
          { keyword: "Retinol", score: 58 },
          { keyword: "Vitamin C", score: 55 },
          { keyword: "Ginseng", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Cushion Founde", score: 96 },
          { keyword: "Lip Tint", score: 94 },
          { keyword: "Loose Powder", score: 92 },
          { keyword: "Liquid Blush", score: 90 },
          { keyword: "Concealer", score: 88 }
        ],
        "Growing": [
          { keyword: "Setting Spray", score: 85 },
          { keyword: "Skin Tint", score: 82 },
          { keyword: "Highlighter Stick", score: 79 },
          { keyword: "Lip Oil", score: 76 },
          { keyword: "Brow Pen", score: 73 }
        ],
        "Early": [
          { keyword: "Freckle Pen", score: 67 },
          { keyword: "Glitter Gel", score: 64 },
          { keyword: "Serum Foundation", score: 61 },
          { keyword: "Color Corrector", score: 58 },
          { keyword: "Soap Brow", score: 55 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Long-lasting", score: 97 },
          { keyword: "Natural Finish", score: 95 },
          { keyword: "Hydrating", score: 93 },
          { keyword: "Glow", score: 91 },
          { keyword: "Blurring", score: 89 }
        ],
        "Growing": [
          { keyword: "Skin-like", score: 84 },
          { keyword: "Transfer-proof", score: 81 },
          { keyword: "Buildable", score: 78 },
          { keyword: "Lightweight", score: 75 },
          { keyword: "Radiant", score: 72 }
        ],
        "Early": [
          { keyword: "Color Adaptive", score: 66 },
          { keyword: "Self-setting", score: 63 },
          { keyword: "Multi-use", score: 60 },
          { keyword: "Skin Care", score: 57 },
          { keyword: "Waterproof", score: 54 }
        ]
      }
    },
    "Hair Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Keratin", score: 96 },
          { keyword: "Argan Oil", score: 94 },
          { keyword: "Biotin", score: 92 },
          { keyword: "Coconut Oil", score: 90 },
          { keyword: "Peptides", score: 88 }
        ],
        "Growing": [
          { keyword: "Rosemary Oil", score: 83 },
          { keyword: "Rice Water", score: 80 },
          { keyword: "Collagen", score: 77 },
          { keyword: "Hyaluronic Acid", score: 74 },
          { keyword: "Niacinamide", score: 71 }
        ],
        "Early": [
          { keyword: "CBD", score: 66 },
          { keyword: "Probiotics", score: 63 },
          { keyword: "Ceramides", score: 60 },
          { keyword: "Retinol", score: 57 },
          { keyword: "Vitamin C", score: 54 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Shampoo", score: 95 },
          { keyword: "Conditioner", score: 93 },
          { keyword: "Hair Mask", score: 91 },
          { keyword: "Hair Oil", score: 89 },
          { keyword: "Scalp Serum", score: 87 }
        ],
        "Growing": [
          { keyword: "Hair Ampoule", score: 83 },
          { keyword: "Scalp Scrub", score: 80 },
          { keyword: "Dry Shampoo", score: 77 },
          { keyword: "Hair Mist", score: 74 },
          { keyword: "Hair Essence", score: 71 }
        ],
        "Early": [
          { keyword: "Hair Patch", score: 66 },
          { keyword: "Hair Gel", score: 63 },
          { keyword: "Hair Foam", score: 60 },
          { keyword: "Hair Cream", score: 57 },
          { keyword: "Hair Powder", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Anti-hair Loss", score: 96 },
          { keyword: "Scalp Care", score: 94 },
          { keyword: "Damage Repair", score: 92 },
          { keyword: "Frizz Control", score: 90 },
          { keyword: "Volumizing", score: 88 }
        ],
        "Growing": [
          { keyword: "Root Lift", score: 85 },
          { keyword: "Hair Mask", score: 82 },
          { keyword: "Heat Protect", score: 79 },
          { keyword: "Glossing", score: 76 },
          { keyword: "Vinegar Rinse", score: 73 }
        ],
        "Early": [
          { keyword: "Scalp Scrub", score: 68 },
          { keyword: "Bond Builder", score: 65 },
          { keyword: "Peptide Serum", score: 62 },
          { keyword: "Hair Sunscreen", score: 59 },
          { keyword: "Water Treatment", score: 56 }
        ]
      }
    },
    "Body Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Niacinamide", score: 95 },
          { keyword: "Ceramides", score: 93 },
          { keyword: "Shea Butter", score: 91 },
          { keyword: "Urea", score: 89 },
          { keyword: "AHA", score: 87 }
        ],
        "Growing": [
          { keyword: "Salicylic Acid", score: 84 },
          { keyword: "Retinol", score: 81 },
          { keyword: "Vitamin C", score: 78 },
          { keyword: "Hyaluronic Acid", score: 75 },
          { keyword: "Tea Tree", score: 72 }
        ],
        "Early": [
          { keyword: "Bakuchiol", score: 67 },
          { keyword: "Pheromones", score: 64 },
          { keyword: "Probiotics", score: 61 },
          { keyword: "CBD", score: 58 },
          { keyword: "Kombucha", score: 55 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Body Lotion", score: 95 },
          { keyword: "Body Cream", score: 93 },
          { keyword: "Body Oil", score: 91 },
          { keyword: "Body Scrub", score: 89 },
          { keyword: "Body Serum", score: 87 }
        ],
        "Growing": [
          { keyword: "Body Gel", score: 83 },
          { keyword: "Body Mist", score: 80 },
          { keyword: "Body Butter", score: 77 },
          { keyword: "Body Essence", score: 74 },
          { keyword: "Body Ampoule", score: 71 }
        ],
        "Early": [
          { keyword: "Body Patch", score: 66 },
          { keyword: "Body Foam", score: 63 },
          { keyword: "Body Powder", score: 60 },
          { keyword: "Body Jelly", score: 57 },
          { keyword: "Body Stick", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Moisturizing", score: 96 },
          { keyword: "Smoothing", score: 94 },
          { keyword: "Firming", score: 92 },
          { keyword: "Brightening", score: 90 },
          { keyword: "Exfoliating", score: 88 }
        ],
        "Growing": [
          { keyword: "Anti-aging", score: 84 },
          { keyword: "Cellulite", score: 81 },
          { keyword: "Stretch Marks", score: 78 },
          { keyword: "Hydrating", score: 75 },
          { keyword: "Glowing", score: 72 }
        ],
        "Early": [
          { keyword: "Detox", score: 66 },
          { keyword: "Cooling", score: 63 },
          { keyword: "Soothing", score: 60 },
          { keyword: "Toning", score: 57 },
          { keyword: "Lifting", score: 54 }
        ]
      }
    },
    "Mens Care": {
      "Ingredients": {
        "Actionable": [
          { keyword: "Niacinamide", score: 94 },
          { keyword: "Salicylic Acid", score: 92 },
          { keyword: "Tea Tree", score: 90 },
          { keyword: "Charcoal", score: 88 },
          { keyword: "Vitamin C", score: 86 }
        ],
        "Growing": [
          { keyword: "Retinol", score: 82 },
          { keyword: "Peptides", score: 79 },
          { keyword: "Centella", score: 76 },
          { keyword: "Hyaluronic Acid", score: 73 },
          { keyword: "Ceramides", score: 70 }
        ],
        "Early": [
          { keyword: "Bakuchiol", score: 65 },
          { keyword: "Probiotics", score: 62 },
          { keyword: "Collagen", score: 58 },
          { keyword: "CBD", score: 55 },
          { keyword: "Ginseng", score: 52 }
        ]
      },
      "Texture": {
        "Actionable": [
          { keyword: "Face Wash", score: 95 },
          { keyword: "Moisturizer", score: 93 },
          { keyword: "Sunscreen", score: 91 },
          { keyword: "Serum", score: 89 },
          { keyword: "Toner", score: 87 }
        ],
        "Growing": [
          { keyword: "All-in-One", score: 83 },
          { keyword: "Gel", score: 80 },
          { keyword: "Stick", score: 77 },
          { keyword: "Mist", score: 74 },
          { keyword: "Patch", score: 71 }
        ],
        "Early": [
          { keyword: "Foam", score: 66 },
          { keyword: "Powder", score: 63 },
          { keyword: "Oil", score: 60 },
          { keyword: "Cream", score: 57 },
          { keyword: "Essence", score: 54 }
        ]
      },
      "Effects": {
        "Actionable": [
          { keyword: "Oil Control", score: 95 },
          { keyword: "Pore Care", score: 93 },
          { keyword: "Simple Routine", score: 91 },
          { keyword: "Face Wash", score: 89 },
          { keyword: "Hydration", score: 87 }
        ],
        "Growing": [
          { keyword: "Anti-aging", score: 84 },
          { keyword: "Acne Care", score: 81 },
          { keyword: "Eye Care", score: 78 },
          { keyword: "Sun Protection", score: 75 },
          { keyword: "Lip Balm", score: 72 }
        ],
        "Early": [
          { keyword: "BB Cream", score: 67 },
          { keyword: "Brow Grooming", score: 64 },
          { keyword: "Concealer", score: 61 },
          { keyword: "Beard Oil", score: 58 },
          { keyword: "Sheet Mask", score: 55 }
        ]
      }
    }
  }
};

// Country enum을 문자열 키로 변환
export const getCountryDataKey = (country: Country): string => {
  switch (country) {
    case 'usa': return 'USA';
    case 'japan': return 'Japan';
    case 'indonesia': return 'Indonesia';
    case 'malaysia': return 'Malaysia';
    case 'singapore': return 'Singapore';
    default: return 'USA'; // Fallback for domestic or unsupported
  }
};

// TrendLevel을 TrendStatus로 매핑
const mapTrendLevelToStatus = (level: TrendLevel): TrendStatus => {
  switch (level) {
    case 'Early': return '🌱 Early Trend';
    case 'Growing': return '🚀 Growing Trend';
    case 'Actionable': return '🔥 Actionable Trend';
    default: return '📉 Cooling';
  }
};

// 새로운 리더보드 데이터 구조를 BubbleItem 배열로 변환
export const convertLeaderboardToBubbleItems = (
  countryData: CountryLeaderboardData,
  mainCategory: MainCategory,
  itemType: ItemType | null,
  trendLevel: TrendLevel | null,
  country: Country
): BubbleItem[] => {
  const bubbleItems: BubbleItem[] = [];
  const category = countryData[mainCategory];

  if (!category) return [];

  const processItems = (items: LeaderboardItem[], type: ItemType, status: TrendStatus) => {
    items.forEach(item => {
      let bubbleType: 'ingredient' | 'formula' | 'effect' | 'visual' | 'combined';
      if (type === 'Ingredients') {
        bubbleType = 'ingredient';
      } else if (type === 'Texture') {
        bubbleType = 'formula';
      } else if (type === 'Effects') {
        bubbleType = 'effect';
      } else if (type === 'Visual/Mood') {
        bubbleType = 'visual';
      } else if (type === 'Combined') {
        bubbleType = 'combined';
      } else {
        bubbleType = 'combined';
      }
      
      const bubbleItem: BubbleItem = {
        id: `${mainCategory}-${type}-${status}-${item.keyword}`,
        name: item.keyword,
        type: bubbleType,
        x: Math.random() * 100, // Placeholder
        y: Math.random() * 100, // Placeholder
        size: item.score,
        value: item.score,
        status: status,
      };
      bubbleItem.evidence = getTrendEvidence(bubbleItem, country);
      bubbleItem.reviewKeywords = getReviewKeywords(bubbleItem);
      bubbleItems.push(bubbleItem);
    });
  };

  if (itemType && trendLevel) {
    // 특정 타입과 레벨만 처리
    const items = category[itemType]?.[trendLevel];
    if (items) processItems(items, itemType, mapTrendLevelToStatus(trendLevel));
  } else if (itemType) {
    // 특정 타입의 모든 레벨 처리
    Object.entries(category[itemType] || {}).forEach(([levelKey, items]) => {
      if (items) processItems(items, itemType, mapTrendLevelToStatus(levelKey as TrendLevel));
    });
  } else {
    // 모든 타입과 레벨 처리
    Object.entries(category).forEach(([typeKey, typeData]) => {
      Object.entries(typeData || {}).forEach(([levelKey, items]) => {
        if (items) processItems(items, typeKey as ItemType, mapTrendLevelToStatus(levelKey as TrendLevel));
      });
    });
  }

  return bubbleItems.sort((a, b) => b.value - a.value).map((item, index) => ({ ...item, rank: index + 1 }));
};

// 국가별 SNS 플랫폼 Top 키워드 생성 (성분, 제형, 효과 통합)
export const getSNSTopKeywordsByCountry = (country: Country): SNSTopIngredient[] => {
  const countryKey = getCountryDataKey(country);
  const countryData = leaderboardData[countryKey];
  
  if (!countryData || !countryData.Skincare) {
    return [];
  }

  // 국가별 플랫폼 설정 (첫 번째가 맨 위에 표시)
  type PlatformType = SNSTopIngredient['platform'];
  const platforms: Array<{ name: PlatformType; emoji: string }> =
    country === 'usa'
      ? [{ name: 'Amazon' as PlatformType, emoji: '📦' }, { name: 'YouTube' as PlatformType, emoji: '▶️' }, { name: 'Instagram' as PlatformType, emoji: '📷' }]
      : country === 'japan'
      ? [{ name: 'Cosme' as PlatformType, emoji: '💄' }, { name: 'YouTube' as PlatformType, emoji: '▶️' }, { name: 'Instagram' as PlatformType, emoji: '📷' }]  // @cosme 맨 위
      : [{ name: 'Shopee' as PlatformType, emoji: '🛒' }, { name: 'YouTube' as PlatformType, emoji: '▶️' }, { name: 'Instagram' as PlatformType, emoji: '📷' }];  // Shopee 맨 위

  const skincare = countryData.Skincare;
  
  // 성분, 제형, 효과 데이터 수집
  const allKeywords: Array<{ name: string; score: number; type: 'ingredient' | 'formula' | 'effect' }> = [];
  
  // Ingredients (Actionable만)
  if (skincare.Ingredients?.Actionable) {
    skincare.Ingredients.Actionable.forEach(item => {
      allKeywords.push({ name: item.keyword, score: item.score, type: 'ingredient' });
    });
  }
  
  // Texture (Actionable만)
  if (skincare.Texture?.Actionable) {
    skincare.Texture.Actionable.forEach(item => {
      allKeywords.push({ name: item.keyword, score: item.score, type: 'formula' });
    });
  }
  
  // Effects (Actionable만)
  if (skincare.Effects?.Actionable) {
    skincare.Effects.Actionable.forEach(item => {
      allKeywords.push({ name: item.keyword, score: item.score, type: 'effect' });
    });
  }
  
  // 점수순으로 정렬
  allKeywords.sort((a, b) => b.score - a.score);
  
  // 플랫폼별로 더 다르게 순위를 가지도록 (플랫폼별 특성 반영)
  return platforms.map((platform, platformIndex) => {
    // 플랫폼별로 다른 가중치 적용 (플랫폼 특성에 따라)
    const platformWeights: Record<string, { ingredient: number; formula: number; effect: number }> = {
      'Amazon': { ingredient: 1.2, formula: 0.9, effect: 1.1 }, // 리뷰 중심, 성분 중요
      'TikTok': { ingredient: 1.0, formula: 1.3, effect: 1.2 }, // 제형/효과 중심
      'Instagram': { ingredient: 1.1, formula: 1.1, effect: 1.3 }, // 효과 중심
      'YouTube': { ingredient: 1.3, formula: 1.0, effect: 1.1 }, // 성분 중심
      'Cosme': { ingredient: 1.1, formula: 1.2, effect: 1.0 }, // 제형 중심
      'Shopee': { ingredient: 1.0, formula: 1.1, effect: 1.2 }, // 효과 중심
    };
    
    const weights = platformWeights[platform.name] || { ingredient: 1.0, formula: 1.0, effect: 1.0 };
    
    // 플랫폼별로 다른 순위를 가지도록 가중치 적용
    const shuffled = [...allKeywords].map((item, idx) => {
      const typeWeight = item.type === 'ingredient' ? weights.ingredient : 
                        item.type === 'formula' ? weights.formula : 
                        weights.effect;
      // 플랫폼별로 랜덤 변동 추가 (더 자연스러운 차이)
      const randomVariation = (Math.random() - 0.5) * 8; // -4 ~ +4 범위
      const positionBonus = (5 - idx) * 1.5; // 상위 항목에 보너스
      
      return {
        ...item,
        adjustedScore: item.score * typeWeight + randomVariation + positionBonus
      };
    }).sort((a, b) => b.adjustedScore - a.adjustedScore);
    
    return {
      platform: platform.name,
      keywords: shuffled.slice(0, 5).map((item, idx) => ({
        name: item.name,
        value: Math.round(item.score * (weights[item.type] || 1.0)),
        change: Math.round((Math.random() * 15) - 5), // -5 ~ +10 범위
        type: item.type
      }))
    };
  });
};

// 통합 AI 분석 생성 (모든 플랫폼 데이터 종합)
export const getIntegratedAIAnalysis = (
  platformData: SNSTopIngredient[],
  country: Country
): { summary: string; insights: string[]; recommendations: string[] } => {
  // 모든 플랫폼의 키워드 수집
  const allKeywords: Array<{ name: string; value: number; type: string; platform: string }> = [];
  platformData.forEach(platform => {
    platform.keywords.forEach(keyword => {
      allKeywords.push({
        name: keyword.name,
        value: keyword.value,
        type: keyword.type,
        platform: platform.platform
      });
    });
  });

  // 키워드별로 집계 (중복 제거 및 가중치 합산)
  const keywordMap = new Map<string, { totalValue: number; platforms: string[]; type: string }>();
  allKeywords.forEach(kw => {
    const existing = keywordMap.get(kw.name);
    if (existing) {
      existing.totalValue += kw.value;
      if (!existing.platforms.includes(kw.platform)) {
        existing.platforms.push(kw.platform);
      }
    } else {
      keywordMap.set(kw.name, {
        totalValue: kw.value,
        platforms: [kw.platform],
        type: kw.type
      });
    }
  });

  // 상위 키워드 추출
  const topKeywords = Array.from(keywordMap.entries())
    .sort((a, b) => b[1].totalValue - a[1].totalValue)
    .slice(0, 5);

  const topKeyword = topKeywords[0];
  const topType = topKeyword[1].type === 'ingredient' ? '성분' : topKeyword[1].type === 'formula' ? '제형' : '효과';
  const topName = topKeyword[0];

  // 국가별 이름
  const countryNames: Record<Country, string> = {
    'domestic': '국내',
    'usa': '미국',
    'japan': '일본',
    'singapore': '싱가포르',
    'malaysia': '말레이시아',
    'indonesia': '인도네시아',
  };
  const countryName = countryNames[country] || '해당 국가';

  // 플랫폼 이름
  const platformNames = platformData.map(p => {
    const names: Record<string, string> = {
      'Amazon': '아마존',
      'TikTok': '틱톡',
      'Instagram': '인스타그램',
      'YouTube': '유튜브',
      'Cosme': '코스메',
      'Shopee': '쇼핑',
    };
    return names[p.platform] || p.platform;
  }).join(', ');

  // 종합 요약 생성
  const summaries = [
    `${countryName} 시장의 주요 SNS 플랫폼(${platformNames})을 종합 분석한 결과, "${topName}" ${topType}이 모든 플랫폼에서 공통적으로 높은 관심을 받고 있습니다. 특히 ${topKeywords.slice(0, 2).map(k => k[0]).join(', ')} 조합이 ${countryName} 소비자들에게 강한 인기를 끌고 있으며, 실제 구매 및 리뷰 데이터에서도 긍정적 피드백이 지속되고 있습니다.`,
    `${countryName}의 주요 SNS 플랫폼 데이터를 통합 분석한 결과, "${topName}" ${topType}을 중심으로 한 트렌드가 명확하게 드러나고 있습니다. ${platformNames}에서 공통적으로 언급되는 키워드들을 보면, ${topKeywords.slice(0, 3).map(k => k[0]).join(', ')} 등이 핵심 트렌드로 자리잡았으며, 특히 젊은 소비자층에서의 관심도가 높게 나타나고 있습니다.`,
    `${countryName} 시장의 SNS 플랫폼 종합 분석 결과, "${topName}" ${topType}이 가장 높은 언급량과 관심도를 보이고 있습니다. ${platformNames}에서 수집된 데이터를 보면, ${topKeywords.slice(0, 2).map(k => k[0]).join('과 ')} 조합이 실제 구매 결정에 큰 영향을 미치고 있으며, 인플루언서와 일반 소비자 모두에게 긍정적으로 평가받고 있습니다.`,
  ];

  // 인사이트 생성
  const insights = [
    `${topKeywords[0][1].platforms.length}개 이상의 플랫폼에서 "${topName}" ${topType}이 상위권을 유지하고 있어, 시장 전반의 트렌드로 확고히 자리잡았습니다.`,
    `성분, 제형, 효과 중 ${topKeywords.filter(k => k[1].type === 'ingredient').length > 0 ? '성분' : topKeywords.filter(k => k[1].type === 'formula').length > 0 ? '제형' : '효과'} 중심의 키워드가 전체 트렌드의 ${Math.round((topKeywords.filter(k => k[1].type === (topKeywords[0][1].type)).length / topKeywords.length) * 100)}%를 차지하고 있어, ${countryName} 소비자들의 선호도가 명확합니다.`,
    `${platformNames}에서 공통적으로 언급되는 키워드들이 실제 구매 리뷰와 높은 상관관계를 보이며, SNS 트렌드가 실제 시장 반응을 잘 반영하고 있음을 확인할 수 있습니다.`,
  ];

  // 전략 제안 생성
  const recommendations = [
    `"${topName}" ${topType}을 중심으로 한 제품 개발 및 마케팅 전략을 수립하면 좋을 것 같습니다. 특히 ${topKeywords.slice(0, 2).map(k => k[0]).join('과 ')} 조합을 강조하면 ${countryName} 시장에서의 경쟁력을 높일 수 있습니다.`,
    `${platformNames}에서 공통적으로 높은 관심을 받는 ${topType} 카테고리에 집중하여 제품 포트폴리오를 구성하면 좋을 것 같습니다. 특히 젊은 소비자층을 타겟으로 할 경우, ${topKeywords[0][0]}을 핵심 메시지로 활용하는 것이 효과적일 것입니다.`,
    `인플루언서 마케팅 시 "${topName}" ${topType}과 ${topKeywords.slice(1, 3).map(k => k[0]).join(', ')} 조합을 강조하면 ${countryName} 소비자들의 공감대를 얻을 수 있을 것 같습니다. 실제 사용 후기와 효과 중심의 콘텐츠가 높은 신뢰도를 보이고 있어, 이러한 접근이 효과적일 것입니다.`,
  ];

  // 키워드 이름 기반으로 일관된 선택
  const hash = topName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const summaryIndex = hash % summaries.length;
  const insightIndex = hash % insights.length;
  const recIndex = hash % recommendations.length;

  return {
    summary: summaries[summaryIndex],
    insights: [insights[insightIndex], insights[(insightIndex + 1) % insights.length]],
    recommendations: [recommendations[recIndex], recommendations[(recIndex + 1) % recommendations.length]]
  };
};

