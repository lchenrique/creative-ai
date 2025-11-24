import { ImageSelector } from "@/components/@new/image-selector";
import { useCanvasStore } from "@/stores/canva-store";
import { useState } from "react";

export function ImageGallerySidebar() {
    const addElement = useCanvasStore((s) => s.addElement);
    const updateElementConfig = useCanvasStore((s) => s.updateElementConfig);
    const [selectedImage, setSelectedImage] = useState("");

    const handleImageSelect = (imageUrl: string) => {
        setSelectedImage(imageUrl);

        // Create new image element with the selected image
        addElement?.("image");

        // Get the newly created element (last one in the store)
        const elements = useCanvasStore.getState().elements;
        const elementIds = Object.keys(elements);
        const lastElementId = elementIds[elementIds.length - 1];

        // Update the image URL
        if (lastElementId) {
            updateElementConfig(lastElementId, {
                style: {
                    backgroundColor: { type: "image", value: imageUrl },
                },
            });
        }
    };

    return (
        <div className="w-full h-full">
            <ImageSelector
                value={selectedImage}
                onChange={handleImageSelect}
            />
        </div>
    );
}
