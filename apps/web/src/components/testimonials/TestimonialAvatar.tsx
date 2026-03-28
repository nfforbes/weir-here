'use client';

import { Avatar, Box } from '@mui/material';

type Props = {
  src: string;
  name: string;
};

export default function TestimonialAvatar({ src, name }: Props) {
  const trimmed = src?.trim();
  if (!trimmed) {
    return (
      <Box sx={{ width: 48, flexShrink: 0 }} aria-hidden>
        <Avatar alt="" sx={{ width: 48, height: 48, bgcolor: 'grey.300', color: 'grey.600' }}>
          {name.charAt(0).toUpperCase()}
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
