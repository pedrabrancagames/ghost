# Diário de Desenvolvimento: Ghostbusters AR

[...]

## 29/08/2025 - Implementação de Variedade de Fantasmas e Nova Captura

### Problema
O jogo precisava de mais profundidade e desafio. Além disso, o método de captura precisava ser alterado para usar o ícone do Proton Pack, e o posicionamento do fantasma em AR precisava ser automático.

### Solução
1.  **Variedade de Fantasmas:**
    - A função `generateGhost` agora cria fantasmas comuns ou fortes (25% de chance).
    - Fantasmas fortes têm mais pontos (25 vs 10) e maior duração de captura (8s vs 5s).
    - Ícones diferentes são usados no minimapa para diferenciar os tipos de fantasmas (logo para comum, PKE meter para forte).
2.  **Captura pelo Proton Pack:**
    - O botão de captura central foi removido do HTML.
    - O ícone do Proton Pack (`#proton-pack-icon`) agora é o elemento clicável para iniciar a captura.
    - Uma nova barra de progresso (`#proton-pack-progress-bar`) foi adicionada acima do ícone do Proton Pack para feedback visual durante a captura.
3.  **Posicionamento Automático:**
    - A lógica de posicionamento do objeto (`placeObject`) foi movida para dentro do loop `tick`.
    - Assim que a retícula encontra uma superfície, o objeto (`ghost` ou `ecto1`) é posicionado automaticamente, sem a necessidade de um clique adicional.
4.  **Correção de Escala:** A escala do objeto posicionado foi ajustada para `0.5 0.5 0.5` para garantir visibilidade.

Com estas alterações, o jogo agora possui um ciclo de gameplay mais dinâmico e uma interação de captura mais intuitiva.

## 30/08/2025 - Correção de Bug Crítico na Renderização e Captura

### Problema
Após os testes, foi identificado um bug crítico: o fantasma não aparecia em modo AR quando o jogador se aproximava da sua localização. Como consequência, a mecânica de captura via Proton Pack também não funcionava, pois dependia de um fantasma visível na cena.

### Solução
A causa raiz era um erro de referência no `main.js` que não determinava corretamente qual entidade de fantasma (comum ou forte) deveria ser renderizada.

1.  **Gestão de Estado do Fantasma Ativo:**
    - Foi introduzida uma nova variável `this.activeGhostEntity` para armazenar a referência à entidade do fantasma que está atualmente próximo ao jogador.
2.  **Refatoração da Lógica de Proximidade:**
    - A função `checkProximity` foi corrigida para, além de detectar a proximidade, definir qual fantasma (`ghostComumEntity` ou `ghostForteEntity`) deve ser o `activeGhostEntity`.
3.  **Correção das Funções de Jogo:**
    - As funções `placeObject` (que posiciona o fantasma em AR) e `ghostCaptured` (que o remove após a captura) foram atualizadas para usar a nova variável `activeGhostEntity`, garantindo que o modelo 3D correto seja exibido e, posteriormente, ocultado.

Essa correção restaurou o ciclo de gameplay, garantindo que a renderização do fantasma e a mecânica de captura voltem a funcionar como esperado.

## 30/08/2025 - Correção de Bug de Tela Branca Pós-Captura

### Problema
Após a captura de um fantasma, ao fechar a mensagem de confirmação (`alert`), a imagem da câmera em AR ficava completamente branca, interrompendo a jogabilidade. Os elementos de UI continuavam visíveis, mas o ambiente real não era mais renderizado.

### Solução
O problema era causado pelo uso da função `alert()`, que pausa toda a execução de scripts da página, incluindo o loop de renderização da câmera AR. Ao ser dispensado, o contexto de renderização do WebXR era perdido.

1.  **Criação de Notificação Customizada:** Foi implementado um modal de notificação não-bloqueante usando HTML, CSS e JavaScript.
2.  **Alteração do HTML (`index.html`):** Adicionada a estrutura para a janela de notificação.
3.  **Estilização (`style.css`):** Adicionadas regras de CSS para formatar a janela, garantindo que ela se sobreponha à UI do jogo sem bloquear a renderização.
4.  **Atualização do Script (`main.js`):** A lógica foi refatorada para substituir todas as chamadas de `alert()` pela nova função `showNotification()`, que exibe a mensagem na janela customizada sem pausar o jogo. Isso garante que a câmera continue funcionando após a exibição das mensagens.

## 30/08/2025 - Correção Final do Conflito de Câmera

### Problema
O scanner de QR Code falhava ao ser iniciado, mesmo após tentativas de correção. O log do console revelou o erro `TypeError: this.el.sceneEl.exitAR is not a function`.

### Solução
A causa raiz de todo o conflito de câmera era uma chamada de função incorreta. A biblioteca A-Frame não possui um método `exitAR()`.

1.  **Correção da Chamada da Função:** A chamada incorreta `this.el.sceneEl.exitAR()` foi substituída pela função correta da A-Frame, `this.el.sceneEl.exitVR()`, que é usada para encerrar tanto sessões de VR quanto de AR.
2.  **Manutenção do Atraso:** O `setTimeout` de 200ms foi mantido por precaução, garantindo que o navegador tenha tempo de liberar a câmera após a chamada correta de `exitVR()` e antes de o scanner de QR ser iniciado. Isso cria uma solução robusta para o gerenciamento do controle da câmera.

