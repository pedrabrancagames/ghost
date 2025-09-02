# Instruções de Deploy - Ghostbusters AR Multiplayer

## Pré-requisitos

1. **Firebase CLI instalado:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login no Firebase:**
   ```bash
   firebase login
   ```

3. **Inicializar projeto (se ainda não foi feito):**
   ```bash
   firebase init
   ```

## Deploy das Cloud Functions

1. **Navegar para a pasta functions:**
   ```bash
   cd functions
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Deploy das functions:**
   ```bash
   firebase deploy --only functions
   ```

## Deploy completo (Hosting + Functions + Database Rules)

```bash
firebase deploy
```

## Configurar Agendamento das Functions

As seguintes functions são executadas automaticamente:

- `generateGhosts`: A cada 2 horas
- `cleanupCaptureAttempts`: A cada 5 minutos  
- `cleanupInactivePlayers`: A cada 10 minutos

## Testar Functions Localmente

1. **Iniciar emuladores:**
   ```bash
   firebase emulators:start
   ```

2. **Testar function específica:**
   ```bash
   firebase functions:shell
   ```

## Monitorar Functions

1. **Ver logs:**
   ```bash
   firebase functions:log
   ```

2. **Ver logs de function específica:**
   ```bash
   firebase functions:log --only generateGhosts
   ```

## Estrutura das Functions Implementadas

### 1. generateGhosts (Agendada)
- **Frequência:** A cada 2 horas
- **Função:** Gera fantasmas automaticamente em todas as localizações
- **Limpeza:** Remove fantasmas expirados (>24h)

### 2. startCooperativeCapture (Trigger)
- **Trigger:** Quando um jogador inicia captura
- **Função:** Gerencia captura cooperativa para fantasmas fortes

### 3. completeCooperativeCapture (Trigger)
- **Trigger:** Quando captura é finalizada
- **Função:** Distribui pontos e marca fantasma como capturado

### 4. cleanupCaptureAttempts (Agendada)
- **Frequência:** A cada 5 minutos
- **Função:** Remove tentativas de captura expiradas

### 5. updatePlayerPosition (Trigger)
- **Trigger:** Quando posição do jogador é atualizada
- **Função:** Atualiza timestamp de atividade

### 6. cleanupInactivePlayers (Agendada)
- **Frequência:** A cada 10 minutos
- **Função:** Remove jogadores inativos (>10min)

### 7. sendChatMessage (Trigger)
- **Trigger:** Nova mensagem de chat
- **Função:** Gerencia histórico de chat (máx 50 mensagens)

## Configurações do Jogo

As configurações estão definidas em `functions/index.js`:

```javascript
const GAME_CONFIG = {
    GHOST_SPAWN_RADIUS: 0.001, // ~100m
    MAX_GHOSTS_PER_LOCATION: 5,
    GHOST_LIFETIME_HOURS: 24,
    STRONG_GHOST_PROBABILITY: 0.25,
    LOCATIONS: {
        "Praça Central": { lat: -27.630913, lon: -48.679793 },
        "Parque da Cidade": { lat: -27.639797, lon: -48.667749 },
        "Casa do Vô": { lat: -27.51563471648395, lon: -48.64996016391755 }
    }
};
```

## Troubleshooting

### Erro de permissões
```bash
firebase auth:login --reauth
```

### Erro de billing
- Certifique-se de que o projeto Firebase tem billing habilitado
- Functions agendadas requerem plano Blaze

### Erro de deploy
```bash
firebase deploy --only functions --debug
```

## Monitoramento em Produção

1. **Console do Firebase:** https://console.firebase.google.com
2. **Seção Functions:** Monitorar execuções e erros
3. **Seção Database:** Verificar dados em tempo real
4. **Logs:** Acompanhar atividade das functions

## Custos Estimados

- **Functions:** ~$0.40/milhão de invocações
- **Database:** ~$5/GB transferido
- **Hosting:** Gratuito até 10GB

Para um jogo com 100 jogadores ativos:
- Custo estimado: $5-15/mês