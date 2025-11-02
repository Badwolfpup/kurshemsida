import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from './Calendar';
import './Sidebar.css';
import { useUser } from '../context/UserContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  logout: () => void;
  onAdminClick: () => void; // New prop

}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, logout, onAdminClick }) => {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [messagesExpanded, setMessagesExpanded] = useState(false);
  const { userType } = useUser();
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
      <h2>Menu</h2>
      <Calendar />
      <div className="menu-link">
        <Link to="/timeline">Nyheter</Link>
      </div>
      <div className="menu">
        <div className="menu-item" onClick={() => setMessagesExpanded(!messagesExpanded)}>
          Meddelanden {messagesExpanded ? '-' : '+'}
        </div>
        {messagesExpanded && (
          <ul className="submenu">
            <li><Link to="/messages">Adam</Link></li>
            <li><Link to="/messages">Victoria</Link></li>
          </ul>
        )}
        <div className="menu-item" onClick={() => setMenuExpanded(!menuExpanded)}>
          Kurser {menuExpanded ? '-' : '+'}
        </div>
        {menuExpanded && (
          <ul className="submenu">
            <li><Link to="/courses">Datatyper</Link></li>
          </ul>
        )}
      </div>
      <div className="menu-link">
        <Link to="/exercises">Övningar</Link>
      </div>
      <div className="menu-link">
        <Link to="/settings">Inställningar</Link>
      </div>
      {userType === 'Admin' && (
        <div className="menu-link">
          <a href="#" onClick={(e) => { e.preventDefault(); onAdminClick(); }}>Admin Panel</a>
        </div>
      )}
      <div className="menu-link">
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a>
      </div>
    </div>
  );
};

export default Sidebar;