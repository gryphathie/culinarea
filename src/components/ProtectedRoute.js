import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../firebase/auth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#50B8B8'
      }}>
        Cargando...
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
