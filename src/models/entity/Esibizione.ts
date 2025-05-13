import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Punteggio} from "./Punteggio";

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

    @Column('integer', { nullable : true})
    canzone_totale!: number;

    @Column('integer', { nullable : true})
    coreografia_totale!: number;

    @Column('integer', { nullable : true})
    scenografia_totale!: number;

    @Column('integer', { nullable : true})
    outfit_totale!: number;

    @Column('integer', { nullable : true})
    interpretazione_totale!: number;

    @Column('integer', { nullable : true})
    totale_totale!: number;

    @OneToMany(() => Punteggio, (punteggio) => punteggio.esibizione)
    punteggi!: Punteggio[];
}
