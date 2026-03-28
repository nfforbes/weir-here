import type { Metadata } from 'next';
import HomePageClient from '@/components/home/HomePageClient';

export const metadata: Metadata = {
  title: 'Healthcare & Domestic Staffing Agency in Jamaica | Weir Here Staffing',
  description:
    'Leading staffing agency in Kingston, Jamaica. We place registered nurses, LPNs, geriatric nurses, doctors, babysitters, and housekeepers with top employers and families. Call (876) 287-9632.',
  openGraph: {
    title: 'Healthcare & Domestic Staffing Agency in Jamaica | Weir Here Staffing',
    description:
      'Leading staffing agency in Kingston, Jamaica. We place registered nurses, LPNs, geriatric nurses, doctors, babysitters, and housekeepers with top employers and families.',
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
