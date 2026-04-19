import app from "./app";
import autoLoad from "@fastify/autoload";
import { DataSource } from 'typeorm';
import { join } from "path";
import fastifyCors from '@fastify/cors';
import { importaScaletta } from "./controller/esibizioni";
import { Config } from "./models/entity/Config";


const corsOptions = {
  origin: '*'
};
// Plugins will initialize the shared DataSource (see src/data-source.ts)

const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 3006;
const start = async (): Promise<void> => {
  try {
    await createDB();

    // Register plugins (including DB plugin) first so they are available to subsequent code
    await app.register(autoLoad, {
      dir: join(__dirname, 'plugins'),
      ignorePattern: /.*\.ignore.*/
    });

    // At this point the DB plugin should have initialized the shared DataSource and
    // decorated Fastify with `db`.
    // @ts-ignore
    const db = (app as any).db as import('typeorm').DataSource;

    await db.getRepository(Config).insert({
      id: 1,
      abilitaTotale: false
    });

    await importaScaletta();

    // Carica automaticamente le rotte dalla cartella "routes"
    await app.register(autoLoad, {
      dir: join(__dirname, 'routes'),
      dirNameRoutePrefix: true // Specifica che voglio utilizzare il nome delle cartelle all'interno delle rotte (true) auth/login
    });

    await app.register(fastifyCors, corsOptions);

    await app.listen({
      port: FASTIFY_PORT,
      host: '::',
      listenTextResolver: (address) => { return `Prometheus metrics server is listening at ${address}` }
    });
    console.log(`🚀  Fastify server running on port ${FASTIFY_PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
  }
}
start()



async function createDB() {
  const port = process.env.PORT_DB_SQL !== undefined && process.env.PORT_DB_SQL !== null && !isNaN(+process.env.PORT_DB_SQL) ? parseInt(process.env.PORT_DB_SQL) : 5432
  const AppDataSourceDB = new DataSource({
    type: 'postgres',
    host: process.env.HOST_DB_SQL,
    port: port,
    username: process.env.USERNAME_DB_SQL,
    password: process.env.PASSWORD_DB_SQL
  })

  await AppDataSourceDB.initialize()
  // Verifica l'esistenza del database
  const dbExists = await AppDataSourceDB.query(`SELECT 1 FROM pg_database WHERE datname='${process.env.NAME_DB_SQL}'`);

  if (dbExists.length === 0) {
    await AppDataSourceDB.query(`CREATE DATABASE "${process.env.NAME_DB_SQL}"`)
    console.log(`🚀  database: CREATO CON SUCCESSO`)
  }
  else {
    console.log(`🚀  database: GIA ESISTENTE`)
  }
  await AppDataSourceDB.destroy()
}
