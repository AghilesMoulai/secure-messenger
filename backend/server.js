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
    time TEXT NOT NULL,
    receiver TEXT NOT NULL
    )
  `);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    public_key TEXT
    )`
  );

app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(!token){
    return res.status(401).json({ error: 'Token manquant'});
  }

  jwt.verify(token, 'SECRET_KEY', (err, user) => {
    if(err) return res.status(401).json({error: 'Token Invalide'});
    req.user = user;
    next();
  });
};

app.get('/',(req, res) => {
  res.send('Backend Aghimessenger opérationnel');
});

// Récupérer tous les messages
app.get('/messages', verifyToken,(req, res) => {
  const me = req.user.username;
  const other = req.query.with;

  if(!other){
    return res.status(400).json({error : 'Paramètre "with" manquant'});
  }

  const messages = db.prepare('SELECT * FROM messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY id ASC').all(me, other, other, me);
  res.status(200).json(messages);
});

// Enregistrer un message
app.post('/messages', verifyToken,(req, res) => {
  const { sender, text, time, receiver } = req.body;

  if (!sender || !text || !time || !receiver) {
    return res.status(400).json({ error: 'Champ manquant' });
  }

  db.prepare('INSERT INTO messages (sender, text, time, receiver) VALUES (?, ?, ?, ?)').run(sender, text, time, receiver);

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
    token = jwt.sign({id: user.id, username: user.username}, 'SECRET_KEY', { expiresIn: '1h' });
  }else{
    return res.status(400).json({ error: 'email ou mot de passe incorrecte' });
  }

  console.log(`[${user.username}] est connecté`);
  res.status(200).json({status: 'Utilisateur connecté', token: token, username: `${user.username}`});
})

app.get('/users', verifyToken, (req, res) => {
  const me = req.user.username;
  const users = db.prepare('SELECT username, public_key FROM users WHERE username != ?').all(me);
  res.status(200).json(users);
})

app.post('/users/key', verifyToken, (req, res) => {
  const {public_key} = req.body;
  const username = req.user.username;

  db.prepare('UPDATE users SET public_key = ? WHERE username = ?').run(public_key, username);
  res.status(200).json({status: 'Clé publique enregistrée'});
});

app.get('/users/key/:username', verifyToken, (req, res) => {
  const me = req.params.username;
  const my_public_key = db.prepare('SELECT public_key FROM users WHERE username = ?').get(me);

  res.status(200).json({status: 'Clé publique utilisateur récupérée', public_key: my_public_key})
})

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
