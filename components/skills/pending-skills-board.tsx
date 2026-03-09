"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card"
import type { PendingSkillRecord, PendingSkillAction } from "@/types"

export type PendingSkill = PendingSkillRecord

interface PendingSkillsBoardProps {
  initialSkills: PendingSkill[]
}

export function PendingSkillsBoard({ initialSkills }: PendingSkillsBoardProps) {
  const router = useRouter()
  const [skills, setSkills] = useState(initialSkills)
  const [busySkillId, setBusySkillId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isRefreshing, startTransition] = useTransition()

  const handleAction = async (skillId: string, action: PendingSkillAction) => {
    setBusySkillId(skillId)
    setFeedback(null)

    try {
      const response = await fetch("/api/pending-skills/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: skillId, action }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to update pending skill")
      }

      setSkills((prev) => prev.filter((skill) => skill.id !== skillId))
      setFeedback({
        type: "success",
        message: action === "approve" ? "Skill approved and queued for install." : "Skill request denied.",
      })

      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error("[pending-skills-board]", error)
      setFeedback({ type: "error", message: (error as Error).message })
    } finally {
      setBusySkillId(null)
    }
  }

  if (!skills.length) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>No pending skills in the queue</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <p className="text-sm text-gray-400">
            Everything requested is either approved or shipped. New inbound skill requests will land here automatically from Supabase.
          </p>
          {feedback ? (
            <p className={`mt-4 text-sm ${feedback.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
              {feedback.message}
            </p>
          ) : null}
        </GlassCardContent>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {skills.map((skill) => (
          <GlassCard key={skill.id} className="flex flex-col">
            <GlassCardHeader className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <GlassCardTitle>{skill.name}</GlassCardTitle>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-300">
                  {skill.category || "Uncategorized"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span>Requested by {skill.requested_by || "unknown"}</span>
                <span className="text-white/20">•</span>
                <span>{skill.created_at ? new Date(skill.created_at).toLocaleString() : "—"}</span>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="flex-1 flex flex-col gap-4">
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {skill.description || "No description attached."}
              </p>
              {skill.install_command ? (
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Install command</p>
                  <code className="block rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-emerald-200">
                    {skill.install_command}
                  </code>
                </div>
              ) : null}
              <div className="mt-auto flex flex-wrap gap-3">
                <Button
                  onClick={() => handleAction(skill.id, "approve")}
                  disabled={busySkillId === skill.id || isRefreshing}
                  className="flex-1"
                >
                  {busySkillId === skill.id ? "Approving..." : "Approve & Deploy"}
                </Button>
                <Button
                  onClick={() => handleAction(skill.id, "deny")}
                  disabled={busySkillId === skill.id || isRefreshing}
                  variant="outline"
                  className="flex-1"
                >
                  {busySkillId === skill.id ? "Updating..." : "Deny"}
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>
      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}
    </div>
  )
}
