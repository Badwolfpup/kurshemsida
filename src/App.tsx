import './App.css'
import React, { useState} from 'react';
// import { Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import { useUser } from './context/UserContext';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';


const App: React.FC = () => {
  const { isLoggedIn, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="app">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} logout={logout} />
      <MainContent />
    </div>
  );

}

export default App;