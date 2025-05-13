import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Utente} from "./Utente";
import {Esibizione} from "./Esibizione";

@Unique(['utente', 'esibizione'])
@Entity({ name: "punteggi" })
export class Punteggio {
    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column('integer', {nullable:true})
    canzone!: number | null;

    @Column('integer', {nullable:true})
    coreografia!: number | null;

    @Column('integer', {nullable:true})
    scenografia!: number | null;

    @Column('integer', {nullable:true})
    outfit!: number | null;

    @Column('integer', {nullable:true})
    interpretazione!: number | null;

    @Column('integer', {nullable:true})
    totale!: number | null;

    @ManyToOne(() => Utente, (utente) => utente.punteggi, { onDelete: 'CASCADE' })
    utente!: Utente;

    @ManyToOne(() => Esibizione, (esibizione) => esibizione.punteggi, { onDelete: 'CASCADE' })
    esibizione!: Esibizione;
}
