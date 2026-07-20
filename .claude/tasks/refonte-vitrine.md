# Refonte du site vitrine — inspiration GRB (grb.uk.com), couleurs Ylsix

## Cadrage validé
- **Périmètre** : site public / vitrine uniquement (`app/(public)/…`). L'app connectée (dashboards candidat/recruteur) n'est PAS touchée.
- **Fidélité** : inspiration **textuelle** — on reprend la **structure des sections** et la **mise en page** de GRB, réécrites/rebrandées Ylsix. Composants et couleurs à nous.
- **Couleurs** : tokens existants (`app/globals.css`) — primaire `#a590ff`, `--y-primary-600 #8c74ff`, `--y-primary-700 #7c5cbf`, fonds crème `--y-bg #FAF8F5` / blanc, encres `--y-ink`. Police **Geist** conservée.
- **Méthode** : ce plan validé AVANT tout code.

## Ce qui existe déjà (à réutiliser / remplacer)
- Layout public : `app/(public)/layout.tsx` → `Header`, `Footer` (`components/public/`), `LenisProvider` (smooth scroll), Framer Motion déjà utilisé.
- Page d'accueil actuelle : `app/(public)/page.tsx` assemble 8 sections dans `_sections/` : Hero, Stats, Features, Mission, Testimonials, Pricing, FAQ, CTA.
- **Offres réelles** : page `app/(public)/offres` + API → la section « offres en vedette » peut afficher de vraies données.
- Autres pages vitrine existantes : `a-propos`, `contact`, `fonctionnalites`, `tarifs`.

---

## Structure GRB → nouvelle structure Ylsix (page d'accueil)

Ordre des sections de GRB, transposé. Chaque ligne = une section de la nouvelle home.

| # | Section GRB | Section Ylsix (nouvelle) | Contenu / mise en page | Données |
|---|---|---|---|---|
| 1 | Header (Job search, Job seekers, Recruiters, About) + Join/Login | **Header** : Offres · Candidats · Recruteurs · Tarifs · À propos + boutons *Se connecter* / *Créer un compte* | Barre sticky, méga-menu léger sur « Offres » | statique |
| 2 | Hero « Get the career you deserve » + toggle + recherche | **Hero** « Trouvez le poste que vous méritez » — toggle **Candidat / Recruteur**, champ de recherche d'offres, suggestions | Titre fort, sous-titre, search bar, 2 chips stats | statique + lien /offres |
| 3 | Featured Opportunities (carousel de jobs) | **Offres en vedette** — carousel/grille de cartes offre (intitulé, entreprise, localisation, salaire) | Cartes horizontales scrollables | **réelles** (API offres) |
| 4 | « Early talent experts » + Register CV / Hire talent | **« Les experts du recrutement digital »** — pitch + 2 CTA *Déposer mon CV* / *Recruter* | Bloc texte centré + 2 boutons | statique |
| 5 | Value proposition (équipes sectorielles) | **Notre approche** — matching IA + accompagnement | 2 colonnes texte/visuel | statique |
| 6 | « Who is hiring right now? » (6 cartes secteurs) | **« Qui recrute en ce moment ? »** — grille de secteurs/métiers | 6 cartes secteur (nom + « voir les offres ») | statique (liens /offres?secteur=) |
| 7 | « Browse jobs by course » (grille 6 col) | **« Explorer par métier »** — grille de familles de métiers | Grille 6 tuiles avec visuel | statique |
| 8 | Career guidance « We will equip you… » (4 cartes) | **« On vous donne les clés »** — 4 cartes ressources (CV, entretien, lettre de motivation, conseils carrière) | 4 cartes « En savoir plus » | statique |
| 9 | Testimonials « Loved by our community » | **Témoignages** « Ils avancent avec Ylsix » | Citations + note/logo | statique (réutilise TestimonialsSection) |
| 10 | Employer services « Trusted by leading employers » | **Espace recruteurs** « La confiance des entreprises qui recrutent » | Bandeau + logos clients + CTA *Découvrir l'offre recruteur* | statique |
| 11 | Article Hub (5 cartes articles) | **Ressources / Blog** — 3 à 5 cartes articles | Grille de cartes (tag, titre, extrait) | statique (placeholder, cf. Q3) |
| 12 | CTA « Register your free account now » | **CTA final** « Créez votre compte gratuit » | Bandeau violet + 2 boutons | statique (réutilise CTASection) |
| 13 | Footer (logo, socials, sitemap, légal, contact) | **Footer** enrichi : logo, réseaux, plan du site, mentions légales, contact | 4 colonnes + back-to-top | statique |

### Bilan par section
- **Réutilisées/adaptées** : Hero (enrichie), Testimonials, CTA, Stats (peut alimenter §4/5).
- **Nouvelles** : Offres en vedette (#3), Experts (#4), Approche (#5), Qui recrute (#6), Explorer par métier (#7), Ressources/clés (#8), Espace recruteurs (#10), Blog (#11).
- **Header/Footer** : refonte alignée sur la nouvelle nav.

---

## Découpage technique

- Un fichier par section dans `app/(public)/_sections/` (convention actuelle conservée) :
  - `FeaturedOffersSection.tsx`, `ExpertsSection.tsx`, `ApproachSection.tsx`, `SectorsSection.tsx`, `BrowseByJobSection.tsx`, `ResourcesKeysSection.tsx`, `EmployersSection.tsx`, `BlogSection.tsx` (+ Hero/Testimonials/CTA revus).
- `app/(public)/page.tsx` réassemblé dans le nouvel ordre.
- `components/public/Header.tsx` + `Footer.tsx` mis à jour (nav + colonnes).
- Styles : tokens `--y-*` + classes Tailwind existantes ; animations Framer Motion `whileInView` comme le reste du site. Pas de nouvelle dépendance.
- Accessibilité/responsive : grilles `grid-cols-1 md:…`, contrastes respectés, focus visibles.

## Hors périmètre (ne bouge pas)
- Espaces connectés `app/candidat/*`, `app/recruteur/*`, `app/superadmin/*`.
- Auth (login/register/mot de passe oublié) — sauf si tu le demandes plus tard.
- Logique API / données.

---

## Questions à trancher avant que je code

1. **Offres en vedette (#3)** : je branche sur les **vraies offres** (les plus récentes) via l'API existante, OK ? (sinon cartes statiques de démo)
2. **Secteurs & métiers (#6/#7)** : tu veux une **liste précise** (ex. Tech/IT, Commerce, Finance, Marketing, RH, Santé…) ou je propose une liste par défaut que tu ajusteras ?
3. **Blog / Ressources (#11)** : as-tu déjà des articles/contenus ? Sinon je mets des **cartes placeholder** (titres + extraits factices) reliées à une page `/ressources` à créer plus tard — OK ?
4. **Logos clients (#10)** : tu as des logos d'entreprises à afficher, ou je mets des placeholders neutres ?
5. **Textes** : je rédige tous les textes en français, ton pro et chaleureux façon GRB. Tu valideras au fil de l'eau ou tu veux relire un doc de copy d'abord ?

## Étapes d'implémentation (après validation)
1. Header + Footer (nouvelle nav / colonnes).
2. Hero enrichie + Offres en vedette.
3. Sections milieu (#4 → #8).
4. Espace recruteurs + Blog + CTA final.
5. Réassemblage `page.tsx`, passe responsive + polish animations.
6. `npx tsc --noEmit` + revue visuelle (`npm run dev`).
