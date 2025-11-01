import React, { useState } from 'react';
import { useAuth } from '../../firebase/auth';
import { firestoreService } from '../../firebase/services';
import './HelpPage.css';

const HelpPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      // Validate form
      if (!formData.subject || !formData.message) {
        setError('Por favor completa todos los campos obligatorios');
        setLoading(false);
        return;
      }

      // Save feedback to Firestore
      const feedbackData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        userId: user?.uid || null,
        status: 'new'
      };

      await firestoreService.create('feedback', feedbackData);
      
      setSuccess('¡Gracias por tu comentario! Te responderemos pronto.');
      
      // Clear form
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        subject: '',
        message: ''
      });

    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err?.message || 'Error al enviar tu comentario. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="help-page">
      <div className="help-container">
        <div className="help-header">
          <h1 className="help-title">Centro de Ayuda</h1>
          <p className="help-subtitle">
            ¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="help-message help-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="help-message help-success">
            {success}
          </div>
        )}

        {/* Help Content */}
        <div className="help-content">
          {/* FAQ Section */}
          <div className="faq-section">
            <h2 className="section-title">Preguntas Frecuentes</h2>
            
            <div className="faq-list">
              <div className="faq-item">
                <h3 className="faq-question">¿Cómo puedo crear mi propia receta?</h3>
                <p className="faq-answer">
                  Las funciones de creación de recetas están disponibles solo para administradores. 
                  Si deseas contribuir con recetas, contáctanos a través del formulario de abajo.
                </p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">¿Cómo cambio mi contraseña?</h3>
                <p className="faq-answer">
                  Puedes cambiar tu contraseña en la sección "Mi Perfil" del menú lateral. 
                  Necesitarás tu contraseña actual para hacer el cambio.
                </p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">¿Qué significa cada nivel de dificultad?</h3>
                <p className="faq-answer">
                  <strong>Nivel Principiante:</strong> Recetas simples con pocos ingredientes y pasos. 
                  Ideal para empezar a cocinar.<br/>
                  <strong>Nivel Familiarizado:</strong> Recetas de complejidad media para cocineros con experiencia.<br/>
                  <strong>Reto:</strong> Recetas desafiantes para cocineros experimentados.
                </p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">¿Cómo busco una receta específica?</h3>
                <p className="faq-answer">
                  Usa la barra de búsqueda en la parte superior para buscar recetas por nombre. 
                  También puedes filtrar por categoría o nivel de dificultad en la página de recetas.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-section">
            <h2 className="section-title">Envíanos tus comentarios</h2>
            
            <form className="help-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Tu Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre (opcional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Tu Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com (opcional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Asunto *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Ej: Sugerencia de mejora"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Tu Comentario *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe tu pregunta, sugerencia o problema..."
                  rows="6"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Comentario'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="help-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

