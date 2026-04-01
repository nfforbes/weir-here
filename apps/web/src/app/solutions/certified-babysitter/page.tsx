import ChildCareIcon from '@mui/icons-material/ChildCare';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/solutions/certified-babysitter'),
  title: 'Certified Babysitters in Jamaica | Weir Here Staffing',
  description:
    'Hire pediatric-trained, vetted babysitters and childcare providers in Jamaica. Weir Here Staffing Solutions places certified babysitters for families in Kingston and beyond.',
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
      imageSrc="/Black_nurse_babysitting_child_4e246048c5.jpeg"
      solutionName="Babysitters"
      IconComponent={ChildCareIcon}
    />
  );
}
