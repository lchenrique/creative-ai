import { useEffect, useRef, useCallback } from "react";
import { Canvas, Rect, Circle, Triangle, Line, Polygon, FabricImage, Point, util, Textbox, Gradient } from "fabric";
import FontFaceObserver from 'fontfaceobserver';
import WebFont from 'webfontloader';
import { Background } from "./art-background";
import { useCreativeStore } from "@/stores/creative-store";
import { INITIAL_COLOR_CONFIG } from "@/stores/creative-store";
import type { ColorConfig } from "./gradient-control";
import { fontOptions } from "@/data/font-options";

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

  const rotateSnaps = [0, 45, 90, 135, 180, 225, 270, 315, 360];
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
    const colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const rect = new Rect({
      width: 150,
      height: 100,
      top: Math.random() * 200 + 100,
      left: Math.random() * 300 + 100,
      fill: randomColor,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
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

    const textbox = new Textbox('Texto aqui', {
      left: Math.random() * 300 + 100,
      top: Math.random() * 200 + 100,
      width: 200,
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
      snapThreshold: 10,
    } as any);

    (textbox as any).lockedDegree = null;

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
  }, []);

  // Function to add a new circle
  const addCircle = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const circle = new Circle({
      radius: 50,
      top: Math.random() * 200 + 100,
      left: Math.random() * 300 + 100,
      fill: randomColor,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
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
    const colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const triangle = new Triangle({
      width: 100,
      height: 100,
      top: Math.random() * 200 + 100,
      left: Math.random() * 300 + 100,
      fill: randomColor,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
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

    const line = new Line([50, 50, 200, 50], {
      left: Math.random() * 200 + 100,
      top: Math.random() * 200 + 100,
      stroke: '#000000',
      strokeWidth: 3,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
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
      left: Math.random() * 300 + 100,
      top: Math.random() * 200 + 100,
      fill: randomColor,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
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
      left: Math.random() * 300 + 100,
      top: Math.random() * 200 + 100,
      fill: randomColor,
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
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

          // Scale image to fit canvas
          const maxWidth = 300;
          const maxHeight = 300;
          const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1), 1);

          img.set({
            left: Math.random() * 200 + 100,
            top: Math.random() * 150 + 100,
            scaleX: scale,
            scaleY: scale,
            centeredRotation: true,
            centeredScaling: false,
            snapAngle: 45,
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

    FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
      if (!fabricCanvasRef.current) return;

      // Scale image to fit canvas
      const maxWidth = 300;
      const maxHeight = 300;
      const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1), 1);

      img.set({
        left: Math.random() * 200 + 100,
        top: Math.random() * 150 + 100,
        scaleX: scale,
        scaleY: scale,
        centeredRotation: true,
        centeredScaling: false,
        snapAngle: 45,
        snapThreshold: 10,
      } as any);

      (img as any).lockedDegree = null;

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }).catch((error) => {
      console.error('Error loading image from URL:', error);
    });
  }, []);

  // Resize canvas function
  const resizeCanvas = () => {
    if (!fabricCanvasRef.current || !containerRef.current) return;

    const canvas = fabricCanvasRef.current;
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    centerObjects();
    canvas.setWidth(containerWidth);
    canvas.setHeight(containerHeight);
    canvas.renderAll();
  };

  // Center objects function
  const centerObjects = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();

    if (objects.length === 0) return;

    // Calculate bounding box of all objects
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.left + bounds.width);
      maxY = Math.max(maxY, bounds.top + bounds.height);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const canvasCenterX = canvas.width! / 2;
    const canvasCenterY = canvas.height! / 2;
    const deltaX = canvasCenterX - centerX;
    const deltaY = canvasCenterY - centerY;

    objects.forEach(obj => {
      obj.set({
        left: obj.left! + deltaX,
        top: obj.top! + deltaY
      });
      obj.setCoords();
    });
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

    canvas.on('mouse:up', () => {
      canvas.renderAll();
    });
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

    // Get context for guidelines
    contextLinesRef.current = canvas.getSelectionContext();

    // Set brush color
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = 'black';
    }

    // Initial resize
    resizeCanvas();

    // Add initial box
    const box = new Rect({
      width: 200,
      height: 100,
      top: 70,
      left: 120,
      fill: 'blue',
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
      snapThreshold: 10,
      lockRotation: false,
    } as any);

    (box as any).myType = "box";
    (box as any).minScaleLimit = 0.4;
    (box as any).lockedDegree = null;

    canvas.add(box);

    // Add a second box to test alignment
    const box2 = new Rect({
      width: 150,
      height: 150,
      top: 200,
      left: 300,
      fill: 'red',
      centeredRotation: true,
      centeredScaling: false,
      snapAngle: 45,
      snapThreshold: 10,
      lockRotation: false,
    } as any);

    (box2 as any).myType = "box";
    (box2 as any).minScaleLimit = 0.4;
    (box2 as any).lockedDegree = null;

    canvas.add(box2);
    centerObjects();

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
    });

    // Object added event
    canvas.on('object:added', (event: any) => {
      const target = event.target;

      if (target.type !== "path") {
        target.set({
          snapAngle: 45,
          snapThreshold: 10,
        });
      }

      if (target.type === "group") {
        target.set({
          snapAngle: 45,
          snapThreshold: 10,
          top: target.top + (target.height / 2) + (target.strokeWidth / 2),
          left: target.left + (target.width / 2) + (target.strokeWidth / 2),
        });
      }
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
    });

    // Handle keyboard events for delete
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas.getActiveObject()) {
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
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCanvasActions, setSelectedText, addRectangle, addTextbox, addCircle, addTriangle, addLine, addStar, addHeart, addImage, addImageFromURL]);

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

  return (
    <div
      ref={containerRef}
      id="canvas_container"
      style={{ width: '600px', height: '600px', position: 'relative' }}
    >
      <div style={{ width: '600px', height: '600px', position: 'relative' }}>
        <Background />
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <canvas ref={canvasRef} id="myCanvas" />
      </div>
    </div>
  );
}
