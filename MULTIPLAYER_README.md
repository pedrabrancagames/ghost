# Sistema Multiplayer - Ghostbusters AR

## 🌟 Funcionalidades Implementadas

### ✅ 1. Geração Automática de Fantasmas
- **Cloud Function agendada** que executa a cada 2 horas
- Gera até 5 fantasmas por localização
- Remove fantasmas expirados (>24h)
- 25% de chance de fantasmas fortes
- Distribuição geográfica realista

### ✅ 2. Cooperação Multiplayer para Fantasmas Fortes
- **Fantasmas Fortes** requerem 2+ jogadores próximos
- Sistema de captura cooperativa em tempo real
- Distribuição automática de pontos entre participantes
- UI dedicada para coordenação de equipe

### ✅ 3. Detecção de Proximidade entre Jogadores
- Raio de detecção: 50 metros
- Atualização de posição a cada 5 segundos
- Cálculo preciso usando fórmula Haversine
- Indicadores visuais de jogadores próximos

### ✅ 4. Avatares de Jogadores no Mapa
- Avatares emoji únicos baseados no ID do jogador
- Marcadores animados no mapa Leaflet
- Indicação de status (explorando/capturando)
- Tooltips com informações do jogador

### ✅ 5. Chat Local entre Jogadores
- Chat por localização geográfica
- Histórico limitado (50 mensagens)
- Interface colapsável e responsiva
- Notificações para novas mensagens

### ✅ 6. Sincronização em Tempo Real
- Firebase Realtime Database
- Atualizações instantâneas de posição
- Sincronização de capturas cooperativas
- Limpeza automática de dados antigos

## 🏗️ Arquitetura do Sistema

### Cloud Functions (Backend)
```
functions/
├── index.js              # Todas as Cloud Functions
├── package.json          # Dependências Node.js
└── .eslintrc.js          # Configuração de linting
```

### Cliente (Frontend)
```
├── multiplayer-manager.js    # Gerenciador principal
├── multiplayer-styles.css    # Estilos da UI
├── multiplayer-test.js       # Testes automatizados
└── main.js                   # Integração com o jogo
```

### Banco de Dados
```
firebase-database/
├── users/                # Dados dos jogadores
├── ghosts/               # Fantasmas gerados
├── players/              # Jogadores online
├── chat/                 # Mensagens por localização
└── notifications/        # Notificações do sistema
```

## 🚀 Como Usar

### Para Jogadores

1. **Login**: Faça login com Google, email ou como visitante
2. **Localização**: Escolha uma área de caça
3. **Multiplayer**: O sistema conecta automaticamente
4. **Chat**: Use o chat local para coordenar com outros jogadores
5. **Cooperação**: Para fantasmas fortes, aproxime-se de outros jogadores
6. **Captura**: Pressione e segure o proton pack simultaneamente

### Para Desenvolvedores

1. **Deploy das Functions**:
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

2. **Testar Localmente**:
   ```bash
   firebase emulators:start
   ```

3. **Executar Testes**:
   ```javascript
   // No console do navegador
   window.testMultiplayer();
   ```

## 📊 Métricas e Monitoramento

### Cloud Functions
- `generateGhosts`: Executa a cada 2 horas
- `cleanupCaptureAttempts`: Executa a cada 5 minutos
- `cleanupInactivePlayers`: Executa a cada 10 minutos

### Dados em Tempo Real
- Posição dos jogadores: Atualizada a cada 5 segundos
- Lista de jogadores próximos: Atualizada a cada 3 segundos
- Chat: Sincronização instantânea

### Limpeza Automática
- Fantasmas expirados: Removidos após 24 horas
- Jogadores inativos: Removidos após 10 minutos
- Tentativas de captura: Expiram em 30 segundos

## 🎮 Fluxo de Jogo Multiplayer

### 1. Conexão
```
Jogador faz login → Registra no Firebase → Aparece para outros jogadores
```

### 2. Exploração
```
Atualiza posição → Detecta jogadores próximos → Mostra no mapa
```

### 3. Chat
```
Digita mensagem → Envia para Firebase → Outros jogadores recebem
```

### 4. Captura Cooperativa
```
Fantasma Forte detectado → Verifica jogadores próximos → Inicia captura cooperativa → Distribui pontos
```

## 🔧 Configurações

### Raios de Detecção
- **Proximidade entre jogadores**: 50m
- **Captura cooperativa**: 10m
- **Spawn de fantasmas**: 100m

### Intervalos de Atualização
- **Posição do jogador**: 5 segundos
- **Lista de jogadores**: 3 segundos
- **Geração de fantasmas**: 2 horas

### Limites
- **Fantasmas por localização**: 5
- **Mensagens de chat**: 50
- **Tempo de captura**: 30 segundos

## 🐛 Troubleshooting

### Problemas Comuns

1. **Jogadores não aparecem no mapa**
   - Verificar permissões de localização
   - Confirmar conexão com Firebase
   - Checar se está na mesma área geográfica

2. **Chat não funciona**
   - Verificar autenticação
   - Confirmar regras do Firebase Database
   - Checar se está na mesma localização

3. **Captura cooperativa não inicia**
   - Verificar se há jogadores próximos (50m)
   - Confirmar que é um Fantasma Forte
   - Checar conexão com Firebase

### Debug

1. **Console do navegador**:
   ```javascript
   // Verificar estado do multiplayer
   console.log(window.gameManager.multiplayerManager);
   
   // Executar testes
   window.testMultiplayer();
   ```

2. **Firebase Console**:
   - Verificar dados em tempo real
   - Monitorar execução das functions
   - Checar logs de erro

## 📈 Próximas Melhorias

### Planejadas
- [ ] Sistema de amizades
- [ ] Grupos privados de caça
- [ ] Eventos especiais multiplayer
- [ ] Ranking global em tempo real
- [ ] Notificações push

### Otimizações
- [ ] Cache inteligente de jogadores
- [ ] Compressão de dados de posição
- [ ] Batching de atualizações
- [ ] Offline-first para chat

## 💰 Custos Estimados

### Firebase (100 jogadores ativos)
- **Functions**: ~$5/mês
- **Database**: ~$10/mês
- **Hosting**: Gratuito
- **Total**: ~$15/mês

### Escalabilidade
- **1.000 jogadores**: ~$50/mês
- **10.000 jogadores**: ~$200/mês

## 🔐 Segurança

### Regras do Database
- Jogadores só podem editar seus próprios dados
- Chat requer autenticação
- Fantasmas são read-only para jogadores
- Notifications são write-only para functions

### Validação
- Mensagens de chat limitadas a 100 caracteres
- Posições validadas no servidor
- Rate limiting automático do Firebase

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar logs no console do navegador
2. Consultar Firebase Console
3. Executar testes automatizados
4. Verificar documentação do Firebase