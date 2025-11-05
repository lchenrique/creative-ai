import { ColorConfig } from '@/stores/creative-store'

/**
 * Template base identificador
 */
export type TemplateBaseId = 'perfil' | 'comunicado' | 'fitness'

/**
 * Objeto Fabric.js genérico
 */
export interface FabricObject {
  id?: string
  type: 'rect' | 'circle' | 'triangle' | 'line' | 'star' | 'path' | 'textbox' | 'image' | 'i-text'
  left?: number
  top?: number
  width?: number
  height?: number
  fill?: string | object
  stroke?: string
  strokeWidth?: number
  opacity?: number
  angle?: number
  scaleX?: number
  scaleY?: number
  selectable?: boolean
  evented?: boolean
  visible?: boolean
  // Text specific
  text?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: string | number
  fontStyle?: string
  textAlign?: string
  lineHeight?: number
  charSpacing?: number
  // Image specific
  src?: string
  crossOrigin?: string
  // Gradient
  gradient?: ColorConfig
  [key: string]: unknown
}

/**
 * Configuração do canvas
 */
export interface FabricCanvasConfig {
  width: number
  height: number
  backgroundColor?: string
  backgroundImage?: string
}

/**
 * Template Fabric.js completo
 */
export interface FabricTemplate {
  id: TemplateBaseId
  name: string
  description: string
  canvas: FabricCanvasConfig
  objects: FabricObject[]
  version?: string
}

/**
 * Template salvo pelo usuário
 */
export interface SavedTemplate {
  id: string
  name: string
  templateBase: TemplateBaseId
  json: FabricTemplate
  createdAt: string
  modifiedAt: string
  thumbnail?: string
}

/**
 * Resultado da modificação do template pelo Gemini
 */
export interface TemplateModificationResult {
  json: FabricTemplate
  imageKeywords: string[]
}

/**
 * Request para o Gemini modificar template
 */
export interface TemplateModificationRequest {
  templateJson: FabricTemplate
  description: string
}

/**
 * Keywords extraídas para busca de imagens
 */
export interface ImageSearchKeywords {
  primary: string[]
  secondary: string[]
}

/**
 * Resultado da busca de imagens
 */
export interface ImageSearchResult {
  url: string
  source: 'unsplash' | 'pixabay'
  id: string
  keyword: string
  alt?: string
}
