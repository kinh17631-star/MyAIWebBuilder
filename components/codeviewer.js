'use client'
import { Code2 } from 'lucide-react'

export default function CodeViewer({ content }) {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col bg-[#111c2e] border border-gray-700 rounded-xl overflow-hidden shadow-lg">
      <div className="flex items-center px-4 py-3 bg-[#0b1320] border-b border-gray-700">
        <Code2 className="w-5 h-5 text-[#10b981] mr-2" />
        <h2 className="text-sm font-semibold text-gray-200">Generated Code Structure</h2>
      </div>
      <div className="p-4 flex-1 overflow-auto">
        {content ? (
          <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
            {content}
          </pre>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm font-mono italic mt-32">
            Aapki website ka code yahan live type hoga...
          </div>
        )}
      </div>
    </div>
  )
}
