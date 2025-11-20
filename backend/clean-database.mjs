import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';

async function cleanDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📊 Found collections:', collections.map(c => c.name).join(', '));

    // Collections to clean (everything except users)
    const collectionsToClean = [
      'projects',
      'tasks',
      'updates',
      'clients',
      'attendances',
      'projectsessions',
      'points',
      'messages',
      'trainings',
      'coderrecommendations',
      'leaderships',
      'automationjobs',
      'auditlogs',
      'meetings'
    ];

    console.log('\n🧹 Starting database cleanup...');
    console.log('⚠️  Preserving: users collection (keeping all user accounts and passwords)\n');

    let totalDeleted = 0;

    for (const collectionName of collectionsToClean) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          const result = await collection.deleteMany({});
          console.log(`✅ Deleted ${result.deletedCount} documents from ${collectionName}`);
          totalDeleted += result.deletedCount;
        } else {
          console.log(`⏭️  Skipped ${collectionName} (already empty)`);
        }
      } catch (error) {
        console.log(`⚠️  Collection ${collectionName} doesn't exist or error: ${error.message}`);
      }
    }

    // Show users that are preserved
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    const users = await usersCollection.find({}, { projection: { email: 1, role: 1 } }).toArray();
    
    console.log('\n👥 PRESERVED USERS:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    console.log('\n✨ Database cleanup completed!');
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log(`👥 Total users preserved: ${userCount}`);
    console.log('\n✅ All user accounts and passwords are intact!');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

cleanDatabase();
