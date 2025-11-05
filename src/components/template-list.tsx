import { useState } from 'react'
import { Trash2, Copy, Download, Upload, FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useTemplateManager } from '@/hooks/useTemplateManager'
import { FabricTemplate } from '@/types/templates'

interface TemplateListProps {
  onLoadTemplate?: (template: FabricTemplate) => void
}

export function TemplateList({ onLoadTemplate }: TemplateListProps) {
  const {
    templates,
    loading,
    error,
    deleteTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
    searchTemplates,
    refreshTemplates,
  } = useTemplateManager()

  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  const displayedTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : templates

  const handleDelete = (id: string) => {
    setTemplateToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (templateToDelete) {
      const success = deleteTemplate(templateToDelete)
      if (success) {
        console.log('Template deletado com sucesso')
      }
    }
    setDeleteDialogOpen(false)
    setTemplateToDelete(null)
  }

  const handleDuplicate = (id: string) => {
    const duplicated = duplicateTemplate(id)
    if (duplicated) {
      console.log('Template duplicado:', duplicated.name)
    }
  }

  const handleExport = (id: string) => {
    const json = exportTemplate(id)
    if (json) {
      // Cria download do JSON
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template-${id}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        const imported = importTemplate(text)
        if (imported) {
          console.log('Template importado:', imported.name)
        } else {
          alert('Erro ao importar template. Verifique o arquivo JSON.')
        }
      }
    }
    input.click()
  }

  const handleLoad = (id: string) => {
    const template = templates.find(t => t.id === id)
    if (template && onLoadTemplate) {
      onLoadTemplate(template.json)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getTemplateBadgeColor = (base: string) => {
    switch (base) {
      case 'perfil':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      case 'comunicado':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'fitness':
        return 'bg-red-500/10 text-red-700 dark:text-red-400'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Meus Templates ({templates.length})
            </CardTitle>
            <CardDescription>
              Gerencie seus templates salvos
            </CardDescription>
          </div>
          <Button onClick={handleImport} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista de Templates */}
        {loading && (
          <div className="text-center text-muted-foreground py-8">
            Carregando templates...
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        {!loading && displayedTemplates.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {searchQuery
              ? 'Nenhum template encontrado para sua busca'
              : 'Nenhum template salvo ainda. Gere um template para começar!'}
          </div>
        )}

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {displayedTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{template.name}</h4>
                      <Badge
                        variant="secondary"
                        className={getTemplateBadgeColor(template.templateBase)}
                      >
                        {template.templateBase}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {template.json.canvas.width}×{template.json.canvas.height} •
                      {template.json.objects.length} objetos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Modificado: {formatDate(template.modifiedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleLoad(template.id)}
                      title="Carregar template"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(template.id)}
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExport(template.id)}
                      title="Exportar JSON"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template.id)}
                      title="Deletar"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Dialog de Confirmação de Delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O template será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
