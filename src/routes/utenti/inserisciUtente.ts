import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {inserisci} from "../../schemas/utenti/inserisci";
import {IUtente} from "../../@types/interface/utente";
import {aggiungiUtente} from "../../controller/utenti";

enum Errore {
    GENERICO = 'ERR_LOG_LOGIN_1'
}


export default async function (fastify: FastifyInstance) {
    fastify.post('/add', {
        schema: {
            tags: ['Utente'],
            description: 'Aggiungere un utente',
            body: inserisci,
            response: {
                // '200': serializeResponseLogin
            }
        }
    }, async (request: FastifyRequest<{ Body: IUtente }>, reply: FastifyReply) => {
        try {
            const response = await aggiungiUtente(request.body)
            return reply.status(200).send(new ResponseApi(response));
        } catch (error){
            return fastify.errorResponse(reply,error,Errore.GENERICO)
        }
    })
};
