import { useEffect, useRef, useCallback } from "react";
import { generateBackgroundCSS } from "@/lib/utils";
import type { CanvasElement } from "@/stores/creative-store";
import { TextElement } from "./elemets/text";
interface ElementRendererProps {
  element: CanvasElement;
  isEditing?: boolean;
  onTextChange?: (text: string) => void;
  onEditEnd?: () => void;
  isResizing?: boolean;
}

export const CanvasRenderElement = ({
  element,
  isEditing,
  onTextChange,
  onEditEnd,
  isResizing,
}: ElementRendererProps) => {
  const editableRef = useRef<HTMLDivElement | null>(null);

  const textElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textElement = textElementRef.current;
    if (!textElement) return;

    /// listener  element
    //
    console.log({ textElement });
  }, []);

  // Salva e finaliza edição
  const handleBlur = useCallback(() => {
    const html = editableRef.current?.innerHTML ?? "";
    onTextChange?.(html);
    onEditEnd?.();
  }, [onTextChange, onEditEnd]);

  // Key handlers: Enter cria nova linha com Shift+Enter; sem Shift previne quebra
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Não chamamos handleBlur aqui: quer salvo só no blur/click fora
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onEditEnd?.(); // cancela sem salvar
    }
  };

  // Quando entra em edição, injeta o texto inicial (apenas ao entrar)
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.innerHTML = element.text || "";
      // move caret pro fim (bom quando abre o editor)
      const el = editableRef.current;
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing, element.text]);

  // Listener global para detectar clique fora enquanto editando
  useEffect(() => {
    if (!isEditing) return;

    const onPointerDown = (ev: PointerEvent) => {
      const path = ev.composedPath ? ev.composedPath() : (ev as any).path;
      const clickedInside = path
        ? path.includes(editableRef.current)
        : editableRef.current?.contains(ev.target as Node);
      if (!clickedInside) {
        // chama handleBlur *antes* do pai possivelmente desmontar
        handleBlur();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true); // use capture to run early
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [isEditing, handleBlur]);

  const elementShapes: Record<string, any> = {
    box: (el: CanvasElement) => {
      const boxShadow = el.shadowEnabled
        ? `${el.shadowX || 0}px ${el.shadowY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || "rgba(0,0,0,0.5)"}`
        : undefined;

      return (
        <div
          className="absolute inset-0"
          style={{
            width: `${el.w}px`,
            height: `${el.h}px`,
            boxShadow,
          }}
        />
      );
    },

    circle: (el: CanvasElement) => {
      const boxShadow = el.shadowEnabled
        ? `${el.shadowX || 0}px ${el.shadowY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || "rgba(0,0,0,0.5)"}`
        : undefined;

      return (
        <div
          className="absolute inset-0 rounded-full bg-red-800"
          style={{ boxShadow }}
        />
      );
    },
    triangle: (el: CanvasElement) => {
      const boxShadow = el.shadowEnabled
        ? `${el.shadowX || 0}px ${el.shadowY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || "rgba(0,0,0,0.5)"}`
        : undefined;

      return (
        <div
          className="absolute inset-0 bg-green-400 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]"
          style={{ boxShadow }}
        />
      );
    },
    line: (el: CanvasElement) => {
      const boxShadow = el.shadowEnabled
        ? `${el.shadowX || 0}px ${el.shadowY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || "rgba(0,0,0,0.5)"}`
        : undefined;

      return (
        <div className="absolute inset-0 bg-yellow-400" style={{ boxShadow }} />
      );
    },
    image: (el: CanvasElement) => {
      const boxShadow = el.shadowEnabled
        ? `${el.shadowX || 0}px ${el.shadowY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || "rgba(0,0,0,0.5)"}`
        : undefined;

      return (
        <div className="absolute inset-0" style={{ boxShadow }}>
          {el.image ? (
            <img
              src={el.image}
              alt="Canvas image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-400" />
          )}
        </div>
      );
    },
    "svg-clipart": (el: CanvasElement) => {
      const boxShadow = el.shadowEnabled
        ? `${el.shadowX || 0}px ${el.shadowY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || "rgba(0,0,0,0.5)"}`
        : undefined;

      // Modificar o SVG para ter width e height 100% e preserveAspectRatio none
      let svgContent = el.svgContent || "";
      if (svgContent) {
        // Substituir width, height, viewBox e preserveAspectRatio
        svgContent = svgContent.replace(/<svg([^>]*)>/, (match, attrs) => {
          // Extrair viewBox se existir para usar como referência
          const viewBoxMatch = attrs.match(/viewBox\s*=\s*["']([^"']*)["']/i);
          let viewBox = viewBoxMatch ? viewBoxMatch[1] : null;

          // Se não tem viewBox, tentar pegar de width/height
          if (!viewBox) {
            const widthMatch = attrs.match(/width\s*=\s*["']?(\d+(?:\.\d+)?)/i);
            const heightMatch = attrs.match(
              /height\s*=\s*["']?(\d+(?:\.\d+)?)/i,
            );
            if (widthMatch && heightMatch) {
              viewBox = `0 0 ${widthMatch[1]} ${heightMatch[1]}`;
            }
          }

          // Remover width, height, viewBox e preserveAspectRatio existentes
          let newAttrs = attrs
            .replace(/\s*width\s*=\s*["'][^"']*["']/gi, "")
            .replace(/\s*height\s*=\s*["'][^"']*["']/gi, "")
            .replace(/\s*viewBox\s*=\s*["'][^"']*["']/gi, "")
            .replace(/\s*preserveAspectRatio\s*=\s*["'][^"']*["']/gi, "");

          // Adicionar viewBox se temos um, senão apenas width/height 100%
          const viewBoxAttr = viewBox ? ` viewBox="${viewBox}"` : "";
          return `<svg${newAttrs}${viewBoxAttr} width="100%" height="100%" preserveAspectRatio="none" style="display:block;">`;
        });
      }

      return (
        <div
          className="absolute inset-0"
          style={{ boxShadow }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      );
    },

    text: (el: CanvasElement, editing: boolean) => {
      return (
        <TextElement
          el={el}
          editableRef={editableRef}
          editing={editing}
          onEditEnd={onEditEnd}
          onTextChange={onTextChange}
        />
      );
    },
  };

  if (element.type === "text") {
    return elementShapes["text"](element, !!isEditing);
  }

  const renderer = elementShapes[element.type as string];

  if (renderer) {
    return typeof renderer === "function" ? renderer(element) : renderer;
  }

  return <div className="absolute inset-0 bg-gray-300" />;
};
