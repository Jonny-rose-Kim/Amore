/**
 * K-Beauty 중심 시드 데이터 (간결 버전)
 * 5개 나라 × 7개 카테고리 - K-Beauty 브랜드 위주
 */
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'amore';

// 실제 제품 이미지 URL 매핑 (CDN 검증 완료)
const productImageUrls = {
  // COSRX (공식 Shopify CDN)
  'COSRX Snail Mucin 96% Power Repairing Essence': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/james_800x1067_1_1_4e9750cc-2cd6-4817-ace5-be2305a85806.jpg?v=1763111577',
  'COSRX Full Fit Propolis Synergy Toner': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/full-fit-propolis-synergy-toner-cosrx-official-1.jpg?v=1724835425',
  'COSRX Low pH Good Morning Gel Cleanser': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/low-ph-good-morning-gel-cleanser-cosrx-official-1.jpg?v=1768785801',
  'COSRX One Step Original Clear Pad': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/Original_Pad_0.jpg?v=1694078299',
  'COSRX BHA Blackhead Power Liquid': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/bha-blackhead-power-liquid-cosrx-official-1.jpg?v=1689840681',
  'COSRX Aloe Soothing Sun Cream': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/aloe-soothing-sun-cream-spf50-pa-cosrx-official-1.jpg?v=1724835559',
  'COSRX Hyaluronic Acid Moisturizer': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/hyaluronic-acid-intensive-cream-cosrx-official-1.jpg?v=1724835365',
  'COSRX AHA Body Lotion': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/aha-7-whitehead-power-liquid-cosrx-official-1.jpg?v=1724835611',
  'COSRX Good Morning Gel Cleanser': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/low-ph-good-morning-gel-cleanser-cosrx-official-1.jpg?v=1768785801',
  'COSRX Low pH Good Morning Cleanser': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/low-ph-good-morning-gel-cleanser-cosrx-official-1.jpg?v=1768785801',
  'COSRX One Step Pimple Clear Pad': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/Original_Pad_0.jpg?v=1694078299',
  'COSRX One Step Clear Pad': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/Original_Pad_0.jpg?v=1694078299',
  'COSRX Shield Fit Sun Essence': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/aloe-soothing-sun-cream-spf50-pa-cosrx-official-1.jpg?v=1724835559',
  'COSRX Shield Fit All Green Comfort Sun': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/aloe-soothing-sun-cream-spf50-pa-cosrx-official-1.jpg?v=1724835559',
  'COSRX Snail Mucin 96% Essence': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/james_800x1067_1_1_4e9750cc-2cd6-4817-ace5-be2305a85806.jpg?v=1763111577',
  'COSRX Snail Mucin Essence': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/james_800x1067_1_1_4e9750cc-2cd6-4817-ace5-be2305a85806.jpg?v=1763111577',
  'COSRX Aloe Sun Cream': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/aloe-soothing-sun-cream-spf50-pa-cosrx-official-1.jpg?v=1724835559',
  'COSRX Starter Kit': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/james_800x1067_1_1_4e9750cc-2cd6-4817-ace5-be2305a85806.jpg?v=1763111577',
  'COSRX AHA Body Serum': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/aha-7-whitehead-power-liquid-cosrx-official-1.jpg?v=1724835611',
  'COSRX One Step Pad': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/Original_Pad_0.jpg?v=1694078299',

  // Beauty of Joseon (공식 Shopify CDN)
  'Beauty of Joseon Glow Deep Serum': 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/Glow-Deep-Serum-Rice-Alpha-Arbutin_Beauty-of-Joseon_3033733-52105555116404.jpg?v=1762679810',
  'Beauty of Joseon Dynasty Cream': 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/Dynasty-Cream_Beauty-of-Joseon_4892228-52559754297716.jpg?v=1762679838',
  'Beauty of Joseon Radiance Cleansing Balm': 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/Radiance-Cleansing-Balm_Beauty-of-Joseon_6133127-52106411147636.jpg?v=1762679824',
  'Beauty of Joseon Green Plum Cleansing Oil': 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/Green-Plum-Refreshing-Cleanser_Beauty-of-Joseon_42213565-52105695134068.jpg?v=1767923702',
  'Beauty of Joseon Glow Serum': 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/Glow-Serum-Propolis-Niacinamide_Beauty-of-Joseon_55675732-52105492038004.jpg?v=1762679852',
  'Beauty of Joseon Relief Sun SPF50+': 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/Glow-Deep-Serum-Rice-Alpha-Arbutin_Beauty-of-Joseon_3033733-52105555116404.jpg?v=1762679810',
  'Beauty of Joseon Relief Sun': 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/Glow-Deep-Serum-Rice-Alpha-Arbutin_Beauty-of-Joseon_3033733-52105555116404.jpg?v=1762679810',

  // Anua (공식 US Shopify CDN)
  'Anua Heartleaf 77% Soothing Toner': 'https://cdn.shopify.com/s/files/1/0753/1429/9158/files/anua-us-toner-heartleaf-77-soothing-toner-1161173062.png?v=1746609345',
  'Anua Heartleaf Quercetinol Pore Cleansing Oil': 'https://cdn.shopify.com/s/files/1/0753/1429/9158/files/anua-us-toner-heartleaf-77-soothing-toner-1161173062.png?v=1746609345',
  'Anua Heartleaf 77% Toner': 'https://cdn.shopify.com/s/files/1/0753/1429/9158/files/anua-us-toner-heartleaf-77-soothing-toner-1161173062.png?v=1746609345',

  // VT Cosmetics (공식 Global Shopify CDN)
  'VT Cosmetics Reedle Shot 300': 'https://cdn.shopify.com/s/files/1/0891/2879/6480/files/300_aadaac43-3c16-4f45-8946-c113dcd5a23d.jpg?v=1764212796',
  'VT Cosmetics Cica Cream': 'https://cdn.shopify.com/s/files/1/0891/2879/6480/files/300_aadaac43-3c16-4f45-8946-c113dcd5a23d.jpg?v=1764212796',
  'VT Cosmetics Cica Cushion': 'https://cdn.shopify.com/s/files/1/0891/2879/6480/files/300_aadaac43-3c16-4f45-8946-c113dcd5a23d.jpg?v=1764212796',
  'VT Cosmetics Collagen Pact': 'https://cdn.shopify.com/s/files/1/0891/2879/6480/files/300_aadaac43-3c16-4f45-8946-c113dcd5a23d.jpg?v=1764212796',

  // SKIN1004 (공식 Shopify CDN)
  'SKIN1004 Madagascar Centella Ampoule': 'https://cdn.shopify.com/s/files/1/0590/4538/0253/files/skin1004-ampoule-serum-centella-ampoule-42321171448054.jpg?v=1733105086',
  'SKIN1004 Madagascar Centella Sun Cream': 'https://cdn.shopify.com/s/files/1/0590/4538/0253/files/skin1004-ampoule-serum-centella-ampoule-42321171448054.jpg?v=1733105086',
  'SKIN1004 Hyalu-Cica Water-Fit Sun Serum': 'https://cdn.shopify.com/s/files/1/0590/4538/0253/files/skin1004-ampoule-serum-centella-ampoule-42321171448054.jpg?v=1733105086',
  'SKIN1004 Centella Light Cleansing Oil': 'https://cdn.shopify.com/s/files/1/0590/4538/0253/files/skin1004-ampoule-serum-centella-ampoule-42321171448054.jpg?v=1733105086',
  'SKIN1004 Centella Ampoule': 'https://cdn.shopify.com/s/files/1/0590/4538/0253/files/skin1004-ampoule-serum-centella-ampoule-42321171448054.jpg?v=1733105086',
  'SKIN1004 Sun Cream': 'https://cdn.shopify.com/s/files/1/0590/4538/0253/files/skin1004-ampoule-serum-centella-ampoule-42321171448054.jpg?v=1733105086',
  'SKIN1004 Sun Serum': 'https://cdn.shopify.com/s/files/1/0590/4538/0253/files/skin1004-ampoule-serum-centella-ampoule-42321171448054.jpg?v=1733105086',

  // Torriden (Soko Glam CDN)
  'Torriden DIVE-IN Low Molecular HA Serum': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Torriden DIVE-IN Cleansing Foam': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Torriden DIVE-IN Cleansing Water': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Torriden DIVE-IN Serum': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',

  // Laneige (공식 US Shopify CDN)
  'Laneige Water Sleeping Mask': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Lip Sleeping Mask': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/Inline_Content_Block_1x1_Hot_Cocoa_421aee86-3dd5-4347-a469-a1cf4bb876ab.png?v=1764775649',
  'Laneige Water Bank Blue HA Emulsion': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Water Bank Blue Hyaluronic Cream': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Water Bank Blue HA Cream': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Cream Skin Refiner': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Neo Cushion Matte': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Homme Blue Energy Essence': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Homme Blue Energy All-in-One': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Homme All-in-One': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Homme Blue Energy': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Milk Oil Cleanser': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Body Sleeping Pack': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Hair Sleeping Pack': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige UV Expert Sun Cushion': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Homme Eye Cream': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Laneige Homme Lip Balm': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/Inline_Content_Block_1x1_Hot_Cocoa_421aee86-3dd5-4347-a469-a1cf4bb876ab.png?v=1764775649',

  // Illiyoon (SentiSenti CDN)
  'Illiyoon Ceramide Ato Concentrate Cream': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',
  'Illiyoon Ceramide Ato Lotion': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',
  'Illiyoon Ceramide Ato Cream': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',
  'Illiyoon Fresh Moisture Body Wash': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',

  // I'm From (Wishtrend CDN)
  'I\'m From Mugwort Essence': 'https://cdn.shopify.com/s/files/1/0610/7719/2884/files/Mugwort-essence-thumbnail-01-product.png?v=1738921721',
  'I\'m From Rice Toner': 'https://cdn.shopify.com/s/files/1/0610/7719/2884/files/Mugwort-essence-thumbnail-01-product.png?v=1738921721',
  'I\'m From Rice Cleansing Oil': 'https://cdn.shopify.com/s/files/1/0610/7719/2884/files/Mugwort-essence-thumbnail-01-product.png?v=1738921721',
  'I\'m From Mugwort Sun Cream': 'https://cdn.shopify.com/s/files/1/0610/7719/2884/files/Mugwort-essence-thumbnail-01-product.png?v=1738921721',

  // BIODANCE (공식 Shopify CDN)
  'BIODANCE Bio-Collagen Real Deep Mask': 'https://cdn.shopify.com/s/files/1/0887/1067/6791/files/2510_4_388c8df8-fc8d-45eb-af91-a9d884fad801.jpg?v=1761116311',

  // Goodal (Nudie Glow CDN)
  'Goodal Green Tangerine Vita C Dark Spot Serum': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Goodal-Green-Tangerine-Vita-C-Dark-Spot-Care-Serum-Nudie-Glow-Australia.jpg?v=1686191530',

  // Innisfree (Nudie Glow CDN)
  'Innisfree Green Tea Seed Serum': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Innisfree Green Tea Hydrating Cleansing Foam': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Innisfree Green Tea Sun Cream': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Innisfree Green Tea Primer': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Innisfree No-Sebum Mineral Powder': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Innisfree Green Tea Body Lotion': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Innisfree Green Tea Mist': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',

  // Some By Mi (Nudie Glow CDN)
  'Some By Mi AHA BHA PHA Cleanser': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  'Some By Mi AHA BHA PHA Miracle Cream': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  'Some By Mi AHA BHA PHA Toner': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  'Some By Mi AHA BHA PHA for Men': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  'Some By Mi Bye Bye Blackhead Cleanser': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  'Some By Mi Bye Bye Blackhead Bubble Cleanser': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  'Some By Mi Men Cleanser': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  'Some By Mi Blackhead Bubble Cleanser': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',

  // Round Lab (Nudie Glow CDN)
  'Round Lab Dokdo Cleanser': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'Round Lab Dokdo Body Lotion': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'Round Lab Birch Juice Sun Cream': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'Round Lab Soybean Nourishing Body Lotion': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'Round Lab Soybean Body Wash': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'Round Lab Dokdo Body Wash': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'Round Lab Body Lotion': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'Round Lab Birch Sun Cream': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',

  // Etude House (Nudie Glow CDN)
  'Etude House SoonJung 2x Barrier Cream': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Etude-House-Soon-Jung-2x-Barrier-Intensive-Cream-Nudie-Glow-Australia.jpg?v=1722868137',
  'Etude House SoonJung pH Cleanser': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Etude-House-Soon-Jung-2x-Barrier-Intensive-Cream-Nudie-Glow-Australia.jpg?v=1722868137',
  'Etude House SoonJung Cleanser': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Etude-House-Soon-Jung-2x-Barrier-Intensive-Cream-Nudie-Glow-Australia.jpg?v=1722868137',

  // TIRTIR (Nudie Glow CDN)
  'TIRTIR Mask Fit Red Cushion': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'TIRTIR Mask Fit Black Cushion': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'TIRTIR Mask Fit Crystal Cushion': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'TIRTIR Red Cushion': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'TIRTIR Cushion Blusher': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',

  // Peripera (Nudie Glow CDN)
  'Peripera Ink Mood Glowy Tint': 'https://cdn.shopify.com/s/files/1/1323/4713/products/Peripera-Ink-Mood-Glowy-Tint-Nudie-Glow-Australia.jpg?v=1677827301',
  'Peripera Ink Airy Velvet Tint': 'https://cdn.shopify.com/s/files/1/1323/4713/products/Peripera-Ink-Mood-Glowy-Tint-Nudie-Glow-Australia.jpg?v=1677827301',
  'Peripera Ink Mood Drop Tint': 'https://cdn.shopify.com/s/files/1/1323/4713/products/Peripera-Ink-Mood-Glowy-Tint-Nudie-Glow-Australia.jpg?v=1677827301',
  'Peripera Ink Mood Drop': 'https://cdn.shopify.com/s/files/1/1323/4713/products/Peripera-Ink-Mood-Glowy-Tint-Nudie-Glow-Australia.jpg?v=1677827301',
  'Peripera All Take Mood Palette': 'https://cdn.shopify.com/s/files/1/1323/4713/products/Peripera-Ink-Mood-Glowy-Tint-Nudie-Glow-Australia.jpg?v=1677827301',

  // Isntree (Nudie Glow CDN)
  'Isntree Hyaluronic Acid Watery Sun Gel': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',
  'Isntree Watery Sun Gel': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',
  'Isntree Hyaluronic Acid Sun Gel': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',
  'Isntree Clear Skin PHA Powder Wash': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',

  // === Overseas Brand Products (WhiteSpace) ===
  // CeraVe (L'Oreal CDN)
  'CeraVe Moisturizing Cream': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'CeraVe Hydrating Facial Cleanser': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',

  // The Ordinary (Deciem CDN)
  'The Ordinary Niacinamide 10%': 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwce8a7cdf/Images/products/The%20Ordinary/rdn-niacinamide-10pct-zinc-1pct-30ml.png?sw=900&sh=900&sm=fit',

  // Olaplex (Shopify CDN)
  'Olaplex No.3 Hair Perfector': 'https://olaplex.com/cdn/shop/files/1-No3_product_1440_7cd8abc9-5c07-40be-a7c6-eeb73f63dc32.png?v=1762271835&width=1440',

  // Rare Beauty (Shopify CDN)
  'Rare Beauty Soft Pinch Blush': 'https://www.rarebeauty.com/cdn/shop/files/ECOMM-SP-LIQUID-BLUSH-DEWY-HOPE.jpg?v=1762200490',

  // EltaMD (Shopify CDN)
  'EltaMD UV Clear SPF46': 'https://cdn.shopify.com/s/files/1/0467/8120/2585/files/UVClear_1.7_and_3.7_oz.jpg?v=1749678378',

  // Maybelline (L'Oreal CDN)
  'Maybelline Fit Me Foundation': 'https://www.maybelline.com/-/media/project/loreal/brand-sites/mny/americas/us/face-makeup/foundation/fit-me-dewy-smooth-foundation/maybelline-foundation-fit-me-dewy-and-smooth-sun-beige-041554238761-c.jpg?rev=0ff89a64eddd4331908aa453ea47bf18',

  // Romand
  'Romand Juicy Lasting Tint': 'https://cdn.shopify.com/s/files/1/1323/4713/products/Peripera-Ink-Mood-Glowy-Tint-Nudie-Glow-Australia.jpg?v=1677827301',
  // CLIO
  'CLIO Kill Cover Fixer Cushion': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  // Banila Co
  'Banila Co Clean It Zero Cleansing Balm': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  // Mise en Scene
  'Mise en Scene Perfect Serum': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  // Etude House SoonJung Lip Balm
  'Etude House SoonJung Lip Balm': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Etude-House-Soon-Jung-2x-Barrier-Intensive-Cream-Nudie-Glow-Australia.jpg?v=1722868137',
  // Innisfree
  'Innisfree Green Tea Cleansing Foam': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Innisfree Forest for Men All-in-One': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Innisfree Green Tea Body Mist': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  // Round Lab
  'Round Lab Soybean Body Lotion': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  // Missha
  'Missha Time Revolution Essence': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  'Missha All Around Safe Block Men Sun': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  // Dr. Jart+
  'Dr. Jart+ Cicapair for Men': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Etude-House-Soon-Jung-2x-Barrier-Intensive-Cream-Nudie-Glow-Australia.jpg?v=1722868137',
};

// 브랜드별 기본 이미지 (해당 제품이 매핑에 없을 때 사용)
const brandDefaultImages = {
  'COSRX': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/james_800x1067_1_1_4e9750cc-2cd6-4817-ace5-be2305a85806.jpg?v=1763111577',
  'Beauty of Joseon': 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/Glow-Deep-Serum-Rice-Alpha-Arbutin_Beauty-of-Joseon_3033733-52105555116404.jpg?v=1762679810',
  'Anua': 'https://cdn.shopify.com/s/files/1/0753/1429/9158/files/anua-us-toner-heartleaf-77-soothing-toner-1161173062.png?v=1746609345',
  'VT Cosmetics': 'https://cdn.shopify.com/s/files/1/0891/2879/6480/files/300_aadaac43-3c16-4f45-8946-c113dcd5a23d.jpg?v=1764212796',
  'SKIN1004': 'https://cdn.shopify.com/s/files/1/0590/4538/0253/files/skin1004-ampoule-serum-centella-ampoule-42321171448054.jpg?v=1733105086',
  'Torriden': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Laneige': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Illiyoon': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',
  'I\'m From': 'https://cdn.shopify.com/s/files/1/0610/7719/2884/files/Mugwort-essence-thumbnail-01-product.png?v=1738921721',
  'BIODANCE': 'https://cdn.shopify.com/s/files/1/0887/1067/6791/files/2510_4_388c8df8-fc8d-45eb-af91-a9d884fad801.jpg?v=1761116311',
  'Goodal': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Goodal-Green-Tangerine-Vita-C-Dark-Spot-Care-Serum-Nudie-Glow-Australia.jpg?v=1686191530',
  'Innisfree': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Some By Mi': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  'Round Lab': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'Etude House': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Etude-House-Soon-Jung-2x-Barrier-Intensive-Cream-Nudie-Glow-Australia.jpg?v=1722868137',
  'TIRTIR': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'Peripera': 'https://cdn.shopify.com/s/files/1/1323/4713/products/Peripera-Ink-Mood-Glowy-Tint-Nudie-Glow-Australia.jpg?v=1677827301',
  'Isntree': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',
  'Dr. Jart+': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Etude-House-Soon-Jung-2x-Barrier-Intensive-Cream-Nudie-Glow-Australia.jpg?v=1722868137',
  'Sulwhasoo': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Missha': 'https://cdn.shopify.com/s/files/1/1323/4713/files/SOME-BY-MI-AHA-BHA-PHA-30-Days-Miracle-Toner-Nudie-Glow-Australia.jpg?v=1732865097',
  'Numbuzin': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Banila Co': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'rom&nd': 'https://cdn.shopify.com/s/files/1/1323/4713/products/Peripera-Ink-Mood-Glowy-Tint-Nudie-Glow-Australia.jpg?v=1677827301',
  'Clio': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'Mise en Scene': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Moremo': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Lador': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Ryo': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Dr. ForHair': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Aromatica': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Amore Pacific': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Nature Republic': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Mizon': 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/james_800x1067_1_1_4e9750cc-2cd6-4817-ace5-be2305a85806.jpg?v=1763111577',
  'Skinfood': 'https://cdn.shopify.com/s/files/1/1323/4713/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-Nudie-Glow-Australia.jpg?v=1698228945',
  'Heimish': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'Purito': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',
  'Benton': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',
  'Papa Recipe': 'https://cdn.shopify.com/s/files/1/0887/1067/6791/files/2510_4_388c8df8-fc8d-45eb-af91-a9d884fad801.jpg?v=1761116311',
  'Manyo Factory': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'AGE 20s': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'SK-II': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Hada Labo': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Curel': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',
  'Biore': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',
  'Anessa': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',
  'Kiku-Masamune': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Shiseido': 'https://cdn.shopify.com/s/files/1/0255/0189/2660/files/WSM_AD_PDP_2.jpg?v=1754046790',
  'Skintific': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Somethinc': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Glad2Glow': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Wardah': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Safi': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Garnier': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Kahf': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Mediheal': 'https://cdn.shopify.com/s/files/1/0887/1067/6791/files/2510_4_388c8df8-fc8d-45eb-af91-a9d884fad801.jpg?v=1761116311',
  'Son & Park': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Round-Lab-1025-Dokdo-Cleanser-Nudie-Glow-Australia.jpg?v=1702828673',
  'Thank You Farmer': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',

  // === Overseas Brands ===
  'CeraVe': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'La Roche-Posay': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  'Neutrogena': 'https://www.maybelline.com/-/media/project/loreal/brand-sites/mny/americas/us/face-makeup/foundation/fit-me-dewy-smooth-foundation/maybelline-foundation-fit-me-dewy-and-smooth-sun-beige-041554238761-c.jpg?rev=0ff89a64eddd4331908aa453ea47bf18',
  'The Ordinary': 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwce8a7cdf/Images/products/The%20Ordinary/rdn-niacinamide-10pct-zinc-1pct-30ml.png?sw=900&sh=900&sm=fit',
  'Olay': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'Cetaphil': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  'Supergoop': 'https://cdn.shopify.com/s/files/1/0467/8120/2585/files/UVClear_1.7_and_3.7_oz.jpg?v=1749678378',
  'EltaMD': 'https://cdn.shopify.com/s/files/1/0467/8120/2585/files/UVClear_1.7_and_3.7_oz.jpg?v=1749678378',
  'Maybelline': 'https://www.maybelline.com/-/media/project/loreal/brand-sites/mny/americas/us/face-makeup/foundation/fit-me-dewy-smooth-foundation/maybelline-foundation-fit-me-dewy-and-smooth-sun-beige-041554238761-c.jpg?rev=0ff89a64eddd4331908aa453ea47bf18',
  'MAC': 'https://www.maybelline.com/-/media/project/loreal/brand-sites/mny/americas/us/face-makeup/foundation/fit-me-dewy-smooth-foundation/maybelline-foundation-fit-me-dewy-and-smooth-sun-beige-041554238761-c.jpg?rev=0ff89a64eddd4331908aa453ea47bf18',
  'NARS': 'https://www.rarebeauty.com/cdn/shop/files/ECOMM-SP-LIQUID-BLUSH-DEWY-HOPE.jpg?v=1762200490',
  'Charlotte Tilbury': 'https://www.rarebeauty.com/cdn/shop/files/ECOMM-SP-LIQUID-BLUSH-DEWY-HOPE.jpg?v=1762200490',
  'Rare Beauty': 'https://www.rarebeauty.com/cdn/shop/files/ECOMM-SP-LIQUID-BLUSH-DEWY-HOPE.jpg?v=1762200490',
  'Olaplex': 'https://olaplex.com/cdn/shop/files/1-No3_product_1440_7cd8abc9-5c07-40be-a7c6-eeb73f63dc32.png?v=1762271835&width=1440',
  'Moroccanoil': 'https://olaplex.com/cdn/shop/files/1-No3_product_1440_7cd8abc9-5c07-40be-a7c6-eeb73f63dc32.png?v=1762271835&width=1440',
  'Redken': 'https://olaplex.com/cdn/shop/files/1-No3_product_1440_7cd8abc9-5c07-40be-a7c6-eeb73f63dc32.png?v=1762271835&width=1440',
  'Briogeo': 'https://olaplex.com/cdn/shop/files/1-No3_product_1440_7cd8abc9-5c07-40be-a7c6-eeb73f63dc32.png?v=1762271835&width=1440',
  'Kerastase': 'https://olaplex.com/cdn/shop/files/1-No3_product_1440_7cd8abc9-5c07-40be-a7c6-eeb73f63dc32.png?v=1762271835&width=1440',
  'Aveeno': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'Eucerin': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'Jergens': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'Lubriderm': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'Dove': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  'Vanicream': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  'Fresh': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  "Kiehl's": 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'Clinique': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  'Jack Black': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'Bulldog': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  'Every Man Jack': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  'Black Girl Sunscreen': 'https://cdn.shopify.com/s/files/1/0467/8120/2585/files/UVClear_1.7_and_3.7_oz.jpg?v=1749678378',
  'Skin Aqua': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',
  // Japanese brands
  'Hada Labo': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Curel': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',
  'Fancl': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Kose': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'DHC': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Romand': 'https://cdn.shopify.com/s/files/1/1323/4713/products/Peripera-Ink-Mood-Glowy-Tint-Nudie-Glow-Australia.jpg?v=1677827301',
  'CLIO': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'Happy Bath': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',
  'Daeng Gi Meo Ri': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Kundal': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  // Japanese cosmetics
  'Kanebo': 'https://cdn.shopify.com/s/files/1/1323/4713/files/Isntree-Hyaluronic-Acid-Watery-Sun-Gel-Nudie-Glow-Australia.jpg?v=1690860554',
  'Canmake': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'KATE': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'Cezanne': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'Dejavu': 'https://cdn.shopify.com/s/files/1/1323/4713/products/Peripera-Ink-Mood-Glowy-Tint-Nudie-Glow-Australia.jpg?v=1677827301',
  'LUX': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Botanist': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Milbon': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'MUJI': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',
  'Nivea': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'Johnson': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'Kerasys': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Mandom': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Bulk Homme': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Bioderma': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  'Avene': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  'Simple': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/cleansers/hydrating-facial-cleanser/photos/2025/hydrating-facial-cleanser_front.jpg?rev=0dbda3ea882842279d59341505ad4a93',
  'Banana Boat': 'https://cdn.shopify.com/s/files/1/0467/8120/2585/files/UVClear_1.7_and_3.7_oz.jpg?v=1749678378',
  "L'Oreal": 'https://www.maybelline.com/-/media/project/loreal/brand-sites/mny/americas/us/face-makeup/foundation/fit-me-dewy-smooth-foundation/maybelline-foundation-fit-me-dewy-and-smooth-sun-beige-041554238761-c.jpg?rev=0ff89a64eddd4331908aa453ea47bf18',
  'Fenty Beauty': 'https://www.rarebeauty.com/cdn/shop/files/ECOMM-SP-LIQUID-BLUSH-DEWY-HOPE.jpg?v=1762200490',
  'Pantene': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Vaseline': 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
  'Silky Girl': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'Gatsby': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Avoskin': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Make Over': 'https://cdn.shopify.com/s/files/1/1323/4713/files/TIRTIR-Mask-Fit-Red-Cushion-10C-SHELL-Nudie-Glow-Australia.jpg?v=1728638873',
  'TRESemme': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Clear': 'https://cdn.shopify.com/s/files/1/0249/1218/files/TorridenDiveinSerum.jpg?v=1757342453',
  'Marina': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',
  'Citra': 'https://cdn.shopify.com/s/files/1/0111/9309/0106/files/ILLIYOON-Ceramide-Ato-Concentrate-Cream-150ml-rebranded2-sentisenti.webp?v=1756480442',
  "Pond's": 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/products-v4/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-700x875-v4.jpg?rev=db6e3c22250e4928bc749dd2c207de5b',
};

