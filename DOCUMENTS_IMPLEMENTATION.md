# 📄 Implémentation du système de Documents

## ✅ Architecture complète (Repository → Service → Route)

### Structure créée

```
lib/api/documents/
├── repository.ts      # Accès aux données (Prisma)
├── service.ts         # Logique métier
├── types.ts           # Types TypeScript
└── index.ts           # Export centralisé
```

---

## 🗄️ Modèle Prisma

### Document Model

```prisma
model Document {
  id           String   @id @default(cuid())
  fileName     String
  fileUrl      String
  fileType     String
  fileSize     Int
  documentType String   // cv, lettre, autre
  candidatId   String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  candidat     Candidat @relation(fields: [candidatId], references: [id], onDelete: Cascade)

  @@index([candidatId], map: "Document_candidatId_fkey")
}
```

### Relation ajoutée au modèle Candidat

```prisma
model Candidat {
  // ... autres champs
  documents    Document[]
  // ...
}
```

---

## 📊 Architecture en couches

### 1. Repository Layer (Accès aux données)

**Fichier:** `lib/api/documents/repository.ts`

```typescript
export class DocumentRepository {
  async findByCandidatId(candidatId: string)
  async findById(id: string)
  async create(data: CreateDocumentData)
  async delete(id: string)
  async updateCandidatFile(candidatId: string, type: "cv" | "lettre", url: string)
}
```

### 2. Service Layer (Logique métier)

**Fichier:** `lib/api/documents/service.ts`

```typescript
export class DocumentService {
  async getDocumentsByCandidatId(candidatId: string)
  async getDocumentById(id: string)
  async createDocument(data: CreateDocumentData)
  async deleteDocument(id: string)
  async checkOwnership(documentId: string, userId: string)
}
```

**Logique métier implémentée:**
- Validation des champs requis
- Mise à jour automatique du champ `cv` ou `letterm` du candidat lors de l'upload
- Vérification des permissions (ownership)

### 3. Routes API (Controllers)

**Fichier:** `app/api/candidats/[id]/documents/route.ts`
- `GET /api/candidats/[id]/documents` - Récupérer tous les documents d'un candidat

**Fichier:** `app/api/upload/route.ts`
- `POST /api/upload` - Upload d'un document (avec EdgeStore)

**Fichier:** `app/api/documents/[id]/route.ts`
- `DELETE /api/documents/[id]` - Supprimer un document

---

## 📤 Intégration EdgeStore

### Configuration EdgeStore

EdgeStore est déjà configuré dans le projet :
- **Fichier:** `app/api/edgestore/[...edgestore]/route.ts`
- **Bucket:** `publicFiles`

### Workflow d'upload

Le processus d'upload se fait en 2 étapes :

#### 1. Upload vers EdgeStore (côté client)

```typescript
const res = await edgestore.publicFiles.upload({
  file,
});
```

#### 2. Enregistrement des métadonnées (API)

```typescript
const response = await fetch(`/api/upload`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    candidatId,
    fileName: file.name,
    fileUrl: res.url,  // URL retournée par EdgeStore
    fileType: file.type,
    fileSize: file.size,
    documentType,
  }),
});
```

### Workflow de suppression

#### 1. Suppression de la base de données (API)

```typescript
await fetch(`/api/documents/${id}`, {
  method: "DELETE",
});
```

#### 2. Suppression d'EdgeStore (côté client)

```typescript
await edgestore.publicFiles.delete({
  url: fileUrl,
});
```

---

## 🎯 Composant DocumentsSection

**Fichier:** `app/components/publicc/candidat-sections/DocumentsSection.tsx`

### Fonctionnalités implémentées

✅ **Upload de documents**
- CV (PDF, DOC, DOCX)
- Lettres de motivation (PDF, DOC, DOCX)
- Autres documents (PDF, DOC, DOCX, JPG, PNG)
- Upload via EdgeStore avec indicateur de progression
- Mise à jour automatique du profil candidat (champs `cv` et `letterm`)

✅ **Affichage des documents**
- Regroupement par type (CV, Lettres, Autres)
- Informations affichées : nom, taille, date d'upload
- Icônes selon le type de fichier (PDF, Word, etc.)

✅ **Actions sur les documents**
- Téléchargement (ouverture dans un nouvel onglet)
- Suppression avec confirmation
- Suppression dans EdgeStore ET la base de données

