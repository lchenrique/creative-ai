import { SavedTemplate, FabricTemplate, TemplateBaseId } from '@/types/templates'

const STORAGE_KEY = 'creative-ai-templates'

/**
 * Serviço para gerenciar templates salvos no localStorage
 * CRUD completo para templates
 */
export class TemplateManager {
  /**
   * Salva um novo template ou atualiza existente
   */
  saveTemplate(
    name: string,
    templateBase: TemplateBaseId,
    json: FabricTemplate,
    id?: string
  ): SavedTemplate {
    const templates = this.listTemplates()
    const now = new Date().toISOString()

    // Se ID fornecido, atualiza template existente
    if (id) {
      const index = templates.findIndex(t => t.id === id)
      if (index !== -1) {
        templates[index] = {
          ...templates[index],
          name,
          templateBase,
          json,
          modifiedAt: now,
        }
        this.saveToStorage(templates)
        return templates[index]
      }
    }

    // Cria novo template
    const newTemplate: SavedTemplate = {
      id: this.generateId(),
      name,
      templateBase,
      json,
      createdAt: now,
      modifiedAt: now,
    }

    templates.push(newTemplate)
    this.saveToStorage(templates)

    return newTemplate
  }

  /**
   * Carrega um template por ID
   */
  loadTemplate(id: string): SavedTemplate | null {
    const templates = this.listTemplates()
    return templates.find(t => t.id === id) || null
  }

  /**
   * Deleta um template por ID
   */
  deleteTemplate(id: string): boolean {
    const templates = this.listTemplates()
    const filtered = templates.filter(t => t.id !== id)

    if (filtered.length === templates.length) {
      return false // Template não encontrado
    }

    this.saveToStorage(filtered)
    return true
  }

  /**
   * Lista todos os templates salvos
   */
  listTemplates(): SavedTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []

      const templates = JSON.parse(data) as SavedTemplate[]
      return templates.sort((a, b) =>
        new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
      )
    } catch (error) {
      console.error('Erro ao ler templates do localStorage:', error)
      return []
    }
  }

  /**
   * Lista templates por base (perfil, comunicado, fitness)
   */
  listTemplatesByBase(templateBase: TemplateBaseId): SavedTemplate[] {
    return this.listTemplates().filter(t => t.templateBase === templateBase)
  }

  /**
   * Limpa todos os templates (usar com cuidado!)
   */
  clearAllTemplates(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Exporta um template como JSON para download
   */
  exportTemplate(id: string): string | null {
    const template = this.loadTemplate(id)
    if (!template) return null

    return JSON.stringify(template, null, 2)
  }

  /**
   * Importa um template de JSON
   */
  importTemplate(jsonString: string): SavedTemplate | null {
    try {
      const template = JSON.parse(jsonString) as SavedTemplate

      // Valida estrutura básica
      if (!template.name || !template.templateBase || !template.json) {
        throw new Error('Template inválido')
      }

      // Salva com novo ID e timestamps
      return this.saveTemplate(
        template.name,
        template.templateBase,
        template.json
      )
    } catch (error) {
      console.error('Erro ao importar template:', error)
      return null
    }
  }

  /**
   * Duplica um template existente
   */
  duplicateTemplate(id: string, newName?: string): SavedTemplate | null {
    const template = this.loadTemplate(id)
    if (!template) return null

    return this.saveTemplate(
      newName || `${template.name} (cópia)`,
      template.templateBase,
      template.json
    )
  }

  /**
   * Busca templates por nome
   */
  searchTemplates(query: string): SavedTemplate[] {
    const lowerQuery = query.toLowerCase()
    return this.listTemplates().filter(t =>
      t.name.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Conta total de templates
   */
  getTemplateCount(): number {
    return this.listTemplates().length
  }

  /**
   * Salva array de templates no localStorage
   */
  private saveToStorage(templates: SavedTemplate[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error)
      throw new Error('Falha ao salvar template. Verifique o espaço disponível.')
    }
  }

  /**
   * Gera ID único para template
   */
  private generateId(): string {
    return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
let templateManagerInstance: TemplateManager | null = null

/**
 * Retorna instância singleton do TemplateManager
 */
export function getTemplateManager(): TemplateManager {
  if (!templateManagerInstance) {
    templateManagerInstance = new TemplateManager()
  }
  return templateManagerInstance
}

/**
 * Reseta a instância (útil para testes)
 */
export function resetTemplateManager(): void {
  templateManagerInstance = null
}
