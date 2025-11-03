# �� Améliorations Détaillées du Schema Prisma

Ce document explique en détail chaque problème identifié et propose des solutions complètes avec des exemples de code.

---

## 1. 🚨 CRITIQUE : Supprimer les duplications Custom

### ❌ Le problème actuel

Vous avez actuellement des tables doublons :

```prisma
// Deux systèmes parallèles pour le même besoin
Application + ApplicationCustom
KanbanColumn + KanbanColumnCustom
Collaborateur + CollaborateurCustom
ApplicationFile + ApplicationFileCustom
ApplicationNote + ApplicationNoteCustom
ChecklistItem + ChecklistItemCustom
```

**Problèmes causés :**

- 💾 **Double consommation mémoire** : Chaque table double prend de l'espace
- 🐛 **Complexité de maintenance** : Bug à corriger ? Faut le faire 2x
- 🔍 **Requêtes plus lentes** : JOIN complexes ou recherche dans 2 tables
- 📊 **Données incohérentes** : Difficile de savoir quelle table utiliser

**Exemple concret :**

```typescript
// ❌ Dans votre code, vous devez faire ceci :
const apps = await prisma.application.findMany(); // Table 1
const customApps = await prisma.applicationCustom.findMany(); // Table 2
// Puis merger les 2 résultats... 😓

// ✅ Vous voudriez faire ceci :
const apps = await prisma.application.findMany({
  where: { source: "custom" }, // Ou null pour standard
});
```

### ✅ La solution recommandée

**Option 1 : Fusionner les tables (recommandé)**

```prisma
model Application {
  id            String   @id @default(cuid())
  title         String
  description   String

  // ✅ Ajouter ce champ pour distinguer l'origine
  source        String?  @default("standard") // "standard" ou "custom"

  // ✅ Garder la même structure pour les deux
  jobOfferId    String?  // Null si source = "custom"
  columnId      String   // Toujours présent

  // Relations
  candidate     Candidate?
  kanbanColumn  KanbanColumn
  notes         ApplicationNote[]
  files         ApplicationFile[]
  checklist     ChecklistItem[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([source, jobOfferId])
}
```

**Pourquoi ça marche mieux ?**

- ✅ Une seule requête au lieu de deux
- ✅ Cohérence garantie
- ✅ Code plus simple
- ✅ Moins de risque d'oubli

**Exemple d'utilisation :**

```typescript
// Récupérer les applications custom uniquement
const customApps = await prisma.application.findMany({
  where: { source: "custom" },
});

// Récupérer les applications standard d'une offre spécifique
const standardApps = await prisma.application.findMany({
  where: {
    source: "standard",
    jobOfferId: "offer-123",
  },
});
```

**Migration à prévoir :**

```sql
-- Étape 1 : Ajouter la colonne source
ALTER TABLE Application ADD COLUMN source VARCHAR(50) DEFAULT 'standard';

-- Étape 2 : Migrer les données de ApplicationCustom vers Application
INSERT INTO Application (id, title, description, ..., source)
SELECT id, title, description, ..., 'custom'
FROM ApplicationCustom;

-- Étape 3 : Supprimer les tables doublons
DROP TABLE ApplicationCustom;
DROP TABLE KanbanColumnCustom;
-- etc.
```

---

## 2. 🚨 CRITIQUE : Corriger les inconsistances de types

### ❌ Le problème

Votre schema a des incohérences de types qui vont causer des erreurs :

```prisma
// ✅ JobOffer utilise String
model JobOffer {
  id          String   @id @default(cuid())
  recruteurId String
  // ...
}

// ❌ Mais KanbanColumnCustom utilise Int
model KanbanColumnCustom {
  id          String   @id @default(cuid())
  jobOfferId  Int      // ❌ ERREUR ! JobOffer.id est String !
  // ...
}
```

**Conséquences :**

- 💥 **Impossible de créer une clé étrangère valide**
- 🐛 **Erreurs au runtime** lors des JOIN
- 📊 **Données perdues** si Prisma tente de convertir

### ✅ La correction

```prisma
model KanbanColumnCustom {
  id          String   @id @default(cuid())
  jobOfferId  String   // ✅ Corrigé pour matcher JobOffer.id
  color       String
  name        String
  order       Int
  isDefault   Boolean  @default(false)

  // Relation correcte maintenant
  jobOffer    JobOffer?  @relation(fields: [jobOfferId], references: [id])

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

**Migration SQL :**

```sql
-- Si vous avez déjà des données avec jobOfferId en Int
-- Il faudra les convertir en String

UPDATE KanbanColumnCustom
SET jobOfferId = CAST(jobOfferId AS CHAR)
WHERE jobOfferId IS NOT NULL;

-- Puis changer le type de la colonne
ALTER TABLE KanbanColumnCustom
MODIFY COLUMN jobOfferId VARCHAR(255);
```

---

## 3. 🚨 CRITIQUE : Supprimer la duplication email

### ❌ Le problème

```prisma
model User {
  id    String  @id
  email String  @unique  // Email ici
  // ...
}

