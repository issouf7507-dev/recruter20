"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/shadcn-io/combobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Save } from "lucide-react";
import { updateCandidat } from "@/lib/api/candidats";
import { toast } from "sonner";
import { useEdgeStore } from "@/lib/edgestore";
import type { Option } from "@/components/ui/multi-select";
import MultipleSelector from "@/components/ui/multi-select";

interface ProfilSectionProps {
  candidat: any;
}

const COMPETENCES_PREDEFINIES = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Python",
  "Java",
  "PHP",
  "SQL",
  "MongoDB",
  "Git",
  "Docker",
  "AWS",
  "UI/UX",
  "Agile",
  "Node.js",
  "Vue.js",
  "Angular",
  "PostgreSQL",
  "MySQL",
  "GraphQL",
];

const SITUATIONS_FAMILIALES = [
  "Célibataire",
  "Marié(e)",
  "Divorcé(e)",
  "Veuf(ve)",
];

const DONNEES_PREDEFINIES = [
  {
    value: "informatique",
    label: "Informatique",
  },
  {
    value: "developpement-logiciel",
    label: "Développement Logiciel",
  },
  {
    value: "developpement-web",
    label: "Développement Web",
  },
  {
    value: "developpement-mobile",
    label: "Développement Mobile",
  },
  {
    value: "cybersecurite",
    label: "Cybersécurité",
  },
  {
    value: "intelligence-artificielle",
    label: "Intelligence Artificielle",
  },
  {
    value: "data-science",
    label: "Data Science",
  },
  {
    value: "big-data",
    label: "Big Data",
  },
  {
    value: "cloud-computing",
    label: "Cloud Computing",
  },
  {
    value: "devops",
    label: "DevOps",
  },
  {
    value: "reseau-telecom",
    label: "Réseau & Télécommunications",
  },
  {
    value: "marketing",
    label: "Marketing",
  },
  {
    value: "marketing-digital",
    label: "Marketing Digital",
  },
  {
    value: "communication",
    label: "Communication",
  },
  {
    value: "publicite",
    label: "Publicité",
  },
  {
    value: "relations-publiques",
    label: "Relations Publiques",
  },
  {
    value: "finance",
    label: "Finance",
  },
  {
    value: "banque",
    label: "Banque",
  },
  {
    value: "assurance",
    label: "Assurance",
  },
  {
    value: "audit",
    label: "Audit",
  },
  {
    value: "gestion-patrimoine",
    label: "Gestion de Patrimoine",
  },
  {
    value: "comptabilite",
    label: "Comptabilité",
  },
  {
    value: "controle-gestion",
    label: "Contrôle de Gestion",
  },
  {
    value: "rh",
    label: "Ressources Humaines",
  },
  {
    value: "recrutement",
    label: "Recrutement",
  },
  {
    value: "formation",
    label: "Formation",
  },
  {
    value: "administration",
    label: "Administration",
  },
  {
    value: "administration-publique",
    label: "Administration Publique",
  },
  {
    value: "juridique",
    label: "Juridique",
  },
  {
    value: "droit",
    label: "Droit",
  },
  {
    value: "notariat",
    label: "Notariat",
  },
  {
    value: "vente",
    label: "Vente",
  },
  {
    value: "commerce",
    label: "Commerce",
  },
  {
    value: "e-commerce",
    label: "E-commerce",
  },
  {
    value: "distribution",
    label: "Distribution",
  },
  {
    value: "production",
    label: "Production",
  },
  {
    value: "industrie",
    label: "Industrie",
  },
  {
    value: "manufacturing",
    label: "Manufacturing",
  },
  {
    value: "automobile",
    label: "Automobile",
  },
  {
    value: "aerospatial",
    label: "Aérospatial",
  },
  {
    value: "logistique",
    label: "Logistique",
  },
  {
    value: "transport",
    label: "Transport",
  },
  {
    value: "supply-chain",
    label: "Supply Chain",
  },
  {
    value: "technique",
    label: "Technique",
  },
  {
    value: "ingenierie",
    label: "Ingénierie",
  },
  {
    value: "genie-civil",
    label: "Génie Civil",
  },
  {
    value: "genie-mecanique",
    label: "Génie Mécanique",
  },
  {
    value: "genie-electrique",
    label: "Génie Électrique",
  },
  {
    value: "genie-industriel",
    label: "Génie Industriel",
  },
  {
    value: "architecture",
    label: "Architecture",
  },
  {
    value: "construction",
    label: "Construction",
  },
  {
    value: "bâtiment",
    label: "Bâtiment",
  },
  {
    value: "sante",
    label: "Santé",
  },
  {
    value: "medecine",
    label: "Médecine",
  },
  {
    value: "pharmacie",
    label: "Pharmacie",
  },
  {
    value: "soins-infirmiers",
    label: "Soins Infirmiers",
  },
  {
    value: "paramedical",
    label: "Paramédical",
  },
  {
    value: "biotechnologie",
    label: "Biotechnologie",
  },
  {
    value: "education",
    label: "Éducation",
  },
  {
    value: "enseignement",
    label: "Enseignement",
  },
  {
    value: "recherche",
    label: "Recherche",
  },
  {
    value: "hotellerie-restauration",
    label: "Hôtellerie & Restauration",
  },
  {
    value: "tourisme",
    label: "Tourisme",
  },
  {
    value: "evenementiel",
    label: "Événementiel",
  },
  {
    value: "culture",
    label: "Culture",
  },
  {
    value: "art",
    label: "Art",
  },
  {
    value: "design",
    label: "Design",
  },
  {
    value: "graphisme",
    label: "Graphisme",
  },
  {
    value: "audiovisuel",
    label: "Audiovisuel",
  },
  {
    value: "multimedia",
    label: "Multimédia",
  },
  {
    value: "journalisme",
    label: "Journalisme",
  },
  {
    value: "edition",
    label: "Édition",
  },
  {
    value: "agriculture",
    label: "Agriculture",
  },
  {
    value: "agroalimentaire",
    label: "Agroalimentaire",
  },
  {
    value: "environnement",
    label: "Environnement",
  },
  {
    value: "developpement-durable",
    label: "Développement Durable",
  },
  {
    value: "energie",
    label: "Énergie",
  },
  {
    value: "petrole-gaz",
    label: "Pétrole & Gaz",
  },
  {
    value: "renouvelable",
    label: "Énergies Renouvelables",
  },
  {
    value: "immobilier",
    label: "Immobilier",
  },
  {
    value: "consulting",
    label: "Consulting",
  },
  {
    value: "conseil",
    label: "Conseil",
  },
  {
    value: "qualite",
    label: "Qualité",
  },
  {
    value: "maintenance",
    label: "Maintenance",
  },
  {
    value: "securite",
    label: "Sécurité",
  },
  {
    value: "sport",
    label: "Sport",
  },
  {
    value: "fitness",
    label: "Fitness",
  },
  {
    value: "mode",
    label: "Mode",
  },
  {
    value: "luxe",
    label: "Luxe",
  },
  {
    value: "cosmetique",
    label: "Cosmétique",
  },
  {
    value: "beaute",
    label: "Beauté",
  },
  {
    value: "social",
    label: "Social",
  },
  {
    value: "humanitaire",
    label: "Humanitaire",
  },
  {
    value: "associatif",
    label: "Associatif",
  },
  {
    value: "non-lucratif",
    label: "Non Lucratif",
  },
  {
    value: "autre",
    label: "Autre",
  },
];

