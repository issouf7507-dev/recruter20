# 🔍 Système de Matching Alertes ↔ Offres

## ✅ Ce qui a été créé

### 1. Matcher Service

**Fichier:** `lib/api/alertes/matcher.ts`

Service dédié au matching entre alertes et offres d'emploi.

```typescript
export class AlerteMatcher {
  // Trouve toutes les offres correspondant à une alerte
  async findMatchingOffers(alerte: AlerteEmploi)
  
  // Compte le nombre d'offres correspondantes
  async getMatchingOffersCount(alerte: AlerteEmploi)
  
  // Met à jour toutes les alertes d'un candidat
  async updateAllAlertsCount(candidatId: string)
}
```

### 2. Route API

**GET** `/api/alertes/[id]/matches`

Récupère les offres correspondant à une alerte.

### 3. Composant UI

**Fichier:** `app/components/publicc/candidat-sections/AlerteMatchesDialog.tsx`

Dialog qui affiche les offres correspondantes avec :
- Titre, entreprise, localisation
- Salaire, type de contrat
- Description
- Lien vers la page de l'offre

---

## 🎯 Algorithme de matching

### Critères de correspondance

L'algorithme compare les critères de l'alerte avec les champs de l'offre :

#### 1. Filtres stricts (SQL WHERE)

```typescript
// Offres actives uniquement
etat: "active"
deletedAt: null

// Localisation (recherche partielle, insensible à la casse)
location CONTAINS alerte.localisation

// Type de contrat
type CONTAINS alerte.typeContrat

// Expérience
experience CONTAINS alerte.experience

// Salaire min : l'offre doit proposer au moins ce montant
salaryMax >= alerte.salaireMin

// Salaire max : l'offre ne doit pas dépasser ce montant
salaryMin <= alerte.salaireMax
```

#### 2. Filtrage textuel (JavaScript après récupération)

```typescript
// Recherche dans : title + description + skills
const searchText = `${offre.title} ${offre.description} ${offre.skills}`.toLowerCase();

// Vérifier le titre de l'alerte (mots séparés)
const titreWords = alerte.titre.split(" ");
// Au moins un mot doit être présent
titreWords.some(word => searchText.includes(word))

// Vérifier les mots-clés personnalisés
motsCles.some(motCle => searchText.includes(motCle.toLowerCase()))
```

---

## 🔄 Workflow complet

### Scénario : Candidat crée une alerte

```
┌────────────────────────────────────────────────┐
│ 1. Candidat crée une alerte                   │
│    Titre: "Développeur Full Stack"            │
│    Localisation: "Paris"                       │
│    Salaire: 40k-60k€                           │
│    Mots-clés: ["React", "Node.js"]             │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│ 2. Création dans la base de données           │
│    POST /api/alertes                           │
│    → AlerteEmploi créée                        │
│    → AlerteMotCle créés                        │
│    → nombreResultats = 0 (initial)             │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│ 3. Candidat clique "X résultats"              │
│    → Ouvre AlerteMatchesDialog                 │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│ 4. Chargement des offres correspondantes      │
│    GET /api/alertes/[id]/matches               │
│    → AlerteMatcher.findMatchingOffers()        │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│ 5. Matching algorithme                        │
│                                                │
│ Étape A: Filtres SQL                          │
│ - Offres actives à Paris                      │
│ - Salaire entre 40k-60k                        │
│                                                │
│ Étape B: Filtres textuels                     │
│ - Titre contient "Full Stack" ?               │
│ - Description contient "React" ou "Node.js" ?  │
│                                                │
│ → Résultat: 12 offres trouvées                │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│ 6. Mise à jour de l'alerte                    │
│    nombreResultats = 12                        │
│    derniereMiseAJour = maintenant              │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────┐
│ 7. Affichage dans le dialog                   │
│    - Liste de 12 offres                        │
│    - Lien "Voir l'offre" pour chaque résultat  │
│    - Bouton "Postuler" disponible              │
└────────────────────────────────────────────────┘
```

---

## 🎨 Interface utilisateur

### Dans AlertesSection

Chaque carte d'alerte affiche :
- Titre, critères (badges)
- Switch actif/inactif
- **Bouton "X résultats"** → Clique pour voir les offres

### Dans AlerteMatchesDialog

**Écran modal plein écran** qui affiche :
- Nombre total d'offres trouvées
- Liste des offres avec :
  - Logo entreprise
  - Titre du poste
  - Localisation, type de contrat
  - Salaire
  - Description (2 lignes max)
  - Date de publication
  - Bouton "Voir l'offre" (ouvre dans nouvel onglet)

**État vide :**
- Icône œil
- Message "Aucune offre trouvée"
- Texte explicatif

---

## 📊 Exemples de matching

### Exemple 1 : Alerte large

**Alerte :**
```json
{
  "titre": "Développeur",
  "localisation": "Remote",
  "typeContrat": "",
  "salaireMin": 30000
}
```

