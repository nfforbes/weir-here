'use client';

import { type ReactElement } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BusinessIcon from '@mui/icons-material/Business';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import FactoryIcon from '@mui/icons-material/Factory';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PostAddIcon from '@mui/icons-material/PostAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const iconMap: Record<string, ReactElement> = {
  Home: <HomeIcon fontSize="small" />,
  Lightbulb: <LightbulbIcon fontSize="small" />,
  Business: <BusinessIcon fontSize="small" />,
  PersonSearch: <PersonSearchIcon fontSize="small" />,
  Factory: <FactoryIcon fontSize="small" />,
  Info: <InfoIcon fontSize="small" />,
  ContactMail: <ContactMailIcon fontSize="small" />,
  Dashboard: <DashboardIcon fontSize="small" />,
  WorkOutline: <WorkOutlineIcon fontSize="small" />,
  PostAdd: <PostAddIcon fontSize="small" />,
  AdminPanelSettings: <AdminPanelSettingsIcon fontSize="small" />,
};

export function getMenuIcon(name: string): ReactElement | null {
  return iconMap[name] ?? null;
}
