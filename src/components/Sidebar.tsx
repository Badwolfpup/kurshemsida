import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from './Calendar';
import './Sidebar.css';
import { useUser } from '../context/UserContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  logout: () => void;
  onAdminClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, logout, onAdminClick }) => {
  const [htmlExpanded, setHtmlExpanded] = useState(false);
  const [cssExpanded, setCssExpanded] = useState(false);
  const [jsExpanded, setJsExpanded] = useState(false);
  const { userType, userPermissions, loading } = useUser();
  // const [error, setError] = useState<string | null>(null);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
      <div className="sidebar-content">
        <h2>Menu</h2>
        <Calendar />
        <div className="menu-link">
          <Link to="/timeline">Nyheter</Link>
        </div>
        <div className="menu">
          {userPermissions.hasOwnProperty("html") && userPermissions.html && (
          <>
            <div className="menu-item" onClick={() => setHtmlExpanded(!htmlExpanded)}>
              <span className="expand-icon">{htmlExpanded ? '-' : '+'}</span> HTML
            </div>
            {htmlExpanded && (
              <ul className="submenu">
                <li><Link to="/courses/html/basics">Basics</Link></li>
                <li><Link to="/courses/html/forms">Forms</Link></li>
                <li><Link to="/courses/html/advanced">Advanced</Link></li>
              </ul>
            )}
          </>
          )}
          {userPermissions.hasOwnProperty("css") && userPermissions.css && (
          <>
            <div className="menu-item" onClick={() => setCssExpanded(!cssExpanded)}>
              <span className="expand-icon">{cssExpanded ? '-' : '+'}</span> CSS
            </div>
            {cssExpanded && (
              <ul className="submenu">
                <li><Link to="/courses/css/selectors">Selectors</Link></li>
                <li><Link to="/courses/css/layout">Layout</Link></li>
                <li><Link to="/courses/css/advanced">Advanced</Link></li>
              </ul>
            )}
          </>
          )}

          {userPermissions.hasOwnProperty("javascript") && userPermissions.javascript && (
          <>
            <div className="menu-item" onClick={() => setJsExpanded(!jsExpanded)}>
              <span className="expand-icon">{jsExpanded ? '-' : '+'}</span> JavaScript
            </div>
            {jsExpanded && (
              <ul className="submenu">
              <li><Link to="/courses/javascript/introduktion">Introduktion till javascript</Link></li>
              {userPermissions.hasOwnProperty("variable") && userPermissions.variable && <li><Link to="/courses/javascript/variables">Variabler</Link></li>}
              {userPermissions.hasOwnProperty("conditionals") && userPermissions.conditionals && <li><Link to="/courses/javascript/conditionals">Villkorssatser</Link></li>}
              {userPermissions.hasOwnProperty("loops") && userPermissions.loops && <li><Link to="/courses/javascript/loops">Loopar</Link></li>}
              {userPermissions.hasOwnProperty("functions") && userPermissions.functions && <li><Link to="/courses/javascript/functions">Funktioner</Link></li>}
              {userPermissions.hasOwnProperty("arrays") && userPermissions.arrays && <li><Link to="/courses/javascript/arrays">Arrayer</Link></li>}
              {userPermissions.hasOwnProperty("objects") && userPermissions.objects && <li><Link to="/courses/javascript/objects">Objekt</Link></li>}
              {/* Add more sub-items here if needed */}
            </ul>
            )}
          </>
          )}
          {loading && <p>Loading...</p>}
          {/* {error && <p>Error: {error}</p>} */}
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
    </div>
  );
};

export default Sidebar;