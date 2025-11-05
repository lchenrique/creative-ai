# 🎨 Sistema de Templates com IA Gemini

Sistema completo de geração de templates visuais usando Google Gemini AI integrado ao Creative AI.

## ✅ O que foi implementado

### **Arquivos criados (10 novos):**

1. **[src/types/templates.ts](src/types/templates.ts)** - Interfaces TypeScript
2. **[src/data/baseTemplates.ts](src/data/baseTemplates.ts)** - 3 templates base:
   - **Perfil Básico** (540×1000) - Stories, posts verticais
   - **Comunicado** (1080×1080) - Posts quadrados
   - **Fitness** (1080×1200) - Posts de fitness/motivação
3. **[src/services/geminiService.ts](src/services/geminiService.ts)** - Integração Gemini AI
4. **[src/services/templateManager.ts](src/services/templateManager.ts)** - CRUD localStorage
5. **[src/services/imageSearchService.ts](src/services/imageSearchService.ts)** - Busca Unsplash/Pixabay
6. **[src/lib/injectImagesIntoTemplate.ts](src/lib/injectImagesIntoTemplate.ts)** - Injeção de imagens
7. **[src/hooks/useTemplateModifier.ts](src/hooks/useTemplateModifier.ts)** - Hook Gemini
8. **[src/hooks/useTemplateManager.ts](src/hooks/useTemplateManager.ts)** - Hook CRUD
9. **[src/components/template-panel.tsx](src/components/template-panel.tsx)** - Painel de geração
10. **[src/components/template-list.tsx](src/components/template-list.tsx)** - Lista de templates

### **Arquivos modificados (3):**

11. **[src/components/chat-sidebar.tsx](src/components/chat-sidebar.tsx)** - ✨ **Integrado com Gemini!**
12. **[src/stores/creative-store.ts](src/stores/creative-store.ts)** - Estado de templates
13. **[.env](.env)** - Variável `VITE_GEMINI_API_KEY`

### **Dependência instalada:**
```bash
pnpm install @google/genai  # ✅ v1.28.0
```

---

## 🚀 Como usar

### **1. Configure a API Key do Gemini**

Obtenha sua chave em: https://aistudio.google.com/apikey

```bash
# No arquivo .env, substitua:
VITE_GEMINI_API_KEY=sua_chave_api_aqui
```

### **2. Use o ChatSidebar (Já integrado!)**

O ChatSidebar agora tem integração completa com Gemini:

**Fluxo de uso:**
1. Abra a aplicação
2. No chat lateral, selecione um **template base** (Perfil/Comunicado/Fitness)
3. Digite sua descrição no chat:
   ```
   "tema natal, cores vermelhas e verdes, título Feliz Natal"
   "black friday, escuro e roxo, até 70% off"
   "fitness motivacional, cores intensas"
   ```
4. Pressione Enter
5. ✨ **Gemini gera o template** → Busca imagens → Injeta URLs → Carrega no canvas
6. Edite manualmente no Fabric.js

### **3. Integração com a página principal**

Se ainda não estiver integrado, adicione o callback no componente pai:

```tsx
import { ChatSidebar } from '@/components/chat-sidebar'

<ChatSidebar
  artConfig={artConfig}
  setArtConfig={setArtConfig}
  onTemplateGenerated={(template) => {
    // Carrega template no FabricCanvas
    // Exemplo: loadTemplateIntoCanvas(template)
  }}
/>
```

---

## 🎯 Fluxo Completo

```
┌─────────────────────────────────────────────────────┐
│          USUÁRIO NO CHAT                            │
│  "tema natal, cores vermelhas, título Feliz Natal"  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         GEMINI AI (geminiService.ts)                │
│  - Recebe template base JSON                        │
│  - Modifica textos, cores, fontes                   │
│  - Extrai keywords para imagens                     │
│  - Retorna JSON modificado + keywords               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│    BUSCA IMAGENS (imageSearchService.ts)            │
│  - Usa keywords extraídas                           │
│  - Tenta Unsplash → Fallback Pixabay                │
│  - Retorna URLs de imagens                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  INJETA IMAGENS (injectImagesIntoTemplate.ts)       │
│  - Substitui placeholders por URLs reais            │
│  - Converte 'rect' → 'image' com src               │
│  - Retorna template final pronto                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         FABRIC.JS CANVAS                            │
│  - Renderiza template JSON                          │
│  - Usuário edita (drag, resize, cores)             │
│  - Salva como template customizado                 │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Estrutura de arquivos

```
src/
├── types/
│   └── templates.ts              # Interfaces TypeScript
├── data/
│   └── baseTemplates.ts          # 3 templates base
├── services/                     # 🆕 Novo diretório
│   ├── geminiService.ts          # Gemini AI
│   ├── templateManager.ts        # CRUD localStorage
│   └── imageSearchService.ts     # Unsplash + Pixabay
├── lib/
│   └── injectImagesIntoTemplate.ts  # Injeta URLs
├── hooks/
│   ├── useTemplateModifier.ts    # Hook Gemini
│   └── useTemplateManager.ts     # Hook CRUD
├── components/
│   ├── chat-sidebar.tsx          # ✨ Integrado com IA
│   ├── template-panel.tsx        # (Standalone - opcional)
│   └── template-list.tsx         # (Standalone - opcional)
└── stores/
    └── creative-store.ts         # Estado estendido
