"use client"

import { useState } from "react"
import { X, Keyboard } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { useKeyboardShortcutHelp } from "@/hooks/use-keyboard-shortcuts"

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const shortcuts = useKeyboardShortcutHelp()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid gap-2">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5"
              >
                <span className="text-sm text-gray-300">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs font-mono font-semibold bg-white/10 rounded border border-white/20 text-white min-w-[1.5rem] text-center">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500 text-center">
            Press <kbd className="px-1 py-0.5 bg-white/10 rounded">?</kbd> anytime to toggle this help
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
