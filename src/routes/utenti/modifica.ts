import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {IBodyModifica, IBodyModificaPassword} from "../../@types/interface/utente";
import {modificaPasswordUtente, modificaUtente} from "../../controller/utenti";
import S from "fluent-json-schema";

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
