import { ImageSearchResult } from '@/types/templates'

/**
 * Interface unificada para resultados de imagens
 */
interface UnsplashImage {
  id: string
  urls: {
    regular: string
    full: string
    thumb: string
  }
  alt_description: string | null
  description: string | null
}

interface PixabayImage {
  id: number
  webformatURL: string
  largeImageURL: string
  previewURL: string
  tags: string
}

/**
 * Serviço unificado para busca de imagens
 * Tenta Unsplash primeiro, depois Pixabay como fallback
 */
export class ImageSearchService {
  private unsplashKey: string | undefined
  private pixabayKey: string | undefined

  constructor() {
    this.unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
    this.pixabayKey = import.meta.env.VITE_PIXABAY_API_KEY
  }

  /**
   * Busca imagens por keywords
   * Tenta Unsplash primeiro, fallback para Pixabay
   */
  async searchImages(keywords: string[], limit: number = 5): Promise<ImageSearchResult[]> {
    const results: ImageSearchResult[] = []

    for (const keyword of keywords) {
      try {
        // Tenta Unsplash primeiro
        if (this.unsplashKey) {
          const unsplashResults = await this.searchUnsplash(keyword, 1)
          if (unsplashResults.length > 0) {
            results.push(...unsplashResults)
            continue
          }
        }

        // Fallback para Pixabay
        if (this.pixabayKey) {
          const pixabayResults = await this.searchPixabay(keyword, 1)
          if (pixabayResults.length > 0) {
            results.push(...pixabayResults)
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar imagem para "${keyword}":`, error)
      }

      // Limita resultados
      if (results.length >= limit) {
        break
      }
    }

    return results.slice(0, limit)
  }

  /**
   * Busca imagens no Unsplash
   */
  private async searchUnsplash(query: string, perPage: number = 1): Promise<ImageSearchResult[]> {
    if (!this.unsplashKey) {
      return []
    }

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${this.unsplashKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const data = await response.json()
      const images = data.results as UnsplashImage[]

      return images.map(img => ({
        url: img.urls.regular,
        source: 'unsplash' as const,
        id: img.id,
        keyword: query,
        alt: img.alt_description || img.description || query,
      }))
    } catch (error) {
      console.error('Erro ao buscar no Unsplash:', error)
      return []
    }
  }

  /**
   * Busca imagens no Pixabay
   */
  private async searchPixabay(query: string, perPage: number = 1): Promise<ImageSearchResult[]> {
    if (!this.pixabayKey) {
      return []
    }

    try {
      const response = await fetch(
        `https://pixabay.com/api/?key=${this.pixabayKey}&q=${encodeURIComponent(query)}&per_page=${perPage}&orientation=horizontal&safesearch=true&image_type=photo`
      )

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`)
      }

      const data = await response.json()
      const images = data.hits as PixabayImage[]

      return images.map(img => ({
        url: img.largeImageURL,
        source: 'pixabay' as const,
        id: img.id.toString(),
        keyword: query,
        alt: img.tags,
      }))
    } catch (error) {
      console.error('Erro ao buscar no Pixabay:', error)
      return []
    }
  }

  /**
   * Busca uma única imagem pela primeira keyword
   */
  async searchSingleImage(keyword: string): Promise<ImageSearchResult | null> {
    const results = await this.searchImages([keyword], 1)
    return results[0] || null
  }

  /**
   * Busca imagens para múltiplas keywords em paralelo
   */
  async searchImagesParallel(keywords: string[], limit: number = 5): Promise<ImageSearchResult[]> {
    const promises = keywords.map(keyword => this.searchSingleImage(keyword))
    const results = await Promise.all(promises)

    return results
      .filter((r): r is ImageSearchResult => r !== null)
      .slice(0, limit)
  }

  /**
   * Verifica se há API keys configuradas
   */
  hasApiKeys(): boolean {
    return !!(this.unsplashKey || this.pixabayKey)
  }

  /**
   * Retorna qual serviço está disponível
   */
  getAvailableServices(): string[] {
    const services: string[] = []
    if (this.unsplashKey) services.push('unsplash')
    if (this.pixabayKey) services.push('pixabay')
    return services
  }
}

// Export singleton instance
let imageSearchServiceInstance: ImageSearchService | null = null

/**
 * Retorna instância singleton do ImageSearchService
 */
export function getImageSearchService(): ImageSearchService {
  if (!imageSearchServiceInstance) {
    imageSearchServiceInstance = new ImageSearchService()
  }
  return imageSearchServiceInstance
}

/**
 * Reseta a instância (útil para testes)
 */
export function resetImageSearchService(): void {
  imageSearchServiceInstance = null
}
