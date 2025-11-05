import { FabricTemplate } from '@/types/templates'

/**
 * Template 1: Perfil Básico (540x1000)
 * Para posts de perfil, stories, anúncios verticais
 */
export const perfilTemplate: FabricTemplate = {
  id: 'perfil',
  name: 'Perfil Básico',
  description: 'Template vertical para perfil, stories e posts (540x1000)',
  version: '1.0',
  canvas: {
    width: 540,
    height: 1000,
    backgroundColor: '#ffffff',
  },
  objects: [
    // Background rectangle
    {
      id: 'bg-rect',
      type: 'rect',
      left: 0,
      top: 0,
      width: 540,
      height: 1000,
      fill: '#4F46E5', // Indigo
      selectable: false,
      evented: false,
    },
    // Header image placeholder
    {
      id: 'header-image',
      type: 'rect',
      left: 20,
      top: 20,
      width: 500,
      height: 400,
      fill: '#E0E7FF', // Light indigo
      stroke: '#fff',
      strokeWidth: 3,
    },
    // Main title
    {
      id: 'main-title',
      type: 'textbox',
      left: 40,
      top: 450,
      width: 460,
      text: 'Seu Título Aqui',
      fontFamily: 'Poppins',
      fontSize: 48,
      fontWeight: 'bold',
      fill: '#ffffff',
      textAlign: 'center',
    },
    // Subtitle
    {
      id: 'subtitle',
      type: 'textbox',
      left: 40,
      top: 580,
      width: 460,
      text: 'Subtítulo ou descrição complementar',
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: 'normal',
      fill: '#E0E7FF',
      textAlign: 'center',
      lineHeight: 1.4,
    },
    // Bottom CTA
    {
      id: 'cta-box',
      type: 'rect',
      left: 70,
      top: 850,
      width: 400,
      height: 80,
      fill: '#ffffff',
      stroke: '#4F46E5',
      strokeWidth: 0,
    },
    {
      id: 'cta-text',
      type: 'textbox',
      left: 70,
      top: 870,
      width: 400,
      text: 'SAIBA MAIS',
      fontFamily: 'Poppins',
      fontSize: 28,
      fontWeight: 'bold',
      fill: '#4F46E5',
      textAlign: 'center',
    },
  ],
}

/**
 * Template 2: Comunicado (1080x1080)
 * Para posts quadrados, comunicados, anúncios
 */
export const comunicadoTemplate: FabricTemplate = {
  id: 'comunicado',
  name: 'Comunicado',
  description: 'Template quadrado para comunicados e posts gerais (1080x1080)',
  version: '1.0',
  canvas: {
    width: 1080,
    height: 1080,
    backgroundColor: '#ffffff',
  },
  objects: [
    // Background
    {
      id: 'bg-gradient',
      type: 'rect',
      left: 0,
      top: 0,
      width: 1080,
      height: 1080,
      fill: '#10B981', // Emerald green
      selectable: false,
      evented: false,
    },
    // Decorative circle top
    {
      id: 'deco-circle-1',
      type: 'circle',
      left: -100,
      top: -100,
      radius: 200,
      fill: 'rgba(255, 255, 255, 0.1)',
      selectable: false,
      evented: false,
    },
    // Decorative circle bottom
    {
      id: 'deco-circle-2',
      type: 'circle',
      left: 880,
      top: 880,
      radius: 250,
      fill: 'rgba(255, 255, 255, 0.1)',
      selectable: false,
      evented: false,
    },
    // Main content box
    {
      id: 'content-box',
      type: 'rect',
      left: 90,
      top: 240,
      width: 900,
      height: 600,
      fill: '#ffffff',
      stroke: '#10B981',
      strokeWidth: 0,
    },
    // Icon/Image placeholder
    {
      id: 'icon-placeholder',
      type: 'circle',
      left: 440,
      top: 120,
      radius: 80,
      fill: '#ffffff',
      stroke: '#10B981',
      strokeWidth: 6,
    },
    // Title
    {
      id: 'title',
      type: 'textbox',
      left: 140,
      top: 320,
      width: 800,
      text: 'COMUNICADO IMPORTANTE',
      fontFamily: 'Poppins',
      fontSize: 52,
      fontWeight: 'bold',
      fill: '#10B981',
      textAlign: 'center',
    },
    // Main text
    {
      id: 'main-text',
      type: 'textbox',
      left: 140,
      top: 450,
      width: 800,
      text: 'Aqui vai o texto principal do seu comunicado. Você pode adicionar informações importantes e detalhes relevantes.',
      fontFamily: 'Inter',
      fontSize: 28,
      fontWeight: 'normal',
      fill: '#1F2937',
      textAlign: 'center',
      lineHeight: 1.6,
    },
    // Footer text
    {
      id: 'footer',
      type: 'textbox',
      left: 140,
      top: 720,
      width: 800,
      text: 'Para mais informações, entre em contato',
      fontFamily: 'Inter',
      fontSize: 22,
      fontWeight: 'normal',
      fill: '#6B7280',
      textAlign: 'center',
    },
  ],
}

/**
 * Template 3: Fitness (1080x1200)
 * Para posts de fitness, motivação, dicas
 */
