import { filters } from "@/lib/filters";
import { FiltersController } from "../controllers/filters-controller";
export interface FilterSelectorProps {
    value: typeof filters[number]["id"];
    intensity: Partial<Record<typeof filters[number]["id"], number>> | undefined;
    onIntensityChange: (filterId: typeof filters[number]["id"], value: number) => void;
    previewImage: string;
    onChange?: (value: typeof filters[number]["id"]) => void;

}

export const FilterSelector = ({ value = "original", onChange, intensity, onIntensityChange, previewImage }: FilterSelectorProps) => {

    return (
        <FiltersController
            filters={filters}
            activeFilter={value}
            onFilterSelect={onChange}
            filterIntensities={intensity}
            onIntensityChange={onIntensityChange}
            previewImage={previewImage}
        />
    );
};