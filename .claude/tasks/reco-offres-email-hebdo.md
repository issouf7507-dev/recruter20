# Tâche — Recommandations d'offres par email (hebdomadaire, façon LinkedIn)

> **Statut : PLAN — en attente de ta validation avant que je code.**
> Portée : **email uniquement**.

## Nouvelle logique (ce que tu veux)

- **Ce n'est plus le candidat qui crée une alerte.** L'envoi est **activé par défaut**
  pour tout le monde ; le candidat peut seulement l'**activer / désactiver**.
- En **arrière-plan, chaque semaine**, on envoie au candidat **3 à 4 offres max**,
  **pertinentes selon son profil** (façon « jobs for you » LinkedIn).

## Le « lien candidat ↔ offre » : il existe, à extraire

La logique de pertinence **existe déjà** mais elle est **enfermée dans une route**
(`app/api/candidat-matching/route.ts`) :

- charge le profil complet du candidat (compétences, expériences, formations, niveau…),
- score chaque offre active via `calculateMatches` / `calculateMatchScore` (`lib/matching/scoring.ts`),
- trie par score décroissant.

👉 **Action : extraire ça dans une fonction réutilisable** — c'est le « lien » à créer.

```
lib/matching/recommendOffers.ts
  → recommendOffersForCandidat(candidatId, { limit, excludeOffreIds? }): Promise<{ offre, score }[]>
```

Puis on **branche la route existante ET le cron dessus** (source unique de vérité).

## Décisions (défauts retenus)

### 1. Schéma

Sur le modèle **`Candidat`** :

- `recommandationsEmail Boolean @default(true)` → **opt-in par défaut**, activable/désactivable.
- `dernierEmailReco DateTime?` → cadence hebdo + anti-répétition.

Nouvelle table **`OffreRecommandee`** (persiste le lien candidat↔offre déjà proposé) :

```prisma
model OffreRecommandee {
  id         String   @id @default(cuid())
  candidatId String
  jobOfferId String
  score      Int
  sentAt     DateTime @default(now())
  candidat   Candidat @relation(fields: [candidatId], references: [id], onDelete: Cascade)
  jobOffer   JobOffer @relation(fields: [jobOfferId], references: [id], onDelete: Cascade)

  @@unique([candidatId, jobOfferId])   // ne jamais reproposer la même offre
  @@index([candidatId])
}
```

→ sert à (a) **ne pas reproposer** une offre déjà envoyée, (b) tracer/analyser plus tard.
Appliqué via `prisma db push` (convention projet).

### 2. Le cron hebdomadaire

`GET /api/cron/reco-offres` (protégé par `CRON_SECRET`, `503` si absent), même méca que
les rappels d'entretien. Crontab **hebdomadaire** (ex. lundi 8h). Logique :

1. Charger **une fois** toutes les offres actives (`etat: active`, non supprimées).
2. Pour chaque candidat avec `recommandationsEmail = true` **et** `dernierEmailReco`
   > 6 jours (ou null) :
   - `recommendOffersForCandidat(candidatId, { excludeOffreIds: [déjà recommandées + déjà candidatées] })`,
   - garder les **4 meilleures** au-dessus d'un score plancher (ex. `minScore = 40`),
   - si 0 offre pertinente → **on n'envoie rien** (anti-spam), on ne touche pas la date,
   - sinon : email + notif DB `JOB_ALERT_NEW_MATCHES` + insert `OffreRecommandee`
     - `dernierEmailReco = now`.
3. Récap `{ candidatsTraites, emailsEnvoyes, ignores }`.

> Perf : on score en mémoire (offres chargées une fois). Si le volume de candidats
> devient gros, on paginera/limitera par passage — noté pour plus tard.

### 3. Template email `sendJobRecommendationsEmail`

Dans `lib/email.ts` (gabarit sombre `notificationShell`) :

- titre « Des offres pour vous », sous-titre « Sélection de la semaine »,
- **3-4 cartes** d'offres (intitulé, entreprise, lieu, type, lien vers l'offre),
- CTA « Voir toutes les offres »,
- footer : lien « Gérer mes préférences » → paramètres candidat (désactivation).

### 4. UI — activer/désactiver

- Un simple **Switch** « Recevoir des offres par email chaque semaine » dans les
  paramètres candidat (`app/candidat/parametres/page.tsx`), lié à `recommandationsEmail`.
- Server action `setRecommandationsEmail(enabled)` (upsert, gardée par la session).

## Fichiers touchés (prévision)

- `prisma/schema.prisma` — champs sur `Candidat` + table `OffreRecommandee` (+ `db push`)
- `lib/matching/recommendOffers.ts` _(nouveau)_ — **le lien** réutilisable
- `app/api/candidat-matching/route.ts` — refactor pour utiliser la fonction extraite
- `lib/email.ts` — `sendJobRecommendationsEmail`
- `app/api/cron/reco-offres/route.ts` _(nouveau)_ — le cron hebdo
- `lib/actions/candidatPreferences.ts` _(nouveau)_ — toggle on/off
- `app/candidat/parametres/page.tsx` — le Switch
- `TODO.md` — ligne crontab + avancement

## Points à confirmer avant que je commence

- [ ] **4 offres max** par email — OK ? (tu as dit « 3 max 4 »)
- [ ] **Opt-in par défaut** (tout le monde reçoit, sauf désactivation) — OK ?
- [ ] Ne **jamais reproposer** une offre déjà envoyée (table `OffreRecommandee`) — OK ?
- [ ] **Score plancher** (ex. 30 %) sous lequel on n'envoie pas d'offre médiocre — OK ? quelle valeur ?
- [ ] Crontab **hebdomadaire** (ex. lundi 8h) — OK ?
- [ ] **La feature « Alertes emploi » manuelle existante** (`AlerteEmploi` + `AlertesSection`)
      → on la **laisse telle quelle** en parallèle, ou tu veux qu'on la retire/masque
      puisque les reco deviennent automatiques ? (à trancher)
