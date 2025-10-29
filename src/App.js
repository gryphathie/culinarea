import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import TopNavBar from './components/TopNavBar';
import SideMenu from './components/SideMenu';
import HomePage from './components/pages/HomePage';
import RecipesPage from './components/pages/RecipesPage';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <Router>
      <div className="App">
        <TopNavBar onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
        <SideMenu isOpen={isMenuOpen} onClose={closeMenu} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recetas" element={<RecipesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
