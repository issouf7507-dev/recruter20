# Instructions de déploiement sur le serveur VPS

## Configuration des secrets GitHub Actions

Pour que le workflow GitHub Actions puisse déployer sur votre serveur VPS, vous devez configurer les secrets suivants dans votre dépôt GitHub :

### 1. Accéder aux secrets GitHub

1. Allez sur votre dépôt GitHub : `https://github.com/issouf7507-dev/recruiter_app`
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret** pour chaque secret

### 2. Secrets à configurer

#### `VPS_HOST`

- **Valeur** : `31.97.193.80`
- **Description** : Adresse IP de votre serveur VPS

#### `VPS_USER`

- **Valeur** : Le nom d'utilisateur SSH (généralement `root` ou votre nom d'utilisateur)
- **Description** : Nom d'utilisateur pour se connecter au serveur via SSH

#### `VPS_SSH_PRIVATE_KEY`

- **Valeur** : Votre clé privée SSH complète
- **Description** : Clé privée SSH pour l'authentification

### 3. Générer une paire de clés SSH (si nécessaire)

Si vous n'avez pas encore de clé SSH, générez-en une :

```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Afficher la clé publique (à copier sur le serveur)
cat ~/.ssh/github_actions_deploy.pub

# Afficher la clé privée (à copier dans GitHub Secrets)
cat ~/.ssh/github_actions_deploy
```

### 4. Configurer la clé publique sur le serveur VPS

Connectez-vous à votre serveur et ajoutez la clé publique :

```bash
# Se connecter au serveur
ssh votre_utilisateur@31.97.193.80

# Ajouter la clé publique au fichier authorized_keys
echo "VOTRE_CLE_PUBLIQUE_ICI" >> ~/.ssh/authorized_keys

# Vérifier les permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 5. Vérifier la connexion SSH

Testez la connexion depuis votre machine locale :

```bash
ssh -i ~/.ssh/github_actions_deploy votre_utilisateur@31.97.193.80
```

## Configuration initiale du serveur

Si vous ne l'avez pas encore fait, exécutez le script de configuration sur votre serveur :

```bash
# Se connecter au serveur
ssh votre_utilisateur@31.97.193.80

# Télécharger le script setup-server.sh
# Ou le copier depuis votre machine locale
scp setup-server.sh votre_utilisateur@31.97.193.80:/tmp/

# Exécuter le script
chmod +x /tmp/setup-server.sh
/tmp/setup-server.sh
```

## Variables d'environnement

Assurez-vous que votre fichier `.env.production` est configuré sur le serveur dans `/var/www/webapp/recruter/current/.env.production` avec toutes les variables nécessaires :

- Variables de base de données
- Clés API
- URLs de l'application
- etc.

## Test du déploiement

Une fois les secrets configurés :

1. Faites un push sur la branche `dev-issouf`
2. Allez dans l'onglet **Actions** de votre dépôt GitHub
3. Surveillez l'exécution du workflow "Deploy to VPS"
4. Vérifiez les logs en cas d'erreur

## Dépannage

### Erreur de connexion SSH

- Vérifiez que la clé privée est correctement copiée dans GitHub Secrets (avec les sauts de ligne)
- Vérifiez que la clé publique est dans `~/.ssh/authorized_keys` sur le serveur
- Vérifiez que le firewall autorise les connexions SSH (port 22)

### Erreur de permissions

- Vérifiez que l'utilisateur SSH a les permissions nécessaires dans `/var/www/webapp/recruter`
- Exécutez : `sudo chown -R $USER:$USER /var/www/webapp/recruter`

### Erreur PM2

- Vérifiez que PM2 est installé : `npm list -g pm2`
- Vérifiez que l'application est bien démarrée : `pm2 list`

## Structure des répertoires sur le serveur

```
/var/www/webapp/recruter/
├── current/          # Version actuelle en production
├── backups/          # Sauvegardes des versions précédentes
├── temp/             # Répertoire temporaire pour les déploiements
└── logs/             # Logs de déploiement
```

## Notes importantes

- Le workflow crée automatiquement des sauvegardes avant chaque déploiement
- Les 5 dernières sauvegardes sont conservées
- L'application est redémarrée automatiquement avec PM2 après chaque déploiement
- Le workflow s'exécute uniquement sur les pushes vers la branche `dev-issouf`
