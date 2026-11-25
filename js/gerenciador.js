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

    const resposta = await fetch(
        `/api/publicacoes/${publicacao.id}`,
        {
            method: "DELETE"
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

    const resposta = await fetch(
        `/api/publicacoes/${publicacaoEmEdicao.id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
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


async function carregarPublicacoes() {

    const resposta = await fetch("/api/publicacoes");

    const dados = await resposta.json();

    dados.forEach(function(publicacao) {
    exibirPublicacao(publicacao);

});

    console.log("Publicações recebidas da API:", dados);

}


carregarPublicacoes();

