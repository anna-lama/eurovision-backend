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

    @OneToMany(() => Punteggio, (punteggio) => punteggio.esibizione)
    punteggi!: Punteggio[];
}
