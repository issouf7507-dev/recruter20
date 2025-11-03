# 🏗️ Structure Backend Recommandée - Application de Recrutement

**Date :** 26 octobre 2024  
**Framework :** Next.js 15 + Prisma + TypeScript  
**Base de données :** MySQL

---

## 📁 Structure de Dossiers Recommandée

```
recruteur20/
├── app/                                # Next.js App Router
│   ├── (public)/                      # Routes publiques
│   ├── auth/                          # Authentification
│   │   ├── candidat/
│   │   └── recruteur/
│   ├── candidat/                      # Espace candidat
│   │   ├── dashboard/
│   │   ├── profil/
│   │   ├── candidatures/
│   │   └── recherche/
│   ├── recruteur/                     # Espace recruteur
│   │   ├── dashboard/
│   │   ├── profil/
│   │   ├── offres/
│   │   └── candidatures/
│   ├── api/                           # 📍 API Routes (NOUVEAU)
│   │   ├── auth/                      # Authentification
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── logout/
│   │   │   └── refresh/
│   │   ├── candidats/                 # API Candidats
│   │   │   ├── route.ts               # GET, POST
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts           # GET, PUT, DELETE
│   │   │   │   ├── cv/
│   │   │   │   ├── candidatures/
│   │   │   │   └── notifications/
│   │   ├── recruteurs/                # API Recruteurs
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   ├── [id]/offres/
│   │   │   ├── [id]/candidatures/
│   │   │   └── [id]/collaborateurs/
│   │   ├── offres/                    # API Offres
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   ├── [id]/candidatures/
│   │   │   └── [id]/kanban/
│   │   ├── candidatures/              # API Candidatures
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   ├── [id]/notes/
│   │   │   └── [id]/files/
│   │   ├── conversations/             # API Messages
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   ├── notifications/             # API Notifications
│   │   │   ├── route.ts
│   │   │   ├── mark-read/
│   │   │   └── [id]/
│   │   └── upload/                    # Upload de fichiers
│   │       └── route.ts
│   └── layout.tsx
│
├── lib/                               # 📍 Bibliothèques & Utilitaires (NOUVEAU)
│   ├── prisma.ts                      # Instance Prisma
│   ├── auth.ts                        # Helpers d'authentification
│   ├── validation.ts                  # Schémas Zod
│   ├── utils.ts                       # Fonctions utilitaires
│   ├── constants.ts                   # Constantes globales
│   └── email.ts                       # Service d'email
│
├── lib/api/                           # 📍 Services API (NOUVEAU)
│   ├── candidats/
│   │   ├── service.ts
│   │   ├── repository.ts
│   │   └── types.ts
│   ├── recruteurs/
│   ├── offres/
│   ├── candidatures/
│   ├── conversations/
│   └── notifications/
│
├── lib/middleware/                    # 📍 Middleware Next.js (NOUVEAU)
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── cors.middleware.ts
│
├── lib/hooks/                         # 📍 Custom Hooks (NOUVEAU)
│   ├── use-auth.ts
│   ├── use-offers.ts
│   ├── use-candidatures.ts
│   └── use-notifications.ts
│
├── lib/mappers/                       # 📍 Data Mappers (NOUVEAU)
│   ├── candidat.mapper.ts
│   ├── offre.mapper.ts
│   └── candidature.mapper.ts
│
├── prisma/                            # Base de données
│   ├── schema.prisma
│   └── migrations/
│
├── types/                             # 📍 Types TypeScript Globaux (NOUVEAU)
│   ├── api.ts
│   ├── auth.ts
│   ├── candidat.ts
│   ├── recruteur.ts
│   ├── offre.ts
│   └── candidature.ts
│
├── components/                        # Composants React
│   ├── ui/                           # Composants Shadcn
│   ├── forms/                        # Formulaires
│   └── shared/                       # Composants partagés
│
├── public/                            # Fichiers statiques
├── .env                               # Variables d'environnement
├── .env.local                         # Variables locales (git ignored)
├── package.json
└── tsconfig.json

```

---

