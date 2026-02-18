"use client"

import { useEffect, useCallback } from "react"

export interface ShortcutConfig {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  description: string
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return
      }

      const shortcut = shortcuts.find((s) => {
        const keyMatch = event.key.toLowerCase() === s.key.toLowerCase()
        const ctrlMatch = !!s.ctrl === event.ctrlKey
        const altMatch = !!s.alt === event.altKey
        const shiftMatch = !!s.shift === event.shiftKey
        return keyMatch && ctrlMatch && altMatch && shiftMatch
      })

      if (shortcut) {
        event.preventDefault()
        shortcut.action()
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

export function useKeyboardShortcutHelp() {
  return [
    { key: "1", description: "Overview" },
    { key: "2", description: "Lone Star Lighting" },
    { key: "3", description: "RedFox CRM" },
    { key: "4", description: "Heroes of the Meta" },
    { key: "5", description: "Agent Network" },
    { key: "6", description: "Analytics" },
    { key: "7", description: "Systems" },
    { key: "?", description: "Toggle shortcuts help" },
    { key: "n", description: "New lead" },
    { key: "t", description: "New task" },
    { key: "e", description: "Check email" },
    { key: "r", description: "Refresh data" },
  ]
}
