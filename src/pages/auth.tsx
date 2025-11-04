import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { AuthForm } from "@/components/auth-form"
import { AuthHero } from "@/components/auth-hero"

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      <AuthHero />

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo</h1>
            <p className="text-muted-foreground">
              {activeTab === "signin"
                ? "Entre na sua conta ou crie uma nova para começar"
                : "Crie sua conta para começar a criar"}
            </p>
          </div>

          <Card className="border-0 shadow-none bg-transparent p-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "signin" | "signup")}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="signin" className="flex-1">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <AuthForm mode="signin" />
              </TabsContent>

              <TabsContent value="signup">
                <AuthForm mode="signup" />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
