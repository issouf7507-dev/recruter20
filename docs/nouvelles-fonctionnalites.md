# Nouvelles fonctionnalités — Espace Candidat

> Documentation technique et fonctionnelle de toutes les features ajoutées.

---

## 1. Matching IA Candidat

**Page** : `/candidat/matching`
**API** : `POST /api/candidat-matching`

### Comment ça marche

Le candidat clique sur **"Lancer l'analyse"**. Le frontend envoie le `candidatId` à l'API. Côté serveur :

1. Le profil complet du candidat est chargé (compétences, expériences, formations, localisation, domaine).
2. Les 100 dernières offres actives sont récupérées.
3. Pour chaque offre, l'algorithme de scoring `calculateMatches()` (dans `lib/matching/scoring.ts`) calcule un score de 0 à 100 basé sur :
   - Correspondance des compétences
   - Localisation
   - Années d'expérience
   - Domaine
   - Statut de disponibilité
4. Les résultats sont triés par score décroissant. Les 30 meilleurs sont renvoyés.

Les offres avec score ≥ 60 sont affichées en "Meilleures correspondances", les autres en section secondaire.
Le candidat peut postuler directement depuis cette page sans quitter son espace.

---

## 2. Notifications

**Page** : `/candidat/notifications`
**API** : `GET /api/notifications`, `PUT /api/notifications` (tout marquer lu), `PUT /api/notifications/[id]`
**Hook** : `lib/hooks/use-notifications.ts`

### Comment ça marche

Le modèle `Notification` existait déjà dans la base de données. Les notifications sont créées automatiquement quand un recruteur change le statut d'une candidature (dans `app/api/recruteurs/[id]/candidatures/route.ts`).

**Déclencheur** : `PUT /api/recruteurs/[id]/candidatures` → après la mise à jour du statut, une notification est créée avec :

- `recipientId` : l'`userId` du candidat
- `type` : `APPLICATION_STATUS_CHANGED`
- `data` : message humain + titre de l'offre + statut

**Affichage** : Le hook `useNotifications` poll l'API toutes les **60 secondes** (uniquement quand l'onglet est actif). Le badge rouge dans la sidebar affiche le nombre de non-lus en temps réel.

**Marquer comme lu** : Cliquer sur une notification la marque comme lue individuellement. "Tout marquer comme lu" fait un `PUT /api/notifications` qui met à jour toutes les non-lues.

---

## 3. Profil Public Partageable

**Route** : `/profil/[candidatId]` (page publique, pas de auth requise)

### Comment ça marche

Depuis `/candidat/profil`, trois boutons sont disponibles :

- **Partager mon profil** → copie l'URL `/profil/[candidatId]` dans le presse-papiers
- **Voir la version publique** → ouvre un nouvel onglet sur la page publique
- **Exporter PDF** → déclenche `window.print()` du navigateur

La page publique `/profil/[candidatId]` charge les données du candidat via `GET /api/candidats/[id]` et affiche :

- Avatar, nom, domaine, localisation, email, statut de disponibilité
- Bio
- Compétences
- Expériences (entreprise, poste, dates)
- Formations (diplôme, établissement)

Aucune information sensible (téléphone, date de naissance, etc.) n'est exposée — seules les données déjà présentes dans l'API publique `candidats/[id]`.

---

## 4. Score de Complétion du Profil

**Composant** : `components/candidat/ProfilCompletion.tsx`
**Affiché sur** : `/candidat/dashboard`

### Comment ça marche

Le composant reçoit l'objet `candidat` et calcule le score localement (pas d'API). Il vérifie 8 critères :

| Critère                 | Condition                                  |
| ----------------------- | ------------------------------------------ |
| Photo de profil         | `candidat.image` non null                  |
| Biographie              | `candidat.bio` avec 20+ caractères         |
| Compétences             | 3+ compétences ajoutées                    |
| CV uploadé              | `candidat.cv` non null                     |
| Expérience              | Au moins 1 expérience                      |
| Formation               | Au moins 1 formation                       |
| Statut de disponibilité | `candidat.statut` défini                   |
| Localisation            | `candidat.ville` ou `candidat.pays` défini |

Le score = `(critères validés / 8) × 100`. Si le profil est incomplet, les 3 premiers éléments manquants sont affichés avec un lien direct vers la section concernée.

---

## 5. Entretiens & Notes Personnelles

**Page** : `/candidat/entretiens`
**API** : `GET/POST/DELETE /api/candidatures/[id]/notes`

### Comment ça marche

Les notes sont stockées dans le modèle `ApplicationNote` (déjà dans le schema Prisma) avec `authorType: "CANDIDAT_NOTE"` pour les distinguer des notes des recruteurs.

