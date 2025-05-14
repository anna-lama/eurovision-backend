FROM node:lts-alpine

# cartella di lavoro
WORKDIR /usr/app

# copia i file di configurazione
COPY . .

# installa le dipendenze
RUN npm install

EXPOSE 3003

# esegui il server
CMD ["npm", "run", "dev"]
