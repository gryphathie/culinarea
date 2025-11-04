import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../../firebase/services';
import './AdminCreateRecipe.css';

const AdminCreateRecipe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    difficulty: '',
    category: '',
    stepsChildren: '',
    stepsAdults: ''
  });

  const difficulties = [
    { value: 'beginner', label: 'NIVEL PRINCIPIANTE' },
    { value: 'familiarized', label: 'NIVEL FAMILIARIZADO' },
    { value: 'challenge', label: 'RETO' }
  ];

  const categories = [
    { value: 'salty', label: 'SALADO' },
    { value: 'sweet', label: 'DULCE' },
    { value: 'snack', label: 'SNACK' },
    { value: 'healthy', label: 'SALUDABLE' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      // Validate form
      if (!formData.title || !formData.ingredients || !formData.difficulty || 
          !formData.category || !formData.stepsChildren || !formData.stepsAdults) {
        setError('Por favor completa todos los campos');
        setLoading(false);
        return;
      }

      // Convert ingredients and steps to arrays
      const ingredientsList = formData.ingredients
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      const stepsChildrenList = formData.stepsChildren
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      const stepsAdultsList = formData.stepsAdults
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Create recipe data object
      const recipeData = {
        title: formData.title,
        ingredients: ingredientsList,
        difficulty: formData.difficulty,
        type: formData.category, // Using 'type' to match existing recipes structure
        stepsChildren: stepsChildrenList,
        stepsAdults: stepsAdultsList
      };

      // Save recipe to Firestore
      await recipeService.createRecipe(recipeData);
      
      setSuccess('Receta creada exitosamente');
      
      // Clear form
      setFormData({
        title: '',
        ingredients: '',
        difficulty: '',
        category: '',
        stepsChildren: '',
        stepsAdults: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/recetas');
      }, 2000);

    } catch (err) {
      console.error('Error creating recipe:', err);
      setError(err?.message || 'Error al crear la receta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-recipe">
      <div className="admin-create-recipe-container">
        {/* Page Header */}
        <div className="admin-create-recipe-header">
          <h1 className="admin-create-recipe-title">Crear Nueva Receta</h1>
          <button 
            className="back-button"
            onClick={() => navigate('/recetas')}
          >
            ← Volver
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="admin-message admin-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="admin-message admin-success">
            {success}
          </div>
        )}

        {/* Form */}
        <form className="admin-recipe-form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Título de la receta *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: Panqueques de Banana"
              required
            />
          </div>

          {/* Ingredients */}
          <div className="form-group">
            <label htmlFor="ingredients">Ingredientes *</label>
            <textarea
              id="ingredients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              placeholder="Ingresa un ingrediente por línea:&#10;2 bananas&#10;1 taza de harina&#10;2 huevos"
              rows="6"
              required
            />
            <small>Ingresa un ingrediente por línea</small>
          </div>

          {/* Difficulty */}
          <div className="form-group">
            <label htmlFor="difficulty">Dificultad *</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona una opción</option>
              {difficulties.map(diff => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Categoría *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona una opción</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Steps for Children */}
          <div className="form-group">
            <label htmlFor="stepsChildren">Pasos para Niños *</label>
            <textarea
              id="stepsChildren"
              name="stepsChildren"
              value={formData.stepsChildren}
              onChange={handleInputChange}
              placeholder="Ingresa un paso por línea:&#10;1. Lavar bien las bananas&#10;2. Pelar y machacar las bananas&#10;3. Mezclar con la harina"
              rows="6"
              required
            />
            <small>Ingresa un paso por línea</small>
          </div>

          {/* Steps for Adults */}
          <div className="form-group">
            <label htmlFor="stepsAdults">Pasos para Adultos *</label>
            <textarea
              id="stepsAdults"
              name="stepsAdults"
              value={formData.stepsAdults}
              onChange={handleInputChange}
              placeholder="Ingresa un paso por línea:&#10;1. Lavar bien las bananas&#10;2. Pelar y machacar las bananas&#10;3. Mezclar con la harina"
              rows="6"
              required
            />
            <small>Ingresa un paso por línea</small>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Receta'}
          </button>
        </form>

        {/* Footer */}
        <div className="admin-create-recipe-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateRecipe;

