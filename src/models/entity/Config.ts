import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "config" })
export class Config {
    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column('boolean', {default: false})
    abilitaTotale!: boolean

}
