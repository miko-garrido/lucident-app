"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { apiClient } from "@/lib/api-client"

interface Session {
  id: string
  name: string
  lastMessage: string
  timestamp: number
}

interface SessionContextType {
  sessions: Session[]
  isLoading: boolean
  error: string | null
  activeSession: string | null
  setActiveSession: (sessionId: string | null) => void
  createSession: (name?: string) => Promise<Session>
  deleteSession: (sessionId: string) => Promise<void>
  refreshSessions: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const defaultConversationName = "New conversation"

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSession, setActiveSession] = useState<string | null>(null)

  const loadSessions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const sessionList = await apiClient.listSessions()

      if (sessionList && sessionList.length > 0) {
        const formattedSessions = sessionList
          .map((session) => ({
            id: session.id,
            name: session.state?.session_name || defaultConversationName,
            lastMessage: getLastMessageFromSession(session) || defaultConversationName,
            timestamp: session.last_update_time || Date.now(),
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
        setSessions(formattedSessions)
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
      setError("Failed to load sessions")
    } finally {
      setIsLoading(false)
    }
  }

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
    return defaultConversationName
  }

  const createSession = async (name?: string) => {
    try {
      const newSession = await apiClient.createSession(name || defaultConversationName)

      if (!newSession || !newSession.id) {
        throw new Error("Failed to create session: Invalid response")
      }

      const session: Session = {
        id: newSession.id,
        name: newSession.state?.session_name || defaultConversationName,
        lastMessage: defaultConversationName,
        timestamp: Date.now() / 1000,
      }

      setSessions((prev) => [session, ...prev])
      setActiveSession(newSession.id)
      apiClient.setSessionId(newSession.id)

      return session
    } catch (error) {
      console.error("Failed to create new session:", error)
      throw error
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await apiClient.deleteSession(sessionId)
      setSessions((prev) => prev.filter((session) => session.id !== sessionId))

      if (sessionId === activeSession) {
        const newSession = await createSession()
        setActiveSession(newSession.id)
      }
    } catch (error) {
      console.error("Failed to delete session:", error)
      throw error
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const value = {
    sessions,
    isLoading,
    error,
    activeSession,
    setActiveSession,
    createSession,
    deleteSession,
    refreshSessions: loadSessions,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
} 