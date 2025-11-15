import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { ColorPicker } from "@/components/color-picker";
import type { ColorConfig } from ".";

interface SolidColorTabProps {
  colorConfig: ColorConfig;
  setColorConfig: React.Dispatch<React.SetStateAction<ColorConfig>>;
}

const SOLIDS_PRESETS = [
  "#ff6b00", // Laranja
  "#ffa500", // Laranja claro
  "#4dd8a5", // Verde água
  "#00c896", // Verde
  "#64b5ff", // Azul claro
  "#0078d4", // Azul
  "#a0adb8", // Cinza azulado
  "#6e7c87", // Cinza
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
        background={colorConfig.solidColor}
        setBackground={(color) =>
          setColorConfig((prev) => ({ ...prev, solidColor: color }))
        }
      />
    </div>

    {/* Presets de Cor Sólida */}
    <div className="grid grid-cols-6 gap-2">
      {SOLIDS_PRESETS.map((color, index) => (
        <Button
          key={index}
          data-slot="floating-menu-content"
          variant="outline"
          className="h-8 w-full p-0 overflow-hidden border-border hover:scale-105 transition-transform"
          onClick={() =>
            setColorConfig((prev) => ({
              ...prev,
              solidColor: color,
            }))
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
