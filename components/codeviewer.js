'use client'
import { FileCode2, Code2 } from 'lucide-react'

export default function CodeViewer({ content, filename }) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* File Viewer Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-background border-b border-gray-800">
        <div className="flex items-center gap-3">
          <FileCode2 className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold font-mono text-gray-200 tracking-wider truncate">
            {filename}
          </ Gentiles>
        </div>
        <Code2 className="w-4 h-4 text-gray-700" />
      </div>
      
      {/* Matrix Style Code Area */}
      <div className="p-6 flex-1 overflow-auto bg-background/50 backdrop-blur-sm">
        {content ? (
          <pre className="text-sm text-primary font-mono whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-500">
            {content}
          </pre>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm font-mono italic mt-16 gap-3">
            <Code2 className="w-8 h-8 animate-pulse" />
            Aapki selected file ka code yahan live run hoga...
          </div>
        )}
      </div>
    </div>
  )
}
