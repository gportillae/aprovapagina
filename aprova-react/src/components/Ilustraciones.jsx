// Ilustraciones SVG personalizadas con colores de marca APROVA

// Hero Inicio: Estudiante descubriendo su camino
export function IlustracionHero() {
  return (
    <svg viewBox="0 0 400 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="ilustracion-hero">
      {/* Fondo decorativo */}
      <circle cx="200" cy="180" r="150" fill="#EEEDFE" />
      <circle cx="200" cy="180" r="110" fill="#CECBF6" opacity="0.4" />

      {/* Camino bifurcado */}
      <path d="M200 320 L200 220 Q200 200 180 190 L100 150" stroke="#AFA9EC" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M200 320 L200 220 Q200 200 220 190 L300 150" stroke="#AFA9EC" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* Señales de dirección */}
      <rect x="72" y="110" width="70" height="28" rx="6" fill="#534AB7" />
      <text x="107" y="129" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Ciencias</text>
      <rect x="260" y="110" width="70" height="28" rx="6" fill="#7F77DD" />
      <text x="295" y="129" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Artes</text>

      {/* Poste de señales */}
      <rect x="196" y="140" width="8" height="90" rx="2" fill="#26215C" />

      {/* Señal izquierda */}
      <path d="M140 148 L200 148 L200 172 L140 172 L130 160 Z" fill="#534AB7" />
      <text x="165" y="164" textAnchor="middle" fill="white" fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif">Ingeniería</text>

      {/* Señal derecha */}
      <path d="M260 155 L200 155 L200 179 L260 179 L270 167 Z" fill="#3C3489" />
      <text x="230" y="171" textAnchor="middle" fill="white" fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif">Medicina</text>

      {/* Persona */}
      <circle cx="200" cy="260" r="20" fill="#26215C" />
      <circle cx="200" cy="260" r="16" fill="#534AB7" />
      {/* Cabeza */}
      <circle cx="200" cy="244" r="12" fill="#CECBF6" />
      {/* Cuerpo */}
      <path d="M186 260 Q186 275 192 285 L208 285 Q214 275 214 260" fill="#534AB7" />

      {/* Estrellas decorativas */}
      <circle cx="95" cy="85" r="4" fill="#AFA9EC" />
      <circle cx="310" cy="90" r="3" fill="#CECBF6" />
      <circle cx="140" cy="70" r="2.5" fill="#7F77DD" />
      <circle cx="270" cy="75" r="3.5" fill="#AFA9EC" />
      <circle cx="340" cy="140" r="2" fill="#CECBF6" />
      <circle cx="60" cy="150" r="2.5" fill="#7F77DD" />

      {/* Foco de idea */}
      <g transform="translate(200, 210)">
        <circle r="14" fill="#EEEDFE" stroke="#534AB7" strokeWidth="2" />
        <path d="M-4 -6 L0 -2 L4 -6 M-3 2 L3 2 M-2 5 L2 5" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>

      {/* Libro abierto */}
      <g transform="translate(320, 200)">
        <path d="M-15 5 Q0 -2 0 -12 Q0 -2 15 5 L15 15 Q0 8 0 -2 Q0 8 -15 15 Z" fill="#EEEDFE" stroke="#534AB7" strokeWidth="1.5" />
      </g>

      {/* Lápiz */}
      <g transform="translate(80, 200) rotate(-30)">
        <rect x="-2" y="-15" width="4" height="22" rx="1" fill="#7F77DD" />
        <polygon points="-2,7 2,7 0,12" fill="#26215C" />
        <rect x="-2" y="-15" width="4" height="4" rx="1" fill="#CECBF6" />
      </g>
    </svg>
  )
}

