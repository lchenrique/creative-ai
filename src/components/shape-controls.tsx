"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { INITIAL_COLOR_CONFIG, useCreativeStore } from "@/stores/creative-store"
import { useEffect, useRef, useState } from "react"
import GradientColorPicker from "./gradient-color-picker"
import { type ColorConfig } from "./gradient-control"
import { Input } from "@/components/ui/input"
import {
    FlipHorizontal,
    FlipVertical,
    RotateCw,
    Copy,
    Trash2,
    Lock,
    Unlock
} from "lucide-react"
import { Gradient, Rect, Circle as FabricCircle, Triangle, Polygon, FabricImage, Line, Textbox } from "fabric"

// Função para criar gradiente na Fabric.js (similar ao fabric-canvas.tsx)
const createFabricGradient = (object: any, colorConfig: ColorConfig) => {
    if (colorConfig.colorType !== "gradient") {
        return colorConfig.solidColor
    }

    const gradientConfig = colorConfig.gradient

    // Obter o ângulo do gradiente da UI e a rotação atual do objeto
    const gradientAngle = gradientConfig.angle
    const objectAngle = object.angle || 0

    // Contra-rotacionar a definição do gradiente pelo ângulo do objeto
    const finalAngle = gradientAngle - objectAngle

    const angleRad = finalAngle * (Math.PI / 180)
    const cos = Math.cos(angleRad)
    const sin = Math.sin(angleRad)

    // Calcular coordenadas em um quadrado unitário [0,1]
    const x1 = 0.5 - cos / 2
    const y1 = 0.5 - sin / 2
    const x2 = 0.5 + cos / 2
    const y2 = 0.5 + sin / 2

    // Obter dimensões do objeto
    const width = object.width || 100
    const height = object.height || 100

    // Escalar coordenadas para as dimensões do objeto
    const coords = {
        x1: x1 * width,
        y1: y1 * height,
        x2: x2 * width,
        y2: y2 * height,
    }

    const colorStops = gradientConfig.stops.map(stop => ({
        offset: stop.position / 100,
        color: stop.color,
    }))

    return new Gradient({
        type: "linear",
        coords,
        colorStops,
    })
}

