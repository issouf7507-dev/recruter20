# 🤖 Système de Matching IA avec Hugging Face

## 📋 Vue d'ensemble

Ce module implémente un système de matching intelligent entre candidats et offres d'emploi en utilisant l'API Inference de Hugging Face. Le système combine l'analyse sémantique et la classification pour produire un score de compatibilité précis.

## 🎯 Fonctionnalités

- ✅ **100% Gratuit** - Utilise des modèles open-source Hugging Face
- ✅ **Similarité sémantique** - Compare le sens des textes (offre vs profil candidat)
- ✅ **Classification IA** - Détermine si un candidat est excellent, bon, moyen ou faible match
- ✅ **Scoring hybride** - Combine scoring classique + IA (optionnel)
- ✅ **Traitement par lots** - Optimisé pour analyser plusieurs candidats

## 🔧 Configuration

### 1. Obtenir une clé API Hugging Face

1. Créez un compte sur [Hugging Face](https://huggingface.co/)
2. Allez sur [Settings > Tokens](https://huggingface.co/settings/tokens)
3. Créez un token **"Fine-grained"** avec la permission **"Inference API - Use"**
4. Ajoutez le token dans vos variables d'environnement :

```bash
# .env.local ou .env
NEXT_PUBLIC_HUGGINGFACE_API_KEY=hf_votre_token_ici
# OU
HUGGINGFACE_API_KEY=hf_votre_token_ici
```

### 2. URL de l'API

Le système utilise l'URL officielle du router Hugging Face :

```
https://router.huggingface.co/hf-inference/models
```

## 📚 Architecture

### Fonctions principales

#### 1. `queryHuggingFace(modelName, data, maxRetries)`

**Helper générique** pour interroger l'API Hugging Face.

- **Gestion des erreurs** : Retry automatique en cas d'erreur temporaire
- **Gestion du chargement** : Attend si le modèle est en cours de chargement (503)
- **Gestion des permissions** : Message d'erreur clair si permissions insuffisantes

```typescript
const result = await queryHuggingFace("facebook/bart-large-mnli", {
  inputs: "Texte à analyser",
  parameters: { candidate_labels: ["label1", "label2"] },
});
```

#### 2. `calculateSemanticSimilarity(offreText, candidatText)`

**Calcule la similarité sémantique** entre une offre et un profil candidat.

**Méthode** : Utilise la classification zero-shot comme proxy pour la similarité

**Labels utilisés** :

- `"very similar"` → 95%
- `"similar"` → 75%
- `"somewhat similar"` → 50%
- `"not similar"` → 25%

**Score final** = Base score (70%) + Confiance (30%)

**Modèle** : `facebook/bart-large-mnli`

#### 3. `classifyCandidateFit(candidatProfile, offreRequirements)`

**Classifie le niveau de match** entre un candidat et une offre.

**Labels utilisés** :

- `"excellent match"` → excellent
- `"good match"` → good
- `"average match"` → average
- `"poor match"` → poor

**Retourne** :

- `fit` : "excellent" | "good" | "average" | "poor"
- `confidence` : Pourcentage de confiance (0-100)

**Modèle** : `facebook/bart-large-mnli`

#### 4. `analyzeMatchHuggingFacePure(candidat, offre)`

**Analyse 100% IA** - Version pure sans scoring classique.

**Algorithme** :

```
Score final = 60% similarité sémantique + 40% classification pondérée
```

**Pondération par fit** :

- `excellent` : 1.0 (100%)
- `good` : 0.8 (80%)
- `average` : 0.6 (60%)
- `poor` : 0.4 (40%)

**Retourne** :

- `semanticScore` : Score de similarité (0-100)
- `classificationFit` : Niveau de match
- `confidence` : Confiance de la classification
- `finalScore` : Score final IA (0-100)
- `reasoning` : Explication textuelle

#### 5. `analyzeMatchHuggingFace(candidat, offre, ruleBasedScore)`

**Analyse hybride** - Combine scoring classique + IA.

**Algorithme** :

```
Score final = 50% scoring classique + 30% similarité IA + 20% classification IA
```

**Boost IA** selon le fit :

- `excellent` : +15%
- `good` : +5%
- `average` : 0%
- `poor` : -10%

#### 6. `analyzeBatchHuggingFacePure(matches)`

**Traitement par lots** - Analyse plusieurs candidats en parallèle.

**Optimisations** :

- Traite par lots de **3 candidats** en parallèle
- Pause de **2 secondes** entre chaque lot (rate limiting)
- Gestion d'erreurs individuelle (un candidat en erreur n'arrête pas le batch)
- Retourne les résultats triés par score décroissant

## 🔄 Flux de traitement

### Version 100% IA (Pure)

```
1. Candidat + Offre
   ↓
2. calculateSemanticSimilarity() → Score similarité (0-100)
   ↓
3. classifyCandidateFit() → Fit + Confiance
   ↓
4. Combinaison : 60% similarité + 40% classification
   ↓
5. Score final IA
```

### Version Hybride

```
1. Scoring classique (compétences, localisation, etc.) → Score de base
   ↓
2. calculateSemanticSimilarity() → Score similarité
   ↓
3. classifyCandidateFit() → Fit + Confiance
   ↓
4. Combinaison : 50% classique + 30% similarité + 20% classification
   ↓
5. Score final hybride
```

## 📊 Format des données

### Entrée `analyzeMatchHuggingFacePure`

```typescript
{
  candidat: {
    bio: string;
    competences: string[];
    experiences: string[];
  },
  offre: {
    title: string;
    description: string;
  }
}
```

### Sortie

```typescript
{
  semanticScore: number; // 0-100
  classificationFit: string; // "excellent" | "good" | "average" | "poor"
  confidence: number; // 0-100
  finalScore: number; // 0-100
  reasoning: string; // Explication textuelle
}
```

## 🛠️ Gestion des erreurs

### Retry automatique

- **2 tentatives** par défaut
- **Backoff exponentiel** : 2s, 4s, etc.
- **Gestion 503** : Attend jusqu'à 20s si modèle en chargement

### Fallback

- En cas d'erreur : Retourne un score neutre (50%)
- En cas d'erreur batch : Continue avec les autres candidats
- Logs détaillés pour le debugging

## ⚡ Performance

### Rate Limiting

- **3 candidats** traités en parallèle
- **2 secondes** de pause entre chaque lot
- **Respect des limites** de l'API gratuite Hugging Face

### Optimisations

- Limitation de la longueur des textes (300 chars pour similarité)
- Traitement par lots pour éviter les timeouts
- Cache possible côté API (à implémenter si nécessaire)

## 📝 Exemple d'utilisation

```typescript
import { analyzeMatchHuggingFacePure } from "@/lib/matching/scoringai";

// Analyser un match
const result = await analyzeMatchHuggingFacePure(
  {
    bio: "Développeur React avec 5 ans d'expérience...",
    competences: ["React", "TypeScript", "Node.js"],
    experiences: ["Développeur Frontend", "Lead Developer"],
  },
  {
    title: "Développeur Fullstack React",
    description: "Recherche développeur React expérimenté...",
  }
);

console.log(result);
// {
//   semanticScore: 85,
//   classificationFit: "excellent",
//   confidence: 92,
//   finalScore: 88,
//   reasoning: "🔍 Similarité sémantique: 85%..."
// }
```

## 🔍 Modèles utilisés

### `facebook/bart-large-mnli`

- **Type** : Zero-shot classification
- **Usage** : Similarité sémantique + Classification
- **Gratuit** : ✅ Oui
- **Limite** : Rate limiting de l'API gratuite

## ⚠️ Limitations

1. **Rate Limiting** : L'API gratuite a des limites de requêtes
2. **Latence** : Chaque appel prend 1-3 secondes
3. **Longueur des textes** : Limité à 300-512 caractères
4. **Modèles en chargement** : Premier appel peut prendre 20-30 secondes

## 🚀 Améliorations possibles

1. **Cache** : Mettre en cache les résultats pour éviter les appels répétés
2. **Sentence Embeddings** : Utiliser un vrai modèle d'embeddings pour la similarité
3. **Batch plus grand** : Augmenter la taille des lots si API payante
4. **Parallélisation** : Traiter plusieurs offres en parallèle

## 📖 Documentation Hugging Face

- [Inference API](https://huggingface.co/docs/api-inference/index)
- [Zero-shot Classification](https://huggingface.co/docs/api-inference/detailed_parameters#zero-shot-classification-task)
- [Router API](https://huggingface.co/docs/hub/api#router)

## 🐛 Debugging

Activez les logs détaillés en vérifiant la console :

```typescript
// Les logs incluent :
// 🤖 Analyse IA: ...
// 📏 Longueur candidat: ...
// ✅ Similarité: ...
// ✅ Classification: ...
// ✅ Score final IA: ...
```

## 🔐 Sécurité

⚠️ **IMPORTANT** : Ne commitez JAMAIS votre token API dans le code !

Le token est actuellement hardcodé dans `scoringai.ts` (ligne 11). **À corriger** :

```typescript
// ❌ MAUVAIS (actuel)
const HF_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

// ✅ BON (à utiliser)
const HF_API_KEY =
  process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY ||
  process.env.HUGGINGFACE_API_KEY;
```

## 📞 Support

En cas de problème :

1. Vérifiez que votre token a la permission "Inference API - Use"
2. Vérifiez les logs dans la console
3. Testez avec un seul candidat pour isoler le problème
4. Consultez la [documentation Hugging Face](https://huggingface.co/docs/api-inference)
