
// Variables globales
let historiqueTransactions = []; // Tableau pour l'historique des transactions
const userNumber = "064493007"; // Numéro de téléphone de l'utilisateur

// Sélection des éléments DOM
let type_ = document.getElementById("transactionType");
let expediteur_ = document.getElementById("expediteur");
let recepteur_ = document.getElementById("recepteur");
let amount_ = document.getElementById("amount");
let currency_ = document.getElementById("currency");
let expContainer = document.getElementById("expediteur-container");
let montantSection = document.getElementById("montantSection");


async function detectCountryAndCurrency() {
  try {
    // 1. Détecter le pays via l'IP (API gratuite)
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const country = data.country_name;
    const countryCode = data.country_code;

    console.log("🌍 Pays détecté :", country);

    // 2. Liste des devises MTN MoMo par pays
    const mtnCurrencies = {
      BJ: "XOF", // Bénin
      CM: "XAF", // Cameroun
      CI: "XOF", // Côte d'Ivoire
      CG: "XAF", // Congo-Brazzaville
      SZ: "SZL", // Eswatini
      GH: "GHS", // Ghana
      GN: "GNF", // Guinée
      GW: "XOF", // Guinée-Bissau
      LR: "LRD", // Liberia
      NG: "NGN", // Nigeria
      RW: "RWF", // Rwanda
      UG: "UGX", // Ouganda
      ZM: "ZMW", // Zambie
      AF: "AFN", // Afghanistan
    };

    // 3. Trouver la devise selon le pays
    const currency = mtnCurrencies[countryCode];

    console.log("💱 Devise MTN MoMo :", currency);
    document.getElementById("currency").value = currency;
    return currency;
  } catch (error) {
    console.error("❌ Erreur lors de la détection :", error);
    return "XAF"; // Devise par défaut en cas d'erreur
  }
}


// Fonction pour afficher/masquer les champs en fonction du type de transaction
function afficherChamps() {
  const type = type_.value;

  // Gestion des champs en fonction du type de transaction
  if (type === "collection") {
    recepteur_.value = userNumber;
    expediteur_.value = "";
    montantSection.classList.add("hidden");
  } else if (type === "disbursement") {
    expediteur_.value = userNumber;
    recepteur_.value = "";
    montantSection.classList.remove("hidden");
  } else if (type === "remittance") {
    expediteur_.value = "";
    recepteur_.value = "";
    montantSection.classList.remove("hidden");
  }
}

// Fonction pour ajouter une transaction à l'historique
function ajouterHistorique(transaction) {
  historiqueTransactions.unshift(transaction); // Ajout au début du tableau

  const tbody = document.getElementById("historique").querySelector("tbody");
  const row = document.createElement("tr");

  // Déterminer le badge de statut
  let statusBadge = "";
  if (transaction.status === "COMPLETED") {
    statusBadge = `<span class="status-badge status-success">Réussi</span>`;
  } else if (transaction.status === "PENDING") {
    statusBadge = `<span class="status-badge status-pending">En cours</span>`;
  } else {
    statusBadge = `<span class="status-badge status-error">Échoué</span>`;
  }

  row.innerHTML = `
                <td>${getTransactionIcon(transaction.type)} ${
    transaction.type
  }</td>
                <td>${transaction.numeroExpediteur}</td>
                <td>${transaction.numeroRecepteur}</td>
                <td>${
                  transaction.amount
                    ? transaction.amount + " " + transaction.currency
                    : "N/A"
                }</td>
                <td>${statusBadge}</td>
                <td>${new Date(
                  transaction.transactionTime
                ).toLocaleString()}</td>
            `;

  // Ajouter au début du tableau
  if (tbody.firstChild) {
    tbody.insertBefore(row, tbody.firstChild);
  } else {
    tbody.appendChild(row);
  }
}

// Fonction pour obtenir l'icône de transaction
function getTransactionIcon(type) {
  switch (type) {
    case "collection":
      return "📦";
    case "disbursement":
      return "💸";
    case "remittance":
      return "🌍";
    default:
      return "💳";
  }
}

// Fonction pour lancer une transaction
async function lancerTransaction() {
  const type = type_.value;
  const expediteur = expediteur_.value;
  const recepteur = recepteur_.value;
  const amount = amount_.value;
  const currency = await detectCountryAndCurrency();

  // Validation des champs
  if (!expediteur || !recepteur) {
    alert("🚨 Veuillez remplir les numéros expéditeur et récepteur !");
    return;
  }

  if (
    (type === "disbursement" || type === "remittance") &&
    (!amount || isNaN(amount))
  ) {
    alert("🚨 Veuillez renseigner un montant valide !");
    return;
  }

  let endpoint = "";
  let payload = {
    numeroExpediteur: expediteur,
    numeroRecepteur: recepteur,
  };

  if (type === "collection") {
    endpoint = "collection";
  } else if (type === "disbursement" || type === "remittance") {
    endpoint = type;
    payload.amount = parseFloat(amount);
    payload.currency = currency;
  }

  // Afficher un indicateur de chargement
  const btn = document.querySelector(".btn");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span class="transaction-icon">⏳</span> Traitement en cours...`;
  btn.disabled = true;

  // Envoi de la requête à l'API
  try {
    const response = await fetch(`http://localhost:3000/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("✅ Réponse du serveur:", data);

    // Notification visuelle
    alert(data.message || "Transaction réussie !");

    // Ajouter la transaction à l'historique
    const transaction = {
      type: type,
      numeroExpediteur: expediteur,
      numeroRecepteur: recepteur,
      amount: payload.amount || null,
      currency: payload.currency || null,
      transactionTime: new Date().toISOString(),
      status: "COMPLETED", // À adapter selon la réponse de l'API
    };
    ajouterHistorique(transaction);
  } catch (error) {
    console.error("❌ Erreur:", error);
    alert("Erreur durant la transaction");

    // Ajouter quand même à l'historique avec statut d'erreur
    const transaction = {
      type: type,
      numeroExpediteur: expediteur,
      numeroRecepteur: recepteur,
      amount: payload.amount || null,
      currency: payload.currency || null,
      transactionTime: new Date().toISOString(),
      status: "ERROR",
    };
    ajouterHistorique(transaction);
  } finally {
    // Restaurer le bouton
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Initialisation
document.addEventListener("DOMContentLoaded", function () {
  afficherChamps();
  detectCountryAndCurrency();

  // Ajouter quelques transactions fictives pour l'exemple
  ajouterHistorique({
    type: "collection",
    numeroExpediteur: "237690000001",
    numeroRecepteur: userNumber,
    amount: 5000,
    currency: "XAF",
    transactionTime: new Date(Date.now() - 3600000).toISOString(),
    status: "COMPLETED",
  });

  ajouterHistorique({
    type: "disbursement",
    numeroExpediteur: userNumber,
    numeroRecepteur: "237690000002",
    amount: 2500,
    currency: "XAF",
    transactionTime: new Date(Date.now() - 7200000).toISOString(),
    status: "COMPLETED",
  });
});
