import { FabricTemplate, FabricObject, ImageSearchResult } from '@/types/templates'

/**
 * Injeta URLs de imagens no template JSON
 * Procura por objetos do tipo 'rect' com IDs específicos ou palavras-chave
 * e converte para objetos 'image' com a URL fornecida
 */
export function injectImagesIntoTemplate(
  template: FabricTemplate,
  images: ImageSearchResult[]
): FabricTemplate {
  if (!images || images.length === 0) {
    return template
  }

  // Clone profundo do template para não mutar o original
  const modifiedTemplate: FabricTemplate = JSON.parse(JSON.stringify(template))

  // IDs comuns de placeholders de imagem nos templates
  const imagePlaceholderIds = [
    'header-image',
    'bg-image',
    'icon-placeholder',
    'image-placeholder',
    'photo-placeholder',
    'main-image',
  ]

  let imageIndex = 0

  // Percorre todos os objetos do template
  modifiedTemplate.objects = modifiedTemplate.objects.map((obj: FabricObject) => {
    // Verifica se é um placeholder de imagem
    const isImagePlaceholder =
      obj.id && imagePlaceholderIds.some(phId => obj.id?.includes(phId))

    // Ou se o tipo é 'rect' e tem dimensões grandes (provavelmente um placeholder)
    const isLikelyPlaceholder =
      obj.type === 'rect' &&
      obj.width &&
      obj.height &&
      obj.width > 100 &&
      obj.height > 100

    // Se for placeholder e temos imagem disponível
    if ((isImagePlaceholder || isLikelyPlaceholder) && imageIndex < images.length) {
      const image = images[imageIndex]
      imageIndex++

      // Converte para objeto image do Fabric.js
      return {
        ...obj,
        type: 'image',
        src: image.url,
        crossOrigin: 'anonymous',
        // Remove propriedades específicas de rect
        stroke: undefined,
        strokeWidth: undefined,
        // Mantém posição e dimensões
      } as FabricObject
    }

    return obj
  })

  // Se ainda temos imagens e o template tem backgroundImage, injeta a primeira
  if (imageIndex < images.length && !modifiedTemplate.canvas.backgroundImage) {
    modifiedTemplate.canvas.backgroundImage = images[imageIndex].url
    imageIndex++
  }

  return modifiedTemplate
}

/**
 * Injeta uma imagem específica em um objeto específico por ID
 */
export function injectImageById(
  template: FabricTemplate,
  objectId: string,
  imageUrl: string
): FabricTemplate {
  const modifiedTemplate: FabricTemplate = JSON.parse(JSON.stringify(template))

  modifiedTemplate.objects = modifiedTemplate.objects.map((obj: FabricObject) => {
    if (obj.id === objectId) {
      return {
        ...obj,
        type: 'image',
        src: imageUrl,
        crossOrigin: 'anonymous',
        stroke: undefined,
        strokeWidth: undefined,
      } as FabricObject
    }
    return obj
  })

  return modifiedTemplate
}

/**
 * Injeta imagem como background do canvas
 */
export function injectBackgroundImage(
  template: FabricTemplate,
  imageUrl: string
): FabricTemplate {
  const modifiedTemplate: FabricTemplate = JSON.parse(JSON.stringify(template))
  modifiedTemplate.canvas.backgroundImage = imageUrl
  return modifiedTemplate
}

/**
 * Encontra todos os placeholders de imagem no template
 */
export function findImagePlaceholders(template: FabricTemplate): FabricObject[] {
  const placeholders: FabricObject[] = []

  const imageRelatedIds = [
    'image',
    'photo',
    'picture',
    'icon',
    'header',
    'bg',
    'background',
  ]

  template.objects.forEach(obj => {
    // Verifica por ID
    const hasImageId = obj.id && imageRelatedIds.some(keyword => obj.id?.toLowerCase().includes(keyword))

    // Verifica por tamanho (rects grandes podem ser placeholders)
    const isLargePlaceholder =
      obj.type === 'rect' &&
      obj.width &&
      obj.height &&
      obj.width > 100 &&
      obj.height > 100

    if (hasImageId || isLargePlaceholder) {
      placeholders.push(obj)
    }
  })

  return placeholders
}

/**
 * Conta quantas imagens o template pode receber
 */
export function countImageSlots(template: FabricTemplate): number {
  const placeholders = findImagePlaceholders(template)
  let count = placeholders.length

  // +1 se pode ter background image
  if (!template.canvas.backgroundImage) {
    count += 1
  }

  return count
}

/**
 * Remove todas as imagens do template (volta para placeholders)
 */
export function removeAllImages(template: FabricTemplate): FabricTemplate {
  const modifiedTemplate: FabricTemplate = JSON.parse(JSON.stringify(template))

  // Remove background image
  modifiedTemplate.canvas.backgroundImage = undefined

  // Converte imagens de volta para rects
  modifiedTemplate.objects = modifiedTemplate.objects.map((obj: FabricObject) => {
    if (obj.type === 'image') {
      return {
        ...obj,
        type: 'rect',
        fill: '#E5E7EB', // Gray placeholder
        src: undefined,
        crossOrigin: undefined,
      } as FabricObject
    }
    return obj
  })

  return modifiedTemplate
}
