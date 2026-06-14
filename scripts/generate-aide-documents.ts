/**
 * generate-aide-documents.ts
 *
 * Génère les documents téléchargeables de la page "Aide et support" :
 * - Guide de création d'offres efficaces (PDF)
 * - Checklist de recrutement (PDF)
 * - Template de lettre de motivation (DOCX)
 *
 * Usage : npx tsx scripts/generate-aide-documents.ts
 */
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";

const OUT_DIR = path.join(process.cwd(), "public", "documents");
fs.mkdirSync(OUT_DIR, { recursive: true });

const PURPLE = "#7c3aed";
const GRAY = "#6b7280";
const DARK = "#1f2937";

function newPdfDoc(title: string, subtitle: string) {
  const doc = new PDFDocument({ size: "A4", margin: 56 });

  doc
    .fillColor(PURPLE)
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("YLSIX", { align: "left" });

  doc
    .moveDown(0.3)
    .fillColor(DARK)
    .fontSize(18)
    .font("Helvetica-Bold")
    .text(title);

  doc
    .moveDown(0.1)
    .fillColor(GRAY)
    .fontSize(11)
    .font("Helvetica")
    .text(subtitle);

  doc
    .moveDown(0.5)
    .strokeColor(PURPLE)
    .lineWidth(1.5)
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke();

  doc.moveDown(0.8);
  return doc;
}

function addHeading(doc: PDFKit.PDFDocument, text: string) {
  doc
    .moveDown(0.6)
    .fillColor(PURPLE)
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(text);
  doc.moveDown(0.2);
}

function addParagraph(doc: PDFKit.PDFDocument, text: string) {
  doc
    .fillColor(DARK)
    .fontSize(10.5)
    .font("Helvetica")
    .text(text, { align: "justify" });
  doc.moveDown(0.3);
}

function addBullet(doc: PDFKit.PDFDocument, text: string) {
  doc
    .fillColor(DARK)
    .fontSize(10.5)
    .font("Helvetica")
    .text(`•  ${text}`, { indent: 10 });
}

function addCheckItem(doc: PDFKit.PDFDocument, text: string) {
  doc
    .fillColor(DARK)
    .fontSize(10.5)
    .font("Helvetica")
    .text(`[ ]  ${text}`, { indent: 10 });
  doc.moveDown(0.05);
}

function addFooterNote(doc: PDFKit.PDFDocument) {
  doc.moveDown(1);
  doc
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke();
  doc.moveDown(0.4);
  doc
    .fillColor(GRAY)
    .fontSize(9)
    .font("Helvetica-Oblique")
    .text(
      "Document fourni par Ylsix pour vous aider dans vos recrutements. " +
        "Besoin d'aide ? contact@ylsix.com — +225 07 08 71 78 68",
      { align: "center" }
    );
}

