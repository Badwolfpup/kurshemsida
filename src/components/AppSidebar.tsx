import {
  Home,
  FolderKanban,
  Dumbbell,
  Briefcase,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  Mail,
  ChevronLeft,
  TerminalIcon,
  X,
  Ticket,
  Contact,
  UserCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import './AppSidebar.css';

interface NavItem {
  title: string;
  url: string;
  icon: any;
}

function getMainNav(isAdmin: boolean, isCoach: boolean): NavItem[] {
  const items: NavItem[] = [{ title: 'Startsida', url: '/', icon: Home }];

  if (isAdmin) {
    items.push(
      { title: 'Admin Panel', url: '/admin', icon: ShieldCheck },
      { title: 'Övningar', url: '/ovningar', icon: Dumbbell },
      { title: 'Projekt', url: '/projekt', icon: FolderKanban },
      { title: 'Deltagare', url: '/deltagare', icon: Users },
      {
        title: 'Kalender & Bokning',
        url: '/admin-schedule',
        icon: CalendarIcon,
      },
      { title: 'Profil', url: '/profil', icon: UserCircle },
      { title: 'Terminal', url: '/terminal', icon: TerminalIcon }
    );
  } else if (isCoach) {
    items.push(
      { title: 'Mina deltagare', url: '/mina-deltagare', icon: Users },
      { title: 'Ärenden', url: '/arenden', icon: Ticket },
      { title: 'Kontakt', url: '/kontakt', icon: Contact },
      {
        title: 'Kalender: Boka intro',
        url: '/coach-booking',
        icon: CalendarIcon,
      },
      { title: 'Profil', url: '/profil', icon: UserCircle }
    );
  } else {
    items.push(
      { title: 'Projekt', url: '/projekt', icon: FolderKanban },
      { title: 'Övningar', url: '/ovningar', icon: Dumbbell },
      { title: 'Portfolio', url: '/portfolio', icon: Briefcase },
      { title: 'Profil', url: '/profil', icon: UserCircle },
      { title: 'Terminal', url: '/terminal', icon: TerminalIcon }
    );
  }

  return items;
}

function getBottomNav(isAdmin: boolean, isCoach: boolean): NavItem[] {
  const items: NavItem[] = [
    {
      title: 'Inställningar',
      url: isCoach ? '/coach-installningar' : '/preferenser',
      icon: Settings,
    },
  ];
  return items;
}

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isGuest } = useAuth();
  const { isAdmin, isCoach } = useUserRole();

  if (isGuest) return null;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const mainNav = getMainNav(isAdmin, isCoach);
  const bottomNav = getBottomNav(isAdmin, isCoach);

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  useEffect(() => {
    onMobileClose();
  }, [location.pathname]);

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      <aside
        className={`sidebar ${collapsed ? 'sidebar--collapsed' : 'sidebar--expanded'} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}
      >
        <div className="sidebar__header">
          {!collapsed && (
            <div className="sidebar__logo">
              <div className="sidebar__logo-icon">CUL</div>
              <span className="sidebar__logo-text">Programmering</span>
            </div>
          )}
          <button
            onClick={() => {
              if (mobileOpen) onMobileClose();
              else setCollapsed(!collapsed);
            }}
            className="sidebar__toggle"
          >
            {mobileOpen ? (
              <X className="sidebar__toggle-icon" />
            ) : (
              <ChevronLeft
                className={`sidebar__toggle-icon ${collapsed ? 'sidebar__toggle-icon--rotated' : ''}`}
              />
            )}
          </button>
        </div>

        <nav className="sidebar__nav">
          {!collapsed && <span className="sidebar__section-label">Meny</span>}
          {mainNav.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === '/'}
              className={`sidebar__link ${isActive(item.url) ? 'sidebar__link--active' : ''}`}
              activeClassName=""
            >
              <item.icon className="sidebar__link-icon" />
              {(!collapsed || mobileOpen) && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__bottom">
          {bottomNav.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={`sidebar__link ${isActive(item.url) ? 'sidebar__link--active' : ''}`}
              activeClassName=""
            >
              <item.icon className="sidebar__link-icon" />
              {(!collapsed || mobileOpen) && <span>{item.title}</span>}
            </NavLink>
          ))}

          <button className="sidebar__logout" onClick={handleLogout}>
            <LogOut className="sidebar__link-icon" />
            {(!collapsed || mobileOpen) && <span>Logga ut</span>}
          </button>

          {(!collapsed || mobileOpen) && (
            <div className="sidebar__footer">
              <p>
                <Mail className="sidebar__mail-icon" />
                <a href="mailto:webmaster@cul.se">webmaster@cul.se</a>
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
