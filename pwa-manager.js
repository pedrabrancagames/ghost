// Gerenciador PWA e Cache
class PWAManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.cacheStatus = null;
        this.loadingProgress = 0;
        this.totalAssets = 0;
        this.loadedAssets = 0;
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.registerServiceWorker();
        this.checkInstallPrompt();
        this.updateOnlineStatus();
    }
    
    setupEventListeners() {
        // Status de conexão
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateOnlineStatus();
            this.showNotification('Conexão restaurada!', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateOnlineStatus();
            this.showNotification('Você está offline. Alguns recursos podem não funcionar.', 'warning');
        });
        
        // Atualização do app
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                                const registration = await navigator.serviceWorker.register('./service-worker.js');
                console.log('[PWA] Service Worker registrado:', registration);
                
                // Verifica atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
                
                return registration;
            } catch (error) {
                console.error('[PWA] Erro ao registrar Service Worker:', error);
            }
        }
    }
    
    checkInstallPrompt() {
        // Verifica se já está instalado
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('[PWA] App já está instalado');
            return;
        }
        
        // Para iOS Safari
        if (this.isIOS() && !this.isInStandaloneMode()) {
            this.showIOSInstallInstructions();
        }
    }
    
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }
    
    isInStandaloneMode() {
        return window.navigator.standalone === true;
    }
    
    showInstallButton() {
        const installButton = document.createElement('button');
        installButton.id = 'install-app-button';
        installButton.className = 'install-button ui-element';
        installButton.innerHTML = '📱 Instalar App';
        installButton.onclick = () => this.installApp();
        
        // Adiciona o botão na tela de login
        const authContainer = document.getElementById('auth-buttons-container');
        if (authContainer) {
            authContainer.appendChild(installButton);
        }
    }
    
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('[PWA] App instalado pelo usuário');
                this.showNotification('App instalado com sucesso!', 'success');
            }
            
            this.deferredPrompt = null;
            const installButton = document.getElementById('install-app-button');
            if (installButton) {
                installButton.remove();
            }
        }
    }
    
    showIOSInstallInstructions() {
        const instructions = document.createElement('div');
        instructions.id = 'ios-install-instructions';
        instructions.className = 'ios-install ui-element';
        instructions.innerHTML = `
            <div class="install-instructions">
                <p>📱 Para instalar o app:</p>
                <p>1. Toque no botão de compartilhar</p>
                <p>2. Selecione "Adicionar à Tela de Início"</p>
            </div>
        `;
        
        document.body.appendChild(instructions);
        
        // Remove após 10 segundos
        setTimeout(() => {
            if (instructions.parentNode) {
                instructions.remove();
            }
        }, 10000);
    }
    
    showUpdateAvailable() {
        const updateBanner = document.createElement('div');
        updateBanner.id = 'update-banner';
        updateBanner.className = 'update-banner ui-element';
        updateBanner.innerHTML = `
            <div class="update-content">
                <span>Nova versão disponível!</span>
                <button onclick="pwaManager.updateApp()" class="update-button">Atualizar</button>
                <button onclick="this.parentElement.parentElement.remove()" class="close-button">&times;</button>
            </div>
        `;
        
        document.body.appendChild(updateBanner);
    }
    
    async updateApp() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            }
        }
    }
    
    updateOnlineStatus() {
        const statusIndicator = document.getElementById('connection-status');
        if (!statusIndicator) {
            this.createStatusIndicator();
        }
        
        const indicator = document.getElementById('connection-status');
        if (this.isOnline) {
            indicator.className = 'connection-status online';
            indicator.textContent = 'Online';
        } else {
            indicator.className = 'connection-status offline';
            indicator.textContent = 'Offline';
        }
    }
    
    createStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'connection-status';
        indicator.className = 'connection-status';
        document.body.appendChild(indicator);
    }
    
    // Sistema de pré-carregamento com progresso
    async preloadAssets(assets, onProgress) {
        this.totalAssets = assets.length;
        this.loadedAssets = 0;
        
        const promises = assets.map(async (asset, index) => {
            try {
                await this.loadAsset(asset);
                this.loadedAssets++;
                this.loadingProgress = (this.loadedAssets / this.totalAssets) * 100;
                
                if (onProgress) {
                    onProgress(this.loadingProgress, this.loadedAssets, this.totalAssets);
                }
            } catch (error) {
                console.warn(`[PWA] Erro ao carregar asset: ${asset}`, error);
                this.loadedAssets++;
            }
        });
        
        await Promise.all(promises);
        return this.loadingProgress;
    }
    
    loadAsset(url) {
        return new Promise((resolve, reject) => {
            if (url.endsWith('.glb')) {
                // Para modelos 3D
                const loader = new THREE.GLTFLoader();
                loader.load(url, resolve, undefined, reject);
            } else if (url.endsWith('.mp3') || url.endsWith('.wav')) {
                // Para áudios
                const audio = new Audio();
                audio.oncanplaythrough = resolve;
                audio.onerror = reject;
                audio.src = url;
            } else if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
                // Para imagens
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
            } else {
                // Para outros recursos
                fetch(url)
                    .then(response => response.ok ? resolve() : reject())
                    .catch(reject);
            }
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `pwa-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // Verifica status do cache
    async getCacheStatus() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            
            return new Promise((resolve) => {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data);
                };
                
                registration.active.postMessage(
                    { type: 'GET_CACHE_STATUS' },
                    [messageChannel.port2]
                );
            });
        }
        return null;
    }
    
    // Limpa cache antigo
    async clearOldCache() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            const currentCache = 'ghostbusters-ar-v1.0.0';
            
            await Promise.all(
                cacheNames
                    .filter(name => name !== currentCache)
                    .map(name => caches.delete(name))
            );
        }
    }
}

// Inicializa o gerenciador PWA
const pwaManager = new PWAManager();

// Exporta para uso global
window.pwaManager = pwaManager;