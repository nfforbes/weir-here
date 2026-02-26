'use client';

import HomeIcon from '@mui/icons-material/Home';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BusinessIcon from '@mui/icons-material/Business';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import FactoryIcon from '@mui/icons-material/Factory';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import WorkIcon from '@mui/icons-material/Work';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuIcon from '@mui/icons-material/Menu';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PeopleIcon from '@mui/icons-material/People';
import type { SvgIconComponent } from '@mui/icons-material';

const iconMap: Record<string, SvgIconComponent> = {
  Home: HomeIcon,
  Lightbulb: LightbulbIcon,
  Business: BusinessIcon,
  PersonSearch: PersonSearchIcon,
  Factory: FactoryIcon,
  Info: InfoIcon,
  ContactMail: ContactMailIcon,
  Work: WorkIcon,
  Dashboard: DashboardIcon,
  AdminPanelSettings: AdminPanelSettingsIcon,
  Menu: MenuIcon,
  BusinessCenter: BusinessCenterIcon,
  PostAdd: PostAddIcon,
  People: PeopleIcon,
};

export function getIcon(name: string): SvgIconComponent {
  return iconMap[name] || HomeIcon;
}
