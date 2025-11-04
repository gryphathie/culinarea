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
    navigate('/perfil'); // Navigate to profile page
  };

  const handleCreateRecipeClick = () => {
    onClose(); // Close the menu
    navigate('/admin/create-recipe'); // Navigate to create recipe page
  };

  const handleRecipesManagementClick = () => {
    onClose(); // Close the menu
    navigate('/admin/recipes'); // Navigate to recipes management page
  };

  const handleHelpClick = () => {
    onClose(); // Close the menu
    navigate('/ayuda'); // Navigate to help page
  };

  const handleFeedbackManagementClick = () => {
    onClose(); // Close the menu
    navigate('/admin/feedback'); // Navigate to feedback management page
  };

  const handleHomeClick = () => {
    onClose(); // Close the menu
    navigate('/'); // Navigate to home page
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
            <button onClick={handleHomeClick} className="menu-link">
              <span className="menu-icon">🏠</span>
              Inicio
            </button>
          </li>
          <li>
            <button onClick={handleProfileClick} className="menu-link">
              <span className="menu-icon">👤</span>
              Perfil
            </button>
          </li>
          <li>
            <button onClick={onClose} className="menu-link">
              <span className="menu-icon">🔔</span>
              Notificaciones
            </button>
          </li>
          <li>
            <button onClick={() => {
              onClose();
              navigate('/chat');
            }} className="menu-link">
              <span className="menu-icon">📢</span>
              Chat de la comunidad
            </button>
          </li>
          <li>
            <button onClick={handleHelpClick} className="menu-link">
              <span className="menu-icon">❓</span>
              Ayuda
            </button>
          </li>
          {isAdmin && (
            <>
              <li className="menu-divider">
                <div className="menu-section-header">
                  <span className="section-label">ADMINISTRADORES</span>
                </div>
              </li>
              <li>
                <button onClick={handleRecipesManagementClick} className="menu-link">
                  <span className="menu-icon">📋</span>
                  Administrar Recetas
                </button>
              </li>
              <li>
                <button onClick={handleFeedbackManagementClick} className="menu-link">
                  <span className="menu-icon">💬</span>
                  Comentarios
                </button>
              </li>
            </>
          )}
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
