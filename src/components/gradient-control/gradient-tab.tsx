import { TabsContent } from "@radix-ui/react-tabs";
import { GradientEditor } from "../@new/canvas/gradient-editor";
import type { GradientState } from "@/types/gradient";
import type { ColorConfig } from "@/stores/canva-store";

export interface GradientTabProps {
  colorConfig: ColorConfig;
  onChange: (gradientState: GradientState) => void;
}

const DEFAULT_GRADIENT: GradientState = {
  type: "linear",
  angle: 90,
  linearStart: { x: 0.2, y: 0.5 },
  linearEnd: { x: 0.8, y: 0.5 },
  stops: [
    { id: "1", color: "#3b82f6", offset: 0 },
    { id: "2", color: "#22d3ee", offset: 100 },
  ],
};

export const GradientTab = ({ colorConfig, onChange }: GradientTabProps) => {
  const defaultGradient: GradientState =
    colorConfig.type === "gradient" ? colorConfig.value : DEFAULT_GRADIENT;

  return (
    <TabsContent value="gradient" className="mt-4 outline-none overflow-hidden">
      <GradientEditor
        defaultGradient={defaultGradient}
        onChange={(gradientState) => {
          onChange(gradientState);
        }}
      />
    </TabsContent>
  );
};
