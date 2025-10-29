import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import TopNavBar from './components/TopNavBar';
import SideMenu from './components/SideMenu';
import HomePage from './components/pages/HomePage';
import RecipesPage from './components/pages/RecipesPage';
import AuthPage from './components/pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Check if current route is auth page
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="App">
      {/* Only show navigation on non-auth pages */}
      {!isAuthPage && (
        <>
          <TopNavBar onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
          <SideMenu isOpen={isMenuOpen} onClose={closeMenu} />
        </>
      )}
      
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/recetas" element={
          <ProtectedRoute>
            <RecipesPage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
