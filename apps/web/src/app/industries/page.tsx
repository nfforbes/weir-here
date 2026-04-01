import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import EngineeringIcon from '@mui/icons-material/Engineering';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SchoolIcon from '@mui/icons-material/School';
import type { Metadata } from 'next';
import type { SvgIconComponent } from '@mui/icons-material';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/industries'),
  title: 'Industries We Serve | Weir Here Staffing Jamaica',
  description:
    'Weir Here Staffing Solutions serves healthcare, education, finance, technology, manufacturing, retail, logistics, and more in Jamaica. Find staffing solutions tailored to your industry.',
};

interface Industry {
  name: string;
  description: string;
  Icon: SvgIconComponent;
}

const industries: Industry[] = [
  {
    name: 'Information Technology',
    description:
      'Software engineers, data analysts, cybersecurity experts, and IT support professionals.',
    Icon: ComputerIcon,
  },
  {
    name: 'Healthcare',
    description:
      'Nurses, medical technicians, healthcare administrators, and clinical staff.',
    Icon: LocalHospitalIcon,
  },
  {
    name: 'Finance & Accounting',
    description:
      'Accountants, financial analysts, auditors, and banking professionals.',
    Icon: AccountBalanceIcon,
  },
  {
    name: 'Manufacturing',
    description:
      'Production operators, quality engineers, supply chain managers, and plant supervisors.',
    Icon: PrecisionManufacturingIcon,
  },
  {
    name: 'Engineering',
    description:
      'Civil, mechanical, electrical, and industrial engineers for projects of all scales.',
    Icon: EngineeringIcon,
  },
  {
    name: 'Retail & Hospitality',
    description:
      'Store managers, customer service reps, hospitality staff, and food service workers.',
    Icon: StorefrontIcon,
  },
  {
    name: 'Logistics & Transportation',
    description:
      'Warehouse associates, fleet managers, dispatchers, and supply chain coordinators.',
    Icon: LocalShippingIcon,
  },
  {
    name: 'Education',
    description:
      'Teachers, administrators, tutors, and education technology specialists.',
    Icon: SchoolIcon,
  },
];

export default function IndustriesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Industries We Serve
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: 700 }}>
        Weir Here Staffing has deep expertise across a diverse range of sectors. No
        matter your industry, we have the network and know-how to deliver top talent.
      </Typography>

      <Grid container spacing={3}>
        {industries.map(({ name, description, Icon }) => (
          <Grid key={name} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
