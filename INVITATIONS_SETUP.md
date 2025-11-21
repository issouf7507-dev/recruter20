# Système d'Invitations - Guide de Configuration

## 📋 Vue d'ensemble

Le système d'invitations permet aux **RECRUTEUR** d'inviter des **COLLABORATEUR** qui pourront se connecter dans l'espace du recruteur après avoir accepté l'invitation.

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install nodemailer @types/nodemailer
```

### 2. Configuration Mailtrap

Ajoutez les variables d'environnement suivantes dans votre fichier `.env` :

```env
# Mailtrap Configuration (pour le développement)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=votre_username_mailtrap
MAILTRAP_PASS=votre_password_mailtrap
MAILTRAP_FROM="Votre Nom <noreply@recruteur20.com>"

# URL de l'application (pour les liens dans les emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Obtenir les credentials Mailtrap

1. Créez un compte sur [Mailtrap.io](https://mailtrap.io)
2. Allez dans votre projet → **Email Testing** → **Inboxes**
3. Sélectionnez votre inbox (ou créez-en une)
4. Cliquez sur **SMTP Settings**
5. Copiez les credentials :
   - **Host**: `sandbox.smtp.mailtrap.io`
   - **Port**: `2525`
   - **Username**: (votre username)
   - **Password**: (votre password)

## 📁 Structure des fichiers

```
lib/
├── email.ts                          # Service d'envoi d'emails avec Mailtrap
└── api/
    └── invitation/
        ├── types.ts                  # Types TypeScript
        ├── repository.ts             # Opérations base de données
        └── service.ts                # Logique métier + envoi d'emails

app/
├── api/
│   └── invitations/
│       ├── route.ts                  # GET, POST /api/invitations
│       ├── [id]/
│       │   ├── route.ts              # GET, DELETE /api/invitations/[id]
│       │   └── resend/
│       │       └── route.ts          # POST /api/invitations/[id]/resend
│       └── accept/
│           └── [token]/
│               └── route.ts          # GET, POST /api/invitations/accept/[token]
└── invitations/
    └── accept/
        └── [token]/
            └── page.tsx              # Page d'acceptation d'invitation

app/recruteur/
└── invitations/
    └── page.tsx                      # Page de gestion des invitations
```

## 🔄 Flux d'invitation

### 1. Création d'une invitation

1. Le **RECRUTEUR** se connecte à son espace
2. Va sur la page `/recruteur/invitations`
3. Remplit le formulaire avec :
   - Email du collaborateur
   - Rôle (ADMIN, MANAGER, USER, VIEWER)
4. L'invitation est créée en base de données
5. Un email est envoyé automatiquement via Mailtrap

### 2. Acceptation d'une invitation

1. Le **COLLABORATEUR** reçoit un email avec un lien unique
2. Clique sur le lien : `/invitations/accept/[token]`
3. Remplit le formulaire avec :
   - Prénom
   - Nom
4. L'invitation est acceptée :
   - Un compte **Collaborateur** est créé
   - L'utilisateur peut se connecter avec son email

## 📧 Templates d'emails

### Email d'invitation

- **Sujet**: "Invitation à collaborer - [Nom de l'entreprise]"
- **Contenu**: 
  - Message personnalisé
  - Lien d'acceptation unique
  - Date d'expiration (7 jours)
  - Rôle assigné

### Email de confirmation

- **Sujet**: "Invitation acceptée - [Nom de l'entreprise]"
- **Contenu**:
  - Confirmation d'acceptation
  - Lien vers la page de connexion

## 🔐 Sécurité

- Les invitations expirent après **7 jours**
- Chaque invitation a un **token unique** (UUID)
- Vérification que l'email correspond au compte utilisateur
- Seuls les **RECRUTEUR** peuvent créer des invitations
- Les invitations sont liées à un recruteur spécifique

## 🧪 Test avec Mailtrap

1. Créez une invitation depuis l'interface
2. Allez sur Mailtrap → **Inbox**
3. Vous verrez l'email reçu
4. Cliquez sur le lien dans l'email (ou copiez-le)
5. Testez l'acceptation de l'invitation

## 🚨 Production

Pour la production, remplacez Mailtrap par un service SMTP réel :

```env
MAILTRAP_HOST=smtp.gmail.com  # ou votre serveur SMTP
MAILTRAP_PORT=587
MAILTRAP_USER=votre_email@gmail.com
MAILTRAP_PASS=votre_app_password
```

## 📝 Notes importantes

- Les emails ne bloquent pas la création d'invitation (si l'email échoue, l'invitation est quand même créée)
- Vous pouvez renvoyer un email d'invitation depuis l'interface
- Les invitations expirées peuvent être renvoyées
- Un utilisateur ne peut pas être invité deux fois pour le même recruteur

## 🐛 Dépannage

### Les emails ne sont pas envoyés

1. Vérifiez les credentials Mailtrap dans `.env`
2. Vérifiez que `NEXT_PUBLIC_APP_URL` est correct
3. Regardez les logs du serveur pour les erreurs
4. Vérifiez votre inbox Mailtrap

### L'invitation n'est pas trouvée

1. Vérifiez que le token est correct
2. Vérifiez que l'invitation n'a pas expiré
3. Vérifiez que l'invitation n'a pas déjà été acceptée

### Erreur "Cet utilisateur est déjà collaborateur"

- L'utilisateur a déjà accepté une invitation pour ce recruteur
- Supprimez l'ancienne invitation ou utilisez un autre email

