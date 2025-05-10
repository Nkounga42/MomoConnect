# Documentation de l'API MOMO Provider

## Introduction

Ce README explique l'utilisation du fichier `momoprovider.js`, qui fournit une interface pour interagir avec l'API MTN MoMo. Il inclut des méthodes pour la génération de jetons, la création d'utilisateurs, l'exécution de transactions, et plus encore.

---

## 🛠️ Utilisation

### Initialisation

Pour utiliser le fichier `momoprovider.js`, initialisez le fournisseur comme suit :

```javascript
const MomoProvider = require('./momoprovider');

const momo = new MomoProvider(senderNumber, receiverNumber, transactionType);
```

#### Paramètres :

- **senderNumber** : Le numéro de téléphone de l'expéditeur au format international (par exemple, `2250700000000`).
- **receiverNumber** : Le numéro de téléphone du destinataire.
- **transactionType** :
  - `"collection"` (par défaut) : Pour recevoir des paiements.
  - `"disbursement"` : Pour envoyer des paiements locaux.
  - `"remittance"` : Pour les transferts internationaux.

---

## 🔄 Workflow Complet

### 1. Générer un Jeton

```javascript
const token = await momo.generateToken();
```

### 2. Créer un Utilisateur API

```javascript
await momo.createApiUser();
```

### 3. Effectuer une Transaction

#### Pour un paiement entrant :

```javascript
await momo.requestToPay(accessToken);
```

#### Pour un envoi d'argent :

```javascript
await momo.sendMoney(accessToken, "50", "EUR");
```

### 4. Vérification de la Transaction :

```javascript
await momo.checkTransactionStatus(accessToken, "reference-id");
```

---

## 🏷️ Types de Transactions

| Type          | Endpoint MTN     | Description                  |
|---------------|------------------|------------------------------|
| Collection    | `/collection`    | Réception de paiement        |
| Disbursement  | `/disbursement`  | Envoi local                  |
| Remittance    | `/remittance`    | Transfert international      |

---

## 🔒 Sécurité

### Important :

- Ne jamais commiter les clés API dans le code.
- Utiliser des variables d'environnement.
- Restreindre les IPs autorisées dans le tableau de bord MoMo.

---

## 📚 Documentation Officielle

[MTN MoMo Developer Portal](https://momodeveloper.mtn.com)