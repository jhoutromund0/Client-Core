import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { db } from "../../../firebase/firebase.js";

const clientesRef = collection(db, "clientes");

const buscarInput = document.getElementById("buscar-cliente");
const totalClientesEl = document.getElementById("total-clientes");
const listaEl = document.getElementById("clientes-lista");
const listaVazia = document.getElementById("lista-vazia");
const detalhesEl = document.getElementById("cliente-detalhes");

let clientes = [];
let filtro = "";

const formatCNPJ = (value) => value ? value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '';

const carregarClientes = async () => {
  try {
    const q = query(clientesRef, orderBy('nomeEmpresarial', 'asc'));
    const snapshot = await getDocs(q);
    clientes = snapshot.docs.map(s => ({ id: s.id, ...s.data() }));
    renderizarLista();
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    detalhesEl.textContent = 'Erro ao carregar clientes.';
  }
};

const clientesFiltrados = () => {
  const f = filtro.trim().toLowerCase();
  if (!f) return clientes;
  return clientes.filter(c => (
    (c.nomeEmpresarial || c.nome || '').toLowerCase().includes(f) ||
    (c.cnpj || '').replace(/\D/g, '').includes(f.replace(/\D/g, '')) ||
    (c.telefone || '').toLowerCase().includes(f)
  ));
};

const renderizarLista = () => {
  const items = clientesFiltrados();
  listaEl.innerHTML = '';
  totalClientesEl.textContent = items.length.toString();

  if (items.length === 0) {
    listaVazia.classList.remove('hidden');
    return;
  }
  listaVazia.classList.add('hidden');

  items.forEach(c => {
    const tr = document.createElement('tr');
    tr.className = 'border-t border-[#3eb449]/10';
    tr.innerHTML = `
      <td class="px-5 py-4 font-medium text-white">${c.id.slice(0,8)}</td>
      <td class="px-5 py-4 text-[#c5bdb1]">${(c.nomeEmpresarial || c.nome || '')}</td>
      <td class="px-5 py-4 text-[#c5bdb1]">${formatCNPJ(c.cnpj || '')}</td>
      <td class="px-5 py-4 text-[#c5bdb1]">${c.telefone || ''}</td>
      <td class="px-5 py-4 text-[#c5bdb1]">${c.email || ''}</td>
      <td class="px-5 py-4 text-right">
        <button data-id="${c.id}" class="ver-detalhes inline-flex items-center justify-center rounded-full border border-[#3eb449]/25 bg-[#3eb449]/10 px-4 py-2 text-xs font-semibold text-[#c5bdb1] transition hover:bg-[#3eb449]/20">Ver</button>
      </td>
    `;
    listaEl.appendChild(tr);
  });
};

const mostrarDetalhes = (id) => {
  const c = clientes.find(x => x.id === id);
  if (!c) return;
  const endereco = [c.endereco, c.complemento].filter(Boolean).join(', ');
  detalhesEl.innerHTML = `
    <div class="mt-3 grid gap-3">
      <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
        <p class="text-sm text-[#c5bdb1]">Nome empresarial</p>
        <p class="font-semibold text-white">${c.nomeEmpresarial || c.nome || ''}</p>
      </div>
      <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
        <p class="text-sm text-[#c5bdb1]">CNPJ</p>
        <p class="font-semibold text-white">${formatCNPJ(c.cnpj || '')}</p>
      </div>
      <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
        <p class="text-sm text-[#c5bdb1]">Telefone</p>
        <p class="font-semibold text-white">${c.telefone || 'Não informado'}</p>
      </div>
      <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
        <p class="text-sm text-[#c5bdb1]">Email</p>
        <p class="font-semibold text-white">${c.email || 'Não informado'}</p>
      </div>
      <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
        <p class="text-sm text-[#c5bdb1]">Endereço</p>
        <p class="font-semibold text-white">${endereco || 'Não informado'}</p>
      </div>
    </div>
  `;
};

listaEl.addEventListener('click', (event) => {
  const btn = event.target.closest('button.ver-detalhes');
  if (!btn) return;
  const id = btn.dataset.id;
  mostrarDetalhes(id);
});

buscarInput.addEventListener('input', (e) => {
  filtro = e.target.value;
  renderizarLista();
});

window.addEventListener('DOMContentLoaded', () => {
  carregarClientes();
});
