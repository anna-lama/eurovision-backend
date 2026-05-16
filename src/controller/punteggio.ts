import {AppDataSource} from "../data-source";
import {IPunteggio} from "../@types/interface/punteggio";
import {Punteggio} from "../models/entity/Punteggio";
import {Utente} from "../models/entity/Utente";
import {Esibizione} from "../models/entity/Esibizione";
import ErrorApi from "../@types/interface/errorApi";
export async function aggiungiPunteggio (data : IPunteggio) {
    const punteggioRepo = AppDataSource.getRepository(Punteggio);
    const utenteRepo = AppDataSource.getRepository(Utente);
    const esibizioneRepo = AppDataSource.getRepository(Esibizione);
    const utente = await utenteRepo.findOneBy({id: data.utente});

    const esibizione = await esibizioneRepo.findOne({
        where: {id: data.esibizione},
        relations: ['competizione']
    });

    if (!utente || !esibizione) {
        throw new ErrorApi('L\'utente o l\'esibizione non sono stati trovati', 400, "DANNO ESTERNO")
    }

    if (esibizione.competizione?.abilitaTotale || esibizione.competizione?.closed) {
        throw new ErrorApi("La modifica non è abilitata", 400, "ERRORE_INSERIMENTO");
    }

    const esiste = await punteggioRepo.findOne({
        where: {
            utente: {id: data.utente},
            esibizione: {id: data.esibizione}
        }
    });

    if (esiste) {

        const totale = (data.canzone ?? 0) +
            (data.coreografia ?? 0) +
            (data.scenografia ?? 0) +
            (data.outfit ?? 0) +
            (data.interpretazione ?? 0);

        esiste.canzone = data.canzone;
        esiste.coreografia = data.coreografia;
        esiste.scenografia = data.scenografia;
        esiste.outfit = data.outfit;
        esiste.interpretazione = data.interpretazione;
        esiste.totale = totale;

        await punteggioRepo.save(esiste);

    } else {
        throw new ErrorApi("Errore nell'inserimento", 400, "ERRORE INSERIMENTO");
    }
}
