/**
 * Matching IA avec Hugging Face
 *
 * ✅ Utilise l'API officielle router.huggingface.co
 * ✅ Suit la documentation Hugging Face
 *
 * IMPORTANT: Votre token doit avoir la permission "Inference API - Use"
 * Créez un token "Fine-grained" sur https://huggingface.co/settings/tokens
 */

const HF_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

// ✅ URL officielle du router (selon la doc HF)
const HF_ROUTER_URL = "https://router.huggingface.co/hf-inference/models";

/**
 * Helper: Query générique pour Hugging Face (selon doc officielle)
 */
type HFClassificationItem = { label: string; score: number };
type HFResponse = HFClassificationItem[] | { labels: string[]; scores: number[] };

async function queryHuggingFace(
  modelName: string,
  data: unknown,
  maxRetries = 2
): Promise<HFResponse> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${HF_ROUTER_URL}/${modelName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Si erreur de permissions, pas la peine de retry
        if (response.status === 403) {
          throw new Error(
            `❌ Erreur 403: Votre token n'a pas les permissions nécessaires.\n` +
              `Créez un token "Fine-grained" avec permission "Inference API - Use" sur:\n` +
              `https://huggingface.co/settings/tokens`
          );
        }

        console.error(`❌ Erreur API HF (${response.status}):`, errorText);
        lastError = new Error(errorText);

        // Si modèle en chargement (503), attendre et réessayer
        if (response.status === 503) {
          const waitTime = Math.min(20000, (attempt + 1) * 5000);
          console.log(
            `⏳ Modèle en chargement, attente ${waitTime / 1000}s...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        throw lastError;
      }

      const result = await response.json();

      // Vérifier si erreur dans le résultat
      if (result.error) {
        console.warn("⚠️ Erreur dans la réponse:", result.error);
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      lastError = error;

      // Si c'est la dernière tentative, lancer l'erreur
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Sinon, attendre un peu avant de retry
      const backoff = (attempt + 1) * 2000;
      console.log(
        `⚠️ Retry ${attempt + 1}/${maxRetries} dans ${backoff / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  throw lastError;
}

/**
 * Méthode 1 : Classification zero-shot (similarité proxy)
 */
export async function calculateSemanticSimilarity(
  offreText: string,
  candidatText: string
): Promise<number> {
  try {
    if (!HF_API_KEY) {
      console.warn("⚠️ HF_TOKEN manquant dans .env");
      return 50;
    }

    const combinedText = `
Offre: ${offreText.substring(0, 300)}
Candidat: ${candidatText.substring(0, 300)}
    `.trim();

    const result = await queryHuggingFace("facebook/bart-large-mnli", {
      inputs: combinedText,
      parameters: {
        candidate_labels: [
          "very similar",
          "similar",
          "somewhat similar",
          "not similar",
        ],
      },
    });

    // ✅ Gérer les deux formats de réponse possibles
    let labels: string[] = [];
    let scores: number[] = [];

    // Format 1: Array d'objets [{label, score}, ...]
    if (Array.isArray(result)) {
      labels = (result as HFClassificationItem[]).map((item) => item.label);
      scores = (result as HFClassificationItem[]).map((item) => item.score);
    }
    // Format 2: Objet {labels: [...], scores: [...]}
    else if (result.labels && result.scores) {
      labels = result.labels;
      scores = result.scores;
    }

    if (labels.length === 0) {
      console.warn(
        "⚠️ Pas de résultat de classification, utilisation du fallback"
      );
      console.log(
        "📋 Réponse brute:",
        JSON.stringify(result).substring(0, 200)
      );
      return 50;
    }

    // Mapper les labels vers des scores
    const similarityMap: Record<string, number> = {
      "very similar": 95,
      similar: 75,
      "somewhat similar": 50,
      "not similar": 25,
    };

    const topLabel = labels[0];
    const confidence = scores[0];
    const baseScore = similarityMap[topLabel] || 50;

    // Score final = base score pondéré par la confiance
    const finalScore = Math.round(baseScore * 0.7 + confidence * 100 * 0.3);

    console.log(`✅ Similarité: ${topLabel} (${finalScore}%)`);
    return Math.min(100, Math.max(0, finalScore));
  } catch (error) {
    console.error("❌ Erreur similarité:", error);
    return 50; // Fallback
  }
}

/**
 * Méthode 2 : Classification du fit
 */
export async function classifyCandidateFit(
  candidatProfile: string,
  offreRequirements: string
): Promise<{
  fit: "excellent" | "good" | "average" | "poor";
  confidence: number;
}> {
  try {
    if (!HF_API_KEY) {
      console.warn("⚠️ HF_TOKEN manquant dans .env");
      return { fit: "average", confidence: 50 };
    }

    const combinedText = `
Job Requirements: ${offreRequirements.substring(0, 300)}
Candidate Profile: ${candidatProfile.substring(0, 300)}
    `.trim();

    const result = await queryHuggingFace("facebook/bart-large-mnli", {
      inputs: combinedText,
      parameters: {
        candidate_labels: [
          "excellent match",
          "good match",
          "average match",
          "poor match",
        ],
      },
    });

    // ✅ Gérer les deux formats de réponse possibles
    let labels: string[] = [];
    let scores: number[] = [];

    // Format 1: Array d'objets [{label, score}, ...]
    if (Array.isArray(result)) {
      labels = (result as HFClassificationItem[]).map((item) => item.label);
      scores = (result as HFClassificationItem[]).map((item) => item.score);
    }
    // Format 2: Objet {labels: [...], scores: [...]}
    else if (result.labels && result.scores) {
      labels = result.labels;
      scores = result.scores;
    }

    if (labels.length === 0) {
      return { fit: "average", confidence: 50 };
    }

    const fitMapping: Record<
      string,
      "excellent" | "good" | "average" | "poor"
    > = {
      "excellent match": "excellent",
      "good match": "good",
      "average match": "average",
      "poor match": "poor",
    };

    const topLabel = labels[0];
    const confidence = Math.round(scores[0] * 100);
    const fit = fitMapping[topLabel] || "average";

    console.log(`✅ Classification: ${fit} (${confidence}%)`);
    return { fit, confidence };
  } catch (error) {
    console.error("❌ Erreur classification:", error);
    return { fit: "average", confidence: 50 };
  }
}

/**
 * Analyse complète 100% IA
 */
export async function analyzeMatchHuggingFacePure(
  candidat: {
    bio: string;
    competences: string[];
    experiences: string[];
  },
  offre: {
    title: string;
    description: string;
  }
): Promise<{
  semanticScore: number;
  classificationFit: string;
  confidence: number;
  finalScore: number;
  reasoning: string;
}> {
  console.log(
    `🤖 Analyse IA: ${candidat.bio?.substring(0, 40)}... vs ${offre.title}`
  );

  const candidatText = `
Bio: ${candidat.bio || "Non renseignée"}
Skills: ${candidat.competences.join(", ") || "Aucune"}
Experience: ${candidat.experiences.join(". ") || "Aucune"}
  `.trim();

  const offreText = `
${offre.title}
${offre.description || ""}
  `.trim();

  // Debug: afficher les longueurs
  console.log(`📏 Longueur candidat: ${candidatText.length} chars`);
  console.log(`📏 Longueur offre: ${offreText.length} chars`);

  try {
    // 1. Similarité sémantique
    const semanticScore = await calculateSemanticSimilarity(
      offreText,
      candidatText
    );

    // 2. Classification
    const classification = await classifyCandidateFit(candidatText, offreText);

    // 3. Score final
    const fitWeights = {
      excellent: 1.0,
      good: 0.8,
      average: 0.6,
      poor: 0.4,
    };

    const fitWeight = fitWeights[classification.fit] || 0.6;

    const finalScore = Math.min(
      100,
      Math.round(
        semanticScore * 0.6 + // 60% similarité
          classification.confidence * 0.4 * fitWeight // 40% classification
      )
    );

    const reasoning = `
🔍 Similarité sémantique: ${semanticScore}%
🎯 Classification: ${classification.fit} (${classification.confidence}%)
📊 Score final IA: ${finalScore}%
    `.trim();

    console.log(`✅ Score final IA: ${finalScore}%`);

    return {
      semanticScore,
      classificationFit: classification.fit,
      confidence: classification.confidence,
      finalScore,
      reasoning,
    };
  } catch (error) {
    console.error("❌ Erreur analyse IA:", error);

    // Fallback gracieux
    return {
      semanticScore: 50,
      classificationFit: "average",
      confidence: 50,
      finalScore: 50,
      reasoning: "Erreur lors de l'analyse IA, score neutre attribué",
    };
  }
}

/**
 * Analyse hybride (Rule-based + IA)
 */
export async function analyzeMatchHuggingFace(
  candidat: {
    bio: string;
    competences: string[];
    experiences: string[];
  },
  offre: {
    title: string;
    description: string;
  },
  ruleBasedScore: number
): Promise<{
  semanticScore: number;
  classificationFit: string;
  confidence: number;
  finalScore: number;
  reasoning: string;
}> {
  console.log(
    `🔄 Analyse hybride: base=${ruleBasedScore}% pour ${offre.title}`
  );

  const candidatText = `
${candidat.bio || ""}
Skills: ${candidat.competences.join(", ")}
Experience: ${candidat.experiences.join(". ")}
  `.trim();

  const offreText = `${offre.title}\n${offre.description || ""}`.trim();

  try {
    const semanticScore = await calculateSemanticSimilarity(
      offreText,
      candidatText
    );
    const classification = await classifyCandidateFit(candidatText, offreText);

    const aiBoost =
      {
        excellent: 1.15,
        good: 1.05,
        average: 1.0,
        poor: 0.9,
      }[classification.fit] || 1.0;

    const finalScore = Math.min(
      100,
      Math.round(
        ruleBasedScore * 0.5 + // 50% algo classique
          semanticScore * 0.3 + // 30% similarité
          classification.confidence * 0.2 * aiBoost // 20% classification
      )
    );

    const reasoning = `
📐 Score algorithmique: ${ruleBasedScore}%
🔍 Similarité IA: ${semanticScore}%
🎯 Classification: ${classification.fit} (${classification.confidence}%)
⚡ Boost IA: ${aiBoost > 1 ? "+" : ""}${Math.round((aiBoost - 1) * 100)}%
📊 Score final: ${finalScore}%
    `.trim();

    console.log(`✅ Score hybride: ${finalScore}% (base: ${ruleBasedScore}%)`);

    return {
      semanticScore,
      classificationFit: classification.fit,
      confidence: classification.confidence,
      finalScore,
      reasoning,
    };
  } catch (error) {
    console.error("❌ Erreur analyse hybride:", error);

    // Fallback: garder le score de base
    return {
      semanticScore: ruleBasedScore,
      classificationFit: "average",
      confidence: 50,
      finalScore: ruleBasedScore,
      reasoning: "Erreur IA, score algorithmique conservé",
    };
  }
}

/**
 * Batch processing avec rate limiting
 */
interface MatchInput {
  candidat: {
    id?: string;
    bio?: string | null;
    candidatCompetences?: { competence: string }[];
    experiences?: { poste: string }[];
  };
  offre: { title: string; description?: string | null };
  score?: number;
}

export async function analyzeBatchHuggingFacePure(
  matches: MatchInput[]
): Promise<MatchInput[]> {
  console.log(`🚀 Analyse batch IA: ${matches.length} candidats`);

  const results = [];
  const BATCH_SIZE = 3; // 3 candidats en parallèle
  const DELAY_MS = 2000; // 2s entre batches

  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const batch = matches.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(matches.length / BATCH_SIZE);

    console.log(`📦 Batch ${batchNum}/${totalBatches}...`);

    const batchResults = await Promise.all(
      batch.map(async (match) => {
        try {
          const aiAnalysis = await analyzeMatchHuggingFacePure(
            {
              bio: match.candidat.bio || "",
              competences:
                match.candidat.candidatCompetences?.map((c) => c.competence) || [],
              experiences:
                match.candidat.experiences?.map((e) => e.poste) || [],
            },
            {
              title: match.offre.title,
              description: match.offre.description || "",
            }
          );

          return {
            ...match,
            score: aiAnalysis.finalScore,
            aiSemanticScore: aiAnalysis.semanticScore,
            aiFit: aiAnalysis.classificationFit,
            aiConfidence: aiAnalysis.confidence,
            aiReasoning: aiAnalysis.reasoning,
          };
        } catch (error) {
          console.error(`❌ Erreur candidat ${match.candidat.id}:`, error);
          return {
            ...match,
            score: 50,
            aiReasoning: "Erreur IA",
          };
        }
      })
    );

    results.push(...batchResults);

    if (i + BATCH_SIZE < matches.length) {
      console.log(`⏳ Pause ${DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log(`✅ Batch terminé: ${results.length} résultats`);
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Batch hybride
 */
export async function analyzeBatchHuggingFace(
  matches: MatchInput[]
): Promise<MatchInput[]> {
  console.log(`🚀 Analyse batch hybride: ${matches.length} candidats`);

  const results = [];
  const BATCH_SIZE = 3;
  const DELAY_MS = 2000;

  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const batch = matches.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (match) => {
        try {
          const aiAnalysis = await analyzeMatchHuggingFace(
            {
              bio: match.candidat.bio || "",
              competences:
                match.candidat.candidatCompetences?.map((c) => c.competence) || [],
              experiences:
                match.candidat.experiences?.map((e) => e.poste) || [],
            },
            {
              title: match.offre.title,
              description: match.offre.description || "",
            },
            match.score ?? 0
          );

          return {
            ...match,
            score: aiAnalysis.finalScore,
            aiSemanticScore: aiAnalysis.semanticScore,
            aiFit: aiAnalysis.classificationFit,
            aiConfidence: aiAnalysis.confidence,
            aiReasoning: aiAnalysis.reasoning,
            originalScore: match.score,
          };
        } catch (error) {
          return {
            ...match,
            originalScore: match.score,
            aiReasoning: "Erreur IA, score original conservé",
          };
        }
      })
    );

    results.push(...batchResults);

    if (i + BATCH_SIZE < matches.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  return results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}
