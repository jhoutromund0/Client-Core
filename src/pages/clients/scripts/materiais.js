import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js"

import { db } from "../../../firebase/firebase.js";

const materiaisRef = collection(db, "materiais");

const form = document.getElementById("material-form");
const inputId = document.getElementById("material-id");
const inputNome = document.getElementById("material-nome");
const selectTipoMedida = document.getElementById("material-tipo-medida");
const inputMedida = document.getElementById("material-medida");
const wrapperUnidade = document.getElementById("unidade-medida-wrapper");
const selectUnidade = document.getElementById("material-unidade-medida");
const inputValor = document.getElementById("material-valor");
const buttonSubmit = document.getElementById("submit-material");
const buttonCancelar = document.getElementById("cancelar-edicao");
const buttonNovoMaterial = document.getElementById("novo-material");
const status = document.getElementById("form-status");
const lista = document.getElementById("materiais-lista");
const listaVazia = document.getElementById("lista-vazia");
const buscaInput = document.getElementById("buscar-material");
const totalItens = document.getElementById("total-itens");
const totalMedida = document.getElementById("total-medida");
const valorTotal = document.getElementById("valor-total");
const formTitle = document.getElementById("form-title");

let materiais = [];
let filtragem = "";

const formatarMoeda = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);

const limparFormulario = () => {
  inputId.value = "";
  inputNome.value = "";
  selectTipoMedida.value = "quantidade";
  inputMedida.value = "";
  selectUnidade.value = "m";
  inputValor.value = "";
  wrapperUnidade.classList.add("hidden");
  formTitle.textContent = "Adicionar material";
  buttonSubmit.textContent = "Salvar Material";
  buttonCancelar.classList.add("hidden");
  atualizarStatus("Pronto para cadastrar novo material.");
};

const atualizarStatus = (message, type = "info") => {
  status.textContent = message;
  status.setAttribute("role", type === "error" || type === "warning" ? "alert" : "status");
  status.setAttribute("aria-live", type === "error" || type === "warning" ? "assertive" : "polite");
  status.className = "mt-2 min-h-[1.25rem] text-xs ";

  if (type === "success") {
    status.classList.add("text-emerald-300");
  } else if (type === "error") {
    status.classList.add("text-rose-400");
  } else if (type === "warning") {
    status.classList.add("text-amber-300");
  } else {
    status.classList.add("text-[#c5bdb1]/70");
  }
};

