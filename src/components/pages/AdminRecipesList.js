import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../../firebase/services';
import './AdminRecipesList.css';

const AdminRecipesList = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      const allRecipes = await recipeService.getAllRecipes();
      setRecipes(allRecipes);
    } catch (err) {
      console.error('Error loading recipes:', err);
      setError('Error al cargar las recetas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recipeId) => {
    navigate(`/admin/edit-recipe/${recipeId}`);
  };

  const handleDeleteClick = (recipeId, recipeTitle) => {
    setDeleteConfirm({ id: recipeId, title: recipeTitle });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await recipeService.deleteRecipe(deleteConfirm.id);
      setDeleteConfirm(null);
      await loadRecipes(); // Reload the list
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Error al eliminar la receta');
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleCreateNew = () => {
    navigate('/admin/create-recipe');
  };

  const formatArrayField = (array) => {
    if (!array || !Array.isArray) return 'N/A';
    return array.length > 0 ? `${array.length} ${array.length === 1 ? 'item' : 'items'}` : 'Vacío';
  };

  if (loading) {
    return (
      <div className="admin-recipes-list">
        <div className="admin-container">
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

  return (
    <div className="admin-recipes-list">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Gestión de Recetas</h1>
            <p className="admin-subtitle">Total: {recipes.length} recetas</p>
          </div>
          <button className="create-button" onClick={handleCreateNew}>
            ➕ Nueva Receta
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="admin-message admin-error">
            {error}
          </div>
        )}

        {/* Recipes Table */}
        {recipes.length === 0 ? (
          <div className="no-recipes">
            <p>No hay recetas creadas aún.</p>
            <button className="create-button" onClick={handleCreateNew}>
              Crear Primera Receta
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="recipes-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Dificultad</th>
                  <th>Ingredientes</th>
                  <th>Pasos Niños</th>
                  <th>Pasos Adultos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr key={recipe.id}>
                    <td className="recipe-title-cell">
                      <strong>{recipe.title}</strong>
                    </td>
                    <td>
                      {categoryLabels[recipe.type] || recipe.type}
                    </td>
                    <td>
                      <span className={`difficulty-badge difficulty-${recipe.difficulty}`}>
                        {difficultyLabels[recipe.difficulty] || recipe.difficulty}
                      </span>
                    </td>
                    <td className="text-center">
                      {formatArrayField(recipe.ingredients)}
                    </td>
                    <td className="text-center">
                      {formatArrayField(recipe.stepsChildren)}
                    </td>
                    <td className="text-center">
                      {formatArrayField(recipe.stepsAdults)}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-button edit-button"
                        onClick={() => handleEdit(recipe.id)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDeleteClick(recipe.id, recipe.title)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="admin-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar la receta:</p>
            <p className="delete-confirm-title"><strong>"{deleteConfirm.title}"</strong></p>
            <p className="delete-warning">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button
                className="modal-button cancel-button"
                onClick={handleDeleteCancel}
              >
                Cancelar
              </button>
              <button
                className="modal-button confirm-button"
                onClick={handleDeleteConfirm}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecipesList;

