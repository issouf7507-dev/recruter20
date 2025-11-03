# 📝 Implémentation du système de Candidatures (Postulation)

## ✅ Architecture complète (Repository → Service → Route → Hook → UI)

### Structure créée

```
lib/api/candidatures/
├── repository.ts      ✅ Opérations Prisma
├── service.ts         ✅ Logique métier + validation
├── types.ts           ✅ Types TypeScript
└── index.ts           ✅ Exports centralisés

lib/hooks/
└── use-candidatures.ts ✅ Hook React Query pour les candidatures

app/api/candidatures/
├── route.ts                        ✅ POST - Créer une candidature
├── [id]/
│   └── route.ts                    ✅ DELETE - Supprimer une candidature
app/api/candidats/[id]/candidatures/
└── route.ts                        ✅ GET - Liste des candidatures

app/components/publicc/
└── PostulerButton.tsx              ✅ Composant de postulation réutilisable
```

---

## 🗄️ Modèle Prisma (déjà existant)

```prisma
model Application {
  id             String   @id @default(cuid())
  candidatId     String
  jobOfferId     String
  columnId       String   // Colonne Kanban (statut)
  rating         Int?
  message        String?  // Message de motivation
  cv             String?  // URL du CV
  favorite       Boolean? @default(false)
  duedate        DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime? // Soft delete
  
  candidat       Candidat     @relation(...)
  column         KanbanColumn @relation(...)
  jobOffer       JobOffer     @relation(...)
}

model KanbanColumn {
  id           String  @id @default(cuid())
  color        String
  name         String  // "À examiner", "En cours", "Entretien", "Accepté", "Refusé"
  order        Int
  isDefault    Boolean @default(false)
  jobOfferId   String
  applications Application[]
  jobOffer     JobOffer @relation(...)
}
```

---

## 📊 Architecture en couches

### 1. Repository Layer (Accès aux données)

**Fichier:** `lib/api/candidatures/repository.ts`

```typescript
export class ApplicationRepository {
  // Récupération
  async findByCandidatId(candidatId: string)
  async findById(id: string)
  
  // Vérifications
  async existsForCandidateAndOffer(candidatId: string, jobOfferId: string)
  async getDefaultColumnForOffer(jobOfferId: string)
  
  // Mutations
  async create(data: CreateApplicationData & { columnId: string })
  async update(id: string, data: Partial<Application>)
  async softDelete(id: string)
  async delete(id: string)
}
```

**Logique spécifique :**
- Récupération de la colonne Kanban par défaut (première colonne, généralement "À examiner")
- Vérification des doublons (candidature déjà existante)
- Soft delete (marquage comme supprimé sans suppression physique)

### 2. Service Layer (Logique métier)

**Fichier:** `lib/api/candidatures/service.ts`

```typescript
export class ApplicationService {
  async getApplicationsByCandidatId(candidatId: string)
  async getApplicationById(id: string)
  async createApplication(data: CreateApplicationData)
  async updateApplication(id: string, data: UpdateApplicationData)
  async deleteApplication(id: string)
  async checkOwnership(applicationId: string, userId: string)
}
```

**Logique métier implémentée :**
- ✅ Validation des champs requis
- ✅ Vérification des doublons (empêche les candidatures multiples)
- ✅ Attribution automatique à la colonne Kanban par défaut
- ✅ Vérification des permissions (ownership)

### 3. Routes API (Controllers)

**POST /api/candidatures**
- Créer une nouvelle candidature
- Authentification requise
- Vérifie que le candidat appartient à l'utilisateur connecté
- Empêche les doublons (erreur 409 si déjà postulé)

**GET /api/candidats/[id]/candidatures**
- Récupérer toutes les candidatures d'un candidat
- Retourne avec les relations : jobOffer, column

**DELETE /api/candidatures/[id]**
- Supprimer (soft delete) une candidature
- Vérifie l'ownership avant suppression

