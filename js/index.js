const listaRecentes = document.querySelector("#lista-textos-recentes");

async function carregarTextosRecentes() {
    const resposta = await fetch("/api/publicacoes");

    const publicacoes = await resposta.json();

    const recentes = publicacoes.slice(0, 3);

    recentes.forEach(function(publicacao) {
        const artigo = document.createElement("article");
        const link = document.createElement("a");

        const data = document.createElement("time");

            data.dateTime = publicacao.criado_em;

            data.textContent = new Date(
                publicacao.criado_em
            ).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "America/Fortaleza"
            });

        link.textContent = publicacao.titulo;
        link.href = `/artigo.html?id=${publicacao.id}`;

        artigo.appendChild(link);
        artigo.appendChild(data);

        listaRecentes.appendChild(artigo);      
    });
}

carregarTextosRecentes();