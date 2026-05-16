export interface ICompetizione {
    nome: string,
    anno: number,
    citta?: string | null,
    paeseOspitante?: string | null,
    closed?: boolean,
    abilitaTotale?: boolean
}
