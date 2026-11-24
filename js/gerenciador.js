const campoTitulo = document.querySelector("#titulo");
const campoConteudo = document.querySelector("#conteudo");
const formulario = document.querySelector("#form-publicacao");
const listaPublicacoes = document.querySelector("#lista-publicacoes");
const botaoPublicar = formulario.querySelector('button[type="submit"]');
const botaoCancelar = document.querySelector("#btn-cancelar");

const publicacoes = [];
let publicacaoEmEdicao = null
let artigoEmEdicao = null

function exibirPublicacao(publicacao) {

    const novoArtigo = document.createElement("article");
    const tituloArtigo = document.createElement("h3");
    const conteudoArtigo = document.createElement("p");

    tituloArtigo.textContent = publicacao.titulo;
    conteudoArtigo.textContent = publicacao.conteudo;

    novoArtigo.appendChild(tituloArtigo);
    novoArtigo.appendChild(conteudoArtigo);

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

    publicacaoEmEdicao.titulo = campoTitulo.value;
    publicacaoEmEdicao.conteudo = campoConteudo.value;

    artigoEmEdicao.querySelector("h3").textContent = publicacaoEmEdicao.titulo;
    artigoEmEdicao.querySelector("p").textContent = publicacaoEmEdicao.conteudo;

    publicacaoEmEdicao = null;
    artigoEmEdicao = null;

    console.log("Publicações atualizadas:", publicacoes);

    formulario.reset();

    return;
}

    formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    // 1. Se estamos editando, executar o código de edição
    if (publicacaoEmEdicao !== null) {

        // Mantenha aqui o seu código antigo de edição

        return;
    }

    // 2. Se NÃO estamos editando, criar uma publicação pela API
    const resposta = await fetch("/api/publicacoes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
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

    const publicacao = {
        titulo: campoTitulo.value,
        conteudo:campoConteudo.value,
    };

    publicacoes.push(publicacao)


    const novoArtigo = document.createElement("article");
    const tituloArtigo = document.createElement("h3");
    const conteudoArtigo = document.createElement("p");

    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.type = "button";

    botaoEditar.addEventListener("click", function() {

        botaoCancelar.hidden = false;
        publicacaoEmEdicao = publicacao;
        artigoEmEdicao = novoArtigo;
        campoTitulo.value = publicacao.titulo;
        campoConteudo.value = publicacao.conteudo;
        console.log(publicacaoEmEdicao)
        botaoPublicar.textContent = "Salvar alterações";
    })



    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir"
    botaoExcluir.type = "button"

    botaoExcluir.addEventListener("click", function() {

    const indice = publicacoes.findIndex(function(item) {
        return item === publicacao;
    });

    if (indice !== -1) {
        publicacoes.splice(indice, 1);
        novoArtigo.remove();
    }

    if (publicacaoEmEdicao === publicacao) {
        cancelarEdicao();
}

});


    tituloArtigo.textContent = publicacao.titulo;
    conteudoArtigo.textContent = publicacao.conteudo;

    novoArtigo.appendChild(tituloArtigo);
    novoArtigo.appendChild(conteudoArtigo);
    
    listaPublicacoes.appendChild(novoArtigo);
    novoArtigo.appendChild(botaoExcluir);
    novoArtigo.appendChild(botaoEditar);

    console.log(publicacoes);

}); 



async function carregarPublicacoes() {

    const resposta = await fetch("/api/publicacoes");

    const dados = await resposta.json();

    dados.forEach(function(publicacao) {
    exibirPublicacao(publicacao);

});

    console.log("Publicações recebidas da API:", dados);

}


carregarPublicacoes();