const CERTIFICATIONS_PREDEFINIES: Option[] = [
  // Certifications Cloud & DevOps
  {
    value: "aws-certified-solutions-architect",
    label: "AWS Certified Solutions Architect",
  },
  {
    value: "aws-certified-developer",
    label: "AWS Certified Developer",
  },
  {
    value: "aws-certified-sysops-administrator",
    label: "AWS Certified SysOps Administrator",
  },
  {
    value: "azure-fundamentals",
    label: "Microsoft Azure Fundamentals",
  },
  {
    value: "azure-administrator",
    label: "Microsoft Azure Administrator",
  },
  {
    value: "azure-developer",
    label: "Microsoft Azure Developer",
  },
  {
    value: "google-cloud-professional",
    label: "Google Cloud Professional",
  },
  {
    value: "docker-certified-associate",
    label: "Docker Certified Associate",
  },
  {
    value: "kubernetes-administrator",
    label: "Certified Kubernetes Administrator (CKA)",
  },
  {
    value: "terraform-associate",
    label: "HashiCorp Certified: Terraform Associate",
  },
  // Certifications Développement
  {
    value: "oracle-certified-java-developer",
    label: "Oracle Certified Java Developer",
  },
  {
    value: "microsoft-certified-azure-developer",
    label: "Microsoft Certified: Azure Developer Associate",
  },
  {
    value: "salesforce-certified-developer",
    label: "Salesforce Certified Developer",
  },
  {
    value: "scrum-developer",
    label: "Scrum Developer Certification",
  },
  {
    value: "react-developer-certification",
    label: "React Developer Certification",
  },
  {
    value: "vue-js-certification",
    label: "Vue.js Certification",
  },
  {
    value: "angular-certification",
    label: "Angular Certification",
  },
  {
    value: "node-js-certification",
    label: "Node.js Certification",
  },
  // Certifications Cybersécurité
  {
    value: "ceh",
    label: "Certified Ethical Hacker (CEH)",
  },
  {
    value: "cissp",
    label: "Certified Information Systems Security Professional (CISSP)",
  },
  {
    value: "cism",
    label: "Certified Information Security Manager (CISM)",
  },
  {
    value: "security-plus",
    label: "CompTIA Security+",
  },
  {
    value: "gsec",
    label: "GIAC Security Essentials (GSEC)",
  },
  {
    value: "cisa",
    label: "Certified Information Systems Auditor (CISA)",
  },
  // Certifications Data & Analytics
  {
    value: "cloudera-certified-data-engineer",
    label: "Cloudera Certified Data Engineer",
  },
  {
    value: "databricks-certified-associate",
    label: "Databricks Certified Associate",
  },
  {
    value: "tableau-desktop-certified",
    label: "Tableau Desktop Certified",
  },
  {
    value: "power-bi-data-analyst",
    label: "Microsoft Certified: Power BI Data Analyst",
  },
  {
    value: "google-data-analytics",
    label: "Google Data Analytics Certificate",
  },
  {
    value: "sas-certified-specialist",
    label: "SAS Certified Specialist",
  },
  // Certifications Project Management
  {
    value: "pmp",
    label: "Project Management Professional (PMP)",
  },
  {
    value: "prince2",
    label: "PRINCE2 Foundation/Practitioner",
  },
  {
    value: "scrum-master",
    label: "Certified ScrumMaster (CSM)",
  },
  {
    value: "scrum-product-owner",
    label: "Certified Scrum Product Owner (CSPO)",
  },
  {
    value: "agile-certified-practitioner",
    label: "PMI Agile Certified Practitioner (PMI-ACP)",
  },
  {
    value: "itil-foundation",
    label: "ITIL Foundation",
  },
  // Certifications Marketing Digital
  {
    value: "google-ads-certification",
    label: "Google Ads Certification",
  },
  {
    value: "google-analytics-certified",
    label: "Google Analytics Certified",
  },
  {
    value: "facebook-blueprint",
    label: "Facebook Blueprint Certification",
  },
  {
    value: "hubspot-content-marketing",
    label: "HubSpot Content Marketing Certification",
  },
  {
    value: "hubspot-inbound-marketing",
    label: "HubSpot Inbound Marketing Certification",
  },
  {
    value: "hootsuite-social-media",
    label: "Hootsuite Social Media Certification",
  },
  // Certifications Finance & Comptabilité
  {
    value: "cfa",
    label: "Chartered Financial Analyst (CFA)",
  },
  {
    value: "cpa",
    label: "Certified Public Accountant (CPA)",
  },
  {
    value: "acca",
    label: "Association of Chartered Certified Accountants (ACCA)",
  },
  {
    value: "frm",
    label: "Financial Risk Manager (FRM)",
  },
  {
    value: "cia",
    label: "Certified Internal Auditor (CIA)",
  },
  // Certifications RH
  {
    value: "shrm-cp",
    label: "SHRM Certified Professional (SHRM-CP)",
  },
  {
    value: "phr",
    label: "Professional in Human Resources (PHR)",
  },
  {
    value: "sphr",
    label: "Senior Professional in Human Resources (SPHR)",
  },
  // Certifications Qualité
  {
    value: "iso-9001",
    label: "ISO 9001 Lead Auditor",
  },
  {
    value: "six-sigma-green-belt",
    label: "Six Sigma Green Belt",
  },
  {
    value: "six-sigma-black-belt",
    label: "Six Sigma Black Belt",
  },
  {
    value: "lean-certification",
    label: "Lean Certification",
  },
  // Certifications Langues
  {
    value: "toefl",
    label: "TOEFL (Test of English as a Foreign Language)",
  },
  {
    value: "ielts",
    label: "IELTS (International English Language Testing System)",
  },
  {
    value: "toeic",
    label: "TOEIC (Test of English for International Communication)",
  },
  {
    value: "delf",
    label: "DELF (Diplôme d'Études en Langue Française)",
  },
  {
    value: "dalf",
    label: "DALF (Diplôme Approfondi de Langue Française)",
  },
  // Certifications Microsoft
  {
    value: "microsoft-365-fundamentals",
    label: "Microsoft 365 Fundamentals",
  },
  {
    value: "microsoft-teams-administrator",
    label: "Microsoft Teams Administrator Associate",
  },
  {
    value: "microsoft-power-platform",
    label: "Microsoft Power Platform Fundamentals",
  },
  // Certifications Cisco
  {
    value: "ccna",
    label: "Cisco Certified Network Associate (CCNA)",
  },
  {
    value: "ccnp",
    label: "Cisco Certified Network Professional (CCNP)",
  },
  {
    value: "ccie",
    label: "Cisco Certified Internetwork Expert (CCIE)",
  },
  // Certifications Salesforce
  {
    value: "salesforce-administrator",
    label: "Salesforce Certified Administrator",
  },
  {
    value: "salesforce-platform-developer",
    label: "Salesforce Platform Developer",
  },
  {
    value: "salesforce-marketing-cloud",
    label: "Salesforce Marketing Cloud Email Specialist",
  },
  // Certifications Google
  {
    value: "google-cloud-architect",
    label: "Google Cloud Professional Cloud Architect",
  },
  {
    value: "google-cloud-data-engineer",
    label: "Google Cloud Professional Data Engineer",
  },
  {
    value: "google-ux-design",
    label: "Google UX Design Certificate",
  },
  // Autres certifications
  {
    value: "red-hat-certified-engineer",
    label: "Red Hat Certified Engineer (RHCE)",
  },
  {
    value: "linux-professional-institute",
    label: "Linux Professional Institute Certification",
  },
  {
    value: "mongodb-certified-developer",
    label: "MongoDB Certified Developer",
  },
  {
    value: "oracle-database-administrator",
    label: "Oracle Database Administrator",
  },
  {
    value: "adobe-certified-expert",
    label: "Adobe Certified Expert (ACE)",
  },
  {
    value: "autocad-certified",
    label: "AutoCAD Certified",
  },
];

