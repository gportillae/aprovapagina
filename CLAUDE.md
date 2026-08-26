# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

APROVA is a vocational orientation platform (orientacion vocacional) for Mexican students. It offers psychometric tests online with Stripe payment integration. The project is in Spanish — all UI text, variable names, and comments use Spanish.

## Repository Structure

This is a monorepo with two apps in the root directory:

- **`aprova-react/`** — Frontend (React 19, Vite 8, React Router 7)
- **`aprova-backend/`** — Backend API (Express 5, Node.js, CommonJS)

Each has its own `package.json`, `node_modules`, and `.env` file. A root `package.json` and `railway.json` handle unified build/deploy.

## Development Commands

### Local development (run both simultaneously)
```bash
cd aprova-react && npm run dev      # Vite dev server (http://localhost:5174)
cd aprova-backend && npm run dev    # Express server (port 3001)
```

### Build & lint
```bash
cd aprova-react && npm run build    # Production build → aprova-react/dist/
cd aprova-react && npm run lint     # ESLint
```

No test framework is configured.

## Deployment

Deployed on **Railway** as a single service. Express serves the React build as static files in production.

- `railway.json` defines build and start commands
- Root `package.json` has unified scripts
- In production, `VITE_API_URL` is not set (defaults to `''`, same origin)
- In development, `VITE_API_URL=http://localhost:3001` via `aprova-react/.env`

## Environment Variables

### Frontend (`aprova-react/.env`)
- `VITE_API_URL` — Backend URL (dev: `http://localhost:3001`, prod: not set)
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key

### Backend (`aprova-backend/.env`)
- `STRIPE_SECRET_KEY` — Stripe secret key
- `GMAIL_USER` — Gmail address for sending emails
- `GMAIL_APP_PASSWORD` — Gmail app password
- `EMAIL_DESTINO` — Destination email for test results and sale notifications
- `FRONTEND_URL` — Frontend URL for Stripe redirects (prod: `https://aprovamx.com`)
- `PORT` — Server port (default: `3001`)
- `RESULTADOS_DIR` — Where per-user result JSONs are stored. **In production must point to the Railway volume** (e.g. `/data/resultados`); otherwise every redeploy wipes all user progress. Defaults to `aprova-backend/resultados/`.

## Architecture

### Payment Flow
1. User selects a modalidad on `/servicios` and goes to `/pago?modalidad=X`
2. Frontend calls `POST /api/crear-checkout` with modalidad, email, nombre
3. Backend creates a Stripe Checkout Session and returns the URL
4. After payment, Stripe redirects to `/pago-exitoso?session_id=X&modalidad=X`
5. Frontend calls `GET /api/verificar-pago/:sessionId` to confirm payment
6. On success, backend sends confirmation email to client + notification to APROVA
7. Access credentials are stored in `localStorage` as `aprova_acceso`

Since access lives only in the browser, `/acceso` lets a user recover it by email:
`POST /api/recuperar-acceso` looks up paid Checkout Sessions in Stripe (Stripe is the
source of truth for who paid) and rebuilds `aprova_acceso`. If several purchases exist,
modalidad2 wins; otherwise the most recent one.

### Test System
- Six psychometric tests: **Terman** (IQ), **Aptitudes**, **Intereses**, **Areas Vocacionales** (PU + 3 subtypes from diagnostic), **Razonamiento DAT-5**, **MBTI** (personality)
- Tests must be completed in sequential order; the `/tests` page enforces this
- Test data lives in `aprova-react/src/data/` as JSON files
- Each test has its own React component in `aprova-react/src/components/`
- Bypass access gate with `?prueba=1` query param for testing
- Results are sent via `POST /api/enviar-resultados` (generates Excel + emails it)
- Results are persisted server-side under `RESULTADOS_DIR` as per-user JSON files (keyed by sanitized email)
- `GET /api/resultados/:email` returns test completion status from server. Note the backend stores all areas under a single `areas` key, but the endpoint expands them into the frontend's `area_PU`, `area_FM`, … ids
- The endpoint also returns raw `tests` results, which the frontend uses to rebuild the diagnóstico diferencial (top 3 aptitudes/intereses) when localStorage was lost
- Frontend syncs completion status from server on page load (multi-device/multi-day persistence)

### Diagnostic Diferencial
After Aptitudes and Intereses are completed, the top 3 aptitudes and interests are cross-referenced against 6 professional areas (FM, B, Q, A, S, H) to determine which 3 area subtypes the user must complete. This logic is in `Tests.jsx`.

### PDF Report Generation
- `aprova-backend/generar-reporte.js` generates a ~21-page PDF using PDFKit
- Contains: MBTI personality (16 types with descriptions), Terman intelligence (10 series), aptitudes/razonamiento bar charts, intereses, areas vocacionales with career lists, and fixed advisory text sections
- `POST /api/generar-reporte` loads results from server files, generates PDF, emails it to `EMAIL_DESTINO`, and returns it as download
- Report includes the `pasos_aprova.jpg` image as second-to-last page

### SEO and Prerendering
The public pages are **prerendered to static HTML at build time**. This matters because the
site is a client-rendered SPA: Googlebot renders JS but on a delayed second pass, and the AI
answer-engine crawlers (GPTBot / OAI-SearchBot for ChatGPT, PerplexityBot, ClaudeBot) do **not**
run JavaScript at all — without prerendering they see an empty page.

- `src/seo/siteMeta.js` is the single source of truth: per-route titles, descriptions,
  canonicals, JSON-LD, and the FAQ list. Both the React app and the build script read it,
  so metadata cannot drift.
- `npm run build` runs three steps: client build → SSR build (`dist-ssr/`) → `scripts/prerender.js`.
- The prerender writes one flat HTML file per public route (`dist/servicios.html`, …) plus
  `dist/app.html` (a `noindex` shell for the private routes), `dist/sitemap.xml` and `dist/llms.txt`.
- `index.html` has `<!--seo-inicio-->` / `<!--seo-fin-->` markers; the prerender replaces
  everything between them. **Removing the markers breaks the build** (on purpose).
- Express serves these with `express.static(..., { extensions: ['html'] })` so `/servicios`
  returns `servicios.html` with no trailing-slash redirect — the served URL matches the canonical.
- `src/seo/Seo.jsx` updates the head **imperatively** on SPA navigation. It deliberately does not
  render `<title>`/`<meta>` into the tree: the prerendered HTML already has them, and rendering
  them again would duplicate the tags.
- Content that should be indexed must be in the DOM, not behind a conditional render. The
  `/servicios` FAQ answers are always rendered and collapsed with CSS for this reason.

### Two Service Modalidades
- **modalidad1** ($4,000 MXN): Online tests + vocational profile by email
- **modalidad2** ($7,000 MXN): Tests + multiple virtual advisory sessions + coaching

### Pricing
All prices are defined in the backend `PRODUCTOS` object in centavos (MXN). The frontend has display-only descriptions in `Pago.jsx` — prices come from the backend via `GET /api/precios`.

## Key Conventions

- Currency is MXN (Mexican pesos), stored in centavos in backend (400000 = $4,000.00)
- Timezone is `America/Mexico_City` for all date formatting
- Brand colors: primary purple `#534AB7`, dark navy `#26215C`, light purple `#EEEDFE`/`#AFA9EC`
- Pages under construction use the inline `PaginaEnConstruccion` component in `App.jsx`
- Domain: `aprovamx.com`
