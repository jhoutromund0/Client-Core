import { db } from '../../../firebase/firebase.js';

import {
  collection,
  getDocs
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

const totalClientesEl =
  document.getElementById('total-clientes');

const totalMatrizEl =
  document.getElementById('total-matriz');

const totalFilialEl =
  document.getElementById('total-filial');

const cadastrosMesEl =
  document.getElementById('cadastros-mes');

async function carregarResumoSistema() {
  try {

    const clientesRef =
      collection(db, 'clientes');

    const snapshot =
      await getDocs(clientesRef);

    let totalClientes = 0;
    let totalMatriz = 0;
    let totalFilial = 0;
    let cadastrosMes = 0;

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    snapshot.forEach((doc) => {
      const cliente = doc.data();

      totalClientes++;

      // MATRIZ / FILIAL
      if (
        cliente.indicador?.toLowerCase()
        === 'matriz'
      ) {
        totalMatriz++;
      }

      if (
        cliente.indicador?.toLowerCase()
        === 'filial'
      ) {
        totalFilial++;
      }

      // CADASTROS DO MÊS
      if (cliente.createdAt) {

        const dataCadastro =
          cliente.createdAt.toDate();

        const mesCadastro =
          dataCadastro.getMonth();

        const anoCadastro =
          dataCadastro.getFullYear();

        if (
          mesCadastro === mesAtual &&
          anoCadastro === anoAtual
        ) {
          cadastrosMes++;
        }
      }
    });

    // Atualiza UI
    totalClientesEl.textContent =
      totalClientes;

    totalMatrizEl.textContent =
      totalMatriz;

    totalFilialEl.textContent =
      totalFilial;

    cadastrosMesEl.textContent =
      `+${cadastrosMes}`;

  } catch (error) {
    console.error(
      'Erro ao carregar resumo:',
      error
    );
  }
}

carregarResumoSistema();

async function carregarNavbar() {
  try {
    const response = await fetch(
      '../../components/monitus-nav.html'
    );

    if (!response.ok) {
      throw new Error(
        'Navbar não encontrada'
      );
    }

    const html =
      await response.text();

    document
      .getElementById(
        'monitus-nav-slot'
      )
      .innerHTML = html;

    iniciarMenuMobile();

  } catch (error) {
    console.error(
      'Erro ao carregar navbar:',
      error
    );
  }
}

function iniciarMenuMobile() {

  const button =
    document.getElementById(
      'mobile-menu-button'
    );

  const menu =
    document.getElementById(
      'mobile-menu'
    );

  if (!button || !menu) return;

  button.addEventListener(
    'click',
    () => {
      menu.classList.toggle(
        'hidden'
      );
    }
  );
}

carregarNavbar();
