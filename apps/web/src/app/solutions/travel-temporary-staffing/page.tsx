import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travel and Temporary Staffing | Weir Here Staffing',
};

const benefits = [
  'Travel nurses and allied health professionals for short-term assignments',
  'Per diem and temporary staff for census spikes and leave coverage',
  'Housing and compliance support for travel assignments',
  'Quick turnaround for urgent staffing needs',
];

export default function TravelTemporaryStaffingPage() {
  return (
    <SolutionHeroTemplate
      title="Travel and Temporary Staffing"
      description="Need staff fast? Our travel and temporary staffing solutions help you fill gaps quickly—whether for a few shifts, a 13-week assignment, or longer. We handle housing, licensure, and compliance so you can focus on patient care."
      benefits={benefits}
      imageSrc="/Black_orderly_pushing_gurney_12839cff65.jpeg"
      solutionName="Travel and Temporary Staffing"
      IconComponent={TravelExploreIcon}
    />
  );
}
