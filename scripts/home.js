fetch('header.html')
        .then(response => response.text())
        .then(html => {
          document.getElementById('page-header').innerHTML = html;
        })
        .then(() => fetch('navbar.html'))
        .then(response => response.text())
        .then(html => {
          document.getElementById('navbar-slot').innerHTML = html;
        })
        .catch(error => {
          console.error('Falha ao carregar o cabeçalho ou a navbar:', error);
        });