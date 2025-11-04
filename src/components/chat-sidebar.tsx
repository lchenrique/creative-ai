"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles } from "lucide-react"
import type { ArtConfig } from "@/app/page"

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
      content: "Olá! Sou sua assistente de criação. Descreva o criativo que você quer criar e eu vou ajudar você!",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    // Simulate AI response with suggestions
    setTimeout(() => {
      const suggestions = generateSuggestions(userMessage, artConfig)
      setMessages((prev) => [...prev, { role: "assistant", content: suggestions.message }])
      if (suggestions.config) {
        setArtConfig({ ...artConfig, ...suggestions.config })
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Assistente IA</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                <div className="flex gap-1">
                  <div className="size-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div
                    className="size-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="size-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
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
            placeholder="Descreva seu criativo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

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

  // Minimalista
  if (lower.includes("minimalista") || lower.includes("minimal")) {
    return {
      message: "Apliquei um estilo minimalista com cores suaves e tipografia clean.",
      config: {
        theme: "minimal",
        gradient: {
          enabled: false,
          from: "#f3f4f6",
          to: "#e5e7eb",
          direction: "to-b",
        },
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
      },
    }
  }

  // Moderno
  if (lower.includes("moderno") || lower.includes("modern")) {
    return {
      message: "Criei um design moderno com gradientes vibrantes e tipografia bold!",
      config: {
        theme: "modern",
        gradient: {
          enabled: true,
          from: "#3b82f6",
          to: "#8b5cf6",
          direction: "to-br",
        },
      },
    }
  }

  return {
    message:
      "Entendi! Você pode usar os menus flutuantes à direita para personalizar cores, fontes e outros elementos. O que mais gostaria de ajustar?",
  }
}
