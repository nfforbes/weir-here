'use client';

import { Button } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { hasPermission, PERMISSIONS } from '@weir-here/shared';
import { useAppSelector } from '@/store';
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
  const authUser = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const canPostJob =
    authUser != null && hasPermission(authUser.personas, PERMISSIONS.POST_JOB);

  const handlePostJob = () => {
    if (!user) {
      router.push('/auth/login?returnTo=/dashboard/post-job');
      return;
    }
    if (canPostJob) {
      router.push('/dashboard/post-job');
    } else {
      router.push('/contact');
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
        {user && !canPostJob ? 'Contact us to hire' : 'Post a Job'}
      </Button>
    </SolutionHeroTemplate>
  );
}
