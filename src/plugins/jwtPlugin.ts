import fp from 'fastify-plugin';
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import { verify, TokenExpiredError, JwtPayload } from 'jsonwebtoken';
import ResponseApi from '../@types/responseApi';
import {SignJWT} from "jose";

const expiresInDefault = '1h';

enum Errore {
  GENERICO = 'ERR_CHECK_AUTH_1',
  TOKEN_EXPIRED = 'ERR_CHECK_AUTH_2',
  TOKEN_NOT_FOUND = 'ERR_CHECK_AUTH_3',
  INVALID_TOKEN_TYPE = 'ERR_CHECK_AUTH_4'
}

interface IJwtPayload extends JwtPayload {
  id: string
}

export interface IReturnJwtPlugin {
  readonly success: boolean
  readonly err?: any
  readonly data: string
}

interface IResponseDecode {
  readonly success: boolean
  readonly err?: any
  readonly data: string
}

export default fp(async (server: FastifyInstance) => {
  // Decorate crea il jwt
  server.decorate('sign_auth', async (payload: JwtPayload, expiresIn: string | number = expiresInDefault): Promise<IReturnJwtPlugin> => {
    try {
      const secret = new TextEncoder().encode(process.env.SEED_TOKEN);
      const result = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(expiresIn)
        .sign(secret)
      // const result = sign(payload, process.env.SEED_TOKEN as string, {
      //   expiresIn: expiresIn
      // });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        data: 'Errore',
        err: error
      };
    }
  });
  // Decorate utilizzato sull'hook onRequest per eseguire la verifica del jwt
  // @ts-ignore
  server.decorate('check_auth', async (request: FastifyRequest, reply: FastifyReply): Promise<ResponseApi | void> => {
    try {
      if (request.headers.authorization == null)
        return new ResponseApi(null, true, Errore.TOKEN_NOT_FOUND, 'Token non presente');
      const [type, token] = request.headers.authorization.split(' ');
      if (type !== 'Bearer') {
        return new ResponseApi(null, true, Errore.INVALID_TOKEN_TYPE, 'Tipologia di token errata');
      }
      verify(token, process.env.SEED_TOKEN as string);
    } catch (error: any) {
      if (error instanceof TokenExpiredError) {
        return reply.status(200).send(new ResponseApi(null, true, Errore.TOKEN_EXPIRED, 'La sessione è scaduta'));
      }
      return reply.status(200).send(new ResponseApi(null, true, Errore.GENERICO, 'Token non valido'));
    }
  });
  // Decorate per ottenere le informazioni contenute nel token
  server.decorate('decode', (authorization: string): IResponseDecode => {
    try {
      const [type, token] = authorization.split(' ');
      if (type !== 'Bearer')
        return {
          success: false,
          data: 'Errore'
        };
      const result = verify(token, process.env.SEED_TOKEN as string) as IJwtPayload;
      return {
        success: true,
        data: result.id
      };
    } catch (error) {
      return {
        success: false,
        data: 'Errore',
        err: error
      };
    }
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    sign_auth: (payload: JwtPayload, expiresIn?: string | number) => Promise<IReturnJwtPlugin>
    check_auth: () => Promise<ResponseApi | void>
    decode: (token: string) => IResponseDecode
  }
}
