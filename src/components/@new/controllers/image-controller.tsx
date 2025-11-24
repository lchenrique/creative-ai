import { useCanvasStore } from "@/stores/canva-store"
import { FiltersController } from "./filters-controller"
import { filters } from "@/lib/filters"
import { Section } from "../section"
import { useState } from "react"
import { MixBlendMode } from "./mix-bland"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

export const ImageController = () => {
    const [activeSection, setActiveSection] = useState("filters")
    const selectetIds = useCanvasStore((state) => state.selectedIds)
    const elements = useCanvasStore((state) => state.elements)
    const updateElementConfig = useCanvasStore((state) => state.updateElementConfig)

    const selectedElement = elements[selectetIds[0]]
    const backgroundColor = selectedElement?.config.style.backgroundColor?.value || ""

    return (
        <>
            <Section
                title="Filtros"
                onToggle={() => setActiveSection(activeSection === "filters" ? "style" : "filters")}
                isExpanded={activeSection === "filters"}

            >
                <FiltersController
                    filters={filters}
                    activeFilter={selectedElement?.config.filter || "original"}
                    filterIntensities={selectedElement?.config.filterIntensities}
                    onIntensityChange={(filterId, value) => {
                        updateElementConfig(selectetIds[0], {
                            filterIntensities: {
                                ...selectedElement?.config.filterIntensities,
                                [filterId]: value
                            }
                        })
                    }}
                    onFilterSelect={(filter) => {
                        updateElementConfig(selectetIds[0], {
                            filter: filter
                        })
                    }}
                    previewImage={backgroundColor as string}
                />
            </Section>
            <Section
                title="Mix Blend Mode"
                onToggle={() => setActiveSection(activeSection === "mixBlendMode" ? "style" : "mixBlendMode")}
                isExpanded={activeSection === "mixBlendMode"}

            >
                <MixBlendMode
                    mixBlendMode={selectedElement?.config.style.mixBlendMode || "normal"}
                    onMixBlendModeChange={(value) => {
                        updateElementConfig(selectetIds[0], {
                            style: {
                                mixBlendMode: value
                            }
                        })
                    }}
                />
            </Section>

            <Section
                title="Opacity"
                onToggle={() => setActiveSection(activeSection === "opacity" ? "style" : "opacity")}
                isExpanded={activeSection === "opacity"}
            >
                <div className="flex items-center gap-2 mt-2">
                    <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[selectedElement?.config.style.opacity || 0]}
                        onValueChange={(value) => {
                            updateElementConfig(selectetIds[0], {
                                style: {
                                    opacity: value[0]
                                }
                            })
                        }}
                    />

                    <Input
                        className="w-24"
                        type="number"
                        min={0.1}
                        max={1}
                        step={0.1}
                        value={selectedElement?.config.style.opacity || 0}
                        onChange={(e) => {
                            updateElementConfig(selectetIds[0], {
                                style: {
                                    opacity: parseFloat(e.target.value)
                                }
                            })
                        }}
                    />
                </div>
            </Section>
        </>
    )
}