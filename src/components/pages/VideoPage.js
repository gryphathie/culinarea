import React from 'react';
import './VideoPage.css';

// TODO: Replace this with your actual video URL when ready
// For YouTube: Use embed URL format: https://www.youtube.com/embed/VIDEO_ID
// For Vimeo: Use embed URL format: https://player.vimeo.com/video/VIDEO_ID
const VIDEO_URL = 'https://www.youtube.com/embed/WV9kaWGz-AU?si=b8PfgGB1z4WVLwn0'; // Add your video embed URL here

const VideoPage = () => {
  return (
    <div className="video-page">
      <div className="video-container">
        <div className="video-header">
          <h1 className="video-title">Video Introductorio</h1>
          <p className="video-subtitle">
            Aprende a usar Culinárea con este video tutorial que te guiará paso a paso por todas las funcionalidades de la plataforma.
          </p>
        </div>

        <div className="video-content">
          <div className="video-card">
            {VIDEO_URL ? (
              <div className="video-wrapper">
                <iframe
                  src={VIDEO_URL}
                  title="Video Introductorio de Culinárea"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-iframe"
                ></iframe>
              </div>
            ) : (
              <div className="video-placeholder">
                <div className="placeholder-icon">🎥</div>
                <h2 className="placeholder-title">Video no disponible aún</h2>
                <p className="placeholder-description">
                  El video introductorio estará disponible pronto. 
                  Por favor, actualiza la URL del video en el código cuando esté listo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="video-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;

