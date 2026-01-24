/**
 * MongoDB 데이터 조회 스크립트
 * 컬렉션별 데이터 확인
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'amore';

async function viewCollections() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DATABASE
    });
    console.log('✅ MongoDB 연결 성공\n');
    
    const db = mongoose.connection.db;
    
    // 컬렉션 목록 조회
    const collections = await db.listCollections().toArray();
    console.log('📋 컬렉션 목록:');
    console.log('='.repeat(50));
    
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  ${col.name.padEnd(30)} ${count.toString().padStart(10)}개 문서`);
    }
    
    console.log('\n');
    
    // 각 컬렉션 샘플 데이터 조회
    const collectionsToView = [
      'raw_retail_sales',
      'raw_reviews',
      'raw_sns_posts',
      'processed_keywords',
      'trends',
      'sns_platform_stats',
      'leaderboard',
      'combination_leaderboard',
      'batch_job_logs'
    ];
    
    for (const colName of collectionsToView) {
      const collection = db.collection(colName);
      const count = await collection.countDocuments();
      
      if (count > 0) {
        console.log(`\n📊 ${colName} (총 ${count}개)`);
        console.log('-'.repeat(50));
        
        const sample = await collection.find({}).limit(2).toArray();
        sample.forEach((doc, idx) => {
          console.log(`\n[샘플 ${idx + 1}]`);
          console.log(JSON.stringify(doc, null, 2));
        });
      } else {
        console.log(`\n📊 ${colName} (데이터 없음)`);
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ 조회 완료');
    
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

// 명령줄 인자로 특정 컬렉션만 조회
const args = process.argv.slice(2);
if (args.length > 0) {
  const collectionName = args[0];
  const limit = parseInt(args[1]) || 5;
  
  mongoose.connect(MONGODB_URI, { dbName: MONGODB_DATABASE })
    .then(async () => {
      const db = mongoose.connection.db;
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      
      console.log(`\n📊 ${collectionName} (총 ${count}개, 최근 ${limit}개 표시)`);
      console.log('='.repeat(50));
      
      const docs = await collection.find({})
        .sort({ _id: -1 })
        .limit(limit)
        .toArray();
      
      docs.forEach((doc, idx) => {
        console.log(`\n[${idx + 1}]`);
        console.log(JSON.stringify(doc, null, 2));
      });
      
      await mongoose.connection.close();
    })
    .catch(console.error);
} else {
  viewCollections();
}

