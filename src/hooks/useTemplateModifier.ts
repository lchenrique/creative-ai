import { injectImagesIntoTemplate } from '@/lib/injectImagesIntoTemplate'
import { getGeminiService } from '@/services/geminiService'
import { getImageSearchService } from '@/services/imageSearchService'
import { FabricTemplate, TemplateModificationResult } from '@/types/templates'
import { useCallback, useState } from 'react'

interface UseTemplateModifierResult {
  modifiedTemplate: FabricTemplate | null
  loading: boolean
  error: string | null
  modifyTemplate: (template: FabricTemplate, description: string) => Promise<FabricTemplate | null>
  reset: () => void
}

/**
 * Hook para modificar templates usando Gemini AI
 * Fluxo: Template + Descrição → Gemini → Busca Imagens → Injeta URLs → Template Final
 */
export function useTemplateModifier(): UseTemplateModifierResult {
  const [modifiedTemplate, setModifiedTemplate] = useState<FabricTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const modifyTemplate = useCallback(
    async (template: FabricTemplate, description: string): Promise<FabricTemplate | null> => {
      setLoading(true)
      setError(null)
      setModifiedTemplate(null)

      try {
        // 1. Chama Gemini para modificar o template
        const geminiService = getGeminiService()
        const result: TemplateModificationResult = await geminiService.modifyTemplate(
          template,
          description
        )
        console.log('📸 Keywords para imagens:', result.imageKeywords)

        // 2. Busca imagens baseadas nas keywords
        const imageService = getImageSearchService()
        const images = await imageService.searchImages(result.imageKeywords, 5)
        // 3. Injeta URLs das imagens no template
        let finalTemplate = result.json

        if (images.length > 0) {
          finalTemplate = injectImagesIntoTemplate(result.json, images)
        } else {
        }

        setModifiedTemplate(finalTemplate)
        setLoading(false)
        return finalTemplate
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao modificar template'
        setError(errorMessage)
        setLoading(false)
        return null
      }
    },
    []
  )

  const reset = useCallback(() => {
    setModifiedTemplate(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    modifiedTemplate,
    loading,
    error,
    modifyTemplate,
    reset,
  }
}

/**
 * Hook simplificado para modificar template em uma chamada
 */
export function useQuickTemplateModifier() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const modify = useCallback(
    async (template: FabricTemplate, description: string): Promise<FabricTemplate | null> => {
      setLoading(true)
      setError(null)

      try {
        const geminiService = getGeminiService()
        const imageService = getImageSearchService()

        // Modifica com Gemini
        const result = await geminiService.modifyTemplate(template, description)

        // Busca e injeta imagens
        const images = await imageService.searchImages(result.imageKeywords, 5)
        const finalTemplate = images.length > 0
          ? injectImagesIntoTemplate(result.json, images)
          : result.json

        setLoading(false)
        return finalTemplate
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        setLoading(false)
        return null
      }
    },
    []
  )

  return { modify, loading, error }
}
