"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Plus, MoreVertical, Home, Settings, Search } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SettingsModal } from "@/components/settings-modal"
import { apiClient } from "@/lib/api-client"
import { ThemeAwareLogo } from "./theme-aware-logo"

// Sample menu items
const menuItems = [
  {
    title: "Home",
    icon: Home,
    url: "#",
  },
  {
    title: "Search",
    icon: Search,
    url: "#",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "#",
  },
]

export function AppSidebar() {
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  // Update the sessions state to include session name
  const [sessions, setSessions] = useState<Array<{ id: string; name: string; lastMessage: string; timestamp: number }>>(
    [],
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load sessions on mount
  useEffect(() => {
    if (!mounted) return

    setIsLoading(true)
    setError(null)

    // Update the loadSessions function in the useEffect
    const loadSessions = async () => {
      try {
        // Check if there's a session ID in localStorage
        const savedSessionId = localStorage.getItem("currentSessionId")

        if (savedSessionId) {
          // Try to get the session details
          const session = await apiClient.getSession(savedSessionId)

          if (session) {
            // Session exists, we can use it
            apiClient.setSessionId(savedSessionId)
            setActiveChat(savedSessionId)
          } else {
            // Session doesn't exist, remove from localStorage
            localStorage.removeItem("currentSessionId")
          }
        }

        // List available sessions
        const sessionList = await apiClient.listSessions()

        if (sessionList && sessionList.length > 0) {
          // Transform the sessions into the format we need
          const formattedSessions = sessionList.map((session) => ({
            id: session.id,
            name: session.state?.session_name || "New conversation",
            lastMessage: getLastMessageFromSession(session) || "New conversation",
            timestamp: session.last_update_time || Date.now(),
          }))

          setSessions(formattedSessions)

          // Set the first session as active if none is selected
          if (!activeChat && formattedSessions.length > 0) {
            setActiveChat(formattedSessions[0].id)
            apiClient.setSessionId(formattedSessions[0].id)
            localStorage.setItem("currentSessionId", formattedSessions[0].id)
          }
        } else if (!activeChat) {
          // If no sessions exist and no active chat, create a new one
          const newSession = await apiClient.createSession()
          apiClient.setSessionId(newSession.id)
          localStorage.setItem("currentSessionId", newSession.id)

          setSessions([
            {
              id: newSession.id,
              name: newSession.state?.session_name || "New conversation",
              lastMessage: "New conversation",
              timestamp: Date.now(),
            },
          ])

          setActiveChat(newSession.id)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading sessions:", error)
        setError("Failed to load sessions")
        setIsLoading(false)

        // Fallback to a new session
        try {
          const newSession = await apiClient.createSession()
          apiClient.setSessionId(newSession.id)
          localStorage.setItem("currentSessionId", newSession.id)

          setSessions([
            {
              id: newSession.id,
              name: newSession.state?.session_name || "New conversation",
              lastMessage: "New conversation",
              timestamp: Date.now(),
            },
          ])

          setActiveChat(newSession.id)
        } catch (e) {
          console.error("Failed to create fallback session:", e)
        }
      }
    }

    loadSessions()
  }, [mounted, activeChat])

  // Helper function to extract the last message from a session
  const getLastMessageFromSession = (session: any) => {
    if (session?.events && Array.isArray(session.events) && session.events.length > 0) {
      const userEvents = session.events.filter((event: any) => event.author === "user")
      if (userEvents.length > 0) {
        const lastUserEvent = userEvents[userEvents.length - 1]
        if (lastUserEvent?.content?.parts?.[0]?.text) {
          return lastUserEvent.content.parts[0].text
        }
      }
    }
    return "New conversation"
  }

  // Group sessions by date
  const groupedSessions = sessions.reduce(
    (acc, session) => {
      const date = new Date(session.timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Calculate the start of this week (Sunday)
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())

      let dateLabel
      if (date.toDateString() === today.toDateString()) {
        dateLabel = "Today"
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateLabel = "Yesterday"
      } else if (date >= startOfWeek) {
        dateLabel = "This week"
      } else {
        dateLabel = date.toLocaleDateString()
      }

      if (!acc[dateLabel]) {
        acc[dateLabel] = []
      }
      acc[dateLabel].push(session)
      return acc
    },
    {} as Record<string, typeof sessions>,
  )

  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    setActiveChat(sessionId)
    apiClient.setSessionId(sessionId)
    localStorage.setItem("currentSessionId", sessionId)
    // Reload the page to refresh the chat
    window.location.reload()
  }

  // Update the handleNewSession function
  const handleNewSession = async () => {
    try {
      setIsLoading(true)
      const newSession = await apiClient.createSession("New session")

      if (!newSession || !newSession.id) {
        throw new Error("Failed to create session: Invalid response")
      }

      apiClient.setSessionId(newSession.id)
      localStorage.setItem("currentSessionId", newSession.id)

      // Add the new session to the list
      setSessions((prev) => [
        {
          id: newSession.id,
          name: newSession.state?.session_name || "New conversation",
          lastMessage: "New conversation",
          timestamp: Date.now(),
        },
        ...prev,
      ])

      setActiveChat(newSession.id)
      setIsLoading(false)

      // Reload the page to refresh the chat and focus on input
      window.location.reload()
    } catch (error) {
      console.error("Failed to create new session:", error)
      setIsLoading(false)

      // Create a mock session ID as fallback
      const mockSessionId = `mock-${Date.now()}`
      apiClient.setSessionId(mockSessionId)
      localStorage.setItem("currentSessionId", mockSessionId)
      window.location.reload()
    }
  }

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader className="flex flex-col gap-2 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center px-2 py-1">{mounted && <ThemeAwareLogo className="h-6 w-auto" />}</div>
            <Button variant="ghost" size="icon" onClick={handleNewSession} disabled={isLoading} title="New chat">
              <Plus className="h-5 w-5" />
              <span className="sr-only">New chat</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-y-auto px-1">
          {/* Sample Navigation Menu */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Chat Sessions */}
          <SidebarGroup>
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Loading sessions...</span>
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Could not load sessions. Using a temporary session instead.
                  </p>
                  <Button variant="link" size="sm" onClick={handleNewSession} className="mt-2">
                    Start new chat
                  </Button>
                </div>
              ) : (
                Object.entries(groupedSessions).map(([date, dateSessions]) => (
                  <div key={date} className="mb-4">
                    <h2 className="mb-2 px-3 pt-2 text-xs text-muted-foreground">{date}</h2>
                    <SidebarMenu className="space-y-1.5">
                      {dateSessions.map((session) => (
                        <SidebarMenuItem key={session.id}>
                          <SidebarMenuButton
                            isActive={session.id === activeChat}
                            onClick={() => handleSessionSelect(session.id)}
                            className="group relative justify-between py-3 px-3"
                          >
                            <div className="flex items-center">
                              <MessageSquare className="mr-3 h-4 w-4" />
                              <span className="truncate">{session.name || "New conversation"}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 data-[active=true]:opacity-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </div>
                ))
              )}

              {!isLoading && !error && sessions.length === 0 && (
                <div className="mt-8 px-3 text-center">
                  <p className="text-xs text-muted-foreground">No chat history yet. Start a new conversation!</p>
                </div>
              )}

              {!isLoading && !error && sessions.length > 0 && (
                <div className="mt-8 px-3 text-center">
                  <p className="text-xs text-muted-foreground">You have reached the end of your chat history.</p>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/profile-image.png" alt="Miko" />
                    <AvatarFallback className="bg-purple-600 text-xs">M</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">miko@lucident.ai</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
