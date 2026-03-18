'use client';

import { Button } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';

const benefits = [
  'Access a vetted pool of qualified candidates across industries',
  'Reduce time-to-hire with our streamlined matching process',
  'Flexible staffing models: temporary, contract-to-hire, permanent',
  'Dedicated account managers who understand your business',
  'Screening, interviews, and skills assessments handled for you',
  'No placement fee until you find the right fit',
];

export default function EmployersPage() {
  const { user } = useUser();
  const router = useRouter();

  const handlePostJob = () => {
    if (user) {
      router.push('/dashboard/post-job');
    } else {
      router.push('/auth/login?returnTo=/dashboard/post-job');
    }
  };

  return (
    <SolutionHeroTemplate
      title="Staffing Solutions for Employers"
      description="Finding the right talent shouldn't slow your business down. Weir Here Staffing partners with companies of all sizes to deliver workforce solutions that scale with your needs."
      benefits={benefits}
      imageSrc="/Black_doctor_seeing_patient_ee388b378f.jpeg"
      solutionName="Staffing Solutions for Employers"
      IconComponent={BusinessIcon}
    >
      <Button variant="contained" size="large" onClick={handlePostJob} sx={{ mt: 3 }}>
        Post a Job
      </Button>
    </SolutionHeroTemplate>
  );
}
