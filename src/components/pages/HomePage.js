import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const mainCards = [
    {
      id: 'guia',
      title: 'Guía',
      description: 'Aprende a usar la aplicación',
      color: '#50B8B8',
      link: '/guia'
    },
    {
      id: 'recetas',
      title: 'Recetas',
      description: 'Explora todas las recetas disponibles',
      color: '#3A9B9B',
      link: '/recetas'
    },
    {
      id: 'chat',
      title: 'Chat de la comunidad',
      description: 'Conecta con otros usuarios',
      color: '#2A7A7A',
      link: '/chat'
    }
  ];

  const recentRecipes = [
    {
      id: 1,
      name: 'Recientes',
      isActive: true,
      type: 'recent'
    },
    {
      id: 2,
      name: 'Recetas para la escuela',
      isActive: false,
      type: 'category'
    },
    {
      id: 3,
      name: 'Pelador',
      isActive: false,
      type: 'category'
    }
  ];

  const futureEvents = [
    {
      id: 1,
      date: '10 de abril',
      time: '6:00 PM',
      title: 'De la cocina a la vida diaria',
      description: 'Aprende técnicas básicas de cocina'
    },
    {
      id: 2,
      date: '17 de abril',
      time: '6:00 PM',
      title: 'Peligros en la cocina',
      description: 'Seguridad y prevención en la cocina'
    },
    {
      id: 3,
      date: '24 de abril',
      time: '6:00 PM',
      title: 'Nutrición balanceada',
      description: 'Cómo mantener una dieta saludable'
    }
  ];

  const handleCardClick = (link) => {
    if (link === '/recetas') {
      navigate('/recetas');
    } else {
      // For other links, you can add more routes later
      console.log(`Navigating to: ${link}`);
    }
  };

  const handleRecipeClick = (recipe) => {
    console.log(`Clicked recipe: ${recipe.name}`);
  };

  return (
    <div className="homepage">
      <div className="homepage-container">
        {/* Recent Recipes Section */}
        <div className="recent-recipes-section">
          <div className="recent-recipes-list">
            {recentRecipes.map((recipe) => (
              <button
                key={recipe.id}
                className={`recipe-pill ${recipe.isActive ? 'active' : ''}`}
                onClick={() => handleRecipeClick(recipe)}
              >
                {recipe.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Navigation Cards */}
        <div className="main-cards">
          {mainCards.map((card) => (
            <div
              key={card.id}
              className="main-card"
              style={{ backgroundColor: card.color }}
              onClick={() => handleCardClick(card.link)}
            >
              <h2 className="card-title">{card.title}</h2>
              <p className="card-description">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Future Events Section */}
        <div className="events-section">
          <div className="events-header">
            <h3 className="events-title">Futuras Pláticas</h3>
            <span className="events-arrow">→</span>
          </div>
          
          <div className="events-list">
            {futureEvents.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-date">{event.date}</div>
                <div className="event-card">
                  <div className="event-time">
                    <span className="clock-icon">🕕</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="event-info">
                    <h4 className="event-title">{event.title}</h4>
                    <p className="event-description">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Button */}
        <div className="social-section">
          <button className="social-button">
            REDES SOCIALES
          </button>
        </div>

        {/* Footer */}
        <div className="homepage-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
