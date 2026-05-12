import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {
    getCompetitionsList
} from "../../controller/competitions";

export default async function (fastify: FastifyInstance) {

    /**
     * GET competizioni
     */
    fastify.get('/competizioni', async (
        _request: FastifyRequest,
        reply: FastifyReply
    ) => {
        try {
            const response = await getCompetitionsList();
            return reply.status(200).send(new ResponseApi(response));
        } catch (error) {
            return fastify.errorResponse(reply, error, 'ERR_COMPETIZIONI');
        }
    });

}