import React, { useState } from 'react';
import './SupportButton.css';

function SupportButton() {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const openModal = () => {
    setShowModal(true);
    document.body.style.overflow = 'hidden';
    setImageError(false);
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
    setImageError(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <button 
        className="support-button"
        onClick={openModal}
        aria-label="Support MatthewWrite"
      >
        <span className="support-icon">💝</span>
        <span className="support-text">Support</span>
      </button>

      {showModal && (
        <div 
          className="donation-modal-overlay"
          onClick={handleBackdropClick}
        >
          <div className="donation-modal">
            <div className="donation-modal-header">
              <h5 className="donation-modal-title">
                <span className="heart-icon">❤️</span> Support MatthewWrite
              </h5>
              <button 
                type="button" 
                className="donation-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="donation-modal-body">
              <div className="thank-you-message">
                <span className="thank-you-icon">🙏</span>
                <h4 className="thank-you-text">Thank You!</h4>
              </div>
              <p className="donation-instruction">
                Scan the QR code to make a donation
              </p>
              <div className="qr-code-container">
                {!imageError ? (
                  <img 
                    src="/donate.jpg" 
                    alt="Donation QR Code" 
                    className="qr-code-image"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="qr-code-placeholder">
                    <p>QR Code Image</p>
                    <p className="small-text">Please add donate.jpg to public folder</p>
                  </div>
                )}
              </div>
              <p className="donation-footer-text">
                Your support helps keep MatthewWrite running!
              </p>
              <div className="donation-links">
                <a 
                  href="https://buymeacoffee.com/isshiki" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="donation-link-btn"
                >
                  ☕ Buy Me a Coffee
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SupportButton;

