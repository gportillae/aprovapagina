import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          <img
            src="/logo-aprova.png"
            alt="APROVA"
          />
          <span className="nav-tagline">Orientación Vocacional</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Inicio
          </NavLink>
          <NavLink to="/servicios" className={({ isActive }) => isActive ? 'active' : ''}>
            Servicios
          </NavLink>
          <NavLink to="/contenido" className={({ isActive }) => isActive ? 'active' : ''}>
            Contenido
          </NavLink>
          <NavLink to="/testimonios" className={({ isActive }) => isActive ? 'active' : ''}>
            Testimonios
          </NavLink>
          <NavLink to="/contacto" className={({ isActive }) => isActive ? 'active' : ''}>
            Contacto
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
