import type { ColorConfig, ColorStop, GradientConfig } from "@/components/gradient-control"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const hexToRgba = (hex: string, alpha: number) => {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const generateGradientCSS = (gradientConfig: GradientConfig) => {
  const { type, angle, stops, radialType, radialSize, radialPosition } = gradientConfig // 'repeating' removido
  const sortedStops = [...stops].sort((a: ColorStop, b: ColorStop) => a.position - b.position)
  const stopStrings = sortedStops.map((stop: ColorStop) => {
    const rgba = hexToRgba(stop.color, stop.opacity / 100)
    return `${rgba} ${stop.position}%`
  })

  // 'prefix' removido, pois 'repeating' foi removido
  if (type === "linear") {
    return `linear-gradient(${angle}deg, ${stopStrings.join(", ")})`
  } else if (type === "radial") {
    const position = `${radialPosition.x}% ${radialPosition.y}%`
    return `radial-gradient(${radialType} ${radialSize} at ${position}, ${stopStrings.join(", ")})`
  } else {
    return `conic-gradient(from ${angle}deg at ${radialPosition.x}% ${radialPosition.y}%, ${stopStrings.join(", ")})`
  }
}


export const generateBackgroundCSS = (config: any) => {
  if (config.colorType === "image") {
    return `url(${config.image})`
  }
  if (config.colorType === "solid") {
    return config.solidColor
  }
  if (config.colorType === "gradient") {
    // Safety check: ensure gradient object exists
    if (!config.gradient || !config.gradient.stops || config.gradient.stops.length === 0) {
      return config.solidColor || '#000000' // Fallback to solid color
    }
    return generateGradientCSS(config.gradient)
  }
  if (config.colorType === "pattern") {
    return config.solidColor || '#ffffff' // Patterns use solidColor as background
  }
  if (config.colorType === "video") {
    return config.solidColor || '#000000' // Videos use solidColor as fallback
  }
  // Fallback
  return '#ffffff'
}

export const generateCoverClass = (config: ColorConfig) => {
  if (config.colorType === "pattern") {
    return config.pattern
  }
  return ''
}