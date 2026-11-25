import express from "express";

import { fileURLToPath } from "node:url";

import { pool } from "./db.js";
import session from "express-session";

import connectPgSimple from "connect-pg-simple";

import bcrypt from "bcryptjs";

import { rateLimit } from "express-rate-limit";

import helmet from "helmet";

import { randomBytes } from "node:crypto";
const rota = Number(process.env.PORT) || 3000;
const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "upgrade-insecure-requests":
                process.env.NODE_ENV === "production" ? [] : null
        }
    }
}));

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.use("/css", express.static(
    fileURLToPath(new URL("../css/", import.meta.url))
));

app.use("/js", express.static(
    fileURLToPath(new URL("../js/", import.meta.url))
));



app.use(express.json());


const PostgreSQLStore = connectPgSimple(session);

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET não configurado!");
}

app.use(session({
    store: new PostgreSQLStore({
        pool: pool,
        createTableIfMissing: true
    }),

    secret: process.env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 2
    }
}));

const limitarLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        erro: "Muitas tentativas de login. Tente novamente em 15 minutos."
    }
});


app.get("/", function(req, res) {
    res.redirect("/index.html");
});

app.get("/index.html", function(req, res) {
    res.sendFile(
        fileURLToPath(new URL("../index.html", import.meta.url))
    );
});

app.get("/projetos.html", function(req, res) {
    res.sendFile(
        fileURLToPath(new URL("../projetos.html", import.meta.url))
    );
});

app.get("/sobre.html", function(req, res) {
    res.sendFile(
        fileURLToPath(new URL("../sobre.html", import.meta.url))
    );
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

app.post("/api/publicacoes", exigirAutenticacao, exigirCsrf, async function(req, res) {

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

app.post("/api/login", limitarLogin, async function(req, res) {
    const { usuario, senha } = req.body;

    if (typeof usuario !== "string" ||
        typeof senha !== "string" ||
        !usuario || !senha) {
        return res.status(400).json({
            erro: "Usuário e senha são obrigatórios."
        });
    }

    try {
        const resultado = await pool.query(
            "SELECT * FROM administradores WHERE usuario = $1",
            [usuario]
        );

        const administrador = resultado.rows[0];

        if (!administrador) {
            return res.status(401).json({
                erro: "Credenciais inválidas."
            });
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            administrador.senha_hash
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: "Credenciais inválidas."
            });
        }

        req.session.regenerate(function(erro) {
            if (erro) {
                return res.status(500).json({
                    erro: "Erro ao iniciar sessão."
                });
            }

            req.session.adminId = administrador.id;

            req.session.save(function(erro) {
                if (erro) {
                    return res.status(500).json({
                        erro: "Erro ao salvar sessão."
                    });
                }

                res.json({
                    mensagem: "Login realizado com sucesso!",
                    usuario: administrador.usuario
                });
            });
        });

    } catch (erro) {
        console.error("Erro no login:", erro);

        res.status(500).json({
            erro: "Erro interno no servidor."
        });
    }
});

app.post("/api/logout", exigirAutenticacao, exigirCsrf, function(req, res) {

    req.session.destroy(function(erro) {

        if (erro) {
            return res.status(500).json({
                erro: "Não foi possível encerrar a sessão."
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            mensagem: "Logout realizado com sucesso!"
        });
    });
});

app.get("/api/me", function(req, res) {

    if (!req.session.adminId) {
        return res.status(401).json({
            autenticado: false
        });
    }

    res.json({
        autenticado: true,
        adminId: req.session.adminId
    });

});



function exigirAutenticacao(req, res, next) {
    if (!req.session.adminId) {
        return res.status(401).json({
            erro: "Você precisa estar autenticado."
        });
    }

    next();
}

function exigirCsrf(req, res, next) {
    const tokenRecebido = req.get("X-CSRF-Token");
    const tokenEsperado = req.session.csrfToken;

    if (!tokenEsperado || !tokenRecebido ||
        tokenRecebido !== tokenEsperado) {

        return res.status(403).json({
            erro: "Token CSRF inválido ou ausente."
        });
    }

    next();
}

app.get("/api/csrf", exigirAutenticacao, function(req, res) {

    if (!req.session.csrfToken) {
        req.session.csrfToken = randomBytes(32).toString("hex");
    }

    res.set("Cache-Control", "no-store");

    res.json({
        csrfToken: req.session.csrfToken
    });
});
app.put("/api/publicacoes/:id", exigirAutenticacao, exigirCsrf, async function(req, res) {

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


app.delete("/api/publicacoes/:id", exigirAutenticacao, exigirCsrf, async function(req, res) {

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

    if (!req.session.adminId) {
        return res.redirect("/login.html");
    }

    res.sendFile(
        fileURLToPath(
            new URL("../gerenciador.html", import.meta.url)
        )
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

app.get("/login.html", function(req, res) {
    res.sendFile(
        fileURLToPath(
            new URL("../login.html", import.meta.url)
        )
    );
});


app.listen(rota, function() {
    console.log(`Servidor rodando na porta ${rota}!`);
});