Le candidat sélectionne une candidature dans la liste de gauche. Le panneau de droite charge les notes existantes pour cette candidature. Il peut :

- Ajouter une date d'entretien optionnelle (préfixée dans le contenu de la note : `[Entretien: 2025-06-01T14:00] ...`)
- Écrire une note libre (impressions, salaire discuté, questions posées...)
- Supprimer une note

Les notes sont **privées** — un recruteur ne peut pas les voir (le filtre `authorType: "CANDIDAT_NOTE"` les exclut des vues recruteur).

---

## 6. Postuler depuis l'Espace Candidat

**Page** : `/candidat/offres`

### Comment ça marche

La page utilise le hook `useOffers` déjà existant avec `etat: "active"`. La recherche fonctionne en mode **submit** (pas de debounce automatique) — la requête part uniquement au clic sur "Rechercher" ou à l'appui sur Entrée.

Pour postuler, le hook `useCandidatures` est utilisé. Le bouton "Postuler" appelle `createCandidature.mutateAsync({ jobOfferId })`. La méthode `hasApplied(jobOfferId)` vérifie si le candidat a déjà postulé à cette offre — si oui, le bouton affiche "Postulé ✓" et est désactivé.

---

## 7. Recommandations de Compétences

**Composant** : `components/candidat/SkillRecommendations.tsx`

### Comment ça marche

Le composant reçoit le `domaine` du candidat et ses `existingSkills`. Il compare avec une map statique `SKILLS_BY_DOMAIN` qui liste les compétences courantes par domaine (informatique, marketing, RH, finance, design, etc.).

Les compétences déjà dans le profil sont exclues. Les 8 premières suggestions restantes sont affichées sous forme de badges cliquables. Chaque clic appelle `onAdd(skill)` — ce callback doit être branché sur le setter de compétences de `ProfilSection` pour ajouter la compétence au profil.

---

## 8. API Objectifs de Carrière

**API** :

- `GET /api/candidats/[id]/objectifs`
- `POST /api/objectifs`
- `PUT /api/objectifs/[id]`
- `DELETE /api/objectifs/[id]`

**Lib** : `lib/api/objectifs/` (repository + service)

### Comment ça marche

La page `ObjectifsSection` existait mais la route API n'existait **pas** — elle renvoyait 404 silencieusement. Le modèle `ObjectifCarriere` et `ObjectifEtape` existent dans Prisma.

Les étapes (`etapes: string[]`) sont stockées dans la table `ObjectifEtape` (une ligne par étape). À la récupération, elles sont transformées en `string[]` pour correspondre à ce qu'attend le composant. À la mise à jour, les anciennes étapes sont supprimées et recréées.

La progression est un entier entre 0 et 100 (clampé côté serveur). Les boutons -10%/+10% dans l'UI font un `PUT` avec uniquement `{ progression: newValue }`.

---

## 9. Migration vers React Query (Alertes)

**Hooks** : `lib/hooks/use-alertes.ts`

### Avant / Après

| Avant                                     | Après                                         |
| ----------------------------------------- | --------------------------------------------- |
| `useState` + `useEffect` + `fetch()` brut | `useQuery` + `useMutation`                    |
| `alert()` du navigateur pour les erreurs  | `toast.error()` / `toast.success()`           |
| Refetch manuel après chaque mutation      | `queryClient.invalidateQueries()` automatique |
| Pas de cache                              | Cache React Query avec invalidation ciblée    |

`useAlertes(candidatId)` → lecture
`useCreateAlerte()`, `useUpdateAlerte()`, `useDeleteAlerte()` → mutations

---

## 10. Fix Pool de Connexions DB

**Fichier** : `lib/prisma.ts`

### Problème résolu

En mode développement Next.js, le hot reload recréait un nouveau `PrismaClient` à chaque modification de fichier. Chaque instance ouvrait 5 nouvelles connexions MariaDB → le pool de 5 connexions était saturé en quelques reloads.

**Fix** : Pattern singleton via `global` — l'instance Prisma est attachée à l'objet `global` de Node.js. Les reloads réutilisent la même instance. Le `connectionLimit` est passé à 15 pour donner de la marge.

```
En dev  : global.prisma ?? createPrismaClient()  → 1 seule instance
En prod : createPrismaClient()                   → 1 instance par worker
```

---

## 11. Fix WebSocket (Socket.IO)

**Fichier** : `lib/socket.ts`

### Problème résolu

Quand le serveur Socket.IO (`npm run dev:socket`) n'est pas lancé, le client tentait de se reconnecter indéfiniment → spam de `websocket error` dans la console.

