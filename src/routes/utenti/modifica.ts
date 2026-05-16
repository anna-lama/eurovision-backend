import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {IBodyModificaPassword} from "../../@types/interface/utente";
import {modificaPasswordUtente, promuoviAdminUtente} from "../../controller/utenti";
import S from "fluent-json-schema";

enum Errore {
    GENERICO = 'ERR_LOG_LOGIN_1'
}

export default async function (fastify: FastifyInstance) {
    fastify.post('/admin/:utente', {
        schema: {
            tags: ['Utente'],
            description: 'Promuove un utente ad admin',
            response: {
                // '200': serializeResponseLogin
            }
        }
    }, async (request: FastifyRequest<{ Params: { utente: number } }>, reply: FastifyReply) => {
        try {
            const response = await promuoviAdminUtente(Number(request.params.utente))
            return reply.status(200).send(new ResponseApi(response));
        } catch (error){
            return fastify.errorResponse(reply,error,Errore.GENERICO)
        }
    })

    fastify.patch('/password', {
        schema: {
            tags: ['Utente'],
            description: 'Modifica la password di un utente',
            body: S.object()
                .prop('id', S.number().required())
                .prop('pin', S.string().minLength(4).required()),
            response: {
                // '200': serializeResponseLogin
            }
        }
    }, async (request: FastifyRequest<{ Body: IBodyModificaPassword }>, reply: FastifyReply) => {
        try {
            await modificaPasswordUtente(request.body)
            return reply.status(200).send(new ResponseApi('ok'));
        } catch (error){
            return fastify.errorResponse(reply,error,Errore.GENERICO)
        }
    })
};
