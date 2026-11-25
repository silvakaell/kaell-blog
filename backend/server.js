import express from "express";

import { fileURLToPath } from "node:url";

import { pool } from "./db.js";

const rota = 3000

const app = express();

app.use("/css", express.static(
    fileURLToPath(new URL("../css/", import.meta.url))
));

app.use("/js", express.static(
    fileURLToPath(new URL("../js/", import.meta.url))
));

app.use(express.json());

app.get("/", function(req, res) {
    res.send("Olá! Meu servidor está funcionando!");
});

app.get("/sobre", function(req, res) {
    res.send("Olá! Sou eu");
});


app.get("/api/publicacoes", async function(req, res) {
    try {
        const resultado = await pool.query(
    "SELECT * FROM publicacoes ORDER BY criado_em DESC, id DESC"
);

        res.json(resultado.rows);

    } catch (erro) {
        console.error("Erro ao consultar PostgreSQL:", erro);

        res.status(500).json({
            erro: "Não foi possível buscar as publicações."
        });
    }
});

app.post("/api/publicacoes", async function(req, res) {

    const { titulo, conteudo } = req.body;

    if (!titulo || !conteudo) {
        return res.status(400).json({
            erro: "Título e conteúdo são obrigatórios."
        });
    }

    try {
        const resultado = await pool.query(
            `INSERT INTO publicacoes (titulo, conteudo)
             VALUES ($1, $2)
             RETURNING id, titulo, conteudo`,
            [titulo, conteudo]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (erro) {
        console.error("Erro ao cadastrar publicação:", erro);

        res.status(500).json({
            erro: "Não foi possível cadastrar a publicação."
        });
    }
});

app.get("/api/publicacoes/:id", async function(req, res) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: "ID inválido."
        });
    }

    try {
        const resultado = await pool.query(
            "SELECT * FROM publicacoes WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Publicação não encontrada."
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error("Erro ao buscar publicação:", erro);

        res.status(500).json({
            erro: "Não foi possível buscar a publicação."
        });
    }
});

app.put("/api/publicacoes/:id", async function(req, res) {

    const id = Number(req.params.id);
    const { titulo, conteudo } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: "ID inválido."
        });
    }

    if (!titulo || !conteudo) {
        return res.status(400).json({
            erro: "Título e conteúdo são obrigatórios."
        });
    }

    try {
        const resultado = await pool.query(
            `UPDATE publicacoes
             SET titulo = $1, conteudo = $2
             WHERE id = $3
             RETURNING id, titulo, conteudo`,
            [titulo, conteudo, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Publicação não encontrada."
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error("Erro ao editar publicação:", erro);

        res.status(500).json({
            erro: "Não foi possível editar a publicação."
        });
    }
});


app.delete("/api/publicacoes/:id", async function(req, res) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: "ID inválido."
        });
    }

    try {
        const resultado = await pool.query(
            `DELETE FROM publicacoes
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Publicação não encontrada."
            });
        }

        res.json({
            mensagem: "Publicação excluída com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao excluir publicação:", erro);

        res.status(500).json({
            erro: "Não foi possível excluir a publicação."
        });
    }
});
app.get("/gerenciador.html", function(req, res) {
    res.sendFile(
        fileURLToPath(new URL("../gerenciador.html", import.meta.url))
    );
});

app.get("/textos.html", function(req, res) {
    res.sendFile(
        fileURLToPath(
            new URL("../textos.html", import.meta.url)
        )
    );
});

app.get("/artigo.html", function(req, res) {
    res.sendFile(
        fileURLToPath(
            new URL("../artigo.html", import.meta.url)
        )
    );
});

app.listen(rota, function() {
    console.log("Servidor rodando na porta 3000!");
});