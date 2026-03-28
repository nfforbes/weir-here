import type { Metadata } from 'next';
import ContactPageContent from '@/components/contact/ContactPageContent';

export const metadata: Metadata = {
  title: 'Contact Us | Weir Here Staffing Solutions, Kingston Jamaica',
  description:
    'Get in touch with Weir Here Staffing Solutions. Located on RoseDale Drive, Kingston, Jamaica. Call (876) 287-9632 or email info@weirheresolutions.com.',
};

export default function ContactPage() {
  return <ContactPageContent />;
}
