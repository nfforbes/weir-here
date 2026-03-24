import SchoolIcon from '@mui/icons-material/School';
import SolutionHeroTemplate from '@/components/solutions/SolutionHeroTemplate';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tutoring | Weir Here Staffing',
};

const benefits = [
    'Qualified tutors in various subjects (Math, Science, English)',
    'One-on-one personalized learning sessions',
    'Exam preparation and academic support',
    'Flexible online or in-person sessions',
];

export default function TutoringPage() {
    return (
        <SolutionHeroTemplate
            title="Tutoring"
            description="Help your child reach their full potential with our expert tutoring services. Our educators provide personalized academic support across multiple subjects to ensure student success."
            benefits={benefits}
            imageSrc="/Black_teacher_teaching_202603240218.jpeg"
            solutionName="Tutoring"
            IconComponent={SchoolIcon}
        />
    );
}
