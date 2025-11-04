import { useState, useEffect } from 'react'

interface PixabayVideo {
    id: number
    videos: {
        large: { url: string, width: number, height: number, size: number }
        medium: { url: string, width: number, height: number, size: number }
        small: { url: string, width: number, height: number, size: number }
        tiny: { url: string, width: number, height: number, size: number }
    }
    tags: string
    user: string
    pageURL: string
}

interface UsePixabayVideosProps {
    query?: string
    page?: number
    perPage?: number
}

export const usePixabayVideos = ({ 
    query = 'nature', 
    page = 1, 
    perPage = 20 
}: UsePixabayVideosProps = {}) => {
    const [videos, setVideos] = useState<PixabayVideo[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)

    const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY

    const searchVideos = async (searchQuery?: string, pageNum = 1) => {
        if (!PIXABAY_API_KEY) {
            setError('API key do Pixabay não configurada')
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const searchTerm = searchQuery || query
            const url = `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&page=${pageNum}&per_page=${perPage}&video_type=all&safesearch=true`

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Falha ao buscar vídeos do Pixabay')
            }

            const data = await response.json()
            if (pageNum === 1) {
                setVideos(data.hits || [])
            } else {
                setVideos(prev => [...prev, ...(data.hits || [])])
            }
            setHasMore((data.hits || []).length === perPage)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        searchVideos(query, page)
    }, [query, page])

    const loadMore = () => {
        if (!loading && hasMore) {
            searchVideos(query, page + 1)
        }
    }

    return {
        videos,
        loading,
        error,
        hasMore,
        searchVideos,
        loadMore
    }
} 