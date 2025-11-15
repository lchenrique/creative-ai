"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  INITIAL_COLOR_CONFIG,
  useCreativeStore,
} from "@/stores/creative-store";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Italic,
  Droplet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FontCombobox } from "./font-combobox";
import GradientColorPicker from "./gradient-color-picker";
import GradientControl, { type ColorConfig } from "./gradient-control";

export function TextControls() {
  const updateElementConfig = useCreativeStore(
    (state) => state.updateSelectedElements,
  );
  const selectedIds = useCreativeStore((state) => state.selectedCanvasIds);
  const element = useCreativeStore((state) =>
    state.canvasElements.find(
      (el) => el.id === selectedIds[0] && el.type === "text",
    ),
  );

  if (!element) return null;

  const fontWeights = [
    { value: "300", label: "Light" },
    { value: "400", label: "Normal" },
    { value: "500", label: "Medium" },
    { value: "600", label: "Semibold" },
    { value: "700", label: "Bold" },
    { value: "800", label: "Extrabold" },
  ];

  return (
    <div className="space-y-4  overflow-auto mb-14">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Fonte</Label>
        <FontCombobox
          value={element.fontFamily}
          onValueChange={(value) => {
            console.log("Changing font to:", value);
            updateElementConfig({ fontFamily: value });
          }}
          className="w-full"
        />
      </div>

      {/* Cor da Fonte */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Cor da Fonte</Label>
        <GradientControl
          colorConfig={{
            colorType: "solid",
            solidColor: element.color,
            gradient: INITIAL_COLOR_CONFIG.gradient,
            pattern: null,
            image: null,
            video: null,
          }}
          setColorConfig={(newConfig) => {
            if (typeof newConfig === "function") {
              const updatedConfig = newConfig(
                element.background || INITIAL_COLOR_CONFIG,
              );
              updateElementConfig({ color: updatedConfig.solidColor });
            } else {
              updateElementConfig({ color: newConfig.solidColor });
            }
          }}
          enableGradient={false}
          enablePattern={false}
          enableImage={false}
          enableVideo={false}
        />
      </div>

      {/* Tamanho da Fonte */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Tamanho</Label>
          <span className="text-sm text-muted-foreground">
            {element.fontSize}px
          </span>
        </div>
        <Slider
          value={[element.fontSize || 16]}
          onValueChange={(value) => updateElementConfig({ fontSize: value[0] })}
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
              variant={
                element.fontWeight === weight.value ? "default" : "outline"
              }
              size="sm"
              onClick={() => updateElementConfig({ fontWeight: weight.value })}
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
          <Label className="text-sm font-medium">
            Espaçamento entre Letras
          </Label>
          <span className="text-sm text-muted-foreground">
            {element.letterSpacing || 0}px
          </span>
        </div>
        <Slider
          value={[element.letterSpacing || 0]}
          onValueChange={(value) =>
            updateElementConfig({ letterSpacing: value[0] })
          }
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
          <span className="text-sm text-muted-foreground">
            {(element.lineHeight || 1.2).toFixed(2)}
          </span>
        </div>
        <Slider
          value={[element.lineHeight || 1.2]}
          onValueChange={(value) =>
            updateElementConfig({ lineHeight: value[0] })
          }
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
          value={element.fontStyle || "normal"}
          onValueChange={(value) => {
            if (value)
              updateElementConfig({ fontStyle: value as "normal" | "italic" });
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
          value={element.textAlign || "left"}
          onValueChange={(value) => {
            if (value)
              updateElementConfig({
                textAlign: value as "left" | "center" | "right" | "justify",
              });
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

      {/* Sombra */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Droplet className="w-4 h-4" />
            Sombra
          </Label>
          <Button
            variant={element.shadowEnabled ? "default" : "outline"}
            size="sm"
            onClick={() =>
              updateElementConfig({ shadowEnabled: !element.shadowEnabled })
            }
            className="text-xs h-7"
          >
            {element.shadowEnabled ? "Ativada" : "Desativada"}
          </Button>
        </div>

        {element.shadowEnabled && (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            {/* Cor da Sombra */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Cor da Sombra</Label>
              <GradientControl
                colorConfig={{
                  colorType: "solid",
                  solidColor: element.shadowColor || "rgba(0,0,0,0.5)",
                  gradient: INITIAL_COLOR_CONFIG.gradient,
                  pattern: null,
                  image: null,
                  video: null,
                }}
                setColorConfig={(newConfig) => {
                  if (typeof newConfig === "function") {
                    const updatedConfig = newConfig(
                      element.background || INITIAL_COLOR_CONFIG,
                    );
                    updateElementConfig({
                      shadowColor: updatedConfig.solidColor,
                    });
                  } else {
                    updateElementConfig({ shadowColor: newConfig.solidColor });
                  }
                }}
                enableGradient={false}
                enablePattern={false}
                enableImage={false}
                enableVideo={false}
              />
            </div>

            {/* Deslocamento X */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium">Deslocamento X</Label>
                <span className="text-xs text-muted-foreground">
                  {element.shadowX || 0}px
                </span>
              </div>
              <Slider
                value={[element.shadowX || 0]}
                onValueChange={(value) =>
                  updateElementConfig({ shadowX: value[0] })
                }
                min={-50}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Deslocamento Y */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium">Deslocamento Y</Label>
                <span className="text-xs text-muted-foreground">
                  {element.shadowY || 0}px
                </span>
              </div>
              <Slider
                value={[element.shadowY || 0]}
                onValueChange={(value) =>
                  updateElementConfig({ shadowY: value[0] })
                }
                min={-50}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Desfoque */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium">Desfoque</Label>
                <span className="text-xs text-muted-foreground">
                  {element.shadowBlur || 0}px
                </span>
              </div>
              <Slider
                value={[element.shadowBlur || 0]}
                onValueChange={(value) =>
                  updateElementConfig({ shadowBlur: value[0] })
                }
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
