import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";     
import { IEsibizione } from '../../@types/interface/esibizione';
import { aggiungiScaletta } from '../../controller/esibizioni';

enum Errore {
  GENERICO = 'ERR_LOG_LOGIN_1'
}

export default async function (fastify: FastifyInstance) {
  fastify.post('/add', 
    async (request: FastifyRequest<{ Body: IEsibizione[] }>, reply: FastifyReply) => {
    try {
      const response = await aggiungiScaletta(request.body)
      return reply.status(200).send(new ResponseApi(response));
    } catch (error){
      return fastify.errorResponse(reply,error,Errore.GENERICO)
    }
  })
};
