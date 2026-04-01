import {
  Container,
  Typography,
  Box,
  Link,
} from '@mui/material';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/terms'),
  title: 'Terms of Use | Weir Here Staffing',
  description:
    'Terms and conditions for using Weir Here Staffing in Jamaica—website, job board, and staffing services.',
};

const LAST_UPDATED = 'March 28, 2026';

export default function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Terms of Use
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Last updated: {LAST_UPDATED}
      </Typography>

      <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
        Welcome to Weir Here Staffing Solutions (“Weir Here,” “we,” “us,” or “our”). These Terms of Use (“Terms”)
        govern your access to and use of our website, job posting and application tools, employer services, and
        related offerings (collectively, the “Services”) in connection with Jamaica. By accessing or using the
        Services, you agree to these Terms and applicable laws of Jamaica. If you do not agree, do not use the
        Services.
      </Typography>

      <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
        These Terms do not replace the <Link href="/privacy">Privacy Policy</Link>, which explains how we process
        personal data under the Data Protection Act, 2020 and related rules.
      </Typography>

      <Section title="1. Eligibility">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          You must have reached the age of majority under Jamaican law (currently 18 years) to use the Services. If
          you use the Services on behalf of a company or other legal entity registered or operating in Jamaica or
          elsewhere, you represent that you have authority to bind that entity to these Terms.
        </Typography>
      </Section>

      <Section title="2. Accounts and security">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          You may need an account to access certain features. You agree to provide accurate information and to keep
          your credentials confidential. You are responsible for activity under your account. Notify us promptly if
          you suspect unauthorised access. You must not share account access in a way that violates the{' '}
          <Link href="/security">Security</Link> guidelines or applicable law.
        </Typography>
      </Section>

      <Section title="3. Description of services">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          Weir Here provides staffing and recruitment-related services, which may include job listings, candidate
          profiles, application submission, employer tools, and communications between parties. Features may change
          over time. We do not guarantee that any particular job will remain available, that an application will
          result in an interview or offer, or that we will fill any role. The Services are facilitative; we are not
          the employer of record for posted roles unless we expressly agree otherwise in writing.
        </Typography>
      </Section>

      <Section title="4. Job seekers and applicants">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          You are responsible for the accuracy of information in your profile, resume, and applications. You may not
          misrepresent your identity, qualifications, or eligibility to work in Jamaica or in any other jurisdiction
          relevant to the role. By applying to a position, you understand that your materials may be shared with the
          employer or client associated with that listing, and with our personnel for processing and matching, subject
          to our <Link href="/privacy">Privacy Policy</Link>.
        </Typography>
      </Section>

      <Section title="5. Employers and job posters">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          Employers and clients agree that job postings, recruitment practices, and communications will comply with
          applicable laws of Jamaica, including (as relevant) employment standards, human rights and
          anti-discrimination requirements, advertising and consumer-protection rules under the Consumer Protection
          Act and related regulations, and licensing or registration obligations that apply to your sector. Listings
          must describe genuine opportunities. You may not use the Services to collect applicant data for unrelated
          marketing, to mislead candidates, or to discriminate unlawfully. You are responsible for your hiring
          decisions, payroll and statutory deductions where applicable, work permits, and any contracts you enter with
          candidates.
        </Typography>
      </Section>

      <Section title="6. Acceptable use">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          You agree not to: (a) violate any law of Jamaica or any applicable foreign law; (b) infringe third-party
          rights; (c) scrape, crawl, or harvest data from the Services without our written permission; (d) introduce
          malware or attempt unauthorised access to our systems or other users&apos; accounts; (e) impersonate others
          or create fake listings; (f) harass, threaten, or discriminate against others unlawfully; (g) use the
          Services to send unsolicited bulk messages or spam. Misuse may violate the Cybercrimes Act and other
          statutes. We may investigate violations and cooperate with competent Jamaican authorities.
        </Typography>
      </Section>

      <Section title="7. Intellectual property">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          The Services, including branding, design, text, graphics, and software, are owned by Weir Here or our
          licensors and protected by copyright, trade mark, and other intellectual property laws applicable in Jamaica.
          You receive a limited, non-exclusive, non-transferable licence to use the Services for their intended
          purpose. You retain ownership of content you submit; you grant us a licence to use, host, reproduce, and
          display that content as needed to operate and promote the Services, including sharing applications with
          employers as described in our Privacy Policy.
        </Typography>
      </Section>

      <Section title="8. Third-party services">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We may integrate third-party tools (including authentication providers). Your use of those services may be
          governed by their terms. We are not responsible for third-party sites or services linked from our
          platform.
        </Typography>
      </Section>

      <Section title="9. Fees and taxes">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          If we charge fees for any Service, the amounts, currency, and billing terms will be presented at the time
          of purchase or in a separate agreement. Unless stated otherwise, amounts are in Jamaican dollars (JMD) or as
          converted and displayed at checkout. You are responsible for any applicable taxes, levies, or withholdings
          under Jamaican law.
        </Typography>
      </Section>

      <Section title="10. Disclaimers">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY THE LAWS OF
          JAMAICA, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT UNINTERRUPTED OR ERROR-FREE OPERATION OR
          THAT CONTENT IS ACCURATE OR COMPLETE. NOTHING IN THESE TERMS EXCLUDES OR LIMITS LIABILITY THAT CANNOT
          LEGALLY BE EXCLUDED OR LIMITED UNDER JAMAICAN LAW (INCLUDING IN RELATION TO DEATH OR PERSONAL INJURY CAUSED
          BY NEGLIGENCE, FRAUD, OR OTHER MATTERS WHERE LIMITATION WOULD BE VOID).
        </Typography>
      </Section>

      <Section title="11. Limitation of liability">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          TO THE MAXIMUM EXTENT PERMITTED BY THE LAWS OF JAMAICA, WEIR HERE AND ITS AFFILIATES, OFFICERS, DIRECTORS,
          EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY,
          OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITY, ARISING FROM YOUR USE
          OF THE SERVICES. OUR TOTAL AGGREGATE LIABILITY FOR CLAIMS ARISING FROM THESE TERMS OR THE SERVICES WILL NOT
          EXCEED THE GREATER OF (A) FIFTEEN THOUSAND JAMAICAN DOLLARS (J$15,000.00) OR (B) THE TOTAL FEES YOU PAID TO
          WEIR HERE FOR THE SPECIFIC SERVICE GIVING RISE TO THE CLAIM DURING THE TWELVE (12) MONTHS BEFORE THE CLAIM.
          SOME LIMITATIONS MAY NOT APPLY TO YOU IF THE LAW DOES NOT PERMIT THEM; IN THAT EVENT OUR LIABILITY IS
          LIMITED TO THE GREATEST EXTENT ALLOWED BY LAW.
        </Typography>
      </Section>

      <Section title="12. Indemnity">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          You will defend, indemnify, and hold harmless Weir Here and its affiliates from claims, damages, losses, and
          expenses (including reasonable attorneys&apos; fees) arising from your use of the Services, your content,
          or your violation of these Terms or applicable law in Jamaica or elsewhere, except to the extent caused by
          our wilful misconduct as finally determined by a court of competent jurisdiction.
        </Typography>
      </Section>

      <Section title="13. Suspension and termination">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We may suspend or terminate your access to the Services at any time, with or without notice, for conduct
          that we believe violates these Terms, harms other users, us, or third parties, or is required by Jamaican
          law or regulator direction. Provisions that by their nature should survive will survive termination.
        </Typography>
      </Section>

      <Section title="14. Governing law and disputes">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          These Terms are governed by the <strong>laws of Jamaica</strong>, without regard to conflict-of-law rules
          that would apply another jurisdiction&apos;s law, except where mandatory rules in Jamaica require
          otherwise. You agree that the courts of <strong>Jamaica</strong> have exclusive jurisdiction over disputes
          arising from or relating to these Terms or the Services, except that we may seek injunctive or equitable
          relief in any appropriate forum. If you are a consumer, non-excludable rights you have under Jamaican
          consumer-protection legislation remain unaffected.
        </Typography>
      </Section>

      <Section title="15. Changes">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We may modify these Terms by posting an updated version on this page. Where required by applicable Jamaican
          law, we will notify you or obtain your consent before material changes take effect. Continued use after the
          effective date may constitute acceptance; if you do not agree, you must stop using the Services.
        </Typography>
      </Section>

      <Section title="16. Contact">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          For questions about these Terms, contact{' '}
          <Link href="mailto:info@weirheresolutions.com">info@weirheresolutions.com</Link>
          {' '}or visit our <Link href="/contact">Contact</Link> page.
        </Typography>
      </Section>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, fontStyle: 'italic' }}>
        These Terms are general in nature and are not legal advice. Laws in Jamaica change; have qualified counsel
        in Jamaica review them for your business, industry, and risk profile.
      </Typography>
    </Container>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
