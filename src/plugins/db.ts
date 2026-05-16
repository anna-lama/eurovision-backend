import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { AppDataSource } from '../data-source';

export default fp(async (server: FastifyInstance) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    // Attach datasource to Fastify instance
    // @ts-ignore
    server.decorate('db', AppDataSource);

    server.addHook('onClose', async () => {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    });
  } catch (err) {
    // If DB fails to initialize, bubble up the error so Fastify fails fast
    throw err;
  }
});

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export interface FastifyInstance {
    db: import('typeorm').DataSource;
  }
}
