"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { generateBackgroundCSS } from "@/lib/utils"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { GradientTab } from "./gradient-tab"
import { ImageTab } from "./image-tab"
import { PatternTab } from "./pattern-tab"
import { SolidColorTab } from "./solid-color-tab"
import VideoTab from "./video-tab"

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
export interface ColorConfig {
    colorType: "solid" | "gradient" | "pattern" | "image" | "video"
    solidColor: string
    gradient: GradientConfig
    pattern: string | null
    image: string | null
    video: string | null
}

interface GradientControlProps {
    colorConfig: ColorConfig
    setColorConfig: React.Dispatch<React.SetStateAction<ColorConfig>>
    enableGradient?: boolean
    enablePattern?: boolean
    enableImage?: boolean
    enableVideo?: boolean
    label?: string
}

export default function GradientControl({
    colorConfig,
    setColorConfig,
    enableGradient = true,
    enablePattern = false,
    enableImage = false,
    enableVideo = false,
}: GradientControlProps) {
    const [tabSelected, setTabSelected] = useState("solid")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!enableGradient && colorConfig.colorType === "gradient") {
            setColorConfig((prev) => ({ ...prev, colorType: "solid" }))
        }
    }, [enableGradient, colorConfig.colorType, setColorConfig])

    useEffect(() => {
        if (!enablePattern && colorConfig.colorType === "pattern") {
            setColorConfig((prev) => ({ ...prev, colorType: "solid" }))
        }
    }, [enablePattern, colorConfig.colorType, setColorConfig])

    // Muda automaticamente para "solid" quando imagem é desabilitada
    useEffect(() => {
        if (!enableImage && colorConfig.colorType === "image") {
            setColorConfig((prev) => ({ ...prev, colorType: "solid" }))
        }
    }, [enableImage, colorConfig.colorType, setColorConfig])

    // Reset copy feedback
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [copied])

    const randomizeColors = useCallback(() => {
        const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff", "#5f27cd"]

        setColorConfig((prev) => ({
            ...prev,
            gradient: {
                ...prev.gradient,
                stops: prev.gradient.stops.map((stop) => ({
                    ...stop,
                    color: colors[Math.floor(Math.random() * colors.length)],
                })),
            },
        }))
    }, [setColorConfig])

    const resetToDefault = useCallback(() => {
        setColorConfig({
            colorType: "solid",
            solidColor: "#ffffff",
            gradient: {
                type: "linear",
                angle: 90,
                radialType: "circle",
                radialSize: "farthest-corner",
                radialPosition: { x: 50, y: 50 },
                stops: [
                    { id: "1", color: "#3b82f6", position: 0, opacity: 100 },
                    { id: "2", color: "#8b5cf6", position: 100, opacity: 100 },
                ],
            },
            pattern: null,
            image: null,
            video: null,
        })
    }, [setColorConfig])

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(`background: ${generateBackgroundCSS(colorConfig)};`)
            setCopied(true)
        } catch (err) {
            console.error("Falha ao copiar:", err)
        }
    }, [colorConfig])

    const exportGradient = useCallback(() => {
        const data = {
            colorConfig,
            css: generateBackgroundCSS(colorConfig),
            timestamp: new Date().toISOString(),
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "background.json"
        a.click()
        URL.revokeObjectURL(url)
    }, [colorConfig])

    const importGradient = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target?.result as string)
                        if (data.colorConfig) {
                            setColorConfig(data.colorConfig)
                        }
                    } catch (err) {
                        console.error("Erro ao importar:", err)
                    }
                }
                reader.readAsText(file)
            }
        },
        [setColorConfig],
    )

    // Determinar quais abas mostrar
    const showTabs: string[] = []
    if (true) showTabs.push("solid") // Sempre mostrar sólido
    if (enableGradient) showTabs.push("gradient")
    if (enablePattern) showTabs.push("pattern")
    if (enableImage) showTabs.push("image")
    if (enableVideo) showTabs.push("video"); // Sempre mostrar vídeo


    const tabs = [
        { value: "solid", label: "Cor Sólida" },
        { value: "gradient", label: "Gradiente" },
        { value: "pattern", label: "Padrão" },
        { value: "image", label: "Imagem" },
        { value: "video", label: "Vídeo" },
    ]


    return (
        <TooltipProvider>
            <Card className="w-full border-none shadow-none no-animation">

                <CardContent className="p-3 pt-0 space-y-3">
                    {/* Tabs principais */}
                    <Tabs
                        value={tabSelected}
                        onValueChange={(value) => {
                            setColorConfig((prev) => ({ ...prev, colorType: value as "solid" | "gradient" | "pattern" | "image" | "video" }))
                            setTabSelected(value)
                        }}
                        className="w-full"
                    >
                        <TabsList className={`flex w-full justify-between  mb-2 border-none`}>
                            {
                                tabs
                                    .filter((tab) => showTabs.includes(tab.value))
                                    .map((tab) => (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                            className="data-[state=active]:bg-popover"
                                        >
                                            {tab.label}
                                        </TabsTrigger>
                                    ))
                            }
                        </TabsList>

                        <SolidColorTab colorConfig={colorConfig} setColorConfig={setColorConfig} />
                        {enableGradient && <GradientTab colorConfig={colorConfig} setColorConfig={setColorConfig} />}
                        {enablePattern && <PatternTab colorConfig={colorConfig} setColorConfig={setColorConfig} />}
                        {enableImage && <ImageTab colorConfig={colorConfig} setColorConfig={setColorConfig} />}
                        {enableVideo && <VideoTab
                            colorConfig={colorConfig}
                            setColorConfig={setColorConfig}
                        />}
                    </Tabs>
                </CardContent>
            </Card>
        </TooltipProvider>
    )
}
