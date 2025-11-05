import { patternAnimations } from "@/data/pattern-animations"
import { PATTERN_DEFAULTS } from "@/lib/pattern-utils"
import { generateBackgroundCSS, generateCoverClass } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useCreativeStore } from "@/stores/creative-store"
// Função para extrair cor hex de qualquer formato (hex, rgb, rgba, gradiente)
const extractHexColor = (colorString: string): string => {
    // Se já é hex, retornar
    if (colorString.startsWith('#')) {
        return colorString
    }

    // Se é rgb/rgba, converter para hex
    if (colorString.startsWith('rgb')) {
        const match = colorString.match(/rgba?\(([^)]+)\)/)
        if (match) {
            const values = match[1].split(',').map(v => parseInt(v.trim()))
            const [r, g, b] = values

            const toHex = (c: number) => {
                const hex = Math.round(c).toString(16)
                return hex.length === 1 ? '0' + hex : hex
            }

            return `#${toHex(r)}${toHex(g)}${toHex(b)}`
        }
    }

    // Se é gradiente, extrair a primeira cor
    if (colorString.includes('gradient')) {
        const match = colorString.match(/#[0-9a-fA-F]{6}/)
        if (match) {
            return match[0]
        }
    }

    // Fallback
    return '#ffffff'
}

export const generateComplementaryColor = (solidColor: string, variation: number = 0.5): string => {
    // Extrair cor hex
    const hexColor = extractHexColor(solidColor)

    // Converter hex para RGB
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    // Calcular luminosidade (fórmula padrão)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Determinar se a cor é clara ou escura
    const isLight = luminance > 0.5

    // Definir quantos tons mover (usando variação)
    const toneSteps = Math.min(variation, 2.0) // Limitar a variação máxima

    // Gerar cor complementar
    let complementaryR, complementaryG, complementaryB

    if (isLight) {
        // Se clara, mover alguns tons para baixo (mais escuro)
        const stepSize = 255 / 8 // Dividir em 8 níveis de luminosidade
        const darkenAmount = toneSteps * stepSize

        complementaryR = Math.max(0, r - darkenAmount)
        complementaryG = Math.max(0, g - darkenAmount)
        complementaryB = Math.max(0, b - darkenAmount)
    } else {
        // Se escura, mover alguns tons para cima (mais claro)
        const stepSize = 255 / 8 // Dividir em 8 níveis de luminosidade
        const lightenAmount = toneSteps * stepSize

        complementaryR = Math.min(255, r + lightenAmount)
        complementaryG = Math.min(255, g + lightenAmount)
        complementaryB = Math.min(255, b + lightenAmount)
    }

    // Converter de volta para hex
    const toHex = (c: number) => {
        const hex = Math.round(c).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(complementaryR)}${toHex(complementaryG)}${toHex(complementaryB)}`
}

export function Background() {


    const background = useCreativeStore((state) => state.background)
    const currentBackgroundCSS = generateBackgroundCSS(background)
    const currentBackgroundClass = generateCoverClass(background)
    const isPattern = background.colorType === 'pattern' && background.pattern
    const backgroundAnimation = false // Criativos não têm animação por padrão
    const patternCSSColor = background.solidColor || '#ffffff'

    const backgroundDefaultStyle = `
        .${currentBackgroundClass}:not(.no-animation .${currentBackgroundClass}, .${currentBackgroundClass}.preview):before {
            --animation-name: ${(backgroundAnimation && backgroundAnimation && currentBackgroundClass) ? patternAnimations[currentBackgroundClass] : "none"}
        }
    `

    let patternBgStyle = {}
    if (background.colorType === 'pattern' && background.pattern && PATTERN_DEFAULTS[background.pattern]) {
        // Usar a cor sólida como base para gerar cores complementares
        const baseColor = patternCSSColor

        patternBgStyle = Object.entries(PATTERN_DEFAULTS[background.pattern]).map(([key, _value]) => {
            const cMap: Record<string, number> = {
                '--c1': 0.8,
                '--c2': 0.5,
                '--c3': 1.2,
                '--c4': 1.5
            }

            return {
                [key]: generateComplementaryColor(baseColor, cMap[key] || 0.5)
            }
        }).reduce((acc, curr) => {
            return { ...acc, ...curr }
        }, {})
    }


    if (background.colorType === "image") {
        return (
            <>
                <img
                    className="absolute object-cover"
                    style={{
                        width: '600px',
                        height: '600px',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    src={background.image || ''}
                />
            </>
        )
    }

    if (background.colorType === "video" && background.video) {
        return (
            <>
                <video
                    className="absolute z-0 object-cover"
                    style={{
                        width: '600px',
                        height: '600px',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    src={background.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            </>
        )
    }


    return (
        <div>

            <style>
                {backgroundDefaultStyle}
                {`
                .pattern-bg {
                    ${Object.entries(patternBgStyle).map(([key, value]) => `${key}: ${value} !important;`).join('\n')}
                }
                `}
            </style>
            <div
                className={cn("absolute", currentBackgroundClass, "pattern-bg")}
                style={{
                    width: '600px',
                    height: '600px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    ...(!isPattern ? { background: currentBackgroundCSS, transition: "background 0.3s ease-in-out" } : {
                        animation: backgroundAnimation && backgroundAnimation && currentBackgroundClass ? patternAnimations[currentBackgroundClass] : "none"
                    })
                }} />
        </div>
    )
}
