'use client'
import { Rocket, ExternalLink, Loader2 } from 'lucide-react'

export default function VercelDeploy({ onDeploy, isDeploying, liveUrl }) {
  if (liveUrl) {
    return (
      <a
        href={liveUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-cyan-900/20 w-full whitespace-nowrap"
      >
        <ExternalLink className="w-4 h-4" />
        Open Live Site
      </a>
    )
  }

  return (
    <button
      onClick={onDeploy}
      disabled={isDeploying}
      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 rounded-xl font-medium transition-all w-full whitespace-nowrap"
    >
      {isDeploying ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Deploying...
        </>
      ) : (
        <>
          <Rocket className="w-4 h-4" />
          Deploy to Vercel
        </>
      )}
    </button>
  )
}
