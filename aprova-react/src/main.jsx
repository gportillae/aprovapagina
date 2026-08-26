import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const contenedor = document.getElementById('root')

const arbol = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Las páginas públicas se sirven prerenderizadas, así que se hidratan en vez de
// volver a pintarse desde cero. Las que no lo están (rutas de la app) montan normal.
if (contenedor.hasChildNodes()) {
  hydrateRoot(contenedor, arbol)
} else {
  createRoot(contenedor).render(arbol)
}
