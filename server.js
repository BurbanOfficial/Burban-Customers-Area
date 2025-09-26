// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors()); // Autoriser ton frontend à communiquer avec ce backend

// Variables d'environnement
const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_KEY; // Clé privée v3
const LIST_ID = process.env.KLAVIYO_LIST_ID;

// --------------------
// ROUTES NEWSLETTER
// --------------------

// Ajouter utilisateur à la liste
app.post("/newsletter/subscribe", async (req, res) => {
  const { email, firstname, lastname } = req.body;

  if (!email) return res.status(400).json({ error: "Email manquant" });

  try {
    const response = await fetch(`https://a.klaviyo.com/api/v2/list/${LIST_ID}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`
      },
      body: JSON.stringify({
        profiles: [{ email, first_name: firstname, last_name: lastname }]
      })
    });

    const text = await response.text(); // Permet de voir le vrai retour
    console.log("Klaviyo subscribe response:", text);

    if (!response.ok) {
      return res.status(response.status).json({ error: text });
    }

    res.json({ success: true, data: JSON.parse(text) });
  } catch (err) {
    console.error("Error subscribe:", err);
    res.status(500).json({ error: err.message });
  }
});

// Retirer utilisateur de la liste
app.post("/newsletter/unsubscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email manquant" });

  try {
    const response = await fetch(`https://a.klaviyo.com/api/v2/list/${LIST_ID}/members/exclude`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`
      },
      body: JSON.stringify({ emails: [email] })
    });

    const text = await response.text();
    console.log("Klaviyo unsubscribe response:", text);

    if (!response.ok) {
      return res.status(response.status).json({ error: text });
    }

    res.json({ success: true, data: JSON.parse(text) });
  } catch (err) {
    console.error("Error unsubscribe:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// TEST ROUTE
// --------------------
app.get("/", (req, res) => {
  res.send("Backend Burbans Customers Area is running ✅");
});

// --------------------
// SERVER
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
