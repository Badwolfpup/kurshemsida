import './App.css'
import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import MainContent from './components/MainContent';
import AboutCourse from './pages/AboutContent/AboutCourse';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';

const queryClient = new QueryClient();


const App: React.FC = () => {
  const { isLoggedIn, isLoading, logout: contextLogout, userType } = useUser();
  const [isOpen, setIsOpen] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(true);
  const navigate = useNavigate();
;

  useEffect(() => {
    if (isLoading) return; // Wait until loading is complete
    if (isLoggedIn) {
      setShowAboutPage(false);
      if (!showAdmin) navigate('/projects');
      else navigate('/manageusers');
    }
    else if (!showAboutPage) navigate('/login');

    else navigate('/');
  }, [isLoggedIn, showAboutPage, isLoading]);

  const logout = () => {
    contextLogout();
    setShowAboutPage(true);
    navigate('/');
  }

  const handleAdminClick = () => {
    setShowAdmin(true);
    navigate('/manageusers'); // Navigate to default admin page
  };

  const handleAdminBack = () => {
    setShowAdmin(false);
    navigate('/projects'); // Navigate back to home or timeline
  };


  return (
    <QueryClientProvider client={queryClient}>
      {isLoggedIn && !showAboutPage ? (
        <div className="app">
          {showAdmin && userType === "Admin" ? (
            <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onBack={handleAdminBack} />
          ) : (
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} logout={logout} onAdminClick={handleAdminClick}/>
          )}
          <MainContent setShowAboutPage={setShowAboutPage} />
        </div>
      ) : showAboutPage ? (
        <AboutCourse setShowAboutPage={setShowAboutPage} />
      ) : (
        <Login setShowAboutPage={setShowAboutPage} />
      )}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );



}

export default App;