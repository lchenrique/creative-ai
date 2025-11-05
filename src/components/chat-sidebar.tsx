"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles, Loader2 } from "lucide-react"
import type { ArtConfig } from "@/app/page"
import { useDesignCommands } from "@/hooks/useDesignCommands"

type Message = {
  role: "user" | "assistant"
  content: string
}

type ChatSidebarProps = {
  artConfig: ArtConfig
  setArtConfig: (config: ArtConfig) => void
}

export function ChatSidebar({ artConfig, setArtConfig }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou sua assistente de criação com IA Gemini.\n\nDescreva o design que você quer criar e eu vou gerar usando as ferramentas do canvas!\n\nExemplo: 'crie um cartaz de promoção com fundo vermelho e texto grande'",
    },
  ])
  const [input, setInput] = useState("")

  const { executeDesign, loading: aiLoading, error: aiError } = useDesignCommands()

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    // Usa Gemini para gerar e executar design
    try {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "🎨 Gerando seu design com IA... Aguarde!",
        },
      ])

      await executeDesign(userMessage)

      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove mensagem de loading
        {
          role: "assistant",
          content: `✅ Design criado com sucesso!\n\nOs elementos foram adicionados ao canvas. Você pode editá-los livremente usando as ferramentas do lado direito!`,
        },
      ])
    } catch (error) {
      console.error("Erro ao gerar design:", error)
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove mensagem de loading
        {
          role: "assistant",
          content: `❌ Erro ao gerar design: ${aiError || "Erro desconhecido"}.\n\nTente novamente com uma descrição diferente.`,
        },
      ])

      // Fallback para sugestões antigas
      const suggestions = generateSuggestions(userMessage, artConfig)
      setMessages((prev) => [...prev, { role: "assistant", content: `\n💡 Sugestão: ${suggestions.message}` }])
      if (suggestions.config) {
        setArtConfig({ ...artConfig, ...suggestions.config })
      }
    }
  }

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="size-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Assistente IA Gemini</h3>
            <p className="text-xs text-muted-foreground">
              {aiLoading ? "Gerando..." : "Online"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Gerando com Gemini AI...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Descreva seu design..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !aiLoading && handleSend()}
            disabled={aiLoading}
            className="text-sm"
          />
          <Button size="icon" onClick={handleSend} disabled={aiLoading || !input.trim()}>
            {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Descreva cores, textos, formas. A IA criará usando as ferramentas do canvas.
        </p>
      </div>
    </div>
  )
}

// Fallback function (mantida como backup)
function generateSuggestions(
  userInput: string,
  currentConfig: ArtConfig,
): { message: string; config?: Partial<ArtConfig> } {
  const lower = userInput.toLowerCase()

  // Black Friday
  if (lower.includes("black friday")) {
    return {
      message:
        "Criei um design para Black Friday com cores escuras e impactantes! Ajustei o tema para bold com gradiente roxo.",
      config: {
        theme: "bold",
        gradient: {
          enabled: true,
          from: "#7c3aed",
          to: "#1e1b4b",
          direction: "to-br",
        },
        content: {
          title: "BLACK FRIDAY",
          subtitle: "Até 70% OFF",
          description: "Ofertas imperdíveis por tempo limitado!",
        },
      },
    }
  }

  // Natal
  if (lower.includes("natal") || lower.includes("christmas")) {
    return {
      message: "Criei um design natalino com cores festivas! Usei vermelho e verde com tema elegante.",
      config: {
        theme: "elegant",
        gradient: {
          enabled: true,
          from: "#dc2626",
          to: "#16a34a",
          direction: "to-br",
        },
        content: {
          title: "Feliz Natal",
          subtitle: "Promoções Especiais",
          description: "Presentes perfeitos para quem você ama",
        },
      },
    }
  }

  return {
    message:
      "Entendi! Você pode usar os menus flutuantes à direita para personalizar cores, fontes e outros elementos.",
  }
}
