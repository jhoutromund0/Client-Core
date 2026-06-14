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
  await carregarComponente('page-header', '/src/components/header.html');
  await carregarComponente('navbar-slot', '/src/components/navbar.html');
};

const carregarHome = async () => {
  await carregarComponentesBase();
  await carregarComponente('hero-slot', '/src/components/hero.html');
  await carregarComponente('footer-slot', '/src/components/footer.html');
};

const carregarLogin = async () => {
  await carregarComponente('page-header', '/src/components/header.html');
  await carregarComponente('login-card-slot', '/src/components/login-card.html');
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
