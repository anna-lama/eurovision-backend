import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {
    getEsibizioniByCompetizione
} from "../../controller/competitions";

export default async function (fastify: FastifyInstance) {
    fastify.get('/competitions/:competition/esibizioni/:utente', async (
        request: FastifyRequest<{
            Params: {
                competizione: number,
                utente: number
            }
        }>,
        reply: FastifyReply
    ) => {
        try {
            const response = await getEsibizioniByCompetizione(
                request.params.competizione,
                request.params.utente
            );

            return reply.status(200).send(new ResponseApi(response));
        } catch (error) {
            return fastify.errorResponse(reply, error, 'ERR_ESIBIZIONI');
        }
    });
}