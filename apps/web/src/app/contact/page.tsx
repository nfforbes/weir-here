import type { Metadata } from 'next';
import ContactPageContent from '@/components/contact/ContactPageContent';
import { BUSINESS_ADDRESS_LINE, BUSINESS_CITY } from '@/lib/businessAddress';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/contact'),
  title: `Contact Us | Weir Here Staffing Solutions, ${BUSINESS_CITY} Jamaica`,
  description:
    `Get in touch with Weir Here Staffing Solutions. Located at ${BUSINESS_ADDRESS_LINE}. Call or WhatsApp: (876) 561-9970 / (876) 561-9856 or email info@weirheresolutions.com.`,
};

export default function ContactPage() {
  return <ContactPageContent />;
}
