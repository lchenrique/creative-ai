import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { patternOptions } from "@/data/pattern-options"
import { ColorConfig } from "@/store/minisite-store"

interface PatternTabProps {
    colorConfig: ColorConfig
    setColorConfig: React.Dispatch<React.SetStateAction<ColorConfig>>
}

export const PatternTab = ({ colorConfig, setColorConfig }: PatternTabProps) => {
    const [patternSearch, setPatternSearch] = useState("")

    const filteredPatterns = patternOptions.filter((pattern) =>
        pattern.name.toLowerCase().includes(patternSearch.toLowerCase())
    )

    return (
        <TabsContent value="pattern" className="space-y-3 pt-3">
            <div className="space-y-2">
                <Label className="text-sm font-medium">Padrões</Label>
                
                {/* Campo de busca */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Buscar padrões..."
                        value={patternSearch}
                        onChange={(e) => setPatternSearch(e.target.value)}
                        className="pl-9 h-8 text-sm"
                    />
                </div>

                <RadioGroup
                    value={colorConfig.pattern || ""}
                    onValueChange={(value) => {
                        setColorConfig((prev) => ({
                            ...prev,
                            pattern: value,
                        }))
                    }}
                    className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto overflow-x-hidden"
                    aria-label="Selecionar padrão de fundo"
                >
                    {filteredPatterns.length > 0 ? (
                        filteredPatterns.map((pattern) => (
                            <div key={pattern.name} className="relative">
                                <RadioGroupItem
                                    value={pattern.value}
                                    id={pattern.value}
                                    className="peer sr-only"
                                />
                                <label
                                    htmlFor={pattern.value}
                                    className={cn(
                                        "block h-16 relative p-0 overflow-hidden bg-transparent text-xs hover:scale-105 transition-transform cursor-pointer border rounded-md",
                                        "peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2",
                                        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                        colorConfig.pattern === pattern.value && "ring-2 ring-primary ring-offset-2 border-primary"
                                    )}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Selecionar padrão: ${pattern.name}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            setColorConfig((prev) => ({
                                                ...prev,
                                                pattern: pattern.value,
                                            }))
                                        }
                                    }}
                                >
                                    <div
                                        className={cn("w-full h-full rounded-sm", pattern.value)}
                                    />
                                    <div className="absolute z-10 flex-col inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-medium text-center px-1">
                                            {pattern.name}
                                        </span>
                                        {colorConfig.pattern === pattern.value && (
                                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
                            Nenhum padrão encontrado para "{patternSearch}"
                        </div>
                    )}
                </RadioGroup>
            </div>
        </TabsContent>
    )
} 