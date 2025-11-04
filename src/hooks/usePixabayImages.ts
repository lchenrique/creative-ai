import { useState, useEffect } from 'react'

interface PixabayImage {
    id: number
    webformatURL: string
    largeImageURL: string
    previewURL: string
    tags: string
    user: string
    pageURL: string
}

interface UsePixabayImagesProps {
    query?: string
    page?: number
    perPage?: number
}

export const usePixabayImages = ({ 
    query = 'nature', 
    page = 1, 
    perPage = 20 
}: UsePixabayImagesProps = {}) => {
    const [images, setImages] = useState<PixabayImage[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)

    const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY

    const searchImages = async (searchQuery?: string, pageNum = 1) => {
        if (!PIXABAY_API_KEY) {
            setError('API key do Pixabay não configurada')
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const searchTerm = searchQuery || query
            const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&page=${pageNum}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Falha ao buscar imagens do Pixabay')
            }

            const data = await response.json()
            
            if (pageNum === 1) {
                setImages(data.hits || [])
            } else {
                setImages(prev => [...prev, ...(data.hits || [])])
            }
            
            setHasMore((data.hits || []).length === perPage)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        searchImages(query, page)
    }, [query, page])

    const loadMore = () => {
        if (!loading && hasMore) {
            searchImages(query, page + 1)
        }
    }

    return {
        images,
        loading,
        error,
        hasMore,
        searchImages,
        loadMore
    }
} 