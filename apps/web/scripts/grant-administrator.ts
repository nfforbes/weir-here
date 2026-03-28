/**
 * One-off / ops: add `administrator` to a user's personas by email.
 * Usage (from repo root): npx tsx apps/web/scripts/grant-administrator.ts you@email.com
 * Requires MONGODB_URI (e.g. root .env.local loaded below).
 */
import path from 'path';
import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';

const repoRoot = path.resolve(__dirname, '../../..');
const appRoot = path.resolve(__dirname, '..');

loadEnvConfig(repoRoot);
loadEnvConfig(appRoot);

async function main() {
  const raw = process.argv[2];
  if (!raw?.trim()) {
    console.error('Usage: npx tsx apps/web/scripts/grant-administrator.ts <email>');
    process.exit(1);
  }
  const email = raw.trim().toLowerCase();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to .env.local at the repo root or apps/web.');
    process.exit(1);
  }

  const { default: User } = await import('../src/models/User');
  await mongoose.connect(uri);

  const user = await User.findOne({
    email: { $regex: new RegExp(`^${escapeRe(email)}$`, 'i') },
  });

  if (!user) {
    console.error(`No user found with email: ${email}. Sign in once so bootstrap creates the account.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  if (user.personas.includes('administrator')) {
    console.log(`Already has administrator: ${email}`);
    await mongoose.disconnect();
    return;
  }

  user.personas = [...user.personas, 'administrator'];
  await user.save();
  console.log(`Added persona "administrator" to ${email}`);
  await mongoose.disconnect();
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
