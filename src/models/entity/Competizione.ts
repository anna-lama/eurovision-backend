import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Esibizione } from "./Esibizione";


@Entity({ name: "competizioni" })
export class Competizione {
    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column('varchar')
    nome!: string  // es. "Eurovision 2024", "Eurovision 2025"

    @Column('integer')
    anno!: number

    @Column('varchar', { nullable: true })
    citta!: string | null

    @Column('varchar', { nullable: true })
    paeseOspitante!: string | null

    @OneToMany(() => Esibizione, (esibizione) => esibizione.competizione)
    esibizioni!: Esibizione[];
}