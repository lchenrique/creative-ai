# 🎭 Sistema de Clip Groups - Documentação Completa

## 🎯 Visão Geral

O **Clip Group** é um sistema avançado que permite criar **containers com máscara de recorte**, onde você pode:

1. ✅ **Converter qualquer shape** em um container (Clip Group)
2. ✅ **Entrar no modo de edição** para manipular o conteúdo
3. ✅ **Adicionar qualquer objeto** dentro (textos, imagens, shapes, etc.)
4. ✅ **Mover, escalar e rotacionar** objetos dentro do clip
5. ✅ **Botão para sair** do modo de edição
6. ✅ **Mover o clip move tudo** que está dentro
7. ✅ **Adicionar/remover** objetos livremente
8. ✅ **Converter de volta** para grupo normal

## 🚀 Como Funciona

### Conceito Fundamental

Um **Clip Group** é um **Group** do Fabric.js com uma propriedade especial `clipPath`:

```typescript
const clipGroup = new Group([...objects], {
  clipPath: shape, // O shape define a área visível
})
```

**Resultado**: Apenas a parte dos objetos que está dentro do shape fica visível!

## 📖 Guia de Uso Passo a Passo

### 1️⃣ Criar um Clip Group

**Opção A: Via Interface**
1. Adicione um shape (círculo, retângulo, triângulo, etc.)
2. Selecione o shape
3. No painel de controles, procure **"Clip Group (Container com Máscara)"**
4. Clique em **"Converter em Clip Group"**
5. ✅ Pronto! O shape agora é um container

**Opção B: Via Código**
```typescript
const convertToClipGroup = useCreativeStore((state) => state.convertToClipGroup)
const clipGroup = await convertToClipGroup()
```

### 2️⃣ Entrar no Modo de Edição

**Opção A: Via Interface**
1. Selecione o Clip Group
2. Clique em **"Editar Conteúdo do Clip"**
3. 🎨 Uma barra aparece no topo indicando o modo de edição

**Opção B: Via Código**
```typescript
const enterEditMode = useCreativeStore((state) => state.enterClipGroupEditMode)
enterEditMode()
```

### 3️⃣ Adicionar Objetos ao Clip

**Quando estiver no modo de edição:**

1. **Adicione objetos normalmente** (botões de formas, upload de imagem, etc.)
2. Os objetos serão adicionados ao Clip Group automaticamente
3. Apenas a parte visível dentro da máscara aparecerá

**Via Código:**
```typescript
const addToClip = useCreativeStore((state) => state.addToClipGroup)

// Criar um objeto
const circle = new fabric.Circle({
  radius: 50,
  fill: 'red',
  left: 100,
  top: 100
})

// Adicionar ao clip group selecionado
addToClip(circle)
```

### 4️⃣ Manipular Objetos Dentro do Clip

Quando em modo de edição:
- ✅ **Mova** objetos arrastando
- ✅ **Rotacione** usando os controles
- ✅ **Escale** arrastando os cantos
- ✅ **Delete** selecionando e pressionando Delete
- ✅ **Edite propriedades** normalmente

### 5️⃣ Sair do Modo de Edição

**Opção A: Barra de Topo**
1. Clique em **"Sair do Modo de Edição"** na barra que aparece no topo

**Opção B: Via Código**
```typescript
const exitEditMode = useCreativeStore((state) => state.exitClipGroupEditMode)
exitEditMode()
```

### 6️⃣ Remover Objeto do Clip

**Via Código:**
```typescript
const removeFromClip = useCreativeStore((state) => state.removeFromClipGroup)

// Selecione o objeto dentro do clip
const object = canvas.getActiveObject()

// Remova do clip (ele volta para o canvas principal)
removeFromClip(object)
```

### 7️⃣ Converter de Volta para Normal

**Via Interface:**
1. Selecione o Clip Group
2. Clique em **"Remover Máscara (Tornar Grupo Normal)"**
3. O clipPath é removido e vira um grupo normal

**Via Código:**
```typescript
const convertToNormal = useCreativeStore((state) => state.convertClipGroupToNormal)
convertToNormal()
```

## 🎨 Exemplos Práticos

