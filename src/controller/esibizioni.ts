import { In } from "typeorm";

import {Esibizione} from "../models/entity/Esibizione";
import {AppDataSource} from "../data-source";
import { IEsibizione } from "../@types/interface/esibizione";
import { Competizione } from "../models/entity/Competizione";
import ErrorApi from "../@types/interface/errorApi";



export async function aggiungiScaletta(esibizioni: IEsibizione[]) {
    const esibizioneRepo = AppDataSource.getRepository(Esibizione);
    const competizioneRepo = AppDataSource.getRepository(Competizione);

    if (!esibizioni.length) {
        throw new ErrorApi(
            "Nessuna esibizione da inserire",
            400,
            "ESIBIZIONI_VUOTE"
        );
    }

    const competizioniIds = [...new Set(esibizioni.map((esibizione) => esibizione.competizione))];

    if (competizioniIds.some((competizioneId) => !competizioneId)) {
        throw new ErrorApi(
            "Competizione obbligatoria per ogni esibizione",
            400,
            "COMPETIZIONE_OBBLIGATORIA"
        );
    }

    const competizioni = await competizioneRepo.findBy({
        id: In(competizioniIds)
    });

    if (competizioni.length !== competizioniIds.length) {
        throw new ErrorApi(
            "Una o più competizioni non sono state trovate",
            404,
            "COMPETIZIONE_NON_TROVATA"
        );
    }

    const competizioniById = new Map(
        competizioni.map((competizione) => [competizione.id, competizione])
    );

    const nuoveEsibizioni = esibizioni.map((esibizione) => {
        return esibizioneRepo.create({
            cantante: esibizione.cantante,
            nazione: esibizione.nazione,
            titolo: esibizione.titolo,
            ordine: esibizione.ordine,
            competizione: competizioniById.get(esibizione.competizione)
        });
    });

    return await esibizioneRepo.save(nuoveEsibizioni);
}



