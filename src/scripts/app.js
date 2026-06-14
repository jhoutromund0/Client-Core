import { auth } from '../firebase/firebase.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';

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

const inicializarPagina = async () => {
  try {
    const possuiLogin = Boolean(document.getElementById('login-card-slot'));

    if (possuiLogin) {
      await carregarLogin();
      return;
    }

    await carregarHome();
  } catch (error) {
    console.error('Erro ao carregar componentes:', error);
  }
};

inicializarPagina();