### 4. Hook React (use-candidatures)

**Fichier:** `lib/hooks/use-candidatures.ts`

```typescript
export function useCandidatures(candidatId?: string) {
  return {
    candidatures,        // Liste des candidatures
    isLoading,           // État de chargement
    error,               // Erreur éventuelle
    refetch,             // Recharger les données
    createCandidature,   // Mutation pour créer
    deleteCandidature,   // Mutation pour supprimer
    hasApplied,          // Fonction pour vérifier si déjà postulé
  }
}
```

**Fonctionnalités :**
- ✅ Récupération automatique avec React Query
- ✅ Mutations optimistes
- ✅ Invalidation automatique du cache
- ✅ Fonction helper `hasApplied()` pour vérifier les doublons

### 5. Composant UI (PostulerButton)

**Fichier:** `app/components/publicc/PostulerButton.tsx`

Composant réutilisable qui :
- ✅ Affiche un bouton de connexion si non connecté
- ✅ Affiche "Candidature envoyée" si déjà postulé
- ✅ Affiche un formulaire avec message de motivation optionnel
- ✅ Joint automatiquement le CV du candidat
- ✅ Gère les états de chargement
- ✅ Affiche les erreurs

---

## 🎯 Workflow de postulation

### Étape 1 : Vérifications préalables

```typescript
// 1. Utilisateur connecté ?
if (!session) {
  return "Connectez-vous pour postuler";
}

// 2. A un CV ?
if (!candidat?.cv) {
  showDocumentsModal(); // "Vous devez télécharger un CV"
  return;
}

// 3. A déjà postulé ?
if (hasApplied(jobOfferId)) {
  return "Candidature envoyée ✓";
}
```

### Étape 2 : Collecte des données

```typescript
{
  jobOfferId: "offer_123",
  message: "Message optionnel du candidat",
  cv: "https://edgestore.url/cv.pdf" // Automatique depuis le profil
}
```

### Étape 3 : Traitement côté serveur

```typescript
// 1. Authentification
const session = await auth.api.getSession();

// 2. Récupération du candidat
const candidat = await prisma.candidat.findUnique({ 
  where: { userId: session.user.id } 
});

// 3. Vérification doublon
const alreadyApplied = await applicationRepository.existsForCandidateAndOffer(...);

// 4. Récupération de la colonne Kanban par défaut
const defaultColumn = await applicationRepository.getDefaultColumnForOffer(jobOfferId);

// 5. Création de la candidature
const application = await applicationRepository.create({
  candidatId,
  jobOfferId,
  columnId: defaultColumn.id,
  message,
  cv,
});
```

### Étape 4 : Réponse et mise à jour UI

```typescript
// Succès
{
  success: true,
  data: application,
  message: "Application submitted successfully"
}

// Cache React Query invalidé automatiquement
// UI mise à jour sans rechargement
```

---

## 🚀 Utilisation dans le code

### Dans la page d'une offre

```typescript
// app/(public)/offres/[id]/page.tsx

const { candidat } = useCandidat();
const { hasApplied, createCandidature } = useCandidatures(candidat?.id);

// Vérifier si déjà postulé
if (hasApplied(jobOfferId)) {
  return <Badge>Candidature envoyée</Badge>;
}

// Postuler
const handlePostuler = async () => {
  createCandidature.mutate({
    jobOfferId,
    message: applicationMessage,
    cv: candidat?.cv,
  });
};
```

### Dans CandidaturesSection (Suivi)

```typescript
// app/components/publicc/candidat-sections/CandidaturesSection.tsx

const { candidatures, isLoading } = useCandidatures(candidatId);

// Filtrage par statut
const candidaturesEnAttente = candidatures?.filter(
  c => getStatutFromColumn(c.column.name) === "En attente"
);
```

---

## 🔐 Sécurité

