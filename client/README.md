# Family Tree Builder – Client

Frontend for the Family Tree Builder. For full setup, see the root `README.md`. Quick client-only steps:

## Install dependencies
```bash
cd client
npm install
```

## Environment variables
Copy `env.sample` to `.env` and adjust if needed:
```bash
cp env.sample .env
```
`VITE_API_URL` should point to the backend (default `http://localhost:3000/api`).

## Run
```bash
npm run dev
```

Full app (client + server) from repo root:
```bash
npm run dev
```
