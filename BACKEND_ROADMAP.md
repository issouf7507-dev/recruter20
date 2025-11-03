# 🗺️ Roadmap Backend - Application de Recrutement

**Date de création :** 26 octobre 2024  
**Durée estimée :** 2-3 semaines  
**Framework :** Next.js 15 + Prisma + TypeScript

---

## 📊 Vue d'ensemble

```
Semaine 1 : Foundation & Auth
├── Jour 1-2 : Configuration initiale
├── Jour 3-4 : Système d'authentification
└── Jour 5 : CRUD Candidats

Semaine 2 : Core Features
├── Jour 6-7 : CRUD Recruteurs & Offres
├── Jour 8-9 : Système de candidatures
└── Jour 10 : Messages & Notifications

Semaine 3 : Polish & Test
├── Jour 11-12 : Upload de fichiers
├── Jour 13-14 : Tests & Documentation
└── Jour 15 : Deployment
```

---

## 🎯 Étape 1 : Configuration Initiale (Jour 1-2)

### ✅ Objectifs

- [ ] Installer les dépendances nécessaires
- [ ] Créer la structure de dossiers
- [ ] Configurer Prisma
- [ ] Créer les types de base

### 📝 Actions à effectuer

#### 1.1 Installer les dépendances

```bash
# Authentification et sécurité
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# Validation
npm install zod

# Utilitaires
npm install date-fns
```

#### 1.2 Créer la structure de dossiers

```bash
# Créer les dossiers nécessaires
mkdir -p lib/api/{candidats,recruteurs,offres,candidatures,conversations,notifications}
mkdir -p lib/middleware
mkdir -p lib/hooks
mkdir -p lib/mappers
mkdir -p types
mkdir -p app/api/{auth,candidats,recruteurs,offres,candidatures,conversations,notifications,upload}
```

#### 1.3 Créer les fichiers de base

```bash
# Créer les fichiers essentiels
touch lib/prisma.ts
touch lib/auth.ts
touch lib/validation.ts
touch lib/utils.ts
touch lib/constants.ts
touch lib/middleware/auth.middleware.ts
touch types/api.ts
touch types/candidat.ts
touch types/recruteur.ts
touch types/offre.ts
touch types/candidature.ts
```

#### 1.4 Configurer les variables d'environnement

```bash
# Ajouter dans .env
JWT_SECRET=votre-secret-super-securise
NEXT_PUBLIC_API_URL=http://localhost:3000
UPLOAD_MAX_SIZE=10485760  # 10MB
```

#### 1.5 Vérification

```bash
# Vérifier que Prisma fonctionne
npx prisma generate
npx prisma db push
```

**✅ Critères de succès :**

- Tous les dossiers créés
- Prisma généré sans erreur
- Pas d'erreur TypeScript

---

## 🔐 Étape 2 : Système d'Authentification (Jour 3-4)

### ✅ Objectifs

- [ ] Implémenter le hashage des mots de passe
- [ ] Créer les helpers JWT
- [ ] Créer le middleware d'authentification
- [ ] Créer les endpoints d'auth

### 📝 Implémentation

#### 2.1 Créer lib/auth.ts

**Fichier :** `lib/auth.ts`

```typescript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new Error("Invalid token");
  }
}
```

#### 2.2 Créer lib/prisma.ts

**Fichier :** `lib/prisma.ts`

