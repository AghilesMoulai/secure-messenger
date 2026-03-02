const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend Aghimessenger opérationnel');
});

app.post('/messages', (req, res) => {
    const {sender, text} = req.body;

    if(!sender || !text) {
        return res.status(400).json({error: 'Champ manquant'});
    }

    console.log(`[${sender}] dit : ${text}`);
    
    const botReply = {
        sender: 'bot',
        text: `Bot répond : "${text}"`,
        time: new Date().toISOString()
    };

    res.status(200).json(botReply);
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
