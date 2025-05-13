import S from 'fluent-json-schema'
import ResponseApiSerialization from "../responseApi.serialization";
export const inserisci = S.object()
    .prop('utente', S.integer().minimum(1).required())
    .prop('esibizione', S.integer().minimum(1).required())
    .prop('canzone', S.integer().minimum(0).maximum(10).required())
    .prop('coreografia', S.integer().minimum(0).maximum(10).required())
    .prop('scenografia', S.integer().minimum(0).maximum(10).required())
    .prop('outfit', S.integer().minimum(0).maximum(10).required())
    .prop('interpretazione', S.integer().minimum(0).maximum(10).required())

export const serializeResponseLogin = ResponseApiSerialization.prop('data', S.object()
).raw({ nullable: true });

