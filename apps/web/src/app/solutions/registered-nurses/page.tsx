import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registered Nurses | Weir Here Staffing',
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
      IconComponent={HealthAndSafetyIcon}
    />
  );
}
