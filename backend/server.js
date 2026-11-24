import express from "express";

import { fileURLToPath } from "node:url";

const rota = 3000

const publicacoes = [
    { id: 1, titulo: "Artigo A", conteudo: "Texto A" },
    { id: 2, titulo: "Artigo B", conteudo: "Texto B" }
];


let proximoId = 3;

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


app.get("/api/publicacoes", function(req, res) {
    res.json(publicacoes)
});

app.post("/api/publicacoes", function(req, res) {
    const novaPublicacao = {
    id: proximoId,
    titulo: req.body.titulo,
    conteudo: req.body.conteudo
};
    if (!novaPublicacao.titulo || !novaPublicacao.conteudo) {
    return res.status(400).json({
        erro: "Título e conteúdo são obrigatórios."
    });
};
    proximoId++;
    publicacoes.push(novaPublicacao);
    res.json(novaPublicacao);
    res.status(201).json(novaPublicacao)
});
app.get("/api/publicacoes/:id", function(req, res) {
    const id = Number(req.params.id);
    const publicacao = publicacoes.find(function(item) {
        return item.id === id;
    });

    if (!publicacao) {
    return res.status(404).json({
        erro: "Publicação não encontrada."
    });
}
    res.json(publicacao);

});

app.put("/api/publicacoes/:id", function(req, res) {
    const id = Number(req.params.id);
    const publicacao = publicacoes.find(function(item) {
        return item.id === id;
    });
    if (!publicacao) {
        return res.status(404).json({
            erro: "Publicação não encontrada."
        });
    }

    if (!req.body.titulo || !req.body.conteudo) {
    return res.status(400).json({
        erro: "Título e conteúdo são obrigatórios."
    });
}
    publicacao.titulo = req.body.titulo;
    publicacao.conteudo = req.body.conteudo;
    res.json(publicacao);

});


app.delete("/api/publicacoes/:id", function(req, res) {
    const id = Number(req.params.id);
    const indice = publicacoes.findIndex(function(item) {
        return item.id === id;
    });

    if (indice === -1) {
        return res.status(404).json({
            erro: "Publicação não encontrada."
        });
    }
    publicacoes.splice(indice, 1);
    res.json({
        mensagem: "Publicação excluída com sucesso!"
    });

});
app.get("/gerenciador.html", function(req, res) {
    res.sendFile(
        fileURLToPath(new URL("../gerenciador.html", import.meta.url))
    );
});

app.listen(rota, function() {
    console.log("Servidor rodando na porta 3000!");
});