# 📋 Tableau Kanban - Documentation Complète

## 🎯 Vue d'ensemble

Le tableau Kanban est une interface de gestion de tâches moderne et interactive qui permet aux recruteurs de visualiser et organiser leurs candidatures de manière intuitive. Cette page implémente un système complet de drag & drop pour les tâches et les colonnes, avec des fonctionnalités avancées de recherche, filtrage et personnalisation.

## 🚀 Fonctionnalités Principales

### ✨ Drag & Drop Bidirectionnel

- **Déplacement des tâches** : Entre les colonnes (Backlog → In Progress → Done)
- **Réorganisation des colonnes** : Glisser-déposer direct sur les colonnes cibles (UX intuitive)
- **Feedback visuel** : Indicateurs clairs avec animations et textes d'aide
- **Séparation des types** : Gestion intelligente des tâches vs colonnes

### 🔍 Recherche et Filtrage

- **Recherche en temps réel** : Par titre ou description des tâches
- **Filtres avancés** : Bouton de filtrage pour des critères spécifiques
- **Interface responsive** : Adaptation mobile avec boutons compacts

### 📊 Visualisation des Données

- **Progression circulaire** : Indicateurs visuels du pourcentage d'avancement
- **Badges de priorité** : Couleurs distinctives (Haute, Moyenne, Basse)
- **Compteurs** : Nombre de tâches par colonne
- **Avatars assignés** : Visualisation des équipes

### 🎨 Interface Moderne

- **Design responsive** : Adaptation à tous les écrans
- **Mode sombre/clair** : Support complet des thèmes
- **Animations fluides** : Transitions CSS pour une expérience premium
- **Zones de drop** : Indicateurs visuels pour les opérations de drag

## 🏗️ Architecture Technique

### 📁 Structure des Fichiers

```
app/recruteur/kanban/
├── page.tsx          # Composant principal du tableau Kanban
└── README.md         # Cette documentation
```

### 🔧 Technologies Utilisées

- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage statique pour la robustesse
- **Tailwind CSS** : Styling utilitaire et responsive
- **Tabler Icons** : Bibliothèque d'icônes moderne
- **React Hooks** : Gestion d'état moderne (useState)

### 📊 Structure des Données

#### Modèle de Colonne

```typescript
interface Colonne {
  id: string; // Identifiant unique
  titre: string; // Nom affiché
  candidatures: Candidature[]; // Liste des tâches
}
```

#### Modèle de Candidature/Tâche

```typescript
interface Candidature {
  id: number; // Identifiant unique
  titre: string; // Titre de la tâche
  description: string; // Description détaillée
  progression: number; // Pourcentage d'avancement (0-100)
  priorite: string; // "Haute" | "Moyenne" | "Basse"
  assignes: Assignee[]; // Équipe assignée
  piecesJointes: number; // Nombre de fichiers attachés
  commentaires: number; // Nombre de commentaires
  echeance: string; // Date limite
}
```

#### Modèle d'Assignee

```typescript
interface Assignee {
  nom: string; // Nom complet
  avatar: string; // URL de l'avatar
  initiales: string; // Initiales pour le fallback
}
```

## 🎮 Fonctionnalités Détaillées

### 🔄 Drag & Drop des Tâches

#### Fonctions de Gestion

```typescript
// Initialisation du drag
const handleDragStart = (
  e: React.DragEvent,
  candidatureId: number,
  colonneId: string
) => {
  setDraggedItem({ id: candidatureId, fromColonne: colonneId });
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", "");
};

// Gestion du survol
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};

// Logique de drop
const handleDrop = (e: React.DragEvent, targetColonneId: string) => {
  e.preventDefault();

  if (!draggedItem || draggedItem.fromColonne === targetColonneId) {
    setDraggedItem(null);
    return;
  }

  setKanbanData((prevData) => {
    const newData = { ...prevData };

    // Trouver la colonne source et la tâche
    const sourceColonne = newData.colonnes.find(
      (col) => col.id === draggedItem.fromColonne
    );
    const targetColonne = newData.colonnes.find(
      (col) => col.id === targetColonneId
    );

    if (sourceColonne && targetColonne) {
      const taskIndex = sourceColonne.candidatures.findIndex(
        (task) => task.id === draggedItem.id
      );

      if (taskIndex !== -1) {
        // Retirer la tâche de la colonne source
        const [movedTask] = sourceColonne.candidatures.splice(taskIndex, 1);

        // Ajouter la tâche à la colonne cible
        targetColonne.candidatures.push(movedTask);
      }
    }

    return newData;
  });

  setDraggedItem(null);
};
```

