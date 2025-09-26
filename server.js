// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from your frontend

const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_KEY;
const LIST_ID = process.env.KLAVIYO_LIST_ID;

if (!KLAVIYO_API_KEY || !LIST_ID) {
  console.warn("⚠️ KLAVIYO_PRIVATE_KEY or LIST_ID not set in env!");
}

// Helper to log response body safely
async function readResponseSafe(res) {
  try {
    const text = await res.text();
    try { return { text, json: JSON.parse(text) }; } catch(e) { return { text, json: null }; }
  } catch (err) { return { text: null, json: null }; }
}

// Subscribe (add member) -> Klaviyo v2 expects POST to /api/v2/list/:list_id/members
app.post("/newsletter/subscribe", async (req, res) => {
  const { email, firstname = "", lastname = "" } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email manquant" });

  try {
    const url = `https://a.klaviyo.com/api/v2/list/${LIST_ID}/members?api_key=${KLAVIYO_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profiles: [{ email, first_name: firstname, last_name: lastname }] })
    });

    const body = await readResponseSafe(response);
    console.log("[Klaviyo subscribe] status:", response.status, "body:", body.text);

    if (!response.ok) {
      // forward Klaviyo error to caller
      return res.status(response.status).json({ error: body.text || "Klaviyo error", raw: body.json || body.text });
    }

    return res.json({ success: true, data: body.json || body.text });
  } catch (err) {
    console.error("Error in /newsletter/subscribe:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Unsubscribe -> members/exclude
app.post("/newsletter/unsubscribe", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email manquant" });

  try {
    const url = `https://a.klaviyo.com/api/v2/list/${LIST_ID}/members/exclude?api_key=${KLAVIYO_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: [email] })
    });

    const body = await readResponseSafe(response);
    console.log("[Klaviyo unsubscribe] status:", response.status, "body:", body.text);

    if (!response.ok) {
      return res.status(response.status).json({ error: body.text || "Klaviyo error", raw: body.json || body.text });
    }

    return res.json({ success: true, data: body.json || body.text });
  } catch (err) {
    console.error("Error in /newsletter/unsubscribe:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.send("Burban Customers Area API — OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
