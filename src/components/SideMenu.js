import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../firebase/auth';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      onClose(); // Close the menu
      navigate('/'); // Redirect to home page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    onClose(); // Close the menu
    navigate('/auth'); // Navigate to auth page
  };

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
            <button onClick={handleProfileClick} className="menu-link">
              <span className="menu-icon">👤</span>
              Profile
            </button>
          </li>
          <li>
            <button onClick={onClose} className="menu-link">
              <span className="menu-icon">🔔</span>
              Notifications
            </button>
          </li>
          <li>
            <button onClick={onClose} className="menu-link">
              <span className="menu-icon">❓</span>
              Help
            </button>
          </li>
          <li>
            <button onClick={handleLogout} className="menu-link logout">
              <span className="menu-icon">🚪</span>
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default SideMenu;
