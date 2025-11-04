import { ArtPreview } from "@/components/art-preview"
import { ChatSidebar } from "@/components/chat-sidebar"
import { FloatingMenus } from "@/components/floating-menu/floating-menus"
import { PageHeader } from "@/components/layout/page-header"
import { useState } from "react"

export type ArtConfig = {
  theme: "modern" | "minimal" | "bold" | "elegant"
  backgroundColor: string
  textColor: string
  gradient: {
    enabled: boolean
    from: string
    to: string
    direction: "to-r" | "to-br" | "to-b" | "to-bl"
  }
  pattern: "none" | "dots" | "grid" | "waves"
  font: {
    family: "sans" | "serif" | "mono"
    size: "sm" | "md" | "lg" | "xl"
    weight: "normal" | "medium" | "semibold" | "bold"
  }
  content: {
    title: string
    subtitle: string
    description: string
  }
  backgroundImage?: string
}

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
  })



  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <PageHeader title="Editor" />
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar */}
        <ChatSidebar artConfig={artConfig} setArtConfig={setArtConfig} />

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center  p-8 relative">
          <div className="relative">
            <ArtPreview />
            <FloatingMenus />
          </div>
        </div>
      </div>
    </div>
  )
}
