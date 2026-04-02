"use client"

import { useEffect, useRef } from "react"
import { useDesignMode, SelectedElement } from "./design-mode-context"

function getXPath(el: Element): string {
  if (el.id) return `//*[@id="${el.id}"]`
  const parts: string[] = []
  let current: Element | null = el
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1
    let sibling = current.previousElementSibling
    while (sibling) {
      if (sibling.tagName === current.tagName) index++
      sibling = sibling.previousElementSibling
    }
    parts.unshift(`${current.tagName.toLowerCase()}[${index}]`)
    current = current.parentElement
  }
  return "/" + parts.join("/")
}

function getComponentHint(el: Element): string {
  let current: Element | null = el
  while (current) {
    const hint = current.getAttribute("data-component")
    if (hint) return hint
    current = current.parentElement
  }
  return ""
}

export function DesignModeOverlay() {
  const { isDesignMode, setSelectedElement } = useDesignMode()
  const hoveredRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!isDesignMode) return

    const tooltip = document.createElement("div")
    tooltip.id = "design-mode-tooltip"
    tooltip.style.cssText = `
      position: fixed;
      z-index: 9998;
      padding: 3px 8px;
      background: rgba(0, 229, 255, 0.9);
      color: #000;
      font-family: monospace;
      font-size: 11px;
      font-weight: bold;
      border-radius: 4px;
      pointer-events: none;
      display: none;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `
    document.body.appendChild(tooltip)

    function onMouseMove(e: MouseEvent) {
      const target = e.target as Element
      if (!target || target === document.body || target === document.documentElement) return
      if (target.closest("[data-design-mode-ui]")) return

      if (hoveredRef.current && hoveredRef.current !== target) {
        ;(hoveredRef.current as HTMLElement).style.outline = ""
        ;(hoveredRef.current as HTMLElement).style.outlineOffset = ""
      }

      hoveredRef.current = target
      ;(target as HTMLElement).style.outline = "2px solid #00e5ff"
      ;(target as HTMLElement).style.outlineOffset = "1px"

      tooltip.style.display = "block"
      tooltip.style.left = `${e.clientX + 12}px`
      tooltip.style.top = `${e.clientY - 28}px`
      tooltip.textContent = `<${target.tagName.toLowerCase()}>`
    }

    function onMouseLeave() {
      if (hoveredRef.current) {
        ;(hoveredRef.current as HTMLElement).style.outline = ""
        ;(hoveredRef.current as HTMLElement).style.outlineOffset = ""
        hoveredRef.current = null
      }
      tooltip.style.display = "none"
    }

    function onClick(e: MouseEvent) {
      const target = e.target as Element
      if (!target) return
      if (target.closest("[data-design-mode-ui]")) return

      e.preventDefault()
      e.stopPropagation()

      const info: SelectedElement = {
        xpath: getXPath(target),
        outerHTML: target.outerHTML.slice(0, 500),
        tagName: target.tagName.toLowerCase(),
        textContent: (target.textContent || "").slice(0, 200).trim(),
        componentHint: getComponentHint(target),
      }

      setSelectedElement(info)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseleave", onMouseLeave)
    document.addEventListener("click", onClick, true)

    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseleave", onMouseLeave)
      document.removeEventListener("click", onClick, true)
      if (hoveredRef.current) {
        ;(hoveredRef.current as HTMLElement).style.outline = ""
        hoveredRef.current = null
      }
      tooltip.remove()
    }
  }, [isDesignMode, setSelectedElement])

  if (!isDesignMode) return null

  return (
    <div
      data-design-mode-ui
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9997,
        padding: "10px 20px",
        background: "rgba(255, 0, 110, 0.9)",
        color: "#fff",
        fontFamily: "var(--font-orbitron), monospace",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textAlign: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      ⚡ DESIGN MODE ACTIVE — Click any element to edit it
    </div>
  )
}
