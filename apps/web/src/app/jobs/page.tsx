import type { Metadata } from 'next';
import JobsPageClient from './JobsPageClient';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/jobs'),
  title: 'Job Board | Find Healthcare & Domestic Jobs in Jamaica',
  description:
    'Browse open positions for nurses, LPNs, domestic workers, babysitters, and more in Jamaica. Apply today — free for job seekers. Weir Here Staffing Solutions, Kingston.',
};

export default function JobsPage() {
  return <JobsPageClient />;
}
