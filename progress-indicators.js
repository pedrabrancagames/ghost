// Sistema de Indicadores de Progresso Avançado
class ProgressIndicators {
    constructor() {
        this.activeIndicators = new Map();
        this.globalProgress = 0;
        this.setupGlobalIndicator();
    }
    
    setupGlobalIndicator() {
        // Cria indicador global fixo no topo
        this.globalIndicator = document.createElement('div');
        this.globalIndicator.id = 'global-progress-indicator';
        this.globalIndicator.className = 'global-progress hidden';
        this.globalIndicator.innerHTML = `
            <div class="global-progress-bar">
                <div class="global-progress-fill"></div>
            </div>
            <div class="global-progress-text">Carregando...</div>
        `;
        
        document.body.appendChild(this.globalIndicator);
        
        this.globalBar = this.globalIndicator.querySelector('.global-progress-fill');
        this.globalText = this.globalIndicator.querySelector('.global-progress-text');
    }
    
    // Cria um indicador de progresso personalizado
    createIndicator(id, options = {}) {
        const config = {
            type: 'circular', // 'circular', 'linear', 'dots'
            size: 'medium', // 'small', 'medium', 'large'
            color: '#92F428',
            position: 'center', // 'center', 'top', 'bottom', 'custom'
            showPercentage: true,
            showText: true,
            animated: true,
            ...options
        };
        
        const indicator = this.buildIndicator(id, config);
        this.activeIndicators.set(id, { element: indicator, config });
        
        return indicator;
    }
    
    buildIndicator(id, config) {
        const container = document.createElement('div');
        container.id = `progress-${id}`;
        container.className = `progress-indicator ${config.type} ${config.size} ${config.position}`;
        
        if (config.type === 'circular') {
            container.innerHTML = this.buildCircularIndicator(config);
        } else if (config.type === 'linear') {
            container.innerHTML = this.buildLinearIndicator(config);
        } else if (config.type === 'dots') {
            container.innerHTML = this.buildDotsIndicator(config);
        }
        
        document.body.appendChild(container);
        return container;
    }
    
    buildCircularIndicator(config) {
        return `
            <div class="circular-progress">
                <svg class="circular-svg" viewBox="0 0 100 100">
                    <circle class="circular-bg" cx="50" cy="50" r="45" 
                            fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                    <circle class="circular-fill" cx="50" cy="50" r="45" 
                            fill="none" stroke="${config.color}" stroke-width="8"
                            stroke-dasharray="283" stroke-dashoffset="283"
                            transform="rotate(-90 50 50)"/>
                </svg>
                ${config.showPercentage ? '<div class="circular-percentage">0%</div>' : ''}
                ${config.showText ? '<div class="circular-text">Carregando...</div>' : ''}
            </div>
        `;
    }
    
    buildLinearIndicator(config) {
        return `
            <div class="linear-progress">
                <div class="linear-bg"></div>
                <div class="linear-fill" style="background: ${config.color}"></div>
                ${config.showPercentage ? '<div class="linear-percentage">0%</div>' : ''}
                ${config.showText ? '<div class="linear-text">Carregando...</div>' : ''}
            </div>
        `;
    }
    
    buildDotsIndicator(config) {
        return `
            <div class="dots-progress">
                <div class="dot" style="background: ${config.color}"></div>
                <div class="dot" style="background: ${config.color}"></div>
                <div class="dot" style="background: ${config.color}"></div>
                ${config.showText ? '<div class="dots-text">Carregando...</div>' : ''}
            </div>
        `;
    }
    
    // Atualiza um indicador específico
    updateIndicator(id, progress, text = '') {
        const indicator = this.activeIndicators.get(id);
        if (!indicator) return;
        
        const { element, config } = indicator;
        const percentage = Math.max(0, Math.min(100, progress));
        
        if (config.type === 'circular') {
            this.updateCircularIndicator(element, percentage, text, config);
        } else if (config.type === 'linear') {
            this.updateLinearIndicator(element, percentage, text, config);
        } else if (config.type === 'dots') {
            this.updateDotsIndicator(element, percentage, text, config);
        }
    }
    
