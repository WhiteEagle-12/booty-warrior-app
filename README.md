# Eagle Eye Training

A precision instrument panel for strength training: mesocycle workout logging,
RIR-aware progression suggestions, analytics, personal records, achievements,
and cloud sync across devices.

## Stack

- **React 18 + Vite** — fast dev server and optimized production builds
- **Tailwind CSS** — token-driven "flight deck" design system (dark & light themes)
- **Firebase** — anonymous auth + Firestore with a persistent multi-tab local cache
- **Recharts** — analytics visualizations
- **react-beautiful-dnd** — drag-and-drop program editing

## Getting started

```bash
npm install
npm run dev      # starts on http://localhost:3000
```

Create a `.env` file with your Firebase web config. Both `REACT_APP_*` (legacy)
and `VITE_*` variable prefixes are accepted:

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...
```

## Scripts

- `npm run dev` — dev server with HMR
- `npm run build` — production build to `build/`
- `npm run preview` — serve the production build locally

## Sync architecture

All training data lives in a single Firestore document per sync ID
(`workoutLogs/{syncId}`). Writes go through a coalescing queue
(`src/utils/syncQueue.jsx`) that debounces keystroke-level updates into batched
writes, flushes on tab hide/close, and retries failed flushes automatically.
Firestore's persistent local cache keeps data durable and available offline,
across multiple open tabs.
