"use client"

import { useState } from "react"
import { useDesignMode } from "./design-mode-context"

type Status = "idle" | "loading" | "success" | "error"

export function DesignModePanel() {
  const { selectedElement, setSelectedElement } = useDesignMode()
  const [instruction, setInstruction] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const isOpen = !!selectedElement

  function handleClose() {
    setSelectedElement(null)
    setInstruction("")
    setStatus("idle")
    setErrorMsg("")
  }

  async function handleSubmit() {
    if (!instruction.trim() || !selectedElement) return
    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/design-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, elementInfo: selectedElement }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus("success")
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setStatus("error")
        setErrorMsg(data.error || "Unknown error")
      }
    } catch (err) {
      setStatus("error")
      setErrorMsg(String(err))
    }
  }

  return (
    <div
      data-design-mode-ui
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "400px",
        zIndex: 9998,
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "rgba(10, 14, 26, 0.95)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(0, 229, 255, 0.3)",
        boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(0, 229, 255, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-orbitron), monospace",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "#00e5ff",
            textShadow: "0 0 15px rgba(0, 229, 255, 0.5)",
            margin: 0,
          }}
        >
          EDIT ELEMENT
        </h2>
        <button
          onClick={handleClose}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: 1,
            padding: "4px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        {selectedElement && (
          <>
            {/* Element info */}
            <div
              style={{
                padding: "12px",
                background: "rgba(0, 229, 255, 0.05)",
                border: "1px solid rgba(0, 229, 255, 0.15)",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    color: "rgba(0, 229, 255, 0.6)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Tag:
                </span>
                <code
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#00e5ff",
                    background: "rgba(0, 229, 255, 0.1)",
                    padding: "1px 6px",
                    borderRadius: "3px",
                  }}
                >
                  &lt;{selectedElement.tagName}&gt;
                </code>
                {selectedElement.componentHint && (
                  <code
                    style={{
                      fontFamily: "monospace",
                      fontSize: "11px",
                      color: "#ff006e",
                      background: "rgba(255, 0, 110, 0.1)",
                      border: "1px solid rgba(255, 0, 110, 0.3)",
                      padding: "1px 6px",
                      borderRadius: "3px",
                    }}
                  >
                    {selectedElement.componentHint}
                  </code>
                )}
              </div>
              {selectedElement.textContent && (
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.5)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  "{selectedElement.textContent}"
                </p>
              )}
            </div>

            {/* Instruction textarea */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "monospace",
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(0, 229, 255, 0.6)",
                  marginBottom: "8px",
                }}
              >
                Describe the change
              </label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Describe the change you want..."
                disabled={status === "loading" || status === "success"}
                rows={5}
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(0, 229, 255, 0.25)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0, 229, 255, 0.6)"
                  e.target.style.boxShadow = "0 0 10px rgba(0, 229, 255, 0.1)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 229, 255, 0.25)"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>
          </>
        )}

        {/* Status messages */}
        {status === "loading" && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "rgba(0, 229, 255, 0.8)", fontFamily: "monospace", fontSize: "13px" }}>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
            Casting spell...
          </div>
        )}
        {status === "success" && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#00ff88", fontFamily: "monospace", fontSize: "13px" }}>
            <span>✓</span>
            Change applied! Reloading...
          </div>
        )}
        {status === "error" && (
          <div
            style={{
              padding: "10px 12px",
              background: "rgba(255, 50, 50, 0.1)",
              border: "1px solid rgba(255, 50, 50, 0.3)",
              borderRadius: "6px",
              color: "#ff6b6b",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            {errorMsg}
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(0, 229, 255, 0.1)",
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={!instruction.trim() || status === "loading" || status === "success"}
          style={{
            flex: 1,
            padding: "10px 16px",
            background: instruction.trim() && status === "idle" ? "rgba(0, 229, 255, 0.1)" : "rgba(0, 229, 255, 0.03)",
            border: `1px solid ${instruction.trim() && status === "idle" ? "rgba(0, 229, 255, 0.6)" : "rgba(0, 229, 255, 0.2)"}`,
            borderRadius: "8px",
            color: instruction.trim() && status === "idle" ? "#00e5ff" : "rgba(0, 229, 255, 0.3)",
            fontFamily: "var(--font-orbitron), monospace",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: instruction.trim() && status === "idle" ? "pointer" : "not-allowed",
            boxShadow: instruction.trim() && status === "idle" ? "0 0 15px rgba(0, 229, 255, 0.2)" : "none",
            transition: "all 0.2s",
          }}
        >
          APPLY CHANGE ⚡
        </button>
        <button
          onClick={handleClose}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "monospace",
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            ;(e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)"
            ;(e.target as HTMLElement).style.color = "rgba(255,255,255,0.7)"
          }}
          onMouseLeave={(e) => {
            ;(e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"
            ;(e.target as HTMLElement).style.color = "rgba(255,255,255,0.4)"
          }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
