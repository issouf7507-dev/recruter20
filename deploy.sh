#!/bin/bash

## Script d déploiement pour le serveur VPS
## À exécuter sur le serveur VPS

echo "Début du déploiement..."

## Variables
PROJECT_DIR="/var/www/webapp/recruter"
BACKUP_DIR="$PROJECT_DIR/backups"
CURRENT_DIR="$PROJECT_DIR/current"
TEMP_DIR="$PROJECT_DIR/temp"

#### Créer les répertoires nécessaires
mkdir -p $PROJECT_DIR $BACKUP_DIR $CURRENT_DIR $TEMP_DIR

#### Sauvegarder l'ancienne version
if [ -d "$CURRENT_DIR" ] && [ "$(ls -A $CURRENT_DIR)" ]; then
    echo "Sauvegarde de l'ancienne version..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    cp -r $CURRENT_DIR $BACKUP_DIR/$BACKUP_NAME
    echo "Sauvegarde créée: $BACKUP_NAME"
fi

## Nettoyer le répertoire temporaire
echo "Nettoyage du répertoire temporaire..."
rm -rf $TEMP_DIR/*

### Cloner le code depuis GitHub
echo "Téléchargement du code depuis GitHub..."
cd $TEMP_DIR
# git clone -b dev-issouf https://github.com/issouf7507-dev/recruiter_app.git .
git clone -b dev-issouf https://github.com/issouf7507-dev/recruter20.git .

#### Installer les dépendances
echo "Installation des dépendances..."
npm ci --production --legacy-peer-deps

#### Construire l'application
echo "Construction de l'application..."
npm run build

#### Copier les fichiers vers le répertoire de production
echo "Copie des fichiers vers la production..."
rm -rf $CURRENT_DIR/*
cp -r . $CURRENT_DIR/

## Naviguer vers le répertoire de production
cd $CURRENT_DIR

#### Redémarrer l'application avec PM2
echo "Redémarrage de l'application..."
if pm2 list | grep -q "recruter"; then
    pm2 restart recruter
else
    pm2 start npm --name "recruter" -- start
fi

#### Sauvegarder la configuration PM2
pm2 save

#### Nettoyer les anciennes sauvegardes (garder les 5 plus récentes)
echo "Nettoyage des anciennes sauvegardes..."
cd $BACKUP_DIR
ls -t backup-* | tail -n +6 | xargs -r rm -rf

#### Nettoyer le répertoire temporaire
rm -rf $TEMP_DIR/*

echo "Déploiement terminé avec succès!c est bon"
echo "Votre site est maintenant à jour!" 