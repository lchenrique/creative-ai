import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

export interface UnifiedImage {
  id: string;
  thumbnail: string;
  url: string;
  alt?: string;
  source: "pixabay" | "unsplash" | "supabase";
}

interface ImagesResponse {
  success: boolean;
  images: UnifiedImage[];
  page: number;
  perPage: number;
  hasMore: boolean;
  sources: {
    pixabay: number;
    unsplash: number;
    supabase: number;
  };
}

interface UseImagesProps {
  query?: string;
  page?: number;
  perPage?: number;
}

interface UseImagesReturn {
  images: UnifiedImage[];
  loading: boolean;
  fetching: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  search: (query: string) => void;
}

const VECTORIZE_URL =
  import.meta.env.VITE_VECTORIZE_API_URL || "http://localhost:3001";

async function fetchImages(
  query: string,
  page: number,
  perPage: number,
): Promise<ImagesResponse> {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    perPage: perPage.toString(),
  });

  const response = await fetch(`${VECTORIZE_URL}/images?${params}`);

  if (!response.ok) {
    throw new Error("Falha ao buscar imagens");
  }

  return response.json();
}

export function useImages({
  query: initialQuery = "",
  page: initialPage = 1,
  perPage = 15,
}: UseImagesProps = {}): UseImagesReturn {
  const [page, setPage] = useState(initialPage);
  const [query, setQuery] = useState(initialQuery);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["images", query, page, perPage],
    queryFn: () => fetchImages(query, page, perPage),
    placeholderData: (previousData) => previousData, // Mantém dados anteriores enquanto carrega
  });

  const nextPage = useCallback(() => {
    if (data?.hasMore) {
      setPage((p) => p + 1);
    }
  }, [data?.hasMore]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  }, [page]);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  }, []);

  return {
    images: data?.images || [],
    loading: isLoading,
    fetching: isFetching,
    error: error instanceof Error ? error.message : null,
    page,
    hasMore: data?.hasMore ?? false,
    setPage,
    nextPage,
    prevPage,
    search,
  };
}
