import { DataSource } from 'typeorm';
import ormconfig from './ormConfig';

export const AppDataSource = new DataSource(ormconfig);
