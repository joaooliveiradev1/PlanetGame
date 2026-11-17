# Planeta em Jogo — Instruções do projeto

## Objetivo e público

Planeta em Jogo é um projeto acadêmico de extensão com jogos educativos
sobre ecologia, meio ambiente e sustentabilidade.

Público principal: crianças de 6 a 8 anos, com diferentes níveis de leitura.

O personagem Theo guia as atividades. O produto deve ensinar relações
e consequências, não apenas premiar cliques ou memorização de respostas.

A documentação acadêmica original descreve um quiz educativo relacionado
ao ODS 4 — Educação de Qualidade. O protótipo evoluiu para minijogos.
Não considere essa divergência resolvida sem conferir a documentação atual.

## Primeiro passo de toda tarefa

1. Leia os arquivos envolvidos e confira o estado real do repositório.
2. Execute `git status` antes de alterar arquivos.
3. Identifique alterações existentes do usuário e preserve-as.
4. Diferencie recursos implementados, recursos incompletos e propostas.
5. Apresente um plano curto para mudanças que afetem vários arquivos.
6. Não reescreva o projeto inteiro para resolver um problema localizado.

Este arquivo descreve o contexto conhecido, não substitui a inspeção do código.

## Stack e restrições

- HTML5, CSS3 e JavaScript vanilla.
- Módulos ES com `import` e `export`.
- Aplicação estática, sem backend.
- Publicação pelo GitHub Pages.
- Não adicionar React, Next.js, TypeScript, bundler ou dependências sem aprovação.
- Não adicionar login, banco de dados, anúncios, analytics ou coleta de
  dados pessoais de crianças sem uma decisão explícita do responsável.
- Não presumir que existe `package.json`, build ou suíte de testes.
- Não executar instalação de dependências apenas por conveniência.

## Estrutura conhecida

Confirme os caminhos antes de trabalhar:

- `index.html`: estrutura principal, menu e tela dos jogos.
- `style.css`: identidade visual, responsividade e estilos dos jogos.
- `assets/`: imagens do Theo, marca e ícone.
- `js/main.js`: inicialização da aplicação e eventos de navegação.
- `js/core/dom.js`: consultas ao DOM, renderização e utilitários.
- `js/core/lifecycle.js`: estado e limpeza de eventos, timers e animações.
- `js/core/router.js`: registro de jogos, menu, navegação e conclusão.
- `js/data/games.js`: metadados dos jogos apresentados no menu.
- `js/games/legacy.js`: jogos ainda não extraídos e/ou mapa de inicializadores.
- `js/games/garden.js`: Jardim do Theo.
- `js/games/quiz.js`: EcoQuiz.

Outros arquivos podem existir. Inspecione antes de criar arquivos duplicados.
Pode haver arquivos com o mesmo nome em `js/data/` e `js/games/`;
não confunda banco de conteúdo com lógica de interação.

## Jogos e estado histórico

O protótipo inicial tinha dez minijogos. A direção posterior foi reduzir
para poucos jogos com mais qualidade pedagógica.

A seleção de quatro jogos usada durante a refatoração foi:

- EcoQuiz do Theo.
- Fábrica da Reciclagem.
- Gota a Gota.
- Jardim do Theo.

Houve proposta de trocar Gota a Gota por EcoMemória, mas não presuma
que essa troca foi aprovada ou implementada. Confira o menu e o registro.

Últimas implementações discutidas:

- Jardim: cuidados interativos com água e luz, seguidos de identificação
  das partes de uma planta.
- EcoQuiz: seis perguntas, alternativas ilustradas, feedback explicativo,
  contagem de acertos na primeira tentativa e leitura opcional por voz.

Esses itens precisam ser verificados no código e no navegador.

## Arquitetura e integração

- Preserve os contratos existentes enquanto extrai módulos.
- Confira como os inicializadores são registrados antes de mudar exports.
- Ao extrair uma função do `legacy.js`, remova sua declaração antiga
  antes de importar uma função com o mesmo nome.
- Não deixe imports apontando para arquivos inexistentes.
- Não introduza novos ciclos de dependência.
- Centralize os metadados do menu em `js/data/games.js`.
- Separe dados educativos da lógica quando isso simplificar manutenção.
- Não faça uma reorganização ampla junto de uma correção urgente.

### Ciclo de vida

- Use os utilitários existentes para eventos, timers e animações quando adequados.
- Ao sair ou reiniciar, limpe listeners, intervalos, timeouts,
  requestAnimationFrame e narração.
- Não acumule handlers ao entrar novamente em um jogo.
- Evite registrar um listener global novo a cada renderização.
- Não permita callbacks alterarem uma tela que já foi desmontada.
- Bloqueie cliques repetidos em ações de avanço e conclusão.
- Não modifique o gerenciamento global de eventos sem avaliar os outros jogos.

### Voz

Se usar `speechSynthesis`:

