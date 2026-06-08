import { buscarCNPJ } from '../src/services/cnpj.js';

const cnpjInput = document.getElementById('cnpj');
const indicadorSelect = document.getElementById('indicador');
const nomeEmpresarialInput = document.getElementById('nome-empresarial');
const telefoneInput = document.getElementById('telefone');
const emailInput = document.getElementById('email');
const enderecoInput = document.getElementById('endereco');
const referenciaInput = document.getElementById('referencia');
const complementoInput = document.getElementById('complemento');
const cnpjStatus = document.getElementById('cnpj-status');

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
  nomeEmpresarialInput.value = dados.nome || dados.fantasia || '';
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
    setStatus('Informe os 14 dígitos do CNPJ para buscar os dados.', 'warning');
    return;
  }

  setStatus('Buscando dados do CNPJ...');

  try {
    const dados = await buscarCNPJ(cnpj);
    preencherCampos(dados);
    setStatus('Dados preenchidos automaticamente.', 'success');
  } catch (error) {
    setStatus(error.message || 'Não foi possível buscar o CNPJ.', 'error');
  }
};

cnpjInput.addEventListener('input', (event) => {
  const formatted = formatarCNPJ(event.target.value);
  event.target.value = formatted;

  const cnpj = limparCNPJ(formatted);
  if (cnpj.length < 14) {
    if (debounceTimer) clearTimeout(debounceTimer);
    setStatus('Digite os 14 dígitos do CNPJ para auto completar.');
    return;
  }

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processarCNPJ, 600);
});

// opcional: preencher automatico ao perder o foco, caso não tenha buscado ainda
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
