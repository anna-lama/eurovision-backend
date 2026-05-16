import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Competizione} from "./Competizione";
import {Utente} from "./Utente";

@Unique(['utente', 'competizione'])
@Entity({ name: "partecipazioni_competizioni" })
export class PartecipazioneCompetizione {
    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column('boolean', { default: false })
    esclusoTotale!: boolean

    @ManyToOne(
        () => Utente,
        (utente) => utente.partecipazioniCompetizioni,
        { onDelete: 'CASCADE' }
    )
    utente!: Utente;

    @ManyToOne(
        () => Competizione,
        (competizione) => competizione.partecipazioniCompetizioni,
        { onDelete: 'CASCADE' }
    )
    competizione!: Competizione;
}
