'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  IMenuItem,
  PUBLIC_MENU,
  AUTHENTICATED_MENU,
  ADMIN_MENU,
} from '@weir-here/shared';
import { filterMenuForUser } from '@/lib/rbac';
import { useAppSelector } from '@/store';
import { getMenuIcon } from '@/components/layout/menuIcons';
import MobileDrawer from '@/components/layout/MobileDrawer';

export default function TopBanner() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user: auth0User } = useUser();
  const isAuthenticated = !!auth0User;
  const userName = auth0User?.name ?? '';
  const personas = useAppSelector((state) => state.auth.user?.personas) ?? [];

  const menuItems = useMemo(() => {
    const allItems = [...PUBLIC_MENU, ...AUTHENTICATED_MENU, ...ADMIN_MENU];
    return filterMenuForUser(allItems, personas, isAuthenticated);
  }, [personas, isAuthenticated]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [dropdownAnchor, setDropdownAnchor] = useState<null | HTMLElement>(null);
  /** Parent path is stable (e.g. `/solutions`) and avoids duplicate-label edge cases when resolving open items. */
  const [activeDropdownPath, setActiveDropdownPath] = useState<string | null>(null);

  const handleDropdownOpen = (event: React.MouseEvent<HTMLElement>, path: string) => {
    setDropdownAnchor(event.currentTarget);
    setActiveDropdownPath(path);
  };

  const handleDropdownClose = () => {
    setDropdownAnchor(null);
    setActiveDropdownPath(null);
  };

  const activeDropdownItem = menuItems.find(
    (i) => i.path === activeDropdownPath && i.children && i.children.length > 0,
  );

  return (
    <>
      {/* Gold Info Bar */}
      
      <Box
      
        sx={{
          bgcolor: '#cfaf5b',
          color: 'black',
          py: 0.5,
          px: 3,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          info@weirheresolutions.com &nbsp;  |
        </Typography>
        <Box
       component="a"
       href="https://wa.me/18762879632"
       target="_blank"
       rel="noopener noreferrer" 
        sx={{
          bgcolor: '#cfaf5b',
          color: 'black',
          py: 0.5,
          px: 3,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          (876) 287-9632
        </Typography>
      </Box>
      </Box>
      

      {/* Main nav bar — sticky so anchored menus stay aligned; z-index below MUI modal layer (menu popover). */}
      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar,
          bgcolor: '#000000',
          color: '#cfaf5b',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          {!logoError ? (
            <Image
              src="/weir-here-logo-transparent.png"
              alt="Weir Here"
              width={220}
              height={64}
              priority
              sizes="220px"
              onError={() => setLogoError(true)}
              style={{ height: 64, width: 'auto', maxWidth: 220, objectFit: 'contain' }}
            />
          ) : (
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, letterSpacing: 2, whiteSpace: 'nowrap' }}
            >
              WEIR HERE
            </Typography>
          )}
        </Link>

        {isMobile ? (
          /* Hamburger for mobile */
          <IconButton
            color="inherit"
            aria-label="open navigation menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          /* Desktop nav links + auth */
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {menuItems.map((item) =>
              item.children && item.children.length > 0 ? (
                <Button
                  key={item.label}
                  color="inherit"
                  endIcon={<ArrowDropDownIcon />}
                  aria-haspopup="true"
                  aria-expanded={activeDropdownPath === item.path ? 'true' : 'false'}
                  onClick={(e) => handleDropdownOpen(e, item.path)}
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                  {item.label}
                </Button>
              ) : (
                <Button
                  key={item.path}
                  component={Link}
                  href={item.path}
                  color="inherit"
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                  {item.label}
                </Button>
              )
            )}
            <Menu
              key={activeDropdownPath ?? 'nav-menu'}
              anchorEl={dropdownAnchor}
              open={Boolean(dropdownAnchor && activeDropdownItem)}
              onClose={handleDropdownClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              disableScrollLock
              slotProps={{
                paper: {
                  sx: {
                    minWidth: dropdownAnchor?.offsetWidth ?? 0,
                    maxHeight: 'min(480px, 70vh)',
                    overflowY: 'auto',
                  },
                },
              }}
            >
              {(activeDropdownItem?.children ?? []).map((child) => (
                <MenuItem
                  key={child.path}
                  onClick={handleDropdownClose}
                  component={Link}
                  href={child.path}
                  sx={{ gap: 1, py: 1 }}
                >
                  {getMenuIcon(child.icon)}
                  {child.label}
                </MenuItem>
              ))}
            </Menu>

            {/* Auth Button */}
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, whiteSpace: 'nowrap' }}>
                  {userName}
                </Typography>
                <Button
                  component="a"
                  href="/auth/logout"
                  variant="outlined"
                  size="small"
                  sx={{
                    color: '#cfaf5b',
                    borderColor: 'rgba(207,175,91,0.6)',
                    '&:hover': { borderColor: '#cfaf5b', bgcolor: 'rgba(207,175,91,0.1)' },
                  }}
                >
                  Logout
                </Button>
              </Box>
            ) : (
              <Button
                component="a"
                href="/auth/login"
                variant="outlined"
                size="small"
                sx={{
                  ml: 2,
                  color: '#cfaf5b',
                  borderColor: 'rgba(207,175,91,0.6)',
                  '&:hover': { borderColor: '#cfaf5b', bgcolor: 'rgba(207,175,91,0.1)' },
                }}
              >
                Login
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        menuItems={menuItems}
        isAuthenticated={isAuthenticated}
        userName={typeof userName === 'string' ? userName : ''}
      />
    </>
  );
}
