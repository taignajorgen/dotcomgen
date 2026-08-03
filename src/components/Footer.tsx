import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-title">dotcomgen</span>
          <span className="footer-tagline">
            © {new Date().getFullYear()} dotcomgen — AI-Powered .com Domain Generator
          </span>
        </div>
        <nav className="footer-nav">
          <a href="/terms" className="footer-btn terms">
            Terms of Use
          </a>
          <a href="/privacy" className="footer-btn privacy">
            Privacy Policy
          </a>
        </nav>
      </div>
    </footer>
  );
}
