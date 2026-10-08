'use client'
import { useState } from 'react'
// Imports specifically in small letters as requested
import ChatInput from '../components/chatinput'
import CodeViewer from '../components/codeviewer'
import GithubExport from '../components/githubexport'

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')

  const handleGenerate = async (prompt) => {
    setIsGenerating(true)
    setGeneratedCode('')
    setRepoUrl('') // Naya prompt aane par purana link hata dega

    try {
      // Gemini API ko call kar raha hai
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.body) throw new Error('No response body')

      // Streaming setup: code live type hota hua dikhega
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        setGeneratedCode((prev) => prev + chunkValue)
      }
    } catch (error) {
      console.error("Generation Error:", error)
      setGeneratedCode("// Error: Code generate nahi ho paya. Dobara try karein.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExport = async () => {
    if (!generatedCode) return
    setIsExporting(true)
    try {
      // GitHub API ko call kar raha hai
      const response = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: generatedCode }),
      })
      const data = await response.json()
      
      if (data.repoUrl) {
        setRepoUrl(data.repoUrl) // Success hone par Vercel link ready ho jayega
      } else {
        alert("GitHub Push Error: " + data.error)
      }
    } catch (error) {
      console.error("Export Error:", error)
      alert("GitHub par code push nahi ho paya.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen flex flex-col gap-6">
      {/* Premium Header */}
      <div className="flex flex-col gap-1 mt-2">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-cyan-400 uppercase tracking-wider">
          A S Tech <span className="text-white text-2xl">Builder</span>
        </h1>
        <p className="text-gray-400 text-sm font-medium">Personal AI Website Generator</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 mt-4">
        {/* Left Column: AI Prompt & Export Controls */}
        <div className="lg:col-span-4 flex flex-col justify-start gap-4">
          <ChatInput onSubmit={handleGenerate} isLoading={isGenerating} />
          
          {/* Export Button tabhi dikhega jab code ready ho */}
          {generatedCode && !isGenerating && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <GithubExport 
                onExport={handleExport} 
                isExporting={isExporting} 
                repoUrl={repoUrl} 
              />
            </div>
          )}
        </div>

        {/* Right Column: Matrix Style Code Viewer */}
        <div className="lg:col-span-8 flex flex-col">
          <CodeViewer content={generatedCode} />
        </div>
      </div>
    </main>
  )
}
