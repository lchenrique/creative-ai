import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface FloatingMenuItemProps {
  trigger: React.ReactNode;
  menuContent: React.ReactNode;
  contentTitle?: string;
  open?: boolean;
  variant?: "primary" | "secondary" | "outline" | "destructive";
}

export interface FloatingButtonTriggerProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "outline" | "destructive";
}

const FloatingButtonTrigger = ({
  children,
  onClick,
  variant,
}: FloatingButtonTriggerProps) => {
  return (
    <Button
      data-slot="floating-button-trigger"
      className="size-10 p-0 rounded-full text-lg"
      variant={variant === "primary" ? "default" : "outline"}
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
  open,
  variant,
}: FloatingMenuItemProps) => {
  const [isOpen, setIsOpen] = useState(open || false);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idRef = useRef(`floating-menu-${++menuCounter}`);

  useEffect(() => {
    if (open) {
      if (!shouldRender) {
        setShouldRender(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsOpen(true));
        });
      } else {
        setIsOpen(true);
      }
    } else {
      setIsOpen(false);
    }
  }, [open, shouldRender  ]);

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

  const canvasRoot = document.getElementById("canvas-editor");
  if (!canvasRoot) return null;

  return (
    <>
      <FloatingButtonTrigger
        onClick={toggleOpen}
        variant={variant || "outline"}
      >
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
