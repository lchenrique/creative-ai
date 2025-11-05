# 🎭 Funcionalidade de Máscara de Recorte (Clip Mask)

## 🎯 O que mudou?

A funcionalidade de **padrões de imagem** foi **substituída** por um sistema mais poderoso de **máscaras de recorte (clip masks)**, onde:

### ❌ Antes (Pattern):
- A imagem era apenas um "preenchimento" do shape
- Não era possível manipular a imagem independentemente
- A imagem era estática dentro do objeto

### ✅ Agora (Clip Mask):
- A **imagem é um objeto Fabric.js completo**
- O **shape atua como máscara de recorte (clipPath)**
- Você pode **mover, escalar e rotacionar a imagem** dentro da máscara
- A imagem mantém todas as propriedades de um objeto normal

## 🚀 Como Funciona

### Conceito
1. Você cria um shape (círculo, retângulo, triângulo, etc.)
2. Adiciona uma imagem através da funcionalidade de clip mask
3. O shape original é removido e substituído por:
   - **Imagem**: Objeto manipulável (mover, escalar, rotacionar)
   - **ClipPath**: O shape como máscara (define a área visível)

### Resultado
A imagem fica "recortada" no formato do shape, mas você pode manipular a imagem dentro desse recorte!

## 📖 Como Usar

### Método 1: Via Painel de Controles

1. **Adicione um shape** (círculo, retângulo, etc.) no canvas
2. **Selecione o shape**
3. No painel de controles, encontre a seção **"Imagem com Máscara"**
4. Clique em **"Adicionar Imagem com Máscara"**
5. Selecione uma imagem do seu computador
6. **Pronto!** A imagem agora está mascarada pelo shape

### Método 2: Via Menu de Contexto

1. **Clique direito** em um shape
2. Selecione **"Adicionar Imagem com Máscara"**
3. Escolha uma imagem
4. A máscara será aplicada automaticamente

### Método 3: Via Código

```typescript
import { useCreativeStore } from '@/stores/creative-store'

function MyComponent() {
  const applyClipMask = useCreativeStore((state) => state.applyImageAsClipMask)
  
  const handleAddMask = async () => {
    // Aplica máscara ao objeto selecionado
    await applyClipMask('https://example.com/image.jpg')
  }
  
  return (
    <button onClick={handleAddMask}>
      Adicionar Máscara
    </button>
  )
}
```

## 🎨 Exemplos Práticos

### Exemplo 1: Foto de Perfil Circular

```javascript
// 1. Criar círculo
const circle = new fabric.Circle({
  radius: 100,
  left: 200,
  top: 200,
  fill: 'gray'
})
canvas.add(circle)

// 2. Aplicar foto como máscara
const store = useCreativeStore.getState()
await store.applyImageAsClipMask('https://example.com/profile.jpg')

// Resultado: Foto cortada em círculo que você pode manipular!
```

### Exemplo 2: Banner em Retângulo

```javascript
// 1. Criar retângulo
const rect = new fabric.Rect({
  width: 400,
  height: 200,
  left: 100,
  top: 100,
  fill: 'blue'
})
canvas.add(rect)

// 2. Aplicar imagem
await store.applyImageAsClipMask('https://example.com/banner.jpg')

// Resultado: Imagem cortada no formato retangular
```

### Exemplo 3: Logo em Estrela

```javascript
// 1. Criar estrela (polygon)
const star = createStar() // função customizada
canvas.add(star)

// 2. Aplicar logo
await store.applyImageAsClipMask('https://example.com/logo.png')

// Resultado: Logo cortado em forma de estrela!
```

## 🔧 Detalhes Técnicos

### O que acontece por baixo dos panos

```typescript
async function applyImageAsClipMask(imageUrl: string) {
  // 1. Carregar a imagem
  const fabricImg = await FabricImage.fromURL(imageUrl)
  
  // 2. Clonar o shape selecionado
  const clonedShape = await selectedObject.clone()
  
  // 3. Configurar o clone como clipPath
  clonedShape.set({
    left: -width / 2,
    top: -height / 2,
    absolutePositioned: true
  })
  
  // 4. Aplicar clipPath à imagem
  fabricImg.set({
    clipPath: clonedShape,
    // ... outras propriedades
  })
  
  // 5. Substituir shape por imagem mascarada
  canvas.remove(selectedObject)
  canvas.add(fabricImg)
}
```

