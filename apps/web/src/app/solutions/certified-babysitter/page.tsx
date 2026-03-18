import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Babysitters | Weir Here Staffing',
};

const benefits = [
  'Pediatric-trained caregivers',
  'Flexible scheduling for families and healthcare workers',
  'Safe, reliable care for infants through school-age children',
  'Support for parents who need dependable childcare',
];

export default function CertifiedBabysitterPage() {
  return (
    <SolutionHeroTemplate
      title="Babysitter"
      description="Trusted childcare professionals, including nannies, sitters, and pediatric-trained caregivers who ensure safe reiliable care for infants, children and teens."
      benefits={benefits}
      imageSrc="/babysitter-animation.gif"
      solutionName="Babysitters"
      IconComponent={HealthAndSafetyIcon}
    />
  );
}