## 🎯 Principes Fondamentaux

### 1. **Séparation des Responsabilités (SoC)**

**Règle d'or :** Chaque couche a une responsabilité unique

```
┌─────────────────────────────────────┐
│    API Route (app/api/)             │  ← Contrôleur HTTP
│    - Gestion requêtes/responses     │
│    - Validation des inputs          │
│    - Retourner JSON                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Service (lib/api/)               │  ← Logique métier
│    - Traitement des données         │
│    - Orchestration                  │
│    - Règles business                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Repository (lib/api/)*.repo.ts   │  ← Accès données
│    - Requêtes Prisma                │
│    - Optimisations                  │
│    - Cache                          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Database (Prisma)                │  ← Base de données
│    - Models                         │
│    - Migrations                     │
└─────────────────────────────────────┘
```

---

## 📝 Implémentation Détaillée

### **1. Instance Prisma Centralisée**

```typescript
// lib/prisma.ts
import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

---

### **2. API Routes Structure**

#### Exemple : API des Candidatures

```typescript
// app/api/candidatures/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CandidatureService } from "@/lib/api/candidatures/service";
import { candidatureSchema } from "@/lib/validation";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

/**
 * GET /api/candidatures
 * Récupérer les candidatures (avec pagination et filtres)
 */
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const user = await authMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les query params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const jobOfferId = searchParams.get("jobOfferId");
    const columnId = searchParams.get("columnId");

    // Appeler le service
    const service = new CandidatureService();
    const result = await service.getCandidatures({
      jobOfferId,
      columnId,
      page,
      limit,
      userId: user.id,
      userType: user.type,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching candidatures:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/candidatures
 * Créer une nouvelle candidature
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);

    const body = await request.json();
    const validatedData = candidatureSchema.parse(body);

    const service = new CandidatureService();
    const candidature = await service.createCandidature({
      ...validatedData,
      candidatId: user.id, // Récupéré depuis le token
    });

    return NextResponse.json(candidature, { status: 201 });
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

```typescript
// app/api/candidatures/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CandidatureService } from "@/lib/api/candidatures/service";

/**
 * GET /api/candidatures/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = new CandidatureService();
    const candidature = await service.getCandidatureById(params.id);

    if (!candidature) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(candidature);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/candidatures/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const service = new CandidatureService();
    const updated = await service.updateCandidature(params.id, body);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/candidatures/[id] (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = new CandidatureService();
    await service.deleteCandidature(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

### **3. Service Layer (Logique Métier)**

```typescript
// lib/api/candidatures/service.ts
import { CandidatureRepository } from "./repository";
import type { CreateCandidatureDTO, UpdateCandidatureDTO } from "./types";

export class CandidatureService {
  private repository: CandidatureRepository;

  constructor() {
    this.repository = new CandidatureRepository();
  }

  /**
   * Récupérer les candidatures avec pagination
   */
  async getCandidatures(filters: {
    jobOfferId?: string;
    columnId?: string;
    page: number;
    limit: number;
    userId: string;
    userType: string;
  }) {
    // Vérifier les permissions selon le type d'utilisateur
    if (filters.userType === "CANDIDAT") {
      // Un candidat ne voit que ses propres candidatures
      return this.repository.findByCandidatId(
        filters.userId,
        filters.page,
        filters.limit
      );
    } else if (filters.userType === "RECRUTEUR") {
      // Un recruteur voit les candidatures de ses offres
      return this.repository.findByFilters({
        jobOfferId: filters.jobOfferId,
        columnId: filters.columnId,
        page: filters.page,
        limit: filters.limit,
      });
    }

    throw new Error("Unauthorized");
  }

  /**
   * Créer une nouvelle candidature
   */
  async createCandidature(data: CreateCandidatureDTO) {
    // Validation business
    await this.validateCandidatureCreation(data);

    // Créer la candidature
    return this.repository.create(data);
  }

  /**
   * Mettre à jour une candidature
   */
  async updateCandidature(id: string, data: UpdateCandidatureDTO) {
    // Vérifier l'existence
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Candidature not found");
    }

    // Règles business
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    return this.repository.update(id, data);
  }

  /**
   * Supprimer une candidature (soft delete)
   */
  async deleteCandidature(id: string) {
    return this.repository.softDelete(id);
  }

  /**
   * Déplacer une candidature dans une colonne Kanban
   */
  async moveToColumn(candidatureId: string, columnId: string) {
    return this.repository.update(candidatureId, { columnId });
  }

  /**
   * Validation business
   */
  private async validateCandidatureCreation(data: CreateCandidatureDTO) {
    // Vérifier si le candidat n'a pas déjà postulé
    const existing = await this.repository.findByCandidatAndOffer(
      data.candidatId,
      data.jobOfferId
    );

    if (existing) {
      throw new Error("Vous avez déjà postulé à cette offre");
    }

    // Vérifier que l'offre est active
    // ... autres validations
  }
}
```

---

### **4. Repository Layer (Accès Données)**

```typescript
// lib/api/candidatures/repository.ts
import prisma from "@/lib/prisma";
import type { CreateCandidatureDTO, UpdateCandidatureDTO } from "./types";

