# 🔔 Implémentation du système d'Alertes Emploi

## ✅ Architecture complète (Repository → Service → Route)

### Structure créée

```
lib/api/alertes/
├── repository.ts      ✅ Opérations Prisma
├── service.ts         ✅ Logique métier + validation
├── types.ts           ✅ Types TypeScript
└── index.ts           ✅ Exports centralisés
```

---

## 🗄️ Modèles Prisma (déjà existants)

```prisma
model AlerteEmploi {
  id                String         @id @default(cuid())
  titre             String         // Mots-clés de recherche
  localisation      String
  typeContrat       String
  salaireMin        Float?
  salaireMax        Float?
  experience        String
  frequence         String         // Quotidienne, Hebdomadaire, Mensuelle
  active            Boolean        @default(true)
  derniereMiseAJour DateTime       @default(now())
  nombreResultats   Int            @default(0)
  candidatId        String
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  candidat          Candidat       @relation(...)
  alerteMotsCles    AlerteMotCle[]
}

model AlerteMotCle {
  id        String       @id @default(cuid())
  alerteId  String
  motCle    String
  createdAt DateTime     @default(now())
  alerte    AlerteEmploi @relation(...)

  @@unique([alerteId, motCle])
}
```

---

## 📊 Architecture en couches

### 1. Repository Layer

**Fichier:** `lib/api/alertes/repository.ts`

```typescript
export class AlerteRepository {
  async findByCandidatId(candidatId: string);
  async findById(id: string);
  async create(data: CreateAlerteData);
  async update(id: string, data: UpdateAlerteData);
  async delete(id: string);
  async updateLastCheck(id: string, nombreResultats: number);
}
```

**Logique spécifique :**

- Gestion des mots-clés via relation `AlerteMotCle`
- Suppression et recréation des mots-clés lors de la mise à jour
- Include automatique des mots-clés dans les requêtes

### 2. Service Layer

**Fichier:** `lib/api/alertes/service.ts`

```typescript
export class AlerteService {
  async getAlertesByCandidatId(candidatId: string);
  async getAlerteById(id: string);
  async createAlerte(data: CreateAlerteData);
  async updateAlerte(id: string, data: UpdateAlerteData);
  async deleteAlerte(id: string);
  async checkOwnership(alerteId: string, userId: string);
  async toggleActive(id: string);
}
```

**Validation :**

- Champs requis : `candidatId`, `titre`, `localisation`, `frequence`

### 3. Routes API

**POST /api/alertes** - Créer une alerte
**GET /api/candidats/[id]/alertes** - Liste des alertes
**PUT /api/alertes/[id]** - Mettre à jour une alerte
**DELETE /api/alertes/[id]** - Supprimer une alerte

---

## 🎯 Fonctionnalités implémentées

### ✅ Création d'alerte

Critères configurables :

- **Titre/Mots-clés** de recherche
- **Localisation** (Paris, Remote, France...)
- **Type de contrat** (CDI, CDD, Stage...)
- **Salaire** min et max (€)
- **Expérience** requise (Junior, Senior...)
- **Fréquence** de notification (Quotidienne, Hebdomadaire, Mensuelle)
- **Mots-clés personnalisés** (liste)
- **Statut actif/inactif** (Switch)

### ✅ Gestion des mots-clés

- Ajout de mots-clés personnalisés
- Suppression individuelle
- Stockage dans table `AlerteMotCle`
- Affichage avec badges

### ✅ Interface utilisateur

- Liste des alertes avec toggle actif/inactif
- Formulaire de création/modification
- Affichage du nombre de résultats trouvés
- Badges pour les critères (localisation, contrat, expérience, fréquence)
- Boutons d'édition et suppression

---

## 🔄 Workflow de mise à jour des alertes

```
┌──────────────────────────────────────────┐
│  1. Candidat crée une alerte             │
│     - Critères de recherche configurés   │
│     - Fréquence choisie                  │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│  2. API: POST /api/alertes               │
│     - Crée AlerteEmploi                  │
│     - Crée AlerteMotCle pour chaque mot  │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│  3. Job CRON (à implémenter)             │
│     - Vérifie les alertes actives        │
│     - Cherche les offres correspondantes │
│     - Envoie notifications               │
│     - Met à jour nombreResultats         │
└──────────────────────────────────────────┘
```

