import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {
  cambiaEsclusioneTotaleUtente,
  listaUtenti,
  listaUtentiByCompetizione
} from "../../controller/utenti";
import {IBodyEsclusioneTotale} from "../../@types/interface/utente";

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

  fastify.put('/competizione/:competizione/:utente/escluso',
    async (request: FastifyRequest<{
      Params: {
        competizione: number,
        utente: number
      },
      Body: IBodyEsclusioneTotale
    }>, reply: FastifyReply) => {
      try {
        const response = await cambiaEsclusioneTotaleUtente(
          Number(request.params.utente),
          Number(request.params.competizione),
          request.body.esclusoTotale
        )
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
