# Partie 4 — Base de données (Prisma)

**Priorité : MOYENNE**

---

## 4.1 Migration supprimée dans Git

### Problème
Le `git status` montre une migration supprimée :
```
D prisma/migrations/20251227133759/migration.sql
```

Une migration supprimée dans Git mais appliquée en base de données crée une incohérence dangereuse.

### Vérification
```bash
# Voir l'état actuel des migrations Prisma
npx prisma migrate status

# Voir ce que contenait la migration supprimée
git show HEAD~5:prisma/migrations/20251227133759/migration.sql
```

### Correction
- Si la migration a déjà été appliquée en production : la recréer avec `prisma migrate resolve`
- Si elle n'a jamais été appliquée : vérifier que le schéma actuel est cohérent
- Ne jamais supprimer une migration déjà appliquée — toujours créer une nouvelle migration pour annuler

---

## 4.2 Deux migrations non committées

### Problème
Deux nouvelles migrations sont en attente dans Git :
```
?? prisma/migrations/20260503084226_init/
?? prisma/migrations/20260503140444_add_abonnements/
```

Ces migrations ne sont pas encore committées, ce qui signifie qu'elles ne peuvent pas être appliquées sur d'autres environnements.

### Correction
```bash
# Vérifier le contenu des migrations
cat prisma/migrations/20260503084226_init/migration.sql
cat prisma/migrations/20260503140444_add_abonnements/migration.sql

# Tester localement
npx prisma migrate deploy

# Committer
git add prisma/migrations/
git commit -m "feat(db): add abonnements migration"
```

---

## 4.3 Absence de soft delete

### Problème
Le schéma utilise des suppressions en cascade (`onDelete: Cascade`) sans soft delete. Si un Recruteur est supprimé, toutes ses offres, candidatures, et messages sont supprimés définitivement.

### Exemple dans le schéma
```prisma
model JobOffer {
  recruteur   Recruteur @relation(fields: [recruteurId], references: [id], onDelete: Cascade)
}
```

### Correction recommandée
Pour les entités critiques, ajouter un champ `deletedAt` :
```prisma
model JobOffer {
  // ...
  deletedAt   DateTime?  // null = actif, date = supprimé
}
```

Et filtrer dans les requêtes :
```typescript
// lib/api/offres/repository.ts
const offres = await prisma.jobOffer.findMany({
  where: { deletedAt: null },
});
```

---

## 4.4 Index manquants sur les requêtes fréquentes

### Vérification
```bash
# Quelles colonnes sont souvent filtrées ?
grep -r "where:" lib/api/ --include="*.ts" -A 5
```

### Index à vérifier dans `schema.prisma`

**Candidats :**
- `Candidat.ville` — souvent filtré par localisation
- `Candidat.disponibilite` — filtré dans la recherche
- `Candidat.niveauExperience` — filtré dans matching

**JobOffer :**
- Déjà indexé sur `(recruteurId, statut)`, `location`, `createdAt` ✅
- Vérifier si `(statut, createdAt)` est utile pour la page publique des offres

**Application :**
- `Application.status` — filtré dans le Kanban
- `(candidatId, jobOfferId)` — pour vérifier les candidatures en double

### Exemple d'ajout d'index
```prisma
model Application {
  // ...
  @@index([candidatId, jobOfferId])
  @@index([status])
}
```

---

## 4.5 Champs JSON non typés

### Problème
Certains champs utilisent le type `String` pour stocker du JSON ou des tableaux :
```prisma
// Exemple de pattern à éviter
competences  String?   // stocke "[\"React\", \"Node.js\"]"
```

### Correction
Utiliser les relations Prisma ou le type `Json` natif :
```prisma
// Option 1 — Relation (meilleure intégrité)
model Candidat {
  competences  CandidatCompetence[]
}

// Option 2 — Type Json (pour les données non structurées)
model Candidat {
  preferences  Json?
}
```

---

## 4.6 Gestion des dates invalides

### Problème
Le script `scripts/cleanInvalidDates.ts` existe, ce qui indique qu'il y a des données avec des dates invalides en base.

### Vérification
```bash
# Voir ce que le script fait
cat scripts/cleanInvalidDates.ts
```

### Correction
1. Exécuter le script pour nettoyer les données existantes
2. Ajouter une validation Zod au niveau des routes API pour les dates
3. Ajouter des contraintes `@db.Date` ou `@db.DateTime` dans le schéma Prisma

---

## 4.7 Seed de production

### Problème
Le script `prisma/seeds/seed-offres.ts` existe pour peupler la base de données, mais il n'est pas clair si ce seed est safe à exécuter en production (risque d'écraser des données réelles).

### Correction
Ajouter une garde :
```typescript
// prisma/seeds/seed-offres.ts
if (process.env.NODE_ENV === "production") {
  console.error("Ne jamais exécuter le seed en production !");
  process.exit(1);
}
```

---

## Checklist de validation

- [x] Migration `20251227133759` : git propre, situation résolue
- [x] Migrations `20260503*` déjà committées
- [x] Soft delete déjà présent sur `JobOffer.deletedAt` et `Application.deletedAt`
- [x] Index ajoutés : `Application.@@index([status])`, `Application.@@index([candidatId, jobOfferId])`, `Candidat.@@index([ville])`, `Candidat.@@index([domaine])` — ⚠️ lancer `npx prisma migrate dev --name add_missing_indexes`
- [x] `BackupUser.userData String @db.Text` — acceptable (modèle migration temporaire)
- [x] Guard `NODE_ENV` ajouté dans `cleanInvalidDates.ts` + `any` corrigé en `Prisma.ExperienceUpdateInput`
- [x] Guard `NODE_ENV === "production"` ajouté dans `seed-offres.ts`
