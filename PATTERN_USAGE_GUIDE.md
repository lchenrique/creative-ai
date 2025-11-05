# 📖 Guia de Uso: Padrões de Imagem

## 🎯 Três Formas de Adicionar Padrões

### 1️⃣ Via Painel de Controles (Shape Controls)

**Passo a passo:**
1. Adicione ou selecione um objeto no canvas (círculo, retângulo, etc.)
2. O painel de controles aparecerá à direita/lateral
3. Role até a seção **"Padrão de Imagem"**
4. Clique em **"Adicionar Padrão de Imagem"**
5. Selecione uma imagem do seu computador
6. A imagem será aplicada automaticamente
7. Escolha o modo de repetição desejado:
   - ⭕ **Sem Repetir**
   - 🔲 **Repetir**
   - ➡️ **Repetir X**
   - ⬇️ **Repetir Y**
8. Para remover: Clique no **X** no preview da imagem

**Vantagens:**
- ✅ Controle visual completo
- ✅ Preview em tempo real
- ✅ Fácil ajuste do modo de repetição

---

### 2️⃣ Via Menu de Contexto (Clique Direito)

**Passo a passo:**
1. Selecione um objeto no canvas
2. Clique com o **botão direito** no objeto
3. No menu que aparece, clique em **"Adicionar Padrão de Imagem"**
4. Selecione uma imagem do seu computador
5. A imagem será aplicada com modo `no-repeat` por padrão
6. Use o painel de controles para ajustar o modo de repetição

**Vantagens:**
- ✅ Acesso rápido
- ✅ Menos cliques
- ✅ Atalho conveniente

---

### 3️⃣ Via Código/Console (Programático)

**Exemplo 1: Usando o Store**
```typescript
import { useCreativeStore } from '@/stores/creative-store'

function MyComponent() {
  const applyPattern = useCreativeStore((state) => state.applyPatternToObject)
  const removePattern = useCreativeStore((state) => state.removePatternFromObject)
  
  const handleAddPattern = () => {
    // Aplica padrão com repetição
    applyPattern('https://example.com/texture.jpg', 'repeat')
  }
  
  const handleRemovePattern = () => {
    // Remove e restaura cor azul
    removePattern('#0000ff')
  }
  
  return (
    <div>
      <button onClick={handleAddPattern}>Adicionar Padrão</button>
      <button onClick={handleRemovePattern}>Remover Padrão</button>
    </div>
  )
}
```

**Exemplo 2: Fabric.js Puro (Console)**
```javascript
// 1. Pegar o canvas
const canvas = window.fabricCanvas

// 2. Criar um círculo
const circle = new fabric.Circle({
  radius: 60,
  fill: 'red',
  left: 100,
  top: 100
})
canvas.add(circle)

// 3. Aplicar padrão
fabric.util.loadImage('https://picsum.photos/200', function (img) {
  const pattern = new fabric.Pattern({
    source: img,
    repeat: 'repeat' // 'no-repeat', 'repeat-x', 'repeat-y'
  })
  circle.set('fill', pattern)
  canvas.renderAll()
})
```

**Exemplo 3: Com Imagem Local**
```javascript
// Upload de arquivo
const input = document.createElement('input')
input.type = 'file'
input.accept = 'image/*'

input.onchange = (e) => {
  const file = e.target.files[0]
  const reader = new FileReader()
  
  reader.onload = (event) => {
    const imgUrl = event.target.result
    
    // Aplicar ao objeto selecionado
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      fabric.util.loadImage(imgUrl, function (img) {
        const pattern = new fabric.Pattern({
          source: img,
          repeat: 'no-repeat'
        })
        activeObject.set('fill', pattern)
        canvas.renderAll()
      })
    }
  }
  
  reader.readAsDataURL(file)
}

input.click()
```

**Vantagens:**
- ✅ Automação de processos
- ✅ Integração com outras funcionalidades
- ✅ Controle programático completo

---

## 🎨 Exemplos Práticos

### Exemplo 1: Textura de Madeira
```javascript
const rect = new fabric.Rect({
  width: 300,
  height: 200,
  left: 50,
  top: 50
})
canvas.add(rect)

fabric.util.loadImage('https://example.com/wood-texture.jpg', function (img) {
  rect.set('fill', new fabric.Pattern({
    source: img,
    repeat: 'repeat'
  }))
  canvas.renderAll()
})
```

### Exemplo 2: Logo sem Repetição
```javascript
const circle = new fabric.Circle({
  radius: 100,
  left: 150,
  top: 150
})
canvas.add(circle)

fabric.util.loadImage('https://example.com/logo.png', function (img) {
  circle.set('fill', new fabric.Pattern({
    source: img,
    repeat: 'no-repeat'
  }))
  canvas.renderAll()
})
```

### Exemplo 3: Padrão Horizontal
```javascript
const rect = new fabric.Rect({
  width: 400,
  height: 100,
  left: 50,
  top: 50
})
canvas.add(rect)

fabric.util.loadImage('https://example.com/stripe.png', function (img) {
  rect.set('fill', new fabric.Pattern({
    source: img,
    repeat: 'repeat-x'
  }))
  canvas.renderAll()
})
```

---

## 💡 Dicas e Truques

### ✨ Melhor Qualidade
```javascript
// Use imagens de alta resolução para padrões
const pattern = new fabric.Pattern({
  source: img,
  repeat: 'repeat',
  // Opcional: ajustar tamanho
  offsetX: 0,
  offsetY: 0
})
```

### 🔄 Combinar com Transformações
```javascript
// Aplicar padrão e depois rotacionar
activeObject.set('fill', pattern)
activeObject.set('angle', 45)
canvas.renderAll()
```

### 🎯 Aplicar em Múltiplos Objetos
```javascript
canvas.getObjects().forEach(obj => {
  if (obj.type !== 'line') {
    obj.set('fill', pattern)
  }
})
canvas.renderAll()
```

---

## 🐛 Problemas Comuns

### Problema: Imagem não carrega
**Causa**: CORS bloqueando a imagem
**Solução**:
```javascript
fabric.util.loadImage(imageUrl, function (img) {
  // ...
}, null, { crossOrigin: 'anonymous' })
```

### Problema: Padrão está esticado
**Causa**: Dimensões do objeto muito grandes
**Solução**: Use `repeat` ou ajuste o tamanho da imagem

### Problema: Padrão não aparece ao exportar
**Causa**: Imagens externas não são embutidas no JSON
**Solução**: Converta para base64 antes de aplicar

---

## 🔗 Recursos Úteis

- 🖼️ **Texturas Gratuitas**: [Unsplash](https://unsplash.com/s/photos/texture)
- 🎨 **Padrões**: [Pexels](https://www.pexels.com/search/pattern/)
- 📚 **Fabric.js Docs**: [Pattern API](http://fabricjs.com/patterns)

---

## 📝 Resumo Rápido

| Método | Quando Usar | Facilidade |
|--------|-------------|------------|
| **Painel de Controles** | Edição visual e ajustes | ⭐⭐⭐⭐⭐ |
| **Menu de Contexto** | Acesso rápido | ⭐⭐⭐⭐ |
| **Código/Console** | Automação e scripts | ⭐⭐⭐ |

**Modo de Repetição Recomendado:**
- 🧱 Texturas → `repeat`
- 🖼️ Logos → `no-repeat`
- 📏 Banners → `repeat-x`
- 📐 Faixas → `repeat-y`
