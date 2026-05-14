import {AppDataSource} from "../data-source";
import {Utente} from "../models/entity/Utente";
import ErrorApi from "../@types/interface/errorApi";
import {IBodyModifica, IUtente} from "../@types/interface/utente";
import { Competizione } from "../models/entity/Competizione";
import { Punteggio } from "../models/entity/Punteggio";
import { Esibizione } from "../models/entity/Esibizione";

export async function listaUtenti() {
    return AppDataSource.getRepository(Utente).find()
}

export async function listaUtentiByCompetizione(competizioneID: number) {
    const competizione = await AppDataSource.getRepository(Competizione).findOneBy({
        id: competizioneID
    });

    if (!competizione) {
        throw new ErrorApi(
            "Competizione non trovata",
            404,
            "COMPETIZIONE_NON_TROVATA"
        );
    }

    const esibizioniTotali = await AppDataSource.getRepository(Esibizione)
        .createQueryBuilder('esibizione')
        .leftJoin('esibizione.competizione', 'competizione')
        .where('competizione.id = :competizioneId', { competizioneId: competizioneID })
        .getCount();

    const utenti = await AppDataSource.getRepository(Utente)
        .createQueryBuilder('utente')
        .innerJoin('utente.punteggi', 'punteggio')
        .innerJoin('punteggio.esibizione', 'esibizione')
        .innerJoin('esibizione.competizione', 'competizione')
        .select('utente.id', 'id')
        .addSelect('utente.nome', 'nome')
        .addSelect('utente.pin', 'pin')
        .addSelect('COUNT(punteggio.id)', 'punteggiTotali')
        .addSelect('COUNT(punteggio.id) FILTER (WHERE punteggio.totale IS NOT NULL)', 'punteggiInseriti')
        .where('competizione.id = :competizioneId', { competizioneId: competizioneID })
        .groupBy('utente.id')
        .addGroupBy('utente.nome')
        .addGroupBy('utente.pin')
        .orderBy('utente.nome', 'ASC')
        .getRawMany<{
            id: number,
            nome: string,
            pin: string | null,
            punteggiTotali: string,
            punteggiInseriti: string
        }>();

    return utenti.map((utente) => ({
        id: Number(utente.id),
        nome: utente.nome,
        pin: utente.pin,
        allInserted:
            esibizioniTotali > 0 &&
            Number(utente.punteggiTotali) === esibizioniTotali &&
            Number(utente.punteggiInseriti) === esibizioniTotali
    }));
}

export async function modificaUtente(data :IBodyModifica) {
    await AppDataSource.getRepository(Utente).update(
        {
            id : data.id
        },
        {allInserted: data.value})
}

export async function aggiungiUtente(data: IUtente) {
    data.nome = data.nome.toUpperCase();

    const utenteRepo = AppDataSource.getRepository(Utente);

    const exists = await utenteRepo.findOneBy({
        nome: data.nome
    });

    if (exists) {
        throw new ErrorApi(
            "L'utente inserito è già registrato",
            403,
            "esiste già"
        );
    }

    const nuovoUtente = utenteRepo.create(data);

    return await utenteRepo.save(nuovoUtente);
}

export async function getUtente(data: IUtente) {
    data.nome = data.nome.toUpperCase()
    const utenteRepo = AppDataSource.getRepository(Utente);

    const user = await utenteRepo.findOneBy({nome: data.nome});
    if (!user) {
        throw new ErrorApi("L'utente inserito non è registrato", 403, "non esiste");
    }
    if (user.pin !== data.pin) {
        throw new ErrorApi("Il pin non è corretto", 403, "non esiste");
    }
    return user
}

export async function registraUtenteACompetizione(
    userID: number,
    competizioneID: number
) {
    const utenteRepo = AppDataSource.getRepository(Utente);
    const competizioneRepo = AppDataSource.getRepository(Competizione);
    const punteggioRepo = AppDataSource.getRepository(Punteggio);

    const utente = await utenteRepo.findOneBy({
        id: userID
    });

    if (!utente) {
        throw new ErrorApi(
            "Utente non trovato",
            404,
            "UTENTE_NON_TROVATO"
        );
    }

    const competizione = await competizioneRepo.findOne({
        where: { id: competizioneID },
        relations: ['esibizioni']
    });

    if (!competizione) {
        throw new ErrorApi(
            "Competizione non trovata",
            404,
            "COMPETIZIONE_NON_TROVATA"
        );
    }

    if (competizione.closed) {
        throw new ErrorApi(
            "La competizione è chiusa",
            400,
            "COMPETIZIONE_CHIUSA"
        );
    }

    /**
     * Verifica se già registrato
     */
    const esisteGia = await punteggioRepo
        .createQueryBuilder('punteggio')
        .leftJoin('punteggio.esibizione', 'esibizione')
        .where('punteggio."utenteId" = :utenteId', {
            utenteId: userID
        })
        .andWhere('esibizione."competizioneId" = :competizioneId', {
            competizioneId: competizioneID
        })
        .getOne();

    if (esisteGia) {
        throw new ErrorApi(
            "Utente già registrato alla competizione",
            400,
            "GIA_REGISTRATO"
        );
    }

    /**
     * Crea record punteggi vuoti
     */
    const punteggi = competizione.esibizioni.map((esibizione) => {
        const p = new Punteggio();

        p.utente = utente;
        p.esibizione = esibizione;

        p.canzone = null;
        p.coreografia = null;
        p.scenografia = null;
        p.outfit = null;
        p.interpretazione = null;
        p.totale = null;

        return p;
    });

    await punteggioRepo.save(punteggi);

    return {
        message: 'Registrazione completata'
    };
}
