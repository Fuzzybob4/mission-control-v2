"use client"

import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import type { PendingSkillAction, PendingSkillRecord } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { Check, Loader2, User, UserPlus, X } from "lucide-react"
import { useMemo, useState, useTransition } from "react"

interface PendingSkillsPanelProps {
  initialSkills: PendingSkillRecord[]
}

export function PendingSkillsPanel({ initialSkills }: PendingSkillsPanelProps) {
  const [skills, setSkills] = useState(initialSkills)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const pendingCount = useMemo(() => skills.length, [skills])

  const handleAction = (skillId: string, action: PendingSkillAction) => {
    const skill = skills.find(s => s.id === skillId)
    if (!skill) return

    setPendingId(skillId)
    setErrorMessage(null)

    startTransition(async () => {
      try {
        const response = await fetch("/api/pending-skills/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: skillId, action }),
        })

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}))
          const message = errorPayload?.error || "Failed to update skill"
          setErrorMessage(message)
          return
        }

        setSkills(prev => prev.filter(item => item.id !== skillId))
      } catch (error) {
        console.error("[pending-skills]", error)
        setErrorMessage("Unexpected error while updating skill")
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <UserPlus className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-purple-200">Skill Intake</p>
            <h2 className="text-lg font-semibold text-white">Pending Skills</h2>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {pendingCount} awaiting approval
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {skills.length === 0 ? (
        <GlassCard>
          <GlassCardContent>
            <p className="text-sm text-gray-400">Inbox zero. No pending skill requests.</p>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {skills.map(skill => (
            <GlassCard key={skill.id} className="flex flex-col">
              <GlassCardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <GlassCardTitle>{skill.name}</GlassCardTitle>
                    <p className="text-xs uppercase tracking-wide text-blue-300">{skill.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <User className="w-3.5 h-3.5" />
                    {skill.requested_by}
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent className="flex-1 space-y-3">
                <p className="text-sm text-gray-300">{skill.description}</p>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Install</p>
                  <code className="block rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-blue-200">
                    {skill.install_command}
                  </code>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <span>
                    Requested{" "}
                    {skill.created_at
                      ? formatDistanceToNow(new Date(skill.created_at), { addSuffix: true })
                      : "just now"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={() => handleAction(skill.id, "approve")}
                    disabled={isPending && pendingId === skill.id}
                    className="flex-1"
                  >
                    {isPending && pendingId === skill.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleAction(skill.id, "deny")}
                    disabled={isPending && pendingId === skill.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isPending && pendingId === skill.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" /> Deny
                      </>
                    )}
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      )}
    </section>
  )
}
