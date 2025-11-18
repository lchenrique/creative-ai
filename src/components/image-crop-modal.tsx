import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropModalProps {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
}

export const ImageCropModal = ({
  open,
  imageUrl,
  onClose,
  onCropComplete,
}: ImageCropModalProps) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Determina se precisa de CORS (apenas para URLs externas, não data URLs)
  const needsCORS = imageUrl && !imageUrl.startsWith("data:");

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      imgRef.current = e.currentTarget;
    },
    [],
  );

  const getCroppedImg = useCallback(
    async (image: HTMLImageElement, pixelCrop: PixelCrop): Promise<string> => {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      ctx.drawImage(
        image,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas is empty"));
              return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
          },
          "image/png",
          1,
        );
      });
    },
    [],
  );

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      alert("Por favor, selecione uma área para recortar");
      return;
    }

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      alert("Erro ao recortar imagem");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCrop({
      unit: "%",
      x: 25,
      y: 25,
      width: 50,
      height: 50,
    });
    setCompletedCrop(undefined);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Recortar Imagem</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Crop Area */}
          <div className="flex items-center justify-center bg-slate-900 rounded-lg p-4">
            {imageUrl ? (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
                ruleOfThirds
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  crossOrigin={needsCORS ? "anonymous" : undefined}
                  style={{ maxWidth: "100%", maxHeight: "60vh" }}
                />
              </ReactCrop>
            ) : (
              <div className="w-full h-[400px] flex items-center justify-center text-white">
                <p>Nenhuma imagem selecionada</p>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>💡 Dica: Arraste as bordas para ajustar a área de recorte</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApplyCrop}
            disabled={isProcessing || !completedCrop}
          >
            {isProcessing ? "Processando..." : "Aplicar Recorte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
