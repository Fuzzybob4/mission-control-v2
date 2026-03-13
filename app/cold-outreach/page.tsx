import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ColdOutreachBoard } from "@/components/cold-outreach-board"

export default function ColdOutreachPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mission Control
        </Link>

        <ColdOutreachBoard />
      </div>
    </div>
  )
}
