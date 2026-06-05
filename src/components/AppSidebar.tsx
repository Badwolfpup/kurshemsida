import {
  Home,
  Users,
  Settings,
  LogOut,
  Mail,
  ChevronLeft,
  X,
  Contact,
  Calendar as CalendarIcon,
  CalendarCheck,
  Bug,
  LayoutGrid,
  BarChart3,
  Laptop,
  type LucideIcon,
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
  icon: LucideIcon;
}

function getMainNav(isAdmin: boolean, isCoach: boolean): NavItem[] {
  const items: NavItem[] = [{ title: 'Startsida', url: '/', icon: Home }];

  if (isAdmin) {
    items.push(
      { title: 'Hantera användare', url: '/hantera-anvandare', icon: Users },
      { title: 'Närvaro', url: '/narvaro', icon: CalendarCheck },
      { title: 'Deltagare', url: '/deltagare', icon: Users },
      { title: 'Deltagarschema', url: '/deltagarschema', icon: CalendarCheck },
      { title: 'Klassrum', url: '/klassrum', icon: LayoutGrid },
      { title: 'Statistik', url: '/statistik', icon: BarChart3 },
      { title: 'Datorer', url: '/datorer', icon: Laptop },
      {
        title: 'Kalender & Bokning',
        url: '/admin-schedule',
        icon: CalendarIcon,
      }
    );
  } else if (isCoach) {
    items.push(
      { title: 'Mina deltagare', url: '/mina-deltagare', icon: Users },
      {
        title: 'Kalender: Boka möte',
        url: '/coach-booking',
        icon: CalendarIcon,
      },
      { title: 'Kontakt', url: '/kontakt', icon: Contact }
    );
  }

  return items;
}

function getBottomNav(isAdmin: boolean, isCoach: boolean): NavItem[] {
  const items: NavItem[] = [];
  if (isAdmin) {
    items.push({ title: 'Buggar & Idéer', url: '/buggar', icon: Bug });
  }
  items.push({
    title: 'Profil',
    url: isCoach ? '/coach-installningar' : '/preferenser',
    icon: Settings,
  });
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
  const { signOut, isLoggedIn } = useAuth();
  const { isAdmin, isCoach } = useUserRole();

  // Hooks must run before any early return — keep these above the
  // `!isLoggedIn` guard so the hook order is identical on every render.
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close on route change only; onMobileClose prop isn't memoized
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onMobileClose]);

  if (!isLoggedIn) return null;

  const handleLogout = async () => {
    await signOut();
    void navigate('/login');
  };

  const mainNav = getMainNav(isAdmin, isCoach);
  const bottomNav = getBottomNav(isAdmin, isCoach);

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

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
