"use client"

import { useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"
type ColorTheme = "blue" | "green" | "purple" | "orange" | "red" | "pink" | "monochrome"

export function useThemeColor() {
  const [theme, setThemeState] = useState<Theme>("system")
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("blue")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as Theme | null
    const savedColorTheme = localStorage.getItem("colorTheme") as ColorTheme | null
    
    if (savedTheme) setThemeState(savedTheme)
    if (savedColorTheme) setColorThemeState(savedColorTheme)
  }, [])

  const resolvedTheme = 
    theme === "system" 
      ? (mounted && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)

    // Apply color theme CSS variables using oklch format
    // oklch(lightness chroma hue)
    const colorVars: Record<ColorTheme, { primary: string; primaryFg: string }> = {
      blue:        { primary: "oklch(0.55 0.22 250)",  primaryFg: "oklch(0.985 0 0)" },
      green:       { primary: "oklch(0.52 0.18 145)",  primaryFg: "oklch(0.985 0 0)" },
      purple:      { primary: "oklch(0.55 0.24 300)",  primaryFg: "oklch(0.985 0 0)" },
      orange:      { primary: "oklch(0.65 0.20 55)",   primaryFg: "oklch(0.985 0 0)" },
      red:         { primary: "oklch(0.52 0.22 25)",   primaryFg: "oklch(0.985 0 0)" },
      pink:        { primary: "oklch(0.60 0.22 350)",  primaryFg: "oklch(0.985 0 0)" },
      monochrome:  resolvedTheme === "dark"
        ? { primary: "oklch(0.985 0 0)", primaryFg: "oklch(0.145 0 0)" }
        : { primary: "oklch(0.205 0 0)", primaryFg: "oklch(0.985 0 0)" },
    }

    const colors = colorVars[colorTheme]
    root.style.setProperty("--primary", colors.primary)
    root.style.setProperty("--primary-foreground", colors.primaryFg)
  }, [theme, colorTheme, resolvedTheme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme)
    localStorage.setItem("colorTheme", newColorTheme)
  }

  return {
    theme,
    colorTheme,
    setTheme,
    setColorTheme,
    resolvedTheme,
  }
}
