import {AppDataSource} from "../index";
import {Punteggio} from "../models/entity/Punteggio";
import {Utente} from "../models/entity/Utente";
import {Esibizione} from "../models/entity/Esibizione";
import ErrorApi from "../@types/interface/errorApi";

interface Calcoli {
    esibizione: Esibizione,
    canzone: number,
    coreografia: number,
    scenografia: number,
    outfit: number,
    interpretazione: number,
    totale: number
}
export async function calcolaClassificaPersonale (userID : number) {
    const punteggioRepo = AppDataSource.getRepository(Punteggio);
    const utenteRepo = AppDataSource.getRepository(Utente);

    const utente = await utenteRepo.findOneBy({id: userID});
    if (!utente) {
        throw new ErrorApi('L\'utente o l\'esibizione non sono stati trovati', 400, "DANNO ESTERNO")

    }
    const listaPunteggi = await punteggioRepo.find({
        where: {utente: {id: userID}},
        // order: {totale: "DESC"},
        relations: ['esibizione']  // opzionale: include anche i dati dell'esibizione
    });

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


export async function calcolaClassificaTotale () {
    const punteggioRepo = await AppDataSource.getRepository(Punteggio).find({
        relations:["esibizione"]
    });

    return aggregaPunteggi(punteggioRepo)

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

export async function getHomeList (userID : number) {
    const utenteRepo = AppDataSource.getRepository(Utente);

    const utente = await utenteRepo.findOneBy({id: userID});
    if (!utente) {
        console.error("Utente non trovato.");
        return null;
    }
    const esibizioni = await AppDataSource.getRepository(Esibizione)
        .createQueryBuilder('esibizione')
        .leftJoinAndSelect('esibizione.punteggi','punteggio')
        .where(
            'punteggio.utente = :utenteId',
            { utenteId: userID }
        )
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

    const primaSenzaPunteggio = esibizioniConTotaleEInCorso.find(x => x.punteggi[0].totale === 0 && x.punteggi[0].canzone === null);
    if (primaSenzaPunteggio) {
        primaSenzaPunteggio.inCorso = true;
    }

    return esibizioniConTotaleEInCorso;
}
