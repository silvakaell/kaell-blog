import express from "express";

const app = express();

app.use(express.json());

const rota = 3000

const publicacoes = [
    { id: 1, titulo: "Artigo A", conteudo: "Texto A" },
    { id: 2, titulo: "Artigo B", conteudo: "Texto B" }
];


let proximoId = 3;

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

    publicacao.titulo = req.body.titulo;
    publicacao.conteudo = req.body.conteudo;
    res.json(publicacao);

});

app.listen(rota, function() {
    console.log("Servidor rodando na porta 3000!");
});