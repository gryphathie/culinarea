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
  const [isReadingIngredients, setIsReadingIngredients] = useState(false);
  const [isReadingSteps, setIsReadingSteps] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

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
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      setSpeechSynthesis(synth);
      
      // Load voices (may need to wait for voices to be loaded)
      const loadVoices = () => {
        const voices = synth.getVoices();
        // Filter and prioritize Spanish voices
        const spanishVoices = voices.filter(voice => 
          voice.lang.startsWith('es') || voice.name.toLowerCase().includes('spanish')
        );
        const otherVoices = voices.filter(voice => 
          !voice.lang.startsWith('es') && !voice.name.toLowerCase().includes('spanish')
        );
        
        // Combine: Spanish voices first, then others
        const sortedVoices = [...spanishVoices, ...otherVoices];
        setAvailableVoices(sortedVoices);
        
        // Set default to first Spanish voice, or first available voice
        if (sortedVoices.length > 0 && !selectedVoice) {
          const defaultVoice = spanishVoices.length > 0 ? spanishVoices[0] : sortedVoices[0];
          setSelectedVoice(defaultVoice);
        }
      };
      
      // Voices might be loaded asynchronously
      loadVoices();
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }
    }
    
    // Cleanup: stop speech when component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
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

  const speakText = (text, onStart, onEnd, onError) => {
    if (!speechSynthesis || !recipe) return;

    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta la función de lectura en voz alta.');
      return;
    }

    // Stop any ongoing speech
    speechSynthesis.cancel();

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech settings for better Spanish pronunciation
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; // Slightly slower for children
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Use selected voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Handle speech events
    utterance.onstart = onStart;
    utterance.onend = onEnd;
    utterance.onerror = onError;

    // Start speaking
    speechSynthesis.speak(utterance);
  };

  const handleReadIngredients = () => {
    if (!speechSynthesis || !recipe) return;

    if (isReadingIngredients) {
      // Stop reading
      speechSynthesis.cancel();
      setIsReadingIngredients(false);
      setIsReadingSteps(false);
      return;
    }

    // Stop any other reading
    if (isReadingSteps) {
      speechSynthesis.cancel();
      setIsReadingSteps(false);
    }

    // Get ingredients from recipe
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

    // Build the text to read
    let textToRead = '';

    // Add recipe title
    textToRead += `Receta: ${recipe.title}. `;

    // Add ingredients
    if (ingredients.length > 0) {
      textToRead += 'Ingredientes: ';
      ingredients.forEach((ingredient, index) => {
        textToRead += `${ingredient}. `;
      });
    } else {
      textToRead += 'No hay ingredientes disponibles.';
    }

    speakText(
      textToRead,
      () => setIsReadingIngredients(true),
      () => setIsReadingIngredients(false),
      (event) => {
        console.error('Speech synthesis error:', event);
        setIsReadingIngredients(false);
        alert('Error al leer el texto. Por favor, intenta de nuevo.');
      }
    );
  };

  const handleReadSteps = () => {
    if (!speechSynthesis || !recipe) return;

    if (isReadingSteps) {
      // Stop reading
      speechSynthesis.cancel();
      setIsReadingSteps(false);
      setIsReadingIngredients(false);
      return;
    }

    // Stop any other reading
    if (isReadingIngredients) {
      speechSynthesis.cancel();
      setIsReadingIngredients(false);
    }

    // Get steps based on active tab
    const adultSteps = Array.isArray(recipe.stepsAdults) ? recipe.stepsAdults : [];
    const childSteps = Array.isArray(recipe.stepsChildren) ? recipe.stepsChildren : [];
    const stepsToRead = activeTab === 'adult' ? adultSteps : childSteps;
    const stepType = activeTab === 'adult' ? 'adulto' : 'niño';

    // Build the text to read
    let textToRead = '';

    if (stepsToRead.length > 0) {
      textToRead += `Pasos para ${stepType}: `;
      stepsToRead.forEach((step, index) => {
        textToRead += `Paso ${index + 1}: ${step}. `;
      });
    } else {
      textToRead += `No hay pasos disponibles para ${stepType}.`;
    }

    speakText(
      textToRead,
      () => setIsReadingSteps(true),
      () => setIsReadingSteps(false),
      (event) => {
        console.error('Speech synthesis error:', event);
        setIsReadingSteps(false);
        alert('Error al leer el texto. Por favor, intenta de nuevo.');
      }
    );
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
          <div className="voice-controls">
            {availableVoices.length > 0 && (
              <button 
                className="voice-select-button" 
                onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                aria-label="Seleccionar voz"
                title="Seleccionar voz"
              >
                ⚙️
              </button>
            )}
          </div>
        </div>
        
        {/* Voice Selection Menu */}
        {showVoiceMenu && availableVoices.length > 0 && (
          <>
            <div 
              className="voice-menu-backdrop" 
              onClick={() => setShowVoiceMenu(false)}
              aria-label="Cerrar menú"
            />
            <div className="voice-menu">
              <div className="voice-menu-header">
                <h3>Seleccionar Voz</h3>
                <button 
                  className="voice-menu-close" 
                  onClick={() => setShowVoiceMenu(false)}
                  aria-label="Cerrar menú de voces"
                >
                  ×
                </button>
              </div>
              <div className="voice-list">
                {availableVoices.map((voice, index) => (
                  <button
                    key={index}
                    className={`voice-option ${selectedVoice && selectedVoice.name === voice.name ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedVoice(voice);
                      setShowVoiceMenu(false);
                    }}
                  >
                    <span className="voice-name">{voice.name}</span>
                    <span className="voice-info">
                      {voice.lang} {voice.default && '(Predeterminada)'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Recipe Image */}
        {recipe.imageUrl && (
          <div className="recipe-image-container">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              className="recipe-image"
            />
          </div>
        )}

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
            <div className="section-title-container">
              <h2 className="section-title">INGREDIENTES</h2>
              <button 
                className="section-read-button" 
                onClick={handleReadIngredients}
                aria-label={isReadingIngredients ? "Detener lectura" : "Leer título e ingredientes"}
                title={isReadingIngredients ? "Detener lectura" : "Leer título e ingredientes"}
              >
                {isReadingIngredients ? '⏸' : '🔊'}
              </button>
            </div>
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
            <div className="section-title-container">
              <h2 className="section-title">PASOS</h2>
              <button 
                className="section-read-button" 
                onClick={handleReadSteps}
                aria-label={isReadingSteps ? "Detener lectura" : "Leer pasos"}
                title={isReadingSteps ? "Detener lectura" : "Leer pasos"}
              >
                {isReadingSteps ? '⏸' : '🔊'}
              </button>
            </div>
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

