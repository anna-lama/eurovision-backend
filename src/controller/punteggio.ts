import {AppDataSource} from "../index";
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

    const esibizione = await esibizioneRepo.findOneBy({id: data.esibizione});

    if (!utente || !esibizione) {
        throw new ErrorApi('L\'utente o l\'esibizione non sono stati trovati', 400, "DANNO ESTERNO")
    }

    const esiste = await punteggioRepo.findOne({
        where: {
            utente: { id: data.utente },
            esibizione: { id: data.esibizione }
        }
    });

    if (esiste) {

        const totale = (data.canzone ?? 0) +
            (data.coreografia ?? 0) +
            (data.scenografia ?? 0) +
            (data.outfit ?? 0) +
            (data.interpretazione ?? 0);

        // 🔁 Aggiorno il record esistente
        esiste.canzone = data.canzone;
        esiste.coreografia = data.coreografia;
        esiste.scenografia = data.scenografia;
        esiste.outfit = data.outfit;
        esiste.interpretazione = data.interpretazione;
        esiste.totale = totale;

        await punteggioRepo.save(esiste);

        if (await checkLastInsert(data.utente)){
            await utenteRepo.update({ id : data.utente}, {allInserted: true})
        }

    } else {
        throw new ErrorApi("Errore nell'inserimento", 400, "ERRORE INSERIMENTO");
    }
}

export async function checkLastInsert(userId : number){
    const countExibizioni = await AppDataSource.getRepository(Esibizione).count()

    const countPunteggi = await AppDataSource.createQueryBuilder(Punteggio, 'p')
        .leftJoin('p.utente', 'u')
        .where('u.id = :id', {id:userId})
        .andWhere('p.totale is not NULL')
        .getCount()

    return countPunteggi === countExibizioni;
}
