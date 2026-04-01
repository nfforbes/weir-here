import HealingIcon from '@mui/icons-material/Healing';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/solutions/registered-nurses'),
  title: 'Registered Nurses (RNs) in Jamaica | Weir Here Staffing',
  description:
    'Place qualified Registered Nurses across all specialties in Jamaica. Per diem, contract, and permanent RN staffing from Weir Here Staffing Solutions, Kingston.',
};

const benefits = [
  'RNs across all specialties',
  'Dedicated support for your staffing and scheduling needs',
];

export default function RegisteredNursesPage() {
  return (
    <SolutionHeroTemplate
      title="Registered Nurses"
      description="Highly trained and certified nursing professionals available for hospitals, clinics, home‑care settings, and specialty units."
      benefits={benefits}
      imageSrc="/Nurse_carrying_water_to_patient_eb54b1fa50.jpeg"
      solutionName="Registered Nurses"
      IconComponent={HealingIcon}
    />
  );
}
