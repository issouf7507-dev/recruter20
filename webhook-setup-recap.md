# Récapitulatif — Intégration Webhook GeniusPay

## Contexte

Le système de paiement GeniusPay était fonctionnel côté initiation, mais l'application ne recevait aucun retour pour mettre à jour le statut de l'abonnement après un paiement. La solution est un endpoint webhook que GeniusPay appelle automatiquement à chaque événement.

---

## Ce qui a été mis en place

### 1. Variable d'environnement (`.env`)

Le secret webhook fourni par GeniusPay Dashboard a été ajouté :

```env
GENIUSPAY_WEBHOOK_SECRET=whsec_TQOyEaOYQJ9kyipYDdzJAzNZCDQxgv8ZssLZJCRWeiGCJ5T3
```

Il est déjà validé par le schéma Zod dans `lib/env.ts`.

---

### 2. Fonction de vérification HMAC — `lib/geniuspay.ts`

Fonction `verifyWebhookSignature` : vérifie que le webhook vient bien de GeniusPay en calculant un HMAC-SHA256 et en le comparant de façon **timing-safe** (protection contre les attaques par timing).

**Formule :**

```
HMAC-SHA256(timestamp + "." + raw_body, whsec_...)
```

**Améliorations apportées :**

- Passage de `crypto.subtle` (Web Crypto asynchrone) à `createHmac` / `timingSafeEqual` (Node.js crypto)
- La fonction est maintenant synchrone (plus de `async/await`)
- Comparaison timing-safe avec `timingSafeEqual` (évite les attaques par timing)

---

### 3. Route webhook — `app/api/payment/webhook/route.ts`

**URL de l'endpoint :** `POST /api/payment/webhook`

**Pipeline de traitement :**

```
Requête entrante
  → Vérification des headers obligatoires (X-Webhook-Signature, X-Webhook-Timestamp, X-Webhook-Event)
  → Vérification HMAC-SHA256
  → Protection anti-replay (rejet si timestamp > 5 minutes)
  → Parsing JSON
  → Dispatch par type d'événement
  → Réponse 200 { received: true }
```

**Événements gérés :**

| Événement           | Action                                                                          |
| ------------------- | ------------------------------------------------------------------------------- |
| `payment.success`   | Active l'abonnement (upsert), dateFin = +30 jours, statut paiement → `COMPLETE` |
| `payment.failed`    | Statut paiement → `ECHOUE`                                                      |
| `payment.expired`   | Statut paiement → `EXPIRE`                                                      |
| `payment.cancelled` | Statut paiement → `ECHOUE`                                                      |
| `payment.refunded`  | Statut paiement → `REMBOURSE`                                                   |
| `webhook.test`      | Log uniquement (test depuis le dashboard)                                       |

---

## Configuration dans le Dashboard GeniusPay

1. Aller sur **merchant.genius.ci** → Paramètres → Webhooks
2. Ajouter l'URL : `https://VOTRE_DOMAINE/api/payment/webhook`
3. Le secret (`whsec_TQOyEaOYQJ9kyipYDdzJAzNZCDQxgv8ZssLZJCRWeiGCJ5T3`) est déjà dans le `.env`
4. Cliquer sur le bouton **test** (icône éclair) → vérifier que la réponse est `200 OK`

> **Important :** L'URL doit être HTTPS et accessible publiquement (pas localhost). En développement, utiliser [ngrok](https://ngrok.com) : `ngrok http 3000` → utiliser l'URL HTTPS fournie.

---

## Flux complet d'un paiement réussi

```
1. User clique "Payer" → POST /api/payment/initiate
2. Serveur crée un PaiementHistory (statut: EN_ATTENTE) + retourne checkout_url
3. User est redirigé vers GeniusPay pour payer
4. User paie avec succès → GeniusPay appelle POST /api/payment/webhook
5. Webhook reçoit event "payment.success"
6. Abonnement → statut: ACTIF, plan: PRO ou ENTREPRISE, dateFin: +30j
7. PaiementHistory → statut: COMPLETE
8. User est redirigé vers /paiement/succes
```

---

## Sécurité

- **Signature HMAC** : chaque requête est authentifiée, impossible de forger sans le secret
- **Timing-safe** : comparaison résistante aux attaques par mesure du temps de réponse
- **Anti-replay** : les webhooks de plus de 5 minutes sont rejetés
- **Header validation** : 400 immédiat si un header obligatoire est absent
- **Secret non exposé** : `GENIUSPAY_WEBHOOK_SECRET` n'est jamais envoyé côté client

---

_Dernière mise à jour : 26 mai 2026_
