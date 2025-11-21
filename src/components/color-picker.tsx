import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";
import { useState, useRef, useEffect, memo, use } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { TooltipProvider } from "./ui/tooltip";

interface ColorPickerProps {
  background: string;
  setBackground: (background: string) => void;
  disabled?: boolean;
}

const ColorPickerComponent = ({
  background,
  setBackground,
  disabled = false,
}: ColorPickerProps) => {
  const handleColorChange = (hexColor: string) => {
    setBackground?.(hexColor);
  };

  return (
    <TooltipProvider>
      <Popover modal={true}>
        <PopoverTrigger disabled={disabled} asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-2 border-brand-purple/20 hover:border-brand-purple focus-visible:border-brand-purple",
              !background && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <div className="w-full flex items-center gap-2">
              {background ? (
                <div
                  className="h-4 w-4 border-2 border-border"
                  style={{ background: background }}
                />
              ) : (
                <Paintbrush className="h-4 w-4" />
              )}
              <div className="truncate flex-1 max-w-[100px]">
                {background ? (
                  <span className="font-mono text-xs">{background}</span>
                ) : (
                  "Escolher cor"
                )}
              </div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          data-slot="floating-menu-content"
          className="w-96 p-4 border-2 border-border z-9999"
          align="start"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <HexAlphaColorPicker
            color={background || "#ffffff"}
            onChange={handleColorChange}
            className="w-full"
            style={{
              width: "100%",
              height: "150px",
            }}
          />
          <Input
            type="text"
            value={background || "#ffffff"}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full"
          />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

// Memoriza o componente para evitar re-renders quando a cor muda durante o drag
export const ColorPicker = memo(
  ColorPickerComponent,
  (prevProps, nextProps) => {
    // Só re-renderiza se a prop background mudou E o popover está fechado
    // Durante o drag, ignora mudanças de background
    return (
      prevProps.background === nextProps.background &&
      prevProps.disabled === nextProps.disabled
    );
  },
);
