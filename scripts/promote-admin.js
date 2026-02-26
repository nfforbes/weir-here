/**
 * Promote a user to administrator by email.
 * Run: node scripts/promote-admin.js
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

const EMAIL = process.argv[2] || 'nfforbes@gmail.com';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const result = await mongoose.connection.db.collection('users').findOneAndUpdate(
      { email: EMAIL },
      { $addToSet: { personas: 'administrator' } },
      { returnDocument: 'after' }
    );
    if (result) {
      console.log(`Promoted ${EMAIL} to administrator. Personas:`, result.personas);
    } else {
      console.log(`User ${EMAIL} not found. They must log in at least once first.`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(console.error);
