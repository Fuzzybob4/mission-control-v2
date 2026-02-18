"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const toggleVisibility = () => {
      // Get scroll position
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      
      // Show button when scrolled down more than 300px
      setIsVisible(scrollTop > 300)
      
      // Calculate scroll progress (0-100)
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      setScrollProgress(progress)
    }

    // Check initial scroll position
    toggleVisibility()

    // Add scroll event listener
    window.addEventListener("scroll", toggleVisibility, { passive: true })
    
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Calculate circumference for progress ring
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 left-6 z-50 flex items-center justify-center",
        "w-12 h-12 rounded-full transition-all duration-300 ease-out",
        "bg-slate-900/90 backdrop-blur-sm border border-white/10 shadow-lg",
        "hover:bg-slate-800 hover:border-white/20 hover:scale-110",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      {/* Progress Ring Background */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 48 48"
      >
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        {/* Progress circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-blue-400 transition-all duration-150"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      
      {/* Arrow Icon */}
      <ArrowUp className={cn(
        "w-5 h-5 transition-transform duration-200",
        "text-gray-300 hover:text-white"
      )} />
      
      {/* Tooltip on hover */}
      <span className="absolute left-full ml-3 px-2 py-1 text-xs text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Back to top
      </span>
    </button>
  )
}
