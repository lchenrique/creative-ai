import { deepFlat } from "@daybrush/utils";
import * as React from "react";
import Selecto from "react-selecto";
import Moveable, { type MoveableTargetGroupsType } from "react-moveable";
import { GroupManager, type TargetList } from "@moveable/helper";
import { canvasActions } from "./canvas-actions";
import { useCallback } from "react";
import { Elements } from "./elements";
import { useCanvasStore } from "@/stores/canva-store";
import { Editable } from "./editable-able";

export default function Canvas() {
    const groupManager = React.useMemo<GroupManager>(() => new GroupManager([]), []);
    const [targets, setTargets] = React.useState<MoveableTargetGroupsType>([]);
    const moveableRef = React.useRef<Moveable>(null);
    const selectoRef = React.useRef<Selecto>(null);
    const [elementGuidelines, setElementGuidelines] = React.useState<HTMLElement[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<string[]>()

    // Store
    const updateElementConfig = useCanvasStore((state) => state.updateElementConfig);
    const elements = useCanvasStore((state) => state.elements);
    const removeElement = useCanvasStore((state) => state.removeElement);

    // Clippable mode state
    const [clippableId, setClippableId] = React.useState<string | null>(null);

    // Get clipPath for current clippable element
    const currentClipPath = React.useMemo(() => {
        if (!clippableId) return undefined;
        const element = elements.find(el => el.id === clippableId);
        // Default to polygon (4 corners)
        return element?.config.style.clipPath || "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
    }, [clippableId, elements]);
    const setSelectedTargets = React.useCallback((nextTargetes: MoveableTargetGroupsType) => {
        selectoRef.current!.setSelectedTargets(deepFlat(nextTargetes));
        setTargets(nextTargetes);

    }, []);

    // Handle element deletion
    const handleDeleteElement = useCallback((elementId: string) => {
        if (removeElement) {
            removeElement(elementId);
            setSelectedTargets([]);
            setSelectedIds([]);
        }
    }, [removeElement, setSelectedTargets]);

    React.useEffect(() => {
        // [[0, 1], 2], 3, 4, [5, 6], 7, 8, 9
        const elements = selectoRef.current!.getSelectableElements();

        groupManager.set([], elements);
    }, []);

    // Keyboard delete handler
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === "Delete" && selectedIds && selectedIds.length > 0) {
                e.preventDefault();
                // Delete all selected elements
                selectedIds.forEach(id => {
                    if (removeElement) {
                        removeElement(id);
                    }
                });
                setSelectedTargets([]);
                setSelectedIds([]);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIds, removeElement, setSelectedTargets]);

    const onDragStart = useCallback((e: any) => {
        const moveable = moveableRef.current!;
        const target = e.inputEvent.target;
        const flatted = deepFlat(targets);

        // Verificar se há algum popover aberto (Radix usa portal)
        const hasOpenPopover = document.querySelector('[data-radix-popper-content-wrapper]');

        // Ignorar cliques em menus flutuantes, popovers e modais
        if (
            hasOpenPopover ||
            target.closest('[data-slot="floating-menu-content"]') ||
            target.closest('[data-radix-popper-content-wrapper]') ||
            target.closest('[role="dialog"]') ||
            target.closest('.react-colorful')
        ) {
            e.stop();
            return;
        }
        if (
            target.tagName === "BUTTON"
            || moveable.isMoveableElement(target)
            || flatted.some(t => t === target || t.contains(target))
        ) {
            e.stop();
        }
        e.data.startTargets = targets;
    }, [targets]);


    const onClickGroup = useCallback((e: any) => {
        if (!e.moveableTarget) {
            // Double-click fora do item: desativa clippable
            if (e.isDouble && clippableId) {
                setClippableId(null);
                return;
            }
            setSelectedTargets([]);
            return;
        }
        if (e.isDouble) {
            const targetId = e.moveableTarget.getAttribute("data-element-id");

            // Se já está em modo clippable no mesmo item, adiciona ponto na linha
            if (clippableId === targetId) {
                // Pegar posição do clique relativa ao elemento
                const rect = e.moveableTarget.getBoundingClientRect();
                const x = ((e.inputEvent.clientX - rect.left) / rect.width) * 100;
                const y = ((e.inputEvent.clientY - rect.top) / rect.height) * 100;

                // Parse current polygon
                const element = elements.find(el => el.id === clippableId);
                const clipPath = element?.config.style.clipPath || "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

                // Extract points from polygon
                const match = clipPath.match(/polygon\(([^)]+)\)/);
                if (match) {
                    const pointsStr = match[1];
                    const points = pointsStr.split(',').map(p => p.trim());

                    // Find the best edge to insert the new point
                    const parsedPoints = points.map(p => {
                        const [px, py] = p.split(' ').map(v => parseFloat(v));
                        return { x: px, y: py };
                    });

                    // Find closest edge
                    let minDist = Infinity;
                    let insertIndex = 0;

                    for (let i = 0; i < parsedPoints.length; i++) {
                        const p1 = parsedPoints[i];
                        const p2 = parsedPoints[(i + 1) % parsedPoints.length];

                        // Distance from point to line segment
                        const dx = p2.x - p1.x;
                        const dy = p2.y - p1.y;
                        const t = Math.max(0, Math.min(1, ((x - p1.x) * dx + (y - p1.y) * dy) / (dx * dx + dy * dy)));
                        const projX = p1.x + t * dx;
                        const projY = p1.y + t * dy;
                        const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);

                        if (dist < minDist) {
                            minDist = dist;
                            insertIndex = i + 1;
                        }
                    }

                    // Tolerância em percentagem (aprox 10px em um elemento de 100px)
                    const tolerance = 10;

                    // Só adiciona ponto se clicou próximo da linha
                    if (minDist > tolerance) {
                        return;
                    }

                    // Insert new point
                    parsedPoints.splice(insertIndex, 0, { x, y });

                    // Build new polygon
                    const newPolygon = `polygon(${parsedPoints.map(p => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`).join(', ')})`;

                    // Update store
                    if (updateElementConfig && clippableId) {
                        updateElementConfig(clippableId, {
                            style: { clipPath: newPolygon }
                        });
                    }

                    // Apply to element
                    e.moveableTarget.style.clipPath = newPolygon;
                }
                return;
            }

            // Se clicou duas vezes no item selecionado, ativa modo clippable
            const flatted = deepFlat(targets);
            const isCurrentlySelected = flatted.some(t => t === e.moveableTarget);

            if (isCurrentlySelected && flatted.length === 1) {
                setClippableId(targetId);
                return;
            }

            // Comportamento padrão para grupos
            const childs = groupManager.selectSubChilds(targets, e.moveableTarget);
            setSelectedTargets(childs.targets());
            return;
        }
        if (e.isTrusted) {
            selectoRef.current!.clickTarget(e.inputEvent, e.moveableTarget);
        }
    }, [groupManager, setSelectedTargets, targets, clippableId]);

    const onSelect = useCallback((e: any) => {
        const {
            startAdded,
            startRemoved,
            isDragStartEnd,
        } = e;

        if (isDragStartEnd) {
            return;
        }
        const nextChilds = groupManager.selectSameDepthChilds(
            e.data.startTargets,
            startAdded,
            startRemoved,
        );

        setSelectedTargets(nextChilds.targets());
    }, [groupManager, setSelectedTargets]);

    const onSelectEnd = useCallback((e: any) => {
        const { isDragStartEnd, inputEvent, selected } = e;
        const target = inputEvent.target as HTMLElement;

        // Verificar se há algum popover aberto (Radix usa portal)
        const hasOpenPopover = document.querySelector('[data-radix-popper-content-wrapper]');

        // Ignorar cliques em menus flutuantes, popovers e modais
        if (
            hasOpenPopover ||
            target.closest('[data-slot="floating-menu-content"]') ||
            target.closest('[data-radix-popper-content-wrapper]') ||
            target.closest('[role="dialog"]') ||
            target.closest('.react-colorful')
        ) {
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

        const newSelectedIds = selected.map((el: any) => el.getAttribute("data-element-id")) as string[];
        setSelectedIds(newSelectedIds);

        // Desativar clippable se selecionou outro item
        if (clippableId && !newSelectedIds.includes(clippableId)) {
            setClippableId(null);
        }
    }, [groupManager, setSelectedTargets, clippableId]);



    return <div id="canvas-editor" className="root h-full">
        <div className=" h-full w-full flex items-center justify-center">
            <div

                className="bg-green-300"
                style={{ width: 450, height: 800, position: "relative" }}
            >


                <Moveable
                    ref={moveableRef}
                    ables={[Editable]}
                    props={{
                        editable: true,
                        onDelete: handleDeleteElement,
                    }}
                    draggable={true}
                    rotatable={!clippableId}
                    scalable={!clippableId}
                    resizable={true}
                    clippable={!!clippableId}
                    dragWithClip={false}
                    customClipPath={currentClipPath}
                    target={targets}
                    snapThreshold={5}
                    snapRotationDegrees={Array.from(
                        { length: 72 },
                        (_, i) => i * 5,
                    )}
                    onClickGroup={onClickGroup}
                    onClick={onClickGroup}

                    verticalGuidelines={[0, 112.5, 225, 337.5, 450]}
                    horizontalGuidelines={[0, 200, 400, 800]}
                    elementGuidelines={elementGuidelines}
                    snapDirections={canvasActions.snapDirections}
                    elementSnapDirections={canvasActions.elementSnapDirections}
                    onDrag={canvasActions.onDrag}
                    onRenderGroup={canvasActions.onRenderGroup}
                    onResize={canvasActions.onResize}
                    onRotate={canvasActions.onRotate}
                    onClip={e => {
                        // Convert pixel values to percentages for proper scaling
                        const rect = e.target.getBoundingClientRect();
                        let clipStyle = e.clipStyle;

                        // Check if it's a polygon with pixel values
                        const match = clipStyle.match(/polygon\(([^)]+)\)/);
                        if (match && rect.width > 0 && rect.height > 0) {
                            const pointsStr = match[1];
                            const points = pointsStr.split(',').map(p => p.trim());

                            const convertedPoints = points.map(point => {
                                // Parse "Xpx Ypx" format
                                const parts = point.split(' ');
                                if (parts.length === 2) {
                                    const x = parseFloat(parts[0]);
                                    const y = parseFloat(parts[1]);

                                    // Convert to percentages
                                    const xPercent = (x / rect.width) * 100;
                                    const yPercent = (y / rect.height) * 100;

                                    return `${xPercent.toFixed(2)}% ${yPercent.toFixed(2)}%`;
                                }
                                return point;
                            });

                            clipStyle = `polygon(${convertedPoints.join(', ')})`;
                        }

                        e.target.style.clipPath = clipStyle;
                        // Save to store
                        if (clippableId && updateElementConfig) {
                            updateElementConfig(clippableId, {
                                style: { clipPath: clipStyle }
                            });
                        }
                    }}
                    onRotateEnd={(e) => canvasActions.onRotateEnd(e, (elementId, newAngle) => {
                    })}
                    snappable={true}
                    isDisplaySnapDigit={true}
                ></Moveable>

                <Selecto
                    ref={selectoRef}
                    dragContainer={window}
                    selectableTargets={[".selecto-area .cube"]}
                    hitRate={0}
                    selectByClick={true}
                    selectFromInside={false}
                    toggleContinueSelect={["shift"]}
                    ratio={0}
                    onDragStart={onDragStart}
                    onSelect={onSelect}
                    onSelectEnd={onSelectEnd}
                ></Selecto>
                <Elements selectedIds={selectedIds} />
            </div>

        </div>
    </div>;
}