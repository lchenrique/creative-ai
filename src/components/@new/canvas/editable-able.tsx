import { type MoveableManagerInterface } from "react-moveable";
import { Button } from "@creative-ds/ui";
import { DotsThreeVertical, Trash } from "@phosphor-icons/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditableProps {
    onDelete?: (elementId: string) => void;
}

export const Editable = {
    name: "editable",
    props: ["onDelete"] as const,
    events: [],
    render(moveable: MoveableManagerInterface<EditableProps, any>) {
        const rect = moveable.getRect();
        const { pos2 } = moveable.state;
        const props = moveable.props;

        const handleDelete = () => {
            const target = moveable.getTargets()[0];
            const elementId = target?.getAttribute?.("data-element-id");
            if (elementId && props.onDelete) {
                props.onDelete(elementId);
            }
        };

        return (
            <div
                data-slot="floating-menu-content"
                key="editable-viewer"
                className="moveable-editable absolute flex flex-col gap-2 left-0 top-0 will-change-transform"
                style={{
                    transformOrigin: "0px 0px",
                    transform: `translate(${pos2[0]}px, ${pos2[1]}px) rotate(${rect.rotation}deg) translate(10px)`,
                }}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7 bg-background/80 backdrop-blur-sm shadow-sm border">
                            <DotsThreeVertical weight="bold" className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        sideOffset={4}
                        data-slot="floating-menu-content"
                    >
                        <DropdownMenuItem
                            onClick={handleDelete}
                            variant="destructive"
                        >
                            <Trash className="h-4 w-4" />
                            Deletar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    },
} as const;
