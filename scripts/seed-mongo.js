const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const fs = require('fs');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch(e) {}

const uri = 'mongodb+srv://loxbd01_db_user:oBXdwapwN4xNtqtX@cluster0.iv15qaw.mongodb.net/dimension_street?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected successfully!');

  const localCache = JSON.parse(fs.readFileSync(path.join(__dirname, '../.data-cache.json'), 'utf8'));

  const db = mongoose.connection.db;

  // 1. Products
  const productsCol = db.collection('products');
  const existingProducts = await productsCol.countDocuments();
  if (existingProducts === 0 && localCache.products && localCache.products.length > 0) {
    const productsToInsert = localCache.products.map(p => {
      const copy = { ...p };
      delete copy._id; // Let Mongo generate _id or keep string id
      return copy;
    });
    await productsCol.insertMany(productsToInsert);
    console.log(`✓ Inserted ${productsToInsert.length} products`);
  } else {
    console.log(`Products collection already has ${existingProducts} documents.`);
  }

  // 2. Categories
  const categoriesCol = db.collection('categories');
  const existingCats = await categoriesCol.countDocuments();
  if (existingCats === 0 && localCache.categories && localCache.categories.length > 0) {
    const catsToInsert = localCache.categories.map(c => {
      const copy = { ...c };
      delete copy._id;
      return copy;
    });
    await categoriesCol.insertMany(catsToInsert);
    console.log(`✓ Inserted ${catsToInsert.length} categories`);
  } else {
    console.log(`Categories collection already has ${existingCats} documents.`);
  }

  // 3. Collections
  const collectionsCol = db.collection('collections');
  const existingCols = await collectionsCol.countDocuments();
  if (existingCols === 0 && localCache.collections && localCache.collections.length > 0) {
    const colsToInsert = localCache.collections.map(c => {
      const copy = { ...c };
      delete copy._id;
      return copy;
    });
    await collectionsCol.insertMany(colsToInsert);
    console.log(`✓ Inserted ${colsToInsert.length} collections`);
  } else {
    console.log(`Collections collection already has ${existingCols} documents.`);
  }

  // 4. Reviews
  const reviewsCol = db.collection('reviews');
  const existingRevs = await reviewsCol.countDocuments();
  if (existingRevs === 0 && localCache.reviews && localCache.reviews.length > 0) {
    const revsToInsert = localCache.reviews.map(r => {
      const copy = { ...r };
      delete copy._id;
      return copy;
    });
    await reviewsCol.insertMany(revsToInsert);
    console.log(`✓ Inserted ${revsToInsert.length} reviews`);
  } else {
    console.log(`Reviews collection already has ${existingRevs} documents.`);
  }

  // 5. Coupons
  const couponsCol = db.collection('coupons');
  const existingCoups = await couponsCol.countDocuments();
  if (existingCoups === 0 && localCache.coupons && localCache.coupons.length > 0) {
    const coupsToInsert = localCache.coupons.map(c => {
      const copy = { ...c };
      delete copy._id;
      return copy;
    });
    await couponsCol.insertMany(coupsToInsert);
    console.log(`✓ Inserted ${coupsToInsert.length} coupons`);
  } else {
    console.log(`Coupons collection already has ${existingCoups} documents.`);
  }

  // 6. Homepage Sections
  const sectionsCol = db.collection('homepagesections');
  const existingSecs = await sectionsCol.countDocuments();
  if (existingSecs === 0 && localCache.homepageSections && localCache.homepageSections.length > 0) {
    const secsToInsert = localCache.homepageSections.map(s => {
      const copy = { ...s };
      delete copy._id;
      return copy;
    });
    await sectionsCol.insertMany(secsToInsert);
    console.log(`✓ Inserted ${secsToInsert.length} homepage sections`);
  } else {
    console.log(`Homepage sections collection already has ${existingSecs} documents.`);
  }

  console.log('Seeding completed cleanly!');
  await mongoose.connection.close();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
