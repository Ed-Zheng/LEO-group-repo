# Prio

## Run locally

Open two terminals from `/Users/linda/Desktop/Prio`.

Local development in this repo uses `127.0.0.1` consistently for the backend. Do not mix `localhost` and `127.0.0.1` in frontend/backend URLs.

Frontend:

```bash
npm run frontend
```

Backend:

```bash
npm run backend
```

The frontend runs with Vite and the backend runs on `http://127.0.0.1:5000`.

The frontend should use this API base URL in `/Users/linda/Desktop/Prio/prio-frontend/.env`:

```bash
VITE_API_BASE_URL=http://127.0.0.1:5000
```

## Firebase setup

Create `/Users/linda/Desktop/Prio/prio-frontend/.env` from `/Users/linda/Desktop/Prio/prio-frontend/.env.example`.

Required values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Optional:

```bash
VITE_FIREBASE_DATABASE_URL=
```

After updating the frontend env file, restart the Vite server.
