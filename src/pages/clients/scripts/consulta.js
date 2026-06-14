import {
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { db } from "../../../firebase/firebase.js";

const buscarInput      = document.getElementById("buscar-cliente");
const totalClientesEl  = document.getElementById("total-clientes");
const listaEl          = document.getElementById("clientes-lista");
const listaVazia       = document.getElementById("lista-vazia");
const detalhesEl       = document.getElementById("cliente-detalhes");

// Modal de edição
const modalEditar      = document.getElementById("modal-editar");
const formEditar       = document.getElementById("form-editar");
const btnFecharModal   = document.getElementById("fechar-modal");

// Modal de confirmação de exclusão
const modalExcluir     = document.getElementById("modal-excluir");
const btnConfirmarExcl = document.getElementById("confirmar-exclusao");
const btnCancelarExcl  = document.getElementById("cancelar-exclusao");

// ─── Estado ─────────────────────────────────────────────────────────────────

let clientes       = [];
let filtro         = "";
let clienteSendoEditado  = null;
let clienteSendoExcluido = null;

// ─── Utilitários ────────────────────────────────────────────────────────────

const limparCNPJ = (value) => (value || "").replace(/\D/g, "");

const formatarCNPJ = (value) =>
    limparCNPJ(value).replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
    );

// ─── Firestore ───────────────────────────────────────────────────────────────

const carregarClientes = async () => {
    try {
        const q        = query(collection(db, "clientes"), orderBy("nomeEmpresarial", "asc"));
        const snapshot = await getDocs(q);
        clientes       = snapshot.docs.map((s) => ({ id: s.id, ...s.data() }));
        renderizarLista();
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
    }
};

const atualizarCliente = async (id, dados) => {
    const ref = doc(db, "clientes", id);
    await updateDoc(ref, {
        ...dados,
        cnpj:        limparCNPJ(dados.cnpj),
        atualizadoEm: serverTimestamp(),
    });

    // Atualiza o estado local sem precisar recarregar tudo
    clientes = clientes.map((c) =>
        c.id === id ? { ...c, ...dados, cnpj: limparCNPJ(dados.cnpj) } : c
    );
};

const excluirCliente = async (id) => {
    await deleteDoc(doc(db, "clientes", id));
    clientes = clientes.filter((c) => c.id !== id);
};

// ─── Filtro ──────────────────────────────────────────────────────────────────

const clientesFiltrados = () => {
    const f = filtro.trim().toLowerCase();
    if (!f) return clientes;
    return clientes.filter(
        (c) =>
            (c.nomeEmpresarial || "").toLowerCase().includes(f) ||
            limparCNPJ(c.cnpj || "").includes(limparCNPJ(f))
    );
};

// ─── Renderização da lista ───────────────────────────────────────────────────

const renderizarLista = () => {
    const items = clientesFiltrados();
    listaEl.innerHTML = "";
    totalClientesEl.textContent = items.length.toString();

    if (items.length === 0) {
        listaVazia.classList.remove("hidden");
        return;
    }
    listaVazia.classList.add("hidden");

    items.forEach((c) => {
        const tr       = document.createElement("tr");
        tr.className   = "border-t border-[#3eb449]/10";
        tr.dataset.id  = c.id;
        tr.innerHTML   = `
            <td class="px-5 py-4 text-[#c5bdb1]">${c.nomeEmpresarial || ""}</td>
            <td class="px-5 py-4 text-[#c5bdb1]">${formatarCNPJ(c.cnpj || "")}</td>
            <td class="px-5 py-4 text-[#c5bdb1]">${c.telefone || ""}</td>
            <td class="px-5 py-4 text-[#c5bdb1]">${c.email || ""}</td>
            <td class="px-5 py-4 text-right flex gap-2 justify-end">
                <button data-id="${c.id}" class="btn-ver inline-flex items-center justify-center rounded-full border border-[#3eb449]/25 bg-[#3eb449]/10 px-4 py-2 text-xs font-semibold text-[#c5bdb1] transition hover:bg-[#3eb449]/20">Ver</button>
                <button data-id="${c.id}" class="btn-editar inline-flex items-center justify-center rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-400/20">Editar</button>
                <button data-id="${c.id}" class="btn-excluir inline-flex items-center justify-center rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/20">Excluir</button>
            </td>
        `;
        listaEl.appendChild(tr);
    });
};

// ─── Detalhes ────────────────────────────────────────────────────────────────

