// Gerenciador de Loading e Pré-carregamento
class LoadingManager {
    constructor() {
        this.isLoading = false;
        this.loadingScreen = null;
        this.progressBar = null;
        this.progressText = null;
        this.currentStep = '';
        this.totalSteps = 0;
        this.completedSteps = 0;
        
        this.createLoadingScreen();
    }
    
    createLoadingScreen() {
        // Cria a tela de loading
        this.loadingScreen = document.createElement('div');
        this.loadingScreen.id = 'loading-screen';
        this.loadingScreen.className = 'loading-screen hidden';
        
        this.loadingScreen.innerHTML = `
            <div class="loading-container">
                <div class="loading-logo">
                    <img src="assets/images/logo.png" alt="Ghostbusters Logo" onerror="this.style.display='none'">
                </div>
                
                <div class="loading-ghost">
                    <div class="ghost-animation">👻</div>
                </div>
                
                <div class="loading-content">
                    <h2 id="loading-title">Carregando Ghostbusters AR</h2>
                    <p id="loading-step">Inicializando...</p>
                    
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div id="progress-fill" class="progress-fill"></div>
                        </div>
                        <div id="progress-text" class="progress-text">0%</div>
                    </div>
                    
                    <div class="loading-details">
                        <div id="loading-stats" class="loading-stats">
                            <span id="loaded-count">0</span> / <span id="total-count">0</span> assets
                        </div>
                        <div id="loading-tips" class="loading-tips">
                            Dica: Use fones de ouvido para uma experiência mais imersiva!
                        </div>
                    </div>
                </div>
                
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.loadingScreen);
        
        // Referências aos elementos
        this.progressBar = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.stepText = document.getElementById('loading-step');
        this.loadedCount = document.getElementById('loaded-count');
        this.totalCount = document.getElementById('total-count');
        this.loadingTips = document.getElementById('loading-tips');
        
        this.setupTips();
    }
    
    setupTips() {
        const tips = [
            'Dica: Use fones de ouvido para uma experiência mais imersiva!',
            'Dica: Certifique-se de estar em um local bem iluminado.',
            'Dica: Mova o dispositivo lentamente para melhor detecção.',
            'Dica: Mantenha o proton pack sempre carregado!',
            'Dica: Fantasmas aparecem em locais específicos.',
            'Dica: Use o minimapa para encontrar fantasmas próximos.',
            'Dica: Deposite fantasmas quando o inventário estiver cheio.'
        ];
        
        let currentTip = 0;
        setInterval(() => {
            if (this.isLoading && this.loadingTips) {
                this.loadingTips.textContent = tips[currentTip];
                currentTip = (currentTip + 1) % tips.length;
            }
        }, 3000);
    }
    
    show(title = 'Carregando Ghostbusters AR') {
        this.isLoading = true;
        document.getElementById('loading-title').textContent = title;
        this.loadingScreen.classList.remove('hidden');
        this.updateProgress(0, 'Inicializando...');
    }
    
    hide() {
        this.isLoading = false;
        this.loadingScreen.classList.add('hidden');
    }
    
    updateProgress(percentage, step = '', loaded = 0, total = 0) {
        if (!this.isLoading) return;
        
        // Atualiza barra de progresso
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = `${Math.round(percentage)}%`;
        
        // Atualiza step atual
        if (step) {
            this.stepText.textContent = step;
        }
        
        // Atualiza contadores
        if (total > 0) {
            this.loadedCount.textContent = loaded;
            this.totalCount.textContent = total;
        }
        
        // Efeito de cor baseado no progresso
        const hue = (percentage / 100) * 120; // De vermelho (0) para verde (120)
        this.progressBar.style.background = `linear-gradient(90deg, 
            hsl(${hue}, 70%, 50%) 0%, 
            hsl(${hue + 20}, 80%, 60%) 100%)`;
    }
    
    // Carregamento específico para assets do jogo
    async loadGameAssets() {
        const assets = [
            // Modelos 3D
            { url: 'assets/models/ghost.glb', type: 'model', name: 'Modelo do Fantasma' },
            { url: 'assets/models/geleia.glb', type: 'model', name: 'Modelo da Geleia' },
            
            // Áudios
            { url: 'assets/audio/proton-beam.mp3', type: 'audio', name: 'Som do Proton Beam' },
            { url: 'assets/audio/ghost-capture.mp3', type: 'audio', name: 'Som de Captura' },
            { url: 'assets/audio/inventory_full.mp3', type: 'audio', name: 'Som de Inventário Cheio' },
            
            // Imagens
            { url: 'assets/images/logo.png', type: 'image', name: 'Logo' },
            { url: 'assets/images/ghost_trap.png', type: 'image', name: 'Ícone da Armadilha' },
            { url: 'assets/images/proton_pack.png', type: 'image', name: 'Ícone do Proton Pack' }
        ];
        
        this.show('Carregando Assets do Jogo');
        
        let loaded = 0;
        const total = assets.length;
        
        for (const asset of assets) {
            try {
                this.updateProgress(
                    (loaded / total) * 100,
                    `Carregando ${asset.name}...`,
                    loaded,
                    total
                );
                
                await this.loadSingleAsset(asset);
                loaded++;
                
                this.updateProgress(
                    (loaded / total) * 100,
                    `${asset.name} carregado!`,
                    loaded,
                    total
                );
                
                // Pequena pausa para mostrar o progresso
                await this.delay(100);
                
            } catch (error) {
                console.warn(`Erro ao carregar ${asset.name}:`, error);
                loaded++; // Continua mesmo com erro
            }
        }
        
        // Finalização
        this.updateProgress(100, 'Todos os assets carregados!', total, total);
        await this.delay(500);
        
        return { loaded, total };
    }
    
    async loadSingleAsset(asset) {
        return new Promise((resolve, reject) => {
            switch (asset.type) {
                case 'model':
                    // Para modelos 3D, apenas verifica se o arquivo existe
                    fetch(asset.url, { method: 'HEAD' })
                        .then(response => response.ok ? resolve() : reject())
                        .catch(reject);
                    break;
                    
                case 'audio':
                    const audio = new Audio();
                    audio.oncanplaythrough = resolve;
                    audio.onerror = reject;
                    audio.src = asset.url;
                    break;
                    
                case 'image':
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = asset.url;
                    break;
                    
                default:
                    fetch(asset.url)
                        .then(response => response.ok ? resolve() : reject())
                        .catch(reject);
            }
        });
    }
    
    // Carregamento das bibliotecas externas
    async loadExternalLibraries() {
        const libraries = [
            { url: 'https://aframe.io/releases/1.5.0/aframe.min.js', name: 'A-Frame' },
            { url: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', name: 'Leaflet Maps' },
            { url: 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js', name: 'QR Code Scanner' }
        ];
        
        this.show('Carregando Bibliotecas');
        
        let loaded = 0;
        const total = libraries.length;
        
        for (const lib of libraries) {
            try {
                this.updateProgress(
                    (loaded / total) * 100,
                    `Carregando ${lib.name}...`,
                    loaded,
                    total
                );
                
                await fetch(lib.url, { method: 'HEAD' });
                loaded++;
                
                this.updateProgress(
                    (loaded / total) * 100,
                    `${lib.name} verificado!`,
                    loaded,
                    total
                );
                
            } catch (error) {
                console.warn(`Erro ao verificar ${lib.name}:`, error);
                loaded++;
            }
        }
        
        return { loaded, total };
    }
    
    // Inicialização completa do jogo
    async initializeGame() {
        try {
            // Etapa 1: Bibliotecas externas
            this.updateProgress(10, 'Verificando bibliotecas externas...');
            await this.loadExternalLibraries();
            
            // Etapa 2: Assets do jogo
            this.updateProgress(30, 'Carregando assets do jogo...');
            await this.loadGameAssets();
            
            // Etapa 3: Inicialização do AR
            this.updateProgress(60, 'Inicializando sistema AR...');
            await this.delay(1000); // Simula inicialização
            
            // Etapa 4: Configuração de áudio
            this.updateProgress(80, 'Configurando sistema de áudio...');
            await this.delay(500);
            
            // Etapa 5: Finalização
            this.updateProgress(95, 'Finalizando inicialização...');
            await this.delay(500);
            
            this.updateProgress(100, 'Pronto para caçar fantasmas!');
            await this.delay(1000);
            
            return true;
            
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.updateProgress(0, 'Erro na inicialização. Tente novamente.');
            return false;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Mostra loading rápido para ações específicas
    showQuickLoading(message, duration = 2000) {
        const quickLoader = document.createElement('div');
        quickLoader.className = 'quick-loader';
        quickLoader.innerHTML = `
            <div class="quick-loader-content">
                <div class="quick-spinner"></div>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(quickLoader);
        
        setTimeout(() => {
            if (quickLoader.parentNode) {
                quickLoader.remove();
            }
        }, duration);
    }
}

// Inicializa o gerenciador de loading
const loadingManager = new LoadingManager();

// Exporta para uso global
window.loadingManager = loadingManager;