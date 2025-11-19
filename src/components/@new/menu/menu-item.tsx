import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GeometricShapes01Icon } from '@hugeicons/core-free-icons'


export interface MenuItemProps {
  trigger: typeof GeometricShapes01Icon;
  menuContent: React.ReactNode;
  contentTitle?: string;
  open?: boolean;
  variant?: "primary" | "secondary" | "outline" | "destructive";
}

export interface ButtonTriggerProps {
  children: typeof GeometricShapes01Icon;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "outline" | "destructive";
}

const ButtonTrigger = ({
  children,
  onClick,
  variant,
}: ButtonTriggerProps) => {
  return (
    <Button
      data-slot="-button-trigger"
      className="size-10 p-0  text-lg"
      variant={variant === "primary" ? "default" : "outline"}
      onClick={onClick}
    >
      <HugeiconsIcon icon={children} className="size-5" />
    </Button>
  );
};

const MenuContent = ({
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
      data-slot="-menu-content"
      className={`absolute top-0 left-0 h-dvh w-[350px] overflow-auto rounded-r-md border p-4 shadow-md outline-hidden z-90
        bg-popover text-popover-foreground transform transition-all duration-500 ease-in-out
        ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-100 opacity-0"}
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

export const MenuItem = ({
  trigger,
  menuContent,
  contentTitle,
  open,
  variant,
}: MenuItemProps) => {
  const [isOpen, setIsOpen] = useState(open || false);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idRef = useRef(`-menu-${++menuCounter}`);

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

  }, [open]);

  const toggleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!shouldRender) {
      setShouldRender(true);
      // 🔊 notifica que este menu foi aberto
      window.dispatchEvent(
        new CustomEvent("-menu-open", { detail: idRef.current }),
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
        new CustomEvent("-menu-open", { detail: idRef.current }),
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

    window.addEventListener("-menu-open", handleOtherMenuOpen);
    return () =>
      window.removeEventListener("-menu-open", handleOtherMenuOpen);
  }, []);


  const menuRoot = document.getElementById("menu-editor");
  if (!menuRoot) return null;


  return (
    <>
      <ButtonTrigger onClick={toggleOpen} variant={variant || "outline"}>
        {trigger}
      </ButtonTrigger>

      {shouldRender &&
        createPortal(
          <MenuContent contentTitle={contentTitle} isOpen={isOpen}>
            {menuContent}
          </MenuContent>,
          menuRoot,
        )}
    </>
  );
};
