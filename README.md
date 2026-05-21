# FoodShare AI

Professional food donation web app with a TypeScript React dashboard, Express API, Neon Postgres storage, and OpenRouter AI route/time/cost estimation.

## Folders

- `frontend` - React, Vite, TypeScript, Three.js, Recharts, Lucide UI
- `backend` - Node, Express, TypeScript, Neon Postgres, OpenRouter AI

## Run Locally

Backend:

```bash
cd backend
npm install
npm run db:setup
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Android Local Runs

This does not change the Vercel/Railway deployment.

USB mode, recommended while the phone is connected:

```bash
cd frontend
npm run android:run:usb
```

If the device says `offline`, unlock the phone, accept the USB debugging prompt, unplug/replug USB, then run the command again.

Same Wi-Fi LAN mode:

```bash
cd frontend
npm run android:run:lan
```

Keep the backend running on the laptop while using either Android mode:

```bash
cd backend
npm run dev
```

Demo accounts:

- Donor: `donor@sharebite.dev` / `password123`
- Receiver: `receiver@sharebite.dev` / `password123`

## Environment

The backend reads secrets from `backend/.env`. Keep that file local and push only `.env.example`.

The provided Neon and OpenRouter credentials were placed in the local backend environment so the app can run immediately. Rotate them before production or public GitHub use.
