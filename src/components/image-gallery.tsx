import { useState, useCallback, useEffect, useRef } from "react";
import { Search, ImageIcon, Loader2, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSupabaseClipartsV2 } from "@/hooks/useSupabaseClipartsV2";
import { useUnsplashImages } from "@/hooks/useUnsplashImages";
import { usePixabayImages } from "@/hooks/usePixabayImages";
import { cn } from "@/lib/utils";
import { useCreativeStore } from "@/stores/creative-store";
import { Pagination } from "@/components/pagination";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

interface UserUpload {
  name: string;
  url: string;
  created_at: string;
}

export const ImageGallery = () => {
  const [activeTab, setActiveTab] = useState<
    "cliparts" | "unsplash" | "pixabay" | "uploads"
  >("cliparts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [clipartsPage, setClipartsPage] = useState(1);
  const [unsplashPage, setUnsplashPage] = useState(1);
  const [pixabayPage, setPixabayPage] = useState(1);

  // Estados para uploads do usuário
  const [userUploads, setUserUploads] = useState<UserUpload[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const addClipartToCanvas = useCreativeStore(
    (state) => state.addClipartToCanvas,
  );
  const addImageToCanvas = useCreativeStore((state) => state.addImageToCanvas);

  const itemsPerPage = 12;

  // Supabase Cliparts V2 (SVG da tabela)
  const {
    cliparts,
    loading: clipartsLoading,
    error: clipartsError,
    categories: clipartCategories,
    total: totalCliparts,
    hasMore: hasMoreCliparts,
  } = useSupabaseClipartsV2({
    search: searchQuery,
    category: selectedCategory,
    page: clipartsPage,
    pageSize: itemsPerPage,
  });

  // Unsplash Images
  const {
    images: unsplashImages,
    loading: unsplashLoading,
    error: unsplashError,
    hasMore: unsplashHasMore,
    searchImages: searchUnsplash,
  } = useUnsplashImages({
    query: searchQuery || "design",
    page: unsplashPage,
    perPage: itemsPerPage,
  });

  // Pixabay Images
  const {
    images: pixabayImages,
    loading: pixabayLoading,
    error: pixabayError,
    hasMore: pixabayHasMore,
    searchImages: searchPixabay,
  } = usePixabayImages({
    query: searchQuery || "design",
    page: pixabayPage,
    perPage: itemsPerPage,
  });

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setClipartsPage(1);
    setUnsplashPage(1);
    setPixabayPage(1);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
    setClipartsPage(1);
  }, []);

  const handleClipartClick = useCallback(
    async (url: string) => {
      try {
        // Tentar baixar como blob primeiro
        const response = await fetch(url);
        const blob = await response.blob();
        const contentType = blob.type;
        const blobSize = blob.size;


        // Se for imagem PNG/JPG, adicionar como imagem normal
        if (
          contentType.includes("image/png") ||
          contentType.includes("image/jpeg") ||
          contentType.includes("image/jpg")
        ) {
          addImageToCanvas?.(url);
          return;
        }

        // Converter blob para texto
        const svgText = await blob.text();
        console.log(
          "SVG Text (primeiros 200 chars):",
          svgText.substring(0, 200),
        );

        // Validar se é SVG válido
        if (!svgText.trim().startsWith("<") || !svgText.includes("svg")) {
          alert("Erro: O arquivo não contém um SVG válido");
          return;
        }

        // SVG válido - adicionar ao canvas
        addClipartToCanvas?.(svgText, url);
      } catch (error) {
        alert(
          "Erro ao carregar clipart: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
        );
      }
    },
    [addClipartToCanvas, addImageToCanvas],
  );

  const handleImageClick = useCallback(
    (url: string) => {
      addImageToCanvas?.(url);
    },
    [addImageToCanvas],
  );

  // Funções de paginação para Cliparts
  const goToNextPageCliparts = () => {
    setClipartsPage((prev) => prev + 1);
  };

  const goToPrevPageCliparts = () => {
    setClipartsPage((prev) => Math.max(1, prev - 1));
  };

  // Funções de paginação para Unsplash
  const goToNextPageUnsplash = () => {
    setUnsplashPage((prev) => prev + 1);
  };

  const goToPrevPageUnsplash = () => {
    setUnsplashPage((prev) => Math.max(1, prev - 1));
  };

  // Funções de paginação para Pixabay
  const goToNextPagePixabay = () => {
    setPixabayPage((prev) => prev + 1);
  };

  const goToPrevPagePixabay = () => {
    setPixabayPage((prev) => Math.max(1, prev - 1));
  };

  // Calcular total de páginas
  const totalPagesCliparts = Math.ceil(totalCliparts / itemsPerPage);
  const canGoNextCliparts = hasMoreCliparts;
  const canGoPrevCliparts = clipartsPage > 1;

  const canGoNextUnsplash = unsplashHasMore;
  const canGoPrevUnsplash = unsplashPage > 1;

  const canGoNextPixabay = pixabayHasMore;
  const canGoPrevPixabay = pixabayPage > 1;

  // Função para carregar uploads do usuário
  const loadUserUploads = useCallback(async () => {
    if (!user) {
      setUserUploads([]);
      return;
    }

    setUploadsLoading(true);
    setUploadError(null);

    try {
      const folderPath = `images/${user.id}`;

      const { data, error } = await supabase.storage
        .from("cliparts")
        .list(folderPath, {
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      const uploads: UserUpload[] = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from("cliparts")
            .getPublicUrl(`${folderPath}/${file.name}`);

          return {
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at || "",
          };
        }),
      );

      setUserUploads(uploads);
    } catch (error) {
      setUploadError("Erro ao carregar suas imagens");
    } finally {
      setUploadsLoading(false);
    }
  }, [user]);

  // Função para fazer upload de múltiplas imagens
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
    ];

    // Validar todos os arquivos antes de fazer upload
    const filesArray = Array.from(files);
    const invalidFiles = filesArray.filter(
      (file) => !validTypes.includes(file.type),
    );
    const oversizedFiles = filesArray.filter(
      (file) => file.size > 5 * 1024 * 1024,
    );

    if (invalidFiles.length > 0) {
      alert(
        `${invalidFiles.length} arquivo(s) com tipo inválido. Use PNG, JPG, WEBP ou SVG.`,
      );
      return;
    }

    if (oversizedFiles.length > 0) {
      alert(
        `${oversizedFiles.length} arquivo(s) muito grande(s). Tamanho máximo: 5MB por arquivo`,
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      let uploadedCount = 0;
      let failedCount = 0;

      // Upload de todos os arquivos em paralelo
      const uploadPromises = filesArray.map(async (file) => {
        try {
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
          const filePath = `images/${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("cliparts")
            .upload(filePath, file);

          if (uploadError) throw uploadError;
          uploadedCount++;
        } catch (error) {
          failedCount++;
        }
      });

      await Promise.all(uploadPromises);

      // Recarregar lista de uploads
      await loadUserUploads();

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Mostrar resultado
      if (failedCount === 0) {
        alert(`${uploadedCount} arquivo(s) enviado(s) com sucesso!`);
      } else {
        alert(
          `${uploadedCount} arquivo(s) enviado(s) com sucesso. ${failedCount} arquivo(s) falharam.`,
        );
      }
    } catch (error) {
      setUploadError("Erro ao fazer upload das imagens");
    } finally {
      setIsUploading(false);
    }
  };

  // Função para deletar imagem
  const handleDeleteUpload = async (fileName: string) => {
    if (!user) return;

    if (!confirm("Deseja realmente deletar esta imagem?")) return;

    try {
      const filePath = `images/${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from("cliparts")
        .remove([filePath]);

      if (error) throw error;

      // Recarregar lista
      await loadUserUploads();
    } catch (error) {
      alert("Erro ao deletar imagem");
    }
  };

  // Trigger search quando mudar página
  useEffect(() => {
    if (activeTab === "unsplash") {
      searchUnsplash(searchQuery || "design", unsplashPage);
    }
  }, [unsplashPage]);

  useEffect(() => {
    if (activeTab === "pixabay") {
      searchPixabay(searchQuery || "design", pixabayPage);
    }
  }, [pixabayPage]);

  // Carregar uploads quando mudar para aba de uploads
  useEffect(() => {
    if (activeTab === "uploads") {
      loadUserUploads();
    }
  }, [activeTab, loadUserUploads]);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Galeria de Imagens
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tabs para selecionar fonte */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="uploads" className="text-xs">
              Meus Uploads
            </TabsTrigger>
            <TabsTrigger value="cliparts" className="text-xs">
              Cliparts SVG
            </TabsTrigger>
            <TabsTrigger value="unsplash" className="text-xs">
              Unsplash
            </TabsTrigger>
            <TabsTrigger value="pixabay" className="text-xs">
              Pixabay
            </TabsTrigger>
          </TabsList>

          {/* Tab: Meus Uploads */}
          <TabsContent value="uploads" className="space-y-3 mt-3">
            {!user ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Faça login para fazer upload de suas próprias imagens
              </div>
            ) : (
              <>
                {/* Botão de Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Enviar Imagem</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Enviar Imagens
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: PNG, JPG, WEBP, SVG (máx 5MB cada). Você
                    pode selecionar múltiplos arquivos.
                  </p>
                </div>

                {/* Mensagem de Erro */}
                {uploadError && (
                  <div className="text-center py-2 text-destructive text-sm">
                    {uploadError}
                  </div>
                )}

                {/* Grid de Imagens do Usuário */}
                <div className="space-y-2">
                  {uploadsLoading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Carregando suas imagens...
                    </div>
                  ) : userUploads.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {userUploads.map((upload) => (
                        <div key={upload.name} className="relative group">
                          <button
                            onClick={() => handleImageClick(upload.url)}
                            className={cn(
                              "relative w-full h-28 rounded-lg overflow-hidden border-2 transition-all",
                              "hover:scale-105 hover:border-primary hover:shadow-lg",
                              "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            )}
                            title={upload.name}
                          >
                            <img
                              src={upload.url}
                              alt={upload.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteUpload(upload.name)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      Nenhuma imagem enviada ainda. Clique no botão acima para
                      fazer upload.
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Tab: Cliparts SVG do Supabase */}
          <TabsContent value="cliparts" className="space-y-3 mt-3">
            {/* Busca */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Buscar Clipart</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Digite sua busca..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Categorias */}
            {clipartCategories.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categorias</Label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button
                    variant={selectedCategory === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange("")}
                    className="flex-shrink-0"
                  >
                    Todos
                  </Button>
                  {clipartCategories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleCategoryChange(category)}
                      className="flex-shrink-0"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Grid de Cliparts */}
            <div className="space-y-2">
              {clipartsLoading && cliparts.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Carregando cliparts...
                </div>
              ) : clipartsError ? (
                <div className="text-center py-8 text-destructive text-sm">
                  {clipartsError}
                </div>
              ) : cliparts.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {cliparts.map((clipart) => (
                      <button
                        key={clipart.url}
                        onClick={() => handleClipartClick(clipart.url)}
                        className={cn(
                          "relative w-full h-24 rounded-lg overflow-hidden border-2 transition-all",
                          "hover:scale-105 hover:border-primary hover:shadow-lg",
                          "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                          "bg-white dark:bg-slate-900 p-2",
                        )}
                        title={clipart.name}
                      >
                        <img
                          src={clipart.url}
                          alt={clipart.name}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                  <Pagination
                    currentPage={clipartsPage}
                    totalPages={totalPagesCliparts}
                    canGoPrev={canGoPrevCliparts}
                    canGoNext={canGoNextCliparts}
                    onPrevious={goToPrevPageCliparts}
                    onNext={goToNextPageCliparts}
                    loading={clipartsLoading}
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Nenhum clipart encontrado
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Unsplash */}
          <TabsContent value="unsplash" className="space-y-3 mt-3">
            {/* Busca */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Buscar no Unsplash</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Digite sua busca..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Grid de Imagens */}
            <div className="space-y-2">
              {unsplashLoading && unsplashImages.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Carregando imagens...
                </div>
              ) : unsplashError ? (
                <div className="text-center py-8 text-destructive text-sm">
                  {unsplashError}
                </div>
              ) : unsplashImages.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {unsplashImages.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => handleImageClick(image.urls.full)}
                        className={cn(
                          "relative w-full h-28 rounded-lg overflow-hidden border-2 transition-all",
                          "hover:scale-105 hover:border-primary hover:shadow-lg",
                          "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        )}
                        title={image.alt_description || "Imagem"}
                      >
                        <img
                          src={image.urls.thumb}
                          alt={image.alt_description || "Imagem"}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  <Pagination
                    currentPage={unsplashPage}
                    canGoPrev={canGoPrevUnsplash}
                    canGoNext={canGoNextUnsplash}
                    onPrevious={goToPrevPageUnsplash}
                    onNext={goToNextPageUnsplash}
                    loading={unsplashLoading}
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Nenhuma imagem encontrada
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Pixabay */}
          <TabsContent value="pixabay" className="space-y-3 mt-3">
            {/* Busca */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Buscar no Pixabay</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Digite sua busca..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Grid de Imagens */}
            <div className="space-y-2">
              {pixabayLoading && pixabayImages.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Carregando imagens...
                </div>
              ) : pixabayError ? (
                <div className="text-center py-8 text-destructive text-sm">
                  {pixabayError}
                </div>
              ) : pixabayImages.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {pixabayImages.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => handleImageClick(image.largeImageURL)}
                        className={cn(
                          "relative w-full h-28 rounded-lg overflow-hidden border-2 transition-all",
                          "hover:scale-105 hover:border-primary hover:shadow-lg",
                          "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        )}
                        title={image.tags}
                      >
                        <img
                          src={image.previewURL}
                          alt={image.tags}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  <Pagination
                    currentPage={pixabayPage}
                    canGoPrev={canGoPrevPixabay}
                    canGoNext={canGoNextPixabay}
                    onPrevious={goToPrevPagePixabay}
                    onNext={goToNextPagePixabay}
                    loading={pixabayLoading}
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Nenhuma imagem encontrada
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
