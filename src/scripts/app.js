import { auth } from '../firebase/firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';

const carregarComponente = async (slotId, componentPath) => {
  const slot = document.getElementById(slotId);

  if (!slot) {
    return;
  }

  const response = await fetch(componentPath);

  if (!response.ok) {
    throw new Error(`${componentPath} nao encontrado: ${response.status}`);
  }

  slot.innerHTML = await response.text();
};

const carregarComponentesBase = async () => {
  await carregarComponente('page-header', '/components/header.html');
  await carregarComponente('navbar-slot', '/components/navbar.html');
};

const carregarHome = async () => {
  await carregarComponentesBase();
  await carregarComponente('hero-slot', '/components/hero.html');
  await carregarComponente('footer-slot', '/components/footer.html');
};

const configurarAutenticacao = () => {
  const loginForm = document.querySelector('form');

  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede a página de recarregar

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("Login realizado com sucesso! 🎉");
        window.location.href = "/pages/clients/monitus.html";
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-credential') {
          alert("E-mail ou palavra-passe incorretos.");
        } else {
          alert("Erro ao iniciar sessão: " + error.message);
        }
      });
  });
};

const carregarLogin = async () => {
  await carregarComponente('page-header', '/components/header.html');
  await carregarComponente('login-card-slot', '/components/login-card.html');

  // Liga o motor do Firebase assim que o cartão de login aparecer no ecrã
  configurarAutenticacao();
};

const configurarCadastro = () => {
  const cadastroForm = document.getElementById('cadastro-form');

  if (!cadastroForm) return;

  cadastroForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('cadastro-email').value;
    const password = document.getElementById('cadastro-password').value;
    const passwordConfirm = document.getElementById('cadastro-password-confirm').value;

    // Validação básica: as senhas precisam ser iguais
    if (password !== passwordConfirm) {
      alert("As palavras-passe não coincidem! Verifique e tente novamente.");
      return;
    }

    // Cria o usuário no Firebase
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("Conta criada com sucesso! 🎉 Bem-vindo à Monitus.");
        window.location.href = "/pages/clients/monitus.html"; // Redireciona direto para o sistema
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          alert("Este e-mail já está em uso por outra conta.");
        } else if (error.code === 'auth/weak-password') {
          alert("A palavra-passe é muito fraca. Digite pelo menos 6 caracteres.");
        } else {
          alert("Erro ao criar conta: " + error.message);
        }
      });
  });
};

const carregarCadastro = async () => {
  await carregarComponente('page-header', '/components/header.html');
  await carregarComponente('cadastro-card-slot', '/components/cadastro-card.html');
  await carregarComponente('footer-slot', '/components/footer.html');

  // Liga o motor do cadastro assim que o card estiver na tela
  configurarCadastro();
};

const inicializarPagina = async () => {
  try {
    const possuiLogin = Boolean(document.getElementById('login-card-slot'));
    const possuiCadastro = Boolean(document.getElementById('cadastro-card-slot'));

    if (possuiLogin) {
      await carregarLogin();
      return;
    }

    if (possuiCadastro) {
      await carregarCadastro();
      return;
    }

    await carregarHome();
  } catch (error) {
    console.error('Erro ao carregar componentes:', error);
  }
};

inicializarPagina();

const openBtn =
  document.getElementById(
    "open-contact-modal"
  );

const modal =
  document.getElementById(
    "contact-modal"
  );

const closeBtn =
  document.getElementById(
    "close-contact-modal"
  );

const overlay =
  document.getElementById(
    "modal-overlay"
  );

// abrir
openBtn.addEventListener(
  "click",
  () => {
    modal.classList.remove("hidden");
    document.body.style.overflow =
      "hidden";
  }
);

// fechar
function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow =
    "auto";
}

closeBtn.addEventListener(
  "click",
  closeModal
);

overlay.addEventListener(
  "click",
  closeModal
);

// ESC fecha
document.addEventListener(
  "keydown",
  (e) => {
    if (
      e.key === "Escape" &&
      !modal.classList.contains(
        "hidden"
      )
    ) {
      closeModal();
    }
  }
);
