/**
 * 키워드 설명 현황 확인 스크립트
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function checkKeywords() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  await client.connect();
  const db = client.db('amore');

  // 모든 유니크 키워드 조회
  const keywords = await db.collection('processed_keywords').aggregate([
    { $group: {
      _id: '$keyword',
      keywordType: { $first: '$keywordType' },
      hasDescription: { $first: { $cond: [{ $and: [{ $ne: ['$description', null] }, { $ne: ['$description', ''] }] }, true, false] } }
    }},
    { $sort: { _id: 1 } }
  ]).toArray();

  const withDesc = keywords.filter(k => k.hasDescription);
  const withoutDesc = keywords.filter(k => !k.hasDescription);

  console.log('총 키워드 수:', keywords.length);
  console.log('설명 있음:', withDesc.length);
  console.log('설명 없음:', withoutDesc.length);
  console.log('\n설명 없는 키워드 목록 (타입별):');

  const byType = {};
  withoutDesc.forEach(k => {
    const type = k.keywordType || 'unknown';
    if (!byType[type]) byType[type] = [];
    byType[type].push(k._id);
  });

  for (const [type, kws] of Object.entries(byType)) {
    console.log(`\n[${type}] (${kws.length}개):`);
    kws.forEach(k => console.log(' -', k));
  }

  await client.close();
}

checkKeywords().catch(console.error);
