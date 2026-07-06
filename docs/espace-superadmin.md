# Espace Super Admin — Documentation

> Espace d'administration plateforme sous `/superadmin` : tableau de bord, gestion des utilisateurs, suivi des revenus, et sécurité renforcée (login dédié, 2FA TOTP obligatoire, allowlist IP).
>
> Ajouté le 2026-07-02.

---

## Vue d'ensemble

L'espace `/superadmin` est réservé aux **administrateurs plateforme** (rôle distinct des recruteurs/candidats). Il donne une vue transverse sur toute la plateforme : inscriptions, utilisateurs, abonnements et revenus des piliers ATS SaaS + CVthèque Premium.

L'accès est protégé par **trois couches de sécurité** :
1. Re-vérification serveur du rôle `isSuperAdmin` à chaque requête (jamais depuis la session).
2. Double authentification (2FA TOTP) **obligatoire**.
3. Restriction d'accès par adresse IP (optionnelle, via variable d'environnement).

---

## 1. Le rôle Super Admin

**Champ** : `User.isSuperAdmin` (`Boolean @default(false)`)
**Script** : `scripts/make-superadmin.ts`

Le rôle est un simple flag booléen sur l'utilisateur. Le **premier** superadmin se crée **obligatoirement en CLI** (bootstrap ci-dessous). Une fois connecté, un superadmin peut ensuite **accorder/retirer le rôle à d'autres comptes** depuis la table Utilisateurs (voir §5ter) — cette action est protégée par le guard `requireSuperAdmin()` (rôle de l'appelant relu en base). Il n'existe **aucune route API publique** permettant de l'accorder.

```bash
# CRÉER le tout premier superadmin de zéro (compte + mot de passe)
npx tsx scripts/make-superadmin.ts admin@ylsix.com --password "MotDePasse123" --name "Jean Dupont"

# Promouvoir un compte EXISTANT (déjà inscrit via l'app)
npx tsx scripts/make-superadmin.ts email@exemple.com

# Rétrograder (retire le rôle, ne supprime pas le compte)
npx tsx scripts/make-superadmin.ts email@exemple.com --revoke
```

**Bootstrap (premier accès)** : comme l'espace exige déjà un superadmin connecté pour créer d'autres comptes, le tout premier se crée forcément en CLI. Avec `--password`, le script crée le `User` + un compte `credential` (hash better-auth), `emailVerified: true` et `isSuperAdmin: true` → connexion immédiate sur `/superadmin/login`, où la **2FA obligatoire** se configure à la 1ʳᵉ connexion. Si l'email existe déjà, le script se contente de basculer le flag (le `--password` est ignoré).

### Seeder de production (recommandé pour la mise en prod)

**Fichier** : `prisma/seeds/seed-superadmin.ts` — script `npm run seed:superadmin`.

Contrairement aux autres seeders (`seed:test`, `seed:offres`) qui **refusent** de tourner en prod, celui-ci est **conçu pour la prod** : idempotent et sans identifiants en dur. Les credentials sont lus depuis l'**environnement** (pas d'argument shell → pas d'historique) :

```bash
# Sur le VPS
SUPERADMIN_EMAIL="admin@ylsix.com" \
SUPERADMIN_PASSWORD="un-mot-de-passe-fort" \
SUPERADMIN_NAME="Jean Dupont" \
npm run seed:superadmin
```

- **Compte inexistant** → création (User + compte `credential`, `emailVerified: true`, `isSuperAdmin: true`).
- **Compte existant** → garantit seulement `isSuperAdmin: true`. Le **mot de passe n'est jamais réécrit** → rejouable sans risque.
- La 2FA obligatoire se configure à la 1ʳᵉ connexion.

> En local, les comptes suivants sont déjà superadmin : `r1@gmail.com`, `r5@gmail.com`, `r225@gmail.com`.

---

## 2. Guard serveur et structure des routes

**Fichier** : `lib/superadmin.ts` → `requireSuperAdmin()`

Chaque page et le layout protégé appellent `requireSuperAdmin()` en tête. La fonction :

1. Récupère la session (`auth.api.getSession`).
2. Sans session → redirige vers `/superadmin/login`.
3. Relit `isSuperAdmin` **en base de données** (jamais depuis la session, qui pourrait être falsifiée). Si faux → redirige vers `/`.
4. Vérifie que la 2FA est active (`twoFactorEnabled`). Sinon → redirige vers `/superadmin/login` pour la configurer.

### Route group `(protected)`

```
app/superadmin/
├── login/page.tsx              → PUBLIC (login dédié, hors guard)
└── (protected)/
    ├── layout.tsx              → guard + chrome admin (header, nav)
    ├── page.tsx                → tableau de bord
    ├── utilisateurs/page.tsx   → liste des comptes
    └── revenus/page.tsx        → revenus & abonnements
```

Le route group `(protected)` **n'affecte pas les URLs** : les pages restent accessibles sur `/superadmin`, `/superadmin/utilisateurs`, `/superadmin/revenus`. Il sert uniquement à ce que `/superadmin/login` échappe au guard et n'affiche pas le chrome admin.

> **Note de sécurité** : une page de login dédiée est une amélioration d'**UX/séparation**, pas une barrière de sécurité — elle s'authentifie contre le même backend better-auth. La vraie protection vient du re-check serveur du rôle + de la 2FA.

---

## 3. Double authentification (2FA TOTP) — obligatoire

**Config** : `lib/auth.ts` (plugin serveur), `lib/auth-client.ts` (plugin client)
**Modèle** : `User.twoFactorEnabled` + table `two_factor` (secret, codes de secours)
**UI** : `qrcode.react` pour l'affichage du QR code

On utilise le plugin `twoFactor` de **better-auth**.

### Comment ça marche

- **Première connexion d'un superadmin** (2FA pas encore configurée) : après saisie des identifiants, un **QR code** s'affiche + des **codes de secours**. L'utilisateur scanne le QR avec Google Authenticator / Authy / 1Password, puis saisit un code à 6 chiffres pour finaliser.
- **Connexions suivantes** : identifiants → better-auth réclame le **code TOTP** avant de créer la session.

### Point clé de sécurité

L'endpoint `enable` **n'active pas** le flag `twoFactorEnabled` : c'est **`verifyTotp` (la vérification réussie)** qui le passe à `true`. Un setup abandonné en cours ne débloque donc aucun accès.

De plus, quand la 2FA est active, better-auth **ne délivre pas de session complète** tant que le code TOTP n'est pas validé. Une session valide implique donc déjà le second facteur.

### Endpoints (montés automatiquement par le plugin)

```
POST /api/auth/two-factor/enable          → génère secret + QR + codes de secours
POST /api/auth/two-factor/verify-totp     → valide le code, active la 2FA
POST /api/auth/two-factor/get-totp-uri
POST /api/auth/two-factor/disable
POST /api/auth/two-factor/verify-backup-code
```

---

## 4. Page de login dédiée

**Page** : `/superadmin/login`
**Server action** : `lib/actions/superadminAuth.ts` → `getSuperAdminAuthStatus()`

Un composant client à **3 étapes** :

| Étape | Déclenchement | Contenu |
|-------|---------------|---------|
| `credentials` | par défaut | email + mot de passe |
| `totp` | 2FA déjà active | saisie du code à 6 chiffres |
| `setup` | superadmin sans 2FA | QR code + codes de secours + vérification |

Après connexion, la page appelle `getSuperAdminAuthStatus()` (server action) qui relit `isSuperAdmin` et `twoFactorEnabled` en base. **Un compte non-superadmin est immédiatement déconnecté** (`signOut`) avec un message « Accès réservé aux super administrateurs ».

---

## 5. Restriction par IP (middleware)

**Fichier** : `middleware.ts` → `superadminIpDenied()`
**Variable d'env** : `SUPERADMIN_ALLOWED_IPS`

La restriction est intégrée au `middleware.ts` existant (qui gère déjà le rate-limit sur `/api/auth`). Le matcher couvre `/superadmin/:path*` (login inclus).

### Comportement

- `SUPERADMIN_ALLOWED_IPS` **vide/absente** → **aucun filtrage** (défaut sûr, on ne se verrouille pas soi-même).
- **localhost** (`127.0.0.1`, `::1`) → toujours autorisé (dev).
- IP hors liste → réponse **403 « Accès refusé »**.

### Activation en production

```bash
# Sur le VPS, dans les variables d'environnement :
SUPERADMIN_ALLOWED_IPS="1.2.3.4, 5.6.7.8"
```

> ⚠️ N'active cette liste que si tes IP d'admin sont **fixes** — sinon tu risques de te bloquer toi-même (déplacement, 4G, changement de FAI).

> **Next 16** : le fichier `middleware.ts` déclenche un warning de dépréciation (« renommer en `proxy.ts` »). Il **fonctionne** tel quel ; le renommage est un ajustement optionnel.

---

## 5bis. Déconnexion & création d'utilisateurs

### Déconnexion
Le header de l'espace protégé affiche un menu (icône + email) avec l'action **« Se déconnecter »** (`components/superadmin/superadmin-user-menu.tsx`). Elle appelle `signOut()` de better-auth puis force un rechargement vers `/superadmin/login`.

### Création d'utilisateurs
Depuis `/superadmin/utilisateurs`, le bouton **« Nouvel utilisateur »** ouvre un dialog (`components/superadmin/create-user-dialog.tsx`) : nom, email, mot de passe (≥ 8 car.), type (Candidat/Recruteur/Collaborateur) et option **rôle super admin**.

**Server action** : `lib/actions/superadminUsers.ts` → `createUserAsSuperAdmin()`.

- Ré-appelle `requireSuperAdmin()` (le rôle est relu en base, jamais depuis la session).
- Crée le `User` + un `Account` **`credential`** manuellement, avec le hash de better-auth (`auth.$context.password.hash`). On **n'utilise pas** `auth.api.signUpEmail` : cela ouvrirait une session et **écraserait le cookie du superadmin** qui effectue l'opération.
- Convention respectée : `account.accountId == user.id` (comme les comptes existants), `providerId = "credential"`.
- Le compte est créé avec `emailVerified: true` → connexion immédiate possible.
- Un compte créé avec le rôle super admin devra configurer sa 2FA à la première connexion (imposé par le guard).

---

## 5ter. Fiche utilisateur & promotion à la demande

Dans la table `/superadmin/utilisateurs`, chaque ligne a un bouton **« Détails »** (colonne Actions) qui ouvre un **Sheet** latéral (`components/superadmin/user-detail-sheet.tsx`) :

- Récapitulatif : type, email vérifié, 2FA active, entreprise/ville/téléphone, date d'inscription, ID.
- Un **interrupteur « Rôle super admin »** pour accorder/retirer le rôle **à la demande**.

**Server action** : `lib/actions/superadminUsers.ts` → `setSuperAdminRole(userId, isSuperAdmin)`.

- Re-vérifie `requireSuperAdmin()` (rôle de l'appelant relu en base).
- **Garde-fou** : un superadmin ne peut pas **retirer son propre rôle** (interrupteur désactivé côté UI + refus côté serveur) → pas d'auto-verrouillage.
- Accorder le rôle ne dispense pas de la 2FA : un compte fraîchement promu devra la configurer à sa prochaine connexion (le Sheet l'indique s'il n'a pas encore de 2FA).

---

## 6. Contenu des pages

### `/superadmin` — Tableau de bord
- Cartes de stats : candidats, recruteurs, offres actives, candidatures.
- Graphe des **inscriptions par jour** (30 derniers jours, `components/superadmin/signups-chart.tsx`).
- Tableau des 8 dernières inscriptions.

### `/superadmin/utilisateurs` — Utilisateurs
- Liste paginée (20/page) avec **recherche** (nom/email) et **filtre par type**.
- Colonnes : nom, email, type, entreprise/ville, email vérifié, date. Badge « Super admin ».

### `/superadmin/revenus` — Revenus
- MRR estimé (ATS + CVthèque), encaissé ce mois, encaissé total, abonnements actifs.
- Répartition des abonnements par plan (ATS et CVthèque).
- Flux fusionné des 12 derniers paiements (ATS + CVthèque).

---

## 7. Base de données & migrations

Deux changements de schéma ont été introduits :

| Migration | Contenu |
|-----------|---------|
| `20260702120000_add_super_admin_flag` | colonne `user.isSuperAdmin` |
| `20260702130000_add_two_factor` | colonne `user.twoFactorEnabled` + table `two_factor` |

### ⚠️ Important : ce projet utilise `db push`, pas `migrate`

L'historique de migration Prisma du projet est **incomplet** (la base a été construite au fil du temps via `prisma db push`). Lancer `prisma migrate dev` ou `migrate deploy` détecte une **dérive** et cherche à **réinitialiser la base** (perte de données).

**Règle** : pour synchroniser un changement de schéma, utiliser **`npx prisma db push`** (additif, ne reset jamais, refuse tout `DROP` sans `--accept-data-loss`) — en local **et** en production.

```bash
# Appliquer les changements de schéma (local ou prod)
npx prisma db push
```

---

## Récapitulatif des fichiers

**Créés**
- `app/superadmin/login/page.tsx`
- `app/superadmin/(protected)/{layout,page}.tsx`, `.../utilisateurs/page.tsx`, `.../revenus/page.tsx`
- `components/superadmin/{superadmin-nav,signups-chart,superadmin-user-menu,create-user-dialog,user-detail-sheet}.tsx`
- `lib/superadmin.ts`, `lib/actions/superadminAuth.ts`, `lib/actions/superadminUsers.ts`
- `scripts/make-superadmin.ts`
- `prisma/migrations/20260702120000_add_super_admin_flag/`, `prisma/migrations/20260702130000_add_two_factor/`

**Modifiés**
- `lib/auth.ts` (plugin `twoFactor`), `lib/auth-client.ts` (plugin `twoFactorClient`)
- `lib/api-auth.ts` (`requireSuperAdminSession` + check 2FA)
- `middleware.ts` (allowlist IP `/superadmin`)
- `prisma/schema.prisma` (`isSuperAdmin`, `twoFactorEnabled`, modèle `TwoFactor`)

**Dépendance ajoutée** : `qrcode.react`
