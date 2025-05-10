"use client"

import {useEffect, useState} from "react"
import { MessageSquare, Plus, MoreVertical, Home, Settings, Search, Trash2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { SettingsModal } from "@/components/settings-modal"
import { useSession } from "@/lib/session-context"

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

const defaultConversationName = "New conversation"

export function AppSidebar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSessionId = searchParams.get('session') as string | undefined
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    sessions,
    isLoading,
    error,
    activeSession,
    setActiveSession,
    createSession,
    deleteSession,
  } = useSession()

  // Group sessions by date
  const groupedSessions = sessions.reduce(
    (acc, session) => {
      const date = new Date(session.timestamp * 1000)
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

  useEffect(()=> {
    setActiveSession(currentSessionId || sessions[0]?.id || "")
  }, [currentSessionId])
  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    setActiveSession(sessionId)
    router.push(`/?session=${sessionId}`)
  }

  // Handle new session creation
  const handleNewSession = async () => {
    try {
      const newSession = await createSession()
      router.push(`/?session=${newSession.id}`)
    } catch (error) {
      console.error("Failed to create new session:", error)
    }
  }

  // Handle session deletion
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return

    try {
      setIsDeleting(true)
      await deleteSession(sessionToDelete)
    } catch (error) {
      console.error("Failed to delete session:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSessionToDelete(null)
    }
  }

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader className="flex flex-col gap-2 px-3 py-2">
          <div className="flex items-center justify-between">
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
                        <item.icon className="h-4 w-4"/>
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
                            isActive={session.id === activeSession}
                            onClick={() => handleSessionSelect(session.id)}
                            className="group relative justify-between py-3 px-3"
                          >
                            <div className="flex items-center">
                              <MessageSquare className="mr-3 h-4 w-4" />
                              <span className="truncate">{session.name || defaultConversationName}</span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 data-[active=true]:opacity-100"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                  }}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive cursor-pointer focus:text-destructive"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    setSessionToDelete(session.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat session
              and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
