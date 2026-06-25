import type { Metadata } from 'next';
import BankingInformationContent from '@/components/payment/BankingInformationContent';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/payment/banking-information'),
  title: 'Banking Information | Weir Here Staffing Solutions',
  description:
    'Bank transfer details for Weir Here Staffing Solutions invoices in Jamaican dollars and US dollars.',
};

export default function BankingInformationPage() {
  return <BankingInformationContent />;
}
