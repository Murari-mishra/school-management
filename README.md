# School MIS — monorepo

Quick setup & safe GitHub publish instructions ✅

## Structure
- `packages/backend` — Express + TypeScript API
- `packages/frontend` — Vite + React app

## Environment & secrets (safe by default) 🔒
- This repo ignores all `.env` files. Do **not** commit secrets.
- Copy `packages/*/.env.example` to `packages/*/.env` and fill values for local development.

Example (backend):
  cp packages/backend/.env.example packages/backend/.env

Windows (PowerShell):
  Copy-Item packages\backend\.env.example packages\backend\.env

## Helpful npm scripts
- Backend: (in `packages/backend`) `npm run dev`, `npm run build`, `npm run env:setup`
- Frontend: (in `packages/frontend`) `npm run dev`, `npm run build`, `npm run env:setup`

`env:setup` will create a local `.env` from `.env.example` if one does not exist.

## Before pushing to GitHub
1. Ensure `.env` files are not tracked (this project already ignores them).
2. Replace placeholder secrets in your local `.env` with real values.
3. Create a GitHub repository and push:
   - git init
   - git add .
   - git commit -m "chore: initial commit"
   - git branch -M main
   - git remote add origin <your-git-url>
   - git push -u origin main

## Using GitHub Secrets for CI / Deployments 💡
- Add production secrets under: Repository → Settings → Secrets and variables → Actions
- Reference them in GitHub Actions workflows as `${{ secrets.YOUR_SECRET }}`

---
If you want, I can: 1) remove the tracked `.env` files from git, 2) add a minimal CI workflow, and/or 3) create the remote GitHub repo and push. Tell me which next step you want. ✨
