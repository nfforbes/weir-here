import type { Metadata } from 'next';
import PaymentPageContent from '@/components/payment/PaymentPageContent';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/payment'),
  title: 'Secure Payment Portal | Weir Here Staffing Solutions',
  description:
    'Pay your invoices securely through the Weir Here Staffing Solutions payment gateway. We accept all major credit and debit cards.',
};

export default function PaymentPage() {
  return <PaymentPageContent />;
}
