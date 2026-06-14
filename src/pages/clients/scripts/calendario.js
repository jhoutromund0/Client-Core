import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { db } from "../../../firebase/firebase.js";

const visitasRef = collection(db, "visitas");
const clientesRef = collection(db, "clientes");
const materiaisRef = collection(db, "materiais");

const buscaClienteInput = document.getElementById("buscar-cliente");
const limparFiltroButton = document.getElementById("limpar-filtro");
const totalVisitas = document.getElementById("total-visitas");
const totalVisitasMes = document.getElementById("total-visitas-mes");
const mesAnoLabel = document.getElementById("mes-ano");
const calendarioGrid = document.getElementById("calendario-grid");
const visitasDoDia = document.getElementById("visitas-do-dia");
const dataSelecionadaLabel = document.getElementById("data-selecionada");
const calendarioStatus = document.getElementById("calendario-status");
const modal = document.getElementById("modal-agendar");
const modalDataLabel = document.getElementById("modal-data");
const fecharModalButton = document.getElementById("fechar-modal");
const formVisita = document.getElementById("form-visita");
const visitaDataInput = document.getElementById("visita-data");
const visitaClienteInput = document.getElementById("visita-cliente");
const visitaTipoInput = document.getElementById("visita-tipo");
const visitaMateriaisInput = document.getElementById("visita-materiais");
const visitaTecnicosInput = document.getElementById("visita-tecnicos");
const modalStatus = document.getElementById("modal-status");
const hojeButton = document.getElementById("hoje-button");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
const clientesList = document.getElementById("clientes-list");

const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  selectedDate: null,
  visitas: [],
  clientes: [],
  filtroCliente: ""
};

const formatarData = (date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

const formatarDia = (date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit"
  }).format(date);
};

const formatarMesAno = (year, month) => {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(new Date(year, month, 1));
};

const isSameDate = (a, b) => {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
};

const obterVisitas = async () => {
  try {
    const q = query(visitasRef, orderBy("scheduledAt", "asc"));
    const snapshot = await getDocs(q);

    state.visitas = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const scheduledAt = data.scheduledAt?.toDate ? data.scheduledAt.toDate() : new Date(data.scheduledAt?.seconds ? data.scheduledAt.seconds * 1000 : data.scheduledAt || Date.now());

      return {
        id: docSnap.id,
        clienteNome: data.clienteNome || "",
        clienteId: data.clienteId || "",
        descricao: data.descricao || "",
        materiais: data.materiais || "",
        tecnicos: data.tecnicos || "",
        scheduledAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

    atualizarResumo();
    renderizarCalendario();
    renderizarVisitasDoDia(state.selectedDate || new Date());
    atualizarStatus("Agenda atualizada.");
  } catch (error) {
    console.error("Erro ao carregar visitas:", error);
    atualizarStatus("Não foi possível carregar o calendário.", "error");
  }
};

const obterClientes = async () => {
  try {
    const q = query(clientesRef, orderBy("nomeEmpresarial", "asc"));
    const snapshot = await getDocs(q);
    state.clientes = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      nome: docSnap.data().nomeEmpresarial || docSnap.data().nome || ""
    }));

    clientesList.innerHTML = state.clientes.map((cliente) => `<option value="${cliente.nome}"></option>`).join("");
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
  }
};

const visitasFiltradas = () => {
  const filtro = state.filtroCliente.trim().toLowerCase();
  if (!filtro) {
    return state.visitas;
  }

  return state.visitas.filter((visita) => visita.clienteNome.toLowerCase().includes(filtro));
};

const atualizarResumo = () => {
  const todas = visitasFiltradas();
  totalVisitas.textContent = todas.length.toString();
  totalVisitasMes.textContent = todas.filter((visita) => visita.scheduledAt.getMonth() === state.month && visita.scheduledAt.getFullYear() === state.year).length.toString();
};

