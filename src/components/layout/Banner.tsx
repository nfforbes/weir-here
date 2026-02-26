'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Menu,
  MenuItem as MuiMenuItem,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { getIcon } from './IconMap';
import type { AppUser } from '@/lib/auth';
import type { MenuItem } from '@/lib/permissions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme } from '@/store/slices/uiSlice';

interface Props {
  user: AppUser | null;
  menuItems: MenuItem[];
}

function isItemActive(pathname: string, item: MenuItem): boolean {
  if (item.children) {
    return item.children.some((c) => pathname === c.href || (c.href !== '/' && pathname.startsWith(c.href)));
  }
  return pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
}

export default function Banner({ user, menuItems }: Props) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((s) => s.ui.themeMode);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});
  const [anchorEls, setAnchorEls] = useState<Record<string, HTMLElement | null>>({});

  const handleSubToggle = (label: string) => {
    setOpenSubs((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleDesktopMenuOpen = (label: string, el: HTMLElement) => {
    setAnchorEls((prev) => ({ ...prev, [label]: el }));
  };

  const handleDesktopMenuClose = (label: string) => {
    setAnchorEls((prev) => ({ ...prev, [label]: null }));
  };

  const renderDesktopItems = () =>
    menuItems.map((item) => {
      const Icon = getIcon(item.icon);
      const active = isItemActive(pathname, item);
      if (item.children) {
        return (
          <Box key={item.label} sx={{ display: 'inline-block', borderBottom: active ? '3px solid white' : '3px solid transparent' }}>
            <Button
              color="inherit"
              startIcon={<Icon />}
              endIcon={anchorEls[item.label] ? <ExpandLess /> : <ExpandMore />}
              onClick={(e) => handleDesktopMenuOpen(item.label, e.currentTarget)}
            >
              {item.label}
            </Button>
            <Menu
              anchorEl={anchorEls[item.label]}
              open={Boolean(anchorEls[item.label])}
              onClose={() => handleDesktopMenuClose(item.label)}
            >
              {item.children.map((child) => {
                const ChildIcon = getIcon(child.icon);
                return (
                  <MuiMenuItem
                    key={child.label}
                    component={Link}
                    href={child.href}
                    onClick={() => handleDesktopMenuClose(item.label)}
                  >
                    <ListItemIcon>
                      <ChildIcon fontSize="small" />
                    </ListItemIcon>
                    {child.label}
                  </MuiMenuItem>
                );
              })}
            </Menu>
          </Box>
        );
      }
      return (
        <Box key={item.label} sx={{ display: 'inline-block', borderBottom: active ? '3px solid white' : '3px solid transparent' }}>
          <Button color="inherit" component={Link} href={item.href} startIcon={<Icon />}>
            {item.label}
          </Button>
        </Box>
      );
    });

  const renderMobileDrawer = () => (
    <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box sx={{ width: 280 }} role="presentation">
        <List>
          {menuItems.map((item) => {
            const Icon = getIcon(item.icon);
            if (item.children) {
              return (
                <Box key={item.label}>
                  <ListItemButton onClick={() => handleSubToggle(item.label)}>
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                    {openSubs[item.label] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={openSubs[item.label]} timeout="auto">
                    <List disablePadding>
                      {item.children.map((child) => {
                        const ChildIcon = getIcon(child.icon);
                        return (
                          <ListItemButton
                            key={child.label}
                            sx={{ pl: 4 }}
                            component={Link}
                            href={child.href}
                            onClick={() => setDrawerOpen(false)}
                          >
                            <ListItemIcon>
                              <ChildIcon />
                            </ListItemIcon>
                            <ListItemText primary={child.label} />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            }
            return (
              <ListItemButton
                key={item.label}
                component={Link}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="sticky">
      <Toolbar>
        {isMobile && (
          <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700, mr: 3 }}
        >
          Weir Here
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {renderDesktopItems()}
          </Box>
        )}

        <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

        <Tooltip title="Toggle theme">
          <IconButton color="inherit" onClick={() => dispatch(toggleTheme())} sx={{ mr: 1 }}>
            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>

        {user ? (
          <Button color="inherit" component={Link} href="/auth/logout" variant="outlined">
            Logout ({user.name})
          </Button>
        ) : (
          <Button color="inherit" component={Link} href="/auth/login" variant="outlined">
            Login
          </Button>
        )}
      </Toolbar>
      {isMobile && renderMobileDrawer()}
    </AppBar>
  );
}
