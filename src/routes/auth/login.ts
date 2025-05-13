import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {loginSchema} from "../../schemas/auth/loginSchema";
import ResponseApi from "../../@types/responseApi";

interface IBody {
  username: string
  password: string
}

enum Errore {
  GENERICO = 'ERR_LOG_LOGIN_1',
  CREDENZIALI_NON_VALIDE = 'ERR_LOG_LOGIN_2',
  SIGN_ERROR = 'ERR_LOG_LOGIN_3',
  USER_NOT_ENABLED = 'ERR_LOG_LOGIN_4'
}

export default async function (fastify: FastifyInstance) {
  fastify.post('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      tags: ['Utenti'],
      description: 'Chiamata per effettuare la login al sistema è ricevere il token utile per effettuare tutte el chiamate',
      body: loginSchema,
      response: {
        // '200': serializeResponseLogin
      }
    }
  }, async (request: FastifyRequest<{ Body: IBody }>, reply: FastifyReply) => {
    try {
      const test = request.body
      const token = await fastify.sign_auth({username: test.username},3600)
      return reply.status(200).send(new ResponseApi(token));
    } catch (error){
      return reply.status(500).send(new ResponseApi(error, true, Errore.GENERICO, 'Si è verificato un errore'));
    }
  })
};
