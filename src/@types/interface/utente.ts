export interface IUtente{
    nome: string,
    pin : string
}

export interface IBodyEsclusioneTotale {
    esclusoTotale: boolean
}

export interface IBodyModificaPassword {
    id: number,
    pin: string
}
