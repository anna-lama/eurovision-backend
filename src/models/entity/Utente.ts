import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Punteggio} from "./Punteggio";

@Entity({ name: "utenti" })
export class Utente {
    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column('varchar', {nullable: false, unique: true})
    nome!: string

    @Column('varchar', {nullable:true})
    pin!: string

    @OneToMany(() => Punteggio, (punteggio) => punteggio.utente)
    punteggi!: Punteggio[];

}
