import './App.css'
import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import { useUser } from './context/UserContext';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import MainContent from './components/MainContent';
import AboutCourse from './pages/AboutContent/AboutCourse';


const App: React.FC = () => {
  const { isLoggedIn, logout: contextLogout, userType } = useUser();
  const [isOpen, setIsOpen] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoggedIn) {
      if (!showAdmin) navigate('/projects');
      else navigate('/manageusers');
    }
    else if (!showAboutPage) {
      navigate('/login');
    }
  }, [isLoggedIn, showAboutPage]);

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

  if (isLoggedIn && !showAboutPage) {
    return (
      <div className="app">
        {showAdmin && userType === "Admin" ? (<AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onBack={handleAdminBack} />) : (<Sidebar isOpen={isOpen} setIsOpen={setIsOpen} logout={logout} onAdminClick={handleAdminClick}/>)}
        <MainContent setShowAboutPage={setShowAboutPage} />
      </div>
    );
  }

  if (showAboutPage) return <AboutCourse setShowAboutPage={setShowAboutPage} />;

  return <Login />;




}

export default App;