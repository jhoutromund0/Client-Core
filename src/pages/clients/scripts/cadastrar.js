import { buscarCNPJ } from '../scripts/services/cnpj.js';
import { salvarCliente } from './clientes.js';

const form = document.querySelector('form');
const cnpjInput = document.getElementById('cnpj');
const indicadorSelect = document.getElementById('indicador');
const nomeEmpresarialInput = document.getElementById('nome-empresarial');
const telefoneInput = document.getElementById('telefone');
const emailInput = document.getElementById('email');
const enderecoInput = document.getElementById('endereco');
const referenciaInput = document.getElementById('referencia');
const complementoInput = document.getElementById('complemento');
const cnpjStatus = document.getElementById('cnpj-status');
const submitButton = form.querySelector('button[type="submit"]');

let debounceTimer = null;

const limparCNPJ = (value) => value.replace(/\D/g, '');

const formatarCNPJ = (value) => {
  const digits = limparCNPJ(value);

  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

const setStatus = (message, type = 'info') => {
  cnpjStatus.textContent = message;
  cnpjStatus.className = 'text-xs min-h-[1.25rem] transition-colors';

  if (type === 'error') {
    cnpjStatus.classList.add('text-rose-400');
  } else if (type === 'success') {
    cnpjStatus.classList.add('text-emerald-300');
  } else if (type === 'warning') {
    cnpjStatus.classList.add('text-amber-300');
  } else {
    cnpjStatus.classList.add('text-[#c5bdb1]/70');
  }
};

const preencherCampos = (dados) => {
  nomeEmpresarialInput.value = dados.name || dados.fantasia || '';
  telefoneInput.value = dados.telefone || '';
  emailInput.value = dados.email || '';

  const enderecoParts = [
    dados.logradouro,
    dados.numero,
    dados.bairro,
    dados.municipio,
    dados.uf,
  ].filter(Boolean);

  enderecoInput.value = enderecoParts.join(', ');
  complementoInput.value = dados.complemento || '';

  if (dados.matriz && dados.matriz.toString().toUpperCase() === 'SIM') {
    indicadorSelect.value = 'matriz';
  } else if (dados.filial && dados.filial.toString().toUpperCase() === 'SIM') {
    indicadorSelect.value = 'filial';
  }
};

const processarCNPJ = async () => {
  const cnpj = limparCNPJ(cnpjInput.value);

  if (cnpj.length !== 14) {
    setStatus('Informe os 14 digitos do CNPJ para buscar os dados.', 'warning');
    return;
  }

  setStatus('Buscando dados do CNPJ...');

  try {
    const dados = await buscarCNPJ(cnpj);
    preencherCampos(dados);
    setStatus('Dados preenchidos automaticamente.', 'success');
  } catch (error) {
    setStatus(error.message || 'Nao foi possivel buscar o CNPJ.', 'error');
  }
};

const montarCliente = () => ({
  cnpj: cnpjInput.value,
  indicador: indicadorSelect.value,
  nomeEmpresarial: nomeEmpresarialInput.value.trim(),
  telefone: telefoneInput.value.trim(),
  email: emailInput.value.trim(),
  endereco: enderecoInput.value.trim(),
  referencia: referenciaInput.value.trim(),
  complemento: complementoInput.value.trim(),
});

cnpjInput.addEventListener('input', (event) => {
  const formatted = formatarCNPJ(event.target.value);
  event.target.value = formatted;

  const cnpj = limparCNPJ(formatted);

  if (cnpj.length < 14) {
    if (debounceTimer) clearTimeout(debounceTimer);
    setStatus('Digite os 14 digitos do CNPJ para auto completar.');
    return;
  }

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processarCNPJ, 600);
});

cnpjInput.addEventListener('blur', () => {
  const cnpj = limparCNPJ(cnpjInput.value);

  if (cnpj.length === 14) {
    processarCNPJ();
  }
});

referenciaInput.addEventListener('input', () => {
  if (!referenciaInput.value) {
    referenciaInput.removeAttribute('placeholder');
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const cliente = montarCliente();

  if (limparCNPJ(cliente.cnpj).length !== 14) {
    setStatus('Informe um CNPJ valido antes de cadastrar.', 'warning');
    cnpjInput.focus();
    return;
  }

  if (!cliente.nomeEmpresarial) {
    setStatus('Informe o nome empresarial antes de cadastrar.', 'warning');
    nomeEmpresarialInput.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Cadastrando...';
  setStatus('Salvando cliente...');

  try {
    await salvarCliente(cliente);
    form.reset();
    setStatus('Cliente cadastrado com sucesso.', 'success');
  } catch (error) {
    setStatus(error.message || 'Nao foi possivel cadastrar o cliente.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Cadastrar Cliente';
  }
});
