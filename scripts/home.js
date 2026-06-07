async function loadComponents() {
  try {
    // HEADER
    const headerResponse = await fetch('/components/header.html');

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
      '/components/navbar.html'
    );

    if (!navbarResponse.ok) {
      throw new Error(
        `Navbar não encontrada: ${navbarResponse.status}`
      );
    }

    const navbarHtml = await navbarResponse.text();

    document.getElementById('navbar-slot').innerHTML =
      navbarHtml;

    // HERO
    const heroResponse = await fetch('/components/hero.html');
    if (!heroResponse.ok) {
      throw new Error(`Hero não encontrado: ${heroResponse.status}`);
    }
    const heroHtml = await heroResponse.text();
    document.getElementById('hero-slot').innerHTML = heroHtml;

    // FOOTER
    const footerResponse = await fetch('/components/footer.html');
    if (!footerResponse.ok) {
      throw new Error(`Footer não encontrado: ${footerResponse.status}`);
    }
    const footerHtml = await footerResponse.text();
    document.getElementById('footer-slot').innerHTML = footerHtml;

    console.log('Componentes carregados!');
  } catch (error) {
    console.error('Erro ao carregar:', error);
  }
}

loadComponents();