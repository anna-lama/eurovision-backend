import S from "fluent-json-schema";

export const inserisci = S.object()
    .prop('nome', S.string().minLength(1).required())
    .prop('anno', S.integer().minimum(1900).maximum(2100).required())
    .prop('citta', S.string().raw({ nullable: true }))
    .prop('paeseOspitante', S.string().raw({ nullable: true }))
    .prop('closed', S.boolean())
    .prop('abilitaTotale', S.boolean())
