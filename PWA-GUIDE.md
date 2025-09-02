# Guia PWA - Ghostbusters AR

## Visão Geral

O Ghostbusters AR agora é uma Progressive Web App (PWA) completa com suporte offline, cache inteligente, indicadores de progresso avançados e monitoramento de performance.

## Recursos Implementados

### 1. Progressive Web App (PWA)

#### Manifesto PWA
- **Arquivo**: `site.webmanifest`
- **Recursos**: Nome, ícones, tema, modo standalone
- **Instalação**: Suporte para instalação em dispositivos móveis e desktop

#### Service Worker
- **Arquivo**: `service-worker.js`
- **Estratégias de Cache**:
  - Cache First: Assets estáticos (JS, CSS, imagens, modelos 3D)
  - Network First: APIs e conteúdo dinâmico
  - Stale While Revalidate: Recursos híbridos
- **Cache Offline**: Página offline personalizada (`offline.html`)

### 2. Sistema de Loading e Pré-carregamento

#### Loading Manager
- **Arquivo**: `loading-manager.js`
- **Recursos**:
  - Tela de loading personalizada com animações
  - Barra de progresso com indicadores detalhados
  - Dicas rotativas durante o carregamento
  - Carregamento inteligente de assets

#### Progress Indicators
- **Arquivo**: `progress-indicators.js`
- **Tipos de Indicadores**:
  - Circular: Para operações gerais
  - Linear: Para downloads e uploads
  - Dots: Para processos em etapas
  - Multi-task: Para múltiplas operações simultâneas

### 3. Cache Inteligente

#### Cache Manager
- **Arquivo**: `cache-manager.js`
- **Recursos**:
  - Estratégias de cache por tipo de recurso
  - Limpeza automática de cache antigo
  - Controle de tamanho máximo do cache
  - Estatísticas de hit/miss rate

### 4. Monitoramento de Performance

#### Performance Monitor
- **Arquivo**: `performance-monitor.js`
- **Métricas Monitoradas**:
  - FPS (Frames por segundo)
  - Uso de memória
  - Taxa de cache hit
  - Status da bateria
  - Tipo de conexão de rede
  - Tempo de carregamento de recursos

#### Adaptações Automáticas
- **Conexão Lenta**: Reduz qualidade e desabilita efeitos
- **Bateria Baixa**: Ativa modo economia de energia
- **FPS Baixo**: Otimizações automáticas de performance
- **Memória Alta**: Limpeza automática de cache

### 5. Inicialização da Aplicação

#### App Initializer
- **Arquivo**: `app-initializer.js`
- **Processo de Inicialização**:
  1. Configuração PWA e Service Worker
  2. Pré-carregamento de assets críticos
  3. Inicialização de sistemas do jogo
  4. Verificação de permissões
  5. Finalização e ocultação do loading

## Como Usar

### Instalação como PWA

#### Android/Chrome
1. Abra o site no Chrome
2. Toque no menu (⋮) → "Adicionar à tela inicial"
3. Confirme a instalação

#### iOS/Safari
1. Abra o site no Safari
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"

#### Desktop
1. Abra o site no Chrome/Edge
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação

### Uso Offline

O app funciona offline com recursos limitados:
- Interface principal disponível
- Assets em cache carregam normalmente
- Funcionalidades que dependem de rede mostram avisos
- Página offline personalizada quando necessário

### Indicadores de Progresso

#### Uso Básico
```javascript
// Criar indicador circular
const indicator = progressIndicators.createIndicator('meu-processo', {
    type: 'circular',
    size: 'medium',
    showPercentage: true
});

// Atualizar progresso
progressIndicators.updateIndicator('meu-processo', 50, 'Carregando...');

// Remover quando concluído
progressIndicators.removeIndicator('meu-processo');
```

#### Indicador Global
```javascript
// Mostrar progresso global
progressIndicators.showGlobalProgress('Inicializando...');
progressIndicators.updateGlobalProgress(75, 'Quase pronto...');
progressIndicators.hideGlobalProgress();
```

### Cache Manager

#### Cachear Recursos
```javascript
// Cache com estratégia específica
const response = await cacheManager.cacheResource('/api/data', 'network-first');

// Pré-carregar múltiplos recursos
const urls = ['asset1.png', 'asset2.glb', 'audio.mp3'];
await cacheManager.preloadResources(urls, (loaded, total, url) => {
    console.log(`${loaded}/${total}: ${url}`);
});
```

#### Verificar Status
```javascript
// Estatísticas do cache
const stats = cacheManager.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);

// Verificar se recurso está em cache
const isCached = await cacheManager.isResourceCached('/asset.png');
```

