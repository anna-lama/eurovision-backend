import {AppDataSource} from "../index";
import {Utente} from "../models/entity/Utente";
import ErrorApi from "../@types/interface/errorApi";
import {IUtente} from "../@types/interface/utente";
import {Esibizione} from "../models/entity/Esibizione";
import {Punteggio} from "../models/entity/Punteggio";

export async function listaUtenti() {
    return AppDataSource.getRepository(Utente).find()
}

export async function aggiungiUtente(data: IUtente) {
    data.nome = data.nome.toUpperCase()

    const utenteRepo = AppDataSource.getRepository(Utente);
    const esibizioneRepo = AppDataSource.getRepository(Esibizione);
    const punteggioRepo = AppDataSource.getRepository(Punteggio);

    const esiste = await utenteRepo.findOneBy({ nome: data.nome });
    if (esiste) {
        throw new ErrorApi("L'utente inserito è già registrato", 403, "esiste già");
    }

    const nuovoUtente = utenteRepo.create(data);

    try {
        const utenteSalvato = await utenteRepo.save(nuovoUtente);
        const esibizioni = await esibizioneRepo.find();

        const punteggi = esibizioni.map((esibizione) => {
            const p = new Punteggio();
            p.utente = utenteSalvato;
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
        return utenteSalvato;

    } catch (error) {
        console.error("Errore durante il salvataggio dell'utente o dei punteggi:", error);
        return null;
    }

}
export async function getUtente(data: IUtente) {
    data.nome = data.nome.toUpperCase()
    const utenteRepo = AppDataSource.getRepository(Utente);

    const user = await utenteRepo.findOneBy({nome: data.nome});
    if (!user) {
        throw new ErrorApi("L'utente inserito non è registrato", 403, "non esiste");
    }
    return user
}

