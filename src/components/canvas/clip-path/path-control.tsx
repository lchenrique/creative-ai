import { type MoveableManagerInterface } from "react-moveable";
import { Button } from "@creative-ds/ui";
import { Minus, Plus } from "lucide-react";
import { polygonToPoints } from "@/lib/utils";
import { useEffect } from "react";


const Editable = {
    name: "editable",
    props: [],
    events: ["add"],
    render(moveable: MoveableManagerInterface<any, any>) {
        const rect = moveable.getRect();
        const { pos1, pos2 } = moveable.state;
        const handleAdd = () => {
            moveable.triggerEvent("add", {
                id: moveable.getTargets()[0].attributes.item(0)?.value || "",
                points: moveable.getTargets()[0].style.clipPath ? polygonToPoints(moveable.getTargets()[0].style.clipPath || "") : [
                    { x: pos1[0], y: pos1[0] },
                    { x: pos1[0] + rect.width, y: pos1[1] },
                    { x: pos1[0] + rect.width, y: pos1[1] + rect.height },
                    { x: pos1[0], y: pos1[1] + rect.height },
                ]
            });
        }


        return <div
            data-slot="floating-menu-content"
            key={"editable-viewer"}
            className={"moveable-editable absolute flex flex-col gap-2 left-0 top-0 will-change-transform "}

            style={{
                transformOrigin: "0px 0px",
                transform: `translate(${pos2[0]}px, ${pos2[1]}px) rotate(${rect.rotation}deg) translate(10px)`,
            }}>
            <Button
                size="icon"
                variant="secondary"
                onClick={() => {
                    handleAdd()
                }}><Plus /></Button>
            <Button
                size="icon"
                variant="secondary"
                onClick={() => {
                    alert("-");
                }}><Minus /></Button>
        </div>;
    },
} as const;

export { Editable };