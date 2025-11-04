"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Loader2 } from "lucide-react"
import { usePixabayImages } from "@/hooks/usePixabayImages"
import { useUnsplashImages } from "@/hooks/useUnsplashImages"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ClipartBrowserProps {
  onSelectImage: (imageUrl: string) => void
}

export function ClipartBrowser({ onSelectImage }: ClipartBrowserProps) {
  const [pixabayQuery, setPixabayQuery] = useState("clipart")
  const [unsplashQuery, setUnsplashQuery] = useState("illustration")
  const [pixabaySearch, setPixabaySearch] = useState("clipart")
  const [unsplashSearch, setUnsplashSearch] = useState("illustration")

  const pixabay = usePixabayImages({ query: pixabaySearch, perPage: 30 })
  const unsplash = useUnsplashImages({ query: unsplashSearch, perPage: 30 })

  const handlePixabaySearch = () => {
    setPixabaySearch(pixabayQuery)
  }

  const handleUnsplashSearch = () => {
    setUnsplashSearch(unsplashQuery)
  }

  return (
    <div className="w-full h-full">
      <Tabs defaultValue="pixabay" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="pixabay" className="flex-1">Pixabay</TabsTrigger>
          <TabsTrigger value="unsplash" className="flex-1">Unsplash</TabsTrigger>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
