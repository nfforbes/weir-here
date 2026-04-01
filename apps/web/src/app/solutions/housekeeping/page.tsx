import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/solutions/housekeeping'),
    title: 'Housekeeping Staff in Jamaica | Weir Here Staffing',
    description:
        'Professional, vetted housekeeping and cleaning staff available in Jamaica. Weir Here Staffing Solutions places reliable housekeepers for homes, hotels, and businesses in Kingston.',
};

const benefits = [
    'Professional and vetted cleaning staff',
    'Flexible scheduling (daily, weekly, monthly)',
    'Deep cleaning and residential maintenance',
    'Eco-friendly cleaning options available',
];

export default function HousekeepingPage() {
    return (
        <SolutionHeroTemplate
            title="Housekeeping"
            description="Maintain a clean and comfortable environment with our professional housekeeping services. We provide vetted, reliable staff dedicated to ensuring your residential or commercial space is spotless."
            benefits={benefits}
            imageSrc="/Black_housekeepers_cleaning_202603240210.jpeg"
            solutionName="Housekeeping"
            IconComponent={CleaningServicesIcon}
        />
    );
}
