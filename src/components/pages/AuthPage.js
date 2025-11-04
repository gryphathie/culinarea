import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, useAuth } from '../../firebase/auth';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      if (mode === 'signup') {
        await authService.signUp(email.trim(), password, displayName.trim());
        setMessage('Cuenta creada. Redirigiendo...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        await authService.signIn(email.trim(), password);
        setMessage('Sesión iniciada. Redirigiendo...');
        setTimeout(() => navigate('/'), 1500);
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err) {
      setError(err?.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearMessages();
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      setMessage('Sesión iniciada con Google. Redirigiendo...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar con Google');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    clearMessages();
    setMode(mode === 'signup' ? 'login' : 'signup');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={6}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'signup' ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        <div className="auth-divider">o</div>

        <button className="auth-google" onClick={handleGoogle} disabled={loading}>
          <span className="g-icon">G</span>
          Continuar con Google
        </button>

        <button className="auth-switch" onClick={switchMode} disabled={loading}>
          {mode === 'signup' ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crea una'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
