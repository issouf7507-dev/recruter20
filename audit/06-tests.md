# Partie 6 — Tests

**Priorité : MOYENNE**  
Actuellement : **0 tests** dans le projet.

---

## 6.1 État actuel

```bash
# Résultat de la recherche
find . -name "*.test.ts" -o -name "*.spec.ts" -o -name "*.test.tsx" -o -name "*.spec.tsx"
# → Aucun résultat
```

Il n'y a aucune configuration de test (Jest, Vitest, Playwright) ni aucun fichier de test.

---

## 6.2 Stratégie recommandée

### Niveau 1 — Tests unitaires (Vitest) — PRIORITAIRE

Tester les fonctions pures : matching, calculs de score, mappers, validation.

**Pourquoi Vitest ?**
- Compatible avec le tooling ESM moderne
- 10x plus rapide que Jest
- Même API que Jest, migration facile

**Installation :**
```bash
npm install -D vitest @vitest/ui
```

**Configuration :**
```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

**Scripts :**
```json
// package.json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

---

## 6.3 Priorité des tests à écrire

### Priorité 1 — Fonctions critiques métier

**Algorithme de matching (`lib/matching/scoring.ts`) :**
```typescript
// lib/matching/scoring.test.ts
import { describe, it, expect } from "vitest";
import { calculerScore } from "./scoring";

describe("calculerScore", () => {
  it("retourne 100% si candidat correspond parfaitement", () => {
    const candidat = { competences: ["React", "Node.js"], annees_experience: 5 };
    const offre = { competences_requises: ["React", "Node.js"], experience_min: 3 };
    expect(calculerScore(candidat, offre)).toBe(100);
  });

  it("retourne 0% si aucune compétence ne correspond", () => {
    const candidat = { competences: ["Java"], annees_experience: 1 };
    const offre = { competences_requises: ["React", "Node.js"], experience_min: 3 };
    expect(calculerScore(candidat, offre)).toBe(0);
  });

  it("gère les candidats sans compétences renseignées", () => {
    const candidat = { competences: [], annees_experience: 0 };
    const offre = { competences_requises: ["React"], experience_min: 1 };
    expect(calculerScore(candidat, offre)).toBeGreaterThanOrEqual(0);
  });
});
```

**Validation de signature webhook GeniusPay (`lib/geniuspay.ts`) :**
```typescript
// lib/geniuspay.test.ts
import { describe, it, expect } from "vitest";
import { verifyWebhookSignature } from "./geniuspay";

describe("verifyWebhookSignature", () => {
  it("accepte une signature valide", () => {
    const payload = JSON.stringify({ event: "payment.success" });
    const secret = "whsec_test";
    const signature = createValidSignature(payload, secret);
    expect(verifyWebhookSignature(payload, signature, secret)).toBe(true);
  });

  it("rejette une signature invalide", () => {
    expect(verifyWebhookSignature("payload", "mauvaise-signature", "secret")).toBe(false);
  });

  it("rejette un timestamp trop vieux (replay attack)", () => {
    const oldTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes
    // ...
  });
});
```

**Mappers de données (`lib/mappers/`) :**
```typescript
// lib/mappers/candidat.mapper.test.ts
import { toCandidatDTO } from "./candidat.mapper";

describe("toCandidatDTO", () => {
  it("masque les données sensibles", () => {
    const candidat = { id: "1", email: "test@test.com", phone: "0102030405" };
    const dto = toCandidatDTO(candidat);
    expect(dto.phone).toBeUndefined(); // téléphone masqué dans la vue publique
  });
});
```

### Priorité 2 — Tests d'intégration API

Tester les routes API avec une base de données de test :
```typescript
// app/api/candidats/route.test.ts
import { testClient } from "@/test/helpers";

describe("GET /api/candidats", () => {
  it("retourne 401 sans session", async () => {
    const res = await testClient.get("/api/candidats");
    expect(res.status).toBe(401);
  });

  it("pagine correctement les résultats", async () => {
    const res = await testClient.get("/api/candidats?page=1&limit=10", {
      session: mockRecruteurSession,
    });
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.data).toHaveLength(10);
  });
});
```

### Priorité 3 — Tests E2E (Playwright)

Pour les parcours critiques :
- Inscription recruteur → connexion → création offre
- Inscription candidat → candidature → suivi
- Paiement d'abonnement (avec GeniusPay sandbox)

```bash
npm install -D @playwright/test
npx playwright install
```

---

## 6.4 Données de test (fixtures)

Créer des fixtures réutilisables :
```typescript
// test/fixtures/candidat.ts
export const candidatFixture = {
  id: "test-candidat-1",
  nom: "Koné",
  prenom: "Aminata",
  email: "aminata.kone@test.com",
  ville: "Abidjan",
  competences: ["React", "TypeScript"],
  annees_experience: 3,
};

export const recruteurFixture = {
  id: "test-recruteur-1",
  entreprise: "Tech CI",
  email: "rh@techci.com",
};
```

---

## 6.5 CI/CD — Lancer les tests automatiquement

Ajouter les tests dans le pipeline GitHub Actions :
```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm test
      - run: npm run build
```

---

## Checklist de validation

- [ ] Vitest installé et configuré (`vitest.config.ts`)
- [ ] Scripts `test`, `test:coverage` dans `package.json`
- [ ] Tests pour `lib/matching/scoring.ts` — au moins 5 cas
- [ ] Tests pour la validation de signature webhook
- [ ] Tests pour les mappers (vérifier masquage des données)
- [ ] Au moins 3 tests d'intégration sur les routes API critiques
- [ ] Fixtures de données de test créées dans `test/fixtures/`
- [ ] GitHub Actions configuré pour lancer les tests sur chaque PR
