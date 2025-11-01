import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import TopNavBar from './components/TopNavBar';
import SideMenu from './components/SideMenu';
import HomePage from './components/pages/HomePage';
import RecipesPage from './components/pages/RecipesPage';
import RecipeDetailPage from './components/pages/RecipeDetailPage';
import AuthPage from './components/pages/AuthPage';
import AdminCreateRecipe from './components/pages/AdminCreateRecipe';
import AdminRecipesList from './components/pages/AdminRecipesList';
import AdminEditRecipe from './components/pages/AdminEditRecipe';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Check if current route is auth page
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="App">
      {/* Only show navigation on non-auth pages */}
      {!isAuthPage && (
        <>
          <TopNavBar onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
          <SideMenu isOpen={isMenuOpen} onClose={closeMenu} />
        </>
      )}
      
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/recetas" element={
          <ProtectedRoute>
            <RecipesPage />
          </ProtectedRoute>
        } />
        <Route path="/receta/:recipeId" element={
          <ProtectedRoute>
            <RecipeDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/create-recipe" element={
          <AdminProtectedRoute>
            <AdminCreateRecipe />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/recipes" element={
          <AdminProtectedRoute>
            <AdminRecipesList />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/edit-recipe/:recipeId" element={
          <AdminProtectedRoute>
            <AdminEditRecipe />
          </AdminProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
