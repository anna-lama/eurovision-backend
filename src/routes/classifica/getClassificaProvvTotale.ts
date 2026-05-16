import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {calcolaClassificaTotale} from "../../controller/classifica";

enum Errore {
  GENERICO = 'ERR_LOG_LOGIN_1'
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/competizione/:competizione/totale',
    async (request: FastifyRequest<{ Params: { competizione : number} }>, reply: FastifyReply) => {
    try {
      const response = await calcolaClassificaTotale(request.params.competizione)
      return reply.status(200).send(new ResponseApi(response));
    } catch (error){
      return fastify.errorResponse(reply,error,Errore.GENERICO)
    }
  })
};
