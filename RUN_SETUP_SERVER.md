# Guide : Exécuter setup-server.sh sur votre serveur VPS

## Méthode 1 : Transfert avec SCP (Recommandé)

### Étape 1 : Transférer le script sur le serveur

Depuis votre machine locale, exécutez :

```bash
scp setup-server.sh root@31.97.193.80:/tmp/setup-server.sh
```

Vous serez demandé le mot de passe root de votre serveur.

### Étape 2 : Se connecter au serveur

```bash
ssh root@31.97.193.80
```

### Étape 3 : Rendre le script exécutable et l'exécuter

```bash
chmod +x /tmp/setup-server.sh
/tmp/setup-server.sh
```

---

## Méthode 2 : Copier-coller direct (Alternative)

### Étape 1 : Se connecter au serveur

```bash
ssh root@31.97.193.80
```

### Étape 2 : Créer le fichier sur le serveur

```bash
nano /tmp/setup-server.sh
```

### Étape 3 : Copier le contenu du script

Copiez tout le contenu du fichier `setup-server.sh` et collez-le dans nano.

Appuyez sur :

- `Ctrl + O` pour sauvegarder
- `Entrée` pour confirmer
- `Ctrl + X` pour quitter

### Étape 4 : Exécuter le script

```bash
chmod +x /tmp/setup-server.sh
/tmp/setup-server.sh
```

---

## Méthode 3 : Téléchargement direct depuis GitHub (Si le repo est public)

```bash
ssh root@31.97.193.80
curl -o /tmp/setup-server.sh https://raw.githubusercontent.com/issouf7507-dev/recruiter_app/dev-issouf-secure/setup-server.sh
chmod +x /tmp/setup-server.sh
/tmp/setup-server.sh
```

---

## Vérification après exécution

Après l'exécution du script, vérifiez que tout est installé :

```bash
# Vérifier Node.js
node --version
npm --version

# Vérifier PM2
pm2 --version

# Vérifier Git
git --version

# Vérifier Nginx
nginx -v

# Vérifier les répertoires
ls -la /var/www/webapp/recruter/

# Vérifier le statut de Nginx
sudo systemctl status nginx
```

---

## Notes importantes

⚠️ **Le script fait les actions suivantes :**

- Met à jour le système
- Installe Node.js 20.x LTS
- Installe PM2
- Installe Git
- Crée les répertoires nécessaires
- Configure Nginx
- Configure le firewall (UFW)

⏱️ **Temps d'exécution :** Environ 5-10 minutes selon la vitesse de votre connexion.

🔒 **Sécurité :** Le script configure le firewall pour autoriser les ports 22 (SSH), 80 (HTTP) et 443 (HTTPS).
