const campoTitulo = document.querySelector("#titulo");
const campoConteudo = document.querySelector("#conteudo");
const formulario = document.querySelector("#form-publicacao");
const listaPublicacoes = document.querySelector("#lista-publicacoes");
const botaoPublicar = formulario.querySelector('button[type="submit"]');
const botaoCancelar = document.querySelector("#btn-cancelar");


let publicacaoEmEdicao = null
let artigoEmEdicao = null

async function obterTokenCsrf() {
    const resposta = await fetch("/api/csrf");

    if (!resposta.ok) {
        throw new Error("Não foi possível obter o token CSRF.");
    }

    const dados = await resposta.json();

    return dados.csrfToken;
}

function exibirPublicacao(publicacao) {



    const novoArtigo = document.createElement("article");
    const tituloArtigo = document.createElement("h3");
    const conteudoArtigo = document.createElement("p");

    tituloArtigo.textContent = publicacao.titulo;
    conteudoArtigo.textContent = publicacao.conteudo;

    novoArtigo.appendChild(tituloArtigo);
    novoArtigo.appendChild(conteudoArtigo);

    const botaoEditar = document.createElement("button");

    botaoEditar.textContent = "Editar";
    botaoEditar.type = "button";

    botaoEditar.addEventListener("click", function () {

        if (botaoPublicar.disabled) {
            return;
        }
        publicacaoEmEdicao = publicacao;
        artigoEmEdicao = novoArtigo;

        campoTitulo.value = publicacao.titulo;
        campoConteudo.value = publicacao.conteudo;

        botaoPublicar.textContent = "Salvar alterações";
        botaoCancelar.hidden = false;
    });


    novoArtigo.appendChild(botaoEditar);

    const botaoExcluir = document.createElement("button");

    botaoExcluir.textContent = "Excluir";
    botaoExcluir.type = "button";

    botaoExcluir.addEventListener("click", async function () {
        if (botaoPublicar.disabled) {
            return;
        }

        const confirmar = confirm("Tem certeza que deseja excluir este artigo?");

        if (!confirmar) {
            return;
        }

        try {
            const csrfToken = await obterTokenCsrf();

            const resposta = await fetch(
                `/api/publicacoes/${publicacao.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "X-CSRF-Token": csrfToken
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível excluir o artigo.");
            }

            novoArtigo.remove();

            if (publicacaoEmEdicao === publicacao) {
                cancelarEdicao();
            }

        } catch (erro) {
            console.error("Erro ao excluir:", erro);
            alert("Não foi possível excluir o artigo. Tente novamente.");
        }
    });

    novoArtigo.appendChild(botaoExcluir);

    listaPublicacoes.appendChild(novoArtigo);
}

function cancelarEdicao() {
    publicacaoEmEdicao = null;
    artigoEmEdicao = null;

    formulario.reset();

    botaoPublicar.textContent = "Publicar artigo";
    botaoCancelar.hidden = true;
}

botaoCancelar.addEventListener("click", function () {

    cancelarEdicao();

});

formulario.addEventListener("submit", async function (evento) {


    evento.preventDefault();
    if (botaoPublicar.disabled) {
        return;
    }

    botaoPublicar.disabled = true;
    botaoCancelar.disabled = true;
    botaoPublicar.textContent =
        publicacaoEmEdicao !== null ? "Salvando..." : "Publicando...";


    if (publicacaoEmEdicao !== null) {
        try {
            const csrfToken = await obterTokenCsrf();

            const resposta = await fetch(
                `/api/publicacoes/${publicacaoEmEdicao.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfToken
                    },
                    body: JSON.stringify({
                        titulo: campoTitulo.value,
                        conteudo: campoConteudo.value
                    })
                }
            );

            if (!resposta.ok) {
                const dadosErro = await resposta.json();

                throw new Error(dadosErro.erro);
            }

            const publicacaoAtualizada = await resposta.json();

            publicacaoEmEdicao.titulo = publicacaoAtualizada.titulo;
            publicacaoEmEdicao.conteudo = publicacaoAtualizada.conteudo;

            artigoEmEdicao.querySelector("h3").textContent =
                publicacaoAtualizada.titulo;

            artigoEmEdicao.querySelector("p").textContent =
                publicacaoAtualizada.conteudo;

            cancelarEdicao();

        } catch (erro) {
            console.error("Erro ao editar:", erro);

            alert(erro.message);
        } finally {
            botaoPublicar.disabled = false;
            botaoCancelar.disabled = false;

            botaoPublicar.textContent =
                publicacaoEmEdicao !== null
                    ? "Salvar alterações"
                    : "Publicar artigo";


        }

        return;
    }

    try {
        const csrfToken = await obterTokenCsrf();

        const resposta = await fetch("/api/publicacoes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken
            },
            body: JSON.stringify({
                titulo: campoTitulo.value,
                conteudo: campoConteudo.value
            })
        });

        if (!resposta.ok) {
            const dadosErro = await resposta.json();

            throw new Error(dadosErro.erro);
        }

        const novaPublicacao = await resposta.json();

        exibirPublicacao(novaPublicacao);

        formulario.reset();

    } catch (erro) {
        console.error("Erro ao publicar:", erro);

        alert(erro.message);
    } finally {
        botaoPublicar.disabled = false;
        botaoCancelar.disabled = false;
        botaoPublicar.textContent =
            publicacaoEmEdicao !== null
                ? "Salvar alterações"
                : "Publicar artigo";
    }
});




async function carregarPublicacoes() {
    try {
        const resposta = await fetch("/api/publicacoes");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar publicações.");
        }

        const dados = await resposta.json();

        dados.forEach(function (publicacao) {
            exibirPublicacao(publicacao);
        });

    } catch (erro) {
        console.error("Erro ao carregar artigos:", erro);

        listaPublicacoes.textContent =
            "Não foi possível carregar as publicações. Tente novamente.";
    }
}


const botaoSair = document.querySelector("#btn-sair");

botaoSair.addEventListener("click", async function () {
    try {
        const csrfToken = await obterTokenCsrf();

        const resposta = await fetch("/api/logout", {
            method: "POST",
            headers: {
                "X-CSRF-Token": csrfToken
            }
        });

        if (!resposta.ok) {
            throw new Error("Erro ao sair da conta");
        }

        window.location.replace("/login.html");

    } catch (erro) {
        console.error("Erro no logout:", erro);
        alert("Não foi possível sair da conta.");
    }
});

carregarPublicacoes();
