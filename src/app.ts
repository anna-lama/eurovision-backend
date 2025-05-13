import fastify from "fastify";
import dotenv from 'dotenv';
import 'reflect-metadata';

// Carica le variabili d'ambiente in base all'ambiente corrente
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else {
  dotenv.config({ path: '.env.production' });
}

const server = fastify({
  // Logger only for production
  logger: process.env.NODE_ENV !== "development",
});

export default server;
