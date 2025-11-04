import { Copy, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ColorConfig } from "./types"

interface ActionButtonsProps {
    colorConfig: ColorConfig
    copied: boolean
    setCopied: (value: boolean) => void
    randomizeColors: () => void
    copyToClipboard: () => void
}

export const ActionButtons = ({ 
    colorConfig, 
    copied, 
    setCopied, 
    randomizeColors, 
    copyToClipboard 
}: ActionButtonsProps) => (
    <div className="flex gap-1">
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={randomizeColors}
                    disabled={colorConfig.colorType === "solid"}
                >
                    <Shuffle className="w-4 h-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Cores aleatórias</p>
            </TooltipContent>
        </Tooltip>

        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyToClipboard}
                    className={copied ? "bg-green-100 text-green-700" : ""}
                >
                    <Copy className="w-4 h-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{copied ? "Copiado!" : "Copiar CSS"}</p>
            </TooltipContent>
        </Tooltip>
    </div>
) 