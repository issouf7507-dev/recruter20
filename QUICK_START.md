# 🚀 Déploiement Rapide - Résumé

## ✅ Configuration effectuée

- ✅ Workflow GitHub Actions configuré pour l'utilisateur `dev-issouf` et l'IP `321.97.193.80`
- ✅ Configuration PM2 mise à jour pour utiliser les chemins de `dev-issouf`
- ✅ Configuration Nginx créée (`nginx.conf`)
- ✅ Script de setup serveur mis à jour (`setup-server.sh`)
- ✅ Guide de déploiement complet créé (`DEPLOYMENT_GUIDE.md`)

## 📋 Étapes à suivre

### 1. Sur le serveur (en tant que root)

```bash
# Créer l'utilisateur dev-issouf
adduser dev-issouf
usermod -aG sudo dev-issouf

# Configurer SSH pour dev-issouf
mkdir -p /home/dev-issouf/.ssh
chmod 700 /home/dev-issouf/.ssh
# Ajouter votre clé SSH publique
echo "VOTRE_CLE_PUBLIQUE" >> /home/dev-issouf/.ssh/authorized_keys
chmod 600 /home/dev-issouf/.ssh/authorized_keys
chown -R dev-issouf:dev-issouf /home/dev-issouf/.ssh
```

### 2. Sur le serveur (en tant que dev-issouf)

```bash
# Se connecter
ssh dev-issouf@321.97.193.80

# Créer le répertoire projects
mkdir -p ~/projects

# Cloner le dépôt
git clone -b dev-issouf https://github.com/VOTRE_REPO/recruteur20.git ~/projects/recruteur20

# Exécuter le script de setup
chmod +x ~/projects/recruteur20/setup-server.sh
~/projects/recruteur20/setup-server.sh
```

### 3. Configurer MySQL

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE recruteur20 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'recruteur20_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE';
GRANT ALL PRIVILEGES ON recruteur20.* TO 'recruteur20_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Créer le fichier .env.production

```bash
nano ~/projects/recruteur20/.env.production
```

```env
DATABASE_URL="mysql://recruteur20_user:VOTRE_MOT_DE_PASSE@localhost:3306/recruteur20"
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ylsix.com
PORT=3000
BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
BETTER_AUTH_URL="https://ylsix.com"
```

### 5. Configurer GitHub Actions

1. Générer une clé SSH :
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

2. Ajouter la clé publique sur le serveur :
```bash
cat ~/.ssh/github_actions_deploy.pub
# Copier le contenu et l'ajouter à ~/.ssh/authorized_keys sur le serveur
```

3. Ajouter les secrets dans GitHub :
   - **Settings** → **Secrets and variables** → **Actions**
   - `VPS_SSH_KEY` : Contenu de `~/.ssh/github_actions_deploy` (clé privée)
   - `VPS_SSH_PASSPHRASE` : Passphrase (si vous en avez mis une)

### 6. Premier déploiement

```bash
# Sur le serveur
cd ~/projects/recruteur20
git pull origin dev-issouf
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm prisma migrate deploy
pnpm run build
pm2 start ecosystem.config.js
pm2 save
```

Ou simplement pousser sur la branche `dev-issouf` et le workflow GitHub Actions fera le reste !

## 🔧 Commandes utiles

```bash
# PM2
pm2 list
pm2 logs recruter
pm2 restart recruter

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Logs
pm2 logs recruter
sudo tail -f /var/log/nginx/recruteur20-error.log
```

### 7. Configurer SSL/HTTPS (Recommandé)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir un certificat SSL
sudo certbot --nginx -d ylsix.com -d www.ylsix.com
```

**Important** : Assurez-vous que votre DNS pointe vers `321.97.193.80` avant d'exécuter Certbot.

## 📚 Documentation complète

Voir `DEPLOYMENT_GUIDE.md` pour plus de détails.

