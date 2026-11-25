const tituloArtigo = document.querySelector("#artigo-titulo");
const conteudoArtigo = document.querySelector("#artigo-conteudo");
const dataArtigo = document.querySelector("#artigo-data");

async function carregarArtigo() {
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    if (!id) {
        tituloArtigo.textContent = "Artigo não encontrado";
        return;
    }

    try {
        const resposta = await fetch(`/api/publicacoes/${id}`);

        if (!resposta.ok) {
            throw new Error("Artigo não encontrado");
        }

        const artigo = await resposta.json();

        tituloArtigo.textContent = artigo.titulo;
        conteudoArtigo.textContent = artigo.conteudo;
        dataArtigo.textContent = new Date(
                    artigo.criado_em
                ).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "America/Fortaleza"
                });

        document.title = `${artigo.titulo} | Meu Blog`;

    } catch (erro) {
        console.error(erro);
        tituloArtigo.textContent = "Artigo não encontrado";
    }
}

carregarArtigo();