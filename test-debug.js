// Script de debug para verificar funcionamento do botão de teste
(function() {
    console.log('🔍 Iniciando verificação do botão de teste...');
    
    // Verificar elementos
    const testButton = document.getElementById('test-effects-button');
    const fallbackButton = document.getElementById('test-effects-fallback');
    const inventoryContainer = document.getElementById('inventory-icon-container');
    
    console.log('🔍 Elementos encontrados:', {
        testButton: !!testButton,
        fallbackButton: !!fallbackButton,
        inventoryContainer: !!inventoryContainer
    });
    
    // Verificar posições e z-index
    if (testButton) {
        const rect = testButton.getBoundingClientRect();
        const style = getComputedStyle(testButton);
        console.log('🔍 Botão principal:', {
            position: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
            zIndex: style.zIndex,
            display: style.display,
            visibility: style.visibility
        });
    }
    
    if (fallbackButton) {
        const rect = fallbackButton.getBoundingClientRect();
        const style = getComputedStyle(fallbackButton);
        console.log('🔍 Botão fallback:', {
            position: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
            zIndex: style.zIndex,
            display: style.display,
            visibility: style.visibility
        });
    }
    
    if (inventoryContainer) {
        const rect = inventoryContainer.getBoundingClientRect();
        const style = getComputedStyle(inventoryContainer);
        console.log('🔍 Container do inventário:', {
            position: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
            zIndex: style.zIndex
        });
    }
    
    // Verificar se há sobreposição
    setTimeout(() => {
        if (testButton) {
            const rect = testButton.getBoundingClientRect();
            const centerX = rect.left + rect.width/2;
            const centerY = rect.top + rect.height/2;
            const elements = document.elementsFromPoint(centerX, centerY);
            console.log('🔍 Elementos na posição do botão principal:', elements.map(el => el.id || el.tagName));
        }
        
        if (fallbackButton) {
            const rect = fallbackButton.getBoundingClientRect();
            const centerX = rect.left + rect.width/2;
            const centerY = rect.top + rect.height/2;
            const elements = document.elementsFromPoint(centerX, centerY);
            console.log('🔍 Elementos na posição do botão fallback:', elements.map(el => el.id || el.tagName));
        }
    }, 500);
    
    console.log('✅ Verificação concluída. Verifique os resultados no console.');
})();