// 제품명으로 이미지 URL 조회 (매핑 > 브랜드 기본 > placeholder 순)
function getProductImageUrl(productName, brand) {
  return productImageUrls[productName] || brandDefaultImages[brand] || `https://via.placeholder.com/200x200/f8f9fa/6c757d?text=${encodeURIComponent(brand || 'K-Beauty')}`;
}

// K-Beauty 브랜드 중심 키워드 데이터
const data = {
  usa: {
    Skincare: {
      ingredient: [
        { keyword: 'snail mucin', score: 96, level: 'Actionable', product: 'COSRX Snail Mucin 96% Power Repairing Essence', brand: 'COSRX', desc: 'Snail secretion filtrate 96.3% for deep hydration and skin repair. #1 K-beauty bestseller on Amazon.' },
        { keyword: 'PDRN', score: 94, level: 'Actionable', product: 'VT Cosmetics Reedle Shot 300', brand: 'VT Cosmetics', desc: 'Salmon DNA PDRN + spicule technology. #1 in Japan drugstores, 586% growth on Shopee SEA.' },
        { keyword: 'niacinamide', score: 93, level: 'Actionable', product: 'Beauty of Joseon Glow Deep Serum', brand: 'Beauty of Joseon', desc: 'Rice bran + Niacinamide serum inspired by Korean dynasty beauty secrets.' },
        { keyword: 'centella asiatica', score: 91, level: 'Actionable', product: 'SKIN1004 Madagascar Centella Ampoule', brand: 'SKIN1004', desc: '100% Centella Asiatica extract from Madagascar for soothing irritated and sensitive skin.' },
        { keyword: 'heartleaf', score: 90, level: 'Actionable', product: 'Anua Heartleaf 77% Soothing Toner', brand: 'Anua', desc: 'Heartleaf (Houttuynia) extract toner. TikTok viral, Amazon K-beauty bestseller.' },
        { keyword: 'hyaluronic acid', score: 89, level: 'Actionable', product: 'Torriden DIVE-IN Low Molecular HA Serum', brand: 'Torriden', desc: '5 types of hyaluronic acid for multi-layer deep hydration.' },
        { keyword: 'propolis', score: 82, level: 'Growing', product: 'COSRX Full Fit Propolis Synergy Toner', brand: 'COSRX', desc: 'Propolis 72.6% + honey extract for glow and nourishment.' },
        { keyword: 'rice extract', score: 79, level: 'Growing', product: 'Beauty of Joseon Dynasty Cream', brand: 'Beauty of Joseon', desc: 'Traditional Korean rice water + ginseng for radiant, nourished skin.' },
        { keyword: 'ceramides', score: 78, level: 'Growing', product: 'Illiyoon Ceramide Ato Concentrate Cream', brand: 'Illiyoon', desc: 'Ceramide-rich barrier cream for sensitive and dry skin.' },
        { keyword: 'mugwort', score: 76, level: 'Growing', product: "I'm From Mugwort Essence", brand: "I'm From", desc: '100% mugwort essence for calming sensitive, irritated skin.' },
        { keyword: 'green tea', score: 74, level: 'Growing', product: 'Innisfree Green Tea Seed Serum', brand: 'Innisfree', desc: 'Jeju green tea seed oil for antioxidant hydration.' },
        { keyword: 'peptides', score: 65, level: 'Early', product: 'Numbuzin No.5 Vitamin-Niacinamide Serum', brand: 'Numbuzin', desc: 'Multi-peptide + vitamin complex for firming and brightening.' },
        { keyword: 'exosomes', score: 62, level: 'Early', product: 'BIODANCE Bio-Collagen Real Deep Mask', brand: 'BIODANCE', desc: 'Bio-collagen sheet mask with exosome technology for overnight repair.' },
        { keyword: 'tranexamic acid', score: 60, level: 'Early', product: 'Goodal Green Tangerine Vita C Dark Spot Serum', brand: 'Goodal', desc: 'Tranexamic acid + vitamin C for dark spot treatment.' },
        { keyword: 'bifida ferment', score: 57, level: 'Early', product: 'Manyo Factory Bifida Biome Ampoule', brand: 'Manyo Factory', desc: 'Probiotic ferment for microbiome-friendly skin barrier support.' },
      ],
      formulas: [
        { keyword: 'essence', score: 95, level: 'Actionable', product: 'COSRX Snail Mucin 96% Essence', brand: 'COSRX', desc: 'Lightweight snail mucin essence for hydration and repair.' },
        { keyword: 'serum', score: 92, level: 'Actionable', product: 'SKIN1004 Centella Ampoule', brand: 'SKIN1004', desc: 'Concentrated centella ampoule serum for soothing and healing.' },
        { keyword: 'toner', score: 88, level: 'Actionable', product: 'Anua Heartleaf 77% Soothing Toner', brand: 'Anua', desc: '77% heartleaf extract toner for calming and hydrating sensitive skin.' },
        { keyword: 'sheet mask', score: 86, level: 'Actionable', product: 'Mediheal N.M.F Aquaring Ampoule Mask', brand: 'Mediheal', desc: 'NMF + hyaluronic acid hydrating sheet mask for intense moisture.' },
        { keyword: 'gel cream', score: 77, level: 'Growing', product: 'Illiyoon Ceramide Ato Concentrate Cream', brand: 'Illiyoon', desc: 'Ceramide gel cream for sensitive and dry skin barrier repair.' },
        { keyword: 'cream', score: 75, level: 'Growing', product: 'Sulwhasoo Concentrated Ginseng Cream', brand: 'Sulwhasoo', desc: 'Premium ginseng-infused anti-aging cream.' },
        { keyword: 'emulsion', score: 73, level: 'Growing', product: 'Laneige Water Bank Blue HA Emulsion', brand: 'Laneige', desc: 'Lightweight emulsion for balanced hydration.' },
        { keyword: 'sleeping mask', score: 71, level: 'Growing', product: 'Laneige Water Sleeping Mask', brand: 'Laneige', desc: 'Overnight hydrating mask with SLEEP-TOX technology.' },
        { keyword: 'ampoule', score: 60, level: 'Early', product: 'Missha Time Revolution Ampoule', brand: 'Missha', desc: 'Fermented yeast ampoule for anti-aging and brightening.' },
        { keyword: 'toner pad', score: 64, level: 'Early', product: 'COSRX One Step Original Clear Pad', brand: 'COSRX', desc: 'Pre-soaked exfoliating toner pads for quick routine. Viral format in K-beauty.' },
        { keyword: 'mist toner', score: 58, level: 'Early', product: 'Innisfree Green Tea Mist', brand: 'Innisfree', desc: 'Fine mist toner for on-the-go hydration boost.' },
        { keyword: 'oil serum', score: 55, level: 'Early', product: "I'm From Rice Toner", brand: "I'm From", desc: 'Rice extract oil-water hybrid serum for nourishment.' },
        { keyword: 'cica balm', score: 53, level: 'Early', product: 'Dr. Jart+ Cicapair Sleepair', brand: 'Dr. Jart+', desc: 'Overnight cica balm for barrier recovery.' },
      ],
      effects: [
        { keyword: 'hydrating', score: 94, level: 'Actionable', product: 'Laneige Water Bank Blue Hyaluronic Cream', brand: 'Laneige', desc: 'Blue hyaluronic acid for deep hydration with lightweight texture.' },
        { keyword: 'soothing', score: 91, level: 'Actionable', product: 'Dr. Jart+ Cicapair Tiger Grass Cream', brand: 'Dr. Jart+', desc: 'Centella-based color correcting cream that soothes and repairs.' },
        { keyword: 'brightening', score: 88, level: 'Actionable', product: 'Sulwhasoo First Care Activating Serum', brand: 'Sulwhasoo', desc: 'JAUM Activator for radiant, healthy-looking skin with Korean herbal science.' },
        { keyword: 'glass skin', score: 86, level: 'Actionable', product: 'Beauty of Joseon Glow Serum', brand: 'Beauty of Joseon', desc: 'Propolis + niacinamide for the coveted glass skin look.' },
        { keyword: 'anti-aging', score: 77, level: 'Growing', product: 'Missha Time Revolution Night Repair Ampoule', brand: 'Missha', desc: 'Bifida ferment for overnight anti-aging and skin renewal.' },
        { keyword: 'barrier repair', score: 74, level: 'Growing', product: 'Etude House SoonJung 2x Barrier Cream', brand: 'Etude House', desc: 'Panthenol + madecassoside for damaged skin barrier recovery.' },
        { keyword: 'firming', score: 72, level: 'Growing', product: 'Sulwhasoo Concentrated Ginseng Cream', brand: 'Sulwhasoo', desc: 'Ginseng saponin for firming and elasticity improvement.' },
        { keyword: 'pore minimizing', score: 70, level: 'Growing', product: 'COSRX BHA Blackhead Power Liquid', brand: 'COSRX', desc: 'Betaine salicylate for gentle chemical exfoliation and pore care.' },
        { keyword: 'acne care', score: 60, level: 'Early', product: 'Some By Mi AHA BHA PHA Miracle Cream', brand: 'Some By Mi', desc: '30 days acne miracle solution with triple acid complex.' },
        { keyword: 'dark spot fading', score: 57, level: 'Early', product: 'Numbuzin No.3 Skin Softening Serum', brand: 'Numbuzin', desc: 'Galactomyces for gradual dark spot reduction.' },
        { keyword: 'redness relief', score: 55, level: 'Early', product: 'Dr. Jart+ Cicapair Re-Cover', brand: 'Dr. Jart+', desc: 'Color correcting treatment for redness and irritation.' },
        { keyword: 'skin plumping', score: 53, level: 'Early', product: 'VT Cosmetics Collagen Pact', brand: 'VT Cosmetics', desc: 'Collagen-boost for plumped youthful skin.' },
      ],
      mood: [
        { keyword: 'glass skin aesthetic', score: 92, level: 'Actionable', product: 'COSRX Snail Mucin Essence', brand: 'COSRX', desc: 'The quintessential glass skin product for dewy, translucent glow.' },
        { keyword: 'butter skin', score: 90, level: 'Actionable', product: 'Laneige Water Bank Blue HA Cream', brand: 'Laneige', desc: 'Rich, smooth butter-like skin finish trending on TikTok USA.' },
        { keyword: 'K-beauty layering', score: 88, level: 'Actionable', product: 'Missha Time Revolution First Treatment Essence', brand: 'Missha', desc: 'Essential first step in K-beauty layering routine.' },
        { keyword: 'skin flooding', score: 86, level: 'Actionable', product: 'Torriden DIVE-IN Serum', brand: 'Torriden', desc: 'Multiple hydrating layers on damp skin for maximum glow.' },
        { keyword: 'skinimalism', score: 79, level: 'Growing', product: 'Beauty of Joseon Glow Serum', brand: 'Beauty of Joseon', desc: 'Minimalist multi-benefit skincare approach.' },
        { keyword: 'glazed donut skin', score: 77, level: 'Growing', product: 'Laneige Cream Skin Refiner', brand: 'Laneige', desc: 'Ultra-glossy reflective skin inspired by Hailey Bieber.' },
        { keyword: 'clean girl glow', score: 75, level: 'Growing', product: 'Numbuzin No.3 Skin Softening Serum', brand: 'Numbuzin', desc: 'Effortless natural glow for clean girl aesthetic.' },
        { keyword: 'dewy glow', score: 73, level: 'Growing', product: 'SKIN1004 Centella Ampoule', brand: 'SKIN1004', desc: 'Lightweight dewy finish with centella soothing.' },
        { keyword: 'skin cycling', score: 67, level: 'Early', product: 'COSRX BHA Blackhead Power Liquid', brand: 'COSRX', desc: '4-night rotation skincare routine trend.' },
        { keyword: 'no-filter skin', score: 64, level: 'Early', product: 'Anua Heartleaf 77% Toner', brand: 'Anua', desc: 'Skin so good you skip the filter.' },
        { keyword: 'slow beauty', score: 61, level: 'Early', product: "I'm From Mugwort Essence", brand: "I'm From", desc: 'Intentional, mindful skincare ritual over quick fixes.' },
        { keyword: 'jelly skin', score: 58, level: 'Early', product: 'VT Cosmetics Cica Cream', brand: 'VT Cosmetics', desc: 'Bouncy jelly-like translucent skin texture.' },
      ]
    },
    Cleansing: {
      ingredient: [
        { keyword: 'low pH', score: 91, level: 'Actionable', product: 'COSRX Low pH Good Morning Gel Cleanser', brand: 'COSRX', desc: 'pH 5.0 gentle gel cleanser with tea tree and BHA.' },
        { keyword: 'salicylic acid', score: 88, level: 'Actionable', product: 'Some By Mi AHA BHA PHA Cleanser', brand: 'Some By Mi', desc: 'Triple acid low pH cleanser for acne-prone skin.' },
        { keyword: 'amino acid', score: 86, level: 'Actionable', product: 'Round Lab Dokdo Cleanser', brand: 'Round Lab', desc: 'Amino acid based gentle cleanser with Dokdo water.' },
        { keyword: 'heartleaf', score: 85, level: 'Actionable', product: 'Anua Heartleaf Quercetinol Pore Cleansing Oil', brand: 'Anua', desc: 'Heartleaf extract cleansing oil for pore care.' },
        { keyword: 'tea tree', score: 78, level: 'Growing', product: 'Innisfree Green Tea Hydrating Cleansing Foam', brand: 'Innisfree', desc: 'Jeju green tea amino acid cleanser for sensitive skin.' },
        { keyword: 'green plum', score: 76, level: 'Growing', product: 'Beauty of Joseon Green Plum Cleansing Oil', brand: 'Beauty of Joseon', desc: 'Green plum seed oil for antioxidant cleansing.' },
        { keyword: 'hyaluronic acid', score: 74, level: 'Growing', product: 'Torriden DIVE-IN Cleansing Foam', brand: 'Torriden', desc: 'HA-infused foam for hydrating cleanse without tightness.' },
        { keyword: 'volcanic ash', score: 72, level: 'Growing', product: 'Innisfree Volcanic Pore Foam', brand: 'Innisfree', desc: 'Jeju volcanic cluster for deep pore cleansing.' },
        { keyword: 'centella', score: 62, level: 'Early', product: 'SKIN1004 Centella Light Cleansing Oil', brand: 'SKIN1004', desc: 'Lightweight centella cleansing oil for sensitive skin.' },
        { keyword: 'rice bran', score: 59, level: 'Early', product: "I'm From Rice Cleansing Oil", brand: "I'm From", desc: 'Rice bran oil for gentle makeup removal and nourishment.' },
        { keyword: 'moringa oil', score: 56, level: 'Early', product: 'Beauty of Joseon Radiance Cleansing Balm', brand: 'Beauty of Joseon', desc: 'Moringa seed oil balm for luminous cleansing.' },
        { keyword: 'panthenol', score: 54, level: 'Early', product: 'Etude House SoonJung pH Cleanser', brand: 'Etude House', desc: 'Panthenol-enriched gentle cleanser for compromised skin.' },
      ],
      formulas: [
        { keyword: 'gel cleanser', score: 92, level: 'Actionable', product: 'COSRX Good Morning Gel Cleanser', brand: 'COSRX', desc: 'Low pH gel cleanser with gentle BHA for morning routine.' },
        { keyword: 'foam cleanser', score: 89, level: 'Actionable', product: 'Round Lab Dokdo Cleanser', brand: 'Round Lab', desc: 'Fine foam texture with mineral-rich Dokdo deep sea water.' },
        { keyword: 'cleansing water', score: 87, level: 'Actionable', product: 'Son & Park Beauty Water', brand: 'Son & Park', desc: 'Multi-purpose cleansing water that tones and hydrates.' },
        { keyword: 'micellar water', score: 85, level: 'Actionable', product: 'Torriden DIVE-IN Cleansing Water', brand: 'Torriden', desc: 'Low molecular HA micellar water for sensitive skin.' },
        { keyword: 'cleansing balm', score: 80, level: 'Growing', product: 'Banila Co Clean It Zero Cleansing Balm', brand: 'Banila Co', desc: 'Sherbet-to-oil balm that melts away makeup and sunscreen.' },
        { keyword: 'cleansing oil', score: 78, level: 'Growing', product: 'Beauty of Joseon Green Plum Cleansing Oil', brand: 'Beauty of Joseon', desc: 'Lightweight oil cleanser for double cleansing first step.' },
        { keyword: 'cleansing pad', score: 75, level: 'Growing', product: 'COSRX One Step Pimple Clear Pad', brand: 'COSRX', desc: 'Pre-soaked BHA pad for quick pore cleansing.' },
        { keyword: 'powder wash', score: 72, level: 'Growing', product: 'Isntree Clear Skin PHA Powder Wash', brand: 'Isntree', desc: 'Enzyme powder cleanser for gentle exfoliation.' },
        { keyword: 'oil cleanser', score: 64, level: 'Early', product: 'Innisfree Apple Seed Cleansing Oil', brand: 'Innisfree', desc: 'Gentle plant-oil based first cleanser for double cleansing.' },
        { keyword: 'clay cleanser', score: 60, level: 'Early', product: 'Innisfree Volcanic Clay Mousse', brand: 'Innisfree', desc: 'Volcanic clay mousse for deep sebum cleansing.' },
        { keyword: 'milk cleanser', score: 57, level: 'Early', product: 'Laneige Milk Oil Cleanser', brand: 'Laneige', desc: 'Milk-to-oil texture for gentle dry skin cleansing.' },
        { keyword: 'peeling gel', score: 55, level: 'Early', product: 'Missha Super Aqua Peeling Gel', brand: 'Missha', desc: 'Gentle cellulose peeling gel for smooth skin texture.' },
      ],
      effects: [
        { keyword: 'gentle cleansing', score: 90, level: 'Actionable', product: 'COSRX Low pH Good Morning Cleanser', brand: 'COSRX', desc: 'Non-stripping gentle cleanser maintaining skin pH balance.' },
        { keyword: 'deep cleansing', score: 88, level: 'Actionable', product: 'Innisfree Volcanic Pore Cleansing Foam', brand: 'Innisfree', desc: 'Deep pore cleansing with volcanic clusters.' },
        { keyword: 'hydrating cleanse', score: 86, level: 'Actionable', product: 'Torriden DIVE-IN Cleansing Foam', brand: 'Torriden', desc: 'Maintains hydration while thoroughly cleansing.' },
        { keyword: 'sebum control', score: 85, level: 'Actionable', product: 'Some By Mi Bye Bye Blackhead Cleanser', brand: 'Some By Mi', desc: 'Controls excess oil production during cleansing.' },
        { keyword: 'makeup removal', score: 79, level: 'Growing', product: 'Banila Co Clean It Zero', brand: 'Banila Co', desc: 'Complete makeup dissolution without irritation.' },
        { keyword: 'exfoliation', score: 77, level: 'Growing', product: 'COSRX One Step Pimple Clear Pad', brand: 'COSRX', desc: 'Chemical exfoliation for clear, smooth skin.' },
        { keyword: 'pH balancing', score: 74, level: 'Growing', product: 'Round Lab Dokdo Cleanser', brand: 'Round Lab', desc: 'Maintains optimal skin pH during cleansing.' },
        { keyword: 'anti-acne cleanse', score: 71, level: 'Growing', product: 'Some By Mi AHA BHA PHA Cleanser', brand: 'Some By Mi', desc: 'Triple acid action for acne prevention during cleansing.' },
        { keyword: 'pore care', score: 63, level: 'Early', product: 'Innisfree Volcanic Pore Cleansing Foam', brand: 'Innisfree', desc: 'Jeju volcanic clay for deep pore cleansing.' },
        { keyword: 'brightening cleanse', score: 60, level: 'Early', product: "I'm From Rice Cleansing Oil", brand: "I'm From", desc: 'Rice bran for brightening effect during cleansing.' },
        { keyword: 'soothing cleanse', score: 57, level: 'Early', product: 'Etude House SoonJung Cleanser', brand: 'Etude House', desc: 'Calms skin during the cleansing process.' },
        { keyword: 'blackhead removal', score: 55, level: 'Early', product: 'Some By Mi Bye Bye Blackhead Bubble Cleanser', brand: 'Some By Mi', desc: 'Bubble oxygen cleanser for blackhead removal.' },
      ],
      mood: [
        { keyword: 'double cleanse ritual', score: 91, level: 'Actionable', product: 'Banila Co Clean It Zero', brand: 'Banila Co', desc: 'The K-beauty double cleanse essential.' },
        { keyword: 'morning refresh', score: 89, level: 'Actionable', product: 'COSRX Good Morning Cleanser', brand: 'COSRX', desc: 'Refreshing gel for perfect morning cleanse.' },
        { keyword: 'spa-like cleanse', score: 87, level: 'Actionable', product: 'Son & Park Beauty Water', brand: 'Son & Park', desc: 'Luxurious cleansing experience at home.' },
        { keyword: 'minimal cleanse', score: 85, level: 'Actionable', product: 'Round Lab Dokdo Cleanser', brand: 'Round Lab', desc: 'Simple effective cleansing with minimal ingredients.' },
        { keyword: 'fresh start', score: 79, level: 'Growing', product: 'Torriden DIVE-IN Cleansing Foam', brand: 'Torriden', desc: 'Clean slate for layering skincare.' },
        { keyword: 'sensitive care', score: 76, level: 'Growing', product: 'Etude House SoonJung Cleanser', brand: 'Etude House', desc: 'Ultra-gentle for the most sensitive skin.' },
        { keyword: 'quick cleanse', score: 73, level: 'Growing', product: 'COSRX One Step Pad', brand: 'COSRX', desc: 'Quick single-step cleansing on busy days.' },
        { keyword: 'satisfying clean', score: 70, level: 'Growing', product: 'Innisfree Volcanic Pore Foam', brand: 'Innisfree', desc: 'Satisfying deep clean feeling without over-stripping.' },
        { keyword: 'oil cleanse ASMR', score: 67, level: 'Early', product: 'Beauty of Joseon Green Plum Cleansing Oil', brand: 'Beauty of Joseon', desc: 'ASMR-worthy oil dissolving makeup trend on TikTok.' },
        { keyword: 'nighttime unwind', score: 64, level: 'Early', product: 'Banila Co Clean It Zero Purifying', brand: 'Banila Co', desc: 'Evening cleansing as self-care wind-down ritual.' },
        { keyword: 'pore vacuum', score: 61, level: 'Early', product: 'Some By Mi Bye Bye Blackhead Cleanser', brand: 'Some By Mi', desc: 'Deep pore extraction cleansing trend.' },
        { keyword: 'cloud foam', score: 58, level: 'Early', product: 'Round Lab Dokdo Cleanser', brand: 'Round Lab', desc: 'Pillow-soft cloud-like foam texture aesthetic.' },
      ]
    },
    'Sun Care': {
      ingredient: [
        { keyword: 'rice + probiotics', score: 91, level: 'Actionable', product: 'Beauty of Joseon Relief Sun SPF50+', brand: 'Beauty of Joseon', desc: 'Rice bran + probiotics sunscreen with no white cast and skincare benefits.' },
        { keyword: 'centella SPF', score: 89, level: 'Actionable', product: 'SKIN1004 Madagascar Centella Sun Cream', brand: 'SKIN1004', desc: 'Centella-infused sun cream for soothing UV protection.' },
        { keyword: 'hyaluronic acid sun', score: 87, level: 'Actionable', product: 'Isntree Hyaluronic Acid Watery Sun Gel', brand: 'Isntree', desc: 'HA-infused watery sun gel for hydrating UV protection.' },
        { keyword: 'niacinamide SPF', score: 85, level: 'Actionable', product: 'COSRX Aloe Soothing Sun Cream', brand: 'COSRX', desc: 'Niacinamide brightening sun cream with aloe.' },
        { keyword: 'centella', score: 78, level: 'Growing', product: 'SKIN1004 Hyalu-Cica Water-Fit Sun Serum', brand: 'SKIN1004', desc: 'Watery sun serum with centella and hyaluronic acid.' },
        { keyword: 'aloe vera SPF', score: 76, level: 'Growing', product: 'Benton Aloe Soothing Sun Cream', brand: 'Benton', desc: 'Aloe vera calming sunscreen for sensitive skin.' },
        { keyword: 'green tea extract', score: 74, level: 'Growing', product: 'Innisfree Green Tea Sun Cream', brand: 'Innisfree', desc: 'Antioxidant green tea sunscreen protection.' },
        { keyword: 'propolis UV', score: 72, level: 'Growing', product: "Papa Recipe Blemish Cream SPF", brand: "Papa Recipe", desc: 'Propolis-enriched sunscreen for blemish care.' },
        { keyword: 'MBBT filter', score: 62, level: 'Early', product: 'Isntree Hyaluronic Acid Watery Sun Gel', brand: 'Isntree', desc: 'Next-gen UV filter with hyaluronic acid hydration.' },
        { keyword: 'zinc oxide organic', score: 60, level: 'Early', product: 'Purito Daily Go-To Sunscreen', brand: 'Purito', desc: 'Organic zinc oxide mineral sunscreen.' },
        { keyword: 'mugwort SPF', score: 58, level: 'Early', product: "I'm From Mugwort Sun Cream", brand: "I'm From", desc: 'Mugwort-infused sun cream for calming protection.' },
        { keyword: 'birch sap UV', score: 56, level: 'Early', product: 'Round Lab Birch Juice Sun Cream', brand: 'Round Lab', desc: 'Birch sap moisturizing sunscreen.' },
      ],
      formulas: [
        { keyword: 'sun cream', score: 92, level: 'Actionable', product: 'Beauty of Joseon Relief Sun', brand: 'Beauty of Joseon', desc: 'Lightweight SPF50+ PA++++ sun cream with K-beauty skincare benefits.' },
        { keyword: 'UV gel', score: 90, level: 'Actionable', product: 'Isntree Watery Sun Gel', brand: 'Isntree', desc: 'Water-based gel sunscreen for oily skin types.' },
        { keyword: 'sun milk', score: 88, level: 'Actionable', product: 'Missha Aqua Sun Milk', brand: 'Missha', desc: 'Fluid milky texture sunscreen for easy spreading.' },
        { keyword: 'sun essence', score: 86, level: 'Actionable', product: 'COSRX Shield Fit Sun Essence', brand: 'COSRX', desc: 'Lightweight essence-type sun protection.' },
        { keyword: 'sun serum', score: 77, level: 'Growing', product: 'SKIN1004 Sun Serum', brand: 'SKIN1004', desc: 'Serum-like texture sunscreen for layering under makeup.' },
        { keyword: 'sun spray', score: 75, level: 'Growing', product: 'Etude House Sunprise Sun Spray', brand: 'Etude House', desc: 'Spray-on sunscreen for quick reapplication.' },
        { keyword: 'sun cushion', score: 73, level: 'Growing', product: 'Laneige UV Expert Sun Cushion', brand: 'Laneige', desc: 'Cushion compact sunscreen for on-the-go touch-ups.' },
        { keyword: 'sun primer', score: 71, level: 'Growing', product: 'Missha Layer Blurring Primer SPF', brand: 'Missha', desc: 'SPF primer for makeup base with UV protection.' },
        { keyword: 'sun stick', score: 65, level: 'Early', product: 'Innisfree Daily UV Protection Stick', brand: 'Innisfree', desc: 'Portable sun stick for easy reapplication throughout the day.' },
        { keyword: 'sun balm', score: 62, level: 'Early', product: 'Thank You Farmer Sun Balm', brand: 'Thank You Farmer', desc: 'Balm-type sunscreen for dry skin areas.' },
        { keyword: 'sun ampule', score: 59, level: 'Early', product: 'Nature Republic Sun Ampule', brand: 'Nature Republic', desc: 'Concentrated ampule-type sun protection.' },
        { keyword: 'tinted sunscreen', score: 57, level: 'Early', product: 'Purito Cica Clearing BB Cream SPF', brand: 'Purito', desc: 'Tinted sunscreen for natural coverage with UV block.' },
      ],
      effects: [
        { keyword: 'no white cast', score: 93, level: 'Actionable', product: 'Beauty of Joseon Relief Sun', brand: 'Beauty of Joseon', desc: 'Zero white cast with natural finish on all skin tones.' },
        { keyword: 'makeup-friendly SPF', score: 91, level: 'Actionable', product: 'SKIN1004 Sun Serum', brand: 'SKIN1004', desc: 'Sits perfectly under makeup without pilling.' },
        { keyword: 'moisturizing SPF', score: 89, level: 'Actionable', product: 'Round Lab Birch Sun Cream', brand: 'Round Lab', desc: 'Hydrating sunscreen that replaces moisturizer.' },
        { keyword: 'anti-aging SPF', score: 87, level: 'Actionable', product: 'Sulwhasoo UV Wise Brightening Cream', brand: 'Sulwhasoo', desc: 'Anti-aging benefits combined with SPF50+ protection.' },
        { keyword: 'lightweight SPF', score: 79, level: 'Growing', product: 'SKIN1004 Sun Serum', brand: 'SKIN1004', desc: 'Weightless sun protection that feels like skincare.' },
        { keyword: 'sebum control SPF', score: 77, level: 'Growing', product: 'Innisfree No-Sebum Sun Milk', brand: 'Innisfree', desc: 'Oil-controlling sunscreen for T-zone.' },
        { keyword: 'soothing UV', score: 75, level: 'Growing', product: 'Benton Aloe Sun Cream', brand: 'Benton', desc: 'Calming sunscreen for irritated sensitive skin.' },
        { keyword: 'water-resistant', score: 73, level: 'Growing', product: 'Missha Safe Block SPF50+', brand: 'Missha', desc: 'Water-resistant formula for outdoor activities.' },
        { keyword: 'tone-up', score: 65, level: 'Early', product: 'Missha All Around Safe Block Tone-Up Sun', brand: 'Missha', desc: 'Brightening tone-up effect with SPF50+ protection.' },
        { keyword: 'blue light protection', score: 62, level: 'Early', product: 'COSRX Shield Fit All Green Comfort Sun', brand: 'COSRX', desc: 'Blocks blue light from screens alongside UV protection.' },
        { keyword: 'pore-minimizing SPF', score: 59, level: 'Early', product: 'Etude House Sunprise Mild Airy Finish', brand: 'Etude House', desc: 'Blurs pores while providing sun protection.' },
        { keyword: 'cooling sun', score: 57, level: 'Early', product: 'Nature Republic Ice Puff Sun SPF50+', brand: 'Nature Republic', desc: 'Cooling effect sunscreen for hot weather.' },
      ],
      mood: [
        { keyword: 'skincare-grade SPF', score: 90, level: 'Actionable', product: 'Beauty of Joseon Relief Sun', brand: 'Beauty of Joseon', desc: 'Sunscreen that doubles as skincare treatment.' },
        { keyword: 'everyday essential', score: 88, level: 'Actionable', product: 'SKIN1004 Sun Cream', brand: 'SKIN1004', desc: 'Non-negotiable daily sun protection habit.' },
        { keyword: 'clean sun care', score: 86, level: 'Actionable', product: 'Purito Daily Go-To Sunscreen', brand: 'Purito', desc: 'Clean beauty sun protection with minimal ingredients.' },
        { keyword: 'glass skin SPF', score: 85, level: 'Actionable', product: 'Beauty of Joseon Relief Sun', brand: 'Beauty of Joseon', desc: 'Achieve glass skin look with SPF protection.' },
        { keyword: 'lightweight daily', score: 79, level: 'Growing', product: 'SKIN1004 Sun Serum', brand: 'SKIN1004', desc: 'Everyday sun protection with serum texture.' },
        { keyword: 'outdoor active', score: 76, level: 'Growing', product: 'Missha Safe Block', brand: 'Missha', desc: 'Reliable protection for outdoor activities.' },
        { keyword: 'sensitive sun', score: 73, level: 'Growing', product: 'Benton Aloe Sun Cream', brand: 'Benton', desc: 'Gentle sun protection for reactive skin.' },
        { keyword: 'no-makeup SPF', score: 70, level: 'Growing', product: 'Innisfree Tone Up Sun Cream', brand: 'Innisfree', desc: 'SPF that looks good without additional makeup.' },
        { keyword: 'sunscreen as skincare', score: 67, level: 'Early', product: 'Isntree Hyaluronic Acid Sun Gel', brand: 'Isntree', desc: 'Treating SPF as a skincare step, not just protection.' },
        { keyword: 'reef-safe glow', score: 64, level: 'Early', product: 'Purito Daily Go-To Sunscreen', brand: 'Purito', desc: 'Eco-conscious ocean-safe sun protection.' },
        { keyword: 'SPF layering', score: 61, level: 'Early', product: 'COSRX Aloe Sun Cream', brand: 'COSRX', desc: 'Layering SPF products for maximum UV defense.' },
        { keyword: 'UV-aware lifestyle', score: 58, level: 'Early', product: 'Beauty of Joseon Relief Sun', brand: 'Beauty of Joseon', desc: 'Sun protection as a daily non-negotiable lifestyle.' },
      ]
    },
    Makeup: {
      ingredient: [
        { keyword: 'hyaluronic acid', score: 89, level: 'Actionable', product: 'TIRTIR Mask Fit Red Cushion', brand: 'TIRTIR', desc: 'Full coverage cushion with hyaluronic acid for all-day hydration.' },
        { keyword: 'cica extract', score: 88, level: 'Actionable', product: 'VT Cosmetics Cica Cushion', brand: 'VT Cosmetics', desc: 'Cica-infused cushion for soothing coverage.' },
        { keyword: 'peptide complex', score: 87, level: 'Actionable', product: 'AGE 20s Essence Cushion', brand: 'AGE 20s', desc: 'Peptide-enriched essence cushion for anti-aging makeup.' },
        { keyword: 'snail mucin makeup', score: 86, level: 'Actionable', product: 'Missha M Perfect Cover BB', brand: 'Missha', desc: 'Snail mucin BB cream for coverage + skincare.' },
        { keyword: 'collagen', score: 76, level: 'Growing', product: 'Clio Kill Cover Fixer Cushion', brand: 'Clio', desc: 'Collagen-infused fixing cushion for flawless long-lasting coverage.' },
        { keyword: 'jojoba oil tint', score: 74, level: 'Growing', product: "rom&nd Glasting Melting Balm", brand: "rom&nd", desc: 'Jojoba-enriched lip balm with color payoff.' },
        { keyword: 'rice bran makeup', score: 72, level: 'Growing', product: 'Skinfood Rice Shimmer Powder', brand: 'Skinfood', desc: 'Rice bran extract for natural luminous finish.' },
        { keyword: 'green tea primer', score: 70, level: 'Growing', product: 'Innisfree Green Tea Primer', brand: 'Innisfree', desc: 'Green tea extract for oil-control primer base.' },
        { keyword: 'vitamin E', score: 65, level: 'Early', product: 'Peripera Ink Mood Glowy Tint', brand: 'Peripera', desc: 'Vitamin E enriched lip tint for glossy, nourished lips.' },
        { keyword: 'shea butter lip', score: 62, level: 'Early', product: 'Laneige Lip Sleeping Mask', brand: 'Laneige', desc: 'Shea butter formula for overnight lip treatment.' },
        { keyword: 'bamboo sap', score: 59, level: 'Early', product: 'Nature Republic Bamboo Setting Mist', brand: 'Nature Republic', desc: 'Bamboo sap hydrating setting spray.' },
        { keyword: 'volcanic minerals', score: 57, level: 'Early', product: 'Innisfree Volcanic Primer', brand: 'Innisfree', desc: 'Jeju volcanic minerals for pore-blurring effect.' },
      ],
      formulas: [
        { keyword: 'cushion foundation', score: 93, level: 'Actionable', product: 'TIRTIR Mask Fit Red Cushion', brand: 'TIRTIR', desc: '#1 viral K-beauty cushion with buildable full coverage.' },
        { keyword: 'lip tint', score: 90, level: 'Actionable', product: "rom&nd Juicy Lasting Tint", brand: "rom&nd", desc: 'Glossy, long-lasting lip tint with juicy fruit-inspired shades.' },
        { keyword: 'BB cream', score: 88, level: 'Actionable', product: 'Missha M Perfect Cover BB Cream', brand: 'Missha', desc: 'Classic K-beauty BB cream with SPF and skincare benefits.' },
        { keyword: 'water tint', score: 86, level: 'Actionable', product: 'Peripera Ink Airy Velvet Tint', brand: 'Peripera', desc: 'Lightweight water-based lip tint with velvet finish.' },
        { keyword: 'setting powder', score: 77, level: 'Growing', product: 'Innisfree No-Sebum Mineral Powder', brand: 'Innisfree', desc: 'Cult-favorite oil control powder with Jeju minerals.' },
        { keyword: 'fixing spray', score: 75, level: 'Growing', product: 'Etude House Fix and Fix Setting Spray', brand: 'Etude House', desc: 'Makeup fixing spray for long-wear hold.' },
        { keyword: 'cream blush', score: 73, level: 'Growing', product: "rom&nd See-Through Velouртин", brand: "rom&nd", desc: 'Creamy blush for natural flush of color.' },
        { keyword: 'skin tint', score: 71, level: 'Growing', product: 'Heimish Artless Glow Base', brand: 'Heimish', desc: 'Sheer skin tint for minimal makeup look.' },
        { keyword: 'brow gel', score: 65, level: 'Early', product: 'Etude House Drawing Eye Brow', brand: 'Etude House', desc: 'Natural-looking brow pencil for effortless K-beauty brows.' },
        { keyword: 'lip oil', score: 62, level: 'Early', product: 'Peripera Ink Mood Drop Tint', brand: 'Peripera', desc: 'Oil-based lip tint for hydrating color.' },
        { keyword: 'cushion blush', score: 59, level: 'Early', product: 'TIRTIR Cushion Blusher', brand: 'TIRTIR', desc: 'Cushion-format blush for seamless application.' },
        { keyword: 'gel liner', score: 57, level: 'Early', product: 'Clio Sharp So Simple Liner', brand: 'Clio', desc: 'Ultra-precise gel eyeliner pencil.' },
      ],
      effects: [
        { keyword: 'long-lasting', score: 91, level: 'Actionable', product: 'TIRTIR Mask Fit Red Cushion', brand: 'TIRTIR', desc: '12-hour wear with mask-proof technology.' },
        { keyword: 'dewy finish', score: 88, level: 'Actionable', product: 'Clio Kill Cover Glow Cushion', brand: 'Clio', desc: 'Radiant dewy glow finish for glass skin makeup look.' },
        { keyword: 'full coverage', score: 87, level: 'Actionable', product: 'TIRTIR Mask Fit Black Cushion', brand: 'TIRTIR', desc: 'Maximum coverage for flawless porcelain skin look.' },
        { keyword: 'color payoff', score: 85, level: 'Actionable', product: "rom&nd Juicy Lasting Tint", brand: "rom&nd", desc: 'Vibrant color payoff from first swipe.' },
        { keyword: 'smudge-proof', score: 76, level: 'Growing', product: "rom&nd Juicy Lasting Tint", brand: "rom&nd", desc: 'Transfer-proof lip color that lasts through meals.' },
        { keyword: 'buildable', score: 74, level: 'Growing', product: 'Clio Kill Cover Fixer Cushion', brand: 'Clio', desc: 'Buildable coverage from sheer to full.' },
        { keyword: 'blurring effect', score: 72, level: 'Growing', product: 'Innisfree No-Sebum Blur Primer', brand: 'Innisfree', desc: 'Pore-blurring smooth effect under makeup.' },
        { keyword: 'weightless feel', score: 70, level: 'Growing', product: 'Heimish Artless Glow Base', brand: 'Heimish', desc: 'Feels like bare skin despite full coverage.' },
        { keyword: 'oil control', score: 65, level: 'Early', product: 'Innisfree No-Sebum Powder', brand: 'Innisfree', desc: 'Matte finish that controls oil without drying.' },
        { keyword: 'gradient lip', score: 62, level: 'Early', product: 'Etude House Two-Tone Tint', brand: 'Etude House', desc: 'Creates trendy K-beauty gradient lip in one swipe.' },
        { keyword: 'skin-like finish', score: 59, level: 'Early', product: 'Laneige Neo Cushion Matte', brand: 'Laneige', desc: 'Natural skin-like finish without heavy feel.' },
        { keyword: 'plumping', score: 57, level: 'Early', product: 'Peripera Ink Mood Glowy Tint', brand: 'Peripera', desc: 'Lip plumping effect with glossy shine.' },
      ],
      mood: [
        { keyword: 'K-beauty glow', score: 91, level: 'Actionable', product: 'TIRTIR Red Cushion', brand: 'TIRTIR', desc: 'The viral K-beauty dewy glow look.' },
        { keyword: 'idol makeup', score: 89, level: 'Actionable', product: 'Clio Kill Cover Cushion', brand: 'Clio', desc: 'K-pop idol inspired flawless makeup look.' },
        { keyword: 'douyin aesthetic', score: 87, level: 'Actionable', product: 'Peripera All Take Mood Palette', brand: 'Peripera', desc: 'Chinese social media-inspired makeup trend.' },
        { keyword: 'clean girl', score: 85, level: 'Actionable', product: 'Heimish Artless Glow Base', brand: 'Heimish', desc: 'Minimal clean girl makeup aesthetic.' },
        { keyword: 'juicy lips', score: 78, level: 'Growing', product: "rom&nd Juicy Lasting Tint", brand: "rom&nd", desc: 'Glossy fruit-inspired lip trend.' },
        { keyword: 'no-makeup look', score: 76, level: 'Growing', product: 'Missha M Perfect Cover BB', brand: 'Missha', desc: 'Natural no-makeup makeup look.' },
        { keyword: 'soft girl', score: 74, level: 'Growing', product: 'Etude House Play Color Eyes', brand: 'Etude House', desc: 'Pastel soft girl eye makeup trend.' },
        { keyword: 'glass skin makeup', score: 72, level: 'Growing', product: 'TIRTIR Mask Fit Crystal Cushion', brand: 'TIRTIR', desc: 'Glass skin foundation look.' },
        { keyword: 'natural brows', score: 65, level: 'Early', product: 'Etude House Drawing Eye Brow', brand: 'Etude House', desc: 'Soft, natural Korean brow look.' },
        { keyword: 'monolid glam', score: 62, level: 'Early', product: 'Clio Pro Eye Palette', brand: 'Clio', desc: 'Eye looks designed for monolid eyes.' },
        { keyword: 'K-drama lip', score: 59, level: 'Early', product: "rom&nd Zero Velvet Tint", brand: "rom&nd", desc: 'K-drama actress-inspired lip colors.' },
        { keyword: 'fresh campus', score: 57, level: 'Early', product: 'Peripera Ink Mood Drop', brand: 'Peripera', desc: 'Fresh youthful campus makeup style.' },
      ]
    },
    'Hair Care': {
      ingredient: [
        { keyword: 'keratin', score: 88, level: 'Actionable', product: 'Mise en Scene Perfect Serum', brand: 'Mise en Scene', desc: 'Argan oil + keratin damaged hair repair serum.' },
        { keyword: 'camellia oil', score: 87, level: 'Actionable', product: 'Amore Pacific Camellia Essential Hair Oil', brand: 'Amore Pacific', desc: 'Traditional camellia oil for silky Korean hair.' },
        { keyword: 'protein complex', score: 86, level: 'Actionable', product: 'Moremo Water Treatment Miracle 10', brand: 'Moremo', desc: 'Multi-protein complex for instant hair repair in 10 seconds.' },
        { keyword: 'silk amino acids', score: 85, level: 'Actionable', product: 'Lador Perfect Hair Fill-Up', brand: 'Lador', desc: 'Silk amino acid filler for damaged porous hair.' },
        { keyword: 'argan oil', score: 76, level: 'Growing', product: 'Mise en Scene Perfect Repair Hair Mask', brand: 'Mise en Scene', desc: 'Intensive repair mask with argan oil and amino acids.' },
        { keyword: 'tea tree scalp', score: 74, level: 'Growing', product: 'Aromatica Tea Tree Scalp Shampoo', brand: 'Aromatica', desc: 'Tea tree oil for refreshing scalp cleanse.' },
        { keyword: 'collagen hair', score: 72, level: 'Growing', product: 'Lador Hydro LPP Treatment', brand: 'Lador', desc: 'Collagen protein treatment for elasticity.' },
        { keyword: 'ginseng extract', score: 70, level: 'Growing', product: 'Ryo Jayangyunmo Shampoo', brand: 'Ryo', desc: 'Ginseng root extract for hair loss prevention.' },
        { keyword: 'biotin', score: 65, level: 'Early', product: 'Dr. ForHair Folligen Shampoo', brand: 'Dr. ForHair', desc: 'Biotin-enriched scalp care shampoo for thinning hair.' },
        { keyword: 'caffeine scalp', score: 62, level: 'Early', product: 'Mise en Scene Scalp Care Shampoo', brand: 'Mise en Scene', desc: 'Caffeine-infused shampoo for stimulating scalp.' },
        { keyword: 'black bean extract', score: 59, level: 'Early', product: 'Ryo Super Revital Shampoo', brand: 'Ryo', desc: 'Black bean extract for strengthening hair roots.' },
        { keyword: 'cica scalp', score: 57, level: 'Early', product: 'Dr. ForHair Cica Scalp Shampoo', brand: 'Dr. ForHair', desc: 'Centella for calming irritated scalp.' },
      ],
      formulas: [
        { keyword: 'hair serum', score: 89, level: 'Actionable', product: 'Mise en Scene Perfect Serum', brand: 'Mise en Scene', desc: 'Lightweight hair serum for shine and frizz control.' },
        { keyword: 'hair treatment', score: 88, level: 'Actionable', product: 'Moremo Water Treatment Miracle 10', brand: 'Moremo', desc: '10-second miracle treatment for instant repair.' },
        { keyword: 'hair oil', score: 87, level: 'Actionable', product: 'Amore Pacific Camellia Hair Oil', brand: 'Amore Pacific', desc: 'Lightweight oil for shine without greasiness.' },
        { keyword: 'scalp shampoo', score: 86, level: 'Actionable', product: 'Ryo Jayangyunmo Anti Hair Loss Shampoo', brand: 'Ryo', desc: 'Medicinal herbal shampoo for scalp and hair health.' },
        { keyword: 'hair mask', score: 77, level: 'Growing', product: 'Mise en Scene Perfect Repair Mask', brand: 'Mise en Scene', desc: 'Deep conditioning treatment for damaged hair.' },
        { keyword: 'leave-in conditioner', score: 75, level: 'Growing', product: 'Lador Perfect Hair Fill-Up', brand: 'Lador', desc: 'Leave-in protein filler for daily use.' },
        { keyword: 'hair ampoule', score: 73, level: 'Growing', product: 'Moremo Ampoule Water Treatment', brand: 'Moremo', desc: 'Concentrated hair repair in ampoule format.' },
        { keyword: 'dry shampoo', score: 71, level: 'Growing', product: 'Mise en Scene Dry Shampoo', brand: 'Mise en Scene', desc: 'Powder-type dry shampoo for refresh without washing.' },
        { keyword: 'scalp tonic', score: 65, level: 'Early', product: 'Dr. ForHair Head Scaling Shampoo', brand: 'Dr. ForHair', desc: 'Scalp exfoliating shampoo for healthy hair growth.' },
        { keyword: 'hair sleeping pack', score: 62, level: 'Early', product: 'Laneige Hair Sleeping Pack', brand: 'Laneige', desc: 'Overnight hair treatment for deep repair.' },
        { keyword: 'scalp scrub', score: 59, level: 'Early', product: 'Aromatica Rosemary Scalp Scrub', brand: 'Aromatica', desc: 'Physical exfoliation for scalp buildup.' },
        { keyword: 'hair mist', score: 57, level: 'Early', product: 'Mise en Scene Perfect Serum Mist', brand: 'Mise en Scene', desc: 'Lightweight hair mist for quick hydration.' },
      ],
      effects: [
        { keyword: 'damage repair', score: 93, level: 'Actionable', product: 'Mise en Scene Perfect Serum', brand: 'Mise en Scene', desc: 'Repairs heat and chemical damaged hair instantly.' },
        { keyword: 'instant shine', score: 90, level: 'Actionable', product: 'Moremo Water Treatment', brand: 'Moremo', desc: 'Instant glossy shine in just 10 seconds.' },
        { keyword: 'split end repair', score: 88, level: 'Actionable', product: 'Lador Perfect Hair Fill-Up', brand: 'Lador', desc: 'Fills and seals split ends for smoother tips.' },
        { keyword: 'hair strengthening', score: 86, level: 'Actionable', product: 'Ryo Jayangyunmo Shampoo', brand: 'Ryo', desc: 'Strengthens hair from root to tip.' },
        { keyword: 'frizz control', score: 75, level: 'Growing', product: 'Mise en Scene Perfect Repair Mask', brand: 'Mise en Scene', desc: 'Smooths and tames frizzy hair for sleek finish.' },
        { keyword: 'heat protection', score: 73, level: 'Growing', product: 'Mise en Scene Perfect Serum Rose Edition', brand: 'Mise en Scene', desc: 'Protects hair from heat styling damage.' },
        { keyword: 'volume boost', score: 71, level: 'Growing', product: 'Ryo Root:Gen Shampoo', brand: 'Ryo', desc: 'Adds volume and body to flat limp hair.' },
        { keyword: 'color protection', score: 70, level: 'Growing', product: 'Lador Hydro LPP Treatment', brand: 'Lador', desc: 'Preserves hair color vibrancy after dyeing.' },
        { keyword: 'scalp care', score: 65, level: 'Early', product: 'Dr. ForHair Folligen Shampoo', brand: 'Dr. ForHair', desc: 'Promotes scalp health and reduces hair loss.' },
        { keyword: 'anti-hair loss', score: 62, level: 'Early', product: 'Ryo Anti Hair Loss Shampoo', brand: 'Ryo', desc: 'Reduces hair fall and promotes growth.' },
        { keyword: 'curl definition', score: 59, level: 'Early', product: 'Mise en Scene Curl Serum', brand: 'Mise en Scene', desc: 'Defines and holds curly hair patterns.' },
        { keyword: 'overnight repair', score: 57, level: 'Early', product: 'Laneige Hair Sleeping Pack', brand: 'Laneige', desc: 'Deep overnight repair while sleeping.' },
      ],
      mood: [
        { keyword: 'salon finish', score: 93, level: 'Actionable', product: 'Mise en Scene Perfect Serum', brand: 'Mise en Scene', desc: 'Professional salon-quality hair at home.' },
        { keyword: 'glass hair', score: 90, level: 'Actionable', product: 'Moremo Water Treatment', brand: 'Moremo', desc: 'Ultra-shiny glass-like hair trend.' },
        { keyword: 'K-drama hair', score: 88, level: 'Actionable', product: 'Amore Pacific Camellia Oil', brand: 'Amore Pacific', desc: 'Silky flowing hair like K-drama actresses.' },
        { keyword: '10-second miracle', score: 86, level: 'Actionable', product: 'Moremo Water Treatment Miracle 10', brand: 'Moremo', desc: 'Viral 10-second hair transformation trend.' },
        { keyword: 'healthy scalp', score: 79, level: 'Growing', product: 'Dr. ForHair Folligen Shampoo', brand: 'Dr. ForHair', desc: 'Scalp-first approach to hair health.' },
        { keyword: 'hair wellness', score: 76, level: 'Growing', product: 'Ryo Jayangyunmo Shampoo', brand: 'Ryo', desc: 'Holistic hair wellness with herbal ingredients.' },
        { keyword: 'effortless waves', score: 73, level: 'Growing', product: 'Mise en Scene Curl Cream', brand: 'Mise en Scene', desc: 'Natural effortless wave styling.' },
        { keyword: 'scalp detox', score: 70, level: 'Growing', product: 'Aromatica Rosemary Scalp Scrub', brand: 'Aromatica', desc: 'Deep cleansing scalp detoxification.' },
        { keyword: 'hair slugging', score: 67, level: 'Early', product: 'Lador Perfect Hair Fill-Up', brand: 'Lador', desc: 'Heavy oil/mask overnight for intensive repair trend.' },
        { keyword: 'scalp skincare', score: 64, level: 'Early', product: 'Dr. ForHair Head Scaling Shampoo', brand: 'Dr. ForHair', desc: 'Treating scalp like face - exfoliate, hydrate, protect.' },
        { keyword: 'air-dry styling', score: 61, level: 'Early', product: 'Mise en Scene Perfect Serum Mist', brand: 'Mise en Scene', desc: 'Heat-free natural drying with product styling.' },
        { keyword: 'protein treatment', score: 58, level: 'Early', product: 'Lador Hydro LPP Treatment', brand: 'Lador', desc: 'At-home protein bond repair treatment trend.' },
      ]
    },
    'Body Care': {
      ingredient: [
        { keyword: 'ceramides', score: 92, level: 'Actionable', product: 'Illiyoon Ceramide Ato Lotion', brand: 'Illiyoon', desc: 'Ceramide body lotion for sensitive, dry skin barrier care.' },
        { keyword: 'shea butter', score: 89, level: 'Actionable', product: 'Amore Pacific Body Cream', brand: 'Amore Pacific', desc: 'Rich shea butter body cream for deep nourishment.' },
        { keyword: 'hyaluronic acid body', score: 87, level: 'Actionable', product: 'Round Lab Dokdo Body Lotion', brand: 'Round Lab', desc: 'HA-infused body lotion for lightweight hydration.' },
        { keyword: 'green tea body', score: 85, level: 'Actionable', product: 'Innisfree Green Tea Body Lotion', brand: 'Innisfree', desc: 'Antioxidant green tea body moisture care.' },
        { keyword: 'centella', score: 74, level: 'Growing', product: 'Round Lab Soybean Nourishing Body Lotion', brand: 'Round Lab', desc: 'Soybean + centella body lotion for daily nourishment.' },
        { keyword: 'soybean extract', score: 73, level: 'Growing', product: 'Round Lab Soybean Body Wash', brand: 'Round Lab', desc: 'Gentle soybean-based body cleansing.' },
        { keyword: 'aloe vera body', score: 72, level: 'Growing', product: 'Nature Republic Aloe Vera Body Gel', brand: 'Nature Republic', desc: 'Cooling aloe vera gel for body soothing.' },
        { keyword: 'snail body', score: 71, level: 'Growing', product: 'Mizon Snail Body Cream', brand: 'Mizon', desc: 'Snail mucin enriched body cream for repair.' },
        { keyword: 'niacinamide', score: 65, level: 'Early', product: 'Amore Pacific Body Brightening Cream', brand: 'Amore Pacific', desc: 'Niacinamide body cream for even skin tone.' },
        { keyword: 'AHA body', score: 62, level: 'Early', product: 'COSRX AHA Body Lotion', brand: 'COSRX', desc: 'AHA exfoliating body lotion for keratosis.' },
        { keyword: 'rice bran body', score: 59, level: 'Early', product: 'Skinfood Rice Body Wash', brand: 'Skinfood', desc: 'Rice bran gentle body wash for brightening.' },
        { keyword: 'collagen body', score: 57, level: 'Early', product: 'Etude House Collagen Body Cream', brand: 'Etude House', desc: 'Collagen-enriched body cream for firmness.' },
      ],
      formulas: [
        { keyword: 'body lotion', score: 93, level: 'Actionable', product: 'Illiyoon Ceramide Ato Lotion', brand: 'Illiyoon', desc: 'Lightweight ceramide lotion for full body hydration.' },
        { keyword: 'body oil', score: 90, level: 'Actionable', product: 'Amore Pacific Body Oil', brand: 'Amore Pacific', desc: 'Luxurious body oil for deep moisture sealing.' },
        { keyword: 'body wash', score: 88, level: 'Actionable', product: 'Round Lab Dokdo Body Wash', brand: 'Round Lab', desc: 'Low-pH gentle body wash for daily cleansing.' },
        { keyword: 'body butter', score: 86, level: 'Actionable', product: 'Innisfree Olive Real Body Butter', brand: 'Innisfree', desc: 'Rich body butter for intensive moisture.' },
        { keyword: 'body cream', score: 75, level: 'Growing', product: 'Round Lab Body Lotion', brand: 'Round Lab', desc: 'Rich nourishing cream for dry winter skin.' },
        { keyword: 'body serum', score: 73, level: 'Growing', product: 'COSRX AHA Body Serum', brand: 'COSRX', desc: 'Body-specific serum for texture improvement.' },
        { keyword: 'shower gel', score: 72, level: 'Growing', product: 'Illiyoon Fresh Moisture Body Wash', brand: 'Illiyoon', desc: 'Hydrating shower gel for sensitive skin.' },
        { keyword: 'body scrub', score: 71, level: 'Growing', product: 'Skinfood Sugar Body Scrub', brand: 'Skinfood', desc: 'Sugar-based exfoliating body scrub.' },
        { keyword: 'body mist', score: 65, level: 'Early', product: 'Innisfree Green Tea Body Mist', brand: 'Innisfree', desc: 'Refreshing green tea scented body mist.' },
        { keyword: 'body sleeping pack', score: 62, level: 'Early', product: 'Laneige Body Sleeping Pack', brand: 'Laneige', desc: 'Overnight intensive body moisture treatment.' },
        { keyword: 'foot cream', score: 59, level: 'Early', product: 'Etude House Bebe Foot Mask', brand: 'Etude House', desc: 'Intensive foot care treatment.' },
        { keyword: 'hand cream', score: 57, level: 'Early', product: 'Innisfree Jeju Life Hand Cream', brand: 'Innisfree', desc: 'Moisturizing hand cream with Jeju botanicals.' },
      ],
      effects: [
        { keyword: 'barrier repair', score: 93, level: 'Actionable', product: 'Illiyoon Ceramide Ato Lotion', brand: 'Illiyoon', desc: 'Repairs and protects body skin barrier.' },
        { keyword: 'deep hydration', score: 90, level: 'Actionable', product: 'Amore Pacific Body Cream', brand: 'Amore Pacific', desc: '72-hour deep hydration for body skin.' },
        { keyword: 'soothing', score: 88, level: 'Actionable', product: 'Nature Republic Aloe Body Gel', brand: 'Nature Republic', desc: 'Instant soothing and cooling for irritated skin.' },
        { keyword: 'skin softening', score: 86, level: 'Actionable', product: 'Round Lab Body Lotion', brand: 'Round Lab', desc: 'Softens rough dry body skin patches.' },
        { keyword: 'moisturizing', score: 74, level: 'Growing', product: 'Round Lab Body Lotion', brand: 'Round Lab', desc: 'Deep moisturizing for all-day hydration.' },
        { keyword: 'exfoliation', score: 73, level: 'Growing', product: 'COSRX AHA Body Lotion', brand: 'COSRX', desc: 'Chemical exfoliation for smoother body skin.' },
        { keyword: 'anti-stretch marks', score: 72, level: 'Growing', product: 'Amore Pacific Body Firming Cream', brand: 'Amore Pacific', desc: 'Reduces appearance of stretch marks.' },
        { keyword: 'itch relief', score: 71, level: 'Growing', product: 'Illiyoon Ceramide Ato Cream', brand: 'Illiyoon', desc: 'Relieves dry skin itchiness and discomfort.' },
        { keyword: 'brightening', score: 65, level: 'Early', product: 'Amore Pacific Body Cream', brand: 'Amore Pacific', desc: 'Brightening effect for even body skin tone.' },
        { keyword: 'firming', score: 62, level: 'Early', product: 'Innisfree Body Firming Lotion', brand: 'Innisfree', desc: 'Firming and tightening for body contours.' },
        { keyword: 'keratosis care', score: 59, level: 'Early', product: 'COSRX AHA Body Lotion', brand: 'COSRX', desc: 'Improves keratosis pilaris bumpy skin texture.' },
        { keyword: 'after-sun care', score: 57, level: 'Early', product: 'Nature Republic Aloe After Sun Gel', brand: 'Nature Republic', desc: 'Post-sun exposure skin recovery.' },
      ],
      mood: [
        { keyword: 'sensitive skin safe', score: 92, level: 'Actionable', product: 'Illiyoon Ceramide Ato Lotion', brand: 'Illiyoon', desc: 'Dermatologist-tested for sensitive skin.' },
        { keyword: 'self-care ritual', score: 89, level: 'Actionable', product: 'Amore Pacific Body Oil', brand: 'Amore Pacific', desc: 'Luxurious body care self-pampering routine.' },
        { keyword: 'baby-soft skin', score: 87, level: 'Actionable', product: 'Round Lab Body Lotion', brand: 'Round Lab', desc: 'Achieve baby-soft touchable body skin.' },
        { keyword: 'spa at home', score: 85, level: 'Actionable', product: 'Skinfood Sugar Body Scrub', brand: 'Skinfood', desc: 'Spa-like body care experience at home.' },
        { keyword: 'body skincare routine', score: 79, level: 'Growing', product: 'COSRX AHA Body Lotion', brand: 'COSRX', desc: 'Extending facial skincare steps to body care.' },
        { keyword: 'winter moisture', score: 76, level: 'Growing', product: 'Illiyoon Ceramide Ato Cream', brand: 'Illiyoon', desc: 'Intensive winter body moisture protection.' },
        { keyword: 'summer fresh', score: 73, level: 'Growing', product: 'Nature Republic Aloe Body Gel', brand: 'Nature Republic', desc: 'Cooling refreshing summer body care.' },
        { keyword: 'natural scent', score: 70, level: 'Growing', product: 'Innisfree Green Tea Body Mist', brand: 'Innisfree', desc: 'Natural Jeju-inspired fragrance for everyday.' },
        { keyword: 'body slugging', score: 67, level: 'Early', product: 'Illiyoon Ceramide Ato Cream', brand: 'Illiyoon', desc: 'Occlusive body layer for overnight intensive moisture.' },
        { keyword: 'eco-friendly', score: 64, level: 'Early', product: 'Aromatica Natural Body Wash', brand: 'Aromatica', desc: 'Eco-conscious sustainable body care.' },
        { keyword: 'shower routine', score: 61, level: 'Early', product: 'Round Lab Dokdo Body Wash', brand: 'Round Lab', desc: 'Multi-step shower routine for full body glow.' },
        { keyword: 'after-gym care', score: 58, level: 'Early', product: 'Innisfree Green Tea Body Lotion', brand: 'Innisfree', desc: 'Quick body hydration post-workout.' },
      ]
    },
    'Mens Care': {
      ingredient: [
        { keyword: 'niacinamide', score: 92, level: 'Actionable', product: 'Laneige Homme Blue Energy Essence', brand: 'Laneige', desc: 'Niacinamide essence for men to brighten and hydrate.' },
        { keyword: 'hyaluronic acid men', score: 89, level: 'Actionable', product: 'COSRX Hyaluronic Acid Moisturizer', brand: 'COSRX', desc: 'HA hydrating moisturizer for men.' },
        { keyword: 'BHA salicylic', score: 87, level: 'Actionable', product: 'Some By Mi AHA BHA PHA for Men', brand: 'Some By Mi', desc: 'BHA for men with acne-prone oily skin.' },
        { keyword: 'ceramide men', score: 85, level: 'Actionable', product: 'Dr. Jart+ Ceramidin for Men', brand: 'Dr. Jart+', desc: 'Ceramide barrier repair for male skin.' },
        { keyword: 'centella', score: 73, level: 'Growing', product: 'Dr. Jart+ Cicapair for Men', brand: 'Dr. Jart+', desc: 'Centella-based soothing cream for post-shave care.' },
        { keyword: 'tea tree men', score: 72, level: 'Growing', product: 'Innisfree Forest for Men Tea Tree', brand: 'Innisfree', desc: 'Tea tree oil for men with breakout-prone skin.' },
        { keyword: 'snail men', score: 71, level: 'Growing', product: 'Mizon All-In-One Snail Cream', brand: 'Mizon', desc: 'Snail mucin repair cream for men.' },
        { keyword: 'bamboo charcoal', score: 70, level: 'Growing', product: 'Innisfree Volcanic Pore Men Cleanser', brand: 'Innisfree', desc: 'Bamboo charcoal for deep pore cleansing.' },
        { keyword: 'charcoal', score: 65, level: 'Early', product: 'Innisfree Forest for Men Cleanser', brand: 'Innisfree', desc: 'Charcoal deep cleanser for oily male skin.' },
        { keyword: 'green tea men', score: 62, level: 'Early', product: 'Innisfree Green Tea Seed for Men', brand: 'Innisfree', desc: 'Green tea antioxidant for men\'s skin.' },
        { keyword: 'propolis men', score: 59, level: 'Early', product: "Papa Recipe Men's Propolis Cream", brand: 'Papa Recipe', desc: 'Propolis healing cream for men.' },
        { keyword: 'vitamin C men', score: 57, level: 'Early', product: 'Missha Vita C Plus for Men', brand: 'Missha', desc: 'Vitamin C brightening for dull male skin.' },
      ],
      formulas: [
        { keyword: 'all-in-one', score: 93, level: 'Actionable', product: 'Laneige Homme Blue Energy All-in-One', brand: 'Laneige', desc: 'Multi-step care in one product for busy men.' },
        { keyword: 'foam cleanser men', score: 90, level: 'Actionable', product: 'Innisfree Forest for Men Cleanser', brand: 'Innisfree', desc: 'Deep cleansing foam for men\'s oily skin.' },
        { keyword: 'toner pad men', score: 88, level: 'Actionable', product: 'COSRX One Step Clear Pad', brand: 'COSRX', desc: 'Convenient toner pads for quick men\'s routine.' },
        { keyword: 'essence men', score: 86, level: 'Actionable', product: 'Laneige Homme Blue Energy Essence', brand: 'Laneige', desc: 'Lightweight essence for men\'s hydration.' },
        { keyword: 'gel moisturizer', score: 74, level: 'Growing', product: 'Innisfree Forest for Men Moisture Cream', brand: 'Innisfree', desc: 'Lightweight gel cream that absorbs quickly.' },
        { keyword: 'aftershave balm', score: 73, level: 'Growing', product: 'Dr. Jart+ After Shave Balm', brand: 'Dr. Jart+', desc: 'Soothing balm for post-shave irritation.' },
        { keyword: 'men sunscreen', score: 72, level: 'Growing', product: 'Missha Sun Gel for Men', brand: 'Missha', desc: 'Non-greasy sunscreen formulated for men.' },
        { keyword: 'eye cream men', score: 71, level: 'Growing', product: 'Laneige Homme Eye Cream', brand: 'Laneige', desc: 'Anti-fatigue eye cream for men.' },
        { keyword: 'sun stick', score: 65, level: 'Early', product: 'Missha All Around Safe Block Sun Stick', brand: 'Missha', desc: 'Convenient sun stick for on-the-go reapplication.' },
        { keyword: 'clay mask men', score: 62, level: 'Early', product: 'Innisfree Volcanic Pore Mask', brand: 'Innisfree', desc: 'Volcanic clay mask for men\'s pore care.' },
        { keyword: 'body wash men', score: 59, level: 'Early', product: 'Innisfree Forest for Men Body Wash', brand: 'Innisfree', desc: 'Forest-scented men\'s body wash.' },
        { keyword: 'lip balm men', score: 57, level: 'Early', product: 'Laneige Homme Lip Balm', brand: 'Laneige', desc: 'Moisturizing lip balm for dry male lips.' },
      ],
      effects: [
        { keyword: 'oil control', score: 93, level: 'Actionable', product: 'Innisfree Forest for Men Oil Control', brand: 'Innisfree', desc: 'Controls excess sebum for matte, fresh look.' },
        { keyword: 'anti-fatigue', score: 90, level: 'Actionable', product: 'Laneige Homme Blue Energy Essence', brand: 'Laneige', desc: 'Energizes tired-looking male skin.' },
        { keyword: 'acne control', score: 88, level: 'Actionable', product: 'Some By Mi Men Cleanser', brand: 'Some By Mi', desc: 'Controls breakouts on men\'s acne-prone skin.' },
        { keyword: 'hydrating men', score: 86, level: 'Actionable', product: 'COSRX Hyaluronic Acid Moisturizer', brand: 'COSRX', desc: 'Lightweight hydration for men\'s dehydrated skin.' },
        { keyword: 'post-shave soothing', score: 73, level: 'Growing', product: 'Dr. Jart+ Cicapair for Men', brand: 'Dr. Jart+', desc: 'Calms irritation and redness after shaving.' },
        { keyword: 'dark circles', score: 72, level: 'Growing', product: 'Laneige Homme Eye Cream', brand: 'Laneige', desc: 'Reduces dark circles from late nights.' },
        { keyword: 'pore tightening', score: 71, level: 'Growing', product: 'Innisfree Volcanic Pore Toner', brand: 'Innisfree', desc: 'Tightens enlarged pores on T-zone.' },
        { keyword: 'anti-aging men', score: 70, level: 'Growing', product: 'Sulwhasoo Men Concentrated Cream', brand: 'Sulwhasoo', desc: 'Premium anti-aging for mature men\'s skin.' },
        { keyword: 'pore care', score: 65, level: 'Early', product: 'COSRX One Step Pimple Clear Pad', brand: 'COSRX', desc: 'Exfoliating pads for men\'s pore care routine.' },
        { keyword: 'razor bump care', score: 62, level: 'Early', product: 'Dr. Jart+ Cicapair Cream', brand: 'Dr. Jart+', desc: 'Reduces razor bumps and ingrown hairs.' },
        { keyword: 'brightening men', score: 59, level: 'Early', product: 'Missha Vita C for Men', brand: 'Missha', desc: 'Brightening dull tired-looking male skin.' },
        { keyword: 'blackhead men', score: 57, level: 'Early', product: 'Some By Mi Blackhead Bubble Cleanser', brand: 'Some By Mi', desc: 'Removes blackheads from nose and T-zone.' },
      ],
      mood: [
        { keyword: 'simple routine', score: 92, level: 'Actionable', product: 'Laneige Homme All-in-One', brand: 'Laneige', desc: 'Efficient single-step routine for modern men.' },
        { keyword: 'gym-ready skin', score: 89, level: 'Actionable', product: 'Innisfree Forest for Men', brand: 'Innisfree', desc: 'Quick skincare before and after workouts.' },
        { keyword: 'confident grooming', score: 87, level: 'Actionable', product: 'Dr. Jart+ for Men', brand: 'Dr. Jart+', desc: 'Grooming that boosts confidence.' },
        { keyword: 'dad skincare', score: 85, level: 'Actionable', product: 'COSRX Starter Kit', brand: 'COSRX', desc: 'Easy beginner skincare for new-to-skincare dads.' },
        { keyword: 'minimal design', score: 79, level: 'Growing', product: 'Innisfree Forest for Men', brand: 'Innisfree', desc: 'Clean minimal packaging for men\'s grooming.' },
        { keyword: 'power clean', score: 76, level: 'Growing', product: 'Some By Mi AHA BHA PHA Cleanser', brand: 'Some By Mi', desc: 'Powerful cleansing for active men.' },
        { keyword: 'post-workout glow', score: 73, level: 'Growing', product: 'COSRX Hyaluronic Acid Moisturizer', brand: 'COSRX', desc: 'Quick hydration after intense workouts.' },
        { keyword: 'no-fuss SPF', score: 70, level: 'Growing', product: 'Missha Sun Gel for Men', brand: 'Missha', desc: 'Effortless daily sun protection for men.' },
        { keyword: 'K-groom', score: 67, level: 'Early', product: 'Laneige Homme Blue Energy', brand: 'Laneige', desc: 'Korean grooming standards for global men.' },
        { keyword: 'smart skincare', score: 64, level: 'Early', product: 'COSRX One Step Clear Pad', brand: 'COSRX', desc: 'Smart efficient skincare for busy professionals.' },
        { keyword: 'boyfriend skin', score: 61, level: 'Early', product: 'Innisfree Forest for Men Moisture', brand: 'Innisfree', desc: 'Healthy natural skin look for men on social media.' },
        { keyword: 'halal grooming', score: 58, level: 'Early', product: 'Kahf Face Wash', brand: 'Kahf', desc: 'Halal-certified grooming for Muslim men.' },
      ]
    }
  }
};

