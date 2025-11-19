import GradientControl from "@/components/gradient-control"
import { useCanvasStore } from "@/stores/canva-store"

export const BackgroundController = () => {
    const backgroundColorConfig = useCanvasStore((state) => state.canvasBgColorConfig);
    const setCanvasBgColorConfig = useCanvasStore((state) => state.setCanvasBgColorConfig);


    return <div>

        <GradientControl
            colorConfig={backgroundColorConfig || { type: 'solid', value: '#FFFFFF' }}
            setColorConfig={(type, value) => {
                setCanvasBgColorConfig?.({ type, value })

            }}
        />

    </div>
}