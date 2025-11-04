import { NavLink, useNavigate } from "react-router"
import { Sparkles, LayoutGrid, Image, Wand2, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export function Sidebar() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate("/auth")
  }
  const navItems = [
    { to: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { to: "/gallery", icon: Image, label: "Minhas Artes" },
    { to: "/create", icon: Wand2, label: "Criar com IA" },
  ]

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">CreativeAI</h1>
            <p className="text-xs text-muted-foreground">Marketing Studio</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                "hover:bg-accent/50",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground/80"
              )
            }
          >
            <item.icon className="size-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-1">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all hover:bg-accent/50 text-foreground/80">
          <Settings className="size-5" />
          <span>Configurações</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="size-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
