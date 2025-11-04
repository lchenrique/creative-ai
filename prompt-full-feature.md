# Prompt Completo para Claude Code - Sistema de Templates com Gemini e Imagens

## Contexto

Você é um desenvolvedor experiente em React, TypeScript e Fabric.js. Preciso que crie um sistema completo que:

1. **Carregue templates Fabric.js pré-definidos** com layouts profissionais
2. **Use Gemini AI (@google/genai)** para modificar esses templates (textos, cores, imagens)
3. **Integre APIs Pixabay e Unsplash** para buscar imagens automaticamente
4. **Permita salvar/carregar templates** em localStorage ou Supabase
5. **Permita edição manual** dos designs no canvas

---

## Especificações Técnicas

### Stack:
- React 18+
- TypeScript
- Fabric.js 5.x
- @google/genai (novo SDK)
- Pixabay API e Unsplash API (você já tem os hooks: `usePixabayImages` e `useUnsplashImages`)

### Você já tem:
- Hooks `usePixabayImages` e `useUnsplashImages` funcionando
- 3 templates base em JSON: Perfil Básico, Comunicado Importante, Shape Fitness

---

## Features a Implementar

### 1. Sistema de Gerenciamento de Templates

**Arquivo: `src/services/templateManager.ts`**

- Função para carregar template base (template1, template2, template3)
- Função para salvar template em localStorage com ID único
- Função para listar todos os templates salvos
- Função para deletar template
- Função para duplicar template

```typescript
interface SavedTemplate {
  id: string;
  name: string;
  templateBase: 'perfil' | 'comunicado' | 'fitness';
  json: any;
  createdAt: Date;
  lastModified: Date;
}
```

---

### 2. Hook para Modificar Templates com Gemini

**Arquivo: `src/hooks/useTemplateModifier.ts`**

- Receba um template JSON + descrição do usuário (ex: "Mude o texto para Promo de Verão, use cores quentes, adicione imagens de praia")
- Chame Gemini AI para:
  1. Analisar o template JSON
  2. Gerar modificações (novos textos, cores, dimensões de elementos)
  3. Retornar JSON modificado
- Manipule o JSON para manter a estrutura válida
- Controle de estado: loading, error, result

**Prompt para Gemini dentro do hook:**

```
Você é um especialista em design e JSON. Você vai receber um template Fabric.js e uma descrição de modificação.

Seu trabalho é analisar o JSON do template e modificar APENAS os valores específicos conforme a descrição, mantendo a estrutura intacta.

Modifique:
- "text" nos objetos tipo text (novos textos)
- "fill" para cores (#RRGGBB)
- "fontSize" se necessário aumentar/diminuir
- "backgroundColor" do canvas

Responda APENAS com o JSON modificado, sem explicações.

Template atual:
[JSON]

Modificações solicitadas:
[USER_DESCRIPTION]

Retorne o JSON modificado:
```

---

### 3. Integração com Pixabay/Unsplash para Buscar Imagens

**Arquivo: `src/services/imageSearchService.ts`**

- Receba uma descrição de imagem (extraída do template ou do prompt do usuário)
- Use os hooks `usePixabayImages` e `useUnsplashImages` para buscar
- Priorizar Unsplash > Pixabay (qualidade)
- Retornar array de URLs de imagens
- Selecionar automaticamente a melhor imagem (primeira resultado)

```typescript
async function getImageUrlForTemplate(keywords: string): Promise<string> {
  // 1. Tentar Unsplash primeiro
  // 2. Se falhar ou sem resultados, usar Pixabay
  // 3. Retornar URL da imagem de melhor qualidade
}
```

---

### 4. Função para Injetar Imagens no Template

**Arquivo: `src/utils/injectImagesIntoTemplate.ts`**

- Receba um template JSON com placeholders para imagens
- Receba array de URLs de imagens
- Localize os objetos tipo "rect" que servem como placeholders (identificar por ID como "image-*")
- Mude o tipo de "rect" para "image" e adicione propriedade "src" com URL
- Mantenha posicionamento e dimensões

```typescript
function injectImagesIntoTemplate(
  template: any,
  imageUrls: string[]
): any {
  // Encontrar placeholders de imagem
  // Injetar URLs
  // Retornar template modificado
}
```

---

### 5. Componente React para Editor

**Arquivo: `src/components/TemplateEditor.tsx`**

Funcionalidades:

- **Seletor de Template Base** (dropdown: Perfil, Comunicado, Fitness)
- **Campo de entrada** para descrição do design (ex: "Promo de verão com imagens de praia, cores quentes")
- **Botão "Gerar Design"** que:
  1. Chama Gemini para modificar o template
  2. Busca imagens (Unsplash/Pixabay)
  3. Injeta imagens no template
  4. Carrega no Fabric.js
