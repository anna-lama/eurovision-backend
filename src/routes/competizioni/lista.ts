import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import ResponseApi from "../../@types/responseApi";
import {
    cambiaAbilitaTotaleCompetizione,
    getListaCompetizioniAdmin,
    getListaCompetizioniAperte
} from "../../controller/competizioni";

export default async function (fastify: FastifyInstance) {

    fastify.get('/', async (
        _request: FastifyRequest,
        reply: FastifyReply
    ) => {
        try {
            const response = await getListaCompetizioniAdmin();
            return reply.status(200).send(new ResponseApi(response));
        } catch (error) {
            return fastify.errorResponse(reply, error, 'ERR_COMPETIZIONI');
        }
    });

    fastify.get('/aperte/:utente', async (
        request: FastifyRequest<{
            Params: {
                utente: number
            }
        }>,
        reply: FastifyReply
    ) => {
        try {
            const response = await getListaCompetizioniAperte(
                Number(request.params.utente)
            );
            return reply.status(200).send(new ResponseApi(response));
        } catch (error) {
            return fastify.errorResponse(reply, error, 'ERR_COMPETIZIONI');
        }
    });

    fastify.patch('/:competizione/totale', async (
        request: FastifyRequest<{
            Params: {
                competizione: number
            },
            Body: {
                abilitaTotale: boolean
            }
        }>,
        reply: FastifyReply
    ) => {
        try {
            const response = await cambiaAbilitaTotaleCompetizione(
                request.params.competizione,
                request.body.abilitaTotale
            );
            return reply.status(200).send(new ResponseApi(response));
        } catch (error) {
            return fastify.errorResponse(reply, error, 'ERR_COMPETIZIONE_TOTALE');
        }
    });

} 
