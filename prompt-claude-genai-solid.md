# Prompt para Claude Code - Frontend com @google/genai (Novo SDK - 2025)

## Contexto
Você está desenvolvendo uma aplicação React/TypeScript com Fabric.js. Implemente geração de templates usando **@google/genai** (novo SDK Google - 2025), seguindo princípios **SOLID** e **código limpo**.

---

## Prompt para Claude Code

```
Você é um desenvolvedor experiente em React/TypeScript. Implemente uma feature de geração de templates Fabric.js chamando **@google/genai (novo SDK)** diretamente do frontend, seguindo SOLID principles.

## OBJETIVO:
1. Usuário descreve um design no ChatSidebar
2. Chamar Gemini 2.0 Flash via @google/genai
3. Gerar JSON do template Fabric.js
4. Carregar no canvas Fabric.js
5. Usuário pode editar

## STACK:
- React 18+
- TypeScript
- Fabric.js
- @google/genai (NOVO SDK - não usar @google/generative-ai!)

---

## ARQUITETURA (SOLID + Clean Code)

### 1. Types/Interfaces (types/templates.ts)

```typescript
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface FabricObject {
  id: string;
  type: 'circle' | 'text' | 'rect';
  left: number;
  top: number;
  fill?: string;
  stroke?: string | null;
  strokeWidth?: number;
  originX?: 'center' | 'left';
  originY?: 'center' | 'top';
  // Circle
  radius?: number;
  // Text
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'bold' | 'normal' | 'italic';
  textAlign?: 'center' | 'left' | 'right';
  // Rect
  width?: number;
  height?: number;
  // Shadow/Glow
  shadow?: ShadowConfig;
}