### Exemplo 1: Card com Foto de Perfil

```typescript
// 1. Criar círculo
const circle = new fabric.Circle({
  radius: 100,
  left: 200,
  top: 200,
  fill: 'gray'
})
canvas.add(circle)

// 2. Converter em Clip Group
const clipGroup = await convertToClipGroup()

// 3. Entrar no modo de edição
enterClipGroupEditMode()

// 4. Adicionar imagem
const img = await fabric.Image.fromURL('photo.jpg')
img.set({ left: 150, top: 150 })
addToClipGroup(img)

// 5. Adicionar texto
const text = new fabric.Textbox('João Silva', {
  left: 180,
  top: 320,
  fontSize: 20
})
addToClipGroup(text)

// 6. Sair do modo de edição
exitClipGroupEditMode()

// Resultado: Card com foto circular e nome!
```

### Exemplo 2: Banner com Múltiplos Elementos

```typescript
// 1. Criar retângulo
const rect = new fabric.Rect({
  width: 600,
  height: 300,
  left: 100,
  top: 100
})
canvas.add(rect)

// 2. Converter em Clip Group
await convertToClipGroup()

// 3. Entrar em modo de edição
enterClipGroupEditMode()

// 4. Adicionar fundo
const bgImage = await fabric.Image.fromURL('background.jpg')
addToClipGroup(bgImage)

// 5. Adicionar título
const title = new fabric.Textbox('PROMOÇÃO', {
  fontSize: 60,
  fontWeight: 'bold',
  fill: 'white'
})
addToClipGroup(title)

// 6. Adicionar logo
const logo = await fabric.Image.fromURL('logo.png')
addToClipGroup(logo)

// 7. Sair
exitClipGroupEditMode()

// Resultado: Banner completo recortado!
```

### Exemplo 3: Ícone Complexo em Forma Customizada

```typescript
// 1. Criar estrela
const star = new fabric.Polygon(starPoints, {
  fill: 'yellow',
  left: 250,
  top: 250
})
canvas.add(star)

// 2. Converter
await convertToClipGroup()

// 3. Editar
enterClipGroupEditMode()

// 4. Adicionar gradiente de fundo
const bgRect = new fabric.Rect({
  width: 200,
  height: 200,
  fill: new fabric.Gradient({...})
})
addToClipGroup(bgRect)

// 5. Adicionar ícone
const icon = new fabric.Circle({
  radius: 30,
  fill: 'white'
})
addToClipGroup(icon)

// 6. Sair
exitClipGroupEditMode()

// Resultado: Ícone em forma de estrela!
```

## 🔧 API Completa

### Funções Disponíveis

```typescript
// Criar Clip Group
const convertToClipGroup: () => Promise<Group | null>

// Entrar no modo de edição
const enterClipGroupEditMode: () => void

// Sair do modo de edição
const exitClipGroupEditMode: () => void

// Adicionar objeto ao clip
const addToClipGroup: (object: FabricObject) => void

// Remover objeto do clip
const removeFromClipGroup: (object: FabricObject) => void

// Converter para grupo normal
const convertClipGroupToNormal: () => void
```

### Uso no Componente

```typescript
import { useCreativeStore } from '@/stores/creative-store'

function MyComponent() {
  const convertToClipGroup = useCreativeStore((state) => state.convertToClipGroup)
  const enterEditMode = useCreativeStore((state) => state.enterClipGroupEditMode)
  const exitEditMode = useCreativeStore((state) => state.exitClipGroupEditMode)
  const addToClip = useCreativeStore((state) => state.addToClipGroup)
  const removeFromClip = useCreativeStore((state) => state.removeFromClipGroup)
  const convertToNormal = useCreativeStore((state) => state.convertClipGroupToNormal)
  
  // Usar as funções...
}
```

## 🎭 Comportamento do Clip Group

### Quando em Modo Normal (Fora de Edição)

- ✅ Move como um único objeto
- ✅ Rotaciona tudo junto
- ✅ Escala tudo proporcionalmente
- ✅ A máscara é aplicada visualmente
- ❌ Não pode selecionar objetos internos

### Quando em Modo de Edição

