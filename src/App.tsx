import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { AppLayout } from '@/components/AppLayout';

// Pages
import AdminSchedule from './components/admin/AdminSchedule';
import Login from './pages/login';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import HanteraAnvandare from './pages/HanteraAnvandare';
import Narvaro from './pages/Narvaro';
import Buggar from './pages/Buggar';
import Preferenser from './pages/Preferenser';
import CoachSettings from './pages/CoachSettings';
import CoachMyParticipants from './pages/CoachMyParticipants';
import CoachContact from './pages/CoachContact';
import CoachProjects from './pages/CoachProjects';
import CoachBookingView from './pages/CoachBookingView';
import Deltagare from './pages/Deltagare';
import StudentSchedule from './pages/StudentSchedule';
import Klassrum from './pages/Klassrum';
import Statistik from './pages/Statistik';
import Datorer from './pages/Datorer';
import Kodsidor from './pages/Kodsidor';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function AppRoutes() {
  const { isGuest, loading, isLoggedIn } = useAuth();
  useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  // Not logged in and not guest → show start page (but allow public pages)
  if (!isLoggedIn && !isGuest) {
    return (
      <Routes>
        <Route path="/" element={<AppLayout><Index /></AppLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/kodsidor" element={<AppLayout><Kodsidor /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Guest → homepage and public pages
  if (isGuest && !isLoggedIn) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <Index />
            </AppLayout>
          }
        />
        <Route path="/kodsidor" element={<AppLayout><Kodsidor /></AppLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Logged in → full access
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/kodsidor" element={<Kodsidor />} />

        <Route path="/deltagare" element={<Deltagare />} />
        <Route path="/hantera-anvandare" element={<ProtectedRoute allow="admin"><HanteraAnvandare /></ProtectedRoute>} />
        <Route path="/narvaro" element={<ProtectedRoute allow="admin"><Narvaro /></ProtectedRoute>} />
        <Route path="/buggar" element={<ProtectedRoute allow="admin"><Buggar /></ProtectedRoute>} />
        <Route path="/admin-schedule" element={<ProtectedRoute allow="admin"><AdminSchedule /></ProtectedRoute>} />
        <Route path="/deltagarschema" element={<ProtectedRoute allow="admin"><StudentSchedule /></ProtectedRoute>} />
        <Route path="/klassrum" element={<ProtectedRoute allow="admin"><Klassrum /></ProtectedRoute>} />
        <Route path="/statistik" element={<ProtectedRoute allow="admin"><Statistik /></ProtectedRoute>} />
        <Route path="/datorer" element={<ProtectedRoute allow="admin"><Datorer /></ProtectedRoute>} />
        {/* Coach routes */}
        <Route path="/mina-deltagare" element={<CoachMyParticipants />} />
        <Route path="/kontakt" element={<CoachContact />} />
        <Route path="/coach-installningar" element={<CoachSettings />} />
        <Route path="/profil" element={<Preferenser />} />
        <Route path="/coach-projekt" element={<CoachProjects />} />
        <Route path="/coach-booking" element={<CoachBookingView />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
