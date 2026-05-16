import {AppDataSource} from "../data-source";
import {Utente} from "../models/entity/Utente";
import ErrorApi from "../@types/interface/errorApi";
import {IBodyModificaPassword, IUtente} from "../@types/interface/utente";
import { Competizione } from "../models/entity/Competizione";
import { Punteggio } from "../models/entity/Punteggio";
import { Esibizione } from "../models/entity/Esibizione";
import { PartecipazioneCompetizione } from "../models/entity/PartecipazioneCompetizione";

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
        .leftJoin(
            'utente.partecipazioniCompetizioni',
            'partecipazione',
            'partecipazione."competizioneId" = competizione.id'
        )
        .select('utente.id', 'id')
        .addSelect('utente.nome', 'nome')
        .addSelect('utente.pin', 'pin')
        .addSelect('COUNT(punteggio.id)', 'punteggiTotali')
        .addSelect('COUNT(punteggio.id) FILTER (WHERE punteggio.totale IS NOT NULL)', 'punteggiInseriti')
        .addSelect('COALESCE(partecipazione."esclusoTotale", false)', 'esclusoTotale')
        .where('competizione.id = :competizioneId', { competizioneId: competizioneID })
        .groupBy('utente.id')
        .addGroupBy('utente.nome')
        .addGroupBy('utente.pin')
        .addGroupBy('partecipazione.esclusoTotale')
        .orderBy('utente.nome', 'ASC')
        .getRawMany<{
            id: number,
            nome: string,
            pin: string | null,
            punteggiTotali: string,
            punteggiInseriti: string,
            esclusoTotale: boolean | string
        }>();

    return utenti.map((utente) => ({
        id: Number(utente.id),
        nome: utente.nome,
        pin: utente.pin,
        allInserted:
            esibizioniTotali > 0 &&
            Number(utente.punteggiTotali) === esibizioniTotali &&
            Number(utente.punteggiInseriti) === esibizioniTotali,
        esclusoTotale: utente.esclusoTotale === true || utente.esclusoTotale === 'true'
    }));
}

export async function modificaPasswordUtente(data: IBodyModificaPassword) {
    const utenteRepo = AppDataSource.getRepository(Utente);
    const utente = await utenteRepo.findOneBy({
        id: data.id
    });

    if (!utente) {
        throw new ErrorApi(
            "Utente non trovato",
            404,
            "UTENTE_NON_TROVATO"
        );
    }

    await utenteRepo.update(
        {
            id: data.id
        },
        {
            pin: data.pin
        }
    );
}

export async function promuoviAdminUtente(userID: number) {
    const utenteRepo = AppDataSource.getRepository(Utente);
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

    utente.isAdmin = true;

    return await utenteRepo.save(utente);
}

export async function aggiungiUtente(data: IUtente) {
    data.nome = data.nome.toUpperCase().trim();

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
    data.nome = data.nome.toUpperCase().trim();
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
    const partecipazioneRepo = AppDataSource.getRepository(PartecipazioneCompetizione);

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
    await partecipazioneRepo.save(
        partecipazioneRepo.create({
            utente,
            competizione,
            esclusoTotale: false
        })
    );

    return {
        message: 'Registrazione completata'
    };
}

export async function cambiaEsclusioneTotaleUtente(
    userID: number,
    competizioneID: number,
    esclusoTotale: boolean
) {
    const utenteRepo = AppDataSource.getRepository(Utente);
    const competizioneRepo = AppDataSource.getRepository(Competizione);
    const partecipazioneRepo = AppDataSource.getRepository(PartecipazioneCompetizione);

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

    let partecipazione = await partecipazioneRepo
        .createQueryBuilder('partecipazione')
        .leftJoinAndSelect('partecipazione.utente', 'utente')
        .leftJoinAndSelect('partecipazione.competizione', 'competizione')
        .where('utente.id = :utenteId', { utenteId: userID })
        .andWhere('competizione.id = :competizioneId', { competizioneId: competizioneID })
        .getOne();

    if (!partecipazione) {
        partecipazione = partecipazioneRepo.create({
            utente,
            competizione
        });
    }

    partecipazione.esclusoTotale = esclusoTotale;

    await partecipazioneRepo.save(partecipazione);

    return 'ok';
}