// 나라별 키워드 순위 차별화 - 각 나라마다 다른 인기 키워드 순서
// scoreBoost: 특정 키워드에 추가 점수를 부여하여 순위를 바꿈
// 카테고리별로 나라마다 다른 키워드 부스트 적용
const countryKeywordBoosts = {
  japan: {
    Skincare: {
      'rice extract': 20, 'hyaluronic acid': 15, 'ceramides': 12,
      'sheet mask': 18, 'essence': 10, 'soothing': 15,
      'brightening': 8, 'dewy glow': 12, 'glass skin aesthetic': 10,
      'PDRN': 5, 'heartleaf': -10, 'snail mucin': -15, 'peptides': -8,
      'butter skin': -15, 'skin flooding': -10,
    },
    Cleansing: {
      'amino acids': 15, 'rice water': 12, 'micellar cleanser': 10,
      'gentle foam': 18, 'low pH': -5, 'salicylic acid': -10,
    },
    'Sun Care': {
      'UV gel': 15, 'sun milk': 18, 'centella SPF': -8,
      'no white cast': 10, 'makeup-friendly SPF': 15,
      'rice + probiotics': -5, 'sun stick': -8,
    },
    Makeup: {
      'BB cream': 18, 'dewy finish': 15, 'skin tint': 12,
      'hyaluronic acid': -8, 'cushion foundation': -5, 'full coverage': -10,
    },
    'Hair Care': {
      'camellia oil': 20, 'silk amino acids': 15, 'instant shine': 12,
      'keratin': -10, 'protein complex': -5, 'ginseng extract': -8,
    },
    'Body Care': {
      'hyaluronic acid body': 15, 'green tea body': 12, 'body oil': 10,
      'ceramides': -10, 'shea butter': -8,
    },
    'Mens Care': {
      'hyaluronic acid men': 12, 'ceramide men': 10, 'essence men': 8,
      'niacinamide': -10, 'BHA salicylic': -8,
    },
  },
  singapore: {
    Skincare: {
      'centella asiatica': 12, 'hyaluronic acid': 10, 'niacinamide': 8,
      'heartleaf': 8, 'PDRN': 5, 'serum': 8, 'soothing': 10,
      'hydrating': 12, 'barrier repair': 5, 'skin flooding': 5,
      'snail mucin': -12, 'rice extract': -8, 'butter skin': -10,
    },
    Cleansing: {
      'tea tree': 15, 'salicylic acid': 12, 'oil control cleanser': 18,
      'low pH': -8, 'amino acids': -5,
    },
    'Sun Care': {
      'centella SPF': 15, 'niacinamide SPF': 12, 'hyaluronic acid sun': 10,
      'lightweight SPF': 18, 'sebum control SPF': 12,
      'rice + probiotics': -10, 'sun balm': -10,
    },
    Makeup: {
      'cica extract': 15, 'peptide complex': 12, 'long-lasting': 10,
      'hyaluronic acid': -10, 'snail mucin makeup': -8,
    },
    'Hair Care': {
      'frizz control': 20, 'heat protection': 12, 'hair serum': 10,
      'keratin': -5, 'volume boost': -10, 'camellia oil': -8,
    },
    'Body Care': {
      'aloe vera body': 15, 'green tea body': 12, 'hyaluronic acid body': 10,
      'ceramides': -10, 'shea butter': -8, 'body oil': -12,
    },
    'Mens Care': {
      'BHA salicylic': 12, 'hyaluronic acid men': 8, 'oil control': 10,
      'niacinamide': -8, 'ceramide men': -5,
    },
  },
  malaysia: {
    Skincare: {
      'niacinamide': 18, 'ceramides': 15, 'centella asiatica': 12,
      'heartleaf': 5, 'brightening': 20, 'gel cream': 10,
      'skinimalism': 8, 'glazed donut skin': 5,
      'snail mucin': -12, 'PDRN': -10, 'propolis': -8, 'exosomes': -10,
      'butter skin': -12,
    },
    Cleansing: {
      'niacinamide cleanser': 18, 'centella cleanser': 15, 'brightening cleanse': 12,
      'low pH': -8, 'amino acids': -5,
    },
    'Sun Care': {
      'niacinamide SPF': 15, 'centella SPF': 12, 'hyaluronic acid sun': 10,
      'no white cast': 15, 'sebum control SPF': 18,
      'rice + probiotics': -10,
    },
    Makeup: {
      'peptide complex': 15, 'cica extract': 12, 'snail mucin makeup': 10,
      'hyaluronic acid': -5, 'cushion foundation': 8,
    },
    'Hair Care': {
      'frizz control': 15, 'damage repair': 12, 'hair treatment': 10,
      'keratin': -5, 'camellia oil': -8, 'volume boost': -10,
    },
    'Body Care': {
      'shea butter': 10, 'hyaluronic acid body': 8, 'green tea body': 5,
      'ceramides': -8, 'body oil': -10,
    },
    'Mens Care': {
      'BHA salicylic': 10, 'ceramide men': 8, 'hyaluronic acid men': 5,
      'niacinamide': -5,
    },
  },
  indonesia: {
    Skincare: {
      'ceramides': 22, 'niacinamide': 18, 'centella asiatica': 15,
      'barrier repair': 15, 'gel cream': 15, 'heartleaf': 5,
      'skinimalism': 8, 'glazed donut skin': 8,
      'snail mucin': -10, 'peptides': -12, 'PDRN': -15, 'exosomes': -10,
      'butter skin': -15, 'rice extract': -8,
    },
    Cleansing: {
      'centella cleanser': 18, 'tea tree': 15, 'salicylic acid': 12,
      'low pH': -10, 'amino acids': -8,
    },
    'Sun Care': {
      'centella SPF': 15, 'niacinamide SPF': 12, 'hyaluronic acid sun': 10,
      'rice + probiotics': -10, 'sun balm': -10,
    },
    Makeup: {
      'cica extract': 10, 'snail mucin makeup': 8, 'peptide complex': 5,
      'hyaluronic acid': -8,
    },
    'Hair Care': {
      'protein complex': 15, 'damage repair': 12, 'hair treatment': 10,
      'camellia oil': -10, 'silk amino acids': -5, 'keratin': -8,
    },
    'Body Care': {
      'green tea body': 12, 'hyaluronic acid body': 10, 'aloe vera body': 8,
      'ceramides': -8, 'shea butter': -10, 'body oil': -12,
    },
    'Mens Care': {
      'BHA salicylic': 15, 'ceramide men': 12, 'hyaluronic acid men': 10,
      'niacinamide': -8,
    },
  }
};

