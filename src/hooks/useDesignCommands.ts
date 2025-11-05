import { useState, useCallback } from 'react'
import { useCreativeStore } from '@/stores/creative-store'
import { getDesignCommandService, type DesignCommand, type DesignResult } from '@/services/designCommandService'
import { getImageSearchService } from '@/services/imageSearchService'
import type { ColorConfig } from '@/components/gradient-control'
import { INITIAL_COLOR_CONFIG } from '@/stores/creative-store'

interface UseDesignCommandsResult {
  loading: boolean
  error: string | null
  executeDesign: (description: string) => Promise<void>
  reset: () => void
}

/**
 * Hook para executar comandos de design gerados pela IA
 * Usa as ferramentas existentes do Fabric.js (addRectangle, addTextbox, etc)
 */
export function useDesignCommands(): UseDesignCommandsResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Store actions
  const updateBackground = useCreativeStore((state) => state.updateBackground)
  const addRectangle = useCreativeStore((state) => state.addRectangle)
  const addTextbox = useCreativeStore((state) => state.addTextbox)
  const addCircle = useCreativeStore((state) => state.addCircle)
  const addTriangle = useCreativeStore((state) => state.addTriangle)
  const addLine = useCreativeStore((state) => state.addLine)
  const addStar = useCreativeStore((state) => state.addStar)
  const addHeart = useCreativeStore((state) => state.addHeart)
  const addImageFromURL = useCreativeStore((state) => state.addImageFromURL)
  // Parametrized actions
  const addTextboxWithParams = useCreativeStore((state) => state.addTextboxWithParams)
  const addRectangleWithParams = useCreativeStore((state) => state.addRectangleWithParams)
  const addCircleWithParams = useCreativeStore((state) => state.addCircleWithParams)

  const executeDesign = useCallback(
    async (description: string) => {
      setLoading(true)
      setError(null)

      try {
        // 1. Verifica se as ferramentas do canvas estão prontas
        const canvasToolsReady = useCreativeStore.getState().canvasToolsReady
        if (!canvasToolsReady) {
          // Aguarda até 5 segundos para as ferramentas estarem prontas
          let attempts = 0
          const maxAttempts = 50
          while (!useCreativeStore.getState().canvasToolsReady && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100))
            attempts++
          }

          if (!useCreativeStore.getState().canvasToolsReady) {
            throw new Error('Canvas ainda não está pronto. Aguarde alguns instantes e tente novamente.')
          }
        }

        // 2. Obtém as funções atualizadas do store
        const state = useCreativeStore.getState()
        const currentAddTextboxWithParams = state.addTextboxWithParams
        const currentAddRectangleWithParams = state.addRectangleWithParams
        const currentAddCircleWithParams = state.addCircleWithParams
        const currentAddImageFromURLWithParams = state.addImageFromURLWithParams

        // 3. Gera comandos com Gemini
        const designService = getDesignCommandService()
        const result: DesignResult = await designService.generateDesign(description)

        console.log('✅ Design gerado:', result.description)
        console.log('📋 Comandos:', result.commands)

        // 4. Executa cada comando
        for (const command of result.commands) {
          await executeCommand(command, {
            updateBackground,
            addRectangle,
            addTextbox,
            addCircle,
            addTriangle,
            addLine,
            addStar,
            addHeart,
            addImageFromURL,
            addTextboxWithParams: currentAddTextboxWithParams,
            addRectangleWithParams: currentAddRectangleWithParams,
            addCircleWithParams: currentAddCircleWithParams,
            addImageFromURLWithParams: currentAddImageFromURLWithParams,
          })

          // Pequeno delay entre comandos para melhor visualização
          await new Promise(resolve => setTimeout(resolve, 300))
        }

        console.log('✅ Todos os comandos executados com sucesso!')
        setLoading(false)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao executar design'
        console.error('❌ Erro:', errorMessage)
        setError(errorMessage)
        setLoading(false)
      }
    },
    [updateBackground, addRectangle, addTextbox, addCircle, addTriangle, addLine, addStar, addHeart, addImageFromURL]
  )

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return {
    loading,
    error,
    executeDesign,
    reset,
  }
}

/**
 * Executa um comando individual
 */
async function executeCommand(
  command: DesignCommand,
  actions: {
    updateBackground: (config: ColorConfig) => void
    addRectangle: (() => void) | null
    addTextbox: (() => void) | null
    addCircle: (() => void) | null
    addTriangle: (() => void) | null
    addLine: (() => void) | null
    addStar: (() => void) | null
    addHeart: (() => void) | null
    addImageFromURL: ((url: string) => void) | null
  }
) {
  switch (command.type) {
    case 'background':
      await executeBackgroundCommand(command, actions.updateBackground)
      break

    case 'text':
      executeTextCommand(command, actions.addTextbox)
      break

    case 'shape':
      executeShapeCommand(command, actions)
      break

    case 'image':
      await executeImageCommand(command, actions)
      break

    default:
      console.warn(`Comando desconhecido: ${command.type}`)
  }
}

/**
 * Executa comando de background
 */
