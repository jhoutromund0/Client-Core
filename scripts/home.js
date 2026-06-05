async function loadComponents() {
  try {
    // HEADER
    const headerResponse = await fetch('/pages/header.html');

    if (!headerResponse.ok) {
      throw new Error(
        `Header não encontrado: ${headerResponse.status}`
      );
    }

    const headerHtml = await headerResponse.text();

    document.getElementById('page-header').innerHTML =
      headerHtml;

    // NAVBAR
    const navbarResponse = await fetch(
      '/pages/navbar.html'
    );

    if (!navbarResponse.ok) {
      throw new Error(
        `Navbar não encontrada: ${navbarResponse.status}`
      );
    }

    const navbarHtml = await navbarResponse.text();

    document.getElementById('navbar-slot').innerHTML =
      navbarHtml;

    console.log('Componentes carregados!');
  } catch (error) {
    console.error('Erro ao carregar:', error);
  }
}

loadComponents();