import Canvas from "@/components/@new/canvas";

import { LibrarySidebar } from "@/components/@new/menu/library";
import { UploadsSidebar } from "@/components/@new/menu/uploads";
import { MenuItem } from "@/components/@new/menu/menu-item";
import { PageHeader } from "@/components/layout/page-header";
import { GeometricShapes01Icon, ImageUploadIcon } from "@hugeicons/core-free-icons";
import { useRef, useState } from "react";
export type ArtConfig = {
  theme: "modern" | "minimal" | "bold" | "elegant";
  backgroundColor: string;
  textColor: string;
  gradient: {
    enabled: boolean;
    from: string;
    to: string;
    direction: "to-r" | "to-br" | "to-b" | "to-bl";
  };
  pattern: "none" | "dots" | "grid" | "waves";
  font: {
    family: "sans" | "serif" | "mono";
    size: "sm" | "md" | "lg" | "xl";
    weight: "normal" | "medium" | "semibold" | "bold";
  };
  content: {
    title: string;
    subtitle: string;
    description: string;
  };
  backgroundImage?: string;
};

export function EditorPage() {
  const [artConfig, setArtConfig] = useState<ArtConfig>({
    theme: "modern",
    backgroundColor: "#6366f1",
    textColor: "#ffffff",
    gradient: {
      enabled: true,
      from: "#6366f1",
      to: "#8b5cf6",
      direction: "to-br",
    },
    pattern: "none",
    font: {
      family: "sans",
      size: "lg",
      weight: "bold",
    },
    content: {
      title: "Black Friday",
      subtitle: "Até 70% OFF",
      description: "Aproveite as melhores ofertas do ano!",
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleDownload = () => {
  //   if (downloadDesign) {
  //     downloadDesign()
  //   } else {
  //     console.error('❌ Função de download não disponível ainda')
  //   }
  // }

  // const handleImportClick = () => {
  //   fileInputRef.current?.click()
  // }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        // const jsonData = JSON.parse(event.target?.result as string)
        // if (importCanvasJSON) {
        //   importCanvasJSON(jsonData)
        //    
        // }
      } catch (error) { }
    };
    reader.readAsText(file);

    // Reset input para permitir importar o mesmo arquivo novamente
    e.target.value = "";
  };

  return (
    <div className="flex flex-col bg-background h-screen">
      {/* Header */}
      <PageHeader title="Editor">
        <div className="flex gap-2">
          {/* <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          /> */}
          {/* <Button onClick={handleImportClick} variant="outline" disabled={!importCanvasJSON}>
              <Upload className="w-4 h-4 mr-2" />
              Importar Design
            </Button> */}
          {/* <Button onClick={handleDownload} disabled={!downloadDesign}>
              <Download className="w-4 h-4 mr-2" />
              Salvar Design
            </Button> */}
        </div>
      </PageHeader>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Chat Sidebar */}
        {/* <ChatSidebar artConfig={artConfig} setArtConfig={setArtConfig} /> */}

        {/* Preview Area */}

        <div className="h-full flex flex-col gap-2 bg-sidebar border-x p-2">
          <MenuItem
            trigger={GeometricShapes01Icon}
            menuContent={<LibrarySidebar />}
          />
          <MenuItem
            trigger={ImageUploadIcon}
            menuContent={<UploadsSidebar />}
          />
        </div>

        <div
          id="menu-editor"
          className="flex-1 relative overflow-hidden h-full"
        >
          <Canvas />
        </div>
      </div>
    </div>
  );
}
