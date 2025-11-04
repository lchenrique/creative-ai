export interface ColorStop {
    id: string
    color: string
    position: number
    opacity: number
}

export interface GradientConfig {
    type: "linear" | "radial" | "conic"
    angle: number
    radialType: "circle" | "ellipse"
    radialSize: "closest-side" | "closest-corner" | "farthest-side" | "farthest-corner"
    radialPosition: { x: number; y: number }
    stops: ColorStop[]
}

// Re-export ColorConfig from minisite-store for convenience
export type { ColorConfig } from "@/store/minisite-store"

export interface GradientControlProps {
    colorConfig: import("@/store/minisite-store").ColorConfig
    setColorConfig: React.Dispatch<React.SetStateAction<import("@/store/minisite-store").ColorConfig>>
    enableGradient?: boolean
    enablePattern?: boolean
    enableImage?: boolean
    label?: string
} 