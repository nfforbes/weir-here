import ChildCareIcon from '@mui/icons-material/ChildCare';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import { Box, Typography, Paper, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/babysitting-services-jamaica'),
  title: 'Babysitting Services in Kingston, Jamaica | Weir Here Staffing',
  description:
    '#1 Trustworthy nannies and babysitters in Kingston, Jamaica. Pediatric-trained, background-checked, and CPR-certified care for your peace of mind.',
};

const benefits = [
  'Pediatric-trained caregivers',
  'Rigorous background checks',
  'CPR & First Aid certified',
  'Flexible evening & weekend scheduling',
  'Newborn & infant specialty care',
];

export default function BabysittingSiloPage() {
  return (
    <SolutionHeroTemplate
      title="Babysitting Services in Jamaica"
      description="Finding a trustworthy partner for your child's care shouldn't be stressful. We connect Jamaican families with vetted, compassionate, and highly qualified childcare professionals."
      benefits={benefits}
      imageSrc="/Black_nurse_babysitting_child_4e246048c5.jpeg"
      solutionName="Babysitting"
      IconComponent={ChildCareIcon}
    >
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
          Safety FIRST: Our Vetting Process
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We understand that safety is your top priority. At Weir Here, we go beyond simple interviews to ensure every caregiver meets the highest standards.
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9f9f9', height: '100%', border: '1px solid #eee' }}>
              <SecurityIcon sx={{ color: '#cfaf5b', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight={700}>Background Checks</Typography>
              <Typography variant="caption" display="block">Comprehensive police record checks and character references for all staff.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9f9f9', height: '100%', border: '1px solid #eee' }}>
              <LocalHospitalIcon sx={{ color: '#cfaf5b', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight={700}>CPR & First Aid</Typography>
              <Typography variant="caption" display="block">Most of our sitters are pediatric-trained or hold active CPR certifications.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9f9f9', height: '100%', border: '1px solid #eee' }}>
              <VerifiedUserIcon sx={{ color: '#cfaf5b', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight={700}>Detailed Vetting</Typography>
              <Typography variant="caption" display="block">Multi-stage interview process including skills assessment and situational testing.</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
            Frequently Asked Questions
          </Typography>
          <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #e2e8f0' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#cfaf5b' }} />}>
              <Typography fontWeight={600}>What age groups do your nannies and babysitters care for?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Our vetted professionals are experienced in providing care across all pediatric age groups, from newborns and infants to toddlers and school-age children.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #e2e8f0' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#cfaf5b' }} />}>
              <Typography fontWeight={600}>Can I request a caregiver for evening or weekend shifts?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Absolutely. We understand that parents, especially those in healthcare or shift work, need flexible scheduling. We offer evening, weekend, and overnight babysitting services.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #e2e8f0' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#cfaf5b' }} />}>
              <Typography fontWeight={600}>Are your sitters trained in First Aid?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Yes, our priority is your child's safety. Many of our sitters are fully CPR and First Aid certified, and some bring formal pediatric training from medical backgrounds.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </SolutionHeroTemplate>
  );
}
