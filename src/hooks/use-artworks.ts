import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

type Artwork = Tables<'artworks'>
type ArtworkInsert = TablesInsert<'artworks'>
type ArtworkUpdate = TablesUpdate<'artworks'>

export function useArtworks() {
  const { user } = useAuth()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setArtworks([])
      setLoading(false)
      return
    }

    fetchArtworks()
  }, [user])

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArtworks(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createArtwork = async (artwork: Omit<ArtworkInsert, 'user_id'>) => {
    if (!user) return { error: 'No user logged in', data: null }

    try {
      const { data, error } = await supabase
        .from('artworks')
        .insert({
          ...artwork,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      await fetchArtworks()
      return { data, error: null }
    } catch (err: any) {
      return { error: err.message, data: null }
    }
  }

  const updateArtwork = async (id: string, updates: ArtworkUpdate) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const { error } = await supabase
        .from('artworks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      await fetchArtworks()
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  const deleteArtwork = async (id: string) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      await fetchArtworks()
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  const getArtwork = async (id: string) => {
    if (!user) return { error: 'No user logged in', data: null }

    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err: any) {
      return { error: err.message, data: null }
    }
  }

  return {
    artworks,
    loading,
    error,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    getArtwork,
    refreshArtworks: fetchArtworks,
  }
}
