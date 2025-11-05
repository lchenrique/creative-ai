import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import { useCreativeStore } from "@/stores/creative-store"
import { Copy, Trash2, Lock, Unlock, MoveUp, MoveDown, Circle, Square } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClipartBrowser } from "./clipart-browser"
import { Rect, Circle as FabricCircle, Triangle, Polygon, FabricImage, Line, Textbox } from 'fabric'

interface CanvasContextMenuProps {
    children: ReactNode
}

export function CanvasContextMenu({ children }: CanvasContextMenuProps) {
    const fabricCanvas = useCreativeStore((state) => state.fabricCanvas)
    const applyClipPathToObject = useCreativeStore((state) => state.applyClipPathToObject)
    const removeClipPath = useCreativeStore((state) => state.removeClipPath)
    const convertToImageFrame = useCreativeStore((state) => state.convertToImageFrame)
    const removeFrameImage = useCreativeStore((state) => state.removeFrameImage)
    const [selectedObject, setSelectedObject] = useState<any>(null)
    const [hasClipPath, setHasClipPath] = useState(false)
    const [isFrame, setIsFrame] = useState(false)
    const [isFrameImage, setIsFrameImage] = useState(false)
    const [showClipartDialog, setShowClipartDialog] = useState(false)

    useEffect(() => {
        if (!fabricCanvas) return

        const updateSelection = () => {
            const active = fabricCanvas.getActiveObject()
            setSelectedObject(active)
            setHasClipPath(active && active.clipPath != null)
            setIsFrame(active && (active as any)._isFrame)
            setIsFrameImage(active && (active as any)._isFrameImage)
        }

        fabricCanvas.on('selection:created', updateSelection)
        fabricCanvas.on('selection:updated', updateSelection)
        fabricCanvas.on('selection:cleared', () => {
            setSelectedObject(null)
        })

        return () => {
            fabricCanvas.off('selection:created', updateSelection)
            fabricCanvas.off('selection:updated', updateSelection)
            fabricCanvas.off('selection:cleared')
        }
    }, [fabricCanvas])

    const handleDuplicate = async () => {
        if (!selectedObject || !fabricCanvas) return

        try {
            // Serializar objeto para JSON
            const objectData = selectedObject.toObject([
                '_isFrame',
                '_frameClipPath',
                '_isFrameImage',
                '_frameObject',
                '_isClipShell'
            ])

            // Mapear tipos para classes corretas
            const typeToClass: Record<string, any> = {
                'rect': Rect,
                'circle': FabricCircle,
                'triangle': Triangle,
                'polygon': Polygon,
                'image': FabricImage,
                'line': Line,
                'textbox': Textbox,
                'i-text': Textbox,
            }

            const ClassType = typeToClass[selectedObject.type]
            if (!ClassType || !ClassType.fromObject) {
                console.error('Tipo de objeto não suportado para duplicação:', selectedObject.type)
                return
            }

            const cloned = await ClassType.fromObject(objectData)

            cloned.set({
                left: (selectedObject.left || 0) + 20,
                top: (selectedObject.top || 0) + 20,
            })

            // Clonar clipPath se existir
            if (selectedObject.clipPath) {
                const clipData = selectedObject.clipPath.toObject()
                const ClipClassType = typeToClass[selectedObject.clipPath.type]
                if (ClipClassType && ClipClassType.fromObject) {
                    const clonedClip = await ClipClassType.fromObject(clipData)
                    clonedClip.absolutePositioned = selectedObject.clipPath.absolutePositioned
                    cloned.clipPath = clonedClip
                }
            }

            fabricCanvas.add(cloned)
            fabricCanvas.setActiveObject(cloned)
            fabricCanvas.renderAll()
        } catch (error) {
            console.error('Erro ao duplicar objeto:', error)
        }
    }

    const handleDelete = () => {
        if (!selectedObject || !fabricCanvas) return

        fabricCanvas.remove(selectedObject)
        fabricCanvas.renderAll()
    }

    const handleToggleLock = () => {
        if (!selectedObject || !fabricCanvas) return

        const isLocked = selectedObject.lockMovementX || false
        selectedObject.set({
            lockMovementX: !isLocked,
            lockMovementY: !isLocked,
            lockRotation: !isLocked,
            lockScalingX: !isLocked,
            lockScalingY: !isLocked,
            selectable: isLocked,
        })
        fabricCanvas.renderAll()
    }

    const handleBringToFront = () => {
        if (!selectedObject || !fabricCanvas) return
        fabricCanvas.bringToFront(selectedObject)
        fabricCanvas.renderAll()
    }

    const handleSendToBack = () => {
        if (!selectedObject || !fabricCanvas) return
        fabricCanvas.sendToBack(selectedObject)
        fabricCanvas.renderAll()
    }

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    {children}
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                    {selectedObject ? (
                        <>
                            <ContextMenuItem onClick={handleDuplicate}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar
                            </ContextMenuItem>

                            <ContextMenuItem onClick={handleDelete} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deletar
                            </ContextMenuItem>

                            <ContextMenuSeparator />

                            {/* ClipPath Controls */}
                            {selectedObject.type !== 'line' && selectedObject.type !== 'textbox' && selectedObject.type !== 'i-text' && !(selectedObject as any)._isClipShell && (
                                <>
                                    {hasClipPath && (
                                        <>
                                            <ContextMenuItem onClick={() => removeClipPath?.()} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remover Máscara
                                            </ContextMenuItem>
                                            <ContextMenuSeparator />
                                        </>
                                    )}
                                </>
                            )}



                            {/* Frame Image Controls */}
                            {isFrameImage && (
                                <>
                                    <ContextMenuItem onClick={() => removeFrameImage?.()} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remover da Moldura
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                </>
                            )}

                            <ContextMenuItem onClick={handleToggleLock}>
                                {selectedObject.lockMovementX ? (
                                    <><Unlock className="mr-2 h-4 w-4" /> Desbloquear</>
                                ) : (
                                    <><Lock className="mr-2 h-4 w-4" /> Bloquear</>
                                )}
                            </ContextMenuItem>

                            <ContextMenuSeparator />

                            <ContextMenuItem onClick={handleBringToFront}>
                                <MoveUp className="mr-2 h-4 w-4" />
                                Trazer para Frente
                            </ContextMenuItem>

                            <ContextMenuItem onClick={handleSendToBack}>
                                <MoveDown className="mr-2 h-4 w-4" />
                                Enviar para Trás
                            </ContextMenuItem>
                        </>
                    ) : (
                        <ContextMenuItem disabled>
                            Nenhum objeto selecionado
                        </ContextMenuItem>
                    )}
                </ContextMenuContent>
            </ContextMenu>

            {/* Dialog de Clipart */}
            <Dialog open={showClipartDialog} onOpenChange={setShowClipartDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Selecionar Imagem para Moldura</DialogTitle>
                    </DialogHeader>
                    <ClipartBrowser
                        onSelectImage={(imageUrl) => {
                            convertToImageFrame?.(imageUrl)
                            setShowClipartDialog(false)
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
