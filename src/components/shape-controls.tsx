"use client";

import { useCanvasStore } from "@/stores/canva-store";
import GradientControl from "./gradient-control";

export const ShapeControls = () => {
  const selecteds = useCanvasStore((state) => state.selected);
  const updateElementConfig = useCanvasStore((state) => state.updateElementConfig);
  return (
    <div
      data-slot="floating-menu-content"
      className="w-full h-full flex flex-col overflow-hidden"
    >
      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* SEÇÃO: COR E PREENCHIMENTO (sempre mostrar) */}
        <div className="flex flex-col gap-2">
          <GradientControl
            label="Cor de Fundo"
            colorConfig={selecteds[0]?.config.style.backgroundColor || {
              type: "solid",
              value: "#FFFFFF",
            }}
            setColorConfig={(type, value) => {
              selecteds.forEach((el) => {
                updateElementConfig?.((el?.id || "") as string, {
                  style: {
                    backgroundColor: {
                      type,
                      value,
                    },
                  },
                })
              });

            }}
          />
        </div>

        {/* SEÇÃO: CORES DO SVG (se for clipart) */}
        {/* {isSVGClipart && element.svgColors && element.svgColors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cores do Clipart SVG
            </h3>
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
              {element.svgColors.map((color, index) => {
                // Encontrar a cor atual (pode ter sido modificada)
                const currentColor = element.svgColors?.[index] || color;

                return (
                  <div key={`svg-color-${index}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Cor {index + 1}
                      </label>
                      <div
                        className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600"
                        style={{ backgroundColor: currentColor }}
                      />
                    </div>

                    <ColorPicker
                      key={`picker-${index}`}
                      background={currentColor}
                      setBackground={(newColor) =>
                        handleSVGColorChange(color, newColor)
                      }
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Edite as cores do seu clipart SVG facilmente
            </p>
          </div>
        )} */}

        {/* SEÇÃO: DIMENSÕES */}
        {/* <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center text-xs bg-slate-200 dark:bg-slate-800 rounded">
              ↔
            </span>
            Size
          </h3>
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Width
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {Math.round(element.w)}px
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <Slider
                  value={[element.w]}
                  onValueChange={(value) =>
                    updateElementConfig({ w: value[0] })
                  }
                  min={10}
                  max={1000}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={Math.round(element.w)}
                  onChange={(e) =>
                    updateElementConfig({ w: Number(e.target.value) })
                  }
                  className="w-16 text-sm h-8 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Height
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {Math.round(element.h)}px
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <Slider
                  value={[element.h]}
                  onValueChange={(value) =>
                    updateElementConfig({ h: value[0] })
                  }
                  min={10}
                  max={1000}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={Math.round(element.h)}
                  onChange={(e) =>
                    updateElementConfig({ h: Number(e.target.value) })
                  }
                  className="w-16 text-sm h-8 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          </div>
        </div> */}

        {/* SEÇÃO: ROTAÇÃO E TRANSFORMAÇÃO */}
        {/* <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center">⟲</span>
            Transform
          </h3>
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Rotation
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {Math.round(element.angle)}°
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <Slider
                  value={[element.angle]}
                  onValueChange={(value) =>
                    updateElementConfig({ angle: value[0] })
                  }
                  min={0}
                  max={360}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={Math.round(element.angle)}
                  onChange={(e) =>
                    updateElementConfig({ angle: Number(e.target.value) })
                  }
                  className="w-16 text-sm h-8 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent"
                title="Rotate counter-clockwise"
                onClick={() =>
                  updateElementConfig({ angle: (element.angle - 15) % 360 })
                }
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent"
                title="Rotate clockwise"
                onClick={() =>
                  updateElementConfig({ angle: (element.angle + 15) % 360 })
                }
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div> */}

        {/* SEÇÃO: OPACIDADE */}
        {/* <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center">◐</span>
            Opacity
          </h3>
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Opacity
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {Math.round((element.opacity ?? 1) * 100)}%
              </span>
            </div>
            <Slider
              value={[(element.opacity ?? 1) * 100]}
              onValueChange={(value) =>
                updateElementConfig({ opacity: value[0] / 100 })
              }
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div> */}

        {/* SEÇÃO: ARREDONDAMENTO */}
        {/* <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Circle className="w-4 h-4" />
            Arredondamento
          </h3>
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Border Radius
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {element.borderRadius || 0}px
              </span>
            </div>
            <Slider
              value={[element.borderRadius || 0]}
              onValueChange={(value) =>
                updateElementConfig({ borderRadius: value[0] })
              }
              min={0}
              max={Math.min(element.w, element.h) / 2}
              step={1}
              className="w-full"
            />
          </div>
        </div> */}

        {/* SEÇÃO: BLEND MODE */}
        {/* <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Blend Mode
          </h3>
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Modo de Mistura
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {element.blendMode || "normal"}
              </span>
            </div>
            <select
              value={element.blendMode || "normal"}
              onChange={(e) =>
                updateElementConfig({ blendMode: e.target.value as BlendMode })
              }
              className="w-full h-9 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="darken">Darken</option>
              <option value="lighten">Lighten</option>
              <option value="color-dodge">Color Dodge</option>
              <option value="color-burn">Color Burn</option>
              <option value="hard-light">Hard Light</option>
              <option value="soft-light">Soft Light</option>
              <option value="difference">Difference</option>
              <option value="exclusion">Exclusion</option>
              <option value="hue">Hue</option>
              <option value="saturation">Saturation</option>
              <option value="color">Color</option>
              <option value="luminosity">Luminosity</option>
            </select>
          </div>
        </div> */}

        {/* SEÇÃO: SOMBRA */}
        {/* <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Droplet className="w-4 h-4" />
              Sombra
            </h3>
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
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Cor da Sombra
                </label>
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
                      updateElementConfig({
                        shadowColor: newConfig.solidColor,
                      });
                    }
                  }}
                  enableGradient={false}
                  enablePattern={false}
                  enableImage={false}
                  enableVideo={false}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Deslocamento X
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
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
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Deslocamento Y
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
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
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Desfoque
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
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
                />
              </div>
            </div>
          )}
        </div> */}

        {/* SEÇÃO: ALINHAMENTO */}
        {/* <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center text-xs">
              ⊞
            </span>
            Alignment
          </h3>
          <div className="space-y-2 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent"
                title="Align left"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent"
                title="Align center"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent"
                title="Align right"
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent"
                title="Align top"
              >
                <AlignTop className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent"
                title="Align middle"
              >
                <AlignMiddle className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 bg-transparent"
                title="Align bottom"
              >
                <AlignBottom className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Footer Actions */}
      {/* <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 text-slate-700 dark:text-slate-300 bg-transparent"
        >
          <Minus className="w-4 h-4 mr-1" />
          Remove
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-1" />
          Duplicate
        </Button>
      </div> */}
    </div>
  );
};
