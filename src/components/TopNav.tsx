import { Menu, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KomIgangDialog } from '@/components/KomIgangDialog';
import { NewsDialog } from '@/components/NewsDialog';
import { ChangelogDialog } from '@/components/ChangelogDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import './TopNav.css';

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name[0]?.toUpperCase() || '?';
  }
  if (email) return email[0]?.toUpperCase() || '?';
  return '?';
}

interface TopNavProps {
  onMenuToggle: () => void;
}

export function TopNav({ onMenuToggle }: TopNavProps) {
  const { isLoggedIn, isGuest, user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const avatarUrl = profile?.avatar_url;
  const initials = getInitials(profile?.display_name, user?.email);

  return (
    <header className="topnav">
      <div className="topnav__left">
        <button
          className="topnav__hamburger"
          onClick={onMenuToggle}
          aria-label="Öppna meny"
        >
          <Menu />
        </button>
        {/* <h2 className='topnav__title'>CUL Programmering</h2> */}
      </div>

      <div className="topnav__actions">
        {isLoggedIn && <KomIgangDialog />}
        {isLoggedIn && <ChangelogDialog />}
        {isLoggedIn && <NewsDialog />}
        {isLoggedIn ? (
          avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profil"
              className="topnav__avatar"
              style={{ objectFit: 'cover' }}
              onClick={() => navigate('/profil')}
            />
          ) : (
            <div
              className="topnav__avatar"
              onClick={() => navigate('/profil')}
              style={{ cursor: 'pointer' }}
            >
              {initials}
            </div>
          )
        ) : isGuest ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/login')}
          >
            <LogIn className="h-4 w-4" />
            Logga in
          </Button>
        ) : null}
      </div>
    </header>
  );
}