### Propriedades Mantidas

A imagem resultante mantém:
- ✅ Posição (left, top)
- ✅ Rotação (angle)
- ✅ Escala (scaleX, scaleY)
- ✅ Snap de rotação (45°)
- ✅ Todos os controles padrão do Fabric.js

## 💡 Casos de Uso

### 1. Fotos de Perfil
```typescript
// Círculo → Foto de perfil circular
const circle = new fabric.Circle({ radius: 50 })
await applyClipMask(userPhotoUrl)
```

### 2. Banners e Headers
```typescript
// Retângulo → Banner com imagem de fundo
const rect = new fabric.Rect({ width: 800, height: 200 })
await applyClipMask(bannerImageUrl)
```

### 3. Ícones Customizados
```typescript
// Polígono → Ícone em forma customizada
const shape = new fabric.Polygon(points)
await applyClipMask(iconUrl)
```

### 4. Cards e Thumbnails
```typescript
// Retângulo arredondado → Card com imagem
const roundedRect = new fabric.Rect({ 
  width: 300, 
  height: 200, 
  rx: 20, 
  ry: 20 
})
await applyClipMask(thumbnailUrl)
```

## 🎭 Manipulando a Imagem Mascarada

### Depois de aplicar a máscara, você pode:

1. **Mover a imagem**: Arraste normalmente
2. **Rotacionar**: Use os controles de rotação
3. **Escalar**: Arraste os cantos (a máscara escala junto!)
4. **Ajustar propriedades**: Opacidade, etc.

### Acessando a Máscara

```javascript
const maskedImage = canvas.getActiveObject()

// A máscara está em:
console.log(maskedImage.clipPath) // O shape usado como máscara

// Tipo original do shape:
console.log(maskedImage.originalShapeType) // 'circle', 'rect', etc.
```

## 🆚 Comparação: Pattern vs Clip Mask

| Recurso | Pattern (Antigo) | Clip Mask (Novo) |
|---------|------------------|------------------|
| Imagem manipulável | ❌ Não | ✅ Sim |
| Mover imagem independente | ❌ Não | ✅ Sim |
| Escalar imagem | ❌ Limitado | ✅ Total |
| Rotacionar imagem | ❌ Não | ✅ Sim |
| Tipos de repetição | ✅ 4 modos | ➖ N/A |
| Flexibilidade | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Facilidade de uso | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🔄 Migração de Pattern para Clip Mask

Se você estava usando patterns antes:

### Antes:
```javascript
// Pattern - imagem repetida
obj.fill = new fabric.Pattern({
  source: img,
  repeat: 'repeat'
})
```

### Agora:
```javascript
// Clip Mask - imagem mascarada e manipulável
await applyImageAsClipMask(imageUrl)
// A imagem agora é um objeto separado!
```

## ⚠️ Limitações

1. **Não suporta**:
   - Linhas (type: 'line')
   - Textos (type: 'textbox', 'i-text')
   - Imagens existentes (type: 'image')

2. **A máscara substitui o shape original**
   - O shape é removido e substituído pela imagem mascarada
   - Guarde uma cópia se precisar do shape original

## 🚧 Recursos Futuros

- [ ] Editar a máscara após aplicação
- [ ] Trocar a imagem mantendo a máscara
- [ ] Múltiplas imagens na mesma máscara
- [ ] Animações na imagem mascarada
- [ ] Filtros e efeitos na imagem
- [ ] Exportar/importar máscaras complexas

## 📚 Referências

- [Fabric.js clipPath Documentation](http://fabricjs.com/clippath)
- [Fabric.js Image Manipulation](http://fabricjs.com/fabric-intro-part-1#images)

---

## 🎉 Resultado

Com esta nova funcionalidade, você tem **controle total** sobre imagens recortadas em formas customizadas, podendo **manipular a imagem livremente** enquanto mantém o efeito de máscara!
