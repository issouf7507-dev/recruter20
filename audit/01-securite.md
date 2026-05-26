# Partie 1 — Sécurité

**Priorité : CRITIQUE**  
Ces problèmes doivent être corrigés avant toute mise en production.

---

## 1.1 Secrets exposés dans Git

### Problème
Le fichier `.env` est **commité dans le dépôt Git** avec tous les secrets en clair.

```
# .env (ne devrait PAS être dans git)
DATABASE_URL="mysql://root:root0990@localhost:3306/recruteur_db"
RESEND_API_KEY="re_9LFvhDzg_..."
GENIUSPAY_API_KEY="pk_sandbox_..."
GENIUSPAY_API_SECRET="sk_sandbox_..."
EDGE_STORE_ACCESS_KEY="..."
SMTP_PASSWORD="..."
LINKEDIN_CLIENT_SECRET="..."
```

### Impact
- Toute personne ayant accès au repo voit les credentials de prod
- Rotation obligatoire de TOUS les secrets après le fix
- Risque de compromission de la base de données et des services tiers

### Correction

**Étape 1 : Supprimer `.env` du suivi Git**
```bash
git rm --cached .env
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

**Étape 2 : Créer `.env.example`** (documenter les variables sans les valeurs)
```bash
# .env.example — À committer dans le repo
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB_NAME"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
RESEND_API_KEY="re_..."
GENIUSPAY_API_KEY="pk_..."
GENIUSPAY_API_SECRET="sk_..."
GENIUSPAY_WEBHOOK_SECRET="whsec_..."
EDGE_STORE_ACCESS_KEY="..."
EDGE_STORE_SECRET_KEY="..."
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USERNAME="..."
SMTP_PASSWORD="..."
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
NEXT_PUBLIC_HUGGINGFACE_API_KEY="hf_..."
```

**Étape 3 : Révoquer et régénérer tous les secrets exposés**
- [ ] Changer le mot de passe MySQL
- [ ] Régénérer la clé Resend
- [ ] Régénérer les clés GeniusPay (contacter leur support)
- [ ] Régénérer les clés EdgeStore
- [ ] Changer le mot de passe SMTP Zoho

---

## 1.2 Validation du webhook GeniusPay

### Problème
Le webhook `/app/api/payment/webhook/route.ts` valide la signature HMAC, mais il faut vérifier que la validation échoue correctement (retourne 401 et ne traite pas le payload).

### Vérification à faire
```typescript
// app/api/payment/webhook/route.ts
// Vérifier que ce bloc existe et bloque bien l'exécution
if (!isValidSignature) {
  return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
}
// Aucun code de traitement ne doit s'exécuter avant cette vérification
```

### Correction
S'assurer que la vérification de signature est la **première** opération après la lecture du body, avant tout accès à la base de données.

---

## 1.3 Absence de rate limiting sur les API publiques

### Problème
Les routes API publiques (candidats, offres, auth) n'ont pas de rate limiting. Elles sont vulnérables aux abus.

### Routes exposées sans protection
- `POST /api/auth/[...all]` — brute force sur les mots de passe
- `GET /api/candidats` — scraping de la base candidats
- `GET /api/offres` — scraping des offres
- `POST /api/payment/initiate` — spam de paiements

### Correction
Installer et configurer `@upstash/ratelimit` ou utiliser le middleware Next.js :

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  // Rate limiting simple pour /api/auth
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    const ip = request.ip ?? "anonymous";
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 20;

    const record = rateLimit.get(ip) ?? { count: 0, resetTime: now + windowMs };
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }
    record.count++;
    rateLimit.set(ip, record);

    if (record.count > maxRequests) {
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
    }
  }
  return NextResponse.next();
}
```

> Pour la production, préférer Upstash Redis pour un rate limiting persistant et distribué.

---

## 1.4 Credentials de base de données trop permissifs

### Problème
La base de données utilise `root:root0990` — l'utilisateur root a tous les droits sur le serveur MySQL.

### Correction
Créer un utilisateur MySQL dédié à l'application avec les droits minimaux :

```sql
CREATE USER 'ylsix_app'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';
GRANT SELECT, INSERT, UPDATE, DELETE ON recruteur_db.* TO 'ylsix_app'@'localhost';
FLUSH PRIVILEGES;
```

Puis mettre à jour `DATABASE_URL` dans `.env`.

---

## 1.5 Headers de sécurité HTTP manquants

### Problème
`next.config.ts` ne configure pas les headers de sécurité HTTP (CSP, HSTS, X-Frame-Options, etc.).

### Correction
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
```

---

## Checklist de validation

- [x] `.env` retiré de Git (`.env*` dans `.gitignore`)
- [x] `.env` ajouté dans `.gitignore`
- [ ] `.env.example` créé et committé
- [ ] Tous les secrets révoqués et régénérés
- [ ] Utilisateur MySQL dédié créé
- [x] Rate limiting ajouté sur `/api/auth` (middleware.ts — in-memory, à migrer vers Upstash Redis en multi-serveur)
- [ ] Validation webhook vérifiée et testée
- [x] Headers HTTP de sécurité configurés