// ---------------------------------------------------------------------------
// 1. Guide de création d'offres efficaces
// ---------------------------------------------------------------------------
function generateGuideOffres() {
  const doc = newPdfDoc(
    "Guide de création d'offres efficaces",
    "Rédigez des offres d'emploi qui attirent les meilleurs talents"
  );

  addParagraph(
    doc,
    "Une offre d'emploi bien rédigée est le premier levier pour attirer des candidats qualifiés. " +
      "Ce guide présente les bonnes pratiques à appliquer pour maximiser la qualité et le nombre de vos candidatures."
  );

  addHeading(doc, "1. Un titre de poste clair et percutant");
  addBullet(doc, "Utilisez l'intitulé exact du poste, sans jargon interne.");
  addBullet(doc, "Indiquez le niveau de séniorité si pertinent (Junior, Senior, Lead...).");
  addBullet(doc, "Mentionnez le type de contrat si déterminant (CDI, CDD, Stage, Freelance).");
  addBullet(doc, "Exemple : \"Développeur Full-Stack React/Node.js (CDI) - Abidjan\".");

  addHeading(doc, "2. Une présentation d'entreprise convaincante");
  addBullet(doc, "Présentez votre mission, vos valeurs et votre culture en 2 à 3 phrases.");
  addBullet(doc, "Mettez en avant ce qui différencie votre entreprise.");
  addBullet(doc, "Donnez un aperçu de l'équipe que le candidat va rejoindre.");

  addHeading(doc, "3. Une description de poste précise et structurée");
  addBullet(doc, "Listez les missions principales (5 à 8 points maximum).");
  addBullet(doc, "Précisez le contexte : à qui le poste est-il rattaché ?");
  addBullet(doc, "Indiquez les outils et technologies utilisés au quotidien.");
  addBullet(doc, "Mentionnez les objectifs à 3, 6 et 12 mois si possible.");

  addHeading(doc, "4. Des compétences et qualifications réalistes");
  addBullet(doc, "Distinguez compétences indispensables et compétences appréciées.");
  addBullet(doc, "Évitez les listes interminables qui dissuadent les candidats.");
  addBullet(doc, "Privilégiez les compétences réellement utilisées au quotidien.");

  addHeading(doc, "5. Une rémunération et des avantages transparents");
  addBullet(doc, "Indiquez une fourchette de salaire si possible : cela augmente le taux de candidature.");
  addBullet(doc, "Listez les avantages concrets : télétravail, mutuelle, primes, formation...");
  addBullet(doc, "Précisez le lieu de travail et la politique de télétravail.");

  addHeading(doc, "6. Un processus de candidature clair");
  addBullet(doc, "Expliquez les étapes du processus de recrutement et leur durée approximative.");
  addBullet(doc, "Indiquez les documents attendus (CV, lettre de motivation, portfolio...).");
  addBullet(doc, "Donnez un délai de réponse estimé.");

  addHeading(doc, "7. Erreurs fréquentes à éviter");
  addBullet(doc, "Offres trop longues, trop vagues ou trop génériques.");
  addBullet(doc, "Exigences disproportionnées par rapport au niveau réel du poste.");
  addBullet(doc, "Absence totale d'informations sur la rémunération.");
  addBullet(doc, "Titre de poste trompeur ou copié-collé d'une offre précédente sans adaptation.");

  addHeading(doc, "8. Checklist avant publication");
  addCheckItem(doc, "Titre clair et spécifique");
  addCheckItem(doc, "Présentation de l'entreprise à jour");
  addCheckItem(doc, "Missions et responsabilités détaillées");
  addCheckItem(doc, "Compétences requises réalistes");
  addCheckItem(doc, "Informations sur la rémunération et les avantages");
  addCheckItem(doc, "Relecture orthographique et grammaticale");

  addFooterNote(doc);

  const filePath = path.join(OUT_DIR, "guide-creation-offres-efficaces.pdf");
  doc.pipe(fs.createWriteStream(filePath));
  doc.end();
  return filePath;
}

// ---------------------------------------------------------------------------
// 2. Checklist de recrutement
// ---------------------------------------------------------------------------
function generateChecklistRecrutement() {
  const doc = newPdfDoc(
    "Checklist de recrutement",
    "Ne rien oublier à chaque étape de votre processus de recrutement"
  );

  addHeading(doc, "1. Avant de publier l'offre");
  addCheckItem(doc, "Définir précisément le besoin (poste, mission, profil recherché)");
  addCheckItem(doc, "Valider le budget et la fourchette de salaire avec la direction");
  addCheckItem(doc, "Rédiger une offre claire et attractive");
  addCheckItem(doc, "Choisir les canaux de diffusion adaptés (site, réseaux sociaux, jobboards)");
  addCheckItem(doc, "Définir le processus et le calendrier de recrutement");

  addHeading(doc, "2. Réception et tri des candidatures");
  addCheckItem(doc, "Mettre en place un suivi centralisé des candidatures (ATS)");
  addCheckItem(doc, "Définir des critères de présélection objectifs");
  addCheckItem(doc, "Envoyer un accusé de réception aux candidats");
  addCheckItem(doc, "Trier les candidatures selon les critères définis");
  addCheckItem(doc, "Identifier les profils prioritaires à contacter");

  addHeading(doc, "3. Présélection et entretiens");
  addCheckItem(doc, "Préparer une grille d'entretien standardisée");
  addCheckItem(doc, "Planifier les entretiens avec les parties prenantes");
  addCheckItem(doc, "Préparer les questions techniques et comportementales");
  addCheckItem(doc, "Prendre des notes structurées après chaque entretien");
  addCheckItem(doc, "Évaluer chaque candidat sur les mêmes critères");

  addHeading(doc, "4. Décision et offre");
  addCheckItem(doc, "Comparer les candidats retenus de manière objective");
  addCheckItem(doc, "Vérifier les références si nécessaire");
  addCheckItem(doc, "Préparer la proposition (poste, rémunération, avantages, date de début)");
  addCheckItem(doc, "Informer les candidats non retenus avec un retour constructif");
  addCheckItem(doc, "Faire valider l'offre par les parties concernées");

  addHeading(doc, "5. Intégration (onboarding)");
  addCheckItem(doc, "Préparer le poste de travail et les accès (matériel, comptes, badges)");
  addCheckItem(doc, "Planifier un parcours d'intégration sur les premières semaines");
  addCheckItem(doc, "Désigner un référent ou un parrain pour le nouveau collaborateur");
  addCheckItem(doc, "Présenter l'équipe, l'organisation et les outils");
  addCheckItem(doc, "Planifier un point de suivi à 1 mois et à 3 mois");

  addFooterNote(doc);

  const filePath = path.join(OUT_DIR, "checklist-recrutement.pdf");
  doc.pipe(fs.createWriteStream(filePath));
  doc.end();
  return filePath;
}

