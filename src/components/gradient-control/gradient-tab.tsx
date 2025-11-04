import { ColorPicker } from "@/components/color-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { gradientOptions } from "@/data/gradient-opttions"
import { Copy } from "lucide-react"
import { useCallback, useState } from "react"
import type { ColorConfig } from "."

interface ColorStop {
    id: string
    color: string
    position: number
    opacity: number
}

interface GradientTabProps {
    colorConfig: ColorConfig
    setColorConfig: React.Dispatch<React.SetStateAction<ColorConfig>>
}

export const GradientTab = ({ colorConfig, setColorConfig }: GradientTabProps) => {
    const [selectedStop, setSelectedStop] = useState<string>("1")
    const updateColorStop = useCallback(
        (id: string, updates: Partial<ColorStop>) => {
            setColorConfig((prev) => ({
                ...prev,
                gradient: {
                    ...prev.gradient,
                    stops: prev.gradient.stops.map((stop) => (stop.id === id ? { ...stop, ...updates } : stop)),
                },
            }))
        },
        [setColorConfig],
    )

    const applyPreset = useCallback(
        (presetGradient: string) => {
            const match = presetGradient.match(/linear-gradient\(([^,]+),\s*(.+)\)/)
            if (match) {
                const direction = match[1].trim()
                const stopsStr = match[2]

                let angle = 90
                if (direction.includes('deg')) {
                    angle = parseInt(direction)
                } else {
                    const directionMap: { [key: string]: number } = {
                        'to top': 0,
                        'to right': 90,
                        'to bottom': 180,
                        'to left': 270,
                        'to top right': 45,
                        'to bottom right': 135,
                        'to bottom left': 225,
                        'to top left': 315
                    }
                    angle = directionMap[direction] || 90
                }

                const stops = stopsStr
                    .split(",")
                    .map((stop, index) => {
                        const trimmedStop = stop.trim()

                        const colorPosMatch = trimmedStop.match(/(#[a-fA-F0-9]{6})\s*(\d+)%/)
                        if (colorPosMatch) {
                            return {
                                id: (index + 1).toString(),
                                color: colorPosMatch[1],
                                position: parseInt(colorPosMatch[2]),
                                opacity: 100,
                            }
                        }

                        const colorMatch = trimmedStop.match(/(#[a-fA-F0-9]{6})/)
                        if (colorMatch) {
                            const totalStops = stopsStr.split(",").length
                            const position = Math.round((index / (totalStops - 1)) * 100)
                            return {
                                id: (index + 1).toString(),
                                color: colorMatch[1],
                                position: position,
                                opacity: 100,
                            }
                        }

                        return null
                    })
                    .filter(Boolean) as ColorStop[]

                if (stops.length > 0) {
                    setColorConfig((prev) => ({
                        ...prev,
                        colorType: "gradient",
                        gradient: {
                            ...prev.gradient,
                            type: "linear",
                            angle,
                            stops,
                            radialType: "circle",
                            radialSize: "farthest-corner",
                            radialPosition: { x: 50, y: 50 },
                        },
                    }))
                }
            }
        },
        [setColorConfig],
    )
    // Ensure gradient is properly initialized
    if (!colorConfig.gradient || !colorConfig.gradient.stops || colorConfig.gradient.stops.length === 0) {
        return null;
    }





    return (
        <TabsContent value="gradient" className="space-y-3 pt-3">
            {/* Presets de Gradiente */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                    {gradientOptions.slice(0, 6).map((preset) => (
                        <Tooltip key={preset.name}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 p-0 overflow-hidden bg-transparent text-xs hover:scale-105 transition-transform"
                                    onClick={() => applyPreset(preset.value)}
                                >
                                    <div
                                        className="w-full h-full flex items-center justify-center text-xs font-medium text-white shadow-inner"
                                        style={{ background: preset.value }}
                                    >
                                        {preset.name}
                                    </div>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{preset.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>

            {/* Controles de Gradiente */}
            <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                    <TabsTrigger value="settings" className="text-xs">
                        Configuração
                    </TabsTrigger>
                    <TabsTrigger value="colors" className="text-xs">
                        Cores
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-3 pt-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Tipo</Label>
                        <Select
                            value={colorConfig.gradient.type}
                            onValueChange={(value: "linear" | "radial" | "conic") => {
                                setColorConfig((prev) => ({
                                    ...prev,
                                    gradient: { ...prev.gradient, type: value },
                                }))
                            }}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="linear">Linear</SelectItem>
                                <SelectItem value="radial">Radial</SelectItem>
                                <SelectItem value="conic">Cônico</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Angle para Linear e Cônico */}
                    {(colorConfig.gradient.type === "linear" || colorConfig.gradient.type === "conic") && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Ângulo</Label>
                                <Badge variant="outline" className="text-xs">
                                    {colorConfig.gradient.angle}°
                                </Badge>
                            </div>
                            <Slider
                                value={[colorConfig.gradient.angle]}
                                onValueChange={([value]) => {
                                    setColorConfig((prev) => ({
                                        ...prev,
                                        gradient: { ...prev.gradient, angle: value },
                                    }))
                                }}
                                max={360}
                                step={1}
                                className="w-full"
                            />
                            <div className="flex gap-1 flex-wrap">
                                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                                    <Button
                                        key={angle}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setColorConfig((prev) => ({
                                                ...prev,
                                                gradient: { ...prev.gradient, angle },
                                            }))
                                        }}
                                        className={`text-xs ${colorConfig.gradient.angle === angle
                                            ? "bg-primary text-primary-foreground"
                                            : ""
                                            }`}
                                    >
                                        {angle}°
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Configurações Radiais */}
                    {colorConfig.gradient.type === "radial" && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">Forma</Label>
                                    <Select
                                        value={colorConfig.gradient.radialType}
                                        onValueChange={(value: "circle" | "ellipse") => {
                                            setColorConfig((prev) => ({
                                                ...prev,
                                                gradient: { ...prev.gradient, radialType: value },
                                            }))
                                        }}
                                    >
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="circle">Círculo</SelectItem>
                                            <SelectItem value="ellipse">Elipse</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">Tamanho</Label>
                                    <Select
                                        value={colorConfig.gradient.radialSize}
                                        onValueChange={(value: "closest-side" | "closest-corner" | "farthest-side" | "farthest-corner") => {
                                            setColorConfig((prev) => ({
                                                ...prev,
                                                gradient: { ...prev.gradient, radialSize: value },
                                            }))
                                        }}
                                    >
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="closest-side">Lado Próximo</SelectItem>
                                            <SelectItem value="closest-corner">Canto Próximo</SelectItem>
                                            <SelectItem value="farthest-side">Lado Distante</SelectItem>
                                            <SelectItem value="farthest-corner">Canto Distante</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Posição Centro</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">X</Label>
                                            <Badge variant="outline" className="text-xs">
                                                {colorConfig.gradient.radialPosition.x}%
                                            </Badge>
                                        </div>
                                        <Slider
                                            value={[colorConfig.gradient.radialPosition.x]}
                                            onValueChange={([value]) => {
                                                setColorConfig((prev) => ({
                                                    ...prev,
                                                    gradient: {
                                                        ...prev.gradient,
                                                        radialPosition: { ...prev.gradient.radialPosition, x: value },
                                                    },
                                                }))
                                            }}
                                            max={100}
                                            step={1}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">Y</Label>
                                            <Badge variant="outline" className="text-xs">
                                                {colorConfig.gradient.radialPosition.y}%
                                            </Badge>
                                        </div>
                                        <Slider
                                            value={[colorConfig.gradient.radialPosition.y]}
                                            onValueChange={([value]) => {
                                                setColorConfig((prev) => ({
                                                    ...prev,
                                                    gradient: {
                                                        ...prev.gradient,
                                                        radialPosition: { ...prev.gradient.radialPosition, y: value },
                                                    },
                                                }))
                                            }}
                                            max={100}
                                            step={1}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="colors" className="space-y-3 pt-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Cores do Gradiente</Label>
                        <div className="grid gap-2">
                            {colorConfig.gradient.stops.map((stop, index) => (
                                <div
                                    key={stop.id}
                                    className={`p-2 rounded-lg border transition-all duration-200 ${selectedStop === stop.id
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border hover:border-primary/50"
                                        }`}

                                    onClick={() => {
                                         setSelectedStop(stop.id)
                                    }}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-5 h-5 rounded border shadow-sm"
                                                style={{ background: stop.color }}
                                            />
                                            <ColorPicker
                                                background={stop.color}
                                                setBackground={(color) => updateColorStop(stop.id, { color })}
                                            />

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigator.clipboard.writeText(stop.color)}
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Copiar cor</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs w-12">Posição</Label>
                                                <Slider
                                                    value={[stop.position]}
                                                    onValueChange={([value]) => {
                                                        updateColorStop(stop.id, { position: value })
                                                    }}
                                                    max={100}
                                                    step={1}
                                                    className="flex-1"
                                                />
                                                <Badge variant="outline" className="text-xs w-10 text-center">
                                                    {stop.position}%
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs w-12">Opacidade</Label>
                                                <Slider
                                                    value={[stop.opacity]}
                                                    onValueChange={([value]) => {
                                                        updateColorStop(stop.id, { opacity: value })
                                                    }}
                                                    max={100}
                                                    step={1}
                                                    className="flex-1"
                                                />
                                                <Badge variant="outline" className="text-xs w-10 text-center">
                                                    {stop.opacity}%
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </TabsContent>
    )
} 