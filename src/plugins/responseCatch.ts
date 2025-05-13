import {FastifyInstance, FastifyReply} from "fastify";
import fp from "fastify-plugin";
import ErrorApi from "../@types/interface/errorApi";
import {TokenExpiredError} from "jsonwebtoken";
import ResponseApi from "../@types/responseApi";


export default fp(async (server: FastifyInstance) => {
    server.decorate('errorResponse', async (reply: FastifyReply, error: Error|ErrorApi|any, code:string="Error_1",message:string='Errore generico'): Promise<any> =>{
        if(error instanceof ErrorApi){
            return reply.code(error.code).send(new ResponseApi(error.data, true,error.internalCode,error.message))
        } else if (error instanceof TokenExpiredError) {
            return reply.status(401).send(new ResponseApi(null, true,"token_scaduto", 'La sessione è scaduta'));
        } else if(error instanceof Error){
            return reply.code(500).send(new ResponseApi(null, true,code,error.message))
        } else{
            return reply.code(500).send(new ResponseApi(error, true,code,message))
        }
    })
})
