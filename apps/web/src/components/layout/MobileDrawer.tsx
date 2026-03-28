'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Collapse,
  Button,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { getMenuIcon } from '@/components/layout/menuIcons';
import type { IMenuItem } from '@weir-here/shared';

const GOLD = '#cfaf5b';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  menuItems: IMenuItem[];
  isAuthenticated: boolean;
  userName: string;
}

export default function MobileDrawer({
  open,
  onClose,
  menuItems,
  isAuthenticated,
  userName,
}: MobileDrawerProps) {
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(new Set());
  const [logoError, setLogoError] = useState(false);

  const toggleExpand = (label: string) => {
    setExpandedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 280,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: '#000000',
        }}
        role="navigation"
      >
        {/* Header with logo */}
        <Box
          sx={{
            bgcolor: '#000000',
            color: GOLD,
            px: 3,
            py: 2.5,
            borderBottom: `2px solid ${GOLD}`,
          }}
        >
          <Link href="/" onClick={onClose} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!logoError ? (
              <Image
                src="/weir-here-logo-transparent.png"
                alt="Weir Here"
                width={180}
                height={48}
                sizes="180px"
                loading="lazy"
                onError={() => setLogoError(true)}
                style={{ height: 48, width: 'auto', objectFit: 'contain' }}
              />
            ) : null}
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1.5, color: GOLD }}>
              Weir-Here
            </Typography>
          </Link>
        </Box>

        {/* Menu Items */}
        <List sx={{ flex: 1, pt: 1, bgcolor: '#000000' }}>
          {menuItems.map((item) =>
            item.children && item.children.length > 0 ? (
              <Box key={item.label}>
                <ListItemButton
                  onClick={() => toggleExpand(item.label)}
                  sx={{ color: GOLD, '&:hover': { bgcolor: 'rgba(207,175,91,0.15)' } }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: GOLD }}>
                    {getMenuIcon(item.icon)}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                  {expandedLabels.has(item.label) ? <ExpandLess sx={{ color: GOLD }} /> : <ExpandMore sx={{ color: GOLD }} />}
                </ListItemButton>
                <Collapse in={expandedLabels.has(item.label)} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.path}
                        component={Link}
                        href={child.path}
                        onClick={onClose}
                        sx={{ pl: 5, color: GOLD, '&:hover': { bgcolor: 'rgba(207,175,91,0.15)' } }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: GOLD }}>
                          {getMenuIcon(child.icon)}
                        </ListItemIcon>
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ) : (
              <ListItemButton
                key={item.path}
                component={Link}
                href={item.path}
                onClick={onClose}
                sx={{ color: GOLD, '&:hover': { bgcolor: 'rgba(207,175,91,0.15)' } }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: GOLD }}>
                  {getMenuIcon(item.icon)}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            )
          )}
        </List>

        <Divider sx={{ borderColor: GOLD, opacity: 0.5 }} />

        {/* Auth Section */}
        <Box sx={{ p: 2, bgcolor: '#000000' }}>
          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ mb: 1, color: GOLD, opacity: 0.9 }}>
                Signed in as <strong>{userName}</strong>
              </Typography>
              <Button
                component="a"
                href="/auth/logout"
                fullWidth
                variant="outlined"
                startIcon={<LogoutIcon />}
                sx={{ color: GOLD, borderColor: GOLD, '&:hover': { borderColor: GOLD, bgcolor: 'rgba(207,175,91,0.15)' } }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              component="a"
              href="/auth/login"
              fullWidth
              variant="contained"
              startIcon={<LoginIcon />}
              sx={{ bgcolor: GOLD, color: '#1a1a1a', '&:hover': { bgcolor: '#d4b84d' } }}
            >
              Login
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
