"use client"

import { useDesignMode } from "./design-mode-context"

export function DesignModeToggle() {
  const { isDesignMode, setDesignMode, setSelectedElement } = useDesignMode()

  function handleToggle() {
    if (isDesignMode) {
      setDesignMode(false)
      setSelectedElement(null)
    } else {
      setDesignMode(true)
    }
  }

  return (
    <button
      onClick={handleToggle}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        borderRadius: "12px",
        fontFamily: "var(--font-orbitron), monospace",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all 0.2s ease",
        ...(isDesignMode
          ? {
              background: "rgba(255, 0, 110, 0.2)",
              border: "1px solid #ff006e",
              color: "#ff006e",
              boxShadow: "0 0 20px rgba(255, 0, 110, 0.5), inset 0 0 20px rgba(255, 0, 110, 0.05)",
              animation: "design-mode-pulse 2s ease-in-out infinite",
            }
          : {
              background: "rgba(10, 14, 26, 0.85)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              color: "rgba(0, 229, 255, 0.8)",
              boxShadow: "0 0 10px rgba(0, 229, 255, 0.1)",
            }),
      }}
    >
      <span style={{ fontSize: "14px" }}>✏️</span>
      {isDesignMode ? "EXIT DESIGN MODE" : "DESIGN MODE"}
      <style>{`
        @keyframes design-mode-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 110, 0.5), inset 0 0 20px rgba(255, 0, 110, 0.05); }
          50% { box-shadow: 0 0 35px rgba(255, 0, 110, 0.8), inset 0 0 30px rgba(255, 0, 110, 0.1); }
        }
      `}</style>
    </button>
  )
}
