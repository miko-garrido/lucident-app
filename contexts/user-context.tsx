"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type UserContextType = {
  userId: string | null
  setUserId: (id: string | null) => void
  // Remove apiKey related fields
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  // Remove apiKey state

  return <UserContext.Provider value={{ userId, setUserId }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
