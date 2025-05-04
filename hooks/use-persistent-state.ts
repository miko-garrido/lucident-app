"use client"

import { useState, useEffect } from "react"

export function usePersistentState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialValue)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setState(JSON.parse(item))
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
  }, [key])

  // Save to localStorage on change
  const setPersistedState = (value: T) => {
    try {
      setState(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  return [state, setPersistedState]
}