### Performance Monitor

#### Monitorar Operações
```javascript
// Marcar início de operação
const operation = performanceMonitor.startOperation('load-model');

// ... código da operação ...

// Finalizar e registrar tempo
const duration = operation.end();
console.log(`Operação levou ${duration}ms`);
```

#### Obter Métricas
```javascript
// Métrica específica
const fps = performanceMonitor.getMetric('fps');

// Todas as métricas
const allMetrics = performanceMonitor.getAllMetrics();

// Relatório completo
const report = performanceMonitor.reportMetrics();
```

## Eventos Personalizados

O sistema dispara eventos que você pode escutar:

```javascript
// App pronto
window.addEventListener('app-ready', (event) => {
    console.log('App inicializado:', event.detail.status);
});

// Mudança de modo de energia
window.addEventListener('power-mode-change', (event) => {
    if (event.detail.mode === 'save') {
        // Reduzir animações, efeitos, etc.
    }
});

// Mudança de largura de banda
window.addEventListener('bandwidth-mode-change', (event) => {
    if (event.detail.mode === 'low') {
        // Reduzir qualidade de assets
    }
});

// FPS baixo detectado
window.addEventListener('low-fps-detected', (event) => {
    console.log(`FPS baixo: ${event.detail.fps}`);
    // Implementar otimizações
});
```

## Configurações

### Service Worker
Edite `service-worker.js` para:
- Adicionar novos assets ao cache
- Modificar estratégias de cache
- Ajustar timeout de requisições

### Manifesto PWA
Edite `site.webmanifest` para:
- Alterar nome e descrição do app
- Modificar ícones e cores do tema
- Ajustar orientação e modo de exibição

### Loading Screen
Edite `loading-manager.js` para:
- Personalizar mensagens e dicas
- Modificar animações
- Ajustar lista de assets para pré-carregamento

## Debugging

### Widget de Performance
Em desenvolvimento (localhost), um widget de performance é exibido automaticamente no canto superior direito, mostrando:
- FPS atual
- Uso de memória
- Taxa de cache hit
- Status da conexão
- Nível da bateria

### Console Logs
Todos os sistemas geram logs detalhados no console:
- `[PWA]`: Eventos relacionados ao PWA
- `[Cache]`: Operações de cache
- `[Performance]`: Métricas de performance
- `[App]`: Inicialização da aplicação

### Ferramentas do Navegador
Use as ferramentas de desenvolvedor:
- **Application**: Verificar Service Worker e cache
- **Network**: Monitorar requisições e cache hits
- **Performance**: Analisar performance detalhada
- **Lighthouse**: Auditoria PWA completa

## Otimizações Automáticas

### Conexão Lenta
- Reduz qualidade de texturas
- Desabilita efeitos visuais complexos
- Prioriza assets essenciais

### Bateria Baixa
- Reduz FPS de animações
- Desabilita efeitos de partículas
- Minimiza uso de sensores

### Memória Alta
- Força garbage collection
- Limpa caches desnecessários
- Reduz qualidade de assets em memória

### FPS Baixo
- Reduz complexidade de renderização
- Desabilita sombras e reflexos
- Otimiza loops de animação

## Troubleshooting

### App não instala
- Verifique se o manifesto está correto
- Confirme que o Service Worker está registrado
- Teste em diferentes navegadores

### Cache não funciona
- Verifique se o Service Worker está ativo
- Confirme que os assets estão sendo cacheados
- Limpe o cache e teste novamente

### Performance baixa
- Ative o widget de debug
- Verifique métricas no console
- Teste em diferentes dispositivos

### Loading infinito
- Verifique se todos os assets existem
- Confirme conexão de rede
- Analise erros no console

## Manutenção

### Atualizações
1. Incremente a versão no Service Worker
2. Atualize lista de assets se necessário
3. Teste em diferentes dispositivos
4. Deploy e monitore métricas

### Limpeza de Cache
```javascript
// Limpar cache manualmente
await cacheManager.clearCache();

// Limpar caches antigos
await cacheManager.cleanupOldCaches();
```

### Monitoramento
- Monitore métricas de performance regularmente
- Analise taxa de cache hit
- Verifique relatórios de erro
- Otimize assets baseado no uso

## Próximos Passos

1. **Analytics**: Integrar com Google Analytics ou similar
2. **Push Notifications**: Implementar notificações push
3. **Background Sync**: Sincronização em background
4. **Web Share API**: Compartilhamento nativo
5. **File System Access**: Acesso ao sistema de arquivos