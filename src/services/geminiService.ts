import { GoogleGenAI } from '@google/genai'
import { FabricTemplate, TemplateModificationResult } from '@/types/templates'

/**
 * Serviço para integração com Google Gemini AI
 * Responsável por modificar templates baseado em descrições do usuário
 */
export class GeminiService {
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
   * Modifica um template baseado na descrição do usuário
   * @param templateJson Template original em JSON
   * @param description Descrição do usuário (ex: "tema natal, cores vermelhas")
   * @returns Template modificado + keywords para busca de imagens
   */
  async modifyTemplate(
    templateJson: FabricTemplate,
    description: string
  ): Promise<TemplateModificationResult> {
    try {
      const prompt = this.buildPrompt(templateJson, description)

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
      })

      const responseText = response.text

      // Extrai JSON e keywords da resposta
      const result = this.parseResponse(responseText)

      return result
    } catch (error) {
      console.error('Erro ao chamar Gemini API:', error)
      throw new Error(`Falha ao modificar template: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  /**
   * Constrói o prompt para o Gemini
   */
  private buildPrompt(templateJson: FabricTemplate, description: string): string {
    return `Você é um assistente de design especializado em modificar templates visuais do Fabric.js.

Receba um template em formato JSON e a descrição do usuário. Modifique APENAS os valores (textos, cores, fontSize, fontWeight, backgroundColor, etc) de acordo com a descrição.

**REGRAS IMPORTANTES:**
1. Responda APENAS com JSON válido, sem explicações, markdown ou comentários
2. Mantenha a estrutura do template intacta
3. Modifique apenas: texts (text), cores (fill, backgroundColor, stroke), tamanhos (fontSize, width, height), fontes (fontFamily, fontWeight)
4. NÃO modifique: posições (left, top), IDs (id), tipos (type), estrutura de objetos
5. Use cores em formato hexadecimal (#RRGGBB) ou rgba()
6. Seja criativo mas mantenha legibilidade
7. Após o JSON, em uma nova linha, adicione: KEYWORDS: palavra1, palavra2, palavra3 (para busca de imagens)

**Template Original:**
${JSON.stringify(templateJson, null, 2)}

**Descrição do Usuário:**
"${description}"

**Resposta (JSON + KEYWORDS):**`
  }

  /**
   * Faz parsing da resposta do Gemini
   */
  private parseResponse(responseText: string): TemplateModificationResult {
    try {
      // Remove markdown code blocks se existirem
      let cleanText = responseText.trim()
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '')

      // Separa JSON de keywords
      const parts = cleanText.split(/KEYWORDS:/i)
      const jsonPart = parts[0].trim()
      const keywordsPart = parts[1]?.trim() || ''

      // Parse JSON
      const json: FabricTemplate = JSON.parse(jsonPart)

      // Parse keywords
      const imageKeywords = keywordsPart
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 5) // Máximo 5 keywords

      return {
        json,
        imageKeywords: imageKeywords.length > 0 ? imageKeywords : ['abstract', 'design'],
      }
    } catch (error) {
      console.error('Erro ao fazer parse da resposta:', error)
      console.error('Resposta original:', responseText)
      throw new Error('Falha ao processar resposta do Gemini. Resposta inválida.')
    }
  }

  /**
   * Valida se o template modificado está correto
   */
  private validateTemplate(template: FabricTemplate): boolean {
    if (!template.id || !template.name || !template.canvas || !Array.isArray(template.objects)) {
      return false
    }

    if (!template.canvas.width || !template.canvas.height) {
      return false
    }

    return true
  }
}

// Export singleton instance
let geminiServiceInstance: GeminiService | null = null

/**
 * Retorna instância singleton do GeminiService
 */
export function getGeminiService(): GeminiService {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService()
  }
  return geminiServiceInstance
}

/**
 * Reseta a instância (útil para testes)
 */
export function resetGeminiService(): void {
  geminiServiceInstance = null
}
