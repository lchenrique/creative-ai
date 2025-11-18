import { useState } from "react";
import { useCreativeStore } from "@/stores/creative-store";
import {
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Type,
  Square,
  Circle,
  Triangle,
  Minus,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CanvasElement } from "@/stores/creative-store";

const getElementIcon = (type: CanvasElement["type"]) => {
  switch (type) {
    case "image":
      return ImageIcon;
    case "text":
      return Type;
    case "box":
      return Square;
    case "circle":
      return Circle;
    case "triangle":
      return Triangle;
    case "line":
      return Minus;
    case "svg-clipart":
      return ImageIcon;
    default:
      return Square;
  }
};

const getElementName = (element: CanvasElement) => {
  if (element.type === "text") {
    return element.text?.slice(0, 20) || "Texto";
  }
  if (element.type === "image") {
    return "Imagem";
  }
  if (element.type === "svg-clipart") {
    return "SVG Clipart";
  }
  return element.type?.charAt(0).toUpperCase() + (element.type?.slice(1) || "");
};

export function LayersPanel() {
  const [open, setOpen] = useState(false);
  const elements = useCreativeStore((state) => state.canvasElements);
  const selectedIds = useCreativeStore((state) => state.selectedCanvasIds);
  const setSelectedIds = useCreativeStore((state) => state.setSelectedCanvasIds);
  const setCanvasElements = useCreativeStore((state) => state.setCanvasElements);
  const deleteSelected = useCreativeStore((state) => state.deleteSelected);

  // Elementos em ordem reversa (último criado no topo)
  const sortedElements = [...elements].reverse();

  const handleSelect = (id: number, multiSelect: boolean) => {
    if (multiSelect) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      setSelectedIds([id]);
    }
  };

  const handleMoveUp = (id: number) => {
    const currentIndex = elements.findIndex((el) => el.id === id);
    if (currentIndex < elements.length - 1) {
      const newElements = [...elements];
      [newElements[currentIndex], newElements[currentIndex + 1]] = [
        newElements[currentIndex + 1],
        newElements[currentIndex],
      ];
      setCanvasElements(newElements);
    }
  };

  const handleMoveDown = (id: number) => {
    const currentIndex = elements.findIndex((el) => el.id === id);
    if (currentIndex > 0) {
      const newElements = [...elements];
      [newElements[currentIndex], newElements[currentIndex - 1]] = [
        newElements[currentIndex - 1],
        newElements[currentIndex],
      ];
      setCanvasElements(newElements);
    }
  };

  const handleToggleVisibility = (id: number) => {
    setCanvasElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, opacity: el.opacity === 0 ? 1 : 0 } : el
      )
    );
  };

  const handleDelete = (id: number) => {
    setSelectedIds([id]);
    deleteSelected();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-20 z-50 shadow-lg"
        >
          <Layers className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Camadas
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-1">
          {sortedElements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma camada ainda
            </div>
          ) : (
            sortedElements.map((element, index) => {
              const Icon = getElementIcon(element.type);
              const isSelected = selectedIds.includes(element.id);
              const isHidden = element.opacity === 0;
              const isFirst = index === 0;
              const isLast = index === sortedElements.length - 1;

              return (
                <div
                  key={element.id}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer
                    ${
                      isSelected
                        ? "bg-primary/10 border-primary"
                        : "border-border hover:bg-muted"
                    }
                    ${isHidden ? "opacity-50" : ""}
                  `}
                  onClick={(e) => handleSelect(element.id, e.shiftKey)}
                >
                  {/* Ícone do tipo */}
                  <div className="flex-shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Nome */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{getElementName(element)}</p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1">
                    {/* Mover para cima */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(element.id);
                      }}
                      disabled={isFirst}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>

                    {/* Mover para baixo */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(element.id);
                      }}
                      disabled={isLast}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>

                    {/* Toggle visibilidade */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(element.id);
                      }}
                    >
                      {isHidden ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Deletar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(element.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
          <p>💡 Dica: Use Shift + Clique para selecionar múltiplas camadas</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
