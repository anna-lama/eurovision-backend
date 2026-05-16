import { AppDataSource } from "../data-source";
import { Competizione } from "../models/entity/Competizione";
import ErrorApi from "../@types/interface/errorApi";
import { Utente } from "../models/entity/Utente";
import { ICompetizione } from "../@types/interface/competizione";

/**
 * Lista competizioni
 */
export async function getListaCompetizioniAperte(userID: number) {
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
        .where('competizione.closed = :closed', { closed: false })
        .andWhere(`
            NOT EXISTS (
                SELECT 1
                FROM punteggi punteggio
                INNER JOIN esibizioni esibizione
                    ON esibizione.id = punteggio."esibizioneId"
                WHERE punteggio."utenteId" = :utenteId
                    AND esibizione."competizioneId" = competizione.id
            )
        `, { utenteId: userID })
        .orderBy('competizione.anno', 'DESC')
        .getMany();
}

export async function getListaCompetizioniAdmin() {
    return await AppDataSource
        .getRepository(Competizione)
        .createQueryBuilder('competizione')
        .orderBy('competizione.anno', 'DESC')
        .addOrderBy('competizione.id', 'DESC')
        .getMany();
}

export async function creaCompetizione(data: ICompetizione) {
    const nome = data.nome.trim();

    if (!nome) {
        throw new ErrorApi(
            "Il nome della competizione è obbligatorio",
            400,
            "NOME_COMPETIZIONE_OBBLIGATORIO"
        );
    }

    const competizioneRepo = AppDataSource.getRepository(Competizione);
    const nuovaCompetizione = competizioneRepo.create({
        nome,
        anno: data.anno,
        citta: normalizeNullableString(data.citta),
        paeseOspitante: normalizeNullableString(data.paeseOspitante),
        closed: data.closed ?? false,
        abilitaTotale: data.abilitaTotale ?? false
    });

    return await competizioneRepo.save(nuovaCompetizione);
}

export async function cambiaAbilitaTotaleCompetizione(
    competizioneID: number,
    abilitaTotale: boolean
) {
    const competizioneRepo = AppDataSource.getRepository(Competizione);
    const competizione = await competizioneRepo.findOneBy({
        id: competizioneID
    });

    if (!competizione) {
        throw new ErrorApi(
            "Competizione non trovata",
            404,
            "COMPETIZIONE_NON_TROVATA"
        );
    }

    await competizioneRepo.update(
        { id: competizioneID },
        { abilitaTotale }
    );

    return 'ok';
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
        .where('punteggio."utenteId" = :utenteId', {
            utenteId: userID
        })
        .distinct(true)
        .orderBy('competizione.anno', 'DESC')
        .getMany();
}

function normalizeNullableString(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
}
