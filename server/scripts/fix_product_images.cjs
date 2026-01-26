const { MongoClient } = require('mongodb');

// 정확한 제품별 이미지 URL 매핑
const correctImageUrls = {
  // Skincare Overseas
  "Paula's Choice SKIN PERFECTING 2% BHA": "https://m.media-amazon.com/images/I/61cGibB-FbL._SL1500_.jpg",
  "Native Deodorant": "https://m.media-amazon.com/images/I/61oIft0oZIL._SL1500_.jpg",
  "PanOxyl 10% Benzoyl Peroxide": "https://m.media-amazon.com/images/I/713tzBRSP+L._SL1500_.jpg",
  "eos Shea Better Body Lotion": "https://m.media-amazon.com/images/I/51lP01--ejL._SL1500_.jpg",
  "La Roche-Posay Toleriane": "https://m.media-amazon.com/images/I/61Y5xTJmqlL._SL1500_.jpg",
  "CeraVe Moisturizing Cream": "https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1500_.jpg",
  "The Ordinary Niacinamide": "https://m.media-amazon.com/images/I/51D0K6KO6tL._SL1500_.jpg",
  "Hada Labo Gokujyun": "https://m.media-amazon.com/images/I/41fMGPfDUmL._SL1000_.jpg",
  "Curel Intensive Moisture": "https://m.media-amazon.com/images/I/61sNB+5m5VL._SL1500_.jpg",
  "Shiseido Elixir": "https://m.media-amazon.com/images/I/61fVGjQxTsL._SL1500_.jpg",
  "SK-II Facial Treatment": "https://m.media-amazon.com/images/I/51bHjnsNlWL._SL1500_.jpg",
  "Kose Sekkisei": "https://m.media-amazon.com/images/I/41F6oLJC4RL._SL1000_.jpg",
  "Bioderma Sensibio": "https://m.media-amazon.com/images/I/51nKJCjzdqL._SL1000_.jpg",
  "Avene Thermal Spring": "https://m.media-amazon.com/images/I/51ADBEnmHgL._SL1500_.jpg",
  
  // Skincare Korean
  "COSRX Snail Mucin": "https://m.media-amazon.com/images/I/61b1gQ9y2+L._SL1500_.jpg",
  "VT Cosmetics Reedle Shot": "https://m.media-amazon.com/images/I/51+vdknb2dL._SL1500_.jpg",
  "Beauty of Joseon Glow": "https://m.media-amazon.com/images/I/51YQNUV5kEL._SL1500_.jpg",
  "Beauty of Joseon Dynasty": "https://m.media-amazon.com/images/I/61xnQxiN9PL._SL1500_.jpg",
  "SKIN1004 Madagascar": "https://m.media-amazon.com/images/I/51ZXHWU-tBL._SL1500_.jpg",
  "Anua Heartleaf": "https://m.media-amazon.com/images/I/61BVPWWRZYL._SL1500_.jpg",
  "Torriden DIVE-IN": "https://m.media-amazon.com/images/I/51v2DKLMVIL._SL1500_.jpg",
  "Illiyoon Ceramide": "https://m.media-amazon.com/images/I/61gd3XpHSJL._SL1500_.jpg",
  "I'm From Mugwort": "https://m.media-amazon.com/images/I/61sQl2TfqeL._SL1500_.jpg",
  "Medicube Red Succinic": "https://m.media-amazon.com/images/I/61GRkqpuBZL._SL1500_.jpg",
  "COSRX Propolis": "https://m.media-amazon.com/images/I/61vy4u1BHML._SL1500_.jpg",
  
  // Hair Care Overseas
  "Olaplex No.3": "https://m.media-amazon.com/images/I/61WbXQPvZ+L._SL1500_.jpg",
  "Native Coconut": "https://m.media-amazon.com/images/I/71KOBnSdqwL._SL1500_.jpg",
  "OGX Argan Oil": "https://m.media-amazon.com/images/I/71f-M8LyhVL._SL1500_.jpg",
  "Neutrogena T/Sal": "https://m.media-amazon.com/images/I/71RMIHB4DnL._SL1500_.jpg",
  "Moroccanoil Treatment": "https://m.media-amazon.com/images/I/51jG8X8BI8L._SL1500_.jpg",
  "Marc Anthony Grow Long": "https://m.media-amazon.com/images/I/71e7FQSfURL._SL1500_.jpg",
  "Pantene Daily Moisture": "https://m.media-amazon.com/images/I/71cVOgvystL._SL1500_.jpg",
  "Redken All Soft": "https://m.media-amazon.com/images/I/61qYpN5zE7L._SL1500_.jpg",
  "Herbal Essences Smooth": "https://m.media-amazon.com/images/I/71KfL3yZ8DL._SL1500_.jpg",
  "Biolage Color Last": "https://m.media-amazon.com/images/I/61+oYrgqbIL._SL1500_.jpg",
  
  // Hair Care Korean
  "Mise-en-scène Perfect Serum": "https://m.media-amazon.com/images/I/61rjWe2DOYL._SL1500_.jpg",
  "Unove Deep Damage": "https://m.media-amazon.com/images/I/61UxBSjIYOL._SL1500_.jpg",
  "Kundal Honey": "https://m.media-amazon.com/images/I/71IqKNGRN8L._SL1500_.jpg",
  "Elizavecca CER-100": "https://m.media-amazon.com/images/I/61hl8X9xVjL._SL1500_.jpg",
  "Ryo Hair Loss": "https://m.media-amazon.com/images/I/61yEbRLldzL._SL1500_.jpg",
  "Tonymoly Haeyo Mayo": "https://m.media-amazon.com/images/I/71KdJl8b9EL._SL1500_.jpg",
  "Daeng Gi Meo Ri": "https://m.media-amazon.com/images/I/71gd3XpHSJL._SL1500_.jpg",
  "Innisfree My Hair": "https://m.media-amazon.com/images/I/61e+M1GjZOL._SL1500_.jpg",
  "Lilyeve Growturn": "https://m.media-amazon.com/images/I/61K8lPJwH0L._SL1500_.jpg",
  "Kocostar Hair Therapy": "https://m.media-amazon.com/images/I/61Q08AYWJAL._SL1500_.jpg",
  
  // Body Care Overseas
  "Nivea Essentially Enriched": "https://m.media-amazon.com/images/I/71F0j3P+4+L._SL1500_.jpg",
  "Aveeno Daily Moisturizing": "https://m.media-amazon.com/images/I/71d71AqdpTL._SL1500_.jpg",
  "Eucerin Advanced Repair": "https://m.media-amazon.com/images/I/71qXdHQqfPL._SL1500_.jpg",
  "Jergens Ultra Healing": "https://m.media-amazon.com/images/I/71dtxTW3HoL._SL1500_.jpg",
  "Lubriderm Daily Moisture": "https://m.media-amazon.com/images/I/61RJHGL+XyL._SL1500_.jpg",
  "Gold Bond Ultimate": "https://m.media-amazon.com/images/I/71oYLFfWpfL._SL1500_.jpg",
  "Vaseline Intensive Care": "https://m.media-amazon.com/images/I/61H-qCF2URL._SL1500_.jpg",
  "Cetaphil Moisturizing Cream": "https://m.media-amazon.com/images/I/61u7dUIH2rL._SL1500_.jpg",
  "Palmer's Cocoa Butter": "https://m.media-amazon.com/images/I/61u7dUIH2rL._SL1500_.jpg",
  "Amlactin Daily Moisturizing": "https://m.media-amazon.com/images/I/71dcuRv1bPL._SL1500_.jpg",
  
  // Body Care Korean  
  "Aestura Atobarrier": "https://m.media-amazon.com/images/I/61XlkJxOz-L._SL1500_.jpg",
  "Illiyoon Ceramide Ato Lotion": "https://m.media-amazon.com/images/I/61gd3XpHSJL._SL1500_.jpg",
  "COSRX Balancium Ceramide": "https://m.media-amazon.com/images/I/51vy4u1BHML._SL1500_.jpg",
  "Round Lab Dokdo Lotion": "https://m.media-amazon.com/images/I/51FCHM3EjcL._SL1500_.jpg",
  "Hanyul Pure Artemisia": "https://m.media-amazon.com/images/I/61kxFZkbURL._SL1500_.jpg",
  "Isntree Hyaluronic Acid": "https://m.media-amazon.com/images/I/61cY0-0X0TL._SL1500_.jpg",
  "Mediheal Madecassoside": "https://m.media-amazon.com/images/I/71BOJdM7PYL._SL1500_.jpg",
  "Etude House Soon Jung": "https://m.media-amazon.com/images/I/51CVBQ8n2RL._SL1500_.jpg",
  "Pyunkang Yul Nutrition": "https://m.media-amazon.com/images/I/515zYB2VCNL._SL1500_.jpg",
  "Benton Snail Bee High": "https://m.media-amazon.com/images/I/61hqxq9BVTL._SL1500_.jpg",
  
  // Cleansing products
  "CeraVe Hydrating": "https://m.media-amazon.com/images/I/61k1p4ZNHZL._SL1500_.jpg",
  "Neutrogena Hydro Boost": "https://m.media-amazon.com/images/I/71mFr+8fwZL._SL1500_.jpg",
  "La Roche-Posay Effaclar": "https://m.media-amazon.com/images/I/61bZ8F09sWL._SL1500_.jpg",
  "COSRX Low pH": "https://m.media-amazon.com/images/I/51shGK3KO7L._SL1500_.jpg",
  "Innisfree Green Tea": "https://m.media-amazon.com/images/I/61e+M1GjZOL._SL1500_.jpg",
  
  // Sun Care products
  "Supergoop Unseen": "https://m.media-amazon.com/images/I/51f0o5xhqYL._SL1500_.jpg",
  "La Roche-Posay Anthelios": "https://m.media-amazon.com/images/I/61q9lOnRNZL._SL1500_.jpg",
  "EltaMD UV Clear": "https://m.media-amazon.com/images/I/51lDzLf0B+L._SL1500_.jpg",
  "COSRX Aloe Soothing Sun": "https://m.media-amazon.com/images/I/61j7rQBlCeL._SL1500_.jpg",
  "Isntree Hyaluronic Acid Watery Sun": "https://m.media-amazon.com/images/I/51B5cH-LTTL._SL1500_.jpg",
  
  // Makeup products
  "Maybelline Fit Me": "https://m.media-amazon.com/images/I/61KInxLdxNL._SL1500_.jpg",
  "NYX Butter Gloss": "https://m.media-amazon.com/images/I/71-Ia1C5iyL._SL1500_.jpg",
  "e.l.f. Camo Concealer": "https://m.media-amazon.com/images/I/71sYxE6gWNL._SL1500_.jpg",
  "rom&nd Juicy Lasting": "https://m.media-amazon.com/images/I/61Jp3cV9LGL._SL1500_.jpg",
  "Peripera Ink Velvet": "https://m.media-amazon.com/images/I/61K7yFKT8QL._SL1500_.jpg",
};

async function fixImages() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  
  const db = client.db('amore');
  const collection = db.collection('whitespace_products');
  
  let updated = 0;
  let notFound = 0;
  
  const products = await collection.find({}).toArray();
  
  for (const product of products) {
    const name = product.name || '';
    
    // Find matching image URL
    let newImageUrl = null;
    for (const [key, url] of Object.entries(correctImageUrls)) {
      if (name.includes(key) || name.toLowerCase().includes(key.toLowerCase())) {
        newImageUrl = url;
        break;
      }
    }
    
    if (newImageUrl) {
      await collection.updateOne(
        { _id: product._id },
        { $set: { imageUrl: newImageUrl, image: newImageUrl } }
      );
      updated++;
    } else {
      notFound++;
      console.log('No match found for:', name.substring(0, 50));
    }
  }
  
  console.log('\n=== 결과 ===');
  console.log('Updated:', updated);
  console.log('Not found:', notFound);
  
  await client.close();
}

fixImages().catch(console.error);
