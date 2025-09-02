/**
 * Sistema de Notificações - Ghostbusters AR
 * Sistema avançado de notificações toast, modais e alertas
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 4000;
        this.isInitialized = false;
        
        // Aguardar carregamento da página antes de inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            // Se já carregou, aguardar um pouco para garantir que body existe
            setTimeout(() => this.init(), 100);
        }
    }
    
    init() {
        if (!document.body) {
            console.warn('⚠️ document.body não disponível para notificações, tentando novamente...');
            setTimeout(() => this.init(), 200);
            return;
        }
        
        try {
            this.createContainer();
            this.injectStyles();
            this.isInitialized = true;
            console.log('📢 Sistema de Notificações inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar Sistema de Notificações:', error);
            setTimeout(() => this.init(), 500);
        }
    }
    
    createContainer() {
        // Remove container existente se houver
        const existing = document.getElementById('notifications-container');
        if (existing) {
            existing.remove();
        }
        
        // Criar novo container
        this.container = document.createElement('div');
        this.container.id = 'notifications-container';
        this.container.className = 'notifications-container';
        document.body.appendChild(this.container);
    }
    
    injectStyles() {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notifications-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 350px;
                pointer-events: none;
            }
            
            .notification-toast {
                background: rgba(30, 30, 30, 0.95);
                border-radius: 12px;
                padding: 16px 20px;
                color: white;
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.4;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                pointer-events: auto;
                cursor: pointer;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                position: relative;
                overflow: hidden;
            }
            
            .notification-toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification-toast.hide {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .notification-toast::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #92F428, #4CAF50);
                transform: scaleX(0);
                transform-origin: left;
                transition: transform linear;
            }
            
            .notification-toast.with-progress::before {
                animation: progress-bar linear forwards;
            }
            
            @keyframes progress-bar {
                from { transform: scaleX(0); }
                to { transform: scaleX(1); }
            }
            
            .notification-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
                font-weight: bold;
            }
            
            .notification-icon {
                font-size: 20px;
                min-width: 20px;
            }
            
            .notification-title {
                flex: 1;
                font-size: 16px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .notification-message {
                font-size: 14px;
                opacity: 0.9;
                line-height: 1.5;
            }
            
            /* Tipos de notificação */
            .notification-success {
                border-left: 4px solid #4CAF50;
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.05));
            }
            
            .notification-error {
                border-left: 4px solid #F44336;
                background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(255, 87, 34, 0.05));
            }
            
            .notification-warning {
                border-left: 4px solid #FF9800;
                background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.05));
            }
            
            .notification-info {
                border-left: 4px solid #2196F3;
                background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(3, 218, 198, 0.05));
            }
            
            .notification-ghostbusters {
                border-left: 4px solid #92F428;
                background: linear-gradient(135deg, rgba(146, 244, 40, 0.15), rgba(76, 175, 80, 0.05));
            }
            
            /* Animações especiais */
            .notification-pulse {
                animation: notification-pulse 2s ease-in-out infinite;
            }
            
            @keyframes notification-pulse {
                0% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
                50% { box-shadow: 0 8px 32px rgba(146, 244, 40, 0.3), 0 0 20px rgba(146, 244, 40, 0.2); }
                100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
            }
            
            .notification-shake {
                animation: notification-shake 0.6s ease-in-out;
            }
            
            @keyframes notification-shake {
                0% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                50% { transform: translateX(5px); }
                75% { transform: translateX(-3px); }
                100% { transform: translateX(0); }
            }
            
            /* Responsivo */
            @media (max-width: 768px) {
                .notifications-container {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                    max-width: none;
                }
                
                .notification-toast {
                    padding: 12px 16px;
                    font-size: 13px;
                }
                
                .notification-header {
                    margin-bottom: 6px;
                }
                
                .notification-title {
                    font-size: 15px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Método principal para criar notificações
    show(message, type = 'info', options = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ Sistema de notificações não inicializado ainda');
            return null;
        }
        
        const notification = this.createNotification(message, type, options);
        this.addNotification(notification);
        return notification;
    }
    
    // Métodos específicos para cada tipo
    success(message, options = {}) {
        return this.show(message, 'success', {
            icon: '✅',
            title: 'Sucesso!',
            ...options
        });
    }
    
    error(message, options = {}) {
        return this.show(message, 'error', {
            icon: '❌',
            title: 'Erro!',
            duration: 6000,
            ...options
        });
    }
    
    warning(message, options = {}) {
        return this.show(message, 'warning', {
            icon: '⚠️',
            title: 'Atenção!',
            ...options
        });
    }
    
    info(message, options = {}) {
        return this.show(message, 'info', {
            icon: 'ℹ️',
            title: 'Informação',
            ...options
        });
    }
    
    // Notificações específicas do Ghostbusters
    ghostCaptured(ghostType = 'fantasma', points = 10) {
        // return this.show(
        //     `${ghostType} capturado! +${points} pontos`,
        //     'ghostbusters',
        //     {
        //         icon: '👻',
        //         title: 'Fantasma Capturado!',
        //         duration: 3000,
        //         pulse: true
        //     }
        // );
    }
    
    inventoryFull() {
        return this.show(
            'Inventário cheio! Deposite os fantasmas na unidade de contenção.',
            'warning',
            {
                icon: '📦',
                title: 'Inventário Cheio',
                duration: 5000,
                shake: true
            }
        );
    }
    
    ecto1Unlocked() {
        return this.show(
            'ECTO-1 desbloqueado! Vá até o local indicado no mapa.',
            'ghostbusters',
            {
                icon: '🚗',
                title: 'ECTO-1 Disponível!',
                duration: 6000,
                pulse: true
            }
        );
    }
    
    captureFailure(reason = 'Fantasma escapou!') {
        return this.show(
            reason,
            'error',
            {
                icon: '💨',
                title: 'Falha na Captura',
                duration: 3000,
                shake: true
            }
        );
    }
    
    protonPackOverheat() {
        return this.show(
            'Proton Pack superaqueceu! Aguarde antes de usar novamente.',
            'warning',
            {
                icon: '🔥',
                title: 'Superaquecimento',
                duration: 4000
            }
        );
    }
    
    multiplayerJoined(playerName) {
        return this.show(
            `${playerName} entrou na sessão!`,
            'info',
            {
                icon: '👥',
                title: 'Jogador Conectado',
                duration: 3000
            }
        );
    }
    
    createNotification(message, type, options) {
        const {
            title = '',
            icon = '',
            duration = this.defaultDuration,
            closable = true,
            pulse = false,
            shake = false,
            showProgress = true
        } = options;
        
        // Criar elemento da notificação
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
        
        if (pulse) notification.classList.add('notification-pulse');
        if (shake) notification.classList.add('notification-shake');
        if (showProgress && duration > 0) notification.classList.add('with-progress');
        
        // Estrutura HTML
        notification.innerHTML = `
            ${title || icon ? `
                <div class="notification-header">
                    ${icon ? `<span class="notification-icon">${icon}</span>` : ''}
                    ${title ? `<span class="notification-title">${title}</span>` : ''}
                    ${closable ? '<button class="notification-close">×</button>' : ''}
                </div>
            ` : ''}
            <div class="notification-message">${message}</div>
        `;
        
        // Configurar animação da barra de progresso
        if (showProgress && duration > 0) {
            const progressBar = notification.querySelector('::before');
            if (progressBar) {
                notification.style.setProperty('--duration', `${duration}ms`);
            }
        }
        
        // Event listeners
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeNotification(notification);
            });
        }
        
        // Click para fechar
        notification.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Auto-close
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        // Dados da notificação
        notification._data = {
            type,
            message,
            timestamp: Date.now(),
            duration,
            options
        };
        
        return notification;
    }
    
    addNotification(notification) {
        // Remover notificações antigas se exceder o limite
        while (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            this.removeNotification(oldest, false);
        }
        
        // Adicionar ao container
        this.container.appendChild(notification);
        this.notifications.push(notification);
        
        // Trigger animação de entrada
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        console.log(`📢 Notificação criada: ${notification._data.type} - ${notification._data.message}`);
    }
    
    removeNotification(notification, removeFromArray = true) {
        if (!notification || !notification.parentNode) return;
        
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            if (removeFromArray) {
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
            }
        }, 400);
        
        console.log(`📢 Notificação removida: ${notification._data.type}`);
    }
    
    // Limpar todas as notificações
    clearAll() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification, false);
        });
        this.notifications = [];
        console.log('📢 Todas as notificações foram limpas');
    }
    
    // Configurar opções globais
    configure(options) {
        if (options.maxNotifications) {
            this.maxNotifications = options.maxNotifications;
        }
        if (options.defaultDuration) {
            this.defaultDuration = options.defaultDuration;
        }
        
        console.log('📢 Configurações atualizadas:', options);
    }
    
    // Obter notificações ativas
    getActive() {
        return this.notifications.map(n => n._data);
    }
    
    // Verificar se há notificações do tipo específico
    hasType(type) {
        return this.notifications.some(n => n._data.type === type);
    }
}

// Funções globais de conveniência
window.showSuccess = (message, duration = 4000) => {
    return window.notificationSystem.success(message, { duration });
};

window.showError = (message, duration = 6000) => {
    return window.notificationSystem.error(message, { duration });
};

window.showWarning = (message, duration = 5000) => {
    return window.notificationSystem.warning(message, { duration });
};

window.showInfo = (message, duration = 4000) => {
    return window.notificationSystem.info(message, { duration });
};

// Inicializar sistema globalmente quando a página estiver pronta
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.notificationSystem = new NotificationSystem();
        });
    } else {
        window.notificationSystem = new NotificationSystem();
    }
}

console.log('📢 Sistema de Notificações carregado com sucesso!');