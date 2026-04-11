import SchoolIcon from '@mui/icons-material/School';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CalculateIcon from '@mui/icons-material/Calculate';
import ScienceIcon from '@mui/icons-material/Science';
import LanguageIcon from '@mui/icons-material/Language';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/tutoring-jamaica'),
  title: 'CSEC, CAPE & SAT Tutoring in Kingston, Jamaica | Weir Here Staffing',
  description:
    'Expert private tutors in Kingston, Jamaica for Math, Science, and English. Personalized academic support and exam preparation for CSEC, CAPE, SAT, and PEP.',
};

const benefits = [
  'Qualified educators with proven track records',
  'Specialized support for CSEC, CAPE, and SAT',
  'One-on-one personalized learning environment',
  'Flexible online or in-person sessions',
  'Focus on critical thinking and exam techniques',
];

const subjects = [
  { name: 'Mathematics', icon: <CalculateIcon sx={{ color: '#cfaf5b' }} />, levels: ['PEP', 'CSEC', 'CAPE', 'SAT'] },
  { name: 'Sciences', icon: <ScienceIcon sx={{ color: '#cfaf5b' }} />, levels: ['CSEC', 'CAPE (Bio/Chem/Phys)'] },
  { name: 'English Language', icon: <AutoStoriesIcon sx={{ color: '#cfaf5b' }} />, levels: ['PEP', 'CSEC', 'CAPE'] },
  { name: 'Humanities', icon: <LanguageIcon sx={{ color: '#cfaf5b' }} />, levels: ['CSEC', 'CAPE', 'History', 'Social Studies'] },
];

export default function TutoringSiloPage() {
  return (
    <SolutionHeroTemplate
      title="Expert Tutoring in Jamaica"
      description="Empower your academic journey with tutors who care. Whether you're preparing for national exams or need specialized subject support, our expert educators are here to help you excel."
      benefits={benefits}
      imageSrc="/Black_teacher_teaching_202603240218.jpeg"
      solutionName="Tutoring"
      IconComponent={SchoolIcon}
    >
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
          Our Specialized Academic Support
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We provide elite educators for all major Jamaican and international curricula, ensuring students are prepared for every milestone.
        </Typography>
        
        <Grid container spacing={2}>
          {subjects.map((sub) => (
            <Grid item xs={12} sm={6} key={sub.name}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#fdfdfd', height: '100%', border: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  {sub.icon}
                  <Typography variant="subtitle1" fontWeight={700}>{sub.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {sub.levels.map(level => (
                    <Chip key={level} label={level} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </SolutionHeroTemplate>
  );
}
