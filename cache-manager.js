// Gerenciador de Cache Inteligente
class CacheManager {
    constructor() {
        this.cacheName = 'ghostbusters-ar-cache-v1.0.0';
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB
        this.cacheStats = {
            hits: 0,
            misses: 0,
            size: 0,
            lastCleanup: Date.now()
        };
        
        this.init();
    }
    
    async init() {
        if ('caches' in window) {
            await this.cleanupOldCaches();
            await this.updateCacheStats();
        }
    }
    
    // Cache com estratégias diferentes por tipo de recurso
    async cacheResource(url, strategy = 'cache-first') {
        if (!('caches' in window)) {
            return this.fetchResource(url);
        }
        
        const cache = await caches.open(this.cacheName);
        
        switch (strategy) {
            case 'cache-first':
                return this.cacheFirstStrategy(cache, url);
            case 'network-first':
                return this.networkFirstStrategy(cache, url);
            case 'stale-while-revalidate':
                return this.staleWhileRevalidateStrategy(cache, url);
            default:
                return this.cacheFirstStrategy(cache, url);
        }
    }
    
    async cacheFirstStrategy(cache, url) {
        try {
            // Tenta buscar do cache primeiro
            const cachedResponse = await cache.match(url);
            if (cachedResponse) {
                this.cacheStats.hits++;
                return cachedResponse;
            }
            
            // Se não está no cache, busca da rede
            const networkResponse = await this.fetchResource(url);
            
            // Cacheia a resposta se for bem-sucedida
            if (networkResponse.ok) {
                await this.putInCache(cache, url, networkResponse.clone());
            }
            
            this.cacheStats.misses++;
            return networkResponse;
            
        } catch (error) {
            console.error(`[Cache] Erro na estratégia cache-first para ${url}:`, error);
            throw error;
        }
    }
    
    async networkFirstStrategy(cache, url) {
        try {
            // Tenta buscar da rede primeiro
            const networkResponse = await this.fetchResource(url);
            
            if (networkResponse.ok) {
                await this.putInCache(cache, url, networkResponse.clone());
                return networkResponse;
            }
            
            // Se a rede falhar, tenta o cache
            const cachedResponse = await cache.match(url);
            if (cachedResponse) {
                this.cacheStats.hits++;
                return cachedResponse;
            }
            
            this.cacheStats.misses++;
            throw new Error(`Recurso não disponível: ${url}`);
            
        } catch (networkError) {
            // Se a rede falhar, tenta o cache
            const cachedResponse = await cache.match(url);
            if (cachedResponse) {
                this.cacheStats.hits++;
                return cachedResponse;
            }
            
            this.cacheStats.misses++;
            throw networkError;
        }
    }
    
    async staleWhileRevalidateStrategy(cache, url) {
        try {
            // Busca do cache imediatamente
            const cachedResponse = await cache.match(url);
            
            // Inicia busca da rede em paralelo
            const networkPromise = this.fetchResource(url).then(async (networkResponse) => {
                if (networkResponse.ok) {
                    await this.putInCache(cache, url, networkResponse.clone());
                }
                return networkResponse;
            }).catch(error => {
                console.warn(`[Cache] Erro na revalidação de ${url}:`, error);
                return null;
            });
            
            if (cachedResponse) {
                this.cacheStats.hits++;
                // Retorna o cache imediatamente, mas atualiza em background
                networkPromise.then(() => {
                    console.log(`[Cache] Recurso revalidado: ${url}`);
                });
                return cachedResponse;
            }
            
            // Se não há cache, aguarda a rede
            const networkResponse = await networkPromise;
            if (networkResponse && networkResponse.ok) {
                this.cacheStats.misses++;
                return networkResponse;
            }
            
            throw new Error(`Recurso não disponível: ${url}`);
            
        } catch (error) {
            console.error(`[Cache] Erro na estratégia stale-while-revalidate para ${url}:`, error);
            throw error;
        }
    }
    
