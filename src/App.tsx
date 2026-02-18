import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { AppLayout } from "@/components/AppLayout";

// Pages
import AdminSchedule from "./components/admin/AdminSchedule";
import Login from "./pages/login";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Projekt from "./pages/Projekt";
import Ovningar from "./pages/Ovningar";
import Portfolio from "./pages/Portfolio";
import Admin from "./pages/Admin";
import Terminal from "./pages/Terminal";
import Preferenser from "./pages/Preferenser";
import CoachSettings from "./pages/CoachSettings";
import CoachTickets from "./pages/CoachTickets";
import CoachMyParticipants from "./pages/CoachMyParticipants";
import CoachContact from "./pages/CoachContact";
import CoachProjects from "./pages/CoachProjects";
import CoachBookingView from "./pages/CoachBookingView";
import Deltagare from "./pages/Deltagare";

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

  // Not logged in and not guest → show login
  if (!isLoggedIn && !isGuest) {
    return (
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    );
  }

  // Guest → only homepage
  if (isGuest && !isLoggedIn) {
    return (
      <Routes>
        <Route
          path='/'
          element={
            <AppLayout>
              <Index />
            </AppLayout>
          }
        />
        <Route path='/login' element={<Login />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    );
  }

  // Logged in → full access
  return (
    <AppLayout>
      <Routes>
        <Route path='/' element={<Index />} />
        <Route path='/projekt' element={<Projekt />} />
        <Route path='/ovningar' element={<Ovningar />} />
        <Route path='/portfolio' element={<Portfolio />} />
        <Route path='/deltagare' element={<Deltagare />} />
        <Route path='/preferenser' element={<Preferenser />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/terminal' element={<Terminal />} />
        <Route path='/admin-schedule' element={<AdminSchedule />} />
        {/* Coach routes */}
        <Route path='/mina-deltagare' element={<CoachMyParticipants />} />
        <Route path='/arenden' element={<CoachTickets />} />
        <Route path='/kontakt' element={<CoachContact />} />
        <Route path='/coach-installningar' element={<CoachSettings />} />
        <Route path='/profil' element={<Preferenser />} />
        <Route path='/coach-projekt' element={<CoachProjects />} />
        <Route path='/coach-booking' element={<CoachBookingView />} />
        <Route path='/login' element={<Navigate to='/' replace />} />
        <Route path='*' element={<NotFound />} />
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
