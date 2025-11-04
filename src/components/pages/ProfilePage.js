import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/auth';
import { authService } from '../../firebase/auth';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      await authService.updateUserProfile(displayName.trim());
      setSuccess('Perfil actualizado exitosamente');
      setTimeout(() => {
        setSuccess('');
        window.location.reload(); // Reload to refresh user data
      }, 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    clearMessages();

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authService.updateUserPassword(newPassword, currentPassword);
      setSuccess('Contraseña actualizada exitosamente');
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);

      setTimeout(() => {
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Error updating password:', err);
      const errorMessage = err?.message || 'Error al actualizar la contraseña';
      
      // Translate common Firebase errors
      if (errorMessage.includes('wrong-password')) {
        setError('La contraseña actual es incorrecta');
      } else if (errorMessage.includes('weak-password')) {
        setError('La contraseña es muy débil');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPassword = () => {
    clearMessages();
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="error-message">
            Por favor inicia sesión para ver tu perfil
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">Mi Perfil</h1>
        </div>

        {/* Messages */}
        {error && (
          <div className="profile-message profile-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="profile-message profile-success">
            {success}
          </div>
        )}

        {/* Profile Information Form */}
        <div className="profile-card">
          <h2 className="profile-card-title">Información Personal</h2>
          
          <form className="profile-form" onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="displayName">Nombre de Usuario</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ingresa tu nombre"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="disabled-input"
              />
              <small className="form-help">El correo electrónico no se puede cambiar</small>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Password Change Form */}
        <div className="profile-card">
          <h2 className="profile-card-title">Cambiar Contraseña</h2>
          
          {!showPasswordForm ? (
            <button
              className="password-toggle-button"
              onClick={() => setShowPasswordForm(true)}
            >
              Cambiar Contraseña
            </button>
          ) : (
            <form className="profile-form" onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Contraseña Actual</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
                <small className="form-help">Mínimo 6 caracteres</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancelPassword}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="profile-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

