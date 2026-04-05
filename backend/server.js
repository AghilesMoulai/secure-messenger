const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const db = new Database('messenger_data_base.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    time TEXT NOT NULL
    )
  `);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
    )`
  );

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend Aghimessenger opérationnel');
});

// Récupérer tous les messages
app.get('/messages', (req, res) => {
  const messages = db.prepare('SELECT * FROM messages ORDER BY id ASC').all()
  res.status(200).json(messages);
});

// Enregistrer un message
app.post('/messages', (req, res) => {
  const { sender, text, time } = req.body;

  if (!sender || !text || !time) {
    return res.status(400).json({ error: 'Champ manquant' });
  }

  db.prepare('INSERT INTO messages (sender, text, time) VALUES (?, ?, ?)').run(sender, text, time);

  console.log(`[${sender}] dit : ${text}`);
  res.status(200).json({ status: 'Message enregistré' });
});

app.post('/register', async (req, res) => {
  const {username, email, password} = req.body;

  if(!username || !email || !password) {
    return res.status(400).json({ error: 'Champ manquant' });
  }

  const password_hash = await bcrypt.hash(password, 10);

  db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?,?,?)').run(username, email, password_hash);

  console.log(`new user added [${username}] with email: [${email}]`);
  res.status(200).json({ status: 'Utilisateur enregistré'});
});

app.post('/login', async (req, res) => {
  const{email, password} = req.body;

  if(!email || !password) {
    return res.status(400).json({ error: 'Champ manquant' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if(user == null){
    return res.status(400).json({ error: 'utilisateur inexistant' });
  }

  const match = await bcrypt.compare(password, user.password_hash);

  let token = null;
  if(match){
    token = jwt.sign({id: user.id, username: user.username}, 'SECRET_KEY', { expiresIn: '24h' });
  }else{
    return res.status(400).json({ error: 'email ou mot de passe incorrecte' });
  }

  console.log(`[${user.username}] est connecté`);
  res.status(200).json({status: 'Utilisateur connecté', token: token});
})

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
