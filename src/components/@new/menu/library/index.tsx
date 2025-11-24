
import * as React from "react"
import { Search, X, ChevronRight, ImageIcon, Type, Shapes, Sticker, Upload } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useCanvasStore, type ElementsProps } from "@/stores/canva-store"
import { useImages } from "@/hooks/useImages"
import { ImageSelector } from "@/components/@new/image-selector"

export function LibrarySidebar() {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        images: true,
        text: true,
        shapes: true,
        stickers: true,
        uploads: false,
    })
    const [showImageSelector, setShowImageSelector] = React.useState(false)
    const [selectedImageUrl, setSelectedImageUrl] = React.useState("")

    const addElement = useCanvasStore((s) => s.addElement)

    // Fetch first 5 images
    const { images, loading } = useImages({
        query: "",
        perPage: 5,
    })

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

    const handleImageSelect = (url: string) => {
        setSelectedImageUrl(url)

        // Add image element
        const currentElements = useCanvasStore.getState().elements
        const newId = Math.random().toString(36).substr(2, 9)

        // Create new image element
        const newElement: ElementsProps = {
            id: newId,
            type: "image",
            config: {
                size: { width: 300, height: 300 },
                position: { x: 0, y: 0 },
                style: {
                    backgroundColor: { type: "image", value: url },
                },
            },
        }

        // Add to store
        useCanvasStore.setState({
            elements: {
                ...currentElements,
                [newId]: newElement,
            },
        })

        setShowImageSelector(false)
    }

    const handleViewAllImages = () => {
        setShowImageSelector(true)
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

                    {/* Images Section */}
                    <Section
                        title="Images"
                        count={images.length}
                        icon={<ImageIcon className="h-4 w-4" />}
                        isExpanded={expandedSections.images}
                        onToggle={() => toggleSection("images")}
                    >
                        {loading ? (
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-md bg-muted animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {images.slice(0, 5).map((image) => (
                                    <ImageItem
                                        key={image.id}
                                        src={image.thumbnail}
                                        alt={image.alt || "Image"}
                                        onClick={() => handleImageSelect(image.url)}
                                    />
                                ))}
                                <div
                                    onClick={handleViewAllImages}
                                    className="flex aspect-square items-center justify-center rounded-md bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer border border-dashed border-border"
                                >
                                    <span className="text-xs font-medium">View all</span>
                                </div>
                            </div>
                        )}
                    </Section>

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

                    {/* Uploads Section */}
                    <Section
                        title="Uploads"
                        count={0}
                        icon={<Upload className="h-4 w-4" />}
                        isExpanded={expandedSections.uploads}
                        onToggle={() => toggleSection("uploads")}
                    >
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-8 text-center">
                            <div className="rounded-full bg-muted p-2 mb-2">
                                <Upload className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs font-medium">No uploads yet</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Click to upload files</p>
                        </div>
                    </Section>

                </div>
            </div>

            {/* Image Selector Modal */}
            {showImageSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl h-full bg-background rounded-r-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Select Image</h3>
                            <button
                                onClick={() => setShowImageSelector(false)}
                                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <ImageSelector
                            value={selectedImageUrl}
                            onChange={handleImageSelect}
                            className="h-full"
                            perPage={21}
                        />
                    </div>
                </div>
            )}
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

function ImageItem({ src, alt, onClick }: { src: string; alt: string; onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-md bg-muted"
        >
            <img
                src={src || "/placeholder.svg"}
                alt={alt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
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
