"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

interface ThemeAwareLogoProps {
  className?: string
  width?: number
  height?: number
}

export function ThemeAwareLogo({ className = "h-6 w-auto", width = 125, height = 173 }: ThemeAwareLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the logo based on the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
    return <div className={className} />
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme
  // Use the new logo files
  const logoSrc = currentTheme === "dark" ? "/small_logo_dark_mode.svg" : "/small_logo_light_mode.svg"

  return (
    <Image
      src={logoSrc || "/placeholder.svg"}
      alt="Lucident Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
