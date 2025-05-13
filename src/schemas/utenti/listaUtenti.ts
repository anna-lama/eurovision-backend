import S from 'fluent-json-schema';
import responseApiSerialization from "../responseApi.serialization";

const esibizioneSchema = S.object()
    .prop('id', S.integer())
    .prop('cantante', S.string())
    .prop('nazione', S.string())
    .prop('titolo', S.string())
    .additionalProperties(false);

const punteggioSchema = S.object()
    .prop('id', S.integer())
    .prop('canzone', S.integer())
    .prop('coreografia', S.integer())
    .prop('scenografia', S.integer())
    .prop('outfit', S.integer())
    .prop('interpretazione', S.integer())
    .prop('totale', S.integer())
    .prop('esibizione', esibizioneSchema);

export const classificaPersonaleResponseSchema = {
    response: {
        200: responseApiSerialization.prop('data', S.array().items(punteggioSchema))
    }
};
