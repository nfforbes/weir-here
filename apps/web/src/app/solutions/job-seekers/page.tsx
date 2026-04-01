import { Button } from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import Link from 'next/link';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/solutions/job-seekers'),
  title: 'For Job Seekers in Jamaica | Weir Here Staffing',
  description:
    'Find your next healthcare or domestic career opportunity in Jamaica. Free job matching, resume support, and interview coaching from Weir Here Staffing Solutions, Kingston.',
};

const benefits = [
  'Browse hundreds of openings across multiple industries',
  'Apply in minutes with our streamlined application process',
  'Get matched to roles that fit your skills and career goals',
  'Resume support and interview coaching from our recruiters',
  'Temporary, contract, and permanent opportunities available',
  'Completely free for job seekers — always',
];

export default function JobSeekersPage() {
  return (
    <SolutionHeroTemplate
      title="Find Your Next Opportunity"
      description="Your next career move starts here. Weir Here Staffing connects talented professionals like you with employers who value your skills and experience."
      benefits={benefits}
      imageSrc="/Black_nurse_babysitting_child_4e246048c5.jpeg"
      solutionName="For Job Seekers"
      IconComponent={PersonSearchIcon}
    >
      <Button variant="contained" size="large" component={Link} href="/jobs" sx={{ mt: 3 }}>
        Browse Open Positions
      </Button>
    </SolutionHeroTemplate>
  );
}
