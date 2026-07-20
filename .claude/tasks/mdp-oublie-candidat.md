# Mot de passe oublié — Candidat (correction du 404)

## Contexte / Diagnostic

Côté **recruteur**, le flux « mot de passe oublié » est complet et fonctionnel :

- `app/auth/recruteur/forgot-password/page.tsx` → saisie email
- `app/auth/recruteur/reset-password/page.tsx` → nouveau mot de passe via `?token=`
- `app/api/auth/forgot-password/route.ts` → génère le token, envoie l'email
- `app/api/auth/reset-password/route.ts` → applique le nouveau mot de passe

Côté **candidat**, un clic sur « Mot de passe oublié ? » donne une **page 404**.

### Pourquoi le 404 ?

1. Dans `components/auth/AuthForm.tsx` (ligne ~324), le lien est construit dynamiquement :
   ```tsx
   href={`/auth/${userType}/forgot-password`}
   ```
   Pour un candidat → `/auth/candidat/forgot-password` **qui n'existe pas** (seules les pages `/auth/recruteur/...` existent). → 404.

2. Même si la page existait, l'API `app/api/auth/forgot-password/route.ts` **rejette les candidats** :
   ```ts
   if (user.type !== "RECRUTEUR" && user.type !== "COLLABORATEUR") {
     return NextResponse.json(
       { message: "Cette fonctionnalité est réservée aux recruteurs" },
       { status: 403 },
     );
   }
   ```
   Il faut donc aussi lever cette restriction pour les candidats.

3. L'URL de réinitialisation générée dans l'email est **codée en dur vers le recruteur** :
   ```ts
   const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/recruteur/reset-password?token=${resetToken}`;
   ```
   Un candidat serait renvoyé vers la page recruteur. Il faut router selon le type d'utilisateur.

> Bonne nouvelle : `app/api/auth/reset-password/route.ts` est **générique** (aucun contrôle de type), il fonctionne déjà pour n'importe quel utilisateur. Rien à changer côté logique métier de reset.

---

## Ce que je vais faire

### 1. Créer les pages candidat (copie adaptée des pages recruteur)

- **`app/auth/candidat/forgot-password/page.tsx`**
  - Copie de la page recruteur, avec les liens de retour pointant vers `/auth/candidat/login` (au lieu de `/auth/recruteur/login`).
  - L'appel API `POST /api/auth/forgot-password` enverra en plus `userType: "candidat"` dans le body (voir point 3).

- **`app/auth/candidat/reset-password/page.tsx`**
  - Copie de la page recruteur, avec les redirections vers `/auth/candidat/login` et `/auth/candidat/forgot-password`.

> Note visuelle : je garde le **même style** que les pages recruteur (fond `#a590ff`, layout 2 colonnes) pour rester cohérent, sauf si tu préfères un autre visuel côté candidat — dis-le-moi.

### 2. Adapter l'API `app/api/auth/forgot-password/route.ts`

- Accepter un champ optionnel `userType` (`"recruteur"` | `"candidat"`) dans le body.
- **Remplacer** le blocage 403 par une logique cohérente :
  - Option retenue (à valider) : **autoriser aussi les candidats**.
    - Si `user.type === "CANDIDAT"` → autorisé.
    - Si `user.type === "RECRUTEUR" | "COLLABORATEUR"` → autorisé (comme aujourd'hui).
  - Générer l'`resetUrl` selon le type de l'utilisateur trouvé en base (source de vérité), pas seulement selon le `userType` reçu :
    ```ts
    const isCandidat = user.type === "CANDIDAT";
    const basePath = isCandidat ? "/auth/candidat" : "/auth/recruteur";
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}${basePath}/reset-password?token=${resetToken}`;
    ```
  - Conserver le comportement « on ne révèle pas si l'email existe » (réponse 200 générique quand `!user`).

### 3. Vérifier / ajuster `AuthForm.tsx`

- Le lien `/auth/${userType}/forgot-password` deviendra valide une fois la page candidat créée — **aucun changement requis** en principe.
- Je vérifie juste que `userType` vaut bien `"candidat"` sur la page login candidat (c'est le cas : `<AuthForm ... userType="candidat" />`).

### 4. Email de réinitialisation (`lib/email.ts`)

- Le template `sendResetPasswordEmail` reste générique (il reçoit déjà `resetUrl`). **Pas de changement nécessaire**, sauf si tu veux un wording différent pour les candidats.

---

## Fichiers touchés (récapitulatif)

| Fichier | Action |
|---|---|
| `app/auth/candidat/forgot-password/page.tsx` | **Créé** |
| `app/auth/candidat/reset-password/page.tsx` | **Créé** |
| `app/api/auth/forgot-password/route.ts` | **Modifié** (autoriser candidats + URL dynamique) |
| `components/auth/AuthForm.tsx` | Vérifié (a priori inchangé) |
| `lib/email.ts` | Inchangé (sauf demande de wording) |
| `app/api/auth/reset-password/route.ts` | Inchangé (déjà générique) |

---

## Points à valider avant que je code

1. **Autoriser les candidats** dans l'API partagée `/api/auth/forgot-password` (recommandé) — OK ?
2. **Réutiliser le même visuel** que les pages recruteur pour les pages candidat — OK, ou tu veux un autre design ?
3. **Wording de l'email** : je garde le template actuel générique — OK ?
4. Y a-t-il une **vérification email** à imposer avant reset côté candidat ? (le login candidat bloque les comptes non vérifiés — mais le reset de mdp n'a pas besoin de ça a priori.)

## Tests manuels prévus après implémentation

- Page `/auth/candidat/forgot-password` s'affiche (plus de 404).
- Saisie d'un email candidat existant → email reçu avec lien `/auth/candidat/reset-password?token=...`.
- Le lien ouvre la page, changement de mot de passe → connexion candidat OK avec le nouveau mdp.
- Un email inexistant → message générique (pas de fuite d'information).
