import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Physicians & Advanced Practice Providers | Weir Here Staffing',
};

const benefits = [
  'Board-certified physicians and advanced practice providers',
  'NPs, PAs, and specialty physicians for short- and long-term needs',
  'Credentialing and privileging support',
  'Locum tenens and permanent placement options',
];

export default function PhysiciansAdvancedPracticePage() {
  return (
    <SolutionHeroTemplate
      title="Physicians & Advanced Practice Providers"
      description="Access a network of physicians, nurse practitioners, physician assistants, and other advanced practice providers. We support hospitals, health systems, and practices with qualified clinicians for locum tenens, permanent, and contract-to-hire roles."
      benefits={benefits}
      imageSrc="/Black_doctor_seeing_patient_ee388b378f.jpeg"
      solutionName="Physicians & Advanced Practice Providers"
      IconComponent={MedicalServicesIcon}
    />
  );
}
