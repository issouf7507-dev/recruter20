# Partie 7 — Documentation et Maintenabilité

**Priorité : BASSE**  
À faire après avoir stabilisé la sécurité et la structure.

---

## 7.1 Absence de logs structurés

### Problème
Le code utilise `console.log`, `console.error` sans structure. En production, impossible de filtrer ou d'alerter sur les erreurs.

### Correction
Créer un logger centralisé :

```typescript
// lib/logger.ts
type LogLevel = "debug" | "info" | "warn" | "error";

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  if (process.env.NODE_ENV === "production") {
    // En production : JSON structuré pour les outils de monitoring
    console[level](JSON.stringify(entry));
  } else {
    // En développement : lisible
    console[level](`[${level.toUpperCase()}] ${message}`, meta ?? "");
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
};
```

Remplacer `console.error` par `logger.error` dans les routes API critiques (payment, auth).

---

## 7.2 Documentation des variables d'environnement

### Problème
Il n'y a pas de `.env.example` documentant les variables requises.

### Correction
Créer `.env.example` (voir **01-securite.md § 1.1** pour le contenu complet).

Ajouter aussi une section dans `README.md` expliquant comment configurer l'environnement.

---

## 7.3 README incomplet

### Problème
Le `README.md` existe mais probablement pas à jour avec toutes les fonctionnalités.

### Structure recommandée pour `README.md`
```markdown
# Ylsix — Plateforme de recrutement

## Fonctionnalités principales
- Matching IA candidats/offres
- Kanban de suivi des candidatures
- Messagerie temps réel
- Multi-diffusion (160+ jobboards)
- Paiement par abonnement (GeniusPay)

## Stack technique
- Next.js 16 / React 19 / TypeScript
- Prisma + MySQL
- Better Auth
- Socket.io
- GeniusPay (paiements)

## Démarrage local
1. `cp .env.example .env.local` et remplir les variables
2. `npm install`
3. `npx prisma migrate dev`
4. `npm run dev:all`

## Architecture
[Lien vers la doc d'architecture]

## Contribution
[Guidelines]
```

---

## 7.4 Fonctionnalités "stub" non documentées

### Problème
Certaines intégrations sont commencées mais pas finalisées, sans documentation de leur état :
- LinkedIn OAuth : configuré mais credentials manquants
- Google OAuth : stub présent mais pas implémenté
- `globales/email.ts` : doublon avec `lib/email.ts` ?
- `app/(public)/paiement/` : pages de retour paiement nouvelles, non testées

### Correction
Créer un fichier `audit/08-features-en-cours.md` listant :
- Chaque feature incomplète
- Son état actuel
- Ce qu'il reste à faire
- La priorité

---

## 7.5 Scripts de base de données non documentés

### Problème
- `scripts/cleanInvalidDates.ts` — quand l'exécuter ? sur quoi ?
- `scripts/test-matching.ts` — comment l'utiliser ?
- `prisma/seeds/seed-offres.ts` — safe en production ?

### Correction
Ajouter des commentaires d'en-tête dans chaque script :
```typescript
/**
 * cleanInvalidDates.ts
 * 
 * Nettoie les dates invalides (null, "0000-00-00") dans la table Candidat.
 * À exécuter UNE SEULE FOIS après migration vers le schéma v2.
 * 
 * Usage: npx tsx scripts/cleanInvalidDates.ts
 * Environnement: développement uniquement
 */
```

---

## 7.6 Gestion des dépendances

### Vérification de sécurité
```bash
# Vérifier les vulnérabilités connues
npm audit

# Mettre à jour les dépendances mineures
npm update

# Voir les dépendances obsolètes
npm outdated
```

### Dépendances à surveiller
- `better-auth` v1.3.32 — vérifier si une version plus récente corrige des CVE
- `prisma` v7.6.0 — vérifier le changelog de sécurité
- `socket.io` v4.8.3 — stable

---

## 7.7 PM2 et déploiement

### Problème
`ecosystem.config.js` est présent mais peut-être pas synchronisé avec le processus de déploiement réel.

### Vérification
```bash
cat ecosystem.config.js
```

### Points à documenter dans `RUN_SETUP_SERVER.md`
- Comment démarrer tous les services (Next.js + Socket.io)
- Comment recharger sans downtime (`pm2 reload`)
- Comment voir les logs (`pm2 logs`)
- Comment mettre à jour (git pull + prisma migrate deploy + pm2 reload)

---

## Checklist de validation

- [x] `lib/logger.ts` créé — JSON structuré en prod, lisible en dev — utilisé dans `api-error.ts`, `payment/webhook`, `auth/forgot-password`
- [x] `.env.example` créé avec toutes les variables documentées et commentées
- [x] `README.md` mis à jour : stack, architecture, démarrage local, déploiement PM2
- [x] `audit/08-features-en-cours.md` créé : LinkedIn OAuth, Google OAuth, paiement, multi-diffusion, tests
- [x] En-têtes ajoutés dans `cleanInvalidDates.ts` — `test-matching.ts` avait déjà un header
- [ ] `npm audit` — à lancer manuellement : `npm audit`
- [x] `ecosystem.config.js` déjà configuré (Next.js :3000 + Socket.io :3001) — commandes PM2 documentées dans README
