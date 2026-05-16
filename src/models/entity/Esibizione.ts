import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Punteggio} from "./Punteggio";
import { Competizione } from "./Competizione";

@Entity({ name: "esibizioni" })
export class Esibizione {
    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column('varchar')
    cantante!: string

    @Column('varchar')
    nazione!: string

    @Column('varchar')
    titolo!: string

    @Column('integer', { nullable: true })
    ordine!: number | null

    @OneToMany(() => Punteggio, (punteggio) => punteggio.esibizione)
    punteggi!: Punteggio[];

    @ManyToOne(
      () => Competizione,
      (competizione) => competizione.esibizioni,
      { nullable: true } // importante per la migrazione iniziale
    )
    competizione!: Competizione | null;
}
