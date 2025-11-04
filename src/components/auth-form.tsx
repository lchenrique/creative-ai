import { useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Mail, Lock, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useNavigate } from "react-router"

interface AuthFormProps {
  mode: "signin" | "signup"
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          navigate("/dashboard")
        }
      } else {
        const { error } = await signUp(email, password, name)
        if (error) {
          setError(error.message)
        } else {
          // Sucesso - mostrar mensagem para verificar email
          setError("Conta criada! Verifique seu email para confirmar.")
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === "signup" && (
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      )}

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder={mode === "signin" ? "stanley@gmail.com" : "Email Address"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10"
          required
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-10"
          required
        />
      </div>

      {mode === "signup" && (
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Confirm Password"
            className="pl-10"
            required
          />
        </div>
      )}

      {mode === "signin" && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Remember me
            </span>
          </label>
          <button
            type="button"
            className="text-sm text-primary hover:underline transition-all"
          >
            Forgot Password?
          </button>
        </div>
      )}

      {error && (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
          error.includes("criada")
            ? "bg-green-500/10 text-green-600 dark:text-green-400"
            : "bg-destructive/10 text-destructive"
        }`}>
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full mt-2 font-semibold"
        disabled={loading}
      >
        {loading ? "Carregando..." : mode === "signin" ? "Entrar" : "Criar Conta"}
      </Button>
    </form>
  )
}
