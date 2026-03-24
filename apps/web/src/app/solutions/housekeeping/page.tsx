import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Housekeeping | Weir Here Staffing',
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
