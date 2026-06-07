async function loadLoginComponents() {
  try {
    const headerResp = await fetch('/components/header.html');
    if (!headerResp.ok) throw new Error(`Header não encontrado: ${headerResp.status}`);
    document.getElementById('page-header').innerHTML = await headerResp.text();

    const navbarResp = await fetch('/components/navbar.html');
    if (!navbarResp.ok) throw new Error(`Navbar não encontrada: ${navbarResp.status}`);
    document.getElementById('navbar-slot').innerHTML = await navbarResp.text();

    const cardResp = await fetch('/components/login-card.html');
    if (!cardResp.ok) throw new Error(`Login card não encontrado: ${cardResp.status}`);
    document.getElementById('login-card-slot').innerHTML = await cardResp.text();
  } catch (error) {
    console.error('Falha ao carregar componentes de login:', error);
  }
}

loadLoginComponents();