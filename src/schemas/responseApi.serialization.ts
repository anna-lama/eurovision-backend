/*
Validation Response API
 */
import S from 'fluent-json-schema';

// Validazione dello scheletro delle Response
export default S.object()
.prop('error', S.boolean().default(false))
.prop('code', S.string().required().default(''))
.prop('msg', S.string().required().default('ok'))
.prop('data').raw({ nullable: true });
