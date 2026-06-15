// ===============================
// CONFIG EMAILJS
// ===============================

// sua PUBLIC KEY REAL
emailjs.init({
  publicKey: "glv4hASc-NiWckqzX"
});

// email fixo
const DESTINATARIO =
  "suporte.clientcore@gmail.com";

const sendButton =
  document.getElementById("send-email");

const assuntoInput =
  document.getElementById("assunto");

const mensagemInput =
  document.getElementById("mensagem");

sendButton.addEventListener(
  "click",
  async () => {

    const assunto =
      assuntoInput.value.trim();

    const mensagem =
      mensagemInput.value.trim();

    if (!assunto || !mensagem) {
      alert(
        "Preencha assunto e mensagem."
      );
      return;
    }

    sendButton.disabled = true;
    sendButton.textContent =
      "Enviando...";

    try {

      const response =
        await emailjs.send(
          "service_uvkifzj",
          "template_gn8bewo",
          {
            // template vars
            subject: assunto,
            message: mensagem,

            // campos obrigatórios do template
            name: "Sistema Monitus",
            email:
              "no-reply@monitus.com",

            // destino
            to_email:
              DESTINATARIO
          }
        );

      console.log(response);

      alert(
        "Mensagem enviada com sucesso!"
      );

      assuntoInput.value = "";
      mensagemInput.value = "";

    } catch (error) {

      console.error(
        "Erro EmailJS:",
        error
      );

      alert(
        "Erro ao enviar email. Veja o console."
      );
    }

    sendButton.disabled = false;
    sendButton.textContent =
      "Enviar Mensagem";
  }
);