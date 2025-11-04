import { cn } from '@/lib/utils'
import { Paintbrush } from 'lucide-react'
import { useState } from 'react'
import { HexAlphaColorPicker } from 'react-colorful'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'
import { TooltipProvider } from './ui/tooltip'



interface ColorPickerProps {
  background: string
  setBackground: (background: string) => void
  disabled?: boolean
}

export function ColorPicker({
  background,
  setBackground,
  disabled = false,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(background || "#ffffff")




  // Força sincronização quando o popover abre
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      // Quando abre, força sincronização com o background atual
      const isValidHex = /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(background)
      if (isValidHex) {
        setCustomColor(background)
      }
    }
  }

  // Paleta de cores sólidas com nomes


  const handleColorChange = (hexColor: string) => {
    setCustomColor(hexColor)
    setBackground(hexColor)

  }




  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal border-2 border-brand-purple/20 hover:border-brand-purple focus-visible:border-brand-purple',
              !background && 'text-muted-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="w-full flex items-center gap-2">
              {background ? (
                <div
                  className="h-4 w-4 border-2 border-border"
                  style={{ background: background }}
                />
              ) : (
                <Paintbrush className="h-4 w-4" />
              )}
              <div className="truncate flex-1 max-w-[100px]">
                {background ? (
                  <span className="font-mono text-xs">{background}</span>
                ) : (
                  'Escolher cor'
                )}
              </div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4 border-2 border-border z-[9999]" align="start">
          <HexAlphaColorPicker
            color={customColor}
            onChange={handleColorChange}
            className="w-full"
            style={{
              width: '100%',
              height: "150px"
            }}
          />
          <Input type="text" value={customColor} onChange={(e) => handleColorChange(e.target.value)} className="w-full" />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}