### Interface

```typescript
interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  documentType: "cv" | "lettre" | "autre";
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔐 Sécurité

Toutes les routes incluent :
- ✅ **Authentification** via `better-auth`
- ✅ **Autorisation** : vérification que le candidat appartient à l'utilisateur connecté
- ✅ **Validation** des champs requis
- ✅ **Vérification de ownership** avant suppression
- ✅ Gestion d'erreurs complète avec codes HTTP appropriés

---

## 📝 Routes API créées

### GET /api/candidats/[id]/documents

Récupère tous les documents d'un candidat.

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_123",
      "fileName": "CV_John_Doe.pdf",
      "fileUrl": "https://edgestore.url/...",
      "fileType": "application/pdf",
      "fileSize": 245678,
      "documentType": "cv",
      "candidatId": "cand_456",
      "createdAt": "2024-11-02T10:00:00Z",
      "updatedAt": "2024-11-02T10:00:00Z"
    }
  ]
}
```

### POST /api/upload

Upload un nouveau document (après upload EdgeStore).

**Body:**
```json
{
  "candidatId": "cand_456",
  "fileName": "CV_John_Doe.pdf",
  "fileUrl": "https://edgestore.url/...",
  "fileType": "application/pdf",
  "fileSize": 245678,
  "documentType": "cv"
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "document": { /* Document object */ },
    "url": "https://edgestore.url/..."
  }
}
```

**Effet de bord:**
- Si `documentType === "cv"`, met à jour `candidat.cv` avec l'URL
- Si `documentType === "lettre"`, met à jour `candidat.letterm` avec l'URL

### DELETE /api/documents/[id]

Supprime un document.

**Réponse:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## 🎨 Types de documents supportés

### CV
- Formats: PDF, DOC, DOCX
- Stockage: EdgeStore + URL dans `candidat.cv`
- Catégorie: `documentType: "cv"`

### Lettres de motivation
- Formats: PDF, DOC, DOCX
- Stockage: EdgeStore + URL dans `candidat.letterm`
- Catégorie: `documentType: "lettre"`

### Autres documents
- Formats: PDF, DOC, DOCX, JPG, JPEG, PNG
- Stockage: EdgeStore uniquement
- Catégorie: `documentType: "autre"`
- Exemples: Certificats, attestations, diplômes, etc.

---

## 🔄 Migration Prisma

Migration créée : `20251102122355_add_document_model`

Pour appliquer la migration :
```bash
npx prisma migrate dev
```

Pour générer le client Prisma :
```bash
npx prisma generate
```

---

## 🚀 Utilisation dans le code

### Côté client (React)

```typescript
import { DocumentsSection } from "@/app/components/publicc/candidat-sections/DocumentsSection";

<DocumentsSection candidatId={candidat?.id} />
```

### Côté serveur (API)

```typescript
import { documentService } from "@/lib/api/documents";

// Récupérer les documents
const documents = await documentService.getDocumentsByCandidatId(candidatId);

// Créer un document
const document = await documentService.createDocument({
  candidatId,
  fileName,
  fileUrl,
  fileType,
  fileSize,
  documentType,
});

// Supprimer un document
await documentService.deleteDocument(documentId);
```

---

## ✅ Avantages de cette implémentation

1. **Architecture en couches** : Code organisé et maintenable
2. **EdgeStore** : Stockage cloud performant et sécurisé
3. **Typage fort** : TypeScript pour la sécurité des types
4. **Sécurité** : Authentification et autorisation sur toutes les routes
5. **Automatisation** : Mise à jour automatique du profil candidat
6. **UX optimale** : Feedbacks clairs, indicateurs de chargement
7. **Réutilisabilité** : Services réutilisables dans d'autres contextes

---

## 🎯 Fonctionnalités futures possibles

- [ ] Prévisualisation des documents (PDF viewer)
- [ ] Compression automatique des images
- [ ] Limitation de taille par type de document
- [ ] Versions multiples de CV
- [ ] Génération automatique de CV à partir du profil
- [ ] Statistiques d'utilisation des documents
- [ ] Partage de documents avec les recruteurs
- [ ] Scan antivirus des fichiers uploadés

---

**✅ Système de documents complètement fonctionnel et sécurisé !**

