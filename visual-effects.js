/**
 * Sistema de Efeitos Visuais - Ghostbusters AR
 * Implementa partículas, animações e efeitos especiais para o jogo
 */

class VisualEffectsSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.effects = [];
        this.animationId = null;
        this.isRunning = false;
        this.isInitialized = false;
        
        // Configurações
        this.config = {
            maxParticles: 100, // Reduzido drasticamente
            ghostCaptureParticles: 30, // Reduzido
            suctionParticles: 20, // Reduzido
            celebrationParticles: 40, // Reduzido
            protonBeamWidth: 8,
            effectDuration: 3000
        };
        
        // Aguardar carregamento da página antes de inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            // Se já carregou, aguardar um pouco para garantir que body existe
            setTimeout(() => this.init(), 100);
        }
    }
    
    init() {
        // Verificação robusta do ambiente
        if (!document.body) {
            console.warn('⚠️ document.body não disponível, tentando novamente em 200ms...');
            setTimeout(() => this.init(), 200);
            return;
        }
        
        // Verificação extra para contexto AR
        const isInAR = document.querySelector('a-scene')?.is('ar-mode') || 
                      document.querySelector('a-scene')?.is('vr-mode');
        
        if (isInAR) {
            console.log('📱 Contexto AR detectado, ajustando inicialização...');
            // Pequeno delay para garantir que o contexto AR esteja totalmente carregado
            setTimeout(() => this._initInternal(), 300);
        } else {
            this._initInternal();
        }
    }
    
    _initInternal() {
        
        try {
            this.createCanvas();
            this.setupCanvas();
            this.start();
            this.isInitialized = true;
            
            // Limpeza automática mais freqüente
            setInterval(() => {
                this.cleanupParticles();
            }, 3000); // A cada 3 segundos
            
            console.log('🎨 Sistema de Efeitos Visuais inicializado com sucesso');
            
            // Verificação pós-inicialização
            setTimeout(() => {
                if (this.canvas && this.ctx) {
                    console.log('✅ Sistema de efeitos totalmente operacional');
                    // Forçar um redraw para garantir visibilidade
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                } else {
                    console.error('❌ Problema na inicialização do canvas');
                }
            }, 500);
        } catch (error) {
            console.error('❌ Erro ao inicializar Sistema de Efeitos Visuais:', error);
            // Tentar novamente em 500ms
            setTimeout(() => this.init(), 500);
        }
    }
    
    createCanvas() {
        console.log('🖼️ Criando canvas para efeitos visuais...');
        
        // Remove canvas existente se houver
        const existingCanvas = document.getElementById('effects-canvas');
        if (existingCanvas) {
            console.log('🖼️ Removendo canvas existente');
            existingCanvas.remove();
        }
        
        // Cria novo canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'effects-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        this.canvas.style.background = 'transparent';
        
        const uiContainer = document.getElementById('ui-container');
        if (uiContainer) {
            uiContainer.appendChild(this.canvas);
            console.log('🖼️ Canvas anexado ao #ui-container');
        } else {
            console.error('❌ #ui-container não encontrado! Anexando ao body como fallback.');
            document.body.appendChild(this.canvas);
        }

        this.ctx = this.canvas.getContext('2d');
        
        console.log('🖼️ Canvas criado com sucesso:', {
            width: this.canvas.width,
            height: this.canvas.height,
            context: !!this.ctx,
            parent: this.canvas.parentElement?.tagName
        });
    }
    
    setupCanvas() {
        const updateSize = () => {
            const dpr = window.devicePixelRatio || 1;
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Definir tamanho real do canvas
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;
            
            // Definir tamanho CSS
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
            
            // Ajustar escala do contexto
            this.ctx.scale(dpr, dpr);
            
            console.log(`🖼️ Canvas redimensionado: ${width}x${height} (DPR: ${dpr})`);
        };
        
        updateSize();
        window.addEventListener('resize', updateSize);
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Verificar se o canvas ainda existe
        if (!this.canvas || !this.canvas.parentElement) {
            console.warn('⚠️ Canvas perdido, recriando...');
            this.createCanvas();
            this.setupCanvas();
        }
        
        // Limpar canvas com fundo semi-transparente para debug
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Debug: desenhar borda vermelha no canvas para verificar se está funcionando
        if (this.particles.length > 0 || this.effects.length > 0) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(5, 5, window.innerWidth - 10, window.innerHeight - 10);
        }
        
        // Atualizar e renderizar partículas
        this.updateParticles();
        this.renderParticles();
        
        // Atualizar efeitos especiais
        this.updateEffects();
        
        // Debug info apenas quando necessário (reduzido drasticamente)
        if (this.particles.length > 10) {
            console.log(`🎨 Renderizando: ${this.particles.length} partículas, ${this.effects.length} efeitos`);
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateParticles() {
        // Limpar partículas mortas de forma mais agressiva
        const beforeCount = this.particles.length;
        this.particles = this.particles.filter(particle => {
            particle.update();
            // Remover partículas com vida baixa OU que saíram da tela
            return particle.life > 0.05 && 
                   particle.x > -50 && particle.x < window.innerWidth + 50 &&
                   particle.y > -50 && particle.y < window.innerHeight + 50;
        });
        
        // Limitar número máximo de partículas para evitar travamento
        if (this.particles.length > this.config.maxParticles) {
            this.particles = this.particles.slice(-this.config.maxParticles); // Manter apenas as mais recentes
        }
        
        // Log apenas quando há limpeza significativa
        const removedCount = beforeCount - this.particles.length;
        if (removedCount > 5) {
            console.log(`🧹 Limpeza automática: ${removedCount} partículas removidas`);
        }
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
    }
    
    updateEffects() {
        this.effects = this.effects.filter(effect => {
            effect.update();
            effect.render(this.ctx);
            return effect.active;
        });
    }
    
    // Efeito de celebração ao capturar fantasma
    showCelebrationEffect(x, y, type = 'ghost_captured') {
        if (!this.isInitialized) {
            console.warn('⚠️ Sistema de efeitos não inicializado ainda');
            return;
        }
        
        // Se as coordenadas não foram fornecidas, usar centro da tela
        if (!x || !y) {
            x = window.innerWidth / 2;
            y = window.innerHeight / 2;
        }
        
        const colors = this.getCelebrationColors(type);
        const particleCount = 40; // Número fixo reduzido
        
        // Partículas principais
        for (let i = 0; i < particleCount; i++) {
            const particle = new CelebrationParticle(x, y, colors);
            this.particles.push(particle);
        }
        
        // Efeito de explosão circular
        const explosion = new ExplosionEffect(x, y, colors, type);
        this.effects.push(explosion);
        
        // Partículas em círculo simples
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 30 + Math.random() * 20;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            const particle = new CelebrationParticle(px, py, colors);
            this.particles.push(particle);
        }
        
        // Feedback tátil se disponível
        this.triggerHapticFeedback();
        
        console.log(`🎉 Efeito de celebração: ${type} em (${x}, ${y}) - Total: ${particleCount + 12} partículas`);
    }
    
    // Efeito de sucção do fantasma para a proton pack
    showSuctionEffect(fromX, fromY, toX, toY) {
        // Partículas de sucção reduzidas
        for (let i = 0; i < 15; i++) { // Reduzido drasticamente
            const particle = new SuctionParticle(fromX, fromY, toX, toY);
            this.particles.push(particle);
        }
        
        // Uma única linha de conexão energética
        const connection = new EnergyConnection(fromX, fromY, toX, toY, '#00FFFF', 'suction_connection');
        this.effects.push(connection);
        
        // Partículas em círculo simples
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 20 + Math.random() * 15;
            const px = fromX + Math.cos(angle) * radius;
            const py = fromY + Math.sin(angle) * radius;
            const particle = new SuctionParticle(px, py, toX, toY);
            this.particles.push(particle);
        }
        
        console.log(`🌪️ Efeito de sucção: ${fromX}, ${fromY}) para (${toX}, ${toY}) - Total: 23 partículas`);
    }
    
    // Efeito do feixe de prótons
    startProtonBeamEffect() {
        console.log('⚡ Iniciando feixe de prótons - sistema inicializado:', this.isInitialized);

        if (!this.isInitialized) {
            console.warn('⚠️ Sistema não inicializado, tentando novamente em 500ms...');
            setTimeout(() => this.startProtonBeamEffect(), 500);
            return;
        }

        // Remove feixe anterior se existir
        this.stopProtonBeamEffect();

        // Coordenadas de início e fim
        const protonPackIcon = document.getElementById('proton-pack-icon');
        let startX = window.innerWidth - 70;
        let startY = window.innerHeight - 70;

        if (protonPackIcon) {
            const rect = protonPackIcon.getBoundingClientRect();
            startX = (rect.left + rect.width / 2) - 50;
            startY = rect.top - 10;
        }

        const targetX = window.innerWidth / 2;
        const targetY = window.innerHeight / 2;

        // Cria a conexão energética (o raio 1)
        const connection1 = new EnergyConnection(startX, startY, targetX, targetY, '#FFA500', 'proton_beam', true);
        this.effects.push(connection1);

        // Cria a segunda conexão energética (o raio 2)
        const connection2 = new EnergyConnection(startX + 5, startY + 5, targetX, targetY, '#F42B3D', 'proton_beam', true);
        this.effects.push(connection2);

        console.log('⚡ Feixe de prótons criado com 2 raios contínuos - total de efeitos:', this.effects.length);
    }
    
    stopProtonBeamEffect() {
        this.effects = this.effects.filter(effect => effect.type !== 'proton_beam');
        console.log('⚡ Feixe de prótons parado');
    }
    
    // Efeito de falha na captura
    showCaptureFailEffect(x, y) {
        const colors = ['#FF4444', '#FF6666', '#FF8888'];
        
        for (let i = 0; i < 30; i++) {
            const particle = new FailureParticle(x, y, colors);
            this.particles.push(particle);
        }
        
        // Efeito de "X" vermelho
        const failureX = new FailureXEffect(x, y);
        this.effects.push(failureX);
        
        console.log(`❌ Efeito de falha em (${x}, ${y})`);
    }
    
    // Limpar partículas mortas
    cleanupParticles() {
        const beforeCount = this.particles.length;
        
        // Limpeza mais agressiva
        this.particles = this.particles.filter(particle => {
            return particle.life > 0.2 && // Threshold mais alto
                   particle.x > -100 && particle.x < window.innerWidth + 100 &&
                   particle.y > -100 && particle.y < window.innerHeight + 100;
        });
        
        const afterCount = this.particles.length;
        const removedCount = beforeCount - afterCount;
        
        if (removedCount > 0) {
            console.log(`🧹 Limpeza periódica: ${removedCount} partículas removidas (${afterCount} restantes)`);
        }
        
        // Forçar limpeza se ainda houver muitas partículas
        if (this.particles.length > this.config.maxParticles) {
            const excess = this.particles.length - this.config.maxParticles;
            this.particles = this.particles.slice(excess); // Remove as mais antigas
            console.log(`🧹 Forçando limpeza: ${excess} partículas antigas removidas`);
        }
        
        // Limpar efeitos inativos
        const beforeEffects = this.effects.length;
        this.effects = this.effects.filter(effect => effect.active);
        const removedEffects = beforeEffects - this.effects.length;
        
        if (removedEffects > 0) {
            console.log(`🧹 ${removedEffects} efeitos inativos removidos`);
        }
    }
    
    // Limpar todos os efeitos
    clearAllEffects() {
        this.particles = [];
        this.effects = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('🧹 Todos os efeitos limpos');
    }
    
    // Função de teste visual
    testVisualEffects() {
        console.log('📝 TESTE VISUAL OTIMIZADO - INICIANDO');
        console.log('Canvas:', this.canvas);
        console.log('Dimensões canvas:', this.canvas?.width, 'x', this.canvas?.height);
        console.log('Dimensões tela:', window.innerWidth, 'x', window.innerHeight);
        
        // Verificação robusta do sistema
        if (!this.isInitialized || !this.canvas || !this.ctx) {
            console.error('❌ Sistema não inicializado corretamente!');
            
            // Tentativa de re-inicialização
            if (!this.isInitialized) {
                console.log('🔄 Tentando re-inicializar sistema...');
                this.init();
                setTimeout(() => {
                    if (this.isInitialized) {
                        console.log('✅ Re-inicialização bem-sucedida, tentando teste novamente...');
                        this._executeTest();
                    } else {
                        console.error('❌ Falha na re-inicialização');
                        // Tentar forçar a criação do canvas
                        this.createCanvas();
                        this.setupCanvas();
                        this.start();
                        this.isInitialized = true;
                        this._executeTest();
                    }
                }, 1500);
                return;
            }
            
            // Forçar criação do canvas se não existir
            if (!this.canvas) {
                console.log('🔄 Forçando criação do canvas...');
                this.createCanvas();
                this.setupCanvas();
                this.start();
            }
            
            alert('Sistema de efeitos visuais não está inicializado. Verifique o console.');
            return;
        }
        
        this._executeTest();
    }
    
    _executeTest() {
        // Verificação extra para contexto AR
        const scene = document.querySelector('a-scene');
        const isInAR = scene?.is('ar-mode') || scene?.is('vr-mode');

        if (isInAR) {
            console.log('📱 Contexto AR detectado durante teste');
            if (this.canvas) {
                this.canvas.style.visibility = 'visible';
                this.canvas.style.opacity = '1';
                this.canvas.style.pointerEvents = 'none';
                this.canvas.style.zIndex = '9999';
                console.log('✅ Canvas forçado a ser visível');
            }
        }

        // Limpar efeitos anteriores
        this.clearAllEffects();

        // Adiciona um efeito de desenho estático que será renderizado pelo loop 'animate'
        const testDrawing = new StaticDrawingEffect((ctx) => {
            // Flash branco para feedback
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            // Retângulos coloridos
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillRect(50, 50, 200, 100);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(window.innerWidth - 250, 50, 200, 100);
            ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
            ctx.fillRect(window.innerWidth / 2 - 100, window.innerHeight / 2 - 50, 200, 100);

            // Texto de teste
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('TESTE VISUAL ATIVO', window.innerWidth / 2, window.innerHeight / 2);
        });
        this.effects.push(testDrawing);
        console.log('🟫 Indicadores visuais adicionados como um efeito persistente.');


        // Teste 1: Celebração no centro
        setTimeout(() => {
            console.log('🎉 Iniciando celebração...');
            this.showCelebrationEffect(window.innerWidth / 2, window.innerHeight / 2, 'ghost_captured');
        }, 1000);

        // Teste 2: Feixe de prótons por 3 segundos
        setTimeout(() => {
            console.log('⚡ Iniciando feixe de prótons...');
            this.startProtonBeamEffect();

            setTimeout(() => {
                console.log('⚡ Parando feixe de prótons...');
                this.stopProtonBeamEffect();
            }, 3000);
        }, 2000);

        // Teste 3: Sucção
        setTimeout(() => {
            console.log('🌪️ Iniciando sucção...');
            this.showSuctionEffect(
                window.innerWidth / 4,
                window.innerHeight / 4,
                (window.innerWidth * 3) / 4,
                (window.innerHeight * 3) / 4
            );
        }, 6000);

        // Limpar todos os efeitos (incluindo o desenho de teste) após 8 segundos
        setTimeout(() => {
            console.log('🧹 Limpando teste visual...');
            this.clearAllEffects();
        }, 8000);
    }
    
    getCelebrationColors(type) {
        switch (type) {
            case 'ghost_captured':
                return ['#92F428', '#CDDC39', '#8BC34A', '#4CAF50'];
            case 'ecto1_unlocked':
                return ['#FFD700', '#FF6347', '#FFA500', '#FF4500'];
            case 'inventory_full':
                return ['#2196F3', '#03DAC6', '#00BCD4', '#0097A7'];
            default:
                return ['#92F428', '#CDDC39', '#8BC34A'];
        }
    }
    
    triggerHapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }
}

