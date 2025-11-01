import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { recipeService } from '../../firebase/services';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q') || '';
  
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchQuery) {
      searchRecipes(searchQuery);
    } else {
      setLoading(false);
    }
  }, [searchQuery]);

  const searchRecipes = async (query) => {
    setLoading(true);
    try {
      const allRecipes = await recipeService.getAllRecipes();
      
      // Filter recipes by title (case-insensitive search)
      const filteredRecipes = allRecipes.filter(recipe =>
        recipe.title && recipe.title.toLowerCase().includes(query.toLowerCase())
      );
      
      setRecipes(filteredRecipes);
    } catch (err) {
      console.error('Error searching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/receta/${recipeId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'familiarized': return '#FF9800';
      case 'challenge': return '#F44336';
      default: return '#50B8B8';
    }
  };

  const recipeTypes = [
    { id: 'salty', name: 'SALADO', color: '#50B8B8' },
    { id: 'sweet', name: 'DULCE', color: '#3A9B9B' },
    { id: 'snack', name: 'SNACK', color: '#2A7A7A' },
    { id: 'healthy', name: 'SALUDABLE', color: '#2A7A7A' }
  ];

  const difficultyLabels = {
    beginner: 'NIVEL PRINCIPIANTE',
    familiarized: 'NIVEL FAMILIARIZADO',
    challenge: 'RETO'
  };

  if (loading) {
    return (
      <div className="search-results-page">
        <div className="search-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            fontSize: '1.2rem',
            color: '#50B8B8'
          }}>
            Buscando...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-container">
        {/* Header */}
        <div className="search-header">
          <h1 className="search-title">
            Resultados de búsqueda
          </h1>
          {searchQuery && (
            <p className="search-query">
              Buscando: "<strong>{searchQuery}</strong>"
            </p>
          )}
        </div>

        {/* Results */}
        {recipes.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron recetas para tu búsqueda.</p>
            <button className="back-to-recipes" onClick={() => navigate('/recetas')}>
              Ver todas las recetas
            </button>
          </div>
        ) : (
          <div className="results-grid">
            <div className="results-count">
              Se encontraron {recipes.length} {recipes.length === 1 ? 'receta' : 'recetas'}
            </div>
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="recipe-card"
                  onClick={() => handleRecipeClick(recipe.id)}
                >
                  <div className="recipe-card-header">
                    <span className="recipe-type-badge" style={{ backgroundColor: recipeTypes.find(t => t.id === recipe.type)?.color || '#50B8B8' }}>
                      {recipeTypes.find(t => t.id === recipe.type)?.name || recipe.type}
                    </span>
                    <span 
                      className="recipe-difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                    >
                      {difficultyLabels[recipe.difficulty] || recipe.difficulty}
                    </span>
                  </div>
                  <h3 className="recipe-card-title">{recipe.title}</h3>
                  <div className="recipe-card-info">
                    <span>📋 {Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0} ingredientes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="search-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;

