import { useState, useRef } from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Copy, Trash2, Send, BringToFront, Group, Ungroup } from "lucide-react";

interface Element {
    id: number;
    x: number;
    y: number;
    w: number;
    h: number;
    angle: number;
    color: string;
    groupId?: number;
    isGroup?: boolean;
    children?: number[];
}

export const Canvas = () => {
    const initial: Element[] = [
        { id: 1, x: 50, y: 50, w: 150, h: 100, angle: 0, color: 'bg-blue-500' },
        { id: 2, x: 280, y: 140, w: 180, h: 120, angle: 0, color: 'bg-green-500' },
        { id: 3, x: 520, y: 220, w: 140, h: 140, angle: 0, color: 'bg-pink-500' }
    ];

    const [elements, setElements] = useState<Element[]>(initial);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const targetRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const paperRef = useRef<HTMLDivElement>(null);
    const moveableRef = useRef<Moveable>(null);

    // Dimensões da folha A4 em pixels (escala 1:1 = 794x1123px, usando 2:1 para visualização)
    const paperWidth = 794;
    const paperHeight = 1123;

    const updateElement = (id: number, updates: Partial<Element>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteSelected = () => {
        setElements(prev => prev.filter(el => !selectedIds.includes(el.id)));
        setSelectedIds([]);
    };

    const duplicateSelected = () => {
        const newElements = selectedIds.map(id => {
            const el = elements.find(e => e.id === id);
            if (!el) return null;
            return {
                ...el,
                id: Math.max(...elements.map(e => e.id)) + 1 + selectedIds.indexOf(id),
                x: el.x + 20,
                y: el.y + 20,
            };
        }).filter((el): el is Element => el !== null);

        setElements(prev => [...prev, ...newElements]);
        setSelectedIds(newElements.map(el => el.id));
    };

    const bringToFront = () => {
        setElements(prev => {
            const selected = prev.filter(el => selectedIds.includes(el.id));
            const others = prev.filter(el => !selectedIds.includes(el.id));
            return [...others, ...selected];
        });
    };

    const sendToBack = () => {
        setElements(prev => {
            const selected = prev.filter(el => selectedIds.includes(el.id));
            const others = prev.filter(el => !selectedIds.includes(el.id));
            return [...selected, ...others];
        });
    };

    const groupSelected = () => {
        if (selectedIds.length < 2) return;

        // Encontra o próximo ID disponível para o grupo
        const groupId = Math.max(...elements.map(e => e.id), 0) + 1;

        // Calcula bounds do grupo
        const selectedElements = elements.filter(el => selectedIds.includes(el.id));
        const minX = Math.min(...selectedElements.map(el => el.x));
        const minY = Math.min(...selectedElements.map(el => el.y));
        const maxX = Math.max(...selectedElements.map(el => el.x + el.w));
        const maxY = Math.max(...selectedElements.map(el => el.y + el.h));

        // Cria o elemento de grupo
        const groupElement: Element = {
            id: groupId,
            x: minX,
            y: minY,
            w: maxX - minX,
            h: maxY - minY,
            angle: 0,
            color: 'transparent',
            isGroup: true,
            children: selectedIds,
        };

        // Atualiza elementos para referenciar o grupo
        setElements(prev => {
            const updated = prev.map(el =>
                selectedIds.includes(el.id)
                    ? { ...el, groupId }
                    : el
            );
            return [...updated, groupElement];
        });

        setSelectedIds([groupId]);
    };

    const ungroupSelected = () => {
        const groupIds = selectedIds.filter(id => {
            const el = elements.find(e => e.id === id);
            return el?.isGroup;
        });

        if (groupIds.length === 0) return;

        setElements(prev => {
            // Remove grupos e limpa groupId dos filhos
            const ungrouped = prev.filter(el => !groupIds.includes(el.id))
                .map(el => groupIds.includes(el.groupId || -1)
                    ? { ...el, groupId: undefined }
                    : el
                );
            return ungrouped;
        });

        // Seleciona os elementos que estavam no grupo
        const childIds = elements
            .filter(el => groupIds.includes(el.id) && el.children)
            .flatMap(el => el.children || []);

        setSelectedIds(childIds);
    };

    // Get all element refs except the selected ones for guidelines
    const getElementGuidelines = () => {
        return Object.entries(targetRefs.current)
            .filter(([id]) => !selectedIds.includes(Number(id)) && targetRefs.current[Number(id)])
            .map(([_, ref]) => ref!);
    };

    // Get selected targets
    const getSelectedTargets = () => {
        return selectedIds
            .map(id => targetRefs.current[id])
            .filter(ref => ref !== null) as HTMLDivElement[];
    };

    return (
        <div 
            className="relative w-full h-full bg-gray-200 overflow-auto flex items-start justify-center p-8"
            onMouseDown={(e) => {
                // Deseleciona se clicar fora da folha (na área cinza)
                if (e.target === e.currentTarget) {
                    setSelectedIds([]);
                }
            }}
        >
            {/* Área da folha (paper) */}
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <div
                        ref={paperRef}
                        className="relative bg-white shadow-2xl"
                        style={{
                            width: `${paperWidth}px`,
                            height: `${paperHeight}px`,
                        }}
                        onMouseDown={(e) => {
                            // Deseleciona apenas se clicar no fundo (não em um elemento)
                            if (e.target === paperRef.current) {
                                setSelectedIds([]);
                            }
                        }}
                    >
                        {/* Container de elementos */}
                        {elements.map(el => {
                    // Não renderiza elementos que pertencem a um grupo (serão renderizados dentro do grupo)
                    if (el.groupId && !el.isGroup) return null;

                    return (
                        <div
                            key={el.id}
                            ref={(ref) => { targetRefs.current[el.id] = ref; }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                                    // Multi-select com Shift/Ctrl
                                    setSelectedIds(prev =>
                                        prev.includes(el.id)
                                            ? prev.filter(id => id !== el.id)
                                            : [...prev, el.id]
                                    );
                                } else {
                                    // Select único
                                    setSelectedIds([el.id]);
                                }
                            }}
                            data-element-id={el.id}
                            className={`element absolute select-none ${el.isGroup ? 'border-2 border-dashed border-blue-400' : `rounded shadow ${el.color}`} cursor-move ${selectedIds.includes(el.id) ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                                }`}
                            style={{
                                left: 0,
                                top: 0,
                                width: `${el.w}px`,
                                height: `${el.h}px`,
                                transform: `translate(${el.x}px, ${el.y}px) rotate(${el.angle}deg)`,
                                transformOrigin: '50% 50%',
                            }}
                        >
                            {el.isGroup ? (
                                // Renderiza filhos dentro do grupo
                                <>
                                    {el.children?.map(childId => {
                                        const child = elements.find(e => e.id === childId);
                                        if (!child) return null;
                                        return (
                                            <div
                                                key={child.id}
                                                className={`absolute rounded shadow ${child.color}`}
                                                style={{
                                                    left: `${child.x - el.x}px`,
                                                    top: `${child.y - el.y}px`,
                                                    width: `${child.w}px`,
                                                    height: `${child.h}px`,
                                                    transform: `rotate(${child.angle}deg)`,
                                                    transformOrigin: '50% 50%',
                                                }}
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center text-white font-semibold pointer-events-none">
                                                    Elemento {child.id}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded pointer-events-none">
                                        Grupo {el.id}
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white font-semibold pointer-events-none">
                                    Elemento {el.id}
                                </div>
                            )}
                        </div>
                    );
                })}

                {selectedIds.length > 0 && (
                    <Moveable
                        ref={moveableRef}
                        target={getSelectedTargets()}
                        draggable={true}
                        resizable={true}
                        rotatable={true}
                        keepRatio={false}
                        throttleDrag={0}
                        throttleResize={0}
                        throttleRotate={5}
                        edge={false}

                        // Snappable configuration
                        snappable={true}
                        snapThreshold={5}
                        isDisplaySnapDigit={true}
                        snapGap={true}
                        snapDigit={0}

                        // Guidelines
                        elementGuidelines={getElementGuidelines()}

                        // Rotation snap - snap every 5 degrees
                        snapRotationThreshold={5}
                        snapRotationDegrees={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
                            95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180,
                            185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250, 255, 260, 265, 270,
                            275, 280, 285, 290, 295, 300, 305, 310, 315, 320, 325, 330, 335, 340, 345, 350, 355]}

                        origin={false}

                        // Single element events
                        onDrag={(e) => {
                            if (selectedIds.length === 1) {
                                e.target.style.transform = e.transform;
                            }
                        }}
                        onDragStart={() => {
                            setIsDragging(true);
                        }}
                        onDragEnd={(e) => {
                            setIsDragging(false);
                            if (selectedIds.length === 1 && e.lastEvent?.translate) {
                                const translate = e.lastEvent.translate;
                                const id = Number(e.target.getAttribute('data-element-id'));
                                if (!isNaN(id)) {
                                    const element = elements.find(el => el.id === id);
                                    if (element?.isGroup && element.children) {
                                        // Atualiza o grupo e seus filhos
                                        const deltaX = translate[0] - element.x;
                                        const deltaY = translate[1] - element.y;

                                        setElements(prev => prev.map(el => {
                                            if (el.id === id) {
                                                return { ...el, x: translate[0], y: translate[1] };
                                            }
                                            if (element.children?.includes(el.id)) {
                                                return { ...el, x: el.x + deltaX, y: el.y + deltaY };
                                            }
                                            return el;
                                        }));
                                    } else {
                                        updateElement(id, {
                                            x: translate[0],
                                            y: translate[1],
                                        });
                                    }
                                }
                            }
                        }}

                        // Group events (multiple elements)
                        onDragGroup={(e) => {
                            e.events.forEach(ev => {
                                ev.target.style.transform = ev.transform;
                            });
                        }}
                        onDragGroupStart={() => {
                            setIsDragging(true);
                        }}
                        onDragGroupEnd={(e) => {
                            setIsDragging(false);
                            e.events.forEach(ev => {
                                if (ev.lastEvent?.translate) {
                                    const translate = ev.lastEvent.translate;
                                    const id = Number(ev.target.getAttribute('data-element-id'));
                                    if (!isNaN(id)) {
                                        updateElement(id, {
                                            x: translate[0],
                                            y: translate[1],
                                        });
                                    }
                                }
                            });
                        }}

                        onResizeGroup={(e) => {
                            e.events.forEach(ev => {
                                ev.target.style.width = `${ev.width}px`;
                                ev.target.style.height = `${ev.height}px`;
                                ev.target.style.transform = ev.drag.transform;
                            });
                        }}
                        onResizeGroupStart={() => {
                            setIsDragging(true);
                        }}
                        onResizeGroupEnd={(e) => {
                            setIsDragging(false);
                            e.events.forEach(ev => {
                                if (!ev.lastEvent) return;
                                const translate = ev.lastEvent.drag.translate;
                                const id = Number(ev.target.getAttribute('data-element-id'));
                                if (!isNaN(id) && ev.lastEvent.width && ev.lastEvent.height) {
                                    updateElement(id, {
                                        x: translate[0],
                                        y: translate[1],
                                        w: ev.lastEvent.width,
                                        h: ev.lastEvent.height,
                                    });
                                }
                            });
                        }}

                        onRotateGroup={(e) => {
                            e.events.forEach(ev => {
                                ev.target.style.transform = ev.drag.transform;
                            });
                        }}
                        onRotateGroupStart={() => {
                            setIsDragging(true);
                        }}
                        onRotateGroupEnd={(e) => {
                            setIsDragging(false);
                            e.events.forEach(ev => {
                                if (!ev.lastEvent?.drag.translate) return;
                                const translate = ev.lastEvent.drag.translate;
                                const id = Number(ev.target.getAttribute('data-element-id'));
                                if (!isNaN(id)) {
                                    updateElement(id, {
                                        x: translate[0],
                                        y: translate[1],
                                        angle: ev.lastEvent.rotate,
                                    });
                                }
                            });
                        }}

                        onResize={(e) => {
                            e.target.style.width = `${e.width}px`;
                            e.target.style.height = `${e.height}px`;
                            e.target.style.transform = e.drag.transform;
                        }}
                        onResizeStart={() => {
                            setIsDragging(true);
                        }}
                        onResizeEnd={(e) => {
                            setIsDragging(false);
                            if (!e.lastEvent) return;
                            const translate = e.lastEvent.drag.translate;
                            const id = Number(e.target.getAttribute('data-element-id'));
                            if (!isNaN(id) && e.lastEvent.width && e.lastEvent.height) {
                                const element = elements.find(el => el.id === id);
                                if (element?.isGroup && element.children) {
                                    // Calcula escala do resize
                                    const scaleX = e.lastEvent.width / element.w;
                                    const scaleY = e.lastEvent.height / element.h;

                                    setElements(prev => prev.map(el => {
                                        if (el.id === id) {
                                            return {
                                                ...el,
                                                x: translate[0],
                                                y: translate[1],
                                                w: e.lastEvent!.width,
                                                h: e.lastEvent!.height,
                                            };
                                        }
                                        if (element.children?.includes(el.id)) {
                                            // Escala e reposiciona filhos
                                            const relX = el.x - element.x;
                                            const relY = el.y - element.y;
                                            return {
                                                ...el,
                                                x: translate[0] + (relX * scaleX),
                                                y: translate[1] + (relY * scaleY),
                                                w: el.w * scaleX,
                                                h: el.h * scaleY,
                                            };
                                        }
                                        return el;
                                    }));
                                } else {
                                    updateElement(id, {
                                        x: translate[0],
                                        y: translate[1],
                                        w: e.lastEvent.width,
                                        h: e.lastEvent.height,
                                    });
                                }
                            }
                        }}

                        onRotate={(e) => {
                            e.target.style.transform = e.drag.transform;
                        }}
                        onRotateStart={() => {
                            setIsDragging(true);
                        }}
                        onRotateEnd={(e) => {
                            setIsDragging(false);
                            if (!e.lastEvent?.drag.translate) return;
                            const translate = e.lastEvent.drag.translate;
                            const id = Number(e.target.getAttribute('data-element-id'));
                            if (!isNaN(id)) {
                                const element = elements.find(el => el.id === id);
                                if (element?.isGroup && element.children) {
                                    // Rotaciona o grupo e seus filhos ao redor do centro do grupo
                                    const centerX = element.x + element.w / 2;
                                    const centerY = element.y + element.h / 2;
                                    const angleDelta = e.lastEvent.rotate - element.angle;
                                    const rad = (angleDelta * Math.PI) / 180;

                                    setElements(prev => prev.map(el => {
                                        if (el.id === id) {
                                            return {
                                                ...el,
                                                x: translate[0],
                                                y: translate[1],
                                                angle: e.lastEvent!.rotate,
                                            };
                                        }
                                        if (element.children?.includes(el.id)) {
                                            // Rotaciona posição do filho ao redor do centro do grupo
                                            const childCenterX = el.x + el.w / 2;
                                            const childCenterY = el.y + el.h / 2;
                                            const relX = childCenterX - centerX;
                                            const relY = childCenterY - centerY;

                                            const newRelX = relX * Math.cos(rad) - relY * Math.sin(rad);
                                            const newRelY = relX * Math.sin(rad) + relY * Math.cos(rad);

                                            return {
                                                ...el,
                                                x: centerX + newRelX - el.w / 2,
                                                y: centerY + newRelY - el.h / 2,
                                                angle: el.angle + angleDelta,
                                            };
                                        }
                                        return el;
                                    }));
                                } else {
                                    updateElement(id, {
                                        x: translate[0],
                                        y: translate[1],
                                        angle: e.lastEvent.rotate,
                                    });
                                }
                            }
                        }}
                    />
                )}

                {/* Selecto para seleção com retângulo */}
                <Selecto
                    container={paperRef.current}
                    selectableTargets={['.element']}
                    hitRate={0}
                    selectByClick={false}
                    selectFromInside={false}
                    toggleContinueSelect={['shift']}
                    continueSelect={false}
                    ratio={0}
                    preventClickEventOnDrag={true}
                    onSelectEnd={(e) => {
                        if (isDragging) return;
                        
                        const selected = e.selected.map(el =>
                            Number(el.getAttribute('data-element-id'))
                        ).filter(id => !isNaN(id));
                        
                        if (selected.length > 0) {
                            setSelectedIds(selected);
                        }
                    }}
                />
            </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
            <ContextMenuItem onClick={duplicateSelected} disabled={selectedIds.length === 0}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Duplicar</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={deleteSelected} disabled={selectedIds.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Deletar</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
                onClick={groupSelected}
                disabled={selectedIds.length < 2 || selectedIds.some(id => elements.find(e => e.id === id)?.isGroup)}
            >
                <Group className="mr-2 h-4 w-4" />
                <span>Agrupar</span>
            </ContextMenuItem>
            <ContextMenuItem
                onClick={ungroupSelected}
                disabled={!selectedIds.some(id => elements.find(e => e.id === id)?.isGroup)}
            >
                <Ungroup className="mr-2 h-4 w-4" />
                <span>Desagrupar</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={bringToFront} disabled={selectedIds.length === 0}>
                <BringToFront className="mr-2 h-4 w-4" />
                <span>Trazer para frente</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={sendToBack} disabled={selectedIds.length === 0}>
                <Send className="mr-2 h-4 w-4" />
                <span>Enviar para trás</span>
            </ContextMenuItem>
        </ContextMenuContent>
    </ContextMenu>
        </div>
    );
}