import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Geriatric Nurses in Jamaica | Weir Here Staffing',
  description:
    'Specialized geriatric and long-term care nurses available in Jamaica. Weir Here Staffing Solutions places compassionate geriatric nurses for nursing homes and private care.',
};

const benefits = [
  'Specialized nurses with experience in geriatric and long-term care',
  'Staff for nursing homes, assisted living, and memory care units',
  'Understanding of age-related conditions and compassionate care',
  'Flexible staffing for census fluctuations and coverage gaps',
];

export default function GeriatricNursesPage() {
  return (
    <SolutionHeroTemplate
      title="Geriatric Nurses"
      description="We provide qualified geriatric nurses for senior care facilities, nursing homes, and assisted living communities. Our nurses are trained to deliver compassionate, person-centered care for older adults."
      benefits={benefits}
      imageSrc="/realistic-scene-with-elderly-care-senior-people.png"
      solutionName="Geriatric Nurses"
      IconComponent={AccessibilityNewIcon}
    />
  );
}
