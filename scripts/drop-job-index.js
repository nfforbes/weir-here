/**
 * One-time script to drop the problematic text index on jobs collection.
 * Run: node scripts/drop-job-index.js
 */
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = fs.readFileSync(envPath, 'utf8');
  env.split('\n').forEach((line) => {
    const [key, ...v] = line.split('=');
    if (key && v.length) process.env[key.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
} catch (_) {}
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const indexes = await mongoose.connection.db.collection('jobs').indexes();
    const toDrop = indexes.find((i) => i.name && (i.name.includes('text') || i.name.includes('title')));
    if (toDrop) {
      await mongoose.connection.db.collection('jobs').dropIndex(toDrop.name);
      console.log('Dropped index:', toDrop.name);
    } else {
      console.log('No text index found to drop');
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(console.error);
