const MomoApi = require("./MomoProvider");

///test

const numeroExpediteur = "256774290781"; // Numéro expéditeur (payer)
const numeroRecepteur = "256774290782";

const runScenarioCollection = async () => {
  try {
    console.log("📦 Début du scénario de collecte...");

    const momoApi = new MomoApi(numeroExpediteur, numeroRecepteur);

    // 1. Crée un utilisateur API (obligatoire une seule fois)
    await momoApi.createApiUser();

    // 2. Génère le token d'accès
    console.log("🔨 Obtention du token...");
    const accessToken = await momoApi.generateToken();
    console.log("✅ Token généré : ", accessToken);

    if (!accessToken) {
      throw new Error("❌ Token invalide, l'opération a échoué");
    }

    // 3. Crée une demande de paiement
    console.log("🔨 Création de la demande de paiement...");
    await momoApi.requestToPay(accessToken);

    console.log("📦 Fin du scénario de collecte");
  } catch (error) {
    console.error("❌ Erreur durant le scénario de collecte :", error.message);
  }
};

// Exécution du scénario de collection
runScenarioCollection();

// 📦 Scénario d'envoi d'argent (Disbursement)
const runScenarioDisbursement = async () => {
  try {
    console.log("📦 Début du scénario d'envoi d'argent (Disbursement)...");

    const momoApi = new MomoApi(
      numeroExpediteur,
      numeroRecepteur,
      "disbursement"
    );

    // 1. Crée un utilisateur API (obligatoire une seule fois)
    await momoApi.createApiUser();

    // 2. Génère le token d'accès
    console.log("🔨 Obtention du token...");
    const accessToken = await momoApi.generateToken();
    console.log("✅ Token généré : ", accessToken);

    if (!accessToken) {
      throw new Error("❌ Token invalide, l'opération a échoué");
    }

    // 3. Envoie de l'argent (avec token)
    console.log("🔨 Envoi d'argent...");
    await momoApi.sendMoney(accessToken, "2000", "EUR");

    console.log("📦 Fin du scénario Disbursement");
  } catch (error) {
    console.error("❌ Erreur durant le scénario Disbursement :", error.message);
  }
};

runScenarioDisbursement();

// 📦 Scénario de transfert international (Remittance)
const runScenarioRemittance = async () => {
  try {
    console.log(
      "📦 Début du scénario de transfert international (Remittance)..."
    );

    const momoApi = new MomoApi(
      numeroExpediteur,
      numeroRecepteur,
      "remittance"
    );

    // 1. Crée un utilisateur API (obligatoire une seule fois)
    await momoApi.createApiUser();

    // 2. Génère le token d'accès
    console.log("🔨 Obtention du token...");
    const accessToken = await momoApi.generateToken();
    console.log("✅ Token généré : ", accessToken);

    if (!accessToken) {
      throw new Error("❌ Token invalide, l'opération a échoué");
    }

    // 3. Transfert international (en utilisant le token)
    console.log("🔨 Transfert international...");
    await momoApi.sendMoney(accessToken, "75", "EUR");

    console.log("📦 Fin du scénario Remittance");
  } catch (error) {
    console.error("❌ Erreur durant le scénario Remittance :", error.message);
  }
};

runScenarioRemittance();
