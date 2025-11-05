import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface SupabaseImage {
    name: string
    url: string
    created_at: string
    category?: string
}

interface UseSupabaseClipartsProps {
    search?: string
    category?: string
    limit?: number
}

interface UseSupabaseClipartsReturn {
    images: SupabaseImage[]
    loading: boolean
    error: string | null
    categories: string[]
    total: number
}

async function listAllFiles(prefix = ''): Promise<any[]> {
    const { data, error } = await supabase.storage.from('cliparts').list(prefix, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
        console.error(`❌ Erro ao listar '${prefix}':`, error)
        return []
    }

    if (!data || data.length === 0) {
        return []
    }

    let allFiles: any[] = []

    for (const item of data) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name

        // Se tem ID, é arquivo. Se não tem ID, é pasta
        if (item.id) {
            // É um arquivo
            allFiles.push({ ...item, fullPath })
        } else {
            // É uma pasta - buscar recursivamente
            const subFiles = await listAllFiles(fullPath)
            allFiles = allFiles.concat(subFiles)
        }
    }

    return allFiles
}

// Cache global para não recarregar toda vez
let cachedFiles: any[] | null = null
let cachePromise: Promise<any[]> | null = null

async function getAllFilesWithCache(): Promise<any[]> {
    if (cachedFiles) {
        return cachedFiles
    }

    if (cachePromise) {
        return cachePromise
    }

    cachePromise = listAllFiles().then(files => {
        cachedFiles = files
        cachePromise = null
        return files
    })

    return cachePromise
} export function useSupabaseCliparts({
    search = '',
    category = '',
    limit = 100,
}: UseSupabaseClipartsProps = {}): UseSupabaseClipartsReturn {
    const [allImages, setAllImages] = useState<SupabaseImage[]>([])
    const [images, setImages] = useState<SupabaseImage[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [categories, setCategories] = useState<string[]>([])
    const [total, setTotal] = useState(0)

    // Buscar dados apenas quando search ou category mudam
    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true)
            setError(null)

            try {
                // Listar todos os arquivos recursivamente (com cache)
                const allFiles = await getAllFilesWithCache()

                // Filtrar arquivos SVG
                let svgFiles = allFiles.filter((file) =>
                    file.name.endsWith('.svg') && !file.name.includes('.emptyFolderPlaceholder')
                )

                // Extrair categorias únicas
                const uniqueCategories = Array.from(
                    new Set(svgFiles.map((file) => file.fullPath.split('/')[0]))
                ).sort()
                setCategories(uniqueCategories)

                // Filtrar por categoria se especificado
                if (category) {
                    svgFiles = svgFiles.filter((file) => file.fullPath.startsWith(category + '/'))
                }

                // Filtrar por busca
                if (search) {
                    svgFiles = svgFiles.filter((file) =>
                        file.name.toLowerCase().includes(search.toLowerCase()) ||
                        file.fullPath.toLowerCase().includes(search.toLowerCase())
                    )
                }

                // Gerar URLs públicas
                const imagesWithUrls: SupabaseImage[] = svgFiles.map((file) => {
                    const { data } = supabase.storage.from('cliparts').getPublicUrl(file.fullPath)

                    return {
                        name: file.name,
                        url: data.publicUrl,
                        created_at: file.created_at || new Date().toISOString(),
                        category: file.fullPath.split('/')[0],
                    }
                })

                setAllImages(imagesWithUrls)
                setTotal(imagesWithUrls.length)
            } catch (err) {
                console.error('Erro ao buscar cliparts do Supabase:', err)
                setError(err instanceof Error ? err.message : 'Erro desconhecido')
                setAllImages([])
                setCategories([])
                setTotal(0)
            } finally {
                setLoading(false)
            }
        }

        fetchImages()
    }, [search, category])

    // Aplicar limit quando mudar
    useEffect(() => {
        setImages(allImages.slice(0, limit))
    }, [allImages, limit])

    return {
        images,
        loading,
        error,
        categories,
        total,
    }
}
