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
    
    botaoEditar.addEventListener("click", function() {
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

    botaoExcluir.addEventListener("click", async function() {

    const confirmar = confirm("Tem certeza que deseja excluir este artigo?");

    if (!confirmar) {
        return;
    }
    const csrfToken = await obterTokenCsrf();
    const resposta = await fetch(
        `/api/publicacoes/${publicacao.id}`,
        {
            method: "DELETE",
            headers: {
            "X-CSRF-Token": csrfToken,
        }
        }
    );

    if (!resposta.ok) {
        console.error("Erro ao excluir:", resposta.status);
        return;
    }

    novoArtigo.remove();

    if (publicacaoEmEdicao === publicacao) {
        cancelarEdicao();
    }
});

    novoArtigo.appendChild(botaoExcluir);

    listaPublicacoes.appendChild(novoArtigo);
}

function cancelarEdicao() {
    publicacaoEmEdicao = null;
    artigoEmEdicao = null;

    formulario.reset();

    botaoPublicar.textContent = "Publicar texto";
    botaoCancelar.hidden = true;
}

botaoCancelar.addEventListener("click", function() {

   cancelarEdicao();

});

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();
    botaoPublicar.textContent = "Publicar artigo";

   if (publicacaoEmEdicao !== null) {

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
        console.error("Erro ao editar:", resposta.status);
        return;
    }

    const publicacaoAtualizada = await resposta.json();

    publicacaoEmEdicao.titulo = publicacaoAtualizada.titulo;
    publicacaoEmEdicao.conteudo = publicacaoAtualizada.conteudo;

    artigoEmEdicao.querySelector("h3").textContent =
        publicacaoAtualizada.titulo;

    artigoEmEdicao.querySelector("p").textContent =
        publicacaoAtualizada.conteudo;

    cancelarEdicao();

    return;
}
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
        console.error("Erro ao publicar:", resposta.status);
        return;
    }

    const novaPublicacao = await resposta.json();

    exibirPublicacao(novaPublicacao);

    formulario.reset();
});

   


async function carregarPublicacoes() {
    try {
        const resposta = await fetch("/api/publicacoes");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar publicações.");
        }

        const dados = await resposta.json();

        dados.forEach(function(publicacao) {
            exibirPublicacao(publicacao);
        });

    } catch (erro) {
        console.error("Erro ao carregar artigos:", erro);

        listaPublicacoes.textContent =
            "Não foi possível carregar as publicações. Tente novamente.";
    }
}


const botaoSair = document.querySelector("#btn-sair");

botaoSair.addEventListener("click", async function() {
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
