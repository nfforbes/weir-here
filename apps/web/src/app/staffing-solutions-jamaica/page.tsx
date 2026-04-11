import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import { Box, Typography, Paper, Grid, Avatar, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import GroupsIcon from '@mui/icons-material/Groups';
import SpeedIcon from '@mui/icons-material/Speed';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/staffing-solutions-jamaica'),
  title: '#1 Healthcare & Private Staffing Agency Jamaica | Weir Here Staffing',
  description:
    'Reliable healthcare and domestic staffing solutions in Jamaica. We connect hospitals, clinics, and businesses with qualified RNs, LPNs, and support staff.',
};

const benefits = [
  'Rigorous medical credentialing & vetting',
  'Large pool of qualified RNs, LPNs, and Geriatric Nurses',
  'Rapid placement for temporary or permanent roles',
  'Support for healthcare facilities and private estates',
  'Reach and Reliability across all 14 parishes',
];

export default function StaffingSiloPage() {
  return (
    <SolutionHeroTemplate
      title="Staffing Solutions in Jamaica"
      description="Efficiency meets excellence. We bridge the talent gap for healthcare institutions and private employers across Jamaica, delivering reliable staffing with unmatched speed."
      benefits={benefits}
      imageSrc="/Black_employees_standing_202604102014.jpeg"
      solutionName="Staffing"
      IconComponent={BusinessCenterIcon}
    >
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
          Reach and Reliability: Our Promise
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We don't just find people; we find the *right* people. Our staffing solutions are built on a foundation of rigorous screening and a deep understanding of the Jamaican job market.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
              <HealthAndSafetyIcon sx={{ color: '#cfaf5b', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>Medical Vetting</Typography>
                <Typography variant="caption" display="block">Verification of nursing council licenses and medical certifications.</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
              <SpeedIcon sx={{ color: '#cfaf5b', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>Rapid Placement</Typography>
                <Typography variant="caption" display="block">Reducing downtime for critical roles through our active talent registry.</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
              <GroupsIcon sx={{ color: '#cfaf5b', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>Wide Network</Typography>
                <Typography variant="caption" display="block">Staffing solutions covering every parish in Jamaica from Negril to Morant Bay.</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
            Frequently Asked Questions
          </Typography>
          <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #e2e8f0' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#cfaf5b' }} />}>
              <Typography fontWeight={600}>How fast can you place a nurse or medical professional?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                For urgent requirements, we can typically place qualified healthcare professionals within a relative short period of time, thanks to our pre-vetted roster of active candidates across Jamaica.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #e2e8f0' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#cfaf5b' }} />}>
              <Typography fontWeight={600}>What is your vetting process for medical staff?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Our team conducts rigorous verification, including checking Nursing Council of Jamaica registrations, validating prior work history, and running comprehensive background and reference checks to ensure full compliance and patient safety.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #e2e8f0' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#cfaf5b' }} />}>
              <Typography fontWeight={600}>Do you handle temporary block bookings or just permanent placements?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                We offer highly flexible staffing solutions ranging from per-diem and short-term locum assignments to long-term contract and permanent placements, tailored specifically to your facility's census and operational needs.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </SolutionHeroTemplate>
  );
}
