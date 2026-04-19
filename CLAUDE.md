# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

APROVA is a vocational orientation platform (orientacion vocacional) for Mexican students. It offers psychometric tests online with Stripe payment integration. The project is in Spanish — all UI text, variable names, and comments use Spanish.

## Repository Structure

This is a monorepo with two independent apps in the root directory:

- **`aprova-react/`** — Frontend (React 19, Vite 8, React Router 7)
- **`aprova-backend/`** — Backend API (Express 5, Node.js, CommonJS)

Each has its own `package.json`, `node_modules`, and `.env` file. There is no shared workspace config.

## Development Commands

### Frontend (`aprova-react/`)
```bash
cd aprova-react
npm run dev      # Vite dev server (default: http://localhost:5174)
npm run build    # Production build
npm run lint     # ESLint
```

### Backend (`aprova-backend/`)
```bash
cd aprova-backend
npm run dev      # Starts Express server (default: port 3001)
npm start        # Same as dev
```

Both must run simultaneously for the full app to work. No test framework is configured.

## Environment Variables

### Frontend (`aprova-react/.env`)
- `VITE_API_URL` — Backend URL (default: `http://localhost:3001`)
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key

### Backend (`aprova-backend/.env`)
- `STRIPE_SECRET_KEY` — Stripe secret key
- `GMAIL_USER` — Gmail address for sending emails
- `GMAIL_APP_PASSWORD` — Gmail app password
- `EMAIL_DESTINO` — Destination email for test results and sale notifications
- `FRONTEND_URL` — Frontend URL for redirect URLs (default: `http://localhost:5174`)
- `PORT` — Server port (default: `3001`)

## Architecture

### Payment Flow
1. User selects a modalidad on `/servicios` and goes to `/pago?modalidad=X`
2. Frontend calls `POST /api/crear-checkout` with modalidad, email, nombre
3. Backend creates a Stripe Checkout Session and returns the URL
4. After payment, Stripe redirects to `/pago-exitoso?session_id=X&modalidad=X`
5. Frontend calls `GET /api/verificar-pago/:sessionId` to confirm payment
6. On success, backend sends confirmation email to client + notification to APROVA
7. Access credentials are stored in `localStorage` as `aprova_acceso`

### Test System
- Three psychometric tests: **Terman** (IQ), **Areas Vocacionales** (vocational areas), **Razonamiento DAT-5** (reasoning)
- Test data lives in `aprova-react/src/data/` as JSON files (`items_terman.json`, `items_areas.json`, `items_razonamiento.json`)
- Each test has its own React component in `aprova-react/src/components/`
- The `/tests` page gates access via `localStorage` — bypass with `?prueba=1` query param for testing
- When a test is completed, results are sent via `POST /api/enviar-resultados`
- Backend generates an Excel file (ExcelJS) with results and emails it to `EMAIL_DESTINO`

### Two Service Modalidades
- **modalidad1** ($500 MXN): Online tests + vocational profile by email
- **modalidad2** ($1,500 MXN): Tests + multiple virtual advisory sessions + coaching

### Pricing
All prices are defined in the backend `PRODUCTOS` object in centavos (MXN). The frontend also has display-only descriptions in `Pago.jsx` but does NOT define prices — prices come from the backend via `GET /api/precios`.

## Key Conventions

- Currency is MXN (Mexican pesos), stored in centavos in backend (50000 = $500.00)
- Timezone is `America/Mexico_City` for all date formatting
- Brand colors: primary purple `#534AB7`, dark navy `#26215C`, light purple `#EEEDFE`/`#AFA9EC`
- Pages under construction use the inline `PaginaEnConstruccion` component in `App.jsx`