```

---

## 🧪 Testando o sistema

### **Teste 1: Geração básica**
```
Chat: "tema minimalista, cores claras, título 'Bem-vindo'"
Resultado: Template com cores suaves, tipografia clean
```

### **Teste 2: Com busca de imagens**
```
Chat: "praia, verão, cores azul e amarelo"
Resultado: Template com imagens de praia do Unsplash/Pixabay
```

### **Teste 3: Tema específico**
```
Chat: "black friday, roxo escuro, 70% off, urgente"
Resultado: Template dark com gradiente roxo, textos impactantes
```

---

## 🔧 Componentes Standalone (Opcionais)

Se preferir usar os componentes separadamente:

```tsx
import { TemplatePanel } from '@/components/template-panel'
import { TemplateList } from '@/components/template-list'

// Painel de geração
<TemplatePanel
  onTemplateGenerated={(template) => {
    console.log('Template gerado:', template)
    // Carregar no canvas
  }}
  onLoadTemplate={(template) => {
    console.log('Template base carregado:', template)
  }}
/>

// Lista de templates salvos
<TemplateList
  onLoadTemplate={(template) => {
    console.log('Template carregado:', template)
    // Carregar no canvas
  }}
/>
```

---

## ⚙️ Configuração avançada

### **Trocar modelo do Gemini**

No arquivo `src/services/geminiService.ts`:

```typescript
constructor(apiKey?: string, model: string = 'gemini-2.0-flash-exp') {
  // Modelos disponíveis:
  // - gemini-2.0-flash-exp (padrão, rápido)
  // - gemini-2.5-flash
  // - gemini-pro
}
```

### **Ajustar busca de imagens**

No arquivo `src/services/imageSearchService.ts`:

```typescript
// Aumentar limite de imagens
async searchImages(keywords: string[], limit: number = 5)

// Trocar ordem (Pixabay primeiro)
// Inverta a ordem dos if/else nos métodos
```

### **Customizar templates base**

Edite `src/data/baseTemplates.ts` para adicionar novos templates:

```typescript
export const meuTemplate: FabricTemplate = {
  id: 'meu-template',
  name: 'Meu Template',
  description: 'Descrição...',
  canvas: { width: 1080, height: 1080, backgroundColor: '#fff' },
  objects: [/* seus objetos */]
}
```

---

## 🐛 Troubleshooting

### **Erro: "VITE_GEMINI_API_KEY não encontrada"**
- Configure a chave no arquivo `.env`
- Reinicie o servidor de desenvolvimento

### **Erro: "Falha ao gerar template"**
- Verifique se a API Key do Gemini é válida
- Confirme conexão com internet
- Veja console para detalhes do erro

### **Imagens não carregam**
- Verifique API Keys: `VITE_UNSPLASH_ACCESS_KEY` e `VITE_PIXABAY_API_KEY`
- Ambas devem estar no `.env`
- Unsplash é tentado primeiro, Pixabay é fallback

### **Template não carrega no canvas**
- Implemente callback `onTemplateGenerated` na página
- Conecte com método de carregamento do FabricCanvas
- Use `loadTemplateIntoCanvas` do store

---

## 📚 Referências

- **Gemini AI:** https://ai.google.dev/
- **Fabric.js:** http://fabricjs.com/docs/
- **Unsplash API:** https://unsplash.com/developers
- **Pixabay API:** https://pixabay.com/api/docs/

---

## 🎉 Próximos passos

1. **Configurar API Key** do Gemini ✅
2. **Testar geração** no ChatSidebar ✅
3. **Conectar canvas** com callback `onTemplateGenerated`
4. **Implementar salvamento** de templates customizados
5. **Adicionar thumbnails** para preview de templates

---

**Feito com ❤️ usando Gemini AI + Fabric.js + React**
