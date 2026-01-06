# Configuration des Secrets GitHub Actions

Ce document explique comment configurer les secrets nécessaires pour le déploiement automatique via GitHub Actions.

## 📋 Secrets Requis

### 1. Secrets pour la connexion SSH au serveur

#### `VPS_SSH_KEY`
- **Description** : Clé privée SSH pour se connecter au serveur
- **Comment l'obtenir** :
  ```bash
  # Sur votre machine locale, générer une clé SSH
  ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
  
  # Afficher la clé privée (à copier dans GitHub Secrets)
  cat ~/.ssh/github_actions_deploy
  ```
- **Important** : Copiez TOUT le contenu, y compris les lignes `-----BEGIN OPENSSH PRIVATE KEY-----` et `-----END OPENSSH PRIVATE KEY-----`

#### `VPS_SSH_PASSPHRASE`
- **Description** : Passphrase de la clé SSH (si vous en avez mis une)
- **Valeur** : Votre passphrase, ou laissez vide si vous n'en avez pas mis

### 2. Secrets pour le build de l'application

#### `BETTER_AUTH_SECRET`
- **Description** : Clé secrète pour Better Auth (authentification)
- **Comment la générer** :
  ```bash
  # Sur votre machine locale ou sur le serveur
  openssl rand -base64 32
  ```
- **Important** : Utilisez la MÊME valeur que celle dans votre `.env.production` sur le serveur

#### `NEXT_PUBLIC_APP_URL` (Optionnel)
- **Description** : URL publique de votre application
- **Valeur** : `https://ylsix.com`
- **Note** : Si non défini, la valeur par défaut `https://ylsix.com` sera utilisée

## 🔧 Configuration dans GitHub

1. Allez sur votre dépôt GitHub : `https://github.com/recruter20/recruteur20`
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret** pour chaque secret
5. Entrez le nom du secret et sa valeur
6. Cliquez sur **Add secret**

## ✅ Vérification

Après avoir configuré les secrets, le workflow GitHub Actions devrait pouvoir :
- ✅ Se connecter au serveur via SSH
- ✅ Builder l'application sans erreur `BETTER_AUTH_SECRET`
- ✅ Déployer automatiquement sur le serveur

## 🔐 Sécurité

- ⚠️ **Ne partagez JAMAIS vos secrets publiquement**
- ⚠️ **Ne commitez JAMAIS vos clés privées dans Git**
- ⚠️ **Utilisez des secrets différents pour chaque environnement** (dev, staging, production)

## 📝 Liste Complète des Secrets

| Secret | Requis | Description |
|--------|--------|-------------|
| `VPS_SSH_KEY` | ✅ Oui | Clé privée SSH |
| `VPS_SSH_PASSPHRASE` | ⚠️ Si applicable | Passphrase de la clé SSH |
| `BETTER_AUTH_SECRET` | ✅ Oui | Secret pour Better Auth |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Optionnel | URL de l'application (défaut: https://ylsix.com) |

## 🐛 Dépannage

### Erreur "BETTER_AUTH_SECRET not found"
- Vérifiez que le secret `BETTER_AUTH_SECRET` est bien configuré dans GitHub
- Vérifiez que le nom du secret est exactement `BETTER_AUTH_SECRET` (sensible à la casse)

### Erreur de connexion SSH
- Vérifiez que `VPS_SSH_KEY` contient bien toute la clé privée (avec les en-têtes)
- Vérifiez que la clé publique correspondante est dans `~/.ssh/authorized_keys` sur le serveur
- Testez la connexion manuellement : `ssh -i ~/.ssh/github_actions_deploy dev-issouf@321.97.193.80`

