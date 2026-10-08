'use client'
import { Github, Loader2, ExternalLink } from 'lucide-react'

export default function GithubExport({ onExport, isExporting, repoUrl }) {
  return (
    <div className="w-full mt-4">
      {!repoUrl ? (
        <button
          onClick={onExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-600 transition-all disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              GitHub par bhej raha hai (20-30 seconds lagte hain)...
            </>
          ) : (
            <>
              <Github className="w-5 h-5 mr-2" />
              Push to GitHub & Ready for Vercel
            </>
          )}
        </button>
      ) : (
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center py-3 px-4 bg-[#10b981] hover:bg-[#34d399] text-[#0b1320] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          Repository Ready! Click karke Vercel par Deploy Karein
        </a>
      )}
    </div>
  )
}
