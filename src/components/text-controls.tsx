"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { INITIAL_COLOR_CONFIG, useCreativeStore } from "@/stores/creative-store"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Italic
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { FontCombobox } from "./font-combobox"
import GradientColorPicker from "./gradient-color-picker"
import { type ColorConfig } from "./gradient-control"

export function TextControls() {
  const selectedText = useCreativeStore((state) => state.selectedText)
  const updateTextProperty = useCreativeStore((state) => state.updateTextProperty)

  const [colorConfig, setColorConfig] = useState<ColorConfig>(INITIAL_COLOR_CONFIG)
  const isUpdatingFromStore = useRef(false)

  // Sincroniza o estado local com o store (quando o texto selecionado muda)
  useEffect(() => {
    if (selectedText) {
      isUpdatingFromStore.current = true
      setColorConfig(selectedText.fill)
    }
  }, [selectedText])

  // Sincroniza o store com o estado local (quando o usuário muda a cor na UI)
  useEffect(() => {
    if (isUpdatingFromStore.current) {
      isUpdatingFromStore.current = false
      return
    }

    if (selectedText && JSON.stringify(colorConfig) !== JSON.stringify(selectedText.fill)) {
      updateTextProperty({ fill: colorConfig })
    }
  }, [colorConfig, selectedText, updateTextProperty])

  if (!selectedText) return null

  const fontWeights = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semibold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extrabold' },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Fonte */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Fonte</Label>
        <FontCombobox
          value={selectedText.fontFamily}
          onValueChange={(value) => updateTextProperty({ fontFamily: value })}
          className="w-full"
        />
      </div>

      {/* Cor da Fonte */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Cor da Fonte</Label>
        <GradientColorPicker
          colorConfig={colorConfig}
          setColorConfig={setColorConfig}
          enableGradient={true}
          enablePattern={false}
          enableImage={false}
          enableVideo={false}
        />
      </div>

      {/* Tamanho da Fonte */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Tamanho</Label>
          <span className="text-sm text-muted-foreground">{selectedText.fontSize}px</span>
        </div>
        <Slider
          value={[selectedText.fontSize]}
          onValueChange={(value) => updateTextProperty({ fontSize: value[0] })}
          min={8}
          max={200}
          step={1}
          className="w-full"
        />
      </div>

      {/* Peso da Fonte */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Peso da Fonte</Label>
        <div className="grid grid-cols-3 gap-2">
          {fontWeights.map((weight) => (
            <Button
              key={weight.value}
              variant={selectedText.fontWeight === weight.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateTextProperty({ fontWeight: weight.value })}
              className="text-xs"
            >
              {weight.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Espaçamento entre Letras */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Espaçamento entre Letras</Label>
          <span className="text-sm text-muted-foreground">{selectedText.letterSpacing}px</span>
        </div>
        <Slider
          value={[selectedText.letterSpacing]}
          onValueChange={(value) => updateTextProperty({ letterSpacing: value[0] })}
          min={-50}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Altura da Linha */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Altura da Linha</Label>
          <span className="text-sm text-muted-foreground">{selectedText.lineHeight.toFixed(2)}</span>
        </div>
        <Slider
          value={[selectedText.lineHeight]}
          onValueChange={(value) => updateTextProperty({ lineHeight: value[0] })}
          min={0.5}
          max={3}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Estilo da Fonte */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Estilo</Label>
        <ToggleGroup
          type="single"
          value={selectedText.fontStyle}
          onValueChange={(value) => {
            if (value) updateTextProperty({ fontStyle: value as 'normal' | 'italic' })
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="normal" aria-label="Normal">
            Normal
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Itálico">
            <Italic className="h-4 w-4 mr-2" />
            Itálico
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Alinhamento */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Alinhamento</Label>
        <ToggleGroup
          type="single"
          value={selectedText.textAlign}
          onValueChange={(value) => {
            if (value) updateTextProperty({ textAlign: value as 'left' | 'center' | 'right' | 'justify' })
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="left" aria-label="Alinhar à esquerda">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Centralizar">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Alinhar à direita">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="Justificar">
            <AlignJustify className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
