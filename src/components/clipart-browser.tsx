"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { usePixabayImages } from "@/hooks/usePixabayImages"
import { useUnsplashImages } from "@/hooks/useUnsplashImages"
import { useSupabaseClipartsV2 } from "@/hooks/useSupabaseClipartsV2"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ClipartBrowserProps {
  onSelectImage: (imageUrl: string) => void
}

export function ClipartBrowser({ onSelectImage }: ClipartBrowserProps) {
  const [pixabayQuery, setPixabayQuery] = useState("clipart")
  const [unsplashQuery, setUnsplashQuery] = useState("illustration")
  const [supabaseQuery, setSupabaseQuery] = useState("")
  const [pixabaySearch, setPixabaySearch] = useState("clipart")
  const [unsplashSearch, setUnsplashSearch] = useState("illustration")
  const [supabaseSearch, setSupabaseSearch] = useState("")
  const [pixabayPage, setPixabayPage] = useState(1)
  const [unsplashPage, setUnsplashPage] = useState(1)
  const [supabasePage, setSupabasePage] = useState(1)

  const pixabay = usePixabayImages({ query: pixabaySearch, page: pixabayPage, perPage: 30 })
  const unsplash = useUnsplashImages({ query: unsplashSearch, page: unsplashPage, perPage: 30 })
  const supabaseImages = useSupabaseClipartsV2({ page: supabasePage, pageSize: 30, search: supabaseSearch })

  const handlePixabaySearch = () => {
    setPixabaySearch(pixabayQuery)
    setPixabayPage(1)
  }

  const handleUnsplashSearch = () => {
    setUnsplashSearch(unsplashQuery)
    setUnsplashPage(1)
  }

  const handlePixabayNextPage = () => {
    if (pixabay.hasMore && !pixabay.loading) {
      setPixabayPage(prev => prev + 1)
    }
  }

  const handlePixabayPrevPage = () => {
    if (pixabayPage > 1) {
      setPixabayPage(prev => prev - 1)
    }
  }

  const handleUnsplashNextPage = () => {
    if (unsplash.hasMore && !unsplash.loading) {
      setUnsplashPage(prev => prev + 1)
    }
  }

  const handleUnsplashPrevPage = () => {
    if (unsplashPage > 1) {
      setUnsplashPage(prev => prev - 1)
    }
  }

  const handleSupabaseSearch = () => {
    setSupabaseSearch(supabaseQuery)
    setSupabasePage(1)
  }

  const handleSupabaseNextPage = () => {
    if (supabaseImages.hasMore && !supabaseImages.loading) {
      setSupabasePage(prev => prev + 1)
    }
  }

  const handleSupabasePrevPage = () => {
    if (supabasePage > 1) {
      setSupabasePage(prev => prev - 1)
    }
  }

  return (
    <div className="w-[300px] h-full">
      <Tabs defaultValue="pixabay" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="pixabay">Pixabay</TabsTrigger>
          <TabsTrigger value="unsplash">Unsplash</TabsTrigger>
          <TabsTrigger value="supabase">Minhas Imagens</TabsTrigger>
        </TabsList>

        {/* Pixabay Tab */}
        <TabsContent value="pixabay" className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar clipart..."
              value={pixabayQuery}
              onChange={(e) => setPixabayQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePixabaySearch()}
            />
            <Button onClick={handlePixabaySearch} size="icon" disabled={pixabay.loading}>
              {pixabay.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {pixabay.error && (
            <p className="text-sm text-destructive">{pixabay.error}</p>
          )}

          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-3 gap-2 p-1">
              {pixabay.images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => onSelectImage(image.largeImageURL)}
                  className="relative aspect-square overflow-hidden rounded-md border border-border hover:border-primary transition-colors group"
                >
                  <img
                    src={image.previewURL}
                    alt={image.tags}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </button>
              ))}
            </div>

            {pixabay.loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePixabayPrevPage}
              disabled={pixabayPage === 1 || pixabay.loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pixabayPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePixabayNextPage}
              disabled={!pixabay.hasMore || pixabay.loading}
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </TabsContent>

        {/* Unsplash Tab */}
        <TabsContent value="unsplash" className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar imagens..."
              value={unsplashQuery}
              onChange={(e) => setUnsplashQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnsplashSearch()}
            />
            <Button onClick={handleUnsplashSearch} size="icon" disabled={unsplash.loading}>
              {unsplash.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {unsplash.error && (
            <p className="text-sm text-destructive">{unsplash.error}</p>
          )}

          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-3 gap-2 p-1">
              {unsplash.images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => onSelectImage(image.urls.regular)}
                  className="relative aspect-square overflow-hidden rounded-md border border-border hover:border-primary transition-colors group"
                >
                  <img
                    src={image.urls.thumb}
                    alt={image.alt_description || image.description || 'Image'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </button>
              ))}
            </div>

            {unsplash.loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnsplashPrevPage}
              disabled={unsplashPage === 1 || unsplash.loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {unsplashPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnsplashNextPage}
              disabled={!unsplash.hasMore || unsplash.loading}
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </TabsContent>

        {/* Supabase Tab */}
        <TabsContent value="supabase" className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar minhas imagens..."
              value={supabaseQuery}
              onChange={(e) => setSupabaseQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSupabaseSearch()}
            />
            <Button onClick={handleSupabaseSearch} size="icon" disabled={supabaseImages.loading}>
              {supabaseImages.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {supabaseImages.error && (
            <p className="text-sm text-destructive">{supabaseImages.error}</p>
          )}

          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-3 gap-2 p-1">
              {/* {supabaseImages.categories.map((category) => (
                <button
                  key={image.name}
                  onClick={() => onSelectImage(image.url)}
                  className="relative aspect-square overflow-hidden rounded-md border border-border hover:border-primary transition-colors group"
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </button>
              ))} */}
            </div>

            {supabaseImages.loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* {!supabaseImages.loading && supabaseImages.images.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {supabaseQuery ? 'Nenhuma imagem encontrada' : 'Nenhuma imagem no storage'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Faça upload de imagens para o bucket "images"
                </p>
              </div>
            )} */}
          </ScrollArea>

          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSupabasePrevPage}
              disabled={supabasePage === 1 || supabaseImages.loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {supabasePage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSupabaseNextPage}
              disabled={!supabaseImages.hasMore || supabaseImages.loading}
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
