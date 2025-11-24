# Guide : Générer une clé SSH pour GitHub Actions

Ce guide vous explique comment générer une paire de clés SSH pour permettre à GitHub Actions de se connecter à votre serveur VPS.

## Étape 1 : Générer la paire de clés SSH

Ouvrez un terminal sur votre machine locale et exécutez :

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_vps
```

**Explication des options :**
- `-t ed25519` : Type de clé (recommandé, plus sécurisé et plus rapide)
- `-C "github-actions-deploy"` : Commentaire pour identifier la clé
- `-f ~/.ssh/github_actions_vps` : Nom du fichier de clé

**Quand on vous demande une passphrase :**
- Vous pouvez appuyer sur Entrée pour ne pas mettre de passphrase (recommandé pour GitHub Actions)
- Ou entrer une passphrase si vous préférez plus de sécurité

## Étape 2 : Afficher la clé privée (pour GitHub Secrets)

```bash
cat ~/.ssh/github_actions_vps
```

**⚠️ IMPORTANT :** Copiez **TOUT** le contenu, y compris :
- `-----BEGIN OPENSSH PRIVATE KEY-----`
- Toutes les lignes au milieu
- `-----END OPENSSH PRIVATE KEY-----`

**Exemple de ce que vous devriez voir :**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACD...
(many lines)
...
-----END OPENSSH PRIVATE KEY-----
```

## Étape 3 : Afficher la clé publique (pour le serveur)

```bash
cat ~/.ssh/github_actions_vps.pub
```

**Exemple de ce que vous devriez voir :**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... github-actions-deploy
```

## Étape 4 : Ajouter la clé publique sur votre serveur VPS

### Option A : Utiliser ssh-copy-id (le plus simple)

```bash
ssh-copy-id -i ~/.ssh/github_actions_vps.pub root@31.97.193.80
```

### Option B : Ajouter manuellement

1. Connectez-vous à votre serveur :
```bash
ssh root@31.97.193.80
```

2. Créez le répertoire `.ssh` s'il n'existe pas :
```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

3. Ajoutez la clé publique au fichier `authorized_keys` :
```bash
# Affichez votre clé publique d'abord (sur votre machine locale)
cat ~/.ssh/github_actions_vps.pub

# Puis sur le serveur, ajoutez-la
echo "VOTRE_CLE_PUBLIQUE_ICI" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Étape 5 : Tester la connexion SSH

Testez que la clé fonctionne :

```bash
ssh -i ~/.ssh/github_actions_vps root@31.97.193.80
```

Si vous pouvez vous connecter sans mot de passe, c'est bon ! ✅

## Étape 6 : Ajouter la clé privée dans GitHub Secrets

1. Allez sur votre dépôt GitHub : `https://github.com/issouf7507-dev/recruiter_app`

2. Cliquez sur **Settings** (Paramètres)

3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**

4. Cliquez sur **New repository secret**

5. Créez le secret :
   - **Name** : `VPS_SSH_KEY`
   - **Secret** : Collez **TOUT** le contenu de la clé privée (celle que vous avez affichée avec `cat ~/.ssh/github_actions_vps`)

6. Cliquez sur **Add secret**

## Étape 7 : Vérifier les permissions sur le serveur

Assurez-vous que les permissions sont correctes sur le serveur :

```bash
ssh root@31.97.193.80

# Vérifier les permissions
ls -la ~/.ssh/

# Doit afficher :
# -rw------- 1 root root authorized_keys (600)
# drwx------ 2 root root .ssh (700)
```

## Dépannage

### Erreur : "Permission denied (publickey)"

**Solutions :**
1. Vérifiez que la clé publique est bien dans `~/.ssh/authorized_keys` sur le serveur
2. Vérifiez les permissions : `chmod 600 ~/.ssh/authorized_keys` et `chmod 700 ~/.ssh`
3. Vérifiez que le nom d'utilisateur est correct (dans votre workflow, c'est `root`)

### Erreur : "Host key verification failed"

Cela peut arriver si l'IP du serveur a changé. Pour résoudre :
```bash
ssh-keygen -R 31.97.193.80
```

### La clé privée ne fonctionne pas dans GitHub Actions

**Vérifications :**
1. Assurez-vous d'avoir copié **TOUT** le contenu, y compris les lignes `-----BEGIN...` et `-----END...`
2. Vérifiez qu'il n'y a pas d'espaces supplémentaires au début ou à la fin
3. Assurez-vous que le nom du secret dans GitHub correspond exactement à `VPS_SSH_KEY` (comme dans votre workflow)

## Sécurité

⚠️ **IMPORTANT :**
- Ne partagez **JAMAIS** votre clé privée publiquement
- Ne commitez **JAMAIS** la clé privée dans Git
- Utilisez uniquement la clé privée dans GitHub Secrets
- Si la clé est compromise, régénérez-en une nouvelle immédiatement

## Alternative : Utiliser une clé RSA (si ed25519 n'est pas supporté)

Si votre serveur ne supporte pas ed25519, utilisez RSA :

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_vps
```

Puis suivez les mêmes étapes ci-dessus.

