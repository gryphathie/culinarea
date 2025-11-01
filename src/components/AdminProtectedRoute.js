import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../firebase/auth';
import { userService } from '../firebase/services';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const adminStatus = await userService.isAdmin(user.uid);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
      setCheckingAdmin(false);
    };

    if (!loading) {
      checkAdmin();
    }
  }, [user, loading]);

  // Show loading spinner while checking authentication and admin status
  if (loading || checkingAdmin) {
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

  // If user is not admin, redirect to home page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated and admin, render the protected component
  return children;
};

export default AdminProtectedRoute;

