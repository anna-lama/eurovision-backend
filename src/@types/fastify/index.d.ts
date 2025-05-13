import {FastifyReply} from "fastify";
import ErrorApi from "../interface/errorApi";

declare module 'fastify' {
    export interface FastifyInstance {

        // /**
        //  * Funzioni di autenticazione
        //  */
        // sign_auth: (payload: JwtPayload, expiresIn?: string | number, verticale?: boolean | undefined) => Promise<IReturnJwtPlugin>
        // check_auth: (request: FastifyRequest, reply: FastifyReply) => Promise<ResponseApi | void>
        // check_auth_verticale: (request: FastifyRequest, reply: FastifyReply) => Promise<ResponseApi | void>
        // decode: (token: string, verticale?: boolean) => IResponseDecode

        /**
         * Funzione di Response in caso di Catch
         */
        errorResponse: (reply: FastifyReply, error: Error | ErrorApi | any, code: string = 'Error_1', message: string = 'Errore generico') => Promise<void>

    }}