model Candidat {
  id    String  @id
  email String  @unique  // ❌ Duplication !
  // ...
}
```

**Problèmes :**

- 🔄 **Double mise à jour** : Si l'email change, faut mettre à jour 2 tables
- 🐛 **Risque d'incohérence** : User.email = "test@test.com" mais Candidat.email = "old@old.com"
- 📊 **Violation de la normalisation** : Même donnée stockée 2 fois

### ✅ La solution

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique  // ✅ Source unique de vérité
  password  String?
  type      UserType?

  candidat  Candidat?
  recruteur Recruteur?

  // ...
}

model Candidat {
  id        String   @id @default(cuid())
  userId    String   @unique
  // ❌ SUPPRIMER : email String @unique

  // Pour accéder à l'email, utilisez la relation
  // candidat.user.email
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // ...
}
```

**Code TypeScript :**

```typescript
// ❌ Avant (accès direct)
const email = candidat.email;

// ✅ Après (accès via relation)
const candidatWithUser = await prisma.candidat.findUnique({
  where: { id: candidatId },
  include: { user: true },
});
const email = candidatWithUser.user.email;

// Ou encore mieux, créer un helper
async function getCandidatEmail(candidatId: string): Promise<string> {
  const candidat = await prisma.candidat.findUnique({
    where: { id: candidatId },
    select: { user: { select: { email: true } } },
  });
  return candidat.user.email;
}
```

---

## 4. 💡 AMÉLIORATION : Optimiser les recherches avec des index

### ❌ Le problème actuel

Vos requêtes peuvent être lentes :

```typescript
// Requête lente : pas d'index sur ces champs
const offers = await prisma.jobOffer.findMany({
  where: {
    recruteurId: "rec-123",
    etat: "active",
    location: "Paris",
  },
});
// MySQL doit scanner TOUTES les lignes de JobOffer
// ⏱️ Temps: 2-5 secondes avec 10k offres
```

### ✅ La solution : Ajouter des index composites

```prisma
model JobOffer {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  company     String?
  location    String?
  etat        String?  @default("active")
  recruteurId String

  // Relations
  recruteur   Recruteur @relation(fields: [recruteurId])
  applications Application[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // ✅ Index composites pour les requêtes fréquentes
  @@index([recruteurId, etat])           // Récupérer les offres actives d'un recruteur
  @@index([location, etat])              // Filtrer par localisation
  @@index([recruteurId, createdAt])      // Tri chronologique
  @@fulltext([title, description])       // Recherche textuelle
}
```

**Performance avant/après :**

```typescript
// ❌ Avant : 2000ms
const offers = await prisma.jobOffer.findMany({
  where: { recruteurId: "rec-123", etat: "active" },
});

// ✅ Après : 50ms (40x plus rapide !)
// Grâce à l'index @@index([recruteurId, etat])
```

**Exemples d'index utiles :**

```prisma
model Application {
  // ...

  @@index([candidatId, createdAt])       // Candidatures d'un candidat
  @@index([jobOfferId, columnId])       // Candidatures d'une offre dans une colonne
  @@index([candidatId, jobOfferId])     // Vérifier si déjà candidaté
}

model Conversation {
  // ...

  @@index([candidatId, isActive])        // Conversations actives d'un candidat
  @@index([recruteurId, jobOfferId])     // Conversations par offre
}
```

---

## 5. 💡 AMÉLIORATION : Implémenter le Soft Delete

### ❌ Le problème actuel

Quand vous supprimez, c'est définitif :

```typescript
await prisma.jobOffer.delete({
  where: { id: "offer-123" },
});
// 💥 Supprimé pour toujours, impossible de récupérer
```

**Problèmes :**

- 😱 **Accidents irréversibles** : Suppression par erreur
- 📊 **Perte de données** : Impossible d'analyser l'historique
- 🚫 **Pas d'audit trail** : Qui a supprimé quoi et quand ?

### ✅ La solution : Soft Delete

```prisma
model JobOffer {
  id          String    @id @default(cuid())
  title       String
  // ...

  // ✅ Ajouter ce champ
  deletedAt   DateTime? // null = pas supprimé, DateTime = supprimé le...

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // ✅ Filtrer automatiquement les supprimés
  @@index([deletedAt])
  @@index([recruteurId, deletedAt])
}

model Application {
  id          String    @id
  // ...
  deletedAt   DateTime? // Pareil ici

  @@index([deletedAt])
}
```

**Implémentation côté code :**

