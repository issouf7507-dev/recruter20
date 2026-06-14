# Analyse côté Recruteur — Suggestions d'amélioration

## Ce que tu as déjà — Points forts

La plateforme est ambitieuse et bien construite. Le stack technique est solide (Next.js App Router, Prisma, React Query, Socket.io) et tu couvres l'essentiel du cycle de recrutement :

| Domaine | Niveau |
|---|---|
| Gestion des offres | Très complet |
| Kanban pipeline | Excellent (cards, checklists, labels, pièces jointes) |
| Matching + AI (Claude) | Bon concept |
| Messagerie temps réel | Présent |
| Collaboration équipe | Bien pensé (rôles ADMIN/MANAGER/VIEWER) |
| Multi-diffusion LinkedIn | Différenciant |
| Abonnements / paiement | Opérationnel (GeniusPay) |

---

## Points faibles / manques identifiés

**1. Pas de module d'entretiens**
C'est le vide le plus critique. Tu gères les candidatures mais il n'y a aucune notion de planification d'entretien (date, type, intervenant, feedback structuré). Le recruteur doit sortir de la plateforme pour gérer ça.

**2. Dashboard trop basique**
Juste un compteur d'offres/candidatures + un graphique 30 jours. Pas de vision funnel (combien passent de "En attente" → "Accepté"), pas de time-to-hire, pas d'alerte sur les offres qui stagnent.

**3. Pas de formulaire de pré-qualification**
Les candidats postulent avec un CV mais il n'y a pas de questions de screening personnalisées par offre (ex : "Avez-vous une voiture ?", "Quel est votre prétention salariale ?").

**4. Pas d'automatisation / workflow**
Tout est manuel. Aucun déclencheur automatique : pas d'email de confirmation automatique au candidat, pas de rappel si une candidature est en attente depuis X jours.

**5. Statistiques peu actionnables**
La page `/statistiques` existe mais les métriques sont basiques. Pas d'export CSV/PDF, pas de comparaison entre périodes, pas d'analyse source des candidats.

**6. Messagerie limitée**
Pas de templates de messages, pas de messages groupés, pas de pièces jointes dans le chat.

**7. Recherche CV peu mise en avant**
`/recherche-cv` et `/recherche-candidats` sont deux pages séparées alors qu'elles devraient être unifiées avec une vraie interface de sourcing.

---

## Suggestions d'améliorations prioritaires

### Court terme (quick wins)

**A. Améliorer le Dashboard**
Ajouter un funnel de conversion visuel (Postulés → En révision → Entretien → Accepté), les offres qui expirent bientôt, et les candidatures sans réponse depuis +5 jours.

**B. Templates de messages**
Dans la messagerie, permettre de créer et réutiliser des templates (convocation, refus, demande de disponibilité). Gain de temps énorme pour les recruteurs.

**C. Export des données**
Bouton "Exporter en CSV/PDF" sur les pages candidatures et statistiques.

### Moyen terme (fonctionnalités structurantes)

**D. Module Entretiens** *(le plus important)*

```
Offre → Candidature → [Entretien planifié] → Décision finale
```

- Date/heure, type (présentiel, visio, téléphone)
- Lien visio généré (Google Meet / Zoom)
- Intervenants internes assignés
- Grille d'évaluation structurée post-entretien
- Sync Google Calendar / Outlook

**E. Questionnaire de pré-sélection par offre**
Le recruteur configure des questions (QCM, texte libre, oui/non) à remplir lors de la candidature. Ça filtre en amont et réduit le volume de CVs à lire.

**F. Automatisations simples**
Un builder de règles : *"Si candidature en attente depuis 7 jours → envoyer email automatique"* ou *"Si offre expirée → notifier le recruteur"*. Pas besoin que ce soit complexe, juste 3-4 déclencheurs prédéfinis.

**G. Score candidat unifié**
Actuellement le matching donne un score mais il n'est pas persisté sur la candidature. Afficher un score global (matching + évaluation manuelle + résultats questionnaire) directement sur la card Kanban.

### Long terme (différenciation)

**H. Entretien vidéo asynchrone**
Le candidat enregistre ses réponses vidéo à des questions prédéfinies. Le recruteur regarde quand il veut. Très tendance dans les recrutements à volume.

**I. Extension Chrome pour sourcing LinkedIn**
Un outil de scraping de profils LinkedIn → import direct dans la base candidats. Fort différenciant vs concurrents.

**J. Rapport de recrutement automatique**
PDF hebdomadaire/mensuel envoyé par email au recruteur avec les KPIs : offres actives, taux de conversion, temps moyen par étape.

**K. RGPD / Gestion du consentement**
Date limite de conservation des CVs, demande de suppression par candidat, registre des traitements. Important pour les clients entreprises sérieux.

---

## Priorité suggérée

| Priorité | Fonctionnalité | Impact |
|---|---|---|
| 1 | Module Entretiens | Comble le vide le plus visible |
| 2 | Dashboard enrichi | ROI immédiat sur l'usage quotidien |
| 3 | Questionnaire pré-sélection | Valeur ajoutée forte pour les recruteurs |
| 4 | Templates messages | Quick win, peu de dev |
| 5 | Automatisations | Différenciant sur le marché |
