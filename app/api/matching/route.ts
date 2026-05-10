// app/api/matching/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { candidatInfo, jobDescription } = await req.json();

    const prompt = `Tu es un expert en recrutement. Analyse la compatibilité entre ce profil candidat et l'offre d'emploi.

PROFIL DU CANDIDAT :
${candidatInfo}

OFFRE D'EMPLOI :
${jobDescription}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte (pas de markdown, pas de backticks) :
{
  "score": <nombre entier entre 0 et 100>,
  "strengths": [<3 à 4 points forts du candidat pour ce poste>],
  "missing": [<2 à 3 compétences ou éléments manquants>],
  "recommendation": "<exactement l'une de ces valeurs: Fortement recommandé | Recommandé | À considérer | Non recommandé>",
  "summary": "<1-2 phrases de synthèse pour le recruteur>"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Anthropic API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Matching API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}