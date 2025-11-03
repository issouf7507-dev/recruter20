# 🔧 Instructions pour appliquer les changements

## Changements effectués

✅ Schéma Prisma modifié :
- Suppression de `columnId` (obligatoire)
- Suppression de la relation `column`
- Ajout du champ `status` avec enum `ApplicationStatus`
- Statut par défaut : `EN_ATTENTE`

✅ Code mis à jour :
- `lib/api/candidatures/repository.ts` ✅
- `lib/api/candidatures/service.ts` ✅
- `lib/api/candidatures/types.ts` ✅
- `app/components/publicc/candidat-sections/CandidaturesSection.tsx` ✅

## 🚀 Pour appliquer ces changements

Exécutez cette commande dans votre terminal :

```bash
npx prisma db push
```

Cela va :
1. Supprimer le champ `columnId` de la table `Application`
2. Supprimer la contrainte de clé étrangère vers `KanbanColumn`
3. Ajouter le champ `status` avec enum
4. Régénérer le client Prisma

## ⚠️ Impact

- Les colonnes Kanban existantes ne seront pas supprimées (au cas où)
- Les applications existantes auront `status = EN_ATTENTE` par défaut
- La postulation fonctionnera immédiatement sans colonnes Kanban

## 📝 Nouveau workflow

**Avant (avec Kanban) :**
```
Postulation → Chercher colonne par défaut → Créer avec columnId
```

**Maintenant (sans Kanban) :**
```
Postulation → Créer avec status = EN_ATTENTE
```

Plus simple, plus direct ! ✅