const renderizarCalendario = () => {
  mesAnoLabel.textContent = formatarMesAno(state.year, state.month);
  const firstDay = new Date(state.year, state.month, 1).getDay();
  const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
  const hoje = new Date();

  calendarioGrid.innerHTML = "";
  const visitas = visitasFiltradas();

  for (let blank = 0; blank < firstDay; blank += 1) {
    const placeholder = document.createElement("div");
    placeholder.className = "min-h-[120px] rounded-[1.5rem] border border-transparent bg-[#0f1419]";
    calendarioGrid.appendChild(placeholder);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(state.year, state.month, day);
    const dayVisits = visitas.filter((visita) => isSameDate(visita.scheduledAt, date));
    const isToday = isSameDate(date, hoje);
    const showDay = !state.filtroCliente || dayVisits.length > 0;

    const cell = document.createElement("div");
    cell.className = `relative min-h-[120px] rounded-[1.5rem] border border-[#3eb449]/10 bg-[#111314]/80 p-4 transition ${isToday ? "border-[#7cf887] bg-[#1f2d18] shadow-[0_0_0_1px_rgba(124,248,135,0.25)]" : "hover:border-[#3eb449]/30 hover:bg-[#1a2419]"} ${showDay ? "opacity-100" : "opacity-30"}`;

    cell.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <span class="text-sm font-semibold text-white">${day}</span>
        <button type="button" data-day="${day}" aria-label="Agendar visita em ${day} de ${formatarMesAno(state.year, state.month)}" class="agendar-dia inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#3eb449]/20 bg-[#3eb449]/10 text-sm font-semibold text-[#c5bdb1] transition hover:bg-[#3eb449]/20">+</button>
      </div>
      <div class="mt-4 space-y-2">
        ${dayVisits.length > 0 ? `<span class="inline-flex rounded-full bg-[#3eb449]/15 px-2 py-1 text-[11px] font-semibold uppercase text-[#7cf887]">${dayVisits.length} visita${dayVisits.length > 1 ? "s" : ""}</span>` : ""}
        ${dayVisits.slice(0, 2).map((visita) => `<div class="rounded-3xl border border-[#3eb449]/10 bg-[#0f1419]/80 p-3 text-xs text-[#c5bdb1]">
            <p class="font-semibold text-white">${visita.clienteNome}</p>
            <p>${visita.descricao.slice(0, 40)}${visita.descricao.length > 40 ? "..." : ""}</p>
          </div>`).join("")}
      </div>
    `;

    if (!showDay) {
      const label = document.createElement("div");
      label.className = "absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-[0.24em] text-[#7f9b83]/70";
      label.textContent = "Sem visitas";
      cell.appendChild(label);
    }

    calendarioGrid.appendChild(cell);
  }
};

const renderizarVisitasDoDia = (date) => {
  state.selectedDate = date;

  const lista = visitasFiltradas().filter((visita) => isSameDate(visita.scheduledAt, date));
  const descricaoData = date ? formatarData(date) : "";

  dataSelecionadaLabel.textContent = descricaoData;
  visitasDoDia.innerHTML = "";

  if (lista.length === 0) {
    visitasDoDia.innerHTML = `<div class="rounded-[1.5rem] border border-[#3eb449]/10 bg-[#0f1419]/80 p-6 text-sm text-[#c5bdb1]">Nenhuma visita agendada para este dia.</div>`;
    return;
  }

  lista.forEach((visita) => {
    const card = document.createElement("div");
    card.className = "rounded-[1.5rem] border border-[#3eb449]/10 bg-[#0f1419]/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-[0.22em] text-[#7cf887]">${visita.clienteNome}</p>
          <h3 class="mt-2 text-lg font-semibold text-white">${visita.descricao}</h3>
        </div>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4 text-sm text-[#c5bdb1]">
          <p class="font-semibold text-white">Materiais</p>
          <p class="mt-2 whitespace-pre-line">${visita.materiais || "Não informado"}</p>
        </div>
        <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4 text-sm text-[#c5bdb1]">
          <p class="font-semibold text-white">Técnico(s)</p>
          <p class="mt-2">${visita.tecnicos || "Não informado"}</p>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between gap-3 text-xs text-[#c5bdb1]">
        <span>Agendada para ${descricaoData}</span>
        <button type="button" data-id="${visita.id}" aria-label="Excluir visita de ${visita.clienteNome} em ${descricaoData}" class="remover-visita rounded-3xl border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-2 font-semibold text-[#fca5a5] transition hover:bg-[#ef4444]/20">Excluir</button>
      </div>
    `;

    visitasDoDia.appendChild(card);
  });
};

const abrirModal = (date) => {
  previouslyFocusedElement = document.activeElement;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  modal.setAttribute("aria-hidden", "false");
  modalDataLabel.textContent = `Data selecionada: ${formatarData(date)}`;
  visitaDataInput.value = date.toISOString();
  visitaClienteInput.value = "";
  visitaDescricaoInput.value = "";
  visitaMateriaisInput.value = "";
  visitaTecnicosInput.value = "";
  modalStatus.textContent = "";
  visitaClienteInput.focus();
};

const fecharModal = () => {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  modal.setAttribute("aria-hidden", "true");
  if (previouslyFocusedElement) previouslyFocusedElement.focus();
};

