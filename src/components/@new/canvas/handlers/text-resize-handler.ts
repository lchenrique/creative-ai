import type { OnResize, OnResizeStart } from "react-moveable";
import type { ElementsProps, ElementConfig } from "@/stores/canva-store";
import type Moveable from "react-moveable";

interface TextResizeContext {
  elements: ElementsProps[];
  updateElementConfig: (id: string, config: Partial<ElementConfig>) => void;
  moveableRef: React.RefObject<Moveable | null>;
}

/**
 * Verifica se a direção do resize é um canto (diagonal)
 */
export const isCornerDirection = (direction: number[]): boolean => {
  return direction[0] !== 0 && direction[1] !== 0;
};

/**
 * Handler para início do resize - define se mantém ratio
 */
export const handleTextResizeStart = (
  e: OnResizeStart,
  elements: ElementsProps[],
  setKeepRatio: (value: boolean) => void,
): void => {
  const el = e.target as HTMLElement;
  const elementId = el.getAttribute("data-element-id");
  const element = elements.find((item) => item.id === elementId);
  const isCorner = isCornerDirection(e.direction);

  // Para texto nos cantos: manter ratio
  if (element?.type === "text" && isCorner) {
    setKeepRatio(true);
  } else {
    setKeepRatio(false);
  }
};

/**
 * Handler para resize de texto nos cantos (scale proporcional)
 */
const handleTextCornerResize = (
  e: OnResize,
  el: HTMLElement,
  elementId: string,
  element: ElementsProps,
  textElement: HTMLElement,
  updateElementConfig: TextResizeContext["updateElementConfig"],
): void => {
  const currentFontSize = element.config.style.fontSize || 24;
  const originalHeight = element.config.size.height;
  const scale = e.height / originalHeight;
  const newFontSize = Math.round(currentFontSize * scale);

  el.style.width = `${e.width}px`;
  el.style.height = `${e.height}px`;
  el.style.transform = e.drag.transform;
  textElement.style.fontSize = `${newFontSize}px`;

  updateElementConfig(elementId, {
    size: { width: e.width, height: e.height },
    style: { fontSize: newFontSize },
  });
};

/**
 * Extrai o transform mantendo apenas o translateX (para resize lateral)
 * O translateY é zerado porque a altura é recalculada automaticamente
 * e não queremos que o elemento "pule" verticalmente
 */
const extractTransformKeepingX = (
  transform: string,
  el: HTMLElement,
): string => {
  // Pega a posição Y atual do elemento antes do resize
  const currentTransform = el.style.transform || "";
  const currentYMatch = currentTransform.match(/translate\([^,]+,\s*([^)]+)\)/);
  const currentY = currentYMatch ? currentYMatch[1] : "0px";

  const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);

  if (translateMatch) {
    const translateX = translateMatch[1];
    // Mantém o X do novo transform mas preserva o Y atual
    return transform.replace(
      /translate\([^)]+\)/,
      `translate(${translateX}, ${currentY})`,
    );
  }

  return transform;
};

/**
 * Handler para resize de texto nas laterais (largura livre, altura auto)
 */
const handleTextSideResize = (
  e: OnResize,
  el: HTMLElement,
  elementId: string,
  textElement: HTMLElement,
  updateElementConfig: TextResizeContext["updateElementConfig"],
  moveableRef: TextResizeContext["moveableRef"],
): void => {
  const newTransform = extractTransformKeepingX(e.drag.transform, el);

  el.style.width = `${e.width}px`;
  el.style.transform = newTransform;
  el.style.height = "auto";

  // Após o texto ajustar, pegar a altura real
  requestAnimationFrame(() => {
    const newHeight = textElement.offsetHeight;
    el.style.height = `${newHeight}px`;

    updateElementConfig(elementId, {
      size: { width: e.width, height: newHeight },
    });

    moveableRef.current?.updateRect();
  });
};

/**
 * Handler principal para resize de texto
 */
export const handleTextResize = (
  e: OnResize,
  context: TextResizeContext,
): boolean => {
  const { elements, updateElementConfig, moveableRef } = context;

  const el = e.target as HTMLElement;
  const elementId = el.getAttribute("data-element-id");
  const element = elements.find((item) => item.id === elementId);
  const isCorner = isCornerDirection(e.direction);
  const textElement = el.querySelector(
    '[data-element-type="text"]',
  ) as HTMLElement;

  if (!element || element.type !== "text" || !textElement || !elementId) {
    return false; // Não é texto, usar handler padrão
  }

  if (isCorner) {
    handleTextCornerResize(
      e,
      el,
      elementId,
      element,
      textElement,
      updateElementConfig,
    );
  } else {
    handleTextSideResize(
      e,
      el,
      elementId,
      textElement,
      updateElementConfig,
      moveableRef,
    );
  }

  return true; // Texto processado
};
