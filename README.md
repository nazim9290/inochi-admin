# Inochi Admin

Admin dashboard for **Inochi Global Education Institute** — manages students, blogs, certificates, seminars, contacts, and content.

## Stack

- **Build tool:** Vite 5
- **Framework:** React 18 (JS only — no TypeScript)
- **Routing:** React Router 6
- **Styling:** Tailwind CSS with the Inochi brand palette
- **HTTP client:** axios with a custom interceptor (auth token injection)
- **Port:** 4000 (`node server.js`) or 5173 (Vite dev server)

## Setup

```bash
npm install
cp .env.example .env      # then fill in real values
npm run dev               # http://localhost:5173
```

Production:
```bash
npm run build             # outputs dist/
npm run preview           # preview the build locally
npm start                 # serve dist/ on port 4000 (server.js)
```

## Environment variables

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Back-end API base (e.g. `https://api.inochieducation.com/api/`) |
| `VITE_YOUTUBE_API_KEY` | YouTube Data API key for the playlist feature |

Vite only exposes `VITE_*`-prefixed vars to the browser.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot-reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the build (Vite serves `dist/`) |
| `npm start` | Run `server.js` (used by Docker) |
| `npm run lint` | ESLint with `--max-warnings 0` |
| `npm run lint:fix` | ESLint with `--fix` |
| `npm run format` | Prettier writes the whole tree |
| `npm run format:check` | Prettier check-only |

## Brand identity

Tailwind exposes the brand palette under `theme.colors.brand`:

| Class | Hex |
|---|---|
| `bg-brand-navy` / `text-brand-navy` | `#0F2D52` |
| `bg-brand-teal` / `text-brand-teal` | `#29B5C4` |
| `bg-brand-tealLight` | `#7FCED4` |
| `text-brand-slate` | `#475569` |

White-themed surfaces only. Do not introduce Bootstrap or Ant Design styling.

## Folder layout

```
.
├── public/
├── src/
│   ├── main.jsx               # ReactDOM root + providers
│   ├── App.jsx
│   ├── index.css              # @tailwind directives + legacy CSS during migration
│   ├── components/            # shared UI (SideBar, LoginComponent, NavigationLink, ...)
│   ├── pages/                 # route screens (Account, HomePage, Cert, ...)
│   ├── routes/routes.jsx      # React Router config
│   ├── context/               # AuthContext, VideoContext
│   └── axios/axiosInterceptor.js
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Renovation in progress

The dashboard is being migrated from Bootstrap + Ant Design to Tailwind-only. See [../RENOVATION.md](../RENOVATION.md) for the per-component checklist.

## Deploying

Two-stage Docker build via `Dockerfile`, serving the static build with `serve` on port 4000. CI/CD via `Jenkinsfile`.