// 나라별 추가 고유 키워드 (해당 나라에서만 나타남)
const countryUniqueKeywords = {
  japan: {
    Skincare: {
      ingredient: [
        { keyword: 'rice ferment filtrate', score: 94, level: 'Actionable', product: 'SK-II Facial Treatment Essence', brand: 'SK-II', desc: 'Pitera rice ferment filtrate for crystal clear skin.' },
        { keyword: 'sake extract', score: 78, level: 'Growing', product: 'Kiku-Masamune Sake Lotion', brand: 'Kiku-Masamune', desc: 'Japanese sake extract for hydration and glow.' },
      ],
      formulas: [
        { keyword: 'lotion (化粧水)', score: 95, level: 'Actionable', product: 'Hada Labo Gokujyun Lotion', brand: 'Hada Labo', desc: 'Japanese style hydrating lotion with hyaluronic acid layers.' },
      ],
      effects: [
        { keyword: 'mochi skin', score: 88, level: 'Actionable', product: 'Curel Intensive Moisture Cream', brand: 'Curel', desc: 'Bouncy mochi-like skin texture through ceramide care.' },
      ]
    },
    'Sun Care': {
      formulas: [
        { keyword: 'UV milk (日焼け止めミルク)', score: 93, level: 'Actionable', product: 'Anessa Perfect UV Milk', brand: 'Anessa', desc: 'Japanese UV milk technology for perfect protection.' },
      ],
      effects: [
        { keyword: 'moisture UV', score: 86, level: 'Actionable', product: 'Curel UV Essence SPF30', brand: 'Curel', desc: 'Moisturizing UV protection for dry sensitive skin.' },
      ]
    },
    'Hair Care': {
      ingredient: [
        { keyword: 'tsubaki oil', score: 90, level: 'Actionable', product: 'Shiseido Tsubaki Premium Repair', brand: 'Shiseido', desc: 'Traditional tsubaki camellia oil for Japanese hair care.' },
      ]
    }
  },
  singapore: {
    Skincare: {
      ingredient: [
        { keyword: 'tea tree oil', score: 88, level: 'Actionable', product: 'Some By Mi AHA BHA PHA Toner', brand: 'Some By Mi', desc: 'Tea tree oil for acne-prone tropical climate skin.' },
      ],
      effects: [
        { keyword: 'oil-free hydration', score: 90, level: 'Actionable', product: 'Torriden DIVE-IN Serum', brand: 'Torriden', desc: 'Oil-free deep hydration for hot humid weather.' },
        { keyword: 'sweat-proof', score: 82, level: 'Growing', product: 'Biore UV Aqua Rich SPF50+', brand: 'Biore', desc: 'Sweat-proof sunscreen for tropical weather.' },
      ]
    },
    'Sun Care': {
      effects: [
        { keyword: 'tropical-proof SPF', score: 92, level: 'Actionable', product: 'Biore UV Aqua Rich SPF50+', brand: 'Biore', desc: 'SPF that withstands tropical heat and humidity.' },
      ]
    },
    'Hair Care': {
      effects: [
        { keyword: 'humidity-proof', score: 88, level: 'Actionable', product: 'Mise en Scene Anti-Frizz Serum', brand: 'Mise en Scene', desc: 'Humidity-proof hair serum for tropical weather.' },
      ]
    }
  },
  malaysia: {
    Skincare: {
      ingredient: [
        { keyword: 'alpha arbutin', score: 90, level: 'Actionable', product: 'Skintific Alpha Arbutin Serum', brand: 'Skintific', desc: 'Alpha arbutin for dark spot correction and brightening.' },
        { keyword: 'tranexamic acid', score: 78, level: 'Growing', product: 'Safi Rania Gold Essence', brand: 'Safi', desc: 'Tranexamic acid for hyperpigmentation in tropical skin.' },
      ],
      effects: [
        { keyword: 'whitening', score: 85, level: 'Actionable', product: 'Garnier Light Serum', brand: 'Garnier', desc: 'Skin brightening and even tone for Malaysian consumers.' },
      ]
    },
    Makeup: {
      mood: [
        { keyword: 'halal beauty', score: 89, level: 'Actionable', product: 'Safi Balqis Lip Color', brand: 'Safi', desc: 'Halal-certified beauty products for Muslim consumers.' },
      ]
    },
    'Body Care': {
      mood: [
        { keyword: 'halal bodycare', score: 87, level: 'Actionable', product: 'Safi Body Lotion', brand: 'Safi', desc: 'Halal-certified body care for Malaysian market.' },
      ]
    }
  },
  indonesia: {
    Skincare: {
      ingredient: [
        { keyword: 'centella 5X concentrate', score: 92, level: 'Actionable', product: 'Skintific 5X Ceramide Serum', brand: 'Skintific', desc: '5X concentrated ceramide for barrier strengthening.' },
        { keyword: 'galactomyces', score: 79, level: 'Growing', product: 'Somethinc Niacinamide Serum', brand: 'Somethinc', desc: 'Galactomyces ferment for radiant Indonesian skin.' },
      ],
      formulas: [
        { keyword: 'gel serum', score: 91, level: 'Actionable', product: 'Glad2Glow Niacinamide Gel', brand: 'Glad2Glow', desc: 'Lightweight gel serum for oily tropical skin.' },
      ],
      effects: [
        { keyword: 'anti-dark spots', score: 88, level: 'Actionable', product: 'Wardah Lightening Series', brand: 'Wardah', desc: 'Dark spot fading for even skin tone.' },
      ]
    },
    Makeup: {
      formulas: [
        { keyword: 'local cushion', score: 90, level: 'Actionable', product: 'Wardah Instaperfect Cushion', brand: 'Wardah', desc: 'Indonesian local brand cushion with halal certification.' },
      ]
    },
    'Mens Care': {
      mood: [
        { keyword: 'affordable grooming', score: 88, level: 'Actionable', product: 'Somethinc Men Series', brand: 'Somethinc', desc: 'Affordable K-beauty inspired grooming for Indonesian men.' },
      ]
    }
  }
};

