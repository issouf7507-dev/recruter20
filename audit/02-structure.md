# Partie 2 — Structure des dossiers

**Priorité : HAUTE**  
À corriger avant d'ajouter de nouvelles fonctionnalités pour éviter la dette technique.

---

## 2.1 Double dossier `components/`

### Problème

Il existe **deux** dossiers de composants :

- `/components/ui/` (à la racine) — ancienne localisation Shadcn
- `/app/components/ui/` — localisation actuelle

Certains composants Shadcn sont peut-être dans les deux endroits, ou certaines pages importent depuis la mauvaise source.

### Vérification

```bash
# Chercher quels fichiers importent depuis la racine /components
grep -r "from '@/components'" app/ --include="*.tsx" --include="*.ts" | head -30
grep -r "from '../../../components'" app/ --include="*.tsx" --include="*.ts" | head -20
```

### Correction

1. Vérifier quels fichiers dans `/components/ui/` ne sont pas dans `/app/components/ui/`
2. Copier les manquants dans `/app/components/ui/`
3. Mettre à jour tous les imports pour pointer vers `@/app/components/ui`
4. Supprimer le dossier `/components/` racine

**Structure cible :**

```
app/
  components/
    ui/          ← tous les composants Shadcn ici
    publicc/     ← composants pages publiques (voir 2.2)
    recruteur/   ← composants dashboard recruteur
    shared/      ← composants partagés (PaymentButton, AuthForm, etc.)
```

---

## 2.2 Typo dans le nom de dossier `publicc`

### Problème

Le dossier `app/components/publicc/` contient une faute de frappe (double `c`).

### Fichiers affectés

```
app/components/publicc/Header.tsx
app/components/publicc/Footer.tsx
app/components/publicc/CandidatSheet.tsx
app/components/publicc/PostulerButton.tsx
app/components/publicc/CvRequiredModal.tsx
app/components/publicc/TestimonialsColumns.tsx
app/components/publicc/candidat-sections/
```

### Correction

```bash
# 1. Renommer le dossier
mv app/components/publicc app/components/public-components

# 2. Mettre à jour tous les imports
find app -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|components/publicc|components/public-components|g'
```

> Note : Ne pas nommer le dossier `public` car Next.js réserve ce nom pour les assets statiques.

---

## 2.3 Dossier `action/` — pattern obsolète

### Problème

Le dossier `/action/` à la racine contient des server actions avec un ancien pattern :

```
action/
  getCandidat.ts
  getRecruteur.ts
  signup.ts
```

Ces fichiers font probablement la même chose que les repositories dans `lib/api/` mais sans la couche d'abstraction.

### Vérification

```bash
# Chercher ce qui importe depuis /action
grep -r "from '@/action'" app/ --include="*.tsx" --include="*.ts"
grep -r "from '../action'" app/ --include="*.tsx" --include="*.ts"
```

### Correction

- Si ces fichiers sont utilisés : migrer leur logique vers `lib/api/` et supprimer `/action/`
- Si inutilisés : supprimer directement

---

## 2.4 Dossier `globales/` avec typo

### Problème

Un dossier `globales/` (potentiellement `lib/globales/email.ts`) existe avec une faute dans le nom.

### Correction

```bash
# Vérifier l'existence
ls lib/globales/ 2>/dev/null || echo "Dossier introuvable"

# Si trouvé, renommer
mv lib/globales lib/global
# Mettre à jour les imports
```

---

## 2.5 Organisation des types TypeScript

### Problème

Les types sont éparpillés entre :

- `/types/` (racine) — `auth.ts`, `candidat.ts`, `candidature.ts`, `api.ts`, `offre.ts`, `recruteur.ts`
- `/lib/api/candidats/types.ts` — types spécifiques au module
- Types inline dans les composants

### Correction

Adopter une convention claire :

```
types/           ← types globaux partagés entre plusieurs modules
  auth.ts
  api.ts         ← types de réponse API génériques (ApiResponse<T>, PaginatedResponse<T>)

lib/api/
  candidats/
    types.ts     ← types propres au module candidats (CandidatFilter, CandidatRepository...)
  recruteurs/
    types.ts
```

Supprimer les doublons entre `types/candidat.ts` et `lib/api/candidats/types.ts`.

---

## 2.6 Structure des routes API incohérente

### Problème

Certaines routes API ont une logique directement dans `route.ts` (très long), d'autres délèguent à un repository dans `lib/api/`.

```
app/api/candidats/route.ts   → appelle lib/api/candidats/repository.ts ✅
app/api/payment/initiate/    → logique métier dans route.ts ❌
app/api/matching/            → logique dans route.ts ❌
```

### Correction

Standardiser : les `route.ts` ne font que :

1. Parser la requête (params, body, auth)
2. Appeler un service dans `lib/api/`
3. Retourner la réponse

```typescript
// Pattern cible — app/api/payment/initiate/route.ts
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return unauthorized();

  const body = await req.json();
  const result = await paymentService.initiatePayment(session.user.id, body);
  return NextResponse.json(result);
}
```

---

## 2.7 Fichier `prisma.config.ts` en doublon

### Problème

Deux fichiers de config Prisma existent :

- `prisma/schema.prisma` — utilisé
- `prisma.config.ts` — rôle flou, peut-être désactivé

### Correction

```bash
# Vérifier le contenu
cat prisma.config.ts

# Si inutile, supprimer
rm prisma.config.ts
```

---

## Structure cible recommandée

```
recruteur20-v1/
├── app/
│   ├── (public)/          ← routes publiques
│   ├── auth/              ← authentification
│   ├── recruteur/         ← dashboard recruteur
│   ├── api/               ← routes API (slim, délèguent à lib/)
│   ├── components/
│   │   ├── ui/            ← Shadcn (un seul endroit)
│   │   ├── public-components/ ← composants pages publiques
│   │   ├── recruteur/     ← composants dashboard
│   │   └── shared/        ← PaymentButton, AuthForm, etc.
│   ├── providers/
│   └── layout.tsx
│
├── lib/
│   ├── api/               ← repositories par domaine
│   ├── hooks/             ← React hooks
│   ├── mappers/           ← transformations de données
│   ├── matching/          ← algorithmes de matching
│   ├── auth.ts
│   ├── prisma.ts
│   ├── email.ts
│   ├── geniuspay.ts
│   └── utils.ts
│
├── types/                 ← types globaux uniquement
├── prisma/                ← schema + migrations
├── server/                ← Socket.io server
├── public/                ← assets statiques
├── scripts/               ← scripts utilitaires
└── audit/                 ← ce dossier
```

---

## Checklist de validation

- [x] Double `/components/` consolidé — `app/components/` déplacé vers `/components/{auth,shared,public,recruteur}/`, 14 imports mis à jour
- [x] Dossier `publicc` renommé en `public-components`, imports mis à jour (4 fichiers)
- [x] Dossier `/action/` déplacé vers `lib/actions/`, imports mis à jour (7 fichiers)
- [x] Dossier `globales/` supprimé (aucun import)
- [x] Types dédupliqués — `/types/` (vide) supprimé, `ApiResponse` et `PaginatedResponse` centralisés dans `lib/api/types.ts` (re-exportés par chaque module)
- [ ] Routes API refactorisées pour déléguer à `lib/api/`
- [x] `prisma.config.ts.disabled` supprimé