    updateCircularIndicator(element, percentage, text, config) {
        const circle = element.querySelector('.circular-fill');
        const percentageEl = element.querySelector('.circular-percentage');
        const textEl = element.querySelector('.circular-text');
        
        if (circle) {
            const circumference = 283;
            const offset = circumference - (percentage / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            
            if (config.animated) {
                circle.style.transition = 'stroke-dashoffset 0.3s ease';
            }
        }
        
        if (percentageEl && config.showPercentage) {
            percentageEl.textContent = `${Math.round(percentage)}%`;
        }
        
        if (textEl && config.showText && text) {
            textEl.textContent = text;
        }
    }
    
    updateLinearIndicator(element, percentage, text, config) {
        const fill = element.querySelector('.linear-fill');
        const percentageEl = element.querySelector('.linear-percentage');
        const textEl = element.querySelector('.linear-text');
        
        if (fill) {
            fill.style.width = `${percentage}%`;
            
            if (config.animated) {
                fill.style.transition = 'width 0.3s ease';
            }
        }
        
        if (percentageEl && config.showPercentage) {
            percentageEl.textContent = `${Math.round(percentage)}%`;
        }
        
        if (textEl && config.showText && text) {
            textEl.textContent = text;
        }
    }
    
    updateDotsIndicator(element, percentage, text, config) {
        const dots = element.querySelectorAll('.dot');
        const textEl = element.querySelector('.dots-text');
        
        // Anima os pontos baseado no progresso
        const activeDots = Math.ceil((percentage / 100) * dots.length);
        
        dots.forEach((dot, index) => {
            if (index < activeDots) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        if (textEl && config.showText && text) {
            textEl.textContent = text;
        }
    }
    
    // Mostra um indicador
    showIndicator(id) {
        const indicator = this.activeIndicators.get(id);
        if (indicator) {
            indicator.element.classList.remove('hidden');
            indicator.element.classList.add('visible');
        }
    }
    
    // Esconde um indicador
    hideIndicator(id) {
        const indicator = this.activeIndicators.get(id);
        if (indicator) {
            indicator.element.classList.add('hidden');
            indicator.element.classList.remove('visible');
        }
    }
    
    // Remove um indicador
    removeIndicator(id) {
        const indicator = this.activeIndicators.get(id);
        if (indicator) {
            indicator.element.remove();
            this.activeIndicators.delete(id);
        }
    }
    
    // Indicador global para operações gerais
    showGlobalProgress(text = 'Carregando...') {
        this.globalIndicator.classList.remove('hidden');
        this.globalText.textContent = text;
    }
    
    updateGlobalProgress(percentage, text = '') {
        this.globalProgress = Math.max(0, Math.min(100, percentage));
        this.globalBar.style.width = `${this.globalProgress}%`;
        
        if (text) {
            this.globalText.textContent = text;
        }
    }
    
    hideGlobalProgress() {
        this.globalIndicator.classList.add('hidden');
    }
    
    // Indicador de download para assets específicos
    createDownloadIndicator(assetName, size = 0) {
        const id = `download-${Date.now()}`;
        const indicator = this.createIndicator(id, {
            type: 'linear',
            position: 'top',
            showText: true,
            color: '#2196F3'
        });
        
        // Adiciona informações de download
        const downloadInfo = document.createElement('div');
        downloadInfo.className = 'download-info';
        downloadInfo.innerHTML = `
            <div class="download-asset">${assetName}</div>
            <div class="download-size">${this.formatBytes(size)}</div>
            <div class="download-speed">0 KB/s</div>
        `;
        
        indicator.appendChild(downloadInfo);
        
        return {
            id,
            update: (progress, speed = 0) => {
                this.updateIndicator(id, progress);
                const speedEl = indicator.querySelector('.download-speed');
                if (speedEl) {
                    speedEl.textContent = `${this.formatBytes(speed)}/s`;
                }
            },
            complete: () => {
                setTimeout(() => this.removeIndicator(id), 1000);
            }
        };
    }
    
    // Indicador de múltiplas tarefas
    createMultiTaskIndicator(tasks) {
        const id = `multitask-${Date.now()}`;
        const indicator = this.createIndicator(id, {
            type: 'circular',
            size: 'large',
            showText: true
        });
        
        // Adiciona lista de tarefas
        const taskList = document.createElement('div');
        taskList.className = 'task-list';
        
        tasks.forEach((task, index) => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            taskEl.innerHTML = `
                <div class="task-name">${task.name}</div>
                <div class="task-status">Aguardando...</div>
            `;
            taskList.appendChild(taskEl);
        });
        
        indicator.appendChild(taskList);
        
        return {
            id,
            updateTask: (taskIndex, status, progress = 0) => {
                const taskEl = taskList.children[taskIndex];
                if (taskEl) {
                    const statusEl = taskEl.querySelector('.task-status');
                    statusEl.textContent = status;
                    
                    // Atualiza progresso geral
                    const completedTasks = Array.from(taskList.children)
                        .filter(el => el.querySelector('.task-status').textContent === 'Concluído').length;
                    
                    const overallProgress = (completedTasks / tasks.length) * 100;
                    this.updateIndicator(id, overallProgress, `${completedTasks}/${tasks.length} tarefas`);
                }
            },
            complete: () => {
                setTimeout(() => this.removeIndicator(id), 2000);
            }
        };
    }
    
    // Utilitários
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Limpa todos os indicadores
    clearAll() {
        this.activeIndicators.forEach((indicator, id) => {
            this.removeIndicator(id);
        });
        this.hideGlobalProgress();
    }
    
    // Obtém estatísticas dos indicadores ativos
    getStats() {
        return {
            activeCount: this.activeIndicators.size,
            globalProgress: this.globalProgress,
            indicators: Array.from(this.activeIndicators.keys())
        };
    }
}

// Estilos CSS para os indicadores (injetados dinamicamente)
const progressStyles = `
<style>
.global-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10001;
    transition: opacity 0.3s ease;
}

.global-progress.hidden {
    opacity: 0;
    pointer-events: none;
}

.global-progress-bar {
    width: 100%;
    height: 100%;
    background: rgba(146, 244, 40, 0.2);
    overflow: hidden;
}

.global-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #92F428, #7BC91F);
    width: 0%;
    transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(146, 244, 40, 0.5);
}

.global-progress-text {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: #92F428;
    padding: 5px 10px;
    border-radius: 0 0 5px 5px;
    font-size: 0.8rem;
    white-space: nowrap;
}

.progress-indicator {
    position: fixed;
    z-index: 10000;
    transition: opacity 0.3s ease;
}

.progress-indicator.hidden {
    opacity: 0;
    pointer-events: none;
}

.progress-indicator.visible {
    opacity: 1;
}

.progress-indicator.center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.progress-indicator.top {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
}

.progress-indicator.bottom {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
}

/* Circular Progress */
.circular-progress {
    position: relative;
    text-align: center;
}

.progress-indicator.small .circular-svg {
    width: 60px;
    height: 60px;
}

.progress-indicator.medium .circular-svg {
    width: 100px;
    height: 100px;
}

.progress-indicator.large .circular-svg {
    width: 150px;
    height: 150px;
}

.circular-percentage {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: bold;
    color: #92F428;
}

.circular-text {
    margin-top: 10px;
    color: #cccccc;
    font-size: 0.9rem;
}

/* Linear Progress */
.linear-progress {
    position: relative;
    width: 300px;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
}

.linear-fill {
    height: 100%;
    width: 0%;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.linear-percentage {
    position: absolute;
    top: -25px;
    right: 0;
    color: #92F428;
    font-size: 0.8rem;
    font-weight: bold;
}

.linear-text {
    margin-top: 10px;
    color: #cccccc;
    font-size: 0.9rem;
    text-align: center;
}

/* Dots Progress */
.dots-progress {
    display: flex;
    align-items: center;
    gap: 10px;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    opacity: 0.3;
    transition: opacity 0.3s ease;
}

.dot.active {
    opacity: 1;
    animation: dot-pulse 1s infinite;
}

@keyframes dot-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

.dots-text {
    margin-left: 10px;
    color: #cccccc;
    font-size: 0.9rem;
}

/* Download Info */
.download-info {
    margin-top: 10px;
    text-align: center;
    font-size: 0.8rem;
}

.download-asset {
    color: #92F428;
    font-weight: bold;
    margin-bottom: 5px;
}

.download-size, .download-speed {
    color: #cccccc;
}

/* Task List */
.task-list {
    margin-top: 15px;
    max-width: 250px;
}

.task-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.task-name {
    color: #cccccc;
    font-size: 0.8rem;
}

.task-status {
    color: #92F428;
    font-size: 0.8rem;
    font-weight: bold;
}

/* Responsivo */
@media (max-width: 768px) {
    .linear-progress {
        width: 250px;
    }
    
    .progress-indicator.large .circular-svg {
        width: 120px;
        height: 120px;
    }
    
    .task-list {
        max-width: 200px;
    }
}
</style>
`;

// Injeta os estilos
document.head.insertAdjacentHTML('beforeend', progressStyles);

// Inicializa o sistema de indicadores
const progressIndicators = new ProgressIndicators();

// Exporta para uso global
window.progressIndicators = progressIndicators;