const listaPublicacoesBlog = document.querySelector(
    "#lista-publicacoes-blog"
);

async function carregarPublicacoesBlog() {
    try {
        const resposta = await fetch("/api/publicacoes");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar publicações");
        }

        const publicacoes = await resposta.json();

        publicacoes.forEach(function(publicacao) {
            const artigo = document.createElement("article");

            const titulo = document.createElement("h3");
            const conteudo = document.createElement("p");

            const data = document.createElement("time");

                data.textContent = new Date(
                    publicacao.criado_em
                ).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "America/Fortaleza"
                });

            titulo.textContent = publicacao.titulo;
            const limiteResumo = 150;

                if (publicacao.conteudo.length > limiteResumo) {
                    conteudo.textContent =
                        publicacao.conteudo.slice(0, limiteResumo).trimEnd() + "...";
                } else {
                    conteudo.textContent = publicacao.conteudo;
                }

            const linkArtigo = document.createElement("a");

            linkArtigo.textContent = "Ler artigo →";
            linkArtigo.href = `/artigo.html?id=${publicacao.id}`;

            artigo.appendChild(titulo);
            artigo.appendChild(conteudo);
            artigo.appendChild(data);
            artigo.appendChild(linkArtigo);

            listaPublicacoesBlog.appendChild(artigo);
        });

    } catch (erro) {
        console.error("Erro ao carregar artigos:", erro);
    }
}

carregarPublicacoesBlog();