**Fix** : Après 1 tentative échouée, `reconnection` est désactivé programmatiquement. Le socket reste disponible — recharger la page suffit à relancer la tentative de connexion si le serveur a été démarré entre-temps.

**Pour utiliser le chat temps réel**, il faut lancer les deux processus :

```bash
npm run dev:all   # lance Next.js + Socket.IO en parallèle
```

ou séparément :

```bash
npm run dev        # port 3000
npm run dev:socket # port 3001
```

---

---

## 12. Export CSV — Candidatures

**Page** : `/recruteur/candidatures`
**Utilitaire** : `lib/utils/export-csv.ts`

Le bouton **télécharger** (icône `IconDownload`) dans la barre de filtres génère un fichier `candidatures.csv` avec les colonnes : Prénom, Nom, Email, Téléphone, Offre, Statut, Date. Le CSV est encodé UTF-8 avec BOM pour Excel. Seules les candidatures **filtrées** (par statut et recherche) sont exportées.

---

## 13. Templates de Messages

**Page** : `/recruteur/messagerie`

Un bouton **Templates** (dropdown) est ajouté au-dessus du champ de saisie de la messagerie. Cliquer sur un template insère son contenu dans le champ — il peut ensuite être édité avant envoi. 5 templates prédéfinis : Convocation entretien, Demande de disponibilités, Demande d'informations, Refus de candidature, Confirmation de recrutement.

---

## 14. Dashboard Enrichi

**Page** : `/recruteur/dashboard`

Trois nouvelles sections ajoutées après le graphique :

- **Funnel de conversion** : barres horizontales montrant Reçues → En attente → En révision → Acceptées avec leur pourcentage relatif.
- **Candidatures sans réponse depuis +5 jours** : liste des candidatures `EN_ATTENTE` dont `updatedAt < now - 5 jours`. Lien direct vers chaque candidature.
- **Offres expirant dans 7 jours** : liste des offres actives dont `duedate` est dans les 7 prochains jours.

---

## 15. Module Entretiens (côté Recruteur)

**Page** : `/recruteur/entretiens`
**API** : `GET/POST /api/entretiens`, `GET/PUT/DELETE /api/entretiens/[id]`
**Prisma** : modèle `Entretien` (migration requise : `npx prisma db push`)

### Comment ça marche

Le recruteur planifie un entretien en sélectionnant une candidature existante, en donnant un titre, une date/heure, un type (Visio/Téléphone/Présentiel) et un lieu/lien optionnel.

**Workflow** :
1. `PLANIFIE` → boutons "Feedback", "Marquer réalisé" (✓), "Annuler" (✗)
2. "Feedback" ouvre un dialog pour noter (1–5 étoiles) et saisir un commentaire → passe le statut à `REALISE`
3. `REALISE` / `ANNULE` → lecture seule, modification via le bouton crayon

**Modèle Prisma** :
```
Entretien { id, applicationId, recruteurId, titre, dateHeure, type (PRESENTIEL|VISIO|TELEPHONE),
            lieu, notes, feedback, evaluation (1–5), statut (PLANIFIE|REALISE|ANNULE) }
```

Relié à `Application` (cascade delete) et `Recruteur`. L'entrée "Entretiens" est ajoutée dans la sidebar recruteur (`components/app-sidebar.tsx`).

---

## Récapitulatif des fichiers créés

```
app/
├── api/
│   ├── notifications/route.ts          # GET (liste) + PUT (tout marquer lu)
│   ├── notifications/[id]/route.ts     # PUT (marquer un seul lu)
│   ├── objectifs/route.ts              # POST
│   ├── objectifs/[id]/route.ts         # PUT, DELETE
│   ├── candidatures/[id]/notes/route.ts# GET, POST, DELETE
│   └── candidat-matching/route.ts      # POST (scoring algorithmique)
├── candidat/
│   ├── dashboard/page.tsx              # Tableau de bord avec stats
│   ├── matching/page.tsx               # Matching IA
│   ├── offres/page.tsx                 # Parcourir + postuler
│   ├── entretiens/page.tsx             # Notes par candidature
│   └── notifications/page.tsx          # Centre de notifications
└── (public)/
    └── profil/[candidatId]/page.tsx    # Profil public partageable

components/candidat/
├── ProfilCompletion.tsx                # Barre de progression profil
└── SkillRecommendations.tsx            # Suggestions de compétences

lib/
├── api/objectifs/
│   ├── repository.ts
│   ├── service.ts
│   └── index.ts
├── hooks/
│   ├── use-notifications.ts
│   ├── use-alertes.ts
│   └── use-experiences.ts
├── prisma.ts                           # Fix singleton + connectionLimit 15
└── socket.ts                           # Fix reconnexion silencieuse
```
