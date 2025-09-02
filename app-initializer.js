// Inicializador da Aplicação com PWA e Loading
class AppInitializer {
    constructor() {
        this.isInitialized = false;
        this.initializationPromise = null;
        this.requiredAssets = [
            'assets/models/ghost.glb',
            'assets/models/geleia.glb',
            'assets/audio/proton-beam.mp3',
            'assets/audio/ghost-capture.mp3',
            'assets/audio/inventory_full.mp3',
            'assets/images/logo.png',
            'assets/images/ghost_trap.png',
            'assets/images/proton_pack.png'
        ];
    }
    
    async initialize() {
        if (this.isInitialized) {
            return true;
        }
        
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        this.initializationPromise = this.performInitialization();
        return this.initializationPromise;
    }
    
    async performInitialization() {
        try {
            console.log('[App] Iniciando aplicação...');
            
            // Mostra tela de loading
            loadingManager.show('Inicializando Ghostbusters AR');
            
            // Etapa 1: Verificar suporte PWA e registrar Service Worker
            await this.initializePWA();
            
            // Etapa 2: Pré-carregar assets críticos
            await this.preloadCriticalAssets();
            
            // Etapa 3: Inicializar sistemas do jogo
            await this.initializeGameSystems();
            
            // Etapa 4: Verificar permissões necessárias
            await this.checkPermissions();
            
            // Finalização
            loadingManager.updateProgress(100, 'Aplicação pronta!');
            await loadingManager.delay(1000);
            
            this.isInitialized = true;
            loadingManager.hide();
            
            console.log('[App] Aplicação inicializada com sucesso');
            return true;
            
        } catch (error) {
            console.error('[App] Erro na inicialização:', error);
            loadingManager.updateProgress(0, 'Erro na inicialização');
            
            // Mostra notificação de erro
            if (window.pwaManager) {
                pwaManager.showNotification('Erro ao inicializar a aplicação', 'error');
            }
            
            return false;
        }
    }
    
    async initializePWA() {
        loadingManager.updateProgress(10, 'Configurando PWA...');
        
        // PWA Manager já foi inicializado automaticamente
        if (window.pwaManager) {
            // Verifica status do cache
            const cacheStatus = await pwaManager.getCacheStatus();
            if (cacheStatus) {
                console.log('[App] Status do cache:', cacheStatus);
            }
        }
        
        await loadingManager.delay(500);
    }
    
    async preloadCriticalAssets() {
        loadingManager.updateProgress(20, 'Carregando assets críticos...');
        
        let loadedCount = 0;
        const totalAssets = this.requiredAssets.length;
        
        // Carrega assets em paralelo com limite de concorrência
        const concurrencyLimit = 3;
        const chunks = this.chunkArray(this.requiredAssets, concurrencyLimit);
        
        for (const chunk of chunks) {
            const promises = chunk.map(async (asset) => {
                try {
                    await this.loadAsset(asset);
                    loadedCount++;
                    
                    const progress = 20 + (loadedCount / totalAssets) * 40;
                    loadingManager.updateProgress(
                        progress,
                        `Carregando assets... (${loadedCount}/${totalAssets})`,
                        loadedCount,
                        totalAssets
                    );
                } catch (error) {
                    console.warn(`[App] Falha ao carregar asset: ${asset}`, error);
                    loadedCount++; // Continua mesmo com erro
                }
            });
            
            await Promise.all(promises);
        }
    }
    
