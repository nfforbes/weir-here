'use client';

import { Avatar, Box } from '@mui/material';

type Props = {
  src: string;
  name: string;
};

function safeInitial(raw: string): string {
  const c = raw?.trim()?.charAt(0);
  return c ? c.toUpperCase() : '?';
}

export default function TestimonialAvatar({ src, name }: Props) {
  const trimmed = src?.trim();
  const initial = safeInitial(name ?? '');
  if (!trimmed) {
    return (
      <Box sx={{ width: 48, flexShrink: 0 }} aria-hidden>
        <Avatar alt="" sx={{ width: 48, height: 48, bgcolor: 'grey.300', color: 'grey.600' }}>
          {initial}
        </Avatar>
      </Box>
    );
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return (
      <Box sx={{ width: 48, flexShrink: 0 }}>
        <Avatar alt="" src={trimmed} sx={{ width: 48, height: 48 }} imgProps={{ loading: 'lazy' }} />
      </Box>
    );
  }

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return (
    <Box sx={{ width: 48, flexShrink: 0 }}>
      <Avatar alt="" src={path} sx={{ width: 48, height: 48 }} imgProps={{ loading: 'lazy' }} />
    </Box>
  );
}
