"use client"

import {useSession} from '@/lib/session-context';
import { useChat, Message } from "ai/react"
import {RedirectType} from 'next/dist/client/components/redirect-error';
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "@/components/chat-message"
import { ArrowUp, Paperclip, Plus } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Session } from "@/lib/api-client"
import {redirect, useRouter} from "next/navigation"


interface ChatProps {
  session: Session
}

type ChatMessageType = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

export function Chat({ session }: ChatProps) {
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
  const { refreshSessions } = useSession();
  const router = useRouter()

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

    // Focus on the input field
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    // Set the session ID
    apiClient.setSessionId(session.id)

    // Convert session events to messages if they exist
    if (session.events && session.events.length > 0) {
      const initialMessages: Message[] = session.events.map(event => ({
        id: event.id,
        role: event.author === "user" ? "user" : "assistant",
        content: event.content?.parts?.[0]?.text || ""
      }))
      setMessages(initialMessages)
    } else {
      setMessages([])
    }
  }, [session, setMessages])

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
    handleSubmit(new Event("submit") as any)
  }

  // Create a new chat session
  const handleNewChat = async () => {
    try {
      const newSession = await apiClient.createSession()
      refreshSessions()
      router.push(`/?session=${newSession.id}`)
    } catch (error) {
      console.error("Failed to create new session:", error)
    }
  }

  // Convert AI messages to ChatMessageType
  const convertMessage = (message: Message): ChatMessageType => ({
    id: message.id,
    role: message.role === "data" ? "assistant" : message.role,
    content: message.content
  })

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
              messages.map((message) => <ChatMessage key={message.id} message={convertMessage(message)} />)
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
