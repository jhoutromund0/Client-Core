# Acessibilidade do Client-Core

## Recursos disponíveis

- Ajuste de fonte entre 87,5% e 200%.
- Restauração das preferências padrão.
- Temas original, preto/amarelo, branco/preto e invertido.
- Fonte Atkinson Hyperlegible.
- Espaçamento ampliado entre linhas.
- Espaçamento de letras, palavras e parágrafos.
- Destaque visual de links.
- Cursor ampliado.
- Modo leitura.
- Guia e máscara de leitura.
- Lupa textual que acompanha o cursor.
- Redução manual e automática de movimentos.
- Avisos sonoros opcionais.
- Leitura em voz alta da página com controles para iniciar, pausar, continuar e parar.
- Tabelas apresentadas como cartões em telas pequenas.
- Persistência das escolhas no `localStorage`.
- Link para pular diretamente ao conteúdo principal.
- Foco visível e suporte a navegação por teclado.
- Mensagens dinâmicas anunciadas por leitores de tela.
- Modal do calendário com foco controlado e fechamento pela tecla `Escape`.

## Como testar

1. Abra qualquer página e acione o botão fixo `A`.
2. Altere cada opção, recarregue a página e confirme que a preferência permanece ativa.
3. Use somente `Tab`, `Shift + Tab`, `Enter`, `Espaço` e `Escape` para navegar.
4. Amplie o zoom do navegador até 200% e confira as páginas em desktop e mobile.
5. Ative os temas de contraste, modo leitura, guia, máscara e lupa textual.
6. Clique em `Ouvir página` e teste os controles de pausa, continuação e parada.
7. Envie formulários vazios para verificar mensagens, foco no campo inválido e estados de erro.
8. No calendário, abra o formulário de visita, percorra seus campos com `Tab` e feche com `Escape`.
9. Use um leitor de tela para confirmar títulos, botões, mensagens de status e ações de tabelas.

## Observações

- As integrações Firebase, APIs, coleções e regras de negócio não foram modificadas.
- A página Financeiro continua sem funcionalidade de negócio.
- O projeto ainda não possui uma suíte automatizada de acessibilidade.
