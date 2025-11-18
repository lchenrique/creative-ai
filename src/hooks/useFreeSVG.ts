import { useEffect, useState } from 'react'

interface FreeSVGImage {
    id: number
    title: string
    svg_url: string
    png_url: string
    thumbnail_url: string
    author: string
    license: string
}

interface FreeSVGResponse {
    data: FreeSVGImage[]
    current_page: number
    last_page: number
    total: number
}

interface UseFreeSVGProps {
    query?: string
    page?: number
    perPage?: number
}

// Token de autenticação - você precisará fazer login e obter seu próprio token
// Para desenvolvimento, você pode usar variáveis de ambiente
const FREESVG_TOKEN = import.meta.env.VITE_FREESVG_TOKEN || ''

export function useFreeSVG({ query = '', page = 1, perPage = 25 }: UseFreeSVGProps = {}) {
    const [images, setImages] = useState<FreeSVGImage[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        const fetchImages = async () => {
            if (!FREESVG_TOKEN) {
                setError('FreeSVG API token não configurado. Configure VITE_FREESVG_TOKEN no .env')
                return
            }

            setLoading(true)
            setError(null)

            try {
                const url = query
                    ? `https://freesvg.org/api/v1/search?query=${encodeURIComponent(query)}&page=${page}`
                    : `https://freesvg.org/api/v1/svgs?page=${page}`

                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${FREESVG_TOKEN}`,
                    },
                })

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Token de autenticação inválido ou expirado')
                    }
                    throw new Error(`Erro ao buscar imagens: ${response.status}`)
                }

                const data: FreeSVGResponse = await response.json()

                setImages(data.data || [])
                setTotalPages(data.last_page || 1)
                setHasMore(data.current_page < data.last_page)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido')
                setImages([])
            } finally {
                setLoading(false)
            }
        }

        fetchImages()
    }, [query, page, perPage])

    return {
        images,
        loading,
        error,
        hasMore,
        totalPages,
    }
}
