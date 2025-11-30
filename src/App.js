import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import TopNavBar from './components/TopNavBar';
import SideMenu from './components/SideMenu';
import HomePage from './components/pages/HomePage';
import RecipesPage from './components/pages/RecipesPage';
import RecipeDetailPage from './components/pages/RecipeDetailPage';
import ProfilePage from './components/pages/ProfilePage';
import SearchResultsPage from './components/pages/SearchResultsPage';
import HelpPage from './components/pages/HelpPage';
import ManualPage from './components/pages/ManualPage';
import VideoPage from './components/pages/VideoPage';
import AuthPage from './components/pages/AuthPage';
import AdminCreateRecipe from './components/pages/AdminCreateRecipe';
import AdminRecipesList from './components/pages/AdminRecipesList';
import AdminEditRecipe from './components/pages/AdminEditRecipe';
import AdminFeedbackList from './components/pages/AdminFeedbackList';
import CommunityChatPage from './components/pages/CommunityChatPage';
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
        <Route path="/buscar" element={
          <ProtectedRoute>
            <SearchResultsPage />
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/ayuda" element={
          <ProtectedRoute>
            <HelpPage />
          </ProtectedRoute>
        } />
        <Route path="/manual" element={
          <ProtectedRoute>
            <ManualPage />
          </ProtectedRoute>
        } />
        <Route path="/video" element={
          <ProtectedRoute>
            <VideoPage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <CommunityChatPage />
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
        <Route path="/admin/feedback" element={
          <AdminProtectedRoute>
            <AdminFeedbackList />
          </AdminProtectedRoute>
        } />
        {/* Catch-all route: redirect any unknown routes to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router basename="/culinarea">
      <AppContent />
    </Router>
  );
}

export default App;
