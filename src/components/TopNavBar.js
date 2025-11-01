import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopNavBar.css';

const TopNavBar = ({ onMenuToggle, isMenuOpen }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Clear search after navigating
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <nav className="top-nav-bar">
      <div className="nav-content">
        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger ${isMenuOpen ? 'open' : ''}`} 
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Logo */}
        <button className="nav-logo" onClick={handleLogoClick}>
          culinárea
        </button>

        {/* Search Bar */}
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar recetas..."
              value={searchTerm}
              onChange={handleInputChange}
            />
            <button type="submit" className="search-button" aria-label="Search">
              <span className="search-icon">🔍</span>
            </button>
          </div>
        </form>
      </div>
    </nav>
  );
};

export default TopNavBar;
