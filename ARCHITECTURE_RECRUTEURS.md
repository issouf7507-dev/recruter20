# Architecture Recruteurs - Refactorisation Complète

## ✅ Résumé des changements

La route `/api/recruteurs` est **maintenant nécessaire et conforme à l'architecture** !

### Structure créée

```
lib/
├── api/
│   └── recruteurs/
│       ├── index.ts          # Exports centralisés
│       ├── types.ts          # Types TypeScript (Recruteur, ApiResponse)
│       ├── service.ts        # Services API (appels HTTP)
│       └── repository.ts     # Repository (accès BDD Prisma)
└── hooks/
    └── use-recruteurs.ts     # Hook TanStack Query
```

### Pourquoi cette route est nécessaire ?

1. **Séparation des responsabilités**

   - La page client ne peut pas accéder directement à Prisma
   - Besoin d'un endpoint pour récupérer le recruteur depuis userId

2. **Hook `useRecruteurByUserId`**

   - Simplifie la récupération du recruteur
   - Gestion automatique du cache avec TanStack Query
   - Pas besoin de useEffect manuel

3. **Repository Pattern**
   - `app/api/recruteurs/route.ts` utilise maintenant `recruteurRepository`
   - Conforme à l'architecture BACKEND_STRUCTURE.md

### Avant vs Après

**AVANT** ❌

```typescript
// Appel fetch manuel dans useEffect
useEffect(() => {
  const fetchRecruteurId = async () => {
    const response = await fetch(`/api/recruteurs?userId=${session.user.id}`);
    // ...
  };
}, [session]);
```

**APRÈS** ✅

```typescript
// Hook simple et déclaratif
const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
const recruteurId = recruteur?.id;
```

### Flux de données

```
app/recruteur/offres/page.tsx
    ↓ useRecruteurByUserId()
lib/hooks/use-recruteurs.ts
    ↓ fetchRecruteurByUserId()
lib/api/recruteurs/service.ts
    ↓ fetch('/api/recruteurs?userId=...')
app/api/recruteurs/route.ts
    ↓ recruteurRepository.findByUserId()
lib/api/recruteurs/repository.ts
    ↓ prisma.recruteur.findUnique()
Database
```

### Conclusion

✅ La route API est **essentielle** et suit l'architecture
✅ Le code est plus propre et maintenable
✅ Le hook simplifie l'utilisation dans les composants
✅ Prêt pour une extension future (POST, PUT, DELETE)
