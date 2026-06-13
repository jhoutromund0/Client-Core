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
  document.dispatchEvent(new CustomEvent('clientcore:components-loaded'));
};

const carregarHome = async () => {
  await carregarComponentesBase();
  await carregarComponente('hero-slot', '/components/hero.html');
  await carregarComponente('footer-slot', '/components/footer.html');
  document.dispatchEvent(new CustomEvent('clientcore:components-loaded'));
};

const carregarLogin = async () => {
  await carregarComponente('page-header', '/components/header.html');
  await carregarComponente('login-card-slot', '/components/login-card.html');
  document.dispatchEvent(new CustomEvent('clientcore:components-loaded'));
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
