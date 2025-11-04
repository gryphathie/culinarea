import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../../firebase/services';
import './RecipesPage.css';

const RecipesPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState({ type: null, difficulty: null });

  const recipeTypes = [
    { id: 'salty', name: 'SALADO', color: '#50B8B8' },
    { id: 'sweet', name: 'DULCE', color: '#3A9B9B' },
    { id: 'snack', name: 'SNACK', color: '#2A7A7A' },
    { id: 'healthy', name: 'SALUDABLE', color: '#2A7A7A' }
  ];

  const difficultyLevels = [
    { id: 'beginner', name: 'NIVEL PRINCIPIANTE' },
    { id: 'familiarized', name: 'NIVEL FAMILIARIZADO' },
    { id: 'challenge', name: 'RETO' }
  ];

  const difficultyLabels = {
    beginner: 'NIVEL PRINCIPIANTE',
    familiarized: 'NIVEL FAMILIARIZADO',
    challenge: 'RETO'
  };

  useEffect(() => {
    loadRecipes();
  }, [selectedFilter]);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      let allRecipes = [];
      
      if (selectedFilter.type && selectedFilter.difficulty) {
        allRecipes = await recipeService.getRecipesByTypeAndDifficulty(
          selectedFilter.type,
          selectedFilter.difficulty
        );
      } else if (selectedFilter.type) {
        allRecipes = await recipeService.getRecipesByType(selectedFilter.type);
      } else if (selectedFilter.difficulty) {
        allRecipes = await recipeService.getRecipesByDifficulty(selectedFilter.difficulty);
      } else {
        allRecipes = await recipeService.getAllRecipes();
      }
      
      setRecipes(allRecipes);
    } catch (err) {
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeTypeClick = (type) => {
    setSelectedFilter(prev => ({
      ...prev,
      type: prev.type === type.id ? null : type.id
    }));
  };

  const handleDifficultyClick = (difficulty) => {
    setSelectedFilter(prev => ({
      ...prev,
      difficulty: prev.difficulty === difficulty.id ? null : difficulty.id
    }));
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

  if (loading) {
    return (
      <div className="recipes-page">
        <div className="recipes-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            fontSize: '1.2rem',
            color: '#50B8B8'
          }}>
            Cargando recetas...
          </div>
        </div>
      </div>
    );
  }

  const displayedRecipes = recipes;

  return (
    <div className="recipes-page">
      <div className="recipes-container">
        {/* Page Header */}
        <div className="recipes-header">
          <h1 className="recipes-title">Recetas</h1>
        </div>

        {/* Recipe Types Section */}
        <div className="recipe-types-section">
          <div className="recipe-types-grid">
            {recipeTypes.map((type) => (
              <button
                key={type.id}
                className={`recipe-type-card ${selectedFilter.type === type.id ? 'active' : ''}`}
                style={{ backgroundColor: type.color }}
                onClick={() => handleRecipeTypeClick(type)}
              >
                <span className="recipe-type-name">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Section */}
        <div className="difficulty-section">
          <div className="difficulty-container">
            <h2 className="difficulty-title">Busca por dificultad</h2>
            <div className="difficulty-buttons">
              {difficultyLevels.map((level) => (
                <button
                  key={level.id}
                  className={`difficulty-button ${selectedFilter.difficulty === level.id ? 'active' : ''}`}
                  onClick={() => handleDifficultyClick(level)}
                >
                  <span className="difficulty-name">{level.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {displayedRecipes.length > 0 && (
          <div className="recipes-grid-section">
            <div className="recipes-grid">
              {displayedRecipes.map((recipe) => (
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

        {!loading && displayedRecipes.length === 0 && (
          <div className="no-recipes-message">
            <p>No se encontraron recetas con los filtros seleccionados.</p>
          </div>
        )}

        {/* Footer */}
        <div className="recipes-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;
