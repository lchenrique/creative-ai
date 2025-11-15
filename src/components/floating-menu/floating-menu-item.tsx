import { Button } from "@creative-ds/ui";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface FloatingMenuItemProps {
  trigger: React.ReactNode;
  menuContent: React.ReactNode;
  contentTitle?: string;
}

export interface FloatingButtonTriggerProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const FloatingButtonTrigger = ({
  children,
  onClick,
}: FloatingButtonTriggerProps) => {
  return (
    <Button
      data-slot="floating-button-trigger"
      className="size-10 p-0"
      variant="outline"
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

const FloatingMenuContent = ({
  children,
  contentTitle,
  isOpen,
}: {
  children: React.ReactNode;
  contentTitle?: string;
  isOpen: boolean;
}) => {
  return (
    <div
      data-slot="floating-menu-content"
      className={`absolute top-0 right-0 h-dvh w-[350px] overflow-auto rounded-md border p-4 shadow-md outline-hidden z-90
        bg-popover text-popover-foreground transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      {contentTitle && (
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {contentTitle}
          </h2>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

// ID único para cada menu
let menuCounter = 0;

export const FloatingMenuItem = ({
  trigger,
  menuContent,
  contentTitle,
}: FloatingMenuItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idRef = useRef(`floating-menu-${++menuCounter}`);

  const toggleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!shouldRender) {
      setShouldRender(true);
      // 🔊 notifica que este menu foi aberto
      window.dispatchEvent(
        new CustomEvent("floating-menu-open", { detail: idRef.current }),
      );
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsOpen(true));
      });
      return;
    }

    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      window.dispatchEvent(
        new CustomEvent("floating-menu-open", { detail: idRef.current }),
      );
    }
  };

  // desmonta após animação de saída
  useEffect(() => {
    if (!isOpen) {
      timeoutRef.current = setTimeout(() => setShouldRender(false), 500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  // fecha quando outro menu abre
  useEffect(() => {
    const handleOtherMenuOpen = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (custom.detail !== idRef.current) {
        setIsOpen(false);
      }
    };

    window.addEventListener("floating-menu-open", handleOtherMenuOpen);
    return () =>
      window.removeEventListener("floating-menu-open", handleOtherMenuOpen);
  }, []);

  // Comentado: click fora desabilitado - drawer sempre aberto até clicar no botão
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as HTMLElement;

  //     // Verifica se o clique foi em qualquer área permitida
  //     const insideAllowedArea = target.closest(
  //       [
  //         '[data-slot="floating-menu-content"]',
  //         '[data-slot="floating-button-trigger"]',
  //         '[data-slot="select-trigger"]',
  //         '[data-slot="select-content"]',
  //         '[data-slot="select-item"]',
  //         '[data-slot="popover"]',
  //         '[data-slot="popover-trigger"]',
  //         '[data-slot="popover-content"]',
  //         "[data-radix-popper-content-wrapper]",
  //         "[data-radix-select-viewport]",
  //         '[role="listbox"]',
  //         '[role="option"]',
  //         '[role="dialog"]',
  //         ".react-colorful",
  //         ".react-colorful__saturation",
  //         ".react-colorful__hue",
  //         ".react-colorful__alpha",
  //         ".react-colorful__pointer",
  //       ].join(","),
  //     );

  //     // Também verifica se clicou dentro de qualquer Portal do Radix UI
  //     const isInsideRadixPortal =
  //       target.closest("[data-radix-portal]") !== null;

  //     // Verifica se há algum Select aberto no documento
  //     const hasOpenSelect =
  //       document.querySelector(
  //         '[data-state="open"][data-slot="select-content"]',
  //       ) !== null;

  //     // Verifica se clicou em qualquer elemento do Select que está no DOM
  //     const isSelectElement =
  //       target.closest("[data-radix-select-trigger]") !== null ||
  //       target.closest("[data-radix-select-content]") !== null ||
  //       target.closest("[data-radix-select-item]") !== null;

  //     if (
  //       !insideAllowedArea &&
  //       !isInsideRadixPortal &&
  //       !hasOpenSelect &&
  //       !isSelectElement
  //     ) {
  //       setIsOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside, false);
  //   return () =>
  //     document.removeEventListener("mousedown", handleClickOutside, false);
  // }, []);

  const canvasRoot = document.getElementById("canvas-editor");
  if (!canvasRoot) return null;

  return (
    <>
      <FloatingButtonTrigger onClick={toggleOpen}>
        {trigger}
      </FloatingButtonTrigger>

      {shouldRender &&
        createPortal(
          <FloatingMenuContent contentTitle={contentTitle} isOpen={isOpen}>
            {menuContent}
          </FloatingMenuContent>,
          canvasRoot,
        )}
    </>
  );
};