// Servicios: Comparación de opciones
export function IlustracionServicios() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="ilustracion-servicios">
      {/* Fondo */}
      <circle cx="200" cy="150" r="130" fill="#EEEDFE" opacity="0.5" />

      {/* Tarjeta izquierda - Modalidad 1 */}
      <g transform="translate(70, 50)">
        <rect width="120" height="160" rx="12" fill="white" stroke="#AFA9EC" strokeWidth="1.5" />
        <rect y="0" width="120" height="40" rx="12" fill="#EEEDFE" />
        <rect y="28" width="120" height="12" fill="#EEEDFE" />
        <text x="60" y="26" textAnchor="middle" fill="#534AB7" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Modalidad 1</text>
        {/* Checks */}
        <circle cx="25" cy="65" r="8" fill="#EEEDFE" />
        <path d="M21 65 L24 68 L29 62" stroke="#534AB7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="40" y="61" width="60" height="6" rx="3" fill="#CECBF6" />
        <circle cx="25" cy="90" r="8" fill="#EEEDFE" />
        <path d="M21 90 L24 93 L29 87" stroke="#534AB7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="40" y="86" width="50" height="6" rx="3" fill="#CECBF6" />
        <circle cx="25" cy="115" r="8" fill="#EEEDFE" />
        <path d="M21 115 L24 118 L29 112" stroke="#534AB7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="40" y="111" width="55" height="6" rx="3" fill="#CECBF6" />
        {/* Botón */}
        <rect x="15" y="133" width="90" height="16" rx="8" fill="#534AB7" />
      </g>

      {/* Tarjeta derecha - Modalidad 2 (destacada) */}
      <g transform="translate(215, 35)">
        <rect width="130" height="185" rx="12" fill="white" stroke="#534AB7" strokeWidth="2" />
        <rect y="0" width="130" height="44" rx="12" fill="#534AB7" />
        <rect y="32" width="130" height="12" fill="#534AB7" />
        <text x="65" y="28" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Modalidad 2</text>
        {/* Badge */}
        <rect x="30" y="-10" width="70" height="18" rx="9" fill="#3C3489" />
        <text x="65" y="3" textAnchor="middle" fill="white" fontSize="8" fontWeight="500" fontFamily="Inter, sans-serif">Recomendado</text>
        {/* Checks */}
        <circle cx="25" cy="70" r="8" fill="#EEEDFE" />
        <path d="M21 70 L24 73 L29 67" stroke="#534AB7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="40" y="66" width="70" height="6" rx="3" fill="#CECBF6" />
        <circle cx="25" cy="95" r="8" fill="#EEEDFE" />
        <path d="M21 95 L24 98 L29 92" stroke="#534AB7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="40" y="91" width="55" height="6" rx="3" fill="#CECBF6" />
        <circle cx="25" cy="120" r="8" fill="#EEEDFE" />
        <path d="M21 120 L24 123 L29 117" stroke="#534AB7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="40" y="116" width="65" height="6" rx="3" fill="#CECBF6" />
        <circle cx="25" cy="145" r="8" fill="#EEEDFE" />
        <path d="M21 145 L24 148 L29 142" stroke="#534AB7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="40" y="141" width="50" height="6" rx="3" fill="#CECBF6" />
        {/* Botón */}
        <rect x="15" y="160" width="100" height="16" rx="8" fill="#534AB7" />
      </g>

      {/* Persona pensando */}
      <g transform="translate(200, 265)">
        <circle r="18" fill="#26215C" />
        <circle r="14" fill="#534AB7" />
        <circle cy="-16" r="11" fill="#CECBF6" />
        {/* Pensamiento */}
        <circle cx="18" cy="-28" r="3" fill="#AFA9EC" />
        <circle cx="26" cy="-36" r="5" fill="#AFA9EC" />
        <circle cx="36" cy="-44" r="8" fill="#EEEDFE" stroke="#AFA9EC" strokeWidth="1" />
        <text x="36" y="-41" textAnchor="middle" fill="#534AB7" fontSize="8" fontFamily="Inter, sans-serif">?</text>
      </g>

      {/* Decoraciones */}
      <circle cx="50" cy="40" r="3" fill="#AFA9EC" />
      <circle cx="360" cy="60" r="4" fill="#CECBF6" />
      <circle cx="370" cy="250" r="2.5" fill="#7F77DD" />
      <circle cx="30" cy="230" r="3" fill="#AFA9EC" />
    </svg>
  )
}

