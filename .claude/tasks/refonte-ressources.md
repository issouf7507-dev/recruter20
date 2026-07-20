# Refonte design — page `/ressources`

Suite de `refonte-vitrine.md` et `refonte-fonctionnalites.md`.

## État actuel
`app/(public)/ressources/page.tsx` (172 l.) — déjà aux tokens `--y-*`, mais :
- 4 cartes blanches **strictement identiques** empilées → aucun rythme, page plate
- aucune animation (composant serveur, pas de `whileInView` comme le reste du site)
- sommaire = simple rangée d'ancres en haut ; une fois scrollé, on ne sait plus où on est
- 5 conseils par section, tous avec la même pastille violette → uniformité visuelle
- pas de passerelle vers le reste du produit (générateur de CV, alertes, offres)

## Cible

| # | Section | Changement |
|---|---------|-----------|
| 1 | **Héros** | Conservé (orb + titre centré) mais enrichi : ligne de méta « 4 guides · 20 conseils · ~12 min de lecture ». Les pills d'ancre restent mais deviennent secondaires (le vrai sommaire passe en latéral). |
| 2 | **Layout 2 colonnes** | Desktop `lg:grid-cols-[240px_1fr]` : **sommaire sticky** à gauche avec **scroll-spy** (section active surlignée + barre violette). Mobile : sommaire horizontal scrollable en haut, inchangé. |
| 3 | **Sections de guide** | Chaque guide reçoit son **accent de couleur** (violet / ambre / bleu / vert, comme `SectorsSection`) sur la pastille d'icône et le numéro. Conseils **numérotés `01…05`** en typo mono plutôt que 5 pastilles check identiques → rythme et repère de lecture. |
| 4 | **Encart « à retenir »** | Dans chaque guide, une ligne d'accroche en exergue (bordure gauche colorée) qui résume l'essentiel — casse le mur de texte. |
| 5 | **Passerelles produit** *(nouveau)* | Après les guides : 3 cartes d'action reliant les conseils au produit — « Générer mon CV », « Créer une alerte emploi », « Voir les offres ». |
| 6 | **CTA bas de page** | Conservé, aligné sur le style CTASection. |

## Technique
- La page reste **serveur** (garde son `export const metadata`) ; extraction d'un enfant client `ressources/_components/GuideNav.tsx` (`"use client"`) pour le scroll-spy via `IntersectionObserver`, et `RevealSection.tsx` si besoin d'animation d'entrée.
- Alternative retenue si plus simple : passer la page en client et déplacer `metadata` dans un `layout.tsx` — **non retenue**, on préfère garder le SEO en serveur.
- Scroll-spy : `IntersectionObserver` avec `rootMargin: "-30% 0px -60% 0px"`, `scroll-mt-28` déjà en place sur les sections.
- A11y : `<nav aria-label="Sommaire">`, `aria-current="true"` sur l'entrée active, `prefers-reduced-motion` respecté (déjà géré dans `globals.css`).
- Contenu texte des 4 guides **conservé intégralement**.
- Vérif : `npx tsc --noEmit`.

## Hors périmètre
Pas de vrai CMS / articles de blog (la `BlogSection` de la home reste sur ses placeholders).
