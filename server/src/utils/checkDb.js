import mongoose from 'mongoose';
import { config } from '../config/env.js';

async function check() {
  console.log('Connecting to:', config.mongoUri);
  await mongoose.connect(config.mongoUri);
  
  const adminDb = mongoose.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log('Available Databases in MongoDB:');
  for (const db of dbs.databases) {
    console.log(` - ${db.name} (${(db.sizeOnDisk / 1024).toFixed(1)} KB)`);
  }

  console.log('\nCollections in current DB (' + mongoose.connection.db.databaseName + '):');
  const collections = await mongoose.connection.db.listCollections().toArray();
  if (collections.length === 0) {
    console.log(' (No collections found in this database)');
  }
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(` - ${col.name}: ${count} document(s)`);
    const docs = await mongoose.connection.db.collection(col.name).find().toArray();
    console.log(`   Data:`, JSON.stringify(docs, null, 2));
  }

  await mongoose.disconnect();
}

check().catch(console.error);