```typescript
// lib/prisma.ts - Extension pour filtrer automatiquement
import { Prisma } from "@prisma/client";

export function softDeleteExtension() {
  return Prisma.defineExtension({
    name: "soft-delete",
    query: {
      $allModels: {
        async findMany({ args, query }) {
          // Si deletedAt n'est pas dans les where, filtrer automatiquement
          if (!args.where?.deletedAt) {
            args.where = {
              ...args.where,
              deletedAt: null, // Seulement les non-supprimés
            };
          }
          return query(args);
        },

        async delete({ args, query, model }) {
          // Au lieu de supprimer, on met deletedAt
          return prisma[model].update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });
}

// Utilisation
const prismaWithSoftDelete = prisma.$extends(softDeleteExtension());

// ❌ Avant
await prisma.jobOffer.delete({ where: { id: "offer-123" } });

// ✅ Après
await prismaWithSoftDelete.jobOffer.delete({ where: { id: "offer-123" } });
// La ligne n'est pas supprimée, juste marquée
```

**Récupérer les supprimés si besoin :**

```typescript
// Récupérer tous les offres y compris les supprimées
const allOffers = await prisma.jobOffer.findMany({
  where: { deletedAt: { not: null } },
});

// Restaurer une offre supprimée
await prisma.jobOffer.update({
  where: { id: "offer-123" },
  data: { deletedAt: null },
});
```

---

## 6. 💡 AMÉLIORATION : Système de notifications flexible

### ❌ Problème actuel

```prisma
model Notification {
  id         String   @id
  titre      String
  message    String
  type       String   // ❌ Pas typé, peut être n'importe quoi
  lu         Boolean  @default(false)
  candidatId String   // ❌ Seulement pour les candidats
  offreId    Int?     // ❌ Pas tous les types ont besoin d'une offre
  // ❌ Impossible d'envoyer une notification à un recruteur
}
```

### ✅ Solution améliorée

```prisma
model Notification {
  id              String            @id @default(cuid())

  // ✅ Système flexible : peut notifier n'importe quel user
  recipientId     String            // ID du User qui reçoit
  recipientType   UserType          // CANDIDAT | RECRUTEUR | COLLABORATEUR

  // ✅ Type sécurisé avec un enum
  type            NotificationType

  // ✅ Données flexibles selon le type
  data            Json?             // Contient les infos spécifiques

  read            Boolean           @default(false)
  readAt          DateTime?

  createdAt       DateTime          @default(now())

  recipient       User              @relation(fields: [recipientId], references: [id])

  @@index([recipientId, recipientType, read])
  @@index([createdAt])
}

enum NotificationType {
  // Candidatures
  APPLICATION_NEW
  APPLICATION_STATUS_CHANGED
  APPLICATION_MESSAGE

  // Messages
  CONVERSATION_NEW_MESSAGE

  // Offres
  OFFER_PUBLISHED
  OFFER_CLOSED

  // Entretiens
  INTERVIEW_SCHEDULED
  INTERVIEW_REMINDER

  // Alertes
  JOB_ALERT_MATCH
  JOB_ALERT_NEW_MATCHES
}
```

**Exemple d'utilisation :**

```typescript
// Créer une notification
await prisma.notification.create({
  data: {
    recipientId: "user-123",
    recipientType: "CANDIDAT",
    type: "APPLICATION_NEW",
    data: {
      applicationId: "app-456",
      jobOfferTitle: "Développeur Full Stack",
      company: "Tech Corp",
    },
  },
});

// Récupérer les notifications non lues d'un user
const unreadNotifications = await prisma.notification.findMany({
  where: {
    recipientId: userId,
    read: false,
  },
  orderBy: { createdAt: "desc" },
});
```

---

## 📋 Résumé des priorités

### 🔥 À faire EN PRIORITÉ (semaine 1)

1. **Corriger le type `jobOfferId`** dans KanbanColumnCustom (String au lieu d'Int)
2. **Supprimer `email` dupliqué** dans Candidat (utiliser User.email via relation)
3. **Fusionner les tables Custom** avec les tables principales

**Impact :** Éviter les erreurs de données et les incohérences

### ⚠️ Important (semaine 2-3)

4. **Ajouter les index composites** sur les requêtes fréquentes
5. **Implémenter soft deletes** sur JobOffer et Application
6. **Refondre le système de notifications**

**Impact :** Amélioration significative des performances et de l'UX

### 💡 Nice to have (plus tard)

7. **Système d'audit** pour tracer toutes les actions
8. **Versioning des CVs** pour garder un historique
9. **Permissions granulaires** pour les collaborateurs

**Impact :** Features avancées pour la v2

---

## 🚀 Plan de migration

### Phase 1 : Corrections critiques

```bash
# 1. Modifier le schema.prisma
# 2. Créer une migration
npx prisma migrate dev --name fix-critical-issues

# 3. Tester en dev
npm run dev
```

### Phase 2 : Nettoyage des doublons

```bash
# 1. Créer un script de migration SQL
# 2. Fusionner ApplicationCustom dans Application
# 3. Supprimer les tables Custom
npx prisma migrate dev --name remove-custom-duplicates
```

### Phase 3 : Optimisations

```bash
# Ajouter les index
npx prisma migrate dev --name add-indexes
```

---

Avez-vous des questions sur une des améliorations ? Je peux détailler encore plus certains points si besoin !
