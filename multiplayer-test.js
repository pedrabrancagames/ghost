/**
 * Testes do Sistema Multiplayer - Ghostbusters AR
 * Script para testar funcionalidades multiplayer
 */

class MultiplayerTester {
    constructor() {
        this.testResults = [];
        this.gameManager = null;
        this.multiplayerManager = null;
    }
    
    async runAllTests() {
        console.log('🧪 Iniciando testes do sistema multiplayer...');
        
        // Aguardar inicialização do jogo
        await this.waitForGameInitialization();
        
        // Executar testes
        await this.testMultiplayerInitialization();
        await this.testPlayerPositionUpdate();
        await this.testChatSystem();
        await this.testGhostGeneration();
        await this.testCooperativeCapture();
        await this.testPlayerProximity();
        
        // Mostrar resultados
        this.showTestResults();
    }
    
    async waitForGameInitialization() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const gameManagerElement = document.querySelector('[game-manager]');
                if (gameManagerElement && gameManagerElement.components['game-manager']) {
                    this.gameManager = gameManagerElement.components['game-manager'];
                    this.multiplayerManager = this.gameManager.multiplayerManager;
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 500);
        });
    }
    
    async testMultiplayerInitialization() {
        console.log('🧪 Testando inicialização do multiplayer...');
        
        try {
            // Verificar se o multiplayer manager foi criado
            const test1 = this.multiplayerManager !== null;
            this.addTestResult('Multiplayer Manager criado', test1);
            
            // Verificar se a UI foi criada
            const multiplayerContainer = document.getElementById('multiplayer-container');
            const test2 = multiplayerContainer !== null;
            this.addTestResult('UI Multiplayer criada', test2);
            
            // Verificar se os elementos de chat existem
            const chatInput = document.getElementById('chat-input');
            const test3 = chatInput !== null;
            this.addTestResult('Sistema de chat inicializado', test3);
            
            // Verificar se os estilos foram carregados
            const styles = document.querySelector('link[href="multiplayer-styles.css"]');
            const test4 = styles !== null;
            this.addTestResult('Estilos multiplayer carregados', test4);
            
        } catch (error) {
            this.addTestResult('Inicialização do multiplayer', false, error.message);
        }
    }
    
    async testPlayerPositionUpdate() {
        console.log('🧪 Testando atualização de posição...');
        
        try {
            if (!this.multiplayerManager || !this.multiplayerManager.isOnline) {
                this.addTestResult('Atualização de posição', false, 'Multiplayer não está online');
                return;
            }
            
            // Simular posição
            const mockCoords = {
                latitude: -27.630913,
                longitude: -48.679793,
                accuracy: 10
            };
            
            await this.multiplayerManager.updatePlayerPosition(mockCoords);
            
            // Verificar se a posição foi atualizada
            const hasPosition = this.multiplayerManager.currentPlayer?.position !== null;
            this.addTestResult('Posição do jogador atualizada', hasPosition);
            
        } catch (error) {
            this.addTestResult('Atualização de posição', false, error.message);
        }
    }
    
    async testChatSystem() {
        console.log('🧪 Testando sistema de chat...');
        
        try {
            // Verificar elementos do chat
            const chatInput = document.getElementById('chat-input');
            const sendButton = document.getElementById('send-message');
            const chatMessages = document.getElementById('chat-messages');
            
            const test1 = chatInput && sendButton && chatMessages;
            this.addTestResult('Elementos de chat presentes', test1);
            
            // Testar envio de mensagem (simulado)
            if (this.multiplayerManager && this.multiplayerManager.isOnline) {
                const testMessage = 'Mensagem de teste - ' + Date.now();
                
                // Simular mensagem local
                const mockMessage = {
                    id: 'test_' + Date.now(),
                    playerId: 'test_player',
                    playerName: 'Testador',
                    avatar: '🧪',
                    message: testMessage,
                    timestamp: Date.now()
                };
                
                this.multiplayerManager.handleChatMessage(mockMessage);
                
                // Verificar se a mensagem apareceu na UI
                const messageInUI = chatMessages.textContent.includes(testMessage);
                this.addTestResult('Mensagem de chat exibida', messageInUI);
            } else {
                this.addTestResult('Envio de mensagem', false, 'Multiplayer offline');
            }
            
        } catch (error) {
            this.addTestResult('Sistema de chat', false, error.message);
        }
    }
    
    async testGhostGeneration() {
        console.log('🧪 Testando geração de fantasmas...');
        
        try {
            // Verificar se o método de carregamento do Firebase existe
            const hasFirebaseMethod = typeof this.gameManager.loadGhostsFromFirebase === 'function';
            this.addTestResult('Método de carregamento Firebase', hasFirebaseMethod);
            
            // Testar geração local de fantasma
            this.gameManager.generateLocalGhost();
            
            const hasGhostData = this.gameManager.ghostData !== null;
            this.addTestResult('Geração local de fantasma', hasGhostData);
            
            if (hasGhostData) {
                const hasRequiredFields = this.gameManager.ghostData.lat && 
                                        this.gameManager.ghostData.lon && 
                                        this.gameManager.ghostData.type;
                this.addTestResult('Dados do fantasma válidos', hasRequiredFields);
            }
            
        } catch (error) {
            this.addTestResult('Geração de fantasmas', false, error.message);
        }
    }
    
    async testCooperativeCapture() {
        console.log('🧪 Testando captura cooperativa...');
        
        try {
            if (!this.multiplayerManager) {
                this.addTestResult('Captura cooperativa', false, 'Multiplayer não inicializado');
                return;
            }
            
            // Verificar método de captura cooperativa
            const hasCoopMethod = typeof this.multiplayerManager.startCooperativeCapture === 'function';
            this.addTestResult('Método de captura cooperativa', hasCoopMethod);
            
            // Verificar UI de captura cooperativa
            const coopUI = document.getElementById('cooperative-capture');
            const hasCoopUI = coopUI !== null;
            this.addTestResult('UI de captura cooperativa', hasCoopUI);
            
            // Testar verificação de jogadores próximos
            const canCapture = this.multiplayerManager.canStartCooperativeCapture('Fantasma Forte');
            this.addTestResult('Verificação de captura cooperativa', typeof canCapture === 'boolean');
            
        } catch (error) {
            this.addTestResult('Captura cooperativa', false, error.message);
        }
    }
    
    async testPlayerProximity() {
        console.log('🧪 Testando detecção de proximidade...');
        
        try {
            if (!this.multiplayerManager) {
                this.addTestResult('Detecção de proximidade', false, 'Multiplayer não inicializado');
                return;
            }
            
            // Testar cálculo de distância
            const distance = this.multiplayerManager.calculateDistance(
                -27.630913, -48.679793,
                -27.630914, -48.679794
            );
            
            const distanceValid = typeof distance === 'number' && distance >= 0;
            this.addTestResult('Cálculo de distância', distanceValid);
            
            // Testar geração de avatar
            const avatar = this.multiplayerManager.generateAvatar('test_player_123');
            const avatarValid = typeof avatar === 'string' && avatar.length > 0;
            this.addTestResult('Geração de avatar', avatarValid);
            
            // Verificar UI de jogadores próximos
            const playersUI = document.getElementById('nearby-players');
            const hasPlayersUI = playersUI !== null;
            this.addTestResult('UI de jogadores próximos', hasPlayersUI);
            
        } catch (error) {
            this.addTestResult('Detecção de proximidade', false, error.message);
        }
    }
    
    addTestResult(testName, passed, error = null) {
        this.testResults.push({
            name: testName,
            passed,
            error
        });
        
        const status = passed ? '✅' : '❌';
        const errorMsg = error ? ` (${error})` : '';
        console.log(`${status} ${testName}${errorMsg}`);
    }
    
    showTestResults() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        const percentage = Math.round((passed / total) * 100);
        
        console.log('\n📊 RESULTADOS DOS TESTES MULTIPLAYER:');
        console.log(`✅ Passou: ${passed}/${total} (${percentage}%)`);
        console.log(`❌ Falhou: ${total - passed}/${total}`);
        
        // Mostrar falhas
        const failures = this.testResults.filter(r => !r.passed);
        if (failures.length > 0) {
            console.log('\n❌ TESTES QUE FALHARAM:');
            failures.forEach(failure => {
                console.log(`- ${failure.name}: ${failure.error || 'Falha desconhecida'}`);
            });
        }
        
        // Criar relatório visual
        this.createVisualReport(passed, total);
    }
    
    createVisualReport(passed, total) {
        // Criar modal com resultados
        const modal = document.createElement('div');
        modal.id = 'test-results-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        const percentage = Math.round((passed / total) * 100);
        const color = percentage >= 80 ? '#4CAF50' : percentage >= 60 ? '#FF9800' : '#F44336';
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            ">
                <h2 style="color: #333; margin-bottom: 20px;">
                    🧪 Resultados dos Testes Multiplayer
                </h2>
                
                <div style="
                    font-size: 48px;
                    font-weight: bold;
                    color: ${color};
                    margin: 20px 0;
                ">
                    ${percentage}%
                </div>
                
                <div style="color: #666; margin-bottom: 20px;">
                    ${passed} de ${total} testes passaram
                </div>
                
                <div style="
                    background: #f5f5f5;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    text-align: left;
                    max-height: 200px;
                    overflow-y: auto;
                ">
                    ${this.testResults.map(test => `
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 5px 0;
                            border-bottom: 1px solid #eee;
                        ">
                            <span style="font-size: 16px;">
                                ${test.passed ? '✅' : '❌'}
                            </span>
                            <span style="flex: 1; color: #333;">
                                ${test.name}
                            </span>
                        </div>
                    `).join('')}
                </div>
                
                <button onclick="document.getElementById('test-results-modal').remove()" style="
                    background: #92F428;
                    color: black;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    Fechar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

// Função global para executar testes
window.testMultiplayer = async function() {
    const tester = new MultiplayerTester();
    await tester.runAllTests();
};

// Auto-executar testes se estiver em modo debug
if (window.location.search.includes('test=multiplayer')) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.testMultiplayer();
        }, 3000);
    });
}

console.log('🧪 Sistema de testes multiplayer carregado. Execute window.testMultiplayer() para testar.');