```typescript
import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

#### 2.3 Créer le middleware d'auth

**Fichier :** `lib/middleware/auth.middleware.ts`

```typescript
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function authMiddleware(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        candidat: true,
        recruteur: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await authMiddleware(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
```

#### 2.4 Créer les endpoints d'authentification

**Fichier :** `app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        candidat: true,
        recruteur: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const valid = await verifyPassword(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Générer le token
    const token = generateToken(user.id);

    // Retourner les données utilisateur
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        candidat: user.candidat,
        recruteur: user.recruteur,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Fichier :** `app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  type: z.enum(["CANDIDAT", "RECRUTEUR"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(data.password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        type: data.type,
      },
    });

    // Créer le profil selon le type
    if (data.type === "CANDIDAT") {
      await prisma.candidat.create({
        data: {
          userId: user.id,
          email: user.email,
          pays: "FR", // À adapter
          dateNaissance: new Date(),
        },
      });
    } else if (data.type === "RECRUTEUR") {
      await prisma.recruteur.create({
        data: {
          userId: user.id,
          email: user.email,
          name: data.name,
          type: "PARTICULIER",
        },
      });
    }

    // Générer le token
    const token = generateToken(user.id);

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

#### 2.5 Tester l'authentification

```bash
# Tester la création d'un compte
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test","type":"CANDIDAT"}'

# Tester la connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**✅ Critères de succès :**

- Inscription fonctionnelle
- Connexion fonctionnelle
- Token JWT valide
- Mot de passe hashé

---

## 👤 Étape 3 : CRUD Candidats (Jour 5)

### ✅ Objectifs

- [ ] Créer le repository Candidats
- [ ] Créer le service Candidats
- [ ] Créer les endpoints API
- [ ] Tester les opérations CRUD

### 📝 Implémentation

#### 3.1 Créer le repository

**Fichier :** `lib/api/candidats/repository.ts`

```typescript
import prisma from "@/lib/prisma";

export class CandidatRepository {
  async findById(id: string) {
    return prisma.candidat.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            type: true,
          },
        },
        applications: {
          where: { deletedAt: null },
          include: {
            jobOffer: true,
            column: true,
          },
        },
        experiences: true,
        formations: true,
        objectifs: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.candidat.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        experiences: true,
        formations: true,
      },
    });
  }
}
```

#### 3.2 Créer le service

**Fichier :** `lib/api/candidats/service.ts`

```typescript
import { CandidatRepository } from "./repository";

export class CandidatService {
  private repository: CandidatRepository;

  constructor() {
    this.repository = new CandidatRepository();
  }

  async getCandidat(id: string) {
    return this.repository.findById(id);
  }

  async updateCandidat(id: string, data: any) {
    return this.repository.update(id, data);
  }
}
```

#### 3.3 Créer les endpoints

**Fichier :** `app/api/candidats/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { CandidatService } from "@/lib/api/candidats/service";
import { requireAuth } from "@/lib/middleware/auth.middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(request);
    const service = new CandidatService();
    const candidat = await service.getCandidat(params.id);

    if (!candidat) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(candidat);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);

    // Un candidat ne peut modifier que son propre profil
    if (params.id !== user.candidat?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const service = new CandidatService();
    const updated = await service.updateCandidat(params.id, body);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**✅ Critères de succès :**

- GET /api/candidats/[id] fonctionne
- PUT /api/candidats/[id] fonctionne
- Les permissions sont respectées

---

## 🏢 Étape 4 : CRUD Recruteurs (Jour 6)

### ✅ Objectifs

- [ ] Créer le repository Recruteurs
- [ ] Créer le service Recruteurs
- [ ] Créer les endpoints API
- [ ] Tester les opérations

### 📝 Actions similaires à l'étape 3

Créer :

- `lib/api/recruteurs/repository.ts`
- `lib/api/recruteurs/service.ts`
- `app/api/recruteurs/[id]/route.ts`

---

## 💼 Étape 5 : CRUD Offres (Jour 7)

### ✅ Objectifs

- [ ] Repository Offres
- [ ] Service Offres
- [ ] Endpoints CRUD complets
- [ ] Système de pagination
- [ ] Filtres et recherche

### 📝 Implémentation

#### 5.1 Créer le repository

**Fichier :** `lib/api/offres/repository.ts`

```typescript
import prisma from "@/lib/prisma";

export class OffreRepository {
  async findMany(filters: any) {
    const {
      page = 1,
      limit = 10,
      recruteurId,
      etat,
      location,
      search,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(recruteurId && { recruteurId }),
      ...(etat && { etat }),
      ...(location && { location: { contains: location } }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where,
        include: {
          recruteur: {
            select: {
              id: true,
              name: true,
              entreprise: true,
              logo: true,
            },
          },
          kanbanColumns: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.jobOffer.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.jobOffer.findUnique({
      where: { id, deletedAt: null },
      include: {
        recruteur: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        kanbanColumns: {
          orderBy: { order: "asc" },
        },
        applications: {
          where: { deletedAt: null },
          include: {
            candidat: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
            column: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    return prisma.jobOffer.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        recruteur: true,
        kanbanColumns: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.jobOffer.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        recruteur: true,
      },
    });
  }

  async softDelete(id: string) {
    return prisma.jobOffer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
```

#### 5.2 Créer le service

**Fichier :** `lib/api/offres/service.ts`

```typescript
import { OffreRepository } from "./repository";

export class OffreService {
  private repository: OffreRepository;

  constructor() {
    this.repository = new OffreRepository();
  }

  async getOffres(filters: any) {
    return this.repository.findMany(filters);
  }

  async getOffre(id: string) {
    return this.repository.findById(id);
  }

  async createOffre(data: any, recruteurId: string) {
    // Créer l'offre
    const offre = await this.repository.create({
      ...data,
      recruteurId,
      views: 0,
    });

    // Créer les colonnes Kanban par défaut
    await this.createDefaultColumns(offre.id);

    return this.repository.findById(offre.id);
  }

  async updateOffre(id: string, data: any) {
    return this.repository.update(id, data);
  }

  async deleteOffre(id: string) {
    return this.repository.softDelete(id);
  }

  private async createDefaultColumns(jobOfferId: string) {
    const defaultColumns = [
      { name: "À examiner", color: "#3b82f6", order: 0, isDefault: true },
      { name: "En cours", color: "#f59e0b", order: 1, isDefault: true },
      { name: "Entretien", color: "#8b5cf6", order: 2, isDefault: true },
      { name: "Accepté", color: "#10b981", order: 3, isDefault: true },
      { name: "Refusé", color: "#ef4444", order: 4, isDefault: true },
    ];

    await prisma.kanbanColumn.createMany({
      data: defaultColumns.map((col) => ({
        ...col,
        jobOfferId,
      })),
    });
  }
}
```

#### 5.3 Créer les endpoints

**Fichier :** `app/api/offres/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { OffreService } from "@/lib/api/offres/service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { z } from "zod";

const offreSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  company: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  etat: z.string().default("active"),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      recruteurId: searchParams.get("recruteurId") || undefined,
      etat: searchParams.get("etat") || undefined,
      location: searchParams.get("location") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const service = new OffreService();
    const result = await service.getOffres(filters);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (user.type !== "RECRUTEUR") {
      return NextResponse.json(
        { error: "Only recruiters can create offers" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = offreSchema.parse(body);

    const service = new OffreService();
    const offre = await service.createOffre(data, user.recruteur!.id);

    return NextResponse.json(offre, { status: 201 });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**✅ Critères de succès :**

- CRUD complet fonctionnel
- Pagination fonctionnelle
- Filtres fonctionnels
- Colonnes Kanban créées automatiquement

---

## 📋 Étape 6 : Système de Candidatures (Jour 8-9)

### ✅ Objectifs

- [ ] CRUD Candidatures
- [ ] Déplacement Kanban
- [ ] Notes et fichiers
- [ ] Checklist

### 📝 Endpoints à créer

```
POST   /api/candidatures              # Postuler à une offre
GET    /api/candidatures              # Lister (avec filtres)
GET    /api/candidatures/[id]         # Détails
PUT    /api/candidatures/[id]         # Modifier
DELETE /api/candidatures/[id]         # Supprimer (soft)
POST   /api/candidatures/[id]/move    # Déplacer dans Kanban
POST   /api/candidatures/[id]/notes   # Ajouter une note
GET    /api/candidatures/[id]/notes   # Lister les notes
POST   /api/candidatures/[id]/files   # Upload fichier
```

**Implémentation similaire aux étapes précédentes**

---

## 💬 Étape 7 : Messages et Conversations (Jour 10)

### ✅ Objectifs

- [ ] API Conversations
- [ ] API Messages
- [ ] Gestion du statut lu/non lu

### 📝 Endpoints

```
GET    /api/conversations                    # Liste conversations
POST   /api/conversations                    # Créer conversation
GET    /api/conversations/[id]               # Détails
GET    /api/conversations/[id]/messages      # Messages
POST   /api/conversations/[id]/messages      # Envoyer message
POST   /api/conversations/[id]/read-all      # Marquer comme lus
```

---

## 🔔 Étape 8 : Notifications (Jour 11)

### ✅ Objectifs

- [ ] Créer des notifications
- [ ] Marquer comme lues
- [ ] Compteur de non-lus

### 📝 Endpoints

```
GET    /api/notifications                    # Liste
GET    /api/notifications/unread-count       # Compteur
POST   /api/notifications/[id]/read          # Marquer lu
POST   /api/notifications/read-all           # Tout marquer lu
```

---

## 📤 Étape 9 : Upload de fichiers (Jour 12)

### ✅ Objectifs

- [ ] Endpoint d'upload
- [ ] Gestion des types de fichiers
- [ ] Limite de taille
- [ ] Stockage local/S3

### 📝 Implémentation

**Fichier :** `app/api/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Vérifier la taille
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Vérifier le type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), "public", "uploads", filename);

    await writeFile(path, buffer);

    return NextResponse.json({
      filename,
      url: `/uploads/${filename}`,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

---

## 🧪 Étape 10 : Tests et Documentation (Jour 13-14)

### ✅ Objectifs

- [ ] Tester tous les endpoints
- [ ] Documenter l'API
- [ ] Gérer les erreurs
- [ ] Optimiser les performances

### 📝 Actions

1. **Créer un fichier de tests**

```bash
touch tests/api.test.ts
```

2. **Tester avec Postman/Thunder Client**

   - Créer une collection
   - Tester chaque endpoint
   - Vérifier les réponses

3. **Documenter avec Swagger/OpenAPI**

   ```bash
   npm install swagger-ui-react swagger-jsdoc
   ```

4. **Optimiser les requêtes**
   - Vérifier les index
   - Optimiser les includes
   - Ajouter du cache si nécessaire

---

## 🚀 Étape 11 : Deployment (Jour 15)

### ✅ Objectifs

- [ ] Préparer pour la production
- [ ] Configurer les variables d'environnement
- [ ] Déployer

### 📝 Checklist Production

```bash
# 1. Build
npm run build

# 2. Vérifier les variables d'environnement
# DATABASE_URL
# JWT_SECRET
# NODE_ENV=production

# 3. Déployer sur Vercel/autre plateforme

# 4. Vérifier les migrations
npx prisma migrate deploy
```

---

## 📊 Tableau de Progression

| Étape               | Durée   | Statut | Notes |
| ------------------- | ------- | ------ | ----- |
| 1. Configuration    | 2 jours | ⬜     |       |
| 2. Authentification | 2 jours | ⬜     |       |
| 3. CRUD Candidats   | 1 jour  | ⬜     |       |
| 4. CRUD Recruteurs  | 1 jour  | ⬜     |       |
| 5. CRUD Offres      | 1 jour  | ⬜     |       |
| 6. Candidatures     | 2 jours | ⬜     |       |
| 7. Messages         | 1 jour  | ⬜     |       |
| 8. Notifications    | 1 jour  | ⬜     |       |
| 9. Upload           | 1 jour  | ⬜     |       |
| 10. Tests           | 2 jours | ⬜     |       |
| 11. Deployment      | 1 jour  | ⬜     |       |

**Total : 15 jours**

---

## 🎯 Priorités par Importance

### 🔥 Critique (à faire en premier)

1. Configuration initiale
2. Authentification
3. CRUD Offres
4. CRUD Candidatures

### ⚠️ Important (ensuite)

5. Messages
6. Notifications
7. Upload fichiers

### 💡 Nice to have (après)

8. Tests avancés
9. Optimisations
10. Documentation API

---

## 📝 Commandes utiles

```bash
# Générer Prisma Client
npx prisma generate

# Créer une migration
npx prisma migrate dev --name ma-migration

# Reset la base de données (développement)
npx prisma migrate reset

# Voir les logs de Prisma
npx prisma studio

# Lancer le serveur
npm run dev

# Build pour production
npm run build
```

---

**Bonne chance pour l'implémentation ! 🚀**
