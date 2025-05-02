import { Chat } from "@/components/chat"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { PanelLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="mr-2">
            <PanelLeft className="h-5 w-5" />
          </SidebarTrigger>
        </div>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col overflow-hidden">
        <Chat />
      </main>
    </div>
  )
}
