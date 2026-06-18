#!/bin/bash

set -e

echo ">>> Génération du client Prisma..."
npx prisma generate

echo ">>> Push du schéma vers la base de données..."
npx prisma db push

echo ">>> Lancement de l'application..."
npm run dev:all