export interface ShadowConfig {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface TemplateJSON {
  canvas: CanvasConfig;
  objects: FabricObject[];
}
```

### 2. API Service (services/geminiService.ts)
**Separation of Concerns: API logic isolado**

```typescript
import { GoogleGenerativeAI } from '@google/genai';
import type { TemplateJSON } from '@/types/templates';

export class GeminiTemplateService {
  private client: GoogleGenerativeAI;
  private readonly model = 'gemini-2.0-flash';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('REACT_APP_GEMINI_API_KEY não configurada');
    }
    this.client = new GoogleGenerativeAI({ apiKey });
  }

  async generateTemplate(description: string): Promise<TemplateJSON> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const prompt = this.buildPrompt(description);

    try {
      const response = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });

      const jsonText = this.extractJson(response.response.text());
      return this.parseAndValidate(jsonText);
    } catch (error) {
      throw new Error(\`Erro ao gerar template: \${error instanceof Error ? error.message : 'Desconhecido'}\`);
    }
  }

  private buildPrompt(description: string): string {
    return \`Você é um especialista em Fabric.js e design gráfico.
Gere um JSON para o seguinte template de design:

"\${description}"

ESTRUTURA OBRIGATÓRIA (responda APENAS com JSON, sem markdown ou explicações):
{
  "canvas": {
    "width": <número>,
    "height": <número>,
    "backgroundColor": "<hex-color>"
  },
  "objects": [
    {
      "id": "<único>",
      "type": "circle|text|rect",
      "left": <número>,
      "top": <número>,
      "fill": "<hex-color ou transparent>",
      "stroke": "<hex-color ou null>",
      "strokeWidth": <número>,
      "originX": "center|left",
      "originY": "center|top",
      "radius": <número (só circle)>,
      "text": "<conteúdo (só text)>",
      "fontSize": <número (só text)>,
      "fontFamily": "Arial|Helvetica|Georgia",
      "fontWeight": "bold|normal",
      "width": <número (só rect)>,
      "height": <número (só rect)>,
      "shadow": {
        "color": "<hex-color>",
        "blur": <15-30>,
        "offsetX": 0,
        "offsetY": 0,
        "opacity": <0.7-1>
      }
    }
  ]
}

REGRAS:
✓ Cores em HEX (#RRGGBB)
✓ Canvas: 600x600 (quadrado) ou 1200x300 (banner)
✓ IDs únicos
✓ JSON 100% válido
✓ Sem trailing commas
✓ Sem markdown ou blocos de código\`;
  }

  private extractJson(text: string): string {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('JSON não encontrado na resposta');
    }
    return match[0];
  }

  private parseAndValidate(jsonText: string): TemplateJSON {
    try {
      const template = JSON.parse(jsonText);

      // Validações básicas
      if (!template.canvas || typeof template.canvas.width !== 'number') {
        throw new Error('Canvas inválido');
      }
      if (!Array.isArray(template.objects)) {
        throw new Error('Objects deve ser um array');
      }

      return template as TemplateJSON;
    } catch (error) {
      throw new Error(\`JSON inválido: \${error instanceof Error ? error.message : 'Parse error'}\`);
    }
  }
}
```

### 3. Hook (hooks/useTemplateGenerator.ts)
**Single Responsibility: gerenciar loading/error state**

```typescript
import { useState, useCallback } from 'react';
import { GeminiTemplateService } from '@/services/geminiService';
import type { TemplateJSON } from '@/types/templates';

export const useTemplateGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTemplate = useCallback(async (description: string): Promise<TemplateJSON> => {
    setIsGenerating(true);
    setError(null);

    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      const service = new GeminiTemplateService(apiKey!);
      return await service.generateTemplate(description);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { generateTemplate, isGenerating, error, clearError };
};
```

### 4. Fabric Canvas Loader (utils/fabricLoader.ts)
**Factory Pattern: criar objetos Fabric.js**

```typescript
import { fabric } from 'fabric';
import type { FabricObject, ShadowConfig } from '@/types/templates';

export class FabricObjectFactory {
  static createObject(objData: FabricObject): fabric.Object {
    switch (objData.type) {
      case 'circle':
        return this.createCircle(objData);
      case 'text':
        return this.createText(objData);
      case 'rect':
        return this.createRect(objData);
      default:
        throw new Error(\`Tipo desconhecido: \${objData.type}\`);
    }
  }

  private static createCircle(data: FabricObject): fabric.Circle {
    return new fabric.Circle({
      radius: data.radius || 50,
      fill: data.fill || 'transparent',
      stroke: data.stroke || null,
      strokeWidth: data.strokeWidth || 1,
      left: data.left || 0,
      top: data.top || 0,
      originX: (data.originX || 'center') as 'center' | 'left',
      originY: (data.originY || 'center') as 'center' | 'top',
      shadow: data.shadow ? this.createShadow(data.shadow) : undefined,
    });
  }

  private static createText(data: FabricObject): fabric.Text {
    return new fabric.Text(data.text || '', {
      fontSize: data.fontSize || 16,
      fontFamily: data.fontFamily || 'Arial',
      fontWeight: (data.fontWeight || 'normal') as 'bold' | 'normal' | 'italic',
      fill: data.fill || '#000000',
      textAlign: (data.textAlign || 'center') as 'center' | 'left' | 'right',
      left: data.left || 0,
      top: data.top || 0,
      originX: (data.originX || 'center') as 'center' | 'left',
      originY: (data.originY || 'center') as 'center' | 'top',
    });
  }

  private static createRect(data: FabricObject): fabric.Rect {
    return new fabric.Rect({
      width: data.width || 100,
      height: data.height || 100,
      fill: data.fill || 'transparent',
      stroke: data.stroke || null,
      strokeWidth: data.strokeWidth || 1,
      left: data.left || 0,
      top: data.top || 0,
      originX: (data.originX || 'center') as 'center' | 'left',
      originY: (data.originY || 'center') as 'center' | 'top',
      shadow: data.shadow ? this.createShadow(data.shadow) : undefined,
    });
  }

  private static createShadow(config: ShadowConfig): fabric.Shadow {
    return new fabric.Shadow({
      color: config.color,
      blur: config.blur,
      offsetX: config.offsetX,
      offsetY: config.offsetY,
      opacity: config.opacity,
    });
  }
}

export class CanvasLoader {
  static async loadTemplate(canvas: fabric.Canvas, template: any): Promise<void> {
    try {
      // Limpar canvas
      canvas.clear();

      // Atualizar dimensões
      canvas.setWidth(template.canvas.width);
      canvas.setHeight(template.canvas.height);

      // Atualizar background
      canvas.setBackgroundColor(template.canvas.backgroundColor, () => {
        canvas.renderAll();
      });

      // Carregar objetos
      for (const objData of template.objects) {
        const fabricObj = FabricObjectFactory.createObject(objData);
        canvas.add(fabricObj);
      }

      canvas.renderAll();
    } catch (error) {
      throw new Error(\`Erro ao carregar template: \${error instanceof Error ? error.message : 'Desconhecido'}\`);
    }
  }
}
```

### 5. Canvas Component (components/FabricCanvas.tsx)
**Composition: componente reutilizável**

```typescript
import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { CanvasLoader } from '@/utils/fabricLoader';
import type { TemplateJSON } from '@/types/templates';

interface FabricCanvasProps {
  templateData?: TemplateJSON;
  onError?: (error: string) => void;
}

export const FabricCanvas = ({ templateData, onError }: FabricCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Inicializar canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 600,
      backgroundColor: '#ffffff',
    });

    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, []);

  // Carregar template quando mudar
  useEffect(() => {
    if (!templateData || !fabricCanvasRef.current) return;

    CanvasLoader.loadTemplate(fabricCanvasRef.current, templateData)
      .catch(err => {
        onError?.(err instanceof Error ? err.message : 'Erro ao carregar');
      });
  }, [templateData, onError]);

  return <canvas ref={canvasRef} className="fabric-canvas" />;
};
```

### 6. ChatSidebar Integration (components/ChatSidebar.tsx)

```typescript
import { useTemplateGenerator } from '@/hooks/useTemplateGenerator';
import { useState } from 'react';
import type { TemplateJSON } from '@/types/templates';

interface ChatSidebarProps {
  onTemplateGenerated?: (template: TemplateJSON) => void;
}

export const ChatSidebar = ({ onTemplateGenerated }: ChatSidebarProps) => {
  const { generateTemplate, isGenerating, error, clearError } = useTemplateGenerator();
  const [input, setInput] = useState('');

  const handleSubmit = async () => {
    if (!input.trim()) return;

    try {
      clearError();
      
      // Detectar se é uma requisição de design
      if (this.isDesignRequest(input)) {
        const template = await generateTemplate(input);
        onTemplateGenerated?.(template);
        setInput('');
      }
    } catch (err) {
      // Erro já está no estado
    }
  };

  private isDesignRequest(text: string): boolean {
    const keywords = ['design', 'template', 'criar', 'gerar', 'banner', 'cartaz', 'promocao'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  return (
    <div className="chat-sidebar">
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Descreva o design..."
          disabled={isGenerating}
        />
        <button onClick={handleSubmit} disabled={isGenerating}>
          {isGenerating ? 'Gerando...' : 'Enviar'}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
          <button onClick={clearError}>Fechar</button>
        </div>
      )}
    </div>
  );
};
```

### 7. Main App Component (App.tsx)

```typescript
import { useState } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { FabricCanvas } from '@/components/FabricCanvas';
import type { TemplateJSON } from '@/types/templates';
import './App.css';

export default function App() {
  const [currentTemplate, setCurrentTemplate] = useState<TemplateJSON | undefined>();
  const [canvasError, setCanvasError] = useState<string | null>(null);

  return (
    <div className="editor-container">
      <aside className="sidebar">
        <ChatSidebar onTemplateGenerated={setCurrentTemplate} />
      </aside>
      
      <main className="canvas-area">
        {canvasError && (
          <div className="error-banner">{canvasError}</div>
        )}
        <FabricCanvas 
          templateData={currentTemplate}
          onError={setCanvasError}
        />
      </main>
    </div>
  );
}
```

---

## .env.local

```env
REACT_APP_GEMINI_API_KEY=sua_chave_aqui_sem_aspas
```

---

## package.json (dependencies)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "fabric": "^5.3.0",
    "@google/genai": "^0.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.3.1",
    "@types/node": "^20.10.0"
  }
}
```

---

## SOLID Principles Aplicados:

✅ **Single Responsibility**
- GeminiTemplateService: só API
- Hook: só state management
- FabricObjectFactory: só criar objetos
- CanvasLoader: só carregar no canvas

✅ **Open/Closed**
- FabricObjectFactory extensível para novos tipos
- Serviço agnóstico ao componente

✅ **Liskov Substitution**
- FabricObject interface clara
- Tipos genéricos reutilizáveis

✅ **Interface Segregation**
- Props interfaces pequenas e específicas
- Sem props desnecessárias

✅ **Dependency Inversion**
- Hook recebe apiKey via .env
- Componentes usam interfaces, não implementações

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── ChatSidebar.tsx
│   ├── FabricCanvas.tsx
│   └── App.tsx
├── hooks/
│   └── useTemplateGenerator.ts
├── services/
│   └── geminiService.ts
├── utils/
│   └── fabricLoader.ts
├── types/
│   └── templates.ts
└── .env.local
```

