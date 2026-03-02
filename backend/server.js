const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Tableau temporaire en mémoire
let messages = [];

app.get('/', (req, res) => {
  res.send('Backend Aghimessenger opérationnel');
});

// Récupérer tous les messages
app.get('/messages', (req, res) => {
  res.status(200).json(messages);
});

// Enregistrer un message
app.post('/messages', (req, res) => {
  const { sender, text, time } = req.body;

  if (!sender || !text || !time) {
    return res.status(400).json({ error: 'Champ manquant' });
  }

  const message = { sender, text, time };
  messages.push(message); // ↩️ On l’ajoute à la liste

  console.log(`[${sender}] dit : ${text}`);
  res.status(200).json({ status: 'Message enregistré' });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