#### Effets Visuels

- **Tâche en cours de drag** : `opacity-50 scale-95 shadow-lg`
- **Colonnes de destination** : `ring-2 ring-blue-500 ring-opacity-50 bg-blue-50`
- **Zone de drop** : Bordure en pointillés avec texte indicatif
- **Transitions** : `transition-all duration-200` pour la fluidité

### 🔄 Drag & Drop des Colonnes

#### Fonctions de Gestion

```typescript
// Initialisation du drag de colonne (UX améliorée)
const handleColumnDragStart = (
  e: React.DragEvent,
  colonneId: string,
  index: number
) => {
  // Empêcher la propagation vers les tâches
  e.stopPropagation();
  setDraggedColumn({ id: colonneId, index });
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", "");
  e.dataTransfer.setData(
    "application/json",
    JSON.stringify({ type: "column", id: colonneId, index })
  );
};

// Logique de drop de colonne (UX intuitive)
const handleColumnDrop = (e: React.DragEvent, targetIndex: number) => {
  e.preventDefault();
  e.stopPropagation();

  // Vérifier que c'est bien une colonne qui est déplacée
  const dragData = e.dataTransfer.getData("application/json");
  if (!dragData) return;

  const { type } = JSON.parse(dragData);
  if (type !== "column") return;

  if (!draggedColumn || draggedColumn.index === targetIndex) {
    setDraggedColumn(null);
    return;
  }

  setKanbanData((prevData) => {
    const newData = { ...prevData };
    const columns = [...newData.colonnes];

    // Calculer la nouvelle position
    let newIndex = targetIndex;

    // Si on déplace vers la droite, ajuster l'index
    if (draggedColumn.index < targetIndex) {
      newIndex = targetIndex;
    } else {
      // Si on déplace vers la gauche, insérer avant
      newIndex = targetIndex;
    }

    // Retirer la colonne de sa position actuelle
    const [movedColumn] = columns.splice(draggedColumn.index, 1);

    // Insérer la colonne à sa nouvelle position
    columns.splice(newIndex, 0, movedColumn);

    return { ...newData, colonnes: columns };
  });

  setDraggedColumn(null);
};
```

#### Effets Visuels (UX Améliorée)

- **Colonne en cours de drag** : `opacity-50 scale-95 shadow-lg`
- **Colonne de destination** : `ring-2 ring-blue-500 ring-opacity-70 bg-blue-100 transform scale-105`
- **Texte d'aide** : "Déposer ici" avec `animate-pulse` pour guider l'utilisateur
- **Indicateur grip** : Icône `IconGripVertical` dans le header
- **Curseur** : `cursor-grab` pour indiquer la possibilité de drag
- **Drop direct** : Plus de zones externes, drop directement sur la colonne cible

### 🔍 Système de Recherche

#### Fonction de Filtrage

```typescript
const filteredCandidatures = (candidatures: any[]) => {
  if (!searchTerm) return candidatures;
  return candidatures.filter(
    (candidature) =>
      candidature.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
```

#### Interface de Recherche

- **Champ de recherche** : Input avec icône de loupe
- **Recherche en temps réel** : Filtrage instantané
- **Responsive** : Bouton compact sur mobile
- **Placeholder** : "Search tasks..." pour guider l'utilisateur

### 📊 Indicateurs Visuels

#### Progression Circulaire

