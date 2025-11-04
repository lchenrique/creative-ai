import React, { useState, useCallback, useRef } from "react";
import { ColorConfig } from "@/store/minisite-store";
import { usePixabayVideos } from "@/hooks/usePixabayVideos";
import { TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTabProps {
  colorConfig: ColorConfig;
  setColorConfig: React.Dispatch<React.SetStateAction<ColorConfig>>;
}

export default function VideoTab({ colorConfig, setColorConfig }: VideoTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("nature");
  
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
  ];
  
  const currentQuery = searchQuery.trim() || selectedCategory;
  
  const { videos, loading, error, searchVideos, loadMore, hasMore } = usePixabayVideos({
    query: currentQuery,
    perPage: 12
  });

  const selectVideo = useCallback((url: string) => {
    setColorConfig((prev) => ({
      ...prev,
      colorType: "video",
      video: url,
      image: null,
    }));
  }, [setColorConfig]);

  const removeVideo = useCallback(() => {
    setColorConfig((prev) => ({
      ...prev,
      colorType: "solid",
      video: null,
    }));
  }, [setColorConfig]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
    searchVideos(category, 1);
  }, [searchVideos]);

  const handleCustomSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchVideos(query, 1);
    }
  }, [searchVideos]);

  // Filtrar apenas vídeos válidos
  const filteredVideos = videos.filter((v: any) => v.videos && v.videos.large?.url);

  return (
    <TabsContent value="video" className="space-y-3 pt-3">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Vídeo de Fundo</Label>
        
        {/* Preview do vídeo atual */}
        {colorConfig.video && (
          <div className="space-y-2">
            <div className="relative">
              <video
                src={colorConfig.video}
                className="w-full h-32 object-cover rounded-lg border"
                autoPlay
                loop
                muted
                playsInline
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeVideo}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

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

        {/* Grid de vídeos */}
        <RadioGroup
          value={colorConfig.video || ""}
          onValueChange={selectVideo}
          className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
              Carregando vídeos...
            </div>
          ) : error ? (
            <div className="col-span-2 text-center py-8 text-destructive text-sm">
              {error}
            </div>
          ) : filteredVideos.length > 0 ? (
            <>
              {filteredVideos.map((video) => {
                const videoId = video.id.toString();
                const videoUrl = video.videos.large.url;
                const thumbUrl = video.videos.tiny.url;
                return (
                  <div key={videoId} className="relative">
                    <RadioGroupItem
                      value={videoUrl}
                      id={videoId}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={videoId}
                      className={cn(
                        "relative block w-full h-20 rounded-md overflow-hidden border-2 transition-all cursor-pointer",
                        "hover:scale-105 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                        "peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2",
                        colorConfig.video === videoUrl && "ring-2 ring-primary ring-offset-2 border-primary"
                      )}
                      tabIndex={0}
                      role="button"
                      aria-label={`Selecionar vídeo`}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          selectVideo(videoUrl);
                        }
                      }}
                    >
                      <video
                        src={thumbUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                      {/* Indicador de seleção */}
                      {colorConfig.video === videoUrl && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                );
              })}
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
              Nenhum vídeo encontrado
            </div>
          )}
        </RadioGroup>

        <div className="text-xs text-muted-foreground">
          <p>• Vídeos do Pixabay - Gratuitos para uso</p>
        </div>
      </div>
    </TabsContent>
  );
} 