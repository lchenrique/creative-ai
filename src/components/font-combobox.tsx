import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  fontOptions,
  fontCategories,
  type FontOption,
} from "@/data/font-options";

interface FontComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FontCombobox({
  value,
  onValueChange,
  placeholder = "Selecionar fonte...",
  className,
}: FontComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedFont = fontOptions.find((font) => font.family === value);

  // Filtrar fontes baseado na busca
  const filteredFonts = fontOptions.filter(
    (font) =>
      font.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      font.family.toLowerCase().includes(searchValue.toLowerCase()) ||
      fontCategories[font.category]
        .toLowerCase()
        .includes(searchValue.toLowerCase()),
  );

  // Agrupar fontes filtradas por categoria
  const groupedFonts = filteredFonts.reduce(
    (acc, font) => {
      if (!acc[font.category]) {
        acc[font.category] = [];
      }
      acc[font.category].push(font);
      return acc;
    },
    {} as Record<FontOption["category"], FontOption[]>,
  );

  const categoryColors = {
    "sans-serif": "bg-blue-100 text-blue-800",
    serif: "bg-purple-100 text-purple-800",
    monospace: "bg-green-100 text-green-800",
    display: "bg-orange-100 text-orange-800",
    handwriting: "bg-pink-100 text-pink-800",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center gap-2 min-w-0">
            {selectedFont ? (
              <>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs px-1.5 py-0.5",
                    categoryColors[selectedFont.category],
                  )}
                >
                  {fontCategories[selectedFont.category]}
                </Badge>
                <span
                  className="truncate font-medium"
                  style={{ fontFamily: selectedFont.family }}
                >
                  {selectedFont.name}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command className="w-full">
          <div className="flex items-center border-b px-3 w-full">
            <CommandInput
              placeholder="Buscar fontes..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-0 focus:ring-0 w-full px-2"
            />
          </div>
          <CommandList className="max-h-80">
            <CommandEmpty>Nenhuma fonte encontrada.</CommandEmpty>

            {Object.entries(groupedFonts).map(([category, fonts]) => (
              <CommandGroup
                key={category}
                heading={
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        categoryColors[category as FontOption["category"]],
                      )}
                    >
                      {fontCategories[category as FontOption["category"]]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({fonts.length})
                    </span>
                  </div>
                }
              >
                {fonts.map((font) => (
                  <CommandItem
                    key={font.id}
                    value={font.family}
                    onSelect={() => {
                      onValueChange(font.family === value ? "" : font.family);
                      // Não fecha mais o dropdown ao selecionar
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === font.family ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="min-w-0">
                        <div
                          className="font-medium truncate"
                          style={{ fontFamily: font.family }}
                        >
                          {font.name}
                        </div>
                        {font.preview && (
                          <div className="text-xs text-muted-foreground truncate">
                            {font.preview}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