// ---------------------------------------------------------------------------
// 3. Template de lettre de motivation (DOCX)
// ---------------------------------------------------------------------------
function placeholder(text: string) {
  return new TextRun({ text, italics: true, color: "7C3AED" });
}

function plain(text: string) {
  return new TextRun({ text });
}

async function generateTemplateLettre() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: "YLSIX", bold: true, color: "7C3AED", size: 28 })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Modèle de lettre de motivation",
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Remplacez les éléments en italique entre crochets par vos propres informations.",
                italics: true,
                color: "6B7280",
                size: 20,
              }),
            ],
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "7C3AED" },
            },
            spacing: { after: 300 },
          }),

          // Coordonnées expéditeur
          new Paragraph({ children: [placeholder("[Prénom NOM]")] }),
          new Paragraph({ children: [placeholder("[Adresse postale]")] }),
          new Paragraph({ children: [placeholder("[Téléphone]")] }),
          new Paragraph({ children: [placeholder("[Email]")], spacing: { after: 200 } }),

          // Date / lieu, aligné à droite
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [placeholder("[Ville], le [date]")],
            spacing: { after: 200 },
          }),

          // Coordonnées destinataire
          new Paragraph({ children: [placeholder("[Nom de l'entreprise]")] }),
          new Paragraph({ children: [placeholder("À l'attention de [Nom du recruteur / Service Recrutement]")] }),
          new Paragraph({ children: [placeholder("[Adresse de l'entreprise]")], spacing: { after: 200 } }),

          // Objet
          new Paragraph({
            children: [plain("Objet : "), placeholder("Candidature au poste de [intitulé du poste]")],
            spacing: { after: 200 },
          }),

          new Paragraph({ children: [plain("Madame, Monsieur,")], spacing: { after: 200 } }),

          new Paragraph({
            children: [
              placeholder(
                "[Présentez-vous brièvement et indiquez le poste pour lequel vous postulez, ainsi que la source de l'offre (Ylsix, recommandation, site de l'entreprise...).]"
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              placeholder(
                "[Mettez en avant votre formation et vos expériences les plus pertinentes pour le poste, en illustrant avec des résultats concrets et chiffrés si possible.]"
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              placeholder(
                "[Expliquez pourquoi ce poste et cette entreprise vous intéressent particulièrement, et ce que vous pouvez apporter à l'équipe.]"
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              placeholder(
                "[Exprimez votre disponibilité pour un entretien et remerciez le destinataire pour l'attention portée à votre candidature.]"
              ),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              plain(
                "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées."
              ),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [placeholder("[Signature]")],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [placeholder("[Prénom NOM]")],
            spacing: { after: 400 },
          }),

          new Paragraph({
            border: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "E5E7EB" },
            },
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: "Conseil Ylsix : adaptez ce modèle à chaque candidature. Une lettre personnalisée, " +
                  "qui montre que vous avez compris le poste et l'entreprise, fait toujours la différence. " +
                  "Visez une page maximum.",
                italics: true,
                size: 18,
                color: "6B7280",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const filePath = path.join(OUT_DIR, "template-lettre-motivation.docx");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

async function main() {
  const files: string[] = [];
  files.push(generateGuideOffres());
  files.push(generateChecklistRecrutement());

  // Laisser le temps aux flux PDF de s'écrire sur disque avant de lire leur taille
  await new Promise((resolve) => setTimeout(resolve, 500));

  files.push(await generateTemplateLettre());

  await new Promise((resolve) => setTimeout(resolve, 200));

  for (const file of files) {
    const { size } = fs.statSync(file);
    console.log(`${path.basename(file)} -> ${(size / 1024).toFixed(1)} KB`);
  }
}

main();