## 30/08/2025 - Correção de Reinicialização de Estado do Jogo

### Problema
Após usar o scanner de QR e retornar à tela de seleção para re-entrar no modo AR, a tela ficava preta. O console mostrava o erro `Map container is already initialized`, indicando que o estado do jogo não estava sendo totalmente resetado.

### Solução
O erro era causado pela tentativa de reinicializar a biblioteca de mapa (Leaflet.js) em um elemento `<div>` que já continha uma instância de mapa ativa da sessão anterior. A solução foi tornar a função de inicialização do mapa (`initMap`) idempotente.

1.  **Limpeza do Mapa Anterior:** A função `initMap` foi modificada para, antes de qualquer outra ação, verificar se uma instância do mapa (`this.map`) já existe. Se existir, o método `this.map.remove()` é chamado para destruir a instância antiga e limpar o container, garantindo que a nova inicialização ocorra em um estado limpo.

## 30/08/2025 - Correção Final da Animação do Fantasma

### Problema
As tentativas anteriores de animar o fantasma resultaram em um movimento incorreto (girando em seu próprio eixo) ou nenhum movimento. A composição de uma órbita circular com uma flutuação vertical não estava funcionando.

### Solução
A solução foi re-arquitetar a entidade do fantasma no `index.html` usando uma estrutura aninhada de 3 níveis, que separa as responsabilidades de cada movimento.

1.  **Entidade Âncora (`#ghost-comum`/`#ghost-forte`):** A entidade principal, que é posicionada no mundo pelo script `main.js`. Ela serve como o ponto central da órbita.
2.  **Entidade Orbitadora:** Uma entidade filha da âncora, responsável unicamente pela animação de `rotation` para criar o movimento circular.
3.  **Entidade do Modelo:** Uma entidade neta, filha da orbitadora. Ela contém o `gltf-model` e é deslocada do centro (ex: `position="1 0.3 0"`) para definir o raio da órbita. É nesta entidade que a animação de `position` (flutuação para cima e para baixo) é aplicada.

Essa estrutura garante que a rotação da entidade orbitadora mova a entidade do modelo em um círculo perfeito, enquanto a animação de posição da própria entidade do modelo a faz flutuar independentemente, resultando no efeito desejado.

## 30/08/2025 - Nova Funcionalidade: Pausar/Retomar Movimento do Fantasma

### Problema
O jogador desejava ter controle sobre o movimento do fantasma durante a captura, para facilitar o processo.

### Solução
Foi implementada a funcionalidade de pausar o movimento do fantasma quando o botão do Proton Pack é pressionado e retomá-lo caso a captura seja cancelada.

1.  **Armazenamento de Referências:** Adicionadas as propriedades `this.currentRotatorEntity` e `this.currentBobberEntity` para armazenar as referências das entidades de animação do fantasma ativo.
2.  **Pausar Animações:** Na função `startCapture`, as animações de rotação e flutuação do fantasma ativo são pausadas.
3.  **Retomar Animações:** Na função `cancelCapture`, as animações são retomadas.
4.  **Limpeza de Referências:** Na função `ghostCaptured`, as referências armazenadas são limpas após a captura do fantasma.

## 30/08/2025 - Nova Funcionalidade: Efeito Visual de Feixe de Prótons

### Problema
O jogo não possuía um feedback visual para o feixe de prótons durante a captura, o que diminuía a imersão.

### Solução
Foi adicionado um efeito visual de feixe de prótons que aparece quando o botão do Proton Pack é pressionado e desaparece quando é solto.

1.  **Entidade do Feixe:** Adicionada uma nova entidade `<a-entity>` para o feixe como filho da `a-camera` no `index.html`, utilizando o componente `line` para desenhar uma linha 3D.
2.  **Controle de Visibilidade:** No `main.js`, a visibilidade dessa entidade é controlada: ela é tornada visível na função `startCapture` e invisível na função `cancelCapture`.

## 30/08/2025 - Melhoria: Ajuste de Origem e Espessura do Feixe de Prótons

### Problema
O feixe de prótons estava saindo da ponta direita da imagem do Proton Pack e era muito fino, não correspondendo à expectativa visual.

### Solução
Foi ajustada a origem e a espessura do feixe para melhorar a imersão e a fidelidade visual.

1.  **Mudança para Cilindro:** O componente `line` foi substituído por um `a-cylinder` no `index.html` para permitir o controle da espessura.
2.  **Ajuste de Posição e Rotação:** A `position` e `rotation` do cilindro foram ajustadas para que o feixe pareça sair da ponta esquerda da imagem do Proton Pack e aponte corretamente para o centro da tela.

## 30/08/2025 - Melhoria: Refinamento da Origem do Feixe de Prótons (Volta para Linha)

