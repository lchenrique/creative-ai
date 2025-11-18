import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { ColorPicker } from "@/components/color-picker";
import type { ColorConfig } from "@/stores/canva-store";

interface SolidColorTabProps {
  colorConfig: ColorConfig;
  setColorConfig: (value: string) => void;
}

const SOLIDS_PRESETS = [
  "#ffffff", // Branco
  "#000000", // Preto
  "#ff6b00", // Laranja
  "#ffa500", // Laranja claro
  "#4dd8a5", // Verde água
  "#00c896", // Verde
  "#64b5ff", // Azul claro
  "#0078d4", // Azul
  "#e91e63", // Rosa vibrante
  "#ff6b9d", // Rosa claro
  "#9b59b6", // Roxo
  "#7b2cbf", // Roxo escuro
];

export const SolidColorTab = ({
  colorConfig,
  setColorConfig,
}: SolidColorTabProps) => (
  <TabsContent value="solid" className="space-y-3 pt-3">
    {/* Seletor de Cor Principal com ColorPicker */}
    <div
      data-slot="floating-menu-content"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <ColorPicker
        background={colorConfig.value}
        setBackground={(color) =>
          setColorConfig(color)
        }
      />
    </div>

    {/* Presets de Cor Sólida */}
    <div className="grid grid-cols-6 gap-2">
      {SOLIDS_PRESETS.map((color, index) => (
        <Button
          key={index}
          data-slot="floating-menu-content"
          variant="ghost"
          className="h-8 w-full p-0 overflow-hidden border hover:border-accent"
          onClick={() =>
            setColorConfig(color)
          }
        >
          <div
            className="w-full h-full rounded-sm"
            style={{ background: color }}
          />
        </Button>
      ))}
    </div>
  </TabsContent>
);
