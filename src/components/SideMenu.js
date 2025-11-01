import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, useAuth } from '../firebase/auth';
import { userService } from '../firebase/services';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const adminStatus = await userService.isAdmin(user.uid);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    if (isOpen && user) {
      checkAdmin();
    }
  }, [user, isOpen]);

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

  const handleCreateRecipeClick = () => {
    onClose(); // Close the menu
    navigate('/admin/create-recipe'); // Navigate to create recipe page
  };

  const handleRecipesManagementClick = () => {
    onClose(); // Close the menu
    navigate('/admin/recipes'); // Navigate to recipes management page
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
              Perfil
            </button>
          </li>
          {isAdmin && (
            <>
              <li>
                <button onClick={handleRecipesManagementClick} className="menu-link">
                  <span className="menu-icon">📋</span>
                  Administrar Recetas
                </button>
              </li>
            </>
          )}
          <li>
            <button onClick={onClose} className="menu-link">
              <span className="menu-icon">🔔</span>
              Notificaciones
            </button>
          </li>
          <li>
            <button onClick={onClose} className="menu-link">
              <span className="menu-icon">❓</span>
              Ayuda
            </button>
          </li>
          <li>
            <button onClick={handleLogout} className="menu-link logout">
              <span className="menu-icon">🚪</span>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default SideMenu;
