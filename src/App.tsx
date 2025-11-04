import "./global.css"
import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { AuthProvider, useAuth } from "./contexts/auth-context"
import { AuthPage } from "./pages/auth"
import { DashboardLayout } from "./layouts/dashboard-layout"
import { EditorPage } from "./pages/editor"

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Auth Route */}

      <Route
        path="/auth"
        element={user ? <Navigate to="/editor" /> : <AuthPage />}
      />

      <Route
        path="/editor"
        element={user ? <EditorPage /> : <Navigate to="/auth" />}
      />

      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />

      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
