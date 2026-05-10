# Features en cours / incomplètes

**Dernière mise à jour :** 2026-05-09

---

## 🟡 LinkedIn OAuth

**État :** Configuré côté code, nécessite des credentials valides.

**Ce qui est fait :**
- Route `/api/auth/linkedin` — génère l'URL OAuth
- Route `/api/auth/linkedin/callback` — échange le code, stocke l'access token
- Route `/api/linkedin/status` — vérifie si le compte est connecté
- `LINKEDIN_SHARE_ENABLED` — feature flag pour activer la publication

**Ce qu'il reste à faire :**
- [ ] Demander l'accès au produit "Share on LinkedIn" dans la LinkedIn Developer Console
- [ ] Tester le flow complet en production avec de vrais credentials
- [ ] Gérer le refresh token (actuellement stocké mais pas utilisé)

---

## 🔴 Google OAuth

**État :** Stub présent dans `lib/auth.ts` (commenté).

**Ce qu'il reste à faire :**
- [ ] Créer les credentials Google Cloud Console
- [ ] Décommenter le bloc dans `lib/auth.ts`
- [ ] Tester le flow

---

## 🟡 Pages de retour paiement

**État :** Pages créées mais non testées en production.

**Fichiers :**
- `app/(public)/paiement/success/page.tsx`
- `app/(public)/paiement/cancel/page.tsx`

**Ce qu'il reste à faire :**
- [ ] Tester avec un paiement GeniusPay réel (sandbox)
- [ ] Vérifier que le webhook met bien à jour le statut abonnement
- [ ] Ajouter une vérification de session sur la page success

---

## 🟡 Multi-diffusion jobboards

**État :** LinkedIn connecté, autres jobboards stubbed.

**Ce qu'il reste à faire :**
- [ ] Intégrer Indeed API
- [ ] Intégrer les autres jobboards africains
- [ ] Implémenter le retry automatique pour les diffusions échouées

---

## 🟢 Reset mot de passe recruteur

**État :** Implémenté et testé.

**Fichiers :**
- `app/api/auth/forgot-password/route.ts`
- `app/auth/recruteur/reset-password/page.tsx`

---

## 🔴 Tests automatisés

**État :** Zéro test. Voir `audit/06-tests.md` pour la stratégie recommandée.
