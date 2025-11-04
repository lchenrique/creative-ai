import illustrationImage from "@/assets/ill.png"
import { Sparkles } from "lucide-react"

export function AuthHero() {
  return (
    <div className="hidden lg:block relative overflow-hidden">
      <img
        src={illustrationImage}
        alt="Creative AI Platform"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-br from-blue-600/40 via-purple-600/40 to-purple-700/40" />

      <div className="relative h-full flex flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Sparkles className="size-6 text-white" />
          </div>
          <span className="text-2xl font-bold">CreativeAI</span>
        </div>

        <div className="space-y-6 max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            Gere criativos de marketing profissionais com o poder da IA
          </h2>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-start gap-3">
              <div className="size-1.5 rounded-full bg-white mt-2 shrink-0" />
              <span>Chat inteligente com IA para sugestões criativas</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="size-1.5 rounded-full bg-white mt-2 shrink-0" />
              <span>Personalização em tempo real com preview instantâneo</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="size-1.5 rounded-full bg-white mt-2 shrink-0" />
              <span>Exportação profissional em alta qualidade</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
