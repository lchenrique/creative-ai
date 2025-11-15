/**
 * Extrai todas as cores únicas de um SVG
 * @param svgString - String contendo o código SVG
 * @returns Array de cores únicas encontradas no SVG
 */
export function extractColorsFromSVG(svgString: string): string[] {
    const colors = new Set<string>()

    // Regex para encontrar cores em diferentes formatos
    const colorPatterns = [
        // fill="color"
        /fill=["']([^"']+)["']/g,
        // stroke="color"
        /stroke=["']([^"']+)["']/g,
        // style="...fill:color..."
        /fill:\s*([^;}\s]+)/g,
        // style="...stroke:color..."
        /stroke:\s*([^;}\s]+)/g,
        // stop-color (para gradientes)
        /stop-color=["']([^"']+)["']/g,
    ]

    colorPatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(svgString)) !== null) {
            const color = match[1].trim()

            // Ignorar valores não-cor
            if (
                color !== 'none' &&
                color !== 'transparent' &&
                color !== 'currentColor' &&
                color !== 'inherit' &&
                color !== '' &&
                !color.startsWith('url(') // Ignorar referências a gradientes
            ) {
                colors.add(color)
            }
        }
    })

    return Array.from(colors)
}

/**
 * Converte uma cor para formato hexadecimal
 * @param color - Cor em qualquer formato (rgb, rgba, hex, nome)
 * @returns Cor em formato hexadecimal
 */
export function convertColorToHex(color: string): string {
    // Se já é hex, retorna
    if (color.startsWith('#')) {
        return color
    }

    // Criar elemento temporário para converter cor
    const tempDiv = document.createElement('div')
    tempDiv.style.color = color
    document.body.appendChild(tempDiv)

    const computedColor = window.getComputedStyle(tempDiv).color
    document.body.removeChild(tempDiv)

    // Converter rgb/rgba para hex
    const rgbMatch = computedColor.match(/\d+/g)
    if (rgbMatch) {
        const [r, g, b] = rgbMatch.map(Number)
        return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
    }

    return color
}

/**
 * Substitui uma cor específica no SVG
 * @param svgString - String contendo o código SVG
 * @param oldColor - Cor a ser substituída
 * @param newColor - Nova cor
 * @returns SVG com a cor substituída
 */
export function replaceColorInSVG(svgString: string, oldColor: string, newColor: string): string {
    // Normalizar cores para comparação
    const normalizedOld = oldColor.toLowerCase().replace(/\s/g, '')
    const normalizedNew = newColor

    // Substituir em diferentes contextos
    let result = svgString

    // fill="oldColor"
    result = result.replace(
        new RegExp(`fill=["']${escapeRegex(oldColor)}["']`, 'gi'),
        `fill="${normalizedNew}"`
    )

    // stroke="oldColor"
    result = result.replace(
        new RegExp(`stroke=["']${escapeRegex(oldColor)}["']`, 'gi'),
        `stroke="${normalizedNew}"`
    )

    // style="...fill:oldColor..."
    result = result.replace(
        new RegExp(`fill:\\s*${escapeRegex(oldColor)}`, 'gi'),
        `fill: ${normalizedNew}`
    )

    // style="...stroke:oldColor..."
    result = result.replace(
        new RegExp(`stroke:\\s*${escapeRegex(oldColor)}`, 'gi'),
        `stroke: ${normalizedNew}`
    )

    // stop-color (para gradientes)
    result = result.replace(
        new RegExp(`stop-color=["']${escapeRegex(oldColor)}["']`, 'gi'),
        `stop-color="${normalizedNew}"`
    )

    return result
}

/**
 * Escapa caracteres especiais para uso em regex
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Extrai informações de cores do SVG de forma estruturada
 * @param svgString - String contendo o código SVG
 * @returns Objeto com cores e suas informações
 */
export interface SVGColorInfo {
    color: string
    hexColor: string
    count: number
    type: 'fill' | 'stroke' | 'both'
}

export function extractSVGColorInfo(svgString: string): SVGColorInfo[] {
    const colorMap = new Map<string, { count: number; types: Set<'fill' | 'stroke'> }>()

    // Procurar por fills
    const fillMatches = svgString.matchAll(/fill=["']([^"']+)["']/g)
    for (const match of fillMatches) {
        const color = match[1].trim()
        if (isValidColor(color)) {
            const existing = colorMap.get(color) || { count: 0, types: new Set() }
            existing.count++
            existing.types.add('fill')
            colorMap.set(color, existing)
        }
    }

    // Procurar por strokes
    const strokeMatches = svgString.matchAll(/stroke=["']([^"']+)["']/g)
    for (const match of strokeMatches) {
        const color = match[1].trim()
        if (isValidColor(color)) {
            const existing = colorMap.get(color) || { count: 0, types: new Set() }
            existing.count++
            existing.types.add('stroke')
            colorMap.set(color, existing)
        }
    }

    // Converter para array
    const result: SVGColorInfo[] = []
    colorMap.forEach((info, color) => {
        const types = Array.from(info.types)
        result.push({
            color,
            hexColor: convertColorToHex(color),
            count: info.count,
            type: types.length === 2 ? 'both' : types[0],
        })
    })

    // Ordenar por quantidade de uso
    return result.sort((a, b) => b.count - a.count)
}

function isValidColor(color: string): boolean {
    return (
        color !== 'none' &&
        color !== 'transparent' &&
        color !== 'currentColor' &&
        color !== 'inherit' &&
        color !== '' &&
        !color.startsWith('url(')
    )
}
