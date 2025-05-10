"use client"

import { useChat } from "ai/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "@/components/chat-message"
import { ArrowUp, Paperclip, Plus } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    onResponse: (response) => {
      // You can handle the response here if needed
      console.log("Chat response received")
    },
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [sessions, setSessions] = useState<Array<{ id: string; lastMessage: string }>>([])

  // Example suggested prompts
  const suggestedPrompts = [
    {
      title: "Project status",
      subtitle: "What's the current status of our projects?",
    },
    {
      title: "Team performance",
      subtitle: "How is our team performing this month?",
    },
    {
      title: "Resource allocation",
      subtitle: "How should we allocate resources?",
    },
    {
      title: "Risk assessment",
      subtitle: "What risks should we be aware of?",
    },
  ]

  // Initialize session on mount
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)

      // Focus on the input field
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)

      // Initialize a session or load existing sessions
      const initializeSession = async () => {
        try {
          // Check if there's a session ID in localStorage
          const savedSessionId = localStorage.getItem("currentSessionId")
          console.log('savedSessionId', savedSessionId)
          if (savedSessionId) {
            // Try to get the session details
            const session = await apiClient.getSession(savedSessionId)

            if (session) {
              // Session exists, we can use it
              apiClient.setSessionId(savedSessionId)
            } else {
              // Session doesn't exist, remove from localStorage and create a new one
              localStorage.removeItem("currentSessionId")
              const newSession = await apiClient.createSession()
              apiClient.setSessionId(newSession.id)
              localStorage.setItem("currentSessionId", newSession.id)
            }
          } else {
            // No saved session, list available sessions
            const sessionList = await apiClient.listSessions()

            if (sessionList.length > 0) {
              // Use the most recent session
              const latestSession = sessionList[0]
              apiClient.setSessionId(latestSession.id)
              localStorage.setItem("currentSessionId", latestSession.id)
            } else {
              // Create a new session
              const newSession = await apiClient.createSession()
              apiClient.setSessionId(newSession.id)
              localStorage.setItem("currentSessionId", newSession.id)
            }
          }
        } catch (error) {
          console.error("Failed to initialize session:", error)

          // Create a new session as fallback
          try {
            const newSession = await apiClient.createSession()
            apiClient.setSessionId(newSession.id)
            localStorage.setItem("currentSessionId", newSession.id)
          } catch (e) {
            console.error("Failed to create fallback session:", e)
          }
        }
      }

      initializeSession()
    }
  }, [isMounted])

  // Helper function to extract the last message from a session
  const getLastMessageFromSession = (session: any) => {
    if (session?.events && Array.isArray(session.events) && session.events.length > 0) {
      const lastEvent = session.events[session.events.length - 1]
      if (lastEvent?.content?.parts?.[0]?.text) {
        return lastEvent.content.parts[0].text
      }
    }
    return "New conversation"
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  const handlePromptClick = (prompt: string) => {
    const fullPrompt = prompt.replace("\n", " ")
    handleSubmit(new Event("submit") as any, { prompt: fullPrompt })
  }

  // Create a new chat session
  const handleNewChat = async () => {
    try {
      const newSession = await apiClient.createSession()
      apiClient.setSessionId(newSession.id)
      localStorage.setItem("currentSessionId", newSession.id)
      // Reset the chat UI
      window.location.reload()
    } catch (error) {
      console.error("Failed to create new session:", error)
    }
  }

  return (
    <div className="flex h-full flex-col items-center">
      <div className="flex w-full max-w-3xl flex-1 flex-col px-4">
        <ScrollArea ref={scrollAreaRef} className="flex-1 py-6">
          <div className="space-y-6 pb-20" data-chat-messages>
            {messages.length === 0 ? (
              <div className="flex min-h-[30vh] flex-col items-start justify-center space-y-2">
                <h1 className="text-4xl font-bold">Hello there!</h1>
                <p className="text-2xl text-muted-foreground">How can I help you today?</p>
              </div>
            ) : (
              messages.map((message) => <ChatMessage key={message.id} message={message} />)
            )}
            {isLoading && messages.length > 0 && (
              <ChatMessage
                message={{
                  id: "loading",
                  role: "assistant",
                  content: "Thinking...",
                }}
                isLoading
              />
            )}
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                <p>Error: {error.message || "Something went wrong. Please try again."}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="sticky bottom-4 w-full space-y-4">
          {messages.length === 0 && (
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto justify-start p-4 text-left"
                  onClick={() => handlePromptClick(`${prompt.title} ${prompt.subtitle}`)}
                >
                  <div>
                    <div className="font-medium">{prompt.title}</div>
                    <div className="text-muted-foreground">{prompt.subtitle}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full bg-muted p-2 pl-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
              onClick={handleNewChat}
              title="New chat"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">New chat</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Send a message..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              autoComplete="off"
              autoFocus
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-8 w-8 shrink-0 rounded-full"
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
