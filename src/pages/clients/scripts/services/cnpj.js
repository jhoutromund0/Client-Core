
const BASE_URL = 'https://open.cnpja.com/office';

const limparCNPJ = (cnpj) =>
    cnpj.replace(/\D/g, '');

export async function buscarCNPJ(cnpj) {

    const cnpjLimpo = limparCNPJ(cnpj);

    if (cnpjLimpo.length !== 14) {
        throw new Error(
            'CNPJ inválido'
        );
    }

    try {

        const res = await fetch(
            `${BASE_URL}/${cnpjLimpo}`
        );

        if (!res.ok) {
            throw new Error(
                `Erro HTTP: ${res.status}`
            );
        }

        const data = await res.json();

        // Segurança caso API retorne vazio
        if (!data) {
            throw new Error(
                'CNPJ não encontrado'
            );
        }

        // NORMALIZAÇÃO
        const normalized = {
            name:
                data.company?.name ||
                data.alias ||
                '',

            nome:
                data.company?.name ||
                data.alias ||
                '',

            fantasia:
                data.alias || '',

            telefone:
                data.phones?.[0]?.number ||
                '',

            email:
                data.emails?.[0]?.address ||
                '',

            logradouro:
                data.address?.street ||
                '',

            numero:
                data.address?.number ||
                '',

            bairro:
                data.address?.district ||
                '',

            municipio:
                data.address?.city ||
                '',

            uf:
                data.address?.state ||
                '',

            complemento:
                data.address?.details ||
                '',

            matriz:
                data.head === true
                    ? 'SIM'
                    : '',

            filial:
                data.head === false
                    ? 'SIM'
                    : ''
        };

        return normalized;

    } catch (error) {

        console.error(
            'Erro ao buscar CNPJ:',
            error
        );

        throw new Error(
            'Não foi possível buscar o CNPJ. Tente novamente mais tarde.'
        );
    }
}

