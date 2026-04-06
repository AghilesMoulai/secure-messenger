# AghiMessenger

Une messagerie sécurisée expérimentale avec chiffrement de bout en bout (E2E), construite avec React, Node.js et SQLite.

## !!! Avertissements importants

Ce projet est **expérimental** et n'est pas destiné à un usage en production.

### Limitations connues

- **Chiffrement E2E** : Pour que le chiffrement fonctionne correctement, chaque utilisateur doit **vider son localStorage** avant de se connecter sur une nouvelle session ou un nouveau navigateur. Sinon les messages apparaîtront comme `[message illisible]`.

- **Messages hors ligne** : Les messages envoyés pendant qu'un utilisateur est déconnecté **ne sont pas notifiés**. L'utilisateur ne verra que les nouveaux messages envoyés après sa reconnexion dans une conversation active.

- **Perte des clés** : Si le localStorage est vidé, les anciens messages ne pourront plus être déchiffrés. Les clés cryptographiques sont stockées localement et ne peuvent pas être récupérées.

## Stack technique

- **Frontend** : React + Vite
- **Backend** : Node.js + Express
- **Base de données** : SQLite (better-sqlite3)
- **Auth** : JWT + bcrypt
- **Chiffrement** : TweetNaCl (chiffrement asymétrique)
- (indisponible) **Conteneurisation** : Docker + Docker Compose

## Fonctionnalités

- Inscription et connexion avec authentification JWT
- Mots de passe hashés avec bcrypt
- Messagerie privée unicast (conversations entre deux utilisateurs)
- Chiffrement E2E des messages
- Polling toutes les 3 secondes pour les nouveaux messages
- Persistance des données avec SQLite

## Lancer le projet

### Sans Docker

**Backend :**

```bash
cd backend
npm install
node server.js
```

**Frontend :**

```bash
npm install
npm run dev
```

### Avec Docker (indisponible pour le moment)

```bash
docker-compose up --build
```

L'app sera accessible sur `http://localhost`.

## Auteur

Aghiles MOULAI - projet réalisé dans le cadre d'un apprentissage du développement web full-stack.
