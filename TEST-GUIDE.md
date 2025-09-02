# Guia de Teste de Efeitos Visuais - Ghostbusters AR

## Botão de Teste

O sistema agora possui dois botões de teste para verificar os efeitos visuais:

### 1. Botão Principal (🎨 TESTE)
- **Posição**: Canto superior esquerdo da tela
- **Aparência**: Botão vermelho com borda branca e ícone de pincel
- **Z-index**: 20000 (muito alto para sobreposição)
- **Funcionalidade**: Testa todos os efeitos visuais em sequência

### 2. Botão Fallback (🎨 TESTE VISUAL)
- **Posição**: Abaixo do botão principal (aparece automaticamente se necessário)
- **Aparência**: Botão vermelho gradiente com borda branca mais grossa
- **Z-index**: 25000 (ainda maior que o principal)
- **Funcionalidade**: Testa todos os efeitos visuais em sequência

## Como Usar

1. **Antes do login**: Clique no botão principal para verificar se o sistema de efeitos está funcionando
2. **Após selecionar área e iniciar AR**: O botão principal deve estar visível no canto superior esquerdo
3. **Se o botão principal não funcionar**: O botão fallback será criado automaticamente

## Efeitos Testados

Ao clicar em qualquer botão de teste, os seguintes efeitos são executados em sequência:

1. **Indicadores Visuais** (0s): Retângulos coloridos e texto para verificar visibilidade
2. **Celebração** (1s): Efeito de partículas no centro da tela
3. **Feixe de Prótons** (2s-5s): Linha energética entre a proton pack e o centro
4. **Sucção** (6s): Efeito de partículas sendo sugadas entre dois pontos
5. **Limpeza** (8s): Todos os efeitos são removidos

## Solução de Problemas

### Botão não aparece
- Verifique o console do navegador (F12) para erros
- O botão fallback deve aparecer automaticamente após 1 segundo

### Botão aparece mas não responde
- Verifique se há elementos sobrepostos (ghost trap, inventário)
- O botão fallback tem proteção contra sobreposição

### Efeitos não aparecem
- Verifique se o canvas está sendo criado corretamente
- O sistema tenta re-inicializar automaticamente se necessário

## Informações Técnicas

### Z-index Hierarchy
- Botão Fallback: 25000
- Botão Principal: 20000
- Canvas de Efeitos: 9999
- Inventário: 25
- UI Container: 10

### Posicionamento
- Botão Principal: `top: 20px; left: 90px;`
- Botão Fallback: `top: 90px; left: 20px;`
- Isso evita conflito com o inventário no canto superior direito

### Proteções Implementadas
1. **Detecção automática** de botão com tamanho zero
2. **Criação de fallback** com posicionamento alternativo
3. **Verificação pós-AR** para garantir funcionamento
4. **Re-inicialização automática** do sistema de efeitos
5. **Proteção contra sobreposição** de elementos