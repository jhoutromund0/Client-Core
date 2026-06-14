# Client-Core
Projeto do 3º Semestre da faculdade de Tecnologia em Análise e Desenvolvimento de Sistemas

## Descrição
Repositório com a aplicação front-end e funções Firebase usadas no projeto.

## Pré-requisitos
- Node.js instalado (recomendado 18.x ou superior)
- npm instalado (vem com Node.js)
- Firebase CLI instalado globalmente
- Conta Firebase configurada se quiser rodar deploy ou emuladores

## Instalação
1. Clone o repositório:

   ```bash
   git clone https://github.com/jhoutromund0/Client-Core.git
   cd Client-Core
   ```

2. Instale as dependências principais:

   ```bash
   npm install
   ```

3. Instale as dependências das funções Firebase:

   ```bash
   cd functions
   npm install
   cd ..
   ```

## Rodando localmente
### Opção 1: Usar servidor local simples
Como o projeto não possui script de build configurado, você pode usar qualquer servidor estático local, por exemplo o Live Server do VS Code, ou instalar um servidor simples:

```bash
npm install -g serve
serve public
```

Abra o navegador em `http://localhost:3000` ou na porta exibida pelo servidor.

### Opção 2: Usar Firebase emulador de funções
Se quiser testar as `functions` localmente:

1. Instale o Firebase CLI globalmente (se ainda não tiver):

   ```bash
   npm install -g firebase-tools
   ```

2. Faça login no Firebase:

   ```bash
   firebase login
   ```

3. Inicie o emulador de funções dentro da pasta `functions`:

   ```bash
   cd functions
   npm run serve
   ```

## Estrutura do projeto
- `pages/` - páginas HTML do cliente
- `public/` - arquivos públicos para hospedagem
- `components/` - componentes HTML reutilizáveis
- `scripts/` - scripts JavaScript do front-end
- `src/` - CSS e serviços auxiliares
- `functions/` - Cloud Functions Firebase
- `firebase.json` - configuração de hospedagem e funções Firebase

## Deploy
Para fazer deploy no Firebase hospedagem e funções, use:

```bash
firebase deploy
```

> Antes de fazer deploy, verifique se você já configurou o projeto Firebase local com `firebase init` e se está autenticado.

## Observações
- O `package.json` principal contém dependências de CSS/Tailwind e Firebase.
- O `functions/package.json` contém dependências do backend Firebase.
- Se precisar editar ou compilar CSS, verifique se há um fluxo de build manual para Tailwind ou PostCSS no projeto.

