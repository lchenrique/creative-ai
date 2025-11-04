import { Button } from "@/components/ui/button"
import { Palette, Plus, Type, AlignLeft, Circle, Triangle, Minus, Star, Heart, Image, Sparkles } from "lucide-react"
import GradientControl from "../gradient-control"
import { FloatingMenuItem } from "./floating-menu-item"
import { useCreativeStore, INITIAL_COLOR_CONFIG } from "@/stores/creative-store"
import { TextControls } from "../text-controls"
import { ClipartBrowser } from "../clipart-browser"

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
  const selectedText = useCreativeStore((state) => state.selectedText)

  return (
    <div className="absolute top-0 -right-15 flex flex-col gap-3">
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
          <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
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
              onClick={() => addImage?.()}
              variant="secondary"
              className="w-full justify-start"
              disabled={!addImage}
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
              if (addImageFromURL) {
                addImageFromURL(imageUrl)
              }
            }}
          />
        }
      />

      {/* Text Controls - Only visible when text is selected */}
      {selectedText && (
        <FloatingMenuItem
          contentTitle="Controles de Texto"
          trigger={<Button variant="ghost" className="bg-card hover:bg-card/75" size="icon"><AlignLeft /></Button>}
          menuContent={<TextControls />}
        />
      )}
    </div>
  )
}