const mostrarDetalhes = (id) => {
    const c = clientes.find((x) => x.id === id);
    if (!c) return;

    const endereco = [c.endereco, c.complemento].filter(Boolean).join(", ");

    detalhesEl.innerHTML = `
        <div class="mt-3 grid gap-3">
            <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
                <p class="text-sm text-[#c5bdb1]">Nome empresarial</p>
                <p class="font-semibold text-white">${c.nomeEmpresarial || ""}</p>
            </div>
            <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
                <p class="text-sm text-[#c5bdb1]">CNPJ</p>
                <p class="font-semibold text-white">${formatarCNPJ(c.cnpj || "")}</p>
            </div>
            <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
                <p class="text-sm text-[#c5bdb1]">Indicador</p>
                <p class="font-semibold text-white capitalize">${c.indicador || "Não informado"}</p>
            </div>
            <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
                <p class="text-sm text-[#c5bdb1]">Telefone</p>
                <p class="font-semibold text-white">${c.telefone || "Não informado"}</p>
            </div>
            <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
                <p class="text-sm text-[#c5bdb1]">Email</p>
                <p class="font-semibold text-white">${c.email || "Não informado"}</p>
            </div>
            <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
                <p class="text-sm text-[#c5bdb1]">Endereço</p>
                <p class="font-semibold text-white">${endereco || "Não informado"}</p>
            </div>
            <div class="rounded-3xl border border-[#3eb449]/10 bg-[#111314]/80 p-4">
                <p class="text-sm text-[#c5bdb1]">Referência</p>
                <p class="font-semibold text-white">${c.referencia || "Não informado"}</p>
            </div>
        </div>
    `;
};

// ─── Modal de edição ─────────────────────────────────────────────────────────

const abrirModalEditar = (id) => {
    const c = clientes.find((x) => x.id === id);
    if (!c) return;

    clienteSendoEditado = id;

    // Preenche os campos do formulário com os dados atuais
    formEditar.querySelector("#edit-nome-empresarial").value = c.nomeEmpresarial || "";
    formEditar.querySelector("#edit-cnpj").value             = formatarCNPJ(c.cnpj || "");
    formEditar.querySelector("#edit-indicador").value        = c.indicador || "";
    formEditar.querySelector("#edit-telefone").value         = c.telefone || "";
    formEditar.querySelector("#edit-email").value            = c.email || "";
    formEditar.querySelector("#edit-endereco").value         = c.endereco || "";
    formEditar.querySelector("#edit-complemento").value      = c.complemento || "";
    formEditar.querySelector("#edit-referencia").value       = c.referencia || "";

    modalEditar.classList.remove("hidden");
};

const fecharModalEditar = () => {
    modalEditar.classList.add("hidden");
    clienteSendoEditado = null;
    formEditar.reset();
};

// ─── Modal de exclusão ───────────────────────────────────────────────────────

const abrirModalExcluir = (id) => {
    clienteSendoExcluido = id;
    modalExcluir.classList.remove("hidden");
};

const fecharModalExcluir = () => {
    modalExcluir.classList.add("hidden");
    clienteSendoExcluido = null;
};

// ─── Eventos ─────────────────────────────────────────────────────────────────

// Delegação de eventos na tabela
listaEl.addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.classList.contains("btn-ver"))     mostrarDetalhes(id);
    if (btn.classList.contains("btn-editar"))  abrirModalEditar(id);
    if (btn.classList.contains("btn-excluir")) abrirModalExcluir(id);
});

// Fechar modal de edição
btnFecharModal.addEventListener("click", fecharModalEditar);
modalEditar.addEventListener("click", (e) => {
    if (e.target === modalEditar) fecharModalEditar();
});

// Submeter edição
formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!clienteSendoEditado) return;

    const submitBtn       = formEditar.querySelector("button[type='submit']");
    submitBtn.disabled    = true;
    submitBtn.textContent = "Salvando...";

    const dadosAtualizados = {
        nomeEmpresarial: formEditar.querySelector("#edit-nome-empresarial").value.trim(),
        cnpj:            formEditar.querySelector("#edit-cnpj").value,
        indicador:       formEditar.querySelector("#edit-indicador").value,
        telefone:        formEditar.querySelector("#edit-telefone").value.trim(),
        email:           formEditar.querySelector("#edit-email").value.trim(),
        endereco:        formEditar.querySelector("#edit-endereco").value.trim(),
        complemento:     formEditar.querySelector("#edit-complemento").value.trim(),
        referencia:      formEditar.querySelector("#edit-referencia").value.trim(),
    };

    try {
        await atualizarCliente(clienteSendoEditado, dadosAtualizados);
        renderizarLista();
        mostrarDetalhes(clienteSendoEditado);
        fecharModalEditar();
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        alert("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = "Salvar alterações";
    }
});

// Confirmar exclusão
btnConfirmarExcl.addEventListener("click", async () => {
    if (!clienteSendoExcluido) return;

    btnConfirmarExcl.disabled    = true;
    btnConfirmarExcl.textContent = "Excluindo...";

    try {
        await excluirCliente(clienteSendoExcluido);
        detalhesEl.innerHTML = "";
        renderizarLista();
        fecharModalExcluir();
    } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        alert("Não foi possível excluir o cliente. Tente novamente.");
    } finally {
        btnConfirmarExcl.disabled    = false;
        btnConfirmarExcl.textContent = "Confirmar exclusão";
    }
});

btnCancelarExcl.addEventListener("click", fecharModalExcluir);
modalExcluir.addEventListener("click", (e) => {
    if (e.target === modalExcluir) fecharModalExcluir();
});

// Busca
buscarInput.addEventListener("input", (e) => {
    filtro = e.target.value;
    renderizarLista();
});

// ─── Init ────────────────────────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", carregarClientes);