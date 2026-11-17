const campoTitulo = document.querySelector("#titulo");
const campoConteudo = document.querySelector("#conteudo");
const formulario = document.querySelector("#form-publicacao");
const listaPublicacoes = document.querySelector("#lista-publicacoes");
const botaoPublicar = formulario.querySelector('button[type="submit"]');

const publicacoes = [];
let publicacaoEmEdicao = null
let artigoEmEdicao = null

formulario.addEventListener("submit", function(evento) {
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

    publicacaoEmEdicao = null;
    formulario.reset();

    return;
}

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

});

    tituloArtigo.textContent = publicacao.titulo;
    conteudoArtigo.textContent = publicacao.conteudo;

    novoArtigo.appendChild(tituloArtigo);
    novoArtigo.appendChild(conteudoArtigo);
    
    listaPublicacoes.appendChild(novoArtigo);
    novoArtigo.appendChild(botaoExcluir);
    novoArtigo.appendChild(botaoEditar);

    console.log(publicacoes);

    formulario.reset();


});

