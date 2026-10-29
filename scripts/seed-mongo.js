const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const fs = require('fs');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Read MONGODB_URI from .env.local
let uri = process.env.MONGODB_URI;
if (!uri) {
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
    const match = envContent.match(/MONGODB_URI=([^\r\n]+)/);
    if (match && match[1]) {
      uri = match[1].trim();
    }
  } catch (err) {}
}

if (!uri) {
  uri = 'mongodb+srv://protfulio:LDh8KL3JqaCGgOCn@cluster0.bw3blcg.mongodb.net/dimension_street?retryWrites=true&w=majority&appName=Cluster0';
}

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  console.log('Target URI Host:', uri.split('@')[1] ? uri.split('@')[1].split('?')[0] : 'masked');
  
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected successfully to MongoDB Atlas!');

  const cachePath = path.join(__dirname, '../.data-cache.json');
  if (!fs.existsSync(cachePath)) {
    console.error('.data-cache.json not found!');
    process.exit(1);
  }

  const localCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const db = mongoose.connection.db;

  const stripId = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      const copy = { ...item };
      delete copy._id;
      return copy;
    });
  };

  // Helper to sync collection
  async function syncCollection(colName, items) {
    const col = db.collection(colName);
    const existing = await col.countDocuments();
    if (existing === 0 && Array.isArray(items) && items.length > 0) {
      const toInsert = stripId(items);
      await col.insertMany(toInsert);
      console.log(`✓ Inserted ${toInsert.length} documents into '${colName}'`);
    } else {
      console.log(`'${colName}' already has ${existing} documents.`);
    }
  }

  // 1. Products
  await syncCollection('products', localCache.products);

  // 2. Categories
  await syncCollection('categories', localCache.categories);

  // 3. Collections
  await syncCollection('collections', localCache.collections);

  // 4. Reviews
  await syncCollection('reviews', localCache.reviews);

  // 5. Coupons
  await syncCollection('coupons', localCache.coupons);

  // 6. Homepage Sections
  await syncCollection('homepagesections', localCache.homepageSections);

  // 7. Users
  await syncCollection('users', localCache.users);

  // 8. Orders
  await syncCollection('orders', localCache.orders);

  // 9. Navbar Config
  if (localCache.navbarConfig) {
    const navCol = db.collection('navbarconfigs');
    const existingNav = await navCol.countDocuments();
    if (existingNav === 0) {
      const navDoc = { ...localCache.navbarConfig };
      delete navDoc._id;
      await navCol.insertOne(navDoc);
      console.log(`✓ Inserted navbarConfig into 'navbarconfigs'`);
    } else {
      console.log(`'navbarconfigs' already has ${existingNav} documents.`);
    }
  }

  // 10. SEO Config
  if (localCache.seoConfig) {
    const seoCol = db.collection('seoconfigs');
    const existingSeo = await seoCol.countDocuments();
    if (existingSeo === 0) {
      const seoDoc = { ...localCache.seoConfig };
      delete seoDoc._id;
      await seoCol.insertOne(seoDoc);
      console.log(`✓ Inserted seoConfig into 'seoconfigs'`);
    } else {
      console.log(`'seoconfigs' already has ${existingSeo} documents.`);
    }
  }

  // 11. Footer Config
  if (localCache.footerConfig) {
    const footerCol = db.collection('footerconfigs');
    const existingFooter = await footerCol.countDocuments();
    if (existingFooter === 0) {
      const footerDoc = { ...localCache.footerConfig };
      delete footerDoc._id;
      await footerCol.insertOne(footerDoc);
      console.log(`✓ Inserted footerConfig into 'footerconfigs'`);
    } else {
      console.log(`'footerconfigs' already has ${existingFooter} documents.`);
    }
  }

  // 12. Mark system meta so autoSeedMongoIfEmpty knows it is seeded
  const metaCol = db.collection('system_meta');
  await metaCol.updateOne(
    { key: 'initial_seed_completed' },
    { $set: { key: 'initial_seed_completed', completedAt: new Date(), source: 'seed-mongo.js' } },
    { upsert: true }
  );
  console.log(`✓ System meta 'initial_seed_completed' recorded.`);

  console.log('All collections and configuration seeded cleanly to MongoDB Atlas!');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
