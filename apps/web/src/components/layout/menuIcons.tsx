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
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PeopleIcon from '@mui/icons-material/People';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import WorkIcon from '@mui/icons-material/Work';

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
  LocalHospital: <LocalHospitalIcon fontSize="small" />,
  MedicalServices: <MedicalServicesIcon fontSize="small" />,
  HealthAndSafety: <HealthAndSafetyIcon fontSize="small" />,
  People: <PeopleIcon fontSize="small" />,
  TravelExplore: <TravelExploreIcon fontSize="small" />,
  HomeWork: <HomeWorkIcon fontSize="small" />,
  Work: <WorkIcon fontSize="small" />,
};

export function getMenuIcon(name: string): ReactElement | null {
  return iconMap[name] ?? null;
}
