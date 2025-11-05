import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"

export interface FloatingMenuItemProps {
    trigger: React.ReactNode
    menuContent: React.ReactNode
    contentTitle?: string

}

export const FloatingMenuItem = ({ trigger, menuContent, contentTitle }: FloatingMenuItemProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {trigger}
            </PopoverTrigger>
            <PopoverContent className="overflow-hidden w-min" side="right" align="center">
                <div>
                    {contentTitle && (
                        <div className="px-4 py-2 border-b border-border bg-popover">
                            <h3 className="text-sm font-medium text-foreground">{contentTitle}</h3>
                        </div>
                    )}
                </div>
                {menuContent}
            </PopoverContent>
        </Popover>
    )
}