import { useRef, useState, useEffect } from "react";
import { deepFlat } from "@daybrush/utils";
import * as React from "react";
import { useKeycon } from "react-keycon";
import Selecto from "react-selecto";
import Moveable, { type MoveableTargetGroupsType } from "react-moveable";
import { useCreativeStore, type CanvasElement } from "@/stores/creative-store";
import { CanvasElementComponent } from "./canvas/canvas-element";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CanvasContextMenuActions } from "./canvas/canvas-context-menu-actions";
import { Background } from "./art-background";
import { ImageCropModal } from "./image-crop-modal";
import { ClipPathGenerator } from "@/components/clip-path/clip-path-generator";
import { Check, Loader2 } from "lucide-react";
import MoveableSvgMask from "./react_svg_manipulate_example";
import { Editable } from "./canvas/clip-path/path-control";
import { polygonToPoints } from "@/lib/utils";

export function CanvasEditorTesting() {
  const { isKeydown: isShift } = useKeycon({ keys: "shift" });

  const [targets, setTargets] = useState<MoveableTargetGroupsType>([]);
  const moveableRef = useRef<Moveable>(null);
  const selectoRef = useRef<Selecto>(null);
  const [elementGuidelines, setElementGuidelines] = useState<HTMLElement[]>([]);
  const [processingElementId, setProcessingElementId] = useState<number | null>(
    null,
  );
  const [editingElementId, setEditingElementId] = useState<number | null>(null);
  const isResizingRef = useRef(false);
  const [useClippable, setUseClippable] = useState(false);
  const [useWarpable, setUseWarpable] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>("");
  const [cropElementId, setCropElementId] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isConvertingWebP, setIsConvertingWebP] = useState(false);

  // Estado para o ClipPathEditor
  const [clipPathEditorOpen, setClipPathEditorOpen] = useState(false);

  // Store
  const elements = useCreativeStore((state) => state.canvasElements);
  const setCanvasElements = useCreativeStore(
    (state) => state.setCanvasElements,
  );
  const selectedIds = useCreativeStore((state) => state.selectedCanvasIds);
  const setSelectedCanvasIds = useCreativeStore(
    (state) => state.setSelectedCanvasIds,
  );
  const deleteSelected = useCreativeStore((state) => state.deleteSelected);
  const removeBackgroundFromStore = useCreativeStore(
    (state) => state.removeBackground,
  );
  const autoSave = useCreativeStore((state) => state.autoSave);
  const currentArtworkId = useCreativeStore((state) => state.currentArtworkId);
  const loadFromSupabase = useCreativeStore((state) => state.loadFromSupabase);
  const loadFromLocalStorage = useCreativeStore(
    (state) => state.loadFromLocalStorage,
  );
  const isSaving = useCreativeStore((state) => state.isSaving);
  const lastSavedAt = useCreativeStore((state) => state.lastSavedAt);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);



  const setSelectedTargets = React.useCallback(
    (nextTargetes: MoveableTargetGroupsType) => {
      if (!selectoRef.current) return;
      selectoRef.current!.setSelectedTargets(deepFlat(nextTargetes));
      setTargets(nextTargetes);

      const flatted = deepFlat(nextTargetes) as HTMLElement[];
      const allElements = Array.from(
        document.querySelectorAll(".element"),
      ) as HTMLElement[];
      const guidelines = allElements.filter((el) => !flatted.includes(el));
      setElementGuidelines(guidelines);

      const ids = flatted
        .map((el) => Number(el.getAttribute("data-element-id")))
        .filter((id) => !isNaN(id));
      setSelectedCanvasIds(ids);
    },
    [setSelectedCanvasIds],
  );

  const handleDelete = React.useCallback(() => {
    deleteSelected();
    setSelectedTargets([]);
  }, [deleteSelected, setSelectedTargets]);

  const handleDuplicate = React.useCallback(() => {
    const maxId = Math.max(...elements.map((e) => e.id), 0);
    const newElements = selectedIds
      .map((id, index) => {
        const el = elements.find((e) => e.id === id);
        if (!el) return null;
        return {
          ...el,
          id: maxId + 1 + index,
          x: el.x + 20,
          y: el.y + 20,
        };
      })
      .filter((el): el is CanvasElement => el !== null);

    if (newElements.length > 0) {
      setCanvasElements((prev) => [...prev, ...newElements]);
    }
  }, [selectedIds, elements, setCanvasElements]);

  const handleBringToFront = React.useCallback(() => {
    setCanvasElements((prev) => {
      const selected = prev.filter((el) => selectedIds.includes(el.id));
      const others = prev.filter((el) => !selectedIds.includes(el.id));
      return [...others, ...selected];
    });
  }, [selectedIds, setCanvasElements]);

  const handleSendToBack = React.useCallback(() => {
    setCanvasElements((prev) => {
      const selected = prev.filter((el) => selectedIds.includes(el.id));
      const others = prev.filter((el) => !selectedIds.includes(el.id));
      return [...selected, ...others];
    });
  }, [selectedIds, setCanvasElements]);

  const handleRemoveBackground = React.useCallback(async () => {
    if (selectedIds.length !== 1) return;
    const elementId = selectedIds[0];
    const element = elements.find((el) => el.id === elementId);
    if (!element || element.type !== "image") {
      alert("Please select a single image to remove the background.");
      return;
    }

    setProcessingElementId(elementId);
    try {
      await removeBackgroundFromStore(elementId);
    } catch (error) {
      alert("Failed to remove background.");
    } finally {
      setProcessingElementId(null);
    }
  }, [selectedIds, elements, removeBackgroundFromStore]);

  const handleDoubleClick = React.useCallback(
    (elementId: number) => {
      const element = elements.find((el) => el.id === elementId);
      if (!element || element.type === "text") return;
    },
    [elements],
  );

  const handleCropImage = React.useCallback(() => {
    if (selectedIds.length !== 1) return;
    const elementId = selectedIds[0];
    const element = elements.find((el) => el.id === elementId);

    if (!element || element.type !== "image") {
      alert("Selecione uma imagem para recortar.");
      return;
    }

    setCropElementId(elementId);
    setCropImageUrl(element.image || "");
    setCropModalOpen(true);
  }, [selectedIds, elements]);

  const handleCropComplete = React.useCallback(
    (croppedImageUrl: string) => {
      if (cropElementId === null) return;

      setCanvasElements((prev) =>
        prev.map((el) =>
          el.id === cropElementId ? { ...el, image: croppedImageUrl } : el,
        ),
      );

      setTimeout(() => {
        moveableRef.current?.updateRect();
      }, 100);

      setCropModalOpen(false);
      setCropElementId(null);
      setCropImageUrl("");
    },
    [cropElementId, setCanvasElements],
  );

  const handleConvertToSVG = React.useCallback(async () => {
    if (selectedIds.length !== 1) return;
    const elementId = selectedIds[0];
    const element = elements.find((el) => el.id === elementId);

    if (!element || element.type !== "image" || !element.image) {
      alert("Selecione uma imagem para converter.");
      return;
    }

    setIsConverting(true);
    try {
      const VECTORIZE_API_URL =
        import.meta.env.VITE_VECTORIZE_API_URL || "http://localhost:3001";

      const response = await fetch(`${VECTORIZE_API_URL}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: element.image }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao converter imagem");
      }

      const data = await response.json();

      if (!data.success || !data.svg) {
        throw new Error("Resposta inválida da API de conversão");
      }

      setCanvasElements((prev) =>
        prev.map((el) =>
          el.id === elementId
            ? {
              ...el,
              type: "svg-clipart",
              svgContent: data.svg,
              svgColors: data.colors,
            }
            : el,
        ),
      );
    } catch (error) {
      alert(
        "Erro ao converter imagem para SVG. Verifique se a API está rodando.",
      );
    } finally {
      setIsConverting(false);
    }
  }, [selectedIds, elements, setCanvasElements]);

  // Handlers para o ClipPathEditor
  const handleOpenClipPathEditor = React.useCallback(() => {
    if (selectedIds.length !== 1) return;
    setClipPathEditorOpen(true);
  }, [selectedIds]);

  const handleSaveClipPath = React.useCallback(
    (clipPath: string) => {
      if (selectedIds.length !== 1) return;
      const elementId = selectedIds[0];
      setCanvasElements((prev) =>
        prev.map((el) => (el.id === elementId ? { ...el, clipPath } : el)),
      );
      setClipPathEditorOpen(false);
    },
    [selectedIds, setCanvasElements],
  );

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (event.key === "Delete") {
        handleDelete();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleDelete]);

  React.useEffect(() => {
    if (
      !moveableRef.current ||
      selectedIds.length === 0 ||
      isResizingRef.current
    )
      return;
    moveableRef.current.updateRect();
  }, [elements, selectedIds, targets]);

  useEffect(() => {
    const loadCanvas = async () => {
      setIsLoading(true);
      const lastArtworkId = localStorage.getItem("lastArtworkId");
      if (lastArtworkId) {
        await loadFromSupabase(lastArtworkId);
      } else {
        loadFromLocalStorage();
      }
      setIsLoading(false);
    };
    loadCanvas();
  }, [loadFromSupabase, loadFromLocalStorage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      autoSave();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [elements, autoSave]);

  useEffect(() => {
    if (currentArtworkId) {
      localStorage.setItem("lastArtworkId", currentArtworkId);
    }
  }, [currentArtworkId]);

  useEffect(() => {
    if (!isSaving && lastSavedAt) {
      setShowSavedIndicator(true);
      const timer = setTimeout(() => {
        setShowSavedIndicator(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSavedAt]);

  const selectedElement =
    selectedIds.length === 1
      ? elements.find((el) => el.id === selectedIds[0])
      : null;

  const updatePointes = useCreativeStore((state) => state.updatePoints);


  return (
    <>
      {isSaving && (
        <div className="fixed top-4 right-4 z-50 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
      {!isSaving && showSavedIndicator && (
        <div className="fixed top-4 right-4 z-50 text-muted-foreground transition-opacity duration-500 animate-in fade-in">
          <Check className="h-5 w-5" />
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Carregando canvas...
            </p>
          </div>
        </div>
      )}

      <div
        id="canvas-editor"
        className="root flex flex-col items-center justify-center w-full overflow-hidden"
        style={{
          height: "calc(100vh - 65px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e5e5e5",
          position: "relative",
        }}
      >
        <div className="flex-1 w-full h-full bg-background z-50 pointer-events-none opacity-90" />
        <div className="flex items-center justify-center w-full">
          <div className="flex-1 w-full h-full bg-background z-50 pointer-events-none opacity-90" />
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                className="container"
                style={{
                  width: "540px",
                  height: "960px",
                  border: "1px solid #ccc",
                  background: "#ffffff",
                  position: "relative",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Background />
                <Moveable
                  ref={moveableRef}
                  draggable={!useClippable}
                  resizable={!useWarpable && !useClippable}
                  rotatable={!useClippable}
                  scalable={false}
                  warpable={useWarpable}
                  // clippable={true}
                  clipArea={false}
                  clipRelative
                  clipTargetBounds
                  dragWithClip
                  target={targets}
                  ables={[Editable]}
                  props={{
                    add: (item) => {
                      updatePointes(Number(item.id), [...item.points, { x: 50, y: 50 }]);
                    },
                    editable: true,
                  }}

                  renderDirections={[
                    "nw",
                    "n",
                    "ne",
                    "w",
                    "e",
                    "sw",
                    "s",
                    "se",
                  ]}
                  keepRatio={isShift}
                  snappable={true}
                  isDisplaySnapDigit={true}
                  snapDirections={{
                    top: true,
                    left: true,
                    bottom: true,
                    right: true,
                    center: true,
                    middle: true,
                  }}
                  elementSnapDirections={{
                    top: true,
                    left: true,
                    bottom: true,
                    right: true,
                    center: true,
                    middle: true,
                  }}
                  snapThreshold={5}
                  snapRotationDegrees={Array.from(
                    { length: 72 },
                    (_, i) => i * 5,
                  )}
                  verticalGuidelines={[0, 200, 400, 600, 800]}
                  horizontalGuidelines={[0, 200, 400, 600]}
                  elementGuidelines={elementGuidelines}
                  onClickGroup={(e) => {
                    if (!e.moveableTarget) {
                      setSelectedTargets([]);
                      return;
                    }
                    if (e.isDouble) {
                      return;
                    }
                    if (e.isTrusted) {
                      selectoRef.current!.clickTarget(
                        e.inputEvent,
                        e.moveableTarget,
                      );
                    }
                  }}
                  onDrag={(e) => {
                    e.target.style.transform = e.transform;
                  }}
                  onDragEnd={(e) => {
                    const elementId = Number(
                      e.target.getAttribute("data-element-id"),
                    );
                    if (isNaN(elementId)) return;
                    const lastEvent = e.lastEvent;
                    if (!lastEvent || !lastEvent.translate) return;
                    const newX = lastEvent.translate[0];
                    const newY = lastEvent.translate[1];
                    setCanvasElements((prev) =>
                      prev.map((el) =>
                        el.id === elementId ? { ...el, x: newX, y: newY } : el,
                      ),
                    );
                  }}
                  onDragGroup={(e) => {
                    e.events.forEach((ev) => {
                      ev.target.style.transform = ev.transform;
                    });
                  }}
                  onResizeStart={() => {
                    isResizingRef.current = true;
                  }}
                  onResize={(e) => {
                    e.target.style.width = `${e.width}px`;
                    e.target.style.height = `${e.height}px`;
                    e.target.style.transform = e.drag.transform;
                  }}
                  onResizeEnd={(e) => {
                    const elementId = Number(
                      e.target.getAttribute("data-element-id"),
                    );
                    if (isNaN(elementId)) return;
                    const element = elements.find((el) => el.id === elementId);
                    if (!element) return;
                    const lastEvent = e.lastEvent;
                    if (!lastEvent) return;
                    const newWidth = lastEvent.width;
                    const newHeight = lastEvent.height;
                    const newX = lastEvent.drag.translate[0];
                    const newY = lastEvent.drag.translate[1];
                    if (element.type === "text") {
                      const calculatedFontSize =
                        Number(
                          e.target.getAttribute("data-calculated-fontsize"),
                        ) || newHeight;
                      setCanvasElements((prev) =>
                        prev.map((el) =>
                          el.id === elementId
                            ? {
                              ...el,
                              fontSize: calculatedFontSize,
                              w: newWidth,
                              h: newHeight,
                              x: newX,
                              y: newY,
                            }
                            : el,
                        ),
                      );
                    } else {
                      setCanvasElements((prev) =>
                        prev.map((el) =>
                          el.id === elementId
                            ? {
                              ...el,
                              w: newWidth,
                              h: newHeight,
                              x: newX,
                              y: newY,
                            }
                            : el,
                        ),
                      );
                    }
                    setTimeout(() => {
                      isResizingRef.current = false;
                    }, 0);
                  }}
                  onResizeGroupStart={() => {
                    isResizingRef.current = true;
                  }}
                  onResizeGroup={(e) => {
                    e.events.forEach((ev) => {
                      ev.target.style.width = `${ev.width}px`;
                      ev.target.style.height = `${ev.height}px`;
                      ev.target.style.transform = ev.transform;
                    });
                  }}
                  onResizeGroupEnd={() => {
                    isResizingRef.current = false;
                  }}
                  onRotate={(e) => {
                    e.target.style.transform = e.transform;
                  }}
                  onRotateEnd={(e) => {
                    const elementId = Number(
                      e.target.getAttribute("data-element-id"),
                    );
                    if (isNaN(elementId)) return;
                    const lastEvent = e.lastEvent;
                    if (!lastEvent) return;
                    const newAngle = lastEvent.rotate;
                    setCanvasElements((prev) =>
                      prev.map((el) =>
                        el.id === elementId ? { ...el, angle: newAngle } : el,
                      ),
                    );
                  }}
                  onRotateGroup={(e) => {
                    e.events.forEach((ev) => {
                      ev.target.style.transform = ev.transform;
                    });
                  }}
                  onWarp={(e) => {
                    e.target.style.transform = e.transform;
                  }}
                  onWarpEnd={(e) => {
                    const elementId = Number(
                      e.target.getAttribute("data-element-id"),
                    );
                    if (isNaN(elementId)) return;
                    const lastEvent = e.lastEvent;
                    if (!lastEvent) return;
                    const warpMatrix = lastEvent.matrix;
                    const newX = lastEvent.translate[0];
                    const newY = lastEvent.translate[1];
                    setCanvasElements((prev) =>
                      prev.map((el) =>
                        el.id === elementId
                          ? { ...el, warpMatrix: warpMatrix, x: newX, y: newY }
                          : el,
                      ),
                    );
                  }}
                  onClip={(e) => {
                    const id = e.target.attributes.item(0)?.value
                    const points = polygonToPoints(e.clipStyle);
                    // updatePointes(Number(id), points);
                    e.target.style.clipPath = e.clipStyle;
                  }}
                  onClipEnd={(e) => {
                    const elementId = Number(
                      e.target.getAttribute("data-element-id"),
                    );
                    if (isNaN(elementId) || !e.lastEvent) return;
                    const newClipPath = e.lastEvent.clipStyle;
                    setCanvasElements((prev) =>
                      prev.map((el) =>
                        el.id === elementId
                          ? { ...el, clipPath: newClipPath }
                          : el,
                      ),
                    );
                  }}
                ></Moveable>
                <Selecto
                  ref={selectoRef}
                  dragContainer={".root"}
                  selectableTargets={[".selecto-area .element"]}
                  hitRate={0}
                  selectByClick={true}
                  selectFromInside={false}
                  toggleContinueSelect={["shift"]}
                  ratio={0}
                  onDragStart={(e) => {
                    const moveable = moveableRef.current!;
                    const target = e.inputEvent.target as HTMLElement;
                    if (target.closest('[data-slot="floating-menu-content"]')) {
                      e.stop();
                      return;
                    }
                    const flatted = targets.flat(3) as Array<
                      HTMLElement | SVGElement
                    >;
                    if (
                      moveable.isMoveableElement(target) ||
                      flatted.some((t) => t === target || t.contains(target))
                    ) {
                      e.stop();
                    }
                  }}
                  onSelectEnd={(e) => {
                    const { isDragStartEnd, inputEvent, selected } = e;
                    const target = inputEvent.target as HTMLElement;
                    if (target.closest('[data-slot="floating-menu-content"]')) {
                      return;
                    }
                    const moveable = moveableRef.current!;
                    if (isDragStartEnd) {
                      inputEvent.preventDefault();
                      moveable.waitToChangeTarget().then(() => {
                        moveable.dragStart(inputEvent);
                      });
                    }
                    e.currentTarget.setSelectedTargets(selected);
                    setSelectedTargets(selected);
                  }}
                ></Selecto>

                <div className="elements selecto-area">
                  {elements.map((element) => (

                    <CanvasElementComponent
                      key={element.id}
                      element={element}
                      elements={elements}
                      isSelected={selectedIds.includes(element.id)}
                      isEditing={editingElementId === element.id}
                      isProcessing={processingElementId === element.id}
                      onSelect={() => { }}
                      onEditStart={(id) => setEditingElementId(id)}
                      onEditEnd={() => setEditingElementId(null)}
                      onTextChange={(text) => {
                        const updatedElements = elements.map((el) =>
                          el.id === element.id ? { ...el, text } : el,
                        );
                        setCanvasElements(updatedElements);
                      }}
                      onDoubleClick={handleDoubleClick}
                    />

                  ))}
                </div>
                <div className="empty elements"></div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <CanvasContextMenuActions
                selectedIds={selectedIds}
                elements={elements}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onBringToFront={handleBringToFront}
                onSendToBack={handleSendToBack}
                isRemovingBackground={processingElementId !== null}
                onRemoveBackground={handleRemoveBackground}
                onCropImage={handleCropImage}
                onEditClipPath={handleOpenClipPathEditor}
                useWarpable={useWarpable}
                useClippable={useClippable}
                isConverting={isConverting}
                isConvertingWebP={isConvertingWebP}
                onConvertToSVG={handleConvertToSVG}
                onConvertToWebP={() => alert("Not implemented")}
                onGroup={() => alert("Not implemented")}
                onUngroup={() => alert("Not implemented")}
                onToggleWarpable={(value) => setUseWarpable(value)}
                onToggleClippable={() => setUseClippable(!useClippable)}
              />
            </ContextMenuContent>
          </ContextMenu>
          <div className="flex-1 w-full h-full bg-background z-50 pointer-events-none opacity-90" />
        </div>

        <div className="flex-1 w-full h-full bg-background z-50 pointer-events-none opacity-90" />

        <ImageCropModal
          open={cropModalOpen}
          imageUrl={cropImageUrl}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCropComplete}
        />

        <Dialog open={clipPathEditorOpen} onOpenChange={setClipPathEditorOpen}>
          <DialogContent className="max-w-fit">
            <DialogHeader>
              <DialogTitle>Editor de Máscara (Clip Path)</DialogTitle>
            </DialogHeader>
            {selectedElement && (
              <ClipPathGenerator
                width={400}
                height={400}
                initialClipPath={selectedElement.clipPath}
                onSave={handleSaveClipPath}
              />
            )}
          </DialogContent>
        </Dialog>
      </div >
    </>
  );
}
