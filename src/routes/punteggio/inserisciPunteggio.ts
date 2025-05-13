import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {IPunteggio} from "../../@types/interface/punteggio";
import {aggiungiPunteggio} from "../../controller/punteggio";
import {inserisci} from "../../schemas/punteggio/inserisci";

enum Errore {
  GENERICO = 'ERR_LOG_LOGIN_1'
}

export default async function (fastify: FastifyInstance) {
  fastify.post('/add', {
    schema: {
      tags: ['Punteggio'],
      description: 'Aggiungere il punteggio per l\'esibizione',
      body: inserisci,
      response: {
        // '200': serializeResponseLogin
      }
    }
  }, async (request: FastifyRequest<{ Body: IPunteggio }>, reply: FastifyReply) => {
    try {
      await aggiungiPunteggio(request.body)
      return reply.status(200).send(new ResponseApi('ok'));
    } catch (error){
      return fastify.errorResponse(reply,error,Errore.GENERICO)
    }
  })
};
