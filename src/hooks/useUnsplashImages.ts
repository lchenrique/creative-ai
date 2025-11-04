    import { useState, useEffect } from 'react'

    interface UnsplashImage {
        id: string
        urls: {
            regular: string
            full: string
            thumb: string
        }
        alt_description: string
        description: string
        user: {
            name: string
            username: string
        }
        links: {
            html: string
        }
    }

    interface UseUnsplashImagesProps {
        query?: string
        page?: number
        perPage?: number
    }

    export const useUnsplashImages = ({ 
        query = 'nature', 
        page = 1, 
        perPage = 20 
    }: UseUnsplashImagesProps = {}) => {
        const [images, setImages] = useState<UnsplashImage[]>([])
        const [loading, setLoading] = useState(false)
        const [error, setError] = useState<string | null>(null)
        const [hasMore, setHasMore] = useState(true)

        // Você precisa de uma API key do Unsplash
        // https://unsplash.com/developers
        const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'demo'

        const searchImages = async (searchQuery?: string, pageNum = 1) => {
            if (UNSPLASH_ACCESS_KEY === 'demo') {
                // Fallback com imagens de demonstração
                setImages([
                    {
                        id: '1',
                        urls: {
                            regular: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
                            full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
                            thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
                        },
                        alt_description: 'Mountain landscape',
                        description: 'Beautiful mountain landscape',
                        user: { name: 'Demo User', username: 'demo' },
                        links: { html: 'https://unsplash.com' }
                    },
                    {
                        id: '2',
                        urls: {
                            regular: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
                            full: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
                            thumb: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
                        },
                        alt_description: 'Forest',
                        description: 'Green forest',
                        user: { name: 'Demo User', username: 'demo' },
                        links: { html: 'https://unsplash.com' }
                    },
                    {
                        id: '3',
                        urls: {
                            regular: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
                            full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
                            thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
                        },
                        alt_description: 'Ocean',
                        description: 'Blue ocean',
                        user: { name: 'Demo User', username: 'demo' },
                        links: { html: 'https://unsplash.com' }
                    }
                ])
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            try {
                const searchTerm = searchQuery || query
                const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&page=${pageNum}&per_page=${perPage}&orientation=landscape`

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                    }
                })

                if (!response.ok) {
                    throw new Error('Falha ao buscar imagens')
                }

                const data = await response.json()
                
                if (pageNum === 1) {
                    setImages(data.results)
                } else {
                    setImages(prev => [...prev, ...data.results])
                }
                
                setHasMore(data.results.length === perPage)
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