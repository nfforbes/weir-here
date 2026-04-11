import HomeWorkIcon from '@mui/icons-material/HomeWork';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import { Box, Typography, Paper, Grid, Stack } from '@mui/material';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AccessibleForwardIcon from '@mui/icons-material/AccessibleForward';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/domestic-care-jamaica'),
  title: 'Domestic & Elderly Care Services Jamaica | Weir Here Staffing',
  description:
    'Professional domestic care and specialized elderly support in Kingston, Jamaica. Specialized dementia care and home help providing peace of mind for families.',
};

const benefits = [
  'Specialized elderly and dementia care',
  'Post-operative home recovery support',
  'Vetted domestic helpers and caregivers',
  'Flexible companionship and daily living assistance',
  'Peace of mind with professional supervision',
];

export default function DomesticCareSiloPage() {
  return (
    <SolutionHeroTemplate
      title="Compassionate Domestic & Elderly Care"
      description="Quality care begins at home. We provide specialized support for seniors and families, ensuring your loved ones are cared for with dignity, patience, and professional expertise."
      benefits={benefits}
      imageSrc="/geriatric-nurse-jamaica.jpeg"
      solutionName="Domestic Care"
      IconComponent={HomeWorkIcon}
    >
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
          Peace of Mind Through Specialized Care
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Our caregivers are trained to handle complex needs, ensuring that families can trust the safety and well-being of their aging relatives.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <VolunteerActivismIcon sx={{ color: '#cfaf5b' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>Dementia & Alzheimer's Care</Typography>
                <Typography variant="caption" color="text.secondary">Specialized routines and safety measures for cognitive support.</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <AccessibleForwardIcon sx={{ color: '#cfaf5b' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>Mobility Assistance</Typography>
                <Typography variant="caption" color="text.secondary">Safe transfers and support for those with physical limitations.</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <FactCheckIcon sx={{ color: '#cfaf5b' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>Vetted Quality</Typography>
                <Typography variant="caption" color="text.secondary">Every helper is fully screened and monitored for performance.</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </SolutionHeroTemplate>
  );
}
