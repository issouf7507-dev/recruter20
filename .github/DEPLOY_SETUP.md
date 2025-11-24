# Configuration du déploiement SSH

## Problème d'authentification SSH

Si vous rencontrez l'erreur `ssh: this private key is passphrase protected` ou `ssh: unable to authenticate`, suivez ces étapes :

## Solution 1 : Créer une nouvelle clé SSH sans passphrase (Recommandé)

### Sur le serveur VPS :

1. Connectez-vous au serveur VPS :
```bash
ssh root@31.97.193.80
```

2. Générez une nouvelle paire de clés SSH spécifiquement pour GitHub Actions :
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""
```

3. Ajoutez la clé publique au fichier `authorized_keys` :
```bash
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

4. Affichez la clé privée pour la copier :
```bash
cat ~/.ssh/github_actions_deploy
```

5. Copiez **toute la clé privée** (y compris les lignes `-----BEGIN OPENSSH PRIVATE KEY-----` et `-----END OPENSSH PRIVATE KEY-----`)

### Sur GitHub :

1. Allez dans votre dépôt GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Créez ou mettez à jour le secret `VPS_SSH_KEY` avec la clé privée complète
3. Si vous avez créé la clé sans passphrase, vous pouvez laisser `VPS_SSH_PASSPHRASE` vide ou le supprimer

## Solution 2 : Utiliser une clé existante avec passphrase

Si vous devez utiliser une clé existante protégée par une passphrase :

1. Dans GitHub Secrets, ajoutez :
   - `VPS_SSH_KEY` : la clé privée complète
   - `VPS_SSH_PASSPHRASE` : la passphrase de la clé

## Vérification du format de la clé

La clé SSH doit être au format correct. Elle doit commencer par :
```
-----BEGIN OPENSSH PRIVATE KEY-----
```
ou
```
-----BEGIN RSA PRIVATE KEY-----
```

Et se terminer par :
```
-----END OPENSSH PRIVATE KEY-----
```
ou
```
-----END RSA PRIVATE KEY-----
```

## Test de connexion

Pour tester si la clé fonctionne, vous pouvez essayer de vous connecter manuellement :

```bash
ssh -i /path/to/private/key root@31.97.193.80
```

## Notes importantes

- ⚠️ Ne partagez jamais vos clés privées publiquement
- 🔒 La clé sans passphrase est plus pratique pour l'automatisation mais moins sécurisée
- 🔐 Pour plus de sécurité, utilisez une clé dédiée uniquement pour le déploiement et limitez ses permissions

