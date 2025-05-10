const express = require("express");
const MomoApi = require("./MomoProvider");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Bienvenue sur l'API Momo !");
});

// Fonction centralisée pour créer un utilisateur et générer un token
async function createMomoApi(numeroExpediteur, numeroRecepteur, type) {
  const momoApi = new MomoApi(numeroExpediteur, numeroRecepteur, type);
  await momoApi.createApiUser();
  const accessToken = await momoApi.generateToken();
  return { momoApi, accessToken };  // Retourne un objet contenant les deux valeurs
}

// 📦 Endpoint pour collecte (recevoir un paiement)
app.post("/collection", async (req, res) => {
  const { numeroExpediteur, numeroRecepteur } = req.body;

  try {
    const { momoApi, accessToken } = await createMomoApi(numeroExpediteur, numeroRecepteur, "collection");

    if (!accessToken) {
      return res.status(400).json({ error: "Token invalide" });
    }

    await momoApi.requestToPay(accessToken);
    res.json({ 
      message: "✅ Paiement demandé avec succès",
      data: { numeroExpediteur, numeroRecepteur  },

    });
  } catch (error) {
    console.error("❌ Erreur Collection :", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📦 Endpoint pour disbursement (envoyer de l'argent)
app.post("/disbursement", async (req, res) => {
  const { numeroExpediteur, numeroRecepteur, amount, currency } = req.body;

  try {
    const { momoApi, accessToken } = await createMomoApi(numeroExpediteur, numeroRecepteur, "disbursement");

    if (!accessToken) {
      return res.status(400).json({ error: "Token invalide" });
    }

    await momoApi.sendMoney(accessToken, amount, currency);
    res.json({ 
      message: "✅ Argent envoyé avec succès" ,
      data: { numeroExpediteur, numeroRecepteur, amount, currency },
    });
  } catch (error) {
    console.error("❌ Erreur Disbursement :", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📦 Endpoint pour remittance (transfert international)
app.post("/remittance", async (req, res) => {
  const { numeroExpediteur, numeroRecepteur, amount, currency } = req.body;

  try {
    const { momoApi, accessToken } = await createMomoApi(numeroExpediteur, numeroRecepteur, "remittance");

    if (!accessToken) {
      return res.status(400).json({ error: "Token invalide" });
    }

    await momoApi.sendMoney(accessToken, amount, currency);
    res.json({ 
      message: "✅ Transfert international réussi",
      data: { numeroExpediteur, numeroRecepteur, amount, currency },
     });
  } catch (error) {
    console.error("❌ Erreur Remittance :", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur API lancé sur http://localhost:${PORT}`);
});
// 🌐 Route pour documentation
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/docs.html"); // On enverra un fichier docs.html
});

// ❌ Middleware 404 (toujours en dernier)
app.use((req, res) => {
  res.status(404).send(`
    <h1>404 - Page non trouvée</h1>
    <p>La ressource demandée est introuvable.</p>
    <a href="/">Retour à l'accueil</a>
  `);
});
