import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import Calendar from './Calendar';
import './Sidebar.css';
import { useUser } from '../context/UserContext';
import getPermissions from '../data/FetchPermissions';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  logout: () => void;
  onAdminClick: () => void;
}

interface Permissions {
  userId: number;
  html: boolean;
  css: boolean;
  javascript: boolean;
  variable: boolean;
  conditionals: boolean;
  loops: boolean;
  functions: boolean;
  arrays: boolean;
  objects: boolean;
}

const defaultPermissions: Permissions = {
  userId: 0,
  html: false,
  css: false,
  javascript: false,
  variable: false,
  conditionals: false,
  loops: false,
  functions: false,
  arrays: false,
  objects: false
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, logout, onAdminClick }) => {
  const [htmlExpanded, setHtmlExpanded] = useState(false);
  const [cssExpanded, setCssExpanded] = useState(false);
  const [jsExpanded, setJsExpanded] = useState(false);
  const [userPermissions, setUserPermissions] = useState<Permissions>(defaultPermissions);
  const { userType, userEmail } = useUser();
  const isStudent= userType === 'Student';
  const isCoach= userType === 'Coach';

useEffect(() => {
  const fetchPermissions = async () => {
    if (userType !== 'Student') return;
    if (userEmail) {
      const permissions = await getPermissions(userEmail);
      setUserPermissions(permissions || defaultPermissions);
    }
  };
  fetchPermissions();
}, []);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
      <div className="sidebar-content">
        <h2>Menu</h2>
        {/* <Calendar />
        <div className="menu-link">
          <Link to="/timeline">Nyheter</Link>
        </div> */}
        <div className="menu">
          {(userPermissions.hasOwnProperty("html") && userPermissions.html) || !isStudent && (
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
          {(userPermissions.hasOwnProperty("css") && userPermissions.css) || !isStudent && (
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

          {(userPermissions.hasOwnProperty("javascript") && userPermissions.javascript) || !isStudent && (
          <>
            <div className="menu-item" onClick={() => setJsExpanded(!jsExpanded)}>
              <span className="expand-icon">{jsExpanded ? '-' : '+'}</span> JavaScript
            </div>
            {jsExpanded && (
              <ul className="submenu">
              <li><Link to="/courses/javascript/introduktion">Introduktion till javascript</Link></li>
              {(userPermissions.hasOwnProperty("variable") && userPermissions.variable) || !isStudent && <li><Link to="/courses/javascript/variables">Variabler</Link></li>}
              {(userPermissions.hasOwnProperty("conditionals") && userPermissions.conditionals) || !isStudent && <li><Link to="/courses/javascript/conditionals">Villkorssatser</Link></li>}
              {(userPermissions.hasOwnProperty("loops") && userPermissions.loops) || !isStudent && <li><Link to="/courses/javascript/loops">Loopar</Link></li>}
              {(userPermissions.hasOwnProperty("functions") && userPermissions.functions) || !isStudent && <li><Link to="/courses/javascript/functions">Funktioner</Link></li>}
              {(userPermissions.hasOwnProperty("arrays") && userPermissions.arrays) || !isStudent && <li><Link to="/courses/javascript/arrays">Arrayer</Link></li>}
              {(userPermissions.hasOwnProperty("objects") && userPermissions.objects) || !isStudent && <li><Link to="/courses/javascript/objects">Objekt</Link></li>}
              {/* Add more sub-items here if needed */}
            </ul>
            )}
          </>
          )}
        </div>
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
            <Link to="/coach-narvaro">Närvaro</Link>
          </div>
        )}
        <div className="menu-link">
          <Link to="/settings">Preferenser</Link>
        </div>
        {userType === 'Admin' && (
          <div className="menu-link">
            <a href="#" onClick={(e) => { e.preventDefault(); onAdminClick(); }}>Admin Panel</a>
          </div>
        )}
        <div className="menu-link">
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a>
        </div>
        <div className="sidebar-footer">
          <p>Webmaster: <a href='mailto:adam.folke@hudiksvall.se'>Adam Folke</a></p>
          <p>Kommunens <a href='https://hudiksvall.se/Sidor/Kommun-och-politik/Om-personuppgifter.html' target='_blank' rel="noopener noreferrer">GDPR-policy</a></p>
          <p>GDRP-ansvarig: <a href='mailto:adam.folke@hudiksvall.se'>Adam Folke</a></p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;