# AghiMessenger

Une messagerie sécurisée expérimentale avec chiffrement de bout en bout (E2E), construite avec React, Node.js et SQLite dans le cadre d'un apprentissage du développement web full-stack.

> **Projet expérimental** — Ne pas utiliser en production.

## Auteur

Aghiles MOULAI - projet réalisé dans le cadre d'un apprentissage du développement web full-stack, couvrant React, Node.js, SQLite, JWT, bcrypt et cryptographie asymétrique.

---

## Stack technique

- **Frontend** : React + Vite
- **Backend** : Node.js + Express
- **Base de données** : SQLite (better-sqlite3)
- **Authentification** : JWT + bcrypt
- **Chiffrement** : TweetNaCl (NaCl box - chiffrement asymétrique Curve25519)
- **Dérivation de clé** : PBKDF2 (Web Crypto API)
- **Conteneurisation (deploiment à venir)** : Docker + Docker Compose

---

## Fonctionnalités

- Inscription et connexion avec authentification JWT
- Mots de passe hashés avec bcrypt (10 rounds)
- Messagerie privée unicast (conversations entre deux utilisateurs)
- Chiffrement E2E des messages avec NaCl box
- Clé privée chiffrée avec le mot de passe et stockée sur le serveur
- Polling toutes les 3 secondes pour les nouveaux messages
- Persistance des données avec SQLite

---

## Sécurité

### Ce qui est implémenté

#### Authentification

- Les mots de passe sont **hashés avec bcrypt** (10 rounds) avant d'être stockés — même en cas de fuite de la base de données, les mots de passe restent protégés
- Les sessions sont gérées avec des **tokens JWT** qui expirent après 1 heure
- Toutes les routes sensibles (`/messages`, `/users`) sont protégées par un middleware de vérification du token

#### Chiffrement E2E

- Chaque utilisateur génère une **paire de clés asymétriques** (Curve25519) à l'inscription
- La **clé publique** est stockée sur le serveur
- La **clé privée** est chiffrée avec le mot de passe de l'utilisateur via PBKDF2 (100 000 itérations) avant d'être stockée sur le serveur
- Les messages sont chiffrés avec **NaCl box** — le serveur ne peut **jamais** lire le contenu des messages
- Chaque message utilise un **nonce aléatoire** unique pour éviter les attaques par répétition

#### Injections SQL

- Toutes les requêtes SQL utilisent des **paramètres liés** (`?`) via `better-sqlite3` — les injections SQL sont impossibles

#### Autres

- **CORS** configuré pour n'accepter que l'origine du frontend
- **Variables d'environnement** pour les secrets (SECRET_KEY, FRONTEND_URL) — jamais en dur dans le code
- React échappe automatiquement le contenu des messages — protection contre les attaques **XSS**

---

### Limitations et faiblesses connues

#### Clé privée liée au mot de passe

- Si un utilisateur **change son mot de passe**, sa clé privée devient inaccessible et les anciens messages ne peuvent plus être déchiffrés
- Solution future : implémenter un système de re-chiffrement de la clé privée lors du changement de mot de passe

#### Pas de rate limiting

- Il n'y a pas de limite sur le nombre de tentatives de connexion — un attaquant peut tenter une attaque **brute force**
- Solution future : implémenter `express-rate-limit`

#### Pas de refresh token

- Le token JWT expire après 1 heure et ne peut pas être invalidé avant expiration (pas de blacklist)
- Solution future : implémenter un système de refresh tokens et une blacklist Redis

#### Messages hors ligne

- Les messages envoyés pendant qu'un utilisateur est **déconnecté ne sont pas notifiés**
- L'utilisateur voit uniquement les messages échangés dans la conversation active
- Solution future : implémenter WebSockets pour les notifications en temps réel

#### sentCache local

- Le texte en clair des messages envoyés est mis en cache dans le **localStorage** pour l'affichage
- Si le localStorage est vidé, les messages envoyés s'affichent comme `[mon message]`
- Solution future : chiffrer aussi pour soi-même (double chiffrement)

#### Salt statique pour PBKDF2

- Le salt utilisé pour dériver la clé depuis le mot de passe est statique (`aghimessenger-salt`)
- Solution future : utiliser un salt aléatoire par utilisateur stocké en base

---

## Architecture de sécurité

```_
Utilisateur A                    Serveur                    Utilisateur B
     |                              |                              |
     |  inscription                 |                              |
     |----------------------------->|                              |
     |  génère paire de clés        |                              |
     |  chiffre clé privée          |                              |
     |  avec mot de passe           |                              |
     |----------------------------->| stocke clé publique          |
     |                              | stocke clé privée chiffrée   |
     |                              |                              |
     |  connexion                   |                              |
     |----------------------------->|                              |
     |<----------------------------- clé privée chiffrée           |
     |  déchiffre avec mot de passe |                              |
     |                              |                              |
     |  envoi message à B           |                              |
     |  récupère clé publique de B  |                              |
     |----------------------------->|                              |
     |<----------------------------- clé publique de B             |
     |  chiffre message avec        |                              |
     |  clé publique de B           |                              |
     |----------------------------->| stocke message chiffré       |
     |                              |----------------------------->|
     |                              |                  déchiffre avec
     |                              |                  clé privée de B
```

---

## Lancer le projet

### Prérequis

- Node.js 18+
- Docker (optionnel)

### Sans Docker

Backend :

```bash
cd backend
cp .env.example .env
npm install
node server.js
```

Frontend :

```bash
npm install
npm run dev
```

### Avec Docker (deploiment à venir)

```bash
docker-compose up --build
```

L'app sera accessible sur <http://localhost>

### Variables d'environnement (backend/.env)

```yml
SECRET_KEY=votre_clé_secrète_jwt_très_longue
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---
