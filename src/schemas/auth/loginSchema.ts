import S from 'fluent-json-schema'
import ResponseApiSerialization from "../responseApi.serialization";
export const loginSchema = S.object().additionalProperties(false)
.prop('username', S.string().required())
.prop('password', S.string().required())

export const serializeResponseLogin = ResponseApiSerialization.prop('data', S.object()
).raw({ nullable: true });

