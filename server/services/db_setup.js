/**
 * DB 컬렉션 초기화 및 인덱스 생성
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'amore';

async function setupCollections() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DATABASE
    });
    console.log('✅ MongoDB 연결 성공');
    
    const db = mongoose.connection.db;
    
    // 1. processed_keywords 컬렉션 생성 및 인덱스
    await db.createCollection('processed_keywords');
    await db.collection('processed_keywords').createIndexes([
      { key: { keyword: 1, country: 1, category: 1 } },
      { key: { keywordType: 1 } },
      { key: { sourceId: 1 } },
      { key: { extractedAt: -1 } }
    ]);
    console.log('✅ processed_keywords 컬렉션 생성 완료');
    
    // 2. trends 컬렉션 생성 및 인덱스
    await db.createCollection('trends');
    await db.collection('trends').createIndexes([
      { key: { country: 1, category: 1, status: 1 } },
      { key: { score: -1 } },
      { key: { combination: 1 } },
      { key: { calculatedAt: -1 } }
    ]);
    console.log('✅ trends 컬렉션 생성 완료');
    
    // 3. sns_platform_stats 컬렉션 생성 및 인덱스
    await db.createCollection('sns_platform_stats');
    await db.collection('sns_platform_stats').createIndexes([
      { key: { platform: 1, country: 1, date: -1 } },
      { key: { date: -1 } }
    ]);
    console.log('✅ sns_platform_stats 컬렉션 생성 완료');
    
    // 4. leaderboard 컬렉션 생성 및 인덱스
    await db.createCollection('leaderboard');
    await db.collection('leaderboard').createIndexes([
      { key: { country: 1, mainCategory: 1, itemType: 1, trendLevel: 1 } },
      { key: { updatedAt: -1 } }
    ]);
    console.log('✅ leaderboard 컬렉션 생성 완료');
    
    // 5. combination_leaderboard 컬렉션 생성 (꿀조합 리더보드)
    await db.createCollection('combination_leaderboard');
    await db.collection('combination_leaderboard').createIndexes([
      { key: { country: 1, category: 1 } },
      { key: { score: -1 } },
      { key: { calculatedAt: -1 } }
    ]);
    console.log('✅ combination_leaderboard 컬렉션 생성 완료');
    
    console.log('🎉 모든 컬렉션 생성 완료!');
    
  } catch (error) {
    console.error('❌ 컬렉션 생성 오류:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  setupCollections().catch(console.error);
}

export default setupCollections;

