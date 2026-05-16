import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import ResponseApi from "../../@types/responseApi";
import { getCompetizioniByUtente } from "../../controller/competizioni";
import { registraUtenteACompetizione } from "../../controller/utenti";

export default async function (fastify: FastifyInstance) {
fastify.get('/utente/:utente', async (
    request: FastifyRequest<{
        Params: {
            utente: number
        }
    }>,
    reply: FastifyReply
) => {
    try {
        const response = await getCompetizioniByUtente(
            request.params.utente
        );

        return reply
            .status(200)
            .send(new ResponseApi(response));

    } catch (error) {
        return fastify.errorResponse(
            reply,
            error,
            'ERR_COMPETIZIONI_UTENTE'
        );
    }
});

fastify.post('/:competizione/utente/:utente', async (
    request: FastifyRequest<{
        Params: {
            competizione: number,
            utente: number
        }
    }>,
    reply: FastifyReply
) => {
    try {

        const response = await registraUtenteACompetizione(
            request.params.utente,
            request.params.competizione
        );

        return reply
            .status(200)
            .send(new ResponseApi(response));

    } catch (error) {
        return fastify.errorResponse(
            reply,
            error,
            'ERR_ISCRIZIONE'
        );
    }
});
}