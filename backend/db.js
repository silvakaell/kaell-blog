import dotenv from "dotenv";
import pg from "pg";
import { fileURLToPath } from "node:url";

dotenv.config({
    path: fileURLToPath(new URL("./.env", import.meta.url))
});

const { Pool } = pg;

const configuracao = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL
    }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

export const pool = new Pool(configuracao);