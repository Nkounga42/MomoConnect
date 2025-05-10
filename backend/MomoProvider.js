const axios = require("axios");
const Buffer = require("buffer").Buffer;

const Collection_Widget_API = "4e40e72de6994a9a903dfd146107fd12"; // Clé Collection Widget
const Collections_API = "75c611fd933e4f3f8c587d652f0d3ebf"; // Clé Collection
const Disbursements_API = "e56ec3d104d54a8ebc2248d8e7e6d286"; // Clé Disbursement
const Remittance_API = "c0282da2b91c4384b15518c8cf78c501"; // Clé Remittance
const Environment = "sandbox"; // Environnement de test

class MomoApi {
  constructor( 
    numeroExpediteur,
    numeroRecepteur,
    typeTransaction = "collection"
  ) {
    this.collectionKey = Collections_API; // Clé pour recevoir (Collection)
    this.disbursementKey = Disbursements_API; // Clé pour envoyer (Disbursement)
    this.remittanceKey = Remittance_API; // Clé pour transfert international (Remittance)
    this.typeTransaction = typeTransaction;
    this.environment = Environment;
    this.numeroExpediteur = numeroExpediteur;
    this.numeroRecepteur = numeroRecepteur;

    this.userApi = this.generateUUID();
    this.baseUrl =
      this.environment === "sandbox"
        ? "https://sandbox.momodeveloper.mtn.com"
        : "https://momodeveloper.mtn.com";
  }

