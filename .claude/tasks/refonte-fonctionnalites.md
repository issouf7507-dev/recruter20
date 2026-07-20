# Refonte design — page `/fonctionnalites`

Suite de `refonte-vitrine.md`. Même langage visuel que la home refondue.

## État actuel (à remplacer)
`app/(public)/fonctionnalites/page.tsx` (496 l.) — ancien style :
- fond `bg-gray-50`, bannière image `/img/banniereweb_.png` avec texte noir sur image
- couleurs en dur `text-[#a590ff]`, `bg-white`, `border-gray-100` (pas de tokens `--y-*`)
- icônes sans fond (les `div` conteneurs ont perdu leur `bg-`), classes vides `rounded-xl   transition-shadow`
- 3 sections quasi identiques (2 grilles de 6 cartes + 1 grille de 4) → monotone
- CTA final `bg-[#a590ff]` plat

## Langage cible (repris de la home)
- Tokens : `--y-bg`, `--y-bg-pure`, `--y-ink/-2/-3`, `--y-primary-50/700`, `--y-line`, `--y-shadow-sm/lg/violet`
- Sections : `mt-24 md:mt-32 px-6 md:px-12 lg:px-20` + `max-w-7xl mx-auto`
- En-tête de section : kicker `text-sm font-semibold` violet → `h2 text-3xl→5xl font-semibold tracking-[-0.03em]` → chapô `--y-ink-2`
- Cartes : `rounded-2xl p-6`, `--y-bg-pure`, `boxShadow: var(--y-shadow-sm)` ou `inset 0 0 0 1px var(--y-line)`, `hover:-translate-y-1`
- Bloc héros : dégradé `linear-gradient(155deg,#7c5cbf,#5f47a0,#4a3781)` + `.yl-orb` + `.yl-stripes`
- Animations Framer Motion `whileInView` + `viewport once`

## Nouvelle structure

| # | Section | Contenu |
|---|---------|---------|
| 1 | **Héros** | Bloc violet arrondi `rounded-[32px]` (comme HeroSection) : badge « La plateforme ATS Ylsix », titre « Tout ce qu'il faut pour recruter — et pour être recruté », chapô, 2 CTA (Essai gratuit / Voir les tarifs). À droite : mockup **Kanban** en CSS (3 colonnes, cartes candidats) au lieu de la bannière image. |
| 2 | **Chiffres** | 4 stats (160+ jobboards · 40% de temps gagné · 500+ entreprises · 10K+ recrutements) en ligne, séparateurs `--y-line`, pas de bloc blanc lourd. |
| 3 | **Sélecteur Recruteur / Candidat** | Toggle sticky (2 pills) qui filtre la grille de fonctionnalités → supprime la répétition des 2 grilles identiques et rend la page interactive. `useState`, animation de bascule. |
| 4 | **3 fonctionnalités phares** (alternées) | Blocs texte/visuel alternés gauche-droite avec mini-mockups CSS : **Kanban drag & drop**, **Multi-diffusion 160+ jobboards** (badges LinkedIn/Indeed/…), **Statistiques** (barres). Chaque bloc : kicker, titre, 3 bénéfices avec `Check`. |
| 5 | **Grille complète** | Les 12 fonctionnalités restantes (recruteur + candidat selon le toggle) en cartes `rounded-2xl` avec icône sur pastille `--y-primary-50` + liste de bénéfices. |
| 6 | **Plateforme** | Bande **sombre** (`--y-bg-ink`) pour rythmer la page : Sécurité/RGPD, Performance, API & intégrations, Mises à jour — 4 colonnes, icônes claires. |
| 7 | **CTA final** | Réutiliser `<CTASection />` de `_sections/` (cohérence + moins de code). |

## Technique
- Page reste `"use client"` (toggle + Framer Motion).
- Découpage : tout dans `page.tsx` (page autonome, comme `/ressources`) ; extraction en `_sections/` seulement si > ~600 lignes.
- Données (tableaux `recruteurFeatures`, `candidatFeatures`, `platformFeatures`) **conservées et enrichies**, pas de perte de contenu.
- Aucune nouvelle dépendance. Icônes lucide déjà présentes.
- Responsive : grilles `1 / sm:2 / lg:3`, mockups masqués `hidden lg:block` si trop étroits.
- A11y : toggle en `role="tablist"`, focus visibles, contrastes AA sur la bande sombre.
- Vérif finale : `npx tsc --noEmit`.

## Hors périmètre
Aucun changement de contenu marketing validé ailleurs (tarifs, offres), aucune logique métier.