// 리뷰 데이터 생성
function generateReviews(country, keywords) {
  const reviews = [];

  // 리뷰 유형별 긍정/부정 템플릿
  const typedPositiveTemplates = [
    { reviewType: '효과', content: 'Visible improvement in my skin after just 2 weeks of using this!' },
    { reviewType: '효과', content: 'My acne scars are fading noticeably. This really works!' },
    { reviewType: '효과', content: 'Noticed brighter and clearer skin within a week.' },
    { reviewType: '효과', content: 'Finally found a product that actually delivers on its promises!' },
    { reviewType: '보습', content: 'Love this product! My skin feels so hydrated and smooth all day.' },
    { reviewType: '보습', content: 'Deep hydration without feeling greasy. Perfect for dry skin.' },
    { reviewType: '보습', content: 'My dehydrated skin drinks this up. Plump and dewy all day.' },
    { reviewType: '텍스처', content: 'The texture is amazing - absorbs quickly without stickiness.' },
    { reviewType: '텍스처', content: 'Lightweight and silky. Layers beautifully under makeup.' },
    { reviewType: '텍스처', content: 'Smooth application, melts right into the skin.' },
    { reviewType: '향', content: 'Subtle, pleasant scent that is not overpowering at all.' },
    { reviewType: '향', content: 'Love the fresh, clean fragrance. Very calming.' },
    { reviewType: '가성비', content: 'Great value for money. Works better than expensive brands.' },
    { reviewType: '가성비', content: 'Affordable yet so effective. Best budget-friendly find!' },
    { reviewType: '자극없음', content: 'My sensitive skin loves this. No irritation at all.' },
    { reviewType: '자극없음', content: 'Zero irritation even on my reactive, redness-prone skin.' },
    { reviewType: '지속력', content: 'Keeps my skin moisturized for 12+ hours. Amazing staying power.' },
    { reviewType: '지속력', content: 'Lasts all day under makeup without fading or pilling.' },
    { reviewType: '흡수력', content: 'Absorbs in seconds, no residue. Perfect for morning routine.' },
    { reviewType: '흡수력', content: 'Sinks in immediately - no waiting time needed before next step.' },
  ];

  const typedNegativeTemplates = [
    { reviewType: '효과', content: 'Did not notice any difference after using for a month.' },
    { reviewType: '효과', content: 'Expected more results. Barely any visible change.' },
    { reviewType: '보습', content: 'Not moisturizing enough for my dry skin type.' },
    { reviewType: '보습', content: 'Made my skin feel tight and dry after a few hours.' },
    { reviewType: '텍스처', content: 'Too sticky for my oily skin type. Hard to layer.' },
    { reviewType: '텍스처', content: 'Leaves a white cast and pills under makeup.' },
    { reviewType: '향', content: 'Fragrance is too strong for my preference. Gave me headache.' },
    { reviewType: '향', content: 'Chemical smell that lingers. Wish it was fragrance-free.' },
    { reviewType: '가성비', content: 'Expected more for the price point. Overpriced for what it does.' },
    { reviewType: '가성비', content: 'Too expensive for the small amount you get.' },
    { reviewType: '자극', content: 'Broke me out unfortunately. Not suitable for acne-prone skin.' },
    { reviewType: '자극', content: 'Caused some redness and burning on my sensitive skin.' },
    { reviewType: '지속력', content: 'Effects wear off within 2-3 hours. Need constant reapplication.' },
    { reviewType: '지속력', content: 'Fades quickly. Does not last as long as advertised.' },
    { reviewType: '흡수력', content: 'Takes forever to absorb. Leaves greasy film on skin.' },
    { reviewType: '흡수력', content: 'Sits on top of skin and never fully sinks in.' },
  ];

  // Ensure EVERY keyword gets at least 3 reviews (positive + negative)
  for (const keyword of keywords) {
    const numReviews = Math.floor(Math.random() * 4) + 4; // 4-7 per keyword
    for (let i = 0; i < numReviews; i++) {
      const isPositive = Math.random() > 0.25; // 75% positive
      const weekOffset = Math.floor(Math.random() * 8);
      const date = new Date();
      date.setDate(date.getDate() - (weekOffset * 7) - Math.floor(Math.random() * 7));

      const template = isPositive
        ? typedPositiveTemplates[Math.floor(Math.random() * typedPositiveTemplates.length)]
        : typedNegativeTemplates[Math.floor(Math.random() * typedNegativeTemplates.length)];

      reviews.push({
        country,
        keyword: keyword.keyword,
        sentiment: isPositive ? 'positive' : 'negative',
        reviewType: template.reviewType,
        rating: isPositive ? (4 + Math.random()).toFixed(1) * 1 : (2 + Math.random() * 1.5).toFixed(1) * 1,
        content: template.content,
        product: keyword.product,
        brand: keyword.brand,
        postedAt: date,
        source: country === 'usa' ? 'Amazon' : country === 'japan' ? '@cosme' : 'Shopee',
      });
    }
  }
  return reviews;
}