- **Canvas Fabric.js** para visualizar e editar
- **Botão "Salvar"** para guardar em localStorage
- **Lista de Salvos** para carregar anteriores
- **Loading/Error states** com feedback visual

---

### 6. Componente Fabric.js Canvas

**Arquivo: `src/components/FabricCanvas.tsx`**

- Renderize o JSON do template
- Permita edição: arrastar, redimensionar, editar texto, mudar cores
- Botões para: Resetar, Exportar JSON, Baixar como imagem
- Sincronize alterações com estado

---

### 7. Integração no ChatSidebar (Existente)

**Modifique: `src/components/ChatSidebar.tsx`**

- Detecte quando o usuário envia uma mensagem sobre design
- Capture a descrição
- Chame `useTemplateModifier` com a descrição
- Passe o resultado para o `TemplateEditor`

---

## Fluxo Completo

```
Usuário descreve design no chat
    ↓
ChatSidebar detecta e captura descrição
    ↓
useTemplateModifier → Gemini modifica template base
    ↓
imageSearchService → busca imagens (Pixabay/Unsplash)
    ↓
injectImagesIntoTemplate → injeta URLs no JSON
    ↓
FabricCanvas renderiza resultado
    ↓
Usuário edita manualmente (opcional)
    ↓
Botão Salvar → localStorage
```

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── ChatSidebar.tsx
│   ├── TemplateEditor.tsx
│   ├── FabricCanvas.tsx
│   └── TemplateList.tsx (lista salvos)
├── hooks/
│   ├── useTemplateModifier.ts
│   ├── usePixabayImages.ts (já existe)
│   └── useUnsplashImages.ts (já existe)
├── services/
│   ├── templateManager.ts
│   ├── imageSearchService.ts
│   └── geminiService.ts (adaptar do anterior)
├── utils/
│   ├── injectImagesIntoTemplate.ts
│   ├── templateConstants.ts (3 templates base)
│   └── fabricLoader.ts (do anterior)
├── types/
│   ├── templates.ts
│   └── images.ts
└── App.tsx
```

---

## Interfaces TypeScript

```typescript
// types/templates.ts
interface TemplateBase {
  id: 'perfil' | 'comunicado' | 'fitness';
  name: string;
  width: number;
  height: number;
  json: any;
}

interface SavedTemplate {
  id: string;
  name: string;
  templateBase: 'perfil' | 'comunicado' | 'fitness';
  json: any;
  createdAt: Date;
  modifiedAt: Date;
}

interface TemplateModificationRequest {
  templateId: 'perfil' | 'comunicado' | 'fitness';
  description: string;
}

interface TemplateModificationResult {
  json: any;
  imageKeywords: string[];
}
```

---

## .env.local

```
VITE_GEMINI_API_KEY=sua_chave_aqui
VITE_PIXABAY_API_KEY=sua_chave
VITE_UNSPLASH_ACCESS_KEY=sua_chave
```

---

## Checklist

- [ ] Criar `templateManager.ts` com CRUD de templates
- [ ] Criar `useTemplateModifier` com chamada Gemini
- [ ] Criar `imageSearchService` com Pixabay + Unsplash
- [ ] Criar `injectImagesIntoTemplate` função
- [ ] Criar `TemplateEditor.tsx` com UI completa
- [ ] Atualizar `FabricCanvas.tsx` para suportar edição
- [ ] Criar `TemplateList.tsx` para salvos
- [ ] Integrar com `ChatSidebar`
- [ ] Testar fluxo completo
- [ ] Testes com 3 templates base
- [ ] Tratamento de erros robusto
- [ ] Loading states e feedback visual

---

## Observações Importantes

1. **Gemini vs Qualidade**: O Gemini pode gerar JSONs não-perfeitamente válidos. Sempre faça `JSON.parse()` com try-catch e fallback.

2. **Imagens**: Priorize URLs de alta qualidade. Unsplash tem melhor qualidade, Pixabay é backup.

3. **Performance**: Cache de imagens para evitar requisições duplicadas.

4. **Salvamento**: Use localStorage por enquanto, depois migrá para Supabase.

5. **Edição**: Fabric.js permite edição muito bem, aproveite isso.

---

## Dicas de Implementação

- Comece pelo `templateManager` e `FabricCanvas`
- Depois implemente `useTemplateModifier` com Gemini
- Depois `imageSearchService`
- Por último, a integração completa

Boa sorte! 🚀