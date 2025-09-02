// Monitor de Performance e Métricas
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            cacheHitRate: 0,
            memoryUsage: 0,
            networkRequests: 0,
            errors: 0,
            fps: 0,
            batteryLevel: null,
            connectionType: 'unknown'
        };
        
        this.observers = [];
        this.startTime = performance.now();
        this.frameCount = 0;
        this.lastFrameTime = 0;
        
        this.init();
    }
    
    async init() {
        this.setupPerformanceObservers();
        this.monitorNetworkStatus();
        this.monitorBattery();
        this.startFPSMonitoring();
        this.monitorMemoryUsage();
        
        // Reporta métricas periodicamente
        setInterval(() => this.reportMetrics(), 30000); // A cada 30 segundos
    }
    
    setupPerformanceObservers() {
        // Observer para Navigation Timing
        if ('PerformanceObserver' in window) {
            try {
                const navObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'navigation') {
                            this.processNavigationEntry(entry);
                        }
                    });
                });
                
                navObserver.observe({ entryTypes: ['navigation'] });
                this.observers.push(navObserver);
            } catch (error) {
                console.warn('[Performance] Navigation observer não suportado:', error);
            }
            
            // Observer para Resource Timing
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'resource') {
                            this.processResourceEntry(entry);
                        }
                    });
                });
                
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.push(resourceObserver);
            } catch (error) {
                console.warn('[Performance] Resource observer não suportado:', error);
            }
            
            // Observer para Largest Contentful Paint
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.largestContentfulPaint = lastEntry.startTime;
                });
                
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.push(lcpObserver);
            } catch (error) {
                console.warn('[Performance] LCP observer não suportado:', error);
            }
        }
    }
    
    processNavigationEntry(entry) {
        this.metrics.loadTime = entry.loadEventEnd - entry.navigationStart;
        this.metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.navigationStart;
        this.metrics.firstPaint = entry.responseStart - entry.navigationStart;
        
        console.log('[Performance] Navigation metrics:', {
            loadTime: this.metrics.loadTime,
            domContentLoaded: this.metrics.domContentLoaded,
            firstPaint: this.metrics.firstPaint
        });
    }
    
    processResourceEntry(entry) {
        this.metrics.networkRequests++;
        
        // Analisa performance de recursos específicos
        if (entry.name.includes('.glb')) {
            this.trackAssetLoad('3D Model', entry);
        } else if (entry.name.includes('.mp3')) {
            this.trackAssetLoad('Audio', entry);
        } else if (entry.name.includes('.png') || entry.name.includes('.jpg')) {
            this.trackAssetLoad('Image', entry);
        }
    }
    
    trackAssetLoad(type, entry) {
        const loadTime = entry.responseEnd - entry.startTime;
        const size = entry.transferSize || 0;
        
        console.log(`[Performance] ${type} loaded:`, {
            name: entry.name.split('/').pop(),
            loadTime: Math.round(loadTime),
            size: this.formatBytes(size),
            cached: entry.transferSize === 0
        });
        
        // Atualiza taxa de cache hit
        if (entry.transferSize === 0) {
            this.updateCacheHitRate(true);
        } else {
            this.updateCacheHitRate(false);
        }
    }
    
    updateCacheHitRate(wasHit) {
        const currentHits = this.metrics.cacheHits || 0;
        const currentTotal = this.metrics.cacheTotal || 0;
        
        this.metrics.cacheHits = currentHits + (wasHit ? 1 : 0);
        this.metrics.cacheTotal = currentTotal + 1;
        this.metrics.cacheHitRate = (this.metrics.cacheHits / this.metrics.cacheTotal) * 100;
    }
    
    monitorNetworkStatus() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.metrics.connectionType = connection.effectiveType || 'unknown';
            this.metrics.downlink = connection.downlink;
            
            connection.addEventListener('change', () => {
                this.metrics.connectionType = connection.effectiveType || 'unknown';
                this.metrics.downlink = connection.downlink;
                
                console.log('[Performance] Connection changed:', {
                    type: this.metrics.connectionType,
                    downlink: this.metrics.downlink
                });
                
                // Ajusta estratégias baseado na conexão
                this.adaptToConnection();
            });
        }
    }
    
    adaptToConnection() {
        const connection = this.metrics.connectionType;
        
        if (connection === 'slow-2g' || connection === '2g') {
            // Conexão lenta - reduz qualidade
            console.log('[Performance] Conexão lenta detectada - otimizando...');
            this.enableLowBandwidthMode();
        } else if (connection === '4g') {
            // Conexão rápida - qualidade máxima
            console.log('[Performance] Conexão rápida detectada - qualidade máxima');
            this.enableHighQualityMode();
        }
    }
    
    enableLowBandwidthMode() {
        // Implementa otimizações para conexão lenta
        document.body.classList.add('low-bandwidth');
        
        // Reduz qualidade de texturas, desabilita efeitos, etc.
        window.dispatchEvent(new CustomEvent('bandwidth-mode-change', {
            detail: { mode: 'low' }
        }));
    }
    
    enableHighQualityMode() {
        document.body.classList.remove('low-bandwidth');
        
        window.dispatchEvent(new CustomEvent('bandwidth-mode-change', {
            detail: { mode: 'high' }
        }));
    }
    
    async monitorBattery() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                this.metrics.batteryLevel = Math.round(battery.level * 100);
                this.metrics.batteryCharging = battery.charging;
                
                battery.addEventListener('levelchange', () => {
                    this.metrics.batteryLevel = Math.round(battery.level * 100);
                    this.adaptToBatteryLevel();
                });
                
                battery.addEventListener('chargingchange', () => {
                    this.metrics.batteryCharging = battery.charging;
                });
                
                this.adaptToBatteryLevel();
            } catch (error) {
                console.warn('[Performance] Battery API não suportada:', error);
            }
        }
    }
    
    adaptToBatteryLevel() {
        const level = this.metrics.batteryLevel;
        
        if (level !== null && level < 20 && !this.metrics.batteryCharging) {
            console.log('[Performance] Bateria baixa - ativando modo economia');
            this.enablePowerSaveMode();
        } else if (level > 50 || this.metrics.batteryCharging) {
            this.disablePowerSaveMode();
        }
    }
    
    enablePowerSaveMode() {
        document.body.classList.add('power-save');
        
        // Reduz FPS, desabilita animações desnecessárias
        window.dispatchEvent(new CustomEvent('power-mode-change', {
            detail: { mode: 'save' }
        }));
    }
    
    disablePowerSaveMode() {
        document.body.classList.remove('power-save');
        
        window.dispatchEvent(new CustomEvent('power-mode-change', {
            detail: { mode: 'normal' }
        }));
    }
    
    startFPSMonitoring() {
        const measureFPS = () => {
            const now = performance.now();
            this.frameCount++;
            
            if (now - this.lastFrameTime >= 1000) {
                this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
                this.frameCount = 0;
                this.lastFrameTime = now;
                
                // Detecta problemas de performance
                if (this.metrics.fps < 30) {
                    this.handleLowFPS();
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    handleLowFPS() {
        console.warn(`[Performance] FPS baixo detectado: ${this.metrics.fps}`);
        
        // Ativa otimizações automáticas
        window.dispatchEvent(new CustomEvent('low-fps-detected', {
            detail: { fps: this.metrics.fps }
        }));
    }
    
    monitorMemoryUsage() {
        if ('memory' in performance) {
            const updateMemory = () => {
                const memory = performance.memory;
                this.metrics.memoryUsage = {
                    used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
                };
                
                // Detecta vazamentos de memória
                const usagePercent = (this.metrics.memoryUsage.used / this.metrics.memoryUsage.limit) * 100;
                if (usagePercent > 80) {
                    this.handleHighMemoryUsage();
                }
            };
            
            updateMemory();
            setInterval(updateMemory, 5000); // A cada 5 segundos
        }
    }
    
    handleHighMemoryUsage() {
        console.warn('[Performance] Uso alto de memória detectado');
        
        // Força garbage collection se disponível
        if (window.gc) {
            window.gc();
        }
        
        // Limpa caches desnecessários
        if (window.cacheManager) {
            cacheManager.cleanupOldCaches();
        }
        
        window.dispatchEvent(new CustomEvent('high-memory-usage', {
            detail: { usage: this.metrics.memoryUsage }
        }));
    }
    
    // Marca início de uma operação
    startOperation(name) {
        const startTime = performance.now();
        return {
            name,
            startTime,
            end: () => {
                const duration = performance.now() - startTime;
                this.recordOperation(name, duration);
                return duration;
            }
        };
    }
    
    recordOperation(name, duration) {
        if (!this.metrics.operations) {
            this.metrics.operations = {};
        }
        
        if (!this.metrics.operations[name]) {
            this.metrics.operations[name] = {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                minTime: Infinity,
                maxTime: 0
            };
        }
        
        const op = this.metrics.operations[name];
        op.count++;
        op.totalTime += duration;
        op.avgTime = op.totalTime / op.count;
        op.minTime = Math.min(op.minTime, duration);
        op.maxTime = Math.max(op.maxTime, duration);
        
        console.log(`[Performance] ${name}: ${Math.round(duration)}ms`);
    }
    
    // Reporta métricas consolidadas
    reportMetrics() {
        const report = {
            timestamp: Date.now(),
            uptime: performance.now() - this.startTime,
            ...this.metrics
        };
        
        console.log('[Performance] Relatório de métricas:', report);
        
        // Envia para analytics se configurado
        if (window.analytics) {
            window.analytics.track('performance_metrics', report);
        }
        
        return report;
    }
    
    // Obtém métricas específicas
    getMetric(name) {
        return this.metrics[name];
    }
    
    // Obtém todas as métricas
    getAllMetrics() {
        return { ...this.metrics };
    }
    
    // Reseta métricas
    resetMetrics() {
        this.metrics = {
            loadTime: 0,
            cacheHitRate: 0,
            memoryUsage: 0,
            networkRequests: 0,
            errors: 0,
            fps: 0,
            batteryLevel: null,
            connectionType: 'unknown'
        };
        
        this.frameCount = 0;
        this.startTime = performance.now();
    }
    
    // Utilitários
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Cria widget de monitoramento visual
    createMonitorWidget() {
        const widget = document.createElement('div');
        widget.id = 'performance-monitor-widget';
        widget.className = 'performance-widget hidden';
        widget.innerHTML = `
            <div class="widget-header">
                <span>Performance</span>
                <button class="widget-toggle">&times;</button>
            </div>
            <div class="widget-content">
                <div class="metric">
                    <span class="metric-label">FPS:</span>
                    <span class="metric-value" id="fps-value">--</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Memória:</span>
                    <span class="metric-value" id="memory-value">--</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Cache:</span>
                    <span class="metric-value" id="cache-value">--</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Rede:</span>
                    <span class="metric-value" id="network-value">--</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Bateria:</span>
                    <span class="metric-value" id="battery-value">--</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
        
        // Atualiza widget periodicamente
        setInterval(() => this.updateWidget(widget), 1000);
        
        // Toggle visibility
        widget.querySelector('.widget-toggle').onclick = () => {
            widget.classList.toggle('hidden');
        };
        
        return widget;
    }
    
    updateWidget(widget) {
        const fpsEl = widget.querySelector('#fps-value');
        const memoryEl = widget.querySelector('#memory-value');
        const cacheEl = widget.querySelector('#cache-value');
        const networkEl = widget.querySelector('#network-value');
        const batteryEl = widget.querySelector('#battery-value');
        
        if (fpsEl) fpsEl.textContent = this.metrics.fps || '--';
        
        if (memoryEl && this.metrics.memoryUsage) {
            memoryEl.textContent = `${this.metrics.memoryUsage.used}MB`;
        }
        
        if (cacheEl) {
            cacheEl.textContent = `${Math.round(this.metrics.cacheHitRate || 0)}%`;
        }
        
        if (networkEl) {
            networkEl.textContent = this.metrics.connectionType;
        }
        
        if (batteryEl) {
            const level = this.metrics.batteryLevel;
            batteryEl.textContent = level !== null ? `${level}%` : '--';
        }
    }
    
    // Cleanup
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        
        const widget = document.getElementById('performance-monitor-widget');
        if (widget) {
            widget.remove();
        }
    }
}

// Estilos para o widget de monitoramento
const monitorStyles = `
<style>
.performance-widget {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid #92F428;
    border-radius: 8px;
    padding: 10px;
    font-size: 0.8rem;
    color: #92F428;
    z-index: 10002;
    min-width: 150px;
    transition: opacity 0.3s ease;
}

.performance-widget.hidden {
    opacity: 0;
    pointer-events: none;
}

.widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 5px;
    border-bottom: 1px solid #92F428;
}

.widget-toggle {
    background: none;
    border: none;
    color: #92F428;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
}

.metric {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
}

.metric-label {
    color: #cccccc;
}

.metric-value {
    color: #92F428;
    font-weight: bold;
}

/* Otimizações para modo de economia */
.power-save .performance-widget {
    opacity: 0.7;
}

.low-bandwidth .performance-widget .metric-value {
    color: #FFA500;
}

@media (max-width: 768px) {
    .performance-widget {
        font-size: 0.7rem;
        min-width: 120px;
    }
}
</style>
`;

// Injeta estilos
document.head.insertAdjacentHTML('beforeend', monitorStyles);

// Inicializa o monitor de performance
const performanceMonitor = new PerformanceMonitor();

// Exporta para uso global
window.performanceMonitor = performanceMonitor;

// Cria widget de debug em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    performanceMonitor.createMonitorWidget();
}