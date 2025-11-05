import { GoogleGenAI } from '@google/genai'
import type { ColorConfig } from '@/components/gradient-control'

/**
 * Comando de design que a IA pode retornar
 */
export interface DesignCommand {
  type: 'background' | 'text' | 'shape' | 'image'
  action: string
  params: any
}

/**
 * Resultado do design gerado pela IA
 */
export interface DesignResult {
  commands: DesignCommand[]
  description: string
}

/**
 * Serviço para gerar comandos de design usando Gemini
 * Retorna instruções para usar as ferramentas existentes do Fabric.js
 */
export class DesignCommandService {
  private ai: GoogleGenAI
  private model: string

  constructor(apiKey?: string, model: string = 'gemini-2.0-flash-exp') {
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY

    if (!key) {
      throw new Error('VITE_GEMINI_API_KEY não encontrada nas variáveis de ambiente')
    }

    this.ai = new GoogleGenAI({ apiKey: key })
    this.model = model
  }

  /**
   * Gera comandos de design baseado na descrição do usuário
   */
  async generateDesign(description: string): Promise<DesignResult> {
    try {
      const prompt = this.buildPrompt(description)

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
      })

      const responseText = response.text
      const result = this.parseResponse(responseText)

      return result
    } catch (error) {
      console.error('Erro ao chamar Gemini API:', error)
      throw new Error(`Falha ao gerar design: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  /**
   * Constrói o prompt para o Gemini
   */
  private buildPrompt(description: string): string {
    return `Você é um assistente de design especializado em criar layouts visuais ORGANIZADOS e ESTRUTURADOS.

**CANVAS:**
- Tamanho: 600x600 pixels
- Origem (0,0) no canto superior esquerdo

**ELEMENTOS DISPONÍVEIS:**
- Textos (com fonte, tamanho, cor, posição x/y)
- Formas: retângulos, círculos, triângulos, linhas, estrelas, corações
- Imagens (via busca por keywords)
- Background: cor sólida, gradiente, imagem ou vídeo

**REGRAS DE LAYOUT (IMPORTANTE!):**
1. **Posicionamento estruturado**: Use um sistema de grid mental (top, middle, bottom) x (left, center, right)
2. **Elementos principais** (títulos):
   - Top center: left: 150-300, top: 50-100
   - Middle center: left: 150-300, top: 250-300
3. **Elementos secundários** (subtítulos, descrições):
   - Abaixo do título: top do título + 60-80
4. **Formas decorativas**:
   - Cantos: left < 100 ou left > 500
   - Bordas: top < 100 ou top > 500
5. **Margens**: Mantenha 30-50px das bordas para elementos principais
6. **Tamanhos de texto**:
   - Título principal: 48-72px
   - Subtítulo: 24-36px
   - Descrição: 16-20px

**FORMATO DE RESPOSTA:**
Responda APENAS com JSON no seguinte formato:

{
  "description": "breve descrição do layout criado",
  "commands": [
    {
      "type": "background",
      "action": "set_image",
      "params": {
        "keywords": ["natal", "festivo"]
      }
    },
    {
      "type": "text",
      "action": "add",
      "params": {
        "text": "FELIZ NATAL",
        "fontSize": 64,
        "fontFamily": "Poppins",
        "fontWeight": "bold",
        "color": "#ffffff",
        "left": 200,
        "top": 80,
        "width": 400
      }
    },
    {
      "type": "shape",
      "action": "add_rectangle",
      "params": {
        "color": "#ff0000",
        "width": 200,
        "height": 100,
        "left": 200,
        "top": 400
      }
    }
  ]
}

**TIPOS DE COMANDOS:**

1. Background:
   - type: "background", action: "set_solid", params: { color: "#hex" }
   - type: "background", action: "set_gradient", params: { gradient: { type: "linear", angle: 90, stops: [...] } }
   - type: "background", action: "set_image", params: { keywords: ["keyword1", "keyword2"] }
   - type: "background", action: "set_video", params: { keywords: ["keyword1", "keyword2"] }

2. Text (SEMPRE com left, top, width):
   - type: "text", action: "add", params: { text, fontSize, fontFamily, fontWeight, color, left, top, width }

3. Shapes (SEMPRE com left, top, width/height ou radius):
   - type: "shape", action: "add_rectangle", params: { color, width, height, left, top }
   - type: "shape", action: "add_circle", params: { color, radius, left, top }
   - type: "shape", action: "add_triangle", params: { color, left, top }
   - type: "shape", action: "add_star", params: { color, left, top }
   - type: "shape", action: "add_heart", params: { color, left, top }
   - type: "shape", action: "add_line", params: { color, left, top }

4. Images (com posição):
   - type: "image", action: "search", params: { keywords: ["keyword"], left, top, width, height }

**DESCRIÇÃO DO USUÁRIO:**
"${description}"

**RESPOSTA (apenas JSON com posicionamento ESTRUTURADO):**`
  }

  /**
   * Faz parsing da resposta do Gemini
   */
  private parseResponse(responseText: string): DesignResult {
    try {
      // Remove markdown code blocks se existirem
      let cleanText = responseText.trim()
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '')

      const result = JSON.parse(cleanText) as DesignResult

      if (!result.commands || !Array.isArray(result.commands)) {
        throw new Error('Resposta inválida: commands não é um array')
      }

      return result
    } catch (error) {
      console.error('Erro ao fazer parse da resposta:', error)
      console.error('Resposta original:', responseText)
      throw new Error('Falha ao processar resposta do Gemini. Resposta inválida.')
    }
  }
}

// Export singleton instance
let designCommandServiceInstance: DesignCommandService | null = null

/**
 * Retorna instância singleton do DesignCommandService
 */
export function getDesignCommandService(): DesignCommandService {
  if (!designCommandServiceInstance) {
    designCommandServiceInstance = new DesignCommandService()
  }
  return designCommandServiceInstance
}

/**
 * Reseta a instância (útil para testes)
 */
export function resetDesignCommandService(): void {
  designCommandServiceInstance = null
}
