#!/bin/bash

# Script de configuration du serveur VPS
# À exécuter une seule fois sur le serveur VPS

echo "🚀 Configuration du serveur VPS pour le déploiement automatique..."

# Mettre à jour le système
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installer Node.js et npm
echo "📦 Installation de Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 globalement
echo "📦 Installation de PM2..."
sudo npm install -g pm2

# Installer Git
echo "📦 Installation de Git..."
sudo apt install git -y

# Créer les répertoires nécessaires dans le home de l'utilisateur
echo "📁 Création des répertoires..."
mkdir -p ~/projects/recruteur20/backups
mkdir -p ~/.pm2/logs

# Installer pnpm globalement
echo "📦 Installation de pnpm..."
npm install -g pnpm

# Configurer PM2 pour démarrer au boot
echo "⚙️ Configuration de PM2..."
pm2 startup
pm2 save

# Installer Nginx (optionnel, pour le reverse proxy)
echo "📦 Installation de Nginx..."
sudo apt install nginx -y

# Configurer Nginx
echo "⚙️ Configuration de Nginx..."
sudo tee /etc/nginx/sites-available/recruteur20 << 'EOF'
server {
    listen 80;
    server_name ylsix.com www.ylsix.com;

    client_max_body_size 50M;

    access_log /var/log/nginx/recruteur20-access.log;
    error_log /var/log/nginx/recruteur20-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Activer le site
sudo ln -sf /etc/nginx/sites-available/recruteur20 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurer le firewall
echo "🔥 Configuration du firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Installer Certbot pour SSL (optionnel, mais recommandé)
echo "📦 Installation de Certbot pour SSL..."
sudo apt install certbot python3-certbot-nginx -y

echo "✅ Configuration du serveur terminée!"
echo "📝 Prochaines étapes:"
echo "1. Configurez votre DNS pour pointer ylsix.com vers 321.97.193.80"
echo "2. Configurez les secrets GitHub Actions (VPS_SSH_KEY et VPS_SSH_PASSPHRASE)"
echo "3. Créez le fichier .env.production dans ~/projects/recruteur20/ avec vos variables d'environnement"
echo "4. Configurez MySQL et créez la base de données"
echo "5. Configurez SSL avec: sudo certbot --nginx -d ylsix.com -d www.ylsix.com"
echo "6. Testez le déploiement en poussant sur la branche dev-issouf" 