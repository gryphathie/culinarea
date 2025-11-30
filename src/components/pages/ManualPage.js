import React from 'react';
import './ManualPage.css';

const ManualPage = () => {
  const handleDownload = () => {
    // PDF is in public folder, accessible via public URL
    const pdfPath = `${process.env.PUBLIC_URL || ''}/Instructivo_Culinarea.pdf`;
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = 'Instructivo Culinarea.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="manual-page">
      <div className="manual-container">
        <div className="manual-header">
          <h1 className="manual-title">Guía Manual</h1>
          <p className="manual-subtitle">
            Descarga el instructivo completo de Culinárea para aprender a usar todas las funcionalidades de la plataforma.
          </p>
        </div>

        <div className="manual-content">
          <div className="manual-card">
            <div className="manual-icon">📖</div>
            <h2 className="manual-card-title">Instructivo Culinárea</h2>
            <p className="manual-card-description">
              Este manual contiene toda la información necesaria para utilizar Culinárea de manera efectiva. 
              Incluye guías paso a paso, consejos y trucos para aprovechar al máximo la plataforma.
            </p>
            <button 
              onClick={handleDownload}
              className="download-button"
            >
              <span className="download-icon">⬇️</span>
              Descargar Manual
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="manual-footer">
          <div className="logo">culinárea</div>
        </div>
      </div>
    </div>
  );
};

export default ManualPage;

