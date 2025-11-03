# Structure du Projet Recruteur 2.0

## 📁 Arborescence

```
app/
├── (public)/                    # Route group pour les pages publiques
│   ├── page.tsx                # Landing page (/)
│   ├── about/
│   │   └── page.tsx           # Page à propos (/about)
│   ├── contact/
│   │   └── page.tsx           # Page contact (/contact)
│   └── layout.tsx             # Layout pour les pages publiques
│
├── recruteur/                  # Dashboard Recruteur
│   ├── dashboard/
│   │   └── page.tsx           # Tableau de bord recruteur (/recruteur/dashboard)
│   ├── offres/
│   │   └── page.tsx           # Gestion des offres d'emploi (/recruteur/offres)
│   ├── candidatures/
│   │   └── page.tsx           # Gestion des candidatures (/recruteur/candidatures)
│   ├── profil/
│   │   └── page.tsx           # Profil entreprise (/recruteur/profil)
│   └── layout.tsx             # Layout avec navigation recruteur
│
├── candidat/                   # Dashboard Candidat
│   ├── dashboard/
│   │   └── page.tsx           # Tableau de bord candidat (/candidat/dashboard)
│   ├── recherche/
│   │   └── page.tsx           # Recherche d'offres (/candidat/recherche)
│   ├── candidatures/
│   │   └── page.tsx           # Suivi des candidatures (/candidat/candidatures)
│   ├── profil/
│   │   └── page.tsx           # Profil candidat (/candidat/profil)
│   └── layout.tsx             # Layout avec navigation candidat
│
├── components/                 # Composants partagés
│   ├── Button.tsx             # Composant bouton réutilisable
│   ├── Card.tsx               # Composant carte
│   ├── Badge.tsx              # Composant badge
│   ├── Input.tsx              # Composant input
│   ├── Select.tsx             # Composant select
│   ├── Textarea.tsx           # Composant textarea
│   └── index.ts               # Export centralisé
│
├── layout.tsx                  # Layout racine
└── globals.css                 # Styles globaux
```

## 🎨 Pages et Routes

### Pages Publiques

- **/** - Landing page avec présentation de la plateforme
- **/about** - Page à propos
- **/contact** - Page de contact

### Dashboard Recruteur (Header bleu)

- **/recruteur/dashboard** - Vue d'ensemble : stats, activités récentes
- **/recruteur/offres** - Gestion des offres d'emploi
- **/recruteur/candidatures** - Consultation et gestion des candidatures reçues
- **/recruteur/profil** - Profil de l'entreprise

### Dashboard Candidat (Header vert)

- **/candidat/dashboard** - Vue d'ensemble : stats, offres recommandées
- **/candidat/recherche** - Recherche et filtrage des offres d'emploi
- **/candidat/candidatures** - Suivi des candidatures envoyées
- **/candidat/profil** - Profil du candidat, CV, compétences

## 🧩 Composants Partagés

Tous les composants sont disponibles dans `app/components/` :

### Button

```tsx
import { Button } from "@/app/components";

<Button variant="primary" size="md" onClick={handleClick}>
  Cliquez ici
</Button>;
```

Variantes: `primary`, `secondary`, `danger`, `success`
Tailles: `sm`, `md`, `lg`

### Card

```tsx
import { Card } from "@/app/components";

<Card hover>Contenu de la carte</Card>;
```

### Badge

```tsx
import { Badge } from "@/app/components";

<Badge variant="green" size="md">
  Statut
</Badge>;
```

Variantes: `blue`, `green`, `yellow`, `red`, `purple`, `gray`

### Input

```tsx
import { Input } from "@/app/components";

<Input label="Email" type="email" placeholder="votre@email.com" required />;
```

### Select

```tsx
import { Select } from "@/app/components";

<Select
  label="Type de contrat"
  options={[
    { value: "cdi", label: "CDI" },
    { value: "cdd", label: "CDD" },
  ]}
/>;
```

### Textarea

```tsx
import { Textarea } from "@/app/components";

<Textarea label="Description" rows={6} placeholder="Entrez votre texte..." />;
```

## 🎯 Thème de Couleurs

### Recruteur

- Couleur principale: Bleu (`blue-600`)
- Hover: `blue-700`
- Arrière-plan: `blue-50`

### Candidat

- Couleur principale: Vert (`green-600`)
- Hover: `green-700`
- Arrière-plan: `green-50`

### Statuts

- Nouveau: Bleu (`blue-100/800`)
- En cours: Jaune (`yellow-100/800`)
- Entretien: Violet (`purple-100/800`)
- Accepté: Vert (`green-100/800`)
- Refusé: Rouge (`red-100/800`)

## 🚀 Prochaines Étapes

### Fonctionnalités à implémenter

1. **Authentification**

   - Login/Register pour recruteurs
   - Login/Register pour candidats
   - Gestion des sessions
   - Protection des routes

2. **API & Backend**

   - Routes API Next.js
   - Connexion base de données
   - CRUD pour offres d'emploi
   - CRUD pour candidatures
   - Upload de CV

3. **Fonctionnalités avancées**

   - Système de matching candidat/offre
   - Notifications en temps réel
   - Messagerie entre recruteur et candidat
   - Statistiques et analytics
   - Export de données

4. **Améliorations UI/UX**
   - Animations et transitions
   - Mode sombre
   - Responsive mobile
   - Accessibilité (a11y)

## 📦 Technologies Utilisées

- **Framework**: Next.js 15 (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS 4
- **Runtime**: React 19

## 💡 Conventions

### Nommage des fichiers

- Pages: `page.tsx`
- Layouts: `layout.tsx`
- Composants: PascalCase (ex: `Button.tsx`)

### Structure des composants

- Utiliser TypeScript pour le typage
- Props interfaces pour chaque composant
- Export default pour les pages et composants

### Routing

- Utilisation de l'App Router de Next.js
- Route groups avec `()` pour organisation sans impact sur l'URL
- Layouts imbriqués pour les dashboards

## 📝 Notes

- Le projet utilise les route groups `(public)` pour organiser les pages publiques sans affecter les URLs
- Chaque dashboard (recruteur/candidat) a son propre layout avec navigation spécifique
- Les composants partagés sont typés et réutilisables dans tout le projet
- Tailwind CSS est configuré pour un design moderne et responsive
