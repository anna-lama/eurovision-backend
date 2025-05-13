import { join } from 'path';
import {DataSourceOptions} from "typeorm/data-source/DataSourceOptions";

const port = process.env.PORT_DB_SQL !== undefined && process.env.PORT_DB_SQL !== null && !isNaN(+process.env.PORT_DB_SQL) ?  parseInt(process.env.PORT_DB_SQL)  :5432

const options: DataSourceOptions= {
  type: 'postgres',
  host: process.env.HOST_DB_SQL,
  port: port ,
  username: process.env.USERNAME_DB_SQL,
  password: process.env.PASSWORD_DB_SQL,
  database: process.env.NAME_DB_SQL,
  entities: [join(__dirname, '/models/entity/*.{js,ts}')],
  /*migrations: [join(__dirname, '/config/migrations/*.{js,ts}')],
  cli: {
   // migrationsDir: 'src/config/migrations'
  },*/
  synchronize: true,
  logging: false
};

export default options
