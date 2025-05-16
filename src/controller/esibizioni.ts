import { DataSource } from "typeorm";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import ormconfig from "../ormConfig";
import {Esibizione} from "../models/entity/Esibizione";
import {AppDataSource} from "../index";

const AppDataSourceScript = new DataSource(ormconfig);

export async function importaScaletta() {
    const checkInsert = await AppDataSource.getRepository(Esibizione)
        .count()
    if (checkInsert === 0) {

        await AppDataSourceScript.initialize();
        const queryRunner = AppDataSourceScript.createQueryRunner();

        const sqlFilePath = resolve(__dirname, '../sql/scaletta.sql');

        try {
            if (!existsSync(sqlFilePath)) {
                console.log('❌ Il file SQL non esiste:', sqlFilePath);
                return;
            }

            const sql = readFileSync(sqlFilePath, 'utf-8');

            await queryRunner.startTransaction();
            await queryRunner.query(sql); // Usa queryRunner per la transazione
            await queryRunner.commitTransaction();

            console.log("✅ Query eseguita correttamente da esibizioni.sql");

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("❌ Errore durante l'esecuzione della query:", error);

        } finally {
            await queryRunner.release();
            await AppDataSourceScript.destroy();
        }
    }
}


