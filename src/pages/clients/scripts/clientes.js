import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

import { db } from "../../../firebase/firebase.js";

export async function salvarCliente(
    empresaIdOuCliente,
    clienteInformado
) {

    try {
        const temEmpresaId =
            typeof empresaIdOuCliente === "string" &&
            clienteInformado;

        const empresaId =
            temEmpresaId
                ? empresaIdOuCliente
                : null;

        const cliente =
            temEmpresaId
                ? clienteInformado
                : empresaIdOuCliente;

        if (!cliente) {
            throw new Error(
                "Dados do cliente nao informados"
            );
        }

        const clienteRef =
            empresaId
                ? collection(
                    db,
                    "empresas",
                    empresaId,
                    "clientes"
                )
                : collection(
                    db,
                    "clientes"
                );

        const docRef =
            await addDoc(
                clienteRef,
                {
                    ...cliente,

                    cnpj:
                        cliente.cnpj
                        ?.replace(/\D/g, ''),

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()
                }
            );

        return docRef.id;

    } catch (error) {

        console.error(
            "Erro ao salvar cliente:",
            error
        );

        throw new Error(
            "Erro ao salvar cliente"
        );
    }
}
