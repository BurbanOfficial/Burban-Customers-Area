import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_KEY;
const LIST_ID = process.env.KLAVIYO_LIST_ID;

// Ajouter utilisateur à la liste
app.post("/newsletter/subscribe", async (req, res) => {
  const { email, firstname, lastname } = req.body;
  try {
    const response = await fetch(`https://a.klaviyo.com/api/v2/list/${LIST_ID}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`
      },
      body: JSON.stringify({
        profiles: [{ email, first_name: firstname, last_name: lastname }]
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retirer utilisateur de la liste
app.post("/newsletter/unsubscribe", async (req, res) => {
  const { email } = req.body;
  try {
    const response = await fetch(`https://a.klaviyo.com/api/v2/list/${LIST_ID}/members/exclude`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Klaviyo-API-Key ${KLAVIYO_API_KEY}`
      },
      body: JSON.stringify({
        emails: [email]
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