const calcularTotals = (listaMateriais) => {
  const itens = listaMateriais.length;
  const medidaTotal = listaMateriais.reduce((sum, item) => sum + Number(item.medida || 0), 0);
  const valorEstoque = listaMateriais.reduce((sum, item) => {
    const valor = Number(item.valor || 0);
    return sum + valor * Number(item.medida || 0);
  }, 0);

  totalItens.textContent = itens.toString();
  totalMedida.textContent = `${medidaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  valorTotal.textContent = formatarMoeda(valorEstoque);
};

const renderizarLista = () => {
  const materiaisFiltrados = materiais.filter((item) =>
    item.nome.toLowerCase().includes(filtragem.toLowerCase()) ||
    item.tipoMedida.toLowerCase().includes(filtragem.toLowerCase())
  );

  lista.innerHTML = "";

  if (materiaisFiltrados.length === 0) {
    listaVazia.classList.remove("hidden");
  } else {
    listaVazia.classList.add("hidden");
  }

  materiaisFiltrados.forEach((material) => {
    const tr = document.createElement("tr");
    tr.className = "border-t border-[#3eb449]/10";

    const total = Number(material.medida || 0) * Number(material.valor || 0);

    tr.innerHTML = `
      <td class="px-5 py-4 text-[#c5bdb1]">${material.nome}</td>
      <td class="px-5 py-4 text-[#c5bdb1]">${material.tipoMedida === "comprimento" ? "Comprimento" : "Quantidade"}</td>
      <td class="px-5 py-4 text-[#c5bdb1]">${Number(material.medida).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${material.tipoMedida === "comprimento" ? material.unidade : "un"}</td>
      <td class="px-5 py-4 text-[#c5bdb1]">${formatarMoeda(Number(material.valor || 0))}</td>
      <td class="px-5 py-4 text-[#c5bdb1]">${formatarMoeda(total)}</td>
      <td class="px-5 py-4 text-right"> 
        <button type="button" data-id="${material.id}" aria-label="Editar ${material.nome}" class="editar-material inline-flex items-center justify-center rounded-full border border-[#3eb449]/25 bg-[#3eb449]/10 px-4 py-2 text-xs font-semibold text-[#c5bdb1] transition hover:bg-[#3eb449]/20">Editar</button>
        <button type="button" data-id="${material.id}" aria-label="Excluir ${material.nome}" class="remover-material ml-2 inline-flex items-center justify-center rounded-full border border-[#ef4444]/25 bg-[#ef4444]/10 px-4 py-2 text-xs font-semibold text-[#fca5a5] transition hover:bg-[#ef4444]/20">Excluir</button>
      </td>
    `;

    lista.appendChild(tr);
  });

  calcularTotals(materiaisFiltrados);
};

const carregarMateriais = async () => {
  try {
    const q = query(materiaisRef, orderBy("nome", "asc"));
    const snapshot = await getDocs(q);

    materiais = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    renderizarLista();
    atualizarStatus("Materiais carregados com sucesso.", "success");
  } catch (error) {
    console.error("Erro ao carregar materiais:", error);
    atualizarStatus("Não foi possível carregar os materiais.", "error");
  }
};

const criarMaterial = async (material) => {
  try {
    await addDoc(materiaisRef, material);
    atualizarStatus("Material cadastrado com sucesso.", "success");
    await carregarMateriais();
  } catch (error) {
    console.error("Erro ao salvar material:", error);
    atualizarStatus("Não foi possível salvar o material.", "error");
  }
};

const atualizarMaterial = async (id, material) => {
  try {
    const materialDoc = doc(db, "materiais", id);
    await updateDoc(materialDoc, material);
    atualizarStatus("Material atualizado com sucesso.", "success");
    await carregarMateriais();
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
    atualizarStatus("Não foi possível atualizar o material.", "error");
  }
};

const removerMaterial = async (id) => {
  try {
    const materialDoc = doc(db, "materiais", id);
    await deleteDoc(materialDoc);
    atualizarStatus("Material excluído com sucesso.", "success");
    await carregarMateriais();
  } catch (error) {
    console.error("Erro ao excluir material:", error);
    atualizarStatus("Não foi possível excluir o material.", "error");
  }
};

const preencherFormulario = (material) => {
  inputId.value = material.id;
  inputNome.value = material.nome;
  selectTipoMedida.value = material.tipoMedida;
  inputMedida.value = material.medida;
  selectUnidade.value = material.unidade || "m";
  inputValor.value = material.valor;

  wrapperUnidade.classList.toggle("hidden", material.tipoMedida !== "comprimento");
  formTitle.textContent = "Editar material";
  buttonSubmit.textContent = "Atualizar Material";
  buttonCancelar.classList.remove("hidden");
};

const construirMaterial = () => ({
  nome: inputNome.value.trim(),
  tipoMedida: selectTipoMedida.value,
  medida: Number(inputMedida.value || 0),
  unidade: selectTipoMedida.value === "comprimento" ? selectUnidade.value : "un",
  valor: Number(inputValor.value || 0),
  atualizadoEm: new Date()
});

selectTipoMedida.addEventListener("change", () => {
  const ehComprimento = selectTipoMedida.value === "comprimento";
  wrapperUnidade.classList.toggle("hidden", !ehComprimento);
  document.getElementById("medida-label").textContent = ehComprimento ? "Comprimento" : "Quantidade";
});

buttonNovoMaterial.addEventListener("click", () => {
  limparFormulario();
  inputNome.focus();
});

buttonCancelar.addEventListener("click", limparFormulario);

buscaInput.addEventListener("input", (event) => {
  filtragem = event.target.value.trim();
  renderizarLista();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = inputNome.value.trim();
  const medida = Number(inputMedida.value || 0);
  const valor = Number(inputValor.value || 0);

  if (!nome) {
    atualizarStatus("Informe o nome do material.", "warning");
    inputNome.setAttribute("aria-invalid", "true");
    inputNome.focus();
    return;
  }
  inputNome.removeAttribute("aria-invalid");

  if (medida <= 0) {
    atualizarStatus("Informe uma medida válida.", "warning");
    inputMedida.setAttribute("aria-invalid", "true");
    inputMedida.focus();
    return;
  }
  inputMedida.removeAttribute("aria-invalid");

  if (valor < 0) {
    atualizarStatus("Informe um valor válido.", "warning");
    inputValor.setAttribute("aria-invalid", "true");
    inputValor.focus();
    return;
  }
  inputValor.removeAttribute("aria-invalid");

  buttonSubmit.disabled = true;
  form.setAttribute("aria-busy", "true");
  buttonSubmit.textContent = "Salvando...";

  const material = construirMaterial();

  if (inputId.value) {
    await atualizarMaterial(inputId.value, material);
  } else {
    await criarMaterial(material);
  }

  limparFormulario();
  buttonSubmit.disabled = false;
  form.setAttribute("aria-busy", "false");
  buttonSubmit.textContent = inputId.value ? "Atualizar Material" : "Salvar Material";
});

lista.addEventListener("click", async (event) => {
  const editarBotao = event.target.closest("button.editar-material");
  const removerBotao = event.target.closest("button.remover-material");

  if (editarBotao) {
    const id = editarBotao.dataset.id;
    const material = materiais.find((item) => item.id === id);
    if (material) {
      preencherFormulario(material);
    }
  }

  if (removerBotao) {
    const id = removerBotao.dataset.id;
    const confirmar = window.confirm("Deseja excluir este material?");
    if (confirmar) {
      await removerMaterial(id);
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  limparFormulario();
  carregarMateriais();
});
