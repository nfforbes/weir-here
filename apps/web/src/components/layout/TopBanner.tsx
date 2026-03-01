'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  IMenuItem,
  PUBLIC_MENU,
  AUTHENTICATED_MENU,
  ADMIN_MENU,
} from '@weir-here/shared';
import { filterMenuForUser } from '@/lib/rbac';
import { useAppSelector } from '@/store';
import { DEEP_NAVY, ELECTRIC_BLUE } from '@/theme/theme';
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleDropdownOpen = (event: React.MouseEvent<HTMLElement>, label: string) => {
    setDropdownAnchor(event.currentTarget);
    setActiveDropdown(label);
  };

  const handleDropdownClose = () => {
    setDropdownAnchor(null);
    setActiveDropdown(null);
  };

  return (
    <>
      {/* Deep Navy Info Bar */}
      <Box
        sx={{
          bgcolor: DEEP_NAVY,
          color: 'white',
          py: 0.5,
          px: 3,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          info@weirhere.com &nbsp;|&nbsp; (555) 123-4567
        </Typography>
      </Box>

      {/* Electric Blue Main Banner */}
      <Box
        component="nav"
        sx={{
          bgcolor: ELECTRIC_BLUE,
          color: 'white',
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
            <Box
              component="img"
              src="/weir-here-logo.png"
              alt="Weir Here"
              onError={() => setLogoError(true)}
              sx={{ height: 64, width: 'auto', maxWidth: 220, objectFit: 'contain' }}
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
                <Box key={item.label}>
                  <Button
                    color="inherit"
                    endIcon={<ArrowDropDownIcon />}
                    onClick={(e) => handleDropdownOpen(e, item.label)}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    {item.label}
                  </Button>
                  <Menu
                    anchorEl={dropdownAnchor}
                    open={activeDropdown === item.label}
                    onClose={handleDropdownClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  >
                    {item.children.map((child) => (
                      <MenuItem
                        key={child.path}
                        onClick={handleDropdownClose}
                        component={Link}
                        href={child.path}
                        sx={{ gap: 1 }}
                      >
                        {getMenuIcon(child.icon)}
                        {child.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
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
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.6)',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
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
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.6)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
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
