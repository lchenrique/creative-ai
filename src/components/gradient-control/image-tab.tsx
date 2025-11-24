import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ColorConfig } from "@/stores/canva-store";
import { ImageSelector } from "../@new/image-selector";
import { FilterSelector, type FilterSelectorProps } from "../@new/image-selector/filter-selector";
import { filters } from "@/lib/filters";
import { Background } from "../art-background";



interface ImageTabProps extends Omit<FilterSelectorProps, 'onChange' | "value"> {
  colorConfig: ColorConfig;
  setColorConfig: (config: ColorConfig) => void;
  selectedFilter?: typeof filters[number]["id"];
  setSelectedFilter?: (filter: typeof filters[number]["id"]) => void;
}

export const ImageTab = ({ colorConfig, setColorConfig, intensity, onIntensityChange, previewImage, selectedFilter, setSelectedFilter }: ImageTabProps) => {


  return (<div>
    {colorConfig.type === "image" && <Background className="flex relative h-32 p-1 mb-3   overflow-auto" />}
    <TabsContent
      value="image"
      className="w-full outline-none space-y-3 data-[state=inactive]:hidden"
      forceMount
    >
      <Tabs defaultValue="image" className="w-full">
        <TabsList className="h-8 flex items-center w-full">
          <TabsTrigger value="image" className="text-xs flex-1">Galeria</TabsTrigger>
          <TabsTrigger value="filter" className="text-xs">Filtros</TabsTrigger>
        </TabsList>
        <TabsContent value="image">
          <ImageSelector value={colorConfig.value as string} onChange={(value) => setColorConfig({ type: "image", value })} />
        </TabsContent>
        <TabsContent value="filter">
          <FilterSelector
            value={selectedFilter || "original"}
            onChange={setSelectedFilter || (() => { })}
            intensity={intensity}
            onIntensityChange={onIntensityChange}
            previewImage={previewImage}
          />
        </TabsContent>
      </Tabs>
    </TabsContent>
  </div>

  );
};
