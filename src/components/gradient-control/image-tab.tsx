import { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { useImages } from "@/hooks/useImages";
import type { ColorConfig } from "@/stores/canva-store";
import { cn } from "@/lib/utils";

const ImageSkeleton = () => (
  <div className="grid grid-cols-3 gap-2">
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className="aspect-square rounded-md bg-muted animate-pulse"
      />
    ))}
  </div>
);

interface ImageTabProps {
  colorConfig: ColorConfig;
  setColorConfig: (config: ColorConfig) => void;
}

export const ImageTab = ({ colorConfig, setColorConfig }: ImageTabProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const {
    images,
    loading,
    fetching,
    error,
    page,
    hasMore,
    nextPage,
    prevPage,
    search,
  } = useImages({
    query: debouncedQuery,
    perPage: 18,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
      search(searchInput);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, search]);

  const handleSelectImage = (url: string) => {
    setColorConfig({ type: "image", value: url });
  };

  const selectedUrl = colorConfig.type === "image" ? colorConfig.value : null;

  return (
    <TabsContent
      value="image"
      className="mt-4 outline-none space-y-3 data-[state=inactive]:hidden"
      forceMount
    >
      {/* Search Input */}
      <div className="relative">
        <Icon
          icon={Search01Icon}
          size={16}
          className="absolute left-2.5 top-2.5 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Buscar imagens..."
          className="h-9 w-full rounded-md border bg-muted/50 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/70"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Images Grid */}
      <div className="min-h-[200px] ">
        {loading ? (
          <ImageSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            {error}
          </div>
        ) : images.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            Nenhuma imagem encontrada
          </div>
        ) : (
          <div className={cn("grid grid-cols-3 gap-2  overflow-y-auto",
            selectedUrl ? "max-h-[calc(100vh-435px)]" : "h-full"

          )}>
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => handleSelectImage(image.url)}
                className={cn(
                  "group relative aspect-square cursor-pointer overflow-hidden rounded-md bg-muted",
                  selectedUrl === image.url &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                <img
                  src={image.thumbnail}
                  alt={image.alt || "Image"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && images.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-2 relative">
          <button
            onClick={prevPage}
            disabled={page <= 1}
            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Icon icon={ArrowLeft01Icon} size={16} />
          </button>
          <span className="text-sm text-muted-foreground min-w-[24px] text-center">
            {page}
          </span>
          <button
            onClick={nextPage}
            disabled={!hasMore}
            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Icon icon={ArrowRight01Icon} size={16} />
          </button>
          {fetching && !loading && (
            <Icon
              icon={Loading03Icon}
              size={16}
              className="animate-spin absolute right-0 text-muted-foreground top-1/2 -translate-y-1/2"
            />
          )}
        </div>
      )}
    </TabsContent>
  );
};
