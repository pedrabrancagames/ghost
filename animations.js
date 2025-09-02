/**
 * Sistema de Animações - Ghostbusters AR
 * Gerencia animações CSS e JavaScript para elementos do jogo
 */

class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.sequences = new Map();
        this.init();
    }
    
    init() {
        this.injectAnimationStyles();
        this.setupAnimationHelpers();
        console.log('🎬 Sistema de Animações inicializado');
    }
    
    injectAnimationStyles() {
        const style = document.createElement('style');
        style.id = 'ghostbusters-animations';
        style.textContent = `
            /* Animações de Pulso e Brilho */
            @keyframes ghostbusters-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            @keyframes ghostbusters-glow {
                0% { box-shadow: 0 0 5px rgba(146, 244, 40, 0.5); }
                50% { box-shadow: 0 0 20px rgba(146, 244, 40, 0.8), 0 0 30px rgba(146, 244, 40, 0.6); }
                100% { box-shadow: 0 0 5px rgba(146, 244, 40, 0.5); }
            }
            
            /* Animações de Captura */
            @keyframes suction-effect {
                0% { transform: scale(1) rotate(0deg); filter: brightness(1); }
                25% { transform: scale(0.95) rotate(5deg); filter: brightness(1.2); }
                50% { transform: scale(0.9) rotate(-5deg); filter: brightness(1.4); }
                75% { transform: scale(0.85) rotate(3deg); filter: brightness(1.6); }
                100% { transform: scale(0.8) rotate(0deg); filter: brightness(1.8); }
            }
            
            @keyframes celebration-bounce {
                0% { transform: scale(1) translateY(0); }
                25% { transform: scale(1.1) translateY(-10px); }
                50% { transform: scale(1.2) translateY(-20px); }
                75% { transform: scale(1.1) translateY(-10px); }
                100% { transform: scale(1) translateY(0); }
            }
            
            /* Animações de Fantasma */
            @keyframes ghost-appear {
                0% { opacity: 0; transform: scale(0.5) translateY(20px); }
                50% { opacity: 0.7; transform: scale(1.1) translateY(-5px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            @keyframes ghost-disappear {
                0% { opacity: 1; transform: scale(1) rotate(0deg); }
                50% { opacity: 0.5; transform: scale(0.8) rotate(180deg); }
                100% { opacity: 0; transform: scale(0.3) rotate(360deg); }
            }
            
            @keyframes ghost-captured {
                0% { transform: scale(1) rotate(0deg); filter: brightness(1); }
                25% { transform: scale(1.2) rotate(90deg); filter: brightness(1.5) hue-rotate(90deg); }
                50% { transform: scale(0.8) rotate(180deg); filter: brightness(2) hue-rotate(180deg); }
                75% { transform: scale(0.5) rotate(270deg); filter: brightness(2.5) hue-rotate(270deg); }
                100% { transform: scale(0.1) rotate(360deg); filter: brightness(3) hue-rotate(360deg); opacity: 0; }
            }
            
            /* Animações de Proton Pack */
            @keyframes proton-pack-charge {
                0% { background: linear-gradient(45deg, #666, #999); transform: scale(1); }
                50% { background: linear-gradient(45deg, #92F428, #CDDC39); transform: scale(1.05); }
                100% { background: linear-gradient(45deg, #4CAF50, #8BC34A); transform: scale(1.1); }
            }
            
            @keyframes proton-pack-fire {
                0% { filter: brightness(1) drop-shadow(0 0 5px rgba(146, 244, 40, 0.5)); }
                25% { filter: brightness(1.3) drop-shadow(0 0 15px rgba(146, 244, 40, 0.8)); }
                50% { filter: brightness(1.6) drop-shadow(0 0 25px rgba(146, 244, 40, 1)); }
                75% { filter: brightness(1.3) drop-shadow(0 0 15px rgba(146, 244, 40, 0.8)); }
                100% { filter: brightness(1) drop-shadow(0 0 5px rgba(146, 244, 40, 0.5)); }
            }
            
            /* Animações de UI */
            @keyframes inventory-full-shake {
                0% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                50% { transform: translateX(5px); }
                75% { transform: translateX(-3px); }
                100% { transform: translateX(0); }
            }
            
            @keyframes notification-slide-in {
                0% { transform: translateY(-100%) scale(0.8); opacity: 0; }
                50% { transform: translateY(10px) scale(1.05); opacity: 0.8; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            
            @keyframes notification-slide-out {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-100%) scale(0.8); opacity: 0; }
            }
            
            /* Animações de Ecto-1 */
            @keyframes ecto1-drive-in {
                0% { transform: translateX(-100%) scale(0.8); opacity: 0; }
                50% { transform: translateX(10px) scale(1.1); opacity: 0.8; }
                100% { transform: translateX(0) scale(1); opacity: 1; }
            }
            
            @keyframes ecto1-honk {
                0% { transform: scale(1); filter: brightness(1); }
                25% { transform: scale(1.1); filter: brightness(1.3); }
                50% { transform: scale(1.2); filter: brightness(1.6); }
                75% { transform: scale(1.1); filter: brightness(1.3); }
                100% { transform: scale(1); filter: brightness(1); }
            }
            
            /* Animações de Loading */
            @keyframes loading-dots {
                0% { opacity: 0.3; }
                50% { opacity: 1; }
                100% { opacity: 0.3; }
            }
            
            @keyframes progress-fill {
                0% { width: 0%; background: linear-gradient(90deg, #666, #999); }
                100% { background: linear-gradient(90deg, #92F428, #4CAF50); }
            }
            
            /* Animações de Erro */
            @keyframes error-flash {
                0% { background: rgba(244, 67, 54, 0); }
                50% { background: rgba(244, 67, 54, 0.3); }
                100% { background: rgba(244, 67, 54, 0); }
            }
            
            @keyframes error-shake {
                0% { transform: translateX(0); }
                10% { transform: translateX(-10px); }
                20% { transform: translateX(10px); }
                30% { transform: translateX(-10px); }
                40% { transform: translateX(10px); }
                50% { transform: translateX(-5px); }
                60% { transform: translateX(5px); }
                70% { transform: translateX(-5px); }
                80% { transform: translateX(5px); }
                90% { transform: translateX(-2px); }
                100% { transform: translateX(0); }
            }
            
            /* Classes de Animação */
            .anim-pulse { animation: ghostbusters-pulse 1s ease-in-out infinite; }
            .anim-glow { animation: ghostbusters-glow 2s ease-in-out infinite; }
            .anim-suction-effect { animation: suction-effect 1s ease-out forwards; }
            .anim-celebration-bounce { animation: celebration-bounce 0.6s ease-out; }
            .anim-ghost-appear { animation: ghost-appear 0.8s ease-out; }
            .anim-ghost-disappear { animation: ghost-disappear 0.6s ease-in forwards; }
            .anim-ghost-captured { animation: ghost-captured 1s ease-in forwards; }
            .anim-proton-pack-charge { animation: proton-pack-charge 2s ease-in-out infinite; }
            .anim-proton-pack-fire { animation: proton-pack-fire 0.1s ease-in-out infinite; }
            .anim-inventory-full-shake { animation: inventory-full-shake 0.5s ease-in-out 3; }
            .anim-notification-slide-in { animation: notification-slide-in 0.4s ease-out; }
            .anim-notification-slide-out { animation: notification-slide-out 0.3s ease-in forwards; }
            .anim-ecto1-drive-in { animation: ecto1-drive-in 1.5s ease-out; }
            .anim-ecto1-honk { animation: ecto1-honk 0.3s ease-out; }
            .anim-loading-dots { animation: loading-dots 1.5s ease-in-out infinite; }
            .anim-error-flash { animation: error-flash 0.3s ease-in-out 3; }
            .anim-error-shake { animation: error-shake 0.6s ease-in-out; }
            
            /* Estados de Transição */
            .transition-smooth { transition: all 0.3s ease; }
            .transition-bounce { transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
            .transition-elastic { transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        `;
        
        document.head.appendChild(style);
    }
    
    setupAnimationHelpers() {
        // Helper para detectar suporte a animações
        this.supportsAnimations = this.checkAnimationSupport();
        
        // Configurar observador de animações
        this.setupAnimationObserver();
    }
    
    checkAnimationSupport() {
        const el = document.createElement('div');
        return typeof el.style.animation !== 'undefined';
    }
    
    setupAnimationObserver() {
        // Observar início e fim de animações
        document.addEventListener('animationstart', (e) => {
            console.log(`🎬 Animação iniciada: ${e.animationName}`);
        });
        
        document.addEventListener('animationend', (e) => {
            console.log(`🏁 Animação finalizada: ${e.animationName}`);
            this.onAnimationEnd(e);
        });
    }
    
    onAnimationEnd(event) {
        const element = event.target;
        
        // Remover classes de animação temporárias
        const tempClasses = [
            'anim-celebration-bounce',
            'anim-suction-effect',
            'anim-ghost-captured',
            'anim-inventory-full-shake',
            'anim-error-shake',
            'anim-error-flash'
        ];
        
        tempClasses.forEach(className => {
            if (element.classList.contains(className)) {
                element.classList.remove(className);
            }
        });
    }
    
    // Animar elemento com classe CSS
    animate(element, animationClass, duration = null) {
        if (!element) return Promise.reject('Elemento não encontrado');
        
        return new Promise((resolve) => {
            const handleAnimationEnd = () => {
                element.classList.remove(animationClass);
                element.removeEventListener('animationend', handleAnimationEnd);
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
            element.classList.add(animationClass);
            
            // Fallback para timeout
            if (duration) {
                setTimeout(() => {
                    if (element.classList.contains(animationClass)) {
                        element.classList.remove(animationClass);
                        element.removeEventListener('animationend', handleAnimationEnd);
                        resolve();
                    }
                }, duration);
            }
        });
    }
    
    // Sequência de animações
    sequence(steps) {
        return steps.reduce((promise, step) => {
            return promise.then(() => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        step.action();
                        resolve();
                    }, step.delay || 0);
                });
            });
        }, Promise.resolve());
    }
    
    // Animações específicas do jogo
    animateGhostCapture(ghostElement) {
        return this.animate(ghostElement, 'anim-ghost-captured', 1000);
    }
    
    animateProtonPackFire(protonElement) {
        protonElement.classList.add('anim-proton-pack-fire');
        return {
            stop: () => protonElement.classList.remove('anim-proton-pack-fire')
        };
    }
    
    animateInventoryFull(inventoryElement) {
        return this.animate(inventoryElement, 'anim-inventory-full-shake', 1500);
    }
    
    animateEcto1Arrival(ecto1Element) {
        return this.animate(ecto1Element, 'anim-ecto1-drive-in', 1500);
    }
    
    animateNotificationIn(notificationElement) {
        return this.animate(notificationElement, 'anim-notification-slide-in', 400);
    }
    
    animateNotificationOut(notificationElement) {
        return this.animate(notificationElement, 'anim-notification-slide-out', 300);
    }
    
    // Animação de carregamento personalizada
    startLoadingAnimation(element, text = 'Carregando') {
        const dots = ['', '.', '..', '...'];
        let index = 0;
        
        const interval = setInterval(() => {
            element.textContent = text + dots[index];
            index = (index + 1) % dots.length;
        }, 500);
        
        return {
            stop: () => clearInterval(interval)
        };
    }
    
    // Animação de progresso
    animateProgress(progressElement, targetWidth, duration = 1000) {
        const startWidth = parseFloat(progressElement.style.width) || 0;
        const diff = targetWidth - startWidth;
        const startTime = performance.now();
        
        const updateProgress = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentWidth = startWidth + (diff * eased);
            
            progressElement.style.width = currentWidth + '%';
            
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            }
        };
        
        requestAnimationFrame(updateProgress);
    }
    
    // Shake effect personalizado
    shake(element, intensity = 10, duration = 600) {
        const originalTransform = element.style.transform;
        const startTime = performance.now();
        
        const doShake = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const x = (Math.random() - 0.5) * intensity * (1 - progress);
                element.style.transform = `translateX(${x}px)`;
                requestAnimationFrame(doShake);
            } else {
                element.style.transform = originalTransform;
            }
        };
        
        requestAnimationFrame(doShake);
    }
    
    // Efeito de brilho (glow) dinâmico
    glow(element, color = '#92F428', intensity = 20, duration = 2000) {
        const originalBoxShadow = element.style.boxShadow;
        const startTime = performance.now();
        
        const updateGlow = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = (elapsed % duration) / duration;
            
            // Senoidal para efeito suave
            const intensity_current = Math.sin(progress * Math.PI * 2) * intensity;
            element.style.boxShadow = `0 0 ${Math.abs(intensity_current)}px ${color}`;
            
            if (elapsed < duration) {
                requestAnimationFrame(updateGlow);
            } else {
                element.style.boxShadow = originalBoxShadow;
            }
        };
        
        requestAnimationFrame(updateGlow);
    }
    
    // Remover todas as animações de um elemento
    clearAnimations(element) {
        const animationClasses = [
            'anim-pulse', 'anim-glow', 'anim-suction-effect',
            'anim-celebration-bounce', 'anim-ghost-appear', 'anim-ghost-disappear',
            'anim-ghost-captured', 'anim-proton-pack-charge', 'anim-proton-pack-fire',
            'anim-inventory-full-shake', 'anim-notification-slide-in',
            'anim-notification-slide-out', 'anim-ecto1-drive-in', 'anim-ecto1-honk',
            'anim-loading-dots', 'anim-error-flash', 'anim-error-shake'
        ];
        
        animationClasses.forEach(className => {
            element.classList.remove(className);
        });
    }
}

// Inicializar sistema globalmente
window.animationManager = new AnimationManager();

console.log('🎬 Sistema de Animações carregado com sucesso!');