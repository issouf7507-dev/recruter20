# Partie 3 — Qualité du code

**Priorité : HAUTE**

---

## 3.1 Gestion d'erreurs absente dans les routes API

### Problème
La plupart des routes API retournent des erreurs génériques sans contexte :
```typescript
// Pattern actuel (mauvais)
} catch (error) {
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}
```

Si une erreur arrive en production, il est impossible de déboguer sans logs.

### Correction
Créer un wrapper de gestion d'erreurs centralisé :

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

export function notFound(resource: string) {
  return NextResponse.json({ error: `${resource} introuvable` }, { status: 404 });
}

export function withErrorHandler(
  handler: (req: Request, ctx: unknown) => Promise<Response>
) {
  return async (req: Request, ctx: unknown) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }
      console.error("[API Error]", error);
      return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
  };
}
```

Utilisation :
```typescript
// app/api/candidats/route.ts
export const GET = withErrorHandler(async (req) => {
  // logique...
});
```

---

## 3.2 Vérification d'authentification répétée dans chaque route

### Problème
Chaque route API duplique la vérification d'authentification :
```typescript
// Répété dans CHAQUE route
const session = await auth.api.getSession({ headers: req.headers });
if (!session?.user) {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}
```

### Correction
Créer des helpers réutilisables :

```typescript
// lib/api-auth.ts
import { auth } from "@/lib/auth";
import { ApiError } from "./api-error";

export async function requireSession(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) throw new ApiError(401, "Non autorisé");
  return session;
}

export async function requireRecruteur(req: Request) {
  const session = await requireSession(req);
  if (session.user.role !== "RECRUTEUR") throw new ApiError(403, "Accès refusé");
  return session;
}

export async function requireCandidat(req: Request) {
  const session = await requireSession(req);
  if (session.user.role !== "CANDIDAT") throw new ApiError(403, "Accès refusé");
  return session;
}
```

---

## 3.3 Page d'accueil de 972 lignes

### Problème
`app/(public)/page.tsx` fait 972 lignes — trop long pour être maintenable.

### Correction
Décomposer en sections :

```
app/(public)/
  page.tsx              ← 50 lignes max, assemble les sections
  _sections/
    HeroSection.tsx
    FeaturesSection.tsx
    TestimonialsSection.tsx
    PricingSection.tsx
    CTASection.tsx
    StatsSection.tsx
```

```typescript
// app/(public)/page.tsx — après refactoring
import { HeroSection } from "./_sections/HeroSection";
import { FeaturesSection } from "./_sections/FeaturesSection";
// ...

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </main>
  );
}
```

---

## 3.4 Composants trop couplés au fetching de données

### Problème
Certains composants font leurs propres appels API directement dans le composant, sans passer par les hooks `lib/hooks/`.

### Correction
Toujours séparer la donnée de l'affichage :
```typescript
// Mauvais — fetch dans le composant
function CandidatSheet({ id }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`/api/candidats/${id}`).then(...);
  }, [id]);
}

// Bon — hook dédié
function CandidatSheet({ id }) {
  const { data, isLoading } = useCandidat(id); // lib/hooks/use-candidats.ts
}
```

Vérifier tous les composants dans `app/components/publicc/` pour ce pattern.

---

## 3.5 Types `any` implicites

### Problème
L'utilisation de `any` implicite (ou explicite) désactive la sécurité TypeScript.

### Vérification
```bash
# Chercher les any implicites
grep -r ": any" app/ lib/ --include="*.ts" --include="*.tsx"
grep -r "as any" app/ lib/ --include="*.ts" --include="*.tsx"
```

### Correction
Remplacer `any` par des types précis. Pour les cas difficiles, utiliser `unknown` avec une type guard :
```typescript
// Au lieu de
function process(data: any) { ... }

// Utiliser
function process(data: unknown) {
  if (!isCandidatData(data)) throw new Error("Invalid data");
  // data est maintenant typé
}
```

---

## 3.6 Variables d'environnement non validées au démarrage

### Problème
Si une variable d'environnement est manquante, l'erreur apparaît tardivement (au moment de l'appel, pas au démarrage).

### Correction
Créer un fichier de validation des env :

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().startsWith("re_"),
  GENIUSPAY_API_KEY: z.string(),
  GENIUSPAY_API_SECRET: z.string(),
  GENIUSPAY_WEBHOOK_SECRET: z.string(),
  EDGE_STORE_ACCESS_KEY: z.string(),
  EDGE_STORE_SECRET_KEY: z.string(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

Importer `env` depuis `lib/env.ts` au lieu de `process.env` directement.

---

## 3.7 Duplication dans les appels Prisma

### Problème
Des requêtes Prisma similaires sont répétées dans plusieurs endroits (routes API + repositories).

### Vérification
```bash
# Chercher les prisma. directement dans les routes API
grep -r "prisma\." app/api/ --include="*.ts" -l
```

### Correction
**Règle :** `prisma.` ne doit apparaître que dans `lib/api/*/repository.ts`. Les routes API ne touchent jamais Prisma directement.

---

## 3.8 Imports non optimisés (barrel exports)

### Problème
Les imports peuvent créer des bundles plus lourds si des barrel files (`index.ts`) réexportent tout sans tree-shaking.

### Vérification
Chercher les patterns `import * from` ou des `index.ts` qui réexportent tout :
```bash
grep -r "export \* from" lib/ app/ --include="*.ts"
```

### Correction
Préférer les imports directs :
```typescript
// Éviter
import { tout } from "@/lib/api/candidats";

// Préférer
import { getCandidatById } from "@/lib/api/candidats/repository";
```

---

## Checklist de validation

- [ ] Wrapper `withErrorHandler` créé dans `lib/api-error.ts`
- [ ] Helpers `requireSession`, `requireRecruteur` créés
- [ ] Au moins 5 routes API migrées vers le nouveau pattern
- [ ] `app/(public)/page.tsx` découpé en sections
- [ ] Zéro `fetch()` direct dans les composants — tout passe par les hooks
- [ ] Fichier `lib/env.ts` de validation des variables d'environnement créé
- [ ] Prisma banni des routes API (uniquement dans les repositories)
- [ ] Audit des `any` fait, les plus critiques corrigés
