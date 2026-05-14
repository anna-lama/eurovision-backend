import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {listaUtenti, listaUtentiByCompetizione} from "../../controller/utenti";

enum Errore {
  GENERICO = 'ERR_LOG_LOGIN_1'
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/competizione/:competizione',
    async (request: FastifyRequest<{ Params: { competizione: number } }>, reply: FastifyReply) => {
    try {
      const response = await listaUtentiByCompetizione(request.params.competizione)
      return reply.status(200).send(new ResponseApi(response));
    } catch (error){
      return fastify.errorResponse(reply,error,Errore.GENERICO)
    }
  })

  fastify.get('/lista', {
    schema: {
      tags: ['Utenti'],
      description: 'Ottieni la lista degli utenti',
      response: {
        // '200': serializeResponseLogin
      }
    }
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await listaUtenti()
      return reply.status(200).send(new ResponseApi(response));
    } catch (error){
      return fastify.errorResponse(reply,error,Errore.GENERICO)
    }
  })
};
