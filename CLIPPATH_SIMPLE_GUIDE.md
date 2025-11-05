# 🎭 ClipPath Simples - Guia de Uso

Sistema simplificado de máscara de recorte (clipPath) com controle visual via shell.

## 📖 Conceito

O sistema permite adicionar uma máscara de recorte a qualquer objeto do canvas, cortando-o em uma forma específica (círculo ou retângulo). A máscara é controlada por um **shell visual** (contorno azul tracejado) que permite ajustar posição, rotação e escala da máscara de forma intuitiva.

## ✨ Como Funciona

### 1. **Adicionar Máscara**

**Via Shape Controls (Sidebar):**
- Selecione um objeto no canvas
- Na seção "Máscara de Recorte (ClipPath)"
- Clique em **"Círculo"** ou **"Retângulo"**

**Via Context Menu (Botão Direito):**
- Clique com botão direito no objeto
- Escolha **"Adicionar Máscara Circular"** ou **"Adicionar Máscara Retangular"**

### 2. **Ajustar a Máscara**

Após adicionar a máscara, você verá:
- **Contorno azul tracejado** (shell) ao redor do objeto
- Este contorno **NÃO** é a máscara, mas sim o **controle visual**

Para ajustar a máscara:
1. **Mover:** Arraste o contorno azul
2. **Rotacionar:** Use as alças de rotação do contorno
3. **Redimensionar:** Arraste as alças de canto/lado do contorno

> 💡 **Dica:** O contorno azul sincroniza automaticamente com a máscara - mova o contorno e a máscara se move junto!

### 3. **Remover Máscara**

**Via Shape Controls:**
- Com objeto selecionado, clique em **"Remover Máscara"**

**Via Context Menu:**
- Botão direito no objeto → **"Remover Máscara"**

Isso remove tanto a clipPath quanto o shell visual.

## 🎨 Exemplo de Uso

```typescript
// Exemplo: Adicionar máscara circular a uma imagem
const image = new FabricImage(...)
canvas.add(image)
canvas.setActiveObject(image)

// Agora no Shape Controls, clique em "Círculo"
// Ou via código:
applyClipPathToObject('circle', true)

// Ajuste o contorno azul para posicionar a máscara
// A máscara cortará a imagem em formato circular
```

## 🔧 Detalhes Técnicos

### Estrutura da Máscara

```typescript
// ClipPath com absolutePositioned: true
object.clipPath = new Circle({
    absolutePositioned: true,  // Posição independente do objeto
    radius: 100,
    originX: 'center',
    originY: 'center'
})

// Shell (controle visual)
const shell = new Circle({
    _isClipShell: true,        // Marcador especial
    fill: 'transparent',
    stroke: '#3b82f6',         // Azul
    strokeDashArray: [5, 5],   // Tracejado
    strokeWidth: 2
})
```

### Sincronização Shell → ClipPath

```typescript
// Quando o shell se move
shell.on('moving', () => {
    clipPath.setPositionByOrigin(
        shell.getCenterPoint(), 
        'center', 
        'center'
    )
})

// Quando o shell rotaciona
shell.on('rotating', () => {
    clipPath.set('angle', shell.angle)
})

// Quando o shell é redimensionado
shell.on('scaling', () => {
    clipPath.set({
        scaleX: shell.scaleX,
        scaleY: shell.scaleY
    })
})
```

## 🎯 Funcionalidades

### ✅ Suportado
- ✅ Máscara circular
- ✅ Máscara retangular
- ✅ Controle visual via shell
- ✅ Mover máscara independentemente do objeto
- ✅ Rotacionar máscara
- ✅ Redimensionar máscara
- ✅ Remover máscara
- ✅ Funciona com qualquer objeto (exceto linhas)

### ❌ Não Suportado (por enquanto)
- ❌ Máscaras com formas personalizadas (path)
- ❌ Múltiplas máscaras no mesmo objeto
- ❌ Animar máscara

## 🚀 Próximos Passos

Se precisar de funcionalidades adicionais:
1. **Formas customizadas:** Adicionar suporte a `path` como máscara
2. **Edição de forma:** Permitir editar vértices do shell
3. **Pré-visualização:** Mostrar área de corte antes de aplicar

## 📝 Notas de Implementação

### Código Principal
- **fabric-canvas.tsx:** `applyClipPathToObject()`, `removeClipPath()`
- **shape-controls.tsx:** UI para adicionar/remover máscaras
- **canvas-context-menu.tsx:** Menu de contexto
- **creative-store.ts:** Registro das funções no estado global

### Diferenças vs. Sistema Anterior
| Anterior (Clip Group) | Atual (ClipPath Simples) |
|-----------------------|--------------------------|
| Grupo com container | ClipPath direto |
| Modo de edição | Sem modo especial |
| Adicionar múltiplos objetos | Apenas máscara |
| Complexo | Simples |
| Inspirado em conceito próprio | Baseado em exemplo Fabric.js oficial |

---

**Criado em:** 2025  
**Baseado em:** Fabric.js v6 clipPath example  
**Status:** ✅ Implementado e testado
