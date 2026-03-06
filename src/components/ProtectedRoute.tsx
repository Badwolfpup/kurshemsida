import { Navigate } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';

interface Props {
  allow: 'admin' | 'student';
  children: React.ReactNode;
}

export default function ProtectedRoute({ allow, children }: Props) {
  const { isAdmin, isStudent, loading } = useUserRole();
  if (loading) return null;
  if (allow === 'admin' && !isAdmin) return <Navigate to="/" replace />;
  if (allow === 'student' && !isStudent) return <Navigate to="/" replace />;
  return <>{children}</>;
}
