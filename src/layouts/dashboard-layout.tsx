import { Outlet } from "react-router"
import { Sidebar } from "@/components/sidebar"

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  )
}
