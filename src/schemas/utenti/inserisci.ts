import S from "fluent-json-schema";

export const inserisci = S.object()
    .prop('nome', S.string().required())
    .prop('pin', S.string().minLength(4).required())