Toutes les routes incluent :
- ✅ **Authentification** via `better-auth`
- ✅ **Autorisation** : vérification que le candidat appartient à l'utilisateur
- ✅ **Validation** des champs requis
- ✅ **Protection contre les doublons** (une seule candidature par offre)
- ✅ **Soft delete** (préservation de l'historique)
- ✅ Codes HTTP appropriés (401, 403, 404, 409, 500)

---

## 📝 Routes API créées

### POST /api/candidatures

Créer une candidature.

**Body:**
```json
{
  "jobOfferId": "offer_123",
  "message": "Message optionnel",
  "cv": "https://edgestore.url/cv.pdf"
}
```

**Réponse succès:**
```json
{
  "success": true,
  "data": {
    "id": "app_456",
    "candidatId": "cand_789",
    "jobOfferId": "offer_123",
    "columnId": "col_111",
    "message": "...",
    "cv": "...",
    "createdAt": "2024-11-02T12:00:00Z"
  },
  "message": "Application submitted successfully"
}
```

**Erreur (déjà postulé):**
```json
{
  "success": false,
  "error": "Vous avez déjà postulé à cette offre"
}
// Status: 409 Conflict
```

### GET /api/candidats/[id]/candidatures

Récupérer toutes les candidatures d'un candidat.

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "app_456",
      "candidatId": "cand_789",
      "jobOfferId": "offer_123",
      "columnId": "col_111",
      "message": "...",
      "createdAt": "2024-11-02T12:00:00Z",
      "jobOffer": {
        "id": "offer_123",
        "title": "Développeur Full Stack",
        "company": "Tech Corp",
        "location": "Paris",
        "type": "CDI"
      },
      "column": {
        "id": "col_111",
        "name": "À examiner",
        "color": "#3b82f6"
      }
    }
  ]
}
```

### DELETE /api/candidatures/[id]

Supprimer une candidature (soft delete).

---

## 🎨 Composants UI

### PostulerButton (composant réutilisable)

**Fichier:** `app/components/publicc/PostulerButton.tsx`

**États :**
1. **Non connecté** → "Connectez-vous pour postuler" (disabled)
2. **Déjà postulé** → "Candidature envoyée ✓" (disabled)
3. **Peut postuler** → Bouton actif → Formulaire avec message

**Fonctionnalités :**
- Message de motivation optionnel
- CV joint automatiquement
- Indicateur de chargement
- Gestion des erreurs

### Intégration dans la page offre

**Fichier:** `app/(public)/offres/[id]/page.tsx`

**Modifications apportées :**
- ✅ Import du hook `useCandidatures`
- ✅ Vérification si déjà postulé avec `hasApplied()`
- ✅ Fonction `handlePostuler()` implémentée
- ✅ Modal améliorée avec textarea pour le message
- ✅ État de chargement pendant la postulation

### CandidaturesSection (Suivi)

**Fichier:** `app/components/publicc/candidat-sections/CandidaturesSection.tsx`

**Modifications apportées :**
- ✅ Utilise le hook `useCandidatures` au lieu de fetch manuel
- ✅ Mise à jour automatique via React Query
- ✅ Typage correct des callbacks
- ✅ Gestion des états vides

---

## 🔄 Flux complet de postulation

```
┌──────────────────────────────────────────────────┐
│  1. Candidat clique "Postuler maintenant"        │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  2. Vérifications préalables                     │
│     - Connecté ?                                 │
│     - A un CV ?                                  │
│     - Déjà postulé ?                             │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  3. Modal de confirmation                        │
│     - Message personnalisé (optionnel)           │
│     - CV joint automatiquement                   │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  4. Hook use-candidatures                        │
│     createCandidature.mutate({...})              │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  5. Route API: POST /api/candidatures            │
│     - Authentification                           │
│     - Récupération du candidat                   │
│     - Appel au service                           │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  6. Service: applicationService.createApplication│
│     - Validation                                 │
│     - Vérification doublon                       │
│     - Récupération colonne par défaut            │
│     - Appel au repository                        │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  7. Repository: applicationRepository.create     │
│     - prisma.application.create()                │
│     - Enregistrement dans la DB                  │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  8. Réponse et mise à jour UI                    │
│     - Message de succès                          │
│     - Cache React Query invalidé                 │
│     - UI mise à jour automatiquement             │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Fonctionnalités implémentées

