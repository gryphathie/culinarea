import React from 'react';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="menu-overlay" onClick={onClose}></div>}

      {/* Side Menu */}
      <nav className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h3></h3>
          <button className="close-btn" onClick={onClose} aria-label="Close menu">
            ×
          </button>
        </div>
        
        <ul className="menu-list">
          <li>
            <a href="/profile" onClick={onClose} className="menu-link">
              <span className="menu-icon">👤</span>
              Profile
            </a>
          </li>
          <li>
            <a href="/notifications" onClick={onClose} className="menu-link">
              <span className="menu-icon">🔔</span>
              Notifications
            </a>
          </li>
          <li>
            <a href="/help" onClick={onClose} className="menu-link">
              <span className="menu-icon">❓</span>
              Help
            </a>
          </li>
          <li>
            <a href="/logout" onClick={onClose} className="menu-link logout">
              <span className="menu-icon">🚪</span>
              Logout
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default SideMenu;
