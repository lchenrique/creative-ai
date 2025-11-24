import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterItem } from "./filters/filter-item";
import { filters } from "@/lib/filters";

export interface Filter {
    id: string;
    name: string;
    cssFilter: string;
    category: "basicos" | "duotone";
    mixBlendMode?: string;
    background?: string;
    imageMixBlendMode?: string;
}

interface FilterSidebarProps {
    filters: typeof filters;
    activeFilter: typeof filters[number]["id"];
    filterIntensities: Partial<Record<typeof filters[number]["id"], number>> | undefined;
    onFilterSelect?: (filterId: typeof filters[number]["id"]) => void;
    onIntensityChange: (filterId: typeof filters[number]["id"], value: number) => void;
    previewImage: string;
}

export const FiltersController = ({
    filters,
    activeFilter,
    filterIntensities,
    onFilterSelect,
    onIntensityChange,
    previewImage,
}: FilterSidebarProps) => {
    const [activeTab, setActiveTab] = useState<"basicos" | "duotone">("basicos");

    const basicFilters = filters.filter((f) => f.category === "basicos");
    const duotoneFilters = filters.filter((f) => f.category === "duotone");

    const renderFilterList = (filterList: typeof filters[number][]) => (
        <div className="space-y-2 px-1">
            {filterList.map((filter) => (
                <FilterItem
                    key={filter.id}
                    id={filter.id}
                    name={filter.name}
                    cssFilter={filter.cssFilter}
                    isActive={activeFilter === filter.id}
                    intensity={filterIntensities?.[filter.id] ?? 100}
                    previewImage={previewImage}
                    onSelect={onFilterSelect ? () => onFilterSelect(filter.id) : undefined}
                    onIntensityChange={(value) => onIntensityChange(filter.id, value)}
                />
            ))}
        </div>
    );
    return (
        <div className="w-full flex flex-col h-[calc(100vh-140px)] overflow-hidden">
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "basicos" | "duotone")} className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-full h-8" >
                    <TabsTrigger value="basicos" className="text-xs">
                        Básicos
                    </TabsTrigger>
                    <TabsTrigger value="duotone" className="text-xs">
                        DuoTone
                    </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 min-h-0">
                    <TabsContent value="basicos" className="mt-0">
                        {renderFilterList(basicFilters)}
                    </TabsContent>
                    <TabsContent value="duotone" className="mt-0">
                        {renderFilterList(duotoneFilters)}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
    );

};
