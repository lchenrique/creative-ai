import { Button } from "@/components/ui/button"
import { Palette, Plus, Type, AlignLeft, Circle, Triangle, Minus, Star, Heart, Image, Sparkles, Layers, Shapes } from "lucide-react"
import GradientControl from "../gradient-control"
import { FloatingMenuItem } from "./floating-menu-item"
import { useCreativeStore, INITIAL_COLOR_CONFIG } from "@/stores/creative-store"
import { TextControls } from "../text-controls"
import { ShapeControls } from "../shape-controls"
import { ClipartBrowser } from "../clipart-browser"
import { LayerControls } from "../layer-controls"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

// Re-export for backward compatibility
export { INITIAL_COLOR_CONFIG }

export function FloatingMenus() {
  const updateBackground = useCreativeStore((state) => state.updateBackground)
  const background = useCreativeStore((state) => state.background)
  const addRectangle = useCreativeStore((state) => state.addRectangle)
  const addTextbox = useCreativeStore((state) => state.addTextbox)
  const addCircle = useCreativeStore((state) => state.addCircle)
  const addTriangle = useCreativeStore((state) => state.addTriangle)
  const addLine = useCreativeStore((state) => state.addLine)
  const addStar = useCreativeStore((state) => state.addStar)
  const addHeart = useCreativeStore((state) => state.addHeart)
  const addImage = useCreativeStore((state) => state.addImage)
  const addImageFromURL = useCreativeStore((state) => state.addImageFromURL)
  const convertToImageFrame = useCreativeStore((state) => state.convertToImageFrame)
  const selectedText = useCreativeStore((state) => state.selectedText)
  const fabricCanvas = useCreativeStore((state) => state.fabricCanvas)
  const [selectedShape, setSelectedShape] = useState<any>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null)

  // Monitor selected object to show/hide shape controls
  useEffect(() => {
    if (!fabricCanvas) return

    const handleSelection = () => {
      const active = fabricCanvas.getActiveObject()
      console.log('🎨 FloatingMenus - Objeto ativo:', active?.type)
      // Show shape controls for non-text objects
      if (active && active.type !== 'textbox' && active.type !== 'i-text') {
        console.log('✅ FloatingMenus - Mostrando controles de shape')
        setSelectedShape(active)
      } else {
        console.log('❌ FloatingMenus - Escondendo controles de shape')
        setSelectedShape(null)
      }
    }

    const handleDeselection = () => {
      console.log('🔄 FloatingMenus - Seleção limpa')
      setSelectedShape(null)
    }

    // Verifica se já há algo selecionado ao montar
    const current = fabricCanvas.getActiveObject()
    if (current && current.type !== 'textbox' && current.type !== 'i-text') {
      console.log('🎯 FloatingMenus - Objeto já selecionado ao montar:', current.type)
      setSelectedShape(current)
    }

    fabricCanvas.on('selection:created', handleSelection)
    fabricCanvas.on('selection:updated', handleSelection)
    fabricCanvas.on('selection:cleared', handleDeselection)

    return () => {
      fabricCanvas.off('selection:created', handleSelection)
      fabricCanvas.off('selection:updated', handleSelection)
      fabricCanvas.off('selection:cleared', handleDeselection)
    }
  }, [fabricCanvas])

  console.log('🔍 FloatingMenus - selectedShape:', selectedShape?.type)

  // Função para lidar com upload de imagem
  const handleImageUpload = () => {
    const active = fabricCanvas?.getActiveObject()
    const isShape = active &&
      active.type !== 'textbox' &&
      active.type !== 'i-text' &&
      active.type !== 'image' &&
      active.type !== 'line' &&
      !(active as any)._isClipShell &&
      !(active as any)._isFrameImage

    if (isShape) {
      // Criar input de arquivo customizado que vai mostrar o diálogo depois
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e: any) => {
        const file = e.target.files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string
            setPendingImageUrl(imageUrl)
            setShowImageDialog(true)
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    } else {
      // Adicionar normalmente
      addImage?.()
    }
  }

  return (
    <div className="absolute top-1/2 right-1/2 translate-x-[350px] -translate-y-1/2 flex flex-col gap-3 z-10">
      <FloatingMenuItem
        contentTitle="Fundo"
        trigger={<Button variant="ghost" className="bg-card hover:bg-card/75" size="icon"><Palette /></Button>}
        menuContent={
          <GradientControl
            setColorConfig={(newConfig) => {
              if (typeof newConfig === 'function') {
                const updatedConfig = newConfig(background)
                updateBackground(updatedConfig)
              } else {
                updateBackground(newConfig)
              }
            }}
            colorConfig={background}
            enableGradient
            enableImage
            enableVideo
            enablePattern
          />
        }
      />

      <FloatingMenuItem
        contentTitle="Adicionar Objetos"
        trigger={<Button variant="ghost" className="bg-card hover:bg-card/75" size="icon"><Plus /></Button>}
        menuContent={
          <div className="pt-4 space-y-2 max-h-[500px] overflow-y-auto">
            <Button
              onClick={() => addTextbox?.()}
              variant="secondary"
              className="w-full justify-start"
              disabled={!addTextbox}
            >
              <Type className="w-4 h-4 mr-2" />
              Texto
            </Button>
            <Button
              onClick={() => addRectangle?.()}
              variant="secondary"
              className="w-full justify-start"
              disabled={!addRectangle}
            >
              <Plus className="w-4 h-4 mr-2" />
              Retângulo
            </Button>
            <Button
              onClick={() => addCircle?.()}
              variant="secondary"
              className="w-full justify-start"
              disabled={!addCircle}
            >
              <Circle className="w-4 h-4 mr-2" />
              Círculo
            </Button>
            <Button
              onClick={() => addTriangle?.()}
              variant="secondary"
              className="w-full justify-start"
              disabled={!addTriangle}
            >
              <Triangle className="w-4 h-4 mr-2" />
              Triângulo
            </Button>
            <Button
              onClick={() => addLine?.()}
              variant="secondary"
              className="w-full justify-start"
              disabled={!addLine}
            >
              <Minus className="w-4 h-4 mr-2" />
              Linha
            </Button>
            <Button
              onClick={() => addStar?.()}
              variant="secondary"
              className="w-full justify-start"
              disabled={!addStar}
            >
              <Star className="w-4 h-4 mr-2" />
              Estrela
            </Button>
            <Button
              onClick={() => addHeart?.()}
              variant="secondary"
              className="w-full justify-start"
              disabled={!addHeart}
            >
              <Heart className="w-4 h-4 mr-2" />
              Coração
            </Button>
            <Button
              onClick={handleImageUpload}
              variant="secondary"
              className="w-full justify-start"
            >
              <Image className="w-4 h-4 mr-2" />
              Upload Imagem
            </Button>
          </div>
        }
      />

      <FloatingMenuItem
        contentTitle="Clipart"
        trigger={<Button variant="ghost" className="bg-card hover:bg-card/75" size="icon"><Sparkles /></Button>}
        menuContent={
          <ClipartBrowser
            onSelectImage={(imageUrl) => {
              // Verifica se há uma forma selecionada (não texto, não imagem)
              const active = fabricCanvas?.getActiveObject()
              const isShape = active &&
                active.type !== 'textbox' &&
                active.type !== 'i-text' &&
                active.type !== 'image' &&
                active.type !== 'line' &&
                !(active as any)._isClipShell &&
                !(active as any)._isFrameImage

              if (isShape) {
                // Mostrar diálogo perguntando
                setPendingImageUrl(imageUrl)
                setShowImageDialog(true)
              } else {
                // Adicionar normalmente
                addImageFromURL?.(imageUrl)
              }
            }}
          />
        }
      />

      {/* Layers Control */}
      <FloatingMenuItem
        contentTitle="Camadas"
        trigger={<Button variant="ghost" className="bg-card hover:bg-card/75" size="icon"><Layers /></Button>}
        menuContent={<LayerControls canvas={fabricCanvas} />}
      />

      {/* Text Controls - Only visible when text is selected */}
      {selectedText && (
        <FloatingMenuItem
          contentTitle="Controles de Texto"
          trigger={<Button variant="ghost" className="bg-card hover:bg-card/75" size="icon"><AlignLeft /></Button>}
          menuContent={<TextControls />}
        />
      )}

      {/* Shape Controls - Only visible when shape is selected */}
      {selectedShape && (
        <FloatingMenuItem
          contentTitle="Controles de Elemento"
          trigger={<Button variant="ghost" className="bg-card hover:bg-card/75" size="icon"><Shapes /></Button>}
          menuContent={<ShapeControls />}
        />
      )}

      {/* Dialog: Adicionar como moldura ou normalmente? */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Como deseja adicionar a imagem?</DialogTitle>
            <DialogDescription>
              Você tem uma forma selecionada. Escolha como adicionar a imagem:
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => {
                if (pendingImageUrl && convertToImageFrame) {
                  convertToImageFrame(pendingImageUrl)
                }
                setShowImageDialog(false)
                setPendingImageUrl(null)
              }}
            >
              <span className="text-2xl">🖼️</span>
              <span className="text-sm font-medium">Dentro da Moldura</span>
              <span className="text-xs text-muted-foreground">Imagem recortada na forma</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => {
                if (pendingImageUrl && addImageFromURL) {
                  addImageFromURL(pendingImageUrl)
                }
                setShowImageDialog(false)
                setPendingImageUrl(null)
              }}
            >
              <span className="text-2xl">📷</span>
              <span className="text-sm font-medium">Fora (Normal)</span>
              <span className="text-xs text-muted-foreground">Adicionar ao canvas</span>
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowImageDialog(false)
                setPendingImageUrl(null)
              }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
