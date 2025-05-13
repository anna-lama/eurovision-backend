import app from "./app";
import {DataSource} from "typeorm";
import ormconfig from "./ormConfig";
import autoLoad from "@fastify/autoload";
import {join} from "path";
import fastifyCors from '@fastify/cors';
import fastifySwagger from "@fastify/swagger";

const corsOptions = {
  origin: '*'
};
// Import it this way to benefit from TypeScript typings
import fastifyCron from 'fastify-cron'
export const AppDataSource = new DataSource(ormconfig)

const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 3006;
const start = async ():Promise<void> => {
  try {
    await createDB()
    await AppDataSource.initialize()

    await app.register(fastifySwagger),{
      routePrefix: '/docs',
      exposeRoute: true,
      swagger:{
        info:{
          title:'Blank',
          version: '1.0.0'
        },
        tags: [
          { name: 'Utenti', description: 'Gestione degli utenti' },
        ]
      }
    }

    await app.register(autoLoad, {
      dir: join(__dirname, 'plugins'),
      ignorePattern: /.*\.ignore.*/
    });

    // Middleware: Router
    // await app.register(router);

    //Registrazione dei CRON
    app.register(fastifyCron, {
      jobs: [
        // {
        // Only these two properties are required,
        // the rest is from the node-cron API:
        // https://github.com/kelektiv/node-cron#api
        //  cronTime: '0 0 * * *', // Everyday at midnight UTC

        // Note: the callbacks (onTick & onComplete) take the server
        // as an argument, as opposed to nothing in the node-cron API:
        //  onTick: async server => {
        //    await server.db.runSomeCleanupTask()
        //  }
        // }
      ]
    })

    // Carica automaticamente le rotte dalla cartella "routes"
    await app.register(autoLoad, {
      dir: join(__dirname, 'routes'),
      dirNameRoutePrefix: true // Specifica che voglio utilizzare il nome delle cartelle all'interno delle rotte (true) auth/login
    })

    app.register(fastifyCors,corsOptions);

    await app.listen({
      port: FASTIFY_PORT,
      host:'::',
      listenTextResolver: (address) => { return `Prometheus metrics server is listening at ${address}`}
    });
    app.cron.startAllJobs()
    console.log(`🚀  Fastify server running on port ${FASTIFY_PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
  }
}
start()



async function createDB(){
  const port = process.env.PORT_DB_SQL !== undefined && process.env.PORT_DB_SQL !== null && !isNaN(+process.env.PORT_DB_SQL) ?  parseInt(process.env.PORT_DB_SQL)  :5432
  const AppDataSourceDB = new DataSource({
    type: 'postgres',
    host: process.env.HOST_DB_SQL,
    port: port ,
    username: process.env.USERNAME_DB_SQL,
    password: process.env.PASSWORD_DB_SQL
  })

  await AppDataSourceDB.initialize()
  // Verifica l'esistenza del database
  const dbExists = await AppDataSourceDB.query(`SELECT 1 FROM pg_database WHERE datname='${process.env.NAME_DB_SQL}'`);

  if (dbExists.length === 0){
    await AppDataSourceDB.query(`CREATE DATABASE "${process.env.NAME_DB_SQL}"`)
    console.log(`🚀  database: CREATO CON SUCCESSO` )
  }
  else {
    console.log(`🚀  database: GIA ESISTENTE` )
  }
  await AppDataSourceDB.destroy()
}
