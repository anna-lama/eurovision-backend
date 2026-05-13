import { AppDataSource } from "../data-source";
import { Competizione } from "../models/entity/Competizione";
import ErrorApi from "../@types/interface/errorApi";
import { Utente } from "../models/entity/Utente";

/**
 * Lista competizioni
 */
export async function getListaCompetizioniAperte() {
    return await AppDataSource
        .getRepository(Competizione)
        .createQueryBuilder('competizione')
        .where('competizione.closed = :closed', { closed: false })
        .orderBy('competizione.anno', 'DESC')
        .getMany();
}

export async function getCompetizioniByUtente(userID: number) {
    const utenteRepo = AppDataSource.getRepository(Utente);

    const utente = await utenteRepo.findOneBy({ id: userID });

    if (!utente) {
        throw new ErrorApi(
            "Utente non trovato",
            404,
            "UTENTE_NON_TROVATO"
        );
    }

    return await AppDataSource
        .getRepository(Competizione)
        .createQueryBuilder('competizione')
        .innerJoin('competizione.esibizioni', 'esibizione')
        .innerJoin('esibizione.punteggi', 'punteggio')
        .where('punteggio.utente = :utenteId', {
            utenteId: userID
        })
        .distinct(true)
        .orderBy('competizione.anno', 'DESC')
        .getMany();
}

