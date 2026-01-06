# Guide de Déploiement - Serveur Linux

Ce guide explique comment déployer l'application Next.js sur votre serveur Linux avec l'utilisateur `dev-issouf`.

## 📋 Prérequis

- Serveur Linux avec IP: `321.97.193.80`
- Accès root pour la configuration initiale
- MySQL installé et configuré
- Node.js 20.x LTS (sera installé automatiquement par le script)
- Git installé

## 🚀 Configuration Initiale du Serveur

### 1. Créer l'utilisateur `dev-issouf` (en tant que root)

```bash
# Se connecter au serveur en root
ssh root@321.97.193.80

# Créer l'utilisateur
adduser dev-issouf

# Ajouter l'utilisateur au groupe sudo (optionnel)
usermod -aG sudo dev-issouf

# Créer le répertoire .ssh pour l'utilisateur
mkdir -p /home/dev-issouf/.ssh
chmod 700 /home/dev-issouf/.ssh

# Ajouter votre clé SSH publique (remplacez par votre clé)
echo "VOTRE_CLE_PUBLIQUE_SSH" >> /home/dev-issouf/.ssh/authorized_keys
chmod 600 /home/dev-issouf/.ssh/authorized_keys
chown -R dev-issouf:dev-issouf /home/dev-issouf/.ssh
```

### 2. Exécuter le script de configuration

```bash
# Se connecter avec l'utilisateur dev-issouf
ssh dev-issouf@321.97.193.80

# Créer le répertoire projects
mkdir -p ~/projects

# Cloner le dépôt (ou copier le script setup-server.sh)
git clone -b dev-issouf https://github.com/recruter20/recruteur20.git ~/projects/recruteur20

# Rendre le script exécutable
chmod +x ~/projects/recruteur20/setup-server.sh

# Exécuter le script (certaines commandes nécessiteront sudo)
~/projects/recruteur20/setup-server.sh
```

### 3. Configurer MySQL

```bash
# Se connecter à MySQL
sudo mysql -u root -p

# Créer la base de données
CREATE DATABASE recruteur20 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Créer un utilisateur pour l'application
CREATE USER 'recruteur20_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_SECURISE';

# Donner les permissions
GRANT ALL PRIVILEGES ON recruteur20.* TO 'recruteur20_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Configurer les variables d'environnement

```bash
# Créer le fichier .env.production
nano ~/projects/recruteur20/.env.production
```

Ajoutez les variables suivantes :

```env
# Base de données
DATABASE_URL="mysql://recruteur20_user:VOTRE_MOT_DE_PASSE@localhost:3306/recruteur20"

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ylsix.com
PORT=3000

# Better Auth
BETTER_AUTH_SECRET="GENERER_UNE_CLE_SECRETE_ALEATOIRE"
BETTER_AUTH_URL="https://ylsix.com"

# Email (si vous utilisez l'envoi d'emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=votre_email@example.com
SMTP_PASSWORD=votre_mot_de_passe

# Autres variables nécessaires pour votre application
```

Pour générer `BETTER_AUTH_SECRET` :

```bash
openssl rand -base64 32
```

### 5. Configurer SSL/HTTPS avec Let's Encrypt

Pour sécuriser votre site avec HTTPS :

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir un certificat SSL pour ylsix.com et www.ylsix.com
sudo certbot --nginx -d ylsix.com -d www.ylsix.com

# Suivre les instructions interactives
# Certbot configurera automatiquement Nginx pour utiliser HTTPS
```

Certbot configurera automatiquement la redirection HTTP vers HTTPS et renouvellera automatiquement le certificat.

Pour tester le renouvellement automatique :

```bash
sudo certbot renew --dry-run
```

### 6. Initialiser le dépôt Git sur le serveur

```bash
cd ~/projects/recruteur20

# Vérifier que le dépôt est bien configuré
git remote -v

# Si nécessaire, configurer le remote
git remote set-url origin https://github.com/VOTRE_REPO/recruteur20.git
```

## 🔐 Configuration GitHub Actions

### 1. Générer une clé SSH pour GitHub Actions

Sur votre machine locale :

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

### 2. Ajouter la clé publique sur le serveur

