/**
 * Inserts default testimonials if the collection is empty (original static copy from the site).
 * Usage: npx tsx apps/web/scripts/seed-testimonials.ts
 */
import path from 'path';
import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';

const repoRoot = path.resolve(__dirname, '../../..');
const appRoot = path.resolve(__dirname, '..');

loadEnvConfig(repoRoot);
loadEnvConfig(appRoot);

const defaults = [
  {
    quote:
      'We needed reliable nursing coverage on short notice. Weir Here understood our census pressures and sent vetted staff who arrived ready to work. Communication was clear from first call to placement.',
    authorName: 'Director of Nursing',
    authorTitle: '',
    context: 'Acute care facility, Kingston region',
    sortOrder: 10,
  },
  {
    quote:
      'As an employer, we were drowning in unqualified applications elsewhere. Weir Here’s team screened for credentials and culture fit so our hiring managers could focus on real conversations.',
    authorName: 'HR Business Partner',
    authorTitle: '',
    context: 'Regional health services group',
    sortOrder: 20,
  },
  {
    quote:
      'They treated my job search with respect—transparent about roles, responsive after interviews, and honest when a role wasn’t the right match. I felt like more than a number.',
    authorName: 'Registered Nurse',
    authorTitle: 'Placed in long-term care',
    context: '2026',
    sortOrder: 30,
  },
  {
    quote:
      'Domestic support for a family member required trust and consistency. Weir Here matched us with someone professional, background-conscious, and reliable. It made a difficult season manageable.',
    authorName: 'Family caregiver',
    authorTitle: '',
    context: 'Home care client',
    sortOrder: 40,
  },
  {
    quote:
      'Travel and temp staffing is chaotic when vendors overpromise. Weir Here set realistic timelines, documented compliance, and followed through. That reliability keeps them on our preferred list.',
    authorName: 'Workforce Manager',
    authorTitle: '',
    context: 'Multi-site operator',
    sortOrder: 50,
  },
  {
    quote:
      'From first application to offer, the process was streamlined. I appreciated reminders, feedback where possible, and a recruiter who actually returned calls.',
    authorName: 'Allied health professional',
    authorTitle: '',
    context: 'Contract-to-hire placement',
    sortOrder: 60,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set.');
    process.exit(1);
  }

  const { default: Testimonial } = await import('../src/models/Testimonial');
  await mongoose.connect(uri);

  const count = await Testimonial.countDocuments();
  if (count > 0) {
    console.log(`Testimonials collection already has ${count} document(s). Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  await Testimonial.insertMany(
    defaults.map((d) => ({
      ...d,
      avatarUrl: '',
      published: true,
    })),
  );
  console.log(`Inserted ${defaults.length} default testimonials.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
