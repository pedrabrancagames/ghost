// Script de debug para modo AR - Ghostbusters
(function() {
    console.log('🔍 Iniciando verificação de debug para modo AR...');
    
    // Verificar estado do A-Frame
    const scene = document.querySelector('a-scene');
    console.log('🔍 Estado do A-Frame:', {
        scene: !!scene,
        isAR: scene?.is('ar-mode'),
        isVR: scene?.is('vr-mode'),
        isPresenting: scene?.isPresenting
    });
    
    // Verificar botões de teste
    const testButton = document.getElementById('test-effects-button');
    const fallbackButton = document.getElementById('test-effects-fallback');
    
    console.log('🔍 Botões de teste:', {
        testButton: !!testButton,
        fallbackButton: !!fallbackButton
    });
    
    if (testButton) {
        const rect = testButton.getBoundingClientRect();
        const style = getComputedStyle(testButton);
        console.log('🔍 Botão principal:', {
            position: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
            zIndex: style.zIndex,
            display: style.display,
            visibility: style.visibility,
            pointerEvents: style.pointerEvents
        });
    }
    
    if (fallbackButton) {
        const rect = fallbackButton.getBoundingClientRect();
        const style = getComputedStyle(fallbackButton);
        console.log('🔍 Botão fallback:', {
            position: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
            zIndex: style.zIndex,
            display: style.display,
            visibility: style.visibility,
            pointerEvents: style.pointerEvents
        });
    }
    
    // Verificar canvas de efeitos
    const canvas = document.getElementById('effects-canvas');
    console.log('🔍 Canvas de efeitos:', {
        canvas: !!canvas,
        width: canvas?.width,
        height: canvas?.height,
        style: canvas ? {
            visibility: getComputedStyle(canvas).visibility,
            display: getComputedStyle(canvas).display,
            zIndex: getComputedStyle(canvas).zIndex,
            pointerEvents: getComputedStyle(canvas).pointerEvents
        } : null
    });
    
    // Verificar elementos na posição dos botões
    setTimeout(() => {
        if (testButton) {
            const rect = testButton.getBoundingClientRect();
            const centerX = rect.left + rect.width/2;
            const centerY = rect.top + rect.height/2;
            const elements = document.elementsFromPoint(centerX, centerY);
            console.log('🔍 Elementos na posição do botão principal:', elements.map(el => ({
                id: el.id || 'sem-id',
                tagName: el.tagName,
                className: el.className
            })));
        }
        
        if (fallbackButton) {
            const rect = fallbackButton.getBoundingClientRect();
            const centerX = rect.left + rect.width/2;
            const centerY = rect.top + rect.height/2;
            const elements = document.elementsFromPoint(centerX, centerY);
            console.log('🔍 Elementos na posição do botão fallback:', elements.map(el => ({
                id: el.id || 'sem-id',
                tagName: el.tagName,
                className: el.className
            })));
        }
    }, 1000);
    
    // Verificação contínua em modo AR
    if (scene?.is('ar-mode') || scene?.is('vr-mode')) {
        console.log('📱 Modo AR/VR detectado, iniciando monitoramento contínuo...');
        
        const interval = setInterval(() => {
            // Verificar se os botões ainda existem
            const currentTestButton = document.getElementById('test-effects-button');
            const currentFallbackButton = document.getElementById('test-effects-fallback');
            
            if (!currentTestButton && !currentFallbackButton) {
                console.warn('⚠️ Nenhum botão de teste encontrado no monitoramento contínuo!');
                clearInterval(interval);
                return;
            }
            
            // Verificar fallback button
            if (currentFallbackButton) {
                const rect = currentFallbackButton.getBoundingClientRect();
                console.log('🔄 Botão fallback monitorado:', {
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left
                });
                
                // Se o botão tiver tamanho zero, forçar recriação
                if (rect.width === 0 || rect.height === 0) {
                    console.error('❌ Botão fallback com tamanho zero no monitoramento!');
                }
            }
        }, 3000);
        
        // Parar monitoramento após 60 segundos
        setTimeout(() => {
            clearInterval(interval);
            console.log('⏹️ Monitoramento contínuo encerrado');
        }, 60000);
    }
    
    console.log('✅ Verificação de debug para modo AR concluída');
})();