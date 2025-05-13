import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {inserisci} from "../../schemas/utenti/inserisci";
import {IUtente} from "../../@types/interface/utente";
import {getUtente} from "../../controller/utenti";

enum Errore {
    GENERICO = 'ERR_LOG_LOGIN_1'
}


export default async function (fastify: FastifyInstance) {
    fastify.post('/login', {
        schema: {
            tags: ['Utente'],
            description: 'Login',
            body: inserisci,
            response: {
                // '200': serializeResponseLogin
            }
        }
    }, async (request: FastifyRequest<{ Body: IUtente }>, reply: FastifyReply) => {
        try {
            const response = await getUtente(request.body)
            return reply.status(200).send(new ResponseApi(response));
        } catch (error){
            return fastify.errorResponse(reply,error,Errore.GENERICO)
        }
    })
};
