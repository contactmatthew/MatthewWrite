import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>MatthewWrite</h3>
          <p>Improve your typing skills with real-time analytics and competitive leaderboards.</p>
        </div>
        
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="footer-links">
            <a 
              href="https://buymeacoffee.com/isshiki" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <span className="footer-icon">☕</span>
              Buy Me a Coffee
            </a>
            <a 
              href="https://www.facebook.com/mtthw28" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <span className="footer-icon">📘</span>
              Facebook
            </a>
            <a 
              href="https://github.com/contactmatthew" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <span className="footer-icon">💻</span>
              GitHub
            </a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>About</h4>
          <p className="footer-text">
            Built with ❤️ by <strong>James Matthew Dela Torre</strong>
          </p>
          <p className="footer-text">
            © {new Date().getFullYear()} MatthewWrite. All rights reserved.
          </p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>Personal Project to Show My Consistency</p>
      </div>
    </footer>
  );
}

export default Footer;