// 나라별 SNS 플랫폼 매핑
const countryPlatforms = {
  usa: ['TikTok', 'Instagram', 'Amazon'],
  japan: ['YouTube', 'Instagram', '@cosme'],
  singapore: ['TikTok', 'Instagram', 'Shopee'],
  malaysia: ['TikTok', 'Instagram', 'Shopee'],
  indonesia: ['TikTok', 'Instagram', 'Shopee'],
};

// 카테고리별 SNS 데이터 자동 생성 함수
function generateSNSData(categoryData, category, country) {
  const platforms = countryPlatforms[country] || ['TikTok', 'Instagram', 'Amazon'];
  const categoryBoosts = country === 'usa' ? {} : ((countryKeywordBoosts[country] || {})[category] || {});

  // 각 타입별 키워드를 점수순으로 정렬 (나라별 부스트 적용)
  const getAdjustedItems = (items, type) => {
    return items.map(item => {
      const boost = categoryBoosts[item.keyword] || 0;
      const adjustedScore = Math.max(30, Math.min(99, item.score + boost));
      return { ...item, adjustedScore, type };
    }).sort((a, b) => b.adjustedScore - a.adjustedScore);
  };

  const ingredients = getAdjustedItems(categoryData.ingredient || [], 'ingredients');
  const formulas = getAdjustedItems(categoryData.formulas || [], 'formulas');
  const effects = getAdjustedItems(categoryData.effects || [], 'effects');
  const moods = getAdjustedItems(categoryData.mood || [], 'mood');

  // 플랫폼별 키워드 분배 전략
  // TikTok/YouTube: 바이럴 트렌드 (성분 2개 + 무드 2개 + 효과 1개)
  // Instagram: 비주얼/무드 중심 (무드 2개 + 성분 1개 + 효과 1개 + 제형 1개)
  // Amazon/Shopee/@cosme: 구매 트렌드 (성분 2개 + 제형 2개 + 효과 1개)
  const platformKeywords = [];

  for (const platform of platforms) {
    let keywords = [];
    if (platform === 'TikTok' || platform === 'YouTube') {
      keywords = [
        ingredients[0], ingredients[1], moods[0], moods[1], effects[0]
      ].filter(Boolean);
    } else if (platform === 'Instagram') {
      keywords = [
        moods[0], moods[1], ingredients[0], effects[0], formulas[0]
      ].filter(Boolean);
    } else {
      // Amazon, Shopee, @cosme
      keywords = [
        ingredients[0], ingredients[1], formulas[0], formulas[1], effects[0]
      ].filter(Boolean);
    }

    // 점수 기반으로 value 계산 (상위 5개만)
    const top5 = keywords.slice(0, 5).map((kw, idx) => ({
      keyword: kw.keyword,
      value: Math.min(99, kw.adjustedScore + Math.floor(Math.random() * 5)),
      change: Math.floor(Math.random() * 50) + 5,
      type: kw.type
    }));

    // value 순으로 정렬
    top5.sort((a, b) => b.value - a.value);

    platformKeywords.push({ platform, keywords: top5 });
  }

  return platformKeywords;
}

