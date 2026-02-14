import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function GlassCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-4 border-b border-white/10", className)}>
      {children}
    </div>
  )
}

export function GlassCardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-sm font-semibold text-white", className)}>
      {children}
    </h3>
  )
}

export function GlassCardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  )
}
