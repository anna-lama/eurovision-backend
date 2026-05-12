import { AppDataSource } from "../data-source";
import { Competizione } from "../models/entity/Competizione";
import { Esibizione } from "../models/entity/Esibizione";
import ErrorApi from "../@types/interface/errorApi";

/**
 * Lista competizioni
 */
export async function getCompetitionsList() {
    return await AppDataSource
        .getRepository(Competizione)
        .createQueryBuilder('competizione')
        .orderBy('competizione.anno', 'DESC')
        .getMany();
}

/**
 * Lista esibizioni per competizione
 */
export async function getEsibizioniByCompetizione(
    competizioneID: number,
    userID: number
) {
    const competizioneRepo = AppDataSource.getRepository(Competizione);

    const competizione = await competizioneRepo.findOneBy({
        id: competizioneID
    });

    if (!competizione) {
        throw new ErrorApi(
            'La competizione non è stata trovata',
            400,
            'DANNO ESTERNO'
        );
    }

    const esibizioni = await AppDataSource
        .getRepository(Esibizione)
        .createQueryBuilder('esibizione')
        .leftJoinAndSelect('esibizione.punteggi', 'punteggio')
        .leftJoinAndSelect('esibizione.competizione', 'competizione')
        .where('competizione.id = :competizioneId', {
            competizioneId: competizioneID
        })
        .andWhere('punteggio.utente = :utenteId', {
            utenteId: userID
        })
        .orderBy('esibizione.id')
        .getMany();

    const esibizioniConTotaleEInCorso = esibizioni.map((x) => {
        const punteggio = x.punteggi[0];

        if (punteggio) {
            punteggio.totale =
                (punteggio.canzone ?? 0) +
                (punteggio.coreografia ?? 0) +
                (punteggio.scenografia ?? 0) +
                (punteggio.outfit ?? 0) +
                (punteggio.interpretazione ?? 0);
        }

        return {
            ...x,
            inCorso: false,
        };
    });

    const primaSenzaPunteggio = esibizioniConTotaleEInCorso.find(
        x =>
            x.punteggi[0]?.totale === 0 &&
            x.punteggi[0]?.canzone === null
    );

    if (primaSenzaPunteggio) {
        primaSenzaPunteggio.inCorso = true;
    }

    return esibizioniConTotaleEInCorso;
}