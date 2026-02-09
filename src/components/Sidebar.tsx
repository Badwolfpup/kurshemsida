import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  logout: () => void;
  onAdminClick: () => void;
}



const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, logout, onAdminClick }) => {
  const { userType } = useUser();
  const isCoach= userType === 'Coach' || userType === 'Teacher' || userType === 'Admin';



  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
       <div className="sidebar-content">
        <h2>Meny</h2>

        <div className="menu-link">
          <Link to="/projects">Projekt</Link>
        </div>
        <div className="menu-link">
          <Link to="/exercises">Övningar</Link>
        </div>
        <div className="menu-link">
          <Link to="/portfolio">Portfolio</Link>
        </div>
        {isCoach && (
          <div className="menu-link">
            <Link to="/coach-narvaro">Deltagare</Link>
          </div>
        )}
        <div className="menu-link">
          <Link to="/settings">Preferenser</Link>
        </div>
        {(userType === 'Admin' || userType === 'Teacher') && (
          <div className="menu-link">
            <a href="#" onClick={(e) => { e.preventDefault(); onAdminClick(); }}>Admin Panel</a>
          </div>
        )}
        {(userType === 'Admin' || userType === 'Teacher') && (
          <div className="menu-link">
            <Link to="/">Startsida</Link>
          </div>
        )}
        <div className="menu-link">
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a>
        </div>
        <div className="sidebar-footer">
          <p>Webmaster: <a href='mailto:adam.folke@hudiksvall.se'>Adam Folke</a></p>
          <p>KomPRRP-ansvarig: <a href='mailto:adam.folke@hudiksvall.se'>Adam Folke</a></p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;