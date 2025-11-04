import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ColorPicker } from "@/components/color-picker"
import { ColorConfig } from "@/store/minisite-store"

interface SolidColorTabProps {
    colorConfig: ColorConfig
    setColorConfig: React.Dispatch<React.SetStateAction<ColorConfig>>
}

const SOLIDS_PRESETS = [
    // Neutros
    { color: '#f8fafc', name: 'Branco Neve' },
    { color: '#64748b', name: 'Cinza Médio' },
    { color: '#0f172a', name: 'Preto Suave' },

    // Cores Principais
    { color: '#ef4444', name: 'Vermelho' },
    { color: '#fb923c', name: 'Laranja' },
    { color: '#eab308', name: 'Amarelo Dourado' },
    { color: '#22c55e', name: 'Verde' },
    { color: '#3b82f6', name: 'Azul' },
    { color: '#8b5cf6', name: 'Roxo' },
    { color: '#ec4899', name: 'Rosa' },
    { color: '#0891b2', name: 'Turquesa' },
    { color: '#78350f', name: 'Marrom' },
]

export const SolidColorTab = ({ colorConfig, setColorConfig }: SolidColorTabProps) => (
    <TabsContent value="solid" className="space-y-3 pt-3">
        {/* Presets de Cor Sólida */}
        <div className="space-y-2">
            <Label className="text-sm font-medium">Presets</Label>
            <div className="grid grid-cols-6 gap-2">
                {SOLIDS_PRESETS.map((preset) => (
                    <Tooltip key={preset.name}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-8 p-0 overflow-hidden bg-transparent text-xs hover:scale-105 transition-transform"
                                onClick={() => setColorConfig((prev) => ({ ...prev, solidColor: preset.color }))}
                            >
                                <div
                                    className="w-full h-full rounded-sm"
                                    style={{ background: preset.color }}
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{preset.name}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </div>

        {/* Seletor de Cor Personalizada */}
        <div className="space-y-2">
            <Label className="text-sm font-medium">Cor Personalizada</Label>
            <div className="flex items-center gap-2">
                <ColorPicker 
                    background={colorConfig.solidColor} 
                    setBackground={(color) => setColorConfig((prev) => ({ ...prev, solidColor: color }))} 
                />
            
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => navigator.clipboard.writeText(colorConfig.solidColor)}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Copiar código da cor</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    </TabsContent>
) 