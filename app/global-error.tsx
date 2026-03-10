"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
          <p className="text-sm text-gray-400">{error.message}</p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