// Autoconocimiento: Cerebro con dimensiones
export function IlustracionAutoconocimiento() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="ilustracion-autoconocimiento">
      {/* Círculo central */}
      <circle cx="100" cy="100" r="70" fill="#EEEDFE" />

      {/* Cerebro estilizado */}
      <g transform="translate(100, 90)">
        {/* Lado izquierdo */}
        <path d="M-5 -25 Q-30 -30 -30 -10 Q-35 5 -20 10 Q-30 20 -15 30 Q-5 35 -5 20" fill="#534AB7" opacity="0.8" />
        {/* Lado derecho */}
        <path d="M5 -25 Q30 -30 30 -10 Q35 5 20 10 Q30 20 15 30 Q5 35 5 20" fill="#3C3489" opacity="0.8" />
        {/* Línea central */}
        <line x1="0" y1="-25" x2="0" y2="25" stroke="#EEEDFE" strokeWidth="2" />
      </g>

      {/* 4 dimensiones alrededor */}
      {/* Habilidades - arriba izq */}
      <g transform="translate(40, 35)">
        <circle r="14" fill="white" stroke="#534AB7" strokeWidth="1.5" />
        <path d="M-5 0 L-2 3 L5 -3" stroke="#534AB7" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      {/* Personalidad - arriba der */}
      <g transform="translate(160, 35)">
        <circle r="14" fill="white" stroke="#7F77DD" strokeWidth="1.5" />
        <circle cy="-2" r="4" fill="none" stroke="#7F77DD" strokeWidth="1.5" />
        <path d="M-4 5 Q0 2 4 5" stroke="#7F77DD" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
      {/* Valores - abajo izq */}
      <g transform="translate(40, 165)">
        <circle r="14" fill="white" stroke="#534AB7" strokeWidth="1.5" />
        <polygon points="0,-6 2,-1 7,-1 3,2 5,7 0,4 -5,7 -3,2 -7,-1 -2,-1" fill="#534AB7" />
      </g>
      {/* Intereses - abajo der */}
      <g transform="translate(160, 165)">
        <circle r="14" fill="white" stroke="#7F77DD" strokeWidth="1.5" />
        <path d="M0 -5 Q5 -8 5 -3 Q5 2 0 5 Q-5 2 -5 -3 Q-5 -8 0 -5" fill="#7F77DD" />
      </g>

      {/* Líneas conectoras */}
      <line x1="52" y1="45" x2="80" y2="70" stroke="#AFA9EC" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="148" y1="45" x2="120" y2="70" stroke="#AFA9EC" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="52" y1="155" x2="80" y2="130" stroke="#AFA9EC" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="148" y1="155" x2="120" y2="130" stroke="#AFA9EC" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  )
}

// Proceso: Camino con pasos
export function IlustracionProceso() {
  return (
    <svg viewBox="0 0 360 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="ilustracion-proceso">
      {/* Línea de camino */}
      <path d="M30 60 Q90 20 150 60 Q210 100 270 60 Q310 35 340 60" stroke="#AFA9EC" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Paso 1 */}
      <circle cx="30" cy="60" r="16" fill="#534AB7" />
      <text x="30" y="65" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">1</text>

      {/* Paso 2 */}
      <circle cx="130" cy="42" r="16" fill="#534AB7" />
      <text x="130" y="47" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">2</text>

      {/* Paso 3 */}
      <circle cx="230" cy="72" r="16" fill="#534AB7" />
      <text x="230" y="77" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">3</text>

      {/* Paso 4 - meta */}
      <circle cx="330" cy="55" r="16" fill="#26215C" />
      <path d="M324 55 L328 59 L336 51" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Bandera en la meta */}
      <g transform="translate(330, 28)">
        <line x1="0" y1="0" x2="0" y2="14" stroke="#26215C" strokeWidth="1.5" />
        <path d="M0 0 L12 4 L0 8" fill="#534AB7" />
      </g>
    </svg>
  )
}