export class CandidatureRepository {
  /**
   * Trouver par ID
   */
  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id, deletedAt: null },
      include: {
        candidat: {
          include: { user: true },
        },
        jobOffer: true,
        column: true,
        notes: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        files: true,
      },
    });
  }

  /**
   * Trouver par candidat
   */
  async findByCandidatId(candidatId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where: {
          candidatId,
          deletedAt: null,
        },
        include: {
          jobOffer: {
            include: {
              recruteur: true,
            },
          },
          column: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.application.count({
        where: {
          candidatId,
          deletedAt: null,
        },
      }),
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

  /**
   * Trouver avec filtres
   */
  async findByFilters(filters: {
    jobOfferId?: string;
    columnId?: string;
    page: number;
    limit: number;
  }) {
    const skip = (filters.page - 1) * filters.limit;

    const where = {
      deletedAt: null,
      ...(filters.jobOfferId && { jobOfferId: filters.jobOfferId }),
      ...(filters.columnId && { columnId: filters.columnId }),
    };

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          candidat: {
            include: { user: true },
          },
          jobOffer: true,
          column: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  /**
   * Créer
   */
  async create(data: CreateCandidatureDTO) {
    return prisma.application.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        candidat: {
          include: { user: true },
        },
        jobOffer: true,
        column: true,
      },
    });
  }

  /**
   * Mettre à jour
   */
  async update(id: string, data: UpdateCandidatureDTO) {
    return prisma.application.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        candidat: true,
        jobOffer: true,
        column: true,
      },
    });
  }

  /**
   * Soft delete
   */
  async softDelete(id: string) {
    return prisma.application.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Vérifier si candidature existe
   */
  async findByCandidatAndOffer(candidatId: string, jobOfferId: string) {
    return prisma.application.findFirst({
      where: {
        candidatId,
        jobOfferId,
        deletedAt: null,
      },
    });
  }
}
```

---

### **5. Validation avec Zod**

```typescript
// lib/validation.ts
import { z } from "zod";

// Schema candidature
export const candidatureSchema = z.object({
  jobOfferId: z.string().min(1, "L'offre est requise"),
  message: z.string().optional(),
  cv: z.string().optional(),
});

export const updateCandidatureSchema = z.object({
  columnId: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  message: z.string().optional(),
  favorite: z.boolean().optional(),
});

// Schema offre
export const offreSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(10, "La description est requise"),
  company: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  experience: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  benefits: z.string().optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  duedate: z.date().optional(),
  skills: z.string().optional(),
});

