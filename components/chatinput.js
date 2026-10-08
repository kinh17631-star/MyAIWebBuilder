'use client'
import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

export default function ChatInput({ onSubmit, isLoading }) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt)
      setPrompt('') // Submit hone ke baad box clear ho jayega
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full relative shadow-[0_0_15px_rgba(16,185,129,0.1)] rounded-xl">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Kaisi website banani hai? (e.g. Ek gym ki dark theme Next.js website...)"
        className="w-full bg-[#111c2e] border border-gray-700 rounded-xl px-4 py-4 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-[#10b981] transition-colors resize-none h-28 text-sm md:text-base leading-relaxed"
        onKeyDown={(e) => {
          // Enter dabane par message send hoga, Shift+Enter par nayi line
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
      />
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="absolute bottom-3 right-3 p-2.5 bg-[#10b981] text-[#0b1320] rounded-lg hover:bg-[#34d399] disabled:opacity-50 disabled:hover:bg-[#10b981] transition-all"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5 ml-0.5" />
        )}
      </button>
    </form>
  )
}
