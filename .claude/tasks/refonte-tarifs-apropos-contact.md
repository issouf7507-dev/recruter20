# Refonte design — `/tarifs`, `/a-propos`, `/contact`

Dernier lot du chantier vitrine (suite de `refonte-vitrine.md`, `refonte-fonctionnalites.md`, `refonte-ressources.md`).

## Langage cible (rappel)
Tokens `--y-*`, sections `mt-24 md:mt-32 px-6 md:px-12 lg:px-20` + `max-w-7xl`, kicker violet → `h2 tracking-[-0.03em]` → chapô, cartes `rounded-2xl` + `--y-shadow-sm`, héros = bloc violet `rounded-[32px]` avec `.yl-orb` / `.yl-stripes`, animations `whileInView`.

---

## 1. `/tarifs` (543 l.)

### Problèmes
- Héros = image `banniereweb_1.png` avec titre noir posé dessus
- Palette hors-charte : `from-blue-50`, `from-amber-50`, `bg-yellow-50`, `bg-gray-900`, `border-gray-200` — 5 familles de couleurs différentes selon l'onglet
- Onglets sticky `bg-[#a590ff]` carrés, `top-16` (décalé par rapport au header)
- `scale-105` sur la carte populaire → chevauchement sur certaines largeurs
- FAQ et CTA final dupliqués du reste du site
- ⚠️ `tel:+22600000000` (numéro placeholder Burkina) alors que `/contact` donne `+225 0544659490`

### Cible
- **Logique de paiement strictement inchangée** : `PLAN_LIST`, `CVTHEQUE_PLAN_LIST`, `CONTACT_PACKS`, `PaymentButton`, `CVthequePaymentButton` (fetch `/api/payment/cvtheque/initiate`), `PlanId`/`CVthequePlanId`.
- Héros violet arrondi + badge « 4 façons de recruter avec Ylsix ».
- Onglets → pill animée `layoutId` (même composant visuel que le toggle de `/fonctionnalites`), sticky sous le header.
- Cartes de plan unifiées : `--y-bg-pure`, `--y-shadow-sm`, contour `inset 0 0 0 1px var(--y-line)`, carte populaire = contour violet + `--y-shadow-violet` (plus de `scale-105`).
- Niveaux « recrutement à succès » : les 4 dégradés bleu/violet/ambre/gris deviennent un accent unique par niveau sur le badge seulement ; Executive Search garde son fond sombre `--y-bg-ink`.
- Publicité RH : cartes neutres + pastille d'icône accentuée (plus de 5 fonds pastel).
- Numéro de téléphone aligné sur `/contact`.
- FAQ : `<details>` accessibles (même pattern que `/contact`).

## 2. `/a-propos` (285 l.)

### Problèmes
- `team` (4 personnes fictives + photos Unsplash) **jamais rendu** → à supprimer ou à remplir avec de vraies personnes
- Copy générique d'agence web, hors sujet recrutement
- Héros `h-screen` avec image de fond
- Bouton « play » vidéo décoratif qui ne lance rien
- Images Unsplash en `<img>` distant (pas `next/image`, dépendance externe)
- Imports inutilisés : `Heart, TrendingUp, Award, Globe, Zap, Shield, Briefcase`
- Bloc CTA entier commenté en bas de fichier

### Cible
- Héros violet + chapô réécrit sur le positionnement réel : plateforme RH **panafricaine**, basée à Abidjan.
- **Mission** en 2 colonnes, texte réécrit (recrutement, pas « idée et création »).
- **Nos 4 métiers** : ATS SaaS, CVthèque, Recrutement à succès, Publicité RH → renvoi vers `/tarifs` et `/fonctionnalites`.
- **Chiffres** (repris de `/fonctionnalites`) + **nos engagements** (3 cartes) sur bande sombre.
- Vidéo/citation : citation conservée sans faux bouton play tant qu'il n'y a pas de vidéo réelle.
- Section équipe : **selon réponse utilisateur** (vraies personnes / pas de section).
- Suppression du code mort et des imports inutilisés.

## 3. `/contact` (407 l.)

### Problèmes
- 🔴 **Le formulaire n'envoie rien** : `await new Promise(r => setTimeout(r, 1500))` puis état « envoyé ». Aucun appel réseau.
- `app/api/support/contact/route.ts` existe mais impose `requireSession()` → inutilisable en public
- FAQ mentionne « 99€/mois » alors que la tarification est en FCFA
- Placeholders français (`jean@exemple.fr`, `+33 6 12 34 56 78`) pour un public ivoirien
- Cartes de contact sans hover ni ombre (`p-6  ` classes vides), icônes sans pastille
- Bloc carte commenté avec une adresse parisienne fictive

### Cible
- Héros violet arrondi + 3 cartes de contact en chevauchement, style tokens.
- Formulaire restylé (champs `--y-bg-soft`, focus ring violet, bouton pill dégradé).
- **Branchement réel selon réponse utilisateur** : nouvelle route `POST /api/contact` publique (validation Zod comme `api-route-conventions`, `emailService`, honeypot anti-bot) + gestion d'erreur affichée.
- Placeholders localisés (`+225 07 00 00 00 00`, `awa@exemple.ci`), FAQ corrigée en FCFA avec renvoi `/tarifs`.
- Horaires + FAQ `<details>` conservés, restylés.

## Vérification
`npx tsc --noEmit` + chargement des 3 pages sur le dev server. Aucun changement de logique de paiement ni de schéma.
