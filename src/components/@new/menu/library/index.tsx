
import * as React from "react"
import { Search, X, ChevronRight, Type, Shapes, Sticker } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/stores/canva-store"

export function LibrarySidebar() {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        text: true,
        shapes: true,
        stickers: true,
    })

    const addElement = useCanvasStore((s) => s.addElement)

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }))
    }

    const handleAddText = (type: "heading" | "title" | "body") => {
        addElement?.("text", type)
    }

    const handleAddRectangle = () => {
        addElement?.("rectangle")
    }

    const handleAddCircle = () => {
        addElement?.("circle")
    }



    return (
        <div className="flex h-full w-full flex-col">
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b px-4">
                <h2 className="text-sm font-semibold tracking-tight">Library</h2>
                <button className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="h-9 w-full rounded-md border bg-muted/50 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/70"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
                <div className="flex flex-col gap-1 pb-4">

                    {/* Text Section */}
                    <Section
                        title="Text"
                        count={3}
                        icon={<Type className="h-4 w-4" />}
                        isExpanded={expandedSections.text}
                        onToggle={() => toggleSection("text")}
                    >
                        <div className="grid grid-cols-3 gap-2">
                            <TextItem
                                label="Heading"
                                className="text-lg font-bold"
                                onClick={() => handleAddText("heading")}
                            />

                            <TextItem
                                label="Title"
                                className="text-md font-semibold"
                                onClick={() => handleAddText("title")}
                            />

                            <TextItem
                                label="Body"
                                className="text-sm text-muted-foreground"
                                onClick={() => handleAddText("body")}
                            />
                        </div>

                    </Section>

                    {/* Shapes Section */}
                    <Section
                        title="Shapes"
                        count={1}
                        icon={<Shapes className="h-4 w-4" />}
                        isExpanded={expandedSections.shapes}
                        onToggle={() => toggleSection("shapes")}
                    >
                        <div className="grid grid-cols-4 gap-2">
                            <ShapeItem onClick={handleAddRectangle}><div className="h-6 w-6 bg-foreground" /></ShapeItem>
                            <ShapeItem onClick={handleAddCircle}><div className="h-6 w-6 bg-foreground rounded-full" /></ShapeItem>
                        </div>
                    </Section>

                    {/* Stickers Section */}
                    <Section
                        title="Stickers"
                        count={118}
                        icon={<Sticker className="h-4 w-4" />}
                        isExpanded={expandedSections.stickers}
                        onToggle={() => toggleSection("stickers")}
                    >
                        <div className="grid grid-cols-4 gap-2">
                            <StickerItem>📸</StickerItem>
                            <StickerItem>👽</StickerItem>
                            <StickerItem>🚀</StickerItem>
                            <StickerItem>👍</StickerItem>
                            <StickerItem>🔥</StickerItem>
                            <StickerItem>❤️</StickerItem>
                            <StickerItem>✨</StickerItem>
                            <StickerItem>🎉</StickerItem>
                        </div>
                    </Section>

                </div>
            </div>
        </div>
    )
}

function Section({
    title,
    count,
    icon,
    children,
    isExpanded,
    onToggle,
}: {
    title: string
    count: number
    icon?: React.ReactNode
    children: React.ReactNode
    isExpanded: boolean
    onToggle: () => void
}) {
    return (
        <div className="group">
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-accent/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-foreground/80 group-hover:text-foreground">
                    {/* {icon && <span className="text-muted-foreground group-hover:text-foreground transition-colors">{icon}</span>} */}
                    <span>{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{count}</span>
                    <ChevronRight
                        className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-90"
                        )}
                    />
                </div>
            </button>
            <div
                className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-2">{children}</div>
                </div>
            </div>
        </div>
    )
}



function TextItem({ label, className, onClick }: { label: string; className?: string; onClick?: () => void }) {
    return (
        <div
            className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border bg-card p-2 text-center shadow-sm transition-all hover:border-primary hover:shadow-md"
            onClick={onClick}
        >
            <span className={cn("text-foreground", className)}>{label}</span>
        </div>
    )
}

function ShapeItem({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <div
            className="flex aspect-square cursor-pointer items-center justify-center rounded-md bg-muted/30 text-foreground transition-colors hover:bg-muted hover:text-primary"
            onClick={onClick}
        >
            {children}
        </div>
    )
}

function StickerItem({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex aspect-square cursor-pointer items-center justify-center rounded-md bg-muted/30 text-2xl transition-transform hover:scale-110 hover:bg-muted">
            {children}
        </div>
    )
}
