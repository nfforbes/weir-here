import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/solutions/licensed-practical-nurses'),
  title: 'Licensed Practical Nurses (LPNs) in Jamaica | Weir Here Staffing',
  description:
    'Hire credential-verified Licensed Practical Nurses (LPNs) in Jamaica for acute care, long-term care, rehab, and skilled nursing. Flexible shifts — Weir Here Staffing Solutions, Kingston.',
};

const benefits = [
  'Licensed and verified LPNs for acute care, long-term care, and clinics',
  'Experience across medical-surgical, rehab, and skilled nursing',
  'Flexible shifts: per diem, contract, and permanent',
  'Fast credentialing and onboarding support',
];

export default function LicensedPracticalNursesPage() {
  return (
    <SolutionHeroTemplate
      title="Licensed Practical Nurses"
      description="We provide qualified Licensed Practical Nurses (LPNs) for hospitals, nursing homes, assisted living facilities, and outpatient clinics. Our LPNs are credential-verified and ready to support your patient care needs."
      benefits={benefits}
      imageSrc="/Black_nurse_babysitting_child_4e246048c5.jpeg"
      solutionName="Licensed Practical Nurses"
      IconComponent={AssignmentIndIcon}
    />
  );
}
