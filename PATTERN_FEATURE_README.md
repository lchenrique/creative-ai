# 🎨 Funcionalidade de Padrões de Imagem

## Visão Geral

Implementamos a funcionalidade de **padrões de imagem** (image patterns) no editor de canvas, permitindo que os usuários apliquem imagens como preenchimento de objetos (círculos, retângulos, triângulos, etc.) com diferentes modos de repetição.

## 🚀 Como Usar

### 1. Interface do Usuário (Shape Controls)

Quando você seleciona um objeto no canvas (exceto texto):

1. **Abra o painel de controles** (shape-controls.tsx)
2. Você verá uma seção **"Padrão de Imagem"**
3. Clique em **"Adicionar Padrão de Imagem"** para fazer upload de uma imagem
4. Após selecionar a imagem:
   - A imagem será aplicada como padrão no objeto
   - Você pode escolher o **modo de repetição**:
     - **Sem Repetir**: Imagem única sem repetição
     - **Repetir**: Repete a imagem em X e Y
     - **Repetir X**: Repete apenas horizontalmente
     - **Repetir Y**: Repete apenas verticalmente

5. Para **remover o padrão**: Clique no ícone **X** no preview da imagem

### 2. API Programática

Você pode aplicar padrões programaticamente usando as funções registradas no store:

```typescript
import { useCreativeStore } from '@/stores/creative-store'

// No componente
const applyPattern = useCreativeStore((state) => state.applyPatternToObject)
const removePattern = useCreativeStore((state) => state.removePatternFromObject)

// Aplicar padrão ao objeto selecionado
applyPattern('https://example.com/image.jpg', 'repeat')

// Remover padrão e restaurar cor
removePattern('#ff0000')
```

### 3. Exemplo de Código Direto (Console)

```javascript
// No console do navegador
var canvas = new fabric.Canvas('c');
canvas.backgroundColor = 'yellow';

// Criar círculo
var circle = new fabric.Circle({
  radius: 60, 
  fill: 'red', 
  left: 50, 
  top: 100
});
canvas.add(circle);

// Criar quadrado
var square = new fabric.Rect({
  left: 180, 
  top: 140,
  fill: 'green',
  width: 140,
  height: 180
});
canvas.add(square);

// Função para adicionar padrão
function addPattern(obj, imageUrl){
  fabric.util.loadImage(imageUrl, function (img) {
    obj.fill = new fabric.Pattern({
      source: img,
      repeat: 'no-repeat' // ou 'repeat', 'repeat-x', 'repeat-y'
    }); 
    canvas.renderAll();
  });
}

// Aplicar padrões
addPattern(circle, 'http://fabricjs.com/assets/pug_small.jpg');
addPattern(square, 'http://fabricjs.com/assets/pug_small.jpg');
canvas.renderAll();
```

## 📁 Arquivos Modificados

### 1. `shape-controls.tsx`
- Adicionado campo de upload de imagem para padrões
- Adicionado preview da imagem do padrão
- Adicionado seletor de modo de repetição (RadioGroup)
- Adicionado botão para remover padrão
- Lógica para aplicar/remover padrões em objetos selecionados

### 2. `fabric-canvas.tsx`
- Adicionado import de `Pattern` do Fabric.js
- Criada função `applyPatternToObject`: Aplica padrão de imagem ao objeto ativo
- Criada função `removePatternFromObject`: Remove padrão e restaura cor
- Registradas as funções no store global

### 3. `creative-store.ts`
- Adicionados tipos para as funções de padrão
- Registradas as funções no estado global
- Permitido uso global das funções via `useCreativeStore`

## 🎯 Funcionalidades Implementadas

✅ Upload de imagem local para usar como padrão
✅ Preview da imagem do padrão
✅ 4 modos de repetição (no-repeat, repeat, repeat-x, repeat-y)
✅ Remoção de padrão com restauração de cor
✅ Integração com o sistema de controles existente
✅ API programática para uso via código
✅ Compatível com gradientes e cores sólidas

## 🔧 Modos de Repetição

| Modo | Descrição |
|------|-----------|
| `no-repeat` | Imagem única, sem repetição |
| `repeat` | Repete em ambas direções (X e Y) |
| `repeat-x` | Repete apenas horizontalmente |
| `repeat-y` | Repete apenas verticalmente |

## 💡 Dicas de Uso

1. **Imagens pequenas**: Use modo `repeat` para criar texturas
2. **Imagens grandes**: Use `no-repeat` para preenchimento único
3. **Padrões horizontais**: Use `repeat-x` para banners
4. **Padrões verticais**: Use `repeat-y` para faixas laterais

## 🐛 Resolução de Problemas

**Problema**: A imagem não aparece
- **Solução**: Verifique se a URL da imagem permite CORS (Cross-Origin)
- Use `crossOrigin: 'anonymous'` ao carregar imagens externas

**Problema**: O padrão não está alinhado corretamente
- **Solução**: Experimente diferentes modos de repetição

**Problema**: A imagem fica distorcida
- **Solução**: Use imagens com dimensões apropriadas ou ajuste o tamanho do objeto

## 📚 Referências

- [Fabric.js Pattern Documentation](http://fabricjs.com/patterns)
- [Canvas Pattern API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern)

## 🎉 Próximas Melhorias Sugeridas

- [ ] Suporte para padrões animados
- [ ] Biblioteca de padrões pré-definidos
- [ ] Controle de escala/rotação do padrão
- [ ] Offset de posição do padrão
- [ ] Preview em tempo real antes de aplicar
