import {AppDataSource} from "../data-source";
import {Punteggio} from "../models/entity/Punteggio";
import {Utente} from "../models/entity/Utente";
import {Esibizione} from "../models/entity/Esibizione";
import ErrorApi from "../@types/interface/errorApi";
import {Competizione} from "../models/entity/Competizione";
import {PartecipazioneCompetizione} from "../models/entity/PartecipazioneCompetizione";

interface Totale {
    votanti: number,
    classifica: Calcoli[]
}

interface Calcoli {
    esibizione: Esibizione,
    canzone: number,
    coreografia: number,
    scenografia: number,
    outfit: number,
    interpretazione: number,
    totale: number
}
export async function calcolaClassificaPersonale (userID : number, competizioneID?: number) {
    const punteggioRepo = AppDataSource.getRepository(Punteggio);
    const utenteRepo = AppDataSource.getRepository(Utente);

    const utente = await utenteRepo.findOneBy({id: userID});
    if (!utente) {
        throw new ErrorApi('L\'utente o l\'esibizione non sono stati trovati', 400, "DANNO ESTERNO")

    }
    const query = punteggioRepo
        .createQueryBuilder('punteggio')
        .leftJoinAndSelect('punteggio.esibizione', 'esibizione')
        .leftJoin('esibizione.competizione', 'competizione')
        .where('punteggio."utenteId" = :utenteId', { utenteId: userID });

    if (competizioneID) {
        await getCompetizioneOrThrow(competizioneID);
        query.andWhere('competizione.id = :competizioneId', {
            competizioneId: competizioneID
        });
    }

    const listaPunteggi = await query.getMany();

    const listaConTotali = listaPunteggi.map(p => {
        const totale =
            (p.canzone ?? 0) +
            (p.coreografia ?? 0) +
            (p.scenografia ?? 0) +
            (p.outfit ?? 0) +
            (p.interpretazione ?? 0);

        return {
            ...p,
            totale: Number(totale) || 0 // forza a numero sicuro
        };
    });

    return listaConTotali.sort((a, b) => b.totale - a.totale )
}


export async function calcolaClassificaTotale (competizioneID?: number) : Promise<Totale> {
    if (!competizioneID) {
        return { votanti : 100, classifica : []}
    }

    const competizione = await getCompetizioneOrThrow(competizioneID);
    if (!competizione.abilitaTotale) {
        return { votanti : 0, classifica : []}
    }

    const utentiCompletiIds = await getUtentiCompletiIds(competizioneID);
    if (!utentiCompletiIds.length) {
        return { votanti : 0, classifica : []}
    }

    const punteggiValidi = await AppDataSource.createQueryBuilder(Punteggio, 'p')
        .leftJoinAndSelect('p.esibizione', 'es')
        .leftJoinAndSelect('p.utente', 'u')
        .leftJoin('es.competizione', 'competizione')
        .where('competizione.id = :competizioneId', { competizioneId: competizioneID })
        .andWhere('u.id IN (:...utentiCompletiIds)', { utentiCompletiIds })
        .getMany()

    return {
        votanti : utentiCompletiIds.length,
        classifica: aggregaPunteggi(punteggiValidi).sort((a,b) => b.totale - a.totale)
    }
}

function aggregaPunteggi(punteggi: Punteggio[]):Calcoli[] {
    const mappa = new Map<number, Calcoli>();

    for (const p of punteggi) {
        const esibizione = p.esibizione;

        if (!mappa.has(esibizione.id)) {
            mappa.set(esibizione.id, {
                esibizione: p.esibizione,
                canzone: 0,
                coreografia: 0,
                scenografia: 0,
                outfit: 0,
                interpretazione: 0,
                totale: 0
            });
        }

        const agg = mappa.get(esibizione.id)!;
        agg.canzone += p.canzone ?? 0;
        agg.coreografia += p.coreografia ?? 0;
        agg.scenografia += p.scenografia ?? 0;
        agg.outfit += p.outfit  ?? 0;
        agg.interpretazione += p.interpretazione  ?? 0;
        agg.totale = agg.canzone + agg.coreografia + agg.scenografia + agg.outfit + agg.interpretazione;
    }

    return Array.from(mappa.values());
}

export async function getHomeList (userID : number, competizioneID?: number) {
    const utenteRepo = AppDataSource.getRepository(Utente);

    const utente = await utenteRepo.findOneBy({id: userID});
    if (!utente) {
        throw new ErrorApi('L\'utente non è stato trovato', 400, "DANNO ESTERNO")
    }
    if (competizioneID) {
        await getCompetizioneOrThrow(competizioneID);
    }

    const query = AppDataSource.getRepository(Esibizione)
        .createQueryBuilder('esibizione')
        .leftJoinAndSelect('esibizione.punteggi','punteggio')
        .leftJoin('esibizione.competizione', 'competizione')
        .where(
            'punteggio."utenteId" = :utenteId',
            { utenteId: userID }
        )
        .orderBy('esibizione.id');

    if (competizioneID) {
        query.andWhere('competizione.id = :competizioneId', {
            competizioneId: competizioneID
        });
    }

    const esibizioni = await query.getMany();

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

    const primaSenzaPunteggio = esibizioniConTotaleEInCorso.find(x => x.punteggi[0]?.totale === 0 && x.punteggi[0]?.canzone === null);
    if (primaSenzaPunteggio) {
        primaSenzaPunteggio.inCorso = true;
    }

    return esibizioniConTotaleEInCorso;
}

async function getCompetizioneOrThrow(competizioneID: number) {
    const competizione = await AppDataSource.getRepository(Competizione).findOneBy({
        id: competizioneID
    });

    if (!competizione) {
        throw new ErrorApi(
            "La competizione non è stata trovata",
            404,
            "COMPETIZIONE_NON_TROVATA"
        );
    }

    return competizione;
}

async function getUtentiCompletiIds(competizioneID: number) {
    const esibizioniTotali = await AppDataSource.getRepository(Esibizione)
        .createQueryBuilder('esibizione')
        .leftJoin('esibizione.competizione', 'competizione')
        .where('competizione.id = :competizioneId', { competizioneId: competizioneID })
        .getCount();

    if (esibizioniTotali === 0) {
        return [];
    }

    const utentiCompleti = await AppDataSource.createQueryBuilder(Punteggio, 'p')
        .select('u.id', 'id')
        .leftJoin('p.utente', 'u')
        .leftJoin('p.esibizione', 'es')
        .leftJoin('es.competizione', 'competizione')
        .leftJoin(
            PartecipazioneCompetizione,
            'partecipazione',
            'partecipazione."utenteId" = u.id AND partecipazione."competizioneId" = competizione.id'
        )
        .where('competizione.id = :competizioneId', { competizioneId: competizioneID })
        .andWhere('p.totale IS NOT NULL')
        .andWhere('(partecipazione.id IS NULL OR partecipazione."esclusoTotale" = false)')
        .groupBy('u.id')
        .having('COUNT(p.id) = :esibizioniTotali', { esibizioniTotali })
        .getRawMany<{ id: number }>();

    return utentiCompleti.map((utente) => Number(utente.id));
}