// Type inference
export type CandidatureInput = z.infer<typeof candidatureSchema>;
export type UpdateCandidatureInput = z.infer<typeof updateCandidatureSchema>;
export type OffreInput = z.infer<typeof offreSchema>;
```

---

### **6. Middleware d'Authentification**

```typescript
// lib/middleware/auth.middleware.ts
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function authMiddleware(request: NextRequest) {
  try {
    // Récupérer le token depuis les headers ou cookies
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    // Vérifier le token
    const payload = await verifyToken(token);

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        candidat: true,
        recruteur: true,
        collaborateur: true,
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

export async function requireRole(request: NextRequest, roles: string[]) {
  const user = await requireAuth(request);
  if (!roles.includes(user.type || "")) {
    throw new Error("Forbidden");
  }
  return user;
}
```

---

### **7. Types TypeScript**

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  details?: any;
}
```

```typescript
// types/candidature.ts
import {
  Application,
  Candidat,
  JobOffer,
  KanbanColumn,
} from "@/app/generated/prisma";

export type CandidatureWithRelations = Application & {
  candidat: Candidat & {
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  };
  jobOffer: JobOffer;
  column: KanbanColumn;
};

export interface CreateCandidatureDTO {
  candidatId: string;
  jobOfferId: string;
  columnId: string;
  message?: string;
  cv?: string;
}

export interface UpdateCandidatureDTO {
  columnId?: string;
  rating?: number;
  message?: string;
  favorite?: boolean;
}
```

---

## 🔐 Gestion de l'Authentification

```typescript
// lib/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Hasher un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Vérifier un mot de passe
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Générer un token JWT
 */
export function generateToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Vérifier un token JWT
 */
export async function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}
```

---

## 📦 Endpoints API Recommandés

### **Authentification**

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh
```

### **Candidats**

```
GET    /api/candidats
GET    /api/candidats/[id]
PUT    /api/candidats/[id]
GET    /api/candidats/[id]/candidatures
GET    /api/candidats/[id]/notifications
```

### **Recruteurs**

```
GET    /api/recruteurs
GET    /api/recruteurs/[id]
PUT    /api/recruteurs/[id]
GET    /api/recruteurs/[id]/offres
GET    /api/recruteurs/[id]/candidatures
GET    /api/recruteurs/[id]/collaborateurs
```

### **Offres**

```
GET    /api/offres
POST   /api/offres
GET    /api/offres/[id]
PUT    /api/offres/[id]
DELETE /api/offres/[id]
GET    /api/offres/[id]/candidatures
POST   /api/offres/[id]/publish
POST   /api/offres/[id]/close
```

### **Candidatures**

```
GET    /api/candidatures
POST   /api/candidatures
GET    /api/candidatures/[id]
PUT    /api/candidatures/[id]
DELETE /api/candidatures/[id]
POST   /api/candidatures/[id]/move
POST   /api/candidatures/[id]/rating
```

### **Messages**

```
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/[id]
GET    /api/conversations/[id]/messages
POST   /api/conversations/[id]/messages
```

### **Notifications**

```
GET    /api/notifications
GET    /api/notifications/unread
POST   /api/notifications/[id]/read
POST   /api/notifications/read-all
```

---

## ✅ Avantages de cette Structure

### **1. Scalabilité**

- ✅ Facile d'ajouter de nouvelles fonctionnalités
- ✅ Code organisé et maintenable
- ✅ Séparation claire des responsabilités

### **2. Maintenabilité**

- ✅ Chaque couche est testable indépendamment
- ✅ Code réutilisable
- ✅ Documentation implicite dans la structure

### **3. Performance**

- ✅ Repository pattern pour optimiser les requêtes
- ✅ Pagination native
- ✅ Cache possible au niveau service

### **4. Sécurité**

- ✅ Validation des données avec Zod
- ✅ Authentification centralisée
- ✅ Gestion d'erreurs cohérente

### **5. Type Safety**

- ✅ TypeScript partout
- ✅ Types générés depuis Prisma
- ✅ Pas de "any"

---

## 🚀 Prochaines Étapes

1. **Créer les dossiers manquants**
2. **Implémenter les services dans l'ordre :**
   - Auth
   - Candidats
   - Recruteurs
   - Offres
   - Candidatures
   - Messages
   - Notifications
3. **Ajouter les tests unitaires**
4. **Documenter avec Swagger/OpenAPI**

---

**Cette structure vous donnera une base solide et professionnelle pour votre backend !** 🎯
