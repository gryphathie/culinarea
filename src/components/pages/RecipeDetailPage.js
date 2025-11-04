import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipeService } from '../../firebase/services';
import './RecipeDetailPage.css';

const RecipeDetailPage = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('adult'); // 'adult' or 'child'

  const difficultyLabels = {
    beginner: 'NIVEL PRINCIPIANTE',
    familiarized: 'NIVEL FAMILIARIZADO',
    challenge: 'RETO'
  };

  const categoryLabels = {
    salty: 'SALADO',
    sweet: 'DULCE',
    snack: 'SNACK',
    healthy: 'SALUDABLE'
  };

  const difficultyColors = {
    beginner: '#4CAF50',
    familiarized: '#FF9800',
    challenge: '#F44336'
  };

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    setLoading(true);
    setError('');
    try {
      const recipeData = await recipeService.getRecipeById(recipeId);
      setRecipe(recipeData);
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError('Error al cargar la receta');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/recetas');
  };

  if (loading) {
    return (
      <div className="recipe-detail-page">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#50B8B8'
        }}>
          Cargando receta...
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="recipe-detail-page">
        <div className="error-container">
          <p className="error-message">{error || 'Receta no encontrada'}</p>
          <button className="back-button" onClick={handleBackClick}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const difficultyColor = difficultyColors[recipe.difficulty] || '#50B8B8';
  const category = categoryLabels[recipe.type] || recipe.type;
  const difficulty = difficultyLabels[recipe.difficulty] || recipe.difficulty;

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const adultSteps = Array.isArray(recipe.stepsAdults) ? recipe.stepsAdults : [];
  const childSteps = Array.isArray(recipe.stepsChildren) ? recipe.stepsChildren : [];

  return (
    <div className="recipe-detail-page">
      <div className="recipe-detail-container">
        {/* Header with back button */}
        <div className="recipe-detail-header">
          <button className="back-icon-button" onClick={handleBackClick}>
            ←
          </button>
          <h1 className="recipe-detail-title">{recipe.title}</h1>
          <div></div> {/* Spacer for alignment */}
        </div>

        {/* Category and Difficulty Pills */}
        <div className="recipe-pills">
          <span className="pill category-pill">{category}</span>
          <span 
            className="pill difficulty-pill"
            style={{ backgroundColor: difficultyColor }}
          >
            {difficulty}
          </span>
        </div>
        {/* Content Area */}
        <div className="recipe-content">
          {/* Ingredients Section - Always visible */}
          <div className="section ingredients-section">
            <h2 className="section-title">INGREDIENTES</h2>
            <div className="ingredients-box">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                  {ingredient}
                </div>
              ))}
            </div>
          </div>

          {/* Activity Selection (Optional, based on wireframe) */}
          <div className="activity-selection">
            <h2 className="section-title">ACTIVIDADES DESIGNADAS</h2>
            <div className="activity-buttons">
              <button 
                className={`activity-button ${activeTab === 'adult' ? 'active' : ''}`}
                onClick={() => setActiveTab('adult')}
              >
                ADULTO
              </button>
              <button 
                className={`activity-button ${activeTab === 'child' ? 'active' : ''}`}
                onClick={() => setActiveTab('child')}
              >
                NIÑO
              </button>
            </div>
          </div>

          {/* Steps Section - Depends on active tab */}
          <div className="section steps-section">              
            <div className="steps-list">
              {activeTab === 'adult' && adultSteps.length > 0 ? (
                adultSteps.map((step, index) => (
                  <div key={index} className="step-item">
                    <span className="step-badge">Paso {index + 1}</span>
                    <p className="step-text">{step}</p>
                  </div>
                ))
              ) : activeTab === 'child' && childSteps.length > 0 ? (
                childSteps.map((step, index) => (
                  <div key={index} className="step-item">
                    <span className="step-badge">Paso {index + 1}</span>
                    <p className="step-text">{step}</p>
                  </div>
                ))
              ) : (
                <p className="no-steps">No hay pasos disponibles</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="recipe-detail-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;