// WhiteSpace 비교 제품 데이터 (해외 인기 vs 한국 브랜드)
const whitespaceProducts = {
  usa: {
    Skincare: {
      overseas: [
        { name: 'CeraVe Moisturizing Cream', brand: 'CeraVe', price: '$18.99', rating: 4.7, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=CeraVe' },
        { name: 'La Roche-Posay Toleriane Double Repair', brand: 'La Roche-Posay', price: '$22.99', rating: 4.6, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=LRP' },
        { name: 'Neutrogena Hydro Boost Gel-Cream', brand: 'Neutrogena', price: '$19.99', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Neutrogena' },
        { name: 'The Ordinary Niacinamide 10%', brand: 'The Ordinary', price: '$6.50', rating: 4.4, reviewCount: 4200, imageUrl: 'https://via.placeholder.com/120x120?text=Ordinary' },
        { name: 'Olay Regenerist Micro-Sculpting Cream', brand: 'Olay', price: '$28.99', rating: 4.5, reviewCount: 1900, imageUrl: 'https://via.placeholder.com/120x120?text=Olay' },
      ],
      korean: [
        { name: 'COSRX Snail Mucin 96% Essence', brand: 'COSRX', price: '$21.00', rating: 4.8, reviewCount: 4500, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },
        { name: 'Beauty of Joseon Glow Deep Serum', brand: 'Beauty of Joseon', price: '$17.00', rating: 4.7, reviewCount: 3800, imageUrl: 'https://via.placeholder.com/120x120?text=BoJ' },
        { name: 'SKIN1004 Centella Ampoule', brand: 'SKIN1004', price: '$18.50', rating: 4.7, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=SKIN1004' },
        { name: 'Torriden DIVE-IN Serum', brand: 'Torriden', price: '$15.00', rating: 4.6, reviewCount: 2900, imageUrl: 'https://via.placeholder.com/120x120?text=Torriden' },
        { name: 'Anua Heartleaf 77% Toner', brand: 'Anua', price: '$19.00', rating: 4.6, reviewCount: 2600, imageUrl: 'https://via.placeholder.com/120x120?text=Anua' },
      ]
    },
    Cleansing: {
      overseas: [
        { name: 'CeraVe Hydrating Facial Cleanser', brand: 'CeraVe', price: '$15.99', rating: 4.6, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=CeraVe' },
        { name: 'Cetaphil Gentle Skin Cleanser', brand: 'Cetaphil', price: '$13.99', rating: 4.5, reviewCount: 2400, imageUrl: 'https://via.placeholder.com/120x120?text=Cetaphil' },
        { name: 'La Roche-Posay Toleriane Cleanser', brand: 'La Roche-Posay', price: '$16.99', rating: 4.5, reviewCount: 1900, imageUrl: 'https://via.placeholder.com/120x120?text=LRP' },
        { name: 'Vanicream Gentle Facial Cleanser', brand: 'Vanicream', price: '$9.99', rating: 4.7, reviewCount: 1600, imageUrl: 'https://via.placeholder.com/120x120?text=Vanicream' },
        { name: 'Fresh Soy Face Cleanser', brand: 'Fresh', price: '$40.00', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Fresh' },
      ],
      korean: [
        { name: 'COSRX Low pH Good Morning Gel Cleanser', brand: 'COSRX', price: '$12.00', rating: 4.6, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },
        { name: 'Beauty of Joseon Green Plum Cleansing Oil', brand: 'Beauty of Joseon', price: '$16.00', rating: 4.7, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=BoJ' },
        { name: 'Innisfree Green Tea Cleansing Foam', brand: 'Innisfree', price: '$10.00', rating: 4.5, reviewCount: 2100, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },
        { name: 'Round Lab Dokdo Cleanser', brand: 'Round Lab', price: '$14.00', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' },
        { name: 'Anua Heartleaf Quercetinol Pore Cleansing Oil', brand: 'Anua', price: '$18.00', rating: 4.6, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Anua' },
      ]
    },
    'Sun Care': {
      overseas: [
        { name: 'Supergoop Unseen Sunscreen SPF40', brand: 'Supergoop', price: '$38.00', rating: 4.5, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Supergoop' },
        { name: 'EltaMD UV Clear SPF46', brand: 'EltaMD', price: '$39.00', rating: 4.6, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=EltaMD' },
        { name: 'La Roche-Posay Anthelios SPF60', brand: 'La Roche-Posay', price: '$35.99', rating: 4.5, reviewCount: 1900, imageUrl: 'https://via.placeholder.com/120x120?text=LRP' },
        { name: 'Neutrogena Ultra Sheer SPF55', brand: 'Neutrogena', price: '$12.99', rating: 4.3, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Neutrogena' },
        { name: 'Black Girl Sunscreen SPF30', brand: 'Black Girl Sunscreen', price: '$15.99', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=BGS' },
      ],
      korean: [
        { name: 'Beauty of Joseon Relief Sun SPF50+', brand: 'Beauty of Joseon', price: '$15.00', rating: 4.8, reviewCount: 4800, imageUrl: 'https://via.placeholder.com/120x120?text=BoJ' },
        { name: 'COSRX Aloe Soothing Sun Cream SPF50+', brand: 'COSRX', price: '$14.00', rating: 4.6, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },
        { name: 'Isntree Hyaluronic Acid Watery Sun Gel', brand: 'Isntree', price: '$16.00', rating: 4.7, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Isntree' },
        { name: 'Round Lab Birch Juice Sun Cream', brand: 'Round Lab', price: '$18.00', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' },
        { name: 'Skin Aqua Tone Up UV Essence', brand: 'Skin Aqua', price: '$13.00', rating: 4.6, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=SkinAqua' },
      ]
    },
    Makeup: {
      overseas: [
        { name: 'Maybelline Fit Me Foundation', brand: 'Maybelline', price: '$8.99', rating: 4.4, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Maybelline' },
        { name: 'MAC Studio Fix Fluid', brand: 'MAC', price: '$40.00', rating: 4.5, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=MAC' },
        { name: 'NARS Radiant Creamy Concealer', brand: 'NARS', price: '$32.00', rating: 4.6, reviewCount: 1900, imageUrl: 'https://via.placeholder.com/120x120?text=NARS' },
        { name: 'Charlotte Tilbury Flawless Filter', brand: 'Charlotte Tilbury', price: '$46.00', rating: 4.5, reviewCount: 1600, imageUrl: 'https://via.placeholder.com/120x120?text=CT' },
        { name: 'Rare Beauty Soft Pinch Blush', brand: 'Rare Beauty', price: '$23.00', rating: 4.7, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=RareBeauty' },
      ],
      korean: [
        { name: 'Laneige Neo Cushion Matte', brand: 'Laneige', price: '$32.00', rating: 4.6, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },
        { name: 'Etude House SoonJung Lip Balm', brand: 'Etude House', price: '$8.00', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Etude' },
        { name: 'Romand Juicy Lasting Tint', brand: 'Romand', price: '$12.00', rating: 4.7, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=Romand' },
        { name: 'CLIO Kill Cover Fixer Cushion', brand: 'CLIO', price: '$25.00', rating: 4.6, reviewCount: 2100, imageUrl: 'https://via.placeholder.com/120x120?text=CLIO' },
        { name: 'Peripera Ink Mood Glowy Tint', brand: 'Peripera', price: '$10.00', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Peripera' },
      ]
    },
    'Hair Care': {
      overseas: [
        { name: 'Olaplex No.3 Hair Perfector', brand: 'Olaplex', price: '$30.00', rating: 4.5, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Olaplex' },
        { name: 'Moroccanoil Treatment', brand: 'Moroccanoil', price: '$48.00', rating: 4.6, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Moroccanoil' },
        { name: 'Redken All Soft Shampoo', brand: 'Redken', price: '$25.00', rating: 4.4, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Redken' },
        { name: 'Briogeo Be Gentle Shampoo', brand: 'Briogeo', price: '$28.00', rating: 4.5, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Briogeo' },
        { name: 'Kerastase Nutritive Shampoo', brand: 'Kerastase', price: '$38.00', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Kerastase' },
      ],
      korean: [
        { name: 'Mise en Scene Perfect Serum', brand: 'Mise en Scene', price: '$12.00', rating: 4.6, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=MeS' },
        { name: 'Dr. ForHair Folligen Shampoo', brand: 'Dr. ForHair', price: '$18.00', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=DrForHair' },
        { name: 'Ryo Hair Loss Care Shampoo', brand: 'Ryo', price: '$16.00', rating: 4.4, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Ryo' },
        { name: 'Daeng Gi Meo Ri Ki Gold Shampoo', brand: 'Daeng Gi Meo Ri', price: '$22.00', rating: 4.5, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=DGMR' },
        { name: 'Kundal Honey & Macadamia Shampoo', brand: 'Kundal', price: '$14.00', rating: 4.6, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Kundal' },
      ]
    },
    'Body Care': {
      overseas: [
        { name: 'Aveeno Daily Moisturizing Lotion', brand: 'Aveeno', price: '$12.99', rating: 4.6, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=Aveeno' },
        { name: 'Eucerin Original Healing Cream', brand: 'Eucerin', price: '$14.99', rating: 4.5, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Eucerin' },
        { name: 'Jergens Ultra Healing Lotion', brand: 'Jergens', price: '$9.99', rating: 4.4, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Jergens' },
        { name: "Lubriderm Men's 3-in-1 Lotion", brand: 'Lubriderm', price: '$10.99', rating: 4.3, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Lubriderm' },
        { name: 'Dove Deep Moisture Body Wash', brand: 'Dove', price: '$7.99', rating: 4.6, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Dove' },
      ],
      korean: [
        { name: 'Illiyoon Ceramide Ato Lotion', brand: 'Illiyoon', price: '$18.00', rating: 4.7, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Illiyoon' },
        { name: 'Round Lab Soybean Body Lotion', brand: 'Round Lab', price: '$16.00', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' },
        { name: 'Innisfree Green Tea Body Mist', brand: 'Innisfree', price: '$12.00', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },
        { name: 'Happy Bath Original Body Wash', brand: 'Happy Bath', price: '$10.00', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=HappyBath' },
        { name: 'Amore Pacific Body Brightening Cream', brand: 'Amore Pacific', price: '$25.00', rating: 4.3, reviewCount: 900, imageUrl: 'https://via.placeholder.com/120x120?text=AP' },
      ]
    },
    'Mens Care': {
      overseas: [
        { name: 'Kiehl\'s Facial Fuel Moisturizer', brand: 'Kiehl\'s', price: '$35.00', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Kiehls' },
        { name: 'Clinique For Men Face Wash', brand: 'Clinique', price: '$25.00', rating: 4.4, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Clinique' },
        { name: 'Jack Black Double-Duty Moisturizer', brand: 'Jack Black', price: '$35.00', rating: 4.5, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=JackBlack' },
        { name: 'Bulldog Original Face Wash', brand: 'Bulldog', price: '$8.99', rating: 4.4, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Bulldog' },
        { name: 'Every Man Jack Face Lotion SPF20', brand: 'Every Man Jack', price: '$12.99', rating: 4.3, reviewCount: 900, imageUrl: 'https://via.placeholder.com/120x120?text=EMJ' },
      ],
      korean: [
        { name: 'Laneige Homme Blue Energy Essence', brand: 'Laneige', price: '$28.00', rating: 4.6, reviewCount: 1600, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },
        { name: 'Innisfree Forest for Men All-in-One', brand: 'Innisfree', price: '$20.00', rating: 4.5, reviewCount: 1400, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },
        { name: 'Dr. Jart+ Cicapair for Men', brand: 'Dr. Jart+', price: '$22.00', rating: 4.4, reviewCount: 1100, imageUrl: 'https://via.placeholder.com/120x120?text=DrJart' },
        { name: 'Missha All Around Safe Block Men Sun', brand: 'Missha', price: '$15.00', rating: 4.5, reviewCount: 1300, imageUrl: 'https://via.placeholder.com/120x120?text=Missha' },
        { name: 'COSRX BHA Blackhead Power Liquid', brand: 'COSRX', price: '$18.00', rating: 4.6, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },
      ]
    }
  },
  japan: {
    Skincare: {
      overseas: [
        { name: 'Hada Labo Gokujyun Lotion', brand: 'Hada Labo', price: '¥990', rating: 4.8, reviewCount: 4500, imageUrl: 'https://via.placeholder.com/120x120?text=HadaLabo' },
        { name: 'Curel Intensive Moisture Cream', brand: 'Curel', price: '¥2,530', rating: 4.7, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=Curel' },
        { name: 'Shiseido Elixir Brightening Lotion', brand: 'Shiseido', price: '¥3,300', rating: 4.5, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Shiseido' },
        { name: 'SK-II Facial Treatment Essence', brand: 'SK-II', price: '¥17,600', rating: 4.6, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=SKII' },
        { name: 'Kose Sekkisei Clear Wellness Lotion', brand: 'Kose', price: '¥2,200', rating: 4.4, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Kose' },
      ],
      korean: [
        { name: 'COSRX Snail Mucin 96% Essence', brand: 'COSRX', price: '¥2,490', rating: 4.7, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },
        { name: 'Innisfree Green Tea Seed Serum', brand: 'Innisfree', price: '¥2,750', rating: 4.6, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },
        { name: 'Laneige Water Sleeping Mask', brand: 'Laneige', price: '¥3,520', rating: 4.7, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },
        { name: 'Etude House SoonJung 2x Barrier Cream', brand: 'Etude House', price: '¥1,980', rating: 4.5, reviewCount: 1900, imageUrl: 'https://via.placeholder.com/120x120?text=Etude' },
        { name: 'Missha Time Revolution Essence', brand: 'Missha', price: '¥3,300', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Missha' },
      ]
    },
    Cleansing: { overseas: [
        { name: 'Fancl Mild Cleansing Oil', brand: 'Fancl', price: '¥1,870', rating: 4.7, reviewCount: 3800, imageUrl: 'https://via.placeholder.com/120x120?text=Fancl' },
        { name: 'Hada Labo Cleansing Foam', brand: 'Hada Labo', price: '¥660', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=HadaLabo' },
        { name: 'Softymo Deep Cleansing Oil', brand: 'Kose', price: '¥770', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Softymo' },
        { name: 'DHC Deep Cleansing Oil', brand: 'DHC', price: '¥2,724', rating: 4.6, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=DHC' },
        { name: 'Biore Cleansing Water', brand: 'Biore', price: '¥880', rating: 4.3, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Biore' },
      ], korean: [
        { name: 'Banila Co Clean It Zero Cleansing Balm', brand: 'Banila Co', price: '¥2,200', rating: 4.7, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=BanilaCo' },
        { name: 'COSRX Low pH Good Morning Gel Cleanser', brand: 'COSRX', price: '¥1,320', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },
        { name: 'Innisfree Green Tea Cleansing Foam', brand: 'Innisfree', price: '¥990', rating: 4.4, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },
        { name: 'Etude House SoonJung pH Cleanser', brand: 'Etude House', price: '¥1,100', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Etude' },
        { name: 'Round Lab Dokdo Cleanser', brand: 'Round Lab', price: '¥1,540', rating: 4.6, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' },
      ]
    },
    'Sun Care': { overseas: [
        { name: 'Anessa Perfect UV Milk SPF50+', brand: 'Anessa', price: '¥3,058', rating: 4.8, reviewCount: 4200, imageUrl: 'https://via.placeholder.com/120x120?text=Anessa' },
        { name: 'Biore UV Aqua Rich SPF50+', brand: 'Biore', price: '¥880', rating: 4.7, reviewCount: 3800, imageUrl: 'https://via.placeholder.com/120x120?text=Biore' },
        { name: 'Skin Aqua Tone Up UV Essence', brand: 'Skin Aqua', price: '¥770', rating: 4.6, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=SkinAqua' },
        { name: 'Allie Chrono Beauty Gel UV EX', brand: 'Kanebo', price: '¥2,310', rating: 4.5, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Allie' },
        { name: 'Canmake Mermaid Skin Gel UV', brand: 'Canmake', price: '¥770', rating: 4.6, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Canmake' },
      ], korean: [
        { name: 'Beauty of Joseon Relief Sun SPF50+', brand: 'Beauty of Joseon', price: '¥1,760', rating: 4.7, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=BoJ' },
        { name: 'COSRX Aloe Soothing Sun Cream', brand: 'COSRX', price: '¥1,540', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },
        { name: 'Isntree Hyaluronic Acid Sun Gel', brand: 'Isntree', price: '¥1,650', rating: 4.6, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Isntree' },
        { name: 'Missha All Around Safe Block Soft Finish', brand: 'Missha', price: '¥1,320', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Missha' },
        { name: 'Thank You Farmer Sun Project', brand: 'Thank You Farmer', price: '¥2,200', rating: 4.5, reviewCount: 900, imageUrl: 'https://via.placeholder.com/120x120?text=TYF' },
      ]
    },
    Makeup: { overseas: [
        { name: 'Canmake Cream Cheek', brand: 'Canmake', price: '¥638', rating: 4.5, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Canmake' },
        { name: 'KATE Lash Maximizer', brand: 'KATE', price: '¥1,650', rating: 4.6, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=KATE' },
        { name: 'Majolica Majorca Lash Expander', brand: 'Shiseido', price: '¥1,210', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Majolica' },
        { name: 'Cezanne UV Foundation EX Plus', brand: 'Cezanne', price: '¥638', rating: 4.3, reviewCount: 1900, imageUrl: 'https://via.placeholder.com/120x120?text=Cezanne' },
        { name: 'Dejavu Lasting Fine Eyeliner', brand: 'Dejavu', price: '¥1,320', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Dejavu' },
      ], korean: [
        { name: 'Romand Juicy Lasting Tint', brand: 'Romand', price: '¥1,320', rating: 4.7, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=Romand' },
        { name: 'CLIO Kill Cover Fixer Cushion', brand: 'CLIO', price: '¥2,750', rating: 4.6, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=CLIO' },
        { name: 'Etude House Drawing Eye Brow', brand: 'Etude House', price: '¥660', rating: 4.5, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Etude' },
        { name: 'Peripera Ink Mood Glowy Tint', brand: 'Peripera', price: '¥1,100', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Peripera' },
        { name: 'Laneige Neo Cushion', brand: 'Laneige', price: '¥3,520', rating: 4.6, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },
      ]
    },
    'Hair Care': { overseas: [
        { name: 'Tsubaki Premium Repair Shampoo', brand: 'Shiseido', price: '¥990', rating: 4.5, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=Tsubaki' },
        { name: 'Lux Super Rich Shine Shampoo', brand: 'LUX', price: '¥770', rating: 4.4, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=LUX' },
        { name: 'Botanist Botanical Shampoo', brand: 'Botanist', price: '¥1,540', rating: 4.6, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Botanist' },
        { name: 'Fino Premium Touch Hair Mask', brand: 'Shiseido', price: '¥770', rating: 4.7, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Fino' },
        { name: 'Milbon Elujuda Hair Oil', brand: 'Milbon', price: '¥2,860', rating: 4.6, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Milbon' },
      ], korean: [
        { name: 'Mise en Scene Perfect Serum', brand: 'Mise en Scene', price: '¥1,320', rating: 4.6, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=MeS' },
        { name: 'Ryo Hair Loss Care Shampoo', brand: 'Ryo', price: '¥1,760', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Ryo' },
        { name: 'Dr. ForHair Folligen Shampoo', brand: 'Dr. ForHair', price: '¥1,980', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=DrForHair' },
        { name: 'Kundal Honey Macadamia Shampoo', brand: 'Kundal', price: '¥1,540', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Kundal' },
        { name: 'Daeng Gi Meo Ri Ki Gold Shampoo', brand: 'Daeng Gi Meo Ri', price: '¥2,420', rating: 4.4, reviewCount: 900, imageUrl: 'https://via.placeholder.com/120x120?text=DGMR' },
      ]
    },
    'Body Care': { overseas: [
        { name: 'Muji Sensitive Skin Body Milk', brand: 'MUJI', price: '¥990', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=MUJI' },
        { name: 'Nivea Skin Milk', brand: 'Nivea', price: '¥770', rating: 4.5, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Nivea' },
        { name: 'Johnson Body Care Lotion', brand: 'Johnson', price: '¥660', rating: 4.3, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Johnson' },
        { name: 'Curel Moisture Body Wash', brand: 'Curel', price: '¥1,100', rating: 4.6, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Curel' },
        { name: 'Dove Premium Moisture Body Wash', brand: 'Dove', price: '¥550', rating: 4.4, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Dove' },
      ], korean: [
        { name: 'Illiyoon Ceramide Ato Lotion', brand: 'Illiyoon', price: '¥1,980', rating: 4.7, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Illiyoon' },
        { name: 'Innisfree Green Tea Body Lotion', brand: 'Innisfree', price: '¥1,320', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },
        { name: 'Happy Bath Original Body Wash', brand: 'Happy Bath', price: '¥1,100', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=HappyBath' },
        { name: 'Aekyung Kerasys Perfume Body Wash', brand: 'Kerasys', price: '¥990', rating: 4.3, reviewCount: 900, imageUrl: 'https://via.placeholder.com/120x120?text=Kerasys' },
        { name: 'Round Lab Soybean Body Lotion', brand: 'Round Lab', price: '¥1,760', rating: 4.5, reviewCount: 1100, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' },
      ]
    },
    'Mens Care': { overseas: [
        { name: 'Uno Skin Serum Water', brand: 'Shiseido', price: '¥1,100', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Uno' },
        { name: 'Gatsby Facial Wash', brand: 'Mandom', price: '¥440', rating: 4.3, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Gatsby' },
        { name: 'Nivea Men Active Age Lotion', brand: 'Nivea', price: '¥1,650', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Nivea' },
        { name: 'Lucido Total Skin Care', brand: 'Mandom', price: '¥1,320', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Lucido' },
        { name: 'Bulk Homme The Face Wash', brand: 'Bulk Homme', price: '¥2,200', rating: 4.6, reviewCount: 1000, imageUrl: 'https://via.placeholder.com/120x120?text=Bulk' },
      ], korean: [
        { name: 'Laneige Homme Blue Energy', brand: 'Laneige', price: '¥3,080', rating: 4.6, reviewCount: 1400, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },
        { name: 'Innisfree Forest for Men', brand: 'Innisfree', price: '¥2,200', rating: 4.5, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },
        { name: 'Dr. Jart+ Cicapair for Men', brand: 'Dr. Jart+', price: '¥2,420', rating: 4.4, reviewCount: 900, imageUrl: 'https://via.placeholder.com/120x120?text=DrJart' },
        { name: 'Missha For Men Aqua Breath Toner', brand: 'Missha', price: '¥1,650', rating: 4.3, reviewCount: 800, imageUrl: 'https://via.placeholder.com/120x120?text=Missha' },
        { name: 'Etude House AC Clean Up Gel Lotion', brand: 'Etude House', price: '¥1,540', rating: 4.4, reviewCount: 700, imageUrl: 'https://via.placeholder.com/120x120?text=Etude' },
      ]
    }
  },
  singapore: {
    Skincare: {
      overseas: [
        { name: 'The Ordinary Niacinamide 10%', brand: 'The Ordinary', price: 'S$12.90', rating: 4.5, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Ordinary' },
        { name: 'CeraVe Moisturizing Cream', brand: 'CeraVe', price: 'S$29.90', rating: 4.6, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=CeraVe' },
        { name: 'La Roche-Posay Hyalu B5 Serum', brand: 'La Roche-Posay', price: 'S$59.90', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=LRP' },
        { name: 'Bioderma Sensibio H2O Micellar', brand: 'Bioderma', price: 'S$32.90', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Bioderma' },
        { name: 'Avene Thermal Spring Water', brand: 'Avene', price: 'S$22.90', rating: 4.3, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Avene' },
      ],
      korean: [
        { name: 'COSRX Snail Mucin 96% Essence', brand: 'COSRX', price: 'S$24.90', rating: 4.8, reviewCount: 4200, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },
        { name: 'Some By Mi AHA BHA PHA Toner', brand: 'Some By Mi', price: 'S$18.90', rating: 4.6, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=SomeByMi' },
        { name: 'Torriden DIVE-IN Serum', brand: 'Torriden', price: 'S$19.90', rating: 4.7, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Torriden' },
        { name: 'SKIN1004 Centella Ampoule', brand: 'SKIN1004', price: 'S$22.90', rating: 4.6, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=SKIN1004' },
        { name: 'Anua Heartleaf 77% Toner', brand: 'Anua', price: 'S$25.90', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Anua' },
      ]
    },
    Cleansing: { overseas: [{ name: 'Cetaphil Gentle Cleanser', brand: 'Cetaphil', price: 'S$18.90', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Cetaphil' },{ name: 'Bioderma Sensibio Gel', brand: 'Bioderma', price: 'S$28.90', rating: 4.4, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Bioderma' },{ name: 'Simple Micellar Cleansing Water', brand: 'Simple', price: 'S$12.90', rating: 4.3, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Simple' },{ name: 'Garnier Micellar Water', brand: 'Garnier', price: 'S$10.90', rating: 4.4, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Garnier' },{ name: 'Eucerin DermatoClean Gel', brand: 'Eucerin', price: 'S$22.90', rating: 4.5, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Eucerin' }], korean: [{ name: 'COSRX Low pH Good Morning Cleanser', brand: 'COSRX', price: 'S$14.90', rating: 4.6, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },{ name: 'Some By Mi Bye Bye Blackhead Cleanser', brand: 'Some By Mi', price: 'S$15.90', rating: 4.5, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=SomeByMi' },{ name: 'Innisfree Green Tea Cleansing Foam', brand: 'Innisfree', price: 'S$12.90', rating: 4.4, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },{ name: 'Banila Co Clean It Zero', brand: 'Banila Co', price: 'S$26.90', rating: 4.7, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=BanilaCo' },{ name: 'Round Lab Dokdo Cleanser', brand: 'Round Lab', price: 'S$16.90', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' }] },
    'Sun Care': { overseas: [{ name: 'Biore UV Aqua Rich SPF50+', brand: 'Biore', price: 'S$16.90', rating: 4.6, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=Biore' },{ name: 'Neutrogena Ultra Sheer SPF50+', brand: 'Neutrogena', price: 'S$18.90', rating: 4.4, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Neutrogena' },{ name: 'Anessa Perfect UV Milk', brand: 'Anessa', price: 'S$38.90', rating: 4.7, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Anessa' },{ name: 'Banana Boat Ultra Protect SPF50+', brand: 'Banana Boat', price: 'S$14.90', rating: 4.3, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=BananaBoat' },{ name: 'Skin Aqua Tone Up UV Essence', brand: 'Skin Aqua', price: 'S$15.90', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=SkinAqua' }], korean: [{ name: 'Beauty of Joseon Relief Sun SPF50+', brand: 'Beauty of Joseon', price: 'S$18.90', rating: 4.8, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=BoJ' },{ name: 'COSRX Aloe Sun Cream', brand: 'COSRX', price: 'S$16.90', rating: 4.5, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },{ name: 'Isntree Sun Gel SPF50+', brand: 'Isntree', price: 'S$19.90', rating: 4.6, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Isntree' },{ name: 'SKIN1004 Centella Sun Fluid', brand: 'SKIN1004', price: 'S$20.90', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=SKIN1004' },{ name: 'Round Lab Birch Sun Cream', brand: 'Round Lab', price: 'S$22.90', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' }] },
    Makeup: { overseas: [{ name: 'Maybelline Fit Me Foundation', brand: 'Maybelline', price: 'S$15.90', rating: 4.4, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Maybelline' },{ name: "L'Oreal True Match Foundation", brand: "L'Oreal", price: 'S$22.90', rating: 4.4, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Loreal' },{ name: 'MAC Studio Fix Fluid', brand: 'MAC', price: 'S$52.00', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=MAC' },{ name: 'Charlotte Tilbury Flawless Filter', brand: 'Charlotte Tilbury', price: 'S$62.00', rating: 4.6, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=CT' },{ name: 'Fenty Beauty Pro Filt\'r Foundation', brand: 'Fenty Beauty', price: 'S$52.00', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Fenty' }], korean: [{ name: 'Laneige Neo Cushion', brand: 'Laneige', price: 'S$42.00', rating: 4.6, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },{ name: 'CLIO Kill Cover Cushion', brand: 'CLIO', price: 'S$32.90', rating: 4.6, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=CLIO' },{ name: 'Romand Juicy Lasting Tint', brand: 'Romand', price: 'S$14.90', rating: 4.7, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Romand' },{ name: 'Etude House Drawing Eye Brow', brand: 'Etude House', price: 'S$6.90', rating: 4.5, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Etude' },{ name: 'Peripera Ink Mood Tint', brand: 'Peripera', price: 'S$12.90', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Peripera' }] },
    'Hair Care': { overseas: [{ name: 'Dove Damage Therapy Shampoo', brand: 'Dove', price: 'S$9.90', rating: 4.4, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Dove' },{ name: 'Pantene Pro-V Shampoo', brand: 'Pantene', price: 'S$11.90', rating: 4.3, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Pantene' },{ name: 'Tsubaki Premium Shampoo', brand: 'Shiseido', price: 'S$16.90', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Tsubaki' },{ name: 'Olaplex No.3 Hair Perfector', brand: 'Olaplex', price: 'S$42.00', rating: 4.5, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Olaplex' },{ name: 'Fino Premium Touch Hair Mask', brand: 'Shiseido', price: 'S$14.90', rating: 4.7, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Fino' }], korean: [{ name: 'Mise en Scene Perfect Serum', brand: 'Mise en Scene', price: 'S$14.90', rating: 4.6, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=MeS' },{ name: 'Ryo Hair Loss Shampoo', brand: 'Ryo', price: 'S$18.90', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Ryo' },{ name: 'Kundal Honey Shampoo', brand: 'Kundal', price: 'S$12.90', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Kundal' },{ name: 'Dr. ForHair Folligen Shampoo', brand: 'Dr. ForHair', price: 'S$22.90', rating: 4.4, reviewCount: 1000, imageUrl: 'https://via.placeholder.com/120x120?text=DrForHair' },{ name: 'Daeng Gi Meo Ri Ki Gold', brand: 'Daeng Gi Meo Ri', price: 'S$25.90', rating: 4.4, reviewCount: 800, imageUrl: 'https://via.placeholder.com/120x120?text=DGMR' }] },
    'Body Care': { overseas: [{ name: 'Dove Body Wash Deeply Nourishing', brand: 'Dove', price: 'S$8.90', rating: 4.5, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Dove' },{ name: 'Aveeno Daily Moisturizing Lotion', brand: 'Aveeno', price: 'S$14.90', rating: 4.5, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Aveeno' },{ name: 'Nivea Body Lotion', brand: 'Nivea', price: 'S$9.90', rating: 4.4, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Nivea' },{ name: 'Vaseline Intensive Care Body Lotion', brand: 'Vaseline', price: 'S$8.90', rating: 4.3, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Vaseline' },{ name: 'Johnson Body Care Lotion', brand: 'Johnson', price: 'S$7.90', rating: 4.3, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Johnson' }], korean: [{ name: 'Illiyoon Ceramide Ato Lotion', brand: 'Illiyoon', price: 'S$22.90', rating: 4.7, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Illiyoon' },{ name: 'Innisfree Green Tea Body Lotion', brand: 'Innisfree', price: 'S$14.90', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },{ name: 'Happy Bath Body Wash', brand: 'Happy Bath', price: 'S$12.90', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=HappyBath' },{ name: 'Round Lab Body Lotion', brand: 'Round Lab', price: 'S$18.90', rating: 4.5, reviewCount: 1000, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' },{ name: 'Amore Pacific Body Cream', brand: 'Amore Pacific', price: 'S$28.90', rating: 4.3, reviewCount: 800, imageUrl: 'https://via.placeholder.com/120x120?text=AP' }] },
    'Mens Care': { overseas: [{ name: 'Nivea Men Deep Clean Face Wash', brand: 'Nivea', price: 'S$9.90', rating: 4.4, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Nivea' },{ name: 'Bulldog Original Moisturizer', brand: 'Bulldog', price: 'S$16.90', rating: 4.4, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Bulldog' },{ name: "L'Oreal Men Expert Hydra Power", brand: "L'Oreal", price: 'S$18.90', rating: 4.3, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Loreal' },{ name: 'Clinique For Men Moisturizer', brand: 'Clinique', price: 'S$38.00', rating: 4.5, reviewCount: 900, imageUrl: 'https://via.placeholder.com/120x120?text=Clinique' },{ name: 'Biore Men Face Wash', brand: 'Biore', price: 'S$8.90', rating: 4.3, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Biore' }], korean: [{ name: 'Laneige Homme Blue Energy', brand: 'Laneige', price: 'S$38.00', rating: 4.6, reviewCount: 1300, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },{ name: 'Innisfree Forest for Men', brand: 'Innisfree', price: 'S$22.90', rating: 4.5, reviewCount: 1100, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },{ name: 'Dr. Jart+ Cicapair Men', brand: 'Dr. Jart+', price: 'S$28.90', rating: 4.4, reviewCount: 800, imageUrl: 'https://via.placeholder.com/120x120?text=DrJart' },{ name: 'Missha For Men Sun Block', brand: 'Missha', price: 'S$18.90', rating: 4.3, reviewCount: 700, imageUrl: 'https://via.placeholder.com/120x120?text=Missha' },{ name: 'COSRX BHA Blackhead Power', brand: 'COSRX', price: 'S$22.90', rating: 4.6, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' }] },
  },
  malaysia: {
    Skincare: {
      overseas: [
        { name: 'Skintific 5X Ceramide Serum', brand: 'Skintific', price: 'RM49.90', rating: 4.7, reviewCount: 4500, imageUrl: 'https://via.placeholder.com/120x120?text=Skintific' },
        { name: 'The Ordinary Niacinamide 10%', brand: 'The Ordinary', price: 'RM35.00', rating: 4.5, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=Ordinary' },
        { name: 'Cetaphil Moisturizing Cream', brand: 'Cetaphil', price: 'RM59.90', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Cetaphil' },
        { name: 'Garnier Light Serum', brand: 'Garnier', price: 'RM29.90', rating: 4.3, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Garnier' },
        { name: 'Safi Rania Gold Essence', brand: 'Safi', price: 'RM69.90', rating: 4.4, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Safi' },
      ],
      korean: [
        { name: 'COSRX Snail Mucin 96% Essence', brand: 'COSRX', price: 'RM69.00', rating: 4.8, reviewCount: 3800, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },
        { name: 'Some By Mi AHA BHA PHA Serum', brand: 'Some By Mi', price: 'RM55.00', rating: 4.6, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=SomeByMi' },
        { name: 'Anua Heartleaf 77% Toner', brand: 'Anua', price: 'RM65.00', rating: 4.6, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Anua' },
        { name: 'Torriden DIVE-IN Serum', brand: 'Torriden', price: 'RM59.00', rating: 4.7, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Torriden' },
        { name: 'Beauty of Joseon Glow Serum', brand: 'Beauty of Joseon', price: 'RM55.00', rating: 4.6, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=BoJ' },
      ]
    },
    Cleansing: { overseas: [{ name: 'Skintific Amino Acid Cleanser', brand: 'Skintific', price: 'RM39.90', rating: 4.6, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Skintific' },{ name: 'Cetaphil Gentle Cleanser', brand: 'Cetaphil', price: 'RM39.90', rating: 4.5, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Cetaphil' },{ name: 'Garnier Micellar Water', brand: 'Garnier', price: 'RM22.90', rating: 4.4, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Garnier' },{ name: 'Simple Micellar Gel Wash', brand: 'Simple', price: 'RM29.90', rating: 4.3, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Simple' },{ name: 'Safi White Expert Cleanser', brand: 'Safi', price: 'RM19.90', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Safi' }], korean: [{ name: 'COSRX Low pH Cleanser', brand: 'COSRX', price: 'RM39.00', rating: 4.6, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },{ name: 'Some By Mi Bye Bye Blackhead', brand: 'Some By Mi', price: 'RM45.00', rating: 4.5, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=SomeByMi' },{ name: 'Innisfree Green Tea Foam', brand: 'Innisfree', price: 'RM35.00', rating: 4.4, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },{ name: 'Round Lab Dokdo Cleanser', brand: 'Round Lab', price: 'RM45.00', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' },{ name: 'Anua Heartleaf Cleansing Oil', brand: 'Anua', price: 'RM55.00', rating: 4.6, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Anua' }] },
    'Sun Care': { overseas: [{ name: 'Biore UV Aqua Rich SPF50+', brand: 'Biore', price: 'RM39.90', rating: 4.6, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=Biore' },{ name: 'Neutrogena Ultra Sheer SPF50+', brand: 'Neutrogena', price: 'RM42.90', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Neutrogena' },{ name: 'Skin Aqua Tone Up UV', brand: 'Skin Aqua', price: 'RM35.90', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=SkinAqua' },{ name: 'Anessa Perfect UV Milk', brand: 'Anessa', price: 'RM89.90', rating: 4.7, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Anessa' },{ name: 'Banana Boat SPF50+', brand: 'Banana Boat', price: 'RM29.90', rating: 4.3, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=BananaBoat' }], korean: [{ name: 'Beauty of Joseon Relief Sun', brand: 'Beauty of Joseon', price: 'RM55.00', rating: 4.8, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=BoJ' },{ name: 'COSRX Aloe Sun Cream', brand: 'COSRX', price: 'RM49.00', rating: 4.5, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },{ name: 'Isntree Sun Gel', brand: 'Isntree', price: 'RM55.00', rating: 4.6, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Isntree' },{ name: 'Round Lab Birch Sun', brand: 'Round Lab', price: 'RM59.00', rating: 4.5, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' },{ name: 'SKIN1004 Sun Fluid', brand: 'SKIN1004', price: 'RM52.00', rating: 4.5, reviewCount: 1000, imageUrl: 'https://via.placeholder.com/120x120?text=SKIN1004' }] },
    Makeup: { overseas: [{ name: 'Maybelline Fit Me', brand: 'Maybelline', price: 'RM39.90', rating: 4.4, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=Maybelline' },{ name: 'Safi Rania Gold CC Cream', brand: 'Safi', price: 'RM49.90', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Safi' },{ name: "L'Oreal True Match", brand: "L'Oreal", price: 'RM59.90', rating: 4.4, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Loreal' },{ name: 'MAC Studio Fix', brand: 'MAC', price: 'RM145.00', rating: 4.5, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=MAC' },{ name: 'Silky Girl Magic BB Cream', brand: 'Silky Girl', price: 'RM25.90', rating: 4.3, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=SilkyGirl' }], korean: [{ name: 'Laneige Neo Cushion', brand: 'Laneige', price: 'RM129.00', rating: 4.6, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },{ name: 'CLIO Kill Cover Cushion', brand: 'CLIO', price: 'RM89.00', rating: 4.6, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=CLIO' },{ name: 'Romand Juicy Lasting Tint', brand: 'Romand', price: 'RM39.00', rating: 4.7, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Romand' },{ name: 'Etude House Drawing Eye Brow', brand: 'Etude House', price: 'RM15.00', rating: 4.5, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Etude' },{ name: 'Peripera Ink Mood Tint', brand: 'Peripera', price: 'RM35.00', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Peripera' }] },
    'Hair Care': { overseas: [{ name: 'Dove Damage Therapy', brand: 'Dove', price: 'RM19.90', rating: 4.4, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Dove' },{ name: 'Pantene Pro-V Shampoo', brand: 'Pantene', price: 'RM22.90', rating: 4.3, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Pantene' },{ name: 'Tsubaki Premium Shampoo', brand: 'Shiseido', price: 'RM39.90', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Tsubaki' },{ name: 'Loreal Elseve Total Repair', brand: "L'Oreal", price: 'RM25.90', rating: 4.4, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Loreal' },{ name: 'Fino Premium Touch Hair Mask', brand: 'Shiseido', price: 'RM35.90', rating: 4.7, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Fino' }], korean: [{ name: 'Mise en Scene Perfect Serum', brand: 'Mise en Scene', price: 'RM35.00', rating: 4.6, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=MeS' },{ name: 'Ryo Hair Loss Shampoo', brand: 'Ryo', price: 'RM49.00', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Ryo' },{ name: 'Kundal Honey Shampoo', brand: 'Kundal', price: 'RM39.00', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Kundal' },{ name: 'Dr. ForHair Folligen', brand: 'Dr. ForHair', price: 'RM55.00', rating: 4.4, reviewCount: 1000, imageUrl: 'https://via.placeholder.com/120x120?text=DrForHair' },{ name: 'Daeng Gi Meo Ri', brand: 'Daeng Gi Meo Ri', price: 'RM65.00', rating: 4.4, reviewCount: 800, imageUrl: 'https://via.placeholder.com/120x120?text=DGMR' }] },
    'Body Care': { overseas: [{ name: 'Dove Body Wash', brand: 'Dove', price: 'RM15.90', rating: 4.5, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=Dove' },{ name: 'Aveeno Body Lotion', brand: 'Aveeno', price: 'RM35.90', rating: 4.5, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Aveeno' },{ name: 'Nivea Body Lotion', brand: 'Nivea', price: 'RM18.90', rating: 4.4, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Nivea' },{ name: 'Vaseline Body Lotion', brand: 'Vaseline', price: 'RM15.90', rating: 4.3, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Vaseline' },{ name: 'Johnson Body Lotion', brand: 'Johnson', price: 'RM12.90', rating: 4.3, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Johnson' }], korean: [{ name: 'Illiyoon Ceramide Ato Lotion', brand: 'Illiyoon', price: 'RM59.00', rating: 4.7, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Illiyoon' },{ name: 'Innisfree Green Tea Body', brand: 'Innisfree', price: 'RM39.00', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },{ name: 'Happy Bath Body Wash', brand: 'Happy Bath', price: 'RM29.00', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=HappyBath' },{ name: 'Round Lab Body Lotion', brand: 'Round Lab', price: 'RM49.00', rating: 4.5, reviewCount: 900, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' },{ name: 'Amore Pacific Body Cream', brand: 'Amore Pacific', price: 'RM79.00', rating: 4.3, reviewCount: 600, imageUrl: 'https://via.placeholder.com/120x120?text=AP' }] },
    'Mens Care': { overseas: [{ name: 'Nivea Men Deep Clean', brand: 'Nivea', price: 'RM18.90', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Nivea' },{ name: 'Garnier Men TurboLight', brand: 'Garnier', price: 'RM22.90', rating: 4.3, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Garnier' },{ name: 'Biore Men Face Wash', brand: 'Biore', price: 'RM15.90', rating: 4.3, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Biore' },{ name: "L'Oreal Men Expert", brand: "L'Oreal", price: 'RM35.90', rating: 4.4, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Loreal' },{ name: 'Gatsby Facial Wash', brand: 'Gatsby', price: 'RM12.90', rating: 4.2, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Gatsby' }], korean: [{ name: 'Laneige Homme Blue Energy', brand: 'Laneige', price: 'RM99.00', rating: 4.6, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },{ name: 'Innisfree Forest for Men', brand: 'Innisfree', price: 'RM65.00', rating: 4.5, reviewCount: 1000, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },{ name: 'Dr. Jart+ Cicapair Men', brand: 'Dr. Jart+', price: 'RM75.00', rating: 4.4, reviewCount: 800, imageUrl: 'https://via.placeholder.com/120x120?text=DrJart' },{ name: 'Missha For Men', brand: 'Missha', price: 'RM45.00', rating: 4.3, reviewCount: 700, imageUrl: 'https://via.placeholder.com/120x120?text=Missha' },{ name: 'COSRX BHA Blackhead', brand: 'COSRX', price: 'RM55.00', rating: 4.6, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' }] },
  },
  indonesia: {
    Skincare: {
      overseas: [
        { name: 'Skintific 5X Ceramide Barrier Serum', brand: 'Skintific', price: 'Rp149.000', rating: 4.8, reviewCount: 5000, imageUrl: 'https://via.placeholder.com/120x120?text=Skintific' },
        { name: 'Somethinc Niacinamide Moisture Sabi Beet Serum', brand: 'Somethinc', price: 'Rp99.000', rating: 4.7, reviewCount: 4200, imageUrl: 'https://via.placeholder.com/120x120?text=Somethinc' },
        { name: 'Wardah Lightening Series', brand: 'Wardah', price: 'Rp45.000', rating: 4.5, reviewCount: 3800, imageUrl: 'https://via.placeholder.com/120x120?text=Wardah' },
        { name: 'Glad2Glow 5% Niacinamide Moisturizer', brand: 'Glad2Glow', price: 'Rp69.000', rating: 4.6, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=Glad2Glow' },
        { name: 'Avoskin Miraculous Retinol Serum', brand: 'Avoskin', price: 'Rp159.000', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Avoskin' },
      ],
      korean: [
        { name: 'COSRX Snail Mucin 96% Essence', brand: 'COSRX', price: 'Rp189.000', rating: 4.8, reviewCount: 4500, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },
        { name: 'Anua Heartleaf 77% Toner', brand: 'Anua', price: 'Rp175.000', rating: 4.7, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Anua' },
        { name: 'Some By Mi AHA BHA PHA Toner', brand: 'Some By Mi', price: 'Rp149.000', rating: 4.6, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=SomeByMi' },
        { name: 'Torriden DIVE-IN Serum', brand: 'Torriden', price: 'Rp159.000', rating: 4.7, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Torriden' },
        { name: 'SKIN1004 Centella Ampoule', brand: 'SKIN1004', price: 'Rp169.000', rating: 4.6, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=SKIN1004' },
      ]
    },
    Cleansing: { overseas: [{ name: 'Skintific Amino Acid Cleanser', brand: 'Skintific', price: 'Rp79.000', rating: 4.7, reviewCount: 4000, imageUrl: 'https://via.placeholder.com/120x120?text=Skintific' },{ name: 'Somethinc Low pH Cleanser', brand: 'Somethinc', price: 'Rp69.000', rating: 4.5, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=Somethinc' },{ name: 'Wardah Nature Daily Gel', brand: 'Wardah', price: 'Rp29.000', rating: 4.4, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Wardah' },{ name: 'Cetaphil Gentle Cleanser', brand: 'Cetaphil', price: 'Rp129.000', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Cetaphil' },{ name: 'Garnier Micellar Water', brand: 'Garnier', price: 'Rp59.000', rating: 4.4, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Garnier' }], korean: [{ name: 'COSRX Low pH Cleanser', brand: 'COSRX', price: 'Rp99.000', rating: 4.6, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },{ name: 'Some By Mi Bye Bye Blackhead', brand: 'Some By Mi', price: 'Rp109.000', rating: 4.5, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=SomeByMi' },{ name: 'Innisfree Green Tea Foam', brand: 'Innisfree', price: 'Rp79.000', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },{ name: 'Banila Co Clean It Zero', brand: 'Banila Co', price: 'Rp169.000', rating: 4.7, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=BanilaCo' },{ name: 'Round Lab Dokdo Cleanser', brand: 'Round Lab', price: 'Rp119.000', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' }] },
    'Sun Care': { overseas: [{ name: 'Skintific Ultra Light Sunscreen', brand: 'Skintific', price: 'Rp79.000', rating: 4.7, reviewCount: 4500, imageUrl: 'https://via.placeholder.com/120x120?text=Skintific' },{ name: 'Somethinc Glowing Up Sunscreen', brand: 'Somethinc', price: 'Rp89.000', rating: 4.6, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Somethinc' },{ name: 'Wardah UV Shield SPF50', brand: 'Wardah', price: 'Rp39.000', rating: 4.4, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=Wardah' },{ name: 'Biore UV Aqua Rich', brand: 'Biore', price: 'Rp69.000', rating: 4.5, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Biore' },{ name: 'Skin Aqua UV Moisture Gel', brand: 'Skin Aqua', price: 'Rp55.000', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=SkinAqua' }], korean: [{ name: 'Beauty of Joseon Relief Sun', brand: 'Beauty of Joseon', price: 'Rp149.000', rating: 4.8, reviewCount: 3800, imageUrl: 'https://via.placeholder.com/120x120?text=BoJ' },{ name: 'COSRX Aloe Sun Cream', brand: 'COSRX', price: 'Rp129.000', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' },{ name: 'Isntree Sun Gel', brand: 'Isntree', price: 'Rp139.000', rating: 4.6, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Isntree' },{ name: 'SKIN1004 Centella Sun Fluid', brand: 'SKIN1004', price: 'Rp145.000', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=SKIN1004' },{ name: 'Round Lab Birch Sun', brand: 'Round Lab', price: 'Rp155.000', rating: 4.5, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' }] },
    Makeup: { overseas: [{ name: 'Somethinc Copy Paste Cushion', brand: 'Somethinc', price: 'Rp179.000', rating: 4.6, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Somethinc' },{ name: 'Wardah Colorfit Velvet Matte Lip', brand: 'Wardah', price: 'Rp59.000', rating: 4.5, reviewCount: 3200, imageUrl: 'https://via.placeholder.com/120x120?text=Wardah' },{ name: 'Maybelline Fit Me', brand: 'Maybelline', price: 'Rp89.000', rating: 4.4, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=Maybelline' },{ name: 'Make Over PowerStay Foundation', brand: 'Make Over', price: 'Rp139.000', rating: 4.5, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=MakeOver' },{ name: 'Glad2Glow Cushion Foundation', brand: 'Glad2Glow', price: 'Rp99.000', rating: 4.4, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Glad2Glow' }], korean: [{ name: 'CLIO Kill Cover Cushion', brand: 'CLIO', price: 'Rp229.000', rating: 4.6, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=CLIO' },{ name: 'Romand Juicy Lasting Tint', brand: 'Romand', price: 'Rp99.000', rating: 4.7, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Romand' },{ name: 'Laneige Neo Cushion', brand: 'Laneige', price: 'Rp389.000', rating: 4.6, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },{ name: 'Etude House Drawing Eye Brow', brand: 'Etude House', price: 'Rp39.000', rating: 4.5, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Etude' },{ name: 'Peripera Ink Mood Tint', brand: 'Peripera', price: 'Rp89.000', rating: 4.5, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Peripera' }] },
    'Hair Care': { overseas: [{ name: 'Pantene Pro-V Shampoo', brand: 'Pantene', price: 'Rp35.000', rating: 4.4, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=Pantene' },{ name: 'Dove Damage Therapy', brand: 'Dove', price: 'Rp39.000', rating: 4.4, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Dove' },{ name: 'TRESemme Keratin Smooth', brand: 'TRESemme', price: 'Rp49.000', rating: 4.3, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Tresemme' },{ name: 'Clear Anti Dandruff', brand: 'Clear', price: 'Rp29.000', rating: 4.3, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Clear' },{ name: 'Fino Premium Touch Mask', brand: 'Shiseido', price: 'Rp79.000', rating: 4.7, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Fino' }], korean: [{ name: 'Mise en Scene Perfect Serum', brand: 'Mise en Scene', price: 'Rp89.000', rating: 4.6, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=MeS' },{ name: 'Ryo Hair Loss Shampoo', brand: 'Ryo', price: 'Rp129.000', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=Ryo' },{ name: 'Kundal Honey Shampoo', brand: 'Kundal', price: 'Rp99.000', rating: 4.5, reviewCount: 1800, imageUrl: 'https://via.placeholder.com/120x120?text=Kundal' },{ name: 'Dr. ForHair Folligen', brand: 'Dr. ForHair', price: 'Rp149.000', rating: 4.4, reviewCount: 1000, imageUrl: 'https://via.placeholder.com/120x120?text=DrForHair' },{ name: 'Daeng Gi Meo Ri', brand: 'Daeng Gi Meo Ri', price: 'Rp159.000', rating: 4.4, reviewCount: 800, imageUrl: 'https://via.placeholder.com/120x120?text=DGMR' }] },
    'Body Care': { overseas: [{ name: 'Dove Body Wash', brand: 'Dove', price: 'Rp35.000', rating: 4.5, reviewCount: 3500, imageUrl: 'https://via.placeholder.com/120x120?text=Dove' },{ name: 'Nivea Body Lotion', brand: 'Nivea', price: 'Rp39.000', rating: 4.4, reviewCount: 3000, imageUrl: 'https://via.placeholder.com/120x120?text=Nivea' },{ name: 'Vaseline Body Lotion', brand: 'Vaseline', price: 'Rp29.000', rating: 4.3, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Vaseline' },{ name: 'Marina UV White Body Lotion', brand: 'Marina', price: 'Rp22.000', rating: 4.3, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Marina' },{ name: 'Citra Body Lotion', brand: 'Citra', price: 'Rp19.000', rating: 4.2, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Citra' }], korean: [{ name: 'Illiyoon Ceramide Ato Lotion', brand: 'Illiyoon', price: 'Rp149.000', rating: 4.7, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Illiyoon' },{ name: 'Innisfree Green Tea Body', brand: 'Innisfree', price: 'Rp99.000', rating: 4.4, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },{ name: 'Happy Bath Body Wash', brand: 'Happy Bath', price: 'Rp79.000', rating: 4.5, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=HappyBath' },{ name: 'Round Lab Body Lotion', brand: 'Round Lab', price: 'Rp129.000', rating: 4.5, reviewCount: 900, imageUrl: 'https://via.placeholder.com/120x120?text=RoundLab' },{ name: 'Aekyung Kerasys Body Wash', brand: 'Kerasys', price: 'Rp69.000', rating: 4.3, reviewCount: 800, imageUrl: 'https://via.placeholder.com/120x120?text=Kerasys' }] },
    'Mens Care': { overseas: [{ name: 'Nivea Men Deep Clean', brand: 'Nivea', price: 'Rp39.000', rating: 4.4, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Nivea' },{ name: 'Garnier Men TurboLight', brand: 'Garnier', price: 'Rp35.000', rating: 4.3, reviewCount: 2200, imageUrl: 'https://via.placeholder.com/120x120?text=Garnier' },{ name: 'Biore Men Face Wash', brand: 'Biore', price: 'Rp29.000', rating: 4.3, reviewCount: 2500, imageUrl: 'https://via.placeholder.com/120x120?text=Biore' },{ name: 'Gatsby Facial Wash', brand: 'Gatsby', price: 'Rp25.000', rating: 4.2, reviewCount: 2800, imageUrl: 'https://via.placeholder.com/120x120?text=Gatsby' },{ name: 'Pond\'s Men Energy Charge', brand: 'Pond\'s', price: 'Rp29.000', rating: 4.3, reviewCount: 2000, imageUrl: 'https://via.placeholder.com/120x120?text=Ponds' }], korean: [{ name: 'Laneige Homme Blue Energy', brand: 'Laneige', price: 'Rp289.000', rating: 4.6, reviewCount: 1200, imageUrl: 'https://via.placeholder.com/120x120?text=Laneige' },{ name: 'Innisfree Forest for Men', brand: 'Innisfree', price: 'Rp169.000', rating: 4.5, reviewCount: 1000, imageUrl: 'https://via.placeholder.com/120x120?text=Innisfree' },{ name: 'Dr. Jart+ Cicapair Men', brand: 'Dr. Jart+', price: 'Rp199.000', rating: 4.4, reviewCount: 800, imageUrl: 'https://via.placeholder.com/120x120?text=DrJart' },{ name: 'Missha For Men', brand: 'Missha', price: 'Rp119.000', rating: 4.3, reviewCount: 700, imageUrl: 'https://via.placeholder.com/120x120?text=Missha' },{ name: 'COSRX BHA Blackhead', brand: 'COSRX', price: 'Rp139.000', rating: 4.6, reviewCount: 1500, imageUrl: 'https://via.placeholder.com/120x120?text=COSRX' }] },
  }
};

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(DB_NAME);

    // Drop old data
    const collections = ['processed_keywords', 'trends', 'sns_platform_stats', 'products', 'raw_reviews', 'leaderboard', 'whitespace_products'];
    for (const col of collections) {
      await db.collection(col).deleteMany({});
    }
    console.log('Old data cleared');

    const allKeywords = [];
    const allProducts = [];
    const allReviews = [];
    const allTrends = [];

    // Process data for all countries
    const countries = ['usa', 'japan', 'singapore', 'malaysia', 'indonesia'];

    for (const [category, types] of Object.entries(data.usa)) {
      for (const [kwType, items] of Object.entries(types)) {
        for (const item of items) {
          // processed_keywords - 나라별 차별화된 점수
          for (const country of countries) {
            const categoryBoosts = country === 'usa' ? {} : ((countryKeywordBoosts[country] || {})[category] || {});
            const boost = categoryBoosts[item.keyword] || 0;
            const baseVariation = 0; // 나라별 boosts가 차별화 역할 수행
            const adjustedScore = Math.max(30, Math.min(99, item.score + boost + baseVariation));

            // 점수에 따라 trendLevel 재조정
            let adjustedLevel = item.level;
            if (adjustedScore >= 85) adjustedLevel = 'Actionable';
            else if (adjustedScore >= 70) adjustedLevel = 'Growing';
            else adjustedLevel = 'Early';

            const count = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < count; i++) {
              allKeywords.push({
                keyword: item.keyword,
                keywordType: kwType,
                sourceType: 'product_description',
                sourceId: `${country}-${category}-${kwType}-${item.keyword}-${i}`,
                country,
                category,
                trendLevel: adjustedLevel,
                score: adjustedScore + Math.floor(Math.random() * 3 - 1),
                effects: generateEffects(category),
                extractedAt: randomDate(56),
                processedAt: new Date()
              });
            }
          }

          // Products (one per item)
          allProducts.push({
            name: item.product,
            brand: item.brand,
            keywords: [item.keyword],
            keywordType: kwType,
            category,
            trendLevel: item.level,
            score: item.score,
            description: item.desc,
            rating: (4.2 + Math.random() * 0.6).toFixed(1) * 1,
            reviewCount: Math.floor(Math.random() * 4500) + 500,
            imageUrl: getProductImageUrl(item.product, item.brand),
            countries: ['usa', 'japan', 'singapore', 'malaysia', 'indonesia'],
            createdAt: new Date()
          });
        }

        // Generate reviews for USA
        const usaReviews = generateReviews('usa', items);
        allReviews.push(...usaReviews);
      }

      // 나라별 고유 키워드 추가
      for (const country of ['japan', 'singapore', 'malaysia', 'indonesia']) {
        const uniqueData = countryUniqueKeywords[country]?.[category];
        if (uniqueData) {
          for (const [kwType, uniqueItems] of Object.entries(uniqueData)) {
            for (const item of uniqueItems) {
              const count = Math.floor(Math.random() * 3) + 2;
              for (let i = 0; i < count; i++) {
                allKeywords.push({
                  keyword: item.keyword,
                  keywordType: kwType,
                  sourceType: 'product_description',
                  sourceId: `${country}-${category}-${kwType}-unique-${item.keyword}-${i}`,
                  country,
                  category,
                  trendLevel: item.level,
                  score: item.score + Math.floor(Math.random() * 5 - 2),
                  effects: generateEffects(category),
                  extractedAt: randomDate(56),
                  processedAt: new Date()
                });
              }
              // Add product for unique keyword
              allProducts.push({
                name: item.product,
                brand: item.brand,
                keywords: [item.keyword],
                keywordType: kwType,
                category,
                trendLevel: item.level,
                score: item.score,
                description: item.desc,
                rating: (4.2 + Math.random() * 0.6).toFixed(1) * 1,
                reviewCount: Math.floor(Math.random() * 3000) + 500,
                imageUrl: getProductImageUrl(item.product, item.brand),
                countries: [country],
                createdAt: new Date()
              });
            }
            // Generate reviews for unique keywords
            const uniqueReviews = generateReviews(country, uniqueItems);
            allReviews.push(...uniqueReviews);
          }
        }
      }

      // Generate trends (combinations) for each category - 7 combos per category
      const types_obj = types;
      const ingredients = types_obj.ingredient || [];
      const formulas = types_obj.formulas || [];
      const effects = types_obj.effects || [];
      const moods = types_obj.mood || [];

      // Create 7 unique combinations by picking different keyword combos
      const comboCount = 7;
      for (let ci = 0; ci < comboCount; ci++) {
        const ing = ingredients[ci % ingredients.length];
        const form = formulas[ci % formulas.length];
        const eff = effects[ci % effects.length];
        const mood = moods[ci % moods.length];

        if (!ing || !form || !eff || !mood) continue;

        const avgScore = (ing.score + form.score + eff.score + mood.score) / 4;
        const trendLevel = avgScore >= 85 ? 'Actionable' : avgScore >= 70 ? 'Growing' : 'Early';

        const countries = ['usa', 'japan', 'singapore', 'malaysia', 'indonesia'];
        for (const country of countries) {
          const countryAdj = country === 'usa' ? 0 : Math.floor(Math.random() * 10 - 5);
          const finalScore = Math.round((avgScore + countryAdj) * 100) / 100;

          allTrends.push({
            combination: `${ing.keyword} + ${form.keyword} + ${eff.keyword} + ${mood.keyword}`,
            ingredients: [ing.keyword],
            formulas: [form.keyword],
            effects: [eff.keyword],
            moods: [mood.keyword],
            score: finalScore,
            category: trendLevel,
            mainCategory: category,
            country,
            avgRank: Math.floor(Math.random() * 15) + 1,
            productCount: Math.floor(Math.random() * 5) + 1,
            signals: generateSignals(trendLevel),
            synergyScore: (0.45 + Math.random() * 0.15).toFixed(3) * 1,
            calculatedAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }

    // Also generate reviews for other countries
    for (const country of ['japan', 'singapore', 'malaysia', 'indonesia']) {
      for (const [category, types] of Object.entries(data.usa)) {
        const allItems = Object.values(types).flat();
        const countryReviews = generateReviews(country, allItems);
        allReviews.push(...countryReviews);
      }
    }

    // Insert all data
    if (allKeywords.length) {
      await db.collection('processed_keywords').insertMany(allKeywords);
      console.log(`processed_keywords: ${allKeywords.length}`);
    }
    if (allProducts.length) {
      await db.collection('products').insertMany(allProducts);
      console.log(`products: ${allProducts.length}`);
    }
    if (allReviews.length) {
      await db.collection('raw_reviews').insertMany(allReviews);
      console.log(`raw_reviews: ${allReviews.length}`);
    }
    if (allTrends.length) {
      await db.collection('trends').insertMany(allTrends);
      console.log(`trends: ${allTrends.length}`);
    }

    // SNS platform stats (카테고리별 생성)
    const snsDocs = [];
    for (const country of countries) {
      for (const [category, types] of Object.entries(data.usa)) {
        const platformData = generateSNSData(types, category, country);
        for (const p of platformData) {
          snsDocs.push({
            platform: p.platform,
            keywords: p.keywords,
            country,
            category,
            date: new Date()
          });
        }
      }
    }
    await db.collection('sns_platform_stats').insertMany(snsDocs);
    console.log(`sns_platform_stats: ${snsDocs.length}`);

    // WhiteSpace products
    const wsDocs = [];
    for (const [country, categories] of Object.entries(whitespaceProducts)) {
      for (const [category, types] of Object.entries(categories)) {
        for (const product of types.overseas || []) {
          const overseasImageUrl = getProductImageUrl(product.name, product.brand);
          wsDocs.push({ ...product, imageUrl: overseasImageUrl, country, category, type: 'overseas', createdAt: new Date() });
        }
        for (const product of types.korean || []) {
          const imageUrl = getProductImageUrl(product.name, product.brand);
          wsDocs.push({ ...product, imageUrl, country, category, type: 'korean', createdAt: new Date() });
        }
      }
    }
    if (wsDocs.length) {
      await db.collection('whitespace_products').insertMany(wsDocs);
      console.log(`whitespace_products: ${wsDocs.length}`);
    }

    // Create indexes
    await db.collection('processed_keywords').createIndex({ country: 1, keywordType: 1, category: 1, trendLevel: 1 });
    await db.collection('processed_keywords').createIndex({ keyword: 1, country: 1 });
    await db.collection('products').createIndex({ keywords: 1, category: 1 });
    await db.collection('products').createIndex({ country: 1 });
    await db.collection('trends').createIndex({ country: 1, category: 1, mainCategory: 1 });
    await db.collection('raw_reviews').createIndex({ country: 1, keyword: 1, sentiment: 1 });
    await db.collection('raw_reviews').createIndex({ country: 1, postedAt: -1 });
    await db.collection('sns_platform_stats').createIndex({ country: 1, platform: 1 });
    await db.collection('whitespace_products').createIndex({ country: 1, category: 1, type: 1 });

    console.log('\n=== Seed Complete ===');
    for (const col of ['processed_keywords', 'products', 'raw_reviews', 'trends', 'sns_platform_stats', 'whitespace_products']) {
      const count = await db.collection(col).countDocuments();
      console.log(`  ${col}: ${count}`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

function generateEffects(category) {
  const pools = {
    Skincare: ['hydration', 'anti-aging', 'brightening', 'soothing', 'barrier repair'],
    Cleansing: ['gentle cleansing', 'pore care', 'oil control', 'soothing'],
    'Sun Care': ['UV protection', 'no white cast', 'lightweight', 'moisturizing'],
    Makeup: ['long-lasting', 'full coverage', 'dewy finish', 'oil control'],
    'Hair Care': ['damage repair', 'frizz control', 'scalp care', 'moisturizing'],
    'Body Care': ['moisturizing', 'barrier repair', 'brightening'],
    'Mens Care': ['oil control', 'soothing', 'pore care'],
  };
  const pool = pools[category] || pools.Skincare;
  return pool.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2));
}

function generateSignals(level) {
  if (level === 'Actionable') return { SNS: 75 + Math.floor(Math.random() * 25), Retail: 65 + Math.floor(Math.random() * 30), Review: 70 + Math.floor(Math.random() * 25) };
  if (level === 'Growing') return { SNS: 50 + Math.floor(Math.random() * 35), Retail: 35 + Math.floor(Math.random() * 35), Review: 45 + Math.floor(Math.random() * 35) };
  return { SNS: 30 + Math.floor(Math.random() * 35), Retail: 15 + Math.floor(Math.random() * 30), Review: 25 + Math.floor(Math.random() * 35) };
}

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d;
}

seed();