export function ShapeControls() {
    const fabricCanvas = useCreativeStore((state) => state.fabricCanvas)
    const [selectedObject, setSelectedObject] = useState<any>(null)
    const [colorConfig, setColorConfig] = useState<ColorConfig>(INITIAL_COLOR_CONFIG)
    const [strokeConfig, setStrokeConfig] = useState<ColorConfig>(INITIAL_COLOR_CONFIG)
    const [svgColors, setSvgColors] = useState<Array<{ path: any, fill: string, index: number }>>([])
    const [svgColorConfigs, setSvgColorConfigs] = useState<ColorConfig[]>([])
    const isUpdatingFromObject = useRef(false)

    // Sincroniza quando o objeto selecionado muda no canvas
    useEffect(() => {
        if (!fabricCanvas) return

        const updateSelectedObject = () => {
            const active = fabricCanvas.getActiveObject()
            console.log('🎯 ShapeControls - Objeto ativo:', active?.type)

            // Ignora objetos de texto e shells
            if (active && active.type !== 'textbox' && active.type !== 'i-text' && !(active as any)._isClipShell) {
                console.log('✅ ShapeControls - Objeto válido detectado:', active.type)
                setSelectedObject(active)

                // Se for um grupo SVG, extrair cores dos objetos internos
                if ((active as any)._isSVGGroup && active.type === 'group') {
                    console.log('🎨 Grupo SVG detectado!')
                    const paths: Array<{ path: any, fill: string, index: number }> = []
                    const configs: ColorConfig[] = []

                    // Iterar pelos objetos do grupo
                    const objects = (active as any)._objects || []
                    objects.forEach((obj: any, index: number) => {
                        if (obj.fill && typeof obj.fill === 'string' && obj.fill !== 'transparent') {
                            paths.push({ path: obj, fill: obj.fill, index })
                            configs.push({
                                colorType: "solid",
                                solidColor: obj.fill,
                                gradient: INITIAL_COLOR_CONFIG.gradient,
                                pattern: null,
                                image: null,
                                video: null,
                            })
                        }
                    })

                    console.log(`🎨 Encontradas ${paths.length} cores no grupo SVG`)
                    setSvgColors(paths)
                    setSvgColorConfigs(configs)
                } else {
                    setSvgColors([])
                    setSvgColorConfigs([])
                }

                // Atualiza cor de preenchimento
                isUpdatingFromObject.current = true

                // Verifica se o preenchimento é um gradiente
                if (active.fill && typeof active.fill === 'object' && active.fill.type === 'linear') {
                    console.log('🌈 Gradiente detectado no preenchimento')
                    const gradient = active.fill
                    const stops = gradient.colorStops.map((stop: any, index: number) => ({
                        id: String(index + 1),
                        color: stop.color,
                        position: stop.offset * 100,
                        opacity: 100,
                    }))

                    // Calcular o ângulo do gradiente
                    const coords = gradient.coords
                    const dx = coords.x2 - coords.x1
                    const dy = coords.y2 - coords.y1
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
                    const normalizedAngle = (angle + 360) % 360

                    setColorConfig({
                        colorType: "gradient",
                        solidColor: "#000000",
                        gradient: {
                            type: "linear",
                            angle: normalizedAngle,
                            radialType: "circle",
                            radialSize: "farthest-corner",
                            radialPosition: { x: 50, y: 50 },
                            stops: stops,
                        },
                        pattern: null,
                        image: null,
                        video: null,
                    })
                } else if (typeof active.fill === 'string') {
                    setColorConfig({
                        colorType: "solid",
                        solidColor: active.fill || "#000000",
                        gradient: INITIAL_COLOR_CONFIG.gradient,
                        pattern: null,
                        image: null,
                        video: null,
                    })
                } else {
                    setColorConfig(INITIAL_COLOR_CONFIG)
                }

                // Atualiza cor da borda
                if (active.stroke && typeof active.stroke === 'object' && active.stroke.type === 'linear') {
                    console.log('🌈 Gradiente detectado na borda')
                    const gradient = active.stroke
                    const stops = gradient.colorStops.map((stop: any, index: number) => ({
                        id: String(index + 1),
                        color: stop.color,
                        position: stop.offset * 100,
                        opacity: 100,
                    }))

                    const coords = gradient.coords
                    const dx = coords.x2 - coords.x1
                    const dy = coords.y2 - coords.y1
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
                    const normalizedAngle = (angle + 360) % 360

                    setStrokeConfig({
                        colorType: "gradient",
                        solidColor: "#000000",
                        gradient: {
                            type: "linear",
                            angle: normalizedAngle,
                            radialType: "circle",
                            radialSize: "farthest-corner",
                            radialPosition: { x: 50, y: 50 },
                            stops: stops,
                        },
                        pattern: null,
                        image: null,
                        video: null,
                    })
                } else {
                    setStrokeConfig({
                        colorType: "solid",
                        solidColor: active.stroke || "transparent",
                        gradient: INITIAL_COLOR_CONFIG.gradient,
                        pattern: null,
                        image: null,
                        video: null,
                    })
                }
            } else {
                console.log('❌ ShapeControls - Nenhum objeto válido')
                setSelectedObject(null)
            }
        }

        // Atualiza imediatamente se já houver algo selecionado
        updateSelectedObject()

        fabricCanvas.on('selection:created', updateSelectedObject)
        fabricCanvas.on('selection:updated', updateSelectedObject)
        fabricCanvas.on('selection:cleared', () => {
            console.log('🔄 ShapeControls - Seleção limpa')
            setSelectedObject(null)
        })

        return () => {
            fabricCanvas.off('selection:created', updateSelectedObject)
            fabricCanvas.off('selection:updated', updateSelectedObject)
            fabricCanvas.off('selection:cleared')
        }
    }, [fabricCanvas])

    // Aplica mudanças de cor no objeto
    useEffect(() => {
        if (isUpdatingFromObject.current) {
            isUpdatingFromObject.current = false
            return
        }

        if (!selectedObject || !fabricCanvas) return

        // Se o objeto tem clipPath (é uma imagem mascarada), não aplicar cor
        if (selectedObject.clipPath) return

        if (colorConfig.colorType === 'solid') {
            selectedObject.set('fill', colorConfig.solidColor)
            fabricCanvas.renderAll()
        } else if (colorConfig.colorType === 'gradient') {
            const gradient = createFabricGradient(selectedObject, colorConfig)
            selectedObject.set('fill', gradient)
            fabricCanvas.renderAll()
        }
    }, [colorConfig, selectedObject, fabricCanvas])

    // Aplica mudanças de cor da borda
    useEffect(() => {
        if (!selectedObject || !fabricCanvas) return

        if (strokeConfig.colorType === 'solid') {
            selectedObject.set('stroke', strokeConfig.solidColor)
            fabricCanvas.renderAll()
        } else if (strokeConfig.colorType === 'gradient') {
            const gradient = createFabricGradient(selectedObject, strokeConfig)
            selectedObject.set('stroke', gradient)
            fabricCanvas.renderAll()
        }
    }, [strokeConfig, selectedObject, fabricCanvas])

    if (!selectedObject) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                Selecione um elemento para editar
            </div>
        )
    }

    const updateProperty = (property: string, value: any) => {
        if (!selectedObject || !fabricCanvas) return
        selectedObject.set(property, value)
        fabricCanvas.renderAll()
    }

    const handleFlipHorizontal = () => {
        if (!selectedObject || !fabricCanvas) return
        selectedObject.set('flipX', !selectedObject.flipX)
        fabricCanvas.renderAll()
    }

    const handleFlipVertical = () => {
        if (!selectedObject || !fabricCanvas) return
        selectedObject.set('flipY', !selectedObject.flipY)
        fabricCanvas.renderAll()
    }

    const handleRotate = () => {
        if (!selectedObject || !fabricCanvas) return

        // Define o centro do objeto como ponto de origem antes de rotacionar
        selectedObject.set({
            originX: 'center',
            originY: 'center',
        })

        const currentAngle = selectedObject.angle || 0
        selectedObject.set('angle', (currentAngle + 45) % 360)
        selectedObject.setCoords()
        fabricCanvas.renderAll()
    }

    const handleDuplicate = async () => {
        if (!selectedObject || !fabricCanvas) return

        try {
            // Serializar objeto para JSON
            const objectData = selectedObject.toObject([
                '_isFrame',
                '_frameClipPath',
                '_isFrameImage',
                '_frameObject',
                '_isClipShell'
            ])

            // Mapear tipos para classes corretas
            const typeToClass: Record<string, any> = {
                'rect': Rect,
                'circle': FabricCircle,
                'triangle': Triangle,
                'polygon': Polygon,
                'image': FabricImage,
                'line': Line,
                'textbox': Textbox,
                'i-text': Textbox,
            }

            const ClassType = typeToClass[selectedObject.type]
            if (!ClassType || !ClassType.fromObject) {
                console.error('Tipo de objeto não suportado para duplicação:', selectedObject.type)
                return
            }

            const cloned = await ClassType.fromObject(objectData)

            cloned.set({
                left: (selectedObject.left || 0) + 20,
                top: (selectedObject.top || 0) + 20,
            })

            // Clonar clipPath se existir
            if (selectedObject.clipPath) {
                const clipData = selectedObject.clipPath.toObject()
                const ClipClassType = typeToClass[selectedObject.clipPath.type]
                if (ClipClassType && ClipClassType.fromObject) {
                    const clonedClip = await ClipClassType.fromObject(clipData)
                    clonedClip.absolutePositioned = selectedObject.clipPath.absolutePositioned
                    cloned.clipPath = clonedClip
                }
            }

            fabricCanvas.add(cloned)
            fabricCanvas.setActiveObject(cloned)
            fabricCanvas.renderAll()
        } catch (error) {
            console.error('Erro ao duplicar objeto:', error)
        }
    }

    const handleDelete = () => {
        if (!selectedObject || !fabricCanvas) return
        fabricCanvas.remove(selectedObject)
        fabricCanvas.renderAll()
    }

    const toggleLock = () => {
        if (!selectedObject || !fabricCanvas) return
        const isLocked = selectedObject.lockMovementX || false
        selectedObject.set({
            lockMovementX: !isLocked,
            lockMovementY: !isLocked,
            lockRotation: !isLocked,
            lockScalingX: !isLocked,
            lockScalingY: !isLocked,
            selectable: isLocked, // Se estava bloqueado, agora pode selecionar
        })
        fabricCanvas.renderAll()
    }

    const isLocked = selectedObject.lockMovementX || false
    const opacity = (selectedObject.opacity || 1) * 100
    const strokeWidth = selectedObject.strokeWidth || 0
    const angle = Math.round(selectedObject.angle || 0)
    const scaleX = selectedObject.scaleX || 1
    const scaleY = selectedObject.scaleY || 1

    return (
        <div className="p-4 space-y-6 w-[300px] max-h-[500px] overflow-y-auto">
            {/* Título */}
            <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="text-sm font-semibold">Controles de Elemento</h3>
                <span className="text-xs text-muted-foreground capitalize">{selectedObject.type}</span>
            </div>

            {/* Ações rápidas */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Ações Rápidas</Label>
                <div className="grid grid-cols-4 gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleFlipHorizontal}
                        title="Espelhar Horizontalmente"
                    >
                        <FlipHorizontal className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleFlipVertical}
                        title="Espelhar Verticalmente"
                    >
                        <FlipVertical className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRotate}
                        title="Rotacionar 45°"
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleLock}
                        title={isLocked ? "Desbloquear" : "Bloquear"}
                    >
                        {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDuplicate}
                        className="w-full"
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="w-full"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deletar
                    </Button>
                </div>
            </div>

            {/* Cor de Preenchimento - só mostra se não for imagem mascarada, linha ou SVG */}
            {selectedObject.type !== 'line' && !selectedObject.clipPath && !((selectedObject as any)._isSVGGroup) && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Cor de Preenchimento</Label>
                    <GradientColorPicker
                        colorConfig={colorConfig}
                        setColorConfig={setColorConfig}
                        enableGradient
                    />
                </div>
            )}

            {/* Cores do SVG - mostra se for SVG com cores */}
            {svgColors.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Cores do SVG ({svgColors.length})</Label>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {svgColors.map((item, idx) => {
                            const updateSvgColor = (configOrUpdater: ColorConfig | ((prev: ColorConfig) => ColorConfig)) => {
                                const newConfig = typeof configOrUpdater === 'function'
                                    ? configOrUpdater(svgColorConfigs[idx])
                                    : configOrUpdater

                                console.log('🎨 Nova cor selecionada:', newConfig.solidColor)
                                const newColor = newConfig.solidColor

                                // Atualizar a cor no objeto Fabric.js
                                item.path.set('fill', newColor)

                                // Atualizar o estado local
                                const newSvgColors = [...svgColors]
                                newSvgColors[idx].fill = newColor
                                setSvgColors(newSvgColors)

                                // Atualizar o config
                                const newConfigs = [...svgColorConfigs]
                                newConfigs[idx] = newConfig
                                setSvgColorConfigs(newConfigs)

                                // Forçar re-render do canvas
                                if (fabricCanvas) {
                                    fabricCanvas.renderAll()
                                }
                            }

                            return (
                                <div key={idx} className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Cor {idx + 1}</Label>
                                    <GradientColorPicker
                                        colorConfig={svgColorConfigs[idx]}
                                        setColorConfig={updateSvgColor}
                                        enableGradient={false}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Opacidade */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Opacidade</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(opacity)}%</span>
                </div>
                <Slider
                    value={[opacity]}
                    onValueChange={(value) => updateProperty('opacity', value[0] / 100)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                />
            </div>

            {/* Rotação */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Rotação</Label>
                    <span className="text-sm text-muted-foreground">{angle}°</span>
                </div>
                <Slider
                    value={[angle]}
                    onValueChange={(value) => {
                        selectedObject.set({
                            originX: 'center',
                            originY: 'center',
                            angle: value[0]
                        })
                        selectedObject.setCoords()
                        fabricCanvas.renderAll()
                    }}
                    min={0}
                    max={360}
                    step={1}
                    className="w-full"
                />
            </div>

            {/* Escala */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Escala</Label>
                    <span className="text-sm text-muted-foreground">{(scaleX * 100).toFixed(0)}%</span>
                </div>
                <Slider
                    value={[scaleX * 100]}
                    onValueChange={(value) => {
                        const scale = value[0] / 100
                        updateProperty('scaleX', scale)
                        updateProperty('scaleY', scale)
                    }}
                    min={10}
                    max={300}
                    step={1}
                    className="w-full"
                />
            </div>

            {/* Borda */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Borda</Label>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs text-muted-foreground">Espessura</Label>
                        <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
                    </div>
                    <Slider
                        value={[strokeWidth]}
                        onValueChange={(value) => updateProperty('strokeWidth', value[0])}
                        min={0}
                        max={20}
                        step={1}
                        className="w-full"
                    />
                </div>

                {strokeWidth > 0 && (
                    <div className="pt-2">
                        <Label className="text-xs text-muted-foreground mb-2 block">Cor da Borda</Label>
                        <GradientColorPicker
                            colorConfig={strokeConfig}
                            setColorConfig={setStrokeConfig}
                            enableGradient
                        />
                    </div>
                )}
            </div>

            {/* Posição */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Posição</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">X</Label>
                        <Input
                            type="number"
                            value={Math.round(selectedObject.left || 0)}
                            onChange={(e) => updateProperty('left', Number(e.target.value))}
                            className="h-8"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Y</Label>
                        <Input
                            type="number"
                            value={Math.round(selectedObject.top || 0)}
                            onChange={(e) => updateProperty('top', Number(e.target.value))}
                            className="h-8"
                        />
                    </div>
                </div>
            </div>

            {/* Dimensões (para shapes) */}
            {selectedObject.type !== 'line' && selectedObject.type !== 'image' && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Dimensões</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Largura</Label>
                            <Input
                                type="number"
                                value={Math.round(selectedObject.width * scaleX || 0)}
                                onChange={(e) => {
                                    const newWidth = Number(e.target.value)
                                    updateProperty('scaleX', newWidth / selectedObject.width)
                                }}
                                className="h-8"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Altura</Label>
                            <Input
                                type="number"
                                value={Math.round(selectedObject.height * scaleY || 0)}
                                onChange={(e) => {
                                    const newHeight = Number(e.target.value)
                                    updateProperty('scaleY', newHeight / selectedObject.height)
                                }}
                                className="h-8"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Raio (apenas para círculos) */}
            {selectedObject.type === 'circle' && (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Raio</Label>
                        <span className="text-sm text-muted-foreground">{Math.round(selectedObject.radius * scaleX)}px</span>
                    </div>
                    <Slider
                        value={[selectedObject.radius * scaleX]}
                        onValueChange={(value) => {
                            const scale = value[0] / selectedObject.radius
                            updateProperty('scaleX', scale)
                            updateProperty('scaleY', scale)
                        }}
                        min={10}
                        max={200}
                        step={1}
                        className="w-full"
                    />
                </div>
            )}
        </div>
    )
}
