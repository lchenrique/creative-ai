import { useCreativeStore } from "@/stores/creative-store";
import { useCallback, useState } from "react";

export const useImageConversion = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [isConvertingWebP, setIsConvertingWebP] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

  const convertImageToSVG = useCallback(async (elementId: number) => {
    setIsConverting(true);
    try {
      await useCreativeStore.getState().convertImageToSVG(elementId);
    } catch (error) {
      throw error;
    } finally {
      setIsConverting(false);
    }
  }, []);

  const convertToWebP = useCallback(
    async (elementId: number, svgContent?: string, imageUrl?: string) => {
      setIsConvertingWebP(true);
      try {
        const VECTORIZE_API_URL =
          import.meta.env.VITE_VECTORIZE_API_URL || "http://localhost:3001";

        const requestBody: any = { quality: 80 };

        if (svgContent) {
          requestBody.svgContent = svgContent;
        } else if (imageUrl) {
          requestBody.imageUrl = imageUrl;
        } else {
          throw new Error("Elemento inválido para conversão");
        }

        const response = await fetch(`${VECTORIZE_API_URL}/convert-to-webp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Falha ao converter para WebP");
        }

        const data = await response.json();

        if (!data.success || !data.webp) {
          throw new Error("Resposta inválida da API de conversão");
        }

        // Update element to be a WebP image
        useCreativeStore.getState().updateElement(elementId, {
          type: "image",
          image: data.webp,
          svgContent: undefined,
          svgColors: undefined,
        });
      } catch (error) {
        throw error;
      } finally {
        setIsConvertingWebP(false);
      }
    },
    []
  );

  const removeBackground = useCallback(async (elementId: number) => {
    setIsRemovingBackground(true);
    try {
      await useCreativeStore.getState().removeBackground(elementId);
    } catch (error) {
      throw error;
    } finally {
      setIsRemovingBackground(false);
    }
  }, []);

  return {
    isConverting,
    isConvertingWebP,
    isRemovingBackground,
    convertImageToSVG,
    convertToWebP,
    removeBackground,
  };
};
