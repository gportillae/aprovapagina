import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-copy">© {currentYear} APROVA · aprovamx.com</p>
        <div className="footer-links">
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/terminos">Términos</Link>
          <a href="tel:+524499119192">(449) 911 9192</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
