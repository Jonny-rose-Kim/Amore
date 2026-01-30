/**
 * K-Beauty 로컬 MongoDB 시드 스크립트
 * amore_trend_db 데이터베이스에 K-Beauty 브랜드 제품 데이터 생성
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'amore_trend_db';

// K-Beauty 브랜드별 샘플 제품 데이터
const KBEAUTY_SAMPLE_DATA = {
  'raw_tirtir_products': [
    {
      name: 'Mask Fit Red Cushion',
      brand: 'TIRTIR',
      price: '$24.00',
      category: 'Makeup',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200',
      productUrl: 'https://tirtir.com',
      description: 'Full coverage cushion foundation with mask-fit technology',
      keyIngredients: ['Niacinamide', 'Hyaluronic Acid', 'Centella Asiatica'],
      fullIngredients: 'Water, Cyclopentasiloxane, Titanium Dioxide, Niacinamide...',
      concerns: ['Dullness', 'Pore', 'Dryness'],
      benefits: ['Long-lasting', 'Full Coverage', 'Hydrating'],
      formulation: 'Cushion',
      skinType: ['All', 'Oily', 'Combination'],
      marketingPoints: ['#1 Bestseller', 'Mask-proof', '30-hour wear'],
      tags: ['cushion', 'foundation', 'full-coverage'],
      is_new: true,
      is_best_selling: true,
      best_selling_rank: 1
    },
    {
      name: 'Ceramic Milk Ampoule',
      brand: 'TIRTIR',
      price: '$28.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200',
      productUrl: 'https://tirtir.com',
      description: 'Intensive hydrating ampoule with ceramide complex',
      keyIngredients: ['Ceramide', 'Squalane', 'Panthenol'],
      fullIngredients: 'Water, Butylene Glycol, Ceramide NP...',
      concerns: ['Dryness', 'Sensitivity', 'Hydration'],
      benefits: ['Deep Hydration', 'Barrier Repair', 'Soothing'],
      formulation: 'Ampoule',
      skinType: ['Dry', 'Sensitive', 'Normal'],
      marketingPoints: ['Ceramide Complex', 'Barrier Care'],
      tags: ['ampoule', 'hydrating', 'ceramide'],
      is_new: true,
      is_best_selling: false
    }
  ],
  'raw_medicube_products': [
    {
      name: 'Zero Pore Pad 2.0',
      brand: 'Medicube',
      price: '$22.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200',
      productUrl: 'https://medicube.com',
      description: 'Exfoliating pads with AHA/BHA for pore care',
      keyIngredients: ['Glycolic Acid', 'Salicylic Acid', 'Niacinamide'],
      fullIngredients: 'Water, Glycolic Acid, Salicylic Acid...',
      concerns: ['Pore', 'Acne', 'Dullness'],
      benefits: ['Pore Minimizing', 'Exfoliating', 'Brightening'],
      formulation: 'Pad',
      skinType: ['Oily', 'Combination', 'Acne-prone'],
      marketingPoints: ['#1 Pore Care', 'Dermatologist Tested'],
      tags: ['pore', 'exfoliating', 'aha-bha'],
      is_new: true,
      is_best_selling: true,
      best_selling_rank: 1
    },
    {
      name: 'Red Acne Foam Cleanser',
      brand: 'Medicube',
      price: '$18.00',
      category: 'Cleansing',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200',
      productUrl: 'https://medicube.com',
      description: 'Gentle foam cleanser for acne-prone skin',
      keyIngredients: ['Salicylic Acid', 'Tea Tree', 'Centella Asiatica'],
      fullIngredients: 'Water, Sodium Laureth Sulfate, Tea Tree Oil...',
      concerns: ['Acne', 'Pore', 'Sensitivity'],
      benefits: ['Gentle Cleansing', 'Acne Control', 'Soothing'],
      formulation: 'Foam',
      skinType: ['Oily', 'Acne-prone', 'Combination'],
      marketingPoints: ['Acne Care', 'Gentle Formula'],
      tags: ['cleanser', 'acne', 'foam'],
      is_new: true,
      is_best_selling: false
    }
  ],
  'raw_beautyofjoseon_products': [
    {
      name: 'Glow Serum: Propolis + Niacinamide',
      brand: 'Beauty of Joseon',
      price: '$17.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200',
      productUrl: 'https://beautyofjoseon.com',
      description: 'Brightening serum with propolis and niacinamide',
      keyIngredients: ['Propolis', 'Niacinamide', 'Honey'],
      fullIngredients: 'Propolis Extract, Niacinamide, Honey Extract...',
      concerns: ['Dullness', 'Brightening', 'Hydration'],
      benefits: ['Glow', 'Brightening', 'Nourishing'],
      formulation: 'Serum',
      skinType: ['All', 'Dry', 'Normal'],
      marketingPoints: ['K-Beauty Bestseller', 'Hanbok Edition'],
      tags: ['serum', 'propolis', 'brightening'],
      is_new: true,
      is_best_selling: true,
      best_selling_rank: 2
    },
    {
      name: 'Dynasty Cream',
      brand: 'Beauty of Joseon',
      price: '$19.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=200',
      productUrl: 'https://beautyofjoseon.com',
      description: 'Rich moisturizing cream with rice bran and ginseng',
      keyIngredients: ['Rice Bran', 'Ginseng', 'Squalane'],
      fullIngredients: 'Rice Bran Extract, Panax Ginseng Root Extract...',
      concerns: ['Dryness', 'Anti-Aging', 'Dullness'],
      benefits: ['Deep Moisturizing', 'Anti-Aging', 'Nourishing'],
      formulation: 'Cream',
      skinType: ['Dry', 'Normal', 'Mature'],
      marketingPoints: ['Traditional Korean Beauty', 'Hanbang'],
      tags: ['cream', 'moisturizing', 'hanbang'],
      is_new: true,
      is_best_selling: false
    },
    {
      name: 'Relief Sun: Rice + Probiotics',
      brand: 'Beauty of Joseon',
      price: '$16.00',
      category: 'Sun Care',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200',
      productUrl: 'https://beautyofjoseon.com',
      description: 'Organic sunscreen with rice and probiotics SPF50+',
      keyIngredients: ['Rice Extract', 'Probiotics', 'Grain Ferment'],
      fullIngredients: 'Rice Extract, Lactobacillus Ferment...',
      concerns: ['Sun Protection', 'Dryness', 'Sensitivity'],
      benefits: ['UV Protection', 'Moisturizing', 'No White Cast'],
      formulation: 'Cream',
      skinType: ['All', 'Sensitive', 'Dry'],
      marketingPoints: ['Organic Sunscreen', 'No White Cast'],
      tags: ['sunscreen', 'spf50', 'organic'],
      is_new: true,
      is_best_selling: true,
      best_selling_rank: 1
    }
  ],
  'raw_laneige_products': [
    {
      name: 'Water Sleeping Mask',
      brand: 'Laneige',
      price: '$28.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200',
      productUrl: 'https://laneige.com',
      description: 'Overnight hydrating mask with sleep-tox technology',
      keyIngredients: ['Hyaluronic Acid', 'Squalane', 'Probiotics'],
      fullIngredients: 'Water, Butylene Glycol, Cyclopentasiloxane...',
      concerns: ['Dryness', 'Dullness', 'Hydration'],
      benefits: ['Overnight Hydration', 'Glow', 'Refreshing'],
      formulation: 'Sleeping Mask',
      skinType: ['All', 'Dry', 'Dehydrated'],
      marketingPoints: ['#1 Sleeping Mask', 'Sleep-Tox'],
      tags: ['sleeping-mask', 'hydrating', 'overnight'],
      is_new: true,
      is_best_selling: true,
      best_selling_rank: 1
    },
    {
      name: 'Lip Sleeping Mask',
      brand: 'Laneige',
      price: '$24.00',
      category: 'Lip Care',
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200',
      productUrl: 'https://laneige.com',
      description: 'Overnight lip treatment for smooth, supple lips',
      keyIngredients: ['Berry Complex', 'Vitamin C', 'Hyaluronic Acid'],
      fullIngredients: 'Diisostearyl Malate, Hydrogenated Polyisobutene...',
      concerns: ['Dryness', 'Chapped Lips'],
      benefits: ['Lip Moisturizing', 'Smooth Lips', 'Plumping'],
      formulation: 'Balm',
      skinType: ['All'],
      marketingPoints: ['Cult Favorite', 'Berry Mix'],
      tags: ['lip-mask', 'overnight', 'berry'],
      is_new: true,
      is_best_selling: true,
      best_selling_rank: 2
    }
  ],
  'raw_cosrx_products': [
    {
      name: 'Advanced Snail 96 Mucin Power Essence',
      brand: 'COSRX',
      price: '$25.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=200',
      productUrl: 'https://cosrx.com',
      description: 'Snail secretion filtrate essence for repair and hydration',
      keyIngredients: ['Snail Secretion Filtrate', 'Hyaluronic Acid', 'Panthenol'],
      fullIngredients: 'Snail Secretion Filtrate 96%, Betaine, Butylene Glycol...',
      concerns: ['Dryness', 'Dullness', 'Anti-Aging'],
      benefits: ['Repair', 'Hydration', 'Elasticity'],
      formulation: 'Essence',
      skinType: ['All', 'Dry', 'Damaged'],
      marketingPoints: ['96% Snail Mucin', 'Best Essence'],
      tags: ['essence', 'snail', 'hydrating'],
      is_new: true,
      is_best_selling: true,
      best_selling_rank: 1
    },
    {
      name: 'AHA/BHA Clarifying Treatment Toner',
      brand: 'COSRX',
      price: '$22.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200',
      productUrl: 'https://cosrx.com',
      description: 'Daily exfoliating toner with AHA and BHA',
      keyIngredients: ['Glycolic Acid', 'Betaine Salicylate', 'Allantoin'],
      fullIngredients: 'Mineral Water, Salix Alba (Willow) Bark Water...',
      concerns: ['Pore', 'Dullness', 'Acne'],
      benefits: ['Exfoliating', 'Pore Care', 'Brightening'],
      formulation: 'Toner',
      skinType: ['Oily', 'Combination', 'Acne-prone'],
      marketingPoints: ['Gentle Exfoliation', 'Daily Use'],
      tags: ['toner', 'aha-bha', 'exfoliating'],
      is_new: true,
      is_best_selling: false
    },
    {
      name: 'Acne Pimple Master Patch',
      brand: 'COSRX',
      price: '$6.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200',
      productUrl: 'https://cosrx.com',
      description: 'Hydrocolloid patches for acne spot treatment',
      keyIngredients: ['Hydrocolloid'],
      fullIngredients: 'Cellulose Gum, Styrene Isoprene Styrene Block Copolymer...',
      concerns: ['Acne', 'Pore'],
      benefits: ['Spot Treatment', 'Absorbs Impurities', 'Protects'],
      formulation: 'Patch',
      skinType: ['All', 'Acne-prone'],
      marketingPoints: ['Bestseller', 'Quick Fix'],
      tags: ['patch', 'acne', 'spot-treatment'],
      is_new: true,
      is_best_selling: true,
      best_selling_rank: 3
    }
  ],
  'raw_skin1004_products': [
    {
      name: 'Madagascar Centella Ampoule',
      brand: 'SKIN1004',
      price: '$22.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200',
      productUrl: 'https://skin1004.com',
      description: 'Centella asiatica ampoule for soothing and repair',
      keyIngredients: ['Centella Asiatica', 'Madecassoside', 'Asiaticoside'],
      fullIngredients: 'Centella Asiatica Extract 100%',
      concerns: ['Sensitivity', 'Acne', 'Soothing'],
      benefits: ['Soothing', 'Repair', 'Calming'],
      formulation: 'Ampoule',
      skinType: ['Sensitive', 'Acne-prone', 'All'],
      marketingPoints: ['100% Centella', 'Madagascar Origin'],
      tags: ['ampoule', 'centella', 'soothing'],
      is_new: true,
      is_best_selling: true,
      best_selling_rank: 1
    },
    {
      name: 'Hyalu-Cica Water-Fit Sun Serum',
      brand: 'SKIN1004',
      price: '$18.00',
      category: 'Sun Care',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200',
      productUrl: 'https://skin1004.com',
      description: 'Lightweight sun serum with centella and hyaluronic acid',
      keyIngredients: ['Centella Asiatica', 'Hyaluronic Acid', 'Niacinamide'],
      fullIngredients: 'Water, Homosalate, Ethylhexyl Salicylate...',
      concerns: ['Sun Protection', 'Hydration', 'Sensitivity'],
      benefits: ['UV Protection', 'Lightweight', 'Soothing'],
      formulation: 'Serum',
      skinType: ['All', 'Sensitive', 'Oily'],
      marketingPoints: ['Water-Fit', 'No White Cast'],
      tags: ['sunscreen', 'serum', 'lightweight'],
      is_new: true,
      is_best_selling: false
    }
  ],
  'raw_biodance_products': [
    {
      name: 'Bio-Collagen Real Deep Mask',
      brand: 'BIODANCE',
      price: '$32.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=200',
      productUrl: 'https://biodance.co.kr',
      description: 'Collagen sheet mask that melts into skin',
      keyIngredients: ['Collagen', 'Hyaluronic Acid', 'Oligo-Hyaluronic Acid'],
      fullIngredients: 'Hydrolyzed Collagen, Sodium Hyaluronate...',
      concerns: ['Anti-Aging', 'Dryness', 'Firming'],
      benefits: ['Collagen Boost', 'Deep Hydration', 'Firming'],
      formulation: 'Sheet Mask',
      skinType: ['All', 'Mature', 'Dry'],
      marketingPoints: ['Viral TikTok', 'Melting Mask'],
      tags: ['mask', 'collagen', 'anti-aging'],
      is_new: true,
      is_best_selling: true,
      best_selling_rank: 1
    },
    {
      name: 'Skin-Glow Essence',
      brand: 'BIODANCE',
      price: '$28.00',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200',
      productUrl: 'https://biodance.co.kr',
      description: 'Glow-boosting essence with peptides',
      keyIngredients: ['Peptide', 'Niacinamide', 'Adenosine'],
      fullIngredients: 'Water, Butylene Glycol, Niacinamide, Peptide...',
      concerns: ['Dullness', 'Anti-Aging', 'Brightening'],
      benefits: ['Glow', 'Brightening', 'Anti-Aging'],
      formulation: 'Essence',
      skinType: ['All', 'Dull', 'Mature'],
      marketingPoints: ['Glass Skin', 'K-Beauty Hit'],
      tags: ['essence', 'glow', 'peptide'],
      is_new: true,
      is_best_selling: false
    }
  ]
};

async function seedKbeautyData() {
  console.log('🚀 K-Beauty 로컬 데이터베이스 시드 시작...\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ MongoDB 연결 성공');

    const db = client.db(DB_NAME);

    // 각 컬렉션에 데이터 삽입
    for (const [collectionName, products] of Object.entries(KBEAUTY_SAMPLE_DATA)) {
      const collection = db.collection(collectionName);

      // 기존 데이터 삭제
      await collection.deleteMany({});

      // 새 데이터 삽입
      if (products.length > 0) {
        await collection.insertMany(products);
        console.log(`  ✓ ${collectionName}: ${products.length}개 제품 삽입`);
      }
    }

    console.log('\n✅ K-Beauty 데이터 시드 완료!');
    console.log(`📦 데이터베이스: ${DB_NAME}`);
    console.log(`📋 총 ${Object.keys(KBEAUTY_SAMPLE_DATA).length}개 컬렉션 생성`);

    // 확인
    const collections = await db.listCollections().toArray();
    console.log('\n생성된 컬렉션 목록:');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count}개`);
    }

  } catch (error) {
    console.error('❌ 시드 오류:', error);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

seedKbeautyData();
