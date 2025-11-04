import { useCallback, useRef, useState } from "react"
import { Image as ImageIcon, Trash2, Search, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUnsplashImages } from "@/hooks/useUnsplashImages"
import { usePixabayImages } from "@/hooks/usePixabayImages"
import { cn } from "@/lib/utils"
import type { ColorConfig } from "."

interface ImageTabProps {
    colorConfig: ColorConfig
    setColorConfig: React.Dispatch<React.SetStateAction<ColorConfig>>
}

export const ImageTab = ({ colorConfig, setColorConfig }: ImageTabProps) => {
    const imageInputRef = useRef<HTMLInputElement>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("nature")
    const [activeTab, setActiveTab] = useState("upload")
    const [selectedProvider, setSelectedProvider] = useState("unsplash")
    
    // Categorias predefinidas
    const categories = [
        { id: "nature", name: "Natureza", icon: "🌿" },
        { id: "city", name: "Cidade", icon: "🏙️" },
        { id: "abstract", name: "Abstrato", icon: "🎨" },
        { id: "minimal", name: "Minimalista", icon: "⚪" },
        { id: "gradient", name: "Gradientes", icon: "🌈" },
        { id: "texture", name: "Texturas", icon: "🧱" },
        { id: "space", name: "Espaço", icon: "🌌" },
        { id: "ocean", name: "Oceano", icon: "🌊" },
        { id: "forest", name: "Floresta", icon: "🌲" },
        { id: "mountains", name: "Montanhas", icon: "⛰️" },
        { id: "sunset", name: "Pôr do Sol", icon: "🌅" },
        { id: "night", name: "Noite", icon: "🌙" }
    ]
    
    const currentQuery = searchQuery.trim() || selectedCategory
    
    const { images: unsplashImages, loading: unsplashLoading, error: unsplashError, hasMore: unsplashHasMore, searchImages: searchUnsplash, loadMore: loadMoreUnsplash } = useUnsplashImages({
        query: currentQuery,
        perPage: 12
    })
    
    const { images: pixabayImages, loading: pixabayLoading, error: pixabayError, hasMore: pixabayHasMore, searchImages: searchPixabay, loadMore: loadMorePixabay } = usePixabayImages({
        query: currentQuery,
        perPage: 12
    })
    
    // Usar o provider selecionado
    const images = selectedProvider === "unsplash" ? unsplashImages : pixabayImages
    const loading = selectedProvider === "unsplash" ? unsplashLoading : pixabayLoading
    const error = selectedProvider === "unsplash" ? unsplashError : pixabayError
    const hasMore = selectedProvider === "unsplash" ? unsplashHasMore : pixabayHasMore
    const searchImages = selectedProvider === "unsplash" ? searchUnsplash : searchPixabay
    const loadMore = selectedProvider === "unsplash" ? loadMoreUnsplash : loadMorePixabay

    const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                setColorConfig((prev) => ({
                    ...prev,
                    colorType: "image",
                    image: result,
                }))
            }
            reader.readAsDataURL(file)
        }
    }, [setColorConfig])

    const removeImage = useCallback(() => {
        setColorConfig((prev) => ({
            ...prev,
            colorType: "solid",
            image: null,
        }))
    }, [setColorConfig])

    const selectImage = useCallback((imageUrl: string) => {
        setColorConfig((prev) => ({
            ...prev,
            colorType: "image",
            image: imageUrl,
            video: null, // Limpa vídeo ao selecionar imagem
        }))
    }, [setColorConfig])

    const handleCategoryChange = useCallback((category: string) => {
        setSelectedCategory(category)
        setSearchQuery("")
        searchImages(category, 1)
    }, [searchImages])

    const handleCustomSearch = useCallback((query: string) => {
        setSearchQuery(query)
        if (query.trim()) {
            searchImages(query, 1)
        }
    }, [searchImages])

    // Filtrar apenas imagens válidas (Pixabay pode retornar vídeos se a API mudar)
    const filteredImages = images.filter((img: any) => {
        // Unsplash sempre imagem, Pixabay: garantir que não tem campo 'videos'
        return !img.videos;
    });

    return (
        <TabsContent value="image" className="space-y-3 pt-3">
            <div className="space-y-2">
                <Label className="text-sm font-medium">Imagem de Fundo</Label>
                
                {/* Preview da imagem atual */}
                {colorConfig.image && (
                    <div className="space-y-2">
                        <div className="relative">
                            <img 
                                src={colorConfig.image} 
                                alt="Background preview" 
                                className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={removeImage}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Abas de Upload e Busca */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
                        <TabsTrigger value="search" className="text-xs">Buscar</TabsTrigger>
                    </TabsList>

                    {/* Aba de Upload */}
                    <TabsContent value="upload" className="space-y-2 pt-2">
                        <input 
                            ref={imageInputRef} 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            className="hidden" 
                        />
                        <Button
                            variant="outline"
                            className="w-full h-20 border-dashed"
                            onClick={() => imageInputRef.current?.click()}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {colorConfig.image ? 'Trocar imagem' : 'Selecionar imagem'}
                                </span>
                            </div>
                        </Button>

                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>• Formatos suportados: JPG, PNG, GIF, WebP</p>
                            <p>• Tamanho recomendado: 1920x1080px</p>
                            <p>• Tamanho máximo: 5MB</p>
                        </div>
                    </TabsContent>

                    {/* Aba de Busca */}
                    <TabsContent value="search" className="space-y-2 pt-2">
                        {/* Seleção de Provider */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Fonte de imagens</Label>
                            <RadioGroup
                                value={selectedProvider}
                                onValueChange={setSelectedProvider}
                                className="flex gap-2"
                            >
                                <div className="relative">
                                    <RadioGroupItem
                                        value="unsplash"
                                        id="unsplash"
                                        className="peer sr-only"
                                    />
                                    <label
                                        htmlFor="unsplash"
                                        className={cn(
                                            "relative flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all",
                                            "hover:bg-accent",
                                            selectedProvider === "unsplash"
                                                ? "ring-2 ring-primary ring-offset-2 bg-primary/10 border-primary"
                                                : "hover:border-primary/50"
                                        )}
                                    >
                                        <span className="text-sm font-medium">Unsplash</span>
                                        {/* Indicador de seleção */}
                                        {selectedProvider === "unsplash" && (
                                            <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                </div>
                                <div className="relative">
                                    <RadioGroupItem
                                        value="pixabay"
                                        id="pixabay"
                                        className="peer sr-only"
                                    />
                                    <label
                                        htmlFor="pixabay"
                                        className={cn(
                                            "relative flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all",
                                            "hover:bg-accent",
                                            selectedProvider === "pixabay"
                                                ? "ring-2 ring-primary ring-offset-2 bg-primary/10 border-primary"
                                                : "hover:border-primary/50"
                                        )}
                                    >
                                        <span className="text-sm font-medium">Pixabay</span>
                                        {/* Indicador de seleção */}
                                        {selectedProvider === "pixabay" && (
                                            <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Categorias predefinidas */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Categorias</Label>
                            <RadioGroup
                                value={selectedCategory}
                                onValueChange={handleCategoryChange}
                                className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                            >
                                {categories.map((category) => (
                                    <div key={category.id} className="relative flex-shrink-0">
                                        <RadioGroupItem
                                            value={category.id}
                                            id={category.id}
                                            className="peer sr-only"
                                        />
                                        <label
                                            htmlFor={category.id}
                                            className={cn(
                                                "relative flex flex-col items-center gap-1 px-3 py-3 min-w-[80px] h-16 rounded-md border cursor-pointer transition-all",
                                                "hover:bg-accent hover:scale-105",
                                                selectedCategory === category.id
                                                    ? "ring-2 ring-primary ring-offset-2 bg-primary/10 border-primary"
                                                    : "hover:border-primary/50",
                                                "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                                            )}
                                        >
                                            <span className="text-lg">{category.icon}</span>
                                            <span className="text-xs font-medium text-center">
                                                {category.name}
                                            </span>
                                            {/* Indicador de seleção */}
                                            {selectedCategory === category.id && (
                                                <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Campo de busca personalizada */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Busca personalizada</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Digite sua busca..."
                                    value={searchQuery}
                                    onChange={(e) => handleCustomSearch(e.target.value)}
                                    className="pl-9 h-8 text-sm"
                                />
                            </div>
                        </div>

                        {/* Grid de imagens */}
                        <RadioGroup
                            value={colorConfig.image || ""}
                            onValueChange={(value) => selectImage(value)}
                            className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto"
                        >
                            {loading ? (
                                <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
                                    Carregando imagens...
                                </div>
                            ) : error ? (
                                <div className="col-span-2 text-center py-8 text-destructive text-sm">
                                    {error}
                                </div>
                            ) : filteredImages.length > 0 ? (
                                <>
                                    {filteredImages.map((image) => {
                                        // Adaptar para diferentes formatos de API
                                        const imageId = typeof image.id === 'string' ? image.id : image.id.toString()
                                        
                                        // Verificar se a imagem tem as propriedades necessárias
                                        if (!image) return null
                                        
                                        const imageUrl = selectedProvider === 'unsplash' 
                                            ? (image as any)?.urls?.full || ''
                                            : (image as any)?.largeImageURL || ''
                                        const thumbnailUrl = selectedProvider === 'unsplash'
                                            ? (image as any)?.urls?.thumb || ''
                                            : (image as any)?.previewURL || ''
                                        const imageDescription = selectedProvider === 'unsplash'
                                            ? (image as any)?.alt_description || (image as any)?.description || 'Imagem'
                                            : (image as any)?.tags || 'Imagem'
                                        const photographerUrl = selectedProvider === 'unsplash'
                                            ? (image as any)?.links?.html || '#'
                                            : (image as any)?.pageURL || '#'
                                        
                                        // Pular se não temos URL válida
                                        if (!imageUrl) return null
                                        
                                        return (
                                        <div key={imageId} className="relative">
                                            <RadioGroupItem
                                                value={imageUrl}
                                                id={imageId}
                                                className="peer sr-only"
                                            />
                                            <label
                                                htmlFor={imageId}
                                                className={cn(
                                                    "relative block w-full h-20 rounded-md overflow-hidden border-2 transition-all cursor-pointer",
                                                    "hover:scale-105 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                                                    "peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2",
                                                    colorConfig.image === imageUrl && "ring-2 ring-primary ring-offset-2 border-primary"
                                                )}
                                                tabIndex={0}
                                                role="button"
                                                aria-label={`Selecionar imagem`}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        selectImage(imageUrl)
                                                    }
                                                }}
                                            >
                                                <img
                                                    src={thumbnailUrl}
                                                    alt="Imagem de fundo"
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Indicador de seleção */}
                                                {colorConfig.image === imageUrl && (
                                                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    )})}
                                    
                                    {hasMore && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={loadMore}
                                            className="col-span-2 mt-2"
                                        >
                                            Carregar mais
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
                                    Nenhuma imagem encontrada
                                </div>
                            )}
                        </RadioGroup>

                        <div className="text-xs text-muted-foreground">
                            <p>• Imagens do Unsplash - Gratuitas para uso</p>
                            <p>• Clique no ícone para ver os créditos</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </TabsContent>
    )
} 