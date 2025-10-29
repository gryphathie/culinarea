import React, { useState } from 'react';
import './TopNavBar.css';

const TopNavBar = ({ onMenuToggle, isMenuOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Add search functionality here
    console.log('Searching for:', searchTerm);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
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
