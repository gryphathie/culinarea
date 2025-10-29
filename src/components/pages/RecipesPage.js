import React from 'react';
import './RecipesPage.css';

const RecipesPage = () => {
  const recipeTypes = [
    {
      id: 'salty',
      name: 'SALADO',
      color: '#50B8B8',
      description: 'Recetas saladas'
    },
    {
      id: 'sweet',
      name: 'DULCE',
      color: '#3A9B9B',
      description: 'Recetas dulces'
    },
    {
      id: 'snack',
      name: 'SNACK',
      color: '#2A7A7A',
      description: 'Snacks y aperitivos'
    },
    {
      id: 'healthy',
      name: 'SALUDABLE',
      color: '#2A7A7A',
      description: 'Recetas saludables'
    }
  ];

  const difficultyLevels = [
    {
      id: 'beginner',
      name: 'NIVEL PRINCIPIANTE',
      description: 'Perfecto para empezar'
    },
    {
      id: 'familiarized',
      name: 'NIVEL FAMILIARIZADO',
      description: 'Para cocineros con experiencia'
    },
    {
      id: 'challenge',
      name: 'RETO',
      description: 'Desafíos culinarios'
    }
  ];

  const handleRecipeTypeClick = (type) => {
    console.log(`Selected recipe type: ${type.name}`);
  };

  const handleDifficultyClick = (difficulty) => {
    console.log(`Selected difficulty: ${difficulty.name}`);
  };

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
                className="recipe-type-card"
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
                  className="difficulty-button"
                  onClick={() => handleDifficultyClick(level)}
                >
                  <span className="difficulty-name">{level.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="recipes-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;
