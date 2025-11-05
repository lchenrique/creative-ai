import { useState, useEffect, useCallback } from 'react'
import { SavedTemplate, FabricTemplate, TemplateBaseId } from '@/types/templates'
import { getTemplateManager } from '@/services/templateManager'

interface UseTemplateManagerResult {
  templates: SavedTemplate[]
  loading: boolean
  error: string | null
  saveTemplate: (name: string, templateBase: TemplateBaseId, json: FabricTemplate, id?: string) => SavedTemplate | null
  loadTemplate: (id: string) => SavedTemplate | null
  deleteTemplate: (id: string) => boolean
  duplicateTemplate: (id: string, newName?: string) => SavedTemplate | null
  searchTemplates: (query: string) => SavedTemplate[]
  exportTemplate: (id: string) => string | null
  importTemplate: (jsonString: string) => SavedTemplate | null
  refreshTemplates: () => void
}

/**
 * Hook para gerenciar templates salvos
 * Fornece interface React para o TemplateManager
 */
export function useTemplateManager(): UseTemplateManagerResult {
  const [templates, setTemplates] = useState<SavedTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const templateManager = getTemplateManager()

  // Carrega templates iniciais
  useEffect(() => {
    refreshTemplates()
  }, [])

  const refreshTemplates = useCallback(() => {
    try {
      setLoading(true)
      const allTemplates = templateManager.listTemplates()
      setTemplates(allTemplates)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar templates')
    } finally {
      setLoading(false)
    }
  }, [templateManager])

  const saveTemplate = useCallback(
    (name: string, templateBase: TemplateBaseId, json: FabricTemplate, id?: string): SavedTemplate | null => {
      try {
        const saved = templateManager.saveTemplate(name, templateBase, json, id)
        refreshTemplates()
        return saved
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar template')
        return null
      }
    },
    [templateManager, refreshTemplates]
  )

  const loadTemplate = useCallback(
    (id: string): SavedTemplate | null => {
      try {
        return templateManager.loadTemplate(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar template')
        return null
      }
    },
    [templateManager]
  )

  const deleteTemplate = useCallback(
    (id: string): boolean => {
      try {
        const success = templateManager.deleteTemplate(id)
        if (success) {
          refreshTemplates()
        }
        return success
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao deletar template')
        return false
      }
    },
    [templateManager, refreshTemplates]
  )

  const duplicateTemplate = useCallback(
    (id: string, newName?: string): SavedTemplate | null => {
      try {
        const duplicated = templateManager.duplicateTemplate(id, newName)
        if (duplicated) {
          refreshTemplates()
        }
        return duplicated
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao duplicar template')
        return null
      }
    },
    [templateManager, refreshTemplates]
  )

  const searchTemplates = useCallback(
    (query: string): SavedTemplate[] => {
      try {
        return templateManager.searchTemplates(query)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar templates')
        return []
      }
    },
    [templateManager]
  )

  const exportTemplate = useCallback(
    (id: string): string | null => {
      try {
        return templateManager.exportTemplate(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao exportar template')
        return null
      }
    },
    [templateManager]
  )

  const importTemplate = useCallback(
    (jsonString: string): SavedTemplate | null => {
      try {
        const imported = templateManager.importTemplate(jsonString)
        if (imported) {
          refreshTemplates()
        }
        return imported
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao importar template')
        return null
      }
    },
    [templateManager, refreshTemplates]
  )

  return {
    templates,
    loading,
    error,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    duplicateTemplate,
    searchTemplates,
    exportTemplate,
    importTemplate,
    refreshTemplates,
  }
}

/**
 * Hook para filtrar templates por base (perfil, comunicado, fitness)
 */
export function useTemplatesByBase(templateBase: TemplateBaseId) {
  const [templates, setTemplates] = useState<SavedTemplate[]>([])
  const templateManager = getTemplateManager()

  useEffect(() => {
    const filtered = templateManager.listTemplatesByBase(templateBase)
    setTemplates(filtered)
  }, [templateBase, templateManager])

  return templates
}

/**
 * Hook para contar templates
 */
export function useTemplateCount() {
  const [count, setCount] = useState(0)
  const templateManager = getTemplateManager()

  useEffect(() => {
    const total = templateManager.getTemplateCount()
    setCount(total)
  }, [templateManager])

  const refresh = useCallback(() => {
    const total = templateManager.getTemplateCount()
    setCount(total)
  }, [templateManager])

  return { count, refresh }
}