### Problema
O feixe de prótons, após a tentativa com o cilindro, estava saindo do meio da parte inferior da tela e seguindo verticalmente para o centro, não da ponta da pistola. O usuário desejava que o feixe saísse da ponta superior esquerda da imagem do Proton Pack e fosse para o centro da tela.

### Solução
Para garantir a precisão da origem e do alvo do feixe, o componente `line` foi reintroduzido, pois permite um controle mais direto dos pontos de início e fim.

1.  **Reintrodução do Componente `line`:** A entidade `proton-beam-entity` no `index.html` foi alterada de volta para usar o componente `line`.
2.  **Ajuste Preciso dos Pontos:** Os pontos `start` e `end` da linha foram ajustados para `start: 0.4 -0.4 -0.5; end: 0 0 -10;`. Isso visa posicionar visualmente a origem do feixe na ponta superior esquerda da imagem do Proton Pack e direcioná-lo para o centro da tela.
3.  **Compensação da Espessura:** Embora o componente `line` não suporte espessura direta, a cor foi mantida vibrante e a opacidade alta para compensar visualmente.

## 30/08/2025 - Melhoria: Ajuste Fino da Origem do Feixe de Prótons (50px para Esquerda)

### Problema
O feixe de prótons ainda não estava saindo da posição exata desejada, necessitando de um ajuste mais fino para a esquerda.

### Solução
Foi realizado um ajuste na coordenada X do ponto de início do feixe para movê-lo visualmente 50px para a esquerda.

1.  **Ajuste da Coordenada X:** A coordenada X do ponto `start` do componente `line` foi alterada de `0.4` para `0.1`. Este ajuste visa mover a origem do feixe mais para a esquerda em relação à câmera, aproximando-a da ponta desejada da imagem do Proton Pack.

## 30/08/2025 - Melhoria: Ajuste Fino da Origem do Feixe de Prótons (5px para Direita)

### Problema
O feixe de prótons estava ligeiramente mais à esquerda do que o desejado, necessitando de um pequeno ajuste para a direita.

### Solução
Foi realizado um ajuste na coordenada X do ponto de início do feixe para movê-lo visualmente 5px para a direita.

1.  **Ajuste da Coordenada X:** A coordenada X do ponto `start` do componente `line` foi alterada de `0.1` para `0.15`. Este ajuste visa mover a origem do feixe ligeiramente para a direita em relação à câmera.

## 30/08/2025 - Melhoria: Aumentar Tamanho de Ícones da UI

### Problema
Os ícones do Proton Pack e da Ghost Trap estavam pequenos, dificultando a interação e a visibilidade.

### Solução
O tamanho dos ícones foi aumentado para melhorar a experiência do usuário.

1.  **Ajuste de Largura:** A largura (`width`) do `#proton-pack-icon` foi alterada de `110px` para `140px` e a do `#inventory-icon` de `90px` para `115px` no `style.css`.

## 30/08/2025 - Melhoria: Diminuir Espessura do Feixe de Prótons

### Problema
O feixe de prótons estava muito grosso, não correspondendo à expectativa visual.

### Solução
A espessura do feixe foi ajustada para um valor mais adequado.

1.  **Ajuste de Raio:** O raio (`radius`) do cilindro que representa o feixe foi alterado de `0.03` para `0.015` no `index.html`.

## 30/08/2025 - Melhoria: Ajustar Espessura do Feixe de Prótons (0.015 para 0.012)

### Problema
O feixe de prótons ainda estava mais grosso do que o desejado, necessitando de um ajuste fino.

### Solução
A espessura do feixe foi ajustada para um valor ainda menor.

1.  **Ajuste de Raio:** O raio (`radius`) do cilindro que representa o feixe foi alterado de `0.015` para `0.012` no `index.html`.

## 30/08/2025 - Melhoria: Posicionar Proton Pack e Barra de Progresso na Borda da Tela

### Problema
A imagem do Proton Pack e sua barra de progresso não estavam encostando nas bordas da tela, deixando um espaço indesejado.

### Solução
A posição dos elementos foi ajustada para que encostem nos limites da tela.

1.  **Ajuste de Posição:** As propriedades `bottom` e `right` do `#proton-pack-icon` foram alteradas de `20px` para `0px` no `style.css`. A propriedade `right` do `#proton-pack-progress-bar` também foi alterada de `10px` para `0px` para manter o alinhamento.

## 30/08/2025 - Melhoria: Ajuste Fino da Origem do Feixe de Prótons (Volta para Linha, Ajuste Fino X)

### Problema
O feixe de prótons não estava saindo da posição exata desejada, necessitando de ajustes finos na sua origem.

### Solução
Foram realizados ajustes finos na coordenada X do ponto de início do feixe para movê-lo visualmente para a posição desejada.

1.  **Ajuste da Coordenada X (0.4 para 0.1):** A coordenada X do ponto `start` do componente `line` foi alterada de `0.4` para `0.1` para movê-lo mais para a esquerda.
2.  **Ajuste da Coordenada X (0.1 para 0.15):** A coordenada X do ponto `start` do componente `line` foi alterada de `0.1` para `0.15` para um pequeno ajuste para a direita.