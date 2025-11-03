# 📋 Structure du Composant CandidatSheet

## 🎯 Vue d'ensemble

Le composant `CandidatSheet` est un hub centralisé pour toutes les fonctionnalités du candidat. Il est organisé en **6 onglets principaux** permettant de gérer :

1. **Profil** - Informations personnelles, photo, biographie, compétences
2. **Expériences** - Expériences professionnelles et formations
3. **Candidatures** - Postulation et suivi des candidatures
4. **Alertes** - Alertes emploi personnalisées
5. **Objectifs** - Objectifs de carrière avec suivi de progression
6. **Documents** - CV, lettres de motivation et autres documents

---

## 📁 Structure des fichiers

```
app/components/publicc/
├── CandidatSheet.tsx                          # Composant principal avec système de tabs
└── candidat-sections/
    ├── ProfilSection.tsx                      # Section gestion du profil
    ├── ExperiencesFormationsSection.tsx       # Section expériences & formations
    ├── CandidaturesSection.tsx                # Section candidatures
    ├── AlertesSection.tsx                     # Section alertes emploi
    ├── ObjectifsSection.tsx                   # Section objectifs de carrière
    └── DocumentsSection.tsx                   # Section documents (CV, lettres, etc.)
```

---

## 🏗️ Architecture

### 1. Composant Principal (`CandidatSheet.tsx`)

- **Fonctionnalités** :

  - Gestion de l'état ouvert/fermé du sheet
  - Navigation entre les onglets
  - Récupération des données du candidat via `useCandidat()`
  - Interface responsive avec tabs

- **Props** :
  ```typescript
  interface CandidatSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  ```

### 2. Sections modulaires

Chaque section est un composant indépendant qui :

- Reçoit `candidatId` en prop
- Gère son propre état local
- Effectue des appels API pour charger/sauvegarder les données
- Affiche une interface utilisateur spécifique à sa fonctionnalité

---

## 📝 Détails par Section

### ✅ 1. ProfilSection

**Fonctionnalités implémentées :**

- ✅ Formulaire d'informations personnelles (nom, prénom, téléphone, adresse, etc.)
- ✅ Upload de photo de profil avec prévisualisation
- ✅ Informations détaillées (date de naissance, nationalité, situation familiale, permis)
- ✅ Biographie (textarea)
- ✅ Gestion des compétences :
  - Liste prédéfinie (JavaScript, React, Python, etc.)
  - Ajout de compétences personnalisées
  - Suppression de compétences

**À implémenter :**

- [ ] API route : `PUT /api/candidats/[id]` pour sauvegarder le profil
- [ ] API route : `POST /api/upload` pour l'upload de photos
- [ ] API route : `PUT /api/candidats/[id]/competences` pour gérer les compétences

---

### ✅ 2. ExperiencesFormationsSection

**Fonctionnalités implémentées :**

- ✅ Liste des expériences professionnelles
- ✅ Formulaire d'ajout/modification d'expérience :
  - Poste, entreprise, localisation
  - Type de contrat, dates (début/fin)
  - Description
- ✅ Liste des formations
- ✅ Formulaire d'ajout/modification de formation :
  - Diplôme, établissement, domaine
  - Dates, description

**À implémenter :**

- [ ] API route : `GET /api/candidats/[id]/experiences`
- [ ] API route : `POST /api/experiences`
- [ ] API route : `PUT /api/experiences/[id]`
- [ ] API route : `DELETE /api/experiences/[id]`
- [ ] API route : `GET /api/candidats/[id]/formations`
- [ ] API route : `POST /api/formations`
- [ ] API route : `PUT /api/formations/[id]`
- [ ] API route : `DELETE /api/formations/[id]`

---

### ✅ 3. CandidaturesSection

**Fonctionnalités implémentées :**

- ✅ Affichage de toutes les candidatures
- ✅ Filtrage par statut (Toutes, En attente, Acceptées, Refusées)
- ✅ Cartes de candidatures avec :
  - Titre du poste, entreprise
  - Localisation, date de candidature
  - Statut avec badges colorés
  - Message optionnel

**À implémenter :**

- [ ] API route : `GET /api/candidats/[id]/candidatures`
- [ ] Lien vers les détails de l'offre
- [ ] Possibilité de retirer une candidature (si en attente)

---

### ✅ 4. AlertesSection

**Fonctionnalités implémentées :**

- ✅ Liste des alertes créées
- ✅ Formulaire de création/modification d'alerte :
  - Titre/mots-clés
  - Localisation, type de contrat
  - Salaire min/max
  - Expérience requise
  - Fréquence de notification (Quotidienne, Hebdomadaire, Mensuelle)
  - Mots-clés personnalisés
  - Activation/désactivation
- ✅ Affichage du nombre de résultats trouvés
- ✅ Toggle pour activer/désactiver une alerte

**À implémenter :**

- [ ] API route : `GET /api/candidats/[id]/alertes`
- [ ] API route : `POST /api/alertes`
- [ ] API route : `PUT /api/alertes/[id]`
- [ ] API route : `DELETE /api/alertes/[id]`
- [ ] Système de notifications automatiques basé sur la fréquence
- [ ] Job pour rechercher les nouvelles offres correspondantes

---

### ✅ 5. ObjectifsSection

**Fonctionnalités implémentées :**

