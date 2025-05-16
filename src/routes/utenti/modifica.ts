import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {IBodyModifica} from "../../@types/interface/utente";
import { modificaUtente} from "../../controller/utenti";

enum Errore {
    GENERICO = 'ERR_LOG_LOGIN_1'
}

export default async function (fastify: FastifyInstance) {
    fastify.patch('/edit', {
        schema: {
            tags: ['Utente'],
            description: 'Modifica manuale del campo allInserted',
            response: {
                // '200': serializeResponseLogin
            }
        }
    }, async (request: FastifyRequest<{ Body: IBodyModifica }>, reply: FastifyReply) => {
        try {
            await modificaUtente(request.body)
            return reply.status(200).send(new ResponseApi('ok'));
        } catch (error){
            return fastify.errorResponse(reply,error,Errore.GENERICO)
        }
    })
};
