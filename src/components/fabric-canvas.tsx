import { useEffect, useRef, useCallback } from "react";
import { Canvas, Rect, Circle, Triangle, Line, Polygon, FabricImage, Point, util, Textbox, Gradient, Pattern, Group, ActiveSelection } from "fabric";
import * as fabric from "fabric";
import FontFaceObserver from 'fontfaceobserver';
import WebFont from 'webfontloader';
import { Background } from "./art-background";
import { useCreativeStore } from "@/stores/creative-store";
import { INITIAL_COLOR_CONFIG } from "@/stores/creative-store";
import type { ColorConfig } from "./gradient-control";
import { fontOptions } from "@/data/font-options";
import { CanvasContextMenu } from "./canvas-context-menu";

// Função para criar gradiente na Fabric.js
const createFabricGradient = (
  object: Textbox,
  colorConfig: ColorConfig
) => {
  if (colorConfig.colorType !== "gradient") {
    return colorConfig.solidColor;
  }

  const gradientConfig = colorConfig.gradient;

  // Obter o ângulo do gradiente da UI e a rotação atual do objeto
  const gradientAngle = gradientConfig.angle;
  const objectAngle = object.angle || 0;

  // Contra-rotacionar a definição do gradiente pelo ângulo do objeto
  // para que pareça que ele está girando com o objeto.
  const finalAngle = gradientAngle - objectAngle;

  const angleRad = finalAngle * (Math.PI / 180);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  // Calcular coordenadas em um quadrado unitário [0,1]
  const x1 = 0.5 - cos / 2;
  const y1 = 0.5 - sin / 2;
  const x2 = 0.5 + cos / 2;
  const y2 = 0.5 + sin / 2;

  // Escalar coordenadas para as dimensões do objeto
  const coords = {
    x1: x1 * object.width,
    y1: y1 * object.height,
    x2: x2 * object.width,
    y2: y2 * object.height,
  };

  const colorStops = gradientConfig.stops.map(stop => ({
    offset: stop.position / 100,
    color: stop.color,
  }));

  return new Gradient({
    type: "linear",
    coords,
    colorStops,
  });
};