- ✅ Liste des objectifs de carrière
- ✅ Formulaire de création/modification d'objectif :
  - Titre, description, catégorie
  - Date limite
  - Progression (0-100%) avec barre de progression
  - Étapes intermédiaires (liste)
- ✅ Visualisation de la progression
- ✅ Calcul des jours restants avant la date limite
- ✅ Boutons pour ajuster la progression (+10%, -10%)

**À implémenter :**

- [ ] API route : `GET /api/candidats/[id]/objectifs`
- [ ] API route : `POST /api/objectifs`
- [ ] API route : `PUT /api/objectifs/[id]`
- [ ] API route : `DELETE /api/objectifs/[id]`
- [ ] Marquage des étapes comme complétées

---

### ✅ 6. DocumentsSection

**Fonctionnalités implémentées :**

- ✅ Sections séparées pour CV, Lettres de motivation, Autres documents
- ✅ Upload de fichiers (PDF, DOC, DOCX)
- ✅ Liste des documents avec :
  - Nom du fichier
  - Taille formatée
  - Date d'upload
  - Icône selon le type
- ✅ Téléchargement et suppression de documents

**À implémenter :**

- [ ] API route : `GET /api/candidats/[id]/documents`
- [ ] API route : `POST /api/upload` (gestion des fichiers)
- [ ] API route : `DELETE /api/documents/[id]`
- [ ] Mise à jour automatique du champ `cv` ou `letterm` dans le profil candidat lors de l'upload
- [ ] Stockage des fichiers (S3, Cloudinary, ou système de fichiers local)

---

## 🔌 Routes API à créer

### Routes Candidat

```typescript
// app/api/candidats/[id]/route.ts
GET    /api/candidats/[id]                    # Récupérer le profil
PUT    /api/candidats/[id]                    # Mettre à jour le profil
GET    /api/candidats/[id]/candidatures       # Liste des candidatures
GET    /api/candidats/[id]/experiences        # Liste des expériences
GET    /api/candidats/[id]/formations         # Liste des formations
GET    /api/candidats/[id]/alertes            # Liste des alertes
GET    /api/candidats/[id]/objectifs          # Liste des objectifs
GET    /api/candidats/[id]/documents          # Liste des documents
```

### Routes Expériences

```typescript
// app/api/experiences/route.ts
POST   /api/experiences                        # Créer une expérience

// app/api/experiences/[id]/route.ts
GET    /api/experiences/[id]                   # Récupérer une expérience
PUT    /api/experiences/[id]                   # Mettre à jour
DELETE /api/experiences/[id]                   # Supprimer
```

### Routes Formations

```typescript
// app/api/formations/route.ts
POST   /api/formations                         # Créer une formation

// app/api/formations/[id]/route.ts
GET    /api/formations/[id]
PUT    /api/formations/[id]
DELETE /api/formations/[id]
```

### Routes Alertes

```typescript
// app/api/alertes/route.ts
POST   /api/alertes                            # Créer une alerte

// app/api/alertes/[id]/route.ts
GET    /api/alertes/[id]
PUT    /api/alertes/[id]
DELETE /api/alertes/[id]
```

### Routes Objectifs

```typescript
// app/api/objectifs/route.ts
POST   /api/objectifs                          # Créer un objectif

// app/api/objectifs/[id]/route.ts
GET    /api/objectifs/[id]
PUT    /api/objectifs/[id]
DELETE /api/objectifs/[id]
```

### Routes Documents

```typescript
// app/api/upload/route.ts
POST   /api/upload                             # Upload de fichier

// app/api/documents/[id]/route.ts
DELETE /api/documents/[id]                     # Supprimer un document
```

---

## 🎨 Composants UI utilisés

Tous les composants UI sont disponibles dans `components/ui/` :

- ✅ `Button`, `Input`, `Label`, `Textarea`
- ✅ `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- ✅ `Badge`, `Avatar`, `Tabs`, `Progress`
- ✅ `Switch` (créé), `Sheet`

---

## 🚀 Prochaines étapes d'implémentation

### Phase 1 : API Routes de base

1. Créer les routes API pour le profil candidat
2. Implémenter les routes CRUD pour expériences et formations
3. Tester l'upload de fichiers

### Phase 2 : Fonctionnalités avancées

1. Système d'alertes avec recherche automatique
2. Notifications en temps réel
3. Statistiques des candidatures

### Phase 3 : Optimisations

1. Validation côté client et serveur
2. Gestion d'erreurs robuste
3. Messages de succès/erreur avec toast notifications
4. Optimisation des performances (pagination, lazy loading)

---

## 📝 Notes importantes

1. **Authentification** : Toutes les routes API doivent vérifier que le candidat connecté modifie uniquement ses propres données
2. **Validation** : Utiliser Zod pour valider les données avant enregistrement
3. **Permissions** : Un candidat ne peut modifier que ses propres données
4. **Upload de fichiers** : Prévoir une limite de taille et valider les types de fichiers
5. **Performance** : Implémenter la pagination pour les listes longues

---

## 🔍 Exemple d'utilisation

```tsx
import { CandidatSheet } from "@/app/components/publicc/CandidatSheet";

function MonComposant() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setSheetOpen(true)}>
        Ouvrir mon espace candidat
      </Button>
      <CandidatSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
```

---

**✅ Structure complète et prête à être connectée aux API !**