```bash
# Afficher la clé publique
cat ~/.ssh/github_actions_deploy.pub

# Sur le serveur (en tant que dev-issouf)
ssh dev-issouf@321.97.193.80
echo "VOTRE_CLE_PUBLIQUE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Configurer les secrets GitHub

1. Allez sur votre dépôt GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Ajoutez les secrets suivants :

- **VPS_SSH_KEY** : Contenu complet de `~/.ssh/github_actions_deploy` (clé privée)
- **VPS_SSH_PASSPHRASE** : Passphrase de la clé (si vous en avez mis une, sinon laissez vide)

## 🚀 Premier Déploiement

### Option 1: Via GitHub Actions (Recommandé)

1. Poussez votre code sur la branche `dev-issouf`
2. Le workflow GitHub Actions se déclenchera automatiquement
3. Surveillez l'exécution dans l'onglet **Actions** de GitHub

### Option 2: Déploiement manuel

```bash
# Se connecter au serveur
ssh dev-issouf@321.97.193.80

# Aller dans le répertoire du projet
cd ~/projects/recruteur20

# Récupérer les dernières modifications
git pull origin dev-issouf

# Installer les dépendances
pnpm install --frozen-lockfile

# Générer le client Prisma
pnpm prisma generate

# Exécuter les migrations (si nécessaire)
pnpm prisma migrate deploy

# Construire l'application
pnpm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
```

## 🔧 Commandes Utiles

### PM2

```bash
# Voir les processus
pm2 list

# Voir les logs
pm2 logs recruter

# Redémarrer l'application
pm2 restart recruter

# Arrêter l'application
pm2 stop recruter

# Supprimer l'application
pm2 delete recruter
```

### Nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

# Redémarrer Nginx
sudo systemctl restart nginx

# Voir les logs
sudo tail -f /var/log/nginx/recruteur20-error.log
sudo tail -f /var/log/nginx/recruteur20-access.log
```

### MySQL

```bash
# Se connecter
sudo mysql -u root -p

# Voir les bases de données
SHOW DATABASES;

# Utiliser la base de données
USE recruteur20;

# Voir les tables
SHOW TABLES;
```

## 🐛 Dépannage

### Erreur de connexion SSH dans GitHub Actions

- Vérifiez que la clé privée est correctement copiée dans GitHub Secrets (avec tous les sauts de ligne)
- Vérifiez que la clé publique est dans `~/.ssh/authorized_keys` sur le serveur
- Testez la connexion manuellement : `ssh -i ~/.ssh/github_actions_deploy dev-issouf@321.97.193.80`

### Erreur "pnpm: command not found"

- Installez pnpm globalement : `npm install -g pnpm`
- Vérifiez que pnpm est dans le PATH : `which pnpm`

### Erreur de permissions

- Vérifiez les permissions du répertoire : `ls -la ~/projects/recruteur20`
- Si nécessaire : `chown -R dev-issouf:dev-issouf ~/projects/recruteur20`

### L'application ne démarre pas

- Vérifiez les logs PM2 : `pm2 logs recruter`
- Vérifiez que le port 3000 n'est pas utilisé : `lsof -i :3000`
- Vérifiez les variables d'environnement : `cat ~/projects/recruteur20/.env.production`

### Nginx ne fonctionne pas

- Vérifiez la configuration : `sudo nginx -t`
- Vérifiez que Nginx écoute sur le port 80 : `sudo netstat -tlnp | grep :80`
- Vérifiez les logs d'erreur : `sudo tail -f /var/log/nginx/error.log`

## 📝 Structure des Répertoires

```
/home/dev-issouf/
├── projects/             # Répertoire pour tous les projets
│   └── recruteur20/     # Répertoire principal du projet
│       ├── .next/       # Build de production
│       ├── node_modules/# Dépendances
│       ├── .env.production # Variables d'environnement
│       ├── backups/     # Sauvegardes des builds précédents
│       └── ...
└── .pm2/                # Configuration et logs PM2
    └── logs/
        ├── recruter-error.log
        ├── recruter-out.log
        └── recruter-combined.log
```

## 🔄 Mises à jour Futures

Les mises à jour se feront automatiquement via GitHub Actions lorsque vous pousserez sur la branche `dev-issouf`. Le workflow :

1. Build l'application
2. Se connecte au serveur
3. Récupère les dernières modifications
4. Installe les dépendances
5. Build l'application
6. Redémarre PM2

## 📞 Support

En cas de problème, vérifiez :

1. Les logs PM2 : `pm2 logs recruter`
2. Les logs Nginx : `sudo tail -f /var/log/nginx/recruteur20-error.log`
3. Les logs GitHub Actions dans l'onglet Actions de votre dépôt
