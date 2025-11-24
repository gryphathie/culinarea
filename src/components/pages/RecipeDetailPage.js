import React, { useState, useEffect, useRef } from 'react';
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
  const [stepDelay, setStepDelay] = useState(3000); // Delay in milliseconds between steps (default: 3 seconds)
  const [ingredientDelay, setIngredientDelay] = useState(1000); // Delay in milliseconds between ingredients (default: 1.5 seconds)
  const isReadingStepsRef = useRef(false);
  const isReadingIngredientsRef = useRef(false);

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
      isReadingStepsRef.current = false;
      isReadingIngredientsRef.current = false;
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

  const readIngredientsSequentially = (recipeTitle, ingredients, currentIndex = -1) => {
    if (!window.speechSynthesis) {
      isReadingIngredientsRef.current = false;
      setIsReadingIngredients(false);
      return;
    }

    const synth = window.speechSynthesis;

    // Read recipe title first (currentIndex === -1)
    if (currentIndex === -1) {
      const titleText = `Receta: ${recipeTitle}. `;
      const utterance = new SpeechSynthesisUtterance(titleText);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        // Wait for delay, then read "Ingredientes:" and first ingredient
        setTimeout(() => {
          if (ingredients.length > 0 && isReadingIngredientsRef.current && window.speechSynthesis) {
            // Read "Ingredientes:" introduction
            const introText = 'Ingredientes: ';
            const introUtterance = new SpeechSynthesisUtterance(introText);
            introUtterance.lang = 'es-ES';
            introUtterance.rate = 0.9;
            introUtterance.pitch = 1.0;
            introUtterance.volume = 1.0;
            
            if (selectedVoice) {
              introUtterance.voice = selectedVoice;
            }

            introUtterance.onend = () => {
              setTimeout(() => {
                if (ingredients.length > 0 && isReadingIngredientsRef.current && window.speechSynthesis) {
                  readIngredientsSequentially(recipeTitle, ingredients, 0);
                } else {
                  isReadingIngredientsRef.current = false;
                  setIsReadingIngredients(false);
                }
              }, ingredientDelay);
            };

            introUtterance.onerror = (event) => {
              if (event.error === 'interrupted' || event.error === 'canceled' || !isReadingIngredientsRef.current) {
                isReadingIngredientsRef.current = false;
                setIsReadingIngredients(false);
                return;
              }
              console.error('Speech synthesis error:', event);
              isReadingIngredientsRef.current = false;
              setIsReadingIngredients(false);
              alert('Error al leer el texto. Por favor, intenta de nuevo.');
            };

            synth.speak(introUtterance);
          } else {
            isReadingIngredientsRef.current = false;
            setIsReadingIngredients(false);
          }
        }, ingredientDelay);
      };

      utterance.onerror = (event) => {
        if (event.error === 'interrupted' || event.error === 'canceled' || !isReadingIngredientsRef.current) {
          isReadingIngredientsRef.current = false;
          setIsReadingIngredients(false);
          return;
        }
        console.error('Speech synthesis error:', event);
        isReadingIngredientsRef.current = false;
        setIsReadingIngredients(false);
        alert('Error al leer el texto. Por favor, intenta de nuevo.');
      };

      synth.speak(utterance);
      return;
    }

    // Check if we've read all ingredients
    if (currentIndex >= ingredients.length) {
      isReadingIngredientsRef.current = false;
      setIsReadingIngredients(false);
      return;
    }

    // Read current ingredient
    const ingredientText = `${ingredients[currentIndex]}. `;
    const utterance = new SpeechSynthesisUtterance(ingredientText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      // Wait for delay before reading next ingredient
      setTimeout(() => {
        if (isReadingIngredientsRef.current && currentIndex + 1 < ingredients.length && window.speechSynthesis) {
          readIngredientsSequentially(recipeTitle, ingredients, currentIndex + 1);
        } else {
          isReadingIngredientsRef.current = false;
          setIsReadingIngredients(false);
        }
      }, ingredientDelay);
    };

    utterance.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled' || !isReadingIngredientsRef.current) {
        isReadingIngredientsRef.current = false;
        setIsReadingIngredients(false);
        return;
      }
      console.error('Speech synthesis error:', event);
      isReadingIngredientsRef.current = false;
      setIsReadingIngredients(false);
      alert('Error al leer el texto. Por favor, intenta de nuevo.');
    };

    synth.speak(utterance);
  };

  const handleReadIngredients = () => {
    if (!speechSynthesis || !recipe) return;

    if (isReadingIngredients) {
      // Stop reading
      speechSynthesis.cancel();
      isReadingIngredientsRef.current = false;
      setIsReadingIngredients(false);
      setIsReadingSteps(false);
      return;
    }

    // Stop any other reading
    if (isReadingSteps) {
      speechSynthesis.cancel();
      isReadingStepsRef.current = false;
      setIsReadingSteps(false);
    }

    // Get ingredients from recipe
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

    if (ingredients.length === 0) {
      const noIngredientsText = 'No hay ingredientes disponibles.';
      speakText(
        noIngredientsText,
        () => setIsReadingIngredients(true),
        () => setIsReadingIngredients(false),
        (event) => {
          // Don't show error if it was intentionally cancelled or interrupted
          if (event.error === 'interrupted' || event.error === 'canceled') {
            setIsReadingIngredients(false);
            return;
          }
          console.error('Speech synthesis error:', event);
          setIsReadingIngredients(false);
          alert('Error al leer el texto. Por favor, intenta de nuevo.');
        }
      );
      return;
    }

    // Start reading ingredients sequentially
    isReadingIngredientsRef.current = true;
    setIsReadingIngredients(true);
    readIngredientsSequentially(recipe.title, ingredients, -1);
  };

  const readStepSequentially = (steps, stepType, currentIndex = -1) => {
    if (!window.speechSynthesis) {
      isReadingStepsRef.current = false;
      setIsReadingSteps(false);
      return;
    }

    const synth = window.speechSynthesis;

    // Read introduction first (currentIndex === -1)
    if (currentIndex === -1) {
      const introText = `Pasos para ${stepType}: `;
      const utterance = new SpeechSynthesisUtterance(introText);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        // Wait for delay, then read first step
        setTimeout(() => {
          if (steps.length > 0 && isReadingStepsRef.current && window.speechSynthesis) {
            readStepSequentially(steps, stepType, 0);
          } else {
            isReadingStepsRef.current = false;
            setIsReadingSteps(false);
          }
        }, stepDelay);
      };

      utterance.onerror = (event) => {
        // Don't show error if it was intentionally cancelled or interrupted
        if (event.error === 'interrupted' || event.error === 'canceled' || !isReadingStepsRef.current) {
          isReadingStepsRef.current = false;
          setIsReadingSteps(false);
          return;
        }
        console.error('Speech synthesis error:', event);
        isReadingStepsRef.current = false;
        setIsReadingSteps(false);
        alert('Error al leer el texto. Por favor, intenta de nuevo.');
      };

      synth.speak(utterance);
      return;
    }

    // Check if we've read all steps
    if (currentIndex >= steps.length) {
      isReadingStepsRef.current = false;
      setIsReadingSteps(false);
      return;
    }

    // Read current step
    const stepText = `Paso ${currentIndex + 1}: ${steps[currentIndex]}. `;
    const utterance = new SpeechSynthesisUtterance(stepText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      // Wait for delay before reading next step
      setTimeout(() => {
        if (isReadingStepsRef.current && currentIndex + 1 < steps.length && window.speechSynthesis) {
          readStepSequentially(steps, stepType, currentIndex + 1);
        } else {
          isReadingStepsRef.current = false;
          setIsReadingSteps(false);
        }
      }, stepDelay);
    };

    utterance.onerror = (event) => {
      // Don't show error if it was intentionally cancelled or interrupted
      if (event.error === 'interrupted' || event.error === 'canceled' || !isReadingStepsRef.current) {
        isReadingStepsRef.current = false;
        setIsReadingSteps(false);
        return;
      }
      console.error('Speech synthesis error:', event);
      isReadingStepsRef.current = false;
      setIsReadingSteps(false);
      alert('Error al leer el texto. Por favor, intenta de nuevo.');
    };

    synth.speak(utterance);
  };

  const handleReadSteps = () => {
    if (!speechSynthesis || !recipe) return;

    if (isReadingSteps) {
      // Stop reading
      speechSynthesis.cancel();
      isReadingStepsRef.current = false;
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

    if (stepsToRead.length === 0) {
      const noStepsText = `No hay pasos disponibles para ${stepType}.`;
      speakText(
        noStepsText,
        () => setIsReadingSteps(true),
        () => setIsReadingSteps(false),
        (event) => {
          // Don't show error if it was intentionally cancelled or interrupted
          if (event.error === 'interrupted' || event.error === 'canceled') {
            setIsReadingSteps(false);
            return;
          }
          console.error('Speech synthesis error:', event);
          setIsReadingSteps(false);
          alert('Error al leer el texto. Por favor, intenta de nuevo.');
        }
      );
      return;
    }

    // Start reading steps sequentially
    isReadingStepsRef.current = true;
    setIsReadingSteps(true);
    readStepSequentially(stepsToRead, stepType, -1);
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

