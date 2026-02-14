"use client"

import { useState } from "react"
import { Plus, Mail, FileText, Zap } from "lucide-react"

interface QuickActionsProps {
  onNewLead?: () => void
  onCheckEmail?: () => void
  onNewTask?: () => void
}

export function QuickActions({ onNewLead, onCheckEmail, onNewTask }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { 
      id: "lead", 
      label: "New Lead", 
      icon: Plus, 
      color: "bg-emerald-500 hover:bg-emerald-600",
      onClick: onNewLead 
    },
    { 
      id: "email", 
      label: "Check Email", 
      icon: Mail, 
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: onCheckEmail 
    },
    { 
      id: "task", 
      label: "New Task", 
      icon: FileText, 
      color: "bg-violet-500 hover:bg-violet-600",
      onClick: onNewTask 
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Action Buttons */}
      <div className={`flex flex-col-reverse gap-2 mb-2 transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={() => {
                action.onClick?.()
                setIsOpen(false)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg transition-all hover:scale-105 ${action.color}`}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </button>
          )
        })}
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 ${isOpen ? 'bg-red-500 hover:bg-red-600 rotate-45' : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        <Zap className="w-6 h-6" />
      </button>
    </div>
  )
}
