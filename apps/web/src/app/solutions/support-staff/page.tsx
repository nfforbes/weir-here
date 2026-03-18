import PeopleIcon from '@mui/icons-material/People';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support Staff | Weir Here Staffing',
};

const benefits = [
  'Administrative, clerical, and front-office support',
  'Medical receptionists, schedulers, and patient coordinators',
  'Billing, coding, and health information specialists',
  'Flexible staffing for peak periods and special projects',
];

export default function SupportStaffPage() {
  return (
    <SolutionHeroTemplate
      title="Support Staff"
      description="Healthcare runs on strong support teams. We provide administrative, clerical, and operational staff for medical offices, hospitals, and healthcare organizations. From front desk to back office, we help you stay fully staffed."
      benefits={benefits}
      imageSrc="/Black_orderly_pushing_gurney_12839cff65.jpeg"
      solutionName="Support Staff"
      IconComponent={PeopleIcon}
    />
  );
}
