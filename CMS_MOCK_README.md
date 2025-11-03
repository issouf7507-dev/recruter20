# CMS Mock Backend - Marabu Website

## 📋 Vue d'ensemble

Ce mock backend fournit une API complète pour gérer le contenu du site Marabu, incluant :

- **Gestion des pages** (À propos, Solutions)
- **Système de blog** (Articles + Catégories)
- **Authentification** pour l'administration
- **Upload d'images**

## 🚀 Installation et démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Ou démarrer en production
npm start
```

Le serveur sera accessible sur `http://localhost:3001`

## 🔐 Authentification

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Réponse :**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@marabu.services",
    "role": "admin"
  }
}
```

## 📄 Gestion des Pages

### Récupérer le contenu d'une page

```bash
GET /api/pages/{pageName}/{locale}

# Exemples :
GET /api/pages/apropos/fr
GET /api/pages/apropos/en
GET /api/pages/solutions/fr
GET /api/pages/solutions/en
```

**Réponse pour /api/pages/apropos/fr :**

```json
{
  "about": {
    "headingup": "À PROPOS",
    "heading": "Qui sommes-nous ?",
    "subheading": "Depuis des siècles, les marabouts africains ont guidé...",
    "subheading2": "Fondée en 2023, Marabu émerge comme un acteur stratégique...",
    "heading2": "Nos Valeurs Fondamentales",
    "lititle": "Innovation Inspirée :",
    "lidescription": "Unir les traditions aux technologies modernes.",
    "lititle2": "Impact Positif :",
    "lidescription2": "Contribuer au développement durable et inclusif.",
    "lititle3": "Engagement Client :",
    "lidescription3": "Offrir des solutions personnalisées à vos besoins",
    "textdownn": "Nous sommes les traducteurs contemporains de la sagesse africaine...",
    "cta": "Nous contacter"
  },
  "mission": {
    "headingup": "NOTRE MISSION",
    "heading": "Notre Mission",
    "subheading": "Notre mission est de démocratiser l'accès aux services...",
    "subheading2": "Nous nous engageons à accompagner nos clients..."
  },
  "team": {
    "headingup": "NOTRE ÉQUIPE",
    "heading": "Rencontrez notre équipe",
    "subheading": "Une équipe diversifiée d'experts passionnés...",
    "teams": [
      {
        "id": "1",
        "name": "Jean Koffi",
        "params": "CEO & Fondateur",
        "role": "Expert en stratégie d'entreprise",
        "image": "/images/team/jean-koffi.jpg",
        "social": {
          "facebook": "",
          "linkedin": "https://linkedin.com/in/jean-koffi"
        },
        "linkLinkedin": "https://linkedin.com/in/jean-koffi"
      }
    ]
  }
}
```

### Mettre à jour le contenu d'une page

```bash
PUT /api/pages/{pageName}/{locale}
Authorization: Bearer {token}
Content-Type: application/json

