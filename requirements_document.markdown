# Documento de Requisitos

## Documento de Requisitos para o Jogo AR Ghostbusters

### 1. Introdução
- **Visão Geral do Projeto**: Um jogo de realidade aumentada (AR) multiplayer inspirado no filme *Ghostbusters* (1984). Jogadores caçam fantasmas em locais reais usando navegadores móveis em dispositivos Android, combinando geolocalização, sobreposições AR e interações multiplayer, com suporte a jogabilidade offline após carregamento inicial.
- **Escopo**: O jogo é restrito a áreas públicas específicas (como praças ou parques), utiliza tecnologias open-source e é hospedado no GitHub Pages com Firebase para serviços de backend.
- **Plataforma-Alvo**: Navegador móvel em Android (preferencialmente Chrome para suporte ao WebXR).
- **Premissas**: Jogadores possuem dispositivos com GPS; conexão à internet para login inicial e sincronização; uso exclusivo de ferramentas open-source.

### 2. Requisitos Funcionais
#### 2.1 Autenticação e Integração
- Os usuários devem fazer login via autenticação do Google (Firebase Auth) ou alternativa (ex.: email/senha ou login anônimo para testes).
- Após o login, os jogadores escolhem um dos locais iniciais: (-27.630913943568615, -48.6797938775685) ou (-27.639797222118094, -48.667749350838676).
- Definir um raio (ex.: 300 metros) ao redor do local selecionado onde o jogo ocorre.
- Exibir uma barra de carregamento para pré-carregar assets (imagens, áudios, modelos 3D em .glb/.gltf) para jogabilidade offline.
- Solicitar permissões (câmera, GPS, etc.) após o pré-carregamento.
- **Melhoria**: Adicionar um modo tutorial na primeira jogada para guiar os jogadores pelas mecânicas.

#### 2.2 Mecânicas de Jogo
- **Geração de Fantasmas**: Gerar fantasmas aleatoriamente uma vez por dia em áreas públicas (ruas, calçadas, praças) dentro do raio. Posições fixas durante o dia, visíveis no minimapa. Usar API de mapas (ex.: OpenStreetMap) para garantir locais públicos.
- **Detecção e Captura de Fantasmas**:
  - Jogadores navegam até 5 metros da localização do fantasma; AR exibe o modelo 3D na superfície próxima.
  - Captura: Apontar o centro da câmera para o fantasma, segurar o botão central inferior por 5 segundos para disparar o feixe de prótons (implementado via código, ex.: animação CSS/JS).
  - Se o botão for solto antes de 5 segundos, o fantasma escapa.
  - Fantasmas normais: O primeiro jogador a capturar leva; o fantasma desaparece para outros.
  - Fantasmas fortes: Exigem dois jogadores segurando simultaneamente por 5 segundos; ambos recebem no inventário com pontos extras. Tentativa solo exibe mensagem de áudio/texto: "Esse fantasma é forte demais! Chame um amigo."
- **Inventário**: Limite de 5 fantasmas. Acessado via botão Ghost Trap (canto superior direito).
- **Unidade de Contenção**: QR Code fixo no local real dentro do raio. Escanear para depositar fantasmas e enviar pontos ao banco de dados.
  - Quando o inventário estiver cheio, o minimapa amplia automaticamente mostrando a unidade de contenção mais próxima.
- **Interações Multiplayer**:
  - Modo online: Interações em tempo real, posições de fantasmas compartilhadas, cooperação para fantasmas fortes.
  - Modo offline: Continuar jogando localmente; sincronizar pontos ao reconectar.
  - **Melhoria**: Mostrar avatares de outros jogadores no minimapa (com opção de privacidade); bolhas de chat local em AR quando próximos.
- **Progressão e Easter Eggs**:
  - Após depositar 5 fantasmas, o Ecto-1 aparece como objeto AR estático e observável em um local fixo.
  - Modo de foto: Capturar capturas de tela com elementos AR para compartilhamento social.
- **Pontuação e Ranking**: Pontos por fantasma (ex.: 10 para normais, 25 para fortes). Ranking global no site, com filtros (diário/semanal).
  - **Melhoria**: Adicionar níveis, insígnias (ex.: "Mestre Caçador") e tipos variados de fantasmas (raros após 10 capturas).

#### 2.3 Elementos de Interface e Experiência do Usuário (UI/UX)
- **Layout Principal**:
  - Superior Esquerdo: Logo do jogo (botão para configurações).
  - Superior Direito: Ghost Trap (botão de inventário).
  - Inferior Direito: Pistola Proton Pack.
  - Inferior Central: Botão de captura (dispara feixe de prótons ao centro da tela).
  - Inferior Esquerdo: Minimapa com posição do jogador, fantasmas e unidade de contenção. Clique para ampliar; amplia automaticamente se fora do raio ou com inventário cheio.
- **Integração AR**: Câmera como fundo com sobreposições 3D.
- **Melhoria**: Avisos para jogabilidade segura (ex.: evitar tráfego).

#### 2.4 Sincronização Offline/Online
- Após pré-carregamento, jogar offline; armazenar dados localmente (ex.: fantasmas capturados).
- Sincronizar pontuação com Firebase ao reconectar.

### 3. Requisitos Não-Funcionais
- **Desempenho**: AR fluido em dispositivos Android intermediários; pré-carregamento otimizado para conexões lentas.
- **Segurança**: Regras do Firebase para acesso a dados; privacidade para dados de localização.
- **Escalabilidade**: Camada gratuita do Firebase para usuários iniciais; monitorar limites.
- **Legal**: Jogo de fã; sem monetização direta para evitar problemas de propriedade intelectual.
- **Tecnologias**: Apenas open-source (AR.js, A-Frame, Three.js para AR; Firebase para DB/Auth; PWA para offline).
- **Melhoria**: Otimização de bateria (limitar renderização AR); tratamento de erros para imprecisões de GPS (variância de 5-10m).

### 4. Restrições
- Sem aplicativo nativo; apenas navegador.
- Assets: .glb/.gltf para modelos 3D.
- Hospedagem: GitHub Pages + Firebase.

### 5. Dependências
- Serviços Externos: Firebase (Auth, Realtime DB, Cloud Functions), OpenStreetMap para verificação de áreas públicas.