---

## Checklist:

- [ ] npm install @google/genai fabric
- [ ] Criar .env.local com chave Gemini
- [ ] Criar types/templates.ts
- [ ] Criar services/geminiService.ts
- [ ] Criar utils/fabricLoader.ts
- [ ] Criar hooks/useTemplateGenerator.ts
- [ ] Atualizar componentes
- [ ] Testar com descrição simples
- [ ] Testar error handling
- [ ] Adicionar .env.local ao .gitignore

COMECE PELOS TYPES E SERVICE, DEPOIS HOOK E COMPONENTES.
```

---

## Resumo de Mudanças (vs SDK antigo):

| Item | Antigo | Novo |
|------|--------|------|
| Package | `@google/generative-ai` | `@google/genai` |
| Init | `new GoogleGenerativeAI(key)` | `new GoogleGenerativeAI({ apiKey })` |
| Model | `gemini-pro` | `gemini-2.0-flash` |
| Call | `await model.generateContent(text)` | `await model.generateContent({ contents: [...] })` |
| Suporte | ❌ Descontinuado | ✅ Ativo |

---

## Diferenças SOLID:

Este prompt é diferente porque:
- Classe `GeminiTemplateService` isolada (SRP)
- Factory Pattern para objetos Fabric (SRP + extensível)
- Types bem definidos (ISP)
- Composição de componentes (DIP)
- Zero imports circulares
- 100% testável
- Pronto para migrar para Edge Functions