- Faça detecção de suporte.
- Mantenha o jogo utilizável sem voz.
- Ofereça controle para ouvir e silenciar.
- Cancele a fala ao sair, reiniciar ou ocultar a página.
- Não garanta voz pt-BR em todos os aparelhos.
- Não deixe a voz ser o único meio de apresentar uma instrução.

## Diretrizes pedagógicas

- Cada jogo deve ter um objetivo de aprendizagem explícito.
- Use situações concretas próximas do cotidiano infantil.
- Apresente uma instrução principal por vez.
- Prefira frases curtas, figuras identificáveis e rótulos claros.
- O feedback deve explicar por que uma ação funciona ou não.
- Permita tentar novamente sem punição humilhante.
- Não confunda desempenho motor, velocidade ou leitura com aprendizagem.
- Pontuação é feedback de jogo, não prova de aprendizagem.
- Não afirme eficácia pedagógica sem avaliação com usuários.

### Precisão científica

- Não invente habilidades, códigos ou descrições da BNCC.
- Consulte a documentação disponível e fontes confiáveis antes de
  adicionar referências curriculares.
- Não apresente uma simplificação da simulação como regra universal.
- No Jardim, revise a ideia de "encher uma barra de sol":
  luz não deve ser ensinada como um reservatório idêntico à água.
- Diferencie tempo do jogo de tempo real de crescimento das plantas.
- Evite generalizações sobre todas as espécies de plantas ou animais.
- Corrija conteúdos enganosos mesmo que já existam no protótipo.
- Preserve a precisão usando linguagem acessível, sem excesso de termos técnicos.

## Design e acessibilidade

- Preserve a identidade do Planeta em Jogo e o personagem Theo.
- Priorize a área de interação, não decoração excessiva.
- Mantenha padrões consistentes de botões, feedback e navegação.
- Use botões nativos para ações.
- Permita uso por toque, mouse e teclado.
- Evite interações exclusivamente por arrastar ou manter pressionado;
  forneça uma alternativa acessível quando necessário.
- Garanta foco visível e textos legíveis.
- Não dependa apenas de cor para comunicar estado.
- Não dependa apenas de emoji para transmitir informação essencial.
- Verifique layout em telas pequenas.
- Respeite `prefers-reduced-motion` para animações não essenciais.
- Evite cronômetros punitivos por padrão.

## Execução local

Abra a raiz do projeto no VS Code e use Live Server.

Alternativa, se Python estiver instalado:

    python -m http.server 5500

Acesse:

    http://localhost:5500

Use servidor HTTP local para testar módulos ES.
Não use abertura direta por `file://` como fluxo oficial de desenvolvimento.

## GitHub Pages

Repositório conhecido pelo histórico:

    joaooliveiradev1/PlanetGame

Endereço esperado:

    https://joaooliveiradev1.github.io/PlanetGame/

Configuração histórica:

- Deploy from a branch.
- Branch `main`.
- Pasta `/ (root)`.

Confirme a configuração atual antes de alterá-la.

Regras:

- Mantenha `index.html` na pasta publicada.
- Use caminhos relativos compatíveis com `/PlanetGame/`.
- Não use `/assets/...` ou `/js/...` como caminhos de raiz do domínio.
- Confira maiúsculas e minúsculas em arquivos e imports.
- Não adicione backend necessário para executar os jogos.
- Não faça commit, push, publicação ou alteração nas configurações
  do repositório sem autorização explícita.

## Verificação antes de concluir

Teste, conforme os recursos disponíveis:

1. Carregamento do menu e dos assets.
2. Abertura de cada jogo registrado.
3. Acerto, erro e recuperação após erro.
4. Conclusão e tela de resultado.
5. Reinício no meio da partida.
6. Volta ao menu e abertura de outro jogo.
7. Ausência de timers, eventos ou voz ativos após sair.
8. Cliques rápidos e repetidos.
9. Teclado e foco.
10. Layout em celular.
11. Console sem erros e rede sem arquivos faltando.
12. Caminhos compatíveis com GitHub Pages.

Se não houver navegador ou ferramenta de teste disponível, informe
exatamente o que foi verificado e o que ainda exige teste manual.

Não diga "testado e funcionando" quando apenas leu o código.
Não trate testes de uma lógica isolada como validação da interface integrada.

## Forma de trabalhar e responder

- Responda em português brasileiro.
- Seja direto, prático e incremental.
- Questione premissas incorretas com justificativa.
- Trabalhe em um jogo ou problema por vez.
- Não altere arquivos fora do escopo sem explicar a necessidade.
- Se pedirem um arquivo completo, entregue sem trechos omitidos.
- Ao editar diretamente, resuma os arquivos alterados e os testes executados.
- Diferencie correção de bug, refatoração interna e redesign de mecânica.
- Não chame troca de textos e cores de redesign completo.
- Não exclua arquivos nem descarte mudanças do usuário sem autorização.
- Não use comandos destrutivos como `git reset --hard` ou `git clean -fd`.
