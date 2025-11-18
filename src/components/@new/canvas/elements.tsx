import { FloatingMenuItem } from "@/components/floating-menu/floating-menu-item";
import { ShapeControls } from "@/components/shape-controls";
import { useCanvasStore, type ElementConfig, type ElementsProps } from "@/stores/canva-store";
import { Button } from "@creative-ds/ui";
import { PlusIcon, ShapesIcon, TextTIcon } from "@phosphor-icons/react";
import { CircleIcon } from "lucide-react";
import { useEffect } from "react";


interface ElemetsComponentProps {
    selectedIds?: string[];
}

interface ElementProps {
    element: ElementsProps;
}

const Element = ({ element }: ElementProps) => {

    if (!element) return null

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                left: element.config.position.x,
                top: element.config.position.y,
                backgroundImage: element.config.style.backgroundColor?.type === "gradient"
                    ? element.config.style.backgroundColor?.value
                    : undefined,
                backgroundColor: element.config.style.backgroundColor?.type === "solid"
                    ? element.config.style.backgroundColor?.value
                    : undefined,
                backgroundSize: element.config.style.backgroundColor?.type === "gradient"
                    ? "100% 100%"
                    : "cover",
                backgroundRepeat: "no-repeat",
                backgroundOrigin: "content-box",
            }}
        />)

}

export const Elements = ({ selectedIds }: ElemetsComponentProps) => {
    const elements = useCanvasStore((state) => state.elements);
    const setSelected = useCanvasStore((state) => state.setSelected);

    useEffect(() => {
        setSelected(elements.filter(el => selectedIds?.includes(el.id)));
    }, [selectedIds]);



    return <>
        <div className="elements selecto-area gap-2 ">

            {elements.map((element) => {

                return (
                    <div
                        data-element-id={element.id}
                        className="cube absolute group size-30 bg-blue-300" key={element.id}>

                        <Element element={element} />
                    </div>
                )
            })}
        </div>
        <div className="empty elements"></div>
    </>
}



export const Menu = () => {
    const addElement = useCanvasStore((s) => s.addElement);

    const selectedElements = useCanvasStore((s) => s.selected);

    return (
        <div

            data-slot="floating-menu-content"

            className="flex gap-2 absolute top-0 left-0 bg-background z-9999  w-full">
            <FloatingMenuItem
                contentTitle="Adicionar Objetos"
                trigger={<PlusIcon />}
                menuContent={
                    <div className=" space-y-2 max-h-[500px] overflow-y-auto [&>div]:w-full [&>div>button>span]:flex">
                        <Button
                            onClick={() => addElement?.("text")}
                            className="flex justify-start w-full "
                        >
                            <TextTIcon className="w-4 h-4 mr-2" />
                            Texto
                        </Button>
                        <Button
                            onClick={() => addElement?.("rectangle")}
                            className="w-full justify-start"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Retângulo
                        </Button>
                        <Button
                            onClick={() => addElement?.("circle")}
                            className="w-full justify-start"
                        >
                            <CircleIcon className="w-4 h-4 mr-2" />
                            Círculo
                        </Button>
                        {/* <Button
                            onClick={() => addElement?.("triangle")}
                            className="w-full justify-start"
                        >
                            <TriangleIcon className="w-4 h-4 mr-2" />
                            Triângulo
                        </Button> */}
                        {/* <Button onClick={() => addLine()} className="w-full justify-start">
                            <MinusIcon className="w-4 h-4 mr-2" />
                            Linha
                        </Button> */}
                    </div>
                }
            />


            <FloatingMenuItem
                contentTitle="Controles de Elemento"
                trigger={<ShapesIcon />}
                menuContent={<ShapeControls />}
                open={selectedElements.length > 0 ? selectedElements.find(e => e.type === 'rectangle') !== undefined : false}
            />

        </div>
    )

}
