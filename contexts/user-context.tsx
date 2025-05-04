"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type UserContextType = {
  userId: string | null
  setUserId: (id: string | null) => void
  apiKey: string | null
  setApiKey: (key: string | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)

  return <UserContext.Provider value={{ userId, setUserId, apiKey, setApiKey }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
