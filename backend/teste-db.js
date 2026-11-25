import { pool } from "./db.js";

try {
    const resultado = await pool.query(
        "SELECT * FROM publicacoes"
    );

    console.log("Conexão realizada com sucesso!");
    console.table(resultado.rows);

} catch (erro) {
    console.error("Erro ao conectar ao banco:", erro.message);

} finally {
    await pool.end();
}