# TODO YLSIX — Plan post-audit Google Analytics

> Source : audit GA (1er janv → 3 juil. 2026). Constat central : **acquisition correcte
> (~2 200 utilisateurs actifs, surtout nouveaux), mais rétention faible**. Priorité =
> transformer les visiteurs en utilisateurs récurrents.

On avance **point par point**. Cocher au fur et à mesure.

---

## ✅ Fait

- [x] **Super admin — blocage utilisateur** (schéma `blocked`/`blockedAt`/`blockedReason`,
      refus de reconnexion, suppression des sessions, UI dans le sheet + table).
      *Reste à commit sur `dev-review`.*

---

## 🔴 Priorité haute (plan 90 jours)

### 1. Notifications — EMAIL (en cours)
> On ne fait **que les emails** pour l'instant (Push/WhatsApp plus tard).
> Envoi transactionnel via **Brevo** (API HTTP `/smtp/email`, clé `BREVO_API_KEY`) — bascule depuis Resend.
> Infra : `lib/email.ts` (adaptateur `sendMail` Brevo), table `Notification`, enum `NotificationType`.
> Bouton de test d'envoi dans le dashboard superadmin.
> ⚠️ Expéditeur `contact@ylsix.com` : doit être un **sender validé** (ou domaine authentifié) dans Brevo.

- [x] Auditer l'existant (`Notification` model, `emailService`) et lister les événements
- [x] **Helper central `notify()`** (`lib/notify.ts`) : crée la notif DB **+** envoie l'email (fire-and-forget)
- [x] Templates email manquants dans `emailService` :
  - [x] `sendApplicationStatusEmail` (candidat)
  - [x] `sendNewApplicationEmail` (recruteur)
  - [x] `sendOfferStatusEmail` (recruteur — publiée / clôturée)
  - [x] `sendInterviewReminderEmail` (candidat) — template prêt, câblage cron à faire
- [ ] Brancher les events :
  - [x] Statut de candidature → candidat (route `recruteurs/[id]/candidatures` PUT)
  - [x] Nouvelle candidature → recruteur (route `candidatures` POST)
  - [x] Offre publiée / clôturée → recruteur (`offres` POST + `offres/[id]` PUT ; `expiree` = clôturée)
  - [x] Rappel d'entretien → candidat (champ `reminderSentAt` + endpoint `GET /api/cron/interview-reminders` protégé par `CRON_SECRET`)
    - [ ] **Ops** : définir `CRON_SECRET` dans le `.env` du VPS + ajouter la ligne crontab (voir bas de fichier)

### 1-bis. Notifications — Push / WhatsApp (plus tard)
- [ ] Notifications **Push** (web push) — infra + opt-in utilisateur
- [ ] Notifications **WhatsApp** — choix du provider + intégration
- [ ] Centre de préférences de notifications (par canal / par type)

### 2. Recommandations d'offres par email (hebdo, façon LinkedIn) — FAIT
> Plan : `.claude/tasks/reco-offres-email-hebdo.md`. Opt-in par défaut, 4 offres max,
> score plancher 30 %, jamais de doublon.
- [x] Extraction du « lien candidat↔offre » réutilisable (`lib/matching/recommendOffers.ts`)
- [x] Refactor `candidat-matching` sur la fonction extraite
- [x] Schéma : `Candidat.recommandationsEmail` + `dernierEmailReco` + table `OffreRecommandee`
- [x] Template `sendJobRecommendationsEmail`
- [x] Cron hebdo `GET /api/cron/reco-offres` (protégé `CRON_SECRET`)
- [x] Toggle candidat (onglet Notifications des paramètres)
- [x] Retrait de l'UI d'alertes manuelle (`AlerteEmploi`) : page `/candidat/alertes`, lien
      sidebar, carte dashboard, onglet dans la fiche candidat → l'activation passe
      désormais par le seul switch (Paramètres → Notifications).
      Modèle + API + données **conservés** (réversible, UI seulement masquée).
- [ ] **Ops** : ajouter la ligne crontab hebdo (voir bas de fichier)
- [ ] Reste possible plus tard : fréquence « Immédiate » (à la publication d'une offre)

### 3. Correction des erreurs 404 / liens cassés
- [ ] Recenser les liens cassés (source GA + crawl interne)
- [ ] Corriger les routes / redirections
- [ ] Améliorer la page `not-found.tsx` (retour vers offres / recherche)

### 4. SEO
- [ ] Metadata dynamiques (title/description/OG) sur les pages offres + publiques
- [ ] Sitemap + robots.txt
- [ ] Données structurées `JobPosting` (schema.org) sur les offres

---

## 🟠 Priorité moyenne

### 5. Blog RH optimisé SEO
- [ ] Structure de contenu (routes, modèle article, éditeur)
- [ ] Premiers articles + maillage interne

### 6. IA — matching & recommandations
- [ ] Recommandations d'offres personnalisées côté candidat
- [ ] Renforcer le matching existant

### 7. Dashboard recruteur enrichi
- [ ] Nouveaux indicateurs / vues à définir

### 8. Gamification / fidélisation
- [ ] Mécaniques de rétention (à cadrer)

### 9. Partenariats
- [ ] Écoles, universités, cabinets RH (surtout produit/business, peu de code)

---

## ⚙️ Ops — cron rappels d'entretien
1. Générer un secret et l'ajouter au `.env` du VPS :
   ```
   CRON_SECRET=<chaîne aléatoire ≥ 16 caractères>
   ```
2. Ajouter les lignes crontab — `crontab -e` :
   ```
   # Rappels d'entretien (toutes les heures)
   0 * * * * curl -s -H "Authorization: Bearer LE_SECRET" https://ylsix.com/api/cron/interview-reminders > /dev/null
   # Recommandations d'offres (lundi 8h)
   0 8 * * 1 curl -s -H "Authorization: Bearer LE_SECRET" https://ylsix.com/api/cron/reco-offres > /dev/null
   ```
   → rappels : candidats dont l'entretien tombe dans les 24 h (1×via `reminderSentAt`).
   → reco : candidats opté-in, jusqu'à 4 offres pertinentes, sans doublon.
   Tant que `CRON_SECRET` n'est pas défini, les endpoints renvoient `503` (désactivés).

## 📊 KPI cibles (audit)
- Utilisateurs récurrents > 35 %
- Temps moyen > 3 min · Pages/session > 5
- Conversion visiteur → inscription > 15 %
- Rétention à 30 jours > 25 %