---

## 📝 Routes API créées

### POST /api/alertes

Créer une nouvelle alerte.

**Body:**

```json
{
  "candidatId": "cand_123",
  "titre": "Développeur Full Stack",
  "localisation": "Paris",
  "typeContrat": "CDI",
  "salaireMin": 40000,
  "salaireMax": 60000,
  "experience": "Senior",
  "frequence": "Quotidienne",
  "active": true,
  "motsCles": ["React", "Node.js", "AWS"]
}
```

**Réponse:**

```json
{
  "success": true,
  "data": {
    "id": "alerte_456",
    "titre": "Développeur Full Stack",
    "nombreResultats": 0,
    ...
  }
}
```

### GET /api/candidats/[id]/alertes

Récupérer toutes les alertes d'un candidat.

**Réponse:**

```json
{
  "success": true,
  "data": [
    {
      "id": "alerte_456",
      "titre": "Développeur Full Stack",
      "active": true,
      "nombreResultats": 12,
      "alerteMotsCles": [
        { "id": "mc_1", "motCle": "React" },
        { "id": "mc_2", "motCle": "Node.js" }
      ],
      ...
    }
  ]
}
```

### PUT /api/alertes/[id]

Mettre à jour une alerte (ou juste toggle active).

**Body (toggle active):**

```json
{
  "active": false
}
```

**Body (modification complète):**

```json
{
  "titre": "Nouveau titre",
  "localisation": "Remote",
  "motsCles": ["Vue.js", "TypeScript"]
}
```

### DELETE /api/alertes/[id]

Supprimer une alerte.

---

## 🎨 Composant AlertesSection

**Fichier:** `app/components/publicc/candidat-sections/AlertesSection.tsx`

**Fonctionnalités :**

- ✅ Liste des alertes créées
- ✅ Formulaire de création/modification
- ✅ Switch pour activer/désactiver
- ✅ Gestion des mots-clés personnalisés
- ✅ Affichage du nombre de résultats
- ✅ Validation côté client
- ✅ Messages de feedback (succès/erreur)

---

## 🔐 Sécurité

- ✅ Authentification requise
- ✅ Vérification de ownership (un candidat ne peut modifier que ses alertes)
- ✅ Validation des champs requis
- ✅ Gestion d'erreurs complète

---

## 🚀 Améliorations futures

### Job CRON pour les notifications

À implémenter : un job qui s'exécute selon la fréquence :

```typescript
// Pseudo-code
async function processAlerts() {
  const alertes = await prisma.alerteEmploi.findMany({
    where: { active: true },
  });

  for (const alerte of alertes) {
    // Rechercher les offres correspondantes
    const offres = await searchOffers({
      titre: alerte.titre,
      localisation: alerte.localisation,
      typeContrat: alerte.typeContrat,
      salaireMin: alerte.salaireMin,
      salaireMax: alerte.salaireMax,
      motsCles: alerte.motsCles,
    });

    // Créer des notifications
    if (offres.length > 0) {
      await createNotification({
        recipientId: alerte.candidat.userId,
        type: "JOB_ALERT_NEW_MATCHES",
        data: { alerteId: alerte.id, offres },
      });
    }

    // Mettre à jour le nombre de résultats
    await alerteRepository.updateLastCheck(alerte.id, offres.length);
  }
}
```

---

## ✅ État d'implémentation

**Fonctionnel :**

- ✅ CRUD complet des alertes
- ✅ Gestion des mots-clés
- ✅ Toggle actif/inactif
- ✅ Validation et sécurité

**À implémenter :**

- ⏳ Job CRON pour la recherche automatique
- ⏳ Système de notifications
- ⏳ Compteur de résultats réel
- ⏳ Prévisualisation des offres correspondantes

---

**✅ Système d'alertes emploi complètement fonctionnel (CRUD) !**

Le système est prêt. Il ne manque plus que la partie automatisation (CRON) pour rechercher et notifier les nouvelles offres.