const NIVEAUX_ETUDE_PREDEFINIS = [
  {
    value: "sans-diplome",
    label: "Sans diplôme",
  },
  {
    value: "cep",
    label: "CEP (Certificat d'Études Primaires)",
  },
  {
    value: "becp",
    label: "BEPC (Brevet d'Études du Premier Cycle)",
  },
  {
    value: "cap",
    label: "CAP (Certificat d'Aptitude Professionnelle)",
  },
  {
    value: "bep",
    label: "BEP (Brevet d'Études Professionnelles)",
  },
  {
    value: "baccalaureat",
    label: "Baccalauréat Général",
  },
  { value: "baccalaureat-technologique", label: "Baccalauréat Technologique" },
  { value: "baccalaureat-professionnel", label: "Baccalauréat Professionnel" },
  { value: "bts", label: "BTS (Brevet de Technicien Supérieur)" },
  { value: "dut", label: "DUT (Diplôme Universitaire de Technologie)" },
  {
    value: "deust",
    label:
      "DEUST (Diplôme d'Études Universitaires Scientifiques et Techniques)",
  },
  { value: "licence", label: "Licence" },
  { value: "licence-professionnelle", label: "Licence Professionnelle" },
  { value: "master-1", label: "Master 1 (Maîtrise)" },
  { value: "master-2", label: "Master 2" },
  { value: "master-professionnel", label: "Master Professionnel" },
  { value: "master-recherche", label: "Master de Recherche" },
  { value: "mba", label: "MBA (Master of Business Administration)" },
  { value: "doctorat", label: "Doctorat" },
  { value: "ingenieur", label: "Ingénieur" },
  { value: "grande-ecole", label: "Grande École" },
  { value: "autre", label: "Autre" },
];
export function ProfilSection({ candidat }: ProfilSectionProps) {
  const [file, setFile] = useState<File>();
  const { edgestore } = useEdgeStore();

  // console.log(candidat);
  const [formData, setFormData] = useState({
    nom: candidat?.nom || "",
    prenom: candidat?.prenom || "",
    telephone: candidat?.telephone || "",
    adresse: candidat?.adresse || "",
    ville: candidat?.ville || "",
    pays: candidat?.pays || "",
    dateNaissance: candidat?.dateNaissance
      ? new Date(candidat.dateNaissance).toISOString().split("T")[0]
      : "",
    nationalite: candidat?.nationalite || "",
    situationFamiliale: candidat?.situationFamiliale || "",
    permisConduire: candidat?.permisConduire || "",
    bio: candidat?.bio || "",
    image: candidat?.image || "",
    competences:
      candidat?.candidatCompetences?.map((c: any) => c.competence) || [],
    domaine: candidat?.domaine || "",
    portfolioUrl: candidat?.portfolioUrl || "",
    linkedinUrl: candidat?.linkedinUrl || "",
    certifications: candidat?.certifications?.map((c: any) => c.nom) || [],
    niveauEtude: candidat?.niveauEtude || "",
  });

  const [competences, setCompetences] = useState<string[]>(
    candidat?.candidatCompetences?.map((c: any) => c.competence) || []
  );
  const [nouvelleCompetence, setNouvelleCompetence] = useState("");
  const [showCompetenceInput, setShowCompetenceInput] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialiser les certifications depuis les formations ou un champ dédié
  const getInitialCertifications = (): Option[] => {
    // Si le candidat a des certifications stockées, les convertir en Option[]
    if (candidat?.certifications && Array.isArray(candidat.certifications)) {
      return candidat.certifications
        .map((cert: any) => {
          // Si cert est un objet avec une propriété 'nom', utiliser 'nom'
          // Sinon, traiter comme une string
          const certName =
            typeof cert === "object" && cert !== null
              ? cert.nom || cert.label || cert.value
              : cert;

          if (!certName) return null;

          // Chercher dans les certifications prédéfinies
          const found = CERTIFICATIONS_PREDEFINIES.find(
            (c) => c.value === certName || c.label === certName
          );

          // Si trouvé, utiliser l'option prédéfinie, sinon créer une nouvelle option
          return found || { value: certName, label: certName };
        })
        .filter((opt: Option | null): opt is Option => opt !== null);
    }
    return [];
  };

  const getInitialNiveauxEtude = (): Option[] => {
    if (candidat?.niveauEtude && Array.isArray(candidat.niveauEtude)) {
      return candidat.niveauEtude
        .map((niveau: any) => {
          // Si cert est un objet avec une propriété 'nom', utiliser 'nom'
          // Sinon, traiter comme une string
          const niveauName =
            typeof niveau === "object" && niveau !== null
              ? niveau.nom || niveau.label || niveau.value
              : niveau;

          if (!niveauName) return null;

          // Chercher dans les certifications prédéfinies
          const found = NIVEAUX_ETUDE_PREDEFINIS.find(
            (c) => c.value === niveauName || c.label === niveauName
          );

          // Si trouvé, utiliser l'option prédéfinie, sinon créer une nouvelle option
          return found || { value: niveauName, label: niveauName };
        })
        .filter((opt: Option | null): opt is Option => opt !== null);
    }
    return [];
  };

  const [certifications, setCertifications] = useState<Option[]>(() =>
    getInitialCertifications()
  );

  const [niveauxEtude, setNiveauxEtude] = useState<Option[]>(() =>
    getInitialNiveauxEtude()
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCompetence = (competence: string) => {
    if (competence && !competences.includes(competence)) {
      setCompetences([...competences, competence]);
      setNouvelleCompetence("");
      setShowCompetenceInput(false);
    }
  };

  const handleRemoveCompetence = (competence: string) => {
    setCompetences(competences.filter((c) => c !== competence));
  };
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);

      // Validation de la taille du fichier (max 5MB pour les logos)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 5MB)");
        return;
      }

      // Validation du type de fichier
      if (!file.type.startsWith("image/")) {
        toast.error("Seuls les fichiers image sont acceptés");
        return;
      }

      const uploadedFile = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          console.log(progress);
        },
      });

      if (uploadedFile) {
        // console.log(uploadedFile);
        setFormData((prev) => ({ ...prev, image: uploadedFile.url }));
      } else {
        toast.error("Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    type: "image" | "cv" | "lettre"
  ) => {
    if (file) {
      if (type === "image") {
        await handleImageUpload(file);
        // setFile(file);
      }
    }
  };

  const handleSave = async () => {
    // console.log("handleSave", { ...formData, competences: competences });
    setSaving(true);

    console.log("handleSave", {
      ...formData,
      competences: competences,
      certifications: certifications.map((c) => c.value),
      niveauxEtude: niveauxEtude.map((c) => c.value),
    });
    try {
      const response = await updateCandidat(candidat?.id, {
        ...formData,
        dateNaissance: formData.dateNaissance
          ? new Date(formData.dateNaissance)
          : null,
        competences: competences,
        certifications: certifications.map((c) => c.value),
        niveauxEtude: niveauxEtude.map((c) => c.value),
      } as any);
      if (response.success) {
        toast.success("Profil sauvegardé");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  // console.log(candidat);

  // console.log(formData.bio);

  return (
    <div className="space-y-6 pb-6">
      {/* Photo de profil */}
      <Card>
        <CardHeader>
          <CardTitle>Photo de profil</CardTitle>
          <CardDescription>
            Téléchargez une photo de profil pour améliorer votre visibilité
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={formData.image}
              alt={`${formData.prenom} ${formData.nom}`}
            />
            <AvatarFallback>
              {formData.prenom?.[0] || ""}
              {formData.nom?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("image-upload")?.click()}
              className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
            >
              <Upload className="h-4 w-4 mr-2" />
              Changer la photo
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFile(file);
                if (file) {
                  handleFileUpload(file, "image");
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou GIF. Max 5MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Vos informations de base et coordonnées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Votre nom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                placeholder="Votre prénom"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              placeholder="123 Rue Example"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
                placeholder="Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pays">Pays *</Label>
              <Input
                id="pays"
                name="pays"
                value={formData.pays}
                onChange={handleInputChange}
                placeholder="France"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Informations détaillées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateNaissance">Date de naissance *</Label>
              <Input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                value={formData.dateNaissance}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalite">Nationalité</Label>
              <Input
                id="nationalite"
                name="nationalite"
                value={formData.nationalite}
                onChange={handleInputChange}
                placeholder="Française"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="situationFamiliale">Lien Linkedin</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                placeholder="https://www.linkedin.com/in/your-profile"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permisConduire">Lien Portfolio</Label>
              <Input
                id="portfolioUrl"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleInputChange}
                placeholder="https://your-portfolio.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Niveaux d'étude</Label>
            <MultipleSelector
              value={niveauxEtude}
              onChange={setNiveauxEtude}
              defaultOptions={NIVEAUX_ETUDE_PREDEFINIS}
              placeholder="Sélectionnez vos niveaux d'étude..."
              emptyIndicator={
                <p className="text-center text-sm text-muted-foreground">
                  Aucun niveau d'étude trouvé
                </p>
              }
              commandProps={{
                label: "Rechercher un niveau d'étude",
              }}
              className="w-full"
              creatable
              hidePlaceholderWhenSelected
            />
            <p className="text-xs text-muted-foreground">
              Vous pouvez sélectionner plusieurs niveaux d'étude ou en créer de
              nouvelles
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domaine">Domaine d'activité</Label>
            <Combobox
              data={DONNEES_PREDEFINIES}
              type="domaine"
              value={formData.domaine}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, domaine: value }))
              }
            >
              <ComboboxTrigger className="w-full" />
              <ComboboxContent>
                <ComboboxInput />
                <ComboboxEmpty />
                <ComboboxList className="w-full">
                  <ComboboxGroup>
                    {DONNEES_PREDEFINIES.map((data) => (
                      <ComboboxItem key={data.value} value={data.value}>
                        {data.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="situationFamiliale">Situation familiale</Label>
              <select
                id="situationFamiliale"
                name="situationFamiliale"
                value={formData.situationFamiliale}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Sélectionner</option>
                {SITUATIONS_FAMILIALES.map((sit) => (
                  <option key={sit} value={sit}>
                    {sit}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permisConduire">Permis de conduire</Label>
              <Input
                id="permisConduire"
                name="permisConduire"
                value={formData.permisConduire}
                onChange={handleInputChange}
                placeholder="B, A, etc."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biographie */}
      <Card>
        <CardHeader>
          <CardTitle>Biographie</CardTitle>
          <CardDescription>
            Décrivez-vous en quelques lignes (description personnelle et
            professionnelle)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Parlez-nous de vous, de votre parcours, de vos aspirations..."
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      {/* Compétences */}
      <Card>
        <CardHeader>
          <CardTitle>Compétences</CardTitle>
          <CardDescription>
            Ajoutez vos compétences professionnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Compétences sélectionnées */}
          <div className="flex flex-wrap gap-2">
            {competences.map((comp) => (
              <Badge
                key={comp}
                variant="secondary"
                className="flex items-center gap-2 py-1"
              >
                {comp}
                <button
                  type="button"
                  onClick={() => handleRemoveCompetence(comp)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Liste prédéfinie */}
          <div className="space-y-2">
            <Label>Compétences suggérées</Label>
            <div className="flex flex-wrap gap-2">
              {COMPETENCES_PREDEFINIES.filter(
                (c) => !competences.includes(c)
              ).map((comp) => (
                <Badge
                  key={comp}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleAddCompetence(comp)}
                >
                  + {comp}
                </Badge>
              ))}
            </div>
          </div>

          {/* Ajout personnalisé */}
          {showCompetenceInput ? (
            <div className="flex gap-2">
              <Input
                value={nouvelleCompetence}
                onChange={(e) => setNouvelleCompetence(e.target.value)}
                placeholder="Nouvelle compétence"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCompetence(nouvelleCompetence);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleAddCompetence(nouvelleCompetence);
                }}
                className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
              >
                Ajouter
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowCompetenceInput(false);
                  setNouvelleCompetence("");
                }}
              >
                Annuler
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCompetenceInput(true)}
              className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
            >
              + Ajouter une compétence personnalisée
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Certifications</CardTitle>
          <CardDescription>
            Sélectionnez vos certifications professionnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Certifications</Label>
            <MultipleSelector
              value={certifications}
              onChange={setCertifications}
              defaultOptions={CERTIFICATIONS_PREDEFINIES}
              placeholder="Sélectionnez vos certifications..."
              emptyIndicator={
                <p className="text-center text-sm text-muted-foreground">
                  Aucune certification trouvée
                </p>
              }
              commandProps={{
                label: "Rechercher une certification",
              }}
              className="w-full"
              creatable
              hidePlaceholderWhenSelected
            />
            <p className="text-xs text-muted-foreground">
              Vous pouvez sélectionner plusieurs certifications ou en créer de
              nouvelles
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[120px] bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
        >
          {saving ? (
            "Enregistrement..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