export function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const contextLinesRef = useRef<CanvasRenderingContext2D | null>(null);
  const setCanvasActions = useCreativeStore((state) => state.setCanvasActions);
  const setSelectedText = useCreativeStore((state) => state.setSelectedText);
  const selectedText = useCreativeStore((state) => state.selectedText);

  const snapAngleDegrees = 5; // Graus de snap para rotação
  const rotateSnaps = Array.from({ length: 73 }, (_, i) => i * 5); // 0, 5, 10, 15, ..., 360
  const centerLineColor = '#3988ad';
  const centerLineWidth = 1;

  // Smart Guides configuration
  const aligningLineOffset = 5;
  const aligningLineMargin = 4;
  const aligningLineWidth = 1;
  const aligningLineColor = 'rgb(255,0,0)';
  const aligningDash = [5, 5];

  // Function to add a new rectangle
  const addRectangle = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const offset = getWorkAreaOffset();
    const colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const rect = new Rect({
      width: 150,
      height: 100,
      top: offset.top + Math.random() * 200 + 100,
      left: offset.left + Math.random() * 300 + 100,
      fill: randomColor,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: snapAngleDegrees,
      snapThreshold: 10,
      lockRotation: false,
    } as any);

    (rect as any).myType = "box";
    (rect as any).minScaleLimit = 0.4;
    (rect as any).lockedDegree = null;

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  }, []);

  // Function to add a new textbox
  const addTextbox = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const offset = getWorkAreaOffset();

    const textbox = new Textbox('Texto aqui', {
      left: offset.left + Math.random() * 300 + 100,
      top: offset.top + Math.random() * 200 + 100,
      width: 120,
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: snapAngleDegrees,
      snapThreshold: 10,
      textAlign: "center"
    });

    (textbox as any).lockedDegree = null;

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
  }, []);

  // Function to add a new circle
  const addCircle = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const offset = getWorkAreaOffset();
    const colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const circle = new Circle({
      radius: 50,
      top: offset.top + Math.random() * 200 + 100,
      left: offset.left + Math.random() * 300 + 100,
      fill: randomColor,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: snapAngleDegrees,
      snapThreshold: 10,
    } as any);

    (circle as any).lockedDegree = null;

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  }, []);

  // Function to add a new triangle
  const addTriangle = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const offset = getWorkAreaOffset();
    const colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const triangle = new Triangle({
      width: 100,
      height: 100,
      top: offset.top + Math.random() * 200 + 100,
      left: offset.left + Math.random() * 300 + 100,
      fill: randomColor,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: snapAngleDegrees,
      snapThreshold: 10,
    } as any);

    (triangle as any).lockedDegree = null;

    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.renderAll();
  }, []);

  // Function to add a new line
  const addLine = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const offset = getWorkAreaOffset();

    const line = new Line([50, 50, 200, 50], {
      left: offset.left + Math.random() * 200 + 100,
      top: offset.top + Math.random() * 200 + 100,
      stroke: '#000000',
      strokeWidth: 3,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: snapAngleDegrees,
      snapThreshold: 10,
    } as any);

    (line as any).lockedDegree = null;

    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  }, []);

  // Function to add a star
  const addStar = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const offset = getWorkAreaOffset();
    const colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Create star points
    const points = [];
    const spikes = 5;
    const outerRadius = 50;
    const innerRadius = 25;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }

    const star = new Polygon(points, {
      left: offset.left + Math.random() * 300 + 100,
      top: offset.top + Math.random() * 200 + 100,
      fill: randomColor,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: snapAngleDegrees,
      snapThreshold: 10,
    } as any);

    (star as any).lockedDegree = null;

    canvas.add(star);
    canvas.setActiveObject(star);
    canvas.renderAll();
  }, []);

  // Function to add a heart
  const addHeart = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const offset = getWorkAreaOffset();
    const colors = ['red', 'pink', 'purple', 'orange'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Using Polygon to create a simple heart shape
    const points = [
      { x: 0, y: -30 },
      { x: -15, y: -45 },
      { x: -30, y: -30 },
      { x: -30, y: -10 },
      { x: 0, y: 20 },
      { x: 30, y: -10 },
      { x: 30, y: -30 },
      { x: 15, y: -45 },
    ];

    const heart = new Polygon(points, {
      left: offset.left + Math.random() * 300 + 100,
      top: offset.top + Math.random() * 200 + 100,
      fill: randomColor,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: snapAngleDegrees,
      snapThreshold: 10,
    } as any);

    (heart as any).lockedDegree = null;

    canvas.add(heart);
    canvas.setActiveObject(heart);
    canvas.renderAll();
  }, []);

  // Function to upload and add an image
  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !fabricCanvasRef.current) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;

        FabricImage.fromURL(imgUrl).then((img) => {
          if (!fabricCanvasRef.current) return;

          const canvas = fabricCanvasRef.current;
          const offset = getWorkAreaOffset();

          // Scale image to fit canvas
          const maxWidth = 300;
          const maxHeight = 300;
          const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1), 1);

          img.set({
            left: offset.left + Math.random() * 200 + 100,
            top: offset.top + Math.random() * 150 + 100,
            scaleX: scale,
            scaleY: scale,
            centeredRotation: true,
            centeredScaling: false,
            snapAngle: snapAngleDegrees,
            snapThreshold: 10,
          } as any);

          (img as any).lockedDegree = null;

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      };

      reader.readAsDataURL(file);
    };

    input.click();
  }, []);

  // Function to add image from URL (for clipart)
  const addImageFromURL = useCallback((imageUrl: string) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const offset = getWorkAreaOffset();

    // Verificar se é SVG
    const isSVG = imageUrl.toLowerCase().endsWith('.svg');

    console.log('🖼️ addImageFromURL chamado:', { imageUrl, isSVG });

    if (isSVG) {
      // Carregar SVG como objetos editáveis
      console.log('🎨 Carregando SVG...');

      // Primeiro baixar o SVG como texto
      fetch(imageUrl)
        .then(response => response.text())
        .then(svgText => {
          console.log('✅ SVG texto carregado');

          // Usar loadSVGFromString - retorna Promise com array de objetos
          fabric.loadSVGFromString(svgText).then(({ objects, options }: any) => {
            if (!fabricCanvasRef.current) return;

            console.log('✅ Objetos Fabric criados:', objects.length, 'objetos');

            // Se só tem um objeto, usar direto
            let svgGroup;
            if (objects.length === 1) {
              svgGroup = objects[0];
            } else {
              // Criar grupo com múltiplos objetos
              svgGroup = new Group(objects);
            }

            if (svgGroup) {
              console.log('✅ Grupo SVG criado:', svgGroup);

              // Scale to fit canvas
              const maxWidth = 300;
              const maxHeight = 300;
              const scale = Math.min(
                maxWidth / (svgGroup.width || 200),
                maxHeight / (svgGroup.height || 200),
                1
              );

              svgGroup.set({
                left: offset.left + Math.random() * 200 + 100,
                top: offset.top + Math.random() * 150 + 100,
                scaleX: scale,
                scaleY: scale,
                centeredRotation: true,
                centeredScaling: false,
                snapAngle: snapAngleDegrees,
                snapThreshold: 10,
              });

              (svgGroup as any).lockedDegree = null;
              (svgGroup as any)._isSVGGroup = true; // Marcar como grupo SVG

              canvas.add(svgGroup);
              canvas.setActiveObject(svgGroup);
              canvas.renderAll();

              console.log('✅ SVG adicionado ao canvas');
            } else {
              console.error('❌ Falha ao criar grupo SVG');
            }
          });
        })
        .catch(error => {
          console.error('❌ Erro ao carregar SVG:', error, imageUrl);
        });
    } else {
      // Carregar imagem normal (PNG, JPG)
      console.log('🖼️ Carregando imagem raster...');

      FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
        if (!fabricCanvasRef.current) return;

        console.log('✅ Imagem carregada:', img);

        // Scale image to fit canvas
        const maxWidth = 300;
        const maxHeight = 300;
        const scale = Math.min(maxWidth / (img.width || 200), maxHeight / (img.height || 200), 1);

        img.set({
          left: offset.left + Math.random() * 200 + 100,
          top: offset.top + Math.random() * 150 + 100,
          scaleX: scale,
          scaleY: scale,
          centeredRotation: true,
          centeredScaling: false,
          snapAngle: snapAngleDegrees,
          snapThreshold: 10,
        } as any);

        (img as any).lockedDegree = null;

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();

        console.log('✅ Imagem adicionada ao canvas');
      }).catch((error) => {
        console.error('❌ Error loading image from URL:', error, imageUrl);
      });
    }
  }, []);

  // Parametrized functions for AI commands
  const addTextboxWithParams = useCallback((text: string, options: any = {}) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const canvasWidth = canvas.width || 600;
    const canvasHeight = canvas.height || 600;

    const textbox = new Textbox(text, {
      left: options.left ?? canvasWidth / 2 - 100,
      top: options.top ?? canvasHeight / 4,
      width: options.width ?? 200,
      fontSize: options.fontSize ?? 24,
      fill: options.color ?? '#000000',
      fontFamily: options.fontFamily ?? 'Arial',
      fontWeight: options.fontWeight ?? 'normal',
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
      snapThreshold: 10,
    } as any);

    (textbox as any).lockedDegree = null;

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    console.log('📝 Textbox adicionado:', text, options);
  }, []);

  const addRectangleWithParams = useCallback((options: any = {}) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const canvasWidth = canvas.width || 600;
    const canvasHeight = canvas.height || 600;

    const rect = new Rect({
      width: options.width ?? 150,
      height: options.height ?? 100,
      top: options.top ?? canvasHeight / 2,
      left: options.left ?? canvasWidth / 2 - 75,
      fill: options.color ?? 'blue',
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
      snapThreshold: 10,
    } as any);

    (rect as any).myType = "box";
    (rect as any).minScaleLimit = 0.4;
    (rect as any).lockedDegree = null;

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    console.log('🟦 Retângulo adicionado:', options);
  }, []);

  const addCircleWithParams = useCallback((options: any = {}) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const canvasWidth = canvas.width || 600;
    const canvasHeight = canvas.height || 600;

    const circle = new Circle({
      radius: options.radius ?? 50,
      top: options.top ?? canvasHeight / 2,
      left: options.left ?? canvasWidth / 2 - 50,
      fill: options.color ?? 'red',
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
      snapThreshold: 10,
    } as any);

    (circle as any).lockedDegree = null;

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    console.log('🔵 Círculo adicionado:', options);
  }, []);

  const addImageFromURLWithParams = useCallback((imageUrl: string, options: any = {}) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const canvasWidth = canvas.width || 600;
    const canvasHeight = canvas.height || 600;

    FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
      if (!fabricCanvasRef.current) return;

      // Define scale baseado em width/height fornecidos ou padrão
      const targetWidth = options.width ?? 200;
      const targetHeight = options.height ?? 200;
      const scaleX = targetWidth / (img.width || 1);
      const scaleY = targetHeight / (img.height || 1);

      img.set({
        left: options.left ?? canvasWidth / 2 - targetWidth / 2,
        top: options.top ?? canvasHeight / 2 - targetHeight / 2,
        scaleX: scaleX,
        scaleY: scaleY,
        centeredRotation: true,
        centeredScaling: false,
        snapAngle: 45,
        snapThreshold: 10,
      } as any);

      (img as any).lockedDegree = null;

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      console.log('🖼️ Imagem adicionada com params:', options);
    }).catch((error) => {
      console.error('Error loading image from URL:', error);
    });
  }, []);

  // Aplicar imagem com máscara de recorte (clipPath)
  const applyImageAsClipMask = useCallback(async (imageUrl: string) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) {
      console.warn('⚠️ Nenhum objeto selecionado para aplicar máscara');
      return;
    }

    if (activeObject.type === 'line' || activeObject.type === 'textbox' || activeObject.type === 'i-text') {
      console.warn('⚠️ Tipo de objeto não suportado para máscara');
      return;
    }

    try {
      // Carregar a imagem
      const fabricImg = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
      if (!fabricCanvasRef.current) return;

      // Pegar dimensões e posição do shape original
      const shapeLeft = activeObject.left || 0;
      const shapeTop = activeObject.top || 0;
      const shapeWidth = activeObject.width || 100;
      const shapeHeight = activeObject.height || 100;
      const shapeScaleX = activeObject.scaleX || 1;
      const shapeScaleY = activeObject.scaleY || 1;
      const shapeAngle = activeObject.angle || 0;

      // Calcular dimensões finais do shape
      const finalWidth = shapeWidth * shapeScaleX;
      const finalHeight = shapeHeight * shapeScaleY;

      // Configurar a imagem para preencher o shape
      const imgWidth = fabricImg.width || 1;
      const imgHeight = fabricImg.height || 1;

      // Calcular escala para cobrir todo o shape
      const scaleX = finalWidth / imgWidth;
      const scaleY = finalHeight / imgHeight;
      const scale = Math.max(scaleX, scaleY); // Usar o maior para cobrir completamente

      // Criar uma cópia do shape para usar como clipPath
      const clonedShape = await activeObject.clone();

      // Resetar transformações do clone para usar como máscara
      clonedShape.set({
        left: -finalWidth / 2,
        top: -finalHeight / 2,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        absolutePositioned: true,
      });

      // Configurar a imagem
      fabricImg.set({
        left: shapeLeft,
        top: shapeTop,
        scaleX: scale,
        scaleY: scale,
        angle: shapeAngle,
        clipPath: clonedShape, // Aplicar o shape como máscara
        centeredRotation: true,
        centeredScaling: false,
        snapAngle: 45,
        snapThreshold: 10,
      });

      // Guardar referência ao shape original (se quiser permitir edição da máscara)
      (fabricImg as any).maskShape = clonedShape;
      (fabricImg as any).originalShapeType = activeObject.type;

      // Remover shape original e adicionar imagem mascarada
      canvas.remove(activeObject);
      canvas.add(fabricImg);
      canvas.setActiveObject(fabricImg);
      canvas.renderAll();

      console.log('🎭 Máscara de recorte aplicada:', activeObject.type);
    } catch (error) {
      console.error('❌ Erro ao aplicar máscara de recorte:', error);
    }
  }, []);

  // Aplicar padrão de imagem em objeto (mantido para compatibilidade)
  const applyPatternToObject = useCallback((imageUrl: string, repeatMode: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' = 'no-repeat') => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) {
      console.warn('⚠️ Nenhum objeto selecionado para aplicar padrão');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const pattern = new Pattern({
        source: img,
        repeat: repeatMode,
      });
      activeObject.set('fill', pattern);
      canvas.renderAll();
      console.log('🎨 Padrão aplicado ao objeto:', repeatMode);
    };
    img.onerror = () => {
      console.error('❌ Erro ao carregar imagem do padrão');
    };
    img.src = imageUrl;
  }, []);

  // Remover padrão e restaurar cor sólida
  const removePatternFromObject = useCallback((color: string = '#000000') => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) {
      console.warn('⚠️ Nenhum objeto selecionado');
      return;
    }

    activeObject.set('fill', color);
    canvas.renderAll();
    console.log('🎨 Padrão removido, cor restaurada:', color);
  }, []);

  // ===== SIMPLIFIED CLIP SYSTEM =====

  // Aplicar clipPath a um objeto com shell de controle opcional
  const applyClipPathToObject = useCallback(async (clipShapeType: 'circle' | 'rect' | 'path' = 'circle', showShell: boolean = true) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) {
      console.warn('⚠️ Nenhum objeto selecionado');
      return;
    }

    try {
      let clipPath: any;
      let shell: any = null;

      // Criar clipPath baseado no tipo
      if (clipShapeType === 'circle') {
        const radius = 100;
        clipPath = new Circle({
          radius: radius,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true,
        });

        if (showShell) {
          shell = new Circle({
            radius: radius,
            left: activeObject.left || 0,
            top: activeObject.top || 0,
            fill: 'transparent',
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            originX: 'center',
            originY: 'center',
            hasControls: true,
            hasBorders: true,
          });
        }
      } else if (clipShapeType === 'rect') {
        const width = 200;
        const height = 150;
        clipPath = new Rect({
          width: width,
          height: height,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true,
        });

        if (showShell) {
          shell = new Rect({
            width: width,
            height: height,
            left: activeObject.left || 0,
            top: activeObject.top || 0,
            fill: 'transparent',
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            originX: 'center',
            originY: 'center',
            hasControls: true,
            hasBorders: true,
          });
        }
      }

      // Aplicar clipPath ao objeto
      activeObject.set({
        clipPath: clipPath,
      });

      // Guardar referências
      (activeObject as any)._clipPath = clipPath;
      (activeObject as any)._clipShell = shell;

      if (shell) {
        // Adicionar shell ao canvas
        canvas.add(shell);

        // Marcar como shell de controle
        (shell as any)._isClipShell = true;
        (shell as any)._targetObject = activeObject;

        // Eventos do shell para controlar a máscara
        shell.on('moving', () => {
          if (!clipPath) return;
          clipPath.setPositionByOrigin(shell.getCenterPoint(), 'center', 'center');
          activeObject.set('dirty', true);
          canvas.renderAll();
        });

        shell.on('rotating', () => {
          if (!clipPath) return;
          clipPath.set({ angle: shell.angle });
          activeObject.set('dirty', true);
          canvas.renderAll();
        });

        shell.on('scaling', () => {
          if (!clipPath) return;
          clipPath.set({
            scaleX: shell.scaleX,
            scaleY: shell.scaleY,
          });
          activeObject.set('dirty', true);
          canvas.renderAll();
        });

        // Posicionar clipPath inicialmente
        clipPath.setPositionByOrigin(shell.getCenterPoint(), 'center', 'center');
      }

      canvas.renderAll();
      console.log('🎭 ClipPath aplicado com shell de controle');
    } catch (error) {
      console.error('❌ Erro ao aplicar clipPath:', error);
    }
  }, []);

  // Remover clipPath de um objeto
  const removeClipPath = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) {
      console.warn('⚠️ Nenhum objeto selecionado');
      return;
    }

    // Remover shell se existir
    const shell = (activeObject as any)._clipShell;
    if (shell) {
      canvas.remove(shell);
    }

    // Remover clipPath
    activeObject.set('clipPath', null);
    delete (activeObject as any)._clipPath;
    delete (activeObject as any)._clipShell;

    canvas.renderAll();
    console.log('🔓 ClipPath removido');
  }, []);

  // ===== IMAGE FRAME SYSTEM =====

  // Converter forma em moldura para imagens
  const convertToImageFrame = useCallback(async (imageUrl?: string) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject || activeObject.type === 'textbox' || activeObject.type === 'i-text' || activeObject.type === 'image') {
      console.warn('⚠️ Selecione uma forma (retângulo, círculo, etc.) para converter em moldura');
      return;
    }

    try {
      // Criar clipPath baseado no tipo da forma
      let clipPath: any;
      const objWidth = (activeObject.width || 100) * (activeObject.scaleX || 1);
      const objHeight = (activeObject.height || 100) * (activeObject.scaleY || 1);
      const objCenter = activeObject.getCenterPoint();

      if (activeObject.type === 'circle') {
        const radius = (activeObject as any).radius * (activeObject.scaleX || 1);
        clipPath = new Circle({
          radius: radius,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true,
        });
      } else if (activeObject.type === 'rect') {
        clipPath = new Rect({
          width: objWidth,
          height: objHeight,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true,
        });
      } else if (activeObject.type === 'triangle' || activeObject.type === 'polygon') {
        // Para formas complexas, clonar
        const cloned = await activeObject.clone();
        clipPath = cloned;
        clipPath.set({
          originX: 'center',
          originY: 'center',
          absolutePositioned: true,
        });
      } else {
        console.warn('⚠️ Tipo de forma não suportado:', activeObject.type);
        return;
      }

      clipPath.setPositionByOrigin(objCenter, 'center', 'center');
      clipPath.set('angle', activeObject.angle);

      // Função auxiliar para criar frame com imagem
      const createFrameWithImage = async (imgUrl: string) => {
        const imgElement = await FabricImage.fromURL(imgUrl, {
          crossOrigin: 'anonymous',
        });

        // Escalar imagem para cobrir a moldura
        const imgWidth = imgElement.width || 100;
        const imgHeight = imgElement.height || 100;
        const scale = Math.max(objWidth / imgWidth, objHeight / imgHeight);

        imgElement.set({
          scaleX: scale,
          scaleY: scale,
          clipPath: clipPath,
          selectable: true,
          evented: true,
        } as any);

        // Marcar como imagem de moldura
        (imgElement as any)._isFrameImage = true;
        (imgElement as any)._frameObject = activeObject;

        imgElement.setPositionByOrigin(objCenter, 'center', 'center');

        // Marcar a moldura
        (activeObject as any)._isFrame = true;
        (activeObject as any)._frameImage = imgElement;
        (activeObject as any)._frameClipPath = clipPath;

        // Sincronizar moldura → clipPath → imagem
        activeObject.on('moving', () => {
          const newCenter = activeObject.getCenterPoint();
          clipPath.setPositionByOrigin(newCenter, 'center', 'center');
          canvas.renderAll();
        });

        activeObject.on('rotating', () => {
          clipPath.set('angle', activeObject.angle);
          canvas.renderAll();
        });

        activeObject.on('scaling', () => {
          if (activeObject.type === 'circle') {
            const newRadius = (activeObject as any).radius * (activeObject.scaleX || 1);
            clipPath.set('radius', newRadius);
          } else if (activeObject.type === 'rect') {
            const newWidth = (activeObject.width || 100) * (activeObject.scaleX || 1);
            const newHeight = (activeObject.height || 100) * (activeObject.scaleY || 1);
            clipPath.set({ width: newWidth, height: newHeight });
          }
          canvas.renderAll();
        });

        // Adicionar imagem ao canvas
        canvas.add(imgElement);
        canvas.setActiveObject(imgElement);
        canvas.renderAll();

        console.log('✅ Moldura criada com imagem arrastável');
      };

      // Se não tiver URL, pedir upload
      if (!imageUrl) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
              const imgUrl = event.target?.result as string;
              await createFrameWithImage(imgUrl);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        await createFrameWithImage(imageUrl);
      }
    } catch (error) {
      console.error('❌ Erro ao criar moldura:', error);
    }
  }, []);

  // Remover imagem da moldura
  const removeFrameImage = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return;

    // Se for a imagem, remover
    if ((activeObject as any)._isFrameImage) {
      const frame = (activeObject as any)._frameObject;
      if (frame) {
        delete (frame as any)._frameImage;
        delete (frame as any)._frameClipPath;
      }
      canvas.remove(activeObject);
      canvas.renderAll();
      console.log('✅ Imagem removida da moldura');
      return;
    }

    // Se for a moldura, remover a imagem associada
    if ((activeObject as any)._isFrame && (activeObject as any)._frameImage) {
      canvas.remove((activeObject as any)._frameImage);
      delete (activeObject as any)._frameImage;
      delete (activeObject as any)._frameClipPath;
      delete (activeObject as any)._isFrame;
      canvas.renderAll();
      console.log('✅ Imagem removida da moldura');
    }
  }, []);

  // ===== CLIP GROUP FUNCTIONS (DEPRECATED - USE IMAGE FRAME INSTEAD) =====

  // Converter objeto selecionado em Clip Group
  const convertToClipGroup = useCallback(async () => {
    if (!fabricCanvasRef.current) return null;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) {
      console.warn('⚠️ Nenhum objeto selecionado para converter em Clip Group');
      return null;
    }

    if (activeObject.type === 'group' && (activeObject as any)._isClipGroup) {
      console.warn('⚠️ Objeto já é um Clip Group');
      return activeObject;
    }

    try {
      // Clonar o objeto para usar como clipPath
      const clipShape = await activeObject.clone();

      // Resetar posição do clip para relativa ao grupo
      clipShape.set({
        left: 0,
        top: 0,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
      });

      // Criar um grupo vazio com o clipPath
      const clipGroup = new Group([], {
        left: activeObject.left,
        top: activeObject.top,
        angle: activeObject.angle || 0,
        clipPath: clipShape,
      });

      // Marcar como Clip Group
      (clipGroup as any)._isClipGroup = true;
      (clipGroup as any)._clipShape = clipShape;
      (clipGroup as any)._originalType = activeObject.type;

      // Remover objeto original e adicionar grupo
      canvas.remove(activeObject);
      canvas.add(clipGroup);
      canvas.setActiveObject(clipGroup);
      canvas.renderAll();

      console.log('✨ Clip Group criado');
      return clipGroup;
    } catch (error) {
      console.error('❌ Erro ao converter para Clip Group:', error);
      return null;
    }
  }, []);

  // Entrar no modo de edição do Clip Group
  const enterClipGroupEditMode = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject || activeObject.type !== 'group') {
      console.warn('⚠️ Selecione um Clip Group para editar');
      return;
    }

    const clipGroup = activeObject as any;

    if (!clipGroup._isClipGroup) {
      console.warn('⚠️ Objeto não é um Clip Group');
      return;
    }

    // Marcar como modo de edição
    clipGroup._isClipGroupEditMode = true;

    // Tornar o grupo selecionável mas mostrar os objetos internos
    clipGroup.set({
      selectable: true,
      evented: true,
    });

    // Permitir seleção de objetos internos
    clipGroup.set('subTargetCheck', true);

    canvas.renderAll();
    console.log('📝 Modo de edição ativado para Clip Group');
  }, []);

  // Sair do modo de edição do Clip Group
  const exitClipGroupEditMode = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (activeObject && activeObject.type === 'group') {
      const clipGroup = activeObject as any;
      clipGroup._isClipGroupEditMode = false;
      clipGroup.set('subTargetCheck', false);
      canvas.discardActiveObject();
      canvas.renderAll();
      console.log('✅ Modo de edição desativado');
    }
  }, []);

  // Adicionar objeto ao Clip Group selecionado
  const addToClipGroup = useCallback((object: any) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const clipGroup = canvas.getActiveObject();

    if (!clipGroup || clipGroup.type !== 'group') {
      console.warn('⚠️ Selecione um Clip Group primeiro');
      return;
    }

    const group = clipGroup as any;

    if (!group._isClipGroup) {
      console.warn('⚠️ Objeto não é um Clip Group');
      return;
    }

    // Adicionar objeto ao grupo
    group.addWithUpdate(object);
    canvas.renderAll();
    console.log('➕ Objeto adicionado ao Clip Group');
  }, []);

  // Remover objeto do Clip Group
  const removeFromClipGroup = useCallback((object: any) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const clipGroup = canvas.getActiveObject();

    if (!clipGroup || clipGroup.type !== 'group') {
      console.warn('⚠️ Selecione um Clip Group primeiro');
      return;
    }

    const group = clipGroup as any;

    if (!group._isClipGroup) {
      console.warn('⚠️ Objeto não é um Clip Group');
      return;
    }

    // Remover objeto do grupo
    group.removeWithUpdate(object);
    canvas.add(object); // Adicionar de volta ao canvas
    canvas.renderAll();
    console.log('➖ Objeto removido do Clip Group');
  }, []);

  // Converter Clip Group de volta para objeto normal
  const convertClipGroupToNormal = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject || activeObject.type !== 'group') {
      console.warn('⚠️ Selecione um Clip Group');
      return;
    }

    const clipGroup = activeObject as any;

    if (!clipGroup._isClipGroup) {
      console.warn('⚠️ Objeto não é um Clip Group');
      return;
    }

    // Remover clipPath
    clipGroup.set('clipPath', null);

    // Remover marcadores
    delete clipGroup._isClipGroup;
    delete clipGroup._clipShape;
    delete clipGroup._isClipGroupEditMode;

    canvas.renderAll();
    console.log('🔓 Clip Group convertido para grupo normal');
  }, []);

  // Exportar canvas como imagem PNG
  const exportCanvasImage = useCallback(() => {
    if (!fabricCanvasRef.current) return null;

    const canvas = fabricCanvasRef.current;
    const workAreaWidth = 600;
    const workAreaHeight = 600;

    // Calcular posição da área de trabalho
    const left = (canvas.width! - workAreaWidth) / 2;
    const top = (canvas.height! - workAreaHeight) / 2;

    // Esconder guia temporariamente
    const guide = canvas.getObjects().find((obj: any) => obj._isWorkAreaGuide);
    if (guide) {
      guide.visible = false;
    }

    // Exportar apenas a área de trabalho
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
      left,
      top,
      width: workAreaWidth,
      height: workAreaHeight,
    });

    // Mostrar guia novamente
    if (guide) {
      guide.visible = true;
      canvas.renderAll();
    }

    return dataURL;
  }, []);

  // Exportar canvas como JSON
  const exportCanvasJSON = useCallback(() => {
    if (!fabricCanvasRef.current) return null;

    const canvas = fabricCanvasRef.current;
    const offset = getWorkAreaOffset();

    // Clonar objetos e ajustar coordenadas para serem relativas à folha
    const objectsToExport = canvas.getObjects().map((obj: any) => {
      // Pular guia da área de trabalho
      if (obj._isWorkAreaGuide) return null;

      const objData = obj.toObject();
      // Subtrair offset para salvar coordenadas relativas à folha
      objData.left = (objData.left || 0) - offset.left;
      objData.top = (objData.top || 0) - offset.top;

      return objData;
    }).filter(obj => obj !== null);

    const json = {
      version: '6.0',
      objects: objectsToExport,
    };

    // Adiciona informações extras
    const exportData = {
      version: '2.0', // Versão 2.0 = coordenadas relativas à folha
      timestamp: new Date().toISOString(),
      background: useCreativeStore.getState().background,
      canvas: json,
    };

    return exportData;
  }, []);

  // Importar JSON para o canvas
  const importCanvasJSON = useCallback((jsonData: any) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    // Limpa canvas atual
    canvas.clear();

    // Restaura background se existir
    if (jsonData.background) {
      useCreativeStore.getState().updateBackground(jsonData.background);
    }

    // Carrega objetos do JSON
    if (jsonData.canvas) {
      // Verificar se é formato novo (v2.0+) com coordenadas relativas à folha
      const isRelativeCoords = jsonData.version === '2.0';

      // Primeiro, carrega o JSON normalmente
      canvas.loadFromJSON(jsonData.canvas, () => {
        const offset = getWorkAreaOffset();

        // Se for formato novo (v2.0), adicionar offset da área de trabalho
        if (isRelativeCoords) {
          canvas.getObjects().forEach((obj: any) => {
            // Pular guia da área de trabalho
            if (obj._isWorkAreaGuide) return;

            // As coordenadas vêm relativas à folha, adicionar offset do canvas atual
            obj.set({
              left: (obj.left || 0) + offset.left,
              top: (obj.top || 0) + offset.top,
            });
            obj.setCoords();
          });
        }
        // Se for formato antigo (v1.0), já vem com coordenadas absolutas

        // Aplicar clipPath em todos os objetos importados
        updateWorkAreaGuide();
        applyCanvasClipPath();

        canvas.renderAll();
        console.log(`✅ Canvas carregado do JSON (versão ${jsonData.version || '1.0'})`);
      });
    }
  }, []);

  // Baixar design completo (PNG + JSON)
  const downloadDesign = useCallback(() => {
    const imageDataUrl = exportCanvasImage();
    const jsonData = exportCanvasJSON();

    if (!imageDataUrl || !jsonData) {
      console.error('❌ Erro ao exportar design');
      return;
    }

    const timestamp = new Date().getTime();

    // Baixar PNG
    const linkImage = document.createElement('a');
    linkImage.href = imageDataUrl;
    linkImage.download = `design-${timestamp}.png`;
    linkImage.click();

    // Baixar JSON
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const linkJson = document.createElement('a');
    linkJson.href = url;
    linkJson.download = `design-${timestamp}.json`;
    linkJson.click();
    URL.revokeObjectURL(url);

    console.log('📥 Design baixado com sucesso!');
  }, [exportCanvasImage, exportCanvasJSON]);

  // Copiar JSON para clipboard
  const copyCanvasJSON = useCallback(async () => {
    const json = exportCanvasJSON();
    if (!json) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      console.log('📋 JSON copiado para clipboard!');
    } catch (err) {
      console.error('❌ Erro ao copiar JSON:', err);
    }
  }, [exportCanvasJSON]);

  // Load template function - converts template JSON to Fabric objects
  const loadTemplate = useCallback(async (template: any) => {
    if (!fabricCanvasRef.current) {
      console.error('❌ Canvas not initialized yet');
      return;
    }

    const canvas = fabricCanvasRef.current;
    console.log('🎨 Loading template:', template.name, template);

    try {
      // Clear canvas
      canvas.clear();

      // Set canvas background
      if (template.canvas.backgroundColor) {
        canvas.backgroundColor = template.canvas.backgroundColor;
      }

      // Load objects
      for (const obj of template.objects) {
        let fabricObj: any = null;

        // Create appropriate Fabric object based on type
        switch (obj.type) {
          case 'rect':
            fabricObj = new Rect({
              ...obj,
              centeredRotation: true,
              centeredScaling: false,
              snapAngle: 45,
              snapThreshold: 10,
            });
            break;

          case 'circle':
            fabricObj = new Circle({
              ...obj,
              centeredRotation: true,
              centeredScaling: false,
              snapAngle: 45,
              snapThreshold: 10,
            });
            break;

          case 'triangle':
            fabricObj = new Triangle({
              ...obj,
              centeredRotation: true,
              centeredScaling: false,
              snapAngle: 45,
              snapThreshold: 10,
            });
            break;

          case 'textbox':
          case 'i-text':
          case 'text':
            // Load font if not loaded yet
            if (obj.fontFamily && obj.fontFamily !== 'Arial') {
              try {
                await new Promise<void>((resolve, reject) => {
                  WebFont.load({
                    google: { families: [obj.fontFamily] },
                    active: resolve,
                    inactive: reject,
                    timeout: 3000
                  });
                });
                await new FontFaceObserver(obj.fontFamily).load(null, 5000);
              } catch (error) {
                console.warn(`Font ${obj.fontFamily} failed to load, using fallback`);
              }
            }

            fabricObj = new Textbox(obj.text || 'Text', {
              ...obj,
              centeredRotation: true,
              centeredScaling: false,
              snapAngle: 45,
              snapThreshold: 10,
            });
            break;

          case 'image':
            if (obj.src) {
              try {
                const img = await FabricImage.fromURL(obj.src, { crossOrigin: 'anonymous' });
                img.set({
                  left: obj.left,
                  top: obj.top,
                  width: obj.width,
                  height: obj.height,
                  scaleX: obj.scaleX || 1,
                  scaleY: obj.scaleY || 1,
                  angle: obj.angle || 0,
                  opacity: obj.opacity ?? 1,
                  selectable: obj.selectable ?? true,
                  evented: obj.evented ?? true,
                  centeredRotation: true,
                  centeredScaling: false,
                  snapAngle: 45,
                  snapThreshold: 10,
                });
                fabricObj = img;
              } catch (error) {
                console.error('Error loading image:', error);
                // Skip this object if image fails to load
                continue;
              }
            }
            break;

          case 'line':
            fabricObj = new Line([obj.x1 || 0, obj.y1 || 0, obj.x2 || 100, obj.y2 || 100], {
              ...obj,
              centeredRotation: true,
              snapAngle: 45,
              snapThreshold: 10,
            });
            break;

          default:
            console.warn(`Unknown object type: ${obj.type}`);
            continue;
        }

        if (fabricObj) {
          (fabricObj as any).lockedDegree = null;
          canvas.add(fabricObj);
        }
      }

      canvas.renderAll();
      console.log('✅ Template loaded successfully');
    } catch (error) {
      console.error('❌ Error loading template:', error);
    }
  }, []);

  // Resize canvas function
  const resizeCanvas = () => {
    if (!fabricCanvasRef.current || !containerRef.current) return;

    const canvas = fabricCanvasRef.current;
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    canvas.setWidth(containerWidth);
    canvas.setHeight(containerHeight);

    // Adicionar/atualizar retângulo de guia da área de trabalho
    updateWorkAreaGuide();

    // Aplicar clipPath global no canvas
    applyCanvasClipPath();

    canvas.renderAll();
  };

  // Adicionar guia da área de trabalho (600x600)
  const updateWorkAreaGuide = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const workAreaWidth = 600;
    const workAreaHeight = 600;

    // Remover guia anterior se existir
    const existingGuide = canvas.getObjects().find((obj: any) => obj._isWorkAreaGuide);
    if (existingGuide) {
      canvas.remove(existingGuide);
    }

    // Calcular posição centralizada
    const left = (canvas.width! - workAreaWidth) / 2;
    const top = (canvas.height! - workAreaHeight) / 2;

    // Criar retângulo de guia (borda azul) - invisível
    const workAreaGuide = new Rect({
      left,
      top,
      width: workAreaWidth,
      height: workAreaHeight,
      fill: 'transparent',
      stroke: 'transparent', // Borda invisível
      strokeWidth: 0,
      selectable: false,
      evented: false,
      opacity: 0,
    } as any);

    (workAreaGuide as any)._isWorkAreaGuide = true;

    // Adicionar guia
    canvas.add(workAreaGuide);

    // Mover guia para frente
    const objects = canvas.getObjects();
    const idx = objects.indexOf(workAreaGuide);
    if (idx !== -1) {
      objects.splice(idx, 1);
      objects.push(workAreaGuide);
    }

    canvas.renderAll();
  };

  // Função para garantir que a guia fique sempre no topo
  const bringGuideToFront = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();

    // Trazer guia para frente
    const guide = objects.find((obj: any) => obj._isWorkAreaGuide);
    if (guide) {
      const guideIndex = objects.indexOf(guide);
      if (guideIndex !== -1) {
        objects.splice(guideIndex, 1);
        objects.push(guide);
      }
    }

    canvas.renderAll();
  };

  // Converter coordenadas da folha (0,0 = canto superior esquerdo da área de 600x600) para coordenadas do canvas
  const getWorkAreaOffset = () => {
    if (!fabricCanvasRef.current) return { left: 0, top: 0 };

    const canvas = fabricCanvasRef.current;
    const workAreaWidth = 600;
    const workAreaHeight = 600;
    const left = (canvas.width! - workAreaWidth) / 2;
    const top = (canvas.height! - workAreaHeight) / 2;

    return { left, top };
  };

  // Aplicar clipPath global no canvas para mascarar partes fora da área
  const applyCanvasClipPath = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const workAreaWidth = 600;
    const workAreaHeight = 600;
    const left = (canvas.width! - workAreaWidth) / 2;
    const top = (canvas.height! - workAreaHeight) / 2;

    // Criar clipPath global no canvas
    const clipRect = new Rect({
      left: left,
      top: top,
      width: workAreaWidth,
      height: workAreaHeight,
      absolutePositioned: true,
    });

    canvas.clipPath = clipRect;
    canvas.controlsAboveOverlay = true; // Mostrar controles acima do clipPath
    canvas.requestRenderAll();
  };

  // Smart Guides: Initialize aligning guidelines
  const initAligningGuidelines = (canvas: Canvas) => {
    const ctx = canvas.getSelectionContext();
    let viewportTransform: number[] = [];
    let zoom = 1;
    let verticalLines: Array<{ x: number; y1: number; y2: number }> = [];
    let horizontalLines: Array<{ y: number; x1: number; x2: number }> = [];

    const isInRange = (value1: number, value2: number) => {
      return value2 > value1 - aligningLineMargin && value2 < value1 + aligningLineMargin;
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.save();
      ctx.lineWidth = aligningLineWidth;
      ctx.strokeStyle = aligningLineColor;
      ctx.setLineDash(aligningDash);
      ctx.beginPath();
      ctx.moveTo(x1 * zoom + viewportTransform[4], y1 * zoom + viewportTransform[5]);
      ctx.lineTo(x2 * zoom + viewportTransform[4], y2 * zoom + viewportTransform[5]);
      ctx.stroke();
      ctx.restore();
    };

    const drawVerticalLine = (coords: { x: number; y1: number; y2: number }) => {
      drawLine(
        coords.x + 0.5,
        coords.y1 > coords.y2 ? coords.y2 : coords.y1,
        coords.x + 0.5,
        coords.y2 > coords.y1 ? coords.y2 : coords.y1
      );
    };

    const drawHorizontalLine = (coords: { y: number; x1: number; x2: number }) => {
      drawLine(
        coords.x1 > coords.x2 ? coords.x2 : coords.x1,
        coords.y + 0.5,
        coords.x2 > coords.x1 ? coords.x2 : coords.x1,
        coords.y + 0.5
      );
    };

    canvas.on('mouse:down', () => {
      viewportTransform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      zoom = canvas.getZoom();
    });

    canvas.on('object:moving', (e: any) => {
      if (!canvas._currentTransform) return;

      const activeObject = e.target;
      const customColorConfig = (activeObject as any).customColorConfig;

      if (
        activeObject &&
        (activeObject.type === 'textbox' || activeObject.type === 'text') &&
        customColorConfig &&
        customColorConfig.colorType === 'gradient'
      ) {
        const newFill = createFabricGradient(activeObject as Textbox, customColorConfig);
        activeObject.set('fill', newFill);
      }
      const activeObjectCenter = activeObject.getCenterPoint();
      const activeObjectBoundingRect = activeObject.getBoundingRect();
      const activeObjectHalfHeight = activeObjectBoundingRect.height / (2 * viewportTransform[3]);
      const activeObjectHalfWidth = activeObjectBoundingRect.width / (2 * viewportTransform[0]);

      canvas
        .getObjects()
        .filter((object) => object !== activeObject && object.visible)
        .forEach((object) => {
          const objectCenter = object.getCenterPoint();
          const objectBoundingRect = object.getBoundingRect();
          const objectHalfHeight = objectBoundingRect.height / (2 * viewportTransform[3]);
          const objectHalfWidth = objectBoundingRect.width / (2 * viewportTransform[0]);

          // Snap vertical
          const snapVertical = (objEdge: number, activeEdge: number, snapCenter: number) => {
            if (isInRange(objEdge, activeEdge)) {
              verticalLines.push({
                x: objEdge,
                y1:
                  objectCenter.y < activeObjectCenter.y
                    ? objectCenter.y - objectHalfHeight - aligningLineOffset
                    : objectCenter.y + objectHalfHeight + aligningLineOffset,
                y2:
                  activeObjectCenter.y > objectCenter.y
                    ? activeObjectCenter.y + activeObjectHalfHeight + aligningLineOffset
                    : activeObjectCenter.y - activeObjectHalfHeight - aligningLineOffset,
              });
              activeObject.setPositionByOrigin(new Point(snapCenter, activeObjectCenter.y), 'center', 'center');
            }
          };

          // snap by the horizontal center line
          snapVertical(objectCenter.x, activeObjectCenter.x, objectCenter.x);
          // snap by the left object edge matching left active edge
          snapVertical(
            objectCenter.x - objectHalfWidth,
            activeObjectCenter.x - activeObjectHalfWidth,
            objectCenter.x - objectHalfWidth + activeObjectHalfWidth
          );
          // snap by the left object edge matching right active edge
          snapVertical(
            objectCenter.x - objectHalfWidth,
            activeObjectCenter.x + activeObjectHalfWidth,
            objectCenter.x - objectHalfWidth - activeObjectHalfWidth
          );
          // snap by the right object edge matching right active edge
          snapVertical(
            objectCenter.x + objectHalfWidth,
            activeObjectCenter.x + activeObjectHalfWidth,
            objectCenter.x + objectHalfWidth - activeObjectHalfWidth
          );
          // snap by the right object edge matching left active edge
          snapVertical(
            objectCenter.x + objectHalfWidth,
            activeObjectCenter.x - activeObjectHalfWidth,
            objectCenter.x + objectHalfWidth + activeObjectHalfWidth
          );

          // Snap horizontal
          const snapHorizontal = (objEdge: number, activeObjEdge: number, snapCenter: number) => {
            if (isInRange(objEdge, activeObjEdge)) {
              horizontalLines.push({
                y: objEdge,
                x1:
                  objectCenter.x < activeObjectCenter.x
                    ? objectCenter.x - objectHalfWidth - aligningLineOffset
                    : objectCenter.x + objectHalfWidth + aligningLineOffset,
                x2:
                  activeObjectCenter.x > objectCenter.x
                    ? activeObjectCenter.x + activeObjectHalfWidth + aligningLineOffset
                    : activeObjectCenter.x - activeObjectHalfWidth - aligningLineOffset,
              });
              activeObject.setPositionByOrigin(new Point(activeObjectCenter.x, snapCenter), 'center', 'center');
            }
          };

          // snap by the vertical center line
          snapHorizontal(objectCenter.y, activeObjectCenter.y, objectCenter.y);
          // snap by the top object edge matching the top active edge
          snapHorizontal(
            objectCenter.y - objectHalfHeight,
            activeObjectCenter.y - activeObjectHalfHeight,
            objectCenter.y - objectHalfHeight + activeObjectHalfHeight
          );
          // snap by the top object edge matching the bottom active edge
          snapHorizontal(
            objectCenter.y - objectHalfHeight,
            activeObjectCenter.y + activeObjectHalfHeight,
            objectCenter.y - objectHalfHeight - activeObjectHalfHeight
          );
          // snap by the bottom object edge matching the bottom active edge
          snapHorizontal(
            objectCenter.y + objectHalfHeight,
            activeObjectCenter.y + activeObjectHalfHeight,
            objectCenter.y + objectHalfHeight - activeObjectHalfHeight
          );
          // snap by the bottom object edge matching the top active edge
          snapHorizontal(
            objectCenter.y + objectHalfHeight,
            activeObjectCenter.y - activeObjectHalfHeight,
            objectCenter.y + objectHalfHeight + activeObjectHalfHeight
          );
        });
    });

    canvas.on('before:render', () => {
      canvas.clearContext(canvas.contextTop);
    });

    canvas.on('after:render', () => {
      verticalLines.forEach((line) => drawVerticalLine(line));
      horizontalLines.forEach((line) => drawHorizontalLine(line));

      verticalLines = [];
      horizontalLines = [];
    });

    // Mouse up handler já está definido mais abaixo com lógica completa
  };

  // Draw rotate guidelines
  const drawRotateGuidelines = (object: any) => {
    if (!fabricCanvasRef.current || !contextLinesRef.current) return;

    const canvas = fabricCanvasRef.current;
    const contextLines = contextLinesRef.current;

    contextLines.clearRect(0, 0, canvas.width!, canvas.height!);

    if (!rotateSnaps.includes(Math.abs(Math.ceil(object.angle)))) return;

    const scale = object.scaleX;
    const XYstart = util.transformPoint(
      new Point((object.left - ((object.width * scale) / 2)), object.top),
      canvas.viewportTransform!
    );

    const cp = object.getCenterPoint();
    const XYmid = util.transformPoint(
      new Point(cp.x, cp.y),
      canvas.viewportTransform!
    );

    const XYend = util.transformPoint(
      new Point((object.left + ((object.width * scale) / 2)), object.top),
      canvas.viewportTransform!
    );

    // Draw horizontal guideline
    contextLines.save();
    const middlePoint = { x: XYmid.x, y: XYmid.y };
    contextLines.translate(middlePoint.x, middlePoint.y);
    contextLines.rotate((Math.PI / 180) * object.angle);
    contextLines.translate(-middlePoint.x, -middlePoint.y);
    contextLines.strokeStyle = centerLineColor;
    contextLines.lineWidth = centerLineWidth;
    contextLines.beginPath();
    contextLines.moveTo(XYstart.x, XYstart.y);
    contextLines.lineTo(XYend.x, XYend.y);
    contextLines.stroke();
    contextLines.restore();

    // Draw vertical guideline
    const XYstartV = util.transformPoint(
      new Point((object.left - ((object.height * scale) / 2)), object.top),
      canvas.viewportTransform!
    );
    const XYendV = util.transformPoint(
      new Point((object.left + ((object.height * scale) / 2)), object.top),
      canvas.viewportTransform!
    );

    contextLines.save();
    contextLines.translate(middlePoint.x, middlePoint.y);
    contextLines.rotate((Math.PI / 180) * (object.angle + 90));
    contextLines.translate(-middlePoint.x, -middlePoint.y);
    contextLines.strokeStyle = centerLineColor;
    contextLines.lineWidth = centerLineWidth;
    contextLines.beginPath();
    contextLines.moveTo(XYstartV.x, XYstartV.y);
    contextLines.lineTo(XYendV.x, XYendV.y);
    contextLines.stroke();
    contextLines.restore();

    canvas.renderAll();
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Pré-carregar todas as fontes do Google Fonts
    const loadAllFonts = async () => {
      // Extrair nomes das fontes
      const fontFamilies = fontOptions.map((font) =>
        font.family.split(',')[0].replace(/['"]/g, '').trim()
      );

      // Carregar fontes do Google Fonts usando WebFont
      WebFont.load({
        google: {
          families: fontFamilies,
        },
      });

      // Usar FontFaceObserver para garantir que todas foram carregadas
      const fontPromises = fontFamilies.map(async (fontName) => {
        const fontObserver = new FontFaceObserver(fontName);
        return fontObserver.load('text').catch(() => {
          console.warn(`Failed to load font: ${fontName}`);
        });
      });

      try {
        await Promise.all(fontPromises);
        console.log('All fonts loaded successfully!');
      } catch {
        console.warn('Some fonts failed to load, but continuing...');
      }
    };

    // Carregar fontes em paralelo e depois inicializar o canvas
    loadAllFonts();

    // Initialize canvas
    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: 'transparent',
    });
    fabricCanvasRef.current = canvas;

    // Register canvas instance in store
    useCreativeStore.getState().setFabricCanvas(canvas);

    // Get context for guidelines
    contextLinesRef.current = canvas.getSelectionContext();

    // Set brush color
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = 'black';
    }

    // Initial resize
    resizeCanvas();

    // Obter offset da área de trabalho
    const workAreaOffset = getWorkAreaOffset();

    // Add initial box (coordenadas relativas à folha)
    const box = new Rect({
      width: 200,
      height: 100,
      top: workAreaOffset.top + 70,
      left: workAreaOffset.left + 120,
      fill: 'blue',
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: snapAngleDegrees,
      snapThreshold: 10,
      lockRotation: false,
    } as any);

    (box as any).myType = "box";
    (box as any).minScaleLimit = 0.4;
    (box as any).lockedDegree = null;

    canvas.add(box);

    // Add a second box to test alignment (coordenadas relativas à folha)
    const box2 = new Rect({
      width: 150,
      height: 150,
      top: workAreaOffset.top + 200,
      left: workAreaOffset.left + 300,
      fill: 'red',
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: snapAngleDegrees,
      snapThreshold: 10,
      lockRotation: false,
    } as any);

    (box2 as any).myType = "box";
    (box2 as any).minScaleLimit = 0.4;
    (box2 as any).lockedDegree = null;

    canvas.add(box2);

    // Initialize Smart Guides alignment
    initAligningGuidelines(canvas);

    // Object rotating event - handles snap rotation
    canvas.on('object:rotating', (e: any) => {
      const activeObject = e.target;
      const customColorConfig = (activeObject as any).customColorConfig;

      if (
        activeObject &&
        (activeObject.type === 'textbox' || activeObject.type === 'text') &&
        customColorConfig &&
        customColorConfig.colorType === 'gradient'
      ) {
        const newFill = createFabricGradient(activeObject as Textbox, customColorConfig);
        activeObject.set('fill', newFill);
      }

      if (rotateSnaps.includes(Math.abs(Math.ceil(e.target.angle)))) {
        e.target.lockedDegree = Math.ceil(e.target.angle);
      } else {
        e.target.lockedDegree = null;
      }

      drawRotateGuidelines(e.target);
    });

    canvas.on('object:scaling', (e: any) => {
      const activeObject = e.target;
      const customColorConfig = (activeObject as any).customColorConfig;

      if (
        activeObject &&
        (activeObject.type === 'textbox' || activeObject.type === 'text') &&
        customColorConfig &&
        customColorConfig.colorType === 'gradient'
      ) {
        const newFill = createFabricGradient(activeObject as Textbox, customColorConfig);
        activeObject.set('fill', newFill);
      }
    });

    // Clear guidelines and update gradient on modification (move, scale, rotate)
    canvas.on('object:modified', (e: any) => {
      if (contextLinesRef.current) {
        contextLinesRef.current.clearRect(0, 0, canvas.width!, canvas.height!);
      }

      const activeObject = e.target;
      const customColorConfig = (activeObject as any).customColorConfig;

      if (
        activeObject &&
        (activeObject.type === 'textbox' || activeObject.type === 'text') &&
        customColorConfig &&
        customColorConfig.colorType === 'gradient'
      ) {
        const newFill = createFabricGradient(activeObject as Textbox, customColorConfig);
        activeObject.set('fill', newFill);
        canvas.renderAll();
      }

      // Trazer guia para frente sempre que um objeto for modificado
      bringGuideToFront();
    });


    canvas.on('object:added', (event: any) => {
      const target = event.target;

      target.set({
        transparentCorners: false,
        borderColor: "oklch(0.5854 0.2041 277.1173)",
        cornerColor: "tomato",
        cornerSize: 8,
      });

      if (target.type !== "path") {
        target.set({
          snapAngle: snapAngleDegrees,
          snapThreshold: 10,
        });
      }

      if (target.type === "group") {
        target.set({
          snapAngle: snapAngleDegrees,
          snapThreshold: 10,
          top: target.top + (target.height / 2) + (target.strokeWidth / 2),
          left: target.left + (target.width / 2) + (target.strokeWidth / 2),
        });
      }

      // Trazer guia para frente sempre que um objeto for adicionado
      bringGuideToFront();

      // Reaplicar clipPath para garantir que o novo objeto seja mascarado
      applyCanvasClipPath();
    });


    // Selection tracking
    const updateSelectedTextFromObject = (activeObject: any) => {
      if (!activeObject) {
        setSelectedText(null);
        return;
      }

      if (activeObject.type === 'textbox' || activeObject.type === 'text') {
        const customColorConfig = (activeObject as any).customColorConfig;
        const fill = customColorConfig
          ? customColorConfig
          : { ...INITIAL_COLOR_CONFIG, solidColor: activeObject.fill as string };

        setSelectedText({
          fontFamily: activeObject.fontFamily || 'Arial',
          fontSize: activeObject.fontSize || 24,
          fontWeight: activeObject.fontWeight || '400',
          fontStyle: activeObject.fontStyle || 'normal',
          fill,
          textAlign: activeObject.textAlign || 'left',
          letterSpacing: (activeObject.charSpacing || 0),
          lineHeight: activeObject.lineHeight || 1.16,
        });
      } else {
        setSelectedText(null);
      }
    };

    canvas.on('selection:created', (e: any) => {
      updateSelectedTextFromObject(e.selected[0]);
    });

    canvas.on('selection:updated', (e: any) => {
      updateSelectedTextFromObject(e.selected[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedText(null);
    });

    // Register canvas actions in store
    setCanvasActions({
      addRectangle,
      addTextbox,
      addCircle,
      addTriangle,
      addLine,
      addStar,
      addHeart,
      addImage,
      addImageFromURL,
      applyPatternToObject,
      removePatternFromObject,
      applyImageAsClipMask,
      applyClipPathToObject,
      removeClipPath,
      convertToImageFrame,
      removeFrameImage,
      convertToClipGroup,
      enterClipGroupEditMode,
      exitClipGroupEditMode,
      addToClipGroup,
      removeFromClipGroup,
      convertClipGroupToNormal,
    });

    // Register template loading action
    const setLoadTemplateAction = useCreativeStore.getState().setLoadTemplateAction;
    setLoadTemplateAction(loadTemplate);

    // Register parametrized actions for AI
    const setParametrizedActions = useCreativeStore.getState().setParametrizedActions;
    setParametrizedActions({
      addTextboxWithParams,
      addRectangleWithParams,
      addCircleWithParams,
      addImageFromURLWithParams,
    });

    // Register export actions in store
    const setExportActions = useCreativeStore.getState().setExportActions;
    setExportActions({
      exportCanvasImage,
      exportCanvasJSON,
      downloadDesign,
      importCanvasJSON,
    });

    // Handle keyboard events for delete, copy and paste
    let clipboard: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver editando texto em um input, textarea ou textbox do Fabric
      const target = e.target as HTMLElement;
      const isEditingText =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const activeObject = canvas.getActiveObject();

      // Se for um textbox em modo de edição, não processar shortcuts
      if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'i-text') && (activeObject as any).isEditing) {
        return;
      }

      // Ctrl+A - Selecionar tudo (apenas se NÃO estiver em input de texto)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        // Se estiver em input/textarea, deixar o comportamento padrão
        if (isEditingText) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        // Filtrar objetos - não selecionar a guia da área de trabalho
        const allObjects = canvas.getObjects().filter((obj: any) => !obj._isWorkAreaGuide);
        if (allObjects.length > 0) {
          canvas.discardActiveObject();
          const selection = new ActiveSelection(allObjects, { canvas });
          canvas.setActiveObject(selection);
          canvas.renderAll();
          console.log(`✅ ${allObjects.length} objetos selecionados`);
        }

        return;
      }

      // Ctrl+C - Copiar
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && activeObject && !isEditingText) {
        e.preventDefault();

        // Serializar objeto com propriedades customizadas
        clipboard = activeObject.toObject([
          '_isFrame',
          '_frameClipPath',
          '_isFrameImage',
          '_frameObject',
          '_isClipShell'
        ]);

        // Guardar tipo e clipPath se existir
        clipboard._type = activeObject.type;
        if (activeObject.clipPath) {
          clipboard._clipPath = activeObject.clipPath.toObject();
          clipboard._clipPathType = activeObject.clipPath.type;
          clipboard._clipPathAbsolutePositioned = activeObject.clipPath.absolutePositioned;
        }

        console.log('📋 Objeto copiado para clipboard');
        return;
      }

      // Ctrl+V - Colar
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard && !isEditingText) {
        e.preventDefault();

        // Mapear tipos para classes
        const typeToClass: Record<string, any> = {
          'rect': Rect,
          'circle': Circle,
          'triangle': Triangle,
          'polygon': Polygon,
          'image': FabricImage,
          'line': Line,
          'textbox': Textbox,
          'i-text': Textbox,
        };

        const ClassType = typeToClass[clipboard._type];
        if (!ClassType || !ClassType.fromObject) {
          console.error('Tipo de objeto não suportado para colar:', clipboard._type);
          return;
        }

        ClassType.fromObject(clipboard).then((cloned: any) => {
          cloned.set({
            left: (clipboard.left || 0) + 20,
            top: (clipboard.top || 0) + 20,
          });

          // Restaurar clipPath se existir
          if (clipboard._clipPath) {
            const ClipClassType = typeToClass[clipboard._clipPathType];
            if (ClipClassType && ClipClassType.fromObject) {
              ClipClassType.fromObject(clipboard._clipPath).then((clonedClip: any) => {
                clonedClip.absolutePositioned = clipboard._clipPathAbsolutePositioned;
                cloned.clipPath = clonedClip;
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
                canvas.renderAll();
                console.log('✅ Objeto colado com clipPath');
              });
              return;
            }
          }

          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          canvas.renderAll();
          console.log('✅ Objeto colado');
        });

        return;
      }

      // Delete - Deletar objeto(s) selecionado(s)
      if (e.key === 'Delete' && activeObject) {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => {
            canvas.remove(obj);
          });
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Window resize handler
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCanvasActions, setSelectedText, addRectangle, addTextbox, addCircle, addTriangle, addLine, addStar, addHeart, addImage, addImageFromURL, loadTemplate, addTextboxWithParams, addRectangleWithParams, addCircleWithParams, addImageFromURLWithParams, exportCanvasImage, exportCanvasJSON, downloadDesign]);

  // Apply text property changes from store to canvas
  useEffect(() => {
    if (!fabricCanvasRef.current || !selectedText) return;

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
      const newFill = createFabricGradient(activeObject as Textbox, selectedText.fill);

      // Store the color config on the object itself
      (activeObject as any).customColorConfig = selectedText.fill;

      activeObject.set({
        fontFamily: selectedText.fontFamily,
        fontSize: selectedText.fontSize,
        fontWeight: selectedText.fontWeight,
        fontStyle: selectedText.fontStyle,
        fill: newFill,
        textAlign: selectedText.textAlign,
        charSpacing: selectedText.letterSpacing,
        lineHeight: selectedText.lineHeight,
      });

      canvas.renderAll();
    }
  }, [selectedText]);

  // Expõe funções globalmente para debug/uso no console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).exportCanvasJSON = exportCanvasJSON;
      (window as any).exportCanvasImage = exportCanvasImage;
      (window as any).importCanvasJSON = importCanvasJSON;
      (window as any).downloadDesign = downloadDesign;
      (window as any).copyCanvasJSON = copyCanvasJSON;
    }
  }, [exportCanvasJSON, exportCanvasImage, importCanvasJSON, downloadDesign, copyCanvasJSON]);

  return (
    <CanvasContextMenu>
      <div
        ref={containerRef}
        id="canvas_container"
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >

        <div
          ref={containerRef}
          id="canvas_container"
          className="relative  flex items-center justify-center ">

          {/* Conteúdo de fundo */}
          <div className="z-0">
            <div>
              <Background />
            </div>
            <div>
              <canvas ref={canvasRef} id="myCanvas" />
            </div>
          </div>
        </div>



      </div>
    </CanvasContextMenu>
  );
}
