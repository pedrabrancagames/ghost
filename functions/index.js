const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Configurações do jogo
const GAME_CONFIG = {
    GHOST_SPAWN_RADIUS: 0.001, // ~100m
    MAX_GHOSTS_PER_LOCATION: 5,
    GHOST_LIFETIME_HOURS: 24,
    STRONG_GHOST_PROBABILITY: 0.25,
    LOCATIONS: {
        "Praça Central": { lat: -27.630913, lon: -48.679793 },
        "Parque da Cidade": { lat: -27.639797, lon: -48.667749 },
        "Casa do Vô": { lat: -27.51563471648395, lon: -48.64996016391755 }
    }
};

// Função agendada para gerar fantasmas automaticamente (DESABILITADA - requer billing)
/*
exports.generateGhosts = functions.pubsub.schedule('every 2 hours').onRun(async (context) => {
    console.log('Iniciando geração automática de fantasmas...');

    const db = admin.database();
    const ghostsRef = db.ref('ghosts');

    try {
        // Limpar fantasmas expirados
        await cleanupExpiredGhosts(ghostsRef);

        // Gerar novos fantasmas para cada localização
        for (const [locationName, coords] of Object.entries(GAME_CONFIG.LOCATIONS)) {
            await generateGhostsForLocation(ghostsRef, locationName, coords);
        }

        console.log('Geração de fantasmas concluída com sucesso');
        return null;
    } catch (error) {
        console.error('Erro na geração de fantasmas:', error);
        throw error;
    }
});
*/

// Limpar fantasmas expirados
async function cleanupExpiredGhosts(ghostsRef) {
    const snapshot = await ghostsRef.once('value');
    const ghosts = snapshot.val() || {};

    const now = Date.now();
    const expiredGhosts = [];

    Object.entries(ghosts).forEach(([ghostId, ghost]) => {
        const ghostAge = now - ghost.createdAt;
        const maxAge = GAME_CONFIG.GHOST_LIFETIME_HOURS * 60 * 60 * 1000;

        if (ghostAge > maxAge) {
            expiredGhosts.push(ghostId);
        }
    });

    // Remover fantasmas expirados
    for (const ghostId of expiredGhosts) {
        await ghostsRef.child(ghostId).remove();
    }

    console.log(`Removidos ${expiredGhosts.length} fantasmas expirados`);
}

// Gerar fantasmas para uma localização específica
async function generateGhostsForLocation(ghostsRef, locationName, coords) {
    // Contar fantasmas existentes nesta localização
    const snapshot = await ghostsRef.orderByChild('location').equalTo(locationName).once('value');
    const existingGhosts = snapshot.val() || {};
    const ghostCount = Object.keys(existingGhosts).length;

    if (ghostCount >= GAME_CONFIG.MAX_GHOSTS_PER_LOCATION) {
        console.log(`Localização ${locationName} já tem ${ghostCount} fantasmas`);
        return;
    }

    // Gerar novos fantasmas
    const ghostsToGenerate = GAME_CONFIG.MAX_GHOSTS_PER_LOCATION - ghostCount;

    for (let i = 0; i < ghostsToGenerate; i++) {
        const ghost = generateRandomGhost(locationName, coords);
        await ghostsRef.push(ghost);
    }

    console.log(`Gerados ${ghostsToGenerate} fantasmas para ${locationName}`);
}