// Classe base para partículas
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.size = 2;
        this.color = '#FFFFFF';
        this.alpha = 1.0;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.016; // ~60fps
        this.alpha = this.life / this.maxLife;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Partícula de celebração
class CelebrationParticle extends Particle {
    constructor(x, y, colors) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 8; // Velocidade reduzida
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.gravity = 0.12; // Mais gravidade
        this.life = 1.5 + Math.random(); // Vida mais curta
        this.maxLife = this.life;
        this.size = 3 + Math.random() * 4; // Tamanho reduzido
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.spin = Math.random() * 0.2;
        this.angle = 0;
        this.glow = 10 + Math.random() * 10; // Menos brilho
        this.sparkle = Math.random() < 0.2; // Menos estrelas
    }
    
    update() {
        super.update();
        this.vy += this.gravity;
        this.angle += this.spin;
        this.size *= 0.99; // Diminui mais rápido
        
        // Efeito de cintilação
        if (this.sparkle && Math.random() < 0.05) {
            this.size *= 1.2;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glow;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (this.sparkle) {
            // Desenhar estrela simples
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 144) * Math.PI / 180;
                const x = Math.cos(angle) * this.size;
                const y = Math.sin(angle) * this.size;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        } else {
            // Desenhar círculo simples
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Partícula de sucção
class SuctionParticle extends Particle {
    constructor(fromX, fromY, toX, toY) {
        super(fromX, fromY);
        this.startX = fromX;
        this.startY = fromY;
        this.targetX = toX;
        this.targetY = toY;
        this.progress = 0;
        this.speed = 0.015 + Math.random() * 0.025; // Velocidade mais variada
        this.life = 1.0;
        this.maxLife = 1.0;
        this.size = 2 + Math.random() * 5; // Partículas maiores
        this.color = ['#00FFFF', '#40E0D0', '#00CED1', '#5F9EA0'][Math.floor(Math.random() * 4)];
        this.trail = [];
        this.glow = 15 + Math.random() * 15;
        this.curve = (Math.random() - 0.5) * 60; // Curva mais pronunciada
    }
    
    update() {
        this.progress += this.speed;
        
        // Movimento suave com curva mais dramática
        const curve = Math.sin(this.progress * Math.PI) * this.curve;
        const easeProgress = this.easeInOut(this.progress);
        
        this.x = this.startX + (this.targetX - this.startX) * easeProgress;
        this.y = this.startY + (this.targetY - this.startY) * easeProgress + curve;
        
        // Adicionar à trilha
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > 15) { // Trilha mais longa
            this.trail.shift();
        }
        
        // Acelerar conforme se aproxima do alvo
        this.speed *= 1.02;
        
        if (this.progress >= 1.0) {
            this.life = 0;
        }
    }
    
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    render(ctx) {
        // Renderizar trilha com gradiente
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glow * 0.5;
        
        ctx.beginPath();
        this.trail.forEach((point, index) => {
            const alpha = (index / this.trail.length) * 0.6;
            ctx.globalAlpha = alpha;
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        ctx.restore();
        
        // Renderizar partícula principal com brilho
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Anel externo
        ctx.globalAlpha = this.alpha * 0.3;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Partícula de falha
class FailureParticle extends Particle {
    constructor(x, y, colors) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 1.0 + Math.random() * 0.5;
        this.maxLife = this.life;
        this.size = 2 + Math.random() * 3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        super.update();
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
}

// Efeito de explosão
class ExplosionEffect {
    constructor(x, y, colors, type) {
        this.x = x;
        this.y = y;
        this.colors = colors;
        this.type = type;
        this.radius = 0;
        this.maxRadius = type === 'ecto1_unlocked' ? 150 : 100; // Explosão maior
        this.life = 1.0;
        this.active = true;
        this.rings = 5; // Mais anéis
        this.pulseIntensity = 1.0;
    }
    
    update() {
        this.radius += 3; // Crescimento mais rápido
        this.life -= 0.015; // Dura mais tempo
        this.pulseIntensity = 0.8 + Math.sin(Date.now() * 0.01) * 0.2; // Pulsação
        
        if (this.radius > this.maxRadius || this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        for (let i = 0; i < this.rings; i++) {
            const ringRadius = this.radius - (i * 20);
            if (ringRadius > 0) {
                const alpha = (this.life * 0.5 * this.pulseIntensity) * (1 - i * 0.15);
                
                // Anel principal
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = this.colors[i % this.colors.length];
                ctx.lineWidth = 4 + (this.rings - i);
                ctx.shadowColor = this.colors[i % this.colors.length];
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Anel interno brilhante
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillStyle = this.colors[i % this.colors.length];
                ctx.beginPath();
                ctx.arc(this.x, this.y, ringRadius * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Centro brilhante
        if (this.radius < this.maxRadius * 0.5) {
            ctx.globalAlpha = this.life * 0.8;
            ctx.fillStyle = this.colors[0];
            ctx.shadowColor = this.colors[0];
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 15 * this.pulseIntensity, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Efeito de conexão energética
class EnergyConnection {
    constructor(fromX, fromY, toX, toY, color = '#00FFFF', type = 'energy_connection', isPermanent = false) {
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.life = 1.0;
        this.active = true;
        this.lightning = [];
        this.color = color;
        this.type = type;
        this.isPermanent = isPermanent;
        this.generateLightning();
    }
    
    generateLightning() {
        const segments = 10;
        const dx = (this.toX - this.fromX) / segments;
        const dy = (this.toY - this.fromY) / segments;
        
        this.lightning = [{ x: this.fromX, y: this.fromY }];
        
        for (let i = 1; i < segments; i++) {
            const x = this.fromX + dx * i + (Math.random() - 0.5) * 20;
            const y = this.fromY + dy * i + (Math.random() - 0.5) * 20;
            this.lightning.push({ x, y });
        }
        
        this.lightning.push({ x: this.toX, y: this.toY });
    }
    
    update() {
        if (!this.isPermanent) {
            this.life -= 0.05;
            if (this.life <= 0) {
                this.active = false;
            }
        }
        
        // Regenerar raio ocasionalmente
        if (Math.random() < 0.3) {
            this.generateLightning();
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        this.lightning.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        
        ctx.restore();
    }
}



// Efeito de X vermelho para falhas
class FailureXEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.maxSize = 40;
        this.life = 1.0;
        this.active = true;
    }
    
    update() {
        if (this.size < this.maxSize) {
            this.size += 2;
        } else {
            this.life -= 0.03;
        }
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // Desenhar X
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/2, this.y - this.size/2);
        ctx.lineTo(this.x + this.size/2, this.y + this.size/2);
        ctx.moveTo(this.x + this.size/2, this.y - this.size/2);
        ctx.lineTo(this.x - this.size/2, this.y + this.size/2);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Efeito para desenhar elementos estáticos de teste
class StaticDrawingEffect {
    constructor(drawingFunction) {
        this.drawingFunction = drawingFunction;
        this.active = true;
        this.type = 'static_test_drawing'; // Para fácil identificação
    }

    update() {
        // Este efeito não muda com o tempo
    }

    render(ctx) {
        this.drawingFunction(ctx);
    }
}

// Inicializar sistema globalmente quando a página estiver pronta
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.visualEffectsSystem = new VisualEffectsSystem();
        });
    } else {
        window.visualEffectsSystem = new VisualEffectsSystem();
    }
}

console.log('🎨 Sistema de Efeitos Visuais carregado com sucesso!');