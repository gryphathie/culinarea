import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../firebase/services';
import './AdminFeedbackList.css';

const AdminFeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'new', 'read', 'replied'

  const statusLabels = {
    new: 'NUEVO',
    read: 'LEÍDO',
    replied: 'RESPONDIDO'
  };

  const statusColors = {
    new: '#F44336',
    read: '#FF9800',
    replied: '#4CAF50'
  };

  useEffect(() => {
    loadFeedbacks();
  }, [filter]);

  const loadFeedbacks = async () => {
    setLoading(true);
    setError('');
    try {
      const allFeedbacks = await firestoreService.getAll('feedback');
      
      // Sort by createdAt descending (newest first)
      const sortedFeedbacks = allFeedbacks.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return bDate - aDate;
      });
      
      // Apply filter
      let filteredFeedbacks = sortedFeedbacks;
      if (filter !== 'all') {
        filteredFeedbacks = sortedFeedbacks.filter(fb => fb.status === filter);
      }
      
      setFeedbacks(filteredFeedbacks);
    } catch (err) {
      console.error('Error loading feedbacks:', err);
      setError('Error al cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      await firestoreService.update('feedback', feedbackId, { status: newStatus });
      await loadFeedbacks(); // Reload the list
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Error al actualizar el estado');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFilterCount = (status) => {
    if (feedbacks.length === 0) return 0;
    // Need to calculate from all feedbacks
    return feedbacks.filter(fb => fb.status === status).length;
  };

  if (loading) {
    return (
      <div className="admin-feedback-list">
        <div className="admin-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            fontSize: '1.2rem',
            color: '#50B8B8'
          }}>
            Cargando comentarios...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-feedback-list">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Comentarios y Feedback</h1>
            <p className="admin-subtitle">Total: {feedbacks.length} comentarios</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="admin-message admin-error">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="filter-section">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos ({feedbacks.length})
          </button>
          <button
            className={`filter-button ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            Nuevos
          </button>
          <button
            className={`filter-button ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Leídos
          </button>
          <button
            className={`filter-button ${filter === 'replied' ? 'active' : ''}`}
            onClick={() => setFilter('replied')}
          >
            Respondidos
          </button>
        </div>

        {/* Feedbacks List */}
        {feedbacks.length === 0 ? (
          <div className="no-feedbacks">
            <p>No hay comentarios para mostrar.</p>
          </div>
        ) : (
          <div className="feedback-list">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="feedback-card">
                <div className="feedback-header">
                  <div className="feedback-meta">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: statusColors[feedback.status] || '#999' }}
                    >
                      {statusLabels[feedback.status] || feedback.status}
                    </span>
                    <span className="feedback-date">{formatDate(feedback.createdAt)}</span>
                  </div>
                  <div className="feedback-actions">
                    {feedback.status === 'new' && (
                      <button
                        className="action-btn mark-read"
                        onClick={() => handleStatusUpdate(feedback.id, 'read')}
                      >
                        Marcar como leído
                      </button>
                    )}
                    {feedback.status !== 'replied' && (
                      <button
                        className="action-btn mark-replied"
                        onClick={() => handleStatusUpdate(feedback.id, 'replied')}
                      >
                        Marcar como respondido
                      </button>
                    )}
                    {(feedback.status === 'read' || feedback.status === 'replied') && (
                      <button
                        className="action-btn mark-new"
                        onClick={() => handleStatusUpdate(feedback.id, 'new')}
                      >
                        Marcar como nuevo
                      </button>
                    )}
                  </div>
                </div>

                <div className="feedback-body">
                  <div className="feedback-subject">
                    <strong>{feedback.subject}</strong>
                  </div>
                  
                  {feedback.name && (
                    <div className="feedback-user">
                      <strong>De:</strong> {feedback.name}
                    </div>
                  )}
                  
                  {feedback.email && (
                    <div className="feedback-user">
                      <strong>Email:</strong> <a href={`mailto:${feedback.email}`}>{feedback.email}</a>
                    </div>
                  )}
                  
                  <div className="feedback-message">
                    <p>{feedback.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="admin-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackList;

