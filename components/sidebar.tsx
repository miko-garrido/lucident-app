"use client"

import { useState } from "react"
import { MessageSquare, Plus, MoreVertical } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SettingsModal } from "@/components/settings-modal"

export function AppSidebar() {
  const [activeChat, setActiveChat] = useState("Progress on Decoded")
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Sample chat data - in a real app, this would come from a database
  const chatSessions = [
    { id: "1", name: "Progress on Decoded", active: true, date: "Today" },
    { id: "2", name: "Jam's tracked time", active: false, date: "Today" },
    { id: "3", name: "Design team overdues", active: false, date: "Yesterday" },
    { id: "4", name: "Upcoming milestones", active: false, date: "Yesterday" },
  ]

  // Group chats by date
  const groupedChats = chatSessions.reduce((acc, chat) => {
    if (!acc[chat.date]) {
      acc[chat.date] = []
    }
    acc[chat.date].push(chat)
    return acc
  }, {})

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader className="flex flex-col gap-2 px-3 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Lucident</h1>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-y-auto px-1">
          {Object.entries(groupedChats).map(([date, chats]) => (
            <div key={date} className="mb-4">
              <h2 className="mb-2 px-3 pt-2 text-xs text-muted-foreground">{date}</h2>
              <SidebarMenu className="space-y-1.5">
                {chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      isActive={chat.name === activeChat}
                      onClick={() => setActiveChat(chat.name)}
                      className="group relative justify-between py-3 px-3"
                    >
                      <div className="flex items-center">
                        <MessageSquare className="mr-3 h-4 w-4" />
                        <span>{chat.name}</span>
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
          ))}
          <div className="mt-8 px-3 text-center">
            <p className="text-xs text-muted-foreground">You have reached the end of your chat history.</p>
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-purple-600 text-xs">M</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">miko+test1@dorxata.com</span>
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
