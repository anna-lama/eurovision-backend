import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {calcolaClassificaPersonale} from "../../controller/classifica";

enum Errore {
  GENERICO = 'ERR_LOG_LOGIN_1'
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/:utente', {
    schema: {
      tags: ['Classifica'],
      description: 'Classifica Provvisoria: punteggi raccolti finora',
      // response: classificaPersonaleResponseSchema.response
    }
  }, async (request: FastifyRequest<{ Params: { utente : number} }>, reply: FastifyReply) => {
    try {
      const response = await calcolaClassificaPersonale(request.params.utente)
      return reply.status(200).send(new ResponseApi(response));
    } catch (error){
      return fastify.errorResponse(reply,error,Errore.GENERICO)
    }
  })
};
