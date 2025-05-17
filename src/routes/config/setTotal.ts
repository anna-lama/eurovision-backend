import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {AppDataSource} from "../../index";
import {Config} from "../../models/entity/Config";

enum Errore {
    GENERICO = 'ERR_LOG_LOGIN_1'
}
export default async function (fastify: FastifyInstance) {
    fastify.patch('/change', {
        schema: {
            tags: ['Config'],
            description: 'Abilita la possibilità di calcolare la classifica totale',
            response: {
                // '200': serializeResponseLogin
            }
        }
    }, async (request: FastifyRequest<{ Querystring: {total : boolean} }>, reply: FastifyReply) => {
        try {
            await AppDataSource.getRepository(Config).update({id: 1},{ abilitaTotale :request.query.total as boolean})
            return reply.status(200).send(new ResponseApi('ok'));
        } catch (error){
            return fastify.errorResponse(reply,error,Errore.GENERICO)
        }
    })
};
