import type { Metadata } from 'next';
import EmployersPageClient from './EmployersPageClient';

export const metadata: Metadata = {
  title: 'Staffing Solutions for Employers in Jamaica | Weir Here Staffing',
  description:
    'Hire qualified healthcare and domestic staff in Jamaica. Weir Here Staffing handles sourcing, screening, and placement — temporary, contract, and permanent roles.',
};

export default function EmployersPage() {
  return <EmployersPageClient />;
}
