'use client';

import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getIcon } from './IconMap';
import type { MenuItem } from '@/lib/permissions';

const DRAWER_WIDTH = 240;

interface Props {
  items: MenuItem[];
}

export default function DashboardDrawer({ items }: Props) {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          mt: '64px',
          borderRight: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Toolbar />
      <List sx={{ px: 1 }}>
        {items.map((item) => {
          const Icon = getIcon(item.icon);
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href + '/') &&
              !items.some(
                (other) =>
                  other.href !== item.href &&
                  other.href.startsWith(item.href + '/') &&
                  pathname.startsWith(other.href)
              ));
          return (
            <ListItemButton
              key={item.label}
              component={Link}
              href={item.href}
              selected={isActive}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { backgroundColor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
