import {Chat} from '@/components/chat';
import { MockChat } from "@/components/mock-chat"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { PanelLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeAwareLogo } from "@/components/theme-aware-logo"
import { apiClient } from "@/lib/api-client"
import { redirect } from "next/navigation"

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { session: sessionParam } = await searchParams
  const sessionId = Array.isArray(sessionParam) ? sessionParam[0] : sessionParam

  // If no session ID is provided, create a new session and redirect
  if (!sessionId) {
    const session = await apiClient.createSession()
    redirect(`/?session=${session.id}`)
  }

  // Fetch the session data
  const session = await apiClient.getSession(sessionId)

  // If session not found, create a new one and redirect
  if (!session) {
    const newSession = await apiClient.createSession()
    apiClient.setSessionId(newSession.id);
    redirect(`/?session=${newSession.id}`)
  }

  apiClient.setSessionId(sessionId);

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="mr-2">
            <PanelLeft className="h-5 w-5" />
          </SidebarTrigger>
          <div className="md:hidden">
            <ThemeAwareLogo className="h-5 w-auto" />
          </div>
        </div>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col overflow-auto" id="main-content">
        <Chat sessionId={sessionId} />
      </main>
    </div>
  )
}
