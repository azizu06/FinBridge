# FinBridge

A multilingual, **culturally-aware personal-finance guidance** app. FinBridge gives
people financial advice in their own language *and* framed around their own cultural
context — so guidance about saving, budgeting, and spending lands as relevant rather
than generic. Built for immigrants, bilingual students, and families navigating the
U.S. financial system.

🏆 Built at a KnightHacks hackathon. Featured in
[Aziz's portfolio](https://azizu.dev). A separate hosted V2 lives at
[FinBridgeV2](https://github.com/GridGxly/FinBridgeV2).

## Preview

> **TODO — add a screenshot.** Run the app locally (see Getting Started) and capture
> the Home and Dashboard routes to `assets/preview.png`, then reference it here.
> Capturing live requires a Google Gemini key, a Google Translate key, and Firebase
> credentials (see Environment variables).

## Features

- **Culturally-aware advice** — the backend maps a user's culture to saving
  vocabulary, values, budgeting style, and investment attitude (e.g. Uzbek
  *jamg'arma*, Spanish *ahorro*, Hindi *bachat*, Haitian *ekonomi*, Chinese *储蓄*),
  then feeds that context into Google Gemini so advice is specific, not boilerplate.
- **Multilingual UI** — full internationalization via `i18next` / `react-i18next`
  with browser language detection and per-namespace translation files.
- **On-demand translation** — a `/api/translate` route backed by Google Translate for
  turning financial guidance and documents into the user's preferred language.
- **Conversational assistant** — an in-app chatbot for asking finance questions in
  plain language.
- **Spending dashboard** — Chart.js visualizations of transactions (currently backed
  by mock transaction data).
- **Routed multi-page app** — Home, Dashboard, and About routes via React Router.

## Tech stack

| Layer | Choices |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 3, React Router 7, Chart.js (`react-chartjs-2`) |
| i18n | `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-http-backend` |
| Backend | Node.js, Express 5 |
| AI / data | Google Gemini (`@google/genai`), Google Translate, Firebase Admin |

## Architecture

```
finbridge/
├── src/                       # React + Vite frontend
│   ├── App.jsx                # Router: /home, /dashboard, /about
│   ├── Home.jsx  Dashboard.jsx  About.jsx  Header.jsx  Chatbot.jsx
│   └── i18n.js                # i18next setup
└── backend/                   # Express API
    ├── server.js              # App entry — mounts the route groups below
    ├── routes/
    │   ├── advice.js          #  /api/advice      → Gemini-generated guidance
    │   ├── translate.js       #  /api/translate   → Google Translate
    │   ├── transactions.js    #  /api/transactions→ (mock) transaction data
    │   └── user.js            #  /api/user
    ├── services/
    │   ├── geminiService.js       # Gemini prompt construction & calls
    │   ├── translateService.js    # Translation helper
    │   └── culturalContext.js     # Culture → saving terms/values/style map
    ├── config/languages.js
    ├── data/mockTransactions.*    # Sample spending data
    └── firebase/initFirebase.js   # Firebase Admin init
```

The frontend (Vite dev server) calls the Express backend, which defaults to
**port 5001**. The frontend reads its backend base URL from `VITE_BACKEND_URL`.

## Getting started

**Prerequisites:** Node.js 18+ and API access for Gemini, Google Translate, and a
Firebase project (for the advice/translation features to work).

```bash
# 1. Frontend (repo root)
npm install
npm run dev          # Vite dev server

# 2. Backend (separate terminal)
cd backend
npm install
npm start            # Express on http://localhost:5001
```

### Scripts (frontend)

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Environment variables

Create `backend/.env` (gitignored — **never commit it**). Variable **names** only:

| Variable | Used for |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API access |
| `GEMINI_MODEL` | Which Gemini model to call |
| `GOOGLE_TRANSLATE_KEY` | Google Translate API access |
| `GOOGLE_APPLICATION_CREDENTIALS` / `FIREBASE_SA_PATH` | Path to the Firebase service-account credentials |
| `PORT` | Backend port (defaults to `5001`) |

Frontend (root `.env`):

| Variable | Used for |
|---|---|
| `VITE_BACKEND_URL` | Base URL of the Express backend |

> ⚠️ **Security follow-up:** a Firebase service-account private-key JSON is currently
> committed under `backend/firebase/`. It should be **removed from git history and the
> key rotated**, then loaded at runtime via `GOOGLE_APPLICATION_CREDENTIALS` /
> `FIREBASE_SA_PATH` from an untracked location. Add `backend/firebase/*.json` and
> `backend/.env` to `.gitignore`.

## Technical highlights

- **Context injection over generic prompts.** `culturalContext.js` is the core idea:
  rather than asking an LLM for "financial advice," FinBridge enriches the prompt with
  culture-specific saving terms, values, and budgeting norms — turning a generic model
  into guidance that reflects how a user actually thinks about money.
- **Translation + i18n as a first-class concern**, not an afterthought: the UI is
  internationalized *and* AI output is translatable, so the whole experience stays in
  one language end-to-end.

## Roadmap

- Replace mock transaction data with live account linking (e.g. Plaid).
- Add the preview screenshot noted above.
- Move Firebase credentials out of the repo (see security follow-up).

## License

No license file is present; treat as **all rights reserved** unless one is added.
