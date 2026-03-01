'use client';

import Link from 'next/link';
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
import { DEEP_NAVY, ELECTRIC_BLUE } from '@/theme/theme';
import { getMenuIcon } from '@/components/layout/menuIcons';

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
        sx={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%' }}
        role="navigation"
      >
        {/* Header */}
        <Box sx={{ bgcolor: ELECTRIC_BLUE, color: 'white', px: 3, py: 2 }}>
          <Link href="/" onClick={onClose} style={{ textDecoration: 'none', color: 'inherit' }}>
            {!logoError ? (
              <Box
                component="img"
                src="/weir-here-logo.png"
                alt="Weir Here"
                onError={() => setLogoError(true)}
                sx={{ height: 64, width: 'auto', maxWidth: 200, objectFit: 'contain' }}
              />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 2 }}>
                WEIR HERE
              </Typography>
            )}
          </Link>
        </Box>

        {/* Menu Items */}
        <List sx={{ flex: 1, pt: 1 }}>
          {menuItems.map((item) =>
            item.children && item.children.length > 0 ? (
              <Box key={item.label}>
                <ListItemButton onClick={() => toggleExpand(item.label)}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getMenuIcon(item.icon)}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                  {expandedLabels.has(item.label) ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={expandedLabels.has(item.label)} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.path}
                        component={Link}
                        href={child.path}
                        onClick={onClose}
                        sx={{ pl: 5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
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
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getMenuIcon(item.icon)}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            )
          )}
        </List>

        <Divider />

        {/* Auth Section */}
        <Box sx={{ p: 2 }}>
          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Signed in as <strong>{userName}</strong>
              </Typography>
              <Button
                component="a"
                href="/auth/logout"
                fullWidth
                variant="outlined"
                startIcon={<LogoutIcon />}
                sx={{ color: DEEP_NAVY, borderColor: DEEP_NAVY }}
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
              sx={{ bgcolor: ELECTRIC_BLUE }}
            >
              Login
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
