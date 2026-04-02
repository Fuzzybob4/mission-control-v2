"use client"

import { createContext, useContext, useState } from "react"

export interface SelectedElement {
  xpath: string
  outerHTML: string
  tagName: string
  textContent: string
  componentHint: string
}

interface DesignModeContextType {
  isDesignMode: boolean
  setDesignMode: (val: boolean) => void
  selectedElement: SelectedElement | null
  setSelectedElement: (el: SelectedElement | null) => void
}

const DesignModeContext = createContext<DesignModeContextType>({
  isDesignMode: false,
  setDesignMode: () => {},
  selectedElement: null,
  setSelectedElement: () => {},
})

export function DesignModeProvider({ children }: { children: React.ReactNode }) {
  const [isDesignMode, setDesignMode] = useState(false)
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)

  return (
    <DesignModeContext.Provider value={{ isDesignMode, setDesignMode, selectedElement, setSelectedElement }}>
      {children}
    </DesignModeContext.Provider>
  )
}

export function useDesignMode() {
  return useContext(DesignModeContext)
}
