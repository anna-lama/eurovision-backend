import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import { getHomeList} from "../../controller/classifica";

enum Errore {
    GENERICO = 'ERR_LOG_LOGIN_1'
}

export default async function (fastify: FastifyInstance) {
    fastify.get('/home/:utente', {
        schema: {
            tags: ['Classifica'],
            description: 'Lista Punteggi: punteggi raccolti finora',
            // response: classificaPersonaleResponseSchema.response
        }
    }, async (request: FastifyRequest<{ Params: { utente : number} }>, reply: FastifyReply) => {
        try {
            const response = await getHomeList(request.params.utente)
            return reply.status(200).send(new ResponseApi(response));
        } catch (error){
            return fastify.errorResponse(reply,error,Errore.GENERICO)
        }
    })
};