  // Générer UUID v4
  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  //  Générer un token d'accès pour Collection
  async generateToken() {
    const apiKey = await this.createApiKey(); // On garde ta méthode
    const auth = Buffer.from(`${this.userApi}:${apiKey}`).toString("base64");
    // Choisir la bonne clé selon le type
    let subscriptionKey;
    // 🔥 Sélectionne l'URL du token selon le type de transaction
    let tokenUrl;
    if (this.typeTransaction === "collection") {
      tokenUrl = `${this.baseUrl}/collection/token/`;
      subscriptionKey = this.collectionKey;
    } else if (this.typeTransaction === "disbursement") {
      subscriptionKey = this.disbursementKey;
      tokenUrl = `${this.baseUrl}/disbursement/token/`;
    } else if (this.typeTransaction === "remittance") {
      tokenUrl = `${this.baseUrl}/remittance/token/`;
      subscriptionKey = this.remittanceKey;
    } else {
      throw new Error("❌ Type de transaction inconnu");
    }

    try {
      const response = await axios.post(
        tokenUrl,
        {},
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Ocp-Apim-Subscription-Key": subscriptionKey, // ⚠️ On corrige ça juste en dessous 👇
            "Content-Type": "application/json",
          },
        }
      );
      const accessToken = response.data.access_token;
      return accessToken;
    } catch (error) {
      console.error(
        "❌ Error getting token:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  }

  //  Générer seulement la clé API (sans lancer de paiement)
  async createApiKey() {
    try {
      console.log("🔨 Création de la clé API...");
      const response = await axios.post(
        `${this.baseUrl}/v1_0/apiuser/${this.userApi}/apikey`,
        {},
        {
          headers: {
            "Ocp-Apim-Subscription-Key": this.collectionKey,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(" API Key created");
      const apiKey = response.data.apiKey;
      console.log("🔑 API Key:", apiKey);

      return apiKey;
    } catch (error) {
      console.error(
        "❌ Error creating API key:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  }

  // Créer un utilisateur API (Commun)
  async createApiUser() {
    try {
      console.log("🔨 Création de l'utilisateur API...");
      await axios.post(
        `${this.baseUrl}/v1_0/apiuser`,
        { providerCallbackHost: "string" },
        {
          headers: {
            "X-Reference-Id": this.userApi,
            "Ocp-Apim-Subscription-Key": this.collectionKey,
            "Content-Type": "application/json",
          },
        }
      );
      await this.createApiKey();
    } catch (error) {
      console.error(
        "❌ Error creating API user:",
        error.response ? error.response.data : error.message
      );
    }
  }

  // Obtenir token pour Collection (réception)
  async getCollectionToken(apiKey) {
    const auth = Buffer.from(`${this.userApi}:${apiKey}`).toString("base64");
    try {
      console.log("🔨 Obtention du token Collection...");
      const response = await axios.post(
        `${this.baseUrl}/collection/token/`,
        {},
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Ocp-Apim-Subscription-Key": this.collectionKey,
            "Content-Type": "application/json",
          },
        }
      );
      const accessToken = response.data.access_token;
      console.log(" Collection Access Token:", accessToken);
      await this.requestToPay(accessToken);
    } catch (error) {
      console.error(
        "❌ Error getting collection token:",
        error.response ? error.response.data : error.message
      );
    }
  }

  // Recevoir un paiement
  async requestToPay(accessToken) {
    const uuid = this.generateUUID();

    // Validation des types de données
    const amount = "100"; // Exemple: "100" doit être un nombre
    const currency = "EUR"; // Exemple: "EUR" doit être une devise valide

    if (isNaN(amount) || amount <= 0) {
      throw new Error("❌ Montant invalide");
    }
    if (!currency || currency.length !== 3) {
      throw new Error("❌ Devise invalide");
    }

    const requestData = {
      amount: amount.toString(), // S'assurer que c'est une chaîne
      currency: currency,
      externalId: uuid,
      payer: {
        partyIdType: "MSISDN",
        partyId: this.numeroExpediteur, // Numéro qui paie
      },
      payerMessage: "Merci pour le paiement",
      payeeNote: "Paiement pour service",
    };

    try {
      await axios.post(
        `${this.baseUrl}/collection/v1_0/requesttopay`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Reference-Id": uuid,
            "X-Target-Environment": this.environment,
            "Ocp-Apim-Subscription-Key": this.collectionKey,
            "Content-Type": "application/json",
          },
        }
      );

      // Vérifier le statut de la transaction
      await this.checkTransactionStatus(accessToken, uuid);
    } catch (error) {
      console.error("❌ Error sending payment request:", error.message);
      if (error.response) {
        console.error("Réponse du serveur:", error.response.data);
      } else if (error.request) {
        console.error("Aucune réponse reçue du serveur:", error.request);
      }
    }
  }

  // 🔎 Vérifier le statut de la transaction
  async checkTransactionStatus(accessToken, referenceId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Target-Environment": this.environment,
            "Ocp-Apim-Subscription-Key": this.collectionKey,
          },
        }
      );
    } catch (error) {
      console.error(
        "❌ Error checking transaction status:",
        error.response ? error.response.data : error.message
      );
    }
  }

  async sendMoney(accessToken, amount, currency) {
    try {
      console.log("🔨 Envoi de l'argent...");

      const uuid = this.generateUUID();

      // Validation
      if (isNaN(amount) || Number(amount) <= 0) {
        throw new Error("❌ Montant invalide");
      }
      if (!currency || currency.length !== 3) {
        throw new Error("❌ Devise invalide");
      }

      const requestData = {
        amount: amount.toString(),
        currency: currency.toUpperCase(),
        externalId: uuid,
        payee: {
          partyIdType: "MSISDN",
          partyId: this.numeroRecepteur, // Numéro qui reçoit
        },
        payerMessage: "Paiement envoyé",
        payeeNote: "Merci",
      };

      await axios.post(
        `${this.baseUrl}/${this.typeTransaction}/v1_0/transfer`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Reference-Id": uuid,
            "X-Target-Environment": this.environment,
            "Ocp-Apim-Subscription-Key":
              this.typeTransaction === "disbursement"
                ? this.disbursementKey
                : this.remittanceKey,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Money Sent. Reference ID:", uuid);
    } catch (error) {
      console.error(
        "❌ Error sending money:",
        error.response ? error.response.data : error.message
      );
    }
  }
}

module.exports = MomoApi;
