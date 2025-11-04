// Example component showing how to use Firebase services
import React, { useState, useEffect } from 'react';
import { authService, useAuth } from '../firebase/auth';
import { recipeService } from '../firebase/services';

const ExampleFirebaseUsage = () => {
  const { user, loading } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  // Load recipes when component mounts
  useEffect(() => {
    const loadRecipes = async () => {
      setLoadingRecipes(true);
      try {
        const allRecipes = await recipeService.getAllRecipes();
        setRecipes(allRecipes);
      } catch (error) {
        console.error('Error loading recipes:', error);
      } finally {
        setLoadingRecipes(false);
      }
    };

    loadRecipes();
  }, []);

  // Handle authentication
  const handleSignIn = async () => {
    try {
      await authService.signIn('test@example.com', 'password123');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Handle recipe creation
  const handleCreateRecipe = async () => {
    try {
      const newRecipe = await recipeService.createRecipe({
        title: 'Test Recipe',
        type: 'salty',
        difficulty: 'beginner',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: 'Step 1: Do this...',
        prepTime: 30,
        cookTime: 20
      });
      console.log('Created recipe:', newRecipe);
    } catch (error) {
      console.error('Error creating recipe:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Firebase Integration Example</h2>
      
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}

      <div>
        <h3>Recipes</h3>
        {loadingRecipes ? (
          <p>Loading recipes...</p>
        ) : (
          <div>
            <p>Found {recipes.length} recipes</p>
            <button onClick={handleCreateRecipe}>Create Test Recipe</button>
            <ul>
              {recipes.map(recipe => (
                <li key={recipe.id}>
                  <strong>{recipe.title}</strong> - {recipe.type} ({recipe.difficulty})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExampleFirebaseUsage;
