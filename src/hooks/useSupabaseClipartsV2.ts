import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface SupabaseClipart {
    id: string
    name: string
    category: string
    path: string
    url: string
    keywords?: string[]
    created_at: string
}

interface UseSupabaseClipartsV2Props {
    search?: string
    category?: string
    page?: number
    pageSize?: number
}

interface UseSupabaseClipartsV2Return {
    cliparts: SupabaseClipart[]
    loading: boolean
    error: string | null
    categories: string[]
    total: number
    hasMore: boolean
}

export function useSupabaseClipartsV2({
    search = '',
    category = '',
    page = 1,
    pageSize = 50,
}: UseSupabaseClipartsV2Props = {}): UseSupabaseClipartsV2Return {
    const [cliparts, setCliparts] = useState<SupabaseClipart[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [categories, setCategories] = useState<string[]>([])
    const [total, setTotal] = useState(0)
    const [allFetchedData, setAllFetchedData] = useState<SupabaseClipart[]>([]) // Armazena todos os dados quando há busca

    useEffect(() => {
        const fetchCategories = async () => {
            // Usar abordagem diferente: buscar alguns de cada categoria conhecida
            const knownCategories = ['magicons', 'open_stickers']
            const foundCategories: string[] = []

            for (const cat of knownCategories) {
                const { data, error } = await (supabase as any)
                    .from('cliparts')
                    .select('category')
                    .eq('category', cat)
                    .limit(1)

                if (data && data.length > 0 && !error) {
                    foundCategories.push(cat)
                }
            }

            setCategories(foundCategories.sort())
        }

        fetchCategories()
    }, [])

    // Reset ao mudar busca ou categoria
    useEffect(() => {
        setCliparts([])
        setAllFetchedData([])
    }, [search, category])

    useEffect(() => {
        const fetchCliparts = async () => {
            setLoading(true)
            setError(null)

            try {
                // Se houver busca, vamos pegar TODAS as keywords primeiro (sem paginação)
                // e filtrar no cliente. Se não houver busca, usa paginação normal do servidor
                if (search) {
                    // Se já temos os dados filtrados, apenas paginar no cliente
                    if (allFetchedData.length > 0) {
                        const from = (page - 1) * pageSize
                        const to = from + pageSize
                        const paginated = allFetchedData.slice(0, to) // Acumular até a página atual

                        setCliparts(paginated)
                        setLoading(false)
                        return
                    }

                    // Primeira busca - buscar todos os dados (SEM LIMITE!)
                    let query = (supabase as any)
                        .from('cliparts')
                        .select('*', { count: 'exact' })
                        .limit(10000) // Aumentar limite para pegar todos os cliparts

                    // Filtrar por categoria
                    if (category) {
                        query = query.eq('category', category)
                    }

                    const { data, error: fetchError } = await query

                    if (fetchError) {
                        throw fetchError
                    }

                    // Filtrar no cliente por nome, path OU keywords
                    const searchLower = search.toLowerCase()
                    const filtered = (data || []).filter((item: SupabaseClipart) => {
                        const nameMatch = item.name.toLowerCase().includes(searchLower)
                        const pathMatch = item.path.toLowerCase().includes(searchLower)
                        const keywordMatch = item.keywords?.some(kw => kw.toLowerCase().includes(searchLower))

                        return nameMatch || pathMatch || keywordMatch
                    })

                    setAllFetchedData(filtered)
                    setTotal(filtered.length)

                    // Aplicar paginação no cliente
                    const from = (page - 1) * pageSize
                    const to = from + pageSize
                    const paginated = filtered.slice(0, to) // Acumular desde o início

                    setCliparts(paginated)
                } else {
                    // Sem busca - usa paginação acumulativa do servidor
                    let query = (supabase as any)
                        .from('cliparts')
                        .select('*', { count: 'exact' })

                    // Filtrar por categoria
                    if (category) {
                        query = query.eq('category', category)
                    }

                    // Ordenar e paginar - buscar desde o início até a página atual
                    const from = 0
                    const to = page * pageSize - 1

                    query = query
                        .order('category', { ascending: true })
                        .order('name', { ascending: true })
                        .range(from, to)

                    const { data, error: fetchError, count } = await query

                    if (fetchError) {
                        throw fetchError
                    }

                    setCliparts(data || [])
                    setTotal(count || 0)
                }
            } catch (err) {
                console.error('Erro ao buscar cliparts:', err)
                setError(err instanceof Error ? err.message : 'Erro desconhecido')
                setCliparts([])
                setTotal(0)
            } finally {
                setLoading(false)
            }
        }

        fetchCliparts()
    }, [search, category, page, pageSize, allFetchedData.length])

    const hasMore = total > page * pageSize

    return {
        cliparts,
        loading,
        error,
        categories,
        total,
        hasMore,
    }
}
