import HomeWorkIcon from '@mui/icons-material/HomeWork';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/solutions/domestic-care'),
  title: 'Domestic Care Services in Jamaica | Weir Here Staffing',
  description:
    'In-home care aides and companions for seniors and individuals with special needs in Jamaica. Weir Here Staffing Solutions provides vetted domestic caregivers in Kingston.',
};

const benefits = [
  'In-home care aides and companions for seniors and individuals with special needs',
  'Personal care, light housekeeping, and medication reminders',
  'Respite care for family caregivers',
  'Vetted, trained providers for safe and compassionate home care',
];

export default function DomesticCarePage() {
  return (
    <SolutionHeroTemplate
      title="Domestic Care"
      description="We provide qualified domestic care workers for in-home support. Our caregivers assist with activities of daily living, companionship, and household tasks, helping individuals remain safe and comfortable in their own homes."
      benefits={benefits}
      imageSrc="/Black_worker_walking_202603280201.jpeg"
      solutionName="Domestic Care"
      IconComponent={HomeWorkIcon}
    />
  );
}
