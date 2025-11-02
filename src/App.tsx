import './App.css'
import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import { useUser } from './context/UserContext';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import MainContent from './components/MainContent';


const App: React.FC = () => {
  const { isLoggedIn, logout, userType } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const navigate = useNavigate();
  
  if (!isLoggedIn) {
    return <Login />;
  }

  const handleAdminClick = () => {
    setShowAdmin(true);
    navigate('/manageusers'); // Navigate to default admin page
  };

  const handleAdminBack = () => {
    setShowAdmin(false);
    navigate('/'); // Navigate back to home or timeline
  };

  return (
    <div className="app">
      {showAdmin && userType === "Admin" ? (<AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onBack={handleAdminBack} />) : (<Sidebar isOpen={isOpen} setIsOpen={setIsOpen} logout={logout} onAdminClick={handleAdminClick}/>)}
      <MainContent />
    </div>
  );

}

export default App;