- ✅ Pode selecionar objetos individuais
- ✅ Pode mover objetos independentemente
- ✅ Pode adicionar novos objetos
- ✅ Pode remover objetos
- ✅ Pode editar propriedades
- ⚠️ O grupo em si não pode ser movido

## 💡 Dicas e Truques

### 1. Posicionamento Relativo

Objetos dentro do clip usam coordenadas **relativas ao grupo**:

```typescript
// Centralizar objeto no clip
const clipCenter = {
  x: clipGroup.width / 2,
  y: clipGroup.height / 2
}

object.set({
  left: clipCenter.x - object.width / 2,
  top: clipCenter.y - object.height / 2
})
```

### 2. Múltiplos Clips

Você pode ter vários Clip Groups no mesmo canvas:

```typescript
// Clip 1: Foto de perfil
const clip1 = await convertToClipGroup() // círculo

// Clip 2: Banner
// ... criar outro shape
const clip2 = await convertToClipGroup() // retângulo

// Cada um é independente!
```

### 3. Clips Aninhados

⚠️ **Atenção**: Clips dentro de clips podem ter comportamento inesperado. Recomendamos evitar.

### 4. Performance

Para muitos objetos dentro de um clip:
- Use `clipGroup.set('cacheProperties', [...])` para otimizar
- Considere cachear o grupo: `clipGroup.set('objectCaching', true)`

## 🐛 Solução de Problemas

### Problema: Objetos não aparecem dentro do clip

**Causa**: Objetos estão fora da área da máscara

**Solução**:
```typescript
// Verificar limites do clip
console.log(clipGroup.width, clipGroup.height)

// Reposicionar objeto
object.set({ left: 0, top: 0 })
```

### Problema: Não consigo editar o clip

**Causa**: Não está em modo de edição

**Solução**:
```typescript
enterClipGroupEditMode()
```

### Problema: Clip não move tudo junto

**Causa**: Modo de edição ainda ativo

**Solução**:
```typescript
exitClipGroupEditMode()
```

### Problema: Máscara não funciona

**Causa**: ClipPath foi removido acidentalmente

**Solução**:
```typescript
// Recriar clipPath
const shape = await originalShape.clone()
clipGroup.set('clipPath', shape)
```

## 📊 Estrutura Interna

Um Clip Group tem esta estrutura:

```javascript
{
  type: 'group',
  _isClipGroup: true, // Marca como Clip Group
  _clipShape: Shape, // Shape original usado como máscara
  _originalType: 'circle', // Tipo do shape original
  _isClipGroupEditMode: false, // Se está em modo de edição
  clipPath: Shape, // A máscara visual
  _objects: [...], // Objetos dentro do clip
  // ... outras propriedades do Group
}
```

## 🎯 Casos de Uso

1. **Cartões de Perfil**: Foto + nome + info dentro de um shape
2. **Banners**: Múltiplos elementos em forma retangular
3. **Logos Complexos**: Ícones com várias camadas em forma customizada
4. **Interfaces**: Componentes com máscara de recorte
5. **Arte Generativa**: Composições complexas mascaradas
6. **Thumbnails**: Previews com formato específico
7. **Badges**: Ícones arredondados com conteúdo

## 🚀 Próximos Passos

- [ ] Arrastar objetos de fora para dentro do clip (drag & drop)
- [ ] Hierarquia visual dos clips
- [ ] Templates de clips pré-definidos
- [ ] Exportar/importar clips
- [ ] Animações dentro do clip
- [ ] Filtros e efeitos no clip inteiro
- [ ] Edição de múltiplos clips simultaneamente

---

## ✨ Resumo Rápido

| Ação | Como Fazer |
|------|------------|
| Criar Clip Group | Selecione shape → "Converter em Clip Group" |
| Editar Clip | "Editar Conteúdo do Clip" |
| Adicionar Objeto | Modo de edição → Adicione normalmente |
| Sair de Edição | Barra no topo → "Sair do Modo de Edição" |
| Remover Máscara | "Remover Máscara (Tornar Grupo Normal)" |
| Mover Clip | Arraste normalmente (fora do modo de edição) |

**Clip Groups = Containers Poderosos com Máscara de Recorte! 🎭**
