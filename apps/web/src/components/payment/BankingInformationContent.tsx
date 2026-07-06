'use client';

import {
  Box,
  Container,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const GOLD = '#CFAF5B';
const CARD_BG = '#1A1A1A';

interface BankAccountDetails {
  currencyLabel: string;
  accountNumber: string;
}

const SHARED_DETAILS = {
  accountHolder: 'Weirhere Staffing Solutions',
  bankName: 'Scotiabank',
  branch: 'Junction branch',
  branchTransit: '22475',
  accountType: 'Savings',
};

const ACCOUNTS: BankAccountDetails[] = [
  { currencyLabel: 'Jamaican Dollars (JMD)', accountNumber: '426371' },
  { currencyLabel: 'US Dollars (USD)', accountNumber: '426372' },
];

function BankTransferCard({ currencyLabel, accountNumber }: BankAccountDetails) {
  const fields = [
    { label: 'Account Holder', value: SHARED_DETAILS.accountHolder },
    { label: 'Bank Name', value: SHARED_DETAILS.bankName },
    { label: 'Branch', value: SHARED_DETAILS.branch },
    { label: 'Branch Transit', value: SHARED_DETAILS.branchTransit },
    { label: 'Account Type', value: SHARED_DETAILS.accountType },
    { label: 'Account Number', value: accountNumber },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: CARD_BG,
        color: GOLD,
        borderRadius: 0,
        p: { xs: 3, md: 4 },
        mb: 4,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <CreditCardIcon sx={{ color: GOLD, fontSize: 28 }} />
        <Typography variant="h5" sx={{ color: GOLD, fontWeight: 700 }}>
          Payment Details
        </Typography>
      </Box>

      <Divider sx={{ borderColor: GOLD, mb: 3 }} />

      <Typography variant="h6" sx={{ color: GOLD, fontWeight: 700, mb: 2 }}>
        Accepted Payment Methods
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <CheckCircleOutlineIcon sx={{ color: GOLD, mt: 0.25 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ color: GOLD, fontWeight: 700, mb: 0.5 }}>
            Bank Transfer
          </Typography>
          <Typography variant="body2" sx={{ color: GOLD, mb: 1.5, opacity: 0.9 }}>
            {currencyLabel}
          </Typography>
          {fields.map((field) => (
            <Typography key={field.label} variant="body2" sx={{ color: GOLD, lineHeight: 1.8 }}>
              <Box component="span" sx={{ fontWeight: 700 }}>
                {field.label}:
              </Box>{' '}
              {field.value}
            </Typography>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export default function BankingInformationContent() {
  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 800, mb: 4, textAlign: 'center' }}
        >
          Banking Information
        </Typography>

        {ACCOUNTS.map((account) => (
          <BankTransferCard key={account.currencyLabel} {...account} />
        ))}
      </Container>
    </Box>
  );
}
