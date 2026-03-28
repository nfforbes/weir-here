import {
  Container,
  Typography,
  Box,
  Link,
} from '@mui/material';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Weir Here Staffing',
  description:
    'How Weir Here Staffing collects, uses, and protects personal information under applicable Jamaican law.',
};

const LAST_UPDATED = 'March 28, 2026';

export default function PrivacyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Privacy Policy
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Last updated: {LAST_UPDATED}
      </Typography>

      <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
        Weir Here Staffing Solutions (“Weir Here,” “we,” “us,” or “our”) operates this website and related staffing
        and recruitment services. This Privacy Policy describes how we collect, use, disclose, and safeguard
        personal data when you visit our site, create an account, apply for roles, post jobs, or otherwise
        interact with us from or in connection with Jamaica. We process personal data in a manner intended to
        comply with applicable laws of Jamaica, including the{' '}
        <strong>Data Protection Act, 2020</strong> (and regulations and guidance issued under it), and other
        relevant Jamaican statutes as they apply to our activities. If you do not agree with this policy, please
        do not use our services.
      </Typography>

      <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
        This policy is a general description of our practices. It is not legal advice. Where our processing is
        subject to specific sector rules or contractual duties, those terms may also apply.
      </Typography>

      <Section title="1. Data controller">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          For the purposes of the Data Protection Act, 2020, Weir Here Staffing Solutions is the data controller
          (or acts together with any named joint controller) for personal data described in this policy, unless
          we inform you otherwise (for example, where we process data solely on behalf of a client as a processor).
          Contact details appear at the end of this policy.
        </Typography>
      </Section>

      <Section title="2. Information we collect">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          <strong>Information you provide.</strong> We may collect name, email address, telephone number, postal
          address, resume or CV, work history, education, certifications, professional references, cover letters,
          national identifier or work-eligibility information where legally required for the role, and other
          materials you submit when you register, apply for positions, or communicate with us. Employers and
          recruiters may provide business contact details, company information, job descriptions, and hiring
          preferences.
        </Typography>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          <strong>Automatically collected information.</strong> We may log IP address, device type, browser type,
          operating system, referring URLs, pages viewed, and approximate location derived from IP. We may use
          cookies and similar technologies as described below.
        </Typography>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          <strong>Authentication.</strong> If you sign in through a third-party identity provider, we receive
          information that provider shares with us (for example, account identifier, name, and email), subject to
          your settings with that provider and that provider&apos;s own privacy terms.
        </Typography>
      </Section>

      <Section title="3. Legal bases and purposes of processing (Jamaica)">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We process personal data only where we have a lawful basis under the Data Protection Act, 2020, such as:
          your <strong>consent</strong> where we ask for it; performance of a <strong>contract</strong> with you
          or steps prior to entering a contract; <strong>legitimate interests</strong> that are not overridden by
          your interests or fundamental rights (for example, improving our services, securing our systems, and
          preventing fraud), where permitted; or <strong>legal obligation</strong>. We use personal data for purposes
          including:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 3, '& li': { mb: 1, lineHeight: 1.8 } }}>
          <Typography component="li" variant="body1">
            Operating, maintaining, and improving our website and staffing services.
          </Typography>
          <Typography component="li" variant="body1">
            Creating and managing accounts; processing job applications and submissions.
          </Typography>
          <Typography component="li" variant="body1">
            Matching candidates with opportunities and sharing application materials with prospective employers when
            you apply or consent to being considered.
          </Typography>
          <Typography component="li" variant="body1">
            Communicating with you about applications, services, technical notices, and support.
          </Typography>
          <Typography component="li" variant="body1">
            Detecting, preventing, and addressing fraud, abuse, security incidents, and violations of our Terms of
            Use.
          </Typography>
          <Typography component="li" variant="body1">
            Complying with Jamaican law, responding to lawful requests from competent authorities, and enforcing our
            agreements.
          </Typography>
          <Typography component="li" variant="body1">
            Analysing usage in aggregated or de-identified form where permitted.
          </Typography>
        </Box>
      </Section>

      <Section title="4. Sharing of information">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          <strong>Employers and clients.</strong> When you apply to a role or express interest, we may share your
          application and profile details with the organisation associated with that opportunity.
        </Typography>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          <strong>Service providers.</strong> We may share personal data with processors who assist us with
          hosting, analytics, email delivery, authentication, customer support, and other functions, under
          agreements that require them to protect the data and process it only on our instructions, consistent with
          Jamaican requirements where applicable.
        </Typography>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          <strong>Legal and safety.</strong> We may disclose information where required by Jamaican law, court
          order, or lawful governmental request, or to protect the rights, property, or safety of Weir Here, our
          users, or others, within the limits set by law.
        </Typography>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          <strong>Business transfers.</strong> In connection with a merger, acquisition, financing, or sale of
          assets, personal data may be transferred subject to confidentiality arrangements and applicable Jamaican
          law.
        </Typography>
      </Section>

      <Section title="5. Transfers outside Jamaica">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          Our service providers or corporate affiliates may be located outside Jamaica. Where we transfer personal
          data outside Jamaica, we aim to do so in accordance with the Data Protection Act, 2020—for example, by
          relying on adequacy decisions, appropriate safeguards, or other lawful mechanisms recognised under
          Jamaican law—unless an exception applies.
        </Typography>
      </Section>

      <Section title="6. Cookies and similar technologies">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We use cookies and similar technologies to remember preferences, keep you signed in where applicable,
          understand how our services are used, and improve performance. You can control cookies through your
          browser settings; disabling cookies may limit some functionality. Where the law requires cookie consent,
          we will obtain the consent needed before using non-essential cookies.
        </Typography>
      </Section>

      <Section title="7. Data retention">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We retain personal data only as long as necessary for the purposes described in this policy, unless a
          longer period is required or permitted by Jamaican law (for example, tax, employment, or litigation
          holds). When retention is no longer needed, we will delete, anonymise, or securely dispose of the data
          in line with our internal procedures.
        </Typography>
      </Section>

      <Section title="8. Security">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We implement reasonable technical and organisational measures appropriate to the risk, consistent with
          our <Link href="/security">Security</Link> overview. No online transmission or storage is perfectly
          secure; we cannot guarantee absolute security.
        </Typography>
      </Section>

      <Section title="9. Your rights under Jamaican law">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          Subject to conditions and exceptions in the Data Protection Act, 2020 and related rules, you may have
          rights to request access to your personal data, correction of inaccurate data, erasure in certain
          circumstances, restriction of processing, an explanation of automated decision-making where relevant,
          and to withdraw consent where processing is based on consent. You may also have the right to lodge a
          complaint with the{' '}
          <Link
            href="https://www.oic.gov.jm/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Office of the Information Commissioner
          </Link>{' '}
          (Jamaica) if you consider that our processing infringes applicable law. To exercise your rights with us,
          contact us using the details below; we may need to verify your identity before responding within a
          reasonable period.
        </Typography>
      </Section>

      <Section title="10. Children">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          Our services are not directed at children, and we do not knowingly collect personal data from anyone who
          is not legally able to use employment services in Jamaica. If you are a parent or guardian and believe we
          have collected personal data from a child in error, please contact us and we will take steps to address
          the matter in accordance with applicable law.
        </Typography>
      </Section>

      <Section title="11. Automated decision-making">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          Where we use profiling or automated processing that significantly affects you, we will provide
          meaningful information about the logic involved and your rights under Jamaican law, where those
          obligations apply.
        </Typography>
      </Section>

      <Section title="12. Changes to this policy">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We may update this Privacy Policy to reflect changes in our practices or legal requirements in Jamaica.
          We will post the revised version on this page and update the “Last updated” date. Where the law requires,
          we will notify you or obtain consent for material changes.
        </Typography>
      </Section>

      <Section title="13. Contact us">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          Questions about this Privacy Policy or our processing of personal data under Jamaican law may be directed
          to{' '}
          <Link href="mailto:info@weirheresolutions.com">info@weirheresolutions.com</Link>
          {' '}or via our <Link href="/contact">Contact</Link> page. You may also use the same channels to contact our
          data protection contact or representative if we designate one publicly.
        </Typography>
      </Section>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, fontStyle: 'italic' }}>
        This policy is not legal advice. Laws in Jamaica change; consult qualified counsel in Jamaica to ensure
        your use of our services and our documentation meet your obligations.
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
