const express = require("express");
const cors = require("cors");
const app = express();
const MomoApi = require("./MomoProvider");

const PORT = 3000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("🚀 Bienvenue sur l'API Momo !");
});

// async function createMomoApi(numeroExpediteur, numeroRecepteur, type) {
//   const momoApi = new MomoApi(numeroExpediteur, numeroRecepteur, "collection");
//   await momoApi.createApiUser();
//   const accessToken = await momoApi.generateToken();
//   return momoApi, accessToken;
// }



// 📦 Endpoint pour collecte (recevoir un paiement)
app.post("/collection", async (req, res) => {
  const { numeroExpediteur, numeroRecepteur } = req.body;

  try {
    const momoApi = new MomoApi(numeroExpediteur, numeroRecepteur, "collection");
    await momoApi.createApiUser();
    const accessToken = await momoApi.generateToken();

    if (!accessToken) {
      return res.status(400).json({ error: "Token invalide" });
    }

    await momoApi.requestToPay(accessToken);
    res.json({ message: "✅ Paiement demandé avec succès" });
  } catch (error) {
    console.error("❌ Erreur Collection :", error.message);
    res.status(500).json({ error: error.message });
  }
});



// 📦 Endpoint pour disbursement (envoyer de l'argent)
app.post("/disbursement", async (req, res) => {
  const { numeroExpediteur, numeroRecepteur, amount, currency } = req.body;

  try {
    const momoApi = new MomoApi(numeroExpediteur, numeroRecepteur, "disbursement");
    await momoApi.createApiUser();
    const accessToken = await momoApi.generateToken();

    if (!accessToken) {
      return res.status(400).json({ error: "Token invalide" });
    }

    await momoApi.sendMoney(accessToken, amount, currency);
    res.json({ message: "✅ Argent envoyé avec succès" });
  } catch (error) {
    console.error("❌ Erreur Disbursement :", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📦 Endpoint pour remittance (transfert international)
app.post("/remittance", async (req, res) => {
  const { numeroExpediteur, numeroRecepteur, amount, currency } = req.body;

  try {
    const momoApi = new MomoApi(numeroExpediteur, numeroRecepteur, "remittance");
    await momoApi.createApiUser();
    const accessToken = await momoApi.generateToken();

    if (!accessToken) {
      return res.status(400).json({ error: "Token invalide" });
    }

    await momoApi.sendMoney(accessToken, amount, currency);
    res.json({ message: "✅ Transfert international réussi" });
  } catch (error) {
    console.error("❌ Erreur Remittance :", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur API lancé sur http://localhost:${PORT}`);
});
