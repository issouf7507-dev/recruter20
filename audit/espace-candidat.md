# Audit — Espace Candidat

> Analyse de `/app/candidat/` et des sections `components/public/candidat-sections/`

---

## Ce qui fonctionne bien ✅

| Section | État |
|---|---|
| **ProfilSection** | Connectée à la vraie API (`updateCandidat`), upload photo, compétences, certifications, statut de disponibilité avec icônes. Complet. |
| **CandidaturesSection** | Utilise `useCandidatures` (React Query), tabs par statut, UI propre. |
| **MessagesSection** | Connectée à l'API + WebSocket temps réel pour les conversations. |
| **AlertesSection** | CRUD complet branché sur `/api/alertes`, `AlerteMatchesDialog` présent. |
| **ExperiencesFormationsSection** | Connectée à `/api/experiences` et `/api/formations`. |
| **DocumentsSection** | Upload fonctionnel via EdgeStore, icônes PDF/DOCX. |
| **Layout** | Sidebar dédiée, `AuthGuard`, même pattern que le recruteur. Bouton sticky "Enregistrer". |

---

## Problèmes identifiés 🔴

### 1. Route API `/api/objectifs` manquante
`ObjectifsSection` appelle `fetch('/api/objectifs')` mais cette route **n'existe pas**.
Le modèle `ObjectifCarriere` est dans le schema Prisma mais aucune route API n'a été créée.
→ La page Objectifs renvoie une **erreur 404 silencieuse** à chaque chargement.

### 2. `console.log` en production dans ProfilSection
```
ligne 1023 : console.log("handleSave", { ...formData, ... })
ligne 989  : console.log(progress)
```
Expose les données du candidat dans la console du navigateur.

### 3. Bouton "Parcourir les offres" cassé
Dans `CandidaturesSection`, le bouton état vide n'a ni `href` ni `onClick`.
Le candidat clique, rien ne se passe.

### 4. Pas de page dashboard/accueil
`/candidat/` redirige directement vers `/candidat/profil`.
Il manque une vraie page d'accueil avec un résumé :
- Nombre de candidatures actives
- Messages non lus
- Alertes actives
- Dernières offres matchées

---

## Zones à creuser / améliorer 🟡

### Sections qui utilisent `fetch()` brut au lieu de React Query
`AlertesSection`, `ObjectifsSection`, `ExperiencesFormationsSection` font leurs requêtes
avec `useState` + `fetch()` dans un `useEffect` manuel.
Conséquences : pas de cache, pas de refetch automatique, duplication du pattern de loading.
`CandidaturesSection` utilise déjà un hook React Query — c'est le bon modèle à suivre.

### CandidaturesSection — fonctionnalités manquantes
- Pas de tab "En révision" (`EN_REVISION` existe dans le statut backend)
- Pas de lien vers la fiche de l'offre
- Pas de possibilité de retirer une candidature
- Pas de lettre de motivation visible

### MessagesSection
- Pas de skeleton de chargement (juste un spinner basique)
- Pas de notification de nouveau message dans la sidebar

### DocumentsSection
- Pas de prévisualisation PDF en ligne
- Pas de possibilité de définir un CV "principal" (celui envoyé par défaut lors d'une candidature)

### ProfileSection
- Trop longue (1525 lignes dans un seul fichier) — difficile à maintenir
- Le champ `pays` est obligatoire (`*`) mais ne bloque pas la sauvegarde si vide

---

## Fonctionnalités à construire 🔵

| Priorité | Feature |
|---|---|
| **Haute** | Créer la route `/api/objectifs` (le modèle Prisma est prêt) |
| **Haute** | Page dashboard candidat avec stats et raccourcis |
| **Haute** | Lien "Parcourir les offres" dans CandidaturesSection |
| **Moyenne** | Migrer AlertesSection et ExperiencesFormationsSection vers React Query |
| **Moyenne** | Badge "messages non lus" dans la sidebar |
| **Moyenne** | CV principal : permettre au candidat de choisir le CV par défaut |
| **Basse** | Prévisualisation PDF inline dans DocumentsSection |
| **Basse** | Découper ProfilSection en sous-composants |
