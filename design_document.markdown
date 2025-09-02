# Documento de Design

## Documento de Design para o Jogo AR Ghostbusters

### 1. Arquitetura do Sistema
- **Frontend**: Aplicativo web com HTML/CSS/JS. AR via AR.js + A-Frame (renderização de .glb/.gltf no feed da câmera). PWA para cache offline (Service Workers, IndexedDB para armazenamento local).
- **Backend**: Firebase Realtime Database para posições de fantasmas, pontuações e ranking. Cloud Functions para geração diária de fantasmas e verificação de áreas públicas (integrar API OpenStreetMap).
- **Fluxo de Dados**:
  - Login → Seleção de local → Pré-carregamento de assets → Permissões → Câmera AR inicia.
  - Dados de fantasmas sincronizados do DB; cache local para offline.
  - Multiplayer: DB em tempo real escuta eventos de captura/cooperação.
- **Módulos**:
  - Módulo de Autenticação: Firebase Auth.
  - Módulo AR: WebXR/AR.js para sobreposições.
  - Módulo de Mapa: Leaflet.js (open-source) para minimapa com integração de GPS.
  - Módulo de Sincronização: Persistência offline do Firebase.

### 2. Design de UI/UX
- **Telas**:
  - Tela de Login: Botão do Google.
  - Seleção de Local: Visualização de mapa com dois pontos e círculos de raio.
  - Tela de Carregamento: Barra de progresso com animação temática (ex.: gosma verde).
  - Jogo Principal: Fundo de câmera AR; sobreposições conforme descrito.
  - Inventário: Lista de fantasmas capturados com detalhes (tipo, pontos).
  - Configurações: Volume, logout, alternância de tutorial.
  - Ranking: Tabela com nomes de jogadores, fantasmas capturados, pontos.
- **Estilo Visual**: Tema retrô dos anos 80 de *Ghostbusters* – gosma verde, feixes de prótons em gradientes vermelho/azul. Modelos 3D: Fantasmas, Ecto-1 de assets open-source.
- **Interações**:
  - Feixe de Prótons: Animação em Canvas JS (linha da pistola ao centro da tela).
  - Minimapa: Zoom interativo; marcadores para fantasmas (vermelho), jogador (verde), contenção (azul).
  - Modo de Foto: API Web Share para exportação social.
- **Melhoria**: Design responsivo para diferentes tamanhos de tela; feedback tátil na captura (se o navegador suportar).

### 3. Design de Gameplay
- **Ciclo Principal**: Escolher local → Caçar fantasmas no mapa → Navegar fisicamente → Capturar em AR → Encher inventário → Depositar via QR → Repetir com progressão.
- **Balanceamento**:
  - Tipos de Fantasmas: 70% normais, 20% fortes, 10% raros.
  - Pontos: Escalados por dificuldade; bônus para cooperação.
  - Reinício Diário: Fantasmas regeneram à meia-noite UTC.
- **Design Multiplayer**: Detecção de cooperação via proximidade de geolocalização e flags no DB (ex.: ambos jogadores "mirando" mesmo ID de fantasma).
- **Easter Eggs**: Ativados por marcos; Ecto-1 como entidade estática no DB.
- **Melhoria**: Power-ups (ex.: captura mais rápida) escondidos em AR.

### 4. Modelos de Dados
- **Usuário**: ID, nome, pontos, contagem de capturas, nível.
- **Fantasma**: ID, posição (lat/long), tipo (normal/forte/raro), força, capturadoPor (array para cooperação).
- **Local**: Lat/long central, raio.
- **Ranking**: Lista ordenada do DB.

### 5. Segurança e Privacidade
- Dados de localização: Compartilhados apenas para multiplayer com consentimento.
- Escaneamento de QR: Usar API de QR do navegador; validar contra códigos fixos no DB.