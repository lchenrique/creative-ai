import * as React from "react"
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useCanvasStore, type ElementsProps } from "@/stores/canva-store"
import { useUserUploads } from "@/hooks/useUserUploads"
import { useImages } from "@/hooks/useImages"
import { ImageSelector } from "@/components/@new/image-selector"

export function UploadsSidebar() {
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const { uploads, loading, uploadFile, deleteUpload } = useUserUploads()
    const [showImageSelector, setShowImageSelector] = React.useState(false)
    const [selectedImageUrl, setSelectedImageUrl] = React.useState("")

    // Fetch first 5 images
    const { images, loading: imagesLoading } = useImages({
        query: "",
        perPage: 5,
    })

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
                <h2 className="text-sm font-semibold tracking-tight">Imagens</h2>
                <button className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>

            {/* Upload Button */}
            <div className="p-4 border-b">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                            await uploadFile(file)
                            e.target.value = "" // Reset input
                        }
                    }}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-2 px-4 text-sm font-medium"
                >
                    <Upload className="h-4 w-4" />
                    Upload Image
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border p-4">
                <div className="flex flex-col gap-6">
                    {/* Images from Gallery */}
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                            Galeria
                        </h3>
                        {imagesLoading ? (
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-md bg-muted animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
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
                                    <span className="text-xs font-medium">Ver todas</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Uploads */}
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                            Meus Uploads
                        </h3>
                        {loading && uploads.length === 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-md bg-muted animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : uploads.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {uploads.map((upload) => (
                                    <UploadItem
                                        key={upload.id}
                                        src={upload.thumbnail_url}
                                        alt={upload.file_name}
                                        onClick={() => handleImageSelect(upload.file_url)}
                                        onDelete={async (e) => {
                                            e.stopPropagation()
                                            await deleteUpload(upload.id)
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="rounded-full bg-muted p-3 mb-3">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h4 className="text-xs font-medium mb-1">Nenhum upload ainda</h4>
                                <p className="text-[10px] text-muted-foreground mb-3">
                                    Faça upload das suas imagens
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-[10px] text-primary hover:underline"
                                >
                                    Fazer primeiro upload
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Selector Modal */}
            {showImageSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl h-full bg-background rounded-r-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Selecionar Imagem</h3>
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

function UploadItem({
    src,
    alt,
    onClick,
    onDelete
}: {
    src: string;
    alt: string;
    onClick?: () => void;
    onDelete?: (e: React.MouseEvent) => void;
}) {
    return (
        <div
            onClick={onClick}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-md bg-muted border border-border hover:border-primary transition-all"
        >
            <img
                src={src || "/placeholder.svg"}
                alt={alt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="absolute top-1 right-1 p-1.5 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive shadow-lg"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            )}
        </div>
    )
}

function ImageItem({ src, alt, onClick }: { src: string; alt: string; onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-md bg-muted border border-border hover:border-primary transition-all"
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
