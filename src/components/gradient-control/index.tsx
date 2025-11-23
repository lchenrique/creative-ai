"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ColorConfig } from "@/stores/canva-store";
import { useDraggable } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { GradientPreview } from "../@new/canvas/gradient-preview";
import { GradientTab } from "./gradient-tab";
import { SolidColorTab } from "./solid-color-tab";
import { ImageTab } from "./image-tab";

export interface ColorStop {
  id: string;
  color: string;
  position: number;
  opacity: number;
}

export interface GradientConfig {
  type: "linear" | "radial" | "conic";
  angle: number;
  radialType: "circle" | "ellipse";
  radialSize:
  | "closest-side"
  | "closest-corner"
  | "farthest-side"
  | "farthest-corner";
  radialPosition: { x: number; y: number };
  stops: ColorStop[];
  linearStart?: { x: number; y: number };
  linearEnd?: { x: number; y: number };
  radialStart?: { x: number; y: number };
  radialEnd?: { x: number; y: number };
}

interface GradientControlProps {
  colorConfig: ColorConfig;
  setColorConfig: (colorConfig: ColorConfig) => void;
  enableGradient?: boolean;
  enablePattern?: boolean;
  enableImage?: boolean;
  enableVideo?: boolean;
  label?: string;
}

export default function GradientControl({
  colorConfig,
  setColorConfig,
  enableGradient = true,
  enablePattern = false,
  enableImage = false,
  enableVideo = false,
}: GradientControlProps) {
  const [tabSelected, setTabSelected] = useState(colorConfig.type || "solid");
  const [copied, setCopied] = useState(false);

  // Sincroniza a tab quando o colorConfig mudar (quando selecionar outro elemento)
  useEffect(() => {
    setTabSelected(colorConfig.type || "solid");
  }, [colorConfig.type]);

  // useEffect(() => {
  //   if (!enableGradient && colorConfig.colorType === "gradient") {
  //     setColorConfig((prev) => ({ ...prev, colorType: "solid" }));
  //   }
  // }, [enableGradient, colorConfig.colorType, setColorConfig]);

  // useEffect(() => {
  //   if (!enablePattern && colorConfig.colorType === "pattern") {
  //     setColorConfig((prev) => ({ ...prev, colorType: "solid" }));
  //   }
  // }, [enablePattern, colorConfig.colorType, setColorConfig]);

  // // Muda automaticamente para "solid" quando imagem é desabilitada
  // useEffect(() => {
  //   if (!enableImage && colorConfig.colorType === "image") {
  //     setColorConfig((prev) => ({ ...prev, colorType: "solid" }));
  //   }
  // }, [enableImage, colorConfig.colorType, setColorConfig]);

  // Reset copy feedback
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Determinar quais abas mostrar
  const showTabs: string[] = [];
  showTabs.push("solid");
  if (enableGradient) showTabs.push("gradient");
  if (enablePattern) showTabs.push("pattern");
  if (enableImage) showTabs.push("image");
  if (enableVideo) showTabs.push("video");

  const tabs = [
    { value: "solid", label: "Cor Sólida" },
    { value: "gradient", label: "Gradiente" },
    { value: "pattern", label: "Padrão" },
    { value: "image", label: "Imagem" },
    { value: "video", label: "Vídeo" },
  ];

  const visibleTabs = tabs.filter((tab) => showTabs.includes(tab.value));
  const hasSingleTab = visibleTabs.length === 1;

  return (
    <TooltipProvider>
      <Card
        data-slot="floating-menu-content"
        className="w-full py-0 bg-transparent max-w-[400px] border-none shadow-none no-animation"
      >
        <CardContent
          data-slot="floating-menu-content"
          className="p-0 space-y-3"
        >
          {/* Tabs principais - esconde quando só tem uma tab */}
          <Tabs
            value={tabSelected}
            onValueChange={(value) => {
              setTabSelected(value);
            }}
            className="w-full"
          >
            {!hasSingleTab && (
              <TabsList className="flex w-full justify-between mb-2 border-none h-8">
                {visibleTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-popover text-xs"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}

            <SolidColorTab
              colorConfig={colorConfig}
              setColorConfig={(value) =>
                setColorConfig({ type: "solid", value })
              }
            />

            {enableGradient && (
              <GradientTab
                colorConfig={colorConfig}
                onChange={(gradientState) => {
                  setColorConfig({ type: "gradient", value: gradientState });
                }}
              />
            )}
            {enableImage && (
              <ImageTab
                colorConfig={colorConfig}
                setColorConfig={setColorConfig}
              />
            )}
            {/* {enablePattern && (
              <PatternTab
                colorConfig={colorConfig}
                setColorConfig={setColorConfig}
              />
            )}

            {enableVideo && (
              <VideoTab
                colorConfig={colorConfig}
                setColorConfig={setColorConfig}
              />
            )} */}
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
