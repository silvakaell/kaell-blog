
import { pool } from "./db.js";
import bcrypt from "bcryptjs";
import { input, password } from "@inquirer/prompts";

try {
    // Verifica se já existe um administrador
    const resultado = await pool.query(
        "SELECT COUNT(*) AS total FROM administradores"
    );

    const total = Number(resultado.rows[0].total);

    if (total > 0) {
        console.log("Já existe um administrador cadastrado.");
        console.log("Nenhuma alteração foi realizada.");
    } else {
        const usuario = (await input({
            message: "Escolha um nome de usuário:"
        })).trim();

        const senha = await password({
            message: "Escolha uma senha com pelo menos 12 caracteres:",
            mask: "*"
        });

        if (usuario.length < 3 || usuario.length > 80 || senha.length < 12) {
            throw new Error("Usuário ou senha não atendem aos requisitos.");
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        await pool.query(
            `INSERT INTO administradores (usuario, senha_hash)
             VALUES ($1, $2)`,
            [usuario, senhaHash]
        );

        console.log("Administrador criado com sucesso!");
    }

} catch (erro) {
    console.error("Erro:", erro.message);
    process.exitCode = 1;

} finally {
    await pool.end();
}
