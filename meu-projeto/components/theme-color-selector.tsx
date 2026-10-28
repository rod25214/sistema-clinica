"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useThemeColor } from "@/hooks/use-theme-color"
import { Moon, Sun, Monitor, Palette, Check, Circle } from "lucide-react"

const colorThemes = [
  { name: "blue", label: "Azul", color: "hsl(210, 100%, 50%)" },
  { name: "green", label: "Verde", color: "hsl(142, 76%, 36%)" },
  { name: "purple", label: "Roxo", color: "hsl(262, 83%, 58%)" },
  { name: "orange", label: "Laranja", color: "hsl(25, 95%, 53%)" },
  { name: "red", label: "Vermelho", color: "hsl(0, 72%, 51%)" },
  { name: "pink", label: "Rosa", color: "hsl(330, 81%, 60%)" },
  { name: "monochrome", label: "Adaptativo", color: "currentColor",  },
] 

export function ThemeColorSelector() {
  const { theme, colorTheme, setTheme, setColorTheme, resolvedTheme } = useThemeColor()
  const [open, setOpen] = useState(false)

  const getThemeIcon = () => {
    if (theme === "dark") return <Moon className="h-4 w-4" />
    if (theme === "light") return <Sun className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  const getCurrentColorTheme = () => {
    return colorThemes.find((c) => c.name === colorTheme) || colorThemes[0]
  }

  const getDisplayColor = (colorThemeItem: (typeof colorThemes)[0]) => {
    if ((colorThemeItem as any).isAdaptive) {
      return resolvedTheme === "dark" ? "#ffffff" : "#000000"
    }
    return colorThemeItem.color
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          {getThemeIcon()}
          <div
            className="w-3 h-3 rounded-full border border-border"
            style={{ backgroundColor: getDisplayColor(getCurrentColorTheme()) }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Tema</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                Claro
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                Escuro
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="gap-2"
              >
                <Monitor className="h-4 w-4" />
                Sistema
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Cor de Destaque
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {colorThemes.map((color) => (
                <Button
                  key={color.name}
                  variant={colorTheme === color.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setColorTheme(color.name as any)}
                  className={`gap-2 justify-start ${colorTheme === color.name ? "text-primary-foreground" : ""}`}
                >
                  {((color as any).isAdaptive) ? (
                    <Circle className="h-3 w-3" style={{ color: getDisplayColor(color) }} />
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: color.color }}
                    />
                  )}
                  {color.label}
                  {colorTheme === color.name && <Check className="h-3 w-3 ml-auto" />}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Tema atual: <span className="font-medium">{resolvedTheme === "light" ? "Claro" : "Escuro"}</span> • Cor:{" "}
              <span className="font-medium">{getCurrentColorTheme().label}</span>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
