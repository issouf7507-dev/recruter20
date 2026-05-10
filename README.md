# Ylsix — Plateforme de recrutement

Plateforme SaaS de recrutement avec matching IA, Kanban de candidatures, messagerie temps réel et multi-diffusion sur 160+ jobboards.

---

## Fonctionnalités principales

- **Matching IA** — scoring candidats/offres via Hugging Face + Anthropic
- **Kanban** — suivi des candidatures avec drag & drop
- **Messagerie temps réel** — via Socket.io
- **Multi-diffusion** — publication sur 160+ jobboards (LinkedIn, Indeed…)
- **Paiements** — abonnements via GeniusPay (XOF)
- **Portail candidat** — CV, expériences, formations, alertes emploi

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router) + React 19 |
| Langage | TypeScript strict |
| Styles | Tailwind CSS v4 + Shadcn UI |
| Base de données | MySQL + Prisma ORM |
| Auth | Better Auth |
| Temps réel | Socket.io |
| Stockage | EdgeStore |
| Paiements | GeniusPay |
| Déploiement | PM2 (Next.js + Socket.io séparés) |

## Démarrage local

```bash
# 1. Cloner et installer les dépendances
git clone <repo>
cd recruteur20-v1
pnpm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Remplir les variables dans .env.local

# 3. Appliquer les migrations et générer le client Prisma
npx prisma migrate dev
npx prisma generate

# 4. Démarrer en développement
pnpm dev          # Next.js sur :3000
pnpm start:socket # Socket.io sur :3001
```

## Architecture

```
app/
  (public)/       — pages publiques (offres, landing)
  auth/           — authentification candidat/recruteur
  recruteur/      — dashboard recruteur
  api/            — routes API (délèguent à lib/)

lib/
  api/            — repositories et services par domaine
  actions/        — Server Actions Next.js
  matching/       — algorithmes de scoring IA
  hooks/          — React hooks côté client
  auth.ts         — config Better Auth
  prisma.ts       — client Prisma singleton
  email.ts        — service email (Resend)
  geniuspay.ts    — client paiements
  logger.ts       — logger structuré (JSON en prod)
  env.ts          — validation des variables d'environnement

components/
  ui/             — composants Shadcn
  auth/           — AuthForm, AuthGuard
  shared/         — PaymentButton, Button…
  public/         — Header, Footer, sections landing
  recruteur/      — composants dashboard

server/           — serveur Socket.io standalone
prisma/           — schéma + migrations
```

## Déploiement (PM2)

```bash
# Démarrer tous les services
pm2 start ecosystem.config.js

# Mettre à jour sans downtime
git pull && npx prisma migrate deploy && pm2 reload all

# Voir les logs
pm2 logs

# Statut
pm2 status
```

## Variables d'environnement

Voir `.env.example` pour la liste complète des variables requises.

Les variables sont validées au démarrage via `lib/env.ts` — le serveur refuse de démarrer si une variable obligatoire est manquante.