{
  "about": {
    "headingup": "À PROPOS",
    "heading": "Qui sommes-nous ?",
    "subheading": "Nouveau contenu...",
    // ... autres champs
  }
}
```

## 📝 Gestion du Blog

### Récupérer tous les articles

```bash
GET /api/articles?category=1&status=published&page=1&limit=10
```

**Réponse :**

```json
{
  "articles": [
    {
      "id": 1,
      "title": "Les clés du succès en stratégie d'entreprise",
      "slug": "cles-succes-strategie-entreprise",
      "excerpt": "Découvrez les fondamentaux d'une stratégie d'entreprise réussie.",
      "content": "Le succès d'une entreprise repose sur une stratégie bien définie...",
      "featuredImage": "/uploads/article-image.jpg",
      "categoryId": 1,
      "status": "published",
      "publishedAt": "2024-01-20T10:00:00Z",
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z",
      "author": "Jean Koffi",
      "tags": ["stratégie", "entreprise", "conseil"],
      "views": 150
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Récupérer un article spécifique

```bash
GET /api/articles/1
```

### Créer un nouvel article

```bash
POST /api/articles
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Nouvel article",
  "slug": "nouvel-article",
  "excerpt": "Résumé de l'article",
  "content": "Contenu complet de l'article...",
  "categoryId": 1,
  "status": "published",
  "tags": "stratégie, conseil, entreprise",
  "featuredImage": [file]
}
```

### Mettre à jour un article

```bash
PUT /api/articles/1
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Titre modifié",
  "slug": "titre-modifie",
  "excerpt": "Nouveau résumé",
  "content": "Nouveau contenu...",
  "categoryId": 2,
  "status": "published",
  "tags": "nouveau, tag",
  "featuredImage": [file]
}
```

### Supprimer un article

```bash
DELETE /api/articles/1
Authorization: Bearer {token}
```

## 🏷️ Gestion des Catégories

### Récupérer toutes les catégories

```bash
GET /api/categories
```

**Réponse :**

```json
[
  {
    "id": 1,
    "name": "Conseils",
    "slug": "conseils",
    "description": "Articles de conseil et stratégie",
    "color": "#689D71",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Intermédiations",
    "slug": "intermediations",
    "description": "Articles sur l'intermédiation et les partenariats",
    "color": "#1D4851",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": 3,
    "name": "Services",
    "slug": "services",
    "description": "Articles sur nos services spécialisés",
    "color": "#D9D9D9",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

### Créer une nouvelle catégorie

```bash
POST /api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nouvelle Catégorie",
  "slug": "nouvelle-categorie",
  "description": "Description de la catégorie",
  "color": "#FF5733"
}
```

### Mettre à jour une catégorie

```bash
PUT /api/categories/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Conseils Modifiés",
  "slug": "conseils-modifies",
  "description": "Nouvelle description",
  "color": "#689D71"
}
```

### Supprimer une catégorie

```bash
DELETE /api/categories/1
Authorization: Bearer {token}
```

## 📊 Statistiques

### Récupérer les statistiques du CMS

```bash
GET /api/stats
Authorization: Bearer {token}
```

**Réponse :**

```json
{
  "totalArticles": 25,
  "publishedArticles": 20,
  "draftArticles": 5,
  "totalCategories": 3,
  "totalViews": 1250,
  "recentArticles": [
    {
      "id": 1,
      "title": "Article récent",
      "createdAt": "2024-01-20T10:00:00Z",
      "views": 150
    }
  ]
}
```

## 🔧 Configuration

### Variables d'environnement

```bash
PORT=3001
JWT_SECRET=marabu-cms-secret-key
```

### Structure des dossiers

```
cms-backend/
├── server.js          # Serveur principal
├── package.json       # Dépendances
├── uploads/          # Images uploadées
└── README.md         # Documentation
```

## 📝 Exemples d'utilisation avec JavaScript

### Authentification

```javascript
const login = async () => {
  const response = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "admin",
      password: "password",
    }),
  });

  const data = await response.json();
  localStorage.setItem("token", data.token);
  return data;
};
```

### Récupérer les articles

```javascript
const getArticles = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3001/api/articles", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};
```

### Créer un article

```javascript
const createArticle = async (articleData) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  formData.append("title", articleData.title);
  formData.append("slug", articleData.slug);
  formData.append("excerpt", articleData.excerpt);
  formData.append("content", articleData.content);
  formData.append("categoryId", articleData.categoryId);
  formData.append("status", articleData.status);
  formData.append("tags", articleData.tags.join(","));

  if (articleData.featuredImage) {
    formData.append("featuredImage", articleData.featuredImage);
  }

  const response = await fetch("http://localhost:3001/api/articles", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();
};
```

## 🎯 Intégration avec Next.js

### Hook personnalisé pour l'API

```javascript
// hooks/useCMS.js
import { useState, useEffect } from "react";

export const useCMS = () => {
  const [token, setToken] = useState(null);

  const login = async (username, password) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    setToken(data.token);
    return data;
  };

  const getPages = async (pageName, locale) => {
    const response = await fetch(`/api/pages/${pageName}/${locale}`);
    return await response.json();
  };

  const getArticles = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`/api/articles?${queryString}`);
    return await response.json();
  };

  return { login, getPages, getArticles, token };
};
```

## 🚨 Codes d'erreur

- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Token invalide ou expiré
- `404` - Ressource non trouvée
- `500` - Erreur serveur

## 📋 TODO pour l'implémentation

1. **Backend réel** : Remplacer le mock par une vraie base de données (PostgreSQL/MongoDB)
2. **Validation** : Ajouter la validation des données côté serveur
3. **Cache** : Implémenter un système de cache pour les performances
4. **Sécurité** : Ajouter la validation des fichiers uploadés
5. **Tests** : Créer des tests unitaires et d'intégration
6. **Documentation API** : Générer une documentation Swagger/OpenAPI

## 🤝 Support

Pour toute question ou problème, contactez l'équipe de développement.