    async loadAsset(url) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout ao carregar: ${url}`));
            }, 10000); // 10 segundos de timeout
            
            if (url.endsWith('.glb')) {
                // Para modelos 3D, apenas verifica se existe
                fetch(url, { method: 'HEAD' })
                    .then(response => {
                        clearTimeout(timeout);
                        response.ok ? resolve() : reject(new Error(`Asset não encontrado: ${url}`));
                    })
                    .catch(error => {
                        clearTimeout(timeout);
                        reject(error);
                    });
            } else if (url.endsWith('.mp3') || url.endsWith('.wav')) {
                // Para áudios
                const audio = new Audio();
                audio.oncanplaythrough = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                audio.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Erro ao carregar áudio: ${url}`));
                };
                audio.src = url;
            } else if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
                // Para imagens
                const img = new Image();
                img.onload = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                img.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Erro ao carregar imagem: ${url}`));
                };
                img.src = url;
            } else {
                // Para outros recursos
                fetch(url)
                    .then(response => {
                        clearTimeout(timeout);
                        response.ok ? resolve() : reject(new Error(`Erro HTTP: ${response.status}`));
                    })
                    .catch(error => {
                        clearTimeout(timeout);
                        reject(error);
                    });
            }
        });
    }
    
    async initializeGameSystems() {
        loadingManager.updateProgress(70, 'Inicializando sistemas do jogo...');
        
        // Aguarda A-Frame estar pronto
        if (typeof AFRAME !== 'undefined') {
            await this.waitForAFrame();
        }
        
        // Inicializa sistemas de áudio
        await this.initializeAudioSystem();
        
        // Inicializa sistemas de notificação
        await this.initializeNotificationSystem();
        
        loadingManager.updateProgress(85, 'Sistemas inicializados');
    }
    
    async waitForAFrame() {
        return new Promise((resolve) => {
            if (AFRAME.scenes.length > 0) {
                resolve();
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    const scene = document.querySelector('a-scene');
                    if (scene) {
                        scene.addEventListener('loaded', resolve);
                    } else {
                        resolve(); // Continua mesmo sem cena
                    }
                });
            }
        });
    }
    
    async initializeAudioSystem() {
        try {
            // Tenta inicializar contexto de áudio
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                const AudioContextClass = AudioContext || webkitAudioContext;
                const audioContext = new AudioContextClass();
                
                // Resume o contexto se necessário (política de autoplay)
                if (audioContext.state === 'suspended') {
                    console.log('[App] Contexto de áudio suspenso - será ativado na primeira interação');
                }
            }
        } catch (error) {
            console.warn('[App] Erro ao inicializar sistema de áudio:', error);
        }
    }
    
    async initializeNotificationSystem() {
        // Inicializa sistema de notificações se disponível
        if (window.notificationManager) {
            console.log('[App] Sistema de notificações inicializado');
        }
    }
    
    async checkPermissions() {
        loadingManager.updateProgress(90, 'Verificando permissões...');
        
        const permissions = [];
        
        // Verifica permissão de câmera (necessária para AR)
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                permissions.push('camera');
            }
        } catch (error) {
            console.warn('[App] Câmera não disponível:', error);
        }
        
        // Verifica permissão de localização
        try {
            if (navigator.geolocation) {
                permissions.push('geolocation');
            }
        } catch (error) {
            console.warn('[App] Geolocalização não disponível:', error);
        }
        
        // Verifica suporte a notificações
        try {
            if ('Notification' in window) {
                permissions.push('notifications');
            }
        } catch (error) {
            console.warn('[App] Notificações não disponíveis:', error);
        }
        
        console.log('[App] Permissões disponíveis:', permissions);
        await loadingManager.delay(300);
    }
    
    // Utilitário para dividir array em chunks
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
    
    // Verifica se a aplicação está pronta
    isReady() {
        return this.isInitialized;
    }
    
    // Força reinicialização
    async reinitialize() {
        this.isInitialized = false;
        this.initializationPromise = null;
        return this.initialize();
    }
    
    // Obtém informações de status
    getStatus() {
        return {
            initialized: this.isInitialized,
            pwaSupported: 'serviceWorker' in navigator,
            online: navigator.onLine,
            assetsCount: this.requiredAssets.length
        };
    }
}

// Inicializa automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[App] DOM carregado, iniciando aplicação...');
    
    // Cria instância global do inicializador
    window.appInitializer = new AppInitializer();
    
    // Inicia a inicialização
    const success = await appInitializer.initialize();
    
    if (success) {
        console.log('[App] Aplicação pronta para uso');
        
        // Dispara evento personalizado para outros sistemas
        window.dispatchEvent(new CustomEvent('app-ready', {
            detail: { status: appInitializer.getStatus() }
        }));
    } else {
        console.error('[App] Falha na inicialização da aplicação');
        
        // Dispara evento de erro
        window.dispatchEvent(new CustomEvent('app-error', {
            detail: { error: 'Initialization failed' }
        }));
    }
});

// Exporta para uso global
window.AppInitializer = AppInitializer;