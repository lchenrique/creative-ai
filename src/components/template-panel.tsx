import { useState } from 'react'
import { Sparkles, Loader2, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { baseTemplates, templateIds } from '@/data/baseTemplates'
import { useTemplateModifier } from '@/hooks/useTemplateModifier'
import { FabricTemplate, TemplateBaseId } from '@/types/templates'

interface TemplatePanelProps {
  onTemplateGenerated?: (template: FabricTemplate) => void
  onLoadTemplate?: (template: FabricTemplate) => void
}

export function TemplatePanel({ onTemplateGenerated, onLoadTemplate }: TemplatePanelProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateBaseId>('perfil')
  const [description, setDescription] = useState('')

  const { modifiedTemplate, loading, error, modifyTemplate, reset } = useTemplateModifier()

  const handleGenerate = async () => {
    if (!description.trim()) {
      alert('Por favor, descreva as modificações que deseja fazer no template')
      return
    }

    const baseTemplate = baseTemplates[selectedTemplateId]
    if (!baseTemplate) {
      alert('Template base não encontrado')
      return
    }

    const result = await modifyTemplate(baseTemplate, description)

    if (result && onTemplateGenerated) {
      onTemplateGenerated(result)
    }
  }

  const handleLoadBase = () => {
    const baseTemplate = baseTemplates[selectedTemplateId]
    if (baseTemplate && onLoadTemplate) {
      reset()
      onLoadTemplate(baseTemplate)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Gerador de Templates com IA
        </CardTitle>
        <CardDescription>
          Escolha um template base e descreva as modificações desejadas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Seletor de Template Base */}
        <div className="space-y-2">
          <Label htmlFor="template-select">Template Base</Label>
          <Select
            value={selectedTemplateId}
            onValueChange={(value) => setSelectedTemplateId(value as TemplateBaseId)}
          >
            <SelectTrigger id="template-select">
              <SelectValue placeholder="Selecione um template" />
            </SelectTrigger>
            <SelectContent>
              {templateIds.map((id) => {
                const template = baseTemplates[id]
                return (
                  <SelectItem key={id} value={id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {template.canvas.width}×{template.canvas.height}
                      </span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadBase}
            className="w-full"
          >
            <FileImage className="w-4 h-4 mr-2" />
            Carregar Template Base
          </Button>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição das Modificações</Label>
          <Textarea
            id="description"
            placeholder="Ex: tema natal, cores vermelhas e verdes, título 'Feliz Natal', fonte elegante..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Descreva cores, textos, estilo, tema, etc. A IA buscará imagens automaticamente.
          </p>
        </div>

        {/* Botão Gerar */}
        <Button
          onClick={handleGenerate}
          disabled={loading || !description.trim()}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando com IA...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Template
            </>
          )}
        </Button>

        {/* Feedback */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {modifiedTemplate && !loading && (
          <div className="p-3 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md text-sm">
            ✓ Template gerado com sucesso! Carregue no canvas para editar.
          </div>
        )}

        {/* Info */}
        <div className="pt-4 border-t space-y-1">
          <p className="text-xs text-muted-foreground">
            <strong>Dica:</strong> Seja específico nas cores, textos e estilo desejado.
          </p>
          <p className="text-xs text-muted-foreground">
            A IA modificará textos, cores, fontes e buscará imagens relacionadas automaticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