```typescript
// SVG dynamique avec couleurs basées sur le pourcentage
<svg
  className="size-full -rotate-90"
  viewBox="0 0 36 36"
  xmlns="http://www.w3.org/2000/svg"
>
  <circle
    cx="18"
    cy="18"
    r="16"
    fill="none"
    className="stroke-current text-gray-200 dark:text-neutral-700"
    strokeWidth="2"
  ></circle>
  <circle
    cx="18"
    cy="18"
    r="16"
    fill="none"
    className={`stroke-current ${
      candidature.progression === 100
        ? "text-green-600"
        : candidature.progression >= 50
        ? "text-orange-500"
        : "text-blue-500"
    }`}
    strokeWidth="2"
    strokeDasharray="100.53096491487338"
    strokeDashoffset={
      100.53096491487338 - (candidature.progression * 100.53096491487338) / 100
    }
    strokeLinecap="round"
  ></circle>
</svg>
```

#### Système de Couleurs

- **0-49%** : Bleu (`text-blue-500`) - En cours
- **50-99%** : Orange (`text-orange-500`) - Presque terminé
- **100%** : Vert (`text-green-600`) - Terminé

#### Badges de Priorité

```typescript
const getPrioriteColor = (priorite: string) => {
  switch (priorite.toLowerCase()) {
    case "haute":
      return "bg-red-100 text-red-800 border-red-200";
    case "moyenne":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "basse":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
```

## 🎨 Interface Utilisateur

### 📱 Design Responsive

#### Breakpoints Tailwind

- **Mobile** : `< lg` - Interface compacte
- **Desktop** : `lg+` - Interface complète

#### Adaptations Mobile

```typescript
// Bouton de recherche mobile
<div className="lg:hidden">
  <Button variant="outline" size="sm">
    <IconSearch className="h-4 w-4" />
  </Button>
</div>

// Champ de recherche desktop
<div className="relative hidden w-auto lg:block">
  <IconSearch className="absolute top-2.5 left-3 h-4 w-4 opacity-50" />
  <Input placeholder="Search tasks..." className="ps-8 h-9 w-full..." />
</div>
```

### 🎭 Système de Thèmes

#### Support Mode Sombre/Clair

- **Variables CSS** : Utilisation des classes Tailwind avec support dark mode
- **Couleurs adaptatives** : `text-muted-foreground`, `bg-card`, etc.
- **Transitions** : Changements fluides entre les thèmes

### 🎯 Navigation par Onglets

#### Onglets Disponibles

```typescript
const [activeTab, setActiveTab] = useState("board");

// Onglets disponibles
<Button variant={activeTab === "board" ? "default" : "ghost"}>
  Board
</Button>
<Button variant={activeTab === "list" ? "default" : "ghost"}>
  List
</Button>
<Button variant={activeTab === "table" ? "default" : "ghost"}>
  Table
</Button>
```

## 📋 Données Mockées

### 🏢 Structure des Colonnes

```typescript
const mockKanbanData = {
  colonnes: [
    {
      id: "backlog",
      titre: "Backlog",
      candidatures: [
        // Tâches en attente
      ],
    },
    {
      id: "in-progress",
      titre: "In Progress",
      candidatures: [
        // Tâches en cours
      ],
    },
    {
      id: "done",
      titre: "Done",
      candidatures: [
        // Tâches terminées
      ],
    },
  ],
};
```

### 👥 Données des Assignés

```typescript
// Exemples d'assignés avec avatars
const assignes = [
  {
    nom: "Alice Johnson",
    avatar: "/images/avatars/01.png",
    initiales: "AJ",
  },
  {
    nom: "Bob Smith",
    avatar: "/images/avatars/02.png",
    initiales: "BS",
  },
];
```

## 🚀 Utilisation

### 🎯 Cas d'Usage Principaux

#### 1. Gestion des Candidatures

- **Backlog** : Nouvelles candidatures à traiter
- **In Progress** : Candidatures en cours d'évaluation
- **Done** : Candidatures traitées (acceptées/refusées)

#### 2. Suivi de Progression

