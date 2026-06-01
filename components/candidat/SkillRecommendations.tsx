"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconSparkles, IconPlus } from "@tabler/icons-react";

const SKILLS_BY_DOMAIN: Record<string, string[]> = {
  "informatique": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Git", "Docker", "SQL", "REST API", "Agile"],
  "developpement-web": ["HTML/CSS", "React", "Next.js", "Vue.js", "TailwindCSS", "TypeScript", "PHP", "Laravel", "WordPress"],
  "developpement-logiciel": ["Java", "Python", "C++", "Git", "Docker", "CI/CD", "Design Patterns", "Tests unitaires"],
  "data": ["Python", "SQL", "Pandas", "Machine Learning", "Tableau", "Power BI", "Excel avancé", "Statistics"],
  "marketing": ["SEO", "Google Ads", "Facebook Ads", "Analytics", "Content Marketing", "Email Marketing", "Canva"],
  "rh": ["Recrutement", "ATS", "Paie", "Droit du travail", "GPEC", "Onboarding", "Entretiens"],
  "finance": ["Excel", "Comptabilité", "Contrôle de gestion", "Audit", "SAP", "Analyse financière"],
  "management": ["Leadership", "Gestion de projet", "Agile/Scrum", "Communication", "Excel", "Reporting"],
  "design": ["Figma", "Sketch", "Adobe XD", "Illustrator", "Photoshop", "Prototypage", "UX Research"],
};

const DEFAULT_SKILLS = ["Communication", "Travail en équipe", "Gestion du temps", "Microsoft Office", "Adaptabilité", "Anglais professionnel"];

interface SkillRecommendationsProps {
  domaine?: string | null;
  existingSkills?: string[];
  onAdd?: (skill: string) => void;
}

export function SkillRecommendations({ domaine, existingSkills = [], onAdd }: SkillRecommendationsProps) {
  const domainKey = domaine?.toLowerCase().replace(/ /g, "-").replace(/[éèê]/g, "e").replace(/[àâ]/g, "a") ?? "";
  const suggestions = (SKILLS_BY_DOMAIN[domainKey] ?? DEFAULT_SKILLS).filter(
    (s) => !existingSkills.some((e) => e.toLowerCase() === s.toLowerCase())
  ).slice(0, 8);

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-purple-100 bg-purple-50/30 dark:bg-purple-950/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <IconSparkles className="h-4 w-4 text-purple-500" />
          Compétences suggérées pour votre domaine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => onAdd?.(skill)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-purple-200 bg-white hover:bg-purple-100 hover:border-purple-400 transition-colors"
            >
              <IconPlus className="h-3 w-3 text-purple-500" />
              {skill}
            </button>
          ))}
        </div>
        {onAdd && <p className="text-xs text-muted-foreground mt-2">Cliquez pour ajouter une compétence à votre profil</p>}
      </CardContent>
    </Card>
  );
}
