const formularioLogin = document.querySelector("#form-login");
const mensagemLogin = document.querySelector("#mensagem-login");

formularioLogin.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const usuario = document.querySelector("#usuario").value;
    const senha = document.querySelector("#senha").value;

    mensagemLogin.textContent = "Verificando credenciais...";

    try {
        const resposta = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: usuario,
                senha: senha
            })
        });

        if (!resposta.ok) {
            mensagemLogin.textContent = "Usuário ou senha incorretos.";
            return;
        }

        window.location.href = "/gerenciador.html";

    } catch (erro) {
        console.error("Erro no login:", erro);
        mensagemLogin.textContent = "Não foi possível conectar ao servidor.";
    }
});