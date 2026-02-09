import React from 'react';
import { Link } from 'react-router-dom';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onBack: () => void; // New prop
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen, onBack }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
      <h2>Admin menu</h2>
      <div className="menu-link">
        <Link to="/manageusers">Hantera användare</Link>
      </div>
      <div className="menu-link">
        <Link to="/attendance">Närvarohantering</Link>
      </div>
      <div className="menu-link">
        <Link to="/makepost">Skapa eventinlägg</Link>
      </div>
      {/* <div className="menu-link">
        <Link to="/manage-projects">Projekt</Link>
      </div>
      <div className="menu-link">
        <Link to="/manage-exercises">Övningar</Link>
      </div> */}
      <div className="menu-link">
        <Link to="/adminsettings">Admin Inställningar</Link>
      </div>
      <div className="menu-link">
        <button onClick={onBack}>Tillbaka</button> {/* Use onBack */}
      </div>
    </div>
  );
};

export default AdminSidebar;