**Offres matchées :**
- Tous les postes avec "Développeur" dans le titre
- Localisation = "Remote"
- Salaire max >= 30000€

**Résultat :** 25 offres

---

### Exemple 2 : Alerte précise

**Alerte :**
```json
{
  "titre": "Data Engineer Senior",
  "localisation": "Paris",
  "typeContrat": "CDI",
  "salaireMin": 50000,
  "salaireMax": 70000,
  "experience": "Senior",
  "motsCles": ["Python", "Spark", "AWS"]
}
```

**Offres matchées :**
- Titre contient "Data" OU "Engineer"
- Localisation contient "Paris"
- Type = CDI
- Salaire entre 50k-70k
- Expérience = Senior
- Description contient "Python" OU "Spark" OU "AWS"

**Résultat :** 3 offres très ciblées

---

## 🔄 Mise à jour automatique (à implémenter)

Pour que les alertes soient vraiment utiles, créer un job CRON :

```typescript
// lib/jobs/check-alerts.ts
import { alerteMatcher } from "@/lib/api/alertes";
import prisma from "@/lib/prisma";

export async function checkAlertsJob() {
  // Récupérer toutes les alertes actives
  const alertes = await prisma.alerteEmploi.findMany({
    where: { active: true },
    include: { candidat: { include: { user: true } }, alerteMotsCles: true },
  });

  for (const alerte of alertes) {
    // Vérifier la fréquence
    const shouldCheck = checkFrequency(
      alerte.derniereMiseAJour,
      alerte.frequence
    );

    if (!shouldCheck) continue;

    // Trouver les offres correspondantes
    const matchingOffers = await alerteMatcher.findMatchingOffers(alerte);

    // Mettre à jour le compteur
    await prisma.alerteEmploi.update({
      where: { id: alerte.id },
      data: {
        nombreResultats: matchingOffers.length,
        derniereMiseAJour: new Date(),
      },
    });

    // Créer une notification si nouvelles offres
    if (matchingOffers.length > 0) {
      await prisma.notification.create({
        data: {
          recipientId: alerte.candidat.userId,
          recipientType: "CANDIDAT",
          type: "JOB_ALERT_NEW_MATCHES",
          data: {
            alerteId: alerte.id,
            alerteTitre: alerte.titre,
            offresCount: matchingOffers.length,
            offres: matchingOffers.slice(0, 5), // Top 5
          },
        },
      });
    }
  }
}

function checkFrequency(lastCheck: Date, frequence: string): boolean {
  const now = new Date();
  const diff = now.getTime() - lastCheck.getTime();
  const hours = diff / (1000 * 60 * 60);

  switch (frequence) {
    case "Quotidienne":
      return hours >= 24;
    case "Hebdomadaire":
      return hours >= 24 * 7;
    case "Mensuelle":
      return hours >= 24 * 30;
    default:
      return false;
  }
}
```

---

## 🚀 Utilisation

### Côté candidat

1. **Créer une alerte** dans l'onglet "Alertes"
2. **Configurer les critères** (titre, localisation, salaire, etc.)
3. **Cliquer sur "X résultats"** pour voir les offres correspondantes
4. **Modal s'ouvre** avec la liste des offres
5. **Cliquer "Voir l'offre"** pour consulter et postuler

### Côté code

```typescript
// Dans AlertesSection
const handleViewMatches = (alerteId: string, titre: string) => {
  setViewingAlerteId(alerteId);
  setViewingAlerteTitre(titre);
};

// Ouvre le dialog qui :
// 1. Charge les offres via GET /api/alertes/[id]/matches
// 2. Affiche les résultats
// 3. Met à jour le compteur
```

---

## 📝 Critères de matching

| Critère alerte | Champ offre | Type de matching |
|----------------|-------------|------------------|
| titre | title, description, skills | Recherche textuelle |
| localisation | location | CONTAINS (partiel) |
| typeContrat | type | CONTAINS (partiel) |
| experience | experience | CONTAINS (partiel) |
| salaireMin | salaryMax | >= (offre doit proposer au moins) |
| salaireMax | salaryMin | <= (offre ne doit pas dépasser) |
| motsCles | title, description, skills | ANY mot-clé présent |

---

## ✅ État actuel

**Fonctionnel :**
- ✅ Création/modification/suppression d'alertes
- ✅ Gestion des mots-clés
- ✅ Algorithme de matching intelligent
- ✅ Affichage des résultats en temps réel
- ✅ Compteur mis à jour à la demande

**À ajouter (optionnel) :**
- ⏳ Job CRON automatique
- ⏳ Notifications push
- ⏳ Email de notification
- ⏳ Historique des alertes déclenchées

---

**✅ Le système d'alertes est maintenant complet avec matching et affichage des résultats !** 🎉

Le candidat peut :
1. Créer une alerte avec ses critères
2. Voir instantanément combien d'offres correspondent
3. Consulter la liste des offres matchées
4. Postuler directement depuis les résultats

