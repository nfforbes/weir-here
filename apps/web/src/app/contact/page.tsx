import type { Metadata } from 'next';
import ContactPageContent from '@/components/contact/ContactPageContent';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/contact'),
  title: 'Contact Us | Weir Here Staffing Solutions, Kingston Jamaica',
  description:
    'Get in touch with Weir Here Staffing Solutions. Located on RoseDale Drive, Kingston, Jamaica. Call or WhatsApp: (876) 561-9970 / (876) 561-9856 or email info@weirheresolutions.com.',
};

export default function ContactPage() {
  return <ContactPageContent />;
}
