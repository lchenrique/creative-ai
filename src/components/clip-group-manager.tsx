import { Button } from "@/components/ui/button"
import { useCreativeStore } from "@/stores/creative-store"
import { LogOut, Edit } from "lucide-react"
import { useState, useEffect } from "react"

export function ClipGroupManager() {
    const fabricCanvas = useCreativeStore((state) => state.fabricCanvas)
    const [isEditingClip, setIsEditingClip] = useState(false)
    const [currentClipGroup, setCurrentClipGroup] = useState<any>(null)

    useEffect(() => {
        if (!fabricCanvas) return

        const handleSelection = () => {
            const activeObject = fabricCanvas.getActiveObject()

            // Verifica se está editando um clip group
            const isInEditMode = (activeObject as any)?._isClipGroupEditMode
            setIsEditingClip(isInEditMode || false)

            if (isInEditMode) {
                setCurrentClipGroup(activeObject)
            } else {
                setCurrentClipGroup(null)
            }
        }

        fabricCanvas.on('selection:created', handleSelection)
        fabricCanvas.on('selection:updated', handleSelection)
        fabricCanvas.on('selection:cleared', () => {
            setIsEditingClip(false)
            setCurrentClipGroup(null)
        })

        return () => {
            fabricCanvas.off('selection:created', handleSelection)
            fabricCanvas.off('selection:updated', handleSelection)
            fabricCanvas.off('selection:cleared')
        }
    }, [fabricCanvas])

    const exitEditMode = () => {
        if (!fabricCanvas || !currentClipGroup) return

        const exitClipGroupEditMode = useCreativeStore.getState().exitClipGroupEditMode
        if (exitClipGroupEditMode) {
            exitClipGroupEditMode()
            setIsEditingClip(false)
            setCurrentClipGroup(null)
        }
    }

    if (!isEditingClip || !currentClipGroup) {
        return null
    }

    return (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    <span className="font-medium text-sm">
                        Modo de Edição - Clip Group
                    </span>
                </div>

                <div className="h-6 w-px bg-primary-foreground/30" />

                <span className="text-xs opacity-80">
                    {currentClipGroup._objects?.length || 0} objetos dentro
                </span>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={exitEditMode}
                    className="ml-2"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair do Modo de Edição
                </Button>
            </div>
        </div>
    )
}
