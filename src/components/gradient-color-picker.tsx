"use client"

import type React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import GradientControl, { type ColorConfig } from "./gradient-control"
import { generateBackgroundCSS } from "@/lib/utils"

interface GradientColorPickerProps {
  colorConfig: ColorConfig
  setColorConfig: React.Dispatch<React.SetStateAction<ColorConfig>>
  label?: string
  enableGradient?: boolean
  enablePattern?: boolean
  enableImage?: boolean
  enableVideo?: boolean
}

export default function GradientColorPicker({
  colorConfig,
  setColorConfig,
  label = "Cor",
  enableGradient = true,
  enablePattern = false,
  enableImage = false,
  enableVideo = false
}: GradientColorPickerProps) {
  const currentBackgroundCSS = generateBackgroundCSS(colorConfig)
  const pattern = colorConfig.colorType === "pattern" ? colorConfig.pattern : ""

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="h-10 w-full border flex items-center justify-center gap-2 bg-transparent no-animation relative rounded-md hover:bg-accent transition-colors">
          <div
            className={`w-6 h-6 border shadow-sm rounded ${pattern}`}
            style={
              !pattern
                ? { background: currentBackgroundCSS }
                : { backgroundSize: "50px 50px" }
            }
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 overflow-hidden" side="right" align="center">
        <GradientControl
          enableImage={enableImage}
          colorConfig={colorConfig}
          setColorConfig={setColorConfig}
          enableGradient={enableGradient}
          enablePattern={enablePattern}
          enableVideo={enableVideo}
        />
      </PopoverContent>
    </Popover>
  )
}