### ✅ Postulation

- **Page d'offre** : Bouton "Postuler maintenant"
- **Vérification** : CV requis avant postulation
- **Anti-doublon** : Impossible de postuler 2 fois à la même offre
- **Message personnalisé** : Textarea optionnelle pour se démarquer
- **CV automatique** : Joint depuis le profil du candidat
- **Feedback visuel** : Indicateurs de chargement et messages de succès/erreur

### ✅ Suivi des candidatures

- **CandidaturesSection** : Onglet dans le CandidatSheet
- **Filtrage par statut** : Toutes, En attente, Acceptées, Refusées
- **Informations affichées** :
  - Titre du poste, entreprise
  - Localisation, type de contrat
  - Date de candidature
  - Statut actuel (badge coloré)
  - Message envoyé
- **Mise à jour automatique** : React Query gère le cache

---

## 🎨 Statuts des candidatures

Les candidatures suivent le workflow Kanban :

| Statut | Colonne Kanban | Couleur | Description |
|--------|---------------|---------|-------------|
| En attente | À examiner | Jaune | Candidature reçue, pas encore examinée |
| En cours | En cours | Bleu | Candidature en cours d'évaluation |
| Entretien | Entretien | Violet | Candidat convoqué en entretien |
| Accepté | Accepté | Vert | Candidature acceptée |
| Refusé | Refusé | Rouge | Candidature refusée |

---

## 📦 Codes d'erreur HTTP

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | Success | Récupération réussie |
| 201 | Created | Candidature créée |
| 400 | Bad Request | Champs manquants |
| 401 | Unauthorized | Non connecté |
| 403 | Forbidden | Pas le propriétaire |
| 404 | Not Found | Candidature introuvable |
| 409 | Conflict | Déjà postulé à cette offre |
| 500 | Server Error | Erreur serveur |

---

## 🔄 Intégration avec les colonnes Kanban

Lorsque le recruteur crée une offre, des colonnes Kanban par défaut sont créées :

```typescript
const defaultColumns = [
  { name: "À examiner", color: "#3b82f6", order: 0, isDefault: true },
  { name: "En cours", color: "#f59e0b", order: 1 },
  { name: "Entretien", color: "#8b5cf6", order: 2 },
  { name: "Accepté", color: "#10b981", order: 3 },
  { name: "Refusé", color: "#ef4444", order: 4 },
];
```

**Lors de la postulation :**
- La candidature est automatiquement placée dans la première colonne (`isDefault: true`)
- Le recruteur peut ensuite déplacer la candidature entre les colonnes
- Le candidat voit le statut correspondant à la colonne actuelle

---

## 🎯 Améliorations futures possibles

- [ ] Notification au recruteur lors d'une nouvelle candidature
- [ ] Notification au candidat lors du changement de statut
- [ ] Possibilité de retirer sa candidature (si en attente seulement)
- [ ] Historique des modifications de statut
- [ ] Score de compatibilité candidat/offre
- [ ] Suggestions de messages de motivation par IA
- [ ] Statistiques des candidatures (taux d'acceptation, temps moyen, etc.)

---

**✅ Système de postulation complètement fonctionnel avec workflow Kanban !**

## 🚀 Pour tester

1. Redémarrez votre serveur Next.js
2. Connectez-vous en tant que candidat
3. Allez sur une page d'offre
4. Cliquez sur "Postuler maintenant"
5. Ajoutez un message (optionnel)
6. Cliquez sur "Postuler"
7. Vérifiez dans l'onglet "Candidatures" du CandidatSheet

**Tout devrait fonctionner !** 🎉

