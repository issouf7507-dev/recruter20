# Seeders

Ce dossier contient les scripts de seed pour peupler la base de données avec des données de test.

## Seed des offres d'emploi

Génère automatiquement 50 offres d'emploi pour le recruteur spécifié.

### Utilisation

```bash
pnpm run seed:offres
```

ou avec npx directement :

```bash
npx tsx prisma/seeds/seed-offres.ts
```

### Prérequis

Assurez-vous que `tsx` est installé. Si ce n'est pas le cas :

```bash
pnpm add -D tsx
```

### Contenu généré

Le seeder crée 50 offres d'emploi avec :

- Titres variés (Développeur, Manager, Architecte, etc.)
- Entreprises fictives
- Localisations variées (Paris, Lyon, Marseille, Remote, etc.)
- Types de contrats variés (CDI, CDD, Freelance, Stage, etc.)
- Salaires réalistes (25k€ - 100k€)
- Compétences techniques diverses
- Descriptions complètes
- Dates d'échéance aléatoires

### Recruteur cible

Le script utilise le recruteur avec l'ID : `cmh9bup0c0000i8h5zmrm8mcd`

Pour changer le recruteur, modifiez la constante `recruteurId` dans `seed-offres.ts`.