- **Indicateurs visuels** : Pourcentage d'avancement
- **Priorités** : Organisation par urgence
- **Équipes** : Répartition des tâches

#### 3. Collaboration

- **Assignation** : Attribution des tâches
- **Commentaires** : Communication sur les tâches
- **Pièces jointes** : Documents partagés

### 🔧 Personnalisation

#### Réorganisation des Colonnes (UX Intuitive)

1. **Cliquer et glisser** le header de la colonne (zone entière draggable)
2. **Survoler** une autre colonne (elle s'agrandit et devient bleue)
3. **Déposer** directement sur la colonne cible
4. **Résultat** : La colonne se place automatiquement à la position souhaitée
5. **Feedback** : Texte "Déposer ici" avec animation pour guider l'utilisateur

#### Déplacement des Tâches

1. **Cliquer et glisser** une carte de tâche
2. **Survoler** une colonne de destination (indicateur bleu)
3. **Déposer** dans la zone de drop ou sur une autre tâche

## 🛠️ Développement

### 📦 Dépendances

```json
{
  "dependencies": {
    "@tabler/icons-react": "^3.x",
    "next": "^14.x",
    "react": "^18.x",
    "typescript": "^5.x"
  }
}
```

### 🎨 Styles

- **Tailwind CSS** : Configuration complète
- **Classes utilitaires** : Spacing, colors, typography
- **Responsive design** : Mobile-first approach
- **Dark mode** : Support natif

### 🔧 Configuration

- **TypeScript** : Configuration stricte
- **ESLint** : Règles de qualité de code
- **Prettier** : Formatage automatique

## 🚀 Améliorations Futures

### 📈 Fonctionnalités Prévues

- **Persistance** : Sauvegarde en base de données
- **Notifications** : Alertes en temps réel
- **Templates** : Modèles de colonnes prédéfinis
- **Analytics** : Métriques de performance
- **UX Mobile** : Amélioration du drag & drop sur mobile
- **Raccourcis clavier** : Support complet de l'accessibilité

### 🔧 Optimisations Techniques

- **Virtualisation** : Gestion de grandes listes
- **PWA** : Support hors ligne
- **WebSockets** : Synchronisation temps réel
- **Tests** : Couverture complète

## 📞 Support

### ✅ Problèmes Résolus (v1.1.0)

- **UX Drag & Drop colonnes** : Zones de drop externes supprimées, drop direct sur colonnes
- **Conflits d'événements** : Séparation claire entre drag des tâches et colonnes
- **Feedback visuel** : Animations et textes d'aide ajoutés
- **Logique de positionnement** : Calcul simplifié des positions

### 🐛 Problèmes Connus

- **Drag & Drop mobile** : Limité par les événements tactiles
- **Performance** : Optimisation nécessaire pour >1000 tâches
- **Accessibilité** : Amélioration des raccourcis clavier

### 💡 Suggestions

- **Feedback utilisateur** : Système de commentaires
- **Historique** : Traçabilité des modifications
- **Intégrations** : APIs externes (Calendrier, Email)

---

## 📝 Changelog

### Version 1.1.0 (Actuelle) - UX Améliorée

- ✅ Drag & drop des tâches
- ✅ **Drag & drop des colonnes (UX intuitive)** - Drop direct sur colonnes cibles
- ✅ **Feedback visuel amélioré** - Animations et textes d'aide
- ✅ **Séparation des types** - Gestion intelligente tâches vs colonnes
- ✅ Recherche en temps réel
- ✅ Indicateurs de progression
- ✅ Support responsive
- ✅ Mode sombre/clair
- ✅ Interface moderne

### Version 1.0.0

- ✅ Drag & drop des tâches
- ✅ Drag & drop des colonnes (zones externes)
- ✅ Recherche en temps réel
- ✅ Indicateurs de progression
- ✅ Support responsive
- ✅ Mode sombre/clair
- ✅ Interface moderne

---

_Développé avec ❤️ pour une expérience utilisateur optimale_