export const fitnessTemplate: FabricTemplate = {
  id: 'fitness',
  name: 'Fitness',
  description: 'Template para posts de fitness e motivação (1080x1200)',
  version: '1.0',
  canvas: {
    width: 1080,
    height: 1200,
    backgroundColor: '#000000',
  },
  objects: [
    // Background image placeholder (dark overlay)
    {
      id: 'bg-image',
      type: 'rect',
      left: 0,
      top: 0,
      width: 1080,
      height: 1200,
      fill: '#1F2937', // Dark gray
      selectable: false,
      evented: false,
    },
    // Overlay gradient
    {
      id: 'overlay',
      type: 'rect',
      left: 0,
      top: 0,
      width: 1080,
      height: 1200,
      fill: 'rgba(0, 0, 0, 0.5)',
      selectable: false,
      evented: false,
    },
    // Top accent bar
    {
      id: 'accent-bar',
      type: 'rect',
      left: 0,
      top: 0,
      width: 1080,
      height: 8,
      fill: '#EF4444', // Red accent
      selectable: false,
      evented: false,
    },
    // Quote marks decoration
    {
      id: 'quote-mark',
      type: 'textbox',
      left: 80,
      top: 100,
      width: 150,
      text: '"',
      fontFamily: 'Playfair Display',
      fontSize: 180,
      fontWeight: 'bold',
      fill: '#EF4444',
      textAlign: 'left',
      opacity: 0.3,
    },
    // Main motivational text
    {
      id: 'main-quote',
      type: 'textbox',
      left: 80,
      top: 300,
      width: 920,
      text: 'SUA ÚNICA LIMITAÇÃO É VOCÊ MESMO',
      fontFamily: 'Montserrat',
      fontSize: 64,
      fontWeight: 'bold',
      fill: '#ffffff',
      textAlign: 'left',
      lineHeight: 1.2,
      charSpacing: 50,
    },
    // Secondary text
    {
      id: 'secondary-text',
      type: 'textbox',
      left: 80,
      top: 600,
      width: 920,
      text: 'Treine. Supere. Conquiste.',
      fontFamily: 'Inter',
      fontSize: 36,
      fontWeight: 'normal',
      fill: '#D1D5DB',
      textAlign: 'left',
      lineHeight: 1.5,
    },
    // Stats box 1
    {
      id: 'stat-box-1',
      type: 'rect',
      left: 80,
      top: 850,
      width: 280,
      height: 200,
      fill: 'rgba(239, 68, 68, 0.2)',
      stroke: '#EF4444',
      strokeWidth: 2,
    },
    {
      id: 'stat-number-1',
      type: 'textbox',
      left: 100,
      top: 880,
      width: 240,
      text: '500+',
      fontFamily: 'Poppins',
      fontSize: 56,
      fontWeight: 'bold',
      fill: '#EF4444',
      textAlign: 'center',
    },
    {
      id: 'stat-label-1',
      type: 'textbox',
      left: 100,
      top: 970,
      width: 240,
      text: 'Treinos',
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: 'normal',
      fill: '#ffffff',
      textAlign: 'center',
    },
    // Stats box 2
    {
      id: 'stat-box-2',
      type: 'rect',
      left: 400,
      top: 850,
      width: 280,
      height: 200,
      fill: 'rgba(239, 68, 68, 0.2)',
      stroke: '#EF4444',
      strokeWidth: 2,
    },
    {
      id: 'stat-number-2',
      type: 'textbox',
      left: 420,
      top: 880,
      width: 240,
      text: '1000+',
      fontFamily: 'Poppins',
      fontSize: 56,
      fontWeight: 'bold',
      fill: '#EF4444',
      textAlign: 'center',
    },
    {
      id: 'stat-label-2',
      type: 'textbox',
      left: 420,
      top: 970,
      width: 240,
      text: 'Alunos',
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: 'normal',
      fill: '#ffffff',
      textAlign: 'center',
    },
    // Stats box 3
    {
      id: 'stat-box-3',
      type: 'rect',
      left: 720,
      top: 850,
      width: 280,
      height: 200,
      fill: 'rgba(239, 68, 68, 0.2)',
      stroke: '#EF4444',
      strokeWidth: 2,
    },
    {
      id: 'stat-number-3',
      type: 'textbox',
      left: 740,
      top: 880,
      width: 240,
      text: '24/7',
      fontFamily: 'Poppins',
      fontSize: 56,
      fontWeight: 'bold',
      fill: '#EF4444',
      textAlign: 'center',
    },
    {
      id: 'stat-label-3',
      type: 'textbox',
      left: 740,
      top: 970,
      width: 240,
      text: 'Suporte',
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: 'normal',
      fill: '#ffffff',
      textAlign: 'center',
    },
  ],
}

/**
 * Mapa de todos os templates disponíveis
 */
export const baseTemplates: Record<string, FabricTemplate> = {
  perfil: perfilTemplate,
  comunicado: comunicadoTemplate,
  fitness: fitnessTemplate,
}

/**
 * Lista de IDs dos templates
 */
export const templateIds = Object.keys(baseTemplates) as Array<keyof typeof baseTemplates>

/**
 * Helper para obter um template por ID
 */
export function getTemplateById(id: string): FabricTemplate | undefined {
  return baseTemplates[id]
}