    async fetchResource(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                cache: 'no-cache'
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    async putInCache(cache, url, response) {
        try {
            // Verifica se o cache não está muito grande
            await this.ensureCacheSize();
            
            await cache.put(url, response);
            await this.updateCacheStats();
            
        } catch (error) {
            console.error(`[Cache] Erro ao cachear ${url}:`, error);
        }
    }
    
    async ensureCacheSize() {
        const cache = await caches.open(this.cacheName);
        const keys = await cache.keys();
        
        if (keys.length === 0) return;
        
        // Estima o tamanho do cache
        let estimatedSize = 0;
        const sampleSize = Math.min(5, keys.length);
        
        for (let i = 0; i < sampleSize; i++) {
            try {
                const response = await cache.match(keys[i]);
                if (response) {
                    const blob = await response.blob();
                    estimatedSize += blob.size;
                }
            } catch (error) {
                console.warn('[Cache] Erro ao estimar tamanho:', error);
            }
        }
        
        const averageSize = estimatedSize / sampleSize;
        const totalEstimatedSize = averageSize * keys.length;
        
        // Se o cache está muito grande, remove itens mais antigos
        if (totalEstimatedSize > this.maxCacheSize) {
            const itemsToRemove = Math.ceil(keys.length * 0.2); // Remove 20%
            
            for (let i = 0; i < itemsToRemove; i++) {
                await cache.delete(keys[i]);
            }
            
            console.log(`[Cache] Removidos ${itemsToRemove} itens para liberar espaço`);
        }
    }
    
    async updateCacheStats() {
        try {
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            this.cacheStats.size = keys.length;
        } catch (error) {
            console.warn('[Cache] Erro ao atualizar estatísticas:', error);
        }
    }
    
    async cleanupOldCaches() {
        try {
            const cacheNames = await caches.keys();
            const oldCaches = cacheNames.filter(name => 
                name.startsWith('ghostbusters-ar-') && name !== this.cacheName
            );
            
            await Promise.all(oldCaches.map(name => caches.delete(name)));
            
            if (oldCaches.length > 0) {
                console.log(`[Cache] Removidos ${oldCaches.length} caches antigos`);
            }
        } catch (error) {
            console.error('[Cache] Erro na limpeza de caches antigos:', error);
        }
    }
    
    // Pré-carrega recursos importantes
    async preloadResources(urls, onProgress) {
        const total = urls.length;
        let loaded = 0;
        
        const results = await Promise.allSettled(
            urls.map(async (url) => {
                try {
                    const strategy = this.getStrategyForUrl(url);
                    await this.cacheResource(url, strategy);
                    loaded++;
                    
                    if (onProgress) {
                        onProgress(loaded, total, url);
                    }
                    
                    return { url, success: true };
                } catch (error) {
                    loaded++;
                    console.warn(`[Cache] Falha ao pré-carregar ${url}:`, error);
                    
                    if (onProgress) {
                        onProgress(loaded, total, url, error);
                    }
                    
                    return { url, success: false, error };
                }
            })
        );
        
        const successful = results.filter(r => r.value?.success).length;
        const failed = results.length - successful;
        
        console.log(`[Cache] Pré-carregamento concluído: ${successful} sucessos, ${failed} falhas`);
        
        return {
            total: results.length,
            successful,
            failed,
            results: results.map(r => r.value)
        };
    }
    
    getStrategyForUrl(url) {
        // Estratégias baseadas no tipo de recurso
        if (url.includes('aframe.io') || url.includes('unpkg.com')) {
            return 'cache-first'; // Bibliotecas CDN
        }
        
        if (url.endsWith('.glb') || url.endsWith('.mp3') || url.endsWith('.png')) {
            return 'cache-first'; // Assets estáticos
        }
        
        if (url.includes('/api/') || url.includes('firebase')) {
            return 'network-first'; // APIs
        }
        
        return 'stale-while-revalidate'; // Padrão
    }
    
    // Obtém estatísticas do cache
    getStats() {
        return {
            ...this.cacheStats,
            hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0,
            supported: 'caches' in window
        };
    }
    
    // Limpa todo o cache
    async clearCache() {
        try {
            await caches.delete(this.cacheName);
            this.cacheStats = {
                hits: 0,
                misses: 0,
                size: 0,
                lastCleanup: Date.now()
            };
            console.log('[Cache] Cache limpo com sucesso');
            return true;
        } catch (error) {
            console.error('[Cache] Erro ao limpar cache:', error);
            return false;
        }
    }
    
    // Verifica se um recurso está no cache
    async isResourceCached(url) {
        try {
            const cache = await caches.open(this.cacheName);
            const response = await cache.match(url);
            return !!response;
        } catch (error) {
            return false;
        }
    }
    
    // Lista todos os recursos em cache
    async listCachedResources() {
        try {
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            return keys.map(request => request.url);
        } catch (error) {
            console.error('[Cache] Erro ao listar recursos:', error);
            return [];
        }
    }
}

// Inicializa o gerenciador de cache
const cacheManager = new CacheManager();

// Exporta para uso global
window.cacheManager = cacheManager;