const salvarVisita = async (evento) => {
  evento.preventDefault();
  const dataSelecionada = new Date(visitaDataInput.value);
  const clienteNome = visitaClienteInput.value.trim();
  const descricao = visitaDescricaoInput.value.trim();
  const materiais = visitaMateriaisInput.value.trim();
  const tecnicos = visitaTecnicosInput.value.trim();

  if (!clienteNome || !descricao) {
    modalStatus.textContent = "Informe o cliente e a descrição da visita.";
    modalStatus.setAttribute("role", "alert");
    const invalidField = !clienteNome ? visitaClienteInput : visitaDescricaoInput;
    invalidField.setAttribute("aria-invalid", "true");
    invalidField.focus();
    return;
  }
  visitaClienteInput.removeAttribute("aria-invalid");
  visitaDescricaoInput.removeAttribute("aria-invalid");

  const clienteEncontrado = state.clientes.find((cliente) => cliente.nome === clienteNome);
  const clienteId = clienteEncontrado ? clienteEncontrado.id : "";

  try {
    modalStatus.textContent = "Salvando visita...";
    formVisita.setAttribute("aria-busy", "true");
    submitVisitaButton.disabled = true;
    await addDoc(visitasRef, {
      clienteNome,
      clienteId,
      descricao,
      materiais,
      tecnicos,
      scheduledAt: Timestamp.fromDate(dataSelecionada),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    fecharModal();
    await obterVisitas();
    if (state.filtroCliente) {
      renderizarCalendario();
      renderizarVisitasDoDia(state.selectedDate || new Date());
    }
  } catch (error) {
    console.error("Erro ao salvar visita:", error);
    modalStatus.textContent = "Não foi possível salvar a visita.";
  } finally {
    formVisita.setAttribute("aria-busy", "false");
    submitVisitaButton.disabled = false;
  }
};

const removerVisita = async (id) => {
  try {
    await deleteDoc(doc(db, "visitas", id));
    await obterVisitas();
  } catch (error) {
    console.error("Erro ao excluir visita:", error);
  }
};

const atualizarStatus = (message, type = "info") => {
  calendarioStatus.textContent = message;
  calendarioStatus.className = "mt-2 text-sm ";
  if (type === "success") {
    calendarioStatus.classList.add("text-emerald-300");
  } else if (type === "error") {
    calendarioStatus.classList.add("text-rose-400");
  } else {
    calendarioStatus.classList.add("text-[#c5bdb1]/70");
  }
};

const aplicarFiltro = () => {
  state.filtroCliente = buscaClienteInput.value.trim();
  atualizarResumo();
  renderizarCalendario();
  renderizarVisitasDoDia(state.selectedDate || new Date());
};

const selecionarDia = (date) => {
  renderizarVisitasDoDia(date);
};

const irParaHoje = () => {
  const hoje = new Date();
  state.year = hoje.getFullYear();
  state.month = hoje.getMonth();
  renderizarCalendario();
  selecionarDia(hoje);
};

hojeButton.addEventListener("click", irParaHoje);
prevMonthButton.addEventListener("click", () => {
  state.month -= 1;
  if (state.month < 0) {
    state.month = 11;
    state.year -= 1;
  }
  renderizarCalendario();
});
nextMonthButton.addEventListener("click", () => {
  state.month += 1;
  if (state.month > 11) {
    state.month = 0;
    state.year += 1;
  }
  renderizarCalendario();
});

limparFiltroButton.addEventListener("click", () => {
  buscaClienteInput.value = "";
  aplicarFiltro();
});
buscaClienteInput.addEventListener("input", aplicarFiltro);

calendarioGrid.addEventListener("click", (event) => {
  const botao = event.target.closest("button.agendar-dia");
  if (!botao) return;
  const day = Number(botao.dataset.day);
  const date = new Date(state.year, state.month, day);
  abrirModal(date);
});

visitasDoDia.addEventListener("click", async (event) => {
  const botao = event.target.closest("button.remover-visita");
  if (!botao) return;
  const id = botao.dataset.id;
  const confirmar = window.confirm("Deseja excluir esta visita?");
  if (confirmar) {
    await removerVisita(id);
  }
});

fecharModalButton.addEventListener("click", fecharModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    fecharModal();
  }
});
modal.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    fecharModal();
    return;
  }

  if (event.key === "Tab") {
    const focusable = [...modal.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.disabled && !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
formVisita.addEventListener("submit", salvarVisita);

window.addEventListener("DOMContentLoaded", async () => {
  await obterClientes();
  await obterVisitas();
  irParaHoje();
});
