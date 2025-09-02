/**
 * Sistema Multiplayer - Ghostbusters AR
 * Gerencia jogadores online, cooperação e chat local
 */

class MultiplayerManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.currentPlayer = null;
        this.nearbyPlayers = new Map();
        this.chatMessages = [];
        this.isOnline = false;
        this.locationName = null;
        this.positionUpdateInterval = null;
        this.playersUpdateInterval = null;
        
        // Configurações
        this.config = {
            PROXIMITY_RADIUS: 50, // metros
            POSITION_UPDATE_INTERVAL: 5000, // 5 segundos
            PLAYERS_UPDATE_INTERVAL: 3000, // 3 segundos
            MAX_CHAT_MESSAGES: 50,
            COOPERATIVE_CAPTURE_RADIUS: 10 // metros para captura cooperativa
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createMultiplayerUI();
        console.log('🌐 Sistema Multiplayer inicializado');
    }
    
    setupEventListeners() {
        // Escutar mudanças de autenticação
        if (this.gameManager.auth) {
            this.gameManager.auth.onAuthStateChanged((user) => {
                if (user) {
                    this.joinMultiplayer(user);
                } else {
                    this.leaveMultiplayer();
                }
            });
        }
        
        // Escutar notificações do Firebase
        if (this.gameManager.database) {
                        const notificationsRef = ref(this.gameManager.database, 'notifications');
            notificationsRef.on('child_added', (snapshot) => {
                this.handleNotification(snapshot.val());
            });
        }
    }
    
    createMultiplayerUI() {
        // Container principal do multiplayer
        const multiplayerContainer = document.createElement('div');
        multiplayerContainer.id = 'multiplayer-container';
        multiplayerContainer.className = 'multiplayer-container hidden';
        
        multiplayerContainer.innerHTML = `
            <!-- Lista de Jogadores Próximos -->
            <div id="nearby-players" class="nearby-players">
                <div class="players-header">
                    <span class="players-icon">👥</span>
                    <span class="players-count">0</span>
                    <span class="players-label">jogadores próximos</span>
                </div>
                <div id="players-list" class="players-list"></div>
            </div>
            
            <!-- Chat Local -->
            <div id="local-chat" class="local-chat">
                <div class="chat-header">
                    <span class="chat-icon">💬</span>
                    <span class="chat-title">Chat Local</span>
                    <button id="toggle-chat" class="toggle-chat">−</button>
                </div>
                <div id="chat-messages" class="chat-messages"></div>
                <div class="chat-input-container">
                    <input type="text" id="chat-input" placeholder="Digite sua mensagem..." maxlength="100">
                    <button id="send-message" class="send-message">📤</button>
                </div>
            </div>
            
            <!-- Indicador de Captura Cooperativa -->
            <div id="cooperative-capture" class="cooperative-capture hidden">
                <div class="coop-header">
                    <span class="coop-icon">🤝</span>
                    <span class="coop-title">Captura Cooperativa</span>
                </div>
                <div id="coop-players" class="coop-players"></div>
                <div id="coop-progress" class="coop-progress">
                    <div class="coop-progress-bar">
                        <div id="coop-progress-fill" class="coop-progress-fill"></div>
                    </div>
                    <span id="coop-progress-text">Aguardando jogadores...</span>
                </div>
            </div>
        `;
        
        // Adicionar ao game UI
        const gameUI = document.getElementById('game-ui');
        if (gameUI) {
            gameUI.appendChild(multiplayerContainer);
        }
        
        this.setupMultiplayerEventListeners();
    }
    
    setupMultiplayerEventListeners() {
        // Toggle do chat
        const toggleChat = document.getElementById('toggle-chat');
        const chatMessages = document.getElementById('chat-messages');
        
        toggleChat?.addEventListener('click', () => {
            const isCollapsed = chatMessages.style.display === 'none';
            chatMessages.style.display = isCollapsed ? 'block' : 'none';
            toggleChat.textContent = isCollapsed ? '−' : '+';
        });
        
        // Enviar mensagem
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');
        
        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (message && this.isOnline) {
                this.sendChatMessage(message);
                chatInput.value = '';
            }
        };
        
        sendButton?.addEventListener('click', sendMessage);
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    async joinMultiplayer(user) {
        try {
            this.currentPlayer = {
                id: user.uid,
                displayName: user.displayName || user.email?.split('@')[0] || 'Caça-Fantasma',
                avatar: this.generateAvatar(user.uid),
                position: null,
                lastSeen: Date.now(),
                isCapturing: false
            };
            
            this.isOnline = true;
            
            // Registrar jogador no Firebase
                        const playersRef = ref(this.gameManager.database, `players/${user.uid}`);
            await playersRef.set(this.currentPlayer);
            
            // Configurar listeners
            this.setupRealtimeListeners();
            
            // Iniciar atualizações de posição
            this.startPositionUpdates();
            
            // Mostrar UI multiplayer
            document.getElementById('multiplayer-container')?.classList.remove('hidden');
            
            console.log('🌐 Jogador conectado ao multiplayer:', this.currentPlayer.displayName);
            
            if (window.notificationSystem) {
                window.notificationSystem.info(`Conectado ao multiplayer como ${this.currentPlayer.displayName}`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao conectar ao multiplayer:', error);
        }
    }
    
    leaveMultiplayer() {
        this.isOnline = false;
        
        // Parar atualizações
        if (this.positionUpdateInterval) {
            clearInterval(this.positionUpdateInterval);
        }
        if (this.playersUpdateInterval) {
            clearInterval(this.playersUpdateInterval);
        }
        
        // Remover jogador do Firebase
        if (this.currentPlayer) {
                    const playersRef = ref(this.gameManager.database, `players/${this.currentPlayer.id}`);
            playersRef.remove();
        }
        
        // Limpar dados locais
        this.currentPlayer = null;
        this.nearbyPlayers.clear();
        this.chatMessages = [];
        
        // Esconder UI multiplayer
        document.getElementById('multiplayer-container')?.classList.add('hidden');
        
        console.log('🌐 Desconectado do multiplayer');
    }
    
    setupRealtimeListeners() {
        if (!this.gameManager.database) return;
        
        // Escutar outros jogadores na mesma localização
                const playersRef = ref(this.gameManager.database, 'players');
        playersRef.on('value', (snapshot) => {
            this.updateNearbyPlayers(snapshot.val() || {});
        });
        
        // Escutar mensagens de chat
        if (this.locationName) {
            const chatRef = ref(this.gameManager.database, `chat/${this.locationName}`);
            chatRef.on('child_added', (snapshot) => {
                this.handleChatMessage(snapshot.val());
            });
        }
        
        // Escutar fantasmas sendo capturados
                const ghostsRef = ref(this.gameManager.database, 'ghosts');
        ghostsRef.on('child_changed', (snapshot) => {
            this.handleGhostUpdate(snapshot.val());
        });
    }
    
    startPositionUpdates() {
        if (this.positionUpdateInterval) {
            clearInterval(this.positionUpdateInterval);
        }
        
        this.positionUpdateInterval = setInterval(() => {
            if (this.isOnline && this.currentPlayer && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.updatePlayerPosition(position.coords);
                    },
                    (error) => {
                        console.warn('⚠️ Erro ao obter posição para multiplayer:', error);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            }
        }, this.config.POSITION_UPDATE_INTERVAL);
    }
    
    async updatePlayerPosition(coords) {
        if (!this.isOnline || !this.currentPlayer) return;
        
        const position = {
            lat: coords.latitude,
            lon: coords.longitude,
            accuracy: coords.accuracy,
            timestamp: Date.now()
        };
        
        this.currentPlayer.position = position;
        
        // Atualizar no Firebase
                const playerRef = ref(this.gameManager.database, `players/${this.currentPlayer.id}`);
        await playerRef.update({
            position,
            lastSeen: Date.now()
        });
    }
    
    updateNearbyPlayers(allPlayers) {
        if (!this.currentPlayer?.position) return;
        
        const nearby = new Map();
        const myPos = this.currentPlayer.position;
        
        Object.entries(allPlayers).forEach(([playerId, player]) => {
            if (playerId === this.currentPlayer.id) return;
            if (!player.position) return;
            
            const distance = this.calculateDistance(
                myPos.lat, myPos.lon,
                player.position.lat, player.position.lon
            );
            
            if (distance <= this.config.PROXIMITY_RADIUS) {
                nearby.set(playerId, {
                    ...player,
                    distance: Math.round(distance)
                });
            }
        });
        
        this.nearbyPlayers = nearby;
        this.updatePlayersUI();
        this.updateMapAvatars();
    }
    
    updatePlayersUI() {
        const playersList = document.getElementById('players-list');
        const playersCount = document.querySelector('.players-count');
        
        if (!playersList || !playersCount) return;
        
        playersCount.textContent = this.nearbyPlayers.size;
        
        playersList.innerHTML = '';
        
        this.nearbyPlayers.forEach((player, playerId) => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-item';
            playerElement.innerHTML = `
                <div class="player-avatar">${player.avatar}</div>
                <div class="player-info">
                    <div class="player-name">${player.displayName}</div>
                    <div class="player-distance">${player.distance}m</div>
                </div>
                <div class="player-status ${player.isCapturing ? 'capturing' : 'idle'}">
                    ${player.isCapturing ? '⚡' : '👻'}
                </div>
            `;
            
            playersList.appendChild(playerElement);
        });
    }
    
    updateMapAvatars() {
        if (!this.gameManager.map) return;
        
        // Remover marcadores antigos de jogadores
        this.gameManager.map.eachLayer((layer) => {
            if (layer.options && layer.options.isPlayerMarker) {
                this.gameManager.map.removeLayer(layer);
            }
        });
        
        // Adicionar marcadores dos jogadores próximos
        this.nearbyPlayers.forEach((player, playerId) => {
            const playerIcon = L.divIcon({
                className: 'player-avatar-marker',
                html: `
                    <div class="avatar-container ${player.isCapturing ? 'capturing' : ''}">
                        <div class="avatar-emoji">${player.avatar}</div>
                        <div class="avatar-name">${player.displayName}</div>
                    </div>
                `,
                iconSize: [40, 50],
                iconAnchor: [20, 45]
            });
            
            const marker = L.marker([player.position.lat, player.position.lon], {
                icon: playerIcon,
                isPlayerMarker: true
            }).addTo(this.gameManager.map);
            
            // Tooltip com informações do jogador
            marker.bindTooltip(`
                <strong>${player.displayName}</strong><br>
                Distância: ${player.distance}m<br>
                Status: ${player.isCapturing ? 'Capturando' : 'Explorando'}
            `);
        });
    }
    
    async sendChatMessage(message) {
        if (!this.isOnline || !this.currentPlayer || !this.locationName) return;
        
        const chatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            playerId: this.currentPlayer.id,
            playerName: this.currentPlayer.displayName,
            avatar: this.currentPlayer.avatar,
            message: message,
            timestamp: Date.now()
        };
        
        // Enviar para Firebase
                const chatRef = ref(this.gameManager.database, `chat/${this.locationName}`);
        await chatRef.push(chatMessage);
    }
    
    handleChatMessage(message) {
        this.chatMessages.push(message);
        
        // Limitar histórico local
        if (this.chatMessages.length > this.config.MAX_CHAT_MESSAGES) {
            this.chatMessages = this.chatMessages.slice(-this.config.MAX_CHAT_MESSAGES);
        }
        
        this.updateChatUI();
        
        // Notificação para mensagens de outros jogadores
        if (message.playerId !== this.currentPlayer?.id) {
            if (window.notificationSystem) {
                window.notificationSystem.info(
                    `${message.playerName}: ${message.message}`,
                    { duration: 3000 }
                );
            }
        }
    }
    
    updateChatUI() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        
        this.chatMessages.slice(-20).forEach((message) => {
            const messageElement = document.createElement('div');
            messageElement.className = `chat-message ${message.playerId === this.currentPlayer?.id ? 'own-message' : 'other-message'}`;
            
            const timeStr = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="message-avatar">${message.avatar}</span>
                    <span class="message-name">${message.playerName}</span>
                    <span class="message-time">${timeStr}</span>
                </div>
                <div class="message-content">${this.escapeHtml(message.message)}</div>
            `;
            
            chatMessages.appendChild(messageElement);
        });
        
        // Scroll para a última mensagem
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Iniciar captura cooperativa
    async startCooperativeCapture(ghostId, ghostData) {
        if (!this.isOnline || !this.currentPlayer) return false;
        
        // Verificar se há jogadores próximos suficientes
        const nearbyCount = this.nearbyPlayers.size;
        if (ghostData.type === 'Fantasma Forte' && nearbyCount === 0) {
            if (window.notificationSystem) {
                window.notificationSystem.warning(
                    'Fantasma Forte detectado! Você precisa de outro jogador próximo para capturá-lo.',
                    { duration: 5000 }
                );
            }
            return false;
        }
        
        // Registrar tentativa de captura
                const captureRef = ref(this.gameManager.database, `ghosts/${ghostId}/captureAttempts/${this.currentPlayer.id}`);
        await captureRef.set({
            playerId: this.currentPlayer.id,
            playerName: this.currentPlayer.displayName,
            position: this.currentPlayer.position,
            startedAt: Date.now()
        });
        
        // Atualizar status local
        this.currentPlayer.isCapturing = true;
                await update(ref(this.gameManager.database, `players/${this.currentPlayer.id}`), {
            isCapturing: true
        });
        
        // Mostrar UI de captura cooperativa
        this.showCooperativeCaptureUI(ghostId, ghostData);
        
        return true;
    }
    
    showCooperativeCaptureUI(ghostId, ghostData) {
        const coopCapture = document.getElementById('cooperative-capture');
        if (!coopCapture) return;
        
        coopCapture.classList.remove('hidden');
        
        // Escutar atualizações da captura
                const ghostRef = ref(this.gameManager.database, `ghosts/${ghostId}`);
        const captureListener = ghostRef.on('value', (snapshot) => {
            const ghost = snapshot.val();
            if (!ghost) {
                this.hideCooperativeCaptureUI();
                return;
            }
            
            this.updateCooperativeCaptureUI(ghost);
            
            // Verificar se a captura foi concluída
            if (ghost.capturedBy) {
                this.hideCooperativeCaptureUI();
                ghostRef.off('value', captureListener);
            }
        });
    }
    
    updateCooperativeCaptureUI(ghost) {
        const coopPlayers = document.getElementById('coop-players');
        const coopProgressText = document.getElementById('coop-progress-text');
        const coopProgressFill = document.getElementById('coop-progress-fill');
        
        if (!coopPlayers || !coopProgressText || !coopProgressFill) return;
        
        const playersCapturing = ghost.playersCapturing || {};
        const playerCount = Object.keys(playersCapturing).length;
        const requiredPlayers = ghost.type === 'Fantasma Forte' ? 2 : 1;
        
        // Atualizar lista de jogadores
        coopPlayers.innerHTML = '';
        Object.values(playersCapturing).forEach((player) => {
            const playerElement = document.createElement('div');
            playerElement.className = 'coop-player';
            playerElement.innerHTML = `
                <span class="coop-player-avatar">${this.generateAvatar(player.playerId)}</span>
                <span class="coop-player-name">${player.playerName || 'Jogador'}</span>
            `;
            coopPlayers.appendChild(playerElement);
        });
        
        // Atualizar progresso
        if (playerCount >= requiredPlayers && ghost.isBeingCaptured) {
            const elapsed = Date.now() - ghost.captureStartedAt;
            const progress = Math.min((elapsed / ghost.captureDuration) * 100, 100);
            
            coopProgressFill.style.width = `${progress}%`;
            coopProgressText.textContent = `Capturando... ${Math.round(progress)}%`;
            
            if (progress >= 100) {
                // Finalizar captura
                                const ghostRef = ref(this.gameManager.database, `ghosts/${ghost.id}/captureComplete`);
                ghostRef.set({ timestamp: Date.now() });
            }
        } else {
            coopProgressFill.style.width = '0%';
            coopProgressText.textContent = `${playerCount}/${requiredPlayers} jogadores`;
        }
    }
    
    hideCooperativeCaptureUI() {
        const coopCapture = document.getElementById('cooperative-capture');
        if (coopCapture) {
            coopCapture.classList.add('hidden');
        }
        
        // Resetar status de captura
        if (this.currentPlayer) {
            this.currentPlayer.isCapturing = false;
                        update(ref(this.gameManager.database, `players/${this.currentPlayer.id}`), {
                isCapturing: false
            });
        }
    }
    
    handleNotification(notification) {
        switch (notification.type) {
            case 'cooperative_capture_started':
                if (notification.players.includes(this.currentPlayer?.id)) {
                    if (window.notificationSystem) {
                        window.notificationSystem.info('Captura cooperativa iniciada!');
                    }
                }
                break;
                
            case 'cooperative_capture_success':
                if (notification.players.includes(this.currentPlayer?.id)) {
                    if (window.notificationSystem) {
                        window.notificationSystem.success(
                            `Fantasma capturado em equipe! +${notification.pointsEarned} pontos`
                        );
                    }
                }
                break;
        }
    }
    
    handleGhostUpdate(ghost) {
        // Atualizar UI se o jogador está participando da captura
        if (ghost.playersCapturing && ghost.playersCapturing[this.currentPlayer?.id]) {
            this.updateCooperativeCaptureUI(ghost);
        }
    }
    
    // Utilitários
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Raio da Terra em metros
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
    
    generateAvatar(playerId) {
        const avatars = ['👻', '🎃', '🧙‍♂️', '🧙‍♀️', '🕵️‍♂️', '🕵️‍♀️', '👨‍🔬', '👩‍🔬', '🦸‍♂️', '🦸‍♀️'];
        const hash = this.hashCode(playerId);
        return avatars[Math.abs(hash) % avatars.length];
    }
    
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Métodos públicos para integração com o game manager
    setLocation(locationName) {
        this.locationName = locationName;
        
        // Reconfigurar listeners de chat para nova localização
        if (this.isOnline && this.gameManager.database) {
                        const chatRef = ref(this.gameManager.database, `chat/${locationName}`);
            chatRef.on('child_added', (snapshot) => {
                this.handleChatMessage(snapshot.val());
            });
        }
    }
    
    isPlayerNearby(playerId) {
        return this.nearbyPlayers.has(playerId);
    }
    
    getNearbyPlayersCount() {
        return this.nearbyPlayers.size;
    }
    
    canStartCooperativeCapture(ghostType) {
        if (ghostType === 'Fantasma Forte') {
            return this.nearbyPlayers.size >= 1; // Precisa de pelo menos 1 outro jogador
        }
        return true;
    }
}

// Exportar para uso global
window.MultiplayerManager = MultiplayerManager;