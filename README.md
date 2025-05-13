# 🚀 Fastify Backend API

Un backend RESTful realizzato con [Fastify](https://www.fastify.io/).

## 🛠️ Requisiti

- Node.js >= 18.x
- NPM

## 🚧 Installazione

```bash
git clone https://github.com/anna-lama/eurovision-backend.git
cd tuo-repo
npm install

```

## ⚙️ Configurazione

Crea un file `.env` nella root del progetto con le variabili necessarie, ad esempio:

```
NODE_ENV=development
FASTIFY_PORT=3000

#DATI ACCESSO DATABASE POSTGRES#
HOST_DB_SQL=
PORT_DB_SQL=
NAME_DB_SQL=
USERNAME_DB_SQL=
PASSWORD_DB_SQL=
```

## ▶️ Avvio del server

```bash
npm run dev

```

Il server partirà su `http://localhost:3000` (o sulla porta specificata).


## 📚 Documentazione API

La documentazione Swagger è su:

```
http://localhost:3000/docs
```
