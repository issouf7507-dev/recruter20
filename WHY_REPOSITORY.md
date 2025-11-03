# 📚 Pourquoi le Repository est essentiel ?

## 🎯 Rôle du Repository

Le **Repository** (`lib/api/offres/repository.ts`) centralise **TOUTES** les opérations de base de données pour les offres d'emploi.

## ✅ Avantages

### 1️⃣ **Code Réutilisable**

**SANS Repository** ❌

```typescript
// Dans chaque route API, on répète le code
app/api/offres/route.ts:
  const offers = await prisma.jobOffer.findMany({ where: { deletedAt: null } })

app/api/offres/[id]/route.ts:
  const offer = await prisma.jobOffer.findUnique({ where: { id } })

app/api/offres/[id]/candidatures/route.ts:
  const offers = await prisma.jobOffer.findMany({ where: { recruteurId } })
```

**AVEC Repository** ✅

```typescript
// Une seule ligne partout !
const offers = await jobOfferRepository.findAll({ recruteurId });
const offer = await jobOfferRepository.findById(id);
```

### 2️⃣ **Logique Centralisée**

```typescript
// Dans repository.ts - UNE SEULE FOIS
async findAll(params) {
  const where = { deletedAt: null }  // ← Toujours exclure les supprimés

  if (recruteurId) {
    where.recruteurId = recruteurId
  }

  return prisma.jobOffer.findMany({ where, ... })
}
```

✅ Tout le code respecte automatiquement les règles métier
✅ Impossible d'oublier de filtrer les supprimés
✅ Cohérence garantie dans toute l'application

### 3️⃣ **Facilité de Maintenance**

**Scénario**: Changer le nom du champ `etat` → `status`

**SANS Repository** ❌

```typescript
// Changer dans 20+ fichiers !
app/api/offres/route.ts: etat → status
app/api/offres/[id]/route.ts: etat → status
app/api/offres/[id]/candidatures/route.ts: etat → status
// ... encore 17 fichiers !
```

**AVEC Repository** ✅

```typescript
// Changer UNE SEULE FOIS !
repository.ts: etat → status
```

### 4️⃣ **Tests Plus Faciles**

```typescript
// Mock le repository pour les tests
const mockRepository = {
  findAll: jest.fn(() => Promise.resolve({ items: [], pagination: {} })),
  findById: jest.fn(() => Promise.resolve({ id: "1", title: "Test" })),
};

// Testez sans base de données réelle !
```

### 5️⃣ **Changement de Backend**

Si un jour on veut passer de Prisma à un autre ORM :

**SANS Repository** ❌

```typescript
// Devoir changer dans TOUT le codebase
app/api/offres/route.ts: prisma.jobOffer → otherDB.jobOffer
app/api/offres/[id]/route.ts: prisma.jobOffer → otherDB.jobOffer
// ... 18 autres fichiers à changer
```

**AVEC Repository** ✅

```typescript
// Changer UNIQUEMENT repository.ts !
// Tous les appels restent identiques : jobOfferRepository.findAll()
```

## 📊 Architecture Complète

```
┌─────────────────────────────────────────────┐
│  Pages & Components                         │
│  app/recruteur/offres/page.tsx             │
└───────────────┬─────────────────────────────┘
                │
                ↓ useOffers()
┌─────────────────────────────────────────────┐
│  Hooks                                      │
│  lib/hooks/use-offers.ts                    │
│  (Logique React Query)                      │
└───────────────┬─────────────────────────────┘
                │
                ↓ fetch('/api/offres')
┌─────────────────────────────────────────────┐
│  API Routes                                 │
│  app/api/offres/route.ts                    │
│  → jobOfferRepository.findAll()  ← ICI !  │
└───────────────┬─────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────┐
│  Repository                                 │
│  lib/api/offres/repository.ts               │
│  → prisma.jobOffer.findMany()              │
└───────────────┬─────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────┐
│  Database                                   │
│  MySQL (via Prisma)                         │
└─────────────────────────────────────────────┘
```

## 🔄 Exemple Concret

### Requête: "Récupérer les offres d'un recruteur"

**AVANT (sans repository)**:

```typescript
// Dans chaque fichier
const offers = await prisma.jobOffer.findMany({
  where: {
    recruteurId: "xxx",
    deletedAt: null,
    etat: "active",
  },
  include: { recruteur: true, _count: { applications: true } },
});
```

**APRÈS (avec repository)**:

```typescript
// Une ligne partout !
const { items } = await jobOfferRepository.findAll({ recruteurId: "xxx" });
```

## 🎯 Résumé

Le **Repository** est essentiel car il :

1. ✅ **Centralise** toute la logique de base de données
2. ✅ **Réutilise** le code dans toute l'application
3. ✅ **Facilite** la maintenance et les tests
4. ✅ **Permet** de changer de backend facilement
5. ✅ **Garantit** la cohérence des requêtes

**C'est un pattern architectural essentiel !**



