"use client";

import { useCanvasStore, type ColorConfig } from "@/stores/canva-store";
import { useEffect, useState, useRef } from "react";
import {
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ColorPicker } from "@/components/color-picker";
import { FontCombobox } from "@/components/font-combobox";
import GradientControl from "@/components/gradient-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Section collapsible component (similar to library)
function Section({
  title,
  icon,
  children,
  isExpanded,
  onToggle,
  rightElement,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="group border-b border-border/50 last:border-b-0">
      <div className="flex w-full items-center justify-between py-3">
        <button
          onClick={onToggle}
          className="flex flex-1 items-center justify-between text-sm font-medium px-3 py-1 rounded-md hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-foreground/80 group-hover:text-foreground">
            {icon && (
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                {icon}
              </span>
            )}
            <span>{title}</span>
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-90",
            )}
          />
        </button>
        {rightElement && (
          <div className="ml-2" onClick={(e) => e.stopPropagation()}>
            {rightElement}
          </div>
        )}
      </div>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

const fontWeights = [
  { value: "100", label: "Thin" },
  { value: "200", label: "Extra Light" },
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" },
];

export const TextController = () => {
  const selectedIds = useCanvasStore((state) => state.selectedIds);
  const elements = useCanvasStore((state) => state.elements);
  const updateElementConfig = useCanvasStore(
    (state) => state.updateElementConfig,
  );

  // Find selected text element
  const selectedElement = elements.find(
    (el) => selectedIds.includes(el.id) && el.type === "text",
  );

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    font: true,
    color: true,
    stroke: false,
    shadow: false,
    background: false,
    spacing: false,
    opacity: false,
  });

  // Local state for font
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState("400");
  const [fontStyle, setFontStyle] = useState<"normal" | "italic">("normal");
  const [textDecoration, setTextDecoration] = useState<string>("none");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "left",
  );

  // Local state for color config
  const [textColorConfig, setTextColorConfig] = useState<ColorConfig>({
    type: "solid",
    value: "#000000",
  });

  const [bgColorConfig, setBgColorConfig] = useState<ColorConfig>({
    type: "solid",
    value: "transparent",
  });

  // Local state for stroke
  const [strokeEnabled, setStrokeEnabled] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [strokeColor, setStrokeColor] = useState("#000000");

  // Local state for shadow
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowX, setShadowX] = useState(2);
  const [shadowY, setShadowY] = useState(2);
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowColor, setShadowColor] = useState("#00000040");

  // Local state for spacing
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);

  // Local state for opacity
  const [opacity, setOpacity] = useState(100);

  // Ref for tracking current element
  const currentIdRef = useRef<string | null>(null);

  // Ref para rastrear o fontSize atual do store
  const lastFontSizeRef = useRef<number | null>(null);

  // Sync local state when selected element changes or element updates
  useEffect(() => {
    const selectedId = selectedIds[0];
    const freshElement = elements.find((el) => el.id === selectedId);

    if (selectedId && freshElement?.type === "text") {
      const style = freshElement.config.style;
      // Só usa fallback 24 se fontSize realmente não existir no store
      const storeFontSize =
        style.fontSize !== undefined ? Math.round(style.fontSize) : 24;

      // Só atualiza tudo quando muda o elemento selecionado
      if (selectedId !== currentIdRef.current) {
        // Font (incluindo fontSize na inicialização)
        setFontFamily(style.fontFamily || "Inter");
        setFontSize(storeFontSize);
        lastFontSizeRef.current = storeFontSize;
        setFontWeight(String(style.fontWeight || 400));
        setFontStyle((style.fontStyle as "normal" | "italic") || "normal");
        setTextAlign(style.textAlign || "left");

        // Text color
        if (style.color) {
          setTextColorConfig({ type: "solid", value: style.color });
        }

        // Background
        if (style.backgroundColor) {
          setBgColorConfig(style.backgroundColor);
        }

        // Stroke (parse WebkitTextStroke)
        if (style.WebkitTextStroke) {
          const match = style.WebkitTextStroke.match(
            /(\d+(?:\.\d+)?)px\s+(.+)/,
          );
          if (match) {
            setStrokeEnabled(true);
            setStrokeWidth(parseFloat(match[1]));
            setStrokeColor(match[2]);
          }
        } else {
          setStrokeEnabled(false);
          setStrokeWidth(1);
          setStrokeColor("#000000");
        }

        // Shadow (parse textShadow)
        if (style.textShadow) {
          const match = style.textShadow.match(
            /(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(.+)/,
          );
          if (match) {
            setShadowEnabled(true);
            setShadowX(parseFloat(match[1]));
            setShadowY(parseFloat(match[2]));
            setShadowBlur(parseFloat(match[3]));
            setShadowColor(match[4]);
          }
        } else {
          setShadowEnabled(false);
          setShadowX(2);
          setShadowY(2);
          setShadowBlur(4);
          setShadowColor("#00000040");
        }

        // Spacing
        setLetterSpacing(style.letterSpacing || 0);
        setLineHeight(style.lineHeight || 1.2);

        currentIdRef.current = selectedId;
      } else {
        // Mesmo elemento - só sincroniza fontSize se mudou no store (ex: via resize)
        if (
          lastFontSizeRef.current !== null &&
          lastFontSizeRef.current !== storeFontSize
        ) {
          setFontSize(storeFontSize);
          lastFontSizeRef.current = storeFontSize;
        }
      }
    } else if (!selectedId) {
      currentIdRef.current = null;
      lastFontSizeRef.current = null;
    }
  }, [selectedIds, elements]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Update handlers
  const handleFontChange = (
    updates: Partial<{
      fontFamily: string;
      fontSize: number;
      fontWeight: string;
      fontStyle: "normal" | "italic";
      textAlign: "left" | "center" | "right";
    }>,
  ) => {
    if (updates.fontFamily !== undefined) setFontFamily(updates.fontFamily);
    if (updates.fontSize !== undefined) {
      const rounded = Math.round(updates.fontSize);
      setFontSize(rounded);
      lastFontSizeRef.current = rounded; // Atualiza ref para evitar loop
    }
    if (updates.fontWeight !== undefined) setFontWeight(updates.fontWeight);
    if (updates.fontStyle !== undefined) setFontStyle(updates.fontStyle);
    if (updates.textAlign !== undefined) setTextAlign(updates.textAlign);

    // Cria objeto só com as propriedades que realmente foram passadas
    const styleUpdates: Record<string, unknown> = {};

    if (updates.fontFamily !== undefined) {
      styleUpdates.fontFamily = updates.fontFamily;
    }
    if (updates.fontSize !== undefined) {
      styleUpdates.fontSize = Math.round(updates.fontSize);
    }
    if (updates.fontWeight !== undefined) {
      styleUpdates.fontWeight = Number(updates.fontWeight);
    }
    if (updates.fontStyle !== undefined) {
      styleUpdates.fontStyle = updates.fontStyle;
    }
    if (updates.textAlign !== undefined) {
      styleUpdates.textAlign = updates.textAlign;
    }

    selectedIds.forEach((id) => {
      updateElementConfig?.(id, {
        style: styleUpdates,
      });

      // Recalcula tamanho do elemento após mudar fonte
      if (updates.fontSize !== undefined || updates.fontFamily !== undefined) {
        requestAnimationFrame(() => {
          const wrapper = document.querySelector(
            `[data-element-id="${id}"]`,
          ) as HTMLElement;
          const textEl = wrapper?.querySelector(
            '[data-element-type="text"]',
          ) as HTMLElement;

          if (wrapper && textEl) {
            const newHeight = textEl.offsetHeight;
            const newWidth = textEl.offsetWidth;
            wrapper.style.height = `${newHeight}px`;
            wrapper.style.width = `${newWidth}px`;
            updateElementConfig?.(id, {
              size: { height: newHeight, width: newWidth },
            });
            // Dispara evento para atualizar o Moveable em tempo real
            window.dispatchEvent(new CustomEvent("moveable-update-rect"));
          }
        });
      }
    });
  };

  const handleTextColorChange = (config: ColorConfig) => {
    setTextColorConfig(config);
    if (config.type === "solid") {
      selectedIds.forEach((id) => {
        updateElementConfig?.(id, {
          style: { color: config.value },
        });
      });
    }
  };

  const handleBgColorChange = (config: ColorConfig) => {
    setBgColorConfig(config);
    selectedIds.forEach((id) => {
      updateElementConfig?.(id, {
        style: { backgroundColor: config },
      });
    });
  };

  const handleStrokeToggle = (enabled: boolean) => {
    setStrokeEnabled(enabled);
    if (enabled) {
      const strokeValue = `${strokeWidth}px ${strokeColor}`;
      selectedIds.forEach((id) => {
        updateElementConfig?.(id, {
          style: { WebkitTextStroke: strokeValue },
        });
      });
    } else {
      selectedIds.forEach((id) => {
        updateElementConfig?.(id, {
          style: { WebkitTextStroke: undefined },
        });
      });
    }
  };

  const handleStrokeChange = (width: number, color: string) => {
    setStrokeWidth(width);
    setStrokeColor(color);
    if (strokeEnabled) {
      const strokeValue = `${width}px ${color}`;
      selectedIds.forEach((id) => {
        updateElementConfig?.(id, {
          style: { WebkitTextStroke: strokeValue },
        });
      });
    }
  };

  const handleShadowToggle = (enabled: boolean) => {
    setShadowEnabled(enabled);
    if (enabled) {
      const shadowValue = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`;
      selectedIds.forEach((id) => {
        updateElementConfig?.(id, {
          style: { textShadow: shadowValue },
        });
      });
    } else {
      selectedIds.forEach((id) => {
        updateElementConfig?.(id, {
          style: { textShadow: undefined },
        });
      });
    }
  };

  const handleShadowChange = (
    x: number,
    y: number,
    blur: number,
    color: string,
  ) => {
    setShadowX(x);
    setShadowY(y);
    setShadowBlur(blur);
    setShadowColor(color);
    if (shadowEnabled) {
      const shadowValue = `${x}px ${y}px ${blur}px ${color}`;
      selectedIds.forEach((id) => {
        updateElementConfig?.(id, {
          style: { textShadow: shadowValue },
        });
      });
    }
  };

  const handleSpacingChange = (
    updates: Partial<{
      letterSpacing: number;
      lineHeight: number;
    }>,
  ) => {
    if (updates.letterSpacing !== undefined)
      setLetterSpacing(updates.letterSpacing);
    if (updates.lineHeight !== undefined) setLineHeight(updates.lineHeight);

    selectedIds.forEach((id) => {
      updateElementConfig?.(id, {
        style: updates,
      });
    });
  };

  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Selecione um elemento de texto para editar
      </div>
    );
  }

  return (
    <div
      data-slot="floating-menu-content"
      className="w-full h-full flex flex-col overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto">
        {/* FONT SECTION */}
        <Section
          title="Fonte"
          isExpanded={expandedSections.font}
          onToggle={() => toggleSection("font")}
        >
          <div className="space-y-4">
            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Familia
              </label>
              <FontCombobox
                value={fontFamily}
                onValueChange={(value) =>
                  handleFontChange({ fontFamily: value })
                }
                className="w-full"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground">
                  Tamanho
                </label>
                <span className="text-xs text-muted-foreground font-mono">
                  {fontSize}px
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) =>
                    handleFontChange({ fontSize: value[0] })
                  }
                  min={8}
                  max={200}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={fontSize}
                  onChange={(e) =>
                    handleFontChange({ fontSize: Number(e.target.value) })
                  }
                  className="w-16 text-sm h-8"
                />
              </div>
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Peso
              </label>
              <Select
                value={fontWeight}
                onValueChange={(value) =>
                  handleFontChange({ fontWeight: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o peso" />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label} ({weight.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Style toggles: Bold, Italic */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Estilo
              </label>
              <div className="flex gap-2">
                <ToggleGroup
                  type="single"
                  value={fontStyle}
                  onValueChange={(value) => {
                    if (value)
                      handleFontChange({
                        fontStyle: value as "normal" | "italic",
                      });
                  }}
                >
                  <ToggleGroupItem
                    value="normal"
                    aria-label="Normal"
                    className="px-3"
                  >
                    <span className="text-sm">Aa</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="italic"
                    aria-label="Italico"
                    className="px-3"
                  >
                    <Italic className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Text Align */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Alinhamento
              </label>
              <ToggleGroup
                type="single"
                value={textAlign}
                onValueChange={(value) => {
                  if (value)
                    handleFontChange({
                      textAlign: value as "left" | "center" | "right",
                    });
                }}
                className="justify-start"
              >
                <ToggleGroupItem value="left" aria-label="Alinhar a esquerda">
                  <AlignLeft className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="Centralizar">
                  <AlignCenter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="Alinhar a direita">
                  <AlignRight className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </Section>

        {/* COLOR SECTION */}
        <Section
          title="Cor"
          isExpanded={expandedSections.color}
          onToggle={() => toggleSection("color")}
        >
          <div className="space-y-3">
            <GradientControl
              colorConfig={textColorConfig}
              setColorConfig={handleTextColorChange}
              enableGradient={false}
            />
          </div>
        </Section>

        {/* STROKE SECTION */}
        <Section
          title="Stroke"
          isExpanded={expandedSections.stroke}
          onToggle={() => toggleSection("stroke")}
          rightElement={
            <Switch
              checked={strokeEnabled}
              onCheckedChange={handleStrokeToggle}
            />
          }
        >
          <div
            className={cn(
              "space-y-4",
              !strokeEnabled && "opacity-50 pointer-events-none",
            )}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground">
                  Espessura
                </label>
                <span className="text-xs text-muted-foreground font-mono">
                  {strokeWidth}px
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <Slider
                  value={[strokeWidth]}
                  onValueChange={(value) =>
                    handleStrokeChange(value[0], strokeColor)
                  }
                  min={0.5}
                  max={10}
                  step={0.5}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={strokeWidth}
                  onChange={(e) =>
                    handleStrokeChange(Number(e.target.value), strokeColor)
                  }
                  className="w-16 text-sm h-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Cor do Stroke
              </label>
              <ColorPicker
                background={strokeColor}
                setBackground={(color) =>
                  handleStrokeChange(strokeWidth, color)
                }
              />
            </div>
          </div>
        </Section>

        {/* SHADOW SECTION */}
        <Section
          title="Shadow"
          isExpanded={expandedSections.shadow}
          onToggle={() => toggleSection("shadow")}
          rightElement={
            <Switch
              checked={shadowEnabled}
              onCheckedChange={handleShadowToggle}
            />
          }
        >
          <div
            className={cn(
              "space-y-4",
              !shadowEnabled && "opacity-50 pointer-events-none",
            )}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-muted-foreground">
                    X
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {shadowX}px
                  </span>
                </div>
                <Slider
                  value={[shadowX]}
                  onValueChange={(value) =>
                    handleShadowChange(
                      value[0],
                      shadowY,
                      shadowBlur,
                      shadowColor,
                    )
                  }
                  min={-20}
                  max={20}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-muted-foreground">
                    Y
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {shadowY}px
                  </span>
                </div>
                <Slider
                  value={[shadowY]}
                  onValueChange={(value) =>
                    handleShadowChange(
                      shadowX,
                      value[0],
                      shadowBlur,
                      shadowColor,
                    )
                  }
                  min={-20}
                  max={20}
                  step={1}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground">
                  Blur
                </label>
                <span className="text-xs text-muted-foreground font-mono">
                  {shadowBlur}px
                </span>
              </div>
              <Slider
                value={[shadowBlur]}
                onValueChange={(value) =>
                  handleShadowChange(shadowX, shadowY, value[0], shadowColor)
                }
                min={0}
                max={50}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Cor da Sombra
              </label>
              <ColorPicker
                background={shadowColor}
                setBackground={(color) =>
                  handleShadowChange(shadowX, shadowY, shadowBlur, color)
                }
              />
            </div>
          </div>
        </Section>

        {/* BACKGROUND SECTION */}
        <Section
          title="Background"
          isExpanded={expandedSections.background}
          onToggle={() => toggleSection("background")}
        >
          <div className="space-y-3">
            <GradientControl
              colorConfig={bgColorConfig}
              setColorConfig={handleBgColorChange}
              enableGradient={true}
            />
          </div>
        </Section>

        {/* SPACING SECTION */}
        <Section
          title="Espacamento"
          isExpanded={expandedSections.spacing}
          onToggle={() => toggleSection("spacing")}
        >
          <div className="space-y-4">
            {/* Letter Spacing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground">
                  Entre letras
                </label>
                <span className="text-xs text-muted-foreground font-mono">
                  {letterSpacing}px
                </span>
              </div>
              <Slider
                value={[letterSpacing]}
                onValueChange={(value) =>
                  handleSpacingChange({ letterSpacing: value[0] })
                }
                min={-5}
                max={20}
                step={0.5}
              />
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground">
                  Altura da linha
                </label>
                <span className="text-xs text-muted-foreground font-mono">
                  {lineHeight.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[lineHeight]}
                onValueChange={(value) =>
                  handleSpacingChange({ lineHeight: value[0] })
                }
                min={0.5}
                max={3}
                step={0.1}
              />
            </div>
          </div>
        </Section>

        {/* OPACITY SECTION */}
        <Section
          title="Opacidade"
          isExpanded={expandedSections.opacity}
          onToggle={() => toggleSection("opacity")}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-muted-foreground">
                Opacidade
              </label>
              <span className="text-xs text-muted-foreground font-mono">
                {opacity}%
              </span>
            </div>
            <Slider
              value={[opacity]}
              onValueChange={(value) => {
                setOpacity(value[0]);
                // TODO: implement opacity update when store supports it
              }}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};
