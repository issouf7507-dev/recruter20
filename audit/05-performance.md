# Partie 5 — Performance

**Priorité : MOYENNE**

---

## 5.1 Requêtes N+1 potentielles

### Problème
Les requêtes Prisma sans `include` ou avec des boucles créent des requêtes N+1 (1 requête pour la liste + N requêtes pour chaque item).

### Vérification
```bash
# Chercher les boucles avec des appels prisma
grep -r "for.*await.*prisma\|\.map.*await.*prisma\|forEach.*prisma" lib/ app/api/ --include="*.ts"

# Chercher les findMany sans include
grep -A 10 "findMany" lib/api/ --include="*.ts" -r | grep -v "include"
```

### Exemple de pattern à corriger
```typescript
// Mauvais — N+1
const applications = await prisma.application.findMany();
for (const app of applications) {
  const candidat = await prisma.candidat.findUnique({ where: { id: app.candidatId } });
}

// Bon — 1 requête
const applications = await prisma.application.findMany({
  include: { candidat: true },
});
```

### Routes à vérifier en priorité
- `GET /api/candidats` — listing avec compétences et expériences
- `GET /api/candidatures` — listing avec profil candidat et offre
- `GET /api/kanban/columns` — colonnes avec toutes leurs cartes
- `GET /api/conversations` — conversations avec messages

---

## 5.2 Pagination manquante sur les endpoints de listing

### Problème
Les routes qui retournent des listes (candidats, offres, candidatures) retournent peut-être tous les résultats sans pagination.

### Vérification
```bash
grep -r "findMany" lib/api/ --include="*.ts" -A 5 | grep -v "take:\|skip:"
```

### Correction
```typescript
// lib/api/candidats/repository.ts
export async function getCandidats(params: {
  page?: number;
  limit?: number;
  filters?: CandidatFilters;
}) {
  const { page = 1, limit = 20, filters } = params;
  const skip = (page - 1) * limit;

  const [candidats, total] = await Promise.all([
    prisma.candidat.findMany({
      where: buildFilters(filters),
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.candidat.count({ where: buildFilters(filters) }),
  ]);

  return {
    data: candidats,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
```

---

## 5.3 Bundle JavaScript trop lourd

### Problème
Le projet utilise de nombreuses librairies lourdes :
- Framer Motion v12 (~150 KB)
- Recharts v2 (~200 KB)
- Tiptap v3 (~300 KB)
- Socket.io client (~70 KB)
- @dnd-kit (~50 KB)

Ces librairies sont probablement chargées sur toutes les pages.

### Vérification
```bash
# Analyser le bundle
npm run build 2>&1 | grep "Route\|First Load JS"
```

### Corrections

**1. Lazy loading des composants lourds :**
```typescript
// Avant
import { Editor } from "@/components/Editor";

// Après — chargé uniquement quand affiché
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });
const KanbanBoard = dynamic(() => import("@/components/KanbanBoard"), { ssr: false });
const Charts = dynamic(() => import("@/components/Charts"), { ssr: false });
```

**2. Socket.io — connexion conditionnelle :**
```typescript
// Connecter le socket uniquement sur les pages qui en ont besoin (messagerie, kanban)
// Pas sur la landing page ou la page des offres publiques
```

**3. Recharts — importer uniquement les composants utilisés :**
```typescript
// Avant
import { LineChart, BarChart, PieChart, ... } from "recharts";

// Après
import { LineChart, Line, XAxis, YAxis } from "recharts";
```

---

## 5.4 Images non optimisées

### Problème
Si des balises `<img>` sont utilisées au lieu de `<Image>` de Next.js, les images ne sont pas optimisées (pas de compression, pas de lazy loading automatique).

### Vérification
```bash
grep -r "<img " app/ --include="*.tsx" | grep -v "next/image"
```

### Correction
```typescript
// Avant
<img src="/img/hero.png" alt="Hero" />

// Après
import Image from "next/image";
<Image src="/img/hero.png" alt="Hero" width={800} height={600} priority />
```

---

## 5.5 Absence de cache sur les données statiques

### Problème
Les données peu changeantes (offres publiques, statistiques) sont rechargées à chaque requête.

### Correction avec Next.js App Router

```typescript
// Pour les données qui changent peu (offres publiques)
// app/(public)/offres/page.tsx
export const revalidate = 60; // Revalider toutes les 60 secondes

// Pour les données vraiment statiques
export const revalidate = 3600; // 1 heure
```

Pour les Server Components avec fetch :
```typescript
const offres = await fetch("/api/offres", {
  next: { revalidate: 60 },
});
```

---

## 5.6 Socket.io — connexions non nettoyées

### Problème
Si le hook `useSocket` ne déconnecte pas proprement le client lors du démontage du composant, des connexions zombies s'accumulent.

### Vérification
```bash
cat lib/hooks/use-socket.ts
```

### Correction attendue
```typescript
// lib/hooks/use-socket.ts
useEffect(() => {
  const socket = connectSocket();
  return () => {
    socket.disconnect(); // OBLIGATOIRE dans le cleanup
  };
}, []);
```

---

## Checklist de validation

- [x] Audit N+1 : aucun pattern N+1 détecté dans les routes de prod — repositories utilisent `include`
- [x] Pagination : candidats ✅, offres ✅ — conversations/alertes/documents non paginés (par design, volumes faibles)
- [ ] Build analysé — lancer `npm run build` pour vérifier les tailles de bundle
- [x] RichTextEditor (Tiptap) en `dynamic({ ssr: false })` sur offres/page.tsx et offres/creer/page.tsx
- [x] Recharts dans dashboard : déjà client-side, code splitting non applicable directement (refactoring DashboardChart.tsx recommandé)
- [x] `<img>` → `<Image>` : FAQSection, MissionSection, TestimonialsColumns corrigés + `remotePatterns` configurés dans next.config.ts — 11 balises restantes dans pages recruteur (logos utilisateurs, EdgeStore)
- [x] `revalidate = 60` ajouté sur `GET /api/offres`
- [x] Socket cleanup : `disconnectSocket()` appelé dans le cleanup du useEffect principal
