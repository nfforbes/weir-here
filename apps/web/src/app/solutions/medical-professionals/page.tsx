import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical Professionals | Weir Here Staffing',
};

const benefits = [
  'Skilled medical staff for hospitals, clinics, and healthcare facilities',
  'Quick placement for urgent staffing gaps',
];

export default function MedicalProfessionalsPage() {
  return (
    <SolutionHeroTemplate
      title="Medical Professionals"
      description="Licensed physicians across various specialties to support short‑term coverage, long‑term assignments, and facility staffing needs."
      benefits={benefits}
      imageSrc="/Doctor_and_nuse_standing_at_opposite_end_walk.gif"
      solutionName="Medical Professionals"
      IconComponent={LocalHospitalIcon}
    />
  );
}