async function executeBackgroundCommand(
  command: DesignCommand,
  updateBackground: (config: ColorConfig) => void
) {
  if (command.action === 'set_solid') {
    const config: ColorConfig = {
      ...INITIAL_COLOR_CONFIG,
      colorType: 'solid',
      solidColor: command.params.color || '#ffffff',
    }
    updateBackground(config)
    console.log('🎨 Background sólido aplicado:', command.params.color)
  } else if (command.action === 'set_gradient') {
    const config: ColorConfig = {
      ...INITIAL_COLOR_CONFIG,
      colorType: 'gradient',
      gradient: {
        type: command.params.gradient?.type || 'linear',
        angle: command.params.gradient?.angle || 90,
        radialType: 'circle',
        radialSize: 'farthest-corner',
        radialPosition: { x: 50, y: 50 },
        stops: command.params.gradient?.stops || [
          { id: '1', color: '#ff6b6b', position: 0, opacity: 100 },
          { id: '2', color: '#4ecdc4', position: 100, opacity: 100 },
        ],
      },
    }
    updateBackground(config)
    console.log('🎨 Gradiente aplicado')
  } else if (command.action === 'set_image' && command.params.keywords) {
    // Busca imagem para background
    const imageService = getImageSearchService()
    const images = await imageService.searchImages(command.params.keywords, 1)

    if (images.length > 0) {
      const config: ColorConfig = {
        ...INITIAL_COLOR_CONFIG,
        colorType: 'image',
        image: {
          url: images[0].url,
          opacity: 100,
          scale: 100,
          position: { x: 50, y: 50 },
        },
      }
      updateBackground(config)
      console.log('🖼️ Background com imagem aplicado:', images[0].keyword)
    } else {
      console.warn('⚠️ Nenhuma imagem encontrada para background:', command.params.keywords)
    }
  } else if (command.action === 'set_video' && command.params.keywords) {
    // Busca vídeo para background (usa Pixabay que suporta vídeos)
    const imageService = getImageSearchService()
    const videos = await imageService.searchImages(command.params.keywords, 1)

    if (videos.length > 0) {
      const config: ColorConfig = {
        ...INITIAL_COLOR_CONFIG,
        colorType: 'video',
        video: {
          url: videos[0].url,
          opacity: 100,
          scale: 100,
          position: { x: 50, y: 50 },
        },
      }
      updateBackground(config)
      console.log('🎥 Background com vídeo aplicado:', videos[0].keyword)
    } else {
      console.warn('⚠️ Nenhum vídeo encontrado para background:', command.params.keywords)
    }
  }
}

/**
 * Executa comando de texto
 */
function executeTextCommand(
  command: DesignCommand,
  actions: any
) {
  const { addTextboxWithParams } = actions

  if (!addTextboxWithParams) {
    console.warn('⚠️ addTextboxWithParams não disponível')
    return
  }

  // Usa função parametrizada
  const text = command.params.text || 'Texto aqui'
  const options = {
    fontSize: command.params.fontSize,
    color: command.params.color,
    fontFamily: command.params.fontFamily,
    fontWeight: command.params.fontWeight,
    left: command.params.left,
    top: command.params.top,
    width: command.params.width,
  }

  addTextboxWithParams(text, options)
  console.log('📝 Texto adicionado:', text, options)
}

/**
 * Executa comando de shape
 */
function executeShapeCommand(
  command: DesignCommand,
  actions: any
) {
  const { addRectangleWithParams, addCircleWithParams } = actions

  switch (command.action) {
    case 'add_rectangle':
      if (addRectangleWithParams) {
        const options = {
          color: command.params?.color,
          width: command.params?.width,
          height: command.params?.height,
          left: command.params?.left,
          top: command.params?.top,
        }
        addRectangleWithParams(options)
        console.log('🟦 Retângulo adicionado com params:', options)
      } else {
        actions.addRectangle?.()
        console.log('🟦 Retângulo adicionado (padrão)')
      }
      break
    case 'add_circle':
      if (addCircleWithParams) {
        const options = {
          color: command.params?.color,
          radius: command.params?.radius,
          left: command.params?.left,
          top: command.params?.top,
        }
        addCircleWithParams(options)
        console.log('🔵 Círculo adicionado com params:', options)
      } else {
        actions.addCircle?.()
        console.log('🔵 Círculo adicionado (padrão)')
      }
      break
    case 'add_triangle':
      actions.addTriangle?.()
      console.log('🔺 Triângulo adicionado')
      break
    case 'add_line':
      actions.addLine?.()
      console.log('➖ Linha adicionada')
      break
    case 'add_star':
      actions.addStar?.()
      console.log('⭐ Estrela adicionada')
      break
    case 'add_heart':
      actions.addHeart?.()
      console.log('❤️ Coração adicionado')
      break
    default:
      console.warn(`Shape desconhecido: ${command.action}`)
  }
}

/**
 * Executa comando de imagem
 */
async function executeImageCommand(
  command: DesignCommand,
  actions: any
) {
  const { addImageFromURLWithParams, addImageFromURL } = actions

  if (command.action === 'search' && command.params.keywords) {
    const imageService = getImageSearchService()
    const images = await imageService.searchImages(command.params.keywords, 1)

    if (images.length > 0) {
      // Usa função parametrizada se disponível
      if (addImageFromURLWithParams && (command.params.left !== undefined || command.params.top !== undefined)) {
        const options = {
          left: command.params.left,
          top: command.params.top,
          width: command.params.width,
          height: command.params.height,
        }
        addImageFromURLWithParams(images[0].url, options)
        console.log('🖼️ Imagem adicionada com posição:', images[0].keyword, options)
      } else if (addImageFromURL) {
        addImageFromURL(images[0].url)
        console.log('🖼️ Imagem adicionada:', images[0].keyword)
      } else {
        console.warn('⚠️ addImageFromURL não disponível')
      }
    } else {
      console.warn('⚠️ Nenhuma imagem encontrada para:', command.params.keywords)
    }
  }
}