// Gerar um fantasma aleatório
function generateRandomGhost(locationName, baseCoords) {
    const isStrong = Math.random() < GAME_CONFIG.STRONG_GHOST_PROBABILITY;
    const radius = GAME_CONFIG.GHOST_SPAWN_RADIUS;

    return {
        id: `ghost_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        location: locationName,
        lat: baseCoords.lat + (Math.random() - 0.5) * radius * 2,
        lon: baseCoords.lon + (Math.random() - 0.5) * radius * 2,
        type: isStrong ? 'Fantasma Forte' : 'Fantasma Comum',
        points: isStrong ? 25 : 10,
        captureDuration: isStrong ? 8000 : 5000,
        health: isStrong ? 2 : 1, // Fantasmas fortes precisam de 2 jogadores
        createdAt: Date.now(),
        capturedBy: null,
        isBeingCaptured: false,
        captureStartedAt: null,
        playersCapturing: []
    };
}

// Função para iniciar captura cooperativa
exports.startCooperativeCapture = functions.database.ref('/ghosts/{ghostId}/captureAttempts/{playerId}')
    .onCreate(async (snapshot, context) => {
        const { ghostId, playerId } = context.params;
        const captureData = snapshot.val();

        const db = admin.database();
        const ghostRef = db.ref(`ghosts/${ghostId}`);
        const ghostSnapshot = await ghostRef.once('value');
        const ghost = ghostSnapshot.val();

        if (!ghost || ghost.capturedBy) {
            return null; // Fantasma não existe ou já foi capturado
        }

        // Adicionar jogador à lista de capturadores
        await ghostRef.child('playersCapturing').child(playerId).set({
            playerId,
            startedAt: Date.now(),
            position: captureData.position
        });

        // Verificar se há jogadores suficientes para fantasmas fortes
        const playersCapturingSnapshot = await ghostRef.child('playersCapturing').once('value');
        const playersCapturing = playersCapturingSnapshot.val() || {};
        const playerCount = Object.keys(playersCapturing).length;

        if (ghost.type === 'Fantasma Forte' && playerCount >= 2) {
            // Iniciar captura cooperativa
            await ghostRef.update({
                isBeingCaptured: true,
                captureStartedAt: Date.now()
            });

            // Notificar todos os jogadores
            const notificationRef = db.ref('notifications');
            await notificationRef.push({
                type: 'cooperative_capture_started',
                ghostId,
                players: Object.keys(playersCapturing),
                timestamp: Date.now()
            });
        }

        return null;
    });

// Função para finalizar captura cooperativa
exports.completeCooperativeCapture = functions.database.ref('/ghosts/{ghostId}/captureComplete')
    .onCreate(async (snapshot, context) => {
        const { ghostId } = context.params;
        const db = admin.database();
        const ghostRef = db.ref(`ghosts/${ghostId}`);

        const ghostSnapshot = await ghostRef.once('value');
        const ghost = ghostSnapshot.val();

        if (!ghost || ghost.capturedBy) {
            return null;
        }

        const playersCapturing = ghost.playersCapturing || {};
        const playerIds = Object.keys(playersCapturing);

        if (playerIds.length === 0) {
            return null;
        }

        // Marcar fantasma como capturado
        await ghostRef.update({
            capturedBy: playerIds,
            capturedAt: Date.now(),
            isBeingCaptured: false
        });

        // Distribuir pontos entre os jogadores
        const pointsPerPlayer = Math.floor(ghost.points / playerIds.length);

        for (const playerId of playerIds) {
            const userRef = db.ref(`users/${playerId}`);
            const userSnapshot = await userRef.once('value');
            const userData = userSnapshot.val();

            if (userData) {
                await userRef.update({
                    points: (userData.points || 0) + pointsPerPlayer,
                    captures: (userData.captures || 0) + 1
                });
            }
        }

        // Notificar sucesso
        const notificationRef = db.ref('notifications');
        await notificationRef.push({
            type: 'cooperative_capture_success',
            ghostId,
            players: playerIds,
            pointsEarned: pointsPerPlayer,
            timestamp: Date.now()
        });

        return null;
    });

// Função para limpar tentativas de captura expiradas (DESABILITADA - requer billing)
/*
exports.cleanupCaptureAttempts = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
    const db = admin.database();
    const ghostsRef = db.ref('ghosts');
    const snapshot = await ghostsRef.once('value');
    const ghosts = snapshot.val() || {};

    const now = Date.now();
    const CAPTURE_TIMEOUT = 30000; // 30 segundos

    for (const [ghostId, ghost] of Object.entries(ghosts)) {
        if (ghost.playersCapturing) {
            const playersCapturing = ghost.playersCapturing;
            const expiredPlayers = [];

            Object.entries(playersCapturing).forEach(([playerId, captureData]) => {
                if (now - captureData.startedAt > CAPTURE_TIMEOUT) {
                    expiredPlayers.push(playerId);
                }
            });

            // Remover jogadores expirados
            for (const playerId of expiredPlayers) {
                await ghostsRef.child(ghostId).child('playersCapturing').child(playerId).remove();
            }

            // Se não há mais jogadores capturando, resetar estado
            const remainingSnapshot = await ghostsRef.child(ghostId).child('playersCapturing').once('value');
            const remainingPlayers = remainingSnapshot.val() || {};

            if (Object.keys(remainingPlayers).length === 0) {
                await ghostsRef.child(ghostId).update({
                    isBeingCaptured: false,
                    captureStartedAt: null
                });
            }
        }
    }

    return null;
});
*/

// Função para atualizar posição do jogador
exports.updatePlayerPosition = functions.database.ref('/players/{playerId}/position')
    .onWrite(async (change, context) => {
        const { playerId } = context.params;
        const newPosition = change.after.val();

        if (!newPosition) {
            return null;
        }

        const db = admin.database();

        // Atualizar timestamp da última atividade
        await db.ref(`players/${playerId}`).update({
            lastSeen: Date.now(),
            position: newPosition
        });

        return null;
    });

// Função para limpar jogadores inativos (DESABILITADA - requer billing)
/*
exports.cleanupInactivePlayers = functions.pubsub.schedule('every 10 minutes').onRun(async (context) => {
    const db = admin.database();
    const playersRef = db.ref('players');
    const snapshot = await playersRef.once('value');
    const players = snapshot.val() || {};

    const now = Date.now();
    const INACTIVE_TIMEOUT = 10 * 60 * 1000; // 10 minutos

    const inactivePlayers = [];

    Object.entries(players).forEach(([playerId, player]) => {
        if (now - (player.lastSeen || 0) > INACTIVE_TIMEOUT) {
            inactivePlayers.push(playerId);
        }
    });

    // Remover jogadores inativos
    for (const playerId of inactivePlayers) {
        await playersRef.child(playerId).remove();
    }

    console.log(`Removidos ${inactivePlayers.length} jogadores inativos`);
    return null;
});
*/

// Função para broadcast de mensagens de chat
exports.sendChatMessage = functions.database.ref('/chat/{locationName}/{messageId}')
    .onCreate(async (snapshot, context) => {
        const { locationName, messageId } = context.params;
        const message = snapshot.val();

        // Adicionar timestamp se não existir
        if (!message.timestamp) {
            await snapshot.ref.update({
                timestamp: Date.now()
            });
        }

        // Limitar histórico de chat (manter apenas últimas 50 mensagens)
        const chatRef = admin.database().ref(`chat/${locationName}`);
        const chatSnapshot = await chatRef.orderByChild('timestamp').once('value');
        const messages = chatSnapshot.val() || {};
        const messageKeys = Object.keys(messages);

        if (messageKeys.length > 50) {
            const oldestMessages = messageKeys.slice(0, messageKeys.length - 50);
            for (const oldMessageId of oldestMessages) {
                await chatRef.child(oldMessageId).remove();
            }
        }

        return null;
    });