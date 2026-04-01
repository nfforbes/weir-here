import {
  Container,
  Typography,
  Box,
  Link,
} from '@mui/material';
import type { Metadata } from 'next';
import { withCanonical } from '@/lib/siteUrl';

export const metadata: Metadata = {
  ...withCanonical('/security'),
  title: 'Security | Weir Here Staffing',
  description:
    'How Weir Here Staffing approaches security for our platform, accounts, and data.',
};

const LAST_UPDATED = 'March 28, 2026';

export default function SecurityPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Security
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Last updated: {LAST_UPDATED}
      </Typography>

      <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
        Weir Here Staffing Solutions (“Weir Here,” “we,” “us,” or “our”) takes the security of our services and your
        information seriously. This page summarises our high-level approach to security. It does not describe every
        technical control, does not create a contractual obligation, and is not a substitute for your own security
        measures. Our practices are designed to align with reasonable industry standards and with applicable
        requirements in Jamaica where they apply to our operations.
      </Typography>

      <Section title="1. Secure access and authentication">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We use industry-recognised authentication providers and secure session handling for sign-in where
          available. You are responsible for keeping your password and devices safe, enabling multi-factor
          authentication if we offer it, and notifying us if you suspect unauthorised access to your account.
        </Typography>
      </Section>

      <Section title="2. Encryption and transmission">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We aim to use encryption in transit (for example, HTTPS) for connections between your browser and our
          platform, consistent with modern web practice. Some integrations or legacy clients may have different
          requirements; we work to minimise insecure paths.
        </Typography>
      </Section>

      <Section title="3. Infrastructure and vendors">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We host and process data using reputable cloud and service providers. We assess vendors for appropriate
          security and data-handling practices and use contractual protections where appropriate. Sub-processors
          may be located inside or outside Jamaica; see our <Link href="/privacy">Privacy Policy</Link> for how we
          approach international transfers.
        </Typography>
      </Section>

      <Section title="4. Organisational measures">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We limit access to personal and sensitive business data to personnel and contractors who need it to
          perform their duties. We train our team on confidentiality and acceptable use, and we apply access
          controls proportional to the sensitivity of the data.
        </Typography>
      </Section>

      <Section title="5. Monitoring and incident response">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We may monitor systems and logs to detect abuse, intrusions, and operational failures. If we become aware
          of a breach that affects your personal data and the law requires notification, we will endeavour to
          notify affected individuals and regulators as required by applicable Jamaican law (including the Data
          Protection Act, 2020, where it applies).
        </Typography>
      </Section>

      <Section title="6. Application security">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          We strive to follow secure development practices, dependency updates, and review of critical changes. No
          application is free of vulnerabilities; we encourage responsible disclosure (see below).
        </Typography>
      </Section>

      <Section title="7. Your responsibilities">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          Protect your credentials; use unique passwords; beware of phishing messages that impersonate Weir Here;
          verify our domain and official contact channels. Do not share confidential employer or candidate
          information in unsecured channels.
        </Typography>
      </Section>

      <Section title="8. Reporting security issues">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          If you believe you have found a security vulnerability in our services, please contact us at{' '}
          <Link href="mailto:info@weirheresolutions.com">info@weirheresolutions.com</Link>
          {' '}with a clear description and, if possible, steps to reproduce. Please do not perform destructive
          testing or access data that does not belong to you. We appreciate responsible disclosure and will work
          with you in good faith.
        </Typography>
      </Section>

      <Section title="9. Contact">
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          General questions about security can be sent to the address above. For privacy-specific requests, see our{' '}
          <Link href="/privacy">Privacy Policy</Link>. For legal terms, see our <Link href="/terms">Terms of Use</Link>.
        </Typography>
      </Section>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, fontStyle: 'italic' }}>
        This security overview may be updated from time to time. It is not legal or regulatory compliance
        certification. Seek professional advice for your own compliance needs under Jamaican law.
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
