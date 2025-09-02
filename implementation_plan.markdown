# Plano de Implementação

## Plano de Implementação para o Jogo AR Ghostbusters

### 1. Fases do Projeto
- **Fase 1: Configuração e MVP (2-4 semanas)**:
  - Configurar repositório GitHub e Pages para hospedagem.
  - Integrar Firebase: Auth, DB, Cloud Functions.
  - Implementar login, seleção de local, barra de pré-carregamento.
  - AR básico: Feed de câmera com sobreposição simples (testar modelo .glb).
  - Suporte offline: Manifesto PWA, Service Worker para cache.
  - Ferramentas: Usar Gemini CLI para geração de código (ex.: "Gerar código de autenticação Firebase").

- **Fase 2: Gameplay Principal (4-6 semanas)**:
  - Minimapa com Leaflet.js; integração de GPS.
  - Geração de fantasmas: Função Cloud agendada (diária via cron).
  - Detecção AR: AR.js para colocação em superfícies; verificação de proximidade (5m).
  - Mecânicas de captura: Temporizador de botão, animação de feixe de prótons.
  - Inventário e depósito por QR: API de escaneamento de QR do navegador.
  - **Melhoria**: Adicionar tela de tutorial.
  - Testes: Emular GPS nas ferramentas de desenvolvimento do navegador.

- **Fase 3: Multiplayer e Sincronização (3-5 semanas)**:
  - DB em tempo real para status de fantasmas (flags de captura).
  - Cooperação para fantasmas fortes: Detecção de proximidade + pressão simultânea.
  - Sincronização offline: IndexedDB para fantasmas locais; persistência offline do Firebase.
  - Página de ranking: Consultar DB e exibir tabela.
  - **Melhoria**: Avatares de jogadores no mapa; chat local.

- **Fase 4: Polimento e Melhorias (2-4 semanas)**:
  - Easter eggs: Ativar Ecto-1 após marcos.
  - Modo de foto: Captura em Canvas + compartilhamento.
  - **Melhorias**: Variedade de fantasmas, níveis, insígnias.
  - Otimização: Comprimir assets, verificar bateria.

- **Fase 5: Testes e Lançamento (2 semanas)**:
  - Testes unitários: Jest para JS.
  - Testes no mundo real: Nos locais especificados.
  - Beta: Compartilhar link para feedback.
  - Lançamento: Deploy no GitHub Pages; monitorar Firebase.

### 2. Tecnologias e Ferramentas
- **Pilha Principal**: HTML/JS/CSS, AR.js/A-Frame/Three.js, Firebase, Leaflet.js.
- **Ferramentas de Desenvolvimento**: VS Code, Gemini CLI para codificação assistida por IA (ex.: gerar módulos).
- **Controle de Versão**: Git; branches para funcionalidades.
- **Estimativa de Tempo**: Desenvolvedor solo, 20-30 horas/semana.

### 3. Riscos e Mitigações
- Compatibilidade AR: Testar em várias versões de Android; fallback para 2D se WebXR falhar.
- Precisão de GPS: Aumentar margem (ex.: 7m em vez de 5m).
- Limites do Firebase: Monitorar uso; escalar para plano pago se necessário.
- Questões de IP: Marcar como projeto de fã; usar assets originais.

### 4. Marcos
- MVP: Caça single-player funcional.
- Beta: Multiplayer completo.
- Lançamento: